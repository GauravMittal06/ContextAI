// web/index.js
const API_BASE = 'http://127.0.0.1:8000';

const urlInput = document.getElementById('urlInput');
const startIngestBtn = document.getElementById('startIngest');
const checkStatusBtn = document.getElementById('checkStatus');
const ingestStatus = document.getElementById('ingestStatus');

const askBtn = document.getElementById('ask');
const debugBtn = document.getElementById('debug');
const questionEl = document.getElementById('question');
const kEl = document.getElementById('k');
const answerEl = document.getElementById('answer');

function setStatus(text, color) {
  ingestStatus.textContent = text;
  ingestStatus.style.color = color || '';
}

startIngestBtn.onclick = async () => {
  const url = urlInput.value.trim();
  if (!url) { alert('Paste a URL first'); return; }
  setStatus('Starting ingest...', 'orange');
  try {
    const res = await fetch(`${API_BASE}/ingest`, {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({url})
    });
    const data = await res.json();
    if (res.ok) {
      setStatus('Ingest started (background). Watch server terminal for logs.', 'green');
    } else {
      setStatus('Failed to start ingest: ' + (data.detail || JSON.stringify(data)), 'red');
    }
  } catch (e) {
    setStatus('Error starting ingest: ' + e.message, 'red');
  }
};

checkStatusBtn.onclick = async () => {
  setStatus('Checking...', 'orange');
  try {
    const res = await fetch(`${API_BASE}/debug_query`, {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ q: "the", k: 1 })
    });
    const data = await res.json();
    if (!res.ok) {
      setStatus('Debug query failed: ' + (data.detail || JSON.stringify(data)), 'red');
      return;
    }
    const retrieved = data.retrieved || data.retrieved || data || [];
    const first = (retrieved.length && (retrieved[0].text_snippet || retrieved[0].document || retrieved[0].text)) ? retrieved[0] : null;
    if (first) {
      setStatus('Ingest appears complete — content available.', 'green');
    } else {
      setStatus('No content found yet — ingest may still be running.', 'orange');
    }
  } catch (e) {
    setStatus('Error checking status: ' + e.message, 'red');
  }
};

async function showAnswerText(text) {
  // Put plain text into answer element. We use textContent to avoid injecting HTML.
  answerEl.textContent = text;
  // Optionally scroll the answer into view and ensure it looks tidy
  answerEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

askBtn.onclick = async () => {
  const q = questionEl.value.trim();
  if (!q) { alert('Type a question'); return; }
  showAnswerText('Loading...');
  try {
    const res = await fetch(`${API_BASE}/query`, {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ q, k: Number(kEl.value) })
    });
    const data = await res.json();
    if (res.ok) {
      showAnswerText(data.answer);
    } else {
      showAnswerText('Error: ' + (data.detail || JSON.stringify(data)));
    }
  } catch (e) {
    showAnswerText('Fetch error: ' + e.message);
  }
};

debugBtn.onclick = async () => {
  const q = questionEl.value.trim() || "test";
  showAnswerText('Checking retrieval...');
  try {
    const res = await fetch(`${API_BASE}/debug_query`, {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ q, k: Number(kEl.value) })
    });
    const data = await res.json();
    if (!res.ok) {
      showAnswerText('Debug error: ' + (data.detail || JSON.stringify(data)));
      return;
    }
    const retrieved = data.retrieved || [];
    if (retrieved.length === 0) {
      showAnswerText('No chunks retrieved (empty). Try re-ingesting or increase k.');
      return;
    }
    let out = 'Retrieved chunks (rank, distance, text_snippet...):\n\n';
    for (let i = 0; i < retrieved.length; ++i) {
      const r = retrieved[i];
      const rank = r.rank != null ? r.rank : i;
      const id = r.id || r.metadata?.id || r.metadata?.chunk_id || 'N/A';
      const dist = r.distance != null ? r.distance : r.score != null ? 1 - r.score : 'N/A';
      // tolerant snippet retrieval:
      const snippet = r.text_snippet || r.document || r._text || (typeof r === 'string' ? r : (r.metadata?.text || ''));
      out += `#${rank}  dist=${dist}  id=${id}\n${snippet.slice(0, 600)}\n\n---\n\n`;
    }
    showAnswerText(out);
  } catch (e) {
    showAnswerText('Debug fetch error: ' + e.message);
  }
};
