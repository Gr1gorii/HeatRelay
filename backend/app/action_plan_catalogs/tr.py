"""Deterministic Turkish action-plan output catalog."""

from types import MappingProxyType

from backend.app.action_plan_catalogs import ActionPlanCatalog


TURKISH_ACTION_PLAN_CATALOG = ActionPlanCatalog(
    policy_notice=(
        "HeatRelay, kapsamı belirli durum olgularına ve acil olmayan durumlarda "
        "modellerden türetilen hava durumu bağlamına şeffaf Barcelona politika "
        "sezgisel kuralları uygular. Bu, resmî bir uyarının veya acil durumun "
        "etkinleştirildiğini kanıtlamaz."
    ),
    policy_rules=(
        (
            "Yayımlanan 34.0°C ve 36.0°C gündüz eşiklerini yalnızca aynı günün "
            "modellerden türetilen azami sıcaklığı üzerinde sürümü belirlenmiş "
            "HeatRelay politika sezgisel kuralları olarak kullanın; bunları "
            "belediyenin etkinleştirme yaptığına dair hiçbir zaman kanıt saymayın."
        ),
        (
            "Çalışma saatlerini kontrol etme uyarısını koruyun ve iklim "
            "sığınaklarını hiçbir zaman tıbbi bakımın yerine önermeyin."
        ),
        (
            "Açıkça bildirilen kapsamı belirli bir uyarı belirtisi acil durum "
            "dalına geçer ve normal hava durumu, yer ve plan oluşturma işlemlerini "
            "atlar."
        ),
        (
            "Mevcut kapalı kapsamı belirli uyarı belirtisi kataloğundaki her "
            "değeri, backend’in sahip olduğu sabit 112 iletişim içeriğine "
            "yönlendirin."
        ),
        (
            "Sonucu bilgilendirici ve belirlenimci tutun; tanı koymayın veya "
            "tıbbi risk puanı oluşturmayın. Bildirilen yalnızca vantilatörle "
            "serinlemeyi ancak hem mevcut sıcaklık hem de aynı günün azami "
            "sıcaklığı kesin olarak 40.0°C’nin altındaysa önerin."
        ),
    ),
    situation_notice=(
        "Bu çıktı, açıkça bildirilen bilgilerin yapılandırılmış bir özetidir. "
        "Tıbbi tavsiye, acil durum değerlendirmesi veya eylem planı değildir."
    ),
    weather_notice=(
        "Bu, Open-Meteo modellerinden türetilen hava durumu bağlamıdır; resmî "
        "bir sıcak hava uyarısı değildir."
    ),
    urgent_contact_instruction=(
        "Acil yardım almak için hemen 112’yi arayın."
    ),
    urgent_actions=MappingProxyType(
        {
            "contact_emergency_service_now": "Hemen 112’yi arayın.",
            "do_not_use_shelter_as_medical_substitute": (
                "İklim sığınakları tıbbi bakımın yerini tutmaz."
            ),
        }
    ),
    urgent_notices=(
        "İklim sığınakları tıbbi bakımın yerini tutmaz.",
        (
            "Kapsamı belirli bir uyarı belirtisi açıkça bildirildiği için "
            "HeatRelay ne hava durumu bilgilerini ne de yer bilgilerini aldı ve "
            "GPT-5.6’dan bir plan oluşturmasını istemedi."
        ),
    ),
    now_actions=MappingProxyType(
        {
            "move_to_cooler_space": (
                "Bulunduğunuz yerdeki en serin kullanılabilir noktaya geçin.",
                (
                    "Seyahatin mümkün olduğunu varsaymadan ısıya maruz kalmayı "
                    "azaltmak yararlıdır."
                ),
            ),
            "reduce_physical_effort": (
                "Şimdilik fiziksel eforu azaltın.",
                "Eforu düşürmek ek ısı yükünü azaltabilir.",
            ),
            "drink_water": (
                "Güvenle yapabiliyorsanız düzenli olarak su için.",
                "Sıvı almak, sıcak havada standart bir güvenlik önlemidir.",
            ),
            "use_available_home_cooling": (
                "Sahip olduğunuzu açıkça bildirdiğiniz serinletme ekipmanını kullanın.",
                "Bu eylem yalnızca bildirilen serinletme erişimine dayanır.",
            ),
            "contact_support_person": (
                "Seyahati düşünmeden önce güvendiğiniz bir kişiyle iletişime geçin.",
                (
                    "Bildirilen kısıtlamalar, tek başına seyahatin uygun "
                    "olmadığını gösterir."
                ),
            ),
            "remain_at_current_location": (
                "Mevcut konumunuzda kalın ve seyahat gerektirmeyen serinleme adımlarını uygulayın.",
                "Bildirilen bir kısıtlama şu anda ayrılmayı yasaklıyor.",
            ),
            "travel_to_selected_place": (
                (
                    "Seçilen ve açık olduğu doğrulanmış adayı yalnızca mevcut "
                    "çalışma saatlerini kontrol ettikten sonra değerlendirin."
                ),
                (
                    "Bu yer, bu istek için backend tarafından onaylanan aday "
                    "kümesinde bulunuyordu."
                ),
            ),
        }
    ),
    next_few_hours_actions=MappingProxyType(
        {
            "keep_drinking_water": (
                "Sizin için güvenliyse suyu hazır bulundurun ve düzenli olarak için.",
                "Sürekli sıvı almak, sıcak havada standart bir güvenlik önlemidir.",
            ),
            "stay_in_cool_space": (
                "Önümüzdeki birkaç saati kullanılabilir en serin ve uygun alanda geçirin.",
                "Bu, ısıya sürekli maruz kalmayı azaltır.",
            ),
            "check_updated_weather": (
                "Güvenilir bir kaynaktan güncel hava durumu bilgilerini kontrol edin.",
                "Modellerden türetilen koşullar bu yanıttan sonra değişebilir.",
            ),
            "check_on_household_members": (
                "Serin kalmak için yardıma ihtiyaç duyabilecek hane üyelerini kontrol edin.",
                "Bu eylem yalnızca genel bir hane kontrolü olarak geçerlidir.",
            ),
            "prepare_for_tonight": (
                "Akşamdan önce kullanılabilir en serin uyku alanını hazırlayın.",
                "Önceden hazırlık, gece ortamını daha güvenli hâle getirebilir.",
            ),
        }
    ),
    tonight_actions=MappingProxyType(
        {
            "ventilate_when_outside_is_cooler": (
                "Yalnızca dışarıdaki hava içeriden daha serinken havalandırın.",
                (
                    "Bu, pencereleri açmanın her zaman serinlettiğini varsaymayı "
                    "önler."
                ),
            ),
            "sleep_in_coolest_available_room": (
                "Uyumak için kullanılabilir en serin ve uygun odayı kullanın.",
                "Bu, gece ısıya maruz kalmayı azaltır.",
            ),
            "keep_water_nearby": (
                "Sizin için güvenliyse gece boyunca suyu yakınınızda tutun.",
                "Bu, sıvı alımını sürdürmeyi kolaylaştırır.",
            ),
            "check_updated_weather_tonight": (
                "Güvenilir bir kaynaktan güncel gece hava durumu bilgilerini kontrol edin.",
                "Bu plan sonraki koşulları veya resmî uyarıları öngörmez.",
            ),
        }
    ),
    bring_items=MappingProxyType(
        {
            "water": "İçme suyu",
            "phone": "Şarj edilmiş bir telefon",
            "keys": "Anahtarlar",
            "light_clothing": "Hafif giysiler",
        }
    ),
    explanations=MappingProxyType(
        {
            "forecast_at_or_above_36c": (
                "Modellerden türetilen aynı günün azami sıcaklığı, 36.0°C "
                "HeatRelay politika eşiğine ulaşıyor."
            ),
            "forecast_at_or_above_34c": (
                "Modellerden türetilen aynı günün azami sıcaklığı, 34.0°C "
                "HeatRelay politika eşiğine ulaşıyor."
            ),
            "reported_vulnerability": (
                "Çıkarılan profil açıkça bildirilen bir hassasiyet etkeni içeriyor."
            ),
            "no_home_cooling": (
                "Çıkarılan profil evde serinletme olmadığını açıkça bildiriyor."
            ),
            "temporary_or_unsheltered_housing": (
                "Çıkarılan profil geçici veya barınaksız konaklamayı açıkça bildiriyor."
            ),
            "reported_mobility_constraint": (
                "Çıkarılan profil açıkça bildirilen bir hareketlilik kısıtlaması içeriyor."
            ),
            "verified_open_candidate": (
                "Seçilen yer, sunucunun belirlediği değerlendirme anında açık olarak doğrulandı."
            ),
            "travel_support_required": (
                "Çıkarılan profil tek başına seyahatin mümkün olmadığını açıkça bildiriyor."
            ),
            "movement_prohibited": (
                "Çıkarılan profil şu anda ayrılmanın mümkün olmadığını açıkça bildiriyor."
            ),
            "unresolved_travel_constraint": (
                "Hemen seyahat uygunluğu, saklanan zaman veya hareketlilik "
                "olgularından doğrulanamadı."
            ),
            "baseline_monitoring": (
                "Kapsamı belirli girdilerle eşleşen daha yüksek bir HeatRelay "
                "politika kuralı bulunmadı."
            ),
        }
    ),
    normal_notice=(
        "Bu, sıcak havada güvenlik için bilgilendirici bir planlamadır; tıbbi "
        "tavsiye, rota veya bir yerin kullanılabilir kalacağına dair garanti "
        "değildir."
    ),
    candidate_explanations=MappingProxyType(
        {
            "matched_candidate": (
                "Sunucunun belirlediği değerlendirme anında açık olduğu doğrulanan "
                "en yakın uygun aday seçildi."
            ),
            "no_candidate": (
                "İstenen mesafe içinde sunucunun belirlediği değerlendirme anında "
                "açık olduğu doğrulanan uygun bir aday yoktu."
            ),
            "movement_prohibited": (
                "Normalleştirilmiş durum şu anda ayrılmanın mümkün olmadığını "
                "açıkça bildirdiği için seyahat adayı döndürülmedi."
            ),
            "unresolved_travel_compatibility": (
                "Açıkça bildirilen zaman veya hareketlilik kısıtlamasıyla uyumluluk, "
                "saklanan sunucuya ait olgulardan kanıtlanamadığı için hemen seyahat "
                "adayı döndürülmedi."
            ),
        }
    ),
    candidate_warnings=MappingProxyType(
        {
            "hours": (
                "Seyahatten önce mevcut çalışma saatlerini resmî kaynaktan "
                "kontrol edin. Listede bulunmak kullanılabilirliği garanti etmez."
            ),
            "candidate_notice": (
                "Bunlar gerçeğe dayalı, backend tarafından onaylanmış aday "
                "yerlerdir; tıbbi öneriler değildir."
            ),
            "distance": (
                "Mesafeler yalnızca kuş uçuşu tahminlerdir; HeatRelay rota veya "
                "seyahat süresi tahmini sağlamaz."
            ),
            "reachability": (
                "Bir yerin değerlendirme anında açık olması, kapanmadan önce oraya "
                "ulaşılabileceğini kanıtlamaz."
            ),
        }
    ),
    unresolved_travel_notice=(
        "Açıkça bildirilen bir zaman veya hareketlilik kısıtlamasıyla uyumluluk "
        "doğrulanamadığı için hemen seyahat önerilmedi."
    ),
)


__all__ = ("TURKISH_ACTION_PLAN_CATALOG",)
