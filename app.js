function bindText(inputId, targetClass, isUpper = true, isHtml = false) {
    const input = document.getElementById(inputId);
    if (!input) return;
    input.addEventListener('input', function(e) {
        let value = isUpper ? e.target.value.toUpperCase() : e.target.value;
        if (isHtml) value = value.replace(/\n/g, '<br>');
        document.querySelectorAll(targetClass).forEach(el => el.innerHTML = value);
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

// 1. MAÇ GÜNÜ
bindText('mg-home-name', '.out-mg-home-name');
bindText('mg-away-name', '.out-mg-away-name');
bindText('mg-time', '.out-mg-time', false);
bindText('mg-venue', '.out-mg-venue');
bindImage('mg-home-logo', 'out-mg-home-logo');
bindImage('mg-away-logo', 'out-mg-away-logo');
bindImage('mg-bg', 'bg-mac-gunu', true);

// 2. İLK YARI SONUCU (HT)
bindText('iy-home-name', '.out-iy-home-name');
bindText('iy-away-name', '.out-iy-away-name');
bindText('iy-home-score', '.out-iy-home-score', false);
bindText('iy-away-score', '.out-iy-away-score', false);
bindImage('iy-home-logo', 'out-iy-home-logo');
bindImage('iy-away-logo', 'out-iy-away-logo');
bindImage('iy-bg', 'bg-ilk-yari', true);

// 3. MAÇ SONUCU
bindText('ms-home-name', '.out-ms-home-name');
bindText('ms-away-name', '.out-ms-away-name');
bindText('ms-home-score', '.out-ms-home-score', false);
bindText('ms-away-score', '.out-ms-away-score', false);
bindText('ms-home-scorers', '.out-ms-home-scorers', false, true);
bindText('ms-away-scorers', '.out-ms-away-scorers', false, true);
bindImage('ms-home-logo', 'out-ms-home-logo');
bindImage('ms-away-logo', 'out-ms-away-logo');
bindImage('ms-bg', 'bg-mac-sonucu', true);

// 4. İSTATİSTİKLER (Matematiksel Bar Hesaplama)
function bindStat(idHome, idAway, outHome, outAway, barHome, barAway, isPercent = false) {
    const iHome = document.getElementById(idHome);
    const iAway = document.getElementById(idAway);
    
    function updateStats() {
        const vHome = parseFloat(iHome.value) || 0;
        const vAway = parseFloat(iAway.value) || 0;
        const total = vHome + vAway;
        
        let pHome = 50, pAway = 50;
        if (total > 0) {
            pHome = (vHome / total) * 100;
            pAway = (vAway / total) * 100;
        }

        document.querySelector(outHome).innerText = vHome + (isPercent ? '%' : '');
        document.querySelector(outAway).innerText = vAway + (isPercent ? '%' : '');
        document.getElementById(barHome).style.width = pHome + '%';
        document.getElementById(barAway).style.width = pAway + '%';
    }

    iHome.addEventListener('input', updateStats);
    iAway.addEventListener('input', updateStats);
    updateStats(); // İlk yüklemede çalıştır
}

bindStat('stat-pos-home', 'stat-pos-away', '.out-stat-pos-home', '.out-stat-pos-away', 'bar-pos-home', 'bar-pos-away', true);
bindStat('stat-shot-home', 'stat-shot-away', '.out-stat-shot-home', '.out-stat-shot-away', 'bar-shot-home', 'bar-shot-away');
bindStat('stat-cor-home', 'stat-cor-away', '.out-stat-cor-home', '.out-stat-cor-away', 'bar-cor-home', 'bar-cor-away');
bindStat('stat-foul-home', 'stat-foul-away', '.out-stat-foul-home', '.out-stat-foul-away', 'bar-foul-home', 'bar-foul-away');

// 5. SON DAKİKA
bindText('sd-news-title', '.out-sd-title', false, true);
bindImage('sd-player-img', 'out-sd-player');
bindImage('sd-bg', 'bg-sondakika', true);

// 6. İLK 11
bindImage('k-logo', 'out-k-logo');
bindImage('k-bg', 'bg-kadro', true); 
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

// 7. REELS
bindText('r-player-name', '.out-r-name');
bindImage('r-player-img', 'out-r-player');
bindImage('r-bg', 'bg-reels', true);

// HD İNDİRME MOTORU
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
