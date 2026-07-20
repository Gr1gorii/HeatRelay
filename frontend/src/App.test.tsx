import {
  act,
  cleanup,
  fireEvent,
  render as renderWithTestingLibrary,
  screen,
  waitFor,
} from "@testing-library/react";
import type { i18n } from "i18next";
import type { ReactElement } from "react";
import { I18nextProvider } from "react-i18next";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import App, { classifyLanguageContext } from "./App";
import appSource from "./App.tsx?raw";
import {
  SUPPORTED_INPUT_LANGUAGES,
  createActionPlan,
  parseActionPlanResponse,
  type DetectedInputLanguage,
  type InputLanguageSource,
} from "./action-plan";
import { ARABIC_CATALOG } from "./i18n/catalogs/ar";
import { ENGLISH_CATALOG } from "./i18n/catalogs/en";
import { PERSIAN_CATALOG } from "./i18n/catalogs/fa";
import { HEBREW_CATALOG } from "./i18n/catalogs/he";
import { SPANISH_CATALOG } from "./i18n/catalogs/es";
import { URDU_CATALOG } from "./i18n/catalogs/ur";
import {
  DEFAULT_OUTPUT_LOCALE,
  INTERFACE_LOCALE_STORAGE_KEY,
  LOCALE_REGISTRY,
  OUTPUT_LOCALE_STORAGE_KEY,
  SUPPORTED_INTERFACE_LOCALES,
  SUPPORTED_OUTPUT_LOCALES,
  type InterfaceLocale,
  type OutputLocale,
} from "./i18n/locale-registry";
import {
  createI18nRuntime,
  synchronizeDocumentLocalization,
} from "./i18n/runtime";
import { formatDistance, formatNumber } from "./i18n/formatters";
import {
  VISUAL_MODE_STORAGE_KEY,
  type VisualMode,
} from "./visual-mode";

const DEMO_TEXT = ENGLISH_CATALOG["form.demoText"];
const SYNTHETIC_SITUATION = "A synthetic heat-planning description.";
const testProcess = Reflect.get(globalThis, "process");
const stylesSource: string = testProcess
  .getBuiltinModule("fs")
  .readFileSync(`${testProcess.cwd()}/src/styles.css`, "utf8");
const RTL_INTERFACE_CASES = [
  ["ar", ARABIC_CATALOG],
  ["ur", URDU_CATALOG],
  ["fa", PERSIAN_CATALOG],
  ["he", HEBREW_CATALOG],
] as const;

const SITUATION_NOTICE =
  "This output is a structured summary of explicitly reported information. It is not medical advice, an emergency assessment, or an action plan.";
const WEATHER_NOTICE =
  "This is model-derived weather context from Open-Meteo, not an official heat warning.";
const SPANISH_SITUATION_NOTICE =
  "Este resultado es un resumen estructurado de la información indicada explícitamente. No es asesoramiento médico, una evaluación de emergencia ni un plan de acción.";
const SPANISH_WEATHER_NOTICE =
  "Este es un contexto meteorológico derivado de modelos de Open-Meteo, no un aviso oficial por calor.";
const SPANISH_URGENT_CONTACT_INSTRUCTION =
  "Llama al 112 ahora para solicitar asistencia de emergencia.";
const SPANISH_URGENT_MEDICAL_NOTICE =
  "Los refugios climáticos no sustituyen la atención médica.";
const SPANISH_URGENT_POLICY_NOTICE =
  "Como se informó explícitamente de un síntoma de alarma incluido en el catálogo cerrado, HeatRelay no consultó datos meteorológicos ni lugares y no pidió a GPT-5.6 que generara un plan.";
const SIMPLIFIED_CHINESE_SITUATION_NOTICE =
  "此输出是对已明确陈述信息的结构化摘要，不是医疗建议、紧急情况评估或行动计划。";
const SIMPLIFIED_CHINESE_WEATHER_NOTICE =
  "这是根据 Open-Meteo 模型推导的天气背景信息，并非官方高温预警。";
const SIMPLIFIED_CHINESE_URGENT_CONTACT_INSTRUCTION =
  "立即拨打 112 寻求紧急援助。";
const SIMPLIFIED_CHINESE_URGENT_MEDICAL_NOTICE =
  "气候庇护场所不能替代医疗救治。";
const SIMPLIFIED_CHINESE_URGENT_POLICY_NOTICE =
  "由于明确报告了封闭清单中的一项警示症状，HeatRelay 未获取天气或地点信息，也未要求 GPT-5.6 生成计划。";
const TRADITIONAL_CHINESE_SITUATION_NOTICE =
  "此輸出是對已明確陳述資訊的結構化摘要，不是醫療建議、緊急情況評估或行動計畫。";
const TRADITIONAL_CHINESE_WEATHER_NOTICE =
  "這是根據 Open-Meteo 模型推導的天氣背景資訊，並非官方高溫警告。";
const TRADITIONAL_CHINESE_URGENT_CONTACT_INSTRUCTION =
  "立即撥打 112 尋求緊急協助。";
const TRADITIONAL_CHINESE_URGENT_MEDICAL_NOTICE =
  "氣候庇護場所不能取代醫療照護。";
const TRADITIONAL_CHINESE_URGENT_POLICY_NOTICE =
  "由於明確通報了封閉清單中的一項警示症狀，HeatRelay 未取得天氣或地點資訊，也未要求 GPT-5.6 產生計畫。";
const HINDI_SITUATION_NOTICE =
  "यह आउटपुट स्पष्ट रूप से बताई गई जानकारी का संरचित सारांश है। यह चिकित्सीय सलाह, आपातकालीन स्थिति का आकलन या कार्य-योजना नहीं है।";
const HINDI_WEATHER_NOTICE =
  "यह Open-Meteo के मॉडल से प्राप्त मौसम संबंधी संदर्भ जानकारी है, कोई आधिकारिक गर्मी की चेतावनी नहीं।";
const HINDI_URGENT_CONTACT_INSTRUCTION =
  "आपातकालीन सहायता के लिए अभी 112 पर कॉल करें।";
const HINDI_URGENT_MEDICAL_NOTICE =
  "जलवायु आश्रय स्थल चिकित्सीय देखभाल का विकल्प नहीं हैं।";
const HINDI_URGENT_POLICY_NOTICE =
  "क्योंकि सीमित दायरे वाला एक चेतावनी लक्षण स्पष्ट रूप से बताया गया था, HeatRelay ने मौसम या स्थानों की जानकारी प्राप्त नहीं की और GPT-5.6 से योजना बनाने के लिए नहीं कहा।";
const BENGALI_SITUATION_NOTICE =
  "এই আউটপুটটি স্পষ্টভাবে জানানো তথ্যের একটি কাঠামোবদ্ধ সারাংশ। এটি চিকিৎসা পরামর্শ, জরুরি পরিস্থিতির মূল্যায়ন বা কোনো অ্যাকশন প্ল্যান নয়।";
const BENGALI_WEATHER_NOTICE =
  "এটি Open-Meteo-এর মডেল থেকে পাওয়া আবহাওয়া-সংক্রান্ত প্রাসঙ্গিক তথ্য, কোনো অফিশিয়াল তাপ সতর্কতা নয়।";
const BENGALI_URGENT_CONTACT_INSTRUCTION =
  "জরুরি সহায়তার জন্য এখনই 112 নম্বরে কল করুন।";
const BENGALI_URGENT_MEDICAL_NOTICE =
  "জলবায়ু আশ্রয়স্থল চিকিৎসা সেবার বিকল্প নয়।";
const BENGALI_URGENT_POLICY_NOTICE =
  "কারণ সীমিত পরিসরের একটি সতর্কতামূলক উপসর্গ স্পষ্টভাবে জানানো হয়েছিল, HeatRelay আবহাওয়া বা স্থান-সংক্রান্ত তথ্য সংগ্রহ করেনি এবং GPT-5.6-কে কোনো পরিকল্পনা তৈরি করতে বলেনি।";
const ARABIC_SITUATION_NOTICE =
  "هذه المخرجات ملخص منظم للمعلومات التي أُبلغ عنها صراحةً. وهي ليست نصيحة طبية ولا تقييمًا لحالة طارئة ولا خطة عمل.";
const ARABIC_WEATHER_NOTICE =
  "هذه معلومات سياقية عن الطقس مستمدة من نموذج Open-Meteo، وليست تحذيرًا رسميًا من الحر.";
const ARABIC_URGENT_CONTACT_INSTRUCTION =
  "اتصل بالرقم 112 الآن للحصول على مساعدة طارئة.";
const ARABIC_URGENT_MEDICAL_NOTICE =
  "الملاجئ المناخية ليست بديلًا عن الرعاية الطبية.";
const ARABIC_URGENT_POLICY_NOTICE =
  "نظرًا للإبلاغ صراحةً عن عرض تحذيري محدود النطاق، لم يسترجع HeatRelay معلومات الطقس أو الأماكن، ولم يطلب من GPT-5.6 إنشاء خطة.";
const BRAZILIAN_PORTUGUESE_SITUATION_NOTICE =
  "Esta saída é um resumo estruturado das informações relatadas explicitamente. Não é aconselhamento médico, uma avaliação de emergência nem um plano de ação.";
const BRAZILIAN_PORTUGUESE_WEATHER_NOTICE =
  "Este é um contexto meteorológico derivado dos modelos da Open-Meteo, não um alerta oficial de calor.";
const BRAZILIAN_PORTUGUESE_URGENT_CONTACT_INSTRUCTION =
  "Ligue para o 112 agora para solicitar assistência de emergência.";
const BRAZILIAN_PORTUGUESE_URGENT_MEDICAL_NOTICE =
  "Os abrigos climáticos não substituem o atendimento médico.";
const BRAZILIAN_PORTUGUESE_URGENT_POLICY_NOTICE =
  "Como um sintoma de alerta de escopo limitado foi relatado explicitamente, a HeatRelay não consultou informações meteorológicas nem locais e não pediu ao GPT-5.6 que gerasse um plano.";
const FRENCH_SITUATION_NOTICE =
  "Ce résultat est un résumé structuré des informations explicitement signalées. Il ne s’agit ni d’un conseil médical, ni d’une évaluation d’urgence, ni d’un plan d’action.";
const FRENCH_WEATHER_NOTICE =
  "Il s’agit d’informations météorologiques contextuelles dérivées des modèles d’Open-Meteo, et non d’une alerte officielle de chaleur.";
const FRENCH_URGENT_CONTACT_INSTRUCTION =
  "Appelez immédiatement le 112 pour obtenir une assistance d’urgence.";
const FRENCH_URGENT_MEDICAL_NOTICE =
  "Les refuges climatiques ne remplacent pas les soins médicaux.";
const FRENCH_URGENT_POLICY_NOTICE =
  "Puisqu’un symptôme d’alerte de portée limitée a été explicitement signalé, HeatRelay n’a consulté ni les données météorologiques ni les lieux et n’a pas demandé à GPT-5.6 de générer un plan.";
const ITALIAN_SITUATION_NOTICE =
  "Questo output è un riepilogo strutturato delle informazioni riportate esplicitamente. Non costituisce una consulenza medica, una valutazione di emergenza né un piano d’azione.";
const ITALIAN_WEATHER_NOTICE =
  "Questo è un contesto meteorologico derivato dai modelli di Open-Meteo, non un’allerta ufficiale per il caldo.";
const ITALIAN_URGENT_CONTACT_INSTRUCTION =
  "Chiama subito il 112 per ricevere assistenza d’emergenza.";
const ITALIAN_URGENT_MEDICAL_NOTICE =
  "I rifugi climatici non sostituiscono l’assistenza medica.";
const ITALIAN_URGENT_POLICY_NOTICE =
  "Poiché è stato segnalato esplicitamente un sintomo di allarme circoscritto, HeatRelay non ha recuperato dati meteorologici né informazioni sui luoghi e non ha chiesto a GPT-5.6 di generare un piano.";
const GERMAN_SITUATION_NOTICE =
  "Dieses Ergebnis ist eine strukturierte Zusammenfassung der ausdrücklich angegebenen Informationen. Es handelt sich weder um eine medizinische Beratung noch um eine Notfallbeurteilung noch um einen Aktionsplan.";
const GERMAN_WEATHER_NOTICE =
  "Dies ist ein aus Open-Meteo-Modellen abgeleiteter Wetterkontext, keine offizielle Hitzewarnung.";
const GERMAN_URGENT_CONTACT_INSTRUCTION =
  "Rufen Sie jetzt die 112 an, um Notfallhilfe zu erhalten.";
const GERMAN_URGENT_MEDICAL_NOTICE =
  "Hitzeschutzräume sind kein Ersatz für medizinische Versorgung.";
const GERMAN_URGENT_POLICY_NOTICE =
  "Da ausdrücklich ein klar eingegrenztes Warnsymptom angegeben wurde, hat HeatRelay weder Wetterdaten noch Informationen zu Orten abgerufen und GPT-5.6 nicht um die Erstellung eines Plans gebeten.";
const DUTCH_SITUATION_NOTICE =
  "Dit resultaat is een gestructureerde samenvatting van expliciet gemelde informatie. Het is geen medisch advies, geen beoordeling van een noodsituatie en geen actieplan.";
const DUTCH_WEATHER_NOTICE =
  "Dit is weersinformatie die is afgeleid van modellen van Open-Meteo; het is geen officiële hittewaarschuwing.";
const DUTCH_URGENT_CONTACT_INSTRUCTION =
  "Bel nu 112 voor hulp in een noodsituatie.";
const DUTCH_URGENT_MEDICAL_NOTICE =
  "Klimaatschuilplaatsen zijn geen vervanging voor medische zorg.";
const DUTCH_URGENT_POLICY_NOTICE =
  "Omdat expliciet een begrensd waarschuwingssymptoom is gemeld, heeft HeatRelay geen weersgegevens of informatie over locaties opgehaald en GPT-5.6 niet om een plan gevraagd.";
const RUSSIAN_SITUATION_NOTICE =
  "Этот результат — структурированное резюме явно указанных сведений. Он не является медицинской рекомендацией, оценкой экстренной ситуации или планом действий.";
const RUSSIAN_WEATHER_NOTICE =
  "Это полученные на основе моделей Open-Meteo сведения о погоде, а не официальное предупреждение о жаре.";
const RUSSIAN_URGENT_CONTACT_INSTRUCTION =
  "Немедленно позвоните по номеру 112, чтобы получить экстренную помощь.";
const RUSSIAN_URGENT_MEDICAL_NOTICE =
  "Климатические убежища не заменяют медицинскую помощь.";
const RUSSIAN_URGENT_POLICY_NOTICE =
  "Поскольку был явно указан тревожный симптом из ограниченного набора, HeatRelay не запрашивал ни данные о погоде, ни сведения о местах и не просил GPT-5.6 создать план.";
const UKRAINIAN_SITUATION_NOTICE =
  "Цей результат є структурованим зведенням явно повідомленої інформації. Він не є медичною порадою, оцінкою надзвичайної ситуації чи планом дій.";
const UKRAINIAN_WEATHER_NOTICE =
  "Це контекст погоди, отриманий із моделей Open-Meteo, а не офіційне попередження про спеку.";
const UKRAINIAN_URGENT_CONTACT_INSTRUCTION =
  "Негайно зателефонуйте за номером 112, щоб отримати екстрену допомогу.";
const UKRAINIAN_URGENT_MEDICAL_NOTICE =
  "Кліматичні укриття не замінюють медичної допомоги.";
const UKRAINIAN_URGENT_POLICY_NOTICE =
  "Оскільки про тривожний симптом з обмеженого переліку було явно повідомлено, HeatRelay не отримував даних про погоду чи місця й не просив GPT-5.6 створити план.";
const POLISH_SITUATION_NOTICE =
  "Ten wynik jest ustrukturyzowanym podsumowaniem wyraźnie zgłoszonych informacji. Nie stanowi porady medycznej, oceny sytuacji nagłej ani planu działania.";
const POLISH_WEATHER_NOTICE =
  "Są to informacje pogodowe pochodzące z modeli Open-Meteo, a nie oficjalne ostrzeżenie przed upałem.";
const POLISH_URGENT_CONTACT_INSTRUCTION =
  "Zadzwoń teraz pod numer 112, aby uzyskać pomoc w nagłej sytuacji.";
const POLISH_URGENT_MEDICAL_NOTICE =
  "Schronienia klimatyczne nie zastępują pomocy medycznej.";
const POLISH_URGENT_POLICY_NOTICE =
  "Ponieważ wyraźnie zgłoszono objaw ostrzegawczy objęty ograniczonym zakresem, HeatRelay nie pobrał danych pogodowych ani informacji o miejscach i nie poprosił GPT-5.6 o utworzenie planu.";
const JAPANESE_SITUATION_NOTICE =
  "この出力は、明示的に報告された情報を構造化した要約です。医療上の助言、緊急事態の評価、またはアクションプランではありません。";
const JAPANESE_WEATHER_NOTICE =
  "これは Open-Meteo のモデルに基づく天気情報であり、公式の暑さ警報ではありません。";
const JAPANESE_URGENT_CONTACT_INSTRUCTION =
  "緊急支援を要請するため、今すぐ 112 に電話してください。";
const JAPANESE_URGENT_MEDICAL_NOTICE =
  "気候シェルターは医療を受けることの代わりにはなりません。";
const JAPANESE_URGENT_POLICY_NOTICE =
  "限定的な注意症状が明示的に報告されたため、HeatRelay は天気情報も場所情報も取得せず、GPT-5.6 にプランの作成を依頼しませんでした。";
const KOREAN_SITUATION_NOTICE =
  "이 출력은 명시적으로 보고된 정보를 구조화한 요약입니다. 의료 조언, 응급 상황 평가 또는 행동 계획이 아닙니다.";
const KOREAN_WEATHER_NOTICE =
  "이는 Open-Meteo 모델에서 산출된 날씨 맥락 정보이며 공식 폭염 경보가 아닙니다.";
const KOREAN_URGENT_CONTACT_INSTRUCTION =
  "긴급 지원을 받으려면 지금 112로 전화하세요.";
const KOREAN_URGENT_MEDICAL_NOTICE =
  "기후 쉼터는 의료 처치를 대신할 수 없습니다.";
const KOREAN_URGENT_POLICY_NOTICE =
  "범위가 한정된 경고 증상이 명시적으로 보고되었기 때문에 HeatRelay는 날씨나 장소 정보를 조회하지 않았고 GPT-5.6에 계획 생성을 요청하지 않았습니다.";
const INDONESIAN_SITUATION_NOTICE =
  "Keluaran ini adalah ringkasan terstruktur dari informasi yang dilaporkan secara eksplisit. Ini bukan nasihat medis, penilaian keadaan darurat, atau rencana tindakan.";
const INDONESIAN_WEATHER_NOTICE =
  "Ini adalah konteks cuaca yang berasal dari model Open-Meteo, bukan peringatan panas resmi.";
const INDONESIAN_URGENT_CONTACT_INSTRUCTION =
  "Hubungi 112 sekarang untuk mendapatkan bantuan darurat.";
const INDONESIAN_URGENT_MEDICAL_NOTICE =
  "Tempat perlindungan iklim bukan pengganti perawatan medis.";
const INDONESIAN_URGENT_POLICY_NOTICE =
  "Karena sebuah gejala peringatan dalam batas yang ditentukan dilaporkan secara eksplisit, HeatRelay tidak mengambil informasi cuaca maupun informasi tentang tempat dan tidak meminta GPT-5.6 membuat rencana.";
const VIETNAMESE_SITUATION_NOTICE =
  "Đầu ra này là bản tóm tắt có cấu trúc về thông tin được báo cáo một cách rõ ràng. Đây không phải là lời khuyên y tế, đánh giá tình trạng khẩn cấp hay kế hoạch hành động.";
const VIETNAMESE_WEATHER_NOTICE =
  "Đây là thông tin bối cảnh thời tiết được suy ra từ mô hình của Open-Meteo, không phải cảnh báo nắng nóng chính thức.";
const VIETNAMESE_URGENT_CONTACT_INSTRUCTION =
  "Hãy gọi 112 ngay để được trợ giúp khẩn cấp.";
const VIETNAMESE_URGENT_MEDICAL_NOTICE =
  "Các nơi trú ẩn khí hậu không thể thay thế việc chăm sóc y tế.";
const VIETNAMESE_URGENT_POLICY_NOTICE =
  "Vì một triệu chứng cảnh báo trong phạm vi giới hạn đã được báo cáo rõ ràng, HeatRelay đã không truy xuất thông tin thời tiết hoặc địa điểm và không yêu cầu GPT-5.6 tạo kế hoạch.";
const THAI_SITUATION_NOTICE =
  "ผลลัพธ์นี้เป็นบทสรุปแบบมีโครงสร้างของข้อมูลที่รายงานไว้อย่างชัดเจน ผลลัพธ์นี้ไม่ใช่คำแนะนำทางการแพทย์ การประเมินเหตุฉุกเฉิน หรือแผนปฏิบัติการ";
const THAI_WEATHER_NOTICE =
  "นี่คือข้อมูลประกอบด้านสภาพอากาศที่ได้จากแบบจำลองของ Open-Meteo ไม่ใช่คำเตือนเรื่องความร้อนอย่างเป็นทางการ";
const THAI_URGENT_CONTACT_INSTRUCTION =
  "โทร 112 ทันทีเพื่อขอความช่วยเหลือฉุกเฉิน";
const THAI_URGENT_MEDICAL_NOTICE =
  "สถานที่หลบภัยจากความร้อนไม่สามารถใช้แทนการดูแลทางการแพทย์ได้";
const THAI_URGENT_POLICY_NOTICE =
  "เนื่องจากมีการรายงานอย่างชัดเจนถึงอาการเตือนที่อยู่ภายในขอบเขตที่กำหนด HeatRelay จึงไม่ได้ดึงข้อมูลสภาพอากาศหรือสถานที่ และไม่ได้ขอให้ GPT-5.6 สร้างแผน";
const TURKISH_SITUATION_NOTICE =
  "Bu çıktı, açıkça bildirilen bilgilerin yapılandırılmış bir özetidir. Tıbbi tavsiye, acil durum değerlendirmesi veya eylem planı değildir.";
const TURKISH_WEATHER_NOTICE =
  "Bu, Open-Meteo modellerinden türetilen hava durumu bağlamıdır; resmî bir sıcak hava uyarısı değildir.";
const TURKISH_URGENT_CONTACT_INSTRUCTION =
  "Acil yardım almak için hemen 112’yi arayın.";
const TURKISH_URGENT_MEDICAL_NOTICE =
  "İklim sığınakları tıbbi bakımın yerini tutmaz.";
const TURKISH_URGENT_POLICY_NOTICE =
  "Kapsamı belirli bir uyarı belirtisi açıkça bildirildiği için HeatRelay ne hava durumu bilgilerini ne de yer bilgilerini aldı ve GPT-5.6’dan bir plan oluşturmasını istemedi.";
const SWAHILI_SITUATION_NOTICE =
  "Matokeo haya ni muhtasari wenye muundo wa taarifa zilizoripotiwa wazi. Si ushauri wa kitabibu, tathmini ya dharura wala mpango wa hatua.";
const SWAHILI_WEATHER_NOTICE =
  "Haya ni maelezo ya muktadha wa hali ya hewa yanayotokana na modeli ya Open-Meteo, si onyo rasmi la joto.";
const SWAHILI_URGENT_CONTACT_INSTRUCTION =
  "Piga simu 112 sasa ili upate msaada wa dharura.";
const SWAHILI_URGENT_MEDICAL_NOTICE =
  "Makazi ya kujikinga na hali ya hewa si mbadala wa huduma ya matibabu.";
const SWAHILI_URGENT_POLICY_NOTICE =
  "Kwa sababu dalili ya tahadhari iliyo katika mipaka iliyowekwa iliripotiwa wazi, HeatRelay haikupata taarifa za hali ya hewa au maeneo na haikuiomba GPT-5.6 itengeneze mpango.";
const URDU_SITUATION_NOTICE =
  "یہ نتیجہ واضح طور پر بتائی گئی معلومات کا ایک منظم خلاصہ ہے۔ یہ طبی مشورہ، ہنگامی صورت حال کا جائزہ یا عملی منصوبہ نہیں ہے۔";
const URDU_WEATHER_NOTICE =
  "یہ Open-Meteo کے ماڈلز سے اخذ کردہ موسمی معلومات ہیں، گرمی کی کوئی سرکاری تنبیہ نہیں۔";
const URDU_URGENT_CONTACT_INSTRUCTION =
  "ہنگامی مدد کے لیے فوراً 112 پر کال کریں۔";
const URDU_URGENT_MEDICAL_NOTICE =
  "گرمی سے بچاؤ کی پناہ گاہیں طبی نگہداشت کا متبادل نہیں ہیں۔";
const URDU_URGENT_POLICY_NOTICE =
  "چونکہ ایک محدود انتباہی علامت واضح طور پر بتائی گئی تھی، HeatRelay نے نہ موسم کی معلومات حاصل کیں اور نہ مقامات کے بارے میں معلومات، اور GPT-5.6 سے منصوبہ بنانے کو بھی نہیں کہا۔";
const PERSIAN_SITUATION_NOTICE =
  "این خروجی خلاصه‌ای ساختاریافته از اطلاعاتی است که به‌صراحت گزارش شده‌اند. این خروجی توصیه پزشکی، ارزیابی وضعیت اضطراری یا برنامه اقدام نیست.";
const PERSIAN_WEATHER_NOTICE =
  "این اطلاعات زمینه‌ای آب‌وهوا از مدل‌های Open-Meteo به دست آمده است و هشدار رسمی گرما نیست.";
const PERSIAN_URGENT_CONTACT_INSTRUCTION =
  "برای دریافت کمک اضطراری، اکنون با 112 تماس بگیرید.";
const PERSIAN_URGENT_MEDICAL_NOTICE =
  "پناهگاه‌های اقلیمی جایگزین مراقبت پزشکی نیستند.";
const PERSIAN_URGENT_POLICY_NOTICE =
  "از آنجا که یک علامت هشدار محدود به‌صراحت گزارش شد، HeatRelay اطلاعات آب‌وهوا یا مکان‌ها را دریافت نکرد و از GPT-5.6 نخواست برنامه‌ای ایجاد کند.";
const HEBREW_SITUATION_NOTICE =
  "פלט זה הוא סיכום מובנה של המידע שנמסר במפורש. הוא אינו ייעוץ רפואי, הערכת מצב חירום או תוכנית פעולה.";
const HEBREW_WEATHER_NOTICE =
  "זהו מידע על מזג האוויר שנגזר ממודלים של Open-Meteo, ולא אזהרת חום רשמית.";
const HEBREW_URGENT_CONTACT_INSTRUCTION =
  "התקשרו עכשיו למספר 112 לקבלת עזרה בחירום.";
const HEBREW_URGENT_MEDICAL_NOTICE =
  "מחסי אקלים אינם תחליף לטיפול רפואי.";
const HEBREW_URGENT_POLICY_NOTICE =
  "מאחר שתסמין אזהרה מוגבל דווח במפורש, HeatRelay לא אחזר נתוני מזג אוויר או מידע על מקומות ולא ביקש מ-GPT-5.6 ליצור תוכנית.";
const PLAN_NOTICE =
  "This is informational heat-safety planning, not medical advice, a route, or a guarantee that a place will remain available.";
const HOURS_WARNING =
  "Synthetic opening hours can change; check the official source before travel.";
const DISTANCE_WARNING =
  "Distances are straight-line estimates only; no route or travel time is provided.";
const REACHABILITY_WARNING =
  "Being open at evaluation time does not prove the place can be reached before closing.";

const situationLanguageMetadata = {
  schema_version: "1.1.0",
  notice: SITUATION_NOTICE,
  detected_input_language: "en",
  input_language_source: "automatically_detected",
} as const;

const normalResponse = {
  branch: "normal",
  schema_version: "1.16.0",
  output_locale: "en",
  evaluation_time: "2026-07-17T08:00:00Z",
  situation: situationLanguageMetadata,
  priority: { priority: "act_now" },
  weather: {
    current: {
      temperature_c: 33,
      apparent_temperature_c: 34.5,
    },
    today: { temperature_max_c: 36 },
    notice: WEATHER_NOTICE,
  },
  plan: {
    now: {
      actions: [
        {
          code: "move_to_cooler_space",
          text: "Move to the coolest available synthetic space.",
          explanation: "This reduces synthetic heat exposure.",
        },
        {
          code: "travel_to_selected_place",
          text: "Consider the selected synthetic place after checking its hours.",
          explanation: "It came from the backend-approved synthetic candidates.",
        },
      ],
    },
    next_few_hours: {
      actions: [
        {
          code: "keep_drinking_water",
          text: "Keep synthetic water available.",
          explanation: "This supports a synthetic hydration plan.",
        },
      ],
    },
    tonight: {
      actions: [
        {
          code: "keep_water_nearby",
          text: "Keep synthetic water nearby tonight.",
          explanation: "This makes the synthetic plan easier to follow.",
        },
      ],
    },
    bring_items: [
      { code: "water", text: "Water" },
      { code: "phone", text: "A charged phone" },
    ],
    explanations: [
      {
        code: "forecast_at_or_above_36c",
        text: "The synthetic maximum meets the 36.0°C policy boundary.",
      },
      {
        code: "verified_open_candidate",
        text: "The synthetic place was verified open at evaluation time.",
      },
    ],
    local_phrase: {
      code: "catalan_request_cool_space",
      language: "ca",
      text: "Necessito un lloc fresc, si us plau.",
    },
    notice: PLAN_NOTICE,
  },
  selected_place: {
    place_id: "synthetic-place-001",
    name: "Barcelona Synthetic Cooling Centre",
    address: {
      street: "Carrer de Prova",
      number: "10",
      postal_code: "08001",
      city: "Barcelona",
    },
    district: "Synthetic District",
    neighborhood: "Synthetic Neighbourhood",
    distance_m: 725,
    closes_at: "2026-07-17T18:30:00Z",
    accessibility: null,
    features: {
      indoor_space: true,
      potable_water: true,
      toilets: false,
      micro_shelter: null,
      pets_allowed: null,
    },
    information_url: "https://example.test/synthetic-place",
    source_url: "https://example.test/synthetic-dataset",
    last_checked: "2026-07-15",
  },
  candidate_context: {
    explanation: "Synthetic candidates met the backend filters.",
    hours_warning: HOURS_WARNING,
    candidate_notice:
      "These are synthetic backend-approved candidates, not medical recommendations.",
    distance_warning: DISTANCE_WARNING,
    reachability_warning: REACHABILITY_WARNING,
  },
  notices: [
    "Synthetic HeatRelay policy does not prove an official warning is active.",
    HOURS_WARNING,
    DISTANCE_WARNING,
    REACHABILITY_WARNING,
    PLAN_NOTICE,
  ],
} as const;

const noPlaceResponse = {
  ...normalResponse,
  plan: {
    ...normalResponse.plan,
    bring_items: [],
    local_phrase: null,
  },
  selected_place: null,
  candidate_context: {
    ...normalResponse.candidate_context,
    explanation:
      "No synthetic official place met the current filters. No fallback place was invented.",
  },
} as const;

const urgentResponse = {
  branch: "urgent",
  schema_version: "1.16.0",
  output_locale: "en",
  evaluation_time: "2026-07-17T08:00:00Z",
  situation: situationLanguageMetadata,
  urgent_contact: {
    service: "112 emergències",
    number: "112",
    instruction: "Call 112 now for emergency assistance.",
    source_url:
      "https://112.gencat.cat/es/us-del-112/preguntes-frequeents/",
  },
  actions: [
    {
      code: "contact_emergency_service_now",
      text: "Call 112 now.",
    },
    {
      code: "do_not_use_shelter_as_medical_substitute",
      text: "Climate shelters are not substitutes for medical attention.",
    },
  ],
  notices: [
    "Climate shelters are not substitutes for medical attention.",
    "Because a bounded warning symptom was explicitly reported, HeatRelay did not retrieve weather or places and did not ask GPT-5.6 for a plan.",
  ],
} as const;

const spanishNormalResponse = {
  ...normalResponse,
  output_locale: "es",
  situation: {
    ...situationLanguageMetadata,
    notice: SPANISH_SITUATION_NOTICE,
  },
  weather: {
    ...normalResponse.weather,
    notice: SPANISH_WEATHER_NOTICE,
  },
} as const;

const spanishUrgentResponse = {
  ...urgentResponse,
  output_locale: "es",
  situation: {
    ...situationLanguageMetadata,
    notice: SPANISH_SITUATION_NOTICE,
  },
  urgent_contact: {
    ...urgentResponse.urgent_contact,
    instruction: SPANISH_URGENT_CONTACT_INSTRUCTION,
  },
  actions: [
    {
      code: "contact_emergency_service_now",
      text: "Llama al 112 ahora.",
    },
    {
      code: "do_not_use_shelter_as_medical_substitute",
      text: SPANISH_URGENT_MEDICAL_NOTICE,
    },
  ],
  notices: [SPANISH_URGENT_MEDICAL_NOTICE, SPANISH_URGENT_POLICY_NOTICE],
} as const;

const simplifiedChineseNormalResponse = {
  ...normalResponse,
  output_locale: "zh-CN",
  situation: {
    ...situationLanguageMetadata,
    notice: SIMPLIFIED_CHINESE_SITUATION_NOTICE,
  },
  weather: {
    ...normalResponse.weather,
    notice: SIMPLIFIED_CHINESE_WEATHER_NOTICE,
  },
} as const;

const simplifiedChineseUrgentResponse = {
  ...urgentResponse,
  output_locale: "zh-CN",
  situation: {
    ...situationLanguageMetadata,
    notice: SIMPLIFIED_CHINESE_SITUATION_NOTICE,
  },
  urgent_contact: {
    ...urgentResponse.urgent_contact,
    instruction: SIMPLIFIED_CHINESE_URGENT_CONTACT_INSTRUCTION,
  },
  actions: [
    {
      code: "contact_emergency_service_now",
      text: "立即拨打 112。",
    },
    {
      code: "do_not_use_shelter_as_medical_substitute",
      text: SIMPLIFIED_CHINESE_URGENT_MEDICAL_NOTICE,
    },
  ],
  notices: [
    SIMPLIFIED_CHINESE_URGENT_MEDICAL_NOTICE,
    SIMPLIFIED_CHINESE_URGENT_POLICY_NOTICE,
  ],
} as const;

const traditionalChineseNormalResponse = {
  ...normalResponse,
  output_locale: "zh-TW",
  situation: {
    ...situationLanguageMetadata,
    notice: TRADITIONAL_CHINESE_SITUATION_NOTICE,
  },
  weather: {
    ...normalResponse.weather,
    notice: TRADITIONAL_CHINESE_WEATHER_NOTICE,
  },
} as const;

const traditionalChineseUrgentResponse = {
  ...urgentResponse,
  output_locale: "zh-TW",
  situation: {
    ...situationLanguageMetadata,
    notice: TRADITIONAL_CHINESE_SITUATION_NOTICE,
  },
  urgent_contact: {
    ...urgentResponse.urgent_contact,
    instruction: TRADITIONAL_CHINESE_URGENT_CONTACT_INSTRUCTION,
  },
  actions: [
    {
      code: "contact_emergency_service_now",
      text: "立即撥打 112。",
    },
    {
      code: "do_not_use_shelter_as_medical_substitute",
      text: TRADITIONAL_CHINESE_URGENT_MEDICAL_NOTICE,
    },
  ],
  notices: [
    TRADITIONAL_CHINESE_URGENT_MEDICAL_NOTICE,
    TRADITIONAL_CHINESE_URGENT_POLICY_NOTICE,
  ],
} as const;

const hindiNormalResponse = {
  ...normalResponse,
  output_locale: "hi",
  situation: {
    ...situationLanguageMetadata,
    notice: HINDI_SITUATION_NOTICE,
  },
  weather: {
    ...normalResponse.weather,
    notice: HINDI_WEATHER_NOTICE,
  },
} as const;

const hindiUrgentResponse = {
  ...urgentResponse,
  output_locale: "hi",
  situation: {
    ...situationLanguageMetadata,
    notice: HINDI_SITUATION_NOTICE,
  },
  urgent_contact: {
    ...urgentResponse.urgent_contact,
    instruction: HINDI_URGENT_CONTACT_INSTRUCTION,
  },
  actions: [
    {
      code: "contact_emergency_service_now",
      text: "अभी 112 पर कॉल करें।",
    },
    {
      code: "do_not_use_shelter_as_medical_substitute",
      text: HINDI_URGENT_MEDICAL_NOTICE,
    },
  ],
  notices: [HINDI_URGENT_MEDICAL_NOTICE, HINDI_URGENT_POLICY_NOTICE],
} as const;

const bengaliNormalResponse = {
  ...normalResponse,
  output_locale: "bn",
  situation: {
    ...situationLanguageMetadata,
    notice: BENGALI_SITUATION_NOTICE,
  },
  weather: {
    ...normalResponse.weather,
    notice: BENGALI_WEATHER_NOTICE,
  },
} as const;

const bengaliUrgentResponse = {
  ...urgentResponse,
  output_locale: "bn",
  situation: {
    ...situationLanguageMetadata,
    notice: BENGALI_SITUATION_NOTICE,
  },
  urgent_contact: {
    ...urgentResponse.urgent_contact,
    instruction: BENGALI_URGENT_CONTACT_INSTRUCTION,
  },
  actions: [
    {
      code: "contact_emergency_service_now",
      text: "এখনই 112 নম্বরে কল করুন।",
    },
    {
      code: "do_not_use_shelter_as_medical_substitute",
      text: BENGALI_URGENT_MEDICAL_NOTICE,
    },
  ],
  notices: [BENGALI_URGENT_MEDICAL_NOTICE, BENGALI_URGENT_POLICY_NOTICE],
} as const;

const arabicNormalResponse = {
  ...normalResponse,
  output_locale: "ar",
  situation: {
    ...situationLanguageMetadata,
    notice: ARABIC_SITUATION_NOTICE,
  },
  weather: {
    ...normalResponse.weather,
    notice: ARABIC_WEATHER_NOTICE,
  },
} as const;

const arabicUrgentResponse = {
  ...urgentResponse,
  output_locale: "ar",
  situation: {
    ...situationLanguageMetadata,
    notice: ARABIC_SITUATION_NOTICE,
  },
  urgent_contact: {
    ...urgentResponse.urgent_contact,
    instruction: ARABIC_URGENT_CONTACT_INSTRUCTION,
  },
  actions: [
    {
      code: "contact_emergency_service_now",
      text: "اتصل بالرقم 112 الآن.",
    },
    {
      code: "do_not_use_shelter_as_medical_substitute",
      text: ARABIC_URGENT_MEDICAL_NOTICE,
    },
  ],
  notices: [ARABIC_URGENT_MEDICAL_NOTICE, ARABIC_URGENT_POLICY_NOTICE],
} as const;

const brazilianPortugueseNormalResponse = {
  ...normalResponse,
  output_locale: "pt-BR",
  situation: {
    ...situationLanguageMetadata,
    notice: BRAZILIAN_PORTUGUESE_SITUATION_NOTICE,
  },
  weather: {
    ...normalResponse.weather,
    notice: BRAZILIAN_PORTUGUESE_WEATHER_NOTICE,
  },
} as const;

const brazilianPortugueseUrgentResponse = {
  ...urgentResponse,
  output_locale: "pt-BR",
  situation: {
    ...situationLanguageMetadata,
    notice: BRAZILIAN_PORTUGUESE_SITUATION_NOTICE,
  },
  urgent_contact: {
    ...urgentResponse.urgent_contact,
    instruction: BRAZILIAN_PORTUGUESE_URGENT_CONTACT_INSTRUCTION,
  },
  actions: [
    {
      code: "contact_emergency_service_now",
      text: "Ligue para o 112 agora.",
    },
    {
      code: "do_not_use_shelter_as_medical_substitute",
      text: BRAZILIAN_PORTUGUESE_URGENT_MEDICAL_NOTICE,
    },
  ],
  notices: [
    BRAZILIAN_PORTUGUESE_URGENT_MEDICAL_NOTICE,
    BRAZILIAN_PORTUGUESE_URGENT_POLICY_NOTICE,
  ],
} as const;

const frenchNormalResponse = {
  ...normalResponse,
  output_locale: "fr",
  situation: {
    ...situationLanguageMetadata,
    notice: FRENCH_SITUATION_NOTICE,
  },
  weather: {
    ...normalResponse.weather,
    notice: FRENCH_WEATHER_NOTICE,
  },
} as const;

const frenchUrgentResponse = {
  ...urgentResponse,
  output_locale: "fr",
  situation: {
    ...situationLanguageMetadata,
    notice: FRENCH_SITUATION_NOTICE,
  },
  urgent_contact: {
    ...urgentResponse.urgent_contact,
    instruction: FRENCH_URGENT_CONTACT_INSTRUCTION,
  },
  actions: [
    {
      code: "contact_emergency_service_now",
      text: "Appelez immédiatement le 112.",
    },
    {
      code: "do_not_use_shelter_as_medical_substitute",
      text: FRENCH_URGENT_MEDICAL_NOTICE,
    },
  ],
  notices: [FRENCH_URGENT_MEDICAL_NOTICE, FRENCH_URGENT_POLICY_NOTICE],
} as const;

const italianNormalResponse = {
  ...normalResponse,
  output_locale: "it",
  situation: {
    ...situationLanguageMetadata,
    notice: ITALIAN_SITUATION_NOTICE,
  },
  weather: {
    ...normalResponse.weather,
    notice: ITALIAN_WEATHER_NOTICE,
  },
} as const;

const italianUrgentResponse = {
  ...urgentResponse,
  output_locale: "it",
  situation: {
    ...situationLanguageMetadata,
    notice: ITALIAN_SITUATION_NOTICE,
  },
  urgent_contact: {
    ...urgentResponse.urgent_contact,
    instruction: ITALIAN_URGENT_CONTACT_INSTRUCTION,
  },
  actions: [
    {
      code: "contact_emergency_service_now",
      text: "Chiama subito il 112.",
    },
    {
      code: "do_not_use_shelter_as_medical_substitute",
      text: ITALIAN_URGENT_MEDICAL_NOTICE,
    },
  ],
  notices: [ITALIAN_URGENT_MEDICAL_NOTICE, ITALIAN_URGENT_POLICY_NOTICE],
} as const;

const germanNormalResponse = {
  ...normalResponse,
  output_locale: "de",
  situation: {
    ...situationLanguageMetadata,
    notice: GERMAN_SITUATION_NOTICE,
  },
  weather: {
    ...normalResponse.weather,
    notice: GERMAN_WEATHER_NOTICE,
  },
} as const;

const germanUrgentResponse = {
  ...urgentResponse,
  output_locale: "de",
  situation: {
    ...situationLanguageMetadata,
    notice: GERMAN_SITUATION_NOTICE,
  },
  urgent_contact: {
    ...urgentResponse.urgent_contact,
    instruction: GERMAN_URGENT_CONTACT_INSTRUCTION,
  },
  actions: [
    {
      code: "contact_emergency_service_now",
      text: "Rufen Sie jetzt die 112 an.",
    },
    {
      code: "do_not_use_shelter_as_medical_substitute",
      text: GERMAN_URGENT_MEDICAL_NOTICE,
    },
  ],
  notices: [GERMAN_URGENT_MEDICAL_NOTICE, GERMAN_URGENT_POLICY_NOTICE],
} as const;

const dutchNormalResponse = {
  ...normalResponse,
  output_locale: "nl",
  situation: {
    ...situationLanguageMetadata,
    notice: DUTCH_SITUATION_NOTICE,
  },
  weather: {
    ...normalResponse.weather,
    notice: DUTCH_WEATHER_NOTICE,
  },
} as const;

const dutchUrgentResponse = {
  ...urgentResponse,
  output_locale: "nl",
  situation: {
    ...situationLanguageMetadata,
    notice: DUTCH_SITUATION_NOTICE,
  },
  urgent_contact: {
    ...urgentResponse.urgent_contact,
    instruction: DUTCH_URGENT_CONTACT_INSTRUCTION,
  },
  actions: [
    {
      code: "contact_emergency_service_now",
      text: "Bel nu 112.",
    },
    {
      code: "do_not_use_shelter_as_medical_substitute",
      text: DUTCH_URGENT_MEDICAL_NOTICE,
    },
  ],
  notices: [DUTCH_URGENT_MEDICAL_NOTICE, DUTCH_URGENT_POLICY_NOTICE],
} as const;

const russianNormalResponse = {
  ...normalResponse,
  output_locale: "ru",
  situation: {
    ...situationLanguageMetadata,
    notice: RUSSIAN_SITUATION_NOTICE,
  },
  weather: {
    ...normalResponse.weather,
    notice: RUSSIAN_WEATHER_NOTICE,
  },
} as const;

const russianUrgentResponse = {
  ...urgentResponse,
  output_locale: "ru",
  situation: {
    ...situationLanguageMetadata,
    notice: RUSSIAN_SITUATION_NOTICE,
  },
  urgent_contact: {
    ...urgentResponse.urgent_contact,
    instruction: RUSSIAN_URGENT_CONTACT_INSTRUCTION,
  },
  actions: [
    {
      code: "contact_emergency_service_now",
      text: "Немедленно позвоните по номеру 112.",
    },
    {
      code: "do_not_use_shelter_as_medical_substitute",
      text: RUSSIAN_URGENT_MEDICAL_NOTICE,
    },
  ],
  notices: [RUSSIAN_URGENT_MEDICAL_NOTICE, RUSSIAN_URGENT_POLICY_NOTICE],
} as const;

const ukrainianNormalResponse = {
  ...normalResponse,
  output_locale: "uk",
  situation: {
    ...situationLanguageMetadata,
    notice: UKRAINIAN_SITUATION_NOTICE,
  },
  weather: {
    ...normalResponse.weather,
    notice: UKRAINIAN_WEATHER_NOTICE,
  },
} as const;

const ukrainianUrgentResponse = {
  ...urgentResponse,
  output_locale: "uk",
  situation: {
    ...situationLanguageMetadata,
    notice: UKRAINIAN_SITUATION_NOTICE,
  },
  urgent_contact: {
    ...urgentResponse.urgent_contact,
    instruction: UKRAINIAN_URGENT_CONTACT_INSTRUCTION,
  },
  actions: [
    {
      code: "contact_emergency_service_now",
      text: "Негайно зателефонуйте за номером 112.",
    },
    {
      code: "do_not_use_shelter_as_medical_substitute",
      text: UKRAINIAN_URGENT_MEDICAL_NOTICE,
    },
  ],
  notices: [UKRAINIAN_URGENT_MEDICAL_NOTICE, UKRAINIAN_URGENT_POLICY_NOTICE],
} as const;

const polishNormalResponse = {
  ...normalResponse,
  output_locale: "pl",
  situation: {
    ...situationLanguageMetadata,
    notice: POLISH_SITUATION_NOTICE,
  },
  weather: {
    ...normalResponse.weather,
    notice: POLISH_WEATHER_NOTICE,
  },
} as const;

const polishUrgentResponse = {
  ...urgentResponse,
  output_locale: "pl",
  situation: {
    ...situationLanguageMetadata,
    notice: POLISH_SITUATION_NOTICE,
  },
  urgent_contact: {
    ...urgentResponse.urgent_contact,
    instruction: POLISH_URGENT_CONTACT_INSTRUCTION,
  },
  actions: [
    {
      code: "contact_emergency_service_now",
      text: "Zadzwoń teraz pod numer 112.",
    },
    {
      code: "do_not_use_shelter_as_medical_substitute",
      text: POLISH_URGENT_MEDICAL_NOTICE,
    },
  ],
  notices: [POLISH_URGENT_MEDICAL_NOTICE, POLISH_URGENT_POLICY_NOTICE],
} as const;

const japaneseNormalResponse = {
  ...normalResponse,
  output_locale: "ja",
  situation: {
    ...situationLanguageMetadata,
    notice: JAPANESE_SITUATION_NOTICE,
  },
  weather: {
    ...normalResponse.weather,
    notice: JAPANESE_WEATHER_NOTICE,
  },
} as const;

const japaneseUrgentResponse = {
  ...urgentResponse,
  output_locale: "ja",
  situation: {
    ...situationLanguageMetadata,
    notice: JAPANESE_SITUATION_NOTICE,
  },
  urgent_contact: {
    ...urgentResponse.urgent_contact,
    instruction: JAPANESE_URGENT_CONTACT_INSTRUCTION,
  },
  actions: [
    {
      code: "contact_emergency_service_now",
      text: "今すぐ 112 に電話してください。",
    },
    {
      code: "do_not_use_shelter_as_medical_substitute",
      text: JAPANESE_URGENT_MEDICAL_NOTICE,
    },
  ],
  notices: [JAPANESE_URGENT_MEDICAL_NOTICE, JAPANESE_URGENT_POLICY_NOTICE],
} as const;

const koreanNormalResponse = {
  ...normalResponse,
  output_locale: "ko",
  situation: {
    ...situationLanguageMetadata,
    notice: KOREAN_SITUATION_NOTICE,
  },
  weather: {
    ...normalResponse.weather,
    notice: KOREAN_WEATHER_NOTICE,
  },
} as const;

const koreanUrgentResponse = {
  ...urgentResponse,
  output_locale: "ko",
  situation: {
    ...situationLanguageMetadata,
    notice: KOREAN_SITUATION_NOTICE,
  },
  urgent_contact: {
    ...urgentResponse.urgent_contact,
    instruction: KOREAN_URGENT_CONTACT_INSTRUCTION,
  },
  actions: [
    {
      code: "contact_emergency_service_now",
      text: "지금 112로 전화하세요.",
    },
    {
      code: "do_not_use_shelter_as_medical_substitute",
      text: KOREAN_URGENT_MEDICAL_NOTICE,
    },
  ],
  notices: [KOREAN_URGENT_MEDICAL_NOTICE, KOREAN_URGENT_POLICY_NOTICE],
} as const;

const indonesianNormalResponse = {
  ...normalResponse,
  output_locale: "id",
  situation: {
    ...situationLanguageMetadata,
    notice: INDONESIAN_SITUATION_NOTICE,
  },
  weather: {
    ...normalResponse.weather,
    notice: INDONESIAN_WEATHER_NOTICE,
  },
} as const;

const indonesianUrgentResponse = {
  ...urgentResponse,
  output_locale: "id",
  situation: {
    ...situationLanguageMetadata,
    notice: INDONESIAN_SITUATION_NOTICE,
  },
  urgent_contact: {
    ...urgentResponse.urgent_contact,
    instruction: INDONESIAN_URGENT_CONTACT_INSTRUCTION,
  },
  actions: [
    {
      code: "contact_emergency_service_now",
      text: "Hubungi 112 sekarang.",
    },
    {
      code: "do_not_use_shelter_as_medical_substitute",
      text: INDONESIAN_URGENT_MEDICAL_NOTICE,
    },
  ],
  notices: [INDONESIAN_URGENT_MEDICAL_NOTICE, INDONESIAN_URGENT_POLICY_NOTICE],
} as const;

const vietnameseNormalResponse = {
  ...normalResponse,
  output_locale: "vi",
  situation: {
    ...situationLanguageMetadata,
    notice: VIETNAMESE_SITUATION_NOTICE,
  },
  weather: {
    ...normalResponse.weather,
    notice: VIETNAMESE_WEATHER_NOTICE,
  },
} as const;

const vietnameseUrgentResponse = {
  ...urgentResponse,
  output_locale: "vi",
  situation: {
    ...situationLanguageMetadata,
    notice: VIETNAMESE_SITUATION_NOTICE,
  },
  urgent_contact: {
    ...urgentResponse.urgent_contact,
    instruction: VIETNAMESE_URGENT_CONTACT_INSTRUCTION,
  },
  actions: [
    {
      code: "contact_emergency_service_now",
      text: "Hãy gọi 112 ngay.",
    },
    {
      code: "do_not_use_shelter_as_medical_substitute",
      text: VIETNAMESE_URGENT_MEDICAL_NOTICE,
    },
  ],
  notices: [VIETNAMESE_URGENT_MEDICAL_NOTICE, VIETNAMESE_URGENT_POLICY_NOTICE],
} as const;

const thaiNormalResponse = {
  ...normalResponse,
  output_locale: "th",
  situation: {
    ...situationLanguageMetadata,
    notice: THAI_SITUATION_NOTICE,
  },
  weather: {
    ...normalResponse.weather,
    notice: THAI_WEATHER_NOTICE,
  },
} as const;

const thaiUrgentResponse = {
  ...urgentResponse,
  output_locale: "th",
  situation: {
    ...situationLanguageMetadata,
    notice: THAI_SITUATION_NOTICE,
  },
  urgent_contact: {
    ...urgentResponse.urgent_contact,
    instruction: THAI_URGENT_CONTACT_INSTRUCTION,
  },
  actions: [
    {
      code: "contact_emergency_service_now",
      text: "โทร 112 ทันที",
    },
    {
      code: "do_not_use_shelter_as_medical_substitute",
      text: THAI_URGENT_MEDICAL_NOTICE,
    },
  ],
  notices: [THAI_URGENT_MEDICAL_NOTICE, THAI_URGENT_POLICY_NOTICE],
} as const;

const turkishNormalResponse = {
  ...normalResponse,
  output_locale: "tr",
  situation: {
    ...situationLanguageMetadata,
    notice: TURKISH_SITUATION_NOTICE,
  },
  weather: {
    ...normalResponse.weather,
    notice: TURKISH_WEATHER_NOTICE,
  },
} as const;

const turkishUrgentResponse = {
  ...urgentResponse,
  output_locale: "tr",
  situation: {
    ...situationLanguageMetadata,
    notice: TURKISH_SITUATION_NOTICE,
  },
  urgent_contact: {
    ...urgentResponse.urgent_contact,
    instruction: TURKISH_URGENT_CONTACT_INSTRUCTION,
  },
  actions: [
    {
      code: "contact_emergency_service_now",
      text: "Hemen 112’yi arayın.",
    },
    {
      code: "do_not_use_shelter_as_medical_substitute",
      text: TURKISH_URGENT_MEDICAL_NOTICE,
    },
  ],
  notices: [TURKISH_URGENT_MEDICAL_NOTICE, TURKISH_URGENT_POLICY_NOTICE],
} as const;

const swahiliNormalResponse = {
  ...normalResponse,
  output_locale: "sw",
  situation: {
    ...situationLanguageMetadata,
    notice: SWAHILI_SITUATION_NOTICE,
  },
  weather: {
    ...normalResponse.weather,
    notice: SWAHILI_WEATHER_NOTICE,
  },
} as const;

const swahiliUrgentResponse = {
  ...urgentResponse,
  output_locale: "sw",
  situation: {
    ...situationLanguageMetadata,
    notice: SWAHILI_SITUATION_NOTICE,
  },
  urgent_contact: {
    ...urgentResponse.urgent_contact,
    instruction: SWAHILI_URGENT_CONTACT_INSTRUCTION,
  },
  actions: [
    {
      code: "contact_emergency_service_now",
      text: "Piga simu 112 sasa.",
    },
    {
      code: "do_not_use_shelter_as_medical_substitute",
      text: SWAHILI_URGENT_MEDICAL_NOTICE,
    },
  ],
  notices: [SWAHILI_URGENT_MEDICAL_NOTICE, SWAHILI_URGENT_POLICY_NOTICE],
} as const;

const urduNormalResponse = {
  ...normalResponse,
  output_locale: "ur",
  situation: {
    ...situationLanguageMetadata,
    notice: URDU_SITUATION_NOTICE,
  },
  weather: {
    ...normalResponse.weather,
    notice: URDU_WEATHER_NOTICE,
  },
} as const;

const urduUrgentResponse = {
  ...urgentResponse,
  output_locale: "ur",
  situation: {
    ...situationLanguageMetadata,
    notice: URDU_SITUATION_NOTICE,
  },
  urgent_contact: {
    ...urgentResponse.urgent_contact,
    instruction: URDU_URGENT_CONTACT_INSTRUCTION,
  },
  actions: [
    {
      code: "contact_emergency_service_now",
      text: "فوراً 112 پر کال کریں۔",
    },
    {
      code: "do_not_use_shelter_as_medical_substitute",
      text: URDU_URGENT_MEDICAL_NOTICE,
    },
  ],
  notices: [URDU_URGENT_MEDICAL_NOTICE, URDU_URGENT_POLICY_NOTICE],
} as const;

const persianNormalResponse = {
  ...normalResponse,
  output_locale: "fa",
  situation: {
    ...situationLanguageMetadata,
    notice: PERSIAN_SITUATION_NOTICE,
  },
  weather: {
    ...normalResponse.weather,
    notice: PERSIAN_WEATHER_NOTICE,
  },
} as const;

const persianUrgentResponse = {
  ...urgentResponse,
  output_locale: "fa",
  situation: {
    ...situationLanguageMetadata,
    notice: PERSIAN_SITUATION_NOTICE,
  },
  urgent_contact: {
    ...urgentResponse.urgent_contact,
    instruction: PERSIAN_URGENT_CONTACT_INSTRUCTION,
  },
  actions: [
    {
      code: "contact_emergency_service_now",
      text: "اکنون با 112 تماس بگیرید.",
    },
    {
      code: "do_not_use_shelter_as_medical_substitute",
      text: PERSIAN_URGENT_MEDICAL_NOTICE,
    },
  ],
  notices: [PERSIAN_URGENT_MEDICAL_NOTICE, PERSIAN_URGENT_POLICY_NOTICE],
} as const;

const hebrewNormalResponse = {
  ...normalResponse,
  output_locale: "he",
  situation: {
    ...situationLanguageMetadata,
    notice: HEBREW_SITUATION_NOTICE,
  },
  weather: {
    ...normalResponse.weather,
    notice: HEBREW_WEATHER_NOTICE,
  },
} as const;

const hebrewUrgentResponse = {
  ...urgentResponse,
  output_locale: "he",
  situation: {
    ...situationLanguageMetadata,
    notice: HEBREW_SITUATION_NOTICE,
  },
  urgent_contact: {
    ...urgentResponse.urgent_contact,
    instruction: HEBREW_URGENT_CONTACT_INSTRUCTION,
  },
  actions: [
    {
      code: "contact_emergency_service_now",
      text: "התקשרו עכשיו למספר 112.",
    },
    {
      code: "do_not_use_shelter_as_medical_substitute",
      text: HEBREW_URGENT_MEDICAL_NOTICE,
    },
  ],
  notices: [HEBREW_URGENT_MEDICAL_NOTICE, HEBREW_URGENT_POLICY_NOTICE],
} as const;

function jsonResponse(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: vi.fn().mockResolvedValue(body),
  } as unknown as Response;
}

function withDetectedLanguage<
  T extends { readonly situation: typeof situationLanguageMetadata },
>(response: T, detectedInputLanguage: DetectedInputLanguage): T {
  return {
    ...response,
    situation: {
      ...response.situation,
      detected_input_language: detectedInputLanguage,
      input_language_source:
        detectedInputLanguage === "unknown"
          ? "fallback"
          : "automatically_detected",
    },
  } as T;
}

function withoutProperty(
  value: Readonly<Record<string, unknown>>,
  property: string,
): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(value).filter(([key]) => key !== property),
  );
}

function situationField(): HTMLTextAreaElement {
  const field = document.getElementById("situation-text");
  if (!(field instanceof HTMLTextAreaElement)) {
    throw new Error("Synthetic test setup expected the situation textarea.");
  }
  return field;
}

function visualModeSelect(): HTMLSelectElement {
  const select = document.getElementById("visual-mode-select");
  if (!(select instanceof HTMLSelectElement)) {
    throw new Error("Synthetic test setup expected the visual-mode select.");
  }
  return select;
}

function interfaceLanguageSelect(): HTMLSelectElement {
  const select = document.getElementById("interface-language-select");
  if (!(select instanceof HTMLSelectElement)) {
    throw new Error(
      "Synthetic test setup expected the interface-language select.",
    );
  }
  return select;
}

function outputLanguageSelect(): HTMLSelectElement {
  const select = document.getElementById("output-language-select");
  if (!(select instanceof HTMLSelectElement)) {
    throw new Error(
      "Synthetic test setup expected the output-language select.",
    );
  }
  return select;
}

function languageContextSection(): HTMLElement {
  const section = document.querySelector<HTMLElement>(
    ".language-context-note",
  );
  if (!section) {
    throw new Error(
      "Synthetic test setup expected the language-context section.",
    );
  }
  return section;
}

function documentDescriptionMeta(): HTMLMetaElement {
  const existing = document.head.querySelector<HTMLMetaElement>(
    'meta[name="description"]',
  );
  if (existing) {
    return existing;
  }
  const description = document.createElement("meta");
  description.name = "description";
  document.head.append(description);
  return description;
}

function appShell(): HTMLDivElement {
  const shell = document.querySelector<HTMLDivElement>(".app-shell");
  if (!shell) {
    throw new Error("Synthetic test setup expected the app shell.");
  }
  return shell;
}

function expectVisualMode(mode: VisualMode): void {
  expect(visualModeSelect().value).toBe(mode);
  expect(appShell().getAttribute("data-visual-mode")).toBe(mode);
  expect(document.querySelectorAll("[data-visual-mode]")).toHaveLength(1);
}

function expectNoLocalizationLeak(container: HTMLElement = document.body): void {
  const renderedText = container.textContent ?? "";
  expect(renderedText).not.toContain("undefined");
  expect(renderedText).not.toMatch(/{{[^}]+}}/);
  for (const key of Object.keys(ENGLISH_CATALOG)) {
    expect(renderedText).not.toContain(key);
  }
}

function stubMatchMedia(matches: boolean) {
  const matchMedia = vi.fn((query: string) =>
    ({
      matches,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(() => false),
    }) satisfies MediaQueryList,
  );
  vi.stubGlobal("matchMedia", matchMedia);
  return matchMedia;
}

function createMemoryStorage(): Storage {
  const values = new Map<string, string>();
  return {
    get length() {
      return values.size;
    },
    clear() {
      values.clear();
    },
    getItem(key: string) {
      return values.get(key) ?? null;
    },
    key(index: number) {
      return Array.from(values.keys())[index] ?? null;
    },
    removeItem(key: string) {
      values.delete(key);
    },
    setItem(key: string, value: string) {
      values.set(key, value);
    },
  } satisfies Storage;
}

function submitSituation(value = SYNTHETIC_SITUATION): void {
  fireEvent.change(situationField(), { target: { value } });
  const submitButton = document.querySelector<HTMLButtonElement>(
    'button.primary-button[type="submit"]',
  );
  if (!submitButton) {
    throw new Error("Synthetic test setup expected the submit button.");
  }
  fireEvent.click(submitButton);
}

async function selectInterfaceLanguage(locale: InterfaceLocale): Promise<void> {
  fireEvent.change(interfaceLanguageSelect(), { target: { value: locale } });
  await waitFor(() => {
    expect(testI18n.resolvedLanguage).toBe(locale);
    expect(interfaceLanguageSelect().value).toBe(locale);
    expect(
      document.querySelector<HTMLLabelElement>(
        'label[for="interface-language-select"]',
      )?.textContent,
    ).toBe(LOCALE_REGISTRY[locale].catalog["interfaceLanguage.label"]);
  });
}

function selectOutputLanguage(locale: OutputLocale): void {
  fireEvent.change(outputLanguageSelect(), { target: { value: locale } });
  expect(outputLanguageSelect().value).toBe(locale);
}

const fetchMock = vi.fn<typeof globalThis.fetch>();
let testI18n: i18n;
let originalDocumentLocalization: {
  lang: string;
  dir: string;
  title: string;
  description: string | null;
};

function render(ui: ReactElement) {
  return renderWithTestingLibrary(
    <I18nextProvider i18n={testI18n}>{ui}</I18nextProvider>,
  );
}

async function expectMalformedSuccess(payload: unknown): Promise<void> {
  fetchMock.mockResolvedValue(jsonResponse(payload));
  render(<App />);
  submitSituation();

  const alert = await screen.findByRole("alert");
  expect(alert.textContent).toMatch(/response could not be safely displayed/i);
  expect(screen.queryByRole("heading", { name: "Urgent help" })).toBeNull();
  expect(screen.queryByRole("heading", { name: "Act now" })).toBeNull();
}

beforeEach(async () => {
  originalDocumentLocalization = {
    lang: document.documentElement.lang,
    dir: document.documentElement.dir,
    title: document.title,
    description:
      document.head.querySelector<HTMLMetaElement>('meta[name="description"]')
        ?.content ?? null,
  };
  testI18n = await createI18nRuntime("en");
  vi.stubGlobal("localStorage", createMemoryStorage());
  stubMatchMedia(false);
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  cleanup();
  document.documentElement.lang = originalDocumentLocalization.lang;
  document.documentElement.dir = originalDocumentLocalization.dir;
  document.title = originalDocumentLocalization.title;
  const description = document.head.querySelector<HTMLMetaElement>(
    'meta[name="description"]',
  );
  if (originalDocumentLocalization.description === null) {
    description?.remove();
  } else if (description) {
    description.content = originalDocumentLocalization.description;
  } else {
    const restoredDescription = document.createElement("meta");
    restoredDescription.name = "description";
    restoredDescription.content = originalDocumentLocalization.description;
    document.head.append(restoredDescription);
  }
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("Visual mode preference foundation", () => {
  it.each([
    ["uses Standard without storage or a contrast match", null, false, "standard", true],
    ["uses Enhanced Visibility for a first-load contrast match", null, true, "enhanced", true],
    ["lets stored Standard override matching system contrast", "standard", true, "standard", false],
    ["restores stored Enhanced Visibility", "enhanced", false, "enhanced", false],
    ["restores stored High Contrast", "high-contrast", false, "high-contrast", false],
    ["falls through an invalid stored value", "invalid-mode", true, "enhanced", true],
  ] as const)(
    "%s",
    (_label, storedValue, contrastMatches, expectedMode, checksSystem) => {
      if (storedValue !== null) {
        window.localStorage.setItem(VISUAL_MODE_STORAGE_KEY, storedValue);
      }
      const matchMedia = stubMatchMedia(contrastMatches);
      const storageWrite = vi.spyOn(window.localStorage, "setItem");

      render(<App />);

      expectVisualMode(expectedMode);
      expect(storageWrite).not.toHaveBeenCalled();
      if (checksSystem) {
        expect(matchMedia).toHaveBeenCalledOnce();
        expect(matchMedia).toHaveBeenCalledWith("(prefers-contrast: more)");
      } else {
        expect(matchMedia).not.toHaveBeenCalled();
      }
    },
  );

  it("continues to system detection when storage reads throw", () => {
    stubMatchMedia(true);
    vi.spyOn(window.localStorage, "getItem").mockImplementation(() => {
      throw new Error("Synthetic blocked storage read");
    });

    expect(() => render(<App />)).not.toThrow();
    expectVisualMode("enhanced");
  });

  it.each(["missing", "throwing"] as const)(
    "falls back to Standard when matchMedia is %s",
    (failureMode) => {
      vi.stubGlobal(
        "matchMedia",
        failureMode === "missing"
          ? undefined
          : vi.fn(() => {
              throw new Error("Synthetic matchMedia failure");
            }),
      );

      expect(() => render(<App />)).not.toThrow();
      expectVisualMode("standard");
    },
  );

  it("renders one described native select with the exact option contract", () => {
    render(<App />);

    const select = visualModeSelect();
    expect(select.tagName).toBe("SELECT");
    expect(VISUAL_MODE_STORAGE_KEY).toBe("heatrelay.visual-mode.v1");
    expect(
      Array.from(select.options, (option) => [option.value, option.textContent]),
    ).toEqual([
      ["standard", "Standard"],
      ["enhanced", "Enhanced Visibility"],
      ["high-contrast", "High contrast"],
    ]);
    const descriptionId = select.getAttribute("aria-describedby");
    expect(descriptionId).toBe("visual-mode-description");
    expect(document.getElementById(String(descriptionId))?.textContent).toMatch(
      /Enhanced Visibility is intended for people with low vision or anyone who prefers larger and clearer content\./,
    );
    expectVisualMode("standard");
  });

  it("switches both directions and writes only the approved key and values", () => {
    render(<App />);
    const storageWrite = vi.spyOn(window.localStorage, "setItem");

    fireEvent.change(visualModeSelect(), { target: { value: "enhanced" } });
    expectVisualMode("enhanced");
    fireEvent.change(visualModeSelect(), {
      target: { value: "high-contrast" },
    });
    expectVisualMode("high-contrast");
    fireEvent.change(visualModeSelect(), { target: { value: "standard" } });
    expectVisualMode("standard");

    expect(storageWrite.mock.calls).toEqual([
      [VISUAL_MODE_STORAGE_KEY, "enhanced"],
      [VISUAL_MODE_STORAGE_KEY, "high-contrast"],
      [VISUAL_MODE_STORAGE_KEY, "standard"],
    ]);
  });

  it("keeps the selected session mode when storage writes throw", () => {
    render(<App />);
    vi.spyOn(window.localStorage, "setItem").mockImplementation(() => {
      throw new Error("Synthetic blocked storage write");
    });

    expect(() =>
      fireEvent.change(visualModeSelect(), { target: { value: "enhanced" } }),
    ).not.toThrow();
    expectVisualMode("enhanced");
  });

  it("restores an explicit preference after unmount and a fresh render", () => {
    render(<App />);
    fireEvent.change(visualModeSelect(), { target: { value: "enhanced" } });
    expectVisualMode("enhanced");

    cleanup();
    render(<App />);

    expectVisualMode("enhanced");
  });

  it("preserves entered situation text and makes no request while switching", () => {
    render(<App />);
    fireEvent.change(situationField(), { target: { value: SYNTHETIC_SITUATION } });

    fireEvent.change(visualModeSelect(), { target: { value: "enhanced" } });
    fireEvent.change(visualModeSelect(), { target: { value: "standard" } });

    expect(situationField().value).toBe(SYNTHETIC_SITUATION);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("stays enabled during loading without creating a duplicate request", async () => {
    let resolveFetch!: (response: Response) => void;
    fetchMock.mockReturnValue(
      new Promise<Response>((resolve) => {
        resolveFetch = resolve;
      }),
    );
    render(<App />);
    submitSituation();

    expect(visualModeSelect().disabled).toBe(false);
    expect(interfaceLanguageSelect().disabled).toBe(false);
    expect(outputLanguageSelect().disabled).toBe(true);
    fireEvent.change(visualModeSelect(), { target: { value: "enhanced" } });
    fireEvent.change(interfaceLanguageSelect(), { target: { value: "en" } });
    expectVisualMode("enhanced");
    expect(fetchMock).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolveFetch(jsonResponse(normalResponse));
    });
    await screen.findByRole("heading", { name: "Act now" });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(outputLanguageSelect().disabled).toBe(false);
  });

  it.each(["normal", "urgent", "error"] as const)(
    "remains available after a %s terminal state",
    async (terminalState) => {
      fetchMock.mockResolvedValue(
        terminalState === "normal"
          ? jsonResponse(normalResponse)
          : terminalState === "urgent"
            ? jsonResponse(urgentResponse)
            : jsonResponse({ detail: { message: "Synthetic hidden detail" } }, 503),
      );
      render(<App />);
      submitSituation();

      const terminal =
        terminalState === "normal"
          ? await screen.findByRole("heading", { name: "Act now" })
          : terminalState === "urgent"
            ? await screen.findByRole("heading", { name: "Urgent help" })
            : await screen.findByRole("alert");
      const requestCount = fetchMock.mock.calls.length;

      expect(visualModeSelect().disabled).toBe(false);
      expect(interfaceLanguageSelect().disabled).toBe(false);
      expect(outputLanguageSelect().disabled).toBe(false);
      fireEvent.change(visualModeSelect(), { target: { value: "enhanced" } });
      fireEvent.change(interfaceLanguageSelect(), { target: { value: "en" } });
      expectVisualMode("enhanced");
      expect(terminal.isConnected).toBe(true);
      expect(situationField().value).toBe(SYNTHETIC_SITUATION);
      expect(fetchMock).toHaveBeenCalledTimes(requestCount);
    },
  );

  it("never writes situation text to local storage", async () => {
    const storageWrite = vi.spyOn(window.localStorage, "setItem");
    fetchMock.mockResolvedValue(jsonResponse(normalResponse));
    render(<App />);

    submitSituation(SYNTHETIC_SITUATION);
    await screen.findByRole("heading", { name: "Act now" });

    expect(storageWrite).not.toHaveBeenCalled();
    expect(window.localStorage.getItem(INTERFACE_LOCALE_STORAGE_KEY)).toBeNull();
  });
});

describe("Interface language foundation", () => {
  it("renders exactly three independently named native selectors", () => {
    render(<App />);

    const selectors = screen.getAllByRole("combobox");
    const languageSelect = interfaceLanguageSelect();
    const outputSelect = outputLanguageSelect();
    expect(selectors).toHaveLength(3);
    expect(selectors).toContain(visualModeSelect());
    expect(selectors).toContain(languageSelect);
    expect(selectors).toContain(outputSelect);
    expect(languageSelect.tagName).toBe("SELECT");
    expect(outputSelect.tagName).toBe("SELECT");
    expect(languageSelect.getAttribute("role")).toBeNull();
    expect(outputSelect.getAttribute("role")).toBeNull();
    expect(languageSelect.onkeydown).toBeNull();
    expect(outputSelect.onkeydown).toBeNull();
    expect(languageSelect.disabled).toBe(false);
    expect(outputSelect.disabled).toBe(false);
  });

  it("renders exactly 25 ordered native-name-only interface options from the registry", () => {
    render(<App />);

    const select = interfaceLanguageSelect();
    expect(select.value).toBe("en");
    expect(
      Array.from(select.options, (option) => [
        option.value,
        option.textContent,
        option.lang,
        option.dir,
      ]),
    ).toEqual(
      SUPPORTED_INTERFACE_LOCALES.map((locale) => {
        const definition = LOCALE_REGISTRY[locale];
        return [
          definition.code,
          definition.nativeName,
          definition.code,
          definition.direction,
        ];
      }),
    );
    expect(select.options).toHaveLength(25);
    expect(Array.from(select.options, (option) => option.textContent)).toEqual([
      "English",
      "Español",
      "中文（简体）",
      "中文（繁體）",
      "हिन्दी",
      "العربية",
      "Português (Brasil)",
      "বাংলা",
      "Русский",
      "日本語",
      "Français",
      "Deutsch",
      "اردو",
      "Bahasa Indonesia",
      "Türkçe",
      "한국어",
      "Italiano",
      "Українська",
      "Polski",
      "Tiếng Việt",
      "ไทย",
      "فارسی",
      "Kiswahili",
      "עברית",
      "Nederlands",
    ]);
    expect(
      Array.from(select.options, (option) => option.textContent).every(
        (label) => !label.includes(" — "),
      ),
    ).toBe(true);
    expect(select.textContent).not.toMatch(/[\u{1F1E6}-\u{1F1FF}]/u);
    expect(select.querySelector("img, svg")).toBeNull();
    expect(select.getAttribute("aria-describedby")).toBe(
      "interface-language-description",
    );
    expect(document.getElementById("interface-language-description")?.textContent).toBe(
      "Changes navigation, forms, and page labels. It does not change the action-plan language.",
    );
  });

  it("switches the initial interface to Spanish and back to English without a request", async () => {
    render(<App />);

    expect(
      screen.getByRole("heading", { name: ENGLISH_CATALOG["scenario.heading"] }),
    ).toBeTruthy();
    await selectInterfaceLanguage("es");

    expect(
      screen.getByRole("combobox", {
        name: SPANISH_CATALOG["interfaceLanguage.label"],
      }),
    ).toBe(interfaceLanguageSelect());
    expect(
      document.getElementById("interface-language-description")?.textContent,
    ).toBe(SPANISH_CATALOG["interfaceLanguage.description"]);
    expect(
      screen.getByRole("heading", { name: SPANISH_CATALOG["scenario.heading"] }),
    ).toBeTruthy();
    expect(screen.getByRole("button", {
      name: SPANISH_CATALOG["form.submitButton"],
    })).toBeTruthy();
    expect(document.documentElement.lang).toBe("es");
    expect(document.documentElement.dir).toBe("ltr");

    await selectInterfaceLanguage("en");

    expect(
      screen.getByRole("heading", { name: ENGLISH_CATALOG["scenario.heading"] }),
    ).toBeTruthy();
    expect(document.documentElement.lang).toBe("en");
    expect(document.documentElement.dir).toBe("ltr");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("does not persist the detected initial interface locale", () => {
    const storageWrite = vi.spyOn(window.localStorage, "setItem");

    render(<App />);

    expect(interfaceLanguageSelect().value).toBe("en");
    expect(storageWrite).not.toHaveBeenCalled();
    expect(window.localStorage.getItem(INTERFACE_LOCALE_STORAGE_KEY)).toBeNull();
  });

  it("persists only an explicit Spanish selection and synchronizes the document", async () => {
    const storageWrite = vi.spyOn(window.localStorage, "setItem");
    const existingDescription = document.head.querySelector<HTMLMetaElement>(
      'meta[name="description"]',
    );
    const description = existingDescription ?? document.createElement("meta");
    if (!existingDescription) {
      description.name = "description";
      document.head.append(description);
    }
    const original = {
      lang: document.documentElement.lang,
      dir: document.documentElement.dir,
      title: document.title,
      description: description.content,
    };
    document.documentElement.lang = "synthetic";
    document.documentElement.dir = "rtl";
    document.title = "Synthetic title";
    description.content = "Synthetic description";

    try {
      render(<App />);
      await selectInterfaceLanguage("es");

      await waitFor(() =>
        expect(storageWrite).toHaveBeenCalledWith(
          INTERFACE_LOCALE_STORAGE_KEY,
          "es",
        ),
      );
      expect(storageWrite).toHaveBeenCalledTimes(1);
      expect(document.documentElement.lang).toBe("es");
      expect(document.documentElement.dir).toBe("ltr");
      expect(document.title).toBe(SPANISH_CATALOG["metadata.title"]);
      expect(description.content).toBe(SPANISH_CATALOG["metadata.description"]);
      expect(fetchMock).not.toHaveBeenCalled();
    } finally {
      document.documentElement.lang = original.lang;
      document.documentElement.dir = original.dir;
      document.title = original.title;
      if (existingDescription) {
        description.content = original.description ?? "";
      } else {
        description.remove();
      }
    }
  });

  it("keeps the current Spanish session when locale persistence throws", async () => {
    render(<App />);
    vi.spyOn(window.localStorage, "setItem").mockImplementation(() => {
      throw new Error("Synthetic blocked locale persistence");
    });

    expect(() =>
      fireEvent.change(interfaceLanguageSelect(), { target: { value: "es" } }),
    ).not.toThrow();
    await waitFor(() => {
      expect(interfaceLanguageSelect().value).toBe("es");
      expect(testI18n.resolvedLanguage).toBe("es");
      expect(document.documentElement.lang).toBe("es");
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("ignores an invalid interface-language value without persistence or a request", () => {
    render(<App />);
    const storageWrite = vi.spyOn(window.localStorage, "setItem");

    fireEvent.change(interfaceLanguageSelect(), { target: { value: "eo" } });

    expect(storageWrite).not.toHaveBeenCalled();
    expect(testI18n.resolvedLanguage).toBe("en");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("keeps document and application state when a supported language change rejects", async () => {
    const changeLanguage = vi
      .spyOn(testI18n, "changeLanguage")
      .mockRejectedValue(new Error("Synthetic language change rejection"));
    render(<App />);
    fireEvent.change(situationField(), { target: { value: SYNTHETIC_SITUATION } });
    fireEvent.change(visualModeSelect(), { target: { value: "enhanced" } });
    const storageWrite = vi.spyOn(window.localStorage, "setItem");
    storageWrite.mockClear();
    const languageSelect = interfaceLanguageSelect();
    synchronizeDocumentLocalization(testI18n);
    const documentLocalization = {
      lang: document.documentElement.lang,
      dir: document.documentElement.dir,
      title: document.title,
      description:
        document.head.querySelector<HTMLMetaElement>('meta[name="description"]')
          ?.content ?? null,
    };
    fireEvent.change(languageSelect, { target: { value: "es" } });

    await waitFor(() => expect(changeLanguage).toHaveBeenCalledWith("es"));
    expect(storageWrite).not.toHaveBeenCalled();
    expect(testI18n.resolvedLanguage).toBe("en");
    expect(languageSelect.value).toBe("en");
    expect(situationField().value).toBe(SYNTHETIC_SITUATION);
    expectVisualMode("enhanced");
    expect(document.documentElement.lang).toBe(documentLocalization.lang);
    expect(document.documentElement.dir).toBe(documentLocalization.dir);
    expect(document.title).toBe(documentLocalization.title);
    expect(
      document.head.querySelector<HTMLMetaElement>('meta[name="description"]')
        ?.content ?? null,
    ).toBe(documentLocalization.description);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("keeps interface locale unchanged when visual mode switches", async () => {
    render(<App />);
    await selectInterfaceLanguage("es");
    expect(window.localStorage.getItem(INTERFACE_LOCALE_STORAGE_KEY)).toBe(
      "es",
    );

    fireEvent.change(visualModeSelect(), { target: { value: "enhanced" } });

    expect(interfaceLanguageSelect().value).toBe("es");
    expect(window.localStorage.getItem(INTERFACE_LOCALE_STORAGE_KEY)).toBe("es");
    expectVisualMode("enhanced");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("preserves pending request state while changing language without another fetch", async () => {
    let resolveFetch!: (response: Response) => void;
    fetchMock.mockReturnValue(
      new Promise<Response>((resolve) => {
        resolveFetch = resolve;
      }),
    );
    render(<App />);
    fireEvent.change(visualModeSelect(), { target: { value: "enhanced" } });
    submitSituation();

    await selectInterfaceLanguage("es");

    expect(interfaceLanguageSelect().disabled).toBe(false);
    expect(outputLanguageSelect().disabled).toBe(true);
    expect(situationField().value).toBe(SYNTHETIC_SITUATION);
    expectVisualMode("enhanced");
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("status").textContent).toBe(
      SPANISH_CATALOG["status.creating"],
    );

    await act(async () => {
      resolveFetch(jsonResponse(normalResponse));
    });
    await screen.findByRole("heading", {
      name: SPANISH_CATALOG["priority.actNow"],
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(outputLanguageSelect().disabled).toBe(false);
  });

  it("preserves client-side validation state when language is reselected", async () => {
    render(<App />);
    fireEvent.click(
      screen.getByRole("button", { name: "Create my heat action plan" }),
    );

    const fieldError = await screen.findByText(
      "Describe the situation before creating a plan.",
    );
    const textarea = situationField();
    expect(textarea.getAttribute("aria-invalid")).toBe("true");
    expect(textarea.getAttribute("aria-errormessage")).toBe("situation-error");

    await selectInterfaceLanguage("es");

    expect(fieldError.isConnected).toBe(true);
    expect(fieldError.textContent).toBe(SPANISH_CATALOG["validation.empty"]);
    expect(textarea.getAttribute("aria-invalid")).toBe("true");
    expect(textarea.getAttribute("aria-errormessage")).toBe("situation-error");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it.each([
    "normal",
    "no-place",
    "urgent",
    "unavailable",
    "malformed",
    "connection",
  ] as const)(
    "preserves the %s terminal state when language is reselected",
    async (terminalState) => {
      if (terminalState === "connection") {
        fetchMock.mockRejectedValue(new Error("Synthetic connection failure"));
      } else {
        fetchMock.mockResolvedValue(
          terminalState === "normal"
            ? jsonResponse(normalResponse)
            : terminalState === "no-place"
              ? jsonResponse(noPlaceResponse)
              : terminalState === "urgent"
              ? jsonResponse(urgentResponse)
              : terminalState === "malformed"
                ? jsonResponse({ unexpected: true })
                : jsonResponse({ detail: "Synthetic hidden detail" }, 503),
        );
      }
      render(<App />);
      fireEvent.change(visualModeSelect(), { target: { value: "enhanced" } });
      submitSituation();
      const terminal =
        terminalState === "normal"
          ? await screen.findByRole("heading", { name: "Act now" })
          : terminalState === "no-place"
            ? await screen.findByRole("heading", { name: /no verified place/i })
          : terminalState === "urgent"
            ? await screen.findByRole("heading", { name: "Urgent help" })
            : await screen.findByRole("alert");

      await selectInterfaceLanguage("es");

      expect(interfaceLanguageSelect().disabled).toBe(false);
      expect(terminal.isConnected).toBe(true);
      expect(situationField().value).toBe(SYNTHETIC_SITUATION);
      expectVisualMode("enhanced");
      expect(fetchMock).toHaveBeenCalledTimes(1);
      const expectedFrontendText =
        terminalState === "normal"
          ? SPANISH_CATALOG["priority.actNow"]
          : terminalState === "no-place"
            ? SPANISH_CATALOG["result.noPlaceTitle"]
            : terminalState === "urgent"
              ? SPANISH_CATALOG["urgent.title"]
              : terminalState === "unavailable"
                ? SPANISH_CATALOG["error.unavailableTitle"]
                : terminalState === "malformed"
                  ? SPANISH_CATALOG["error.malformedTitle"]
                  : SPANISH_CATALOG["error.connectionTitle"];
      expect(terminal.textContent).toContain(expectedFrontendText);
    },
  );
});

describe("Action-plan language preference", () => {
  it("renders the exact described native selector immediately before the situation field", () => {
    render(<App />);

    const select = outputLanguageSelect();
    const textarea = situationField();
    expect(select.tagName).toBe("SELECT");
    expect(select.name).toBe("output_locale");
    expect(select.value).toBe("en");
    expect(select.dir).toBe("ltr");
    expect(select.getAttribute("role")).toBeNull();
    expect(select.onkeydown).toBeNull();
    expect(select.disabled).toBe(false);
    expect(
      document.querySelector<HTMLLabelElement>(
        'label[for="output-language-select"]',
      )?.textContent,
    ).toBe("Action-plan language");
    expect(select.getAttribute("aria-describedby")).toBe(
      "output-language-description",
    );
    expect(document.getElementById("output-language-description")?.textContent).toBe(
      "Chooses the language for the next action plan. This preference is saved in this browser and sent with the action-plan request. It does not change the interface language or translate your description.",
    );
    expect(
      Boolean(
        select.compareDocumentPosition(textarea) &
          Node.DOCUMENT_POSITION_FOLLOWING,
      ),
    ).toBe(true);
    expect(select.closest("header")).not.toBeNull();
    expect(textarea.closest("form")).not.toBeNull();
  });

  it("renders exactly 25 ordered native-name-only output options from the shared registry", () => {
    render(<App />);

    const select = outputLanguageSelect();
    expect(
      Array.from(select.options, (option) => [
        option.value,
        option.textContent,
        option.lang,
        option.dir,
      ]),
    ).toEqual(
      SUPPORTED_OUTPUT_LOCALES.map((locale) => {
        const definition = LOCALE_REGISTRY[locale];
        return [
          definition.code,
          definition.nativeName,
          definition.code,
          definition.direction,
        ];
      }),
    );
    expect(select.options).toHaveLength(25);
    expect(Array.from(select.options, (option) => option.value)).toEqual([
      "en",
      "es",
      "zh-CN",
      "zh-TW",
      "hi",
      "bn",
      "ar",
      "pt-BR",
      "fr",
      "it",
      "de",
      "nl",
      "ru",
      "uk",
      "pl",
      "ja",
      "ko",
      "id",
      "vi",
      "th",
      "tr",
      "sw",
      "ur",
      "fa",
      "he",
    ]);
    expect(
      Array.from(select.options, (option) => option.textContent).every(
        (label) => !label.includes(" — "),
      ),
    ).toBe(true);
    expect(select.textContent).not.toMatch(/[\u{1F1E6}-\u{1F1FF}]/u);
    expect(select.querySelector("img, svg")).toBeNull();
  });

  it("uses English initially without automatically persisting it", () => {
    const storageWrite = vi.spyOn(window.localStorage, "setItem");

    render(<App />);

    expect(OUTPUT_LOCALE_STORAGE_KEY).toBe("heatrelay.output-locale.v1");
    expect(outputLanguageSelect().value).toBe("en");
    expect(storageWrite).not.toHaveBeenCalled();
    expect(window.localStorage.getItem(OUTPUT_LOCALE_STORAGE_KEY)).toBeNull();
  });

  it("restores an exact stored RTL output locale without changing document localization", () => {
    window.localStorage.setItem(OUTPUT_LOCALE_STORAGE_KEY, "he");
    document.documentElement.lang = "en";
    document.documentElement.dir = "ltr";
    const storageWrite = vi.spyOn(window.localStorage, "setItem");

    render(<App />);

    expect(outputLanguageSelect().value).toBe("he");
    expect(outputLanguageSelect().dir).toBe("rtl");
    expect(document.documentElement.lang).toBe("en");
    expect(document.documentElement.dir).toBe("ltr");
    expect(testI18n.resolvedLanguage).toBe("en");
    expect(storageWrite).not.toHaveBeenCalled();
  });

  it("falls back from invalid stored output data without repairing it", () => {
    window.localStorage.setItem(OUTPUT_LOCALE_STORAGE_KEY, "he-IL");
    const storageWrite = vi.spyOn(window.localStorage, "setItem");

    render(<App />);

    expect(outputLanguageSelect().value).toBe("en");
    expect(window.localStorage.getItem(OUTPUT_LOCALE_STORAGE_KEY)).toBe(
      "he-IL",
    );
    expect(storageWrite).not.toHaveBeenCalled();
  });

  it("persists only a changed explicit output locale and makes no request", () => {
    render(<App />);
    const storageWrite = vi.spyOn(window.localStorage, "setItem");

    selectOutputLanguage("es");

    expect(storageWrite.mock.calls).toEqual([
      [OUTPUT_LOCALE_STORAGE_KEY, "es"],
    ]);
    expect(Array.from({ length: window.localStorage.length }, (_, index) =>
      window.localStorage.key(index),
    )).toEqual([OUTPUT_LOCALE_STORAGE_KEY]);
    expect(fetchMock).not.toHaveBeenCalled();

    fireEvent.change(outputLanguageSelect(), { target: { value: "es" } });
    expect(storageWrite).toHaveBeenCalledTimes(1);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("keeps a valid in-memory selection when persistence throws", () => {
    render(<App />);
    vi.spyOn(window.localStorage, "setItem").mockImplementation(() => {
      throw new Error("Synthetic blocked output-locale persistence");
    });

    expect(() => selectOutputLanguage("he")).not.toThrow();
    expect(outputLanguageSelect().value).toBe("he");
    expect(outputLanguageSelect().dir).toBe("rtl");
    expect(window.localStorage.getItem(OUTPUT_LOCALE_STORAGE_KEY)).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("keeps output, interface, direction, visual mode, text, and focus independent", async () => {
    render(<App />);
    fireEvent.change(situationField(), { target: { value: SYNTHETIC_SITUATION } });
    selectOutputLanguage("he");
    fireEvent.change(visualModeSelect(), { target: { value: "enhanced" } });
    await selectInterfaceLanguage("es");

    expect(outputLanguageSelect().value).toBe("he");
    expect(outputLanguageSelect().dir).toBe("rtl");
    expect(interfaceLanguageSelect().value).toBe("es");
    expectVisualMode("enhanced");
    expect(situationField().value).toBe(SYNTHETIC_SITUATION);
    expect(document.documentElement.lang).toBe("es");
    expect(document.documentElement.dir).toBe("ltr");

    outputLanguageSelect().focus();
    selectOutputLanguage("fa");
    expect(document.activeElement).toBe(outputLanguageSelect());
    expect(document.documentElement.lang).toBe("es");
    expect(document.documentElement.dir).toBe("ltr");
    expect(testI18n.resolvedLanguage).toBe("es");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it.each(["validation", "normal", "urgent", "error"] as const)(
    "preserves the %s state when the next action-plan language changes",
    async (state) => {
      fetchMock.mockResolvedValue(
        state === "normal"
          ? jsonResponse(normalResponse)
          : state === "urgent"
            ? jsonResponse(urgentResponse)
            : jsonResponse({ detail: "Synthetic hidden detail" }, 503),
      );
      render(<App />);
      let preservedState: HTMLElement;
      if (state === "validation") {
        fireEvent.click(
          screen.getByRole("button", { name: "Create my heat action plan" }),
        );
        preservedState = await screen.findByText(
          ENGLISH_CATALOG["validation.empty"],
        );
      } else {
        submitSituation();
        if (state === "normal") {
          preservedState = await screen.findByRole("heading", {
            name: "Act now",
          });
        } else if (state === "urgent") {
          preservedState = await screen.findByRole("heading", {
            name: "Urgent help",
          });
        } else {
          preservedState = await screen.findByRole("alert");
        }
      }
      const requestCount = fetchMock.mock.calls.length;

      outputLanguageSelect().focus();
      selectOutputLanguage("es");

      expect(document.activeElement).toBe(outputLanguageSelect());
      expect(preservedState.isConnected).toBe(true);
      expect(situationField().value).toBe(
        state === "validation" ? "" : SYNTHETIC_SITUATION,
      );
      expect(fetchMock).toHaveBeenCalledTimes(requestCount);
    },
  );

  it("disables only the output selector during submission and restores it afterward", async () => {
    let resolveFetch!: (response: Response) => void;
    fetchMock.mockReturnValue(
      new Promise<Response>((resolve) => {
        resolveFetch = resolve;
      }),
    );
    render(<App />);
    selectOutputLanguage("es");
    submitSituation();

    expect(outputLanguageSelect().disabled).toBe(true);
    expect(visualModeSelect().disabled).toBe(false);
    expect(interfaceLanguageSelect().disabled).toBe(false);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolveFetch(jsonResponse(spanishNormalResponse));
    });
    await screen.findByRole("heading", { name: "Act now" });
    expect(outputLanguageSelect().disabled).toBe(false);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it.each([
    ["es", spanishNormalResponse, "ltr"],
    ["he", hebrewNormalResponse, "rtl"],
  ] as const)(
    "snapshots %s into one exact request and renders response-owned direction",
    async (locale, response, direction) => {
      fetchMock.mockResolvedValue(jsonResponse(response));
      render(<App />);
      const interfaceLocalization = {
        lang: document.documentElement.lang,
        dir: document.documentElement.dir,
      };
      selectOutputLanguage(locale);
      submitSituation(`  ${SYNTHETIC_SITUATION}  `);

      await screen.findByRole("heading", { name: "Act now" });
      expect(fetchMock).toHaveBeenCalledTimes(1);
      const [, options] = fetchMock.mock.calls[0];
      const body = JSON.parse(String(options?.body));
      expect(body).toEqual({
        situation_text: SYNTHETIC_SITUATION,
        origin: { latitude: 41.3874, longitude: 2.1686 },
        maximum_distance_m: 3000,
        output_locale: locale,
      });
      expect(Object.keys(body).sort()).toEqual([
        "maximum_distance_m",
        "origin",
        "output_locale",
        "situation_text",
      ]);
      expect(
        document.querySelector(`[lang="${locale}"][dir="${direction}"]`),
      ).not.toBeNull();
      expect(document.documentElement.lang).toBe(interfaceLocalization.lang);
      expect(document.documentElement.dir).toBe(interfaceLocalization.dir);
      expect(window.localStorage.getItem(OUTPUT_LOCALE_STORAGE_KEY)).toBe(
        locale,
      );
      expect(window.localStorage.getItem(SYNTHETIC_SITUATION)).toBeNull();
    },
  );

  it("fails safely when the response locale differs from the submitted snapshot", async () => {
    fetchMock.mockResolvedValue(jsonResponse(normalResponse));
    render(<App />);
    selectOutputLanguage("he");
    submitSituation();

    const alert = await screen.findByRole("alert");
    expect(alert.textContent).toMatch(/response could not be safely displayed/i);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(outputLanguageSelect().value).toBe("he");
    expect(outputLanguageSelect().disabled).toBe(false);
  });
});

describe("Deterministic language context", () => {
  it.each(SUPPORTED_OUTPUT_LOCALES)(
    "classifies matching supported input and displayed output %s without an input-language notice",
    (locale) => {
      expect(classifyLanguageContext(locale, locale)).toBeNull();
    },
  );

  it.each([
    ["unknown", "en", "unknown"],
    ["other", "en", "other"],
    ["ca", "en", "catalan_unavailable"],
    ["es", "en", "supported_mismatch"],
    ["ar", "he", "supported_mismatch"],
    ["en", "he", "supported_mismatch"],
  ] as const)(
    "classifies detected %s against displayed %s as %s",
    (detected, displayed, expected) => {
      expect(classifyLanguageContext(detected, displayed)).toBe(expected);
    },
  );

  it("renders no context for a matching response and no next-plan difference", async () => {
    fetchMock.mockResolvedValue(jsonResponse(normalResponse));
    render(<App />);
    submitSituation();

    await screen.findByRole("heading", { name: "Act now" });
    expect(
      screen.queryByRole("region", { name: "Language information" }),
    ).toBeNull();
    expect(document.querySelector(".language-context-note")).toBeNull();
  });

  it.each([
    [
      "supported_mismatch",
      "es",
      ENGLISH_CATALOG["languageContext.supportedMismatch"],
      "Español",
      "es",
      "ltr",
    ],
    [
      "catalan_unavailable",
      "ca",
      ENGLISH_CATALOG["languageContext.catalanUnavailable"],
      "Català",
      "ca",
      "ltr",
    ],
    [
      "other",
      "other",
      ENGLISH_CATALOG["languageContext.other"],
      ENGLISH_CATALOG["languageContext.otherValue"],
      null,
      null,
    ],
    [
      "unknown",
      "unknown",
      ENGLISH_CATALOG["languageContext.unknown"],
      ENGLISH_CATALOG["languageContext.unknownValue"],
      null,
      null,
    ],
  ] as const)(
    "renders the exact %s branch with semantic language values",
    async (_classification, detected, message, value, valueLanguage, direction) => {
      fetchMock.mockResolvedValue(
        jsonResponse(withDetectedLanguage(normalResponse, detected)),
      );
      render(<App />);
      submitSituation();

      await screen.findByRole("heading", { name: "Act now" });
      const note = screen.getByRole("region", {
        name: ENGLISH_CATALOG["languageContext.title"],
      });
      expect(note).toBe(languageContextSection());
      expect(note.getAttribute("role")).toBeNull();
      expect(note.hasAttribute("aria-live")).toBe(false);
      expect(note.querySelector('[role="alert"], [role="status"]')).toBeNull();
      expect(note.querySelector("dl")).not.toBeNull();
      expect(
        Array.from(note.querySelectorAll("dt"), (term) => term.textContent),
      ).toEqual([
        ENGLISH_CATALOG["languageContext.descriptionLanguage"],
        ENGLISH_CATALOG["languageContext.displayedLanguage"],
      ]);
      expect(note.textContent).toContain(message);
      expect(note.querySelectorAll("dd")[0]?.textContent).toBe(value);
      expect(note.querySelectorAll("dd")[1]?.textContent).toBe("English");
      const displayedValue = note.querySelector(
        'dd bdi[lang="en"][dir="ltr"]',
      );
      expect(displayedValue?.textContent).toBe("English");
      if (valueLanguage && direction) {
        const descriptionValue = note.querySelector(
          `dd bdi[lang="${valueLanguage}"][dir="${direction}"]`,
        );
        expect(descriptionValue?.textContent).toBe(value);
      } else {
        expect(note.querySelectorAll("dd")[0]?.querySelector("bdi")).toBeNull();
      }
      expect(note.textContent).not.toMatch(/[\u{1F1E6}-\u{1F1FF}]/u);
      expect(note.textContent).not.toMatch(
        /[\u061c\u200e\u200f\u202a-\u202e\u2066-\u2069]/u,
      );
    },
  );

  it("rejects an aliased detected language before rendering context", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({
        ...normalResponse,
        situation: {
          ...normalResponse.situation,
          detected_input_language: "es-ES",
        },
      }),
    );
    render(<App />);
    submitSituation();

    const alert = await screen.findByRole("alert");
    expect(alert.textContent).toContain(
      ENGLISH_CATALOG["error.malformedTitle"],
    );
    expect(document.querySelector(".language-context-note")).toBeNull();
  });

  it("renders no context for an error without a validated response", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({ detail: "Synthetic hidden detail" }, 503),
    );
    render(<App />);
    submitSituation();

    await screen.findByRole("alert");
    expect(document.querySelector(".language-context-note")).toBeNull();
  });

  it("keeps displayed language response-owned while selector changes only add next-plan context", async () => {
    fetchMock.mockResolvedValue(jsonResponse(normalResponse));
    render(<App />);
    submitSituation();
    await screen.findByRole("heading", { name: "Act now" });
    const result = document.querySelector<HTMLElement>(".result-section");
    if (!result) {
      throw new Error("Synthetic test setup expected a normal result.");
    }
    const resultMarkup = result.outerHTML;
    const resultNodes = Array.from(result.querySelectorAll("*"));
    expect(document.querySelector(".language-context-note")).toBeNull();

    selectOutputLanguage("he");

    expect(result.outerHTML).toBe(resultMarkup);
    expect(Array.from(result.querySelectorAll("*"))).toEqual(resultNodes);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const note = languageContextSection();
    expect(
      Array.from(note.querySelectorAll("dt"), (term) => term.textContent),
    ).toEqual([
      ENGLISH_CATALOG["languageContext.displayedLanguage"],
      ENGLISH_CATALOG["languageContext.nextLanguage"],
    ]);
    expect(note.textContent).not.toContain(
      ENGLISH_CATALOG["languageContext.descriptionLanguage"],
    );
    expect(note.textContent).toContain(
      ENGLISH_CATALOG["languageContext.nextSelection"],
    );
    expect(note.querySelector('bdi[lang="en"][dir="ltr"]')?.textContent).toBe(
      "English",
    );
    expect(note.querySelector('bdi[lang="he"][dir="rtl"]')?.textContent).toBe(
      "עברית",
    );
    expect(document.documentElement.dir).not.toBe("rtl");
  });

  it("opens mobile Settings and focuses the existing selector without any other mutation", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(withDetectedLanguage(normalResponse, "es")),
    );
    const storageWrite = vi.spyOn(window.localStorage, "setItem");
    render(<App />);
    submitSituation();
    const resultHeading = await screen.findByRole("heading", {
      name: "Act now",
    });
    const result = resultHeading.closest<HTMLElement>(".result-section");
    if (!result) {
      throw new Error("Synthetic test setup expected a normal result.");
    }
    const resultMarkup = result.outerHTML;
    const documentLocalization = {
      lang: document.documentElement.lang,
      dir: document.documentElement.dir,
    };
    const button = screen.getByRole("button", {
      name: ENGLISH_CATALOG["languageContext.changeAction"],
    });
    const settings = document.querySelector<HTMLDetailsElement>(
      "details.header-settings",
    );
    const settingsSummary = settings?.querySelector("summary");
    if (!settings || !settingsSummary) {
      throw new Error("Synthetic test setup expected header Settings.");
    }
    if (settings.open) {
      fireEvent.click(settingsSummary);
      await waitFor(() => expect(settings.open).toBe(false));
    }
    expect(button.getAttribute("type")).toBe("button");
    expect(document.activeElement).toBe(resultHeading);

    fireEvent.click(button);

    await waitFor(() => {
      expect(settings.open).toBe(true);
      expect(document.activeElement).toBe(outputLanguageSelect());
    });
    expect(outputLanguageSelect().value).toBe("en");
    expect(result.outerHTML).toBe(resultMarkup);
    expect(situationField().value).toBe(SYNTHETIC_SITUATION);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(storageWrite).not.toHaveBeenCalled();
    expect(document.documentElement.lang).toBe(documentLocalization.lang);
    expect(document.documentElement.dir).toBe(documentLocalization.dir);
  });

  it("places passive urgent context after the complete alert and preserves fixed urgent content", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(withDetectedLanguage(urgentResponse, "es")),
    );
    render(<App />);
    submitSituation();
    const alert = await screen.findByRole("alert");
    const alertMarkup = alert.outerHTML;
    const alertNodes = Array.from(alert.querySelectorAll("*"));
    const officialLink = screen.getByRole("link", {
      name: ENGLISH_CATALOG["urgent.sourceLink"],
    });
    const note = languageContextSection();

    expect(alert.contains(note)).toBe(false);
    expect(
      Boolean(
        alert.compareDocumentPosition(note) & Node.DOCUMENT_POSITION_FOLLOWING,
      ),
    ).toBe(true);
    expect(
      Boolean(
        officialLink.compareDocumentPosition(note) &
          Node.DOCUMENT_POSITION_FOLLOWING,
      ),
    ).toBe(true);
    expect(
      screen.queryByRole("button", {
        name: ENGLISH_CATALOG["languageContext.changeAction"],
      }),
    ).toBeNull();

    selectOutputLanguage("he");

    expect(alert.outerHTML).toBe(alertMarkup);
    expect(Array.from(alert.querySelectorAll("*"))).toEqual(alertNodes);
    expect(alert.textContent).toContain("112");
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(note.textContent).toContain(
      ENGLISH_CATALOG["languageContext.nextSelection"],
    );
    expect(note.querySelector('bdi[lang="he"][dir="rtl"]')?.textContent).toBe(
      "עברית",
    );
  });

  it("uses the changed preference exactly once on the next explicit submission", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse(normalResponse))
      .mockResolvedValueOnce(jsonResponse(spanishNormalResponse));
    render(<App />);
    submitSituation();
    await screen.findByRole("heading", { name: "Act now" });

    selectOutputLanguage("es");
    expect(fetchMock).toHaveBeenCalledTimes(1);
    fireEvent.click(
      screen.getByRole("button", { name: "Create my heat action plan" }),
    );

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    await waitFor(() =>
      expect(
        document.querySelector('.result-section [lang="es"][dir="ltr"]'),
      ).not.toBeNull(),
    );
    expect(
      JSON.parse(String(fetchMock.mock.calls[1][1]?.body)),
    ).toEqual({
      situation_text: SYNTHETIC_SITUATION,
      origin: { latitude: 41.3874, longitude: 2.1686 },
      maximum_distance_m: 3000,
      output_locale: "es",
    });
  });

  it("translates context through LTR and RTL interfaces without changing response or output selection", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(withDetectedLanguage(normalResponse, "es")),
    );
    render(<App />);
    submitSituation();
    await screen.findByRole("heading", { name: "Act now" });
    const backendProse = document.querySelector<HTMLElement>(
      '.result-section [lang="en"][dir="ltr"]',
    );
    expect(backendProse).not.toBeNull();

    await selectInterfaceLanguage("es");
    expect(
      screen.getByRole("region", {
        name: SPANISH_CATALOG["languageContext.title"],
      }),
    ).toBeTruthy();
    expect(outputLanguageSelect().value).toBe("en");
    expect(backendProse?.lang).toBe("en");
    expect(backendProse?.dir).toBe("ltr");

    await selectInterfaceLanguage("ar");
    const note = screen.getByRole("region", {
      name: ARABIC_CATALOG["languageContext.title"],
    });
    expect(document.documentElement.lang).toBe("ar");
    expect(document.documentElement.dir).toBe("rtl");
    expect(outputLanguageSelect().value).toBe("en");
    expect(note.querySelector('bdi[lang="es"][dir="ltr"]')?.textContent).toBe(
      "Español",
    );
    expect(note.querySelector('bdi[lang="en"][dir="ltr"]')?.textContent).toBe(
      "English",
    );
    expect(backendProse?.isConnected).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("preserves one context component in Standard and Enhanced Visibility", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(withDetectedLanguage(normalResponse, "es")),
    );
    render(<App />);
    submitSituation();
    await screen.findByRole("heading", { name: "Act now" });
    const note = languageContextSection();

    expectVisualMode("standard");
    fireEvent.change(visualModeSelect(), { target: { value: "enhanced" } });

    expectVisualMode("enhanced");
    expect(note.isConnected).toBe(true);
    expect(document.querySelectorAll(".language-context-note")).toHaveLength(1);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("uses logical calm-note CSS with narrow stacking and enhanced target sizing", () => {
    expect(stylesSource).toMatch(
      /\.language-context-note\s*\{[^}]*min-width:\s*0;[^}]*margin-block-start:[^}]*padding-block:[^}]*padding-inline:[^}]*background:\s*var\(--color-verified-surface\);[^}]*overflow-wrap:\s*anywhere;/s,
    );
    expect(stylesSource).not.toMatch(
      /\.language-context-note\s*\{[^}]*(?:box-shadow|animation|padding-left|padding-right|margin-left|margin-right):/s,
    );
    expect(stylesSource).toMatch(
      /@media \(max-width: 760px\)[\s\S]*?\.place-details > div,[\s\S]*?\.language-context-note dl > div\s*\{[^}]*grid-template-columns:\s*minmax\(0, 1fr\);/,
    );
    expect(stylesSource).toMatch(
      /\.app-shell\[data-visual-mode="enhanced"\] \.settings-control select,[\s\S]*?\.app-shell\[data-visual-mode="enhanced"\] \.secondary-button,[\s\S]*?min-height:\s*var\(--target-control-size\);/,
    );
    expect(stylesSource).toContain(
      '.app-shell[data-visual-mode="high-contrast"]',
    );
  });
});

describe("Spanish interface pilot", () => {
  it("loads the Spanish synthetic demo only after an explicit Spanish action", async () => {
    const storageWrite = vi.spyOn(window.localStorage, "setItem");
    render(<App />);
    await selectInterfaceLanguage("es");
    storageWrite.mockClear();

    fireEvent.click(
      screen.getByRole("button", {
        name: SPANISH_CATALOG["form.demoButton"],
      }),
    );

    expect(situationField().value).toBe(SPANISH_CATALOG["form.demoText"]);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(storageWrite).not.toHaveBeenCalled();
  });

  it("preserves state, sends English output locale, and marks selected-place prose precisely", async () => {
    fetchMock.mockResolvedValue(jsonResponse(normalResponse));
    render(<App />);
    fireEvent.change(situationField(), {
      target: { value: `  ${SYNTHETIC_SITUATION}  ` },
    });
    fireEvent.change(visualModeSelect(), { target: { value: "enhanced" } });

    await selectInterfaceLanguage("es");

    expect(situationField().value).toBe(`  ${SYNTHETIC_SITUATION}  `);
    expectVisualMode("enhanced");
    fireEvent.click(
      screen.getByRole("button", {
        name: SPANISH_CATALOG["form.submitButton"],
      }),
    );

    const heading = await screen.findByRole("heading", {
      name: SPANISH_CATALOG["priority.actNow"],
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [endpoint, options] = fetchMock.mock.calls[0];
    expect(endpoint).toBe("/api/v1/action-plan");
    expect(JSON.parse(String(options?.body))).toEqual({
      situation_text: SYNTHETIC_SITUATION,
      origin: { latitude: 41.3874, longitude: 2.1686 },
      maximum_distance_m: 3000,
      output_locale: "en",
    });
    expect(normalResponse.output_locale).toBe("en");
    expect(heading.closest(".result-section")?.hasAttribute("lang")).toBe(
      false,
    );

    const phaseLists = Array.from(
      document.querySelectorAll<HTMLOListElement>("ol.action-list"),
    );
    expect(phaseLists).toHaveLength(3);
    expect(phaseLists.every((list) => list.lang === "en")).toBe(true);
    expect(
      Array.from(document.querySelectorAll(".phase-card h3")).every(
        (phaseHeading) => !phaseHeading.hasAttribute("lang"),
      ),
    ).toBe(true);
    expect(document.querySelector<HTMLElement>("p.weather-boundary")?.lang).toBe(
      "en",
    );
    expect(document.querySelector<HTMLElement>("ul.bring-list")?.lang).toBe(
      "en",
    );
    expect(
      document.querySelector<HTMLElement>("ul.explanation-list")?.lang,
    ).toBe("en");
    const warningList = document.querySelector<HTMLElement>("ul.warning-list");
    expect(warningList?.lang).toBe("en");
    expect(warningList?.hasAttribute("aria-label")).toBe(false);
    expect(warningList?.getAttribute("aria-labelledby")).toBe(
      "selected-place-cautions-label",
    );
    const warningLabel = document.getElementById(
      "selected-place-cautions-label",
    );
    expect(warningLabel?.textContent).toBe(
      SPANISH_CATALOG["place.cautionsAccessibleName"],
    );
    expect(warningLabel?.closest('[lang="en"]')).toBeNull();
    expect(
      screen.getByRole("list", {
        name: SPANISH_CATALOG["place.cautionsAccessibleName"],
      }),
    ).toBe(warningList);
    expect(document.querySelector<HTMLElement>("ul.notice-list")?.lang).toBe(
      "en",
    );

    expect(screen.getByText(normalResponse.plan.now.actions[0].text)).toBeTruthy();
    expect(screen.getAllByText(normalResponse.weather.notice)).toHaveLength(2);
    expect(
      document.querySelector(".evaluation-time time")?.textContent,
    ).toContain("17 jul 2026, 10:00");
    expect(screen.getAllByText("33,0 °C")).toHaveLength(1);
    expect(screen.getByText(/725 m/)).toBeTruthy();
    expect(screen.getByText("15 jul 2026")).toBeTruthy();

    const officialName = screen.getByRole("heading", {
      name: normalResponse.selected_place.name,
    });
    const officialAddress = document.querySelector(".place-address");
    expect(officialName.hasAttribute("lang")).toBe(false);
    expect(officialAddress?.hasAttribute("lang")).toBe(false);
    expect(officialName.closest(".place-card")?.hasAttribute("lang")).toBe(
      false,
    );
    const phrase = document.querySelector("blockquote");
    expect(phrase?.getAttribute("lang")).toBe("ca");
    expect(phrase?.textContent).toBe(normalResponse.plan.local_phrase.text);

    await selectInterfaceLanguage("en");
    expect(
      screen.getByRole("heading", { name: ENGLISH_CATALOG["priority.actNow"] }),
    ).toBeTruthy();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("keeps no-place backend prose English inside a Spanish result", async () => {
    fetchMock.mockResolvedValue(jsonResponse(noPlaceResponse));
    render(<App />);
    await selectInterfaceLanguage("es");
    submitSituation();

    const heading = await screen.findByRole("heading", {
      name: SPANISH_CATALOG["result.noPlaceTitle"],
    });
    const emptyPlace = heading.closest(".empty-place");
    expect(emptyPlace?.hasAttribute("lang")).toBe(false);
    const paragraphs = Array.from(emptyPlace?.querySelectorAll("p") ?? []);
    expect(paragraphs).toHaveLength(2);
    expect(paragraphs.map((paragraph) => paragraph.lang)).toEqual(["en", "en"]);
    expect(paragraphs.map((paragraph) => paragraph.textContent)).toEqual([
      noPlaceResponse.candidate_context.explanation,
      noPlaceResponse.candidate_context.candidate_notice,
    ]);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("marks only urgent backend prose and the Catalan service label", async () => {
    fetchMock.mockResolvedValue(jsonResponse(urgentResponse));
    render(<App />);
    await selectInterfaceLanguage("es");
    submitSituation();

    const heading = await screen.findByRole("heading", {
      name: SPANISH_CATALOG["urgent.title"],
    });
    const urgentResult = heading.closest(".urgent-result");
    expect(urgentResult?.hasAttribute("lang")).toBe(false);
    expect(urgentResult?.querySelector<HTMLElement>(".urgent-instruction")?.lang).toBe(
      "en",
    );
    expect(urgentResult?.querySelector<HTMLElement>(".urgent-actions")?.lang).toBe(
      "en",
    );
    expect(urgentResult?.querySelector<HTMLElement>(".notice-list")?.lang).toBe(
      "en",
    );
    const serviceName = urgentResult?.querySelector<HTMLElement>(
      ".urgent-number span",
    );
    const phoneNumber = urgentResult?.querySelector<HTMLElement>(
      ".urgent-number strong",
    );
    expect(serviceName?.lang).toBe("ca");
    expect(serviceName?.textContent).toBe("112 emergències");
    expect(phoneNumber?.hasAttribute("lang")).toBe(false);
    expect(phoneNumber?.textContent).toBe("112");
    expect(screen.getByText(urgentResponse.urgent_contact.instruction)).toBeTruthy();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("retains the validated language of a Spanish local phrase", async () => {
    const spanishPhrase = "Necesito un lugar fresco, por favor.";
    fetchMock.mockResolvedValue(
      jsonResponse({
        ...normalResponse,
        plan: {
          ...normalResponse.plan,
          local_phrase: {
            code: "spanish_request_cool_space",
            language: "es",
            text: spanishPhrase,
          },
        },
      }),
    );
    render(<App />);
    await selectInterfaceLanguage("es");
    submitSituation();

    await screen.findByRole("heading", {
      name: SPANISH_CATALOG["priority.actNow"],
    });
    const phrase = screen.getByText(spanishPhrase);
    expect(phrase.tagName).toBe("BLOCKQUOTE");
    expect(phrase.getAttribute("lang")).toBe("es");
  });
});

describe("Representative LTR catalog batch", () => {
  it("selects Simplified Chinese in Standard mode and synchronizes the document", async () => {
    const catalog = LOCALE_REGISTRY["zh-CN"].catalog;
    const storageWrite = vi.spyOn(window.localStorage, "setItem");
    const description = documentDescriptionMeta();
    render(<App />);

    await selectInterfaceLanguage("zh-CN");

    await waitFor(() =>
      expect(storageWrite).toHaveBeenCalledWith(
        INTERFACE_LOCALE_STORAGE_KEY,
        "zh-CN",
      ),
    );
    expectVisualMode("standard");
    expect(interfaceLanguageSelect().value).toBe("zh-CN");
    expect(document.documentElement.lang).toBe("zh-CN");
    expect(document.documentElement.dir).toBe("ltr");
    expect(document.title).toBe(catalog["metadata.title"]);
    expect(description.content).toBe(catalog["metadata.description"]);
    expect(
      screen.getByRole("heading", { name: catalog["scenario.heading"] }),
    ).toBeTruthy();
    expect(
      screen.getByRole("combobox", {
        name: catalog["interfaceLanguage.label"],
      }),
    ).toBe(interfaceLanguageSelect());
    expect(
      document.getElementById("interface-language-description")?.textContent,
    ).toBe(catalog["interfaceLanguage.description"]);
    expect(fetchMock).not.toHaveBeenCalled();

    await selectInterfaceLanguage("en");

    expect(document.documentElement.lang).toBe("en");
    expect(document.documentElement.dir).toBe("ltr");
    expect(document.title).toBe(ENGLISH_CATALOG["metadata.title"]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("selects Traditional Chinese without changing application state or visual mode", async () => {
    const catalog = LOCALE_REGISTRY["zh-TW"].catalog;
    const description = documentDescriptionMeta();
    render(<App />);
    fireEvent.change(situationField(), {
      target: { value: SYNTHETIC_SITUATION },
    });
    fireEvent.change(visualModeSelect(), { target: { value: "enhanced" } });
    const storageWrite = vi.spyOn(window.localStorage, "setItem");
    storageWrite.mockClear();

    await selectInterfaceLanguage("zh-TW");

    expect(storageWrite.mock.calls).toEqual([
      [INTERFACE_LOCALE_STORAGE_KEY, "zh-TW"],
    ]);
    expect(interfaceLanguageSelect().value).toBe("zh-TW");
    expect(document.documentElement.lang).toBe("zh-TW");
    expect(document.documentElement.dir).toBe("ltr");
    expect(document.title).toBe(catalog["metadata.title"]);
    expect(description.content).toBe(catalog["metadata.description"]);
    expect(
      screen.getByRole("heading", { name: catalog["scenario.heading"] }),
    ).toBeTruthy();
    expect(
      screen.getByRole("combobox", {
        name: catalog["interfaceLanguage.label"],
      }),
    ).toBe(interfaceLanguageSelect());
    expect(
      document.getElementById("interface-language-description")?.textContent,
    ).toBe(catalog["interfaceLanguage.description"]);
    expectVisualMode("enhanced");
    expect(situationField().value).toBe(SYNTHETIC_SITUATION);
    expect(fetchMock).not.toHaveBeenCalled();

    await selectInterfaceLanguage("en");

    expect(document.documentElement.lang).toBe("en");
    expect(document.documentElement.dir).toBe("ltr");
    expect(document.title).toBe(ENGLISH_CATALOG["metadata.title"]);
    expect(description.content).toBe(ENGLISH_CATALOG["metadata.description"]);
    expectVisualMode("enhanced");
    expect(situationField().value).toBe(SYNTHETIC_SITUATION);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("switches an Enhanced Visibility session to Russian without state loss", async () => {
    const catalog = LOCALE_REGISTRY.ru.catalog;
    render(<App />);
    fireEvent.change(situationField(), {
      target: { value: SYNTHETIC_SITUATION },
    });
    fireEvent.change(visualModeSelect(), { target: { value: "enhanced" } });

    await selectInterfaceLanguage("ru");

    expectVisualMode("enhanced");
    expect(situationField().value).toBe(SYNTHETIC_SITUATION);
    expect(interfaceLanguageSelect().value).toBe("ru");
    expect(document.documentElement.lang).toBe("ru");
    expect(document.documentElement.dir).toBe("ltr");
    expect(
      screen.getByRole("heading", { name: catalog["scenario.heading"] }),
    ).toBeTruthy();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("switches an Enhanced Visibility session to Japanese metadata", async () => {
    const catalog = LOCALE_REGISTRY.ja.catalog;
    const description = documentDescriptionMeta();
    render(<App />);
    fireEvent.change(visualModeSelect(), { target: { value: "enhanced" } });

    await selectInterfaceLanguage("ja");

    expectVisualMode("enhanced");
    expect(document.documentElement.lang).toBe("ja");
    expect(document.documentElement.dir).toBe("ltr");
    expect(document.title).toBe(catalog["metadata.title"]);
    expect(description.content).toBe(catalog["metadata.description"]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("renders representative long German interface copy from the catalog", async () => {
    const catalog = LOCALE_REGISTRY.de.catalog;
    render(<App />);

    await selectInterfaceLanguage("de");

    expect(interfaceLanguageSelect().value).toBe("de");
    expect(document.documentElement.lang).toBe("de");
    expect(document.documentElement.dir).toBe("ltr");
    expect(document.title).toBe(catalog["metadata.title"]);
    expect(
      screen.getByText(catalog["trust.privacyDescription"]),
    ).toBeTruthy();
    expect(
      document.getElementById("interface-language-description")?.textContent,
    ).toBe(catalog["interfaceLanguage.description"]);
    expectNoLocalizationLeak();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("keeps English backend prose and the exact API contract in a Chinese normal result", async () => {
    const catalog = LOCALE_REGISTRY["zh-CN"].catalog;
    fetchMock.mockResolvedValue(jsonResponse(normalResponse));
    render(<App />);
    await selectInterfaceLanguage("zh-CN");

    submitSituation(`  ${SYNTHETIC_SITUATION}  `);

    const heading = await screen.findByRole("heading", {
      name: catalog["priority.actNow"],
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [endpoint, options] = fetchMock.mock.calls[0];
    expect(endpoint).toBe("/api/v1/action-plan");
    expect(JSON.parse(String(options?.body))).toEqual({
      situation_text: SYNTHETIC_SITUATION,
      origin: { latitude: 41.3874, longitude: 2.1686 },
      maximum_distance_m: 3000,
      output_locale: "en",
    });
    expect(normalResponse.output_locale).toBe("en");
    expect(heading.closest(".result-section")?.hasAttribute("lang")).toBe(
      false,
    );
    expect(
      screen.getByRole("heading", { name: catalog["result.phaseNow"] }),
    ).toBeTruthy();
    expect(
      screen.getByText(normalResponse.plan.now.actions[0].text),
    ).toBeTruthy();
    expect(
      Array.from(document.querySelectorAll<HTMLOListElement>("ol.action-list"))
        .every((list) => list.lang === "en"),
    ).toBe(true);
    expect(document.querySelector<HTMLElement>("p.weather-boundary")?.lang).toBe(
      "en",
    );
    expect(document.querySelector<HTMLElement>("ul.bring-list")?.lang).toBe(
      "en",
    );
    expect(
      document.querySelector<HTMLElement>("ul.explanation-list")?.lang,
    ).toBe("en");
    const warningList = document.querySelector<HTMLElement>("ul.warning-list");
    expect(warningList?.lang).toBe("en");
    expect(
      screen.getByRole("list", {
        name: catalog["place.cautionsAccessibleName"],
      }),
    ).toBe(warningList);
    expect(document.querySelector<HTMLElement>("ul.notice-list")?.lang).toBe(
      "en",
    );
    const officialName = screen.getByRole("heading", {
      name: normalResponse.selected_place.name,
    });
    expect(officialName.hasAttribute("lang")).toBe(false);
    expect(document.querySelector(".place-address")?.hasAttribute("lang")).toBe(
      false,
    );
    expectNoLocalizationLeak();
  });
});

describe("M6.8 Hindi, Bengali, and Korean catalog batch", () => {
  it("selects Hindi in Standard mode, persists it, and restores English", async () => {
    const catalog = LOCALE_REGISTRY.hi.catalog;
    const description = documentDescriptionMeta();
    const storageWrite = vi.spyOn(window.localStorage, "setItem");
    render(<App />);

    await selectInterfaceLanguage("hi");

    expect(storageWrite.mock.calls).toEqual([
      [INTERFACE_LOCALE_STORAGE_KEY, "hi"],
    ]);
    expectVisualMode("standard");
    expect(document.documentElement.lang).toBe("hi");
    expect(document.documentElement.dir).toBe("ltr");
    expect(document.title).toBe(catalog["metadata.title"]);
    expect(description.content).toBe(catalog["metadata.description"]);
    expect(
      screen.getByRole("heading", { name: catalog["scenario.heading"] }),
    ).toBeTruthy();
    expect(
      screen.getByRole("combobox", {
        name: catalog["interfaceLanguage.label"],
      }),
    ).toBe(interfaceLanguageSelect());
    expect(fetchMock).not.toHaveBeenCalled();

    await selectInterfaceLanguage("en");

    expect(document.documentElement.lang).toBe("en");
    expect(document.documentElement.dir).toBe("ltr");
    expect(document.title).toBe(ENGLISH_CATALOG["metadata.title"]);
    expect(description.content).toBe(ENGLISH_CATALOG["metadata.description"]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("preserves Enhanced Visibility and input while rendering Bengali counts", async () => {
    const catalog = LOCALE_REGISTRY.bn.catalog;
    render(<App />);
    fireEvent.change(situationField(), {
      target: { value: SYNTHETIC_SITUATION },
    });
    fireEvent.change(visualModeSelect(), { target: { value: "enhanced" } });

    await selectInterfaceLanguage("bn");

    const expectedCount = testI18n.t("form.characterCount", {
      currentCount: formatNumber(Array.from(SYNTHETIC_SITUATION).length, "bn"),
      limit: formatNumber(2000, "bn"),
    });
    expectVisualMode("enhanced");
    expect(situationField().value).toBe(SYNTHETIC_SITUATION);
    expect(document.documentElement.lang).toBe("bn");
    expect(document.documentElement.dir).toBe("ltr");
    expect(
      screen.getByRole("heading", { name: catalog["scenario.heading"] }),
    ).toBeTruthy();
    expect(document.getElementById("character-count")?.textContent).toBe(
      expectedCount,
    );
    expect(expectedCount).toMatch(/[০-৯]/);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("synchronizes Korean metadata and representative interface copy", async () => {
    const catalog = LOCALE_REGISTRY.ko.catalog;
    const description = documentDescriptionMeta();
    render(<App />);

    await selectInterfaceLanguage("ko");

    expect(document.documentElement.lang).toBe("ko");
    expect(document.documentElement.dir).toBe("ltr");
    expect(document.title).toBe(catalog["metadata.title"]);
    expect(description.content).toBe(catalog["metadata.description"]);
    expect(
      screen.getByRole("heading", { name: catalog["scenario.heading"] }),
    ).toBeTruthy();
    expect(
      document.getElementById("interface-language-description")?.textContent,
    ).toBe(catalog["interfaceLanguage.description"]);
    expectNoLocalizationLeak();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("keeps English backend prose and the exact API contract in a Hindi submission", async () => {
    const catalog = LOCALE_REGISTRY.hi.catalog;
    fetchMock.mockResolvedValue(jsonResponse(normalResponse));
    render(<App />);
    await selectInterfaceLanguage("hi");

    submitSituation(`  ${SYNTHETIC_SITUATION}  `);

    const heading = await screen.findByRole("heading", {
      name: catalog["priority.actNow"],
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [endpoint, options] = fetchMock.mock.calls[0];
    expect(endpoint).toBe("/api/v1/action-plan");
    expect(JSON.parse(String(options?.body))).toEqual({
      situation_text: SYNTHETIC_SITUATION,
      origin: { latitude: 41.3874, longitude: 2.1686 },
      maximum_distance_m: 3000,
      output_locale: "en",
    });
    expect(normalResponse.output_locale).toBe("en");
    expect(heading.closest(".result-section")?.hasAttribute("lang")).toBe(
      false,
    );
    expect(
      screen.getByText(normalResponse.plan.now.actions[0].text),
    ).toBeTruthy();
    expect(
      Array.from(document.querySelectorAll<HTMLOListElement>("ol.action-list"))
        .every((list) => list.lang === "en"),
    ).toBe(true);
    expect(document.querySelector<HTMLElement>("p.weather-boundary")?.lang).toBe(
      "en",
    );
    const officialName = screen.getByRole("heading", {
      name: normalResponse.selected_place.name,
    });
    expect(officialName.hasAttribute("lang")).toBe(false);
    expect(document.querySelector(".place-address")?.hasAttribute("lang")).toBe(
      false,
    );
    expectNoLocalizationLeak();
  });
});

describe("M6.9 Thai catalog and calendar contract", () => {
  it("selects Thai, preserves application state, persists the exact locale, and restores English", async () => {
    const catalog = LOCALE_REGISTRY.th.catalog;
    const description = documentDescriptionMeta();
    render(<App />);
    fireEvent.change(situationField(), {
      target: { value: SYNTHETIC_SITUATION },
    });
    fireEvent.change(visualModeSelect(), { target: { value: "enhanced" } });
    const storageWrite = vi.spyOn(window.localStorage, "setItem");
    storageWrite.mockClear();

    await selectInterfaceLanguage("th");

    expect(storageWrite.mock.calls).toEqual([
      [INTERFACE_LOCALE_STORAGE_KEY, "th"],
    ]);
    expect(interfaceLanguageSelect().value).toBe("th");
    expect(document.documentElement.lang).toBe("th");
    expect(document.documentElement.dir).toBe("ltr");
    expect(document.title).toBe(catalog["metadata.title"]);
    expect(description.content).toBe(catalog["metadata.description"]);
    expect(
      screen.getByRole("heading", { name: catalog["scenario.heading"] }),
    ).toBeTruthy();
    expect(
      screen.getByRole("combobox", {
        name: catalog["interfaceLanguage.label"],
      }),
    ).toBe(interfaceLanguageSelect());
    expect(
      document.getElementById("interface-language-description")?.textContent,
    ).toBe(catalog["interfaceLanguage.description"]);
    expectVisualMode("enhanced");
    expect(situationField().value).toBe(SYNTHETIC_SITUATION);
    expect(fetchMock).not.toHaveBeenCalled();

    await selectInterfaceLanguage("en");

    expect(document.documentElement.lang).toBe("en");
    expect(document.documentElement.dir).toBe("ltr");
    expect(document.title).toBe(ENGLISH_CATALOG["metadata.title"]);
    expect(description.content).toBe(ENGLISH_CATALOG["metadata.description"]);
    expectVisualMode("enhanced");
    expect(situationField().value).toBe(SYNTHETIC_SITUATION);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("renders Buddhist-calendar Thai text while preserving Gregorian machine values and the English API contract", async () => {
    const catalog = LOCALE_REGISTRY.th.catalog;
    fetchMock.mockResolvedValue(jsonResponse(normalResponse));
    render(<App />);
    await selectInterfaceLanguage("th");

    submitSituation(`  ${SYNTHETIC_SITUATION}  `);

    const heading = await screen.findByRole("heading", {
      name: catalog["priority.actNow"],
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [endpoint, options] = fetchMock.mock.calls[0];
    expect(endpoint).toBe("/api/v1/action-plan");
    expect(JSON.parse(String(options?.body))).toEqual({
      situation_text: SYNTHETIC_SITUATION,
      origin: { latitude: 41.3874, longitude: 2.1686 },
      maximum_distance_m: 3000,
      output_locale: "en",
    });
    expect(normalResponse.output_locale).toBe("en");

    const evaluationTime = document.querySelector<HTMLTimeElement>(
      'time[datetime="2026-07-17T08:00:00Z"]',
    );
    const lastChecked = document.querySelector<HTMLTimeElement>(
      'time[datetime="2026-07-15"]',
    );
    expect(evaluationTime?.dateTime).toBe(normalResponse.evaluation_time);
    expect(evaluationTime?.textContent).toContain("17 ก.ค. 2569 10:00");
    expect(lastChecked?.dateTime).toBe(
      normalResponse.selected_place.last_checked,
    );
    expect(lastChecked?.textContent).toBe("15 ก.ค. 2569");
    expect(evaluationTime?.textContent).not.toContain("2026");
    expect(lastChecked?.textContent).not.toContain("2026");

    expect(heading.closest(".result-section")?.hasAttribute("lang")).toBe(
      false,
    );
    expect(
      screen.getByRole("heading", { name: catalog["result.phaseNow"] }),
    ).toBeTruthy();
    expect(
      screen.getByText(normalResponse.plan.now.actions[0].text),
    ).toBeTruthy();
    expect(
      Array.from(document.querySelectorAll<HTMLOListElement>("ol.action-list"))
        .every((list) => list.lang === "en"),
    ).toBe(true);
    expect(document.querySelector<HTMLElement>("p.weather-boundary")?.lang).toBe(
      "en",
    );
    const officialName = screen.getByRole("heading", {
      name: normalResponse.selected_place.name,
    });
    expect(officialName.hasAttribute("lang")).toBe(false);
    expect(document.querySelector(".place-address")?.hasAttribute("lang")).toBe(
      false,
    );
    expectNoLocalizationLeak();
  });
});

describe("M6.10 Portuguese, French, Italian, and Dutch catalog batch", () => {
  it.each(["pt-BR", "fr", "it", "nl"] as const)(
    "selects %s, persists it, synchronizes the document, and restores English",
    async (locale) => {
      const catalog = LOCALE_REGISTRY[locale].catalog;
      const description = documentDescriptionMeta();
      const storageWrite = vi.spyOn(window.localStorage, "setItem");
      render(<App />);

      await selectInterfaceLanguage(locale);

      expect(storageWrite.mock.calls).toEqual([
        [INTERFACE_LOCALE_STORAGE_KEY, locale],
      ]);
      expect(interfaceLanguageSelect().value).toBe(locale);
      expect(document.documentElement.lang).toBe(locale);
      expect(document.documentElement.dir).toBe("ltr");
      expect(document.title).toBe(catalog["metadata.title"]);
      expect(description.content).toBe(catalog["metadata.description"]);
      expect(
        screen.getByRole("heading", { name: catalog["scenario.heading"] }),
      ).toBeTruthy();
      expect(
        screen.getByRole("combobox", {
          name: catalog["interfaceLanguage.label"],
        }),
      ).toBe(interfaceLanguageSelect());
      expect(
        document.getElementById("interface-language-description")?.textContent,
      ).toBe(catalog["interfaceLanguage.description"]);
      expect(fetchMock).not.toHaveBeenCalled();

      await selectInterfaceLanguage("en");

      expect(document.documentElement.lang).toBe("en");
      expect(document.documentElement.dir).toBe("ltr");
      expect(document.title).toBe(ENGLISH_CATALOG["metadata.title"]);
      expect(description.content).toBe(
        ENGLISH_CATALOG["metadata.description"],
      );
      expect(fetchMock).not.toHaveBeenCalled();
    },
  );

  it("preserves Enhanced Visibility and input while rendering longer French interface copy", async () => {
    const catalog = LOCALE_REGISTRY.fr.catalog;
    render(<App />);
    fireEvent.change(situationField(), {
      target: { value: SYNTHETIC_SITUATION },
    });
    fireEvent.change(visualModeSelect(), { target: { value: "enhanced" } });

    await selectInterfaceLanguage("fr");

    expectVisualMode("enhanced");
    expect(situationField().value).toBe(SYNTHETIC_SITUATION);
    expect(document.documentElement.lang).toBe("fr");
    expect(document.documentElement.dir).toBe("ltr");
    expect(
      screen.getByText(catalog["trust.privacyDescription"]),
    ).toBeTruthy();
    expect(
      document.getElementById("interface-language-description")?.textContent,
    ).toBe(catalog["interfaceLanguage.description"]);
    expectNoLocalizationLeak();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("keeps English backend prose and the exact API contract in an Italian normal result", async () => {
    const catalog = LOCALE_REGISTRY.it.catalog;
    fetchMock.mockResolvedValue(jsonResponse(normalResponse));
    render(<App />);
    await selectInterfaceLanguage("it");

    submitSituation(`  ${SYNTHETIC_SITUATION}  `);

    const heading = await screen.findByRole("heading", {
      name: catalog["priority.actNow"],
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [endpoint, options] = fetchMock.mock.calls[0];
    expect(endpoint).toBe("/api/v1/action-plan");
    expect(JSON.parse(String(options?.body))).toEqual({
      situation_text: SYNTHETIC_SITUATION,
      origin: { latitude: 41.3874, longitude: 2.1686 },
      maximum_distance_m: 3000,
      output_locale: "en",
    });
    expect(JSON.stringify(JSON.parse(String(options?.body)))).not.toMatch(
      /interface_locale|visual_mode|storage|heatrelay\.interface-locale/i,
    );
    expect(normalResponse.output_locale).toBe("en");
    expect(heading.closest(".result-section")?.hasAttribute("lang")).toBe(
      false,
    );
    expect(
      screen.getByRole("heading", { name: catalog["result.phaseNow"] }),
    ).toBeTruthy();
    expect(
      screen.getByText(normalResponse.plan.now.actions[0].text),
    ).toBeTruthy();
    expect(
      Array.from(document.querySelectorAll<HTMLOListElement>("ol.action-list"))
        .every((list) => list.lang === "en"),
    ).toBe(true);
    expect(document.querySelector<HTMLElement>("p.weather-boundary")?.lang).toBe(
      "en",
    );
    expect(document.querySelector<HTMLElement>("ul.bring-list")?.lang).toBe(
      "en",
    );
    expect(
      document.querySelector<HTMLElement>("ul.explanation-list")?.lang,
    ).toBe("en");
    expect(document.querySelector<HTMLElement>("ul.warning-list")?.lang).toBe(
      "en",
    );
    expect(document.querySelector<HTMLElement>("ul.notice-list")?.lang).toBe(
      "en",
    );
    const officialName = screen.getByRole("heading", {
      name: normalResponse.selected_place.name,
    });
    expect(officialName.hasAttribute("lang")).toBe(false);
    expect(document.querySelector(".place-address")?.hasAttribute("lang")).toBe(
      false,
    );
    expectNoLocalizationLeak();
  });
});

describe("M6.11 final required LTR catalog batch", () => {
  it.each(["id", "tr", "uk", "pl", "vi", "sw"] as const)(
    "selects %s, persists it, synchronizes the document, and restores English",
    async (locale) => {
      const catalog = LOCALE_REGISTRY[locale].catalog;
      const description = documentDescriptionMeta();
      const storageWrite = vi.spyOn(window.localStorage, "setItem");
      render(<App />);

      await selectInterfaceLanguage(locale);

      expect(storageWrite.mock.calls).toEqual([
        [INTERFACE_LOCALE_STORAGE_KEY, locale],
      ]);
      expect(interfaceLanguageSelect().value).toBe(locale);
      expect(document.documentElement.lang).toBe(locale);
      expect(document.documentElement.dir).toBe("ltr");
      expect(document.title).toBe(catalog["metadata.title"]);
      expect(description.content).toBe(catalog["metadata.description"]);
      expect(
        screen.getByRole("heading", { name: catalog["scenario.heading"] }),
      ).toBeTruthy();
      expect(
        screen.getByRole("combobox", {
          name: catalog["interfaceLanguage.label"],
        }),
      ).toBe(interfaceLanguageSelect());
      expect(fetchMock).not.toHaveBeenCalled();

      await selectInterfaceLanguage("en");

      expect(document.documentElement.lang).toBe("en");
      expect(document.documentElement.dir).toBe("ltr");
      expect(document.title).toBe(ENGLISH_CATALOG["metadata.title"]);
      expect(description.content).toBe(
        ENGLISH_CATALOG["metadata.description"],
      );
      expect(fetchMock).not.toHaveBeenCalled();
    },
  );

  it("preserves Enhanced Visibility and client validation while rendering Ukrainian copy", async () => {
    const ukrainianCatalog = LOCALE_REGISTRY.uk.catalog;
    const russianCatalog = LOCALE_REGISTRY.ru.catalog;
    render(<App />);
    fireEvent.change(visualModeSelect(), { target: { value: "enhanced" } });
    fireEvent.click(
      screen.getByRole("button", { name: ENGLISH_CATALOG["form.submitButton"] }),
    );
    const fieldError = await screen.findByText(ENGLISH_CATALOG["validation.empty"]);

    await selectInterfaceLanguage("uk");

    expectVisualMode("enhanced");
    expect(situationField().value).toBe("");
    expect(fieldError.isConnected).toBe(true);
    expect(fieldError.textContent).toBe(ukrainianCatalog["validation.empty"]);
    expect(situationField().getAttribute("aria-invalid")).toBe("true");
    expect(situationField().getAttribute("aria-errormessage")).toBe(
      "situation-error",
    );
    expect(
      screen.getByRole("heading", { name: ukrainianCatalog["scenario.heading"] }),
    ).toBeTruthy();
    expect(
      screen.queryByText(russianCatalog["scenario.heading"]),
    ).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("preserves an unavailable terminal state when switching to Ukrainian", async () => {
    const ukrainianCatalog = LOCALE_REGISTRY.uk.catalog;
    fetchMock.mockResolvedValue(
      jsonResponse({ detail: "Synthetic hidden detail" }, 503),
    );
    render(<App />);
    fireEvent.change(visualModeSelect(), { target: { value: "enhanced" } });
    submitSituation();
    const terminal = await screen.findByRole("alert");
    expect(fetchMock).toHaveBeenCalledTimes(1);

    await selectInterfaceLanguage("uk");

    expect(terminal.isConnected).toBe(true);
    expect(terminal.textContent).toContain(
      ukrainianCatalog["error.unavailableTitle"],
    );
    expect(situationField().value).toBe(SYNTHETIC_SITUATION);
    expectVisualMode("enhanced");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("keeps English backend prose and the exact API contract in a Swahili normal result", async () => {
    const catalog = LOCALE_REGISTRY.sw.catalog;
    fetchMock.mockResolvedValue(jsonResponse(normalResponse));
    render(<App />);
    await selectInterfaceLanguage("sw");

    submitSituation(`  ${SYNTHETIC_SITUATION}  `);

    const heading = await screen.findByRole("heading", {
      name: catalog["priority.actNow"],
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [endpoint, options] = fetchMock.mock.calls[0];
    expect(endpoint).toBe("/api/v1/action-plan");
    expect(JSON.parse(String(options?.body))).toEqual({
      situation_text: SYNTHETIC_SITUATION,
      origin: { latitude: 41.3874, longitude: 2.1686 },
      maximum_distance_m: 3000,
      output_locale: "en",
    });
    expect(normalResponse.output_locale).toBe("en");
    expect(formatDistance(725, "sw")).toBe("mita 725");
    expect(formatDistance(1200, "sw")).toBe("km 1.2");
    const distanceLabel = screen.getByText(catalog["place.distanceLabel"]);
    expect(distanceLabel.parentElement?.querySelector("dd")?.textContent).toContain(
      "mita 725",
    );
    expect(heading.closest(".result-section")?.hasAttribute("lang")).toBe(
      false,
    );
    expect(
      screen.getByText(normalResponse.plan.now.actions[0].text),
    ).toBeTruthy();
    expect(
      Array.from(document.querySelectorAll<HTMLOListElement>("ol.action-list"))
        .every((list) => list.lang === "en"),
    ).toBe(true);
    expect(document.querySelector<HTMLElement>("p.weather-boundary")?.lang).toBe(
      "en",
    );
    expect(document.querySelector<HTMLElement>("ul.bring-list")?.lang).toBe(
      "en",
    );
    expect(
      document.querySelector<HTMLElement>("ul.explanation-list")?.lang,
    ).toBe("en");
    expect(document.querySelector<HTMLElement>("ul.warning-list")?.lang).toBe(
      "en",
    );
    expect(document.querySelector<HTMLElement>("ul.notice-list")?.lang).toBe(
      "en",
    );
    const officialName = screen.getByRole("heading", {
      name: normalResponse.selected_place.name,
    });
    expect(officialName.hasAttribute("lang")).toBe(false);
    expect(document.querySelector(".place-address")?.hasAttribute("lang")).toBe(
      false,
    );
    expectNoLocalizationLeak();
  });
});

describe("M6.12 RTL interface foundation", () => {
  it.each(RTL_INTERFACE_CASES)(
    "selects %s, persists only its exact code, synchronizes RTL metadata, and restores English LTR",
    async (locale, catalog) => {
      const storageWrite = vi.spyOn(window.localStorage, "setItem");
      const description = documentDescriptionMeta();
      render(<App />);
      fireEvent.change(situationField(), {
        target: { value: SYNTHETIC_SITUATION },
      });

      await selectInterfaceLanguage(locale);

      expect(storageWrite.mock.calls).toEqual([
        [INTERFACE_LOCALE_STORAGE_KEY, locale],
      ]);
      expect(interfaceLanguageSelect().value).toBe(locale);
      expect(document.documentElement.lang).toBe(locale);
      expect(document.documentElement.dir).toBe("rtl");
      expect(document.title).toBe(catalog["metadata.title"]);
      expect(description.content).toBe(catalog["metadata.description"]);
      expect(
        screen.getByRole("heading", { name: catalog["scenario.heading"] }),
      ).toBeTruthy();
      expect(situationField().value).toBe(SYNTHETIC_SITUATION);
      expect(
        screen
          .getByRole("link", { name: catalog["navigation.homeAccessibleName"] })
          .querySelector('img[alt=""]'),
      ).not.toBeNull();
      expect(fetchMock).not.toHaveBeenCalled();

      await selectInterfaceLanguage("en");

      expect(document.documentElement.lang).toBe("en");
      expect(document.documentElement.dir).toBe("ltr");
      expect(document.title).toBe(ENGLISH_CATALOG["metadata.title"]);
      expect(description.content).toBe(
        ENGLISH_CATALOG["metadata.description"],
      );
      expect(
        screen
          .getByRole("link", {
            name: ENGLISH_CATALOG["navigation.homeAccessibleName"],
          })
          .querySelector('img[alt=""]'),
      ).not.toBeNull();
      expect(situationField().value).toBe(SYNTHETIC_SITUATION);
      expect(fetchMock).not.toHaveBeenCalled();
    },
  );

  it("keeps Arabic direction in Standard and Enhanced Visibility while the textarea stays direction-auto", async () => {
    render(<App />);
    fireEvent.change(situationField(), {
      target: { value: "English العربية فارسی" },
    });

    await selectInterfaceLanguage("ar");

    expectVisualMode("standard");
    expect(document.documentElement.dir).toBe("rtl");
    expect(situationField().dir).toBe("auto");

    fireEvent.change(visualModeSelect(), { target: { value: "enhanced" } });

    expectVisualMode("enhanced");
    expect(document.documentElement.lang).toBe("ar");
    expect(document.documentElement.dir).toBe("rtl");
    expect(situationField().value).toBe("English العربية فارسی");

    fireEvent.change(visualModeSelect(), { target: { value: "standard" } });

    expectVisualMode("standard");
    expect(document.documentElement.dir).toBe("rtl");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("keeps Urdu RTL in Enhanced Visibility during one pending request", async () => {
    let resolveFetch!: (response: Response) => void;
    fetchMock.mockReturnValue(
      new Promise<Response>((resolve) => {
        resolveFetch = resolve;
      }),
    );
    render(<App />);
    fireEvent.change(visualModeSelect(), { target: { value: "enhanced" } });
    submitSituation();

    await selectInterfaceLanguage("ur");

    expectVisualMode("enhanced");
    expect(document.documentElement.lang).toBe("ur");
    expect(document.documentElement.dir).toBe("rtl");
    expect(interfaceLanguageSelect().disabled).toBe(false);
    expect(situationField().value).toBe(SYNTHETIC_SITUATION);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolveFetch(jsonResponse(normalResponse));
    });
    await screen.findByRole("heading", {
      name: URDU_CATALOG["priority.actNow"],
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(document.documentElement.dir).toBe("rtl");
  });

  it("keeps the last confirmed RTL localization when another supported change rejects", async () => {
    render(<App />);
    await selectInterfaceLanguage("ar");
    fireEvent.change(situationField(), {
      target: { value: SYNTHETIC_SITUATION },
    });
    const storageWrite = vi.spyOn(window.localStorage, "setItem");
    storageWrite.mockClear();
    const changeLanguage = vi
      .spyOn(testI18n, "changeLanguage")
      .mockRejectedValue(new Error("Synthetic RTL language rejection"));

    fireEvent.change(interfaceLanguageSelect(), { target: { value: "he" } });

    await waitFor(() => expect(changeLanguage).toHaveBeenCalledWith("he"));
    expect(testI18n.resolvedLanguage).toBe("ar");
    expect(interfaceLanguageSelect().value).toBe("ar");
    expect(document.documentElement.lang).toBe("ar");
    expect(document.documentElement.dir).toBe("rtl");
    expect(situationField().value).toBe(SYNTHETIC_SITUATION);
    expect(storageWrite).not.toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("ignores an unsupported synthetic selection after an RTL locale is confirmed", async () => {
    render(<App />);
    await selectInterfaceLanguage("ar");
    const storageWrite = vi.spyOn(window.localStorage, "setItem");
    storageWrite.mockClear();

    fireEvent.change(interfaceLanguageSelect(), { target: { value: "eo" } });

    expect(testI18n.resolvedLanguage).toBe("ar");
    expect(document.documentElement.lang).toBe("ar");
    expect(document.documentElement.dir).toBe("rtl");
    expect(storageWrite).not.toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("preserves a translated client validation relationship when switching to Arabic", async () => {
    render(<App />);
    fireEvent.click(
      screen.getByRole("button", { name: ENGLISH_CATALOG["form.submitButton"] }),
    );
    const fieldError = await screen.findByText(
      ENGLISH_CATALOG["validation.empty"],
    );

    await selectInterfaceLanguage("ar");

    expect(fieldError.isConnected).toBe(true);
    expect(fieldError.textContent).toBe(ARABIC_CATALOG["validation.empty"]);
    expect(situationField().getAttribute("aria-invalid")).toBe("true");
    expect(situationField().getAttribute("aria-errormessage")).toBe(
      "situation-error",
    );
    expect(document.documentElement.dir).toBe("rtl");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("preserves a no-place terminal state and its English prose boundaries after an Arabic switch", async () => {
    fetchMock.mockResolvedValue(jsonResponse(noPlaceResponse));
    render(<App />);
    submitSituation();
    const terminal = await screen.findByRole("heading", {
      name: ENGLISH_CATALOG["result.noPlaceTitle"],
    });

    await selectInterfaceLanguage("ar");

    expect(terminal.isConnected).toBe(true);
    expect(terminal.textContent).toBe(ARABIC_CATALOG["result.noPlaceTitle"]);
    const prose = Array.from(
      document.querySelectorAll<HTMLElement>(".empty-place p[lang='en']"),
    );
    expect(prose).toHaveLength(2);
    expect(prose.every((paragraph) => paragraph.dir === "ltr")).toBe(true);
    expect(situationField().value).toBe(SYNTHETIC_SITUATION);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("keeps the Arabic interface independent from the App's default English output request", async () => {
    fetchMock.mockResolvedValue(jsonResponse(normalResponse));
    render(<App />);

    await selectInterfaceLanguage("ar");
    submitSituation();

    await screen.findByRole("heading", {
      name: ARABIC_CATALOG["priority.actNow"],
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [, options] = fetchMock.mock.calls[0];
    expect(JSON.parse(String(options?.body))).toEqual({
      situation_text: SYNTHETIC_SITUATION,
      origin: { latitude: 41.3874, longitude: 2.1686 },
      maximum_distance_m: 3000,
      output_locale: "en",
    });
    expect(document.documentElement.lang).toBe("ar");
    expect(document.documentElement.dir).toBe("rtl");
    expect(screen.getAllByRole("combobox")).toHaveLength(3);
    expect(outputLanguageSelect().value).toBe("en");
    expect(window.localStorage.getItem(OUTPUT_LOCALE_STORAGE_KEY)).toBeNull();
  });

  it("preserves a backend error terminal state after switching to Urdu", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({ detail: "Synthetic hidden detail" }, 503),
    );
    render(<App />);
    submitSituation();
    const terminal = await screen.findByRole("alert");

    await selectInterfaceLanguage("ur");

    expect(terminal.isConnected).toBe(true);
    expect(terminal.textContent).toContain(URDU_CATALOG["error.unavailableTitle"]);
    expect(document.documentElement.dir).toBe("rtl");
    expect(situationField().value).toBe(SYNTHETIC_SITUATION);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("keeps Persian visible calendar values localized while preserving Gregorian machine values and English output prose", async () => {
    fetchMock.mockResolvedValue(jsonResponse(normalResponse));
    render(<App />);
    submitSituation(`  ${SYNTHETIC_SITUATION}  `);
    const resultHeading = await screen.findByRole("heading", {
      name: ENGLISH_CATALOG["priority.actNow"],
    });

    await selectInterfaceLanguage("fa");

    expect(resultHeading.isConnected).toBe(true);
    expect(resultHeading.textContent).toBe(PERSIAN_CATALOG["priority.actNow"]);
    expect(document.documentElement.lang).toBe("fa");
    expect(document.documentElement.dir).toBe("rtl");
    const result = resultHeading.closest<HTMLElement>(".result-section");
    expect(result?.hasAttribute("lang")).toBe(false);
    expect(result?.hasAttribute("dir")).toBe(false);

    const evaluationTime = document.querySelector<HTMLTimeElement>(
      `time[datetime="${normalResponse.evaluation_time}"]`,
    );
    expect(evaluationTime?.dateTime).toBe(normalResponse.evaluation_time);
    expect(evaluationTime?.textContent).toContain("۲۶ تیر ۱۴۰۵، ۱۰:۰۰");
    expect(evaluationTime?.dir).toBe("auto");
    const lastChecked = document.querySelector<HTMLTimeElement>(
      `time[datetime="${normalResponse.selected_place.last_checked}"]`,
    );
    expect(lastChecked?.dateTime).toBe(
      normalResponse.selected_place.last_checked,
    );
    expect(lastChecked?.textContent).toBe("۲۴ تیر ۱۴۰۵");
    expect(lastChecked?.dir).toBe("auto");

    for (const selector of [
      "ol.action-list",
      "p.weather-boundary",
      "ul.bring-list",
      "ul.explanation-list",
      "ul.warning-list",
      "ul.notice-list",
    ]) {
      const elements = Array.from(document.querySelectorAll<HTMLElement>(selector));
      expect(elements.length).toBeGreaterThan(0);
      expect(elements.every((element) => element.lang === "en")).toBe(true);
      expect(elements.every((element) => element.dir === "ltr")).toBe(true);
    }

    const officialName = document.querySelector<HTMLElement>(
      "#selected-place-title",
    );
    const officialNameIsolation = officialName?.querySelector<HTMLElement>(
      "bdi[dir='auto']",
    );
    expect(officialNameIsolation?.textContent).toBe(
      normalResponse.selected_place.name,
    );
    expect(officialName?.hasAttribute("lang")).toBe(false);
    expect(officialNameIsolation?.hasAttribute("lang")).toBe(false);
    const officialAddress = document.querySelector<HTMLElement>(
      ".place-address",
    );
    expect(officialAddress?.querySelector("bdi[dir='auto']")).toBeTruthy();
    expect(officialAddress?.hasAttribute("lang")).toBe(false);
    expect(
      officialAddress?.querySelector("bdi[dir='auto']")?.hasAttribute("lang"),
    ).toBe(false);
    expect(
      document.querySelectorAll(".summary-card strong[dir='auto']"),
    ).toHaveLength(3);
    expect(
      document.querySelector(".local-phrase blockquote")?.getAttribute("dir"),
    ).toBe("ltr");

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [endpoint, options] = fetchMock.mock.calls[0];
    expect(endpoint).toBe("/api/v1/action-plan");
    expect(JSON.parse(String(options?.body))).toEqual({
      situation_text: SYNTHETIC_SITUATION,
      origin: { latitude: 41.3874, longitude: 2.1686 },
      maximum_distance_m: 3000,
      output_locale: "en",
    });
    expect(Object.keys(JSON.parse(String(options?.body))).sort()).toEqual([
      "maximum_distance_m",
      "origin",
      "output_locale",
      "situation_text",
    ]);
  });

  it("keeps urgent English prose, Catalan service text, and 112 isolated LTR in Hebrew", async () => {
    fetchMock.mockResolvedValue(jsonResponse(urgentResponse));
    render(<App />);
    submitSituation();
    const terminal = await screen.findByRole("heading", {
      name: ENGLISH_CATALOG["urgent.title"],
    });

    await selectInterfaceLanguage("he");

    expect(terminal.isConnected).toBe(true);
    expect(terminal.textContent).toBe(HEBREW_CATALOG["urgent.title"]);
    const urgentResult = terminal.closest<HTMLElement>(".urgent-result");
    expect(urgentResult?.hasAttribute("lang")).toBe(false);
    expect(urgentResult?.hasAttribute("dir")).toBe(false);
    for (const selector of [
      ".urgent-instruction",
      ".urgent-actions",
      ".notice-list",
    ]) {
      const element = urgentResult?.querySelector<HTMLElement>(selector);
      expect(element?.lang).toBe("en");
      expect(element?.dir).toBe("ltr");
    }
    const service = urgentResult?.querySelector<HTMLElement>(
      ".urgent-number span",
    );
    expect(service?.textContent).toBe("112 emergències");
    expect(service?.lang).toBe("ca");
    expect(service?.dir).toBe("ltr");
    const phone = urgentResult?.querySelector<HTMLElement>(
      ".urgent-number bdi",
    );
    expect(phone?.textContent).toBe("112");
    expect(phone?.dir).toBe("ltr");
    expect(phone?.hasAttribute("lang")).toBe(false);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("keeps both Catalan and Spanish local phrases explicitly LTR", async () => {
    const spanishPhraseResponse = {
      ...normalResponse,
      plan: {
        ...normalResponse.plan,
        local_phrase: {
          code: "spanish_request_cool_space",
          language: "es",
          text: "Necesito un lugar fresco, por favor.",
        },
      },
    } as const;
    fetchMock
      .mockResolvedValueOnce(jsonResponse(normalResponse))
      .mockResolvedValueOnce(jsonResponse(spanishPhraseResponse));

    render(<App />);
    await selectInterfaceLanguage("ar");
    submitSituation();
    await screen.findByRole("heading", { name: ARABIC_CATALOG["priority.actNow"] });
    let phrase = document.querySelector<HTMLElement>(".local-phrase blockquote");
    expect(phrase?.lang).toBe("ca");
    expect(phrase?.dir).toBe("ltr");

    cleanup();
    render(<App />);
    await selectInterfaceLanguage("ar");
    submitSituation();
    await screen.findByRole("heading", { name: ARABIC_CATALOG["priority.actNow"] });
    phrase = document.querySelector<HTMLElement>(".local-phrase blockquote");
    expect(phrase?.lang).toBe("es");
    expect(phrase?.dir).toBe("ltr");
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("allows status values to shrink and wrap at 200% zoom", () => {
    expect(stylesSource).toMatch(
      /\.place-details dd\s*\{[^}]*min-width:\s*0;/s,
    );
    expect(stylesSource).toMatch(
      /p,\s*li,\s*dd,[\s\S]*?\{[^}]*overflow-wrap:\s*anywhere;/s,
    );
  });

  it("uses stronger Enhanced Visibility boundaries and automatic scrolling", () => {
    expect(stylesSource).toMatch(
      /html:has\(\.app-shell\[data-visual-mode="enhanced"\]\)\s*\{[^}]*scroll-behavior:\s*auto;/s,
    );
    expect(stylesSource).toMatch(
      /\.app-shell\[data-visual-mode="enhanced"\]\s*\{[^}]*--color-border:\s*#827b72;/s,
    );
    expect(stylesSource).not.toMatch(
      /\.app-shell\[data-visual-mode="enhanced"\][^{]*\{[^}]*scroll-behavior:\s*smooth;/s,
    );
  });

  it("uses only the targeted logical CSS properties and preserves geometric centering", () => {
    const ruleFor = (selector: RegExp): string => {
      const match = stylesSource.match(
        new RegExp(`${selector.source}\\s*\\{([^}]*)\\}`, "s"),
      );
      expect(match).not.toBeNull();
      return match?.[1] ?? "";
    };

    expect(stylesSource).toContain("inset-block-start: var(--space-3);");
    expect(stylesSource).toContain("inset-inline-start: var(--space-3);");
    expect(stylesSource).toContain("padding-inline-start: 5.75rem;");
    expect(stylesSource).toContain(
      "border-inline-start: 0.3rem solid var(--color-danger);",
    );
    expect(stylesSource).toContain("html[dir=\"rtl\"] h1");
    expect(stylesSource).toContain("line-height: var(--line-height-heading);");
    expect(stylesSource).toContain("letter-spacing: normal;");
    expect(stylesSource).toContain('html[dir="rtl"] .brand img');

    expect(ruleFor(/\.skip-link/)).not.toMatch(/^\s*(?:top|left)\s*:/m);
    expect(ruleFor(/\.settings-control select/)).toContain(
      "padding-inline: var(--space-3) 2.25rem;",
    );
    expect(ruleFor(/button,\s*select/)).toContain(
      "min-height: var(--target-control-size);",
    );
    expect(stylesSource).toMatch(
      /\.app-shell\[data-visual-mode="enhanced"\] \.settings-control select,[\s\S]*?min-height:\s*var\(--target-control-size\);/s,
    );
    expect(stylesSource).toMatch(
      /@media \(max-width: 760px\)[\s\S]*?\.header-settings-grid\s*\{[^}]*grid-template-columns:\s*minmax\(0, 1fr\);/s,
    );
    expect(stylesSource).toMatch(
      /@media \(max-width: 430px\)[\s\S]*?--page-padding:\s*0\.875rem;/s,
    );
    expect(stylesSource).not.toMatch(/(?:margin|padding|border)-(?:left|right):/);
    expect(stylesSource).not.toMatch(/^\s*(?:left|right):/m);
    expect(stylesSource).not.toContain(".brand-mark");
    expect(appSource).toContain('import heatRelayMark from "./assets/heatrelay-mark.png"');
    expect(stylesSource).toContain("font-family: \"Noto Nastaliq Urdu\"");
    expect(stylesSource).toContain("line-height: 1.92;");
    expect(stylesSource).toContain("@media (prefers-reduced-motion: reduce)");
    expect(stylesSource).toContain("@media (prefers-contrast: more)");
  });
});

describe("Barcelona action-plan flow", () => {
  it("keeps production translation calls on static typed catalog keys or typed maps", () => {
    const directTranslationKeys = Array.from(
      appSource.matchAll(/\bt\(\s*["']([^"']+)["']/g),
      (match) => match[1],
    );

    expect(directTranslationKeys.length).toBeGreaterThan(0);
    for (const key of directTranslationKeys) {
      expect(Object.hasOwn(ENGLISH_CATALOG, key)).toBe(true);
    }
    expect(appSource).not.toMatch(/\bt\(\s*`/);
    expect(appSource).not.toContain("as any");
    expect(appSource).not.toContain("as unknown as");
    expect(appSource).not.toMatch(/new Intl\.|\.toLocaleString\(|\.toFixed\(/);
  });

  it("renders an accessible initial form with permanent essential guidance", () => {
    render(<App />);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "How can we help?",
      }),
    ).toBeTruthy();
    expect(
      screen.getByRole("form", { name: "How can we help?" }),
    ).toBeTruthy();
    expect(
      screen.getByRole("heading", { name: "Important now" }),
    ).toBeTruthy();
    const initialSteps = document.querySelector(".important-now-preview");
    expect(initialSteps?.textContent).toContain("Drinking water");
    expect(initialSteps?.textContent).toContain("Find a cool place nearby");
    expect(
      initialSteps?.querySelectorAll(".action-icon"),
    ).toHaveLength(2);

    const textarea = situationField();
    expect(textarea.getAttribute("aria-describedby")).toBe(
      "privacy-description identity-warning situation-hint character-count boundary-note",
    );
    expect(textarea.hasAttribute("aria-invalid")).toBe(false);
    expect(textarea.hasAttribute("aria-errormessage")).toBe(false);
    expect(screen.getByText(/2,000 code points/i)).toBeTruthy();
    expect(
      screen.getByText(/sent server-side.*GPT-5\.6 processing/i),
    ).toBeTruthy();
    expect(screen.getByText(/does not intentionally store/i)).toBeTruthy();
    expect(
      screen.getByText(/situation text is not stored in browser storage/i),
    ).toBeTruthy();
    const privacyCopy = screen
      .getByRole("heading", { name: "Keep identifying details out" })
      .closest("article")
      ?.textContent?.replace(/\s+/g, " ");
    expect(privacyCopy).toBe(
      `PrivacyKeep identifying details out${ENGLISH_CATALOG["trust.privacyDescription"]}`,
    );
    expect(privacyCopy).not.toContain("non-sensitive");
    expect(privacyCopy).toContain(
      "Situation text is not stored in browser storage.",
    );
    expect(privacyCopy).toContain(
      "Explicit visual-mode, interface-language, and action-plan-language preferences are stored locally.",
    );
    expect(privacyCopy).toContain(
      "Only the selected action-plan language code enters the action-plan request; visual mode and interface locale do not.",
    );
    expect(privacyCopy).toContain(
      "HeatRelay does not use analytics, cookies, URL parameters, or geolocation in this demo.",
    );
    expect(
      screen.getByText(/only the selected action-plan language code enters the action-plan request/i),
    ).toBeTruthy();
    expect(
      screen.getByText(
        /do not include names, contact details, addresses, or other identifying information/i,
      ),
    ).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "Load Barcelona demo" }),
    ).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "Create my heat action plan" }),
    ).toBeTruthy();
    expect(
      screen.getByText(/fixed Barcelona demo coordinates/i),
    ).toBeTruthy();
    expect(
      screen.getByText(/browser location is not available yet/i),
    ).toBeTruthy();
    expect(screen.getByText(/straight-line estimates/i)).toBeTruthy();
    expect(screen.getByText(/not medical or emergency advice/i)).toBeTruthy();
    const disclosure = document.querySelector("details.form-disclosure");
    expect(disclosure?.hasAttribute("open")).toBe(false);
    for (const id of [
      "privacy-description",
      "identity-warning",
      "boundary-note",
      "situation-hint",
    ]) {
      const guidance = document.getElementById(id);
      expect(guidance).not.toBeNull();
      expect(guidance?.closest("details")).toBeNull();
      expect(guidance?.hidden).toBe(false);
    }
    expectNoLocalizationLeak();
  });

  it("renders three localized non-interactive scenario examples without changing the request", async () => {
    fetchMock.mockResolvedValue(jsonResponse(normalResponse));
    render(<App />);

    const scenarios = Array.from(
      document.querySelectorAll<HTMLElement>(".scenario-option"),
    );
    expect(scenarios).toHaveLength(3);
    expect(scenarios.map((scenario) => scenario.textContent)).toEqual([
      expect.stringContaining(ENGLISH_CATALOG["scenario.selfTitle"]),
      expect.stringContaining(ENGLISH_CATALOG["scenario.someoneTitle"]),
      expect.stringContaining(ENGLISH_CATALOG["scenario.placeTitle"]),
    ]);
    expect(screen.queryByRole("radio")).toBeNull();
    expect(document.querySelector('[role="radiogroup"]')).toBeNull();
    expect(scenarios[0].getAttribute("data-primary")).toBe("true");
    expect(scenarios[0].querySelector("form")).not.toBeNull();
    expect(scenarios[1].querySelector("form")).toBeNull();
    expect(scenarios[2].querySelector("form")).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();

    fireEvent.change(situationField(), {
      target: { value: SYNTHETIC_SITUATION },
    });
    fireEvent.click(
      screen.getByRole("button", { name: "Create my heat action plan" }),
    );

    await screen.findByRole("heading", { name: "Act now" });
    expect(JSON.parse(String(fetchMock.mock.calls[0][1]?.body))).toEqual({
      situation_text: SYNTHETIC_SITUATION,
      origin: { latitude: 41.3874, longitude: 2.1686 },
      maximum_distance_m: 3000,
      output_locale: "en",
    });
  });

  it("uses the associated field-error path for an empty submission", async () => {
    render(<App />);

    fireEvent.click(
      screen.getByRole("button", { name: "Create my heat action plan" }),
    );

    const textarea = situationField();
    const fieldError = document.getElementById("situation-error");
    expect(fieldError?.textContent).toBe(
      "Describe the situation before creating a plan.",
    );
    expect(textarea.getAttribute("aria-invalid")).toBe("true");
    expect(textarea.getAttribute("aria-errormessage")).toBe("situation-error");
    expect(textarea.getAttribute("aria-describedby")).toBe(
      "privacy-description identity-warning situation-hint character-count boundary-note situation-error",
    );
    await waitFor(() => expect(document.activeElement).toBe(textarea));
    expect(screen.queryByRole("alert")).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("removes the field error and its association when input is corrected", async () => {
    render(<App />);

    fireEvent.click(
      screen.getByRole("button", { name: "Create my heat action plan" }),
    );
    const textarea = situationField();
    await waitFor(() => expect(document.activeElement).toBe(textarea));

    fireEvent.change(textarea, { target: { value: SYNTHETIC_SITUATION } });

    expect(document.getElementById("situation-error")).toBeNull();
    expect(textarea.hasAttribute("aria-invalid")).toBe(false);
    expect(textarea.hasAttribute("aria-errormessage")).toBe(false);
    expect(textarea.getAttribute("aria-describedby")).toBe(
      "privacy-description identity-warning situation-hint character-count boundary-note",
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("keeps one programmatically focusable main target for the skip link", () => {
    render(<App />);

    const skipLink = screen.getByRole("link", { name: "Skip to main content" });
    const mainLandmarks = screen.getAllByRole("main");

    expect(skipLink.getAttribute("href")).toBe("#main-content");
    expect(mainLandmarks).toHaveLength(1);
    expect(mainLandmarks[0].id).toBe("main-content");
    expect(mainLandmarks[0].tabIndex).toBe(-1);
  });

  it.each(["normal", "urgent", "error"] as const)(
    "keeps the page h1 before the focused %s result h2",
    async (terminalState) => {
      fetchMock.mockResolvedValue(
        terminalState === "normal"
          ? jsonResponse(normalResponse)
          : terminalState === "urgent"
            ? jsonResponse(urgentResponse)
            : jsonResponse({ detail: "Synthetic unavailable" }, 503),
      );
      render(<App />);
      submitSituation();

      const terminalHeading =
        terminalState === "normal"
          ? await screen.findByRole("heading", { level: 2, name: "Act now" })
          : terminalState === "urgent"
            ? await screen.findByRole("heading", {
                level: 2,
                name: "Urgent help",
              })
            : await screen.findByRole("heading", {
                level: 2,
                name: "Action plan temporarily unavailable",
              });
      const pageHeadings = screen.getAllByRole("heading", { level: 1 });

      expect(pageHeadings).toHaveLength(1);
      expect(
        Boolean(
          pageHeadings[0].compareDocumentPosition(terminalHeading) &
            Node.DOCUMENT_POSITION_FOLLOWING,
        ),
      ).toBe(true);
      expect(document.activeElement).toBe(terminalHeading);
    },
  );

  it("loads the synthetic Barcelona demo without submitting", () => {
    const storageWrite = vi.spyOn(window.localStorage, "setItem");
    render(<App />);

    fireEvent.click(
      screen.getByRole("button", { name: "Load Barcelona demo" }),
    );

    expect(situationField().value).toBe(DEMO_TEXT);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(storageWrite).not.toHaveBeenCalled();
  });

  it("sends only the trimmed situation and fixed Barcelona request facts", async () => {
    window.localStorage.setItem(INTERFACE_LOCALE_STORAGE_KEY, "en");
    fetchMock.mockResolvedValue(jsonResponse(normalResponse));
    render(<App />);
    const storageWrite = vi.spyOn(window.localStorage, "setItem");

    fireEvent.change(visualModeSelect(), { target: { value: "enhanced" } });

    submitSituation(`  ${SYNTHETIC_SITUATION}  `);

    await screen.findByRole("heading", { name: "Act now" });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [endpoint, options] = fetchMock.mock.calls[0];
    expect(endpoint).toBe("/api/v1/action-plan");
    expect(options?.method).toBe("POST");
    expect(options?.headers).toEqual({ "Content-Type": "application/json" });
    const body = JSON.parse(String(options?.body));
    expect(body).toEqual({
      situation_text: SYNTHETIC_SITUATION,
      origin: { latitude: 41.3874, longitude: 2.1686 },
      maximum_distance_m: 3000,
      output_locale: "en",
    });
    expect(Object.keys(body).sort()).toEqual([
      "maximum_distance_m",
      "origin",
      "output_locale",
      "situation_text",
    ]);
    expect(body.output_locale).toBe(DEFAULT_OUTPUT_LOCALE);
    expect(storageWrite.mock.calls).toEqual([
      [VISUAL_MODE_STORAGE_KEY, "enhanced"],
    ]);
    expect(JSON.stringify(body)).not.toContain("visual-mode");
    expect(JSON.stringify(body)).not.toContain(
      INTERFACE_LOCALE_STORAGE_KEY,
    );
    expect(JSON.stringify(body)).not.toContain("storage");
    expect(JSON.stringify(body)).not.toMatch(
      /interface_locale|detected_input_language|preferred_language|input_language_source|text_direction|visual_mode/i,
    );
    expect(window.localStorage.getItem(INTERFACE_LOCALE_STORAGE_KEY)).toBe("en");
    expect(window.localStorage.getItem("heatrelay.output-locale.v1")).toBeNull();
  });

  it("keeps the response-side input-language domain separate and exact", () => {
    expect(SUPPORTED_INPUT_LANGUAGES).toEqual([
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
    ]);
    expect(DEFAULT_OUTPUT_LOCALE).toBe("en");
  });

  it.each([
    ...SUPPORTED_INPUT_LANGUAGES,
    "other",
    "unknown",
  ] as readonly DetectedInputLanguage[])(
    "accepts exact detected language metadata for %s",
    (detectedInputLanguage) => {
      const inputLanguageSource: InputLanguageSource =
        detectedInputLanguage === "unknown"
          ? "fallback"
          : "automatically_detected";
      const response = {
        ...normalResponse,
        situation: {
          schema_version: "1.1.0",
          notice: SITUATION_NOTICE,
          detected_input_language: detectedInputLanguage,
          input_language_source: inputLanguageSource,
          preferred_language: { status: "not_stated", value: null },
        },
      };

      expect(parseActionPlanResponse(response)).toEqual(response);
    },
  );

  it("accepts valid normal and urgent 1.16.0 responses without displaying language metadata", async () => {
    expect(parseActionPlanResponse(normalResponse)).toEqual(normalResponse);
    expect(parseActionPlanResponse(urgentResponse)).toEqual(urgentResponse);

    fetchMock.mockResolvedValue(jsonResponse(normalResponse));
    render(<App />);
    submitSituation();

    await screen.findByRole("heading", { name: "Act now" });
    expect(document.body.textContent).not.toContain("automatically_detected");
    expect(document.body.textContent).not.toMatch(
      /detected input language|input language source|language mismatch/i,
    );
  });

  it("accepts independently valid Spanish normal and urgent response contracts", () => {
    expect(parseActionPlanResponse(spanishNormalResponse)).toEqual(
      spanishNormalResponse,
    );
    expect(parseActionPlanResponse(spanishUrgentResponse)).toEqual(
      spanishUrgentResponse,
    );
  });

  it.each([
    [
      "zh-CN",
      simplifiedChineseNormalResponse,
      simplifiedChineseUrgentResponse,
    ],
    [
      "zh-TW",
      traditionalChineseNormalResponse,
      traditionalChineseUrgentResponse,
    ],
  ] as const)(
    "accepts independently valid %s normal and urgent response contracts",
    (_locale, normalPayload, urgentPayload) => {
      expect(parseActionPlanResponse(normalPayload)).toEqual(normalPayload);
      expect(parseActionPlanResponse(urgentPayload)).toEqual(urgentPayload);
    },
  );

  it.each([
    ["hi", hindiNormalResponse, hindiUrgentResponse],
    ["bn", bengaliNormalResponse, bengaliUrgentResponse],
  ] as const)(
    "accepts independently valid %s normal and urgent response contracts",
    (_locale, normalPayload, urgentPayload) => {
      expect(parseActionPlanResponse(normalPayload)).toEqual(normalPayload);
      expect(parseActionPlanResponse(urgentPayload)).toEqual(urgentPayload);
    },
  );

  it("accepts independently valid Arabic normal and urgent response contracts", () => {
    expect(parseActionPlanResponse(arabicNormalResponse)).toEqual(
      arabicNormalResponse,
    );
    expect(parseActionPlanResponse(arabicUrgentResponse)).toEqual(
      arabicUrgentResponse,
    );
  });

  it("accepts independently valid Brazilian Portuguese normal and urgent response contracts", () => {
    expect(parseActionPlanResponse(brazilianPortugueseNormalResponse)).toEqual(
      brazilianPortugueseNormalResponse,
    );
    expect(parseActionPlanResponse(brazilianPortugueseUrgentResponse)).toEqual(
      brazilianPortugueseUrgentResponse,
    );
  });

  it.each([
    ["fr", frenchNormalResponse, frenchUrgentResponse],
    ["it", italianNormalResponse, italianUrgentResponse],
    ["de", germanNormalResponse, germanUrgentResponse],
    ["nl", dutchNormalResponse, dutchUrgentResponse],
    ["ru", russianNormalResponse, russianUrgentResponse],
    ["uk", ukrainianNormalResponse, ukrainianUrgentResponse],
    ["pl", polishNormalResponse, polishUrgentResponse],
    ["ja", japaneseNormalResponse, japaneseUrgentResponse],
    ["ko", koreanNormalResponse, koreanUrgentResponse],
    ["id", indonesianNormalResponse, indonesianUrgentResponse],
    ["vi", vietnameseNormalResponse, vietnameseUrgentResponse],
    ["th", thaiNormalResponse, thaiUrgentResponse],
    ["tr", turkishNormalResponse, turkishUrgentResponse],
    ["sw", swahiliNormalResponse, swahiliUrgentResponse],
    ["ur", urduNormalResponse, urduUrgentResponse],
    ["fa", persianNormalResponse, persianUrgentResponse],
    ["he", hebrewNormalResponse, hebrewUrgentResponse],
  ] as const)(
    "accepts independently valid %s normal and urgent response contracts",
    (_locale, normalPayload, urgentPayload) => {
      expect(parseActionPlanResponse(normalPayload)).toEqual(normalPayload);
      expect(parseActionPlanResponse(urgentPayload)).toEqual(urgentPayload);
    },
  );

  it.each([
    [
      "situation notice",
      { ...spanishNormalResponse, situation: situationLanguageMetadata },
    ],
    [
      "weather notice",
      { ...spanishNormalResponse, weather: normalResponse.weather },
    ],
    [
      "urgent instruction",
      {
        ...spanishUrgentResponse,
        urgent_contact: urgentResponse.urgent_contact,
      },
    ],
    [
      "urgent action",
      { ...spanishUrgentResponse, actions: urgentResponse.actions },
    ],
    [
      "urgent notice",
      { ...spanishUrgentResponse, notices: urgentResponse.notices },
    ],
  ] as const)("rejects an English value in the Spanish %s contract", (_label, response) => {
    expect(parseActionPlanResponse(response)).toBeNull();
  });

  it.each([
    [
      "zh-CN situation notice",
      {
        ...simplifiedChineseNormalResponse,
        situation: situationLanguageMetadata,
      },
    ],
    [
      "zh-CN weather notice",
      {
        ...simplifiedChineseNormalResponse,
        weather: normalResponse.weather,
      },
    ],
    [
      "zh-CN urgent instruction",
      {
        ...simplifiedChineseUrgentResponse,
        urgent_contact: urgentResponse.urgent_contact,
      },
    ],
    [
      "zh-CN urgent action",
      {
        ...simplifiedChineseUrgentResponse,
        actions: traditionalChineseUrgentResponse.actions,
      },
    ],
    [
      "zh-CN urgent notice",
      {
        ...simplifiedChineseUrgentResponse,
        notices: traditionalChineseUrgentResponse.notices,
      },
    ],
    [
      "zh-TW situation notice",
      {
        ...traditionalChineseNormalResponse,
        situation: simplifiedChineseNormalResponse.situation,
      },
    ],
    [
      "zh-TW weather notice",
      {
        ...traditionalChineseNormalResponse,
        weather: simplifiedChineseNormalResponse.weather,
      },
    ],
    [
      "zh-TW urgent instruction",
      {
        ...traditionalChineseUrgentResponse,
        urgent_contact: simplifiedChineseUrgentResponse.urgent_contact,
      },
    ],
    [
      "zh-TW urgent action",
      {
        ...traditionalChineseUrgentResponse,
        actions: simplifiedChineseUrgentResponse.actions,
      },
    ],
    [
      "zh-TW urgent notice",
      {
        ...traditionalChineseUrgentResponse,
        notices: simplifiedChineseUrgentResponse.notices,
      },
    ],
  ] as const)("rejects an altered or cross-locale Chinese %s", (_label, response) => {
    expect(parseActionPlanResponse(response)).toBeNull();
  });

  it.each([
    [
      "Hindi situation notice",
      { ...hindiNormalResponse, situation: bengaliNormalResponse.situation },
    ],
    [
      "Hindi weather notice",
      { ...hindiNormalResponse, weather: bengaliNormalResponse.weather },
    ],
    [
      "Hindi urgent instruction",
      {
        ...hindiUrgentResponse,
        urgent_contact: bengaliUrgentResponse.urgent_contact,
      },
    ],
    [
      "Hindi urgent action",
      { ...hindiUrgentResponse, actions: bengaliUrgentResponse.actions },
    ],
    [
      "Hindi urgent notice",
      { ...hindiUrgentResponse, notices: bengaliUrgentResponse.notices },
    ],
    [
      "Bengali situation notice",
      { ...bengaliNormalResponse, situation: hindiNormalResponse.situation },
    ],
    [
      "Bengali weather notice",
      { ...bengaliNormalResponse, weather: hindiNormalResponse.weather },
    ],
    [
      "Bengali urgent instruction",
      {
        ...bengaliUrgentResponse,
        urgent_contact: hindiUrgentResponse.urgent_contact,
      },
    ],
    [
      "Bengali urgent action",
      { ...bengaliUrgentResponse, actions: hindiUrgentResponse.actions },
    ],
    [
      "Bengali urgent notice",
      { ...bengaliUrgentResponse, notices: hindiUrgentResponse.notices },
    ],
    [
      "altered Hindi contact action",
      {
        ...hindiUrgentResponse,
        actions: [
          { ...hindiUrgentResponse.actions[0], text: "अभी 112 को कॉल करें।" },
          hindiUrgentResponse.actions[1],
        ],
      },
    ],
    [
      "altered Bengali medical notice",
      {
        ...bengaliUrgentResponse,
        notices: [
          "জলবায়ু আশ্রয়স্থল চিকিৎসার বিকল্প নয়।",
          bengaliUrgentResponse.notices[1],
        ],
      },
    ],
    [
      "Hindi situation notice from Simplified Chinese",
      {
        ...hindiNormalResponse,
        situation: simplifiedChineseNormalResponse.situation,
      },
    ],
    [
      "Bengali urgent instruction from Spanish",
      {
        ...bengaliUrgentResponse,
        urgent_contact: spanishUrgentResponse.urgent_contact,
      },
    ],
  ] as const)("rejects an altered or cross-locale Indic %s", (_label, response) => {
    expect(parseActionPlanResponse(response)).toBeNull();
  });

  it.each([
    [
      "situation notice",
      { ...arabicNormalResponse, situation: normalResponse.situation },
    ],
    [
      "weather notice",
      { ...arabicNormalResponse, weather: normalResponse.weather },
    ],
    [
      "urgent instruction",
      {
        ...arabicUrgentResponse,
        urgent_contact: hindiUrgentResponse.urgent_contact,
      },
    ],
    [
      "urgent action",
      {
        ...arabicUrgentResponse,
        actions: [
          { ...arabicUrgentResponse.actions[0], text: "اتصل بـ 112 الآن." },
          arabicUrgentResponse.actions[1],
        ],
      },
    ],
    [
      "urgent medical notice",
      {
        ...arabicUrgentResponse,
        notices: [
          "الملاجئ المناخية ليست بديلًا للرعاية الطبية.",
          arabicUrgentResponse.notices[1],
        ],
      },
    ],
    [
      "urgent policy notice",
      { ...arabicUrgentResponse, notices: hindiUrgentResponse.notices },
    ],
  ] as const)("rejects an altered or cross-locale Arabic %s", (_label, response) => {
    expect(parseActionPlanResponse(response)).toBeNull();
  });

  it.each([
    [
      "situation notice",
      {
        ...brazilianPortugueseNormalResponse,
        situation: spanishNormalResponse.situation,
      },
    ],
    [
      "weather notice",
      {
        ...brazilianPortugueseNormalResponse,
        weather: spanishNormalResponse.weather,
      },
    ],
    [
      "urgent instruction",
      {
        ...brazilianPortugueseUrgentResponse,
        urgent_contact: spanishUrgentResponse.urgent_contact,
      },
    ],
    [
      "urgent action",
      {
        ...brazilianPortugueseUrgentResponse,
        actions: [
          {
            ...brazilianPortugueseUrgentResponse.actions[0],
            text: "Ligue 112 agora.",
          },
          brazilianPortugueseUrgentResponse.actions[1],
        ],
      },
    ],
    [
      "urgent medical notice",
      {
        ...brazilianPortugueseUrgentResponse,
        notices: [
          "Os abrigos climáticos não substituem cuidados médicos.",
          brazilianPortugueseUrgentResponse.notices[1],
        ],
      },
    ],
    [
      "urgent policy notice",
      {
        ...brazilianPortugueseUrgentResponse,
        notices: spanishUrgentResponse.notices,
      },
    ],
  ] as const)(
    "rejects an altered or cross-locale Brazilian Portuguese %s",
    (_label, response) => {
      expect(parseActionPlanResponse(response)).toBeNull();
    },
  );

  it.each([
    [
      "French situation notice",
      { ...frenchNormalResponse, situation: italianNormalResponse.situation },
    ],
    [
      "French weather notice",
      { ...frenchNormalResponse, weather: spanishNormalResponse.weather },
    ],
    [
      "French urgent instruction",
      {
        ...frenchUrgentResponse,
        urgent_contact: italianUrgentResponse.urgent_contact,
      },
    ],
    [
      "French urgent action",
      { ...frenchUrgentResponse, actions: italianUrgentResponse.actions },
    ],
    [
      "French urgent notice",
      { ...frenchUrgentResponse, notices: italianUrgentResponse.notices },
    ],
    [
      "Italian situation notice",
      { ...italianNormalResponse, situation: frenchNormalResponse.situation },
    ],
    [
      "Italian weather notice",
      { ...italianNormalResponse, weather: frenchNormalResponse.weather },
    ],
    [
      "Italian urgent instruction",
      {
        ...italianUrgentResponse,
        urgent_contact: frenchUrgentResponse.urgent_contact,
      },
    ],
    [
      "altered French contact action",
      {
        ...frenchUrgentResponse,
        actions: [
          { ...frenchUrgentResponse.actions[0], text: "Appelez le 112." },
          frenchUrgentResponse.actions[1],
        ],
      },
    ],
    [
      "altered Italian medical notice",
      {
        ...italianUrgentResponse,
        notices: [
          "I rifugi climatici non sostituiscono le cure mediche.",
          italianUrgentResponse.notices[1],
        ],
      },
    ],
  ] as const)(
    "rejects an altered or cross-locale French/Italian value: %s",
    (_label, response) => {
      expect(parseActionPlanResponse(response)).toBeNull();
    },
  );

  it.each([
    [
      "German situation notice",
      { ...germanNormalResponse, situation: dutchNormalResponse.situation },
    ],
    [
      "German weather notice",
      { ...germanNormalResponse, weather: dutchNormalResponse.weather },
    ],
    [
      "German urgent instruction",
      {
        ...germanUrgentResponse,
        urgent_contact: dutchUrgentResponse.urgent_contact,
      },
    ],
    [
      "German urgent actions",
      { ...germanUrgentResponse, actions: dutchUrgentResponse.actions },
    ],
    [
      "Dutch urgent notices",
      { ...dutchUrgentResponse, notices: germanUrgentResponse.notices },
    ],
    [
      "altered German call action",
      {
        ...germanUrgentResponse,
        actions: [
          { ...germanUrgentResponse.actions[0], text: "Rufen Sie die 112 an." },
          germanUrgentResponse.actions[1],
        ],
      },
    ],
    [
      "altered Dutch medical notice",
      {
        ...dutchUrgentResponse,
        notices: [
          "Klimaatschuilplaatsen vervangen geen medische zorg.",
          dutchUrgentResponse.notices[1],
        ],
      },
    ],
  ] as const)(
    "rejects an altered or cross-locale German/Dutch value: %s",
    (_label, response) => {
      expect(parseActionPlanResponse(response)).toBeNull();
    },
  );

  it.each([
    [
      "Russian situation notice",
      { ...russianNormalResponse, situation: ukrainianNormalResponse.situation },
    ],
    [
      "Ukrainian weather notice",
      { ...ukrainianNormalResponse, weather: russianNormalResponse.weather },
    ],
    [
      "Polish urgent instruction",
      {
        ...polishUrgentResponse,
        urgent_contact: russianUrgentResponse.urgent_contact,
      },
    ],
    [
      "Russian urgent actions",
      { ...russianUrgentResponse, actions: ukrainianUrgentResponse.actions },
    ],
    [
      "Ukrainian urgent notices",
      { ...ukrainianUrgentResponse, notices: polishUrgentResponse.notices },
    ],
    [
      "altered Russian call action",
      {
        ...russianUrgentResponse,
        actions: [
          {
            ...russianUrgentResponse.actions[0],
            text: "Позвоните по номеру 112.",
          },
          russianUrgentResponse.actions[1],
        ],
      },
    ],
    [
      "altered Polish medical notice",
      {
        ...polishUrgentResponse,
        notices: [
          "Schronienia klimatyczne nie zastępują opieki medycznej.",
          polishUrgentResponse.notices[1],
        ],
      },
    ],
  ] as const)(
    "rejects an altered or cross-locale Russian/Ukrainian/Polish value: %s",
    (_label, response) => {
      expect(parseActionPlanResponse(response)).toBeNull();
    },
  );

  it.each([
    [
      "Japanese situation notice",
      { ...japaneseNormalResponse, situation: koreanNormalResponse.situation },
    ],
    [
      "Korean weather notice",
      { ...koreanNormalResponse, weather: japaneseNormalResponse.weather },
    ],
    [
      "Japanese urgent instruction",
      {
        ...japaneseUrgentResponse,
        urgent_contact: koreanUrgentResponse.urgent_contact,
      },
    ],
    [
      "Korean urgent actions",
      { ...koreanUrgentResponse, actions: japaneseUrgentResponse.actions },
    ],
    [
      "Japanese urgent notices",
      { ...japaneseUrgentResponse, notices: koreanUrgentResponse.notices },
    ],
    [
      "altered Japanese call action",
      {
        ...japaneseUrgentResponse,
        actions: [
          {
            ...japaneseUrgentResponse.actions[0],
            text: "112 に電話してください。",
          },
          japaneseUrgentResponse.actions[1],
        ],
      },
    ],
    [
      "altered Korean medical notice",
      {
        ...koreanUrgentResponse,
        notices: [
          "기후 쉼터는 의료 서비스를 대신할 수 없습니다.",
          koreanUrgentResponse.notices[1],
        ],
      },
    ],
  ] as const)(
    "rejects an altered or cross-locale Japanese/Korean value: %s",
    (_label, response) => {
      expect(parseActionPlanResponse(response)).toBeNull();
    },
  );

  it.each([
    [
      "Indonesian situation notice",
      { ...indonesianNormalResponse, situation: vietnameseNormalResponse.situation },
    ],
    [
      "Vietnamese weather notice",
      { ...vietnameseNormalResponse, weather: thaiNormalResponse.weather },
    ],
    [
      "Thai urgent instruction",
      {
        ...thaiUrgentResponse,
        urgent_contact: indonesianUrgentResponse.urgent_contact,
      },
    ],
    [
      "Indonesian urgent actions",
      { ...indonesianUrgentResponse, actions: vietnameseUrgentResponse.actions },
    ],
    [
      "Vietnamese urgent notices",
      { ...vietnameseUrgentResponse, notices: thaiUrgentResponse.notices },
    ],
    [
      "altered Thai call action",
      {
        ...thaiUrgentResponse,
        actions: [
          {
            ...thaiUrgentResponse.actions[0],
            text: "โทร 112",
          },
          thaiUrgentResponse.actions[1],
        ],
      },
    ],
    [
      "altered Indonesian medical notice",
      {
        ...indonesianUrgentResponse,
        notices: [
          "Tempat perlindungan iklim bukan pengganti layanan medis.",
          indonesianUrgentResponse.notices[1],
        ],
      },
    ],
  ] as const)(
    "rejects an altered or cross-locale Indonesian/Vietnamese/Thai value: %s",
    (_label, response) => {
      expect(parseActionPlanResponse(response)).toBeNull();
    },
  );

  it.each([
    [
      "Turkish situation notice",
      { ...turkishNormalResponse, situation: swahiliNormalResponse.situation },
    ],
    [
      "Swahili weather notice",
      { ...swahiliNormalResponse, weather: turkishNormalResponse.weather },
    ],
    [
      "Turkish urgent instruction",
      {
        ...turkishUrgentResponse,
        urgent_contact: swahiliUrgentResponse.urgent_contact,
      },
    ],
    [
      "Swahili urgent actions",
      { ...swahiliUrgentResponse, actions: turkishUrgentResponse.actions },
    ],
    [
      "Turkish urgent notices",
      { ...turkishUrgentResponse, notices: swahiliUrgentResponse.notices },
    ],
    [
      "altered Turkish call action",
      {
        ...turkishUrgentResponse,
        actions: [
          { ...turkishUrgentResponse.actions[0], text: "112’yi arayın." },
          turkishUrgentResponse.actions[1],
        ],
      },
    ],
    [
      "altered Swahili medical notice",
      {
        ...swahiliUrgentResponse,
        notices: [
          "Makazi ya hali ya hewa si mbadala wa huduma ya matibabu.",
          swahiliUrgentResponse.notices[1],
        ],
      },
    ],
  ] as const)(
    "rejects an altered or cross-locale Turkish/Swahili value: %s",
    (_label, response) => {
      expect(parseActionPlanResponse(response)).toBeNull();
    },
  );

  it.each([
    [
      "Urdu situation notice",
      { ...urduNormalResponse, situation: persianNormalResponse.situation },
    ],
    [
      "Persian weather notice",
      { ...persianNormalResponse, weather: urduNormalResponse.weather },
    ],
    [
      "Urdu urgent instruction",
      {
        ...urduUrgentResponse,
        urgent_contact: persianUrgentResponse.urgent_contact,
      },
    ],
    [
      "Persian urgent actions",
      { ...persianUrgentResponse, actions: urduUrgentResponse.actions },
    ],
    [
      "Urdu urgent notices",
      { ...urduUrgentResponse, notices: persianUrgentResponse.notices },
    ],
    [
      "altered Urdu call action",
      {
        ...urduUrgentResponse,
        actions: [
          { ...urduUrgentResponse.actions[0], text: "112 پر کال کریں۔" },
          urduUrgentResponse.actions[1],
        ],
      },
    ],
    [
      "altered Persian medical notice",
      {
        ...persianUrgentResponse,
        notices: [
          "پناهگاه‌های اقلیمی جانشین مراقبت پزشکی نیستند.",
          persianUrgentResponse.notices[1],
        ],
      },
    ],
  ] as const)(
    "rejects an altered or cross-locale Urdu/Persian value: %s",
    (_label, response) => {
      expect(parseActionPlanResponse(response)).toBeNull();
    },
  );

  it.each([
    [
      "Hebrew situation notice",
      { ...hebrewNormalResponse, situation: normalResponse.situation },
    ],
    [
      "Hebrew weather notice",
      { ...hebrewNormalResponse, weather: persianNormalResponse.weather },
    ],
    [
      "Hebrew urgent instruction",
      {
        ...hebrewUrgentResponse,
        urgent_contact: urgentResponse.urgent_contact,
      },
    ],
    [
      "Hebrew urgent actions",
      { ...hebrewUrgentResponse, actions: persianUrgentResponse.actions },
    ],
    [
      "Hebrew urgent notices",
      { ...hebrewUrgentResponse, notices: urgentResponse.notices },
    ],
    [
      "altered Hebrew call action",
      {
        ...hebrewUrgentResponse,
        actions: [
          { ...hebrewUrgentResponse.actions[0], text: "התקשרו למספר 112." },
          hebrewUrgentResponse.actions[1],
        ],
      },
    ],
    [
      "altered Hebrew medical notice",
      {
        ...hebrewUrgentResponse,
        notices: [
          "מחסי אקלים אינם חלופה לטיפול רפואי.",
          hebrewUrgentResponse.notices[1],
        ],
      },
    ],
  ] as const)("rejects an altered or cross-locale Hebrew value: %s", (_label, response) => {
    expect(parseActionPlanResponse(response)).toBeNull();
  });

  it("sends one exact four-field Spanish request and accepts a matching response", async () => {
    fetchMock.mockResolvedValue(jsonResponse(spanishNormalResponse));

    const response = await createActionPlan(SYNTHETIC_SITUATION, "es");

    expect(response).toEqual(spanishNormalResponse);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [endpoint, options] = fetchMock.mock.calls[0];
    expect(endpoint).toBe("/api/v1/action-plan");
    expect(options?.method).toBe("POST");
    expect(options?.headers).toEqual({ "Content-Type": "application/json" });
    expect(JSON.parse(String(options?.body))).toEqual({
      situation_text: SYNTHETIC_SITUATION,
      origin: { latitude: 41.3874, longitude: 2.1686 },
      maximum_distance_m: 3000,
      output_locale: "es",
    });
    expect(Object.keys(JSON.parse(String(options?.body))).sort()).toEqual([
      "maximum_distance_m",
      "origin",
      "output_locale",
      "situation_text",
    ]);
    expect(window.localStorage.getItem("heatrelay.output-locale.v1")).toBeNull();
  });

  it.each([
    ["zh-CN", simplifiedChineseNormalResponse],
    ["zh-TW", traditionalChineseNormalResponse],
    ["hi", hindiNormalResponse],
    ["bn", bengaliNormalResponse],
    ["ar", arabicNormalResponse],
    ["pt-BR", brazilianPortugueseNormalResponse],
    ["fr", frenchNormalResponse],
    ["it", italianNormalResponse],
    ["de", germanNormalResponse],
    ["nl", dutchNormalResponse],
    ["ru", russianNormalResponse],
    ["uk", ukrainianNormalResponse],
    ["pl", polishNormalResponse],
    ["ja", japaneseNormalResponse],
    ["ko", koreanNormalResponse],
    ["id", indonesianNormalResponse],
    ["vi", vietnameseNormalResponse],
    ["th", thaiNormalResponse],
    ["tr", turkishNormalResponse],
    ["sw", swahiliNormalResponse],
    ["ur", urduNormalResponse],
    ["fa", persianNormalResponse],
    ["he", hebrewNormalResponse],
  ] as const)(
    "sends one exact four-field %s request and accepts a matching response",
    async (outputLocale, responsePayload) => {
      fetchMock.mockResolvedValue(jsonResponse(responsePayload));

      const response = await createActionPlan(SYNTHETIC_SITUATION, outputLocale);

      expect(response).toEqual(responsePayload);
      expect(fetchMock).toHaveBeenCalledTimes(1);
      const [endpoint, options] = fetchMock.mock.calls[0];
      expect(endpoint).toBe("/api/v1/action-plan");
      expect(options?.method).toBe("POST");
      expect(options?.headers).toEqual({ "Content-Type": "application/json" });
      const body = JSON.parse(String(options?.body));
      expect(body).toEqual({
        situation_text: SYNTHETIC_SITUATION,
        origin: { latitude: 41.3874, longitude: 2.1686 },
        maximum_distance_m: 3000,
        output_locale: outputLocale,
      });
      expect(Object.keys(body).sort()).toEqual([
        "maximum_distance_m",
        "origin",
        "output_locale",
        "situation_text",
      ]);
      expect(window.localStorage.getItem("heatrelay.output-locale.v1")).toBeNull();
    },
  );

  it.each([
    ["Spanish request with English response", "es", normalResponse],
    ["English request with Spanish response", "en", spanishNormalResponse],
    [
      "Simplified Chinese request with Traditional Chinese response",
      "zh-CN",
      traditionalChineseNormalResponse,
    ],
    [
      "Traditional Chinese request with Simplified Chinese response",
      "zh-TW",
      simplifiedChineseNormalResponse,
    ],
    [
      "English request with Simplified Chinese response",
      "en",
      simplifiedChineseNormalResponse,
    ],
    [
      "Spanish request with Traditional Chinese response",
      "es",
      traditionalChineseNormalResponse,
    ],
    ["Hindi request with Bengali response", "hi", bengaliNormalResponse],
    ["Bengali request with Hindi response", "bn", hindiNormalResponse],
    ["English request with Hindi response", "en", hindiNormalResponse],
    ["Hindi request with Spanish response", "hi", spanishNormalResponse],
    ["Arabic request with English response", "ar", normalResponse],
    ["English request with Arabic response", "en", arabicNormalResponse],
    ["Arabic request with Hindi response", "ar", hindiNormalResponse],
    ["Hindi request with Arabic response", "hi", arabicNormalResponse],
    [
      "Brazilian Portuguese request with English response",
      "pt-BR",
      normalResponse,
    ],
    [
      "English request with Brazilian Portuguese response",
      "en",
      brazilianPortugueseNormalResponse,
    ],
    [
      "Brazilian Portuguese request with Spanish response",
      "pt-BR",
      spanishNormalResponse,
    ],
    [
      "Spanish request with Brazilian Portuguese response",
      "es",
      brazilianPortugueseNormalResponse,
    ],
    ["French request with Italian response", "fr", italianNormalResponse],
    ["Italian request with French response", "it", frenchNormalResponse],
    ["French request with English response", "fr", normalResponse],
    ["English request with Italian response", "en", italianNormalResponse],
    ["Spanish request with French response", "es", frenchNormalResponse],
    ["Italian request with Spanish response", "it", spanishNormalResponse],
    ["German request with Dutch response", "de", dutchNormalResponse],
    ["Dutch request with German response", "nl", germanNormalResponse],
    ["German request with English response", "de", normalResponse],
    ["English request with Dutch response", "en", dutchNormalResponse],
    ["Russian request with Ukrainian response", "ru", ukrainianNormalResponse],
    ["Ukrainian request with Russian response", "uk", russianNormalResponse],
    ["Polish request with Russian response", "pl", russianNormalResponse],
    ["English request with Polish response", "en", polishNormalResponse],
    ["Japanese request with Korean response", "ja", koreanNormalResponse],
    ["Korean request with Japanese response", "ko", japaneseNormalResponse],
    ["Japanese request with English response", "ja", normalResponse],
    ["English request with Korean response", "en", koreanNormalResponse],
    ["Indonesian request with Vietnamese response", "id", vietnameseNormalResponse],
    ["Vietnamese request with Thai response", "vi", thaiNormalResponse],
    ["Thai request with Indonesian response", "th", indonesianNormalResponse],
    ["English request with Thai response", "en", thaiNormalResponse],
    ["Turkish request with Swahili response", "tr", swahiliNormalResponse],
    ["Swahili request with Turkish response", "sw", turkishNormalResponse],
    ["Turkish request with English response", "tr", normalResponse],
    ["English request with Swahili response", "en", swahiliNormalResponse],
    ["Urdu request with Persian response", "ur", persianNormalResponse],
    ["Persian request with Urdu response", "fa", urduNormalResponse],
    ["Urdu request with English response", "ur", normalResponse],
    ["English request with Persian response", "en", persianNormalResponse],
    ["Hebrew request with English response", "he", normalResponse],
    ["English request with Hebrew response", "en", hebrewNormalResponse],
    ["Hebrew request with Persian response", "he", persianNormalResponse],
    [
      "Hindi request with Simplified Chinese response",
      "hi",
      simplifiedChineseNormalResponse,
    ],
    [
      "Traditional Chinese request with Bengali response",
      "zh-TW",
      bengaliNormalResponse,
    ],
  ] as const)(
    "rejects a supported response/request locale mismatch: %s",
    async (_label, requestedLocale, responsePayload) => {
      fetchMock.mockResolvedValue(jsonResponse(responsePayload));

      await expect(
        createActionPlan(SYNTHETIC_SITUATION, requestedLocale),
      ).rejects.toMatchObject({ kind: "malformed_response" });
      expect(fetchMock).toHaveBeenCalledTimes(1);
    },
  );

  it.each([
    ["normal response missing schema", withoutProperty(normalResponse, "schema_version")],
    ["normal response with previous schema", { ...normalResponse, schema_version: "1.15.0" }],
    ["normal response with older Portuguese schema", { ...normalResponse, schema_version: "1.8.0" }],
    ["normal response with older Arabic schema", { ...normalResponse, schema_version: "1.7.0" }],
    ["normal response with older Indic schema", { ...normalResponse, schema_version: "1.6.0" }],
    ["normal response with older Chinese schema", { ...normalResponse, schema_version: "1.5.0" }],
    ["normal response with older multilingual schema", { ...normalResponse, schema_version: "1.4.0" }],
    ["normal response with old schema", { ...normalResponse, schema_version: "1.3.0" }],
    ["normal response with older action-plan schema", { ...normalResponse, schema_version: "1.2.0" }],
    ["normal response with older schema", { ...normalResponse, schema_version: "1.0.0" }],
    ["normal response with malformed schema", { ...normalResponse, schema_version: "1.3" }],
    ["normal response with unknown schema", { ...normalResponse, schema_version: "1.17.0" }],
    ["urgent response missing schema", withoutProperty(urgentResponse, "schema_version")],
    ["urgent response with previous schema", { ...urgentResponse, schema_version: "1.15.0" }],
    ["urgent response with older Portuguese schema", { ...urgentResponse, schema_version: "1.8.0" }],
    ["urgent response with older Arabic schema", { ...urgentResponse, schema_version: "1.7.0" }],
    ["urgent response with older Indic schema", { ...urgentResponse, schema_version: "1.6.0" }],
    ["urgent response with older Chinese schema", { ...urgentResponse, schema_version: "1.5.0" }],
    ["urgent response with older multilingual schema", { ...urgentResponse, schema_version: "1.4.0" }],
    ["urgent response with old schema", { ...urgentResponse, schema_version: "1.3.0" }],
    ["urgent response with older action-plan schema", { ...urgentResponse, schema_version: "1.2.0" }],
    ["urgent response with older schema", { ...urgentResponse, schema_version: "1.0.0" }],
    ["urgent response with malformed schema", { ...urgentResponse, schema_version: "1.3" }],
    ["urgent response with unknown schema", { ...urgentResponse, schema_version: "1.17.0" }],
    ["normal response missing situation", withoutProperty(normalResponse, "situation")],
    ["urgent response missing situation", withoutProperty(urgentResponse, "situation")],
    [
      "normal nested situation missing notice",
      {
        ...normalResponse,
        situation: withoutProperty(situationLanguageMetadata, "notice"),
      },
    ],
    [
      "urgent nested situation missing notice",
      {
        ...urgentResponse,
        situation: withoutProperty(situationLanguageMetadata, "notice"),
      },
    ],
    [
      "nested situation with altered notice",
      {
        ...normalResponse,
        situation: {
          ...situationLanguageMetadata,
          notice: "Forged situation notice.",
        },
      },
    ],
    [
      "urgent nested situation with altered notice",
      {
        ...urgentResponse,
        situation: {
          ...situationLanguageMetadata,
          notice: "Forged situation notice.",
        },
      },
    ],
    [
      "nested situation with non-string notice",
      {
        ...normalResponse,
        situation: { ...situationLanguageMetadata, notice: 1 },
      },
    ],
    [
      "normal weather missing notice",
      {
        ...normalResponse,
        weather: withoutProperty(normalResponse.weather, "notice"),
      },
    ],
    [
      "normal weather with altered notice",
      {
        ...normalResponse,
        weather: { ...normalResponse.weather, notice: "Forged weather notice." },
      },
    ],
    [
      "normal weather with non-string notice",
      {
        ...normalResponse,
        weather: { ...normalResponse.weather, notice: 1 },
      },
    ],
    [
      "nested situation missing schema",
      {
        ...normalResponse,
        situation: withoutProperty(situationLanguageMetadata, "schema_version"),
      },
    ],
    [
      "nested situation with old schema",
      {
        ...normalResponse,
        situation: { ...situationLanguageMetadata, schema_version: "1.0.0" },
      },
    ],
    [
      "urgent nested situation with old schema",
      {
        ...urgentResponse,
        situation: { ...situationLanguageMetadata, schema_version: "1.0.0" },
      },
    ],
    [
      "nested situation with unknown schema",
      {
        ...normalResponse,
        situation: { ...situationLanguageMetadata, schema_version: "2.0.0" },
      },
    ],
    [
      "nested situation missing detected language",
      {
        ...normalResponse,
        situation: withoutProperty(
          situationLanguageMetadata,
          "detected_input_language",
        ),
      },
    ],
    [
      "nested situation with unsupported detected language",
      {
        ...normalResponse,
        situation: { ...situationLanguageMetadata, detected_input_language: "eo" },
      },
    ],
    [
      "nested situation with case-altered detected language",
      {
        ...normalResponse,
        situation: { ...situationLanguageMetadata, detected_input_language: "EN" },
      },
    ],
    [
      "nested situation with regional detected language",
      {
        ...normalResponse,
        situation: {
          ...situationLanguageMetadata,
          detected_input_language: "en-US",
        },
      },
    ],
    [
      "nested situation missing source",
      {
        ...normalResponse,
        situation: withoutProperty(
          situationLanguageMetadata,
          "input_language_source",
        ),
      },
    ],
    [
      "nested situation with unsupported source",
      {
        ...normalResponse,
        situation: {
          ...situationLanguageMetadata,
          input_language_source: "user_selected",
        },
      },
    ],
    [
      "supported language with fallback source",
      {
        ...normalResponse,
        situation: {
          ...situationLanguageMetadata,
          input_language_source: "fallback",
        },
      },
    ],
    [
      "other language with fallback source",
      {
        ...normalResponse,
        situation: {
          ...situationLanguageMetadata,
          detected_input_language: "other",
          input_language_source: "fallback",
        },
      },
    ],
    [
      "unknown language with detected source",
      {
        ...urgentResponse,
        situation: {
          ...situationLanguageMetadata,
          detected_input_language: "unknown",
          input_language_source: "automatically_detected",
        },
      },
    ],
    [
      "nested situation with null language",
      {
        ...normalResponse,
        situation: { ...situationLanguageMetadata, detected_input_language: null },
      },
    ],
    [
      "nested situation with numeric source",
      {
        ...urgentResponse,
        situation: { ...situationLanguageMetadata, input_language_source: 1 },
      },
    ],
    ["normal response missing output locale", withoutProperty(normalResponse, "output_locale")],
    ["urgent response missing output locale", withoutProperty(urgentResponse, "output_locale")],
    ["uppercase output locale", { ...normalResponse, output_locale: "EN" }],
    ["regional output locale", { ...normalResponse, output_locale: "en-US" }],
    ["Catalan output locale", { ...normalResponse, output_locale: "ca" }],
    ["bare Chinese output locale", { ...normalResponse, output_locale: "zh" }],
    ["lowercase Simplified Chinese output locale", { ...normalResponse, output_locale: "zh-cn" }],
    ["uppercase Simplified Chinese output locale", { ...normalResponse, output_locale: "ZH-CN" }],
    ["lowercase Traditional Chinese output locale", { ...normalResponse, output_locale: "zh-tw" }],
    ["uppercase Traditional Chinese output locale", { ...normalResponse, output_locale: "ZH-TW" }],
    ["Simplified Chinese script output locale", { ...normalResponse, output_locale: "zh-Hans" }],
    ["Simplified Chinese script-region output locale", { ...normalResponse, output_locale: "zh-Hans-CN" }],
    ["Traditional Chinese script output locale", { ...normalResponse, output_locale: "zh-Hant" }],
    ["Traditional Chinese script-region output locale", { ...normalResponse, output_locale: "zh-Hant-TW" }],
    ["Singapore Chinese output locale", { ...normalResponse, output_locale: "zh-SG" }],
    ["Hong Kong Chinese output locale", { ...normalResponse, output_locale: "zh-HK" }],
    ["padded Simplified Chinese output locale", { ...normalResponse, output_locale: " zh-CN" }],
    ["trailing-space Simplified Chinese output locale", { ...normalResponse, output_locale: "zh-CN " }],
    ["padded Traditional Chinese output locale", { ...normalResponse, output_locale: " zh-TW" }],
    ["trailing-space Traditional Chinese output locale", { ...normalResponse, output_locale: "zh-TW " }],
    ["uppercase Hindi output locale", { ...normalResponse, output_locale: "HI" }],
    ["regional Hindi output locale", { ...normalResponse, output_locale: "hi-IN" }],
    ["lowercase regional Hindi output locale", { ...normalResponse, output_locale: "hi-in" }],
    ["padded Hindi output locale", { ...normalResponse, output_locale: " hi" }],
    ["trailing-space Hindi output locale", { ...normalResponse, output_locale: "hi " }],
    ["uppercase Arabic output locale", { ...normalResponse, output_locale: "AR" }],
    ["title-case Arabic output locale", { ...normalResponse, output_locale: "Ar" }],
    ["Saudi Arabic output locale", { ...normalResponse, output_locale: "ar-SA" }],
    ["Egyptian Arabic output locale", { ...normalResponse, output_locale: "ar-EG" }],
    ["world Arabic output locale", { ...normalResponse, output_locale: "ar-001" }],
    ["three-letter Arabic output locale", { ...normalResponse, output_locale: "ara" }],
    ["padded Arabic output locale", { ...normalResponse, output_locale: " ar" }],
    ["trailing-space Arabic output locale", { ...normalResponse, output_locale: "ar " }],
    ["uppercase Bengali output locale", { ...normalResponse, output_locale: "BN" }],
    ["Bangladesh Bengali output locale", { ...normalResponse, output_locale: "bn-BD" }],
    ["India Bengali output locale", { ...normalResponse, output_locale: "bn-IN" }],
    ["lowercase regional Bengali output locale", { ...normalResponse, output_locale: "bn-bd" }],
    ["padded Bengali output locale", { ...normalResponse, output_locale: " bn" }],
    ["trailing-space Bengali output locale", { ...normalResponse, output_locale: "bn " }],
    ["uppercase Russian output locale", { ...normalResponse, output_locale: "RU" }],
    ["mixed-case Russian output locale", { ...normalResponse, output_locale: "Ru" }],
    ["regional Russian output locale", { ...normalResponse, output_locale: "ru-RU" }],
    ["Belarus Russian output locale", { ...normalResponse, output_locale: "ru-BY" }],
    ["three-letter Russian output locale", { ...normalResponse, output_locale: "rus" }],
    ["padded Russian output locale", { ...normalResponse, output_locale: " ru" }],
    ["trailing-space Russian output locale", { ...normalResponse, output_locale: "ru " }],
    ["uppercase Japanese output locale", { ...normalResponse, output_locale: "JA" }],
    ["mixed-case Japanese output locale", { ...normalResponse, output_locale: "Ja" }],
    ["regional Japanese output locale", { ...normalResponse, output_locale: "ja-JP" }],
    ["three-letter Japanese output locale", { ...normalResponse, output_locale: "jpn" }],
    ["padded Japanese output locale", { ...normalResponse, output_locale: " ja" }],
    ["trailing-space Japanese output locale", { ...normalResponse, output_locale: "ja " }],
    ["uppercase German output locale", { ...normalResponse, output_locale: "DE" }],
    ["title-case German output locale", { ...normalResponse, output_locale: "De" }],
    ["Germany German output locale", { ...normalResponse, output_locale: "de-DE" }],
    ["Austria German output locale", { ...normalResponse, output_locale: "de-AT" }],
    ["Swiss German output locale", { ...normalResponse, output_locale: "de-CH" }],
    ["modern three-letter German output locale", { ...normalResponse, output_locale: "deu" }],
    ["legacy three-letter German output locale", { ...normalResponse, output_locale: "ger" }],
    ["padded German output locale", { ...normalResponse, output_locale: " de" }],
    ["trailing-space German output locale", { ...normalResponse, output_locale: "de " }],
    ["uppercase Urdu output locale", { ...normalResponse, output_locale: "UR" }],
    ["mixed-case Urdu output locale", { ...normalResponse, output_locale: "Ur" }],
    ["Pakistan Urdu output locale", { ...normalResponse, output_locale: "ur-PK" }],
    ["India Urdu output locale", { ...normalResponse, output_locale: "ur-IN" }],
    ["three-letter Urdu output locale", { ...normalResponse, output_locale: "urd" }],
    ["padded Urdu output locale", { ...normalResponse, output_locale: " ur" }],
    ["trailing-space Urdu output locale", { ...normalResponse, output_locale: "ur " }],
    ["uppercase Korean output locale", { ...normalResponse, output_locale: "KO" }],
    ["mixed-case Korean output locale", { ...normalResponse, output_locale: "Ko" }],
    ["regional Korean output locale", { ...normalResponse, output_locale: "ko-KR" }],
    ["three-letter Korean output locale", { ...normalResponse, output_locale: "kor" }],
    ["padded Korean output locale", { ...normalResponse, output_locale: " ko" }],
    ["trailing-space Korean output locale", { ...normalResponse, output_locale: "ko " }],
    ["uppercase Thai output locale", { ...normalResponse, output_locale: "TH" }],
    ["mixed-case Thai output locale", { ...normalResponse, output_locale: "Th" }],
    ["regional Thai output locale", { ...normalResponse, output_locale: "th-TH" }],
    ["three-letter Thai output locale", { ...normalResponse, output_locale: "tha" }],
    ["padded Thai output locale", { ...normalResponse, output_locale: " th" }],
    ["trailing-space Thai output locale", { ...normalResponse, output_locale: "th " }],
    ["uppercase Persian output locale", { ...normalResponse, output_locale: "FA" }],
    ["mixed-case Persian output locale", { ...normalResponse, output_locale: "Fa" }],
    ["Iran Persian output locale", { ...normalResponse, output_locale: "fa-IR" }],
    ["Afghanistan Persian output locale", { ...normalResponse, output_locale: "fa-AF" }],
    ["modern three-letter Persian output locale", { ...normalResponse, output_locale: "fas" }],
    ["legacy three-letter Persian output locale", { ...normalResponse, output_locale: "per" }],
    ["padded Persian output locale", { ...normalResponse, output_locale: " fa" }],
    ["trailing-space Persian output locale", { ...normalResponse, output_locale: "fa " }],
    ["bare Portuguese output locale", { ...normalResponse, output_locale: "pt" }],
    ["lowercase Brazilian Portuguese output locale", { ...normalResponse, output_locale: "pt-br" }],
    ["uppercase Brazilian Portuguese output locale", { ...normalResponse, output_locale: "PT-BR" }],
    ["mixed-case Brazilian Portuguese output locale", { ...normalResponse, output_locale: "Pt-BR" }],
    ["Portugal Portuguese output locale", { ...normalResponse, output_locale: "pt-PT" }],
    ["Angola Portuguese output locale", { ...normalResponse, output_locale: "pt-AO" }],
    ["Mozambique Portuguese output locale", { ...normalResponse, output_locale: "pt-MZ" }],
    ["script Brazilian Portuguese output locale", { ...normalResponse, output_locale: "pt-Latn-BR" }],
    ["private Brazilian Portuguese output locale", { ...normalResponse, output_locale: "pt-BR-x-private" }],
    ["padded Brazilian Portuguese output locale", { ...normalResponse, output_locale: " pt-BR" }],
    ["trailing-space Brazilian Portuguese output locale", { ...normalResponse, output_locale: "pt-BR " }],
    ["uppercase French output locale", { ...normalResponse, output_locale: "FR" }],
    ["title-case French output locale", { ...normalResponse, output_locale: "Fr" }],
    ["France French output locale", { ...normalResponse, output_locale: "fr-FR" }],
    ["Canadian French output locale", { ...normalResponse, output_locale: "fr-CA" }],
    ["Belgian French output locale", { ...normalResponse, output_locale: "fr-BE" }],
    ["Swiss French output locale", { ...normalResponse, output_locale: "fr-CH" }],
    ["three-letter French output locale", { ...normalResponse, output_locale: "fra" }],
    ["padded French output locale", { ...normalResponse, output_locale: " fr" }],
    ["trailing-space French output locale", { ...normalResponse, output_locale: "fr " }],
    ["uppercase Italian output locale", { ...normalResponse, output_locale: "IT" }],
    ["title-case Italian output locale", { ...normalResponse, output_locale: "It" }],
    ["Italy Italian output locale", { ...normalResponse, output_locale: "it-IT" }],
    ["Swiss Italian output locale", { ...normalResponse, output_locale: "it-CH" }],
    ["three-letter Italian output locale", { ...normalResponse, output_locale: "ita" }],
    ["padded Italian output locale", { ...normalResponse, output_locale: " it" }],
    ["trailing-space Italian output locale", { ...normalResponse, output_locale: "it " }],
    ["uppercase Dutch output locale", { ...normalResponse, output_locale: "NL" }],
    ["title-case Dutch output locale", { ...normalResponse, output_locale: "Nl" }],
    ["Netherlands Dutch output locale", { ...normalResponse, output_locale: "nl-NL" }],
    ["Belgian Dutch output locale", { ...normalResponse, output_locale: "nl-BE" }],
    ["modern three-letter Dutch output locale", { ...normalResponse, output_locale: "nld" }],
    ["legacy three-letter Dutch output locale", { ...normalResponse, output_locale: "dut" }],
    ["padded Dutch output locale", { ...normalResponse, output_locale: " nl" }],
    ["trailing-space Dutch output locale", { ...normalResponse, output_locale: "nl " }],
    ["uppercase Indonesian output locale", { ...normalResponse, output_locale: "ID" }],
    ["mixed-case Indonesian output locale", { ...normalResponse, output_locale: "Id" }],
    ["regional Indonesian output locale", { ...normalResponse, output_locale: "id-ID" }],
    ["three-letter Indonesian output locale", { ...normalResponse, output_locale: "ind" }],
    ["padded Indonesian output locale", { ...normalResponse, output_locale: " id" }],
    ["trailing-space Indonesian output locale", { ...normalResponse, output_locale: "id " }],
    ["uppercase Turkish output locale", { ...normalResponse, output_locale: "TR" }],
    ["mixed-case Turkish output locale", { ...normalResponse, output_locale: "Tr" }],
    ["regional Turkish output locale", { ...normalResponse, output_locale: "tr-TR" }],
    ["three-letter Turkish output locale", { ...normalResponse, output_locale: "tur" }],
    ["padded Turkish output locale", { ...normalResponse, output_locale: " tr" }],
    ["trailing-space Turkish output locale", { ...normalResponse, output_locale: "tr " }],
    ["uppercase Ukrainian output locale", { ...normalResponse, output_locale: "UK" }],
    ["mixed-case Ukrainian output locale", { ...normalResponse, output_locale: "Uk" }],
    ["regional Ukrainian output locale", { ...normalResponse, output_locale: "uk-UA" }],
    ["unsupported-region Ukrainian output locale", { ...normalResponse, output_locale: "uk-UK" }],
    ["three-letter Ukrainian output locale", { ...normalResponse, output_locale: "ukr" }],
    ["padded Ukrainian output locale", { ...normalResponse, output_locale: " uk" }],
    ["trailing-space Ukrainian output locale", { ...normalResponse, output_locale: "uk " }],
    ["uppercase Polish output locale", { ...normalResponse, output_locale: "PL" }],
    ["mixed-case Polish output locale", { ...normalResponse, output_locale: "Pl" }],
    ["regional Polish output locale", { ...normalResponse, output_locale: "pl-PL" }],
    ["three-letter Polish output locale", { ...normalResponse, output_locale: "pol" }],
    ["padded Polish output locale", { ...normalResponse, output_locale: " pl" }],
    ["trailing-space Polish output locale", { ...normalResponse, output_locale: "pl " }],
    ["uppercase Vietnamese output locale", { ...normalResponse, output_locale: "VI" }],
    ["mixed-case Vietnamese output locale", { ...normalResponse, output_locale: "Vi" }],
    ["regional Vietnamese output locale", { ...normalResponse, output_locale: "vi-VN" }],
    ["three-letter Vietnamese output locale", { ...normalResponse, output_locale: "vie" }],
    ["padded Vietnamese output locale", { ...normalResponse, output_locale: " vi" }],
    ["trailing-space Vietnamese output locale", { ...normalResponse, output_locale: "vi " }],
    ["uppercase Swahili output locale", { ...normalResponse, output_locale: "SW" }],
    ["mixed-case Swahili output locale", { ...normalResponse, output_locale: "Sw" }],
    ["Kenyan Swahili output locale", { ...normalResponse, output_locale: "sw-KE" }],
    ["Tanzanian Swahili output locale", { ...normalResponse, output_locale: "sw-TZ" }],
    ["three-letter Swahili output locale", { ...normalResponse, output_locale: "swa" }],
    ["padded Swahili output locale", { ...normalResponse, output_locale: " sw" }],
    ["trailing-space Swahili output locale", { ...normalResponse, output_locale: "sw " }],
    ["uppercase Hebrew output locale", { ...normalResponse, output_locale: "HE" }],
    ["mixed-case Hebrew output locale", { ...normalResponse, output_locale: "He" }],
    ["Israel Hebrew output locale", { ...normalResponse, output_locale: "he-IL" }],
    ["three-letter Hebrew output locale", { ...normalResponse, output_locale: "heb" }],
    ["padded Hebrew output locale", { ...normalResponse, output_locale: " he" }],
    ["trailing-space Hebrew output locale", { ...normalResponse, output_locale: "he " }],
    ["null output locale", { ...normalResponse, output_locale: null }],
    ["boolean output locale", { ...normalResponse, output_locale: true }],
    ["numeric output locale", { ...normalResponse, output_locale: 1 }],
    ["array output locale", { ...normalResponse, output_locale: ["en"] }],
    ["object output locale", { ...urgentResponse, output_locale: { code: "en" } }],
  ] as const)("rejects forged response metadata: %s", async (_label, payload) => {
    await expectMalformedSuccess(payload);
  });

  it("shows an accessible loading state and prevents duplicate requests", async () => {
    let resolveFetch!: (response: Response) => void;
    fetchMock.mockReturnValue(
      new Promise<Response>((resolve) => {
        resolveFetch = resolve;
      }),
    );
    render(<App />);

    submitSituation();

    const submit = screen.getByRole("button", {
      name: /creating your plan/i,
    }) as HTMLButtonElement;
    expect(submit.disabled).toBe(true);
    expect(screen.getByText(/creating.*action plan/i)).toBeTruthy();
    const form = submit.closest("form");
    expect(form?.getAttribute("aria-busy")).toBe("true");
    const status = screen.getByRole("status");
    expect(status.getAttribute("aria-live")).toBe("polite");
    expect(status.getAttribute("aria-atomic")).toBe("true");
    expect(status.textContent).toBe("Creating your action plan.");

    fireEvent.submit(form as HTMLFormElement);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolveFetch(jsonResponse(normalResponse));
    });
    await screen.findByRole("heading", { name: "Act now" });
    expect(status.textContent).toBe("Your action plan is ready.");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("renders every normal-plan phase, weather fact, and selected-place fact", async () => {
    fetchMock.mockResolvedValue(jsonResponse(normalResponse));
    render(<App />);

    submitSituation();

    const priorityHeading = await screen.findByRole("heading", {
      name: "Act now",
    });
    expect(document.activeElement).toBe(priorityHeading);
    expect(screen.getByText(/17 Jul 2026.*10:00/i)).toBeTruthy();
    expect(
      document.querySelector('time[datetime="2026-07-17T08:00:00Z"]'),
    ).toBeTruthy();
    expect(screen.getAllByText("33.0°C", { selector: "strong" })).toHaveLength(1);
    expect(screen.getByText("34.5°C", { selector: "strong" })).toBeTruthy();
    expect(screen.getByText("36.0°C", { selector: "strong" })).toBeTruthy();
    expect(screen.getAllByText(WEATHER_NOTICE).length).toBeGreaterThan(0);

    for (const [phase, id] of [
      ["Now", "phase-now"],
      ["Next few hours", "phase-next-few-hours"],
      ["Tonight", "phase-tonight"],
    ] as const) {
      expect(screen.getByRole("heading", { name: phase }).id).toBe(id);
      expect(document.getElementById(id)?.closest("section")?.getAttribute("aria-labelledby")).toBe(id);
    }
    for (const phase of [
      ...normalResponse.plan.now.actions,
      ...normalResponse.plan.next_few_hours.actions,
      ...normalResponse.plan.tonight.actions,
    ]) {
      expect(screen.getByText(phase.text)).toBeTruthy();
      expect(screen.getByText(phase.explanation)).toBeTruthy();
    }
    expect(screen.getByText("Water")).toBeTruthy();
    expect(screen.getByText("A charged phone")).toBeTruthy();
    for (const explanation of normalResponse.plan.explanations) {
      expect(screen.getByText(explanation.text)).toBeTruthy();
    }
    expect(
      screen.getByText("Necessito un lloc fresc, si us plau."),
    ).toBeTruthy();
    for (const notice of normalResponse.notices) {
      expect(screen.getAllByText(notice).length).toBeGreaterThan(0);
    }

    expect(
      screen.getByRole("heading", {
        name: "Barcelona Synthetic Cooling Centre",
      }),
    ).toBeTruthy();
    expect(
      screen.getByText(/Carrer de Prova 10.*08001 Barcelona/i),
    ).toBeTruthy();
    expect(screen.getByText("725 m straight-line")).toBeTruthy();
    expect(screen.getByText(/20:30/)).toBeTruthy();
    expect(
      document.querySelector('time[datetime="2026-07-17T18:30:00Z"]'),
    ).toBeTruthy();
    expect(screen.getByText(/accessibility status unknown/i)).toBeTruthy();
    expect(screen.getByText("Indoor space")).toBeTruthy();
    expect(screen.getByText("Drinking water")).toBeTruthy();
    expect(screen.getByText(/15 Jul 2026/i)).toBeTruthy();
    expect(
      document.querySelector('time[datetime="2026-07-15"]'),
    ).toBeTruthy();

    const officialLink = screen.getByRole("link", {
      name: /official information/i,
    });
    expect(officialLink.getAttribute("href")).toBe(
      "https://example.test/synthetic-place",
    );
    expect(officialLink.getAttribute("target")).toBe("_blank");
    expect(officialLink.getAttribute("rel")).toBe("noopener noreferrer");
    const sourceLink = screen.getByRole("link", { name: "Official source" });
    expect(sourceLink.getAttribute("target")).toBe("_blank");
    expect(sourceLink.getAttribute("rel")).toBe("noopener noreferrer");
    const routeLink = screen.getByRole("link", {
      name: "Open route in Google Maps",
    });
    expect(routeLink.getAttribute("href")).toBe(
      "https://www.google.com/maps/dir/?api=1&destination=Carrer%20de%20Prova%2010%2C%2008001%20Barcelona",
    );
    expect(routeLink.getAttribute("target")).toBe("_blank");
    expect(routeLink.getAttribute("rel")).toBe("noopener noreferrer");
    expect(routeLink.getAttribute("href")).not.toContain(SYNTHETIC_SITUATION);
    expect(routeLink.getAttribute("href")).not.toMatch(
      /41\.3874|2\.1686|origin=/,
    );
    expectNoLocalizationLeak();
  });

  it("formats kilometre distance once through the locale-bound formatter", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({
        ...normalResponse,
        selected_place: {
          ...normalResponse.selected_place,
          distance_m: 1200,
        },
      }),
    );
    render(<App />);

    submitSituation();

    await screen.findByRole("heading", { name: "Act now" });
    expect(screen.getByText("1.2 km straight-line")).toBeTruthy();
    expect(document.body.textContent).not.toMatch(/(?:°C){2}|\b(?:m|km)\s+(?:m|km)\b/);
  });

  it("maps every verified feature and accessibility state from stable codes", async () => {
    const labels = [
      "Indoor space",
      "Drinking water",
      "Toilets",
      "Micro-shelter",
      "Pets allowed",
    ];

    for (const [accessibility, accessibilityText] of [
      [true, "Accessibility confirmed by the source"],
      [false, "Source reports this place is not accessible"],
      [null, "Accessibility status unknown"],
    ] as const) {
      fetchMock.mockResolvedValueOnce(
        jsonResponse({
          ...normalResponse,
          selected_place: {
            ...normalResponse.selected_place,
            accessibility,
            features: {
              indoor_space: true,
              potable_water: true,
              toilets: true,
              micro_shelter: true,
              pets_allowed: true,
            },
          },
        }),
      );
      const view = render(<App />);
      submitSituation();
      await screen.findByRole("heading", { name: "Act now" });

      expect(screen.getByText(accessibilityText)).toBeTruthy();
      for (const label of labels) {
        expect(screen.getByText(label)).toBeTruthy();
      }
      expectNoLocalizationLeak();
      view.unmount();
    }
  });

  it("exposes the weather summary as one native description list", async () => {
    fetchMock.mockResolvedValue(jsonResponse(normalResponse));
    render(<App />);

    submitSituation();
    await screen.findByRole("heading", { name: "Act now" });

    const summaries = document.querySelectorAll(
      'dl.summary-grid[aria-label="Weather summary"]',
    );
    expect(summaries).toHaveLength(1);
    const cards = Array.from(summaries[0].children);
    expect(cards).toHaveLength(3);
    expect(cards.map((card) => card.tagName)).toEqual(["DIV", "DIV", "DIV"]);
    expect(
      cards.map((card) => card.firstElementChild?.textContent),
    ).toEqual(["Current temperature", "Feels like", "Today’s maximum"]);
    expect(cards.map((card) => card.firstElementChild?.tagName)).toEqual([
      "DT",
      "DT",
      "DT",
    ]);
    expect(cards.map((card) => card.lastElementChild?.tagName)).toEqual([
      "DD",
      "DD",
      "DD",
    ]);
    expect(
      cards.map((card) => card.lastElementChild?.querySelector("strong")?.textContent),
    ).toEqual(["33.0°C", "34.5°C", "36.0°C"]);
    for (const card of cards) {
      expect(card.closest('[aria-hidden="true"]')).toBeNull();
      expect((card as HTMLElement).hidden).toBe(false);
      expect(card.firstElementChild?.hasAttribute("aria-hidden")).toBe(false);
      expect(card.lastElementChild?.hasAttribute("aria-hidden")).toBe(false);
    }
    expect(
      document.querySelectorAll('.temperature-status [aria-hidden="true"]'),
    ).toHaveLength(1);
    expect(screen.getAllByText("Current temperature")).toHaveLength(1);
    expect(screen.getAllByText("33.0°C")).toHaveLength(1);
  });

  it.each([
    ["prepare_now", "Prepare now"],
    ["monitor_and_prepare", "Monitor and prepare"],
  ] as const)(
    "renders the %s priority as %s",
    async (priority, label) => {
      fetchMock.mockResolvedValue(
        jsonResponse({
          ...normalResponse,
          priority: { priority },
        }),
      );
      render(<App />);

      submitSituation();

      expect(await screen.findByRole("heading", { name: label })).toBeTruthy();
    },
  );

  it("keeps the normal plan visible when no selected place is returned", async () => {
    const candidateExplanation =
      "No synthetic official place met the current filters. No fallback place was invented.";
    fetchMock.mockResolvedValue(
      jsonResponse({
        ...normalResponse,
        plan: {
          ...normalResponse.plan,
          bring_items: [],
          local_phrase: null,
        },
        selected_place: null,
        candidate_context: {
          ...normalResponse.candidate_context,
          explanation: candidateExplanation,
        },
      }),
    );
    render(<App />);

    submitSituation();

    await screen.findByRole("heading", { name: "Act now" });
    expect(screen.getByRole("heading", { name: "Now" })).toBeTruthy();
    expect(screen.getByText(candidateExplanation)).toBeTruthy();
    expect(
      screen.getByRole("heading", { name: /no verified place/i }),
    ).toBeTruthy();
    expect(
      screen.queryByText("Barcelona Synthetic Cooling Centre"),
    ).toBeNull();
  });

  it("renders urgent help and omits every normal-plan surface", async () => {
    fetchMock.mockResolvedValue(jsonResponse(urgentResponse));
    render(<App />);

    submitSituation();

    const urgentHeading = await screen.findByRole("heading", {
      name: "Urgent help",
    });
    expect(document.activeElement).toBe(urgentHeading);
    expect(urgentHeading.closest('[role="alert"]')).toBeTruthy();
    const urgentBadge = screen.getByText("Urgent · act immediately");
    expect(urgentBadge.tagName).toBe("P");
    expect(urgentBadge.classList.contains("urgent-badge")).toBe(true);
    expect(stylesSource).not.toMatch(
      /content\s*:\s*["']Urgent · act immediately["']/,
    );
    expect(screen.getByText("112 emergències")).toBeTruthy();
    const emergencyCallLink = screen.getByRole("link", { name: "112" });
    expect(emergencyCallLink.getAttribute("href")).toBe("tel:112");
    expect(
      screen.getByText("Call 112 now for emergency assistance."),
    ).toBeTruthy();
    for (const action of urgentResponse.actions) {
      expect(screen.getAllByText(action.text).length).toBeGreaterThan(0);
    }
    for (const notice of urgentResponse.notices) {
      expect(screen.getAllByText(notice).length).toBeGreaterThan(0);
    }
    const sourceLink = screen.getByRole("link", {
      name: /official 112/i,
    });
    expect(sourceLink.getAttribute("target")).toBe("_blank");
    expect(sourceLink.getAttribute("rel")).toBe("noopener noreferrer");

    const pageHeading = screen.getByRole("heading", {
      level: 1,
      name: ENGLISH_CATALOG["scenario.heading"],
    });
    const urgentAlert = urgentHeading.closest<HTMLElement>('[role="alert"]');
    const postUrgentForm = document.querySelector(".post-urgent-form");
    if (!urgentAlert || !postUrgentForm) {
      throw new Error(
        "Synthetic test setup expected the urgent alert and resubmission form.",
      );
    }
    expect(
      Boolean(
        pageHeading.compareDocumentPosition(urgentHeading) &
          Node.DOCUMENT_POSITION_FOLLOWING,
      ),
    ).toBe(true);
    expect(
      Boolean(
        urgentAlert.compareDocumentPosition(postUrgentForm) &
          Node.DOCUMENT_POSITION_FOLLOWING,
      ),
    ).toBe(true);
    expect(document.querySelector(".support-dashboard")).toBeNull();
    expect(document.querySelector(".important-now")).toBeNull();
    expect(document.querySelector(".place-pane")).toBeNull();
    expect(document.querySelector(".temperature-status")).toBeNull();
    expect(screen.getAllByRole("alert")).toHaveLength(1);

    for (const phase of ["Now", "Next few hours", "Tonight"]) {
      expect(screen.queryByRole("heading", { name: phase })).toBeNull();
    }
    expect(screen.queryByText(/current temperature/i)).toBeNull();
    expect(screen.queryByText(/bring/i)).toBeNull();
    expect(screen.queryByText(/local phrase/i)).toBeNull();
    expect(
      screen.queryByText("Barcelona Synthetic Cooling Centre"),
    ).toBeNull();
    expectNoLocalizationLeak();
  });

  it.each(["normal", "urgent", "error"] as const)(
    "clears a stale %s terminal state when the situation text changes",
    async (terminalState) => {
      fetchMock.mockResolvedValue(
        terminalState === "normal"
          ? jsonResponse(normalResponse)
          : terminalState === "urgent"
            ? jsonResponse(urgentResponse)
            : jsonResponse({ detail: { message: "Synthetic hidden detail" } }, 503),
      );
      render(<App />);
      submitSituation();

      const terminal =
        terminalState === "normal"
          ? await screen.findByRole("heading", { name: "Act now" })
          : terminalState === "urgent"
            ? await screen.findByRole("heading", { name: "Urgent help" })
            : await screen.findByRole("alert");
      expect(fetchMock).toHaveBeenCalledTimes(1);

      fireEvent.change(situationField(), {
        target: { value: "A changed synthetic situation." },
      });

      expect(terminal.isConnected).toBe(false);
      expect(fetchMock).toHaveBeenCalledTimes(1);
    },
  );

  it.each(["normal", "urgent", "error"] as const)(
    "clears a stale %s terminal state when the Barcelona demo is loaded",
    async (terminalState) => {
      fetchMock.mockResolvedValue(
        terminalState === "normal"
          ? jsonResponse(normalResponse)
          : terminalState === "urgent"
            ? jsonResponse(urgentResponse)
            : jsonResponse({ detail: { message: "Synthetic hidden detail" } }, 503),
      );
      render(<App />);
      submitSituation();

      const terminal =
        terminalState === "normal"
          ? await screen.findByRole("heading", { name: "Act now" })
          : terminalState === "urgent"
            ? await screen.findByRole("heading", { name: "Urgent help" })
            : await screen.findByRole("alert");

      fireEvent.click(
        screen.getByRole("button", { name: "Load Barcelona demo" }),
      );

      expect(situationField().value).toBe(DEMO_TEXT);
      expect(terminal.isConnected).toBe(false);
      expect(fetchMock).toHaveBeenCalledTimes(1);
    },
  );

  it.each([
    [
      "changed contact",
      {
        ...urgentResponse,
        urgent_contact: {
          ...urgentResponse.urgent_contact,
          service: "Forged emergency service",
        },
      },
    ],
    [
      "changed source",
      {
        ...urgentResponse,
        urgent_contact: {
          ...urgentResponse.urgent_contact,
          source_url: "https://example.test/forged-guidance",
        },
      },
    ],
    [
      "changed number",
      {
        ...urgentResponse,
        urgent_contact: {
          ...urgentResponse.urgent_contact,
          number: "999",
        },
      },
    ],
    [
      "changed instruction",
      {
        ...urgentResponse,
        urgent_contact: {
          ...urgentResponse.urgent_contact,
          instruction: "Forged emergency instruction.",
        },
      },
    ],
    [
      "changed action code",
      {
        ...urgentResponse,
        actions: [
          { ...urgentResponse.actions[0], code: "forged_action" },
          urgentResponse.actions[1],
        ],
      },
    ],
    [
      "changed action text",
      {
        ...urgentResponse,
        actions: [
          { ...urgentResponse.actions[0], text: "Forged urgent action." },
          urgentResponse.actions[1],
        ],
      },
    ],
    ["missing action", { ...urgentResponse, actions: [urgentResponse.actions[0]] }],
    [
      "additional action",
      {
        ...urgentResponse,
        actions: [
          ...urgentResponse.actions,
          { code: "forged_action", text: "Forged urgent action." },
        ],
      },
    ],
    [
      "reordered actions",
      {
        ...urgentResponse,
        actions: [urgentResponse.actions[1], urgentResponse.actions[0]],
      },
    ],
    [
      "changed notice",
      {
        ...urgentResponse,
        notices: [urgentResponse.notices[0], "Forged urgent notice."],
      },
    ],
    ["missing notice", { ...urgentResponse, notices: [urgentResponse.notices[0]] }],
    [
      "additional notice",
      {
        ...urgentResponse,
        notices: [...urgentResponse.notices, "Forged urgent notice."],
      },
    ],
    [
      "reordered notices",
      {
        ...urgentResponse,
        notices: [urgentResponse.notices[1], urgentResponse.notices[0]],
      },
    ],
  ] as const)("rejects forged urgent content: %s", async (_label, payload) => {
    await expectMalformedSuccess(payload);
  });

  it.each([
    [
      "impossible normal evaluation time",
      {
        ...normalResponse,
        evaluation_time: "2026-02-30T08:00:00Z",
      },
    ],
    [
      "timezone-less normal evaluation time",
      {
        ...normalResponse,
        evaluation_time: "2026-07-17T08:00:00",
      },
    ],
    [
      "impossible urgent evaluation time",
      {
        ...urgentResponse,
        evaluation_time: "2026-02-30T08:00:00Z",
      },
    ],
    [
      "timezone-less urgent evaluation time",
      {
        ...urgentResponse,
        evaluation_time: "2026-07-17T08:00:00",
      },
    ],
    [
      "impossible closing time",
      {
        ...normalResponse,
        selected_place: {
          ...normalResponse.selected_place,
          closes_at: "2026-02-30T18:30:00Z",
        },
      },
    ],
    [
      "timezone-less closing time",
      {
        ...normalResponse,
        selected_place: {
          ...normalResponse.selected_place,
          closes_at: "2026-07-17T18:30:00",
        },
      },
    ],
    [
      "invalid time component",
      {
        ...normalResponse,
        evaluation_time: "2026-07-17T24:00:00Z",
      },
    ],
    [
      "invalid offset component",
      {
        ...normalResponse,
        selected_place: {
          ...normalResponse.selected_place,
          closes_at: "2026-07-17T18:30:00+24:00",
        },
      },
    ],
  ] as const)("rejects invalid datetime: %s", async (_label, payload) => {
    await expectMalformedSuccess(payload);
  });

  it.each([
    ["UTC Z", "2026-07-17T08:00:00Z", "2026-07-17T18:30:00Z"],
    [
      "numeric offset",
      "2026-07-17T10:00:00+02:00",
      "2026-07-17T20:30:00+02:00",
    ],
    [
      "fractional seconds",
      "2026-07-17T08:00:00.123456Z",
      "2026-07-17T18:30:00.654321Z",
    ],
  ] as const)(
    "accepts valid %s datetimes",
    async (_label, evaluationTime, closesAt) => {
      fetchMock.mockResolvedValue(
        jsonResponse({
          ...normalResponse,
          evaluation_time: evaluationTime,
          selected_place: {
            ...normalResponse.selected_place,
            closes_at: closesAt,
          },
        }),
      );
      render(<App />);
      submitSituation();

      expect(await screen.findByRole("heading", { name: "Act now" })).toBeTruthy();
      expect(
        screen.getByRole("heading", {
          name: "Barcelona Synthetic Cooling Centre",
        }),
      ).toBeTruthy();
    },
  );

  it.each([400, 422])(
    "maps HTTP %i invalid input to the safe associated field error",
    async (status) => {
      const response = jsonResponse(
        {
          detail: {
            code: "invalid_action_plan_request",
            message: "Synthetic raw backend detail that must stay hidden.",
          },
        },
        status,
      );
      fetchMock.mockResolvedValue(response);
      render(<App />);

      submitSituation();

      const fieldError = await screen.findByText(
        "Review the description and try again.",
      );
      const textarea = situationField();
      expect(fieldError.id).toBe("situation-error");
      expect(textarea.getAttribute("aria-invalid")).toBe("true");
      expect(textarea.getAttribute("aria-errormessage")).toBe(
        "situation-error",
      );
      expect(textarea.getAttribute("aria-describedby")).toBe(
        "privacy-description identity-warning situation-hint character-count boundary-note situation-error",
      );
      await waitFor(() => expect(document.activeElement).toBe(textarea));
      expect(screen.queryByRole("alert")).toBeNull();
      expect(document.body.textContent).not.toContain(
        "Synthetic raw backend detail",
      );
      expect(response.json).not.toHaveBeenCalled();
      expect(fetchMock).toHaveBeenCalledTimes(1);
    },
  );

  it.each([502, 503, 504])(
    "maps backend status %i to the temporary-unavailable message",
    async (status) => {
      fetchMock.mockResolvedValue(
        jsonResponse({ detail: { message: "Hidden provider detail." } }, status),
      );
      render(<App />);

      submitSituation();

      const alert = await screen.findByRole("alert");
      expect(
        screen.getByRole("heading", {
          name: "Action plan temporarily unavailable",
        }),
      ).toBeTruthy();
      expect(
        screen.getByText(
          "The action plan is temporarily unavailable. Please try again later.",
        ),
      ).toBeTruthy();
      expect(alert.textContent).not.toContain("Hidden provider detail");
      expect(fetchMock).toHaveBeenCalledTimes(1);
      expectNoLocalizationLeak(alert);
    },
  );

  it("turns unknown success JSON into a safe malformed-response error", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({ branch: "unknown", private_backend_value: "hidden" }),
    );
    render(<App />);

    submitSituation();

    const alert = await screen.findByRole("alert");
    expect(
      screen.getByRole("heading", { name: "Response unavailable" }),
    ).toBeTruthy();
    expect(
      screen.getByText("The response could not be safely displayed."),
    ).toBeTruthy();
    expect(alert.textContent).not.toContain("hidden");
    expectNoLocalizationLeak(alert);
  });

  it.each(["not-a-date", "2026-02-30"])(
    "rejects unsafe place date %s instead of crashing during rendering",
    async (lastChecked) => {
      fetchMock.mockResolvedValue(
        jsonResponse({
          ...normalResponse,
          selected_place: {
            ...normalResponse.selected_place,
            last_checked: lastChecked,
          },
        }),
      );
      render(<App />);

      submitSituation();

      const alert = await screen.findByRole("alert");
      expect(alert.textContent).toMatch(
        /response could not be safely displayed/i,
      );
      expect(
        screen.queryByRole("heading", {
          name: "Barcelona Synthetic Cooling Centre",
        }),
      ).toBeNull();
    },
  );

  it("turns invalid JSON into a safe malformed-response error", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: vi
        .fn()
        .mockRejectedValue(new SyntaxError("Synthetic parser detail")),
    } as unknown as Response);
    render(<App />);

    submitSituation();

    const alert = await screen.findByRole("alert");
    expect(alert.textContent).toMatch(/response could not be safely displayed/i);
    expect(alert.textContent).not.toContain("Synthetic parser detail");
  });

  it("maps a fetch rejection to a fixed backend-connection error without retry", async () => {
    fetchMock.mockRejectedValue(new TypeError("Synthetic network detail"));
    render(<App />);

    submitSituation();

    const alert = await screen.findByRole("alert");
    expect(
      screen.getByRole("heading", { name: "Backend could not be reached" }),
    ).toBeTruthy();
    expect(
      screen.getByText(
        "The backend could not be reached. Check that the local services are running.",
      ),
    ).toBeTruthy();
    expect(alert.textContent).not.toContain("Synthetic network detail");
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expectNoLocalizationLeak(alert);
  });

  it("never echoes submitted private text inside an error", async () => {
    const privateText =
      "PRIVATE-SYNTHETIC-SENTINEL: identifying details must not be echoed.";
    fetchMock.mockResolvedValue(
      jsonResponse({ detail: { message: privateText } }, 503),
    );
    render(<App />);

    submitSituation(privateText);

    const alert = await screen.findByRole("alert");
    expect(alert.textContent).not.toContain(privateText);
  });

  it("validates the 2,000 limit by Unicode code points", async () => {
    fetchMock.mockResolvedValue(jsonResponse(urgentResponse));
    render(<App />);

    submitSituation("🧊man".repeat(500));

    await screen.findByRole("heading", { name: "Urgent help" });
    expect(fetchMock).toHaveBeenCalledTimes(1);

    cleanup();
    fetchMock.mockClear();
    render(<App />);
    const textarea = situationField();
    fireEvent.change(textarea, { target: { value: "🧚".repeat(2001) } });

    expect(
      screen.getByText("2,001 / 2,000 code points — 1 over limit"),
    ).toBeTruthy();
    expect(textarea.getAttribute("aria-invalid")).toBe("true");
    expect(textarea.hasAttribute("aria-errormessage")).toBe(false);
    expect(document.getElementById("character-count")?.hasAttribute("aria-live")).toBe(
      false,
    );

    fireEvent.click(
      screen.getByRole("button", { name: "Create my heat action plan" }),
    );

    const fieldError = screen.getByText(
      "Keep the description within 2,000 Unicode characters.",
    );
    expect(fieldError.id).toBe("situation-error");
    expect(textarea.getAttribute("aria-errormessage")).toBe("situation-error");
    expect(textarea.getAttribute("aria-describedby")).toBe(
      "privacy-description identity-warning situation-hint character-count boundary-note situation-error",
    );
    await waitFor(() => expect(document.activeElement).toBe(textarea));
    expect(screen.queryByRole("alert")).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("does not request browser geolocation", async () => {
    const getCurrentPosition = vi.fn();
    const watchPosition = vi.fn();
    const originalDescriptor = Object.getOwnPropertyDescriptor(
      navigator,
      "geolocation",
    );
    Object.defineProperty(navigator, "geolocation", {
      configurable: true,
      value: {
        getCurrentPosition,
        watchPosition,
        clearWatch: vi.fn(),
      },
    });
    fetchMock.mockResolvedValue(jsonResponse(normalResponse));

    try {
      render(<App />);
      submitSituation();
      await screen.findByRole("heading", { name: "Act now" });

      expect(getCurrentPosition).not.toHaveBeenCalled();
      expect(watchPosition).not.toHaveBeenCalled();
      expect(fetchMock).toHaveBeenCalledTimes(1);
    } finally {
      if (originalDescriptor) {
        Object.defineProperty(navigator, "geolocation", originalDescriptor);
      } else {
        Reflect.deleteProperty(navigator, "geolocation");
      }
    }
  });
});
