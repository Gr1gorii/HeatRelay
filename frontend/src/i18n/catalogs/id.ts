import type { MessageCatalog } from "./en";

export const INDONESIAN_CATALOG = {
  "app.name": "HeatRelay",

  "navigation.skipToMain": "Lewati ke konten utama",
  "navigation.homeAccessibleName": "Beranda HeatRelay",
  "navigation.primaryAccessibleName": "Utama",
  "navigation.createPlan": "Buat rencana",
  "navigation.safetyAndPrivacy": "Keselamatan dan privasi",

  "header.settings": "Pengaturan",

"visualMode.label": "Mode visual",
  "visualMode.standard": "Standar",
  "visualMode.enhanced": "Visibilitas yang Ditingkatkan",
  "visualMode.highContrast": "Kontras tinggi",
  "visualMode.description":
    "Visibilitas yang Ditingkatkan ditujukan bagi orang dengan penglihatan terbatas atau siapa pun yang memilih konten yang lebih besar dan lebih jelas.",

  "interfaceLanguage.label": "Bahasa",
  "interfaceLanguage.description":
    "Mengubah bahasa antarmuka dan rencana tindakan berikutnya. Tidak menerjemahkan deskripsi Anda atau menulis ulang rencana yang ditampilkan.",
  "interfaceLanguage.optionWithEnglishName":
    "{{nativeName}} — {{englishName}}",

  "outputLanguage.label": "Bahasa rencana tindakan",
  "outputLanguage.description":
    "Memilih bahasa untuk rencana tindakan berikutnya. Preferensi ini disimpan di browser ini dan dikirim bersama permintaan rencana tindakan. Preferensi ini tidak mengubah bahasa antarmuka atau menerjemahkan deskripsi Anda.",

  "languageContext.title": "Informasi bahasa",
  "languageContext.descriptionLanguage": "Bahasa deskripsi",
  "languageContext.displayedLanguage": "Bahasa rencana yang ditampilkan",
  "languageContext.nextLanguage": "Bahasa rencana tindakan berikutnya",
  "languageContext.supportedMismatch":
    "Deskripsi dan rencana yang ditampilkan menggunakan bahasa yang didukung tetapi berbeda. Tinjau rencana dengan saksama dan pilih bahasa rencana tindakan lain jika diperlukan.",
  "languageContext.catalanUnavailable":
    "Keluaran rencana tindakan dalam bahasa Katalan tidak tersedia. Tinjau rencana yang ditampilkan dengan saksama dan pilih bahasa rencana tindakan yang tersedia jika diperlukan.",
  "languageContext.other":
    "HeatRelay tidak dapat mencocokkan bahasa deskripsi dengan salah satu bahasa peluncuran yang didukung. Tinjau rencana yang ditampilkan dengan saksama dan pilih bahasa rencana tindakan yang paling Anda pahami.",
  "languageContext.unknown":
    "HeatRelay tidak dapat menentukan bahasa deskripsi secara andal. Tinjau rencana yang ditampilkan dengan saksama dan pilih bahasa rencana tindakan yang paling Anda pahami.",
  "languageContext.nextSelection":
    "Rencana yang ditampilkan tidak ditulis ulang. Pilihan tersimpan Anda berlaku untuk rencana berikutnya.",
  "languageContext.otherValue": "Bahasa lain",
  "languageContext.unknownValue": "Tidak dapat ditentukan",
  "languageContext.changeAction": "Ubah bahasa",

  "hero.eyebrow": "Uji coba Barcelona · Tonggak 5",
  "hero.title": "Dari peringatan panas menuju langkah aman berikutnya.",
  "hero.introduction":
    "Jelaskan situasi panas dan HeatRelay akan meminta satu rencana tindakan Barcelona yang berbasis fakta dari backend yang ada dengan menggunakan koordinat demo tetap.",
  "hero.action": "Buat rencana Barcelona",

  "release.kicker": "Rilis saat ini",
  "release.badge": "Demo Barcelona",
  "release.title": "Satu alur kerja yang dikendalikan server",
  "release.description":
    "Browser hanya mengirim deskripsi Anda dan pengaturan demo Barcelona tetap. Cuaca, prioritas, tempat, dan validasi fakta tetap ditangani di backend.",
  "release.actionPlanApiLabel": "API rencana tindakan",
  "release.actionPlanApiValue": "Endpoint asal yang sama",
  "release.demoLocationLabel": "Lokasi demo",
  "release.demoLocationValue": "Titik tetap di Barcelona",
  "release.browserLocationLabel": "Lokasi browser",
  "release.browserLocationValue": "Tidak tersedia",

  "form.eyebrow": "Demo Barcelona",
  "form.title": "Buat rencana tindakan menghadapi panas",
  "form.introduction":
    "Bagikan hanya detail situasi yang diperlukan untuk menyesuaikan rencana terbatas yang divalidasi backend. Satu pengiriman membuat satu permintaan.",
  "form.privacyTitle": "Privasi dan detail demo",
  "form.privacyDescription":
    "Deskripsi Anda dikirim dari sisi server ke OpenAI untuk diproses oleh GPT-5.6. HeatRelay tidak dengan sengaja menyimpan atau mencatat teks mentah tersebut; kebijakan penanganan data penyedia mungkin tetap berlaku.",
  "form.identityWarning":
    "Teks dikirim ke OpenAI; HeatRelay tidak dengan sengaja menyimpan atau mencatat teks asli. Jangan sertakan nama, kontak, atau alamat. Koordinat demo Barcelona yang tetap. Bukan saran medis atau bantuan darurat.",
  "form.situationLabel": "Jelaskan situasi panas",
  "form.characterCount": "{{currentCount}} / {{limit}} karakter",
  "form.characterCountOverLimit":
    "{{currentCount}} / {{limit}} karakter — kurangi {{overLimitCount}}",
  "form.situationHint":
    "Jelaskan secara singkat usia, akses ke tempat sejuk, mobilitas, waktu, dan gejala jika relevan.",
  "form.demoButton": "Muat demo Barcelona",
  "form.submitButton": "Buat rencana tindakan panas saya",
  "form.submittingButton": "Membuat rencana Anda…",
  "form.boundaryNote":
    "MVP ini menggunakan koordinat demo Barcelona tetap. Lokasi browser belum tersedia. Jarak merupakan perkiraan garis lurus; HeatRelay bukan nasihat medis atau nasihat darurat.",
  "form.demoText":
    "Saya berusia 69 tahun, tinggal sendiri, tidak memiliki pendingin udara, berjalan lambat, dan tidak bisa berbahasa Spanyol.",

  "scenario.heading": "Bagaimana kami dapat membantu?",
  "scenario.selfTitle": "Saya merasa terlalu panas",
  "scenario.selfDescription": "Buat rencana tindakan pribadi",
  "scenario.someoneTitle": "Bantu orang terdekat",
  "scenario.someoneDescription": "Buat rencana untuk orang lain",
  "scenario.placeTitle": "Cari tempat sejuk di dekat sini",
  "scenario.placeDescription": "Tampilkan bantuan terverifikasi terdekat",
  "scenario.nearestHelp": "Bantuan terdekat",
  "scenario.importantNow": "Penting sekarang",

  "validation.empty": "Jelaskan situasinya sebelum membuat rencana.",
  "validation.overLimit": "Deskripsi terlalu panjang. Pendekkan teks.",
  "validation.serverInput": "Tinjau deskripsi dan coba lagi.",

  "status.creating": "Membuat rencana tindakan Anda.",
  "status.ready": "Rencana tindakan Anda sudah siap.",
  "status.loadingDetail":
    "Memeriksa situasi, cuaca, dan kandidat yang telah diverifikasi…",

  "error.malformedTitle": "Respons tidak tersedia",
  "error.malformedMessage": "Respons tidak dapat ditampilkan dengan aman.",
  "error.unavailableTitle": "Rencana tindakan tidak tersedia untuk sementara",
  "error.unavailableMessage":
    "Rencana tindakan tidak tersedia untuk sementara. Silakan coba lagi nanti.",
  "error.connectionTitle": "Backend tidak dapat dijangkau",
  "error.connectionMessage":
    "Backend tidak dapat dijangkau. Pastikan layanan lokal sedang berjalan.",

  "priority.actNow": "Bertindak sekarang",
  "priority.prepareNow": "Bersiap sekarang",
  "priority.monitorAndPrepare": "Pantau dan bersiap",

  "result.eyebrow": "Rencana tindakan panas Barcelona Anda",
  "result.priorityBadge": "Prioritas: {{priority}}",
  "result.evaluatedAt": "Dievaluasi pada {{dateTime}}",
  "result.weatherSummaryAccessibleName": "Ringkasan cuaca",
  "result.currentTemperature": "Suhu saat ini",
  "result.feelsLike": "Terasa seperti",
  "result.todayMaximum": "Suhu maksimum hari ini",
  "result.phaseNow": "Sekarang",
  "result.phaseNextFewHours": "Beberapa jam ke depan",
  "result.phaseTonight": "Malam ini",
  "result.bringItemsTitle": "Bawa bersama Anda",
  "result.explanationTitle": "Alasan rencana ini",
  "result.localPhraseTitle": "Frasa setempat",
  "result.localPhraseCatalan": "Katalan",
  "result.localPhraseSpanish": "Spanyol",
  "result.noPlaceTitle": "Tidak ada tempat terverifikasi yang dipilih",
  "result.noticesTitle": "Pemberitahuan keselamatan dan informasi",

  "place.backendApprovedLabel": "Kandidat yang disetujui backend",
  "place.distanceLabel": "Jarak",
  "place.closesLabel": "Tutup",
  "place.accessibilityLabel": "Aksesibilitas",
  "place.lastCheckedLabel": "Terakhir diperiksa",
  "place.featuresTitle": "Fitur terverifikasi",
  "place.noFeatures": "Tidak ada fitur terverifikasi tambahan yang tercantum.",
  "place.linksAccessibleName": "Tautan resmi tempat",
  "place.informationLink": "Informasi resmi",
  "place.sourceLink": "Sumber resmi",
  "place.mapLink": "Buka rute di Google Maps",
  "place.cautionsAccessibleName": "Perhatian mengenai tempat",
  "place.addressUnavailable": "Alamat tidak tersedia",
  "place.accessibilityConfirmed": "Aksesibilitas dikonfirmasi oleh sumber",
  "place.accessibilityUnavailable":
    "Sumber menyatakan bahwa tempat ini tidak dapat diakses",
  "place.accessibilityUnknown": "Status aksesibilitas tidak diketahui",

  "feature.indoorSpace": "Ruang dalam ruangan",
  "feature.potableWater": "Air minum",
  "feature.toilets": "Toilet",
  "feature.microShelter": "Tempat berlindung kecil",
  "feature.petsAllowed": "Hewan peliharaan diizinkan",

  "feature.confirmed": "Terkonfirmasi",
  "feature.unavailable": "Tidak tercantum tersedia",
  "feature.unknown": "Belum terkonfirmasi",

  "distance.straightLine": "{{distance}} dalam garis lurus",

  "urgent.badge": "Mendesak · segera bertindak",
  "urgent.eyebrow": "Hasil keselamatan segera",
  "urgent.title": "Bantuan mendesak",
  "urgent.sourceLink": "Panduan resmi 112",

  "trust.eyebrow": "Batas kepercayaan",
  "trust.title": "Berguna tanpa melebih-lebihkan kepastian.",
  "trust.safetyLabel": "Keselamatan",
  "trust.safetyTitle": "Informasi, bukan nasihat medis",
  "trust.safetyDescription":
    "Cuaca berasal dari model, bukan peringatan panas resmi. Tempat, jam operasional, jarak garis lurus, dan kemungkinan tempat tersebut dapat dicapai harus diperiksa sebelum bepergian. Keluaran mendesak menggunakan konten tetap yang dikendalikan backend.",
  "trust.privacyLabel": "Privasi",
  "trust.privacyTitle": "Jangan sertakan detail yang dapat mengidentifikasi Anda",
  "trust.privacyDescription":
    "Teks situasi tidak disimpan dalam penyimpanan browser. Preferensi mode visual dan bahasa yang dipilih secara eksplisit disimpan secara lokal. Hanya kode bahasa yang dipilih yang masuk ke permintaan rencana tindakan; mode visual tidak. HeatRelay tidak menggunakan analitik, cookie, parameter URL, atau geolokasi dalam demo ini.",

  "footer.description": "Demo Barcelona · Koordinat tetap",

  "metadata.title": "HeatRelay · Fondasi uji coba Barcelona",
  "metadata.description":
    "HeatRelay adalah proyek yang dimulai di Barcelona dan sedang dikembangkan untuk mengubah peringatan panas menjadi langkah aman berikutnya.",
} as const satisfies MessageCatalog;
