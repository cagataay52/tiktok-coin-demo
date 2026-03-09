// ==========================================
// 1. MANUEL GİRİŞLERİ ŞABLONLARA DAĞITMA
// ==========================================
const inputs = [
    { id: 'inp-home-name', targetClasses: '.out-home-name' },
    { id: 'inp-away-name', targetClasses: '.out-away-name' },
    { id: 'inp-home-score', targetClasses: '.out-home-score' },
    { id: 'inp-away-score', targetClasses: '.out-away-score' },
    { id: 'inp-news-title', targetClasses: '.out-news-title' },
    { id: 'inp-player-name', targetClasses: '.out-player-name' },
    // YENİ: Gol Atanlar Bağlantısı
    { id: 'inp-home-scorers', targetClasses: '.out-home-scorers' },
    { id: 'inp-away-scorers', targetClasses: '.out-away-scorers' }
];

inputs.forEach(input => {
    document.getElementById(input.id).addEventListener('input', function(e) {
        // Haber başlığı hariç her şeyi otomatik BÜYÜK HARF yap
        const value = input.id === 'inp-news-title' ? e.target.value : e.target.value.toUpperCase();
        
        const targets = document.querySelectorAll(input.targetClasses);
        targets.forEach(target => {
            target.innerHTML = value.replace(/\n/g, '<br>');
        });
    });
});

// ==========================================
// 2. FOTOĞRAF YÜKLEME SİSTEMİ
// ==========================================
document.getElementById('upload-bg').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            document.getElementById('bg-mac-gunu').style.backgroundImage = `url('${event.target.result}')`;
            // Yeni maç sonucu şablonunun arka planını da değiştir
            const macSonucuBg = document.getElementById('bg-mac-sonucu');
            if(macSonucuBg) macSonucuBg.style.backgroundImage = `url('${event.target.result}')`;
        }
        reader.readAsDataURL(file);
    }
});

document.getElementById('upload-player').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            document.getElementById('sd-player-img').src = event.target.result;
            const tsImg = document.querySelector('.ts-img img');
            if(tsImg) tsImg.src = event.target.result;
        }
        reader.readAsDataURL(file);
    }
});

// ==========================================
// 3. ULTRA YÜKSEK ÇÖZÜNÜRLÜKLÜ İNDİRME MOTORU
// ==========================================
function downloadTpl(elementId, fileName) {
    const captureArea = document.getElementById(elementId);
    
    // Geçici olarak tam boyuta alıyoruz ki HD insin
    const originalTransform = captureArea.style.transform;
    captureArea.style.transform = "scale(1)";
    
    html2canvas(captureArea, {
        scale: 3, // Photoshop kalitesi için 3 kat büyütme
        backgroundColor: "#111",
        useCORS: true,
        allowTaint: true,
        logging: false
    }).then(canvas => {
        // İndirme bitince eski boyutuna geri getir
        captureArea.style.transform = originalTransform || "scale(0.6)";
        
        const imageURL = canvas.toDataURL("image/jpeg", 0.95);
        const downloadLink = document.createElement('a');
        downloadLink.href = imageURL;
        downloadLink.download = `skoragi-${fileName}.jpg`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    });
}
