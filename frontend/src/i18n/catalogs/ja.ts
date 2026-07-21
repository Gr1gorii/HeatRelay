import type { MessageCatalog } from "./en";

export const JAPANESE_CATALOG = {
  "app.name": "HeatRelay",

  "navigation.skipToMain": "メインコンテンツへ移動",
  "navigation.homeAccessibleName": "HeatRelay ホーム",
  "navigation.primaryAccessibleName": "メインナビゲーション",
  "navigation.createPlan": "プランを作成",
  "navigation.safetyAndPrivacy": "安全性とプライバシー",

  "header.settings": "設定",

"visualMode.label": "表示モード",
  "visualMode.standard": "標準",
  "visualMode.enhanced": "見やすさを向上",
  "visualMode.highContrast": "ハイコントラスト",
  "visualMode.description":
    "見やすさを向上するモードは、弱視の方や、より大きく明瞭な表示を希望する方を対象としています。",

  "interfaceLanguage.label": "言語",
  "interfaceLanguage.description":
    "インターフェースと次のアクションプランの言語を変更します。説明を翻訳したり、表示中のプランを書き換えたりはしません。",
  "interfaceLanguage.optionWithEnglishName":
    "{{nativeName}} — {{englishName}}",

  "outputLanguage.label": "アクションプランの言語",
  "outputLanguage.description":
    "次のアクションプランの言語を選びます。この設定はこのブラウザーに保存され、アクションプランのリクエストとともに送信されます。インターフェース言語を変更したり、説明文を翻訳したりするものではありません。",

  "languageContext.title": "言語情報",
  "languageContext.descriptionLanguage": "説明文の言語",
  "languageContext.displayedLanguage": "表示中のアクションプランの言語",
  "languageContext.nextLanguage": "次のアクションプランの言語",
  "languageContext.supportedMismatch":
    "説明文と表示中のプランでは、異なる対応言語が使われています。プランをよく確認し、必要に応じて別のアクションプラン言語を選択してください。",
  "languageContext.catalanUnavailable":
    "カタルーニャ語のアクションプラン出力は利用できません。表示中のプランをよく確認し、必要に応じて利用可能なアクションプラン言語を選択してください。",
  "languageContext.other":
    "HeatRelay は説明文の言語を対応している提供言語のいずれにも一致させられませんでした。表示中のプランをよく確認し、最もよく理解できるアクションプラン言語を選択してください。",
  "languageContext.unknown":
    "HeatRelay は説明文の言語を確実に判定できませんでした。表示中のプランをよく確認し、最もよく理解できるアクションプラン言語を選択してください。",
  "languageContext.nextSelection":
    "表示中のプランは書き換えられません。保存した選択は次のプランに適用されます。",
  "languageContext.otherValue": "別の言語",
  "languageContext.unknownValue": "判定できませんでした",
  "languageContext.changeAction": "言語を変更",

  "hero.eyebrow": "Barcelona パイロット版 · マイルストーン5",
  "hero.title": "暑さに関する警告から、安全な次の行動へ。",
  "hero.introduction":
    "暑さの状況を説明すると、HeatRelay が固定されたデモ用座標を使用し、既存のバックエンドに根拠のある Barcelona 向けアクションプランを1件依頼します。",
  "hero.action": "Barcelona 向けプランを作成",

  "release.kicker": "現在のリリース",
  "release.badge": "Barcelona デモ",
  "release.title": "サーバー側で管理される単一のワークフロー",
  "release.description":
    "ブラウザーから送信されるのは、入力した説明と固定された Barcelona デモ設定だけです。天気、優先度、場所、事実の検証はバックエンドで処理されます。",
  "release.actionPlanApiLabel": "アクションプランAPI",
  "release.actionPlanApiValue": "同一オリジンのエンドポイント",
  "release.demoLocationLabel": "デモの場所",
  "release.demoLocationValue": "Barcelona の固定地点",
  "release.browserLocationLabel": "ブラウザーの位置情報",
  "release.browserLocationValue": "利用不可",

  "form.eyebrow": "Barcelona デモ",
  "form.title": "暑さ対策アクションプランを作成",
  "form.introduction":
    "範囲が限定され、バックエンドで検証されるプランを調整するために必要な状況だけを共有してください。1回の送信につき、リクエストは1回です。",
  "form.privacyTitle": "プライバシーとデモの詳細",
  "form.privacyDescription":
    "入力した説明は、GPT-5.6 で処理するためサーバー側から OpenAI に送信されます。HeatRelay は生のテキストを意図的に保存または記録しませんが、プロバイダーのデータ取り扱いポリシーが適用される場合があります。",
  "form.identityWarning":
    "テキストは OpenAI に送信されます。HeatRelay は元のテキストを意図的に保存または記録しません。氏名、連絡先、住所を含めないでください。Barcelona の固定デモ座標を使用します。医療上の助言や緊急支援ではありません。",
  "form.situationLabel": "暑さの状況を説明してください",
  "form.characterCount": "{{currentCount}} / {{limit}} 文字",
  "form.characterCountOverLimit":
    "{{currentCount}} / {{limit}} 文字 — {{overLimitCount}} 文字短くしてください",
  "form.situationHint":
    "年齢、涼める環境の有無、移動のしやすさ、時間帯、関連する症状を簡潔に説明してください。",
  "form.demoButton": "Barcelona デモを読み込む",
  "form.submitButton": "暑さ対策アクションプランを作成",
  "form.submittingButton": "プランを作成しています…",
  "form.boundaryNote":
    "このMVPでは、固定された Barcelona デモ用座標を使用します。ブラウザーの位置情報はまだ利用できません。距離は直線距離の推定値です。HeatRelay は医療または緊急時の助言を提供するものではありません。",
  "form.demoText":
    "私は69歳で、一人暮らしです。エアコンがなく、歩くのが遅く、スペイン語を話せません。",

  "scenario.heading": "どのようにお手伝いできますか？",
  "scenario.selfTitle": "暑すぎます",
  "scenario.selfDescription": "自分の行動計画を作成する",
  "scenario.someoneTitle": "身近な人を助ける",
  "scenario.someoneDescription": "別の人のための計画を作成する",
  "scenario.placeTitle": "近くの涼しい場所を探す",
  "scenario.placeDescription": "最寄りの確認済み支援を表示する",
  "scenario.nearestHelp": "最寄りの支援",
  "scenario.importantNow": "今、大切なこと",

  "validation.empty": "プランを作成する前に状況を説明してください。",
  "validation.overLimit": "説明が長すぎます。テキストを短くしてください。",
  "validation.serverInput": "説明を確認して、もう一度お試しください。",

  "status.creating": "アクションプランを作成しています。",
  "status.ready": "アクションプランの準備ができました。",
  "status.loadingDetail":
    "状況、天気、検証済みの候補を確認しています…",

  "error.malformedTitle": "応答を利用できません",
  "error.malformedMessage": "応答を安全に表示できませんでした。",
  "error.unavailableTitle": "アクションプランを一時的に利用できません",
  "error.unavailableMessage":
    "アクションプランを一時的に利用できません。後でもう一度お試しください。",
  "error.connectionTitle": "バックエンドに接続できませんでした",
  "error.connectionMessage":
    "バックエンドに接続できませんでした。ローカルサービスが実行中か確認してください。",

  "priority.actNow": "今すぐ行動",
  "priority.prepareNow": "今すぐ準備",
  "priority.monitorAndPrepare": "状況を確認して準備",

  "result.eyebrow": "Barcelona 向け暑さ対策アクションプラン",
  "result.priorityBadge": "優先度：{{priority}}",
  "result.evaluatedAt": "評価日時：{{dateTime}}",
  "result.weatherSummaryAccessibleName": "天気の概要",
  "result.currentTemperature": "現在の気温",
  "result.feelsLike": "体感温度",
  "result.todayMaximum": "今日の最高気温",
  "result.phaseNow": "今",
  "result.phaseNextFewHours": "今後数時間",
  "result.phaseTonight": "今夜",
  "result.bringItemsTitle": "持っていくもの",
  "result.explanationTitle": "このプランの理由",
  "result.localPhraseTitle": "現地で使えるフレーズ",
  "result.localPhraseCatalan": "カタルーニャ語",
  "result.localPhraseSpanish": "スペイン語",
  "result.noPlaceTitle": "検証済みの場所は選択されていません",
  "result.noticesTitle": "安全と情報に関する注意事項",

  "place.backendApprovedLabel": "バックエンド承認済みの候補",
  "place.distanceLabel": "距離",
  "place.closesLabel": "終了時刻",
  "place.accessibilityLabel": "アクセシビリティ",
  "place.lastCheckedLabel": "最終確認日",
  "place.featuresTitle": "確認済みの特徴",
  "place.noFeatures": "追加の確認済みの特徴は記載されていません。",
  "place.linksAccessibleName": "場所の公式リンク",
  "place.informationLink": "公式情報",
  "place.sourceLink": "公式情報源",
  "place.mapLink": "Google マップで経路を開く",
  "place.cautionsAccessibleName": "場所に関する注意事項",
  "place.addressUnavailable": "住所を利用できません",
  "place.accessibilityConfirmed": "情報源によりアクセシビリティを確認済み",
  "place.accessibilityUnavailable":
    "情報源では、この場所はバリアフリーではないと報告されています",
  "place.accessibilityUnknown": "アクセシビリティの状況は不明です",

  "feature.indoorSpace": "屋内スペース",
  "feature.potableWater": "飲料水",
  "feature.toilets": "トイレ",
  "feature.microShelter": "小規模シェルター",
  "feature.petsAllowed": "ペット同伴可",

  "feature.confirmed": "確認済み",
  "feature.unavailable": "利用可能との記載なし",
  "feature.unknown": "未確認",

  "distance.straightLine": "{{distance}}（直線距離）",

  "urgent.badge": "緊急 · 今すぐ行動",
  "urgent.eyebrow": "緊急の安全確認結果",
  "urgent.title": "緊急の支援",
  "urgent.sourceLink": "112 の公式ガイダンス",

  "trust.eyebrow": "信頼性の範囲",
  "trust.title": "確実性を誇張せず、役立つ情報を提供します。",
  "trust.safetyLabel": "安全性",
  "trust.safetyTitle": "情報であり、医療上の助言ではありません",
  "trust.safetyDescription":
    "天気はモデルに基づくもので、公式の暑さ警報ではありません。出発前に、場所、利用時間、直線距離、到達可能性を確認してください。緊急時の出力には、バックエンドが管理する固定内容が使用されます。",
  "trust.privacyLabel": "プライバシー",
  "trust.privacyTitle": "個人を特定できる情報は入力しないでください",
  "trust.privacyDescription":
    "状況のテキストはブラウザーのストレージに保存されません。明示的に選択した表示モードと言語の設定はローカルに保存されます。アクションプランのリクエストに入るのは選択した言語コードだけで、表示モードは入りません。このデモでは、HeatRelay はアクセス解析、Cookie、URLパラメーター、位置情報を使用しません。",

  "footer.description": "Barcelona デモ · 固定座標",

  "metadata.title": "HeatRelay · Barcelona パイロット基盤",
  "metadata.description":
    "HeatRelay は、暑さに関する警告を安全な次の行動につなげるために開発中の、Barcelona を起点とするプロジェクトです。",
} as const satisfies MessageCatalog;
