// FIREBASE KONFİGÜRASYONU
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
    let usersCache = {}; // Tüm kullanıcıları hafızada tutup senkronize etmek için
    let selectedPostImageBase64 = null;
    let activeChatUserId = null;

    // --- GEÇİCİ GÖRSEL SIKIŞTIRICI (Firestore 1MB Sınırını Aşma Motoru) ---
    function compressAndConvert(file, callback) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.onload = function() {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;
                const MAX_SIZE = 500; // Maksimum 500px genişlik/yükseklik

                if (width > height) {
                    if (width > MAX_SIZE) { height *= MAX_SIZE / width; width = MAX_SIZE; }
                } else {
                    if (height > MAX_SIZE) { width *= MAX_SIZE / height; height = MAX_SIZE; }
                }
                canvas.width = width; canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                
                // JPEG formatında %60 kalitede sıkıştırıp Base64 çıktısı verir
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
        auth.signInWithEmailAndPassword(email, pass).catch(err => showError("Giriş başarısız. Şifre veya E-posta hatalı."));
    });

    document.getElementById('logout-btn').addEventListener('click', () => auth.signOut());

    function showError(msg) {
        authError.innerText = msg;
        authError.style.display = "block";
    }

    // --- 2. GERÇEK ZAMANLI KULLANICI MOTORU VE KORUMASI ---
    auth.onAuthStateChanged((user) => {
        if (user) {
            currentUser = user;
            authScreen.style.display = "none";
            appContainer.style.display = "block";
            
            // Tüm veritabanı kullanıcılarını canlı dinlemeye al (Arama ve DM'leri senkronize tutar)
            db.collection('users').onSnapshot(snapshot => {
                usersCache = {};
                snapshot.forEach(doc => { usersCache[doc.id] = doc.data(); });
                
                // Kendi profilimiz yoksa varsayılan olarak Firestore'da oluştur
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
                
                renderExplore();
                renderDMList();
                renderStories();
            }, err => {
                // VERİTABANI KURALI HATASI ALIRSA KULLANICIYI BİLGİLENDİR
                alert("Firestore İzin Hatası! Lütfen Firebase Console -> Firestore Database -> Rules sekmesinden kuralları 'allow read, write: if true;' olarak güncelleyin.");
            });

            loadRealtimePosts();
            loadProfileGrid();
            loadLiveChatMessages();
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

    // --- 3. PROFİL VERİLERİNİ KAYDETME ---
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
        db.collection('users').doc(currentUser.uid).update(updated).then(() => {
            editModal.style.display = "none";
        });
    };

    // --- 4. PROFİL RESMİ DEĞİŞTİRME ---
    const profileUpload = document.getElementById('profile-upload');
    document.getElementById('avatar-container').onclick = () => profileUpload.click();
    profileUpload.onchange = (e) => {
        if (!e.target.files[0]) return;
        compressAndConvert(e.target.files[0], (compressedBase64) => {
            db.collection('users').doc(currentUser.uid).update({ avatar: compressedBase64 });
        });
    };

    // --- 5. GÖNDERİ PAYLAŞMA ---
    const createOptionsModal = document.getElementById('create-options-modal');
    const postModal = document.getElementById('post-modal');
    
    document.getElementById('nav-add-btn').onclick = (e) => { e.preventDefault(); createOptionsModal.style.display = "flex"; };
    
    document.getElementById('btn-create-post').onclick = () => {
        createOptionsModal.style.display = "none";
        postModal.style.display = "flex";
        document.getElementById('post-image-preview').style.display = "none";
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

    document.getElementById('save-post-btn').onclick = () => {
        const caption = document.getElementById('post-content-input').value;
        if(!selectedPostImageBase64) { alert("Lütfen bir fotoğraf seçin!"); return; }
        
        db.collection('posts').add({
            imageUrl: selectedPostImageBase64,
            caption: caption,
            authorId: currentUser.uid,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            likes: 0
        }).then(() => {
            postModal.style.display = "none";
            document.getElementById('post-content-input').value = "";
        });
    };

    // --- 6. HİKAYE PAYLAŞMA ---
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
            }).then(() => alert("Hikayen başarıyla yüklendi!"));
        });
    };

    function renderStories() {
        const wrapper = document.getElementById('stories-wrapper');
        const myBtn = wrapper.children[0];
        wrapper.innerHTML = "";
        wrapper.appendChild(myBtn);

        db.collection('stories').orderBy('createdAt', 'desc').get().then(snapshot => {
            snapshot.forEach(doc => {
                const story = doc.data();
                const uData = usersCache[story.authorId];
                if(!uData || story.authorId === currentUser.uid) return;

                wrapper.insertAdjacentHTML('beforeend', `
                    <div class="story" onclick="viewStory('${story.imageUrl}')">
                        <div class="story-ring"><img src="${uData.avatar}"></div>
                        <span>${uData.username}</span>
                    </div>
                `);
            });
        });
    }
    window.viewStory = (src) => alert("Hikaye Görüntüleniyor. Tam ekran modülü yakında aktifleşecek.");

    // --- 7. AKIŞ VE GRID YÜKLEME ---
    function loadRealtimePosts() {
        db.collection("posts").orderBy("createdAt", "desc").onSnapshot(snapshot => {
            const feed = document.getElementById('feed-container');
            feed.innerHTML = "";
            snapshot.forEach(doc => {
                const post = doc.data();
                const uData = usersCache[post.authorId] || { username: "kullanici", avatar: "https://i.pravatar.cc/150" };
                
                feed.insertAdjacentHTML('beforeend', `
                    <div class="post">
                        <div class="post-header"><img class="post-avatar" src="${uData.avatar}"><span class="post-author">${uData.username}</span></div>
                        <img class="post-image" src="${post.imageUrl}">
                        <div class="post-actions"><i class="fa-regular fa-heart"></i><i class="fa-regular fa-comment"></i></div>
                        <div class="post-caption"><span>${uData.username}</span>${post.caption}</div>
                    </div>
                `);
            });
        });
    }

    function loadProfileGrid() {
        db.collection("posts").orderBy("createdAt", "desc").onSnapshot(snapshot => {
            const container = document.getElementById('profile-grid-container');
            container.innerHTML = "";
            let count = 0;
            snapshot.forEach(doc => {
                const post = doc.data();
                if(post.authorId === currentUser.uid) {
                    count++;
                    container.insertAdjacentHTML('beforeend', `<div class="grid-item"><img src="${post.imageUrl}"></div>`);
                }
            });
            document.getElementById('post-count').innerText = count;
        });
    }

    // --- 8. GERÇEK KULLANICI KEŞFET VE ARAMA SİSTEMİ ---
    function renderExplore() {
        const results = document.getElementById('search-results');
        results.innerHTML = "";
        const queryVal = document.getElementById('search-input').value.toLowerCase();

        Object.keys(usersCache).forEach(uid => {
            if(uid === currentUser.uid) return;
            const u = usersCache[uid];
            if(u.username.toLowerCase().includes(queryVal) || u.name.toLowerCase().includes(queryVal)) {
                results.insertAdjacentHTML('beforeend', `
                    <div class="user-item" onclick="openChatWith('${uid}')">
                        <img src="${u.avatar}">
                        <div class="user-info"><span class="name">${u.name}</span><span class="username">@${u.username}</span></div>
                    </div>
                `);
            }
        });
    }
    document.getElementById('search-input').oninput = renderExplore;

    // --- 9. GERÇEK ZAMANLI DM (MESAJLAŞMA) MOTORU ---
    function renderDMList() {
        const list = document.getElementById('dm-list');
        list.innerHTML = "";
        
        Object.keys(usersCache).forEach(uid => {
            if(uid === currentUser.uid) return;
            const u = usersCache[uid];
            list.insertAdjacentHTML('beforeend', `
                <div class="user-item" onclick="openChatWith('${uid}')">
                    <img src="${u.avatar}">
                    <div class="user-info"><span class="name">${u.name}</span><span class="msg-preview">Sohbeti açmak için tıkla</span></div>
                </div>
            `);
        });
    }

    window.openChatWith = (uid) => {
        activeChatUserId = uid;
        const u = usersCache[uid];
        document.getElementById('dm-list-container').style.display = "none";
        document.getElementById('dm-chat-container').style.display = "block";
        document.getElementById('chat-user-avatar').src = u.avatar;
        document.getElementById('chat-user-username').innerText = u.username;
        
        // Aktif tabı mesajlar yap
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
            senderId: currentUser.uid,
            receiverId: activeChatUserId,
            text: text,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        }).then(() => {
            document.getElementById('chat-message-input').value = "";
        });
    };

    function loadLiveChatMessages() {
        if(!currentUser || !activeChatUserId) return;
        
        db.collection('messages').orderBy('createdAt', 'asc').onSnapshot(snapshot => {
            const box = document.getElementById('chat-messages');
            box.innerHTML = "";
            snapshot.forEach(doc => {
                const msg = doc.data();
                // Sadece iki kullanıcı arasındaki mesajları filtrele
                if((msg.senderId === currentUser.uid && msg.receiverId === activeChatUserId) || 
                   (msg.senderId === activeChatUserId && msg.receiverId === currentUser.uid)) {
                    const cls = msg.senderId === currentUser.uid ? 'sent' : 'received';
                    box.insertAdjacentHTML('beforeend', `<div class="chat-msg ${cls}">${msg.text}</div>`);
                }
            });
            box.scrollTop = box.scrollHeight; // Sohbeti otomatik aşağı kaydır
        });
    }

    // --- 10. SEKME VE KARANLIK MOD AYARLARI ---
    document.getElementById('theme-toggle-btn').onclick = () => {
        document.body.classList.toggle('dark-mode');
        const icon = document.getElementById('theme-toggle-btn').children[0];
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
            
            // Eğer DM sekmesine basıldıysa sohbet listesini sıfırla
            if(item.dataset.target === 'dm-tab') {
                document.getElementById('dm-chat-container').style.display = "none";
                document.getElementById('dm-list-container').style.display = "block";
            }
            window.scrollTo(0, 0);
        });
    });

    document.querySelectorAll('.close-btn').forEach(btn => btn.onclick = (e) => e.target.closest('.modal').style.display = "none");
});