const CUSTOMER_KEY = "mayumi_survey_customer";

const appState = {
  customer: loadLocal(CUSTOMER_KEY, { name: "", email: "" }),
  surveys: [],
  history: [],
  selectedSurveyId: "",
  installPrompt: null,
};

const api = window.MayumiSurveyApi;
const toast = document.querySelector("#toast");
const surveyList = document.querySelector("#surveyList");
const answerPanel = document.querySelector("#answerPanel");
const historyList = document.querySelector("#historyList");
const customerForm = document.querySelector("#customerForm");
const installButton = document.querySelector("#installButton");

function loadLocal(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function saveLocal(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatDate(value) {
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2600);
}

function setPage(page) {
  document.querySelectorAll(".page").forEach((node) => {
    node.classList.toggle("active", node.id === `page-${page}`);
  });
  document.querySelectorAll(".nav-button").forEach((button) => {
    button.classList.toggle("active", button.dataset.page === page);
  });
  if (page === "history") {
    void loadHistory();
  }
}

async function loadSurveys() {
  surveyList.innerHTML = `<div class="empty">読み込み中です。</div>`;
  try {
    const result = await api.request("/api/public/surveys");
    appState.surveys = result.surveys || [];
    if (
      !appState.selectedSurveyId ||
      !appState.surveys.some((survey) => survey.id === appState.selectedSurveyId)
    ) {
      appState.selectedSurveyId = appState.surveys[0]?.id || "";
    }
    renderSurveys();
    renderAnswerPanel();
  } catch (error) {
    surveyList.innerHTML = `<div class="empty">${escapeHtml(error.message || "アンケートを読み込めませんでした。")}</div>`;
  }
}

async function loadHistory() {
  if (!appState.customer.email) {
    historyList.innerHTML = `<div class="empty">先にお客様情報を保存してください。</div>`;
    return;
  }

  historyList.innerHTML = `<div class="empty">読み込み中です。</div>`;
  try {
    const result = await api.request(
      `/api/public/responses?email=${encodeURIComponent(appState.customer.email)}`,
    );
    appState.history = result.responses || [];
    renderHistory();
  } catch (error) {
    historyList.innerHTML = `<div class="empty">${escapeHtml(error.message || "履歴を読み込めませんでした。")}</div>`;
  }
}

function renderCustomerForm() {
  customerForm.elements.name.value = appState.customer.name || "";
  customerForm.elements.email.value = appState.customer.email || "";
}

function renderSurveys() {
  if (!appState.surveys.length) {
    surveyList.innerHTML = `<div class="empty">現在回答できるアンケートはありません。</div>`;
    return;
  }

  surveyList.innerHTML = appState.surveys
    .map(
      (survey) => `
        <button class="survey-card ${survey.id === appState.selectedSurveyId ? "active" : ""}" type="button" data-survey-id="${survey.id}">
          <strong>${escapeHtml(survey.title)}</strong>
          <span>${escapeHtml(survey.description)}</span>
          <span class="badge">${survey.questions.length}問</span>
        </button>
      `,
    )
    .join("");

  document.querySelectorAll("[data-survey-id]").forEach((button) => {
    button.addEventListener("click", () => {
      appState.selectedSurveyId = button.dataset.surveyId;
      renderSurveys();
      renderAnswerPanel();
    });
  });
}

function renderAnswerPanel() {
  const survey = appState.surveys.find((item) => item.id === appState.selectedSurveyId);
  if (!survey) {
    answerPanel.innerHTML = `<div class="empty">アンケートを選択してください。</div>`;
    return;
  }

  answerPanel.innerHTML = `
    <h2>${escapeHtml(survey.title)}</h2>
    <p>${escapeHtml(survey.description)}</p>
    <form id="answerForm" class="question-list">
      ${survey.questions.map((question, index) => renderQuestion(question, index)).join("")}
      <button class="primary-button" type="submit">回答を送信する</button>
    </form>
  `;

  document.querySelector("#answerForm").addEventListener("submit", submitAnswer);
}

function renderQuestion(question, index) {
  const name = `question-${question.id}`;
  const label = `${index + 1}. ${escapeHtml(question.label)}`;

  if (question.type === "textarea") {
    return `
      <label class="question-block">
        ${label}
        <textarea name="${name}" required></textarea>
      </label>
    `;
  }

  if (question.type === "rating") {
    return `
      <fieldset class="question-block">
        <legend>${label}</legend>
        <div class="rating-row">
          ${[1, 2, 3, 4, 5]
            .map((value) => `<label><input type="radio" name="${name}" value="${value}" required />${value}</label>`)
            .join("")}
        </div>
      </fieldset>
    `;
  }

  if (question.type === "choice") {
    return `
      <fieldset class="question-block">
        <legend>${label}</legend>
        <div class="choice-row">
          ${question.options
            .map((option) => `<label><input type="radio" name="${name}" value="${escapeHtml(option)}" required />${escapeHtml(option)}</label>`)
            .join("")}
        </div>
      </fieldset>
    `;
  }

  return `
    <label class="question-block">
      ${label}
      <input type="text" name="${name}" required />
    </label>
  `;
}

async function submitAnswer(event) {
  event.preventDefault();
  if (!appState.customer.name || !appState.customer.email) {
    showToast("先にお客様情報を保存してください。");
    return;
  }

  const survey = appState.surveys.find((item) => item.id === appState.selectedSurveyId);
  if (!survey) return;

  const submitButton = event.currentTarget.querySelector('button[type="submit"]');
  submitButton.disabled = true;
  submitButton.textContent = "送信中です";

  const formData = new FormData(event.currentTarget);
  const answers = survey.questions.map((question) => ({
    questionId: question.id,
    value: String(formData.get(`question-${question.id}`) || ""),
  }));

  try {
    await api.request("/api/public/responses", {
      method: "POST",
      body: {
        surveyId: survey.id,
        customer: appState.customer,
        answers,
      },
    });
    event.currentTarget.reset();
    showToast("回答を送信しました。");
    await loadHistory();
  } catch (error) {
    showToast(error.message || "回答を送信できませんでした。");
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "回答を送信する";
  }
}

function renderHistory() {
  if (!appState.history.length) {
    historyList.innerHTML = `<div class="empty">まだ回答履歴はありません。</div>`;
    return;
  }

  historyList.innerHTML = appState.history
    .slice()
    .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
    .map(
      (response) => `
        <article class="history-card">
          <strong>${escapeHtml(response.surveyTitle)}</strong>
          <span class="meta">${formatDate(response.submittedAt)}</span>
          ${response.answers
            .map((answer) => `<p><strong>${escapeHtml(answer.label)}</strong><br />${escapeHtml(answer.value || "未回答")}</p>`)
            .join("")}
        </article>
      `,
    )
    .join("");
}

function setupInstall() {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./sw.js").catch(() => {});
    });
  }

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    appState.installPrompt = event;
    installButton.hidden = false;
  });

  installButton.addEventListener("click", async () => {
    if (!appState.installPrompt) return;
    appState.installPrompt.prompt();
    await appState.installPrompt.userChoice;
    appState.installPrompt = null;
    installButton.hidden = true;
  });
}

customerForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);
  appState.customer = {
    name: String(formData.get("name") || "").trim(),
    email: String(formData.get("email") || "").trim().toLowerCase(),
  };
  saveLocal(CUSTOMER_KEY, appState.customer);
  showToast("お客様情報を保存しました。");
  void loadHistory();
});

document.querySelectorAll("[data-page]").forEach((button) => {
  button.addEventListener("click", () => setPage(button.dataset.page));
});

document.querySelector("#refreshButton").addEventListener("click", () => {
  void loadSurveys();
});

document.querySelector("#historyRefreshButton").addEventListener("click", () => {
  void loadHistory();
});

setupInstall();
renderCustomerForm();
void loadSurveys();
void loadHistory();
