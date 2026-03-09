// ==========================================
// 1. MANUEL GİRİŞLERİ ŞABLONLARA DAĞITMA
// ==========================================
const inputs = [
    { id: 'inp-home-name', targetClasses: '.out-home-name', upper: true },
    { id: 'inp-away-name', targetClasses: '.out-away-name', upper: true },
    { id: 'inp-home-score', targetClasses: '.out-home-score', upper: false },
    { id: 'inp-away-score', targetClasses: '.out-away-score', upper: false },
    { id: 'inp-player-name', targetClasses: '.out-player-name', upper: true },
    { id: 'inp-news-title', targetClasses: '.out-news-title', upper: false }
];

inputs.forEach(input => {
    document.getElementById(input.id).addEventListener('input', function(e) {
        let value = input.upper ? e.target.value.toUpperCase() : e.target.value;
        document.querySelectorAll(input.targetClasses).forEach(target => {
            target.innerHTML = value.replace(/\n/g, '<br>');
        });
    });
});

// YENİ: Gol Atanlar Motoru (Satır atlamalarını HTML'e çevirir)
document.getElementById('inp-home-scorers').addEventListener('input', function(e) {
    document.querySelector('.out-home-scorers').innerHTML = e.target.value.replace(/\n/g, '<br>');
});
document.getElementById('inp-away-scorers').addEventListener('input', function(e) {
    document.querySelector('.out-away-scorers').innerHTML = e.target.value.replace(/\n/g, '<br>');
});

// İlk 11 Kadrosu Oluşturucu Motoru
document.getElementById('inp-lineup').addEventListener('input', function(e) {
    const listContainer = document.getElementById('out-lineup-list');
    listContainer.innerHTML = ''; 
    
    // Satır satır (Enter'a basılarak) ayrılan isimleri al
    const players = e.target.value.split('\n').map(p => p.trim()).filter(p => p !== '');
    
    // Maksimum 11 oyuncuyu listeye ekle
    players.slice(0, 11).forEach((player, index) => {
        const item = document.createElement('div');
        item.className = 'kadro-item';
        item.innerHTML = `<span class="kadro-item-num">${index + 1}</span> ${player.toUpperCase()}`;
        listContainer.appendChild(item);
    });
});
document.getElementById('inp-lineup').dispatchEvent(new Event('input'));

// ==========================================
// 2. FOTOĞRAF VE ÖZEL LOGO YÜKLEME SİSTEMİ
// ==========================================
document.getElementById('upload-bg').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            document.getElementById('bg-mac-gunu').style.backgroundImage = `url('${event.target.result}')`;
            document.getElementById('bg-mac-sonucu').style.backgroundImage = `url('${event.target.result}')`;
            document.getElementById('bg-reels').style.backgroundImage = `url('${event.target.result}')`;
        }
        reader.readAsDataURL(file);
    }
});

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
// 3. ULTRA YÜKSEK ÇÖZÜNÜRLÜKLÜ İNDİRME
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
