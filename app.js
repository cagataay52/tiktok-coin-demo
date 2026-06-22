// FIREBASE BAŞLATMA
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
const storage = firebase.storage();

document.addEventListener("DOMContentLoaded", () => {
    
    const authScreen = document.getElementById('auth-screen');
    const appContainer = document.getElementById('app-container');
    const authError = document.getElementById('auth-error');
    let currentUser = null;
    let selectedPostImageFile = null;

    // --- 1. KAYIT OL & GİRİŞ YAP ---
    document.getElementById('register-btn').addEventListener('click', () => {
        const email = document.getElementById('auth-email').value;
        const pass = document.getElementById('auth-password').value;
        auth.createUserWithEmailAndPassword(email, pass).catch(err => {
            authError.innerText = "Hata: " + err.message;
            authError.style.display = "block";
        });
    });

    document.getElementById('login-btn').addEventListener('click', () => {
        const email = document.getElementById('auth-email').value;
        const pass = document.getElementById('auth-password').value;
        auth.signInWithEmailAndPassword(email, pass).catch(err => {
            authError.innerText = "Giriş başarısız. Bilgileri kontrol et.";
            authError.style.display = "block";
        });
    });

    document.getElementById('logout-btn').addEventListener('click', () => {
        auth.signOut();
    });

    // --- 2. KULLANICI DURUMU VE PROFİL VERİLERİ ---
    auth.onAuthStateChanged((user) => {
        if (user) {
            currentUser = user;
            authScreen.style.display = "none";
            appContainer.style.display = "block";
            
            // Profili Veritabanından Çek / Yoksa Oluştur
            const userRef = db.collection('users').doc(user.uid);
            userRef.get().then((doc) => {
                if (doc.exists) {
                    updateProfileUI(doc.data());
                } else {
                    const defaultProfile = {
                        name: "Çağatay Kılıç",
                        username: user.email.split('@')[0],
                        bio: "Swipper'a hoş geldin!",
                        avatar: "https://i.pravatar.cc/150?img=11"
                    };
                    userRef.set(defaultProfile);
                    updateProfileUI(defaultProfile);
                }
            });
            
            loadRealtimePosts();
            loadProfileGrid();
        } else {
            currentUser = null;
            authScreen.style.display = "flex";
            appContainer.style.display = "none";
        }
    });

    function updateProfileUI(data) {
        document.getElementById('display-username').innerHTML = `<i class="fa-solid fa-lock" style="font-size:12px;"></i> ${data.username}`;
        document.getElementById('display-name').innerText = data.name;
        document.getElementById('display-bio').innerText = data.bio;
        
        const avatarUrl = data.avatar || "https://i.pravatar.cc/150?img=11";
        document.getElementById('main-profile-pic').src = avatarUrl;
        document.getElementById('nav-profile-img').src = avatarUrl;
        document.getElementById('my-story-img').src = avatarUrl;
    }

    // --- 3. PROFİLİ DÜZENLEME MANTIĞI ---
    const editModal = document.getElementById('edit-profile-modal');
    document.getElementById('edit-profile-trigger').onclick = () => {
        db.collection('users').doc(currentUser.uid).get().then(doc => {
            const data = doc.data();
            document.getElementById('input-name').value = data.name;
            document.getElementById('input-username').value = data.username;
            document.getElementById('input-bio').value = data.bio;
            editModal.style.display = "flex";
        });
    };

    document.getElementById('save-profile-btn').onclick = () => {
        const newProfile = {
            name: document.getElementById('input-name').value,
            username: document.getElementById('input-username').value,
            bio: document.getElementById('input-bio').value
        };
        
        db.collection('users').doc(currentUser.uid).update(newProfile).then(() => {
            updateProfileUI(newProfile); // UI anında güncelle
            editModal.style.display = "none";
        });
    };

    // --- 4. PROFİL FOTOĞRAFI YÜKLEME ---
    const profileUpload = document.getElementById('profile-upload');
    document.getElementById('avatar-container').onclick = () => profileUpload.click();
    
    profileUpload.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file || !currentUser) return;
        
        document.getElementById('display-bio').innerText = "Fotoğraf güncelleniyor...";
        const storageRef = storage.ref(`avatars/${currentUser.uid}`);
        
        try {
            await storageRef.put(file);
            const url = await storageRef.getDownloadURL();
            await db.collection('users').doc(currentUser.uid).update({ avatar: url });
            document.getElementById('display-bio').innerText = "Biyografiniz"; 
            window.location.reload(); 
        } catch(err) {
            alert("Resim yüklenemedi. (Firebase Storage Kurallarını açtığınızdan emin olun)");
        }
    };

    // --- 5. İÇERİK OLUŞTURMA (+ MENÜSÜ) ---
    const createOptionsModal = document.getElementById('create-options-modal');
    const postModal = document.getElementById('post-modal');

    document.getElementById('add-content-trigger').onclick = () => createOptionsModal.style.display = "flex";

    // Gönderi Seçeneği
    document.getElementById('btn-create-post').onclick = () => {
        createOptionsModal.style.display = "none";
        postModal.style.display = "flex";
        document.getElementById('post-image-preview').style.display = "none";
        selectedPostImageFile = null;
    };

    document.getElementById('btn-create-story').onclick = () => {
        alert("Kamera açılıyor... (Hikaye özelliği)");
        createOptionsModal.style.display = "none";
    };
    
    document.getElementById('btn-create-reel').onclick = () => {
        alert("Kamera açılıyor... (Reels özelliği)");
        createOptionsModal.style.display = "none";
    };

    // Gönderi İçin Fotoğraf Seçme
    document.getElementById('select-post-image').onclick = () => document.getElementById('post-image-upload').click();
    document.getElementById('post-image-upload').onchange = (e) => {
        selectedPostImageFile = e.target.files[0];
        if(selectedPostImageFile) {
            const preview = document.getElementById('preview-img');
            preview.src = URL.createObjectURL(selectedPostImageFile);
            document.getElementById('post-image-preview').style.display = "block";
            document.getElementById('select-post-image').innerText = "Fotoğrafı Değiştir";
        }
    };

    // Gönderiyi Paylaş (Resimli)
    document.getElementById('save-post-btn').onclick = async () => {
        const caption = document.getElementById('post-content-input').value;
        if (!selectedPostImageFile) { alert("Lütfen bir fotoğraf seçin!"); return; }

        document.getElementById('save-post-btn').innerText = "Yükleniyor...";
        
        try {
            const postRef = storage.ref(`posts/${Date.now()}_${selectedPostImageFile.name}`);
            await postRef.put(selectedPostImageFile);
            const imageUrl = await postRef.getDownloadURL();

            await db.collection('posts').add({
                imageUrl: imageUrl,
                caption: caption,
                authorId: currentUser.uid,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                likes: 0
            });

            postModal.style.display = "none";
            document.getElementById('save-post-btn').innerText = "Paylaş";
            document.getElementById('post-content-input').value = "";
        } catch(err) {
            alert("Gönderi paylaşılamadı: " + err.message);
            document.getElementById('save-post-btn').innerText = "Paylaş";
        }
    };

    // --- 6. GÖNDERİLERİ ÇEKME (Instagram Tarzı Akış) ---
    function loadRealtimePosts() {
        db.collection("posts").orderBy("createdAt", "desc").onSnapshot(async (snapshot) => {
            const feedContainer = document.getElementById('feed-container');
            feedContainer.innerHTML = ""; 
            
            for (const docSnapshot of snapshot.docs) {
                const post = docSnapshot.data();
                
                const authorDoc = await db.collection('users').doc(post.authorId).get();
                const authorData = authorDoc.exists ? authorDoc.data() : { username: "kullanici", avatar: "https://i.pravatar.cc/150" };

                let timeString = "Şimdi";
                if(post.createdAt) {
                    const date = post.createdAt.toDate();
                    timeString = date.toLocaleDateString() + " " + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                }

                const postHTML = `
                    <div class="post">
                        <div class="post-header">
                            <img class="post-avatar" src="${authorData.avatar}">
                            <span class="post-author">${authorData.username}</span>
                        </div>
                        <img class="post-image" src="${post.imageUrl}">
                        <div class="post-actions">
                            <i class="fa-regular fa-heart"></i>
                            <i class="fa-regular fa-comment"></i>
                            <i class="fa-regular fa-paper-plane"></i>
                        </div>
                        <div class="post-likes">${post.likes} beğenme</div>
                        <div class="post-caption">
                            <span>${authorData.username}</span>${post.caption}
                        </div>
                        <div class="post-time">${timeString}</div>
                    </div>
                `;
                feedContainer.insertAdjacentHTML('beforeend', postHTML);
            }
        });
    }

    // Profil Sayfasındaki Grid İçin Sadece Kendi Gönderilerini Çekme
    function loadProfileGrid() {
        db.collection("posts").where("authorId", "==", currentUser.uid).onSnapshot((snapshot) => {
            const gridContainer = document.getElementById('profile-grid-container');
            gridContainer.innerHTML = "";
            document.getElementById('post-count').innerText = snapshot.docs.length;
            
            snapshot.forEach(docSnapshot => {
                const post = docSnapshot.data();
                gridContainer.insertAdjacentHTML('beforeend', `
                    <div class="grid-item">
                        <img src="${post.imageUrl}">
                    </div>
                `);
            });
        });
    }

    // --- MODAL VE SEKME GEÇİŞLERİ ---
    document.querySelectorAll('.close-btn').forEach(btn => {
        btn.onclick = (e) => e.target.closest('.modal').style.display = "none";
    });
    window.onclick = (e) => { if (e.target.classList.contains('modal')) e.target.style.display = "none"; };

    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            navItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
            document.getElementById(item.dataset.target).classList.add('active');
            window.scrollTo(0, 0);
        });
    });
});