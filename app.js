// SOL PANELDEN GİRİLEN VERİLERİ SAĞDAKİ ŞABLONLARA ANINDA (CANLI) AKTARMA
const inputs = [
    { id: 'inp-home-name', targetClasses: '.out-home-name' },
    { id: 'inp-away-name', targetClasses: '.out-away-name' },
    { id: 'inp-home-score', targetClasses: '.out-home-score' },
    { id: 'inp-away-score', targetClasses: '.out-away-score' },
    { id: 'inp-news-title', targetClasses: '.out-news-title' },
    { id: 'inp-player-name', targetClasses: '.out-player-name' },
    { id: 'inp-time', targetClasses: '.out-time' },
    { id: 'inp-venue', targetClasses: '.out-venue' }
];

// Her input'u dinle, yazı yazıldıkça şablonları güncelle
inputs.forEach(input => {
    document.getElementById(input.id).addEventListener('input', function(e) {
        const value = e.target.value.toUpperCase();
        const targets = document.querySelectorAll(input.targetClasses);
        targets.forEach(target => {
            target.innerText = value;
        });
    });
});

// ARKA PLAN GÖRSELİ YÜKLEME (Maç Günü ve Reels için)
document.getElementById('upload-bg').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            document.getElementById('bg-mac-gunu').style.backgroundImage = `url('${event.target.result}')`;
            // Reels için arka planı biraz daha koyu yapıp ekleyelim
            document.getElementById('bg-reels').style.background = `linear-gradient(to top, #000 0%, transparent 60%), radial-gradient(circle at center, var(--primary) 0%, transparent 50%), url('${event.target.result}')`;
            document.getElementById('bg-reels').style.backgroundSize = "cover";
            document.getElementById('bg-reels').style.backgroundPosition = "center";
        }
        reader.readAsDataURL(file);
    }
});

// OYUNCU FOTOĞRAFI YÜKLEME (Son Dakika ve Reels için)
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

// PNG OLARAK İNDİRME FONKSİYONU
// Hangi şablonun altındaki butona basarsan, o şablonu yüksek kalitede indirir
function downloadTpl(elementId, fileName) {
    const captureArea = document.getElementById(elementId);
    
    // Geçici olarak scale'i kaldıralım ki tam boyutta fotoğraf çeksin
    const originalTransform = captureArea.style.transform;
    captureArea.style.transform = "scale(1)";
    
    html2canvas(captureArea, {
        scale: 2, // 2x kalite (Retina / Instagram standartları için)
        backgroundColor: "#121212",
        useCORS: true,
        allowTaint: true
    }).then(canvas => {
        // İndirme işlemi bitince scale'i geri eski haline getir
        captureArea.style.transform = originalTransform || "scale(0.6)";
        
        const imageURL = canvas.toDataURL("image/png");
        const downloadLink = document.createElement('a');
        downloadLink.href = imageURL;
        downloadLink.download = `skoragi-${fileName}.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    });
}
