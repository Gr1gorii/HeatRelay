import type { MessageCatalog } from "./en";

export const TURKISH_CATALOG = {
  "app.name": "HeatRelay",

  "navigation.skipToMain": "Ana içeriğe geç",
  "navigation.homeAccessibleName": "HeatRelay ana sayfası",
  "navigation.primaryAccessibleName": "Ana gezinme",
  "navigation.createPlan": "Plan oluştur",
  "navigation.safetyAndPrivacy": "Güvenlik ve gizlilik",

  "visualMode.label": "Görsel mod",
  "visualMode.standard": "Standart",
  "visualMode.enhanced": "Geliştirilmiş Görünürlük",
  "visualMode.description":
    "Geliştirilmiş Görünürlük, az gören kişiler veya daha büyük ve daha net içerik tercih eden herkes için tasarlanmıştır.",

  "interfaceLanguage.label": "Arayüz dili",
  "interfaceLanguage.description":
    "Gezinmeyi, formları ve sayfa etiketlerini değiştirir. Eylem planının dilini değiştirmez.",
  "interfaceLanguage.optionWithEnglishName":
    "{{nativeName}} — {{englishName}}",

  "outputLanguage.label": "Eylem planı dili",
  "outputLanguage.description":
    "Bir sonraki eylem planının dilini seçer. Bu tercih bu tarayıcıya kaydedilir ve eylem planı isteğiyle gönderilir. Arayüz dilini değiştirmez veya açıklamanızı çevirmez.",

  "languageContext.title": "Dil bilgileri",
  "languageContext.descriptionLanguage": "Açıklamanın dili",
  "languageContext.displayedLanguage": "Görüntülenen planın dili",
  "languageContext.nextLanguage": "Sonraki eylem planının dili",
  "languageContext.supportedMismatch":
    "Açıklama ve görüntülenen plan farklı desteklenen diller kullanıyor. Planı dikkatle inceleyin ve gerekirse başka bir eylem planı dili seçin.",
  "languageContext.catalanUnavailable":
    "Katalanca eylem planı çıktısı kullanılamıyor. Görüntülenen planı dikkatle inceleyin ve gerekirse kullanılabilir bir eylem planı dili seçin.",
  "languageContext.other":
    "HeatRelay açıklamanın dilini desteklenen lansman dillerinden biriyle eşleştiremedi. Görüntülenen planı dikkatle inceleyin ve en iyi anladığınız eylem planı dilini seçin.",
  "languageContext.unknown":
    "HeatRelay açıklamanın dilini güvenilir biçimde belirleyemedi. Görüntülenen planı dikkatle inceleyin ve en iyi anladığınız eylem planı dilini seçin.",
  "languageContext.nextSelection":
    "Görüntülenen plan yeniden yazılmaz. Kaydedilen seçiminiz sonraki plana uygulanır.",
  "languageContext.otherValue": "Başka bir dil",
  "languageContext.unknownValue": "Belirlenemedi",
  "languageContext.changeAction": "Eylem planı dilini değiştir",

  "hero.eyebrow": "Barcelona pilotu · Kilometre Taşı 5",
  "hero.title": "Sıcak hava uyarısından güvenli bir sonraki adıma.",
  "hero.introduction":
    "Bir sıcak hava durumunu açıklayın; HeatRelay, mevcut arka uçtan sabit demo koordinatlarını kullanarak Barcelona için gerçeğe dayalı tek bir eylem planı isteyecektir.",
  "hero.action": "Barcelona planı oluştur",

  "release.kicker": "Mevcut sürüm",
  "release.badge": "Barcelona demosu",
  "release.title": "Sunucu tarafından yönetilen tek iş akışı",
  "release.description":
    "Tarayıcı yalnızca açıklamanızı ve sabit Barcelona demo ayarlarını gönderir. Hava durumu, öncelik, yerler ve olgusal doğrulama arka uçta kalır.",
  "release.actionPlanApiLabel": "Eylem planı API’si",
  "release.actionPlanApiValue": "Aynı kaynak uç noktası",
  "release.demoLocationLabel": "Demo konumu",
  "release.demoLocationValue": "Sabit Barcelona noktası",
  "release.browserLocationLabel": "Tarayıcı konumu",
  "release.browserLocationValue": "Kullanılamıyor",

  "form.eyebrow": "Barcelona demosu",
  "form.title": "Sıcak hava eylem planınızı oluşturun",
  "form.introduction":
    "Sınırları belirlenmiş, arka uç tarafından doğrulanan bir planı kişiselleştirmek için yalnızca gerekli durum ayrıntılarını paylaşın. Her gönderim tek bir istek oluşturur.",
  "form.privacyTitle": "Göndermeden önce",
  "form.privacyDescription":
    "Açıklamanız, GPT-5.6 tarafından işlenmek üzere sunucu tarafında OpenAI’a gönderilir. HeatRelay ham metni bilerek saklamaz veya günlüğe kaydetmez; sağlayıcının veri işleme politikaları yine de geçerli olabilir.",
  "form.identityWarning":
    "Ad, iletişim bilgileri, adres veya kimliğinizi belirleyebilecek başka bilgiler eklemeyin.",
  "form.situationLabel": "Sıcak hava durumunu açıklayın",
  "form.characterCount": "{{currentCount}} / {{limit}} kod noktası",
  "form.characterCountOverLimit":
    "{{currentCount}} / {{limit}} kod noktası — sınırın {{overLimitCount}} üzerinde",
  "form.situationHint":
    "En fazla {{limit}} Unicode kod noktası kullanın. Yaş, serinleme imkânı, hareket kabiliyeti, zamanlama veya kapsamı belirli uyarı belirtilerini açıklayabilirsiniz.",
  "form.demoButton": "Barcelona demosunu yükle",
  "form.submitButton": "Sıcak hava eylem planımı oluştur",
  "form.submittingButton": "Planınız oluşturuluyor…",
  "form.boundaryNote":
    "Bu MVP, sabit Barcelona demo koordinatlarını kullanır. Tarayıcı konumu henüz kullanılamıyor. Mesafeler kuş uçuşu tahminlerdir; HeatRelay tıbbi tavsiye veya acil durum tavsiyesi değildir.",
  "form.demoText":
    "69 yaşındayım, yalnız yaşıyorum, klimam yok, yavaş yürüyorum ve İspanyolca konuşamıyorum.",

  "validation.empty": "Plan oluşturmadan önce durumu açıklayın.",
  "validation.overLimit":
    "Açıklamayı {{limit}} Unicode karakter sınırı içinde tutun.",
  "validation.serverInput": "Açıklamayı gözden geçirip yeniden deneyin.",

  "status.creating": "Eylem planınız oluşturuluyor.",
  "status.ready": "Eylem planınız hazır.",
  "status.loadingDetail":
    "Durum, hava koşulları ve doğrulanmış adaylar kontrol ediliyor…",

  "error.malformedTitle": "Yanıt kullanılamıyor",
  "error.malformedMessage": "Yanıt güvenli bir şekilde görüntülenemedi.",
  "error.unavailableTitle": "Eylem planı geçici olarak kullanılamıyor",
  "error.unavailableMessage":
    "Eylem planı geçici olarak kullanılamıyor. Lütfen daha sonra yeniden deneyin.",
  "error.connectionTitle": "Arka uca ulaşılamadı",
  "error.connectionMessage":
    "Arka uca ulaşılamadı. Yerel hizmetlerin çalıştığını kontrol edin.",

  "priority.actNow": "Şimdi harekete geçin",
  "priority.prepareNow": "Şimdi hazırlanın",
  "priority.monitorAndPrepare": "İzleyin ve hazırlanın",

  "result.eyebrow": "Barcelona sıcak hava eylem planınız",
  "result.priorityBadge": "Öncelik: {{priority}}",
  "result.evaluatedAt": "Değerlendirme zamanı: {{dateTime}}",
  "result.weatherSummaryAccessibleName": "Hava durumu özeti",
  "result.currentTemperature": "Mevcut sıcaklık",
  "result.feelsLike": "Hissedilen",
  "result.todayMaximum": "Bugünün en yüksek sıcaklığı",
  "result.phaseNow": "Şimdi",
  "result.phaseNextFewHours": "Önümüzdeki birkaç saat",
  "result.phaseTonight": "Bu gece",
  "result.bringItemsTitle": "Yanınıza alın",
  "result.explanationTitle": "Bu planın nedeni",
  "result.localPhraseTitle": "Yerel bir ifade",
  "result.localPhraseCatalan": "Katalanca",
  "result.localPhraseSpanish": "İspanyolca",
  "result.noPlaceTitle": "Doğrulanmış bir yer seçilmedi",
  "result.noticesTitle": "Güvenlik ve bilgi bildirimleri",

  "place.backendApprovedLabel": "Arka uç tarafından onaylanan aday",
  "place.distanceLabel": "Mesafe",
  "place.closesLabel": "Kapanış",
  "place.accessibilityLabel": "Erişilebilirlik",
  "place.lastCheckedLabel": "Son kontrol",
  "place.featuresTitle": "Doğrulanmış özellikler",
  "place.noFeatures": "Doğrulanmış ek bir özellik listelenmemiştir.",
  "place.linksAccessibleName": "Resmî yer bağlantıları",
  "place.informationLink": "Resmî bilgiler",
  "place.sourceLink": "Resmî kaynak",
  "place.cautionsAccessibleName": "Yerle ilgili uyarılar",
  "place.addressUnavailable": "Adres kullanılamıyor",
  "place.accessibilityConfirmed": "Erişilebilirlik kaynak tarafından doğrulandı",
  "place.accessibilityUnavailable":
    "Kaynak, bu yerin erişilebilir olmadığını bildiriyor",
  "place.accessibilityUnknown": "Erişilebilirlik durumu bilinmiyor",

  "feature.indoorSpace": "Kapalı alan",
  "feature.potableWater": "İçme suyu",
  "feature.toilets": "Tuvaletler",
  "feature.microShelter": "Mikro barınak",
  "feature.petsAllowed": "Evcil hayvanlara izin verilir",

  "distance.straightLine": "Kuş uçuşu {{distance}}",

  "urgent.badge": "Acil · hemen harekete geçin",
  "urgent.eyebrow": "Acil güvenlik sonucu",
  "urgent.title": "Acil yardım",
  "urgent.sourceLink": "Resmî 112 yönlendirmesi",

  "trust.eyebrow": "Güven sınırları",
  "trust.title": "Kesinliği abartmadan faydalı bilgiler.",
  "trust.safetyLabel": "Güvenlik",
  "trust.safetyTitle": "Tıbbi tavsiye değil, bilgi",
  "trust.safetyDescription":
    "Hava durumu modelden türetilmiştir ve resmî bir sıcak hava uyarısı değildir. Seyahate çıkmadan önce yerler, çalışma saatleri, kuş uçuşu mesafe ve ulaşılabilirlik kontrol edilmelidir. Acil çıktı, arka uç tarafından yönetilen sabit içerik kullanır.",
  "trust.privacyLabel": "Gizlilik",
  "trust.privacyTitle": "Kimliğinizi belirleyebilecek ayrıntıları paylaşmayın",
  "trust.privacyDescription":
    "Durum metni tarayıcı depolama alanında saklanmaz. Açıkça seçilen görsel mod, arayüz dili ve eylem planı dili tercihleri yerel olarak saklanır. İsteğe yalnızca seçilen eylem planı dili kodu girer; görsel mod ve arayüz dili girmez. HeatRelay bu demoda analiz araçları, çerezler, URL parametreleri veya coğrafi konum kullanmaz.",

  "footer.description": "Barcelona demosu · Sabit koordinatlar",

  "metadata.title": "HeatRelay · Barcelona pilotunun temeli",
  "metadata.description":
    "HeatRelay, sıcak hava uyarılarını güvenli sonraki adımlara dönüştürmek üzere geliştirilen, Barcelona odaklı bir projedir.",
} as const satisfies MessageCatalog;
