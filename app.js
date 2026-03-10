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
// 🌟 GÜVENLİ METİN KÜÇÜLTME MOTORU (ZIRHLARI KIRMAZ) 🌟
// ==========================================
function autoScaleText() {
    // Cam panelleri kırmaması için başlangıç boyutu optimal seviyeye çekildi
    document.querySelectorAll('.auto-scale-text').forEach(el => {
        let maxFont = 100; // Başlangıç
        if(el.classList.contains('team-name')) maxFont = 55;
        if(el.classList.contains('quote-text')) maxFont = 60;
        if(el.classList.contains('out-mg-venue')) maxFont = 32;
        if(el.classList.contains('out-h2h-p1-name')) maxFont = 50;
        if(el.classList.contains('pc-name')) maxFont = 26; // İlk 11

        el.style.fontSize = maxFont + 'px';
        
        // Taştığı sürece yazıyı piksel piksel küçült
        while ((el.scrollWidth > el.parentElement.clientWidth || el.scrollHeight > el.parentElement.clientHeight) && maxFont > 15) {
            maxFont -= 1;
            el.style.fontSize = maxFont + 'px';
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
        setTimeout(autoScaleText, 10);
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

// BAĞLANTILAR
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

// ==========================================
// 🌟 İLK 11 (GERÇEK 4-3-3 SAHA DİZİLİM MANTIĞI) 🌟
// ==========================================
bindImage('k-logo', '.out-k-logo'); bindImage('k-bg', 'bg-kadro', true); 
const positions433 = ['GK', 'RB', 'CB', 'CB', 'LB', 'CDM', 'CM', 'CM', 'RW', 'ST', 'LW'];
// Taktik sıralaması: ATT(3), MID(3), DEF(4), GK(1)
const layout433 = [[8, 9, 10], [5, 6, 7], [1, 2, 3, 4], [0]];

document.getElementById('k-lineup').addEventListener('input', function(e) {
    const pitch = document.getElementById('out-k-lineup-pitch'); 
    if(!pitch) return;
    pitch.innerHTML = ''; 
    
    const players = e.target.value.split('\n').map(p => p.trim()).filter(p => p !== '');
    
    layout433.forEach(rowIndices => {
        const rowDiv = document.createElement('div');
        rowDiv.className = 'kadro-row';
        rowIndices.forEach(index => {
            if(players[index]) {
                const pos = positions433[index];
                const isPrimary = (index === 0 || index > 7); 
                const card = document.createElement('div'); 
                card.className = `glass-panel player-card-vertical ${isPrimary ? 'neon-border' : ''}`;
                card.innerHTML = `
                    <div class="pc-logo-container"><img src="https://creazilla-store.fra1.digitaloceanspaces.com/cliparts/3133642/soccer-player-clipart-xl.png"></div>
                    <div class="name-box"><span class="pc-name auto-scale-text">${players[index].toUpperCase()}</span></div>
                    <div class="pc-meta"><b>${index + 1}</b> ${pos}</div>
                `;
                rowDiv.appendChild(card);
            }
        });
        if(rowDiv.children.length > 0) pitch.appendChild(rowDiv);
    });
    setTimeout(autoScaleText, 10);
});


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

bindText('qt-author', '.out-qt-author'); bindText('qt-text', '.out-qt-text', false); bindImage('qt-img', '.out-qt-img');
bindText('h2h-p1-name', '.out-h2h-p1-name'); bindText('h2h-p2-name', '.out-h2h-p2-name'); bindText('h2h-p1-stat', '.out-h2h-p1-stat', false); bindText('h2h-p2-stat', '.out-h2h-p2-stat', false); bindImage('h2h-p1-img', '.out-h2h-p1-img'); bindImage('h2h-p2-img', '.out-h2h-p2-img');
bindText('pd-t1-name', '.out-pd-t1-name'); bindText('pd-t1-pts', '.out-pd-t1-pts', false); bindImage('pd-t1-logo', '.out-pd-t1-logo');
bindText('pd-t2-name', '.out-pd-t2-name'); bindText('pd-t2-pts', '.out-pd-t2-pts', false); bindImage('pd-t2-logo', '.out-pd-t2-logo');
bindText('pd-t3-name', '.out-pd-t3-name'); bindText('pd-t3-pts', '.out-pd-t3-pts', false); bindImage('pd-t3-logo', '.out-pd-t3-logo');

bindText('hw-title-input', '.out-hw-title');
for(let i=1; i<=6; i++) {
    bindText(`hw-m${i}-home`, `.out-hw-m${i}-home`); bindText(`hw-m${i}-score`, `.out-hw-m${i}-score`, false); bindText(`hw-m${i}-away`, `.out-hw-m${i}-away`); bindImage(`hw-m${i}-hlogo`, `.out-hw-m${i}-hlogo`); bindImage(`hw-m${i}-alogo`, `.out-hw-m${i}-alogo`);
}
const hwCountInput = document.getElementById('hw-match-count');
if (hwCountInput) {
    hwCountInput.addEventListener('input', function(e) {
        let count = parseInt(e.target.value) || 5;
        if (count > 6) count = 6; if (count < 1) count = 1;
        for(let i=1; i<=6; i++) {
            const inGroup = document.getElementById('hw-in-' + i); const outRow = document.getElementById('hw-out-' + i);
            if (inGroup && outRow) {
                if (i <= count) { inGroup.style.display = 'block'; outRow.style.display = 'flex'; } 
                else { inGroup.style.display = 'none'; outRow.style.display = 'none'; }
            }
        }
    });
}

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
    setTimeout(autoScaleText, 200);
    
    const savedTheme = localStorage.getItem('skoragi_theme') || 'default';
    if (savedTheme !== 'default') {
        document.body.classList.add(`theme-${savedTheme}`);
        document.querySelector(`[data-theme="${savedTheme}"]`).classList.add('active');
        document.querySelector(`[data-theme="default"]`).classList.remove('active');
    }
});

// ==========================================
// 🌟 GÜVENLİ İNDİRME MOTORU (KAYMA VE BOZULMA ENGELLENDİ) 🌟
// ==========================================
function downloadTpl(elementId, fileName) {
    const card = document.getElementById(elementId);
    const wrapper = card.parentElement;
    const btn = event.target;
    const originalBtnText = btn.innerText;
    
    btn.innerText = "İNDİRİLİYOR...";
    btn.style.backgroundColor = "#555";

    const originalTransform = card.style.transform;

    // 1. html2canvas'ın şaşırmaması için görünmez bir devasa fiziksel oda yaratıyoruz
    const renderRoom = document.createElement('div');
    renderRoom.style.position = 'fixed';
    renderRoom.style.top = '0';
    renderRoom.style.left = '0';
    renderRoom.style.width = '1080px';
    renderRoom.style.height = elementId === 'tpl-reels' ? '1920px' : '1350px';
    renderRoom.style.opacity = '0'; // Kullanıcı görmez
    renderRoom.style.pointerEvents = 'none';
    renderRoom.style.zIndex = '-9999';
    document.body.appendChild(renderRoom);

    // 2. Kartı stüdyodan alıp bu odaya tam boyutuyla koyuyoruz (Esnek kutular milim oynamaz)
    card.style.transform = 'none';
    renderRoom.appendChild(card);

    // 3. Tarayıcıya yeni düzeni çizmesi için zaman veriyoruz
    setTimeout(() => {
        html2canvas(card, { 
            scale: 2, // Sosyal Medya için 2160x2700 HD Çözünürlük
            backgroundColor: "#050505", 
            useCORS: true, 
            logging: false 
        }).then(canvas => {
            // 4. Kartı stüdyodaki küçük yerine geri koy
            wrapper.appendChild(card);
            card.style.transform = originalTransform;
            document.body.removeChild(renderRoom);
            
            const imageURL = canvas.toDataURL("image/jpeg", 0.95);
            const downloadLink = document.createElement('a');
            downloadLink.href = imageURL; 
            downloadLink.download = `skoragi-${fileName}.jpg`;
            downloadLink.click(); 

            btn.innerText = originalBtnText;
            btn.style.backgroundColor = "";
        }).catch(err => {
            console.error("İndirme Hatası:", err);
            wrapper.appendChild(card);
            card.style.transform = originalTransform;
            document.body.removeChild(renderRoom);
            btn.innerText = originalBtnText;
            btn.style.backgroundColor = "";
        });
    }, 500); // 0.5 saniye bekle
}
