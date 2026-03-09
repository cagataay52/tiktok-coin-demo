// ==========================================
// 1. DİNAMİK RENK (GLOW) KONTROLÜ
// ==========================================
document.getElementById('inp-home-color').addEventListener('input', (e) => {
    document.documentElement.style.setProperty('--home-color', e.target.value);
});
document.getElementById('inp-away-color').addEventListener('input', (e) => {
    document.documentElement.style.setProperty('--away-color', e.target.value);
});

// ==========================================
// 2. MANUEL GİRİŞLERİ ŞABLONLARA DAĞITMA
// ==========================================
const inputs = [
    { id: 'inp-home-name', targetClasses: '.out-home-name', upper: true },
    { id: 'inp-away-name', targetClasses: '.out-away-name', upper: true },
    { id: 'inp-home-score', targetClasses: '.out-home-score', upper: false },
    { id: 'inp-away-score', targetClasses: '.out-away-score', upper: false },
    { id: 'inp-time', targetClasses: '.out-match-time', upper: false },
    { id: 'inp-venue', targetClasses: '.out-match-venue', upper: true },
    { id: 'inp-player-name', targetClasses: '.out-player-name', upper: true }
];

inputs.forEach(input => {
    document.getElementById(input.id).addEventListener('input', function(e) {
        let value = input.upper ? e.target.value.toUpperCase() : e.target.value;
        document.querySelectorAll(input.targetClasses).forEach(target => {
            target.innerHTML = value.replace(/\n/g, '<br>');
        });
    });
});

// Flaş Açıklama (Quote) Textarea Dinleyicisi
document.getElementById('inp-quote').addEventListener('input', function(e) {
    document.querySelector('.out-quote').innerText = e.target.value;
});

// İlk 11 Kadrosu Oluşturucu Motoru
document.getElementById('inp-lineup').addEventListener('input', function(e) {
    const listContainer = document.getElementById('out-lineup-list');
    listContainer.innerHTML = ''; // Önce temizle
    
    // Virgülle ayrılan isimleri al, boşlukları temizle
    const players = e.target.value.split(',').map(p => p.trim()).filter(p => p !== '');
    
    // Maksimum 11 oyuncuyu listeye ekle
    players.slice(0, 11).forEach((player, index) => {
        const item = document.createElement('div');
        item.className = 'kadro-item';
        item.innerHTML = `<span class="kadro-item-num">${index + 1}</span> ${player.toUpperCase()}`;
        listContainer.appendChild(item);
    });
});
// Sayfa ilk açıldığında varsayılan kadroyu da işlesin:
document.getElementById('inp-lineup').dispatchEvent(new Event('input'));

// ==========================================
// 3. FOTOĞRAF VE ÖZEL LOGO YÜKLEME SİSTEMİ
// ==========================================
// Arka Plan Yükleme
document.getElementById('upload-bg').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            document.getElementById('bg-mac-gunu').style.backgroundImage = `url('${event.target.result}')`;
            document.getElementById('bg-mac-sonucu').style.backgroundImage = `url('${event.target.result}')`;
            document.getElementById('bg-alinti').style.backgroundImage = `url('${event.target.result}')`;
        }
        reader.readAsDataURL(file);
    }
});

// Oyuncu Dekupe Yükleme
document.getElementById('upload-player').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            document.querySelectorAll('.out-player-img').forEach(img => {
                img.src = event.target.result;
            });
        }
        reader.readAsDataURL(file);
    }
});

// Ev Sahibi Logosu Yükleme
document.getElementById('upload-home-logo').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            document.querySelectorAll('.out-home-logo').forEach(img => {
                img.src = event.target.result;
            });
        }
        reader.readAsDataURL(file);
    }
});

// Deplasman Logosu Yükleme
document.getElementById('upload-away-logo').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            document.querySelectorAll('.out-away-logo').forEach(img => {
                img.src = event.target.result;
            });
        }
        reader.readAsDataURL(file);
    }
});

// ==========================================
// 4. ULTRA YÜKSEK ÇÖZÜNÜRLÜKLÜ İNDİRME
// ==========================================
function downloadTpl(elementId, fileName) {
    const captureArea = document.getElementById(elementId);
    const originalTransform = captureArea.style.transform;
    captureArea.style.transform = "scale(1)";
    
    html2canvas(captureArea, {
        scale: 3, 
        backgroundColor: "#111",
        useCORS: true,
        allowTaint: true,
        logging: false
    }).then(canvas => {
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
