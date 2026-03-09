// SOL PANELDEN GELEN VERİLERİ ŞABLONLARA DAĞITMA
const inputs = [
    { id: 'inp-home-name', targetClasses: '.out-home-name' },
    { id: 'inp-away-name', targetClasses: '.out-away-name' },
    { id: 'inp-home-score', targetClasses: '.out-home-score' },
    { id: 'inp-away-score', targetClasses: '.out-away-score' },
    { id: 'inp-news-title', targetClasses: '.out-news-title' },
    { id: 'inp-player-name', targetClasses: '.out-player-name' }
];

inputs.forEach(input => {
    document.getElementById(input.id).addEventListener('input', function(e) {
        const value = e.target.value.toUpperCase();
        const targets = document.querySelectorAll(input.targetClasses);
        targets.forEach(target => {
            target.innerText = value;
        });
    });
});

// ARKA PLAN FOTOĞRAFI YÜKLEME
document.getElementById('upload-bg').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            document.getElementById('bg-mac-gunu').style.backgroundImage = `url('${event.target.result}')`;
            document.getElementById('bg-reels').style.backgroundImage = `url('${event.target.result}')`;
        }
        reader.readAsDataURL(file);
    }
});

// OYUNCU FOTOĞRAFI (DEKUPE) YÜKLEME
document.getElementById('upload-player').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            document.getElementById('sd-player-img').src = event.target.result;
            document.getElementById('reels-player-img').src = event.target.result;
        }
        reader.readAsDataURL(file);
    }
});

// ULTRA YÜKSEK KALİTE PNG İNDİRME MOTORU
function downloadTpl(elementId, fileName) {
    const captureArea = document.getElementById(elementId);
    
    // Geçici olarak scale'i sıfırlıyoruz ki kalite düşmesin
    const originalTransform = captureArea.style.transform;
    captureArea.style.transform = "scale(1)";
    
    // Butona basıldığında yavaşlama hissi normaldir, 3 katı kalitede render alıyor.
    html2canvas(captureArea, {
        scale: 3, // Maksimum kalite (Orijinal görseldeki o keskinliği verir)
        backgroundColor: "#050505",
        useCORS: true,
        allowTaint: true,
        logging: false
    }).then(canvas => {
        // İşlem bitince arayüzü eski boyutuna küçült
        captureArea.style.transform = originalTransform || "scale(0.6)";
        
        const imageURL = canvas.toDataURL("image/jpeg", 0.95); // Yüksek kaliteli JPEG olarak indir (Boyutu optimize etmek için)
        const downloadLink = document.createElement('a');
        downloadLink.href = imageURL;
        downloadLink.download = `skoragi-${fileName}.jpg`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    });
}
