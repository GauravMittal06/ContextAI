# src/check_env.py
"""
Environment & dependency quick-check for this RAG project.
Run: python src/check_env.py
Exits with code 1 if critical checks fail.
"""

import os
import importlib
import sys

# load .env from project root
try:
    from dotenv import load_dotenv, find_dotenv
    load_dotenv(find_dotenv())
except Exception:
    # If python-dotenv isn't installed, we still continue (will rely on real env vars)
    pass

CRITICAL = []
WARN = []

def has_env(k):
    v = os.getenv(k)
    return bool(v and str(v).strip())

print("=== ENV VARS ===")
envs = [
    ("GEMINI_API_KEY", "Gemini / Google GenAI key (required for embeddings/generation)"),
    ("OPENAI_API_KEY", "OpenAI key (optional fallback)"),
    ("QDRANT_URL", "Qdrant service URL (required)"),
    ("QDRANT_API_KEY", "Qdrant API key (required for cloud instances)"),
    ("QDRANT_COLLECTION", "Qdrant collection name (optional)"),
    ("INGEST_API_KEY", "Ingest API key (required in production)"),
]

for k, desc in envs:
    ok = has_env(k)
    print(f"{k:20s} -> {'SET' if ok else 'MISSING':7s}   ({desc})")
    if k in ("GEMINI_API_KEY", "QDRANT_URL", "QDRANT_API_KEY"):
        if not ok:
            CRITICAL.append(k)

print()

print("=== REQUIRED PYTHON PACKAGES ===")
pkgs = [
    "fastapi",
    "uvicorn",
    "qdrant_client",
    "google",
    "tiktoken",
    "requests",
    "pydantic",
]

for p in pkgs:
    try:
        m = importlib.import_module(p)
        v = getattr(m, "__version__", None) or getattr(m, "VERSION", None) or "ok"
        print(f"{p:15s} -> OK ({v})")
    except Exception as e:
        print(f"{p:15s} -> MISSING ({e.__class__.__name__})")
        if p in ("qdrant_client", "google-genai", "tiktoken"):
            CRITICAL.append(p)
        else:
            WARN.append(p)

print()

# Extra functional checks
print("=== FUNCTIONAL CHECKS ===")

# qdrant client quick connect attempt (no exception -> ok)
try:
    if has_env("QDRANT_URL"):
        from qdrant_client import QdrantClient
        try:
            client = QdrantClient(url=os.getenv("QDRANT_URL"), api_key=os.getenv("QDRANT_API_KEY") or None)
            # harmless check
            _ = client.recommendations if hasattr(client, "recommendations") else True
            print("qdrant_client         -> OK (client constructed)")
        except Exception as e:
            print("qdrant_client         -> FAIL (client connect):", type(e).__name__, e)
            CRITICAL.append("qdrant_client_connect")
    else:
        print("qdrant_client         -> SKIPPED (QDRANT_URL missing)")
except Exception as e:
    print("qdrant_client         -> MISSING or failed import:", type(e).__name__, e)
    CRITICAL.append("qdrant_client")

# genai import check
try:
    from google import genai
    print("google-genai          -> OK")
except Exception as e:
    print("google-genai          -> MISSING or failed to import:", type(e).__name__, e)
    CRITICAL.append("google-genai")

# tiktoken
try:
    import tiktoken
    print("tiktoken              -> OK")
except Exception as e:
    print("tiktoken              -> MISSING (fallback will be used):", type(e).__name__)
    WARN.append("tiktoken")

# quick python version
print("python_version        ->", sys.version.splitlines()[0])

# Summary and exit code
print()
if CRITICAL:
    print("=== CRITICAL ISSUES (must fix) ===")
    for c in CRITICAL:
        print(" -", c)
    print("\nFix the above and re-run this script.")
    sys.exit(1)
else:
    if WARN:
        print("=== Warnings (optional to fix) ===")
        for w in WARN:
            print(" -", w)
    print("All critical checks passed.")
    sys.exit(0)
