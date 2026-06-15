# Proje Adı: Diyegram

# Kapsam: Kapsamlı Proje Başlatma ve Geliştirme Yönergesi

## 1. Proje Özeti

Bu proje, diyetisyenler ve danışanları arasındaki iletişimi oyunlaştıran ve "Instagram" akışı mantığıyla basitleştiren bir PWA (Progressive Web App) beslenme takip uygulamasıdır. Danışanlar öğünlerini fotoğraf (carousel) olarak paylaşır, diyetisyenler akış üzerinden hızlıca beğenir veya yorum yapar. Ayrıca su tüketimi ve adım sayıları 24 saatlik hikayeler (story) olarak paylaşılır. Eğlenceli bir "Kaçamak İtirafı" mekanizması içerir.

## 2. Teknoloji Yığını (Tech Stack)

- **Framework:** Next.js (App Router)

- **Veritabanı ORM:** Prisma

- **Veritabanı:** PostgreSQL

- **Stil & UI:** Tailwind CSS, shadcn/ui, framer-motion (animasyonlar için)

- **Paket Yöneticisi:** pnpm

- **Kimlik Doğrulama:** NextAuth.js

- **Resim Yükleme:** Cloudinary veya AWS S3

## 3. Kullanıcı Rolleri ve Akışlar

### A. Diyetisyen Rolü (Dietitian)

- **Dashboard (Akış):** Tüm danışanların öğün fotoğrafları, en yeniden eskiye doğru Instagram akışı gibi alt alta sıralanır. Diyetisyen isterse danışanın sayfasına girip bütün paylaşımlarını toplu görebilir. 

- **Hızlı Aksiyonlar:** Gönderilerin altında Beğen (Kalp), Dislike (aşağı yönlü başparmak) butonları ve "Su İç", "Porsiyon Küçült" gibi hızlı yorum şablonları bulunur.

- **Hikaye İzleyici:** Ekranın en üstünde danışanların günlük su ve adım hikayeleri görünür. 24 saat içinde silinir. Tıklayıp izlenebilir, hızlı emoji (🔥, 👏) atılabilir.

- **Danışan Yönetimi:** Özel davet linki (Magic Link) ile danışan uygulamaya dahil edilir ve otomatik eşleşir.

- **Kontrol (Check-up) Verisi:** Seans günlerinde klinik cihazlardan (Tanita vb.) alınan "Gerçek Kilo" ve "Yağ Oranı" sisteme girilir. Raporun fotoğrafı yüklenir. Bu veriler sistemde "Klinik Onaylı (Verified)" rozetiyle tutulur ve bir sonraki randevu tarihi belirlenir.

- **Diyet Listesi Yükleme:** Danışana PDF, fotoğraf veya metin şablonu formatında güncel diyet listesi atanır.

### B. Danışan Rolü (Client)

- **Ana Ekran (Home):**

  - **Hikayeler (Stories):** En üstte yuvarlak profil baloncukları. Kendi "Sen" baloncuğundan su ve adım hikayesi (otomatik veya fotoğraflı) atabilir (24 saat sonra silinir).

  - **Takvim & Motivasyon:** Yatay ve kaydırılabilir bir haftalık takvim (varsayılan: Bugün). Hedef kiloya ve sıradaki randevuya kalan zamanı gösteren sayaç ("Kontrole Son X Gün").

  - **Öğün Akışı:** Sabah, Öğle, Ara Öğün, Akşam, Son Ara Öğün başlıkları altında öğün fotoğrafları. Birden çok resim için carousel (kaydırmalı) yapı. Kamera açıldığında "Tabak Kılavuzu" (ızgara) görünür.

- **Speed Dial FAB (Kayan Aksiyon Butonu):** Sağ altta "WhatsApp" tarzı sabit, tıklanınca yukarı açılan buton:

  - 📸 Öğün Ekle

  - 💧 Su Ekle (Otomatik story atar)

  - 🏃 Adım Ekle (Otomatik story atar)

  - 🚨 Kaçamak İtirafı (Muzip ikonlu. Akışa siren emojisiyle düşer)

- **Alt Menü (Bottom Nav):** Ana Sayfa, Diyet Listem (yakınlaştırılabilir görsel/pdf arşivi), Gelişimim (Grafikler).

## 4. Veritabanı Modelleri (Prisma Schema Taslağı)

Cursor, lütfen aşağıdaki ilişkilere uygun bir `schema.prisma` hazırla:

- **User:** Role (DIETITIAN, CLIENT), email, password, personal_info (boy, yaş, vb.), target_weight, assigned_dietitian_id.

- **MealPost:** user_id, meal_type (BREAKFAST, LUNCH, SNACK_1, DINNER, SNACK_2, CHEAT), images (array), created_at, dietitian_feedback (status: LIKED, DISLIKED, PENDING), dietitian_comment.

- **Story:** user_id, type (WATER, STEPS, PHOTO), value, created_at, expires_at (created_at + 24h).

- **CheckUp:** user_id, dietitian_id, actual_weight, fat_percentage, report_image_url, next_appointment_date.

- **DietPlan:** user_id, dietitian_id, type (PDF, IMAGE, TEXT), content_url, content_text, created_at, expires_at.

## 5. Cursor Geliştirme Görevleri (Adım Adım)

Cursor, lütfen projeyi aşağıdaki sırayla inşa et. Her adımı bitirdiğinde benden onay iste:

1. **Adım 1: Kurulum ve Temel Yapı**

   - Next.js (App Router) projesini `pnpm` kullanarak oluştur. TailwindCSS, next-themes (Dark Mode için) ve shadcn/ui kurulumlarını yap.

   - PWA yapılandırmasını (manifest.json, service worker) ekle.

2. **Adım 2: Veritabanı ve Auth**

   - `schema.prisma` dosyasını yukarıdaki modellere göre detaylıca yaz.

   - NextAuth.js entegrasyonunu yap (Email/Password giriş sistemi). Role-based (Diyetisyen/Danışan) yönlendirme mantığını kur.

3. **Adım 3: Danışan UI (Ana Ekran ve FAB)**

   - Mobil öncelikli tasarım yap. Alt navigasyon barını oluştur.

   - Üst kısma 24 saat süreli Hikaye (Story) çubuğunu ve Haftalık Takvim UI'ını yap.

   - Sağ alt köşeye framer-motion kullanarak animasyonlu Speed Dial (Genişleyen) FAB butonunu inşa et (Öğün, Su, Adım, Kaçamak eylemleri).

   - Öğün kartları için (Carousel resim kaydırma özelliği olan) bileşenleri tasarla.

4. **Adım 4: Diyetisyen UI (Akış ve Check-up)**

   - Instagram tarzı dikey kaydırılabilir danışan akışını oluştur.

   - Akışa "Kaçamak (Cheat)" postları geldiğinde kırmızı ve uyarıcı (siren tasarımlı) bir UI varyasyonu hazırla.

   - Öğün değerlendirme butonlarını (Kalp, Dislike, Hızlı Yorum) bağla.

   - Danışan kontrol verisi (Check-up) girme ekranını ve dosya/resim yükleme mantığını yaz.

5. **Adım 5: Gelişmiş Özellikler ve Animasyonlar**

   - Danışan için "Kontrole Son X Gün" geri sayım logic'ini yaz ve UI'da göster.

   - Su/Adım hikayeleri eklendiğinde animasyonlu toast mesajları ve otomatik hikaye şablonu oluşturma fonksiyonlarını yaz.

## 6. UI/UX, CSS ve Tasarım Dili (Kullanıcı Dostu & Modern)

Uygulamanın arayüzü "Klinik bir yazılım" gibi değil, "Modern bir yaşam tarzı uygulaması" (Instagram / Pinterest karışımı) hissi vermelidir. Arayüzde kullanıcıyı yormayan, ferah ve yumuşak bir tasarım dili kullanılacaktır. Tailwind CSS yapılandırmasını aşağıdaki kurallara göre kurgula:

### A. Işık Modu (Light Mode) Renk Paleti

- **Arka Plan (Background):** Saf beyaz yerine göz yormayan çok uçuk bir gri/krem tonu `bg-slate-50` veya `bg-gray-50`). Bu sayede beyaz arka planlı post kartları `bg-white`) ekrandan dışarı doğru daha net öne çıkar.

- **Ana Renk (Primary):** Güven, sağlık ve ferahlık hissi veren yumuşak bir ton. (Soft Mint Yeşili veya Açık Deniz Mavisi - `teal-500` veya `sky-500`).

- **Aksan/Motivasyon Rengi (Accent):** İlerleme çubukları (progress bar), hedef tamamlamalar ve ateş emojileri için enerjik bir renk `orange-400` veya `amber-400`).

- **Uyarı / Kaçamak Rengi (Danger/Cheat):** "Kaçamak İtirafı" ve süre bitimi uyarıları için tatlı ama dikkat çekici bir ton. (Karpuz Kabuğu / Mercan - `rose-500`).

### B. Karanlık Mod (Dark Mode) Standartları

Uygulama Tailwind CSS'in `dark:` sınıflarını tam uyumlu desteklemelidir:

- **Karanlık Arka Plan:** Boğucu tam siyah yerine derin gece mavisi veya koyu füme tonları `dark:bg-slate-950`).

- **Karanlık Kart Yapıları:** Arka plandan hafifçe ayrışan koyu grafit tonları `dark:bg-slate-900`). Kenarlıklar çok hafif gri tonlarında olmalıdır `dark:border-slate-800`).

- **Metin Renkleri:** Koyu gri yerine yumuşak beyaz/gri tonları `dark:text-zinc-100`, `dark:text-zinc-400`).

### C. Şekiller, Gölgeler ve Tipografi

- Keskin köşelerden kaçınılmalı. Kartlar ve butonlar geniş yuvarlatılmış olmalı `rounded-2xl` veya `rounded-3xl`).

- Derinlik hissi için hafif, dağılmış gölgeler kullanılmalı `shadow-sm`, `shadow-md`).

- Tipografi hiyerarşisi net olmalı: Başlıklar kalın `font-bold`, `text-slate-800`), alt metinler silik ve küçük `text-sm`, `text-slate-500`).

- Öğeler arasında nefes alacak geniş boşluklar `gap-4`, `p-4`) bırakılmalıdır.

### D. Mikro Etkileşimler (Framer Motion)

- Arayüz canlı hissettirmelidir.

- Butonlara basıldığında hafifçe içe çökme efekti `whileTap={{ scale: 0.96 }}`) olmalıdır.

- Speed Dial (FAB) butonu açılırken ikonlar yaylanarak (spring animation) çıkmalıdır.