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
    let postsCache = {}; 
    let selectedPostImageBase64 = null;
    let selectedReelVideoBase64 = null;
    let activeChatUserId = null;
    let activeChatId = null; 
    let activeCommentPostId = null;
    let storyTimer = null;
    let currentSharePostId = null; 
    let currentEditPostId = null;  
    let currentEditPostCaption = "";
    let activeStoryAuthorId = null;

    function getChatRoomId(uid1, uid2) { return uid1 < uid2 ? uid1 + '_' + uid2 : uid2 + '_' + uid1; }

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
                callback(canvas.toDataURL('image/jpeg', 0.6));
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    // --- 1. OTURUM ---
    document.getElementById('register-btn').addEventListener('click', () => {
        const email = document.getElementById('auth-email').value;
        const pass = document.getElementById('auth-password').value;
        auth.createUserWithEmailAndPassword(email, pass).catch(err => showError(err.message));
    });

    document.getElementById('login-btn').addEventListener('click', () => {
        const email = document.getElementById('auth-email').value;
        const pass = document.getElementById('auth-password').value;
        auth.signInWithEmailAndPassword(email, pass).catch(err => showError("Giriş başarısız. Şifre veya E-posta hatalı."));
    });

    document.getElementById('logout-btn').addEventListener('click', () => auth.signOut());

    function showError(msg) { authError.innerText = msg; authError.style.display = "block"; }

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
                renderExplore(); renderStories(); renderShareUsersList();
            });

            loadRealtimePosts();
            initReels();
        } else {
            currentUser = null;
            authScreen.style.display = "flex";
            appContainer.style.display = "none";
        }
    });

    function updateProfileUI(data) {
        document.getElementById('display-username').innerText = `@${data.username}`;
        document.getElementById('display-name').innerText = data.name;
        document.getElementById('display-bio').innerText = data.bio;
        document.getElementById('main-profile-pic').src = data.avatar;
        document.getElementById('nav-profile-img').src = data.avatar;
        document.getElementById('my-story-img').src = data.avatar;
    }

    // --- 2. PROFİL İŞLEMLERİ ---
    document.querySelectorAll('.p-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.p-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            document.querySelectorAll('.profile-tab-content').forEach(c => {
                c.style.display = "none";
                c.classList.remove('active');
            });
            const targetId = tab.getAttribute('data-target');
            if(targetId) {
                const targetDiv = document.getElementById(targetId);
                targetDiv.style.display = targetId === 'p-grid' ? 'grid' : 'block';
                targetDiv.classList.add('active');
            }
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

    // --- 3. İÇERİK OLUŞTURMA (Gönderi, Hikaye, Reels) ---
    const createOptionsModal = document.getElementById('create-options-modal');
    const postModal = document.getElementById('post-modal');
    const reelModal = document.getElementById('reel-modal');
    
    document.getElementById('header-add-btn').onclick = (e) => { e.preventDefault(); createOptionsModal.style.display = "flex"; };
    
    // Gönderi
    document.getElementById('btn-create-post').onclick = () => {
        createOptionsModal.style.display = "none"; postModal.style.display = "flex";
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
            imageUrl: selectedPostImageBase64 || null, caption: caption,
            authorId: currentUser.uid, likes: [], createdAt: firebase.firestore.FieldValue.serverTimestamp()
        }).then(() => {
            postModal.style.display = "none"; document.getElementById('post-content-input').value = ""; selectedPostImageBase64 = null;
        });
    };

    // Hikaye
    const storyUpload = document.getElementById('story-image-upload');
    document.getElementById('add-story-btn').onclick = () => {
        // Tıklamada eğer kendi hikayesi varsa modalı açar (aşağıda yönetildi), yoksa yüklemeyi açar.
        if (document.getElementById('add-story-btn').querySelector('.plus-icon').style.display !== 'none') {
            storyUpload.click();
        }
    };
    document.getElementById('btn-create-story-menu').onclick = () => { createOptionsModal.style.display = "none"; storyUpload.click(); };

    storyUpload.onchange = (e) => {
        if(!e.target.files[0]) return;
        compressAndConvert(e.target.files[0], (compressedBase64) => {
            db.collection('stories').add({ imageUrl: compressedBase64, authorId: currentUser.uid, createdAt: firebase.firestore.FieldValue.serverTimestamp() });
        });
    };

    // Reels Yükleme
    document.getElementById('btn-create-reel').onclick = () => {
        createOptionsModal.style.display = "none"; reelModal.style.display = "flex";
        selectedReelVideoBase64 = null;
    };
    document.getElementById('select-reel-video').onclick = () => document.getElementById('reel-video-upload').click();
    document.getElementById('reel-video-upload').onchange = (e) => {
        const file = e.target.files[0];
        if(!file) return;
        if(file.size > 1048576) { alert("Veritabanı sınırı nedeniyle lütfen boyutu 1MB'dan küçük çok kısa bir video seçin!"); return; }
        
        const reader = new FileReader();
        reader.onload = (event) => {
            selectedReelVideoBase64 = event.target.result;
            document.getElementById('select-reel-video').innerHTML = '<i class="fa-solid fa-check"></i> Video Hazır';
            document.getElementById('save-reel-btn').style.display = 'block';
        };
        reader.readAsDataURL(file);
    };
    document.getElementById('save-reel-btn').onclick = () => {
        const caption = document.getElementById('reel-content-input').value;
        if(!selectedReelVideoBase64) return;
        db.collection('reels').add({
            videoUrl: selectedReelVideoBase64, caption: caption, authorId: currentUser.uid, createdAt: firebase.firestore.FieldValue.serverTimestamp()
        }).then(() => {
            reelModal.style.display = "none";
            document.getElementById('reel-content-input').value = "";
            document.getElementById('select-reel-video').innerHTML = '<i class="fa-solid fa-video"></i> Video Seç';
            document.getElementById('save-reel-btn').style.display = 'none';
        });
    };

    // --- 4. HİKAYE İZLEME VE YANITLAMA ---
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
                    db.collection('stories').doc(doc.id).delete(); return; 
                }
                
                if (story.authorId === currentUser.uid && !hasMyStory) {
                    hasMyStory = true;
                    myBtn.onclick = () => openStory(story.imageUrl, usersCache[currentUser.uid].username, usersCache[currentUser.uid].avatar, currentUser.uid);
                    myBtn.querySelector('.story-ring').style.background = "var(--insta-gradient)";
                    myBtn.querySelector('.plus-icon').style.display = "none";
                }
                
                if (seenUsers.has(story.authorId) || story.authorId === currentUser.uid) return;
                seenUsers.add(story.authorId);

                const uData = usersCache[story.authorId];
                if(!uData) return;

                wrapper.insertAdjacentHTML('beforeend', `
                    <div class="story" onclick="openStory('${story.imageUrl}', '${uData.username}', '${uData.avatar}', '${story.authorId}')">
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

    window.openStory = (imgUrl, username, avatar, authorId) => {
        clearTimeout(storyTimer);
        document.getElementById('story-viewer-img').src = imgUrl;
        document.getElementById('story-viewer-username').innerText = username;
        document.getElementById('story-viewer-avatar').src = avatar;
        document.getElementById('story-viewer-modal').style.display = "flex";
        activeStoryAuthorId = authorId;

        const bar = document.getElementById('story-progress-bar');
        bar.style.transition = 'none'; bar.style.width = '0%';
        setTimeout(() => { bar.style.transition = 'width 5s linear'; bar.style.width = '100%'; }, 50);
        storyTimer = setTimeout(() => closeStory(), 5000);
    };

    function closeStory() {
        clearTimeout(storyTimer);
        document.getElementById('story-viewer-modal').style.display = "none";
        document.getElementById('story-progress-bar').style.width = '0%';
        activeStoryAuthorId = null;
    }

    document.getElementById('send-story-reply').onclick = () => {
        const text = document.getElementById('story-reply-input').value;
        if(text.trim() === "" || !activeStoryAuthorId || activeStoryAuthorId === currentUser.uid) return;
        const chatId = getChatRoomId(currentUser.uid, activeStoryAuthorId);
        db.collection('chats').doc(chatId).collection('messages').add({
            senderId: currentUser.uid, text: `Görseline yanıt: ${text}`, createdAt: firebase.firestore.FieldValue.serverTimestamp()
        }).then(() => {
            alert("Yanıt gönderildi!");
            document.getElementById('story-reply-input').value = "";
            closeStory();
        });
    };

    // --- 5. GÖNDERİLER, BEĞENİ VE YORUM ---
    function generatePostHTML(id, post, uData, showOptions) {
        let timeStr = "Şimdi";
        if(post.createdAt) timeStr = post.createdAt.toDate().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

        const imgHTML = post.imageUrl ? `<img class="post-image" src="${post.imageUrl}">` : '';
        const captionHTML = post.caption && post.caption.trim() !== "" ? `<div class="post-caption">${post.imageUrl ? `<span>${uData.username}</span>` : ''}${post.caption}</div>` : '';
        const optionsHTML = showOptions ? `<button class="post-manage-btn" onclick="event.stopPropagation(); openPostOptions('${id}', '${post.caption || ''}')"><i class="fa-solid fa-ellipsis-vertical"></i></button>` : '';

        // Beğeni Mantığı (Likes Dizi içinde var mı?)
        const likesArray = post.likes || [];
        const isLiked = likesArray.includes(currentUser.uid);
        const heartClass = isLiked ? "fa-solid fa-heart liked" : "fa-regular fa-heart";

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
                    <i class="${heartClass}" onclick="toggleLike('${id}')"></i>
                    <i class="fa-regular fa-comment" onclick="openComments('${id}')"></i>
                    <i class="fa-regular fa-paper-plane" onclick="openShareModal('${id}')"></i>
                </div>
                <span class="post-likes-count">${likesArray.length} beğenme</span>
                ${post.imageUrl ? captionHTML : ''}
            </div>
        `;
    }

    window.toggleLike = (postId) => {
        const postRef = db.collection('posts').doc(postId);
        postRef.get().then(doc => {
            if(doc.exists) {
                const post = doc.data();
                const likes = post.likes || [];
                if(likes.includes(currentUser.uid)) {
                    postRef.update({ likes: firebase.firestore.FieldValue.arrayRemove(currentUser.uid) });
                } else {
                    postRef.update({ likes: firebase.firestore.FieldValue.arrayUnion(currentUser.uid) });
                }
            }
        });
    };

    window.openComments = (postId) => {
        activeCommentPostId = postId;
        document.getElementById('comments-modal').style.display = "flex";
        const list = document.getElementById('comments-list');
        list.innerHTML = "";
        
        db.collection('posts').doc(postId).collection('comments').orderBy('createdAt', 'asc').onSnapshot(snapshot => {
            list.innerHTML = "";
            snapshot.forEach(doc => {
                const c = doc.data();
                const u = usersCache[c.authorId] || { username: "kullanici", avatar: "https://i.pravatar.cc/150" };
                list.insertAdjacentHTML('beforeend', `
                    <div class="comment-item">
                        <img src="${u.avatar}">
                        <div class="comment-content"><span>${u.username}</span>${c.text}</div>
                    </div>
                `);
            });
            list.scrollTop = list.scrollHeight;
        });
    };

    document.getElementById('send-comment-btn').onclick = () => {
        const input = document.getElementById('comment-input');
        if(input.value.trim() === "" || !activeCommentPostId) return;
        db.collection('posts').doc(activeCommentPostId).collection('comments').add({
            authorId: currentUser.uid, text: input.value, createdAt: firebase.firestore.FieldValue.serverTimestamp()
        }).then(() => input.value = "");
    };

    function loadRealtimePosts() {
        db.collection("posts").orderBy("createdAt", "desc").onSnapshot(snapshot => {
            const feed = document.getElementById('feed-container');
            const pGrid = document.getElementById('p-grid');
            const pTweets = document.getElementById('p-tweets');
            feed.innerHTML = ""; if(pGrid) pGrid.innerHTML = ""; if(pTweets) pTweets.innerHTML = "";
            let myPostCount = 0; postsCache = {}; 

            snapshot.forEach(doc => {
                const post = doc.data();
                postsCache[doc.id] = post; 
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

    window.openSinglePostModal = (postId) => {
        const post = postsCache[postId];
        if(!post) return;
        const uData = usersCache[post.authorId];
        const isMyPost = post.authorId === currentUser.uid;
        document.getElementById('single-post-container').innerHTML = generatePostHTML(postId, post, uData, isMyPost);
        document.getElementById('single-post-modal').style.display = "flex";
    };

    // --- 6. DM'DEN PAYLAŞMA ---
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
            const chatId = getChatRoomId(currentUser.uid, receiverUid);
            db.collection('chats').doc(chatId).collection('messages').add({
                senderId: currentUser.uid, text: `🔗 [Gönderi Paylaşıldı]: ${textSummary}`, createdAt: firebase.firestore.FieldValue.serverTimestamp()
            }).then(() => {
                alert("Gönderi iletildi!");
                document.getElementById('share-modal').style.display = "none";
                currentSharePostId = null;
            });
        });
    };

    // --- 7. REELS (Veritabanına Bağlandı) ---
    function initReels() {
        db.collection('reels').orderBy('createdAt', 'desc').onSnapshot(snapshot => {
            const feed = document.getElementById('reels-feed');
            feed.innerHTML = '';
            
            // Eğer veritabanında video yoksa test videosu göster
            if(snapshot.empty) {
                feed.insertAdjacentHTML('beforeend', `
                    <div class="reel-item" onclick="togglePlay(this)">
                        <video class="reel-video" src="https://www.w3schools.com/html/mov_bbb.mp4" loop playsinline></video>
                        <div class="reel-info"><div class="username">@swipper_test</div><div class="caption">Hiç reels yok. Artı butonundan ilk reelsi sen paylaş!</div></div>
                        <div class="reel-actions"><i class="fa-solid fa-heart"></i><i class="fa-solid fa-comment"></i></div>
                    </div>
                `);
                return;
            }

            snapshot.forEach(doc => {
                const reel = doc.data();
                const uData = usersCache[reel.authorId] || { username: "kullanici" };
                feed.insertAdjacentHTML('beforeend', `
                    <div class="reel-item" onclick="togglePlay(this)">
                        <video class="reel-video" src="${reel.videoUrl}" loop playsinline></video>
                        <div class="reel-info"><div class="username">@${uData.username}</div><div class="caption">${reel.caption}</div></div>
                        <div class="reel-actions"><i class="fa-solid fa-heart"></i><i class="fa-solid fa-comment"></i></div>
                    </div>
                `);
            });
        });
    }
    window.togglePlay = (el) => { const v = el.querySelector('video'); v.paused ? v.play() : v.pause(); };

    // --- 8. GERÇEK ZAMANLI MESAJLAŞMA (DM) SİSTEMİ ---
    function renderDMList() {
        const list = document.getElementById('dm-list');
        list.innerHTML = "";
        let userFound = false;

        Object.keys(usersCache).forEach(uid => {
            if(uid === currentUser.uid) return;
            userFound = true;
            const u = usersCache[uid];
            const chatId = getChatRoomId(currentUser.uid, uid);

            list.insertAdjacentHTML('beforeend', `
                <div class="user-item" onclick="openChatWith('${uid}')">
                    <img src="${u.avatar}">
                    <div class="user-info">
                        <span class="name">${u.name}</span>
                        <span class="msg-preview" id="preview-${uid}">Sohbet başlat...</span>
                    </div>
                </div>
            `);

            // Son Mesajı Dinle
            db.collection('chats').doc(chatId).collection('messages').orderBy('createdAt', 'desc').limit(1).onSnapshot(snap => {
                const pre = document.getElementById(`preview-${uid}`);
                if(!snap.empty && pre) {
                    const lastMsg = snap.docs[0].data();
                    pre.innerText = (lastMsg.senderId === currentUser.uid ? "Sen: " : "") + lastMsg.text;
                    pre.style.fontWeight = lastMsg.senderId !== currentUser.uid ? "600" : "400";
                    pre.style.color = lastMsg.senderId !== currentUser.uid ? "var(--text-color)" : "var(--secondary-text)";
                }
            });
        });

        if (!userFound) {
            list.innerHTML = `<div style="padding: 40px 20px; text-align: center; color: var(--secondary-text);"><i class="fa-regular fa-comments" style="font-size: 40px; margin-bottom: 10px; opacity: 0.5;"></i><p style="font-weight: 600; color: var(--text-color);">Henüz Kimse Yok</p><p style="font-size: 13px;">Sistemde kayıtlı başka hesap bulunamadı.</p></div>`;
        }
    }

    window.openChatWith = (uid) => {
        activeChatUserId = uid;
        activeChatId = getChatRoomId(currentUser.uid, uid);
        const u = usersCache[uid];
        
        document.getElementById('dm-list-container').style.display = "none";
        document.getElementById('dm-chat-container').style.display = "block";
        document.getElementById('chat-user-avatar').src = u.avatar;
        document.getElementById('chat-user-username').innerText = u.username;
        
        loadLiveChatMessages();
    };

    document.getElementById('back-to-dm-list').onclick = () => {
        activeChatUserId = null; activeChatId = null;
        document.getElementById('dm-chat-container').style.display = "none";
        document.getElementById('dm-list-container').style.display = "block";
    };

    function sendChatMessage() {
        const inputEl = document.getElementById('chat-message-input');
        const text = inputEl.value;
        if(text.trim() === "" || !activeChatId) return;
        db.collection('chats').doc(activeChatId).collection('messages').add({
            senderId: currentUser.uid, text: text, createdAt: firebase.firestore.FieldValue.serverTimestamp()
        }).then(() => inputEl.value = "");
    }
    document.getElementById('send-message-btn').onclick = sendChatMessage;
    document.getElementById('chat-message-input').addEventListener("keypress", function(e) { if (e.key === "Enter") { e.preventDefault(); sendChatMessage(); } });

    function loadLiveChatMessages() {
        if(!activeChatId) return;
        db.collection('chats').doc(activeChatId).collection('messages').orderBy('createdAt', 'asc').onSnapshot(snapshot => {
            const box = document.getElementById('chat-messages');
            box.innerHTML = "";
            snapshot.forEach(doc => {
                const msg = doc.data();
                const cls = msg.senderId === currentUser.uid ? 'sent' : 'received';
                box.insertAdjacentHTML('beforeend', `<div class="chat-msg ${cls}">${msg.text}</div>`);
            });
            setTimeout(() => box.scrollTop = box.scrollHeight, 100);
        });
    }

    // --- 10. KEŞFET (PROFİL ARAMA) ---
    document.getElementById('search-input').oninput = function() {
        const results = document.getElementById('search-results');
        results.innerHTML = "";
        const queryVal = this.value.toLowerCase();
        Object.keys(usersCache).forEach(uid => {
            if(uid === currentUser.uid) return;
            const u = usersCache[uid];
            if(u.username.toLowerCase().includes(queryVal) || u.name.toLowerCase().includes(queryVal)) {
                results.insertAdjacentHTML('beforeend', `
                    <div class="user-item" onclick="openOtherProfile('${uid}')">
                        <img src="${u.avatar}">
                        <div class="user-info"><span class="name">${u.name}</span><span class="username">@${u.username}</span></div>
                    </div>
                `);
            }
        });
    };

    window.openOtherProfile = (uid) => {
        const u = usersCache[uid];
        if(!u) return;
        document.getElementById('other-profile-username').innerText = `@${u.username}`;
        document.getElementById('other-profile-name').innerText = u.name;
        document.getElementById('other-profile-bio').innerText = u.bio;
        document.getElementById('other-profile-pic').src = u.avatar;
        document.getElementById('other-profile-msg-btn').onclick = () => {
            document.getElementById('nav-dm-btn').click();
            setTimeout(() => openChatWith(uid), 100);
        };

        const grid = document.getElementById('other-profile-grid');
        grid.innerHTML = ""; let count = 0;
        db.collection("posts").where("authorId", "==", uid).get().then(snapshot => {
            snapshot.forEach(doc => {
                const post = doc.data();
                if(post.imageUrl) {
                    count++; postsCache[doc.id] = post; 
                    grid.insertAdjacentHTML('beforeend', `<div class="grid-item" onclick="openSinglePostModal('${doc.id}')"><img src="${post.imageUrl}"></div>`);
                }
            });
            document.getElementById('other-profile-post-count').innerText = count;
        });

        document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
        document.getElementById('other-profile-tab').classList.add('active');
        window.scrollTo(0, 0);
    };

    // --- 11. DÜZENLE & SİL ---
    window.openPostOptions = (postId, caption) => {
        currentEditPostId = postId; currentEditPostCaption = caption;
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
            document.getElementById('single-post-modal').style.display = "none";
        }
    };
    document.getElementById('update-post-btn').onclick = () => {
        const newCaption = document.getElementById('edit-post-input').value;
        if(currentEditPostId) {
            db.collection('posts').doc(currentEditPostId).update({ caption: newCaption }).then(() => {
                document.getElementById('edit-post-modal').style.display = "none"; currentEditPostId = null; document.getElementById('single-post-modal').style.display = "none";
            });
        }
    };

    // --- 12. MENÜ VE TEMA YÖNETİMİ ---
    document.getElementById('theme-toggle-btn').onclick = () => {
        document.body.classList.toggle('dark-mode');
        const icon = document.getElementById('theme-toggle-btn').querySelector('i');
        icon.classList.toggle('fa-moon'); icon.classList.toggle('fa-sun');
    };

    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            if (item.id === 'nav-add-btn') return; 
            e.preventDefault();
            navItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
            const targetId = item.dataset.target;
            if(targetId) document.getElementById(targetId).classList.add('active');
            
            if(targetId === 'dm-tab') {
                document.getElementById('dm-chat-container').style.display = "none";
                document.getElementById('dm-list-container').style.display = "block";
                renderDMList(); 
            }
            window.scrollTo(0, 0);
        });
    });

    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => { if(e.target === modal) modal.style.display = "none"; });
    });
    document.querySelectorAll('.close-btn').forEach(btn => {
        btn.onclick = (e) => {
            if(e.target.id === 'close-story-viewer' || e.target.parentElement.id === 'close-story-viewer') closeStory();
            else e.target.closest('.modal').style.display = "none";
        };
    });
});