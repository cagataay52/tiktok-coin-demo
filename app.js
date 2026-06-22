// 1. FIREBASE BAŞLATMA
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
const storage = firebase.storage(); // GÖRSEL DEPOLAMA İÇİN EKLENDİ

document.addEventListener("DOMContentLoaded", () => {
    
    // --- DOM ELEMENTLERİ ---
    const authScreen = document.getElementById('auth-screen');
    const appContainer = document.getElementById('app-container');
    const authEmail = document.getElementById('auth-email');
    const authPassword = document.getElementById('auth-password');
    const authError = document.getElementById('auth-error');

    let currentUser = null;

    // --- 1. KAYIT OL & GİRİŞ YAP ---
    document.getElementById('register-btn').addEventListener('click', () => {
        authError.style.display = "none";
        auth.createUserWithEmailAndPassword(authEmail.value, authPassword.value)
            .catch(err => {
                authError.innerText = "Hata: " + err.message;
                authError.style.display = "block";
            });
    });

    document.getElementById('login-btn').addEventListener('click', () => {
        authError.style.display = "none";
        auth.signInWithEmailAndPassword(authEmail.value, authPassword.value)
            .catch(err => {
                authError.innerText = "Giriş başarısız. Şifre veya E-posta hatalı.";
                authError.style.display = "block";
            });
    });

    document.getElementById('logout-btn').addEventListener('click', () => {
        auth.signOut();
    });

    // Profil Fotoğraflarını Her Yerde Güncelleyen Fonksiyon
    function updateAllProfilePics(url) {
        document.getElementById('main-profile-pic').src = url;
        document.getElementById('nav-profile-img').src = url;
        document.getElementById('my-story-img').src = url;
    }

    // --- 2. KULLANICI DURUMUNU DİNLEME ---
    auth.onAuthStateChanged((user) => {
        if (user) {
            currentUser = user;
            authScreen.style.display = "none";
            appContainer.style.display = "block";
            
            const username = user.email.split('@')[0];
            document.getElementById('display-username').innerText = `@${username}`;
            document.getElementById('display-name').innerText = username;
            
            // Kullanıcının profil fotoğrafı varsa yükle, yoksa varsayılan avatarı kullan
            const photoURL = user.photoURL || "https://i.pravatar.cc/150?img=11";
            updateAllProfilePics(photoURL);
            
            loadRealtimePosts();
        } else {
            currentUser = null;
            authScreen.style.display = "flex";
            appContainer.style.display = "none";
            document.getElementById('auth-password').value = '';
        }
    });

    // --- 3. GALERİDEN PROFİL FOTOĞRAFI YÜKLEME ---
    const profileUploadInput = document.getElementById('profile-upload');
    const avatarContainer = document.getElementById('avatar-container');
    const displayBio = document.getElementById('display-bio');

    // Profil resmine tıklandığında gizli dosya seçiciyi çalıştır
    avatarContainer.addEventListener('click', () => {
        profileUploadInput.click();
    });

    // Dosya seçildiğinde Firebase Storage'a yükle
    profileUploadInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file || !currentUser) return;

        try {
            displayBio.innerText = "Fotoğraf yükleniyor, lütfen bekle...";
            displayBio.style.color = "var(--blue)";
            
            // Storage referansını oluştur (avatars/KULLANICI_ID yoluna)
            const storageRef = storage.ref(`avatars/${currentUser.uid}`);
            
            // Dosyayı yükle
            await storageRef.put(file);
            
            // Yüklenen dosyanın indirme linkini al
            const downloadURL = await storageRef.getDownloadURL();
            
            // Kullanıcının Auth profiline bu linki kaydet
            await currentUser.updateProfile({ photoURL: downloadURL });
            
            // Ekrandaki resimleri güncelle
            updateAllProfilePics(downloadURL);
            
            displayBio.innerText = "Profil fotoğrafı başarıyla güncellendi!";
            setTimeout(() => {
                displayBio.innerText = "Swipper'a Hoş Geldin!";
                displayBio.style.color = "var(--text-color)";
            }, 3000);

        } catch (error) {
            alert("Fotoğraf yüklenirken hata oluştu: " + error.message);
            displayBio.innerText = "Yükleme başarısız.";
            displayBio.style.color = "#ed4956";
        }
    });

    // --- 4. FIRESTORE: GÖNDERİ PAYLAŞMA VE OKUMA ---
    const postModal = document.getElementById('post-modal');
    document.getElementById('add-post-trigger').onclick = () => postModal.style.display = "flex";
    document.getElementById('close-post').onclick = () => postModal.style.display = "none";

    document.getElementById('save-post-btn').addEventListener('click', () => {
        const content = document.getElementById('post-content-input').value;
        if (content.trim() === "" || !currentUser) return;

        const photoURL = currentUser.photoURL || "https://i.pravatar.cc/150?img=11";

        db.collection("posts").add({
            content: content,
            authorEmail: currentUser.email,
            authorName: currentUser.email.split('@')[0],
            authorPhoto: photoURL, // Gönderiyi atan kişinin anlık fotosu
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            likes: 0
        }).then(() => {
            document.getElementById('post-content-input').value = "";
            postModal.style.display = "none";
        }).catch(err => {
            alert("Gönderi paylaşılamadı: " + err.message);
        });
    });

    function loadRealtimePosts() {
        db.collection("posts").orderBy("createdAt", "desc").onSnapshot(snapshot => {
            const feedContainer = document.getElementById('feed-container');
            feedContainer.innerHTML = ""; 
            document.getElementById('post-count').innerText = snapshot.docs.length;
            
            snapshot.forEach(doc => {
                const post = doc.data();
                
                let timeString = "Şimdi";
                if(post.createdAt) {
                    const date = post.createdAt.toDate();
                    timeString = date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                }

                // Eğer gönderideki profil fotosu bozuk/yoksa varsayılan atar
                const postAvatar = post.authorPhoto || "https://i.pravatar.cc/150?img=11";

                const postHTML = `
                    <div class="post">
                        <div class="post-header">
                            <div class="post-header-left">
                                <img class="post-avatar" src="${postAvatar}">
                                <div class="post-header-info">
                                    <span class="name-container">${post.authorName}</span>
                                    <span class="time-username">@${post.authorName} · ${timeString}</span>
                                </div>
                            </div>
                        </div>
                        <div class="post-content">${post.content}</div>
                        <div class="post-actions">
                            <i class="fa-regular fa-heart"></i>
                            <i class="fa-regular fa-comment"></i>
                        </div>
                    </div>
                `;
                feedContainer.insertAdjacentHTML('beforeend', postHTML);
            });
        });
    }

    // --- 5. ALT MENÜ GEÇİŞLERİ ---
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