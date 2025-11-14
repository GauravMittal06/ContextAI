# 🤖 RAG Scraper: Contextual Chatbot 🕸️

This project is a complete, self-contained **Retrieval-Augmented Generation (RAG)** application. It features a modern, two-stage web interface where a user can first ingest a webpage by providing a URL, and then ask questions that are answered *only* based on the context of that specific webpage.

The backend is built with FastAPI (Python) and the RAG pipeline is powered by Google Gemini and a Qdrant vector database.

![RAG Scraper Demo](https://placehold.co/800x450/0b1220/e6eef8?text=Your+App+Screenshot+Here)

---

## ✨ Features

* **Simple URL Ingestion:** A clean "Stage 1" UI to accept any public URL.
* **Context-Aware Chat:** A "Stage 2" chat interface for asking questions. All answers are strictly limited to the content of the ingested URL.
* **Two-Stage UI:** A modern, animated interface that transitions from a URL input screen to a dedicated chat screen.
* **Stateless Backend:** The FastAPI server is **stateless**. All vector data is stored externally in Qdrant Cloud, making it highly scalable.
* **Single-File Frontend:** The entire user interface (HTML, CSS, and JS) is served from a single `index.html` file for ultimate simplicity.
* **Advanced Settings:** The UI includes a collapsible menu for advanced RAG settings (like setting `k`) and a debug button to view the raw retrieved chunks.

---

## 🛠️ Tech Stack

This project uses a modern, serverless-friendly stack:

| Component | Technology |
| :--- | :--- |
| **Frontend** | ![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white) ![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white) ![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black) |
| **Backend** | ![Python](https://img.shields.io/badge/Python-3776AB?logo=python&logoColor=white) ![FastAPI](https://img.shields.io/badge/FastAPI-009688?logo=fastapi&logoColor=white) ![Uvicorn](https://img.shields.io/badge/Uvicorn-27A7E7?logo=uvicorn&logoColor=white) |
| **RAG Pipeline**| ![Google Gemini](https://img.shields.io/badge/Google_Gemini-8E75C3?logo=google&logoColor=white) ![Qdrant](https://img.shields.io/badge/Qdrant-AC1455?logo=qdrant&logoColor=white) |
| **Scraping** | `r.jina.ai` (Jina AI Reader) |
| **Deployment**| ![Render](https://img.shields.io/badge/Render-46E3B7?logo=render&logoColor=black) ![Git](https://img.shields.io/badge/Git-F05032?logo=git&logoColor=white) |

---

## ⚙️ How It Works

The application operates in two distinct phases:

### Phase 1️⃣: Ingestion
1.  **URL Input:** The user pastes a URL into the "Stage 1" UI and clicks "Ingest".
2.  **Scraping 🕸️:** The FastAPI backend sends the URL to the `r.jina.ai` proxy, which scrapes the webpage and returns clean, readable text.
3.  **Chunking 🧩:** The text is broken down into small, overlapping chunks (using `utils.py`).
4.  **Embedding 🧠:** Each text chunk is sent to the Google Gemini embedding model (`text-embedding-004`) to be converted into a vector.
5.  **Storage 🗄️:** These vectors, along with their source text and metadata, are uploaded and indexed in a Qdrant Cloud database collection.

### Phase 2️⃣: Retrieval (Chat)
1.  **Query Embedding ❓:** The user's question from the chat input is sent to the Gemini embedding model to be converted into a vector.
2.  **Vector Search 🔎:** The application searches the Qdrant database for the `k` most similar text chunks, filtered to *only* include chunks from the last ingested URL.
3.  **Augmentation 📚:** The original question and the retrieved text chunks are combined into a single, comprehensive prompt.
4.  **Generation 💡:** This prompt is sent to the Google Gemini generation model (`gemini-2.5-flash`) with a strict instruction to answer the question *only* using the context provided.
5.  **Response 🗣️:** The final answer is streamed back to the user in the chat UI.

---

## 🖥️ Local Setup & Installation

Follow these steps to run the application on your local machine.

### 1. Prerequisites
* Python 3.10+ 🐍
* Git 🐙
* A Google Gemini API Key 🔑
* A Qdrant Cloud account (free tier) ☁️

### 2. Installation
1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/GauravMittal06/RAG_scraper.git](https://github.com/GauravMittal06/RAG_scraper.git)
    cd RAG_scraper
    ```

2.  **Create and activate a virtual environment:**
    ```bash
    # Windows
    python -m venv .venv
    .venv\Scripts\activate
    ```

3.  **Install dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

### 3. Configuration
1.  Create a `.env` file in the project root.
2.  Fill in your secret keys from Google and Qdrant.

**`.env` File:**
```ini
# --- Google Gemini ---
GEMINI_API_KEY=AIzaSy...

# --- Qdrant Cloud ---
QDRANT_URL=https://...
QDRANT_API_KEY=...
QDRANT_COLLECTION=rag_collection

# --- Server Settings ---
ENV=development
# INGEST_API_KEY is optional, only used if ENV=production
INGEST_API_KEY=...

