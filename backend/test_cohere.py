import sys
import os
import platform
from pathlib import Path

# Add project root to sys.path to enable backend package imports
BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

import cohere
from backend.config import settings

def mask_key(key: str) -> str:
    if not key:
        return "<MISSING>"
    if len(key) <= 8:
        return "****"
    return f"{key[:4]}....{key[-4:]}"

def run_diagnostics():
    print("=" * 70)
    print("CAREERLENS AI - COHERE AUTHENTICATION & INFERENCE DIAGNOSTIC")
    print("=" * 70)
    
    # 1. Environment & SDK Verification
    python_exe = sys.executable
    venv_path = sys.prefix
    os_name = f"{platform.system()} {platform.release()} ({platform.version()})"
    sdk_version = getattr(cohere, "__version__", "unknown")
    
    print(f"1. ENVIRONMENT & SDK VERIFICATION:")
    print(f"   - Python Executable: {python_exe}")
    print(f"   - Virtual Environment: {venv_path}")
    print(f"   - Operating System: {os_name}")
    print(f"   - cohere SDK Version: {sdk_version}")
    print(f"   - Python Version: {platform.python_version()}")
    
    is_backend_venv = "backend\\.venv" in venv_path or "backend/.venv" in venv_path
    print(f"   - Using Backend .venv: {'YES' if is_backend_venv else 'NO'}")
    print()

    # 2. Environment Variables Audit
    api_key = settings.COHERE_API_KEY
    model_name = settings.COHERE_MODEL
    prompt_version = settings.PROMPT_VERSION
    masked_key = mask_key(api_key)

    print(f"2. ENVIRONMENT VARIABLES AUDIT:")
    print(f"   - LLM_PROVIDER: {settings.LLM_PROVIDER}")
    print(f"   - COHERE_API_KEY (Masked): {masked_key}")
    print(f"   - COHERE_MODEL: {model_name}")
    print(f"   - PROMPT_VERSION: {prompt_version}")
    
    if not api_key:
        print("   [CRITICAL ERROR]: COHERE_API_KEY is missing!")
        print("   Exiting diagnostic with failure.")
        sys.exit(1)
        
    print()

    # 3. Cohere Client Initialization
    print(f"3. COHERE CLIENT INITIALIZATION:")
    print(f"   - Initializing cohere.ClientV2(api_key='{masked_key}')...")
    try:
        client = cohere.ClientV2(api_key=api_key)
        print("   - Client initialized successfully.")
    except Exception as e:
        print(f"   [INITIALIZATION ERROR]: Failed to create Client object: {e}")
        sys.exit(1)

    print()

    # 4. Authentication & Inference Test
    print(f"4. AUTHENTICATION & INFERENCE TEST:")
    print(f"   - Sending prompt 'Say Hello' to model '{model_name}'...")
    
    try:
        response = client.chat(
            model=model_name,
            messages=[{"role": "user", "content": "Say Hello"}],
            temperature=0.3
        )
        response_text = ""
        if response.message and response.message.content:
            for block in response.message.content:
                if hasattr(block, "text"):
                    response_text += block.text
                    
        response_text = response_text.strip()
        print("=" * 70)
        print("SUCCESS")
        print(f"   - Cohere Response: \"{response_text}\"")
        print("=" * 70)
        return True
    except Exception as e:
        print("=" * 70)
        print("   [AUTHENTICATION / API FAILURE DIAGNOSTICS]")
        print("=" * 70)
        print(f"   - Error Type: {type(e).__name__}")
        print(f"   - Error Detail: {str(e)}")
        print(f"   - Target Model: {model_name}")
        print(f"   - Masked API Key Sent: {masked_key}")
        print("=" * 70)
        sys.exit(1)

if __name__ == "__main__":
    run_diagnostics()
