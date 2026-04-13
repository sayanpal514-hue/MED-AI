// ==============================
//  Medical AI Assistant - JS
//  Calls our Express backend
// ==============================

// ---- Symptom List ----
const symptoms = [
  "Fever", "Headache", "Cough", "Chest pain", "Fatigue",
  "Nausea", "Vomiting", "Diarrhea", "Sore throat", "Body ache",
  "Shortness of breath", "Dizziness", "Rash", "Joint pain",
  "Stomach pain", "Back pain", "Loss of appetite",
  "Runny nose", "Chills", "Swelling"
];

// ---- State ----
let selected = [];

// ---- Tab Switching ----
function setTab(tab) {
  document.getElementById("tab-symptoms").style.display = tab === "symptoms" ? "block" : "none";
  document.getElementById("tab-ask").style.display      = tab === "ask"      ? "block" : "none";

  document.querySelectorAll(".tab").forEach((t, i) => {
    t.classList.toggle("active",
      (i === 0 && tab === "symptoms") || (i === 1 && tab === "ask")
    );
  });

  document.getElementById("resultArea").innerHTML = "";
}

// ---- Render Symptom Buttons ----
function renderGrid() {
  document.getElementById("symptomGrid").innerHTML = symptoms
    .map(s => `
      <button
        class="symptom-btn${selected.includes(s) ? " selected" : ""}"
        onclick="toggleSymptom('${s}')">
        ${s}
      </button>`)
    .join("");
}

// ---- Render Selected Tags ----
function renderTags() {
  document.getElementById("selectedTags").innerHTML = selected
    .map(s => `
      <div class="tag">
        ${s}
        <span class="remove" onclick="toggleSymptom('${s}')">×</span>
      </div>`)
    .join("");
}

// ---- Toggle Symptom ----
function toggleSymptom(s) {
  selected = selected.includes(s)
    ? selected.filter(x => x !== s)
    : [...selected, s];
  renderGrid();
  renderTags();
}

// ---- Format AI Markdown-like Response ----
function formatResponse(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/^(\d+\.\s)/gm, "<br><strong>$1</strong>")
    .replace(/^#{1,3} (.*)/gm, "<br><strong style='font-size:15px'>$1</strong><br>")
    .trim();
}

// ---- Show Loading State ----
function setLoading(btnId, btnLabel, isLoading) {
  const btn = document.getElementById(btnId);
  btn.disabled = isLoading;
  btn.innerHTML = isLoading
    ? '<span class="spinner"></span>Thinking...'
    : btnLabel;

  if (isLoading) {
    document.getElementById("resultArea").innerHTML = `
      <div class="result-card loading">
        <span class="spinner"></span> Consulting Medical AI...
      </div>`;
  }
}

// ---- Show Result ----
function showResult(text) {
  document.getElementById("resultArea").innerHTML = `
    <div class="result-card">
      <div class="ai-response">${formatResponse(text)}</div>
    </div>`;
}

// ---- Show Error ----
function showError(msg) {
  document.getElementById("resultArea").innerHTML = `
    <div class="result-card">
      <p style="color:red">❌ ${msg}</p>
    </div>`;
}

// ---- Analyze Symptoms ----
async function analyze() {
  const custom = document.getElementById("customSymptom").value.trim();
  const allSymptoms = [...selected, ...(custom ? [custom] : [])];

  if (!allSymptoms.length) {
    alert("Please select or enter at least one symptom.");
    return;
  }

  setLoading("analyzeBtn", "Analyze", true);

  try {
    // Calls our Express backend — API key stays safe on server
    const res = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ symptoms: allSymptoms }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Unknown error");
    showResult(data.result);

  } catch (err) {
    showError(err.message || "Could not reach server. Please try again.");
  }

  setLoading("analyzeBtn", "Analyze", false);
}

// ---- Ask a Medical Question ----
async function askQuestion() {
  const question = document.getElementById("questionInput").value.trim();

  if (!question) {
    alert("Please enter a question.");
    return;
  }

  setLoading("askBtn", "Ask", true);

  try {
    // Calls our Express backend — API key stays safe on server
    const res = await fetch("/api/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Unknown error");
    showResult(data.result);

  } catch (err) {
    showError(err.message || "Could not reach server. Please try again.");
  }

  setLoading("askBtn", "Ask", false);
}

// ---- Initialize ----
renderGrid();
