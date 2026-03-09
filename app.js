// Butonu ve ekran görüntüsü alınacak alanı seçiyoruz
const downloadBtn = document.getElementById('downloadBtn');
const captureArea = document.getElementById('capture-area');

downloadBtn.addEventListener('click', () => {
    // html2canvas ile belirlediğimiz div'in resmini çizdiriyoruz
    html2canvas(captureArea, {
        scale: 2, // Görüntü kalitesini artırmak için (Retina/Yüksek çözünürlük)
        backgroundColor: "#121212" // Arka plan rengini garantiye alıyoruz
    }).then(canvas => {
        // Çizilen resmi bir URL'ye (veri formatına) dönüştürüyoruz
        const imageURL = canvas.toDataURL("image/png");

        // Geçici bir "a" (link) etiketi oluşturup indirmeyi tetikliyoruz
        const downloadLink = document.createElement('a');
        downloadLink.href = imageURL;
        
        // İndirilecek dosyanın adını belirliyoruz (Örn: skoragi-mac-sonucu.png)
        downloadLink.download = 'skoragi-mac-sonucu.png';
        
        // Linke tıklanmış gibi yapıp indirmeyi başlatıyoruz
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    });
});
