var SPREADSHEET_ID = "1oDNTqlvKv1rGOGXIpnzPlegpFDeQ0WHGRLuY3ZAnZYc";
var DEFAULT_SPREADSHEET_TITLE = "まゆみ助産院 ビジリス アンケート回答";
var MASTER_SHEET_NAME = "回答一覧";
var ROOT_DRIVE_FOLDER_NAME = "bijiris";
var DEFAULT_ADMIN_USERNAME = "mayumi2026";
var DEFAULT_ADMIN_PASSWORD = "3939";
var LEGACY_ADMIN_USERNAME = "admin";
var LEGACY_ADMIN_PASSWORD = "admin123";
var DEFAULT_TOKEN_SECRET = "change-this-gas-secret";
var SURVEYS_PROPERTY_KEY = "SURVEYS_JSON";
var QUESTION_TYPES = ["text", "textarea", "rating", "choice", "checkbox", "photo"];
var PREFERENCES_PROPERTY_KEY = "ADMIN_PREFERENCES_JSON";
var CUSTOMER_MEMOS_PROPERTY_KEY = "CUSTOMER_MEMOS_JSON";
var AUDIT_LOGS_PROPERTY_KEY = "AUDIT_LOGS_JSON";
var ERROR_LOGS_PROPERTY_KEY = "ERROR_LOGS_JSON";
var LOGIN_ATTEMPTS_PROPERTY_KEY = "LOGIN_ATTEMPTS_JSON";
var ADMIN_USERS_PROPERTY_KEY = "ADMIN_USERS_JSON";
var OTP_SESSIONS_PROPERTY_KEY = "OTP_SESSIONS_JSON";
var MAINTENANCE_TRIGGER_IDS_PROPERTY_KEY = "MAINTENANCE_TRIGGER_IDS_JSON";
var VERSION = "20260413-06";
var RESPONSE_EDIT_WINDOW_MS = 24 * 60 * 60 * 1000;
var DUPLICATE_RESPONSE_WINDOW_MS = 10 * 60 * 1000;
var LOGIN_LOCK_WINDOW_MS = 15 * 60 * 1000;
var LOGIN_MAX_ATTEMPTS = 5;
var MAX_LOG_ENTRIES = 200;
var OTP_TTL_MS = 10 * 60 * 1000;

var BIJIRIS_SESSION_CONCERN_CATEGORIES = [
  {
    id: "toilet",
    label: "【トイレ・デリケートゾーンのお悩み】",
    options: [
      "咳、くしゃみ、大笑いした時に尿もれすることがある",
      "ジャンプや運動、重いものを持った時に尿もれすることがある",
      "急にトイレに行きたくなる、我慢できず間に合わないことがある",
      "トイレが近い・夜中に何度もトイレで起きる",
      "デリケートゾーンの違和感や乾燥が気になる",
      "便秘しやすい・お腹が張りやすい",
    ],
  },
  {
    id: "posture",
    label: "【姿勢・体型のお悩み】",
    options: [
      "姿勢が崩れやすい・猫背や反り腰が気になる",
      "下腹ぽっこりが気になる",
      "ヒップラインや骨盤まわりのゆるみが気になる",
      "産後の体型変化が気になる",
    ],
  },
  {
    id: "pain",
    label: "【痛み・めぐりのお悩み】",
    options: [
      "腰痛がある",
      "股関節や骨盤まわりに痛み・違和感がある",
      "冷えやむくみが気になる",
      "疲れやすい・眠りが浅い",
    ],
  },
  {
    id: "care",
    label: "【ビジリス（骨盤底筋ケア）について知りたいこと】",
    options: [
      "骨盤底筋ケアでどんな変化が期待できるか知りたい",
      "自宅でできる骨盤底筋ケアを知りたい",
      "妊活や産後ケアにどう役立つか知りたい",
      "自分に合う通い方や頻度を知りたい",
      "その他",
    ],
  },
];

var BIJIRIS_SESSION_TICKET_SHEET_OPTIONS = [
  "1枚目",
  "2枚目",
  "3枚目",
  "4枚目",
  "5枚目",
  "6枚目",
  "7枚目",
  "8枚目",
  "9枚目",
  "10枚目",
];

var BIJIRIS_SESSION_TICKET_ROUND_OPTIONS = [
  "1回目",
  "2回目",
  "3回目",
  "4回目",
  "5回目",
  "6回目",
  "7回目",
  "8回目",
  "9回目",
  "10回目",
];

var BIJIRIS_SESSION_LIFE_CHANGE_OPTIONS = [
  "咳やくしゃみをした時の不安が以前より減った",
  "急な尿意を気にする場面が減った",
  "外出時にトイレの場所を気にしすぎなくなった",
  "夜中にトイレで起きる回数が減った",
  "お腹の奥に力が入りやすくなった",
  "骨盤まわりが安定した感じがある",
  "姿勢を意識しやすくなった",
  "下腹まわりがすっきりした感じがある",
  "歩く・立つ・動くことが以前より楽になった",
  "その他（自由記述）",
];

var MASTER_HEADERS = [
  "送信日時",
  "回答ID",
  "アンケートID",
  "アンケート名",
  "端末ID",
  "お名前",
  "メールアドレス",
  "対応状況",
  "管理メモ",
  "回答JSON",
  "写真JSON",
  "管理更新日時",
];

function getBijirisSessionConcernOptions_() {
  var options = [];
  BIJIRIS_SESSION_CONCERN_CATEGORIES.forEach(function (category) {
    (category.options || []).forEach(function (option) {
      options.push(option);
    });
  });
  return options;
}

var SURVEYS = [
  {
    id: "survey_bijiris_session",
    title: "ビジリス施術アンケート",
    description: "ビジリス施術後の体感やお悩みをお聞かせください。",
    introMessage: "施術内容を選択後、本日の体感や気になることをご回答ください。",
    completionMessage: "ビジリス施術アンケートのご回答ありがとうございました。",
    status: "published",
    questions: [
      { id: "q_bijiris_session_type", label: "施術内容", type: "choice", required: true, options: ["初回お試し", "回数券", "単発", "トライアル"] },
      { id: "q_bijiris_session_ticket_plan", label: "回数券の種類", type: "choice", required: true, options: ["6回券", "10回券"], visibleWhen: { questionId: "q_bijiris_session_type", value: "回数券" } },
      { id: "q_bijiris_session_ticket_sheet", label: "回数券の何枚目ですか？", type: "choice", required: true, options: BIJIRIS_SESSION_TICKET_SHEET_OPTIONS, visibleWhen: { questionId: "q_bijiris_session_type", value: "回数券" } },
      { id: "q_bijiris_session_ticket_round", label: "回数券の何回目ですか？", type: "choice", required: true, options: BIJIRIS_SESSION_TICKET_ROUND_OPTIONS, visibleWhen: { questionId: "q_bijiris_session_type", value: "回数券" } },
      { id: "q_bijiris_session_feeling", label: "本日のビジリスの体感はいかがでしたか？　以前と比べて変化したことなどがあればご記載ください", type: "textarea", required: true, options: [] },
      { id: "q_bijiris_session_concern", label: "普段のお身体のお悩みや、ビジリス（骨盤底筋ケア）について気になること・知りたいことはありますか？（複数選択可）", type: "checkbox", required: false, options: getBijirisSessionConcernOptions_() },
      { id: "q_bijiris_session_life_changes", label: "日常生活にどのような変化がありましたか？（複数選択可）", type: "checkbox", required: false, options: BIJIRIS_SESSION_LIFE_CHANGE_OPTIONS },
      { id: "q_bijiris_session_life_changes_other", label: "日常生活の変化（その他）", type: "textarea", required: false, options: [], visibleWhen: { questionId: "q_bijiris_session_life_changes", value: "その他（自由記述）" } },
      { id: "q_bijiris_session_monitor_photos", label: "モニター時の写真2枚", type: "photo", required: true, options: [], visibleWhen: { questionId: "q_bijiris_session_type", value: "回数券" } },
      { id: "q_bijiris_session_ticket_end_photos", label: "回数券終了時の写真2枚", type: "photo", required: true, options: [], visibleWhen: { questionId: "q_bijiris_session_type", value: "回数券" } },
    ],
  },
];

function doGet(e) {
  try {
    return output_(handleGet_(e || {}), e && e.parameter && e.parameter.callback);
  } catch (error) {
    return output_({ error: error.message || "エラーが発生しました。" }, e && e.parameter && e.parameter.callback);
  }
}

function doPost(e) {
  try {
    return output_(handlePost_(parsePost_(e || {})));
  } catch (error) {
    return output_({ error: error.message || "エラーが発生しました。" });
  }
}

function setup() {
  ensureSpreadsheet_();
  syncMaintenanceTrigger_(getPreferences_());
  var credentials = getAdminCredentials_();
  var rootFolder = getRootPhotoFolder_();
  return {
    ok: true,
    spreadsheetUrl: getSpreadsheet_().getUrl(),
    rootFolderUrl: rootFolder.getUrl(),
    loginId: credentials.username,
    message: "初期設定が完了しました。",
  };
}

function resetSurveysToDefaults() {
  var surveys = SURVEYS.map(function (survey, index) {
    var normalized = validateSurveyPayload_(Object.assign({}, survey, { sortOrder: index }), null);
    normalized.sortOrder = index;
    return normalized;
  });
  saveSurveys_(normalizeSurveyOrder_(surveys));
  surveys.forEach(ensureSurveySheet_);
  appendAuditLog_("survey.reset_defaults", {
    count: surveys.length,
    version: VERSION,
  });
  return {
    ok: true,
    version: VERSION,
    surveys: getSurveys_(),
  };
}

function handleGet_(e) {
  var params = e.parameter || {};
  var action = params.action || "health";

  if (action === "health") return { ok: true, backend: "gas" };
  if (action === "surveys") {
    return {
      surveys: getPublicSurveys_(),
      dataPolicyText: getPreferences_().dataPolicyText,
      requireConsent: getPreferences_().requireConsent,
      consentText: getPreferences_().consentText,
      version: VERSION,
    };
  }
  if (action === "history") {
    return {
      responses: getResponses_({
        clientId: params.clientId,
        customerName: params.name,
        includeTrashed: false,
      }),
    };
  }
  if (action === "adminLogin") return adminLogin_(params.loginId, params.password);
  if (action === "adminVerifyOtp") return verifyAdminOtp_(params.sessionId, params.code);

  requireAdmin_(params.token);
  if (action === "adminInfo") return getAdminInfo_();
  if (action === "adminUpdateCredentials") {
    return updateAdminCredentials_(params.loginId, params.password);
  }
  if (action === "adminUsers") return { adminUsers: getAdminUsers_().map(publicAdminUser_) };
  if (action === "adminSurveys") return { surveys: getSurveys_() };
  if (action === "adminPreferences") return { preferences: getPreferences_() };
  if (action === "adminLogs") return getLogs_();
  if (action === "adminCustomerMemos") return { memos: getCustomerMemos_() };
  if (action === "adminResponses") return { responses: getResponses_({ includeTrashed: true }) };
  if (action === "adminUpdate") {
    return {
      response: updateResponse_(params.responseId, params.status, params.adminMemo),
    };
  }
  if (action === "adminDelete") {
    deleteResponse_(params.responseId);
    return { ok: true };
  }
  if (action === "adminExport") {
    return {
      surveys: getSurveys_(),
      responses: getResponses_({ includeTrashed: true }),
      preferences: getPreferences_(),
      customerMemos: getCustomerMemos_(),
      adminUsers: getAdminUsers_().map(publicAdminUser_),
      exportedAt: new Date().toISOString(),
    };
  }

  throw new Error("API が見つかりません。");
}

function handlePost_(body) {
  if (body.action === "submitResponse") {
    return saveResponse_(body);
  }
  if (body.action === "updatePublicResponse") {
    return updatePublicResponse_(body);
  }
  if (body.action === "logClientError") {
    return logClientError_(body.payload || {});
  }
  if (body.action === "adminUpdateResponse") {
    requireAdmin_(body.token);
    return {
      response: updateResponse_(
        body.responseId,
        body.payload && body.payload.status,
        body.payload && body.payload.adminMemo,
        body.payload && body.payload.answers
      ),
    };
  }
  if (body.action === "adminCreateSurvey") {
    requireAdmin_(body.token);
    return {
      survey: createSurvey_(body.payload || {}),
    };
  }
  if (body.action === "adminUpdateSurvey") {
    requireAdmin_(body.token);
    return {
      survey: updateSurveyDefinition_(body.surveyId, body.payload || {}),
    };
  }
  if (body.action === "adminDeleteSurvey") {
    requireAdmin_(body.token);
    deleteSurveyDefinition_(body.surveyId);
    return { ok: true };
  }
  if (body.action === "adminReplaceSurveys") {
    requireAdmin_(body.token);
    return {
      surveys: replaceSurveys_(body.payload && body.payload.surveys),
    };
  }
  if (body.action === "adminUpdatePreferences") {
    requireAdmin_(body.token);
    return {
      preferences: updatePreferences_(body.payload || {}),
    };
  }
  if (body.action === "adminUpdateCustomerMemo") {
    requireAdmin_(body.token);
    return {
      memos: updateCustomerMemo_(body.customerName, body.memo),
    };
  }
  if (body.action === "adminUpdateUsers") {
    requireAdmin_(body.token);
    return {
      adminUsers: updateAdminUsers_(body.payload && body.payload.adminUsers),
    };
  }
  if (body.action === "adminRunMaintenance") {
    requireAdmin_(body.token);
    return runScheduledMaintenance();
  }
  throw new Error("API が見つかりません。");
}

function parsePost_(e) {
  var contents = e.postData && e.postData.contents ? e.postData.contents : "";
  if (!contents && e.parameter && e.parameter.payload) contents = e.parameter.payload;
  if (!contents) return {};
  return JSON.parse(contents);
}

function output_(data, callback) {
  var body = JSON.stringify(data);
  if (callback) {
    body = String(callback).replace(/[^\w.$]/g, "") + "(" + body + ");";
    return ContentService.createTextOutput(body).setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService.createTextOutput(body).setMimeType(ContentService.MimeType.JSON);
}

function getSurveys_() {
  return loadSurveys_().map(cloneSurvey_);
}

function getPublicSurveys_() {
  return getSurveys_().filter(function (survey) {
    return normalizeSurveyStatus_(survey.status) === "published";
  });
}

function findSurvey_(surveyId) {
  var surveys = loadSurveys_();
  for (var i = 0; i < surveys.length; i += 1) {
    if (surveys[i].id === surveyId) return surveys[i];
  }
  throw new Error("アンケートが見つかりません。");
}

function loadSurveys_() {
  var properties = PropertiesService.getScriptProperties();
  var stored = parseJson_(properties.getProperty(SURVEYS_PROPERTY_KEY), null);
  if (Array.isArray(stored)) {
    var normalizedStored = stored.map(function (survey) {
      return validateSurveyPayload_(mergeDefaultSurveyFields_(survey), survey);
    });
    normalizedStored.sort(compareSurveyOrder_);
    if (JSON.stringify(stored) !== JSON.stringify(normalizedStored)) {
      saveSurveys_(normalizedStored);
    }
    return normalizedStored;
  }

  var defaults = SURVEYS.map(function (survey) {
    return validateSurveyPayload_(survey, survey);
  });
  defaults.sort(compareSurveyOrder_);
  saveSurveys_(defaults);
  return defaults;
}

function mergeDefaultSurveyFields_(survey) {
  var normalizedSurvey = cloneSurvey_(survey);
  var defaults = null;
  for (var i = 0; i < SURVEYS.length; i += 1) {
    if (SURVEYS[i].id === normalizedSurvey.id) {
      defaults = SURVEYS[i];
      break;
    }
  }
  if (!defaults || !Array.isArray(normalizedSurvey.questions)) return normalizedSurvey;

  var defaultQuestionMap = {};
  defaults.questions.forEach(function (question) {
    defaultQuestionMap[question.id] = question;
  });

  normalizedSurvey.questions = normalizedSurvey.questions.map(function (question) {
    var defaultQuestion = defaultQuestionMap[normalizeText_(question && question.id)];
    if (!defaultQuestion) return question;
    var currentConditions = getQuestionVisibilityConditions_(question);
    if (currentConditions.length) return question;
    var defaultConditions = getQuestionVisibilityConditions_(defaultQuestion);
    return Object.assign({}, question, {
      visibilityConditions: defaultConditions,
      visibleWhen: defaultConditions.length ? defaultConditions[0] : null,
    });
  });
  if (!normalizedSurvey.introMessage) normalizedSurvey.introMessage = defaults.introMessage || defaults.description || "";
  if (!normalizedSurvey.completionMessage) {
    normalizedSurvey.completionMessage = defaults.completionMessage || "ご回答ありがとうございました。";
  }
  return normalizedSurvey;
}

function saveSurveys_(surveys) {
  PropertiesService.getScriptProperties().setProperty(
    SURVEYS_PROPERTY_KEY,
    JSON.stringify(Array.isArray(surveys) ? surveys : [])
  );
}

function cloneSurvey_(survey) {
  return JSON.parse(JSON.stringify(survey));
}

function compareSurveyOrder_(left, right) {
  return getSurveySortOrder_(left) - getSurveySortOrder_(right);
}

function getSurveySortOrder_(survey) {
  var sortOrder = Number(survey && survey.sortOrder);
  return Number.isFinite(sortOrder) ? sortOrder : 999999;
}

function makeId_(prefix) {
  return String(prefix) + "_" + Utilities.getUuid();
}

function isChoiceType_(type) {
  return type === "choice" || type === "checkbox";
}

function validateSurveyPayload_(payload, existing) {
  var title = normalizeText_(payload && payload.title);
  var description = normalizeText_(payload && payload.description);
  var introMessage = normalizeText_(payload && payload.introMessage) || description;
  var completionMessage = normalizeText_(payload && payload.completionMessage) || "ご回答ありがとうございました。";
  var status = normalizeSurveyStatus_(payload && payload.status);
  var questions = Array.isArray(payload && payload.questions) ? payload.questions : [];
  var surveys = loadSurveysWithoutValidation_();
  var sortOrder = existing && existing.sortOrder !== undefined
    ? Number(existing.sortOrder)
    : payload && payload.sortOrder !== undefined
      ? Number(payload.sortOrder)
      : surveys.length;
  var acceptingResponses = !(payload && payload.acceptingResponses === false);
  var startAt = normalizeDateTime_(payload && payload.startAt);
  var endAt = normalizeDateTime_(payload && payload.endAt);

  if (!title) throw new Error("タイトルを入力してください。");
  if (!description) throw new Error("説明文を入力してください。");
  if (!questions.length) throw new Error("質問は1つ以上必要です。");
  if (startAt && endAt && new Date(startAt).getTime() > new Date(endAt).getTime()) {
    throw new Error("受付終了日時は開始日時以降にしてください。");
  }

  var normalizedQuestions = questions.map(function (question) {
    var type = QUESTION_TYPES.indexOf(question && question.type) >= 0 ? question.type : "text";
    var label = normalizeText_(question && question.label);
    var options = Array.isArray(question && question.options)
      ? question.options.map(normalizeText_).filter(Boolean)
      : [];
    var visibilityConditions = validateVisibilityConditions_(
      question && question.visibilityConditions,
      question && question.visibleWhen
    );

    if (!label) throw new Error("質問文を入力してください。");
    if (isChoiceType_(type) && options.length < 2) {
      throw new Error("選択式の質問は選択肢を2つ以上入力してください。");
    }

    return {
      id: normalizeText_(question && question.id) || makeId_("question"),
      label: label,
      type: type,
      required: question && question.required === false ? false : true,
      options: isChoiceType_(type) ? options : [],
      visibilityConditions: visibilityConditions,
      visibleWhen: visibilityConditions.length ? visibilityConditions[0] : null,
    };
  });

  return {
    id: existing && existing.id ? existing.id : normalizeText_(payload && payload.id) || makeId_("survey"),
    title: title,
    description: description,
    introMessage: introMessage,
    completionMessage: completionMessage,
    status: status,
    sortOrder: Number.isFinite(sortOrder) ? sortOrder : surveys.length,
    acceptingResponses: acceptingResponses,
    startAt: startAt,
    endAt: endAt,
    questions: normalizedQuestions,
    createdAt: existing && existing.createdAt ? String(existing.createdAt) : new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

function loadSurveysWithoutValidation_() {
  return parseJson_(PropertiesService.getScriptProperties().getProperty(SURVEYS_PROPERTY_KEY), SURVEYS) || SURVEYS;
}

function validateVisibleWhen_(visibleWhen) {
  if (!visibleWhen || typeof visibleWhen !== "object") return null;
  var questionId = normalizeText_(visibleWhen.questionId);
  var value = normalizeText_(visibleWhen.value);
  if (!questionId || !value) return null;
  return {
    questionId: questionId,
    value: value,
  };
}

function validateVisibilityConditions_(conditions, fallbackVisibleWhen) {
  var normalized = Array.isArray(conditions)
    ? conditions.map(validateVisibleWhen_).filter(Boolean)
    : [];
  if (normalized.length) return normalized;
  var fallback = validateVisibleWhen_(fallbackVisibleWhen);
  return fallback ? [fallback] : [];
}

function getQuestionVisibilityConditions_(question) {
  return validateVisibilityConditions_(
    question && question.visibilityConditions,
    question && question.visibleWhen
  );
}

function normalizeDateTime_(value) {
  var normalized = normalizeText_(value);
  if (!normalized) return "";
  var date = new Date(normalized);
  if (isNaN(date.getTime())) throw new Error("日時の形式が正しくありません。");
  return date.toISOString();
}

function createSurvey_(payload) {
  var surveys = loadSurveys_();
  var survey = validateSurveyPayload_(payload);
  surveys.unshift(survey);
  surveys = normalizeSurveyOrder_(surveys);
  saveSurveys_(surveys);
  ensureSurveySheet_(survey);
  appendAuditLog_("survey.create", {
    surveyId: survey.id,
    title: survey.title,
  });
  return cloneSurvey_(survey);
}

function updateSurveyDefinition_(surveyId, payload) {
  var surveys = loadSurveys_();
  var existing = null;
  for (var i = 0; i < surveys.length; i += 1) {
    if (surveys[i].id === surveyId) {
      existing = surveys[i];
      break;
    }
  }
  if (!existing) throw new Error("アンケートが見つかりません。");

  var survey = validateSurveyPayload_(payload, existing);
  surveys = surveys.map(function (item) {
    return item.id === surveyId ? survey : item;
  });
  surveys = normalizeSurveyOrder_(surveys);
  saveSurveys_(surveys);
  ensureSurveySheet_(survey);
  appendAuditLog_("survey.update", {
    surveyId: survey.id,
    title: survey.title,
  });
  return cloneSurvey_(survey);
}

function deleteSurveyDefinition_(surveyId) {
  var surveys = loadSurveys_();
  var filtered = surveys.filter(function (survey) {
    return survey.id !== surveyId;
  });
  if (filtered.length === surveys.length) throw new Error("アンケートが見つかりません。");
  saveSurveys_(normalizeSurveyOrder_(filtered));
  appendAuditLog_("survey.delete", {
    surveyId: surveyId,
  });
}

function replaceSurveys_(surveysPayload) {
  if (!Array.isArray(surveysPayload) || !surveysPayload.length) {
    throw new Error("復元するアンケートがありません。");
  }

  var existingMap = {};
  loadSurveys_().forEach(function (survey) {
    existingMap[survey.id] = survey;
  });

  var surveys = surveysPayload.map(function (survey, index) {
    var existing = existingMap[normalizeText_(survey && survey.id)] || null;
    var normalized = validateSurveyPayload_(Object.assign({}, survey, { sortOrder: index }), existing);
    normalized.sortOrder = index;
    return normalized;
  });

  saveSurveys_(normalizeSurveyOrder_(surveys));
  surveys.forEach(ensureSurveySheet_);
  appendAuditLog_("survey.restore", {
    count: surveys.length,
  });
  return getSurveys_();
}

function normalizeSurveyOrder_(surveys) {
  return surveys
    .slice()
    .sort(compareSurveyOrder_)
    .map(function (survey, index) {
      return Object.assign({}, survey, { sortOrder: index });
    });
}

function getPreferences_() {
  var properties = PropertiesService.getScriptProperties();
  var stored = parseJson_(properties.getProperty(PREFERENCES_PROPERTY_KEY), {});
  var preferences = {
    notificationEnabled: stored && stored.notificationEnabled !== false,
    notificationEmail: normalizeEmail_(stored && stored.notificationEmail) || normalizeEmail_(getOwnerEmail_()),
    notificationSubject: normalizeText_(stored && stored.notificationSubject) || DEFAULT_NOTIFICATION_SUBJECT_(),
    notificationBody: normalizeText_(stored && stored.notificationBody) || DEFAULT_NOTIFICATION_BODY_(),
    dataPolicyText: normalizeDataPolicyText_(stored && stored.dataPolicyText) || DEFAULT_DATA_POLICY_TEXT_(),
    requireConsent: stored && stored.requireConsent === false ? false : true,
    consentText: normalizeText_(stored && stored.consentText) || DEFAULT_CONSENT_TEXT_(),
    autoBackupEnabled: stored && stored.autoBackupEnabled === false ? false : true,
    backupHour: normalizeBackupHour_(stored && stored.backupHour),
    retentionDays: normalizeRetentionDays_(stored && stored.retentionDays),
    recoveryMemo: normalizeText_(stored && stored.recoveryMemo) || DEFAULT_RECOVERY_MEMO_(),
    twoFactorEnabled: false,
  };
  if (JSON.stringify(stored || {}) !== JSON.stringify(preferences)) {
    properties.setProperty(PREFERENCES_PROPERTY_KEY, JSON.stringify(preferences));
  }
  return preferences;
}

function updatePreferences_(payload) {
  var current = getPreferences_();
  var next = {
    notificationEnabled: payload && payload.notificationEnabled === false ? false : true,
    notificationEmail: normalizeEmail_(payload && payload.notificationEmail) || current.notificationEmail,
    notificationSubject: normalizeText_(payload && payload.notificationSubject) || current.notificationSubject,
    notificationBody: normalizeText_(payload && payload.notificationBody) || current.notificationBody,
    dataPolicyText: normalizeDataPolicyText_(payload && payload.dataPolicyText) || current.dataPolicyText,
    requireConsent: payload && payload.requireConsent === false ? false : true,
    consentText: normalizeText_(payload && payload.consentText) || current.consentText,
    autoBackupEnabled: payload && payload.autoBackupEnabled === false ? false : true,
    backupHour: normalizeBackupHour_(payload && payload.backupHour),
    retentionDays: normalizeRetentionDays_(payload && payload.retentionDays),
    recoveryMemo: normalizeText_(payload && payload.recoveryMemo) || current.recoveryMemo,
    twoFactorEnabled: false,
  };

  if (next.notificationEnabled && !next.notificationEmail) {
    throw new Error("通知メールアドレスを入力してください。");
  }

  PropertiesService.getScriptProperties().setProperty(PREFERENCES_PROPERTY_KEY, JSON.stringify(next));
  syncMaintenanceTrigger_(next);
  appendAuditLog_("preferences.update", {
    notificationEnabled: next.notificationEnabled,
    notificationEmail: next.notificationEmail,
    autoBackupEnabled: next.autoBackupEnabled,
    retentionDays: next.retentionDays,
    twoFactorEnabled: false,
  });
  return next;
}

function DEFAULT_DATA_POLICY_TEXT_() {
  return "ご回答内容と添付写真は、まゆみ助産院のアンケート管理と施術サポートのために利用します。";
}

function DEFAULT_NOTIFICATION_SUBJECT_() {
  return "【まゆみ助産院】新しいアンケート回答";
}

function DEFAULT_NOTIFICATION_BODY_() {
  return [
    "新しいアンケート回答が届きました。",
    "",
    "お名前: {{customerName}}",
    "アンケート: {{surveyTitle}}",
    "送信日時: {{submittedAt}}",
    "回答ID: {{responseId}}",
  ].join("\n");
}

function DEFAULT_CONSENT_TEXT_() {
  return "回答内容と添付写真の利用に同意します。";
}

function DEFAULT_RECOVERY_MEMO_() {
  return "障害時は Apps Script の実行ログ、スプレッドシート、Google ドライブの保存フォルダを確認してください。";
}

function normalizeBackupHour_(value) {
  var hour = Number(value);
  return Number.isFinite(hour) && hour >= 0 && hour <= 23 ? hour : 3;
}

function normalizeRetentionDays_(value) {
  var days = Number(value);
  return Number.isFinite(days) && days >= 0 ? Math.floor(days) : 365;
}

function publicAdminUser_(user) {
  return {
    id: normalizeText_(user && user.id),
    username: normalizeText_(user && user.username),
    email: normalizeEmail_(user && user.email),
    active: user && user.active === false ? false : true,
  };
}

function normalizeAdminUsers_(users, currentUsers) {
  var current = Array.isArray(currentUsers) ? currentUsers : [];
  var currentById = {};
  current.forEach(function (user) {
    currentById[user.id] = user;
  });

  var normalizedUsers = (Array.isArray(users) ? users : []).map(function (user, index) {
    var id = normalizeText_(user && user.id) || makeId_("admin");
    var username = normalizeText_(user && user.username);
    var existing = currentById[id] || null;
    var password = normalizeText_(user && user.password) || (existing && existing.password) || "";
    if (!username) throw new Error("管理者ログインIDを入力してください。");
    if (!password || password.length < 4) throw new Error("管理者パスワードは4文字以上で入力してください。");
    return {
      id: id,
      username: username,
      password: password,
      email: normalizeEmail_(user && user.email),
      active: user && user.active === false ? false : true,
      sortOrder: index,
    };
  });

  if (!normalizedUsers.length) {
    throw new Error("管理者アカウントは1件以上必要です。");
  }

  var seen = {};
  normalizedUsers.forEach(function (user) {
    if (seen[user.username]) throw new Error("管理者ログインIDが重複しています。");
    seen[user.username] = true;
  });

  return normalizedUsers;
}

function getAdminUsers_() {
  var properties = PropertiesService.getScriptProperties();
  var stored = parseJson_(properties.getProperty(ADMIN_USERS_PROPERTY_KEY), null);
  if (Array.isArray(stored) && stored.length) {
    var normalized = normalizeAdminUsers_(stored, stored);
    if (JSON.stringify(stored) !== JSON.stringify(normalized)) {
      properties.setProperty(ADMIN_USERS_PROPERTY_KEY, JSON.stringify(normalized));
    }
    return normalized;
  }

  var migrated = [{
    id: "admin_primary",
    username: normalizeText_(properties.getProperty("ADMIN_USERNAME")) || DEFAULT_ADMIN_USERNAME,
    password: String(properties.getProperty("ADMIN_PASSWORD") || "") || DEFAULT_ADMIN_PASSWORD,
    email: normalizeEmail_(getOwnerEmail_()),
    active: true,
    sortOrder: 0,
  }];

  if (migrated[0].username === LEGACY_ADMIN_USERNAME) migrated[0].username = DEFAULT_ADMIN_USERNAME;
  if (!migrated[0].password || migrated[0].password === LEGACY_ADMIN_PASSWORD) migrated[0].password = DEFAULT_ADMIN_PASSWORD;

  properties.setProperty(ADMIN_USERS_PROPERTY_KEY, JSON.stringify(migrated));
  properties.setProperty("ADMIN_USERNAME", migrated[0].username);
  properties.setProperty("ADMIN_PASSWORD", migrated[0].password);
  return migrated;
}

function findAdminUserByUsername_(loginId) {
  var username = normalizeText_(loginId);
  var users = getAdminUsers_();
  for (var i = 0; i < users.length; i += 1) {
    if (users[i].active !== false && users[i].username === username) return users[i];
  }
  return null;
}

function updateAdminUsers_(users) {
  var normalized = normalizeAdminUsers_(users, getAdminUsers_());
  PropertiesService.getScriptProperties().setProperty(ADMIN_USERS_PROPERTY_KEY, JSON.stringify(normalized));
  PropertiesService.getScriptProperties().setProperty("ADMIN_USERNAME", normalized[0].username);
  PropertiesService.getScriptProperties().setProperty("ADMIN_PASSWORD", normalized[0].password);
  normalized.forEach(function (user) {
    clearLoginFailures_(user.username);
  });
  appendAuditLog_("admin.users.update", {
    count: normalized.length,
  });
  return normalized.map(publicAdminUser_);
}

function getOtpSessions_() {
  return parseJson_(PropertiesService.getScriptProperties().getProperty(OTP_SESSIONS_PROPERTY_KEY), []);
}

function saveOtpSessions_(sessions) {
  PropertiesService.getScriptProperties().setProperty(OTP_SESSIONS_PROPERTY_KEY, JSON.stringify(sessions || []));
}

function pruneOtpSessions_(sessions) {
  var nowTime = Date.now();
  return (Array.isArray(sessions) ? sessions : []).filter(function (session) {
    return Number(session.expiresAt || 0) > nowTime;
  });
}

function createOtpSession_(user) {
  var code = String(Math.floor(100000 + Math.random() * 900000));
  var session = {
    id: makeId_("otp"),
    username: user.username,
    code: code,
    expiresAt: Date.now() + OTP_TTL_MS,
  };
  var sessions = pruneOtpSessions_(getOtpSessions_());
  sessions = sessions.filter(function (item) {
    return item.username !== user.username;
  });
  sessions.unshift(session);
  saveOtpSessions_(sessions);
  return session;
}

function sendOtpEmail_(user, session) {
  var preferences = getPreferences_();
  var to = normalizeEmail_(user.email) || preferences.notificationEmail || normalizeEmail_(getOwnerEmail_());
  if (!to) throw new Error("2段階認証メールの送信先が設定されていません。");
  MailApp.sendEmail(
    to,
    "【まゆみ助産院】確認コード",
    [
      "確認コードを入力してください。",
      "",
      "ログインID: " + user.username,
      "確認コード: " + session.code,
      "有効期限: " + new Date(session.expiresAt).toLocaleString("ja-JP"),
    ].join("\n")
  );
}

function verifyAdminOtp_(sessionId, code) {
  var normalizedSessionId = normalizeText_(sessionId);
  var normalizedCode = normalizeText_(code);
  var sessions = pruneOtpSessions_(getOtpSessions_());
  var session = null;
  var remaining = [];
  sessions.forEach(function (item) {
    if (item.id === normalizedSessionId) {
      session = item;
      return;
    }
    remaining.push(item);
  });
  if (!session) throw new Error("確認コードの有効期限が切れました。もう一度ログインしてください。");
  if (session.code !== normalizedCode) throw new Error("確認コードが違います。");
  saveOtpSessions_(remaining);
  clearLoginFailures_(session.username);
  var expiresAt = Date.now() + 8 * 60 * 60 * 1000;
  appendAuditLog_("admin.login.otp", {
    loginId: session.username,
  });
  return {
    token: makeToken_(session.username, expiresAt),
    expiresAt: new Date(expiresAt).toISOString(),
  };
}

function getBackupFolder_() {
  var rootFolder = getRootPhotoFolder_();
  var folders = rootFolder.getFoldersByName("system-backups");
  return folders.hasNext() ? folders.next() : rootFolder.createFolder("system-backups");
}

function getMaintenanceTriggerIds_() {
  return parseJson_(PropertiesService.getScriptProperties().getProperty(MAINTENANCE_TRIGGER_IDS_PROPERTY_KEY), []);
}

function saveMaintenanceTriggerIds_(ids) {
  PropertiesService.getScriptProperties().setProperty(
    MAINTENANCE_TRIGGER_IDS_PROPERTY_KEY,
    JSON.stringify(ids || [])
  );
}

function syncMaintenanceTrigger_(preferences) {
  var triggerIds = getMaintenanceTriggerIds_();
  ScriptApp.getProjectTriggers().forEach(function (trigger) {
    if (triggerIds.indexOf(trigger.getUniqueId()) >= 0) {
      ScriptApp.deleteTrigger(trigger);
    }
  });
  saveMaintenanceTriggerIds_([]);
  if (!preferences || (!preferences.autoBackupEnabled && !(preferences.retentionDays > 0))) return;
  var trigger = ScriptApp.newTrigger("runScheduledMaintenance")
    .timeBased()
    .everyDays(1)
    .atHour(preferences.backupHour || 3)
    .create();
  saveMaintenanceTriggerIds_([trigger.getUniqueId()]);
}

function renderTemplate_(template, data) {
  var result = String(template || "");
  Object.keys(data || {}).forEach(function (key) {
    result = result.replace(new RegExp("{{" + key + "}}", "g"), String(data[key] || ""));
  });
  return result;
}

function writeBackupFile_() {
  var backupFolder = getBackupFolder_();
  var payload = {
    exportedAt: new Date().toISOString(),
    surveys: getSurveys_(),
    responses: getResponses_({ includeTrashed: true }),
    preferences: getPreferences_(),
    customerMemos: getCustomerMemos_(),
    adminUsers: getAdminUsers_().map(publicAdminUser_),
  };
  var fileName = "backup_" + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyyMMdd_HHmmss") + ".json";
  backupFolder.createFile(fileName, JSON.stringify(payload, null, 2), MimeType.PLAIN_TEXT);
}

function purgeOldTrashResponses_() {
  var preferences = getPreferences_();
  var retentionDays = Number(preferences.retentionDays || 0);
  if (!(retentionDays > 0)) return 0;
  var threshold = Date.now() - retentionDays * 24 * 60 * 60 * 1000;
  var purged = 0;
  getResponses_({ includeTrashed: true }).forEach(function (response) {
    var referenceTime = response.managedAt || response.submittedAt;
    if (response.status !== "trash") return;
    if (new Date(referenceTime).getTime() > threshold) return;
    if (purgeResponse_(response.id)) purged += 1;
  });
  return purged;
}

function runScheduledMaintenance() {
  var preferences = getPreferences_();
  if (preferences.autoBackupEnabled) {
    writeBackupFile_();
  }
  var purged = purgeOldTrashResponses_();
  appendAuditLog_("maintenance.run", {
    purged: purged,
    autoBackupEnabled: preferences.autoBackupEnabled,
  });
  return {
    ok: true,
    purged: purged,
    autoBackupEnabled: preferences.autoBackupEnabled,
  };
}

function normalizeDataPolicyText_(value) {
  return normalizeText_(value)
    .replace(/保存先は Google スプレッドシートおよび Google ドライブです。?/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeCustomerMemoRecord_(value) {
  if (!value) return {
    latestMemo: "",
    entries: [],
  };
  if (typeof value === "string") {
    var latestMemo = normalizeText_(value);
    return {
      latestMemo: latestMemo,
      entries: latestMemo ? [{ at: new Date().toISOString(), memo: latestMemo }] : [],
    };
  }
  var latest = normalizeText_(value.latestMemo || value.memo);
  var entries = Array.isArray(value.entries)
    ? value.entries
        .map(function (entry) {
          return {
            at: normalizeText_(entry && entry.at) || new Date().toISOString(),
            memo: normalizeText_(entry && (entry.memo || entry.content)),
          };
        })
        .filter(function (entry) { return entry.memo; })
    : [];
  if (!latest && entries.length) latest = entries[0].memo;
  return {
    latestMemo: latest,
    entries: entries,
  };
}

function getCustomerMemos_() {
  var stored = parseJson_(PropertiesService.getScriptProperties().getProperty(CUSTOMER_MEMOS_PROPERTY_KEY), {});
  var normalized = {};
  Object.keys(stored || {}).forEach(function (customerName) {
    normalized[customerName] = normalizeCustomerMemoRecord_(stored[customerName]);
  });
  if (JSON.stringify(stored || {}) !== JSON.stringify(normalized)) {
    PropertiesService.getScriptProperties().setProperty(CUSTOMER_MEMOS_PROPERTY_KEY, JSON.stringify(normalized));
  }
  return normalized;
}

function updateCustomerMemo_(customerName, memo) {
  var name = normalizeText_(customerName);
  if (!name) throw new Error("お客様名が必要です。");
  var memos = getCustomerMemos_();
  var normalizedMemo = normalizeText_(memo);
  if (normalizedMemo) {
    var current = normalizeCustomerMemoRecord_(memos[name]);
    var entries = Array.isArray(current.entries) ? current.entries.slice() : [];
    if (normalizedMemo !== current.latestMemo) {
      entries.unshift({
        at: new Date().toISOString(),
        memo: normalizedMemo,
      });
    }
    memos[name] = {
      latestMemo: normalizedMemo,
      entries: entries.slice(0, 100),
    };
  } else {
    delete memos[name];
  }
  PropertiesService.getScriptProperties().setProperty(CUSTOMER_MEMOS_PROPERTY_KEY, JSON.stringify(memos));
  appendAuditLog_("customer.memo.update", {
    customerName: name,
  });
  return memos;
}

function getLogs_() {
  return {
    auditLogs: getStoredLogs_(AUDIT_LOGS_PROPERTY_KEY),
    errorLogs: getStoredLogs_(ERROR_LOGS_PROPERTY_KEY),
  };
}

function getStoredLogs_(propertyKey) {
  return parseJson_(PropertiesService.getScriptProperties().getProperty(propertyKey), []);
}

function appendStoredLog_(propertyKey, entry) {
  var logs = getStoredLogs_(propertyKey);
  logs.unshift(entry);
  logs = logs.slice(0, MAX_LOG_ENTRIES);
  PropertiesService.getScriptProperties().setProperty(propertyKey, JSON.stringify(logs));
}

function appendAuditLog_(type, detail) {
  appendStoredLog_(AUDIT_LOGS_PROPERTY_KEY, {
    at: new Date().toISOString(),
    type: type,
    detail: detail || {},
  });
}

function appendErrorLog_(source, message, detail) {
  appendStoredLog_(ERROR_LOGS_PROPERTY_KEY, {
    at: new Date().toISOString(),
    source: source,
    message: message,
    detail: detail || {},
  });
}

function logClientError_(payload) {
  appendErrorLog_(
    normalizeText_(payload && payload.source) || "client",
    normalizeText_(payload && payload.message) || "不明なエラー",
    payload && payload.detail ? payload.detail : {}
  );
  return { ok: true };
}

function canAcceptSurveyResponses_(survey) {
  if (normalizeSurveyStatus_(survey && survey.status) !== "published") return false;
  if (survey && survey.acceptingResponses === false) return false;
  var nowTime = Date.now();
  if (survey && survey.startAt && new Date(survey.startAt).getTime() > nowTime) return false;
  if (survey && survey.endAt && new Date(survey.endAt).getTime() < nowTime) return false;
  return true;
}

function assertSurveyCanAcceptResponses_(survey) {
  if (!canAcceptSurveyResponses_(survey)) {
    throw new Error("このアンケートは現在受付していません。");
  }
}

function saveResponse_(body) {
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    ensureSpreadsheet_();
    var payload = body.payload || {};
    var responseId = body.responseId || payload.responseId || Utilities.getUuid();
    var existing = getResponseById_(responseId);
    if (existing) return { response: existing };

    var survey = findSurvey_(payload.surveyId);
    assertSurveyCanAcceptResponses_(survey);
    var customer = payload.customer || {};
    var customerName = normalizeText_(customer.name);
    if (!customerName) throw new Error("お名前を入力してください。");
    var customerClientId = body.clientId || payload.clientId || "";

    var answers = buildAnswers_(survey, payload.answers || [], responseId, customerName);
    var duplicate = findDuplicateResponse_(survey, customerName, customerClientId, answers);
    if (duplicate) return { response: duplicate };

    var response = {
      id: responseId,
      surveyId: survey.id,
      surveyTitle: survey.title,
      customerClientId: customerClientId,
      customerName: customerName,
      customerEmail: "",
      answers: answers,
      status: "new",
      adminMemo: "",
      submittedAt: new Date().toISOString(),
    };
    appendMasterRow_(response);
    appendSurveyRow_(survey, response);
    notifyNewResponse_(response);
    appendAuditLog_("response.create", {
      responseId: response.id,
      surveyId: response.surveyId,
      customerName: response.customerName,
    });
    return { response: response };
  } catch (error) {
    appendErrorLog_("saveResponse", error.message || "保存エラー", {
      responseId: body && body.responseId,
      surveyId: body && body.payload && body.payload.surveyId,
    });
    throw error;
  } finally {
    lock.releaseLock();
  }
}

function buildAnswers_(survey, rawAnswers, responseId, customerName) {
  var rawAnswerMap = buildRawAnswerMap_(rawAnswers);
  return survey.questions.map(function (question) {
    var visible = isQuestionVisible_(question, rawAnswerMap, survey);
    var required = isQuestionRequired_(question, visible, survey);
    var raw = findRawAnswer_(rawAnswers, question.id);
    if (question.type === "photo") {
      var requiredPhotoCount = getPhotoQuestionRequiredCount_(question, visible, survey);
      var files = visible
        ? syncPhotoFiles_(
            [],
            raw.files || [],
            responseId,
            question.id,
            customerName,
            getPhotoQuestionMaxFiles_(question, survey)
          )
        : [];
      if (visible && requiredPhotoCount && files.length < requiredPhotoCount) {
        throw new Error(requiredPhotoCount === 1 ? "未回答の質問があります。" : "写真を" + requiredPhotoCount + "枚添付してください。");
      }
      return {
        questionId: question.id,
        label: question.label,
        type: question.type,
        value: files.length ? files.map(function (file) { return file.url; }).join(", ") : "",
        files: files,
      };
    }

    var values = Array.isArray(raw.value) ? raw.value : [raw.value];
    values = values.map(normalizeText_).filter(Boolean);
    if (required && !values.length) {
      throw new Error("未回答の質問があります。");
    }
    if (visible && question.type === "rating" && values[0] && ["1", "2", "3", "4", "5"].indexOf(values[0]) === -1) {
      throw new Error("評価は1から5で回答してください。");
    }
    if (visible && question.type === "choice" && values[0] && question.options.indexOf(values[0]) === -1) {
      throw new Error("選択肢から回答してください。");
    }
    if (visible && question.type === "checkbox" && values.some(function (item) { return question.options.indexOf(item) === -1; })) {
      throw new Error("選択肢から回答してください。");
    }
    return {
      questionId: question.id,
      label: question.label,
      type: question.type,
      value: visible ? values.join(", ") : "",
    };
  });
}

function findRawAnswer_(answers, questionId) {
  for (var i = 0; i < answers.length; i += 1) {
    if (answers[i].questionId === questionId) return answers[i];
  }
  return {};
}

function updatePublicResponse_(body) {
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var payload = body.payload || {};
    var responseId = body.responseId || payload.responseId || "";
    var existing = getResponseById_(responseId);
    if (!existing) throw new Error("回答が見つかりません。");
    if (!canCustomerEditResponse_(existing, body.clientId || payload.clientId || "", payload.customer && payload.customer.name)) {
      throw new Error("この回答は修正できません。");
    }

    var survey = findSurvey_(existing.surveyId);
    assertSurveyCanAcceptResponses_(survey);
    var updated = buildUpdatedPublicResponse_(existing, survey, payload.answers || []);
    var sheet = getSpreadsheet_().getSheetByName(MASTER_SHEET_NAME);
    var rowIndex = findMasterRowIndex_(responseId);
    if (!rowIndex) throw new Error("回答が見つかりません。");
    sheet.getRange(rowIndex, 10).setValue(JSON.stringify(updated.answers));
    sheet.getRange(rowIndex, 11).setValue(JSON.stringify(collectFilesFromAnswers_(updated.answers)));
    sheet.getRange(rowIndex, 12).setValue(new Date().toISOString());
    updateSurveySheetResponse_(survey, updated);
    appendAuditLog_("response.public_edit", {
      responseId: existing.id,
      surveyId: existing.surveyId,
      customerName: existing.customerName,
    });
    return { response: getResponseById_(responseId) };
  } catch (error) {
    appendErrorLog_("updatePublicResponse", error.message || "更新エラー", {
      responseId: body && body.responseId,
    });
    throw error;
  } finally {
    lock.releaseLock();
  }
}

function canCustomerEditResponse_(response, clientId, customerName) {
  if (!response) return false;
  if (response.customerClientId && String(response.customerClientId) !== String(clientId || "")) return false;
  if (normalizeText_(response.customerName) !== normalizeText_(customerName)) return false;
  return Date.now() - new Date(response.submittedAt).getTime() <= RESPONSE_EDIT_WINDOW_MS;
}

function buildUpdatedPublicResponse_(existing, survey, rawAnswers) {
  var answerMap = {};
  (Array.isArray(existing.answers) ? existing.answers : []).forEach(function (answer) {
    answerMap[answer.questionId] = answer;
  });
  var rawAnswerMap = buildRawAnswerMap_(rawAnswers);

  var answers = survey.questions.map(function (question) {
    var raw = findRawAnswer_(rawAnswers, question.id);
    var visible = isQuestionVisible_(question, rawAnswerMap, survey);
    var required = isQuestionRequired_(question, visible, survey);
    if (question.type === "photo") {
      var requiredPhotoCount = getPhotoQuestionRequiredCount_(question, visible, survey);
      var existingAnswer = answerMap[question.id] || { files: [] };
      var files = visible
        ? syncPhotoFiles_(
            existingAnswer.files || [],
            raw.files || [],
            existing.id,
            question.id,
            existing.customerName,
            getPhotoQuestionMaxFiles_(question, survey)
          )
        : [];
      if (visible && requiredPhotoCount && files.length < requiredPhotoCount) {
        throw new Error(requiredPhotoCount === 1 ? "未回答の質問があります。" : "写真を" + requiredPhotoCount + "枚添付してください。");
      }
      return {
        questionId: question.id,
        label: question.label,
        type: question.type,
        value: files.length ? files.map(function (file) { return file.url; }).join(", ") : "",
        files: files,
      };
    }

    var values = Array.isArray(raw.value) ? raw.value : [raw.value];
    values = values.map(normalizeText_).filter(Boolean);
    var value = visible ? values.join(", ") : "";

    if (visible && required && !value) throw new Error("未回答の質問があります。");
    if (visible && question.type === "rating" && value && ["1", "2", "3", "4", "5"].indexOf(value) === -1) {
      throw new Error("評価は1から5で回答してください。");
    }
    if (visible && question.type === "choice" && value && question.options.indexOf(value) === -1) {
      throw new Error("選択肢から回答してください。");
    }
    if (visible && question.type === "checkbox" && values.some(function (item) { return question.options.indexOf(item) === -1; })) {
      throw new Error("選択肢から回答してください。");
    }

    return {
      questionId: question.id,
      label: question.label,
      type: question.type,
      value: value,
    };
  });

  return Object.assign({}, existing, {
    answers: answers,
    managedAt: new Date().toISOString(),
  });
}

function findDuplicateResponse_(survey, customerName, customerClientId, answers) {
  var signature = makeResponseSignature_(survey.id, customerName, answers);
  var nowTime = Date.now();
  var responses = getResponses_({});
  for (var i = 0; i < responses.length; i += 1) {
    var response = responses[i];
    if (response.surveyId !== survey.id) continue;
    if (normalizeText_(response.customerName) !== normalizeText_(customerName)) continue;
    if (String(response.customerClientId || "") !== String(customerClientId || "")) continue;
    if (nowTime - new Date(response.submittedAt).getTime() > DUPLICATE_RESPONSE_WINDOW_MS) continue;
    if (makeResponseSignature_(response.surveyId, response.customerName, response.answers) === signature) {
      return response;
    }
  }
  return null;
}

function makeResponseSignature_(surveyId, customerName, answers) {
  return JSON.stringify({
    surveyId: surveyId,
    customerName: normalizeText_(customerName),
    answers: (Array.isArray(answers) ? answers : []).map(function (answer) {
      return {
        questionId: answer.questionId,
        value: normalizeText_(answer.value),
        files: Array.isArray(answer.files)
          ? answer.files.map(function (file) { return normalizeText_(file.fileId || file.name || file.url); })
          : [],
      };
    }),
  });
}

function savePhotoFiles_(files, responseId, questionId, customerName) {
  if (!Array.isArray(files) || !files.length) return [];
  var folder = getCustomerPhotoFolder_(customerName);
  var folderName = folder.getName();
  var folderUrl = folder.getUrl();
  return files.slice(0, 6).map(function (file, index) {
    var dataUrl = String(file.dataUrl || "");
    var match = dataUrl.match(/^data:(image\/(?:jpeg|jpg|png|webp));base64,(.+)$/i);
    if (!match) throw new Error("写真データの形式が正しくありません。");

    var mimeType = match[1].replace("image/jpg", "image/jpeg");
    var extension = mimeType.split("/")[1].replace("jpeg", "jpg");
    var fileName = sanitizeFileName_(
      responseId + "_" + questionId + "_" + (index + 1) + "_" + (file.name || "photo." + extension)
    );
    var blob = Utilities.newBlob(Utilities.base64Decode(match[2]), mimeType, fileName);
    var driveFile = folder.createFile(blob);
    driveFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    var fileId = driveFile.getId();
    return {
      name: file.name || fileName,
      type: mimeType,
      capturedAt: normalizeText_(file.capturedAt),
      fileId: fileId,
      folderName: folderName,
      folderUrl: folderUrl,
      url: driveFile.getUrl(),
      previewUrl: "https://drive.google.com/uc?export=view&id=" + fileId,
      downloadUrl: "https://drive.google.com/uc?export=download&id=" + fileId,
      thumbnailUrl: "https://drive.google.com/thumbnail?id=" + fileId + "&sz=w1200",
    };
  });
}

function syncPhotoFiles_(existingFiles, nextFiles, responseId, questionId, customerName, maxFiles) {
  var currentFiles = Array.isArray(existingFiles) ? existingFiles : [];
  var requestedFiles = Array.isArray(nextFiles) ? nextFiles : [];
  var existingById = {};
  var keptIds = {};
  var keptFiles = [];
  var newFiles = [];
  var normalizedMaxFiles = Math.max(1, Number(maxFiles || 6));

  currentFiles.forEach(function (file) {
    if (file && file.fileId) existingById[String(file.fileId)] = file;
  });

  requestedFiles.forEach(function (file) {
    if (!file) return;
    if (file.dataUrl) {
      newFiles.push(file);
      return;
    }
    var fileId = normalizeText_(file.fileId);
    if (!fileId || !existingById[fileId] || keptIds[fileId]) return;
    keptIds[fileId] = true;
    keptFiles.push(existingById[fileId]);
  });

  if (keptFiles.length + newFiles.length > normalizedMaxFiles) {
    throw new Error("写真は" + normalizedMaxFiles + "枚まで添付できます。");
  }

  currentFiles.forEach(function (file) {
    var fileId = normalizeText_(file && file.fileId);
    if (!fileId || keptIds[fileId]) return;
    try {
      DriveApp.getFileById(fileId).setTrashed(true);
    } catch (error) {
      // Ignore already-deleted or inaccessible files.
    }
  });

  return keptFiles.concat(savePhotoFiles_(newFiles, responseId, questionId, customerName));
}

function sanitizeFileName_(value) {
  return String(value).replace(/[\\/:*?"<>|#%{}]/g, "_").slice(0, 180);
}

function sanitizeFolderName_(value) {
  return normalizeText_(value).replace(/[\\/:*?"<>|#%{}]/g, "_").slice(0, 120);
}

function getRootPhotoFolder_() {
  var properties = PropertiesService.getScriptProperties();
  var folderId = normalizeText_(properties.getProperty("PHOTO_ROOT_FOLDER_ID"));
  if (folderId) {
    try {
      return DriveApp.getFolderById(folderId);
    } catch (error) {
      // Recreate the folder if the saved id is no longer accessible.
    }
  }

  var driveRoot = DriveApp.getRootFolder();
  var folders = driveRoot.getFoldersByName(ROOT_DRIVE_FOLDER_NAME);
  var folder = folders.hasNext() ? folders.next() : driveRoot.createFolder(ROOT_DRIVE_FOLDER_NAME);
  properties.setProperty("PHOTO_ROOT_FOLDER_ID", folder.getId());
  return folder;
}

function getCustomerPhotoFolder_(customerName) {
  var rootFolder = getRootPhotoFolder_();
  var folderName = sanitizeFolderName_(customerName) || "お名前未設定";
  var folders = rootFolder.getFoldersByName(folderName);
  return folders.hasNext() ? folders.next() : rootFolder.createFolder(folderName);
}

function getResponses_(filter) {
  ensureSpreadsheet_();
  var rows = readMasterRows_();
  return rows
    .filter(function (response) {
      return (!filter.clientId || response.customerClientId === filter.clientId) &&
        (!filter.customerName || response.customerName === String(filter.customerName)) &&
        (filter.includeTrashed ? true : response.status !== "trash");
    })
    .sort(function (a, b) {
      return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
    });
}

function getResponseById_(responseId) {
  var rows = readMasterRows_();
  for (var i = 0; i < rows.length; i += 1) {
    if (rows[i].id === responseId) return rows[i];
  }
  return null;
}

function readMasterRows_() {
  var sheet = getSpreadsheet_().getSheetByName(MASTER_SHEET_NAME);
  if (!sheet || sheet.getLastRow() < 2) return [];
  var values = sheet.getRange(2, 1, sheet.getLastRow() - 1, MASTER_HEADERS.length).getValues();
  return values
    .filter(function (row) { return row[1]; })
    .map(function (row) {
      return {
        submittedAt: stringifyDate_(row[0]),
        id: String(row[1]),
        surveyId: String(row[2]),
        surveyTitle: String(row[3]),
        customerClientId: String(row[4]),
        customerName: String(row[5]),
        customerEmail: String(row[6]),
        status: normalizeStatus_(row[7]),
        adminMemo: String(row[8] || ""),
        answers: parseJson_(row[9], []),
        files: parseJson_(row[10], []),
        managedAt: stringifyDate_(row[11]),
      };
    });
}

function appendMasterRow_(response) {
  var sheet = getSpreadsheet_().getSheetByName(MASTER_SHEET_NAME);
  var files = [];
  response.answers.forEach(function (answer) {
    if (Array.isArray(answer.files)) files = files.concat(answer.files);
  });
  sheet.appendRow([
    response.submittedAt,
    response.id,
    response.surveyId,
    response.surveyTitle,
    response.customerClientId,
    response.customerName,
    response.customerEmail,
    response.status,
    response.adminMemo,
    JSON.stringify(response.answers),
    JSON.stringify(files),
    "",
  ]);
}

function appendSurveyRow_(survey, response) {
  var sheet = ensureSurveySheet_(survey);
  var answerMap = {};
  response.answers.forEach(function (answer) {
    answerMap[answer.questionId] = answer.value || "";
  });
  var row = [
    response.submittedAt,
    response.id,
    response.customerClientId,
    response.customerName,
    response.customerEmail,
    response.status,
    response.adminMemo,
  ];
  survey.questions.forEach(function (question) {
    row.push(answerMap[question.id] || "");
  });
  sheet.appendRow(row);
}

function updateResponse_(responseId, status, adminMemo, answers) {
  ensureSpreadsheet_();
  var sheet = getSpreadsheet_().getSheetByName(MASTER_SHEET_NAME);
  var rowIndex = findMasterRowIndex_(responseId);
  if (!rowIndex) throw new Error("回答が見つかりません。");
  var existing = getResponseById_(responseId);
  if (!existing) throw new Error("回答が見つかりません。");
  var survey = findSurvey_(existing.surveyId);
  var normalizedStatus = normalizeStatus_(status);
  var memo = normalizeText_(adminMemo);
  var normalizedAnswers = normalizeAdminAnswers_(survey, existing.answers, answers);
  var files = collectFilesFromAnswers_(normalizedAnswers);
  var managedAt = new Date().toISOString();
  sheet.getRange(rowIndex, 8).setValue(normalizedStatus);
  sheet.getRange(rowIndex, 9).setValue(memo);
  sheet.getRange(rowIndex, 10).setValue(JSON.stringify(normalizedAnswers));
  sheet.getRange(rowIndex, 11).setValue(JSON.stringify(files));
  sheet.getRange(rowIndex, 12).setValue(managedAt);

  updateSurveySheetResponse_(survey, Object.assign({}, existing, {
    status: normalizedStatus,
    adminMemo: memo,
    answers: normalizedAnswers,
  }));
  appendAuditLog_("response.admin_update", {
    responseId: responseId,
    surveyId: existing.surveyId,
    customerName: existing.customerName,
    status: normalizedStatus,
  });
  return getResponseById_(responseId);
}

function deleteResponse_(responseId) {
  return trashResponse_(responseId);
}

function trashResponse_(responseId) {
  ensureSpreadsheet_();
  var response = getResponseById_(responseId);
  if (!response) throw new Error("回答が見つかりません。");
  updateResponse_(responseId, "trash", response.adminMemo, response.answers);
  appendAuditLog_("response.trash", {
    responseId: responseId,
    surveyId: response.surveyId,
    customerName: response.customerName,
  });
  return getResponseById_(responseId);
}

function purgeResponse_(responseId) {
  ensureSpreadsheet_();
  var response = getResponseById_(responseId);
  if (!response) return false;
  deleteResponseFiles_(response);
  deleteRowByResponseId_(getSpreadsheet_().getSheetByName(response.surveyTitle), responseId, 2);
  deleteRowByResponseId_(getSpreadsheet_().getSheetByName(MASTER_SHEET_NAME), responseId, 2);
  appendAuditLog_("response.purge", {
    responseId: responseId,
    surveyId: response.surveyId,
    customerName: response.customerName,
  });
  return true;
}

function deleteResponseFiles_(response) {
  var files = Array.isArray(response.files) ? response.files : [];
  files.forEach(function (file) {
    var fileId = normalizeText_(file.fileId);
    if (!fileId) return;
    try {
      DriveApp.getFileById(fileId).setTrashed(true);
    } catch (error) {
      // Ignore already-deleted or inaccessible files.
    }
  });
}

function collectFilesFromAnswers_(answers) {
  var files = [];
  (Array.isArray(answers) ? answers : []).forEach(function (answer) {
    if (Array.isArray(answer.files)) files = files.concat(answer.files);
  });
  return files;
}

function normalizeAdminAnswers_(survey, existingAnswers, answers) {
  var existingMap = {};
  (Array.isArray(existingAnswers) ? existingAnswers : []).forEach(function (answer) {
    existingMap[answer.questionId] = answer;
  });

  var answerMap = {};
  (Array.isArray(answers) ? answers : []).forEach(function (answer) {
    answerMap[answer.questionId] = answer;
  });

  var rawAnswerMap = buildRawAnswerMap_(answers);
  return survey.questions.map(function (question) {
    var existing = existingMap[question.id] || {
      questionId: question.id,
      label: question.label,
      type: question.type,
      value: "",
    };
    var visible = isQuestionVisible_(question, rawAnswerMap, survey);
    var required = isQuestionRequired_(question, visible, survey);
    if (question.type === "photo") {
      return visible ? existing : Object.assign({}, existing, { value: "", files: [] });
    }

    var raw = answerMap[question.id] || {};
    var values = Array.isArray(raw.value) ? raw.value : [raw.value];
    values = values.map(normalizeText_).filter(Boolean);
    var value = visible ? values.join(", ") : "";

    if (required && !value) {
      throw new Error("未回答の質問があります。");
    }
    if (visible && question.type === "rating" && value && ["1", "2", "3", "4", "5"].indexOf(value) === -1) {
      throw new Error("評価は1から5で回答してください。");
    }
    if (visible && question.type === "choice" && value && question.options.indexOf(value) === -1) {
      throw new Error("選択肢から回答してください。");
    }
    if (visible && question.type === "checkbox" && values.some(function (item) { return question.options.indexOf(item) === -1; })) {
      throw new Error("選択肢から回答してください。");
    }

    return {
      questionId: question.id,
      label: question.label,
      type: question.type,
      value: value,
    };
  });
}

function updateSurveySheetManagement_(sheetName, responseId, status, adminMemo) {
  var sheet = getSpreadsheet_().getSheetByName(sheetName);
  if (!sheet) return;
  var rowIndex = findRowIndexByColumn_(sheet, 2, responseId);
  if (!rowIndex) return;
  sheet.getRange(rowIndex, 6).setValue(status);
  sheet.getRange(rowIndex, 7).setValue(adminMemo);
}

function updateSurveySheetResponse_(survey, response) {
  var sheet = ensureSurveySheet_(survey);
  var rowIndex = findRowIndexByColumn_(sheet, 2, response.id);
  if (!rowIndex) return;

  var answerMap = {};
  response.answers.forEach(function (answer) {
    answerMap[answer.questionId] = answer.value || "";
  });

  var row = [
    response.submittedAt,
    response.id,
    response.customerClientId,
    response.customerName,
    response.customerEmail,
    response.status,
    response.adminMemo,
  ];
  survey.questions.forEach(function (question) {
    row.push(answerMap[question.id] || "");
  });
  sheet.getRange(rowIndex, 1, 1, row.length).setValues([row]);
}

function deleteRowByResponseId_(sheet, responseId, column) {
  if (!sheet) return;
  var rowIndex = findRowIndexByColumn_(sheet, column, responseId);
  if (rowIndex) sheet.deleteRow(rowIndex);
}

function findMasterRowIndex_(responseId) {
  return findRowIndexByColumn_(getSpreadsheet_().getSheetByName(MASTER_SHEET_NAME), 2, responseId);
}

function findRowIndexByColumn_(sheet, column, value) {
  if (!sheet || sheet.getLastRow() < 2) return 0;
  var values = sheet.getRange(2, column, sheet.getLastRow() - 1, 1).getValues();
  for (var i = 0; i < values.length; i += 1) {
    if (String(values[i][0]) === String(value)) return i + 2;
  }
  return 0;
}

function ensureSpreadsheet_() {
  var spreadsheet = getSpreadsheet_();
  ensureSheet_(spreadsheet, MASTER_SHEET_NAME, MASTER_HEADERS);
  getSurveys_().forEach(ensureSurveySheet_);
}

function ensureSurveySheet_(survey) {
  var headers = ["送信日時", "回答ID", "端末ID", "お名前", "メールアドレス", "対応状況", "管理メモ"];
  survey.questions.forEach(function (question) {
    headers.push(question.label);
  });
  return ensureSheet_(getSpreadsheet_(), survey.title, headers);
}

function ensureSheet_(spreadsheet, name, headers) {
  var sheet = spreadsheet.getSheetByName(name);
  if (!sheet) sheet = spreadsheet.insertSheet(name);
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.setFrozenRows(1);
  return sheet;
}

function getAdminInfo_() {
  var spreadsheet = getSpreadsheet_();
  var rootFolder = getRootPhotoFolder_();
  var credentials = getAdminCredentials_();
  var backupFolder = getBackupFolder_();
  return {
    backend: "gas",
    adminUsername: credentials.username,
    adminUsers: getAdminUsers_().map(publicAdminUser_),
    ownerEmail: getOwnerEmail_(),
    spreadsheetId: spreadsheet.getId(),
    spreadsheetUrl: spreadsheet.getUrl(),
    masterSheetName: MASTER_SHEET_NAME,
    photoRootFolderName: ROOT_DRIVE_FOLDER_NAME,
    photoRootFolderUrl: rootFolder.getUrl(),
    backupFolderUrl: backupFolder.getUrl(),
    version: VERSION,
  };
}

function getSpreadsheet_() {
  var properties = PropertiesService.getScriptProperties();
  var candidateIds = uniqueValues_([
    properties.getProperty("ACTIVE_SPREADSHEET_ID"),
    properties.getProperty("SPREADSHEET_ID"),
    SPREADSHEET_ID,
  ]);

  for (var i = 0; i < candidateIds.length; i += 1) {
    try {
      var spreadsheet = SpreadsheetApp.openById(candidateIds[i]);
      rememberSpreadsheetId_(spreadsheet.getId());
      return spreadsheet;
    } catch (error) {
      // Try the next configured spreadsheet id.
    }
  }

  var created = SpreadsheetApp.create(DEFAULT_SPREADSHEET_TITLE);
  rememberSpreadsheetId_(created.getId());
  return created;
}

function rememberSpreadsheetId_(spreadsheetId) {
  PropertiesService.getScriptProperties().setProperty("ACTIVE_SPREADSHEET_ID", String(spreadsheetId));
}

function uniqueValues_(values) {
  var seen = {};
  return values.filter(function (value) {
    var normalized = normalizeText_(value);
    if (!normalized || seen[normalized]) return false;
    seen[normalized] = true;
    return true;
  });
}

function adminLogin_(loginId, password) {
  var normalizedLoginId = normalizeText_(loginId);
  ensureLoginAllowed_(normalizedLoginId);
  var user = findAdminUserByUsername_(normalizedLoginId);
  if (!user || String(password || "") !== user.password) {
    recordLoginFailure_(normalizedLoginId);
    appendErrorLog_("adminLogin", "ログイン失敗", {
      loginId: normalizedLoginId,
    });
    throw new Error("ログインIDまたはパスワードが違います。");
  }
  clearLoginFailures_(normalizedLoginId);
  var expiresAt = Date.now() + 8 * 60 * 60 * 1000;
  appendAuditLog_("admin.login", {
    loginId: normalizedLoginId,
  });
  return {
    token: makeToken_(user.username, expiresAt),
    expiresAt: new Date(expiresAt).toISOString(),
  };
}

function getAdminCredentials_() {
  var users = getAdminUsers_();
  var primary = users[0];
  return {
    username: primary.username,
    password: primary.password,
  };
}

function updateAdminCredentials_(loginId, password) {
  var properties = PropertiesService.getScriptProperties();
  var users = getAdminUsers_();
  var current = users[0];
  var nextLoginId = normalizeText_(loginId);
  var nextPassword = String(password || "");

  if (!nextLoginId) throw new Error("ログインIDを入力してください。");
  if (!nextPassword) nextPassword = current.password;
  if (String(nextPassword).length < 4) {
    throw new Error("パスワードは4文字以上で入力してください。");
  }

  users[0] = Object.assign({}, current, {
    username: nextLoginId,
    password: nextPassword,
  });
  properties.setProperty(ADMIN_USERS_PROPERTY_KEY, JSON.stringify(users));
  properties.setProperty("ADMIN_USERNAME", nextLoginId);
  properties.setProperty("ADMIN_PASSWORD", nextPassword);
  clearLoginFailures_(current.username);
  clearLoginFailures_(nextLoginId);
  appendAuditLog_("admin.credentials.update", {
    loginId: nextLoginId,
  });

  return {
    ok: true,
    adminInfo: getAdminInfo_(),
  };
}

function requireAdmin_(token) {
  if (!verifyToken_(token)) throw new Error("管理者ログインが必要です。");
}

function makeToken_(username, expiresAt) {
  var base = username + "|" + expiresAt;
  return Utilities.base64EncodeWebSafe(JSON.stringify({
    u: username,
    exp: expiresAt,
    sig: sign_(base),
  }));
}

function verifyToken_(token) {
  try {
    var raw = Utilities.newBlob(Utilities.base64DecodeWebSafe(String(token || ""))).getDataAsString();
    var payload = JSON.parse(raw);
    if (!payload.u || !payload.exp || Number(payload.exp) < Date.now()) return false;
    return payload.sig === sign_(payload.u + "|" + payload.exp);
  } catch (error) {
    return false;
  }
}

function sign_(value) {
  return Utilities.base64EncodeWebSafe(
    Utilities.computeHmacSha256Signature(String(value), getConfig_("TOKEN_SECRET", DEFAULT_TOKEN_SECRET))
  );
}

function getOwnerEmail_() {
  try {
    return Session.getEffectiveUser().getEmail();
  } catch (error) {
    return "";
  }
}

function getConfig_(key, fallback) {
  return PropertiesService.getScriptProperties().getProperty(key) || fallback;
}

function normalizeText_(value) {
  return String(value || "").trim();
}

function normalizeEmail_(value) {
  return normalizeText_(value).toLowerCase();
}

function normalizeStatus_(status) {
  return ["new", "checked", "done", "trash"].indexOf(String(status)) >= 0 ? String(status) : "new";
}

function normalizeSurveyStatus_(status) {
  var value = normalizeText_(status);
  return ["published", "draft", "archived"].indexOf(value) >= 0 ? value : "published";
}

function buildRawAnswerMap_(answers) {
  var map = {};
  (Array.isArray(answers) ? answers : []).forEach(function (answer) {
    var questionId = normalizeText_(answer && answer.questionId);
    if (!questionId) return;
    if (Array.isArray(answer.value)) {
      map[questionId] = answer.value.map(normalizeText_).filter(Boolean);
      return;
    }
    if (Array.isArray(answer.files)) {
      map[questionId] = answer.files;
      return;
    }
    var value = normalizeText_(answer && answer.value);
    map[questionId] = value ? [value] : [];
  });
  return map;
}

function isLegacyTicketEndLastPhotoQuestion_(question, survey) {
  return survey && survey.id === "survey_bijiris_ticket_end" && question && question.id === "q_ticket_end_photo_last";
}

function isLegacyTicketEndLastPhotoVisible_(rawAnswerMap) {
  var ticketSizeValues = rawAnswerMap && rawAnswerMap.q_ticket_end_ticket_size;
  var ticketRoundValues = rawAnswerMap && rawAnswerMap.q_ticket_end_ticket_round;
  var ticketSize = Array.isArray(ticketSizeValues) && ticketSizeValues.length ? normalizeText_(ticketSizeValues[0]) : "";
  var ticketRound = Array.isArray(ticketRoundValues) && ticketRoundValues.length ? normalizeText_(ticketRoundValues[0]) : "";
  return (
    (ticketSize === "6回券" && ticketRound === "6回目") ||
    (ticketSize === "10回券" && ticketRound === "10回目")
  );
}

function getBijirisSessionPhotoConfig_(question, survey) {
  if (!(survey && survey.id === "survey_bijiris_session" && question)) return null;
  if (question.id === "q_bijiris_session_ticket_photos") {
    return { maxFiles: 4, requiredCount: 4 };
  }
  if (
    question.id === "q_bijiris_session_monitor_photos" ||
    question.id === "q_bijiris_session_ticket_end_photos"
  ) {
    return { maxFiles: 2, requiredCount: 2 };
  }
  return null;
}

function getPhotoQuestionMaxFiles_(question, survey) {
  var bijirisSessionPhotoConfig = getBijirisSessionPhotoConfig_(question, survey);
  if (bijirisSessionPhotoConfig) return bijirisSessionPhotoConfig.maxFiles;
  return 6;
}

function getPhotoQuestionRequiredCount_(question, visible, survey) {
  if (!visible) return 0;
  var bijirisSessionPhotoConfig = getBijirisSessionPhotoConfig_(question, survey);
  if (bijirisSessionPhotoConfig) return bijirisSessionPhotoConfig.requiredCount;
  if (isLegacyTicketEndLastPhotoQuestion_(question, survey) && !getQuestionVisibilityConditions_(question).length) {
    return 1;
  }
  return question && question.required === false ? 0 : 1;
}

function isQuestionVisible_(question, rawAnswerMap, survey) {
  var conditions = getQuestionVisibilityConditions_(question);
  if (conditions.length) {
    return conditions.every(function (condition) {
      var values = rawAnswerMap && rawAnswerMap[condition.questionId];
      if (!Array.isArray(values) || !values.length) return false;
      var expected = normalizeText_(condition.value);
      return values.some(function (value) {
        return normalizeText_(value) === expected;
      });
    });
  }
  if (isLegacyTicketEndLastPhotoQuestion_(question, survey)) {
    return isLegacyTicketEndLastPhotoVisible_(rawAnswerMap || {});
  }
  if (!question) return true;
  if (!question.visibleWhen) return true;
  var map = rawAnswerMap || {};
  var values = map[question.visibleWhen.questionId];
  if (!Array.isArray(values) || !values.length) return false;
  var expected = normalizeText_(question.visibleWhen.value);
  return values.some(function (value) {
    return normalizeText_(value) === expected;
  });
}

function isQuestionRequired_(question, visible, survey) {
  return getPhotoQuestionRequiredCount_(question, visible, survey) > 0 || (
    visible && !(question && question.type === "photo") && !(question && question.required === false)
  );
}

function notifyNewResponse_(response) {
  var preferences = getPreferences_();
  if (!preferences.notificationEnabled || !preferences.notificationEmail) return;
  var templateData = {
    customerName: normalizeText_(response && response.customerName),
    surveyTitle: normalizeText_(response && response.surveyTitle),
    submittedAt: normalizeText_(response && response.submittedAt),
    responseId: normalizeText_(response && response.id),
  };
  var subject = renderTemplate_(preferences.notificationSubject, templateData);
  var body = renderTemplate_(preferences.notificationBody, templateData);

  try {
    MailApp.sendEmail(preferences.notificationEmail, subject, body);
  } catch (error) {
    appendErrorLog_("notifyNewResponse", error.message || "通知メール送信エラー", {
      responseId: response && response.id,
      notificationEmail: preferences.notificationEmail,
    });
  }
}

function getLoginAttempts_() {
  return parseJson_(PropertiesService.getScriptProperties().getProperty(LOGIN_ATTEMPTS_PROPERTY_KEY), {});
}

function saveLoginAttempts_(attempts) {
  PropertiesService.getScriptProperties().setProperty(
    LOGIN_ATTEMPTS_PROPERTY_KEY,
    JSON.stringify(attempts || {})
  );
}

function pruneLoginAttempts_(attempts) {
  var nowTime = Date.now();
  Object.keys(attempts || {}).forEach(function (key) {
    var item = attempts[key];
    if (!item || nowTime - Number(item.lastAt || 0) > LOGIN_LOCK_WINDOW_MS) {
      delete attempts[key];
    }
  });
  return attempts;
}

function ensureLoginAllowed_(loginId) {
  var key = normalizeText_(loginId) || "_default";
  var attempts = pruneLoginAttempts_(getLoginAttempts_());
  var item = attempts[key];
  if (item && Number(item.count || 0) >= LOGIN_MAX_ATTEMPTS) {
    throw new Error("ログイン失敗が続いたため、一時的にログインを停止しています。15分後に再試行してください。");
  }
  saveLoginAttempts_(attempts);
}

function recordLoginFailure_(loginId) {
  var key = normalizeText_(loginId) || "_default";
  var attempts = pruneLoginAttempts_(getLoginAttempts_());
  var nowTime = Date.now();
  var current = attempts[key] || { count: 0, firstAt: nowTime, lastAt: nowTime };
  current.count = Number(current.count || 0) + 1;
  current.lastAt = nowTime;
  attempts[key] = current;
  saveLoginAttempts_(attempts);
}

function clearLoginFailures_(loginId) {
  var key = normalizeText_(loginId) || "_default";
  var attempts = pruneLoginAttempts_(getLoginAttempts_());
  delete attempts[key];
  saveLoginAttempts_(attempts);
}

function parseJson_(value, fallback) {
  try {
    return value ? JSON.parse(String(value)) : fallback;
  } catch (error) {
    return fallback;
  }
}

function stringifyDate_(value) {
  if (!value) return "";
  return value instanceof Date ? value.toISOString() : String(value);
}
