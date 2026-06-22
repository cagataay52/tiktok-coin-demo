const firebaseConfig = {
    apiKey: "AIzaSyCTbvB4-LBG-jP8zNkJhLNEaQfQpTAdEjA",
    authDomain: "swipper-2f2a4.firebaseapp.com",
    projectId: "swipper-2f2a4",
    storageBucket: "swipper-2f2a4.firebasestorage.app",
    messagingSenderId: "1025977111228",
    appId: "1:1025977111228:web:f2b0013a21c5f2b434b6b9"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const auth = firebase.auth();
const db = firebase.firestore();

document.addEventListener("DOMContentLoaded", () => {
    
    const authScreen = document.getElementById('auth-screen');
    const appContainer = document.getElementById('app-container');
    const authError = document.getElementById('auth-error');
    
    let currentUser = null;
    let usersCache = {}; 
    let postsCache = {}; // Tekli gönderiyi açmak için hafıza
    let selectedPostImageBase64 = null;
    let activeChatUserId = null;
    let storyTimer = null;
    let currentSharePostId = null; 
    let currentEditPostId = null;  
    let currentEditPostCaption = "";

    function compressAndConvert(file, callback) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.onload = function() {
                const canvas = document.createElement('canvas');
                let width = img.width; let height = img.height;
                const MAX_SIZE = 600;
                if (width > height) { if (width > MAX_SIZE) { height *= MAX_SIZE / width; width = MAX_SIZE; } } 
                else { if (height > MAX_SIZE) { width *= MAX_SIZE / height; height = MAX_SIZE; } }
                canvas.width = width; canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                const compressedBase64 = canvas.toDataURL('image/jpeg', 0.6);
                callback(compressedBase64);
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    // --- 1. OTURUM YÖNETİMİ ---
    document.getElementById('register-btn').addEventListener('click', () => {
        const email = document.getElementById('auth-email').value;
        const pass = document.getElementById('auth-password').value;
        auth.createUserWithEmailAndPassword(email, pass).catch(err => showError(err.message));
    });

    document.getElementById('login-btn').addEventListener('click', () => {
        const email = document.getElementById('auth-email').value;
        const pass = document.getElementById('auth-password').value;
        auth.signInWithEmailAndPassword(email, pass).catch(err => showError("Giriş başarısız. Bilgileri kontrol et."));
    });

    document.getElementById('logout-btn').addEventListener('click', () => auth.signOut());

    function showError(msg) { authError.innerText = msg; authError.style.display = "block"; }

    // --- 2. CANLI SENKRONİZASYON ---
    auth.onAuthStateChanged((user) => {
        if (user) {
            currentUser = user;
            authScreen.style.display = "none";
            appContainer.style.display = "block";
            
            db.collection('users').onSnapshot(snapshot => {
                usersCache = {};
                snapshot.forEach(doc => { usersCache[doc.id] = doc.data(); });
                
                if (!usersCache[user.uid]) {
                    const defaultProfile = {
                        name: user.email.split('@')[0],
                        username: user.email.split('@')[0],
                        bio: "Swipper'a hoş geldin!",
                        avatar: "https://i.pravatar.cc/150?img=11"
                    };
                    db.collection('users').doc(user.uid).set(defaultProfile);
                } else {
                    updateProfileUI(usersCache[user.uid]);
                }
                renderExplore(); renderDMList(); renderStories(); renderShareUsersList();
            });

            loadRealtimePosts();
            initReels(); // Swinder/Reels Videolarını Yükle
        } else {
            currentUser = null;
            authScreen.style.display = "flex";
            appContainer.style.display = "none";
        }
    });

    function updateProfileUI(data) {
        document.getElementById('display-username').innerHTML = `<i class="fa-solid fa-lock" style="font-size:12px; margin-right:3px;"></i>${data.username}`;
        document.getElementById('display-name').innerText = data.name;
        document.getElementById('display-bio').innerText = data.bio;
        document.getElementById('main-profile-pic').src = data.avatar;
        document.getElementById('nav-profile-img').src = data.avatar;
        document.getElementById('my-story-img').src = data.avatar;
    }

    // --- 3. PROFİL SEKMELERİ (GÖRSEL / TWEET) ---
    document.querySelectorAll('.p-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.p-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            document.querySelectorAll('.profile-tab-content').forEach(c => {
                c.style.display = "none";
                c.classList.remove('active');
            });
            const targetId = tab.getAttribute('data-target');
            const targetDiv = document.getElementById(targetId);
            targetDiv.style.display = targetId === 'p-grid' ? 'grid' : 'block';
            targetDiv.classList.add('active');
        });
    });

    const editModal = document.getElementById('edit-profile-modal');
    document.getElementById('edit-profile-trigger').onclick = () => {
        const data = usersCache[currentUser.uid];
        if(!data) return;
        document.getElementById('input-name').value = data.name;
        document.getElementById('input-username').value = data.username;
        document.getElementById('input-bio').value = data.bio;
        editModal.style.display = "flex";
    };

    document.getElementById('save-profile-btn').onclick = () => {
        const updated = {
            name: document.getElementById('input-name').value,
            username: document.getElementById('input-username').value.replace(/\s+/g, '').toLowerCase(),
            bio: document.getElementById('input-bio').value
        };
        db.collection('users').doc(currentUser.uid).update(updated).then(() => editModal.style.display = "none");
    };

    const profileUpload = document.getElementById('profile-upload');
    document.getElementById('avatar-container').onclick = () => profileUpload.click();
    profileUpload.onchange = (e) => {
        if (!e.target.files[0]) return;
        compressAndConvert(e.target.files[0], (compressedBase64) => {
            db.collection('users').doc(currentUser.uid).update({ avatar: compressedBase64 });
        });
    };

    // --- 4. YENİ PAYLAŞIM ---
    const createOptionsModal = document.getElementById('create-options-modal');
    const postModal = document.getElementById('post-modal');
    
    document.getElementById('nav-add-btn').onclick = (e) => { e.preventDefault(); createOptionsModal.style.display = "flex"; };
    document.getElementById('btn-create-post').onclick = () => {
        createOptionsModal.style.display = "none";
        postModal.style.display = "flex";
        document.getElementById('post-image-preview').style.display = "none";
        document.getElementById('post-content-input').value = "";
        selectedPostImageBase64 = null;
    };

    document.getElementById('select-post-image').onclick = () => document.getElementById('post-image-upload').click();
    document.getElementById('post-image-upload').onchange = (e) => {
        if(!e.target.files[0]) return;
        compressAndConvert(e.target.files[0], (compressedBase64) => {
            selectedPostImageBase64 = compressedBase64;
            document.getElementById('preview-img').src = compressedBase64;
            document.getElementById('post-image-preview').style.display = "block";
        });
    };

    document.getElementById('remove-post-image').onclick = () => {
        selectedPostImageBase64 = null;
        document.getElementById('post-image-preview').style.display = "none";
        document.getElementById('post-image-upload').value = "";
    };

    document.getElementById('save-post-btn').onclick = () => {
        const caption = document.getElementById('post-content-input').value;
        if(!selectedPostImageBase64 && caption.trim() === "") return;
        
        db.collection('posts').add({
            imageUrl: selectedPostImageBase64 || null,
            caption: caption,
            authorId: currentUser.uid,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            likes: 0
        }).then(() => {
            postModal.style.display = "none";
            document.getElementById('post-content-input').value = "";
            selectedPostImageBase64 = null;
        });
    };

    // --- 5. HİKAYELER (24 SAAT) ---
    const storyUpload = document.getElementById('story-image-upload');
    document.getElementById('add-story-btn').onclick = () => storyUpload.click();
    document.getElementById('btn-create-story-menu').onclick = () => { createOptionsModal.style.display = "none"; storyUpload.click(); };

    storyUpload.onchange = (e) => {
        if(!e.target.files[0]) return;
        compressAndConvert(e.target.files[0], (compressedBase64) => {
            db.collection('stories').add({
                imageUrl: compressedBase64,
                authorId: currentUser.uid,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        });
    };

    function renderStories() {
        db.collection('stories').orderBy('createdAt', 'desc').onSnapshot(snapshot => {
            const wrapper = document.getElementById('stories-wrapper');
            const myBtn = wrapper.children[0];
            wrapper.innerHTML = "";
            wrapper.appendChild(myBtn);

            const seenUsers = new Set();
            let hasMyStory = false;
            const now = Date.now();

            snapshot.forEach(doc => {
                const story = doc.data();
                if(!story.createdAt) return;
                
                if (now - story.createdAt.toDate().getTime() > 24 * 60 * 60 * 1000) {
                    db.collection('stories').doc(doc.id).delete(); // 24 saati geçenleri sil
                    return; 
                }
                
                if (story.authorId === currentUser.uid && !hasMyStory) {
                    hasMyStory = true;
                    myBtn.onclick = () => openStory(story.imageUrl, usersCache[currentUser.uid].username, usersCache[currentUser.uid].avatar);
                    myBtn.querySelector('.story-ring').style.background = "var(--insta-gradient)";
                    myBtn.querySelector('.plus-icon').style.display = "none";
                }
                
                if (seenUsers.has(story.authorId) || story.authorId === currentUser.uid) return;
                seenUsers.add(story.authorId);

                const uData = usersCache[story.authorId];
                if(!uData) return;

                wrapper.insertAdjacentHTML('beforeend', `
                    <div class="story" onclick="openStory('${story.imageUrl}', '${uData.username}', '${uData.avatar}')">
                        <div class="story-ring"><img src="${uData.avatar}"></div>
                        <span>${uData.username}</span>
                    </div>
                `);
            });
            
            if(!hasMyStory) {
                myBtn.onclick = () => storyUpload.click();
                myBtn.querySelector('.story-ring').style.background = "transparent";
                myBtn.querySelector('.plus-icon').style.display = "flex";
            }
        });
    }

    window.openStory = (imgUrl, username, avatar) => {
        clearTimeout(storyTimer);
        document.getElementById('story-viewer-img').src = imgUrl;
        document.getElementById('story-viewer-username').innerText = username;
        document.getElementById('story-viewer-avatar').src = avatar;
        document.getElementById('story-viewer-modal').style.display = "flex";

        const bar = document.getElementById('story-progress-bar');
        bar.style.transition = 'none'; bar.style.width = '0%';
        setTimeout(() => { bar.style.transition = 'width 5s linear'; bar.style.width = '100%'; }, 50);

        storyTimer = setTimeout(() => closeStory(), 5000);
    };

    function closeStory() {
        clearTimeout(storyTimer);
        document.getElementById('story-viewer-modal').style.display = "none";
        document.getElementById('story-progress-bar').style.width = '0%';
    }
    document.getElementById('close-story-viewer').onclick = closeStory;

    // --- 6. AKIŞ VE PROFİL YÖNETİMİ ---
    function generatePostHTML(id, post, uData, showOptions) {
        let timeStr = "Şimdi";
        if(post.createdAt) timeStr = post.createdAt.toDate().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

        const imgHTML = post.imageUrl ? `<img class="post-image" src="${post.imageUrl}">` : '';
        const captionHTML = post.caption.trim() !== "" ? `<div class="post-caption">${post.imageUrl ? `<span>${uData.username}</span>` : ''}${post.caption}</div>` : '';
        const optionsHTML = showOptions ? `<button class="post-manage-btn" onclick="openPostOptions('${id}', '${post.caption || ''}')"><i class="fa-solid fa-ellipsis-vertical"></i></button>` : '';

        return `
            <div class="post" id="post-card-${id}">
                <div class="post-header">
                    <div class="post-header-left">
                        <img class="post-avatar" src="${uData.avatar}">
                        <span class="post-author">${uData.username}</span>
                        <span class="post-time-feed">· ${timeStr}</span>
                    </div>
                    ${optionsHTML}
                </div>
                ${!post.imageUrl ? captionHTML : ''}
                ${imgHTML}
                <div class="post-actions">
                    <i class="fa-regular fa-heart"></i>
                    <i class="fa-regular fa-comment"></i>
                    <i class="fa-regular fa-paper-plane" onclick="openShareModal('${id}')"></i>
                </div>
                ${post.imageUrl ? captionHTML : ''}
            </div>
        `;
    }

    function loadRealtimePosts() {
        db.collection("posts").orderBy("createdAt", "desc").onSnapshot(snapshot => {
            const feed = document.getElementById('feed-container');
            const pGrid = document.getElementById('p-grid');
            const pTweets = document.getElementById('p-tweets');
            
            feed.innerHTML = "";
            pGrid.innerHTML = "";
            pTweets.innerHTML = "";
            let myPostCount = 0;
            postsCache = {}; // Modal için

            snapshot.forEach(doc => {
                const post = doc.data();
                postsCache[doc.id] = post; // Hafızaya al
                const uData = usersCache[post.authorId] || { username: "kullanici", avatar: "https://i.pravatar.cc/150" };
                const isMyPost = post.authorId === currentUser.uid;

                const html = generatePostHTML(doc.id, post, uData, isMyPost);
                feed.insertAdjacentHTML('beforeend', html);

                if(isMyPost) {
                    myPostCount++;
                    if(post.imageUrl) {
                        pGrid.insertAdjacentHTML('beforeend', `
                            <div class="grid-item" onclick="openSinglePostModal('${doc.id}')">
                                <img src="${post.imageUrl}">
                                <button class="grid-manage-btn" onclick="event.stopPropagation(); openPostOptions('${doc.id}', '${post.caption || ''}')"><i class="fa-solid fa-ellipsis-vertical"></i></button>
                            </div>
                        `);
                    } else {
                        pTweets.insertAdjacentHTML('beforeend', html);
                    }
                }
            });
            document.getElementById('post-count').innerText = myPostCount;
        });
    }

    // Profil Izgarasında Fotoğrafa Tıklanınca Açılan Görüntüleyici
    window.openSinglePostModal = (postId) => {
        const post = postsCache[postId];
        if(!post) return;
        const uData = usersCache[post.authorId];
        const isMyPost = post.authorId === currentUser.uid;
        
        const html = generatePostHTML(postId, post, uData, isMyPost);
        document.getElementById('single-post-container').innerHTML = html;
        document.getElementById('single-post-modal').style.display = "flex";
    };

    // --- 7. DÜZENLEME & SİLME MODALI ---
    window.openPostOptions = (postId, caption) => {
        currentEditPostId = postId;
        currentEditPostCaption = caption;
        document.getElementById('post-options-modal').style.display = "flex";
    };

    document.getElementById('opt-edit-post').onclick = () => {
        document.getElementById('post-options-modal').style.display = "none";
        document.getElementById('edit-post-input').value = currentEditPostCaption;
        document.getElementById('edit-post-modal').style.display = "flex";
    };

    document.getElementById('opt-del-post').onclick = () => {
        if(confirm("Bu paylaşımı kalıcı olarak silmek istediğine emin misin?")) {
            db.collection('posts').doc(currentEditPostId).delete();
            document.getElementById('post-options-modal').style.display = "none";
            document.getElementById('single-post-modal').style.display = "none"; // Açıksa kapat
        }
    };

    document.getElementById('update-post-btn').onclick = () => {
        const newCaption = document.getElementById('edit-post-input').value;
        if(currentEditPostId) {
            db.collection('posts').doc(currentEditPostId).update({ caption: newCaption }).then(() => {
                document.getElementById('edit-post-modal').style.display = "none";
                currentEditPostId = null;
                document.getElementById('single-post-modal').style.display = "none";
            });
        }
    };

    // --- 8. DM'DEN PAYLAŞMA ---
    window.openShareModal = (postId) => {
        currentSharePostId = postId;
        document.getElementById('share-modal').style.display = "flex";
    };

    function renderShareUsersList() {
        const wrap = document.getElementById('share-users-list');
        wrap.innerHTML = "";
        Object.keys(usersCache).forEach(uid => {
            if(uid === currentUser.uid) return;
            const u = usersCache[uid];
            wrap.insertAdjacentHTML('beforeend', `
                <div class="user-item" onclick="processPostShare('${uid}')">
                    <img src="${u.avatar}">
                    <div class="user-info"><span class="name">${u.name}</span><span class="username">@${u.username}</span></div>
                    <i class="fa-regular fa-paper-plane" style="margin-left:auto; color:var(--blue);"></i>
                </div>
            `);
        });
    }

    window.processPostShare = (receiverUid) => {
        if(!currentSharePostId || !currentUser) return;
        db.collection('posts').doc(currentSharePostId).get().then(doc => {
            if(!doc.exists) return;
            const postData = doc.data();
            const textSummary = postData.caption ? `"${postData.caption}"` : "Bir fotoğraf gönderisi";
            db.collection('messages').add({
                senderId: currentUser.uid, receiverId: receiverUid,
                text: `🔗 [Gönderi Paylaşıldı]: ${textSummary}`,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            }).then(() => {
                alert("Gönderi iletildi!");
                document.getElementById('share-modal').style.display = "none";
                currentSharePostId = null;
            });
        });
    };

    // --- 9. KEŞFET VE DM ---
    document.getElementById('search-input').oninput = function() {
        const results = document.getElementById('search-results');
        results.innerHTML = "";
        const queryVal = this.value.toLowerCase();
        Object.keys(usersCache).forEach(uid => {
            if(uid === currentUser.uid) return;
            const u = usersCache[uid];
            if(u.username.toLowerCase().includes(queryVal) || u.name.toLowerCase().includes(queryVal)) {
                results.insertAdjacentHTML('beforeend', `<div class="user-item" onclick="openChatWith('${uid}')"><img src="${u.avatar}"><div class="user-info"><span class="name">${u.name}</span><span class="username">@${u.username}</span></div></div>`);
            }
        });
    };

    function renderDMList() {
        const list = document.getElementById('dm-list');
        list.innerHTML = "";
        Object.keys(usersCache).forEach(uid => {
            if(uid === currentUser.uid) return;
            const u = usersCache[uid];
            list.insertAdjacentHTML('beforeend', `<div class="user-item" onclick="openChatWith('${uid}')"><img src="${u.avatar}"><div class="user-info"><span class="name">${u.name}</span><span class="msg-preview">Mesaj göndermek için tıkla</span></div></div>`);
        });
    }

    window.openChatWith = (uid) => {
        activeChatUserId = uid;
        const u = usersCache[uid];
        document.getElementById('dm-list-container').style.display = "none";
        document.getElementById('dm-chat-container').style.display = "block";
        document.getElementById('chat-user-avatar').src = u.avatar;
        document.getElementById('chat-user-username').innerText = u.username;
        document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
        document.getElementById('dm-tab').classList.add('active');
        loadLiveChatMessages();
    };

    document.getElementById('back-to-dm-list').onclick = () => {
        activeChatUserId = null;
        document.getElementById('dm-chat-container').style.display = "none";
        document.getElementById('dm-list-container').style.display = "block";
    };

    document.getElementById('send-message-btn').onclick = () => {
        const text = document.getElementById('chat-message-input').value;
        if(text.trim() === "" || !activeChatUserId) return;
        db.collection('messages').add({
            senderId: currentUser.uid, receiverId: activeChatUserId, text: text,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        }).then(() => document.getElementById('chat-message-input').value = "");
    };

    function loadLiveChatMessages() {
        if(!currentUser || !activeChatUserId) return;
        db.collection('messages').orderBy('createdAt', 'asc').onSnapshot(snapshot => {
            const box = document.getElementById('chat-messages');
            box.innerHTML = "";
            snapshot.forEach(doc => {
                const msg = doc.data();
                if((msg.senderId === currentUser.uid && msg.receiverId === activeChatUserId) || (msg.senderId === activeChatUserId && msg.receiverId === currentUser.uid)) {
                    const cls = msg.senderId === currentUser.uid ? 'sent' : 'received';
                    box.insertAdjacentHTML('beforeend', `<div class="chat-msg ${cls}">${msg.text}</div>`);
                }
            });
            box.scrollTop = box.scrollHeight; 
        });
    }

    // --- 10. REELS (SWINDER) SİSTEMİ ---
    function initReels() {
        // Test amaçlı dikey formatlı harici videolar (Gerçekte veritabanından çekilebilir)
        const sampleReels = [
            { url: "https://www.w3schools.com/html/mov_bbb.mp4", user: "swipper_official", text: "Swipper Reels test yayını! 🚀" },
            { url: "https://media.w3.org/2010/05/sintel/trailer.mp4", user: "eminbal", text: "Sinematik çekimler deniyoruz 🎬" }
        ];
        
        const feed = document.getElementById('reels-feed');
        feed.innerHTML = '';
        
        sampleReels.forEach(reel => {
            feed.insertAdjacentHTML('beforeend', `
                <div class="reel-item" onclick="togglePlay(this)">
                    <video class="reel-video" src="${reel.url}" loop></video>
                    <div class="reel-info">
                        <div class="username">@${reel.user}</div>
                        <div class="caption">${reel.text}</div>
                    </div>
                    <div class="reel-actions">
                        <i class="fa-solid fa-heart"></i>
                        <i class="fa-solid fa-comment"></i>
                        <i class="fa-solid fa-paper-plane"></i>
                    </div>
                </div>
            `);
        });
    }

    window.togglePlay = (el) => {
        const video = el.querySelector('video');
        if(video.paused) { video.play(); } 
        else { video.pause(); }
    };

    // --- 11. TEMALAR VE MODALLAR ---
    document.getElementById('theme-toggle-btn').onclick = () => {
        document.body.classList.toggle('dark-mode');
        const icon = document.getElementById('theme-toggle-btn').querySelector('i');
        icon.classList.toggle('fa-moon');
        icon.classList.toggle('fa-sun');
    };

    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            if (item.id === 'nav-add-btn') return; 
            e.preventDefault();
            navItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
            document.getElementById(item.dataset.target).classList.add('active');
            
            if(item.dataset.target === 'dm-tab') {
                document.getElementById('dm-chat-container').style.display = "none";
                document.getElementById('dm-list-container').style.display = "block";
            }
            window.scrollTo(0, 0);
        });
    });

    document.querySelectorAll('.close-btn').forEach(btn => btn.onclick = (e) => {
        if(e.target.id !== 'close-story-viewer') e.target.closest('.modal').style.display = "none";
    });
});