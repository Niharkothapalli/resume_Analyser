import logging
from typing import Dict, Optional, Type
from backend.config import settings
from backend.services.base_llm import BaseLLMService
from backend.services.cohere_service import CohereService
from backend.services.gemini_service import GeminiService

logger = logging.getLogger("careerlens_ai")

class LLMFactory:
    """
    Factory for instantiating and managing LLM providers.
    Supports multi-provider architecture (Cohere, Gemini) and extensible
    for future providers (OpenAI, Groq, Anthropic).
    """

    _registry: Dict[str, Type[BaseLLMService]] = {
        "cohere": CohereService,
        "gemini": GeminiService,
    }

    _instances: Dict[str, BaseLLMService] = {}

    @classmethod
    def register_provider(cls, name: str, service_cls: Type[BaseLLMService]) -> None:
        """
        Registers a new LLM provider class into the factory registry.
        """
        cls._registry[name.lower()] = service_cls
        logger.info(f"Registered LLM provider: {name}")

    @classmethod
    def get_service(cls, provider_name: Optional[str] = None) -> BaseLLMService:
        """
        Retrieves or instantiates the LLM provider service based on parameter
        or configuration settings.LLM_PROVIDER.
        """
        target_provider = (
            provider_name or getattr(settings, "LLM_PROVIDER", "")
        ).strip().lower()

        if not target_provider:
            raise ValueError(
                "LLM provider is not specified and LLM_PROVIDER in settings is empty. "
                "Please configure LLM_PROVIDER in backend/.env"
            )

        if target_provider in cls._instances:
            return cls._instances[target_provider]

        if target_provider in cls._registry:
            logger.info(f"Instantiating LLM provider service: '{target_provider}'")
            service_class = cls._registry[target_provider]
            instance = service_class()
            cls._instances[target_provider] = instance
            return instance

        # Check for future/unimplemented providers
        future_providers = ["openai", "groq", "anthropic"]
        if target_provider in future_providers:
            raise NotImplementedError(
                f"LLM provider '{target_provider}' is planned for future release but not yet implemented. "
                "Currently supported providers are: 'cohere' and 'gemini'."
            )

        raise ValueError(
            f"Unsupported LLM provider '{target_provider}'. "
            f"Available providers: {list(cls._registry.keys())}"
        )

def get_llm_service(provider_name: Optional[str] = None) -> BaseLLMService:
    """
    Convenience module-level helper to obtain the active LLM service.
    """
    return LLMFactory.get_service(provider_name)
