"""Backend-owned input-language and action-plan output-locale contracts."""

from typing import Literal, cast


SupportedInputLanguage = Literal[
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
]
SUPPORTED_INPUT_LANGUAGES: tuple[SupportedInputLanguage, ...] = (
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
)

DetectedInputLanguage = SupportedInputLanguage | Literal["other", "unknown"]
PreferredLanguageValue = SupportedInputLanguage | Literal["other"]
InputLanguageSource = Literal["automatically_detected", "fallback"]

OutputLocale = Literal[
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
]
SUPPORTED_OUTPUT_LOCALES: tuple[OutputLocale, ...] = (
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
)
DEFAULT_OUTPUT_LOCALE: OutputLocale = "en"


def derive_input_language_source(value: object) -> InputLanguageSource:
    """Derive the public source from one exact detected-language value."""

    if type(value) is not str:
        raise ValueError("unsupported detected input language")
    if value == "unknown":
        return "fallback"
    if value == "other" or value in SUPPORTED_INPUT_LANGUAGES:
        return "automatically_detected"
    raise ValueError("unsupported detected input language")


def require_supported_output_locale(value: object) -> OutputLocale:
    """Return the exact supported locale or fail without normalization."""

    if type(value) is not str or value not in SUPPORTED_OUTPUT_LOCALES:
        raise ValueError("unsupported action-plan output locale")
    return cast(OutputLocale, value)
