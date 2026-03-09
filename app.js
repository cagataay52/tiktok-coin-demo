// ==========================================
// 1. OTOMATİK API MOTORU (SÜPER LİG FİKSTÜRÜ)
// ==========================================
const API_KEY = "387077a621a58f5c5cde81cb20db5721"; 
let allMatches = []; // Verileri hafızada tutmak için

// 1. Aşama: Süper Lig Maçlarını Yükle
document.getElementById('btn-load-fixtures').addEventListener('click', () => {
    const btn = document.getElementById('btn-load-fixtures');
    btn.innerText = "YÜKLENİYOR...";
    btn.style.backgroundColor = "#555";

    // API-Sports: Süper Lig (ID: 203) - 2025/2026 Sezonu İstediği
    fetch(`https://v3.football.api-sports.io/fixtures?league=203&season=2025`, {
        method: "GET",
        headers: {
            "x-rapidapi-host": "v3.football.api-sports.io",
            "x-rapidapi-key": API_KEY
        }
    })
    .then(response => response.json())
    .then(data => {
        if (!data.response || data.response.length === 0) {
            alert("Veri çekilemedi. API anahtarınızı kontrol edin.");
            btn.innerText = "1. MAÇLARI YÜKLE";
            btn.style.backgroundColor = "#111";
            return;
        }

        allMatches = data.response;
        const select = document.getElementById('select-match');
        select.innerHTML = '<option value="">Maç Seçin...</option>';

        // Maçları tarihe göre sırala (En yakın tarihliler üstte olsun diye tersten sıralıyoruz)
        allMatches.sort((a, b) => new Date(b.fixture.date) - new Date(a.fixture.date));

        allMatches.forEach(match => {
            const home = match.teams.home.name;
            const away = match.teams.away.name;
            const dateObj = new Date(match.fixture.date);
            const dateStr = dateObj.toLocaleDateString('tr-TR');
            const timeStr = dateObj.toLocaleTimeString('tr-TR', {hour: '2-digit', minute:'2-digit'});
            const status = match.fixture.status.short;
            
            // Eğer maç bitmişse (FT) skoru göster, bitmediyse saati göster
            const scoreOrTime = (status === 'FT' || status === 'PEN') 
                ? `${match.goals.home} - ${match.goals.away}` 
                : timeStr;

            const option = document.createElement('option');
            option.value = match.fixture.id;
            option.innerText = `${dateStr} | ${home} vs ${away} (${scoreOrTime})`;
            select.appendChild(option);
        });

        // Butonu yeşil yap ve diğer menüleri görünür hale getir
        btn.innerText = "FİKSTÜR GÜNCELLENDİ ✔";
        btn.style.backgroundColor = "#28a745";
        
        document.getElementById('select-match').style.display = "block";
        document.getElementById('btn-apply-match').style.display = "block";
    })
    .catch(error => {
        console.error("Hata:", error);
        alert("Bağlantı Hatası! Lütfen internetinizi kontrol edin.");
        btn.innerText = "1. MAÇLARI YÜKLE";
    });
});

// 2. Aşama: Seçilen Maçı Şablonlara Aktar
document.getElementById('btn-apply-match').addEventListener('click', () => {
    const matchId = document.getElementById('select-match').value;
    
    if(!matchId) {
        alert("Lütfen listeden bir maç seçin!");
        return;
    }

    // Seçilen maçı hafızadaki listeden bul (Tekrar API'ye gitmiyoruz!)
    const match = allMatches.find(m => m.fixture.id == matchId);
    if(!match) return;

    // Temel veriler
    const homeTeam = match.teams.home;
    const awayTeam = match.teams.away;
    const goals = match.goals;
    
    // Saat ve Stadyum
    const matchTime = new Date(match.fixture.date).toLocaleTimeString('tr-TR', {hour: '2-digit', minute:'2-digit'});
    const matchVenue = match.fixture.venue.name || "Stadyum Belirsiz";

    // Paneldeki input kutularını doldur
    document.getElementById('inp-home-name').value = homeTeam.name.toUpperCase();
    document.getElementById('inp-away-name').value = awayTeam.name.toUpperCase();
    document.getElementById('inp-home-score').value = goals.home !== null ? goals.home : 0;
    document.getElementById('inp-away-score').value = goals.away !== null ? goals.away : 0;

    // Saat ve Stadyumu doğrudan HTML'e yaz
    document.querySelectorAll('.out-match-time').forEach(el => el.innerText = matchTime);
    document.querySelectorAll('.out-match-venue').forEach(el => el.innerText = matchVenue.toUpperCase());

    // Inputları tetikle ki şablondaki yazılar anında güncellensin
    inputs.forEach(input => {
        const el = document.getElementById(input.id);
        if(el) {
            el.dispatchEvent(new Event('input'));
        }
    });

    // Logoları HTML'e yaz
    document.querySelectorAll('.out-home-logo').forEach(img => img.src = homeTeam.logo);
    document.querySelectorAll('.out-away-logo').forEach(img => img.src = awayTeam.logo);
    
    // Aktarma butonunu yeşil yakıp söndür
    const btnApply = document.getElementById('btn-apply-match');
    btnApply.innerText = "AKTARILDI ✔";
    btnApply.style.backgroundColor = "#28a745";
    setTimeout(() => { 
        btnApply.innerText = "2. ŞABLONA AKTAR"; 
        btnApply.style.backgroundColor = "#FF5722"; 
    }, 2000);
});

// ==========================================
// 2. MANUEL GİRİŞLERİ ŞABLONA DAĞITMA
// ==========================================
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
        const value = input.id === 'inp-news-title' ? e.target.value : e.target.value.toUpperCase();
        const targets = document.querySelectorAll(input.targetClasses);
        targets.forEach(target => {
            target.innerHTML = value.replace(/\n/g, '<br>');
        });
    });
});

// ==========================================
// 3. FOTOĞRAF YÜKLEME VE İNDİRME İŞLEMLERİ
// ==========================================
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

document.getElementById('upload-player').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            document.getElementById('sd-player-img').src = event.target.result;
            document.querySelector('.ts-img img').src = event.target.result;
            document.getElementById('reels-player-img').src = event.target.result;
        }
        reader.readAsDataURL(file);
    }
});

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
