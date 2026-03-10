// ==========================================
// TEMA VE FİLİGRAN KONTROL MOTORU
// ==========================================
const themeBtns = document.querySelectorAll('.ts-btn:not(#btn-watermark)');
themeBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        const theme = e.target.getAttribute('data-theme');
        document.body.className = document.body.className.replace(/theme-\w+/g, '').trim();
        if(theme !== 'default') document.body.classList.add(`theme-${theme}`);
        
        themeBtns.forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        localStorage.setItem('skoragi_theme', theme);
    });
});

const btnWatermark = document.getElementById('btn-watermark');
btnWatermark.addEventListener('click', () => {
    document.body.classList.toggle('watermark-on');
    if(document.body.classList.contains('watermark-on')) {
        btnWatermark.innerText = "🛡️ FİLİGRAN: AÇIK";
        btnWatermark.style.background = "#ff003c";
        localStorage.setItem('skoragi_wm', 'on');
    } else {
        btnWatermark.innerText = "🛡️ FİLİGRAN: KAPALI";
        btnWatermark.style.background = "#2a0000";
        localStorage.setItem('skoragi_wm', 'off');
    }
});

// ==========================================
// YARDIMCI FONKSİYONLAR
// ==========================================
function autoScaleText() {
    document.querySelectorAll('.auto-scale').forEach(el => {
        let fontSize = 45; 
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
                    document.querySelectorAll(targetIdOrClass).forEach(el => {
                        if (isBackground) el.style.backgroundImage = `url('${event.target.result}')`;
                        else el.src = event.target.result;
                    });
                } else {
                    const el = document.getElementById(targetIdOrClass);
                    if (el) {
                        if (isBackground) el.style.backgroundImage = `url('${event.target.result}')`;
                        else el.src = event.target.result;
                    }
                }
            }
            reader.readAsDataURL(file);
        }
    });
}

// 1, 2, 3. MG, HT, MS
bindText('mg-home-name', '.out-mg-home-name'); bindText('mg-away-name', '.out-mg-away-name');
bindText('mg-time', '.out-mg-time', false); bindText('mg-venue', '.out-mg-venue');
bindImage('mg-home-logo', '.out-mg-home-logo'); bindImage('mg-away-logo', '.out-mg-away-logo'); bindImage('mg-bg', 'bg-mac-gunu', true);

bindText('iy-home-name', '.out-iy-home-name'); bindText('iy-away-name', '.out-iy-away-name');
bindText('iy-home-score', '.out-iy-home-score', false); bindText('iy-away-score', '.out-iy-away-score', false);
bindImage('iy-home-logo', '.out-iy-home-logo'); bindImage('iy-away-logo', '.out-iy-away-logo'); bindImage('iy-bg', 'bg-ilk-yari', true);

bindText('ms-home-name', '.out-ms-home-name'); bindText('ms-away-name', '.out-ms-away-name');
bindText('ms-home-score', '.out-ms-home-score', false); bindText('ms-away-score', '.out-ms-away-score', false);
bindText('ms-home-scorers', '.out-ms-home-scorers', false, true); bindText('ms-away-scorers', '.out-ms-away-scorers', false, true);
bindImage('ms-home-logo', '.out-ms-home-logo'); bindImage('ms-away-logo', '.out-ms-away-logo'); bindImage('ms-bg', 'bg-mac-sonucu', true);

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
bindStat('stat-cor-home', 'stat-cor-away', '.out-stat-cor-home', '.out-stat-cor-away', 'bar-cor-home', 'bar-cor-away');
bindStat('stat-foul-home', 'stat-foul-away', '.out-stat-foul-home', '.out-stat-foul-away', 'bar-foul-home', 'bar-foul-away');

// 5. İLK 11
bindImage('k-logo', '.out-k-logo'); bindImage('k-bg', 'bg-kadro', true); 
document.getElementById('k-lineup').addEventListener('input', function(e) {
    const listContainer = document.getElementById('out-k-lineup'); listContainer.innerHTML = ''; 
    const players = e.target.value.split('\n').map(p => p.trim()).filter(p => p !== '');
    players.slice(0, 11).forEach((player, index) => {
        const item = document.createElement('div'); item.className = 'kadro-item';
        item.innerHTML = `<span class="kadro-item-num">${index + 1}</span> ${player.toUpperCase()}`;
        listContainer.appendChild(item);
    });
});

// 6. TRANSFER
bindText('tr-name', '.out-tr-name'); bindImage('tr-logo', '.out-tr-logo'); bindImage('tr-img', '.out-tr-img');
const trProbInput = document.getElementById('tr-prob');
if (trProbInput) {
    trProbInput.addEventListener('input', function(e) {
        const val = parseInt(e.target.value) || 0;
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
}

// 7-12 Modülleri
bindText('qt-author', '.out-qt-author'); bindText('qt-text', '.out-qt-text', false); bindImage('qt-img', '.out-qt-img');
bindText('h2h-p1-name', '.out-h2h-p1-name'); bindText('h2h-p2-name', '.out-h2h-p2-name'); bindText('h2h-p1-stat', '.out-h2h-p1-stat', false); bindText('h2h-p2-stat', '.out-h2h-p2-stat', false); bindImage('h2h-p1-img', '.out-h2h-p1-img'); bindImage('h2h-p2-img', '.out-h2h-p2-img');
bindText('pd-t1-name', '.out-pd-t1-name'); bindText('pd-t1-pts', '.out-pd-t1-pts', false); bindImage('pd-t1-logo', '.out-pd-t1-logo');
bindText('pd-t2-name', '.out-pd-t2-name'); bindText('pd-t2-pts', '.out-pd-t2-pts', false); bindImage('pd-t2-logo', '.out-pd-t2-logo');
bindText('pd-t3-name', '.out-pd-t3-name'); bindText('pd-t3-pts', '.out-pd-t3-pts', false); bindImage('pd-t3-logo', '.out-pd-t3-logo');
bindText('ref-name', '.out-ref-name'); bindImage('ref-img', '.out-ref-img'); bindImage('ref-logo-home', '.out-ref-logo-home'); bindImage('ref-logo-away', '.out-ref-logo-away');
bindText('sd-news-title', '.out-sd-title', false, true); bindImage('sd-player-img', '.out-sd-player'); bindImage('sd-bg', 'bg-sondakika', true);
bindText('r-player-name', '.out-r-name'); bindImage('r-player-img', '.out-r-player'); bindImage('r-bg', 'bg-reels', true);

// 13. MOTM
bindText('motm-name', '.out-motm-name'); bindImage('motm-img', '.out-motm-img'); bindImage('motm-logo', '.out-motm-logo');
bindText('motm-s1-lbl', '.out-motm-s1-lbl'); bindText('motm-s1-val', '.out-motm-s1-val', false);
bindText('motm-s2-lbl', '.out-motm-s2-lbl'); bindText('motm-s2-val', '.out-motm-s2-val', false);

// 14. MILESTONE
bindText('mil-name', '.out-mil-name'); bindText('mil-num', '.out-mil-num', false); bindText('mil-text', '.out-mil-text'); bindImage('mil-img', '.out-mil-img');

// 15. FIXTURE
bindImage('fix-img', '.out-fix-img');
bindImage('fix1-logo', '.out-fix1-logo'); bindText('fix1-date', '.out-fix1-date'); bindText('fix1-tour', '.out-fix1-tour');
bindImage('fix2-logo', '.out-fix2-logo'); bindText('fix2-date', '.out-fix2-date'); bindText('fix2-tour', '.out-fix2-tour');
bindImage('fix3-logo', '.out-fix3-logo'); bindText('fix3-date', '.out-fix3-date'); bindText('fix3-tour', '.out-fix3-tour');

// 16. HEALTH
bindText('hlt-name', '.out-hlt-name'); bindImage('hlt-img', '.out-hlt-img'); bindText('hlt-type', '.out-hlt-type'); bindText('hlt-date', '.out-hlt-date');

// ==========================================
// 💾 OTOMATİK KAYIT VE AYAR YÜKLEME 💾
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
    document.querySelectorAll('input[type="text"], input[type="number"], textarea').forEach(el => { el.dispatchEvent(new Event('input')); });
    autoScaleText(); setTimeout(autoScaleSimpleText, 100);
    
    // Temayı Yükle
    const savedTheme = localStorage.getItem('skoragi_theme') || 'default';
    if (savedTheme !== 'default') {
        document.body.classList.add(`theme-${savedTheme}`);
        document.querySelector(`[data-theme="${savedTheme}"]`).classList.add('active');
        document.querySelector(`[data-theme="default"]`).classList.remove('active');
    }
    
    // Filigranı Yükle
    if (localStorage.getItem('skoragi_wm') === 'on') {
        document.body.classList.add('watermark-on');
        btnWatermark.innerText = "🛡️ FİLİGRAN: AÇIK";
        btnWatermark.style.background = "#ff003c";
    }
});

// ==========================================
// 🌟 KUSURSUZ VE KAYMASIZ HD İNDİRME MOTORU 🌟
// ==========================================
function downloadTpl(elementId, fileName) {
    const captureArea = document.getElementById(elementId);
    
    const btn = event.target;
    const originalBtnText = btn.innerText;
    btn.innerText = "İNDİRİLİYOR...";
    btn.style.backgroundColor = "#555";

    const originalTransform = captureArea.style.transform;
    const originalPosition = captureArea.style.position;
    const originalTop = captureArea.style.top;
    const originalLeft = captureArea.style.left;
    const originalZIndex = captureArea.style.zIndex;

    // Gizli Çekim Modu (Kartı ekrandan kopar, ezilmesini önle, düz çek)
    captureArea.style.transform = "none"; 
    captureArea.style.position = "fixed";
    captureArea.style.top = "0px";
    captureArea.style.left = "0px";
    captureArea.style.zIndex = "-9999"; 

    setTimeout(() => {
        html2canvas(captureArea, { 
            scale: 2, 
            backgroundColor: "#000", 
            useCORS: true, 
            logging: false 
        }).then(canvas => {
            // Çekim bitti, eski yerine koy
            captureArea.style.transform = originalTransform;
            captureArea.style.position = originalPosition;
            captureArea.style.top = originalTop;
            captureArea.style.left = originalLeft;
            captureArea.style.zIndex = originalZIndex;
            
            const imageURL = canvas.toDataURL("image/jpeg", 0.95);
            const downloadLink = document.createElement('a');
            downloadLink.href = imageURL; 
            downloadLink.download = `skoragi-${fileName}.jpg`;
            document.body.appendChild(downloadLink); 
            downloadLink.click(); 
            document.body.removeChild(downloadLink);

            btn.innerText = originalBtnText;
            btn.style.backgroundColor = "";
        }).catch(err => {
            console.error("İndirme Hatası:", err);
            alert("İndirme sırasında hata oluştu. Sayfayı yenileyin.");
            captureArea.style.transform = originalTransform;
            captureArea.style.position = originalPosition;
            captureArea.style.top = originalTop;
            captureArea.style.left = originalLeft;
            captureArea.style.zIndex = originalZIndex;
            btn.innerText = originalBtnText;
            btn.style.backgroundColor = "";
        });
    }, 400); 
}
