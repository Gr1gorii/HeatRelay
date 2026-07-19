"""Deterministic Indonesian action-plan output catalog."""

from types import MappingProxyType

from backend.app.action_plan_catalogs import ActionPlanCatalog


INDONESIAN_ACTION_PLAN_CATALOG = ActionPlanCatalog(
    policy_notice=(
        "HeatRelay menerapkan heuristik kebijakan Barcelona yang transparan "
        "pada fakta situasi yang dibatasi dan, untuk kasus yang tidak darurat, "
        "konteks cuaca yang berasal dari model. Hal ini tidak membuktikan bahwa "
        "peringatan resmi atau keadaan darurat telah diaktifkan."
    ),
    policy_rules=(
        (
            "Gunakan batas siang hari 34.0°C dan 36.0°C yang dipublikasikan "
            "hanya sebagai heuristik kebijakan HeatRelay berversi atas suhu "
            "maksimum hari yang sama yang berasal dari model, dan jangan pernah "
            "menggunakannya sebagai bukti aktivasi oleh pemerintah kota."
        ),
        (
            "Pertahankan peringatan untuk memeriksa jam operasional dan jangan "
            "pernah menawarkan tempat perlindungan iklim sebagai pengganti "
            "perawatan medis."
        ),
        (
            "Gejala peringatan dalam batas yang ditentukan yang dilaporkan "
            "secara eksplisit masuk ke cabang darurat dan melewati proses "
            "normal untuk cuaca, tempat, dan pembuatan rencana."
        ),
        (
            "Arahkan setiap nilai dalam katalog tertutup gejala peringatan "
            "dalam batas yang ditentukan saat ini ke konten kontak 112 tetap "
            "yang dimiliki backend."
        ),
        (
            "Jaga agar hasil tetap informatif dan deterministik; jangan membuat "
            "diagnosis atau skor risiko medis. Tawarkan pendinginan hanya dengan "
            "kipas yang dilaporkan hanya jika suhu saat ini dan suhu maksimum "
            "hari yang sama sama-sama berada secara ketat di bawah 40.0°C."
        ),
    ),
    situation_notice=(
        "Keluaran ini adalah ringkasan terstruktur dari informasi yang "
        "dilaporkan secara eksplisit. Ini bukan nasihat medis, penilaian "
        "keadaan darurat, atau rencana tindakan."
    ),
    weather_notice=(
        "Ini adalah konteks cuaca yang berasal dari model Open-Meteo, bukan "
        "peringatan panas resmi."
    ),
    urgent_contact_instruction=(
        "Hubungi 112 sekarang untuk mendapatkan bantuan darurat."
    ),
    urgent_actions=MappingProxyType(
        {
            "contact_emergency_service_now": "Hubungi 112 sekarang.",
            "do_not_use_shelter_as_medical_substitute": (
                "Tempat perlindungan iklim bukan pengganti perawatan medis."
            ),
        }
    ),
    urgent_notices=(
        "Tempat perlindungan iklim bukan pengganti perawatan medis.",
        (
            "Karena sebuah gejala peringatan dalam batas yang ditentukan "
            "dilaporkan secara eksplisit, HeatRelay tidak mengambil informasi "
            "cuaca maupun informasi tentang tempat dan tidak meminta GPT-5.6 "
            "membuat rencana."
        ),
    ),
    now_actions=MappingProxyType(
        {
            "move_to_cooler_space": (
                "Pindahlah ke tempat paling sejuk yang tersedia di lokasi Anda "
                "sekarang.",
                (
                    "Mengurangi paparan panas bermanfaat tanpa mengasumsikan "
                    "bahwa perjalanan dapat dilakukan."
                ),
            ),
            "reduce_physical_effort": (
                "Kurangi aktivitas fisik untuk saat ini.",
                "Mengurangi pengerahan tenaga dapat mengurangi beban panas tambahan.",
            ),
            "drink_water": (
                "Minumlah air secara teratur jika Anda dapat melakukannya "
                "dengan aman.",
                "Hidrasi adalah langkah keselamatan standar saat cuaca panas.",
            ),
            "use_available_home_cooling": (
                "Gunakan peralatan pendingin yang secara eksplisit Anda "
                "laporkan tersedia.",
                "Tindakan ini hanya mengandalkan akses pendinginan yang dilaporkan.",
            ),
            "contact_support_person": (
                "Hubungi orang tepercaya sebelum mempertimbangkan perjalanan.",
                (
                    "Kendala yang dilaporkan menunjukkan bahwa bepergian "
                    "sendirian tidak sesuai."
                ),
            ),
            "remain_at_current_location": (
                (
                    "Tetaplah di lokasi Anda saat ini dan gunakan langkah "
                    "pendinginan yang tidak memerlukan perjalanan."
                ),
                "Kendala yang dilaporkan saat ini melarang Anda pergi.",
            ),
            "travel_to_selected_place": (
                (
                    "Pertimbangkan kandidat terpilih yang terverifikasi buka "
                    "hanya setelah memeriksa jam operasionalnya saat ini."
                ),
                (
                    "Tempat tersebut termasuk dalam kumpulan kandidat yang "
                    "disetujui backend untuk permintaan ini."
                ),
            ),
        }
    ),
    next_few_hours_actions=MappingProxyType(
        {
            "keep_drinking_water": (
                "Sediakan air dan minumlah secara teratur jika aman bagi Anda.",
                "Hidrasi berkelanjutan adalah langkah keselamatan standar saat panas.",
            ),
            "stay_in_cool_space": (
                (
                    "Habiskan beberapa jam ke depan di ruang paling sejuk dan "
                    "sesuai yang tersedia."
                ),
                "Hal ini mengurangi paparan panas yang berkelanjutan.",
            ),
            "check_updated_weather": (
                "Periksa informasi cuaca terbaru dari sumber tepercaya.",
                "Kondisi yang berasal dari model dapat berubah setelah respons ini.",
            ),
            "check_on_household_members": (
                (
                    "Periksa anggota rumah tangga yang mungkin memerlukan "
                    "bantuan agar tetap sejuk."
                ),
                "Tindakan ini hanya berlaku sebagai pemeriksaan umum rumah tangga.",
            ),
            "prepare_for_tonight": (
                "Siapkan ruang tidur paling sejuk yang tersedia sebelum malam.",
                (
                    "Persiapan lebih awal dapat membuat lingkungan malam hari "
                    "lebih aman."
                ),
            ),
        }
    ),
    tonight_actions=MappingProxyType(
        {
            "ventilate_when_outside_is_cooler": (
                "Beri ventilasi hanya saat udara di luar lebih sejuk daripada "
                "di dalam.",
                (
                    "Hal ini menghindari anggapan bahwa membuka jendela selalu "
                    "memberikan pendinginan."
                ),
            ),
            "sleep_in_coolest_available_room": (
                "Tidurlah di ruangan paling sejuk dan sesuai yang tersedia.",
                "Hal ini mengurangi paparan panas pada malam hari.",
            ),
            "keep_water_nearby": (
                "Simpan air di dekat Anda sepanjang malam jika aman bagi Anda.",
                "Hal ini memudahkan Anda menjaga hidrasi.",
            ),
            "check_updated_weather_tonight": (
                "Periksa informasi cuaca malam terbaru dari sumber tepercaya.",
                (
                    "Rencana ini tidak memprediksi kondisi berikutnya atau "
                    "peringatan resmi."
                ),
            ),
        }
    ),
    bring_items=MappingProxyType(
        {
            "water": "Air minum",
            "phone": "Telepon yang sudah diisi daya",
            "keys": "Kunci",
            "light_clothing": "Pakaian ringan",
        }
    ),
    explanations=MappingProxyType(
        {
            "forecast_at_or_above_36c": (
                "Suhu maksimum hari yang sama yang berasal dari model mencapai "
                "batas kebijakan HeatRelay 36.0°C."
            ),
            "forecast_at_or_above_34c": (
                "Suhu maksimum hari yang sama yang berasal dari model mencapai "
                "batas kebijakan HeatRelay 34.0°C."
            ),
            "reported_vulnerability": (
                "Profil yang diekstrak memuat faktor kerentanan yang dilaporkan "
                "secara eksplisit."
            ),
            "no_home_cooling": (
                "Profil yang diekstrak secara eksplisit melaporkan tidak adanya "
                "pendinginan di rumah."
            ),
            "temporary_or_unsheltered_housing": (
                "Profil yang diekstrak secara eksplisit melaporkan tempat "
                "tinggal sementara atau tanpa tempat berlindung."
            ),
            "reported_mobility_constraint": (
                "Profil yang diekstrak memuat kendala mobilitas yang dilaporkan "
                "secara eksplisit."
            ),
            "verified_open_candidate": (
                "Tempat yang dipilih terverifikasi buka pada saat evaluasi yang "
                "ditentukan server."
            ),
            "travel_support_required": (
                "Profil yang diekstrak secara eksplisit melaporkan bahwa "
                "perjalanan sendirian tidak memungkinkan."
            ),
            "movement_prohibited": (
                "Profil yang diekstrak secara eksplisit melaporkan bahwa pergi "
                "saat ini tidak memungkinkan."
            ),
            "unresolved_travel_constraint": (
                "Kesesuaian perjalanan segera tidak dapat diverifikasi dari "
                "fakta waktu atau mobilitas yang dipertahankan."
            ),
            "baseline_monitoring": (
                "Tidak ada aturan kebijakan HeatRelay yang lebih tinggi yang "
                "cocok dengan masukan yang dibatasi."
            ),
        }
    ),
    normal_notice=(
        "Ini adalah perencanaan keselamatan panas yang bersifat informatif, "
        "bukan nasihat medis, rute, atau jaminan bahwa suatu tempat akan tetap "
        "tersedia."
    ),
    candidate_explanations=MappingProxyType(
        {
            "matched_candidate": (
                "Kandidat terdekat yang memenuhi syarat dan terverifikasi buka "
                "pada saat evaluasi yang ditentukan server telah dipilih."
            ),
            "no_candidate": (
                "Tidak ada kandidat yang memenuhi syarat dan terverifikasi buka "
                "pada saat evaluasi yang ditentukan server dalam jarak yang "
                "diminta."
            ),
            "movement_prohibited": (
                "Tidak ada kandidat perjalanan yang dikembalikan karena situasi "
                "yang dinormalisasi secara eksplisit melaporkan bahwa pergi saat "
                "ini tidak memungkinkan."
            ),
            "unresolved_travel_compatibility": (
                "Tidak ada kandidat perjalanan segera yang dikembalikan karena "
                "kesesuaian dengan kendala waktu atau mobilitas yang dilaporkan "
                "secara eksplisit tidak dapat dibuktikan dari fakta milik server "
                "yang dipertahankan."
            ),
        }
    ),
    candidate_warnings=MappingProxyType(
        {
            "hours": (
                "Periksa jam operasional saat ini dari sumber resmi sebelum "
                "bepergian. Pencantuman tidak menjamin ketersediaan."
            ),
            "candidate_notice": (
                "Ini adalah lokasi kandidat berbasis fakta yang disetujui oleh "
                "backend, bukan rekomendasi medis."
            ),
            "distance": (
                "Jarak hanyalah perkiraan garis lurus; HeatRelay tidak menyediakan "
                "rute atau perkiraan waktu perjalanan."
            ),
            "reachability": (
                "Tempat yang buka pada waktu evaluasi tidak membuktikan bahwa "
                "tempat tersebut dapat dicapai sebelum tutup."
            ),
        }
    ),
    unresolved_travel_notice=(
        "Perjalanan segera tidak ditawarkan karena kesesuaian dengan kendala "
        "waktu atau mobilitas yang dilaporkan secara eksplisit tidak dapat "
        "diverifikasi."
    ),
)


__all__ = ("INDONESIAN_ACTION_PLAN_CATALOG",)
