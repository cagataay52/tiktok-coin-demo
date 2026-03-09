// ==========================================
// 1. API-SPORTS BAĞLANTISI VE VERİ ÇEKME
// ==========================================
// BURAYA KENDİ API-SPORTS ANAHTARINI YAPIŞTIRACAKSIN
const API_KEY = "04db3f3ab39909d9196da5c859dcd046"; 

document.getElementById('btn-fetch-api').addEventListener('click', () => {
    const matchId = document.getElementById('inp-match-id').value;
    const btn = document.getElementById('btn-fetch-api');
    
    if(!matchId) {
        alert("Lütfen bir Maç ID girin!");
        return;
    }

    // Butonu yükleniyor durumuna al
    btn.innerText = "YÜKLENİYOR...";
    btn.style.backgroundColor = "#888";

    // API'ye İstek At
    fetch(`https://v3.football.api-sports.io/fixtures?id=${matchId}`, {
        method: "GET",
        headers: {
            "x-rapidapi-host": "v3.football.api-sports.io",
            "x-rapidapi-key": API_KEY
        }
    })
    .then(response => response.json())
    .then(data => {
        // Eğer maç bulunamadıysa uyarı ver
        if(!data.response || data.response.length === 0) {
            alert("Maç bulunamadı! ID'yi kontrol edin.");
            btn.innerText = "VERİLERİ GETİR";
            btn.style.backgroundColor = "#FF5722";
            return;
        }

        // Gelen veriyi değişkenlere ayır
        const match = data.response[0];
        const homeTeam = match.teams.home;
        const awayTeam = match.teams.away;
        const goals = match.goals;

        // Paneleki input kutularına verileri yaz
        document.getElementById('inp-home-name').value = homeTeam.name.toUpperCase();
        document.getElementById('inp-away-name').value = awayTeam.name.toUpperCase();
        
        // Eğer maç başlamadıysa skor null gelir, 0 olarak ayarlıyoruz
        document.getElementById('inp-home-score').value = goals.home !== null ? goals.home : 0;
        document.getElementById('inp-away-score').value = goals.away !== null ? goals.away : 0;

        // Inputlara manuel olarak "yazı yazılmış" hissi ver ki şablonlar güncellensin
        inputs.forEach(input => {
            const el = document.getElementById(input.id);
            if(el) {
                el.dispatchEvent(new Event('input'));
            }
        });

        // Şablonlardaki Ev Sahibi ve Deplasman Logolarını Güncelle
        const homeLogos = document.querySelectorAll('.out-home-logo');
        const awayLogos = document.querySelectorAll('.out-away-logo');
        
        homeLogos.forEach(img => img.src = homeTeam.logo);
        awayLogos.forEach(img => img.src = awayTeam.logo);

        // Butonu eski haline getir
        btn.innerText = "VERİLERİ GETİR";
        btn.style.backgroundColor = "#28a745"; // Başarılı olunca yeşil yanar
        setTimeout(() => { btn.style.backgroundColor = "#FF5722"; }, 2000);

        console.log("Veriler Başarıyla Çekildi!", match);
    })
    .catch(error => {
        console.error("Hata:", error);
        alert("API Hatası! Lütfen API Anahtarınızı ve internetinizi kontrol edin.");
        btn.innerText = "VERİLERİ GETİR";
        btn.style.backgroundColor = "#FF5722";
    });
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
