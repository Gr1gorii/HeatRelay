import type { MessageCatalog } from "./en";

export const BRAZILIAN_PORTUGUESE_CATALOG = {
  "app.name": "HeatRelay",

  "navigation.skipToMain": "Pular para o conteúdo principal",
  "navigation.homeAccessibleName": "Página inicial da HeatRelay",
  "navigation.primaryAccessibleName": "Principal",
  "navigation.createPlan": "Criar um plano",
  "navigation.safetyAndPrivacy": "Segurança e privacidade",

  "visualMode.label": "Modo visual",
  "visualMode.standard": "Padrão",
  "visualMode.enhanced": "Visibilidade aprimorada",
  "visualMode.description":
    "A Visibilidade aprimorada é destinada a pessoas com baixa visão ou a qualquer pessoa que prefira conteúdo maior e mais nítido.",

  "interfaceLanguage.label": "Idioma da interface",
  "interfaceLanguage.description":
    "Muda a navegação, os formulários e os rótulos da página. Não muda o idioma do plano de ação.",
  "interfaceLanguage.optionWithEnglishName":
    "{{nativeName}} — {{englishName}}",

  "outputLanguage.label": "Idioma do plano de ação",
  "outputLanguage.description":
    "Escolhe o idioma do próximo plano de ação. Essa preferência é salva neste navegador e enviada com a solicitação do plano de ação. Ela não muda o idioma da interface nem traduz a sua descrição.",

  "languageContext.title": "Informações de idioma",
  "languageContext.descriptionLanguage": "Idioma da descrição",
  "languageContext.displayedLanguage": "Idioma do plano exibido",
  "languageContext.nextLanguage": "Idioma do próximo plano de ação",
  "languageContext.supportedMismatch":
    "A descrição e o plano exibido usam idiomas compatíveis diferentes. Revise o plano com atenção e escolha outro idioma para o plano de ação, se necessário.",
  "languageContext.catalanUnavailable":
    "A saída do plano de ação em catalão não está disponível. Revise o plano exibido com atenção e escolha um idioma disponível para o plano de ação, se necessário.",
  "languageContext.other":
    "A HeatRelay não conseguiu associar o idioma da descrição a um dos idiomas de lançamento compatíveis. Revise o plano exibido com atenção e escolha o idioma do plano de ação que você entende melhor.",
  "languageContext.unknown":
    "A HeatRelay não conseguiu determinar com segurança o idioma da descrição. Revise o plano exibido com atenção e escolha o idioma do plano de ação que você entende melhor.",
  "languageContext.nextSelection":
    "O plano exibido não é reescrito. Sua escolha salva será aplicada ao próximo plano.",
  "languageContext.otherValue": "Outro idioma",
  "languageContext.unknownValue": "Não foi possível determinar",
  "languageContext.changeAction": "Alterar o idioma do plano de ação",

  "hero.eyebrow": "Piloto de Barcelona · Marco 5",
  "hero.title": "De um alerta de calor ao próximo passo seguro.",
  "hero.introduction":
    "Descreva uma situação de calor, e a HeatRelay solicitará ao backend existente um plano de ação fundamentado para Barcelona usando coordenadas fixas de demonstração.",
  "hero.action": "Criar um plano para Barcelona",

  "release.kicker": "Versão atual",
  "release.badge": "Demonstração de Barcelona",
  "release.title": "Um único fluxo controlado pelo servidor",
  "release.description":
    "O navegador envia apenas sua descrição e as configurações fixas da demonstração de Barcelona. Informações meteorológicas, prioridade, locais e validação de fatos permanecem no backend.",
  "release.actionPlanApiLabel": "API do plano de ação",
  "release.actionPlanApiValue": "Endpoint de mesma origem",
  "release.demoLocationLabel": "Local da demonstração",
  "release.demoLocationValue": "Ponto fixo em Barcelona",
  "release.browserLocationLabel": "Localização do navegador",
  "release.browserLocationValue": "Não disponível",

  "form.eyebrow": "Demonstração de Barcelona",
  "form.title": "Crie seu plano de ação para o calor",
  "form.introduction":
    "Compartilhe apenas os detalhes da situação necessários para personalizar um plano limitado e validado pelo backend. Cada envio faz uma solicitação.",
  "form.privacyTitle": "Antes de enviar",
  "form.privacyDescription":
    "Sua descrição é enviada ao servidor para processamento pelo GPT-5.6 da OpenAI. A HeatRelay não armazena nem registra intencionalmente o texto original; as políticas de tratamento de dados do provedor ainda podem ser aplicáveis.",
  "form.identityWarning":
    "Não inclua nomes, dados de contato, endereços ou outras informações que identifiquem você.",
  "form.situationLabel": "Descreva a situação de calor",
  "form.characterCount": "{{currentCount}} / {{limit}} pontos de código",
  "form.characterCountOverLimit":
    "{{currentCount}} / {{limit}} pontos de código — {{overLimitCount}} acima do limite",
  "form.situationHint":
    "Use até {{limit}} pontos de código Unicode. Você pode descrever idade, acesso a refrigeração, mobilidade, horário ou sintomas de alerta limitados.",
  "form.demoButton": "Carregar demonstração de Barcelona",
  "form.submitButton": "Criar meu plano de ação para o calor",
  "form.submittingButton": "Criando seu plano…",
  "form.boundaryNote":
    "Este MVP usa coordenadas fixas da demonstração de Barcelona. A localização do navegador ainda não está disponível. As distâncias são estimativas em linha reta; a HeatRelay não oferece aconselhamento médico nem de emergência.",
  "form.demoText":
    "Tenho 69 anos, moro sem companhia, não tenho ar-condicionado, caminho devagar e não falo espanhol.",

  "validation.empty": "Descreva a situação antes de criar um plano.",
  "validation.overLimit":
    "Mantenha a descrição dentro do limite de {{limit}} caracteres Unicode.",
  "validation.serverInput": "Revise a descrição e tente novamente.",

  "status.creating": "Criando seu plano de ação.",
  "status.ready": "Seu plano de ação está pronto.",
  "status.loadingDetail":
    "Verificando a situação, as condições meteorológicas e os locais candidatos verificados…",

  "error.malformedTitle": "Resposta indisponível",
  "error.malformedMessage": "Não foi possível exibir a resposta com segurança.",
  "error.unavailableTitle": "Plano de ação temporariamente indisponível",
  "error.unavailableMessage":
    "O plano de ação está temporariamente indisponível. Tente novamente mais tarde.",
  "error.connectionTitle": "Não foi possível acessar o backend",
  "error.connectionMessage":
    "Não foi possível acessar o backend. Verifique se os serviços locais estão em execução.",

  "priority.actNow": "Aja agora",
  "priority.prepareNow": "Prepare-se agora",
  "priority.monitorAndPrepare": "Monitore e prepare-se",

  "result.eyebrow": "Seu plano de ação para o calor em Barcelona",
  "result.priorityBadge": "Prioridade: {{priority}}",
  "result.evaluatedAt": "Avaliado em {{dateTime}}",
  "result.weatherSummaryAccessibleName": "Resumo das condições meteorológicas",
  "result.currentTemperature": "Temperatura atual",
  "result.feelsLike": "Sensação térmica",
  "result.todayMaximum": "Máxima de hoje",
  "result.phaseNow": "Agora",
  "result.phaseNextFewHours": "Próximas horas",
  "result.phaseTonight": "Hoje à noite",
  "result.bringItemsTitle": "Leve com você",
  "result.explanationTitle": "Por que este plano",
  "result.localPhraseTitle": "Uma frase local",
  "result.localPhraseCatalan": "Catalão",
  "result.localPhraseSpanish": "Espanhol",
  "result.noPlaceTitle": "Nenhum local verificado selecionado",
  "result.noticesTitle": "Avisos de segurança e informação",

  "place.backendApprovedLabel": "Local candidato aprovado pelo backend",
  "place.distanceLabel": "Distância",
  "place.closesLabel": "Fecha às",
  "place.accessibilityLabel": "Acessibilidade",
  "place.lastCheckedLabel": "Última verificação",
  "place.featuresTitle": "Recursos verificados",
  "place.noFeatures": "Nenhum recurso adicional verificado está listado.",
  "place.linksAccessibleName": "Links oficiais do local",
  "place.informationLink": "Informações oficiais",
  "place.sourceLink": "Fonte oficial",
  "place.cautionsAccessibleName": "Cuidados relacionados ao local",
  "place.addressUnavailable": "Endereço indisponível",
  "place.accessibilityConfirmed": "Acessibilidade confirmada pela fonte",
  "place.accessibilityUnavailable":
    "A fonte informa que este local não é acessível",
  "place.accessibilityUnknown": "Situação da acessibilidade desconhecida",

  "feature.indoorSpace": "Espaço interno",
  "feature.potableWater": "Água potável",
  "feature.toilets": "Banheiros",
  "feature.microShelter": "Microabrigo",
  "feature.petsAllowed": "Animais de estimação permitidos",

  "distance.straightLine": "{{distance}} em linha reta",

  "urgent.badge": "Urgente · aja imediatamente",
  "urgent.eyebrow": "Resultado imediato de segurança",
  "urgent.title": "Ajuda urgente",
  "urgent.sourceLink": "Orientações oficiais do 112",

  "trust.eyebrow": "Limites de confiança",
  "trust.title": "Útil sem exagerar o grau de certeza.",
  "trust.safetyLabel": "Segurança",
  "trust.safetyTitle": "Informação, não aconselhamento médico",
  "trust.safetyDescription":
    "As condições meteorológicas são derivadas de modelos e não constituem um alerta oficial de calor. Locais, horários, distância em linha reta e possibilidade de acesso devem ser verificados antes do deslocamento. A resposta urgente usa conteúdo fixo controlado pelo backend.",
  "trust.privacyLabel": "Privacidade",
  "trust.privacyTitle": "Não inclua dados que identifiquem você",
  "trust.privacyDescription":
    "O texto da situação não é armazenado no navegador. As preferências explícitas de modo visual, idioma da interface e idioma do plano de ação são salvas localmente. Somente o código do idioma selecionado para o plano de ação entra na solicitação; o modo visual e o idioma da interface não entram. A HeatRelay não usa análises, cookies, parâmetros de URL nem geolocalização nesta demonstração.",

  "footer.description": "Demonstração de Barcelona · Coordenadas fixas",

  "metadata.title": "HeatRelay · Base do piloto de Barcelona",
  "metadata.description":
    "A HeatRelay é um projeto que começa por Barcelona e está sendo desenvolvido para transformar alertas de calor em próximos passos seguros.",
} as const satisfies MessageCatalog;
