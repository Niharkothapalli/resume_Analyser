import logging
from typing import Any, Dict, Optional
import google.genai as genai_module
from google import genai
from google.genai import types
from google.genai.errors import APIError
from backend.config import settings
from backend.services.base_llm import BaseLLMService

logger = logging.getLogger("careerlens_ai")

class GeminiService(BaseLLMService):
    """
    Service responsible for direct network communication with Google Gemini APIs.
    Implements the BaseLLMService interface for normalized multi-provider support.
    """
    
    FALLBACK_MODELS = [
        "gemini-2.5-flash",
        "gemini-2.0-flash",
        "gemini-1.5-flash",
        "gemini-2.5-pro",
        "gemini-1.5-pro",
    ]
    
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        self.configured_model = settings.GEMINI_MODEL
        self._active_model = None
        self._client = None

    @property
    def provider_name(self) -> str:
        return "gemini"

    @property
    def model_name(self) -> str:
        return self._active_model or self.configured_model

    @property
    def client(self) -> genai.Client:
        """
        Lazily initialize the official google-genai Client.
        """
        if not self.api_key:
            raise ValueError(
                "GEMINI_API_KEY is not configured. "
                "Please add a valid Google Gemini API Key to your backend/.env file."
            )
        
        if self._client is None:
            masked_key = f"{self.api_key[:4]}...{self.api_key[-4:]}" if len(self.api_key) > 8 else "****"
            logger.info(f"Initializing Google GenAI SDK Client (v{getattr(genai_module, '__version__', 'unknown')}) with key: {masked_key}")
            self._client = genai.Client(api_key=self.api_key)
        return self._client

    def mask_key(self) -> str:
        if not self.api_key:
            return "<MISSING>"
        return f"{self.api_key[:4]}...{self.api_key[-4:]}" if len(self.api_key) > 8 else "****"

    def resolve_model(self) -> str:
        """
        Resolves the best available supported model.
        Checks configured_model first, then fallbacks.
        """
        if self._active_model:
            return self._active_model

        candidate_models = [self.configured_model] + [m for m in self.FALLBACK_MODELS if m != self.configured_model]
        
        try:
            available_models = []
            for m in self.client.models.list():
                model_name = getattr(m, 'name', '') or getattr(m, 'model', '')
                if model_name:
                    if model_name.startswith('models/'):
                        model_name = model_name[7:]
                    available_models.append(model_name)
                    
            if available_models:
                logger.info(f"Fetched available models from Gemini API: {available_models}")
                for cand in candidate_models:
                    if cand in available_models:
                        logger.info(f"Selected model '{cand}' from available API models.")
                        self._active_model = cand
                        return cand
                flash_models = [m for m in available_models if 'flash' in m.lower()]
                if flash_models:
                    selected = flash_models[0]
                    logger.info(f"Auto-selected available flash model: '{selected}'")
                    self._active_model = selected
                    return selected
        except Exception as e:
            logger.warning(f"Could not list models directly from API ({e}). Will test candidates directly.")

        self._active_model = self.configured_model
        return self._active_model

    def _build_diagnostic_error(self, err: Exception, action: str) -> str:
        """
        Build rich, detailed diagnostic error message for authentication or API failures.
        """
        status_code = getattr(err, 'code', getattr(err, 'status_code', 'N/A'))
        error_body = getattr(err, 'message', str(err))
        details = getattr(err, 'details', None)
        
        diag = (
            f"Google Gemini API error during {action}:\n"
            f"- SDK Version: {getattr(genai_module, '__version__', 'unknown')}\n"
            f"- Endpoint: https://generativelanguage.googleapis.com\n"
            f"- Auth Mode: API Key\n"
            f"- Masked Key: {self.mask_key()}\n"
            f"- Model Tried: {self._active_model or self.configured_model}\n"
            f"- HTTP Status Code: {status_code}\n"
            f"- Error Detail: {error_body}\n"
        )
        if details:
            diag += f"- Full Error Details: {details}\n"
        return diag

    def generate_structured_response(self, prompt: str, system_instruction: str, response_schema: Optional[Any] = None) -> Dict[str, Any]:
        """
        Send a request to Gemini requiring a JSON response. Returns normalized dict.
        """
        model = self.resolve_model()
        logger.info(f"Submitting structured response request to Gemini using model: {model}")
        
        config = types.GenerateContentConfig(
            system_instruction=system_instruction,
            response_mime_type="application/json",
            response_schema=response_schema,
            temperature=0.1,
        )

        try:
            response = self.client.models.generate_content(
                model=model,
                contents=prompt,
                config=config
            )
            raw_text = response.text.strip()
            if raw_text.startswith("```json"):
                raw_text = raw_text.split("```json")[1].split("```")[0].strip()
            elif raw_text.startswith("```"):
                raw_text = raw_text.split("```")[1].split("```")[0].strip()

            return {
                "provider": self.provider_name,
                "model": model,
                "text": raw_text,
                "usage": {}
            }
        except APIError as api_err:
            diag = self._build_diagnostic_error(api_err, "structured analysis")
            logger.error(diag, exc_info=True)
            raise RuntimeError(diag)
        except Exception as e:
            diag = self._build_diagnostic_error(e, "structured analysis")
            logger.error(diag, exc_info=True)
            raise RuntimeError(diag)

    def generate_chat_response(self, prompt: str, system_instruction: str) -> Dict[str, Any]:
        """
        Send a request to Gemini for conversational chat. Returns normalized dict.
        """
        model = self.resolve_model()
        logger.info(f"Submitting conversational chat request to Gemini using model: {model}")
        
        config = types.GenerateContentConfig(
            system_instruction=system_instruction,
            temperature=0.4,
        )

        try:
            response = self.client.models.generate_content(
                model=model,
                contents=prompt,
                config=config
            )
            return {
                "provider": self.provider_name,
                "model": model,
                "text": response.text.strip(),
                "usage": {}
            }
        except APIError as api_err:
            diag = self._build_diagnostic_error(api_err, "chat response")
            logger.error(diag, exc_info=True)
            raise RuntimeError(diag)
        except Exception as e:
            diag = self._build_diagnostic_error(e, "chat response")
            logger.error(diag, exc_info=True)
            raise RuntimeError(diag)

    def health_check(self) -> Dict[str, Any]:
        """
        Lightweight health probe.
        """
        try:
            _ = self.client
            return {
                "status": "connected",
                "provider": self.provider_name,
                "model": self.configured_model,
                "details": "Client initialized successfully"
            }
        except Exception as e:
            return {
                "status": "error",
                "provider": self.provider_name,
                "model": self.configured_model,
                "details": str(e)
            }


