import sys
import os
import platform
from pathlib import Path

# Add project root to sys.path to enable backend package imports
BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

import google.genai as genai_module
from google import genai
from google.genai.errors import APIError
from backend.config import settings

def mask_key(key: str) -> str:
    if not key:
        return "<MISSING>"
    if len(key) <= 8:
        return "****"
    return f"{key[:4]}....{key[-4:]}"

def run_diagnostics():
    print("=" * 70)
    print("CAREERLENS AI - GEMINI AUTHENTICATION DIAGNOSTIC REPORT")
    print("=" * 70)
    
    # 1. Environment & SDK Verification
    python_exe = sys.executable
    venv_path = sys.prefix
    os_name = f"{platform.system()} {platform.release()} ({platform.version()})"
    sdk_version = getattr(genai_module, "__version__", "unknown")
    
    print(f"1. ENVIRONMENT & SDK VERIFICATION:")
    print(f"   - Python Executable: {python_exe}")
    print(f"   - Virtual Environment: {venv_path}")
    print(f"   - Operating System: {os_name}")
    print(f"   - google-genai SDK Version: {sdk_version}")
    print(f"   - Python Version: {platform.python_version()}")
    
    is_backend_venv = "backend\\.venv" in venv_path or "backend/.venv" in venv_path
    print(f"   - Using Backend .venv: {'YES' if is_backend_venv else 'NO (Warning: custom path)'}")
    print()

    # 2. Environment Variables Audit
    api_key = settings.GEMINI_API_KEY
    model_name = settings.GEMINI_MODEL
    prompt_version = settings.PROMPT_VERSION
    key_source = getattr(settings, 'KEY_SOURCE', 'Environment')
    masked_key = mask_key(api_key)

    print(f"2. ENVIRONMENT VARIABLES AUDIT:")
    print(f"   - GEMINI_API_KEY Source: {key_source}")
    print(f"   - GEMINI_API_KEY (Masked): {masked_key}")
    print(f"   - GEMINI_MODEL: {model_name}")
    print(f"   - PROMPT_VERSION: {prompt_version}")
    
    if not api_key:
        print("   [CRITICAL ERROR]: GEMINI_API_KEY is missing!")
        print("   Exiting diagnostic with failure.")
        sys.exit(1)
        
    print()

    # 3. Gemini Client Initialization
    print(f"3. GEMINI CLIENT INITIALIZATION:")
    print(f"   - Initializing genai.Client(api_key='{masked_key}')...")
    try:
        client = genai.Client(api_key=api_key)
        print("   - Client initialized successfully.")
    except Exception as e:
        print(f"   [INITIALIZATION ERROR]: Failed to create Client object: {e}")
        sys.exit(1)

    print()

    # 4. Model Capabilities & Verification
    print(f"4. MODEL DISCOVERY & SELECTION:")
    active_model = model_name
    try:
        models = list(client.models.list())
        available_names = []
        for m in models:
            name = getattr(m, 'name', '') or getattr(m, 'model', '')
            if name.startswith("models/"):
                name = name[7:]
            available_names.append(name)
            
        print(f"   - Total API Models Available: {len(available_names)}")
        if model_name in available_names:
            print(f"   - Configured model '{model_name}' is VALID and AVAILABLE.")
            active_model = model_name
        else:
            flash_models = [m for m in available_names if 'flash' in m.lower()]
            if flash_models:
                active_model = flash_models[0]
                print(f"   - Configured model '{model_name}' not listed. Auto-selecting flash model: '{active_model}'")
            else:
                active_model = available_names[0] if available_names else model_name
                print(f"   - Configured model '{model_name}' not listed. Fallback model: '{active_model}'")
    except Exception as e:
        print(f"   - [NOTICE]: Model discovery query skipped or failed ({e}). Proceeding with model '{model_name}'.")

    print()

    # 5. Live Authentication & Communication Test
    print(f"5. AUTHENTICATION & INFERENCE TEST:")
    print(f"   - Sending prompt 'Say Hello' to model '{active_model}'...")
    
    try:
        response = client.models.generate_content(
            model=active_model,
            contents="Say Hello"
        )
        response_text = response.text.strip()
        print("=" * 70)
        print("   [SUCCESS]: GEMINI AUTHENTICATION AND TEST CALL SUCCEEDED!")
        print(f"   - Gemini Response: \"{response_text}\"")
        print("=" * 70)
        return True
    except APIError as api_err:
        print("=" * 70)
        print("   [AUTHENTICATION / API FAILURE DIAGNOSTICS]")
        print("=" * 70)
        status_code = getattr(api_err, 'code', getattr(api_err, 'status_code', '401/400'))
        message = getattr(api_err, 'message', str(api_err))
        details = getattr(api_err, 'details', None)
        
        print(f"   - HTTP Status Code: {status_code}")
        print(f"   - Error Reason: {message}")
        print(f"   - Authentication Mode: API Key (x-goog-api-key)")
        print(f"   - Target Endpoint: https://generativelanguage.googleapis.com/v1beta/models/{active_model}:generateContent")
        print(f"   - SDK Version: {sdk_version}")
        print(f"   - Masked API Key Sent: {masked_key}")
        if details:
            print(f"   - Full Error Details: {details}")
        print("=" * 70)
        sys.exit(1)
    except Exception as e:
        print("=" * 70)
        print("   [UNEXPECTED FAILURE DIAGNOSTICS]")
        print("=" * 70)
        print(f"   - Error Type: {type(e).__name__}")
        print(f"   - Error Message: {str(e)}")
        print(f"   - SDK Version: {sdk_version}")
        print(f"   - Target Endpoint: https://generativelanguage.googleapis.com")
        print(f"   - Authentication Mode: API Key")
        print(f"   - Masked API Key Sent: {masked_key}")
        print("=" * 70)
        sys.exit(1)

if __name__ == "__main__":
    run_diagnostics()
