// 1. API VERİ ÇEKME FONKSİYONU (İleride kullanmak için hazır)
const apiKey = "SENIN_API_ANAHTARIN"; 
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

        document.getElementById('home-name').innerText = evSahibi.name.toUpperCase();
        document.getElementById('away-name').innerText = deplasman.name.toUpperCase();
        document.getElementById('home-logo').src = evSahibi.logo;
        document.getElementById('away-logo').src = deplasman.logo;
    })
    .catch(error => console.error("Veri çekilirken hata oluştu:", error));
}

// 2. ŞABLONU PNG OLARAK İNDİRME İŞLEMİ
const downloadBtn = document.getElementById('downloadBtn');
const captureArea = document.getElementById('capture-area');

downloadBtn.addEventListener('click', () => {
    html2canvas(captureArea, {
        scale: 2, 
        backgroundColor: "#121212",
        useCORS: true, // Logoların ve resimlerin siyah çıkmasını engeller
        allowTaint: true
    }).then(canvas => {
        const imageURL = canvas.toDataURL("image/png");
        const downloadLink = document.createElement('a');
        downloadLink.href = imageURL;
        downloadLink.download = 'skoragi-mac-gunu.png';
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    });
});
