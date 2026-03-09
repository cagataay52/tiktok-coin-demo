// ==========================================
// YARDIMCI FONKSİYONLAR
// ==========================================
function bindText(inputId, targetClass, isUpper = true, isHtml = false) {
    const input = document.getElementById(inputId);
    if (!input) return;
    input.addEventListener('input', function(e) {
        let value = isUpper ? e.target.value.toUpperCase() : e.target.value;
        if (isHtml) value = value.replace(/\n/g, '<br>');
        
        document.querySelectorAll(targetClass).forEach(el => {
            el.innerHTML = value;
        });
    });
}

function bindImage(inputId, targetIdOrClass, isBackground = false) {
    const input = document.getElementById(inputId);
    if (!input) return;
    input.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                if (targetIdOrClass.startsWith('.')) {
                    document.querySelectorAll(targetIdOrClass).forEach(el => el.src = event.target.result);
                } else if (isBackground) {
                    document.getElementById(targetIdOrClass).style.backgroundImage = `url('${event.target.result}')`;
                } else {
                    document.getElementById(targetIdOrClass).src = event.target.result;
                }
            }
            reader.readAsDataURL(file);
        }
    });
}

// ==========================================
// 1. MAÇ GÜNÜ MODÜLÜ BAĞLANTILARI
// ==========================================
bindText('mg-home-name', '.out-mg-home-name');
bindText('mg-away-name', '.out-mg-away-name');
bindText('mg-time', '.out-mg-time', false);
bindText('mg-venue', '.out-mg-venue');
bindImage('mg-home-logo', 'out-mg-home-logo');
bindImage('mg-away-logo', 'out-mg-away-logo');
bindImage('mg-bg', 'bg-mac-gunu', true);

// ==========================================
// 2. MAÇ SONUCU MODÜLÜ BAĞLANTILARI
// ==========================================
bindText('ms-home-name', '.out-ms-home-name');
bindText('ms-away-name', '.out-ms-away-name');
bindText('ms-home-score', '.out-ms-home-score', false);
bindText('ms-away-score', '.out-ms-away-score', false);
bindText('ms-home-scorers', '.out-ms-home-scorers', false, true);
bindText('ms-away-scorers', '.out-ms-away-scorers', false, true);
bindImage('ms-home-logo', 'out-ms-home-logo');
bindImage('ms-away-logo', 'out-ms-away-logo');
bindImage('ms-bg', 'bg-mac-sonucu', true);

// ==========================================
// 3. SON DAKİKA MODÜLÜ BAĞLANTILARI
// ==========================================
bindText('sd-news-title', '.out-sd-title', false, true);
bindImage('sd-player-img', 'out-sd-player');
bindImage('sd-bg', 'bg-sondakika', true); // Son Dakika Arka plan eklendi

// ==========================================
// 4. İLK 11 MODÜLÜ BAĞLANTILARI
// ==========================================
bindImage('k-logo', 'out-k-logo');
bindImage('k-bg', 'bg-kadro', true); // Kadro Arka plan eklendi
document.getElementById('k-lineup').addEventListener('input', function(e) {
    const listContainer = document.getElementById('out-k-lineup');
    listContainer.innerHTML = ''; 
    const players = e.target.value.split('\n').map(p => p.trim()).filter(p => p !== '');
    players.slice(0, 11).forEach((player, index) => {
        const item = document.createElement('div');
        item.className = 'kadro-item';
        item.innerHTML = `<span class="kadro-item-num">${index + 1}</span> ${player.toUpperCase()}`;
        listContainer.appendChild(item);
    });
});
document.getElementById('k-lineup').dispatchEvent(new Event('input'));

// ==========================================
// 5. REELS MODÜLÜ BAĞLANTILARI
// ==========================================
bindText('r-player-name', '.out-r-name');
bindImage('r-player-img', 'out-r-player');
bindImage('r-bg', 'bg-reels', true);

// ==========================================
// HD İNDİRME MOTORU
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
        captureArea.style.transform = originalTransform;
        
        const imageURL = canvas.toDataURL("image/jpeg", 0.95);
        const downloadLink = document.createElement('a');
        downloadLink.href = imageURL;
        downloadLink.download = `skoragi-${fileName}.jpg`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    });
}
