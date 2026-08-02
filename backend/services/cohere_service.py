import logging
from typing import Dict, Any, Optional
import cohere
from backend.config import settings
from backend.services.base_llm import BaseLLMService

logger = logging.getLogger("careerlens_ai")

class CohereService(BaseLLMService):
    """
    Production-grade Cohere Service implementing BaseLLMService interface.
    Manages API communication with Cohere endpoints, structured JSON responses,
    conversational chat, and error diagnostics.
    """

    def __init__(self):
        self.api_key = settings.COHERE_API_KEY
        self.configured_model = settings.COHERE_MODEL
        self._client: Optional[cohere.ClientV2] = None

    @property
    def provider_name(self) -> str:
        return "cohere"

    @property
    def model_name(self) -> str:
        return self.configured_model

    @property
    def client(self) -> cohere.ClientV2:
        """
        Lazily initialize the official Cohere ClientV2 instance.
        """
        if not self.api_key:
            raise ValueError(
                "COHERE_API_KEY is missing. "
                "Please add a valid Cohere API Key to your backend/.env file."
            )

        if self._client is None:
            masked_key = (
                f"{self.api_key[:4]}...{self.api_key[-4:]}"
                if len(self.api_key) > 8
                else "****"
            )
            logger.info(
                f"Initializing Cohere ClientV2 (v{getattr(cohere, '__version__', '7.0.8')}) "
                f"with key: {masked_key} and default model: {self.configured_model}"
            )
            self._client = cohere.ClientV2(api_key=self.api_key)
        return self._client

    def mask_key(self) -> str:
        if not self.api_key:
            return "<MISSING>"
        return (
            f"{self.api_key[:4]}...{self.api_key[-4:]}"
            if len(self.api_key) > 8
            else "****"
        )

    def _build_diagnostic_error(self, err: Exception, action: str) -> str:
        """
        Build rich diagnostic error message for Cohere API failures.
        """
        status_code = getattr(err, "status_code", getattr(err, "code", "N/A"))
        error_body = getattr(err, "message", str(err))

        diag = (
            f"Cohere API error during {action}:\n"
            f"- SDK Version: {getattr(cohere, '__version__', '7.0.8')}\n"
            f"- Provider: cohere\n"
            f"- Masked Key: {self.mask_key()}\n"
            f"- Model Tried: {self.configured_model}\n"
            f"- HTTP Status Code: {status_code}\n"
            f"- Error Detail: {error_body}\n"
        )
        return diag

    def _clean_json_text(self, text: str) -> str:
        """
        Strip markdown code fences (e.g. ```json ... ```) from model output.
        """
        clean = text.strip()
        if clean.startswith("```json"):
            clean = clean.split("```json")[1].split("```")[0].strip()
        elif clean.startswith("```"):
            clean = clean.split("```")[1].split("```")[0].strip()
        return clean

    def generate_structured_response(
        self, prompt: str, system_instruction: str, response_schema: Optional[Any] = None
    ) -> Dict[str, Any]:
        """
        Submit structured JSON request to Cohere using JSON response format.
        """
        logger.info(
            f"Submitting structured response request to Cohere using model: {self.configured_model}"
        )

        messages = [
            {"role": "system", "content": system_instruction},
            {"role": "user", "content": prompt},
        ]

        try:
            response = self.client.chat(
                model=self.configured_model,
                messages=messages,
                response_format={"type": "json_object"},
                temperature=0.1,
            )

            raw_text = ""
            if response.message and response.message.content:
                for block in response.message.content:
                    if hasattr(block, "text"):
                        raw_text += block.text

            clean_text = self._clean_json_text(raw_text)

            usage = {}
            if hasattr(response, "usage") and response.usage:
                usage = {
                    "input_tokens": getattr(response.usage, "input_tokens", None),
                    "output_tokens": getattr(response.usage, "output_tokens", None),
                }

            return {
                "provider": self.provider_name,
                "model": self.configured_model,
                "text": clean_text,
                "usage": usage,
            }
        except Exception as e:
            diag = self._build_diagnostic_error(e, "structured analysis")
            logger.error(diag, exc_info=True)
            raise RuntimeError(diag)

    def generate_chat_response(
        self, prompt: str, system_instruction: str
    ) -> Dict[str, Any]:
        """
        Submit conversational chat request to Cohere.
        """
        logger.info(
            f"Submitting conversational chat request to Cohere using model: {self.configured_model}"
        )

        messages = [
            {"role": "system", "content": system_instruction},
            {"role": "user", "content": prompt},
        ]

        try:
            response = self.client.chat(
                model=self.configured_model,
                messages=messages,
                temperature=0.4,
            )

            raw_text = ""
            if response.message and response.message.content:
                for block in response.message.content:
                    if hasattr(block, "text"):
                        raw_text += block.text

            usage = {}
            if hasattr(response, "usage") and response.usage:
                usage = {
                    "input_tokens": getattr(response.usage, "input_tokens", None),
                    "output_tokens": getattr(response.usage, "output_tokens", None),
                }

            return {
                "provider": self.provider_name,
                "model": self.configured_model,
                "text": raw_text.strip(),
                "usage": usage,
            }
        except Exception as e:
            diag = self._build_diagnostic_error(e, "chat response")
            logger.error(diag, exc_info=True)
            raise RuntimeError(diag)

    def health_check(self) -> Dict[str, Any]:
        """
        Lightweight health check probing Cohere API.
        """
        try:
            _ = self.client
            return {
                "status": "connected",
                "provider": self.provider_name,
                "model": self.configured_model,
                "details": "Client initialized successfully",
            }
        except Exception as e:
            return {
                "status": "error",
                "provider": self.provider_name,
                "model": self.configured_model,
                "details": str(e),
            }
