"""Deterministic Brazilian Portuguese action-plan output catalog."""

from types import MappingProxyType

from backend.app.action_plan_catalogs import ActionPlanCatalog


BRAZILIAN_PORTUGUESE_ACTION_PLAN_CATALOG = ActionPlanCatalog(
    policy_notice=(
        "A HeatRelay aplica heurísticas transparentes da política de "
        "Barcelona a fatos delimitados da situação e, em casos não urgentes, "
        "a um contexto meteorológico derivado de modelos. Isso não comprova "
        "que um alerta oficial ou uma emergência tenha sido ativado."
    ),
    policy_rules=(
        (
            "Use os limites diurnos publicados de 34.0°C e 36.0°C apenas como "
            "heurísticas versionadas da política da HeatRelay aplicadas à "
            "temperatura máxima do mesmo dia derivada de modelos, nunca como "
            "comprovação de ativação municipal."
        ),
        (
            "Mantenha o aviso para verificar os horários e nunca apresente um "
            "abrigo climático como substituto do atendimento médico."
        ),
        (
            "Um sintoma de alerta delimitado relatado explicitamente aciona o "
            "ramo urgente e ignora a obtenção normal de dados meteorológicos, "
            "locais e a geração do plano."
        ),
        (
            "Encaminhe todos os valores do catálogo fechado atual de sintomas "
            "de alerta delimitados para o conteúdo fixo de contato com o 112, "
            "controlado pelo backend."
        ),
        (
            "Mantenha o resultado informativo e determinístico; não "
            "diagnostique nem crie uma pontuação de risco médico. Ofereça "
            "resfriamento somente com ventilador, quando relatado, apenas se "
            "tanto a temperatura atual quanto a máxima do mesmo dia estiverem "
            "estritamente abaixo de 40.0°C."
        ),
    ),
    situation_notice=(
        "Esta saída é um resumo estruturado das informações relatadas "
        "explicitamente. Não é aconselhamento médico, uma avaliação de "
        "emergência nem um plano de ação."
    ),
    weather_notice=(
        "Este é um contexto meteorológico derivado dos modelos da Open-Meteo, "
        "não um alerta oficial de calor."
    ),
    urgent_contact_instruction=(
        "Ligue para o 112 agora para solicitar assistência de emergência."
    ),
    urgent_actions=MappingProxyType(
        {
            "contact_emergency_service_now": "Ligue para o 112 agora.",
            "do_not_use_shelter_as_medical_substitute": (
                "Os abrigos climáticos não substituem o atendimento médico."
            ),
        }
    ),
    urgent_notices=(
        "Os abrigos climáticos não substituem o atendimento médico.",
        (
            "Como um sintoma de alerta de escopo limitado foi relatado "
            "explicitamente, a HeatRelay não consultou informações "
            "meteorológicas nem locais e não pediu ao GPT-5.6 que gerasse um "
            "plano."
        ),
    ),
    now_actions=MappingProxyType(
        {
            "move_to_cooler_space": (
                "Vá para o local mais fresco disponível onde você já está.",
                (
                    "Reduzir a exposição ao calor é útil sem pressupor que "
                    "seja possível se deslocar."
                ),
            ),
            "reduce_physical_effort": (
                "Reduza o esforço físico por enquanto.",
                "Diminuir o esforço pode reduzir a carga térmica adicional.",
            ),
            "drink_water": (
                "Beba água regularmente, se puder fazer isso com segurança.",
                "A hidratação é uma medida padrão de segurança contra o calor.",
            ),
            "use_available_home_cooling": (
                (
                    "Use o equipamento de refrigeração que você relatou "
                    "explicitamente ter."
                ),
                (
                    "Esta ação depende apenas do acesso à refrigeração "
                    "relatado."
                ),
            ),
            "contact_support_person": (
                (
                    "Entre em contato com uma pessoa de confiança antes de "
                    "considerar um deslocamento."
                ),
                (
                    "As restrições relatadas indicam que se deslocar sem "
                    "companhia não é adequado."
                ),
            ),
            "remain_at_current_location": (
                (
                    "Permaneça onde está e use medidas de refrigeração que não "
                    "exijam deslocamento."
                ),
                (
                    "Uma restrição relatada impede que você saia neste "
                    "momento."
                ),
            ),
            "travel_to_selected_place": (
                (
                    "Considere o candidato selecionado, verificado como "
                    "aberto, somente depois de confirmar o horário atual."
                ),
                (
                    "O local estava no conjunto de candidatos aprovado pelo "
                    "backend para esta solicitação."
                ),
            ),
        }
    ),
    next_few_hours_actions=MappingProxyType(
        {
            "keep_drinking_water": (
                (
                    "Mantenha água disponível e beba regularmente, se isso "
                    "for seguro para você."
                ),
                (
                    "A hidratação contínua é uma medida padrão de segurança "
                    "contra o calor."
                ),
            ),
            "stay_in_cool_space": (
                (
                    "Passe as próximas horas no espaço adequado mais fresco "
                    "disponível."
                ),
                "Isso reduz a exposição contínua ao calor.",
            ),
            "check_updated_weather": (
                (
                    "Consulte informações meteorológicas atualizadas de uma "
                    "fonte confiável."
                ),
                (
                    "As condições derivadas de modelos podem mudar depois "
                    "desta resposta."
                ),
            ),
            "check_on_household_members": (
                (
                    "Verifique as pessoas da sua residência que possam "
                    "precisar de ajuda para se manter frescas."
                ),
                (
                    "Esta ação se aplica apenas como uma verificação geral da "
                    "residência."
                ),
            ),
            "prepare_for_tonight": (
                (
                    "Prepare o espaço mais fresco disponível para dormir "
                    "antes do anoitecer."
                ),
                (
                    "A preparação antecipada pode tornar o ambiente noturno "
                    "mais seguro."
                ),
            ),
        }
    ),
    tonight_actions=MappingProxyType(
        {
            "ventilate_when_outside_is_cooler": (
                (
                    "Ventile somente quando o ar externo estiver mais fresco "
                    "do que o ambiente interno."
                ),
                (
                    "Isso evita pressupor que abrir as janelas sempre reduz a "
                    "temperatura."
                ),
            ),
            "sleep_in_coolest_available_room": (
                (
                    "Use o cômodo adequado mais fresco disponível para "
                    "dormir."
                ),
                "Isso reduz a exposição ao calor durante a noite.",
            ),
            "keep_water_nearby": (
                (
                    "Mantenha água por perto durante a noite, se isso for "
                    "seguro para você."
                ),
                "Isso facilita a manutenção da hidratação.",
            ),
            "check_updated_weather_tonight": (
                (
                    "Consulte informações meteorológicas noturnas atualizadas "
                    "de uma fonte confiável."
                ),
                (
                    "Este plano não prevê condições posteriores nem alertas "
                    "oficiais."
                ),
            ),
        }
    ),
    bring_items=MappingProxyType(
        {
            "water": "Água",
            "phone": "Um telefone carregado",
            "keys": "Chaves",
            "light_clothing": "Roupas leves",
        }
    ),
    explanations=MappingProxyType(
        {
            "forecast_at_or_above_36c": (
                "A temperatura máxima do mesmo dia derivada de modelos atinge "
                "o limite de 36.0°C da política da HeatRelay."
            ),
            "forecast_at_or_above_34c": (
                "A temperatura máxima do mesmo dia derivada de modelos atinge "
                "o limite de 34.0°C da política da HeatRelay."
            ),
            "reported_vulnerability": (
                "O perfil extraído contém um fator de vulnerabilidade "
                "relatado explicitamente."
            ),
            "no_home_cooling": (
                "O perfil extraído relata explicitamente a ausência de "
                "refrigeração em casa."
            ),
            "temporary_or_unsheltered_housing": (
                "O perfil extraído relata explicitamente uma moradia "
                "temporária ou uma situação sem abrigo."
            ),
            "reported_mobility_constraint": (
                "O perfil extraído contém uma restrição de mobilidade "
                "relatada explicitamente."
            ),
            "verified_open_candidate": (
                "Foi verificado que o local selecionado estava aberto no "
                "instante de avaliação controlado pelo servidor."
            ),
            "travel_support_required": (
                "O perfil extraído relata explicitamente que não é possível "
                "se deslocar sem companhia."
            ),
            "movement_prohibited": (
                "O perfil extraído relata explicitamente que não é possível "
                "sair neste momento."
            ),
            "unresolved_travel_constraint": (
                "Não foi possível verificar a compatibilidade do deslocamento "
                "imediato com os fatos mantidos sobre horário ou mobilidade."
            ),
            "baseline_monitoring": (
                "Nenhuma regra superior da política da HeatRelay correspondeu "
                "aos dados delimitados."
            ),
        }
    ),
    normal_notice=(
        "Este é um planejamento informativo de segurança contra o calor, não "
        "aconselhamento médico, uma rota nem garantia de que um local "
        "permanecerá disponível."
    ),
    candidate_explanations=MappingProxyType(
        {
            "matched_candidate": (
                "Os candidatos atenderam aos filtros solicitados de distância "
                "em linha reta, horários de funcionamento verificados e "
                "recursos obrigatórios."
            ),
            "no_candidate": (
                "Nenhum local oficial neste instantâneo atendeu aos filtros "
                "solicitados de distância em linha reta, horários de "
                "funcionamento verificados e recursos obrigatórios. Nenhum "
                "local alternativo foi inventado."
            ),
            "movement_prohibited": (
                "Nenhum candidato para deslocamento é retornado porque a "
                "situação normalizada relata explicitamente que não é possível "
                "sair neste momento."
            ),
            "unresolved_travel_compatibility": (
                "Nenhum candidato para deslocamento imediato é retornado "
                "porque não é possível comprovar, com os fatos mantidos e "
                "controlados pelo servidor, a compatibilidade com a restrição "
                "de horário ou mobilidade relatada explicitamente."
            ),
        }
    ),
    candidate_warnings=MappingProxyType(
        {
            "hours": (
                "Os horários de funcionamento municipais podem mudar; "
                "consulte a fonte oficial antes de se deslocar."
            ),
            "candidate_notice": (
                "Estes são locais candidatos factuais, aprovados pelo backend, "
                "e não recomendações médicas."
            ),
            "distance": (
                "As distâncias são apenas estimativas em linha reta; a "
                "HeatRelay não fornece rotas nem estimativas de tempo de "
                "deslocamento."
            ),
            "reachability": (
                "O fato de um local estar aberto no momento da avaliação não "
                "comprova que seja possível chegar antes do fechamento."
            ),
        }
    ),
    unresolved_travel_notice=(
        "O deslocamento imediato não foi oferecido porque não foi possível "
        "verificar a compatibilidade com uma restrição de horário ou "
        "mobilidade relatada explicitamente."
    ),
)


__all__ = ("BRAZILIAN_PORTUGUESE_ACTION_PLAN_CATALOG",)
