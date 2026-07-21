import type { MessageCatalog } from "./en";

export const THAI_CATALOG = {
  "app.name": "HeatRelay",

  "navigation.skipToMain": "ข้ามไปยังเนื้อหาหลัก",
  "navigation.homeAccessibleName": "หน้าหลัก HeatRelay",
  "navigation.primaryAccessibleName": "การนำทางหลัก",
  "navigation.createPlan": "สร้างแผน",
  "navigation.safetyAndPrivacy": "ความปลอดภัยและความเป็นส่วนตัว",

  "header.settings": "การตั้งค่า",

"visualMode.label": "โหมดการแสดงผล",
  "visualMode.standard": "มาตรฐาน",
  "visualMode.enhanced": "การมองเห็นที่ชัดเจนขึ้น",
  "visualMode.highContrast": "ความเปรียบต่างสูง",
  "visualMode.description":
    "การมองเห็นที่ชัดเจนขึ้นมีไว้สำหรับผู้ที่มีสายตาเลือนราง หรือทุกคนที่ต้องการเนื้อหาขนาดใหญ่และชัดเจนกว่าเดิม",

  "interfaceLanguage.label": "ภาษา",
  "interfaceLanguage.description":
    "เปลี่ยนภาษาของอินเทอร์เฟซและแผนปฏิบัติการถัดไป แต่ไม่แปลคำอธิบายหรือเขียนแผนที่แสดงอยู่ใหม่",
  "interfaceLanguage.optionWithEnglishName":
    "{{nativeName}} — {{englishName}}",

  "outputLanguage.label": "ภาษาของแผนปฏิบัติการ",
  "outputLanguage.description":
    "เลือกภาษาสำหรับแผนปฏิบัติการครั้งถัดไป ค่ากำหนดนี้จะบันทึกไว้ในเบราว์เซอร์นี้และส่งไปพร้อมคำขอแผนปฏิบัติการ โดยจะไม่เปลี่ยนภาษาของอินเทอร์เฟซหรือแปลคำอธิบายของคุณ",

  "languageContext.title": "ข้อมูลภาษา",
  "languageContext.descriptionLanguage": "ภาษาของคำอธิบาย",
  "languageContext.displayedLanguage": "ภาษาของแผนที่แสดงอยู่",
  "languageContext.nextLanguage": "ภาษาของแผนปฏิบัติการถัดไป",
  "languageContext.supportedMismatch":
    "คำอธิบายและแผนที่แสดงอยู่ใช้ภาษาที่รองรับต่างกัน โปรดตรวจสอบแผนอย่างละเอียดและเลือกภาษาอื่นสำหรับแผนปฏิบัติการหากจำเป็น",
  "languageContext.catalanUnavailable":
    "ไม่มีผลลัพธ์แผนปฏิบัติการภาษาคาตาลัน โปรดตรวจสอบแผนที่แสดงอยู่อย่างละเอียดและเลือกภาษาของแผนปฏิบัติการที่มีให้หากจำเป็น",
  "languageContext.other":
    "HeatRelay ไม่สามารถจับคู่ภาษาของคำอธิบายกับภาษาที่รองรับสำหรับการเปิดตัวได้ โปรดตรวจสอบแผนที่แสดงอยู่อย่างละเอียดและเลือกภาษาของแผนปฏิบัติการที่คุณเข้าใจดีที่สุด",
  "languageContext.unknown":
    "HeatRelay ไม่สามารถระบุภาษาของคำอธิบายได้อย่างน่าเชื่อถือ โปรดตรวจสอบแผนที่แสดงอยู่อย่างละเอียดและเลือกภาษาของแผนปฏิบัติการที่คุณเข้าใจดีที่สุด",
  "languageContext.nextSelection":
    "แผนที่แสดงอยู่จะไม่ถูกเขียนใหม่ ตัวเลือกที่บันทึกไว้จะใช้กับแผนถัดไป",
  "languageContext.otherValue": "ภาษาอื่น",
  "languageContext.unknownValue": "ไม่สามารถระบุได้",
  "languageContext.changeAction": "เปลี่ยนภาษา",

  "hero.eyebrow": "โครงการนำร่อง Barcelona · ไมล์สโตน 5",
  "hero.title": "จากคำเตือนเรื่องความร้อนสู่ขั้นตอนถัดไปที่ปลอดภัย",
  "hero.introduction":
    "อธิบายสถานการณ์เกี่ยวกับความร้อน แล้ว HeatRelay จะขอแผนปฏิบัติการสำหรับ Barcelona ที่อิงข้อมูลหนึ่งแผนจากแบ็กเอนด์ที่มีอยู่ โดยใช้พิกัดเดโมแบบคงที่",
  "hero.action": "สร้างแผนสำหรับ Barcelona",

  "release.kicker": "รุ่นปัจจุบัน",
  "release.badge": "เดโม Barcelona",
  "release.title": "เวิร์กโฟลว์เดียวที่ควบคุมโดยเซิร์ฟเวอร์",
  "release.description":
    "เบราว์เซอร์ส่งเฉพาะคำอธิบายของคุณและการตั้งค่าเดโม Barcelona แบบคงที่ สภาพอากาศ ระดับความเร่งด่วน สถานที่ และการตรวจสอบข้อเท็จจริงยังคงดำเนินการที่แบ็กเอนด์",
  "release.actionPlanApiLabel": "API แผนปฏิบัติการ",
  "release.actionPlanApiValue": "เอนด์พอยต์ต้นทางเดียวกัน",
  "release.demoLocationLabel": "ตำแหน่งเดโม",
  "release.demoLocationValue": "จุด Barcelona แบบคงที่",
  "release.browserLocationLabel": "ตำแหน่งจากเบราว์เซอร์",
  "release.browserLocationValue": "ไม่พร้อมใช้งาน",

  "form.eyebrow": "เดโม Barcelona",
  "form.title": "สร้างแผนปฏิบัติการรับมือความร้อนของคุณ",
  "form.introduction":
    "ให้เฉพาะรายละเอียดสถานการณ์ที่จำเป็น เพื่อปรับแผนที่มีขอบเขตและผ่านการตรวจสอบจากแบ็กเอนด์ให้เหมาะกับคุณ การส่งหนึ่งครั้งจะสร้างคำขอหนึ่งรายการ",
  "form.privacyTitle": "รายละเอียดความเป็นส่วนตัวและเดโม",
  "form.privacyDescription":
    "คำอธิบายของคุณถูกส่งผ่านเซิร์ฟเวอร์ไปยัง OpenAI เพื่อประมวลผลด้วย GPT-5.6 HeatRelay ไม่ได้ตั้งใจจัดเก็บหรือบันทึกข้อความต้นฉบับ แต่นโยบายการจัดการข้อมูลของผู้ให้บริการอาจยังมีผลบังคับใช้",
  "form.identityWarning":
    "ข้อความจะถูกส่งไปยัง OpenAI โดย HeatRelay ไม่ได้ตั้งใจบันทึกหรือจัดเก็บข้อความต้นฉบับ อย่าใส่ชื่อ ข้อมูลติดต่อ หรือที่อยู่ ใช้พิกัดเดโม Barcelona แบบคงที่ ไม่ใช่คำแนะนำทางการแพทย์หรือความช่วยเหลือฉุกเฉิน",
  "form.situationLabel": "อธิบายสถานการณ์เกี่ยวกับความร้อน",
  "form.characterCount": "{{currentCount}} / {{limit}} อักขระ",
  "form.characterCountOverLimit":
    "{{currentCount}} / {{limit}} อักขระ — ลดลง {{overLimitCount}} อักขระ",
  "form.situationHint":
    "อธิบายอายุ การเข้าถึงวิธีคลายร้อน การเคลื่อนไหว ช่วงเวลา และอาการที่เกี่ยวข้องโดยย่อ",
  "form.demoButton": "โหลดเดโม Barcelona",
  "form.submitButton": "สร้างแผนปฏิบัติการรับมือความร้อนของฉัน",
  "form.submittingButton": "กำลังสร้างแผนของคุณ…",
  "form.boundaryNote":
    "MVP นี้ใช้พิกัดเดโม Barcelona แบบคงที่ ตำแหน่งจากเบราว์เซอร์ยังไม่พร้อมใช้งาน ระยะทางเป็นค่าประมาณแบบเส้นตรง HeatRelay ไม่ได้ให้คำแนะนำทางการแพทย์หรือคำแนะนำสำหรับเหตุฉุกเฉิน",
  "form.demoText":
    "อายุ 69 ปี อาศัยอยู่คนเดียว ไม่มีเครื่องปรับอากาศ เดินช้า และพูดภาษาสเปนไม่ได้",

  "scenario.heading": "เราช่วยอะไรคุณได้บ้าง?",
  "scenario.selfTitle": "ฉันร้อนเกินไป",
  "scenario.selfDescription": "สร้างแผนปฏิบัติการส่วนตัว",
  "scenario.someoneTitle": "ช่วยคนใกล้ชิด",
  "scenario.someoneDescription": "สร้างแผนสำหรับบุคคลอื่น",
  "scenario.placeTitle": "ค้นหาสถานที่เย็นใกล้เคียง",
  "scenario.placeDescription": "แสดงความช่วยเหลือที่ยืนยันแล้วใกล้ที่สุด",
  "scenario.nearestHelp": "ความช่วยเหลือใกล้ที่สุด",
  "scenario.importantNow": "สิ่งสำคัญตอนนี้",

  "validation.empty": "โปรดอธิบายสถานการณ์ก่อนสร้างแผน",
  "validation.overLimit": "คำอธิบายยาวเกินไป โปรดย่อข้อความ",
  "validation.serverInput": "ตรวจทานคำอธิบายแล้วลองอีกครั้ง",

  "status.creating": "กำลังสร้างแผนปฏิบัติการของคุณ",
  "status.ready": "แผนปฏิบัติการของคุณพร้อมแล้ว",
  "status.loadingDetail":
    "กำลังตรวจสอบสถานการณ์ สภาพอากาศ และตัวเลือกที่ผ่านการตรวจสอบ…",

  "error.malformedTitle": "ไม่มีการตอบกลับที่พร้อมใช้งาน",
  "error.malformedMessage": "ไม่สามารถแสดงการตอบกลับได้อย่างปลอดภัย",
  "error.unavailableTitle": "แผนปฏิบัติการไม่พร้อมใช้งานชั่วคราว",
  "error.unavailableMessage":
    "แผนปฏิบัติการไม่พร้อมใช้งานชั่วคราว โปรดลองอีกครั้งภายหลัง",
  "error.connectionTitle": "ไม่สามารถเชื่อมต่อแบ็กเอนด์ได้",
  "error.connectionMessage":
    "ไม่สามารถเชื่อมต่อแบ็กเอนด์ได้ โปรดตรวจสอบว่าบริการภายในเครื่องกำลังทำงานอยู่",

  "priority.actNow": "ดำเนินการทันที",
  "priority.prepareNow": "เตรียมพร้อมทันที",
  "priority.monitorAndPrepare": "เฝ้าติดตามและเตรียมพร้อม",

  "result.eyebrow": "แผนปฏิบัติการรับมือความร้อนสำหรับ Barcelona ของคุณ",
  "result.priorityBadge": "ระดับความเร่งด่วน: {{priority}}",
  "result.evaluatedAt": "ประเมินเมื่อ {{dateTime}}",
  "result.weatherSummaryAccessibleName": "สรุปสภาพอากาศ",
  "result.currentTemperature": "อุณหภูมิปัจจุบัน",
  "result.feelsLike": "อุณหภูมิที่รู้สึกได้",
  "result.todayMaximum": "อุณหภูมิสูงสุดวันนี้",
  "result.phaseNow": "ตอนนี้",
  "result.phaseNextFewHours": "อีกไม่กี่ชั่วโมงข้างหน้า",
  "result.phaseTonight": "คืนนี้",
  "result.bringItemsTitle": "สิ่งที่ควรนำไป",
  "result.explanationTitle": "เหตุผลของแผนนี้",
  "result.localPhraseTitle": "วลีท้องถิ่น",
  "result.localPhraseCatalan": "ภาษาคาตาลัน",
  "result.localPhraseSpanish": "ภาษาสเปน",
  "result.noPlaceTitle": "ไม่ได้เลือกสถานที่ที่ผ่านการตรวจสอบ",
  "result.noticesTitle": "ประกาศด้านความปลอดภัยและข้อมูล",

  "place.backendApprovedLabel": "ตัวเลือกที่แบ็กเอนด์อนุมัติ",
  "place.distanceLabel": "ระยะทาง",
  "place.closesLabel": "ปิด",
  "place.accessibilityLabel": "ความสะดวกในการเข้าถึง",
  "place.lastCheckedLabel": "ตรวจสอบล่าสุด",
  "place.featuresTitle": "คุณลักษณะที่ผ่านการตรวจสอบ",
  "place.noFeatures": "ไม่มีคุณลักษณะเพิ่มเติมที่ผ่านการตรวจสอบในรายการ",
  "place.linksAccessibleName": "ลิงก์ทางการของสถานที่",
  "place.informationLink": "ข้อมูลทางการ",
  "place.sourceLink": "แหล่งข้อมูลทางการ",
  "place.mapLink": "เปิดเส้นทางใน Google Maps",
  "place.cautionsAccessibleName": "ข้อควรระวังเกี่ยวกับสถานที่",
  "place.addressUnavailable": "ไม่มีข้อมูลที่อยู่",
  "place.accessibilityConfirmed": "แหล่งข้อมูลยืนยันว่าสถานที่นี้เข้าถึงได้",
  "place.accessibilityUnavailable":
    "แหล่งข้อมูลระบุว่าสถานที่นี้ไม่สามารถเข้าถึงได้",
  "place.accessibilityUnknown": "ไม่ทราบสถานะการเข้าถึง",

  "feature.indoorSpace": "พื้นที่ในอาคาร",
  "feature.potableWater": "น้ำดื่ม",
  "feature.toilets": "ห้องน้ำ",
  "feature.microShelter": "ที่หลบภัยขนาดเล็ก",
  "feature.petsAllowed": "อนุญาตสัตว์เลี้ยง",

  "feature.confirmed": "ยืนยันแล้ว",
  "feature.unavailable": "ไม่ได้ระบุว่ามีให้บริการ",
  "feature.unknown": "ยังไม่ยืนยัน",

  "distance.straightLine": "{{distance}} แบบเส้นตรง",

  "urgent.badge": "เร่งด่วน · ดำเนินการทันที",
  "urgent.eyebrow": "ผลลัพธ์ด้านความปลอดภัยเร่งด่วน",
  "urgent.title": "ความช่วยเหลือเร่งด่วน",
  "urgent.sourceLink": "คำแนะนำ 112 อย่างเป็นทางการ",

  "trust.eyebrow": "ขอบเขตความน่าเชื่อถือ",
  "trust.title": "มีประโยชน์โดยไม่อ้างความแน่นอนเกินจริง",
  "trust.safetyLabel": "ความปลอดภัย",
  "trust.safetyTitle": "ข้อมูล ไม่ใช่คำแนะนำทางการแพทย์",
  "trust.safetyDescription":
    "ข้อมูลสภาพอากาศมาจากแบบจำลอง ไม่ใช่คำเตือนเรื่องความร้อนอย่างเป็นทางการ ควรตรวจสอบสถานที่ เวลาเปิดทำการ ระยะทางแบบเส้นตรง และความเป็นไปได้ในการเดินทางไปถึงก่อนออกเดินทาง ผลลัพธ์เร่งด่วนใช้เนื้อหาแบบคงที่ที่แบ็กเอนด์ควบคุม",
  "trust.privacyLabel": "ความเป็นส่วนตัว",
  "trust.privacyTitle": "อย่าใส่ข้อมูลที่ระบุตัวตนได้",
  "trust.privacyDescription":
    "ข้อความเกี่ยวกับสถานการณ์จะไม่ถูกเก็บในพื้นที่จัดเก็บของเบราว์เซอร์ ค่ากำหนดโหมดการแสดงผลและภาษาที่เลือกไว้อย่างชัดเจนจะถูกจัดเก็บไว้ในเครื่อง มีเพียงรหัสภาษาที่เลือกเท่านั้นที่รวมอยู่ในคำขอแผนปฏิบัติการ ส่วนโหมดการแสดงผลจะไม่รวมอยู่ HeatRelay ไม่ใช้การวิเคราะห์ คุกกี้ พารามิเตอร์ URL หรือตำแหน่งทางภูมิศาสตร์ในเดโมนี้",

  "footer.description": "เดโม Barcelona · พิกัดแบบคงที่",

  "metadata.title": "HeatRelay · พื้นฐานโครงการนำร่อง Barcelona",
  "metadata.description":
    "HeatRelay เป็นโครงการที่เริ่มต้นจาก Barcelona ซึ่งกำลังพัฒนาเพื่อเปลี่ยนคำเตือนเรื่องความร้อนให้เป็นขั้นตอนถัดไปที่ปลอดภัย",
} as const satisfies MessageCatalog;
