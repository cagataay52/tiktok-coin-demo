// ==========================================
// 1. TEMA VE FİLİGRAN KONTROL MOTORU
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
if(btnWatermark) {
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
}

// ==========================================
// 2. GÜVENLİ METİN KÜÇÜLTME MOTORU
// ==========================================
function autoScaleText() {
    try {
        document.querySelectorAll('.auto-scale-text').forEach(el => {
            const parent = el.parentElement;
            if(!parent) return;

            let maxFont = 100; 
            if(el.classList.contains('team-name')) maxFont = 75; 
            if(el.classList.contains('out-sd-title')) maxFont = 65;
            if(parent.classList.contains('hw-name')) maxFont = 45; 
            if(el.classList.contains('out-mg-venue')) maxFont = 24; 
            if(el.classList.contains('pc-name')) maxFont = 26; 

            el.style.fontSize = maxFont + 'px';
            
            let loops = 0; 
            while ((el.scrollWidth > parent.clientWidth || el.scrollHeight > parent.clientHeight) && maxFont > 15 && loops < 100) {
                maxFont -= 1;
                el.style.fontSize = maxFont + 'px';
                loops++;
            }
        });
    } catch(e) { console.error("Metin küçültme hatası:", e); }
}

// ==========================================
// 3. BAĞLANTI (BINDING) FONKSİYONLARI 
// ==========================================
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

// 🚨 BÜTÜN KİLİTLENMELERİ VE MAVİLEŞME SORUNUNU ÇÖZEN GÖRSEL MOTORU 🚨
function bindImage(inputId, targetSelector, isBackground = false) {
    const input = document.getElementById(inputId);
    if (!input) return;

    // 1. ÇÖZÜM: Aynı fotoğrafı iki kez seçebilmek için input'u TIKLAMA anında sıfırla.
    // (Burası kilitlenmeyi önler)
    input.addEventListener('click', function(e) {
        e.target.value = ''; 
    });
    
    // 2. Fotoğraf seçildiğinde hatasız oku ve bas
    input.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        // 3. ÇÖZÜM: Mavileşme sorununu çözen eski teknolojiye (FileReader) geri döndük
        const reader = new FileReader();
        reader.onload = function(event) {
            const result = event.target.result;
            
            // İlk 11 logosunu hafızaya al
            if (inputId === 'k-logo') window.kLogoCached = result;

            // Fotoğrafı şablona bas
            document.querySelectorAll(targetSelector).forEach(el => {
                if (isBackground) {
                    el.style.backgroundImage = `url('${result}')`;
                } else {
                    el.src = result;
                }
            });
            
            // İlk 11 logosu güncellendiyse dizilimi tetikle
            if (inputId === 'k-logo') {
                const lineupInput = document.getElementById('k-lineup');
                if (lineupInput) {
                    lineupInput.dispatchEvent(new Event('input'));
                }
            }
        };

        // Dosyayı Base64 olarak okut
        reader.readAsDataURL(file);
    });
}

// ==========================================
// 4. BÜTÜN MODÜLLERİN VERİ BAĞLANTILARI (1-17)
// ==========================================

// MODÜL 1, 2, 3
bindText('mg-home-name', '.out-mg-home-name'); bindText('mg-away-name', '.out-mg-away-name');
bindText('mg-time', '.out-mg-time', false); bindText('mg-venue', '.out-mg-venue');
bindImage('mg-home-logo', '.out-mg-home-logo'); bindImage('mg-away-logo', '.out-mg-away-logo'); bindImage('mg-bg', '.out-mg-bg', true);

bindText('iy-home-name', '.out-iy-home-name'); bindText('iy-away-name', '.out-iy-away-name');
bindText('iy-home-score', '.out-iy-home-score', false); bindText('iy-away-score', '.out-iy-away-score', false);
bindImage('iy-home-logo', '.out-iy-home-logo'); bindImage('iy-away-logo', '.out-iy-away-logo'); bindImage('iy-bg', '.out-iy-bg', true);

bindText('ms-home-name', '.out-ms-home-name'); bindText('ms-away-name', '.out-ms-away-name');
bindText('ms-home-score', '.out-ms-home-score', false); bindText('ms-away-score', '.out-ms-away-score', false);
bindText('ms-home-scorers', '.out-ms-home-scorers', false, true); bindText('ms-away-scorers', '.out-ms-away-scorers', false, true);
bindImage('ms-home-logo', '.out-ms-home-logo'); bindImage('ms-away-logo', '.out-ms-away-logo'); bindImage('ms-bg', '.out-ms-bg', true);

// MODÜL 4: İSTATİSTİK
bindImage('stat-home-logo', '.out-stat-home-logo'); bindImage('stat-away-logo', '.out-stat-away-logo'); bindImage('stat-bg', '.out-stat-bg', true);
function bindStat(idHome, idAway, outHome, outAway, barHome, barAway, isPercent = false) {
    const iHome = document.getElementById(idHome); const iAway = document.getElementById(idAway);
    function updateStats() {
        const vHome = parseFloat(iHome ? iHome.value : 0) || 0; 
        const vAway = parseFloat(iAway ? iAway.value : 0) || 0;
        const total = vHome + vAway; let pHome = 50, pAway = 50;
        if (total > 0) { pHome = (vHome / total) * 100; pAway = (vAway / total) * 100; }
        
        const oHome = document.querySelector(outHome); const oAway = document.querySelector(outAway);
        if(oHome) oHome.innerText = vHome + (isPercent ? '%' : '');
        if(oAway) oAway.innerText = vAway + (isPercent ? '%' : '');
        
        const bHome = document.getElementById(barHome);
        if(bHome) bHome.style.width = pHome + '%'; 
    }
    if(iHome && iAway) { iHome.addEventListener('input', updateStats); iAway.addEventListener('input', updateStats); updateStats(); }
}
bindStat('stat-pos-home', 'stat-pos-away', '.out-stat-pos-home', '.out-stat-pos-away', 'bar-pos-home', null, true);
bindStat('stat-shot-home', 'stat-shot-away', '.out-stat-shot-home', '.out-stat-shot-away', 'bar-shot-home', null);
bindStat('stat-cor-home', 'stat-cor-away', '.out-stat-cor-home', '.out-stat-cor-away', 'bar-cor-home', null);
bindStat('stat-foul-home', 'stat-foul-away', '.out-stat-foul-home', '.out-stat-foul-away', 'bar-foul-home', null);

// MODÜL 5: İLK 11
window.kLogoCached = "https://media.api-sports.io/football/teams/9.png"; 
bindImage('k-logo', '.out-k-main-logo'); bindImage('k-bg', '.out-k-bg', true); 
const positions433 = ['GK', 'RB', 'CB', 'CB', 'LB', 'CDM', 'CM', 'CM', 'RW', 'ST', 'LW'];
const layout433 = [[8, 9, 10], [5, 6, 7], [1, 2, 3, 4], [0]]; 

const kLineupInput = document.getElementById('k-lineup');
if(kLineupInput) {
    kLineupInput.addEventListener('input', function(e) {
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
                        <div class="pc-logo-container"><img src="${window.kLogoCached}" class="out-k-logo"></div>
                        <div class="name-box"><span class="pc-name auto-scale-text">${players[index].toUpperCase()}</span></div>
                        <div class="pc-meta"><b>${index + 1}</b> ${pos}</div>
                    `;
                    rowDiv.appendChild(card);
                }
            });
            if(rowDiv.children.length > 0) pitch.appendChild(rowDiv);
        });
        setTimeout(autoScaleText, 50);
    });
}

// MODÜL 6-16
bindText('tr-name', '.out-tr-name'); bindImage('tr-logo', '.out-tr-logo'); bindImage('tr-img', '.out-tr-img');
const trProbInput = document.getElementById('tr-prob');
if (trProbInput) {
    trProbInput.addEventListener('input', function(e) {
        const val = parseInt(e.target.value) || 0;
        const probC = document.getElementById('tr-prob-container');
        const doneC = document.getElementById('tr-done-container');
        if(probC && doneC) {
            if(val === 0) { probC.style.display = 'none'; doneC.style.display = 'inline-block'; } 
            else { probC.style.display = 'block'; doneC.style.display = 'none'; document.getElementById('out-tr-bar').style.width = val + '%'; document.querySelector('.out-tr-prob').innerText = '%' + val; }
        }
    });
}

bindText('qt-author', '.out-qt-author'); bindText('qt-text', '.out-qt-text', false); bindImage('qt-img', '.out-qt-img');
bindText('h2h-p1-name', '.out-h2h-p1-name'); bindText('h2h-p2-name', '.out-h2h-p2-name'); bindText('h2h-p1-stat', '.out-h2h-p1-stat', false); bindText('h2h-p2-stat', '.out-h2h-p2-stat', false); bindImage('h2h-p1-img', '.out-h2h-p1-img'); bindImage('h2h-p2-img', '.out-h2h-p2-img');
bindText('pd-t1-name', '.out-pd-t1-name'); bindText('pd-t1-pts', '.out-pd-t1-pts', false); bindImage('pd-t1-logo', '.out-pd-t1-logo');
bindText('pd-t2-name', '.out-pd-t2-name'); bindText('pd-t2-pts', '.out-pd-t2-pts', false); bindImage('pd-t2-logo', '.out-pd-t2-logo');
bindText('pd-t3-name', '.out-pd-t3-name'); bindText('pd-t3-pts', '.out-pd-t3-pts', false); bindImage('pd-t3-logo', '.out-pd-t3-logo');
bindText('ref-name', '.out-ref-name'); bindImage('ref-img', '.out-ref-img'); bindImage('ref-logo-home', '.out-ref-logo-home'); bindImage('ref-logo-away', '.out-ref-logo-away');
bindText('sd-news-title', '.out-sd-title', false, true); bindImage('sd-player-img', '.out-sd-player'); bindImage('sd-bg', '.out-sd-bg', true);
bindText('r-player-name', '.out-r-name'); bindImage('r-player-img', '.out-r-player'); bindImage('r-bg', '.out-r-bg', true);
bindText('motm-name', '.out-motm-name'); bindImage('motm-img', '.out-motm-img'); bindImage('motm-logo', '.out-motm-logo');
bindText('motm-s1-lbl', '.out-motm-s1-lbl'); bindText('motm-s1-val', '.out-motm-s1-val', false);
bindText('motm-s2-lbl', '.out-motm-s2-lbl'); bindText('motm-s2-val', '.out-motm-s2-val', false);
bindText('motm-s3-lbl', '.out-motm-s3-lbl'); bindText('motm-s3-val', '.out-motm-s3-val', false);
bindText('mil-name', '.out-mil-name'); bindText('mil-num', '.out-mil-num', false); bindText('mil-text', '.out-mil-text'); bindImage('mil-img', '.out-mil-img');
bindImage('fix-img', '.out-fix-img');
bindImage('fix1-logo', '.out-fix1-logo'); bindText('fix1-date', '.out-fix1-date'); bindText('fix1-tour', '.out-fix1-tour');
bindImage('fix2-logo', '.out-fix2-logo'); bindText('fix2-date', '.out-fix2-date'); bindText('fix2-tour', '.out-fix2-tour');
bindImage('fix3-logo', '.out-fix3-logo'); bindText('fix3-date', '.out-fix3-date'); bindText('fix3-tour', '.out-fix3-tour');
bindText('hlt-name', '.out-hlt-name'); bindImage('hlt-img', '.out-hlt-img'); bindText('hlt-type', '.out-hlt-type'); bindText('hlt-date', '.out-hlt-date');

// MODÜL 17: HAFTANIN MAÇLARI
bindText('hw-title-input', '.out-hw-title');
bindImage('hw-bg', '#bg-hw', true);
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
                if (i <= count) { inGroup.style.display = 'block'; outRow.style.display = 'grid'; } 
                else { inGroup.style.display = 'none'; outRow.style.display = 'none'; }
            }
        }
    });
}

// ==========================================
// 5. OTOMATİK KAYIT
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
// 6. GÜVENLİ FİZİKSEL RENDER İNDİRME MOTORU
// ==========================================
function downloadTpl(elementId, fileName) {
    const card = document.getElementById(elementId);
    const wrapper = card.parentElement;
    const btn = event.target;
    const originalBtnText = btn.innerText;
    
    btn.innerText = "İNDİRİLİYOR...";
    btn.style.backgroundColor = "#555";

    const originalTransform = card.style.transform;

    const renderRoom = document.createElement('div');
    renderRoom.style.position = 'fixed';
    renderRoom.style.top = '0';
    renderRoom.style.left = '-15000px'; 
    renderRoom.style.width = '1080px';
    renderRoom.style.height = elementId === 'tpl-reels' ? '1920px' : '1350px';
    renderRoom.style.backgroundColor = '#020202'; 
    document.body.appendChild(renderRoom);

    card.style.transform = 'none';
    renderRoom.appendChild(card);

    setTimeout(() => {
        html2canvas(card, { 
            scale: 2, 
            backgroundColor: null, 
            useCORS: true, 
            logging: false 
        }).then(canvas => {
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
            alert("İndirme başarısız oldu. Lütfen sayfayı yenileyin.");
            wrapper.appendChild(card);
            card.style.transform = originalTransform;
            document.body.removeChild(renderRoom);
            btn.innerText = originalBtnText;
            btn.style.backgroundColor = "";
        });
    }, 500); 
}
