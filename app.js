const STORAGE_KEYS = {
  surveys: "mayumi_bijiris_surveys",
  responses: "mayumi_bijiris_responses",
  customer: "mayumi_bijiris_customer",
  admin: "mayumi_bijiris_admin",
};

const ADMIN_ID = "admin";
const ADMIN_PASSWORD = "admin123";

const app = document.querySelector("#app");
const modeTitle = document.querySelector("#mode-title");
const modeKicker = document.querySelector("#mode-kicker");
const topbarActions = document.querySelector("#topbar-actions");
const navButtons = document.querySelectorAll("[data-mode]");

let mode = "customer";
let adminTab = "dashboard";
let selectedSurveyId = null;
let editingSurveyId = null;

function uid(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function load(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function save(key, value) {
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
  document.querySelector(".toast")?.remove();
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2600);
}

function seedData() {
  const currentSurveys = load(STORAGE_KEYS.surveys, null);
  if (currentSurveys) return;

  const firstSurveyId = uid("survey");
  const secondSurveyId = uid("survey");
  const surveys = [
    {
      id: firstSurveyId,
      title: "ご利用満足度アンケート",
      description: "サービスをより良くするため、率直なご意見をお聞かせください。",
      status: "published",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      questions: [
        {
          id: uid("question"),
          label: "今回のサービス全体の満足度を教えてください。",
          type: "rating",
          options: [],
        },
        {
          id: uid("question"),
          label: "スタッフの対応はいかがでしたか。",
          type: "choice",
          options: ["とても良い", "良い", "普通", "改善してほしい"],
        },
        {
          id: uid("question"),
          label: "印象に残った点や改善してほしい点を教えてください。",
          type: "textarea",
          options: [],
        },
      ],
    },
    {
      id: secondSurveyId,
      title: "新サービス希望アンケート",
      description: "今後受けたいサービスや相談したい内容をお選びください。",
      status: "published",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      questions: [
        {
          id: uid("question"),
          label: "興味のある内容を選んでください。",
          type: "choice",
          options: ["個別相談", "資料作成", "業務効率化", "その他"],
        },
        {
          id: uid("question"),
          label: "具体的に相談したい内容があれば入力してください。",
          type: "textarea",
          options: [],
        },
      ],
    },
  ];

  save(STORAGE_KEYS.surveys, surveys);
  save(STORAGE_KEYS.responses, []);
  selectedSurveyId = firstSurveyId;
}

function getSurveys() {
  return load(STORAGE_KEYS.surveys, []);
}

function setSurveys(surveys) {
  save(STORAGE_KEYS.surveys, surveys);
}

function getResponses() {
  return load(STORAGE_KEYS.responses, []);
}

function setResponses(responses) {
  save(STORAGE_KEYS.responses, responses);
}

function getCustomer() {
  return load(STORAGE_KEYS.customer, { name: "", email: "" });
}

function setCustomer(customer) {
  save(STORAGE_KEYS.customer, customer);
}

function isAdminLoggedIn() {
  return load(STORAGE_KEYS.admin, false) === true;
}

function setMode(nextMode) {
  mode = nextMode;
  navButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.mode === mode);
  });
  render();
}

function render() {
  topbarActions.innerHTML = "";
  if (mode === "customer") {
    modeTitle.textContent = "アンケート回答アプリ";
    modeKicker.textContent = "Customer App";
    renderCustomerApp();
  } else {
    modeTitle.textContent = "アンケート管理アプリ";
    modeKicker.textContent = "Admin App";
    renderAdminApp();
  }
}

function renderCustomerApp() {
  const surveys = getSurveys().filter((survey) => survey.status === "published");
  const customer = getCustomer();
  if (!selectedSurveyId || !surveys.some((survey) => survey.id === selectedSurveyId)) {
    selectedSurveyId = surveys[0]?.id ?? null;
  }
  const selectedSurvey = surveys.find((survey) => survey.id === selectedSurveyId);
  const history = getResponses()
    .filter((response) => response.customerEmail === customer.email && customer.email)
    .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));

  app.innerHTML = `
    <div class="grid-two">
      <section class="panel">
        <h3>お客様情報</h3>
        <form id="customer-form" class="form-grid">
          <label>
            お名前
            <input name="name" type="text" value="${escapeHtml(customer.name)}" required />
          </label>
          <label>
            メールアドレス
            <input name="email" type="email" value="${escapeHtml(customer.email)}" required />
          </label>
          <div class="button-row">
            <button class="primary-button" type="submit">保存</button>
          </div>
        </form>
      </section>

      <section class="panel">
        <h3>回答履歴</h3>
        <div class="history-list">
          ${
            history.length
              ? history
                  .map(
                    (response) => `
                      <article class="list-item">
                        <div class="list-item-header">
                          <strong>${escapeHtml(response.surveyTitle)}</strong>
                          <span class="meta">${formatDate(response.submittedAt)}</span>
                        </div>
                        ${response.answers
                          .map(
                            (answer) => `
                              <p class="meta"><strong>${escapeHtml(answer.label)}</strong><br />${escapeHtml(answer.value || "未回答")}</p>
                            `,
                          )
                          .join("")}
                      </article>
                    `,
                  )
                  .join("")
              : `<p class="empty">お客様情報を保存すると、このブラウザで送信した回答履歴を確認できます。</p>`
          }
        </div>
      </section>
    </div>

    <div class="grid-two">
      <section class="panel">
        <h3>公開中のアンケート</h3>
        <div class="survey-list">
          ${
            surveys.length
              ? surveys
                  .map(
                    (survey) => `
                      <button class="list-item ${survey.id === selectedSurveyId ? "selected" : ""}" type="button" data-select-survey="${survey.id}">
                        <span class="list-item-header">
                          <strong>${escapeHtml(survey.title)}</strong>
                          <span class="badge">公開中</span>
                        </span>
                        <span class="meta">${escapeHtml(survey.description)}</span>
                      </button>
                    `,
                  )
                  .join("")
              : `<p class="empty">現在回答できるアンケートはありません。</p>`
          }
        </div>
      </section>

      <section class="panel">
        ${selectedSurvey ? renderSurveyAnswerForm(selectedSurvey, customer) : `<p class="empty">アンケートを選択してください。</p>`}
      </section>
    </div>
  `;

  bindCustomerEvents();
}

function renderSurveyAnswerForm(survey, customer) {
  return `
    <h3>${escapeHtml(survey.title)}</h3>
    <p class="helper">${escapeHtml(survey.description)}</p>
    <form id="answer-form">
      ${survey.questions
        .map((question, index) => renderQuestionInput(question, index))
        .join("")}
      <div class="button-row">
        <button class="primary-button" type="submit">回答を送信</button>
        <button class="secondary-button" type="button" data-clear-answer>入力をクリア</button>
      </div>
    </form>
    ${
      !customer.email
        ? `<p class="helper">送信前にお客様情報を保存してください。</p>`
        : ""
    }
  `;
}

function renderQuestionInput(question, index) {
  const name = `question-${question.id}`;
  const label = `${index + 1}. ${escapeHtml(question.label)}`;
  if (question.type === "textarea") {
    return `
      <div class="question-block">
        <label>
          ${label}
          <textarea name="${name}" required></textarea>
        </label>
      </div>
    `;
  }

  if (question.type === "rating") {
    return `
      <fieldset class="question-block">
        <legend>${label}</legend>
        <div class="rating-row">
          ${[1, 2, 3, 4, 5]
            .map(
              (value) => `
                <label><input type="radio" name="${name}" value="${value}" required />${value}</label>
              `,
            )
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
            .map(
              (option) => `
                <label><input type="radio" name="${name}" value="${escapeHtml(option)}" required />${escapeHtml(option)}</label>
              `,
            )
            .join("")}
        </div>
      </fieldset>
    `;
  }

  return `
    <div class="question-block">
      <label>
        ${label}
        <input type="text" name="${name}" required />
      </label>
    </div>
  `;
}

function bindCustomerEvents() {
  document.querySelector("#customer-form")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const customer = {
      name: String(formData.get("name") || "").trim(),
      email: String(formData.get("email") || "").trim().toLowerCase(),
    };
    setCustomer(customer);
    showToast("お客様情報を保存しました。");
    render();
  });

  document.querySelectorAll("[data-select-survey]").forEach((button) => {
    button.addEventListener("click", () => {
      selectedSurveyId = button.dataset.selectSurvey;
      render();
    });
  });

  document.querySelector("[data-clear-answer]")?.addEventListener("click", () => {
    document.querySelector("#answer-form")?.reset();
  });

  document.querySelector("#answer-form")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const customer = getCustomer();
    if (!customer.name || !customer.email) {
      showToast("先にお客様情報を保存してください。");
      return;
    }

    const survey = getSurveys().find((item) => item.id === selectedSurveyId);
    if (!survey) return;

    const formData = new FormData(event.currentTarget);
    const answers = survey.questions.map((question) => ({
      questionId: question.id,
      label: question.label,
      type: question.type,
      value: String(formData.get(`question-${question.id}`) || ""),
    }));

    const responses = getResponses();
    responses.push({
      id: uid("response"),
      surveyId: survey.id,
      surveyTitle: survey.title,
      customerName: customer.name,
      customerEmail: customer.email,
      answers,
      submittedAt: new Date().toISOString(),
    });
    setResponses(responses);
    event.currentTarget.reset();
    showToast("回答を送信しました。");
    render();
  });
}

function renderAdminApp() {
  if (!isAdminLoggedIn()) {
    topbarActions.innerHTML = "";
    app.innerHTML = `
      <section class="panel">
        <h3>管理者ログイン</h3>
        <form id="admin-login-form" class="form-grid">
          <label>
            ログインID
            <input name="loginId" type="text" autocomplete="username" required />
          </label>
          <label>
            パスワード
            <input name="password" type="password" autocomplete="current-password" required />
          </label>
          <div class="button-row">
            <button class="primary-button" type="submit">ログイン</button>
          </div>
        </form>
      </section>
    `;
    document.querySelector("#admin-login-form")?.addEventListener("submit", (event) => {
      event.preventDefault();
      const formData = new FormData(event.currentTarget);
      const loginId = String(formData.get("loginId") || "");
      const password = String(formData.get("password") || "");
      if (loginId === ADMIN_ID && password === ADMIN_PASSWORD) {
        save(STORAGE_KEYS.admin, true);
        showToast("ログインしました。");
        render();
      } else {
        showToast("ログインIDまたはパスワードが違います。");
      }
    });
    return;
  }

  topbarActions.innerHTML = `
    <button class="secondary-button" type="button" data-export-json>回答データを書き出し</button>
    <button class="secondary-button" type="button" data-admin-logout>ログアウト</button>
  `;

  app.innerHTML = `
    <section class="panel">
      <div class="admin-tabs">
        <button class="tab-button ${adminTab === "dashboard" ? "active" : ""}" type="button" data-admin-tab="dashboard">集計</button>
        <button class="tab-button ${adminTab === "responses" ? "active" : ""}" type="button" data-admin-tab="responses">回答管理</button>
        <button class="tab-button ${adminTab === "surveys" ? "active" : ""}" type="button" data-admin-tab="surveys">アンケート管理</button>
      </div>
      <div id="admin-content"></div>
    </section>
  `;

  if (adminTab === "responses") renderResponseManagement();
  if (adminTab === "surveys") renderSurveyManagement();
  if (adminTab === "dashboard") renderDashboard();
  bindAdminShellEvents();
}

function bindAdminShellEvents() {
  document.querySelectorAll("[data-admin-tab]").forEach((button) => {
    button.addEventListener("click", () => {
      adminTab = button.dataset.adminTab;
      render();
    });
  });

  document.querySelector("[data-admin-logout]")?.addEventListener("click", () => {
    save(STORAGE_KEYS.admin, false);
    render();
  });

  document.querySelector("[data-export-json]")?.addEventListener("click", () => {
    const data = {
      surveys: getSurveys(),
      responses: getResponses(),
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `mayumi-bijiris-survey-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  });
}

function renderDashboard() {
  const content = document.querySelector("#admin-content");
  const surveys = getSurveys();
  const responses = getResponses();
  const customerMap = groupResponsesByCustomer(responses);
  const latest = responses
    .slice()
    .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
    .slice(0, 5);

  content.innerHTML = `
    <div class="grid-three">
      <div class="stat"><span>アンケート数</span><strong>${surveys.length}</strong></div>
      <div class="stat"><span>回答数</span><strong>${responses.length}</strong></div>
      <div class="stat"><span>回答者数</span><strong>${customerMap.length}</strong></div>
    </div>

    <div class="grid-two" style="margin-top: 18px;">
      <section>
        <h3>お客様ごとの集計</h3>
        ${renderCustomerTable(customerMap)}
      </section>
      <section>
        <h3>最新の回答</h3>
        <div class="response-list">
          ${
            latest.length
              ? latest
                  .map(
                    (response) => `
                      <article class="list-item">
                        <div class="list-item-header">
                          <strong>${escapeHtml(response.customerName)}</strong>
                          <span class="meta">${formatDate(response.submittedAt)}</span>
                        </div>
                        <span>${escapeHtml(response.surveyTitle)}</span>
                        <span class="meta">${escapeHtml(response.customerEmail)}</span>
                      </article>
                    `,
                  )
                  .join("")
              : `<p class="empty">まだ回答はありません。</p>`
          }
        </div>
      </section>
    </div>
  `;
}

function groupResponsesByCustomer(responses) {
  const map = new Map();
  responses.forEach((response) => {
    const key = response.customerEmail || response.customerName;
    const current = map.get(key) || {
      name: response.customerName,
      email: response.customerEmail,
      count: 0,
      surveys: new Map(),
      latestAt: response.submittedAt,
    };
    current.count += 1;
    current.latestAt =
      new Date(response.submittedAt) > new Date(current.latestAt)
        ? response.submittedAt
        : current.latestAt;
    current.surveys.set(
      response.surveyTitle,
      (current.surveys.get(response.surveyTitle) || 0) + 1,
    );
    map.set(key, current);
  });

  return Array.from(map.values()).sort(
    (a, b) => new Date(b.latestAt) - new Date(a.latestAt),
  );
}

function renderCustomerTable(customers) {
  if (!customers.length) return `<p class="empty">まだ回答者はいません。</p>`;
  return `
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>お客様</th>
            <th>メール</th>
            <th>回答数</th>
            <th>回答したアンケート</th>
            <th>最終回答</th>
          </tr>
        </thead>
        <tbody>
          ${customers
            .map(
              (customer) => `
                <tr>
                  <td>${escapeHtml(customer.name)}</td>
                  <td>${escapeHtml(customer.email)}</td>
                  <td>${customer.count}</td>
                  <td>${Array.from(customer.surveys.entries())
                    .map(([title, count]) => `${escapeHtml(title)}: ${count}件`)
                    .join("<br />")}</td>
                  <td>${formatDate(customer.latestAt)}</td>
                </tr>
              `,
            )
            .join("")}
        </tbody>
      </table>
    </div>
  `;
}

function renderResponseManagement() {
  const content = document.querySelector("#admin-content");
  const surveys = getSurveys();
  const responses = getResponses().sort(
    (a, b) => new Date(b.submittedAt) - new Date(a.submittedAt),
  );

  content.innerHTML = `
    <div class="form-grid">
      <label>
        アンケートで絞り込み
        <select id="response-survey-filter">
          <option value="">すべて</option>
          ${surveys
            .map((survey) => `<option value="${survey.id}">${escapeHtml(survey.title)}</option>`)
            .join("")}
        </select>
      </label>
      <label>
        お客様名・メールで検索
        <input id="response-customer-filter" type="search" placeholder="例: yamada@example.com" />
      </label>
    </div>
    <div id="response-results" style="margin-top: 18px;"></div>
  `;

  const surveyFilter = document.querySelector("#response-survey-filter");
  const customerFilter = document.querySelector("#response-customer-filter");
  const draw = () => {
    const surveyId = surveyFilter.value;
    const keyword = customerFilter.value.trim().toLowerCase();
    const filtered = responses.filter((response) => {
      const matchSurvey = !surveyId || response.surveyId === surveyId;
      const matchCustomer =
        !keyword ||
        response.customerName.toLowerCase().includes(keyword) ||
        response.customerEmail.toLowerCase().includes(keyword);
      return matchSurvey && matchCustomer;
    });
    document.querySelector("#response-results").innerHTML = renderResponseTable(filtered);
  };
  surveyFilter.addEventListener("change", draw);
  customerFilter.addEventListener("input", draw);
  draw();
}

function renderResponseTable(responses) {
  if (!responses.length) return `<p class="empty">条件に合う回答はありません。</p>`;
  return `
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>日時</th>
            <th>お客様</th>
            <th>アンケート</th>
            <th>回答内容</th>
          </tr>
        </thead>
        <tbody>
          ${responses
            .map(
              (response) => `
                <tr>
                  <td>${formatDate(response.submittedAt)}</td>
                  <td>${escapeHtml(response.customerName)}<br /><span class="meta">${escapeHtml(response.customerEmail)}</span></td>
                  <td>${escapeHtml(response.surveyTitle)}</td>
                  <td>${response.answers
                    .map(
                      (answer) => `<strong>${escapeHtml(answer.label)}</strong><br />${escapeHtml(answer.value || "未回答")}`,
                    )
                    .join("<br /><br />")}</td>
                </tr>
              `,
            )
            .join("")}
        </tbody>
      </table>
    </div>
  `;
}

function renderSurveyManagement() {
  const content = document.querySelector("#admin-content");
  const surveys = getSurveys();
  const currentSurvey =
    surveys.find((survey) => survey.id === editingSurveyId) ||
    createBlankSurvey();

  content.innerHTML = `
    <div class="grid-two">
      <section>
        <div class="button-row" style="margin-bottom: 14px;">
          <button class="primary-button" type="button" data-new-survey>新規作成</button>
        </div>
        <div class="survey-list">
          ${
            surveys.length
              ? surveys
                  .map(
                    (survey) => `
                      <article class="list-item ${survey.id === editingSurveyId ? "selected" : ""}">
                        <div class="list-item-header">
                          <strong>${escapeHtml(survey.title)}</strong>
                          <span class="badge ${survey.status === "draft" ? "draft" : ""}">${survey.status === "published" ? "公開中" : "下書き"}</span>
                        </div>
                        <span class="meta">${escapeHtml(survey.description)}</span>
                        <div class="button-row">
                          <button class="secondary-button" type="button" data-edit-survey="${survey.id}">編集</button>
                          <button class="secondary-button danger" type="button" data-delete-survey="${survey.id}">削除</button>
                        </div>
                      </article>
                    `,
                  )
                  .join("")
              : `<p class="empty">アンケートはまだありません。</p>`
          }
        </div>
      </section>

      <section>
        ${renderSurveyEditor(currentSurvey)}
      </section>
    </div>
  `;

  populateQuestionEditors(currentSurvey.questions);
  bindSurveyManagementEvents();
}

function createBlankSurvey() {
  return {
    id: "",
    title: "",
    description: "",
    status: "draft",
    questions: [
      {
        id: uid("question"),
        label: "",
        type: "text",
        options: [],
      },
    ],
  };
}

function renderSurveyEditor(survey) {
  return `
    <form id="survey-editor" class="panel no-shadow" data-survey-id="${escapeHtml(survey.id)}">
      <h3>${survey.id ? "アンケート編集" : "アンケート新規作成"}</h3>
      <label>
        タイトル
        <input name="title" type="text" value="${escapeHtml(survey.title)}" required />
      </label>
      <label>
        説明文
        <textarea name="description" required>${escapeHtml(survey.description)}</textarea>
      </label>
      <label>
        公開状態
        <select name="status">
          <option value="published" ${survey.status === "published" ? "selected" : ""}>公開中</option>
          <option value="draft" ${survey.status === "draft" ? "selected" : ""}>下書き</option>
        </select>
      </label>
      <div class="question-block">
        <div class="list-item-header">
          <h3>質問</h3>
          <button class="secondary-button" type="button" data-add-question>質問を追加</button>
        </div>
        <div id="question-editor-list"></div>
      </div>
      <div class="button-row">
        <button class="primary-button" type="submit">保存</button>
      </div>
    </form>
  `;
}

function populateQuestionEditors(questions) {
  const list = document.querySelector("#question-editor-list");
  const template = document.querySelector("#question-editor-template");
  list.innerHTML = "";
  questions.forEach((question) => {
    const node = template.content.firstElementChild.cloneNode(true);
    node.dataset.questionId = question.id;
    node.querySelector('[data-question-field="label"]').value = question.label;
    node.querySelector('[data-question-field="type"]').value = question.type;
    node.querySelector('[data-question-field="options"]').value = question.options.join(",");
    toggleQuestionOptions(node);
    list.appendChild(node);
  });
}

function toggleQuestionOptions(questionNode) {
  const type = questionNode.querySelector('[data-question-field="type"]').value;
  questionNode
    .querySelector(".options-field")
    .classList.toggle("hidden", type !== "choice");
}

function collectQuestionsFromEditor() {
  return Array.from(document.querySelectorAll(".question-editor")).map((node) => {
    const type = node.querySelector('[data-question-field="type"]').value;
    const options = node
      .querySelector('[data-question-field="options"]')
      .value.split(",")
      .map((option) => option.trim())
      .filter(Boolean);
    return {
      id: node.dataset.questionId || uid("question"),
      label: node.querySelector('[data-question-field="label"]').value.trim(),
      type,
      options: type === "choice" ? options : [],
    };
  });
}

function bindSurveyManagementEvents() {
  document.querySelector("[data-new-survey]")?.addEventListener("click", () => {
    editingSurveyId = null;
    render();
  });

  document.querySelectorAll("[data-edit-survey]").forEach((button) => {
    button.addEventListener("click", () => {
      editingSurveyId = button.dataset.editSurvey;
      render();
    });
  });

  document.querySelectorAll("[data-delete-survey]").forEach((button) => {
    button.addEventListener("click", () => {
      const surveyId = button.dataset.deleteSurvey;
      if (!confirm("このアンケートを削除しますか？関連する回答データは残ります。")) return;
      setSurveys(getSurveys().filter((survey) => survey.id !== surveyId));
      if (editingSurveyId === surveyId) editingSurveyId = null;
      showToast("アンケートを削除しました。");
      render();
    });
  });

  document.querySelectorAll('[data-question-field="type"]').forEach((select) => {
    select.addEventListener("change", () => toggleQuestionOptions(select.closest(".question-editor")));
  });

  document.querySelector("[data-add-question]")?.addEventListener("click", () => {
    const template = document.querySelector("#question-editor-template");
    const node = template.content.firstElementChild.cloneNode(true);
    node.dataset.questionId = uid("question");
    toggleQuestionOptions(node);
    node
      .querySelector('[data-question-field="type"]')
      .addEventListener("change", () => toggleQuestionOptions(node));
    node.querySelector("[data-remove-question]").addEventListener("click", () => {
      node.remove();
    });
    document.querySelector("#question-editor-list").appendChild(node);
  });

  document.querySelectorAll("[data-remove-question]").forEach((button) => {
    button.addEventListener("click", () => {
      const editors = document.querySelectorAll(".question-editor");
      if (editors.length <= 1) {
        showToast("質問は1つ以上必要です。");
        return;
      }
      button.closest(".question-editor").remove();
    });
  });

  document.querySelector("#survey-editor")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const questions = collectQuestionsFromEditor();

    if (questions.some((question) => !question.label)) {
      showToast("質問文を入力してください。");
      return;
    }
    if (questions.some((question) => question.type === "choice" && question.options.length < 2)) {
      showToast("選択式の質問は選択肢を2つ以上入力してください。");
      return;
    }

    const surveys = getSurveys();
    const surveyId = form.dataset.surveyId || uid("survey");
    const existing = surveys.find((survey) => survey.id === surveyId);
    const survey = {
      id: surveyId,
      title: String(formData.get("title") || "").trim(),
      description: String(formData.get("description") || "").trim(),
      status: String(formData.get("status") || "draft"),
      questions,
      createdAt: existing?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const nextSurveys = existing
      ? surveys.map((item) => (item.id === surveyId ? survey : item))
      : [survey, ...surveys];
    setSurveys(nextSurveys);
    editingSurveyId = surveyId;
    selectedSurveyId = survey.status === "published" ? surveyId : selectedSurveyId;
    showToast("アンケートを保存しました。");
    render();
  });
}

navButtons.forEach((button) => {
  button.addEventListener("click", () => setMode(button.dataset.mode));
});

seedData();
render();
