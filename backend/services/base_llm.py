from abc import ABC, abstractmethod
from typing import Dict, Any, Optional

class BaseLLMService(ABC):
    """
    Abstract base class for LLM providers.
    LLM services implement this standard interface and return normalized response dictionaries.
    """

    @property
    @abstractmethod
    def provider_name(self) -> str:
        """Returns the lower-case unique name of the LLM provider (e.g. 'cohere')."""
        pass

    @property
    @abstractmethod
    def model_name(self) -> str:
        """Returns the model identifier currently in use."""
        pass

    @abstractmethod
    def generate_structured_response(
        self, prompt: str, system_instruction: str, response_schema: Optional[Any] = None
    ) -> Dict[str, Any]:
        """
        Sends a structured completion request requiring a JSON response.
        Returns a normalized dictionary structure:
        {
            "provider": str,
            "model": str,
            "text": str (valid JSON content),
            "usage": dict
        }
        """
        pass

    @abstractmethod
    def generate_chat_response(
        self, prompt: str, system_instruction: str
    ) -> Dict[str, Any]:
        """
        Sends a conversational chat request.
        Returns a normalized dictionary structure:
        {
            "provider": str,
            "model": str,
            "text": str (conversational answer),
            "usage": dict
        }
        """
        pass

    @abstractmethod
    def health_check(self) -> Dict[str, Any]:
        """
        Performs a lightweight sanity check / ping to confirm API connectivity and authentication.
        Returns:
        {
            "status": "connected" | "error",
            "provider": str,
            "model": str,
            "details": str
        }
        """
        pass
