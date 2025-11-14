# 🚀 RAG Scraper: Your Personal Contextual Chatbot! 🤖

Ever wished you had a super-smart friend who read a webpage for you and could answer *anything* about it, instantly? Meet RAG Scraper! This awesome two-stage RAG (Retrieval-Augmented Generation) app lets you feed it a public URL, then unleash a chatbot that knows *only* what's on that page. It's like giving your AI a laser focus!

We've packed this whole experience into one neat little package: a FastAPI backend serving a single, dependency-free `index.html`. That means all the snazzy UI, animations, and chat bubbles are right there, ready to rock your world with pure vanilla HTML, CSS, and JS. No complex frontend frameworks here, just good old web magic! ✨

---

## ✨ Super-Duper Features!

* **⚡ Blazing Fast 2-Stage UI:** Go from pasting a URL to chatting in a flash, all on one seamless page! No annoying reloads, just pure flow.
* **🔒 Context-Locked Chat Magic:** Our chatbot is a loyal reader! It **only** talks about the page you gave it. No more AI hallucinating facts from the internet – just pure, unadulterated source-based wisdom.
* **👻 Stateless & Spunky Backend:** Our FastAPI backend is a lightweight champ! It serves the UI and orchestrates the RAG dance, but all the heavy lifting for vector storage is offloaded to Qdrant Cloud. Lean, mean, and ready to scale!
* **🧠 Brainy RAG Pipeline:** Powered by the smarts of Google Gemini! We're using `gemini-2.5-flash` for super-speedy, high-quality answers and `text-embedding-004` to make sure our AI understands your text with cutting-edge precision.
* **🕸️ Web-Scraping Wizardry:** Thanks to `r.jina.ai`, we can gobble up text from any public URL and get it prepped for our chatbot in no time. Think of it as a digital vacuum cleaner for web content!

---

## 🛠️ The Awesome Tech Stack!

Here's a peek under the hood at the cool tech making RAG Scraper tick!

| Category | Technology | What it Does! |
| :------- | :-------- | :---------------------------------------- |
|  **Frontend Fun** | `index.html` | All the visual goodies, animations, and user interaction live here! |
| | Vanilla JavaScript | Makes everything move, groove, and talk to the backend! |
|  **Backend Brains** | Python | The core language that makes it all happen! |
| | FastAPI | Our speedy web framework for serving pages and API endpoints! |
| | Uvicorn | The super-fast server getting our Python code to your browser! |
|  **RAG Powerhouse** | `r.jina.ai` | Our secret weapon for clean, quick web scraping! |
| | Google Gemini (Embeddings) | Turns text into smart numbers for our database! |
| | Qdrant Cloud | Our cloud-based brain for storing and finding text snippets! |
| | Google Gemini (Generation) | The AI that reads the retrieved info and crafts awesome answers! |

---

## 🤯 How This Magic Happens!

It’s a two-step dance, but don’t worry, we’ve made it super smooth!

### 1. Ingestion Phase 📥 (Feeding the Brain!)

1.  **URL Drop!** You paste a public URL into our slick UI.
2.  **Scrape-tastic!** The backend zips off to `r.jina.ai` to grab all the readable text from your chosen page.
3.  **Chop & Embed!** That text gets chopped into bite-sized pieces, and then Google Gemini (`text-embedding-004`) turns each piece into a smart vector (a fancy number representation).
4.  **Qdrant Hoard!** These smart vectors, along with their original text and the source URL, are securely stored in our Qdrant Cloud collection.
5.  **Context Lock!** We quickly jot down your URL in a tiny `.last_ingested_source.txt` file. This tells our chatbot: "Hey, buddy, *this* is your current world!"

### 2. Retrieval (Chat) Phase 💬 (Getting Answers!)

1.  **Ask Away!** You type your burning question into our chat interface.
2.  **Context Check!** The backend peeks at `.last_ingested_source.txt` to remember which page is currently in focus.
3.  **Query Embed!** Your question also gets turned into a smart vector by Google Gemini.
4.  **Smart Search!** We hit up Qdrant Cloud, asking it to find the *most relevant* text snippets that match your question, but **ONLY** from the page we just locked in!
5.  **Gemini's Turn!** We gather those relevant snippets (the "context") and send them, along with your question, to `gemini-2.5-flash`.
6.  **Answer Time!** Gemini whips up an answer, strictly using *only* the context we provided, and sends it back to your chat window! Ta-da!

---

## 🏃‍♀️ Get It Running Locally!

Wanna play with it yourself? Here's how to get RAG Scraper purring on your machine!

1.  **Clone the Coolness:**
    ```bash
    git clone [https://github.com/your-username/rag-scraper-contextual-chatbot.git](https://github.com/your-username/rag-scraper-contextual-chatbot.git) # Replace with actual repo URL
    cd rag-scraper-contextual-chatbot
    ```

2.  **Virtual Environment Voodoo:** (Always a good idea!)
    ```bash
    # For macOS/Linux
    python3 -m venv venv
    source venv/bin/activate

    # For Windows
    python -m venv venv
    .\venv\Scripts\activate
    ```

3.  **Install the Essentials:**
    ```bash
    pip install -r requirements.txt
    ```

4.  **Secret Sauce (Environment Variables):**
    Create a `.env` file in the main folder and fill it with your keys. Don't share these!

    **`.env.example`**
    ```ini
    # Get your FREE key from [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
    GEMINI_API_KEY="your_gemini_ai_studio_api_key"

    # Grab these from your Qdrant Cloud dashboard: [https://cloud.qdrant.io/](https://cloud.qdrant.io/)
    QDRANT_URL="your_qdrant_cloud_cluster_url"
    QDRANT_API_KEY="your_qdrant_cloud_api_key"
    ```

5.  **Fire It Up!**
    ```bash
    uvicorn src.main:app --reload
    ```

6.  **Browse and Chat!**
    Head over to **`http://127.0.0.1:8000`** in your favorite web browser and start scraping & chatting! 🥳

---

## ☁️ Deploying to the Cloud!

RAG Scraper is designed to be a breeze to deploy on platforms like **Render** as a single Web Service!

1.  **New Web Service:** Create one on Render, linking it to your GitHub repo.
2.  **Build Command:** `pip install -r requirements.txt`
3.  **Start Command:** `Start Command: uvicorn src.main:app --host 0.0.0.0 --port 8000`
4.  **Environmental Secrets:** Add your `GOOGLE_API_KEY`, `QDRANT_URL`, and `QDRANT_API_KEY` as secret environment variables in Render's dashboard.

> **⚠️ A Little Heads-Up on Persistence:** Our current setup uses a `.last_ingested_source.txt` file to keep track of the active URL. On cloud platforms like Render, files on the server can disappear when the service restarts or gets updated. This means your chatbot might "forget" the last ingested URL sometimes. For a more robust, always-on solution, you'd want to store this context in a persistent external cache (like Redis) or a tiny database! Just something to keep in mind for future scaling! 😉
