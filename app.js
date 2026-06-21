// Firebase SDK modüllerini internet üzerinden (CDN) çekiyoruz
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Senin Firebase Konfigürasyonun
const firebaseConfig = {
  apiKey: "AIzaSyCTbvB4-LBG-jP8zNkJhLNEaQfQpTAdEjA",
  authDomain: "swipper-2f2a4.firebaseapp.com",
  projectId: "swipper-2f2a4",
  storageBucket: "swipper-2f2a4.firebasestorage.app",
  messagingSenderId: "1025977111228",
  appId: "1:1025977111228:web:f2b0013a21c5f2b434b6b9"
};

// Firebase'i Başlat
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

document.addEventListener("DOMContentLoaded", () => {
    // DOM Elementleri
    const authScreen = document.getElementById('auth-screen');
    const appContainer = document.getElementById('app-container');
    const authEmail = document.getElementById('auth-email');
    const authPassword = document.getElementById('auth-password');
    const authError = document.getElementById('auth-error');
    
    // --- AUTHENTICATION (KAYIT & GİRİŞ) ---
    
    // Kayıt Ol
    document.getElementById('register-btn').addEventListener('click', () => {
        const email = authEmail.value;
        const password = authPassword.value;
        createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                authError.style.display = "none";
                console.log("Hesap oluşturuldu:", userCredential.user.email);
            })
            .catch((error) => {
                authError.innerText = "Hata: " + error.message;
                authError.style.display = "block";
            });
    });

    // Giriş Yap
    document.getElementById('login-btn').addEventListener('click', () => {
        const email = authEmail.value;
        const password = authPassword.value;
        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                authError.style.display = "none";
            })
            .catch((error) => {
                authError.innerText = "Giriş başarısız. Bilgileri kontrol et.";
                authError.style.display = "block";
            });
    });

    // Çıkış Yap
    document.getElementById('logout-btn').addEventListener('click', () => {
        signOut(auth);
    });

    // Kullanıcı Durumunu Dinle (Oturum açıldı mı?)
    let currentUser = null;
    onAuthStateChanged(auth, (user) => {
        if (user) {
            // Kullanıcı giriş yaptı, ana uygulamayı göster
            currentUser = user;
            authScreen.style.display = "none";
            appContainer.style.display = "block";
            
            // Profili Güncelle
            document.getElementById('display-username').innerText = user.email.split('@')[0];
            
            // Gönderileri Çekmeye Başla
            loadRealtimePosts();
        } else {
            // Kullanıcı çıkış yaptı, giriş ekranını göster
            currentUser = null;
            authScreen.style.display = "flex";
            appContainer.style.display = "none";
        }
    });

    // --- CLOUD FIRESTORE (GERÇEK ZAMANLI VERİTABANI) ---

    // Yeni Gönderi Paylaşma
    const postModal = document.getElementById('post-modal');
    document.getElementById('add-post-trigger').onclick = () => postModal.style.display = "flex";
    document.getElementById('close-post').onclick = () => postModal.style.display = "none";

    document.getElementById('save-post-btn').addEventListener('click', async () => {
        const content = document.getElementById('post-content-input').value;
        if (content.trim() === "" || !currentUser) return;

        try {
            // Veritabanındaki 'posts' koleksiyonuna yeni veri ekle
            await addDoc(collection(db, "posts"), {
                content: content,
                authorEmail: currentUser.email,
                authorName: currentUser.email.split('@')[0], // Şimdilik e-postanın ilk kısmını isim yapıyoruz
                createdAt: serverTimestamp(),
                likes: 0
            });
            
            document.getElementById('post-content-input').value = "";
            postModal.style.display = "none";
        } catch (e) {
            console.error("Gönderi eklenirken hata: ", e);
        }
    });

    // Gönderileri Gerçek Zamanlı (Realtime) Okuma
    function loadRealtimePosts() {
        const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
        
        // onSnapshot: Veritabanında bir şey değiştiğinde anında tetiklenir
        onSnapshot(q, (snapshot) => {
            const feedContainer = document.getElementById('feed-container');
            feedContainer.innerHTML = ""; // Ekranı temizle
            document.getElementById('post-count').innerText = snapshot.docs.length;
            
            snapshot.forEach((doc) => {
                const post = doc.data();
                
                // Zaman hesaplama (Firebase Timestamp)
                let timeString = "Az önce";
                if(post.createdAt) {
                    const date = post.createdAt.toDate();
                    timeString = date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                }

                const postHTML = `
                    <div class="post">
                        <div class="post-header">
                            <div class="post-header-left">
                                <img class="post-avatar" src="https://i.pravatar.cc/150?u=${post.authorEmail}">
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

    // --- ALT NAVİGASYON (Sekme Geçişleri) ---
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