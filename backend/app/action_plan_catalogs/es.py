"""Deterministic Spanish action-plan output catalog."""

from types import MappingProxyType

from backend.app.action_plan_catalogs import ActionPlanCatalog


SPANISH_ACTION_PLAN_CATALOG = ActionPlanCatalog(
    policy_notice=(
        "HeatRelay aplica heurísticas transparentes de la política de "
        "Barcelona a datos acotados sobre la situación y, en casos no "
        "urgentes, al contexto meteorológico derivado de modelos. Esto no "
        "demuestra que se haya activado un aviso oficial ni una emergencia."
    ),
    policy_rules=(
        (
            "Utiliza los umbrales diurnos publicados de 34.0°C y 36.0°C "
            "únicamente como heurísticas versionadas de la política de "
            "HeatRelay aplicadas a la temperatura máxima del mismo día "
            "derivada de modelos, nunca como prueba de activación municipal."
        ),
        (
            "Mantén la advertencia de comprobar el horario y nunca ofrezcas "
            "un refugio climático como sustituto de la atención médica."
        ),
        (
            "Un síntoma de alarma acotado del que se ha informado "
            "explícitamente activa la rama urgente y omite los procesos "
            "normales de meteorología, lugares y generación del plan."
        ),
        (
            "Dirige todos los valores del catálogo cerrado actual de síntomas "
            "de alarma acotados al contenido fijo de contacto con el 112, "
            "gestionado por el backend."
        ),
        (
            "Mantén el resultado informativo y determinista; no diagnostiques "
            "ni crees una puntuación de riesgo médico. Ofrece refrigeración "
            "exclusivamente con el ventilador del que se ha informado solo "
            "cuando tanto la temperatura actual como la máxima del mismo día "
            "estén estrictamente por debajo de 40.0°C."
        ),
    ),
    situation_notice=(
        "Este resultado es un resumen estructurado de la información indicada "
        "explícitamente. No es asesoramiento médico, una evaluación de "
        "emergencia ni un plan de acción."
    ),
    weather_notice=(
        "Este es un contexto meteorológico derivado de modelos de Open-Meteo, "
        "no un aviso oficial por calor."
    ),
    urgent_contact_instruction=(
        "Llama al 112 ahora para solicitar asistencia de emergencia."
    ),
    urgent_actions=MappingProxyType(
        {
            "contact_emergency_service_now": "Llama al 112 ahora.",
            "do_not_use_shelter_as_medical_substitute": (
                "Los refugios climáticos no sustituyen la atención médica."
            ),
        }
    ),
    urgent_notices=(
        "Los refugios climáticos no sustituyen la atención médica.",
        (
            "Como se informó explícitamente de un síntoma de alarma incluido "
            "en el catálogo cerrado, HeatRelay no consultó datos "
            "meteorológicos ni lugares y no pidió a GPT-5.6 que generara un "
            "plan."
        ),
    ),
    now_actions=MappingProxyType(
        {
            "move_to_cooler_space": (
                "Ve al lugar más fresco disponible donde ya te encuentres.",
                (
                    "Reducir la exposición al calor resulta útil sin dar por "
                    "hecho que sea posible desplazarse."
                ),
            ),
            "reduce_physical_effort": (
                "Reduce el esfuerzo físico por ahora.",
                "Un menor esfuerzo puede reducir la carga térmica adicional.",
            ),
            "drink_water": (
                "Bebe agua con regularidad si puedes hacerlo de forma segura.",
                (
                    "La hidratación es una medida habitual de seguridad ante "
                    "el calor."
                ),
            ),
            "use_available_home_cooling": (
                (
                    "Utiliza el equipo de refrigeración que indicaste "
                    "explícitamente que tenías."
                ),
                (
                    "Esta acción se basa únicamente en el acceso a "
                    "refrigeración del que se ha informado."
                ),
            ),
            "contact_support_person": (
                (
                    "Ponte en contacto con una persona de confianza antes de "
                    "plantearte desplazarte."
                ),
                (
                    "Las limitaciones indicadas señalan que desplazarte sin "
                    "compañía no es adecuado."
                ),
            ),
            "remain_at_current_location": (
                (
                    "Permanece en tu ubicación actual y toma medidas para "
                    "refrescarte que no requieran desplazarte."
                ),
                "Una limitación indicada impide salir en este momento.",
            ),
            "travel_to_selected_place": (
                (
                    "Considera el candidato seleccionado y verificado como "
                    "abierto solo después de comprobar su horario actual."
                ),
                (
                    "El lugar formaba parte del conjunto de candidatos "
                    "aprobado por el backend para esta solicitud."
                ),
            ),
        }
    ),
    next_few_hours_actions=MappingProxyType(
        {
            "keep_drinking_water": (
                (
                    "Ten agua disponible y bebe con regularidad si es seguro "
                    "para ti."
                ),
                (
                    "La hidratación continua es una medida habitual de "
                    "seguridad ante el calor."
                ),
            ),
            "stay_in_cool_space": (
                (
                    "Pasa las próximas horas en el espacio adecuado más "
                    "fresco disponible."
                ),
                "Esto reduce la exposición continuada al calor.",
            ),
            "check_updated_weather": (
                (
                    "Consulta información meteorológica actualizada de una "
                    "fuente fiable."
                ),
                (
                    "Las condiciones derivadas de modelos pueden cambiar "
                    "después de esta respuesta."
                ),
            ),
            "check_on_household_members": (
                (
                    "Comprueba cómo están las personas de tu hogar que puedan "
                    "necesitar ayuda para mantenerse frescas."
                ),
                (
                    "Esta acción solo se aplica como comprobación general del "
                    "hogar."
                ),
            ),
            "prepare_for_tonight": (
                (
                    "Prepara antes del anochecer el espacio más fresco "
                    "disponible para dormir."
                ),
                (
                    "Prepararlo con antelación puede hacer más seguro el "
                    "entorno nocturno."
                ),
            ),
        }
    ),
    tonight_actions=MappingProxyType(
        {
            "ventilate_when_outside_is_cooler": (
                (
                    "Ventila solo cuando el aire exterior esté más fresco que "
                    "el interior."
                ),
                (
                    "Esto evita dar por hecho que abrir las ventanas siempre "
                    "refresca."
                ),
            ),
            "sleep_in_coolest_available_room": (
                (
                    "Utiliza para dormir la habitación más fresca y adecuada "
                    "que esté disponible."
                ),
                "Esto reduce la exposición al calor durante la noche.",
            ),
            "keep_water_nearby": (
                "Ten agua cerca durante la noche si es seguro para ti.",
                "Esto facilita mantener la hidratación.",
            ),
            "check_updated_weather_tonight": (
                (
                    "Consulta información meteorológica nocturna actualizada "
                    "de una fuente fiable."
                ),
                (
                    "Este plan no predice las condiciones posteriores ni los "
                    "avisos oficiales."
                ),
            ),
        }
    ),
    bring_items=MappingProxyType(
        {
            "water": "Agua",
            "phone": "Un teléfono cargado",
            "keys": "Llaves",
            "light_clothing": "Ropa ligera",
        }
    ),
    explanations=MappingProxyType(
        {
            "forecast_at_or_above_36c": (
                "La temperatura máxima del mismo día derivada de modelos "
                "alcanza el umbral de 36.0°C de la política de HeatRelay."
            ),
            "forecast_at_or_above_34c": (
                "La temperatura máxima del mismo día derivada de modelos "
                "alcanza el umbral de 34.0°C de la política de HeatRelay."
            ),
            "reported_vulnerability": (
                "El perfil extraído contiene un factor de vulnerabilidad "
                "indicado explícitamente."
            ),
            "no_home_cooling": (
                "El perfil extraído indica explícitamente que no hay "
                "refrigeración en el hogar."
            ),
            "temporary_or_unsheltered_housing": (
                "El perfil extraído indica explícitamente un alojamiento "
                "temporal o una situación sin alojamiento."
            ),
            "reported_mobility_constraint": (
                "El perfil extraído contiene una limitación de movilidad "
                "indicada explícitamente."
            ),
            "verified_open_candidate": (
                "Se verificó que el lugar seleccionado estaba abierto en el "
                "instante de evaluación establecido por el servidor."
            ),
            "travel_support_required": (
                "El perfil extraído indica explícitamente que no es posible "
                "desplazarse sin compañía."
            ),
            "movement_prohibited": (
                "El perfil extraído indica explícitamente que no es posible "
                "salir en este momento."
            ),
            "unresolved_travel_constraint": (
                "No se pudo verificar la compatibilidad del desplazamiento "
                "inmediato a partir de los datos conservados sobre el tiempo "
                "o la movilidad."
            ),
            "baseline_monitoring": (
                "Ninguna regla de nivel superior de la política de HeatRelay "
                "coincidió con las entradas acotadas."
            ),
        }
    ),
    normal_notice=(
        "Este plan informativo de seguridad ante el calor no es asesoramiento "
        "médico ni una ruta, y tampoco garantiza que un lugar siga "
        "disponible."
    ),
    candidate_explanations=MappingProxyType(
        {
            "matched_candidate": (
                "Los candidatos cumplieron los filtros de distancia "
                "solicitada en línea recta, horario de apertura verificado y "
                "características requeridas."
            ),
            "no_candidate": (
                "Ningún lugar oficial de esta instantánea cumplió los filtros "
                "de distancia solicitada en línea recta, horario de apertura "
                "verificado y características requeridas. No se inventó "
                "ningún lugar alternativo."
            ),
            "movement_prohibited": (
                "No se devuelve ningún candidato para desplazarse porque la "
                "situación normalizada indica explícitamente que no es "
                "posible salir en este momento."
            ),
            "unresolved_travel_compatibility": (
                "No se devuelve ningún candidato para un desplazamiento "
                "inmediato porque no se puede demostrar, a partir de los "
                "datos conservados por el servidor, la compatibilidad con la "
                "limitación de tiempo o movilidad indicada explícitamente."
            ),
        }
    ),
    candidate_warnings=MappingProxyType(
        {
            "hours": (
                "Los horarios municipales pueden cambiar; comprueba la "
                "fuente oficial antes de desplazarte."
            ),
            "candidate_notice": (
                "Estos son lugares candidatos factuales aprobados por el "
                "backend, no recomendaciones médicas."
            ),
            "distance": (
                "Las distancias son únicamente estimaciones en línea recta; "
                "HeatRelay no proporciona rutas ni estimaciones del tiempo "
                "de desplazamiento."
            ),
            "reachability": (
                "Que un lugar esté abierto en el momento de la evaluación no "
                "demuestra que se pueda llegar antes de que cierre."
            ),
        }
    ),
    unresolved_travel_notice=(
        "No se ofreció el desplazamiento inmediato porque no se pudo "
        "verificar la compatibilidad con una limitación de tiempo o movilidad "
        "indicada explícitamente."
    ),
)


__all__ = ("SPANISH_ACTION_PLAN_CATALOG",)
