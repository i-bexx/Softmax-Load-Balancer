# Softmax-Load-Balancer

Bu proje, dağıtık sistemlerde sunucu performanslarının zamanla değiştiği (non-stationary) ve gürültülü (noisy) ortamlar için geliştirilmiş bir istemci taraflı yük dengeleyici (Load Balancer) simülasyonudur. 

Klasik deterministik algoritmaların (Round-Robin) başarısız olduğu bu dinamik ortamda, **Softmax Action Selection** algoritmasının adaptasyon yeteneği test edilmiş ve çalışma zamanı analizleri (Big-O) yapılmıştır.

## 🚀 Proje Mimarisi ve Teknik Özellikler

Proje üç ana bileşenden oluşmaktadır:

### 1. Ortam Simülasyonu (Server Modeli)
* **Gözlem Gürültüsü (Observation Noise):** JavaScript'te hazır Normal Dağılım olmadığı için **Box-Muller Dönüşümü** (`randomNormal`) ile kodlanmıştır. Sunucu yanıt sürelerine gerçekçi bir stokastik gürültü ekler.
* **Non-Stationary Dinamikler:** Sunucuların hızı sabit değildir. Her istekte gecikme süresine **Random Walk (Rastgele Yürüyüş)** formülü uygulanarak sunucu hızı kalıcı olarak değiştirilir. Statik algoritmaları başarısızlığa uğratan temel mekanizma budur.

### 2. Yönlendirme Algoritmaları (Agent)
* **Round-Robin ve Random:** Anlık ve basit seçim yapan, durumdan bağımsız (statik/kör) algoritmalardır.
* **Softmax Algoritması:** Bilinen en hızlı sunucuyu kullanmak (**Sömürü**) ile yeni durumu anlamak için diğer sunucuları test etmek (**Keşif**) arasındaki dengeyi kuran olasılıklı bir karar verme algoritmasıdır.

### 3. Nümerik Stabilite (Numerical Stability)
Softmax algoritması üstel işlemler ($e^x$) içerdiği için büyük sayılarda sistemin çökme riski vardır.
* **Shift Invariance:** Üs alma işleminden önce en büyük değer tüm elemanlardan çıkarılarak olası bir **Bellek Taşması (Overflow)** hatası engellenmiş ve **nümerik stabilite** sağlanmıştır. Sonrasında bu güvenli sayılar olasılık dağılımına dönüştürülür.

### 4. Çevrimiçi Öğrenme (Online Learning)
* **Update Metodu:** Ajanın anlık öğrenme kısmıdır. Sunucudan dönen gerçek süreyi alır ve **Artımlı Ortalama (Incremental Mean)** formülüyle hafızasındaki Q-değerini günceller.

---

## 📊 Çalışma Zamanı Analizi (Time Complexity)

| Algoritma | Zaman Karmaşıklığı | Açıklama |
| :--- | :---: | :--- |
| **Round-Robin** | O(1) | Tek bir indeks kaydırma yapar. Süre sabittir. |
| **Random** | O(1) | Basit rassal seçim yapar. Süre sabittir. |
| **Softmax** | O(N) | Her adımda tüm sunucuların verilerini okuyup olasılık hesabı yapar. |

*Mühendislik Takası (Trade-off):* Softmax, işlemci tarafında $O(N)$ maliyet yaratmasına rağmen, değişken ağ ortamına adapte olarak toplam sistem gecikmesini (Network Latency) büyük oranda düşürmüştür.

---

## 🛠️ Kurulum ve Çalıştırma

Projenin çalışması için sisteminizde [Node.js](https://nodejs.org/) kurulu olmalıdır.
