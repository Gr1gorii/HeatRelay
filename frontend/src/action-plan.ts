import {
  DEFAULT_OUTPUT_LOCALE,
  isOutputLocale,
  type OutputLocale,
} from "./i18n/locale-registry";

export const ACTION_PLAN_ENDPOINT = "/api/v1/action-plan";
export const BARCELONA_DEMO_ORIGIN = {
  latitude: 41.3874,
  longitude: 2.1686,
} as const;
export const BARCELONA_DEMO_MAXIMUM_DISTANCE_M = 3000;
export const SITUATION_TEXT_LIMIT = 2000;

export const SUPPORTED_INPUT_LANGUAGES = [
  "en",
  "es",
  "zh-CN",
  "zh-TW",
  "hi",
  "ar",
  "pt-BR",
  "bn",
  "ru",
  "ja",
  "fr",
  "de",
  "ur",
  "id",
  "tr",
  "ko",
  "it",
  "uk",
  "pl",
  "vi",
  "th",
  "fa",
  "sw",
  "he",
  "nl",
  "ca",
] as const;

export type SupportedInputLanguage =
  (typeof SUPPORTED_INPUT_LANGUAGES)[number];
export type DetectedInputLanguage =
  | SupportedInputLanguage
  | "other"
  | "unknown";
export type InputLanguageSource = "automatically_detected" | "fallback";

export interface SituationLanguageMetadata {
  schema_version: "1.1.0";
  notice: string;
  detected_input_language: DetectedInputLanguage;
  input_language_source: InputLanguageSource;
}

const FIXED_URGENT_CONTACT_FACTS = {
  service: "112 emergències",
  number: "112",
  source_url:
    "https://112.gencat.cat/es/us-del-112/preguntes-frequeents/",
} as const;

interface FixedActionPlanValidationContract {
  situationNotice: string;
  weatherNotice: string;
  urgentContactInstruction: string;
  urgentActions: ReadonlyArray<{ readonly code: string; readonly text: string }>;
  urgentNotices: readonly string[];
}

const FIXED_ACTION_PLAN_VALIDATION_CONTRACTS = {
  en: {
    situationNotice:
      "This output is a structured summary of explicitly reported information. It is not medical advice, an emergency assessment, or an action plan.",
    weatherNotice:
      "This is model-derived weather context from Open-Meteo, not an official heat warning.",
    urgentContactInstruction: "Call 112 now for emergency assistance.",
    urgentActions: [
      {
        code: "contact_emergency_service_now",
        text: "Call 112 now.",
      },
      {
        code: "do_not_use_shelter_as_medical_substitute",
        text: "Climate shelters are not substitutes for medical attention.",
      },
    ],
    urgentNotices: [
      "Climate shelters are not substitutes for medical attention.",
      "Because a bounded warning symptom was explicitly reported, HeatRelay did not retrieve weather or places and did not ask GPT-5.6 for a plan.",
    ],
  },
  es: {
    situationNotice:
      "Este resultado es un resumen estructurado de la información indicada explícitamente. No es asesoramiento médico, una evaluación de emergencia ni un plan de acción.",
    weatherNotice:
      "Este es un contexto meteorológico derivado de modelos de Open-Meteo, no un aviso oficial por calor.",
    urgentContactInstruction:
      "Llama al 112 ahora para solicitar asistencia de emergencia.",
    urgentActions: [
      {
        code: "contact_emergency_service_now",
        text: "Llama al 112 ahora.",
      },
      {
        code: "do_not_use_shelter_as_medical_substitute",
        text: "Los refugios climáticos no sustituyen la atención médica.",
      },
    ],
    urgentNotices: [
      "Los refugios climáticos no sustituyen la atención médica.",
      "Como se informó explícitamente de un síntoma de alarma incluido en el catálogo cerrado, HeatRelay no consultó datos meteorológicos ni lugares y no pidió a GPT-5.6 que generara un plan.",
    ],
  },
  "zh-CN": {
    situationNotice:
      "此输出是对已明确陈述信息的结构化摘要，不是医疗建议、紧急情况评估或行动计划。",
    weatherNotice:
      "这是根据 Open-Meteo 模型推导的天气背景信息，并非官方高温预警。",
    urgentContactInstruction: "立即拨打 112 寻求紧急援助。",
    urgentActions: [
      {
        code: "contact_emergency_service_now",
        text: "立即拨打 112。",
      },
      {
        code: "do_not_use_shelter_as_medical_substitute",
        text: "气候庇护场所不能替代医疗救治。",
      },
    ],
    urgentNotices: [
      "气候庇护场所不能替代医疗救治。",
      "由于明确报告了封闭清单中的一项警示症状，HeatRelay 未获取天气或地点信息，也未要求 GPT-5.6 生成计划。",
    ],
  },
  "zh-TW": {
    situationNotice:
      "此輸出是對已明確陳述資訊的結構化摘要，不是醫療建議、緊急情況評估或行動計畫。",
    weatherNotice:
      "這是根據 Open-Meteo 模型推導的天氣背景資訊，並非官方高溫警告。",
    urgentContactInstruction: "立即撥打 112 尋求緊急協助。",
    urgentActions: [
      {
        code: "contact_emergency_service_now",
        text: "立即撥打 112。",
      },
      {
        code: "do_not_use_shelter_as_medical_substitute",
        text: "氣候庇護場所不能取代醫療照護。",
      },
    ],
    urgentNotices: [
      "氣候庇護場所不能取代醫療照護。",
      "由於明確通報了封閉清單中的一項警示症狀，HeatRelay 未取得天氣或地點資訊，也未要求 GPT-5.6 產生計畫。",
    ],
  },
  hi: {
    situationNotice:
      "यह आउटपुट स्पष्ट रूप से बताई गई जानकारी का संरचित सारांश है। यह चिकित्सीय सलाह, आपातकालीन स्थिति का आकलन या कार्य-योजना नहीं है।",
    weatherNotice:
      "यह Open-Meteo के मॉडल से प्राप्त मौसम संबंधी संदर्भ जानकारी है, कोई आधिकारिक गर्मी की चेतावनी नहीं।",
    urgentContactInstruction:
      "आपातकालीन सहायता के लिए अभी 112 पर कॉल करें।",
    urgentActions: [
      {
        code: "contact_emergency_service_now",
        text: "अभी 112 पर कॉल करें।",
      },
      {
        code: "do_not_use_shelter_as_medical_substitute",
        text: "जलवायु आश्रय स्थल चिकित्सीय देखभाल का विकल्प नहीं हैं।",
      },
    ],
    urgentNotices: [
      "जलवायु आश्रय स्थल चिकित्सीय देखभाल का विकल्प नहीं हैं।",
      "क्योंकि सीमित दायरे वाला एक चेतावनी लक्षण स्पष्ट रूप से बताया गया था, HeatRelay ने मौसम या स्थानों की जानकारी प्राप्त नहीं की और GPT-5.6 से योजना बनाने के लिए नहीं कहा।",
    ],
  },
  bn: {
    situationNotice:
      "এই আউটপুটটি স্পষ্টভাবে জানানো তথ্যের একটি কাঠামোবদ্ধ সারাংশ। এটি চিকিৎসা পরামর্শ, জরুরি পরিস্থিতির মূল্যায়ন বা কোনো অ্যাকশন প্ল্যান নয়।",
    weatherNotice:
      "এটি Open-Meteo-এর মডেল থেকে পাওয়া আবহাওয়া-সংক্রান্ত প্রাসঙ্গিক তথ্য, কোনো অফিশিয়াল তাপ সতর্কতা নয়।",
    urgentContactInstruction:
      "জরুরি সহায়তার জন্য এখনই 112 নম্বরে কল করুন।",
    urgentActions: [
      {
        code: "contact_emergency_service_now",
        text: "এখনই 112 নম্বরে কল করুন।",
      },
      {
        code: "do_not_use_shelter_as_medical_substitute",
        text: "জলবায়ু আশ্রয়স্থল চিকিৎসা সেবার বিকল্প নয়।",
      },
    ],
    urgentNotices: [
      "জলবায়ু আশ্রয়স্থল চিকিৎসা সেবার বিকল্প নয়।",
      "কারণ সীমিত পরিসরের একটি সতর্কতামূলক উপসর্গ স্পষ্টভাবে জানানো হয়েছিল, HeatRelay আবহাওয়া বা স্থান-সংক্রান্ত তথ্য সংগ্রহ করেনি এবং GPT-5.6-কে কোনো পরিকল্পনা তৈরি করতে বলেনি।",
    ],
  },
  ar: {
    situationNotice:
      "هذه المخرجات ملخص منظم للمعلومات التي أُبلغ عنها صراحةً. وهي ليست نصيحة طبية ولا تقييمًا لحالة طارئة ولا خطة عمل.",
    weatherNotice:
      "هذه معلومات سياقية عن الطقس مستمدة من نموذج Open-Meteo، وليست تحذيرًا رسميًا من الحر.",
    urgentContactInstruction:
      "اتصل بالرقم 112 الآن للحصول على مساعدة طارئة.",
    urgentActions: [
      {
        code: "contact_emergency_service_now",
        text: "اتصل بالرقم 112 الآن.",
      },
      {
        code: "do_not_use_shelter_as_medical_substitute",
        text: "الملاجئ المناخية ليست بديلًا عن الرعاية الطبية.",
      },
    ],
    urgentNotices: [
      "الملاجئ المناخية ليست بديلًا عن الرعاية الطبية.",
      "نظرًا للإبلاغ صراحةً عن عرض تحذيري محدود النطاق، لم يسترجع HeatRelay معلومات الطقس أو الأماكن، ولم يطلب من GPT-5.6 إنشاء خطة.",
    ],
  },
  "pt-BR": {
    situationNotice:
      "Esta saída é um resumo estruturado das informações relatadas explicitamente. Não é aconselhamento médico, uma avaliação de emergência nem um plano de ação.",
    weatherNotice:
      "Este é um contexto meteorológico derivado dos modelos da Open-Meteo, não um alerta oficial de calor.",
    urgentContactInstruction:
      "Ligue para o 112 agora para solicitar assistência de emergência.",
    urgentActions: [
      {
        code: "contact_emergency_service_now",
        text: "Ligue para o 112 agora.",
      },
      {
        code: "do_not_use_shelter_as_medical_substitute",
        text: "Os abrigos climáticos não substituem o atendimento médico.",
      },
    ],
    urgentNotices: [
      "Os abrigos climáticos não substituem o atendimento médico.",
      "Como um sintoma de alerta de escopo limitado foi relatado explicitamente, a HeatRelay não consultou informações meteorológicas nem locais e não pediu ao GPT-5.6 que gerasse um plano.",
    ],
  },
  fr: {
    situationNotice:
      "Ce résultat est un résumé structuré des informations explicitement signalées. Il ne s’agit ni d’un conseil médical, ni d’une évaluation d’urgence, ni d’un plan d’action.",
    weatherNotice:
      "Il s’agit d’informations météorologiques contextuelles dérivées des modèles d’Open-Meteo, et non d’une alerte officielle de chaleur.",
    urgentContactInstruction:
      "Appelez immédiatement le 112 pour obtenir une assistance d’urgence.",
    urgentActions: [
      {
        code: "contact_emergency_service_now",
        text: "Appelez immédiatement le 112.",
      },
      {
        code: "do_not_use_shelter_as_medical_substitute",
        text: "Les refuges climatiques ne remplacent pas les soins médicaux.",
      },
    ],
    urgentNotices: [
      "Les refuges climatiques ne remplacent pas les soins médicaux.",
      "Puisqu’un symptôme d’alerte de portée limitée a été explicitement signalé, HeatRelay n’a consulté ni les données météorologiques ni les lieux et n’a pas demandé à GPT-5.6 de générer un plan.",
    ],
  },
  it: {
    situationNotice:
      "Questo output è un riepilogo strutturato delle informazioni riportate esplicitamente. Non costituisce una consulenza medica, una valutazione di emergenza né un piano d’azione.",
    weatherNotice:
      "Questo è un contesto meteorologico derivato dai modelli di Open-Meteo, non un’allerta ufficiale per il caldo.",
    urgentContactInstruction:
      "Chiama subito il 112 per ricevere assistenza d’emergenza.",
    urgentActions: [
      {
        code: "contact_emergency_service_now",
        text: "Chiama subito il 112.",
      },
      {
        code: "do_not_use_shelter_as_medical_substitute",
        text: "I rifugi climatici non sostituiscono l’assistenza medica.",
      },
    ],
    urgentNotices: [
      "I rifugi climatici non sostituiscono l’assistenza medica.",
      "Poiché è stato segnalato esplicitamente un sintomo di allarme circoscritto, HeatRelay non ha recuperato dati meteorologici né informazioni sui luoghi e non ha chiesto a GPT-5.6 di generare un piano.",
    ],
  },
  de: {
    situationNotice:
      "Dieses Ergebnis ist eine strukturierte Zusammenfassung der ausdrücklich angegebenen Informationen. Es handelt sich weder um eine medizinische Beratung noch um eine Notfallbeurteilung noch um einen Aktionsplan.",
    weatherNotice:
      "Dies ist ein aus Open-Meteo-Modellen abgeleiteter Wetterkontext, keine offizielle Hitzewarnung.",
    urgentContactInstruction:
      "Rufen Sie jetzt die 112 an, um Notfallhilfe zu erhalten.",
    urgentActions: [
      {
        code: "contact_emergency_service_now",
        text: "Rufen Sie jetzt die 112 an.",
      },
      {
        code: "do_not_use_shelter_as_medical_substitute",
        text: "Hitzeschutzräume sind kein Ersatz für medizinische Versorgung.",
      },
    ],
    urgentNotices: [
      "Hitzeschutzräume sind kein Ersatz für medizinische Versorgung.",
      "Da ausdrücklich ein klar eingegrenztes Warnsymptom angegeben wurde, hat HeatRelay weder Wetterdaten noch Informationen zu Orten abgerufen und GPT-5.6 nicht um die Erstellung eines Plans gebeten.",
    ],
  },
  nl: {
    situationNotice:
      "Dit resultaat is een gestructureerde samenvatting van expliciet gemelde informatie. Het is geen medisch advies, geen beoordeling van een noodsituatie en geen actieplan.",
    weatherNotice:
      "Dit is weersinformatie die is afgeleid van modellen van Open-Meteo; het is geen officiële hittewaarschuwing.",
    urgentContactInstruction: "Bel nu 112 voor hulp in een noodsituatie.",
    urgentActions: [
      {
        code: "contact_emergency_service_now",
        text: "Bel nu 112.",
      },
      {
        code: "do_not_use_shelter_as_medical_substitute",
        text: "Klimaatschuilplaatsen zijn geen vervanging voor medische zorg.",
      },
    ],
    urgentNotices: [
      "Klimaatschuilplaatsen zijn geen vervanging voor medische zorg.",
      "Omdat expliciet een begrensd waarschuwingssymptoom is gemeld, heeft HeatRelay geen weersgegevens of informatie over locaties opgehaald en GPT-5.6 niet om een plan gevraagd.",
    ],
  },
  ru: {
    situationNotice:
      "Этот результат — структурированное резюме явно указанных сведений. Он не является медицинской рекомендацией, оценкой экстренной ситуации или планом действий.",
    weatherNotice:
      "Это полученные на основе моделей Open-Meteo сведения о погоде, а не официальное предупреждение о жаре.",
    urgentContactInstruction:
      "Немедленно позвоните по номеру 112, чтобы получить экстренную помощь.",
    urgentActions: [
      {
        code: "contact_emergency_service_now",
        text: "Немедленно позвоните по номеру 112.",
      },
      {
        code: "do_not_use_shelter_as_medical_substitute",
        text: "Климатические убежища не заменяют медицинскую помощь.",
      },
    ],
    urgentNotices: [
      "Климатические убежища не заменяют медицинскую помощь.",
      "Поскольку был явно указан тревожный симптом из ограниченного набора, HeatRelay не запрашивал ни данные о погоде, ни сведения о местах и не просил GPT-5.6 создать план.",
    ],
  },
  uk: {
    situationNotice:
      "Цей результат є структурованим зведенням явно повідомленої інформації. Він не є медичною порадою, оцінкою надзвичайної ситуації чи планом дій.",
    weatherNotice:
      "Це контекст погоди, отриманий із моделей Open-Meteo, а не офіційне попередження про спеку.",
    urgentContactInstruction:
      "Негайно зателефонуйте за номером 112, щоб отримати екстрену допомогу.",
    urgentActions: [
      {
        code: "contact_emergency_service_now",
        text: "Негайно зателефонуйте за номером 112.",
      },
      {
        code: "do_not_use_shelter_as_medical_substitute",
        text: "Кліматичні укриття не замінюють медичної допомоги.",
      },
    ],
    urgentNotices: [
      "Кліматичні укриття не замінюють медичної допомоги.",
      "Оскільки про тривожний симптом з обмеженого переліку було явно повідомлено, HeatRelay не отримував даних про погоду чи місця й не просив GPT-5.6 створити план.",
    ],
  },
  pl: {
    situationNotice:
      "Ten wynik jest ustrukturyzowanym podsumowaniem wyraźnie zgłoszonych informacji. Nie stanowi porady medycznej, oceny sytuacji nagłej ani planu działania.",
    weatherNotice:
      "Są to informacje pogodowe pochodzące z modeli Open-Meteo, a nie oficjalne ostrzeżenie przed upałem.",
    urgentContactInstruction:
      "Zadzwoń teraz pod numer 112, aby uzyskać pomoc w nagłej sytuacji.",
    urgentActions: [
      {
        code: "contact_emergency_service_now",
        text: "Zadzwoń teraz pod numer 112.",
      },
      {
        code: "do_not_use_shelter_as_medical_substitute",
        text: "Schronienia klimatyczne nie zastępują pomocy medycznej.",
      },
    ],
    urgentNotices: [
      "Schronienia klimatyczne nie zastępują pomocy medycznej.",
      "Ponieważ wyraźnie zgłoszono objaw ostrzegawczy objęty ograniczonym zakresem, HeatRelay nie pobrał danych pogodowych ani informacji o miejscach i nie poprosił GPT-5.6 o utworzenie planu.",
    ],
  },
  ja: {
    situationNotice:
      "この出力は、明示的に報告された情報を構造化した要約です。医療上の助言、緊急事態の評価、またはアクションプランではありません。",
    weatherNotice:
      "これは Open-Meteo のモデルに基づく天気情報であり、公式の暑さ警報ではありません。",
    urgentContactInstruction:
      "緊急支援を要請するため、今すぐ 112 に電話してください。",
    urgentActions: [
      {
        code: "contact_emergency_service_now",
        text: "今すぐ 112 に電話してください。",
      },
      {
        code: "do_not_use_shelter_as_medical_substitute",
        text: "気候シェルターは医療を受けることの代わりにはなりません。",
      },
    ],
    urgentNotices: [
      "気候シェルターは医療を受けることの代わりにはなりません。",
      "限定的な注意症状が明示的に報告されたため、HeatRelay は天気情報も場所情報も取得せず、GPT-5.6 にプランの作成を依頼しませんでした。",
    ],
  },
  ko: {
    situationNotice:
      "이 출력은 명시적으로 보고된 정보를 구조화한 요약입니다. 의료 조언, 응급 상황 평가 또는 행동 계획이 아닙니다.",
    weatherNotice:
      "이는 Open-Meteo 모델에서 산출된 날씨 맥락 정보이며 공식 폭염 경보가 아닙니다.",
    urgentContactInstruction:
      "긴급 지원을 받으려면 지금 112로 전화하세요.",
    urgentActions: [
      {
        code: "contact_emergency_service_now",
        text: "지금 112로 전화하세요.",
      },
      {
        code: "do_not_use_shelter_as_medical_substitute",
        text: "기후 쉼터는 의료 처치를 대신할 수 없습니다.",
      },
    ],
    urgentNotices: [
      "기후 쉼터는 의료 처치를 대신할 수 없습니다.",
      "범위가 한정된 경고 증상이 명시적으로 보고되었기 때문에 HeatRelay는 날씨나 장소 정보를 조회하지 않았고 GPT-5.6에 계획 생성을 요청하지 않았습니다.",
    ],
  },
  id: {
    situationNotice:
      "Keluaran ini adalah ringkasan terstruktur dari informasi yang dilaporkan secara eksplisit. Ini bukan nasihat medis, penilaian keadaan darurat, atau rencana tindakan.",
    weatherNotice:
      "Ini adalah konteks cuaca yang berasal dari model Open-Meteo, bukan peringatan panas resmi.",
    urgentContactInstruction:
      "Hubungi 112 sekarang untuk mendapatkan bantuan darurat.",
    urgentActions: [
      {
        code: "contact_emergency_service_now",
        text: "Hubungi 112 sekarang.",
      },
      {
        code: "do_not_use_shelter_as_medical_substitute",
        text: "Tempat perlindungan iklim bukan pengganti perawatan medis.",
      },
    ],
    urgentNotices: [
      "Tempat perlindungan iklim bukan pengganti perawatan medis.",
      "Karena sebuah gejala peringatan dalam batas yang ditentukan dilaporkan secara eksplisit, HeatRelay tidak mengambil informasi cuaca maupun informasi tentang tempat dan tidak meminta GPT-5.6 membuat rencana.",
    ],
  },
  vi: {
    situationNotice:
      "Đầu ra này là bản tóm tắt có cấu trúc về thông tin được báo cáo một cách rõ ràng. Đây không phải là lời khuyên y tế, đánh giá tình trạng khẩn cấp hay kế hoạch hành động.",
    weatherNotice:
      "Đây là thông tin bối cảnh thời tiết được suy ra từ mô hình của Open-Meteo, không phải cảnh báo nắng nóng chính thức.",
    urgentContactInstruction:
      "Hãy gọi 112 ngay để được trợ giúp khẩn cấp.",
    urgentActions: [
      {
        code: "contact_emergency_service_now",
        text: "Hãy gọi 112 ngay.",
      },
      {
        code: "do_not_use_shelter_as_medical_substitute",
        text: "Các nơi trú ẩn khí hậu không thể thay thế việc chăm sóc y tế.",
      },
    ],
    urgentNotices: [
      "Các nơi trú ẩn khí hậu không thể thay thế việc chăm sóc y tế.",
      "Vì một triệu chứng cảnh báo trong phạm vi giới hạn đã được báo cáo rõ ràng, HeatRelay đã không truy xuất thông tin thời tiết hoặc địa điểm và không yêu cầu GPT-5.6 tạo kế hoạch.",
    ],
  },
  th: {
    situationNotice:
      "ผลลัพธ์นี้เป็นบทสรุปแบบมีโครงสร้างของข้อมูลที่รายงานไว้อย่างชัดเจน ผลลัพธ์นี้ไม่ใช่คำแนะนำทางการแพทย์ การประเมินเหตุฉุกเฉิน หรือแผนปฏิบัติการ",
    weatherNotice:
      "นี่คือข้อมูลประกอบด้านสภาพอากาศที่ได้จากแบบจำลองของ Open-Meteo ไม่ใช่คำเตือนเรื่องความร้อนอย่างเป็นทางการ",
    urgentContactInstruction: "โทร 112 ทันทีเพื่อขอความช่วยเหลือฉุกเฉิน",
    urgentActions: [
      {
        code: "contact_emergency_service_now",
        text: "โทร 112 ทันที",
      },
      {
        code: "do_not_use_shelter_as_medical_substitute",
        text: "สถานที่หลบภัยจากความร้อนไม่สามารถใช้แทนการดูแลทางการแพทย์ได้",
      },
    ],
    urgentNotices: [
      "สถานที่หลบภัยจากความร้อนไม่สามารถใช้แทนการดูแลทางการแพทย์ได้",
      "เนื่องจากมีการรายงานอย่างชัดเจนถึงอาการเตือนที่อยู่ภายในขอบเขตที่กำหนด HeatRelay จึงไม่ได้ดึงข้อมูลสภาพอากาศหรือสถานที่ และไม่ได้ขอให้ GPT-5.6 สร้างแผน",
    ],
  },
  tr: {
    situationNotice:
      "Bu çıktı, açıkça bildirilen bilgilerin yapılandırılmış bir özetidir. Tıbbi tavsiye, acil durum değerlendirmesi veya eylem planı değildir.",
    weatherNotice:
      "Bu, Open-Meteo modellerinden türetilen hava durumu bağlamıdır; resmî bir sıcak hava uyarısı değildir.",
    urgentContactInstruction:
      "Acil yardım almak için hemen 112’yi arayın.",
    urgentActions: [
      {
        code: "contact_emergency_service_now",
        text: "Hemen 112’yi arayın.",
      },
      {
        code: "do_not_use_shelter_as_medical_substitute",
        text: "İklim sığınakları tıbbi bakımın yerini tutmaz.",
      },
    ],
    urgentNotices: [
      "İklim sığınakları tıbbi bakımın yerini tutmaz.",
      "Kapsamı belirli bir uyarı belirtisi açıkça bildirildiği için HeatRelay ne hava durumu bilgilerini ne de yer bilgilerini aldı ve GPT-5.6’dan bir plan oluşturmasını istemedi.",
    ],
  },
  sw: {
    situationNotice:
      "Matokeo haya ni muhtasari wenye muundo wa taarifa zilizoripotiwa wazi. Si ushauri wa kitabibu, tathmini ya dharura wala mpango wa hatua.",
    weatherNotice:
      "Haya ni maelezo ya muktadha wa hali ya hewa yanayotokana na modeli ya Open-Meteo, si onyo rasmi la joto.",
    urgentContactInstruction:
      "Piga simu 112 sasa ili upate msaada wa dharura.",
    urgentActions: [
      {
        code: "contact_emergency_service_now",
        text: "Piga simu 112 sasa.",
      },
      {
        code: "do_not_use_shelter_as_medical_substitute",
        text: "Makazi ya kujikinga na hali ya hewa si mbadala wa huduma ya matibabu.",
      },
    ],
    urgentNotices: [
      "Makazi ya kujikinga na hali ya hewa si mbadala wa huduma ya matibabu.",
      "Kwa sababu dalili ya tahadhari iliyo katika mipaka iliyowekwa iliripotiwa wazi, HeatRelay haikupata taarifa za hali ya hewa au maeneo na haikuiomba GPT-5.6 itengeneze mpango.",
    ],
  },
  ur: {
    situationNotice:
      "یہ نتیجہ واضح طور پر بتائی گئی معلومات کا ایک منظم خلاصہ ہے۔ یہ طبی مشورہ، ہنگامی صورت حال کا جائزہ یا عملی منصوبہ نہیں ہے۔",
    weatherNotice:
      "یہ Open-Meteo کے ماڈلز سے اخذ کردہ موسمی معلومات ہیں، گرمی کی کوئی سرکاری تنبیہ نہیں۔",
    urgentContactInstruction: "ہنگامی مدد کے لیے فوراً 112 پر کال کریں۔",
    urgentActions: [
      {
        code: "contact_emergency_service_now",
        text: "فوراً 112 پر کال کریں۔",
      },
      {
        code: "do_not_use_shelter_as_medical_substitute",
        text: "گرمی سے بچاؤ کی پناہ گاہیں طبی نگہداشت کا متبادل نہیں ہیں۔",
      },
    ],
    urgentNotices: [
      "گرمی سے بچاؤ کی پناہ گاہیں طبی نگہداشت کا متبادل نہیں ہیں۔",
      "چونکہ ایک محدود انتباہی علامت واضح طور پر بتائی گئی تھی، HeatRelay نے نہ موسم کی معلومات حاصل کیں اور نہ مقامات کے بارے میں معلومات، اور GPT-5.6 سے منصوبہ بنانے کو بھی نہیں کہا۔",
    ],
  },
  fa: {
    situationNotice:
      "این خروجی خلاصه‌ای ساختاریافته از اطلاعاتی است که به‌صراحت گزارش شده‌اند. این خروجی توصیه پزشکی، ارزیابی وضعیت اضطراری یا برنامه اقدام نیست.",
    weatherNotice:
      "این اطلاعات زمینه‌ای آب‌وهوا از مدل‌های Open-Meteo به دست آمده است و هشدار رسمی گرما نیست.",
    urgentContactInstruction:
      "برای دریافت کمک اضطراری، اکنون با 112 تماس بگیرید.",
    urgentActions: [
      {
        code: "contact_emergency_service_now",
        text: "اکنون با 112 تماس بگیرید.",
      },
      {
        code: "do_not_use_shelter_as_medical_substitute",
        text: "پناهگاه‌های اقلیمی جایگزین مراقبت پزشکی نیستند.",
      },
    ],
    urgentNotices: [
      "پناهگاه‌های اقلیمی جایگزین مراقبت پزشکی نیستند.",
      "از آنجا که یک علامت هشدار محدود به‌صراحت گزارش شد، HeatRelay اطلاعات آب‌وهوا یا مکان‌ها را دریافت نکرد و از GPT-5.6 نخواست برنامه‌ای ایجاد کند.",
    ],
  },
  he: {
    situationNotice:
      "פלט זה הוא סיכום מובנה של המידע שנמסר במפורש. הוא אינו ייעוץ רפואי, הערכת מצב חירום או תוכנית פעולה.",
    weatherNotice:
      "זהו מידע על מזג האוויר שנגזר ממודלים של Open-Meteo, ולא אזהרת חום רשמית.",
    urgentContactInstruction:
      "התקשרו עכשיו למספר 112 לקבלת עזרה בחירום.",
    urgentActions: [
      {
        code: "contact_emergency_service_now",
        text: "התקשרו עכשיו למספר 112.",
      },
      {
        code: "do_not_use_shelter_as_medical_substitute",
        text: "מחסי אקלים אינם תחליף לטיפול רפואי.",
      },
    ],
    urgentNotices: [
      "מחסי אקלים אינם תחליף לטיפול רפואי.",
      "מאחר שתסמין אזהרה מוגבל דווח במפורש, HeatRelay לא אחזר נתוני מזג אוויר או מידע על מקומות ולא ביקש מ-GPT-5.6 ליצור תוכנית.",
    ],
  },
} as const satisfies Record<OutputLocale, FixedActionPlanValidationContract>;

export type PriorityCode =
  | "act_now"
  | "prepare_now"
  | "monitor_and_prepare";

export interface HydratedAction {
  code: string;
  text: string;
  explanation: string;
}

export interface PlanPhase {
  actions: HydratedAction[];
}

export interface SelectedPlace {
  place_id: string;
  name: string;
  address: {
    street: string | null;
    number: string | null;
    postal_code: string | null;
    city: string | null;
  };
  district: string | null;
  neighborhood: string | null;
  distance_m: number;
  closes_at: string;
  accessibility: boolean | null;
  features: {
    indoor_space: boolean | null;
    potable_water: boolean | null;
    toilets: boolean | null;
    micro_shelter: boolean | null;
    pets_allowed: boolean | null;
  };
  information_url: string | null;
  source_url: string;
  last_checked: string;
}

export interface NormalActionPlanResponse {
  schema_version: "1.16.0";
  output_locale: OutputLocale;
  branch: "normal";
  evaluation_time: string;
  situation: SituationLanguageMetadata;
  priority: { priority: PriorityCode };
  weather: {
    current: {
      temperature_c: number;
      apparent_temperature_c: number;
    };
    today: { temperature_max_c: number };
    notice: string;
  };
  plan: {
    now: PlanPhase;
    next_few_hours: PlanPhase;
    tonight: PlanPhase;
    bring_items: Array<{ code: string; text: string }>;
    explanations: Array<{ code: string; text: string }>;
    local_phrase: {
      code: string;
      language: "es" | "ca";
      text: string;
    } | null;
    notice: string;
  };
  selected_place: SelectedPlace | null;
  candidate_context: {
    explanation: string;
    hours_warning: string;
    candidate_notice: string;
    distance_warning: string;
    reachability_warning: string;
  };
  notices: string[];
}

export interface UrgentActionPlanResponse {
  schema_version: "1.16.0";
  output_locale: OutputLocale;
  branch: "urgent";
  evaluation_time: string;
  situation: SituationLanguageMetadata;
  urgent_contact: {
    service: string;
    number: string;
    instruction: string;
    source_url: string;
  };
  actions: Array<{ code: string; text: string }>;
  notices: string[];
}

export type ActionPlanResponse =
  | NormalActionPlanResponse
  | UrgentActionPlanResponse;

export type ActionPlanClientErrorKind =
  | "invalid_input"
  | "unavailable"
  | "malformed_response";

export class ActionPlanClientError extends Error {
  readonly kind: ActionPlanClientErrorKind;

  constructor(kind: ActionPlanClientErrorKind) {
    super(kind);
    this.name = "ActionPlanClientError";
    this.kind = kind;
  }
}

export function countCodePoints(value: string): number {
  return Array.from(value).length;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isString(value: unknown): value is string {
  return typeof value === "string";
}

function isNullableString(value: unknown): value is string | null {
  return value === null || isString(value);
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(isString);
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isSupportedInputLanguage(
  value: unknown,
): value is SupportedInputLanguage {
  return (
    typeof value === "string" &&
    (SUPPORTED_INPUT_LANGUAGES as readonly string[]).includes(value)
  );
}

function isDetectedInputLanguage(
  value: unknown,
): value is DetectedInputLanguage {
  return (
    isSupportedInputLanguage(value) || value === "other" || value === "unknown"
  );
}

function isInputLanguageSource(value: unknown): value is InputLanguageSource {
  return value === "automatically_detected" || value === "fallback";
}

function isSituationLanguageMetadata(
  value: unknown,
  expectedNotice: string,
): value is SituationLanguageMetadata {
  if (
    !isRecord(value) ||
    value.schema_version !== "1.1.0" ||
    value.notice !== expectedNotice ||
    !isDetectedInputLanguage(value.detected_input_language) ||
    !isInputLanguageSource(value.input_language_source)
  ) {
    return false;
  }

  return value.detected_input_language === "unknown"
    ? value.input_language_source === "fallback"
    : value.input_language_source === "automatically_detected";
}

function isStrictIsoDateTime(value: unknown): value is string {
  if (!isString(value)) {
    return false;
  }
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d+)?(Z|[+-](\d{2}):(\d{2}))$/.exec(
    value,
  );
  if (!match) {
    return false;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const hour = Number(match[4]);
  const minute = Number(match[5]);
  const second = Number(match[6]);
  const isLeapYear =
    year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const daysInMonth = [
    31,
    isLeapYear ? 29 : 28,
    31,
    30,
    31,
    30,
    31,
    31,
    30,
    31,
    30,
    31,
  ];
  if (
    year < 1 ||
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > daysInMonth[month - 1] ||
    hour > 23 ||
    minute > 59 ||
    second > 59
  ) {
    return false;
  }
  if (
    match[7] !== "Z" &&
    (Number(match[8]) > 23 || Number(match[9]) > 59)
  ) {
    return false;
  }
  return !Number.isNaN(Date.parse(value));
}

function isDateOnly(value: unknown): value is string {
  if (!isString(value) || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }
  const timestamp = Date.parse(`${value}T00:00:00Z`);
  return (
    !Number.isNaN(timestamp) &&
    new Date(timestamp).toISOString().slice(0, 10) === value
  );
}

function isSafeHttpUrl(value: unknown): value is string {
  if (
    !isString(value) ||
    value !== value.trim() ||
    /[\u0000-\u001f\u007f]/.test(value)
  ) {
    return false;
  }
  try {
    const parsed = new URL(value);
    return (
      (parsed.protocol === "http:" || parsed.protocol === "https:") &&
      parsed.username === "" &&
      parsed.password === ""
    );
  } catch {
    return false;
  }
}

function isAction(value: unknown): value is HydratedAction {
  return (
    isRecord(value) &&
    isString(value.code) &&
    isString(value.text) &&
    isString(value.explanation)
  );
}

function isPhase(value: unknown): value is PlanPhase {
  return (
    isRecord(value) && Array.isArray(value.actions) && value.actions.every(isAction)
  );
}

function hasTextItems(value: unknown): value is Array<{ code: string; text: string }> {
  return (
    Array.isArray(value) &&
    value.every(
      (item) => isRecord(item) && isString(item.code) && isString(item.text),
    )
  );
}

function hasExactTextItems(
  value: unknown,
  expected: ReadonlyArray<{ readonly code: string; readonly text: string }>,
): boolean {
  return (
    Array.isArray(value) &&
    value.length === expected.length &&
    value.every(
      (item, index) =>
        isRecord(item) &&
        item.code === expected[index].code &&
        item.text === expected[index].text,
    )
  );
}

function hasExactStrings(
  value: unknown,
  expected: readonly string[],
): boolean {
  return (
    Array.isArray(value) &&
    value.length === expected.length &&
    value.every((item, index) => item === expected[index])
  );
}

function isSelectedPlace(value: unknown): value is SelectedPlace {
  if (!isRecord(value) || !isRecord(value.address) || !isRecord(value.features)) {
    return false;
  }
  const address = value.address;
  const features = value.features;
  const featureValues = [
    features.indoor_space,
    features.potable_water,
    features.toilets,
    features.micro_shelter,
    features.pets_allowed,
  ];
  return (
    isString(value.place_id) &&
    isString(value.name) &&
    isNullableString(address.street) &&
    isNullableString(address.number) &&
    isNullableString(address.postal_code) &&
    isNullableString(address.city) &&
    isNullableString(value.district) &&
    isNullableString(value.neighborhood) &&
    isFiniteNumber(value.distance_m) &&
    value.distance_m >= 0 &&
    isStrictIsoDateTime(value.closes_at) &&
    (value.accessibility === null || typeof value.accessibility === "boolean") &&
    featureValues.every(
      (feature) => feature === null || typeof feature === "boolean",
    ) &&
    (value.information_url === null || isSafeHttpUrl(value.information_url)) &&
    isSafeHttpUrl(value.source_url) &&
    isDateOnly(value.last_checked)
  );
}

function isNormalResponse(value: Record<string, unknown>): boolean {
  if (
    value.schema_version !== "1.16.0" ||
    !isOutputLocale(value.output_locale) ||
    value.branch !== "normal" ||
    !isStrictIsoDateTime(value.evaluation_time) ||
    !isRecord(value.priority) ||
    !isRecord(value.weather) ||
    !isRecord(value.plan) ||
    !isRecord(value.candidate_context) ||
    !isStringArray(value.notices)
  ) {
    return false;
  }
  const validationContract =
    FIXED_ACTION_PLAN_VALIDATION_CONTRACTS[value.output_locale];
  if (
    !isSituationLanguageMetadata(
      value.situation,
      validationContract.situationNotice,
    )
  ) {
    return false;
  }
  const priority = value.priority.priority;
  const weather = value.weather;
  const plan = value.plan;
  const candidateContext = value.candidate_context;
  if (
    !["act_now", "prepare_now", "monitor_and_prepare"].includes(
      String(priority),
    ) ||
    !isRecord(weather.current) ||
    !isRecord(weather.today) ||
    !isFiniteNumber(weather.current.temperature_c) ||
    !isFiniteNumber(weather.current.apparent_temperature_c) ||
    !isFiniteNumber(weather.today.temperature_max_c) ||
    weather.notice !== validationContract.weatherNotice ||
    !isPhase(plan.now) ||
    !isPhase(plan.next_few_hours) ||
    !isPhase(plan.tonight) ||
    !hasTextItems(plan.bring_items) ||
    !hasTextItems(plan.explanations) ||
    !isString(plan.notice) ||
    !isString(candidateContext.explanation) ||
    !isString(candidateContext.hours_warning) ||
    !isString(candidateContext.candidate_notice) ||
    !isString(candidateContext.distance_warning) ||
    !isString(candidateContext.reachability_warning)
  ) {
    return false;
  }
  if (
    plan.local_phrase !== null &&
    (!isRecord(plan.local_phrase) ||
      !isString(plan.local_phrase.code) ||
      !["es", "ca"].includes(String(plan.local_phrase.language)) ||
      !isString(plan.local_phrase.text))
  ) {
    return false;
  }
  return value.selected_place === null || isSelectedPlace(value.selected_place);
}

function isUrgentResponse(value: Record<string, unknown>): boolean {
  if (
    value.schema_version !== "1.16.0" ||
    !isOutputLocale(value.output_locale) ||
    value.branch !== "urgent" ||
    !isStrictIsoDateTime(value.evaluation_time) ||
    !isRecord(value.urgent_contact)
  ) {
    return false;
  }
  const validationContract =
    FIXED_ACTION_PLAN_VALIDATION_CONTRACTS[value.output_locale];
  if (
    !isSituationLanguageMetadata(
      value.situation,
      validationContract.situationNotice,
    ) ||
    !hasExactTextItems(value.actions, validationContract.urgentActions) ||
    !hasExactStrings(value.notices, validationContract.urgentNotices)
  ) {
    return false;
  }
  const contact = value.urgent_contact;
  return (
    contact.service === FIXED_URGENT_CONTACT_FACTS.service &&
    contact.number === FIXED_URGENT_CONTACT_FACTS.number &&
    contact.instruction === validationContract.urgentContactInstruction &&
    contact.source_url === FIXED_URGENT_CONTACT_FACTS.source_url
  );
}

export function parseActionPlanResponse(value: unknown): ActionPlanResponse | null {
  if (!isRecord(value)) {
    return null;
  }
  if (isUrgentResponse(value)) {
    return value as unknown as UrgentActionPlanResponse;
  }
  if (isNormalResponse(value)) {
    return value as unknown as NormalActionPlanResponse;
  }
  return null;
}

export async function createActionPlan(
  situationText: string,
  outputLocale: OutputLocale = DEFAULT_OUTPUT_LOCALE,
): Promise<ActionPlanResponse> {
  const response = await fetch(ACTION_PLAN_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      situation_text: situationText,
      origin: BARCELONA_DEMO_ORIGIN,
      maximum_distance_m: BARCELONA_DEMO_MAXIMUM_DISTANCE_M,
      output_locale: outputLocale,
    }),
  });

  if (!response.ok) {
    throw new ActionPlanClientError(
      response.status === 400 || response.status === 422
        ? "invalid_input"
        : "unavailable",
    );
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new ActionPlanClientError("malformed_response");
  }
  const parsed = parseActionPlanResponse(payload);
  if (parsed === null || parsed.output_locale !== outputLocale) {
    throw new ActionPlanClientError("malformed_response");
  }
  return parsed;
}
