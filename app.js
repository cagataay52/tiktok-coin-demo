// ==========================================
// 1. API AYARLARI VE VERİ ÇEKME İŞLEMİ
// ==========================================

// Kendi API anahtarını buraya gireceksin (Şimdilik boş kalabilir)
const apiKey = "SENIN_API_ANAHTARIN"; 
// İstediğin maçın ID'si (Örnek bir Süper Lig maçı ID'si)
const matchId = "1040523"; 

function macVerisiniCek() {
    fetch(`https://v3.football.api-sports.io/fixtures?id=${matchId}`, {
        method: "GET",
        headers: {
            "x-rapidapi-host": "v3.football.api-sports.io",
            "x-rapidapi-key": apiKey
        }
    })
    .then(response => response.json())
    .then(data => {
        const mac = data.response[0];
        const evSahibi = mac.teams.home;
        const deplasman = mac.teams.away;
        const skor = mac.goals;

        // HTML içindeki yazıları ve logoları değiştiriyoruz
        document.getElementById('home-name').innerText = evSahibi.name.toUpperCase();
        document.getElementById('away-name').innerText = deplasman.name.toUpperCase();
        
        document.getElementById('home-score').innerText = skor.home !== null ? skor.home : "-";
        document.getElementById('away-score').innerText = skor.away !== null ? skor.away : "-";

        document.getElementById('home-logo').innerHTML = `<img src="${evSahibi.logo}" style="width: 100%; border-radius: 50%;">`;
        document.getElementById('away-logo').innerHTML = `<img src="${deplasman.logo}" style="width: 100%; border-radius: 50%;">`;
        
        console.log("Maç verisi başarıyla çekildi!");
    })
    .catch(error => {
        console.error("Veri çekilirken hata oluştu:", error);
    });
}

// ==========================================
// 2. GÖRSELİ (PNG) İNDİRME İŞLEMİ
// ==========================================

const downloadBtn = document.getElementById('downloadBtn');
const captureArea = document.getElementById('capture-area');

downloadBtn.addEventListener('click', () => {
    html2canvas(captureArea, {
        scale: 2, 
        backgroundColor: "#121212",
        useCORS: true // API'den gelen logoların resimde görünmesi için bu ayar çok önemli!
    }).then(canvas => {
        const imageURL = canvas.toDataURL("image/png");
        const downloadLink = document.createElement('a');
        downloadLink.href = imageURL;
        downloadLink.download = 'skoragi-mac-sonucu.png';
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    });
});
