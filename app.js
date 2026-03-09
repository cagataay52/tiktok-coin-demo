// ==========================================
// YARDIMCI FONKSİYONLAR & OTOMATİK METİN
// ==========================================
function autoScaleText() {
    document.querySelectorAll('.auto-scale').forEach(el => {
        let fontSize = 45; // Flaş açıklama için daha büyük başladık
        el.style.fontSize = fontSize + 'px';
        while (el.scrollHeight > el.parentElement.clientHeight || el.scrollWidth > el.parentElement.clientWidth) {
            fontSize--; 
            el.style.fontSize = fontSize + 'px';
            if (fontSize <= 14) break; 
        }
    });
}
function autoScaleSimpleText() {
    document.querySelectorAll('.auto-text').forEach(el => {
        let parentWidth = el.parentElement.clientWidth;
        if(el.scrollWidth > parentWidth && parentWidth > 0) {
            el.style.transform = `scaleX(${parentWidth / el.scrollWidth})`;
            el.style.transformOrigin = "center";
        } else {
            el.style.transform = "none";
        }
    });
}

function bindText(inputId, targetClass, isUpper = true, isHtml = false) {
    const input = document.getElementById(inputId);
    if (!input) return;
    input.addEventListener('input', function(e) {
        let value = isUpper ? e.target.value.toUpperCase() : e.target.value;
        if (isHtml) value = value.replace(/\n/g, '<br>');
        document.querySelectorAll(targetClass).forEach(el => el.innerHTML = value);
        autoScaleText(); setTimeout(autoScaleSimpleText, 10);
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
// MODÜL BAĞLANTILARI
// ==========================================
// 1. MG & 2. HT & 3. MS
bindText('mg-home-name', '.out-mg-home-name'); bindText('mg-away-name', '.out-mg-away-name');
bindText('mg-time', '.out-mg-time', false); bindText('mg-venue', '.out-mg-venue');
bindImage('mg-home-logo', 'out-mg-home-logo'); bindImage('mg-away-logo', 'out-mg-away-logo'); bindImage('mg-bg', 'bg-mac-gunu', true);

bindText('iy-home-name', '.out-iy-home-name'); bindText('iy-away-name', '.out-iy-away-name');
bindText('iy-home-score', '.out-iy-home-score', false); bindText('iy-away-score', '.out-iy-away-score', false);
bindImage('iy-home-logo', 'out-iy-home-logo'); bindImage('iy-away-logo', 'out-iy-away-logo'); bindImage('iy-bg', 'bg-ilk-yari', true);

bindText('ms-home-name', '.out-ms-home-name'); bindText('ms-away-name', '.out-ms-away-name');
bindText('ms-home-score', '.out-ms-home-score', false); bindText('ms-away-score', '.out-ms-away-score', false);
bindText('ms-home-scorers', '.out-ms-home-scorers', false, true); bindText('ms-away-scorers', '.out-ms-away-scorers', false, true);
bindImage('ms-home-logo', 'out-ms-home-logo'); bindImage('ms-away-logo', 'out-ms-away-logo'); bindImage('ms-bg', 'bg-mac-sonucu', true);

// 4. İSTATİSTİK
function bindStat(idHome, idAway, outHome, outAway, barHome, barAway, isPercent = false) {
    const iHome = document.getElementById(idHome); const iAway = document.getElementById(idAway);
    function updateStats() {
        const vHome = parseFloat(iHome.value) || 0; const vAway = parseFloat(iAway.value) || 0;
        const total = vHome + vAway; let pHome = 50, pAway = 50;
        if (total > 0) { pHome = (vHome / total) * 100; pAway = (vAway / total) * 100; }
        document.querySelector(outHome).innerText = vHome + (isPercent ? '%' : '');
        document.querySelector(outAway).innerText = vAway + (isPercent ? '%' : '');
        document.getElementById(barHome).style.width = pHome + '%'; document.getElementById(barAway).style.width = pAway + '%';
    }
    if(iHome && iAway) { iHome.addEventListener('input', updateStats); iAway.addEventListener('input', updateStats); updateStats(); }
}
bindStat('stat-pos-home', 'stat-pos-away', '.out-stat-pos-home', '.out-stat-pos-away', 'bar-pos-home', 'bar-pos-away', true);
bindStat('stat-shot-home', 'stat-shot-away', '.out-stat-shot-home', '.out-stat-shot-away', 'bar-shot-home', 'bar-shot-away');

// 5. İLK 11
bindImage('k-logo', 'out-k-logo'); bindImage('k-bg', 'bg-kadro', true); 
document.getElementById('k-lineup').addEventListener('input', function(e) {
    const listContainer = document.getElementById('out-k-lineup'); listContainer.innerHTML = ''; 
    const players = e.target.value.split('\n').map(p => p.trim()).filter(p => p !== '');
    players.slice(0, 11).forEach((player, index) => {
        const item = document.createElement('div'); item.className = 'kadro-item';
        item.innerHTML = `<span class="kadro-item-num">${index + 1}</span> ${player.toUpperCase()}`;
        listContainer.appendChild(item);
    });
});
document.getElementById('k-lineup').dispatchEvent(new Event('input'));

// 6. TRANSFER
bindText('tr-name', '.out-tr-name');
bindImage('tr-logo', 'out-tr-logo'); bindImage('tr-img', 'out-tr-img');
document.getElementById('tr-prob').addEventListener('input', function(e) {
    const val = parseInt(e.target.value);
    if(val === 0) {
        document.getElementById('tr-prob-container').style.display = 'none';
        document.getElementById('tr-done-container').style.display = 'block';
    } else {
        document.getElementById('tr-prob-container').style.display = 'block';
        document.getElementById('tr-done-container').style.display = 'none';
        document.getElementById('out-tr-bar').style.width = val + '%';
        document.querySelector('.out-tr-prob').innerText = '%' + val;
    }
});

// 7. QUOTE
bindText('qt-author', '.out-qt-author');
bindText('qt-text', '.out-qt-text', false); // büyük harf yapma
bindImage('qt-img', 'out-qt-img');

// 8. H2H
bindText('h2h-p1-name', '.out-h2h-p1-name'); bindText('h2h-p2-name', '.out-h2h-p2-name');
bindText('h2h-p1-stat', '.out-h2h-p1-stat', false); bindText('h2h-p2-stat', '.out-h2h-p2-stat', false);
bindImage('h2h-p1-img', 'out-h2h-p1-img'); bindImage('h2h-p2-img', 'out-h2h-p2-img');

// 9. STANDINGS
bindText('pd-t1-name', '.out-pd-t1-name'); bindText('pd-t1-pts', '.out-pd-t1-pts', false); bindImage('pd-t1-logo', 'out-pd-t1-logo');
bindText('pd-t2-name', '.out-pd-t2-name'); bindText('pd-t2-pts', '.out-pd-t2-pts', false); bindImage('pd-t2-logo', 'out-pd-t2-logo');
bindText('pd-t3-name', '.out-pd-t3-name'); bindText('pd-t3-pts', '.out-pd-t3-pts', false); bindImage('pd-t3-logo', 'out-pd-t3-logo');

// 10. REFEREE
bindText('ref-name', '.out-ref-name');
bindImage('ref-img', 'out-ref-img');
bindImage('ref-logo-home', 'out-ref-logo-home'); bindImage('ref-logo-away', 'out-ref-logo-away');

// ==========================================
// 💾 OTOMATİK KAYIT (AUTO-SAVE) SİSTEMİ 💾
// ==========================================
const savedData = JSON.parse(localStorage.getItem('skoragi_data')) || {};
document.querySelectorAll('input[type="text"], input[type="number"], textarea').forEach(el => {
    if (savedData[el.id] !== undefined) { el.value = savedData[el.id]; }
    el.addEventListener('input', () => {
        savedData[el.id] = el.value;
        localStorage.setItem('skoragi_data', JSON.stringify(savedData));
    });
});

window.addEventListener('load', () => {
    // Sayfa açıldığında tüm inputları tetikle ki UI güncellensin
    document.querySelectorAll('input[type="text"], input[type="number"], textarea').forEach(el => {
        el.dispatchEvent(new Event('input'));
    });
    autoScaleText(); setTimeout(autoScaleSimpleText, 100);
});

// HD İNDİRME MOTORU
function downloadTpl(elementId, fileName) {
    const captureArea = document.getElementById(elementId);
    const originalTransform = captureArea.style.transform;
    captureArea.style.transform = "scale(1)";
    html2canvas(captureArea, { scale: 3, backgroundColor: "#111", useCORS: true, allowTaint: true, logging: false }).then(canvas => {
        captureArea.style.transform = originalTransform;
        const imageURL = canvas.toDataURL("image/jpeg", 0.95);
        const downloadLink = document.createElement('a');
        downloadLink.href = imageURL; downloadLink.download = `skoragi-${fileName}.jpg`;
        document.body.appendChild(downloadLink); downloadLink.click(); document.body.removeChild(downloadLink);
    });
}
