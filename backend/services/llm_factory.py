import logging
from typing import Optional
from backend.services.base_llm import BaseLLMService
from backend.services.cohere_service import CohereService

logger = logging.getLogger("careerlens_ai")

class LLMFactory:
    """
    Factory for instantiating and managing LLM service (Cohere).
    """

    _instance: Optional[CohereService] = None

    @classmethod
    def get_service(cls, provider_name: Optional[str] = None) -> BaseLLMService:
        """
        Retrieves singleton instance of CohereService.
        """
        if cls._instance is None:
            logger.info("Instantiating singleton CohereService")
            cls._instance = CohereService()
        return cls._instance


def get_llm_service(provider_name: Optional[str] = None) -> BaseLLMService:
    """
    Convenience module-level helper to obtain the active LLM service.
    """
    return LLMFactory.get_service(provider_name)

