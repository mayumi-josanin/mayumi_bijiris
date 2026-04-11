var SPREADSHEET_ID = "1oDNTqlvKv1rGOGXIpnzPlegpFDeQ0WHGRLuY3ZAnZYc";
var DEFAULT_SPREADSHEET_TITLE = "まゆみ助産院 ビジリス アンケート回答";
var MASTER_SHEET_NAME = "回答一覧";
var ROOT_DRIVE_FOLDER_NAME = "bijiris";
var DEFAULT_ADMIN_USERNAME = "mayumi2026";
var DEFAULT_ADMIN_PASSWORD = "3939";
var LEGACY_ADMIN_USERNAME = "admin";
var LEGACY_ADMIN_PASSWORD = "admin123";
var DEFAULT_TOKEN_SECRET = "change-this-gas-secret";

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

var SURVEYS = [
  {
    id: "survey_bijiris_session",
    title: "ビジリス施術アンケート",
    description: "ビジリス施術後の体感やご相談内容をお聞かせください。",
    status: "published",
    questions: [
      { id: "q_bijiris_session_consultation", label: "ご質問・ご相談", type: "textarea", required: false, options: [] },
      { id: "q_bijiris_session_feeling", label: "本日のビジリスの体感はいかがでしたか？", type: "textarea", required: true, options: [] },
      { id: "q_bijiris_session_type", label: "施術内容", type: "choice", required: true, options: ["モニター", "回数券", "乗り放題キャンペーン", "単発", "トライアル", "1~3回"] },
      { id: "q_bijiris_session_monitor_count", label: "モニターと答えた方へ", type: "choice", required: false, options: ["1回目", "2回目", "3回目", "4回目", "5回目", "6回目"] },
      { id: "q_bijiris_session_ticket_count", label: "回数券と答えた方へ", type: "choice", required: false, options: ["1回目", "2回目", "3回目", "4回目", "5回目", "6回目", "7回目", "8回目", "9回目", "10回目"] },
      { id: "q_bijiris_session_unlimited", label: "乗り放題キャンペーンと答えた方へ", type: "text", required: false, options: [] },
      { id: "q_bijiris_session_single", label: "単発と答えた方へ", type: "text", required: false, options: [] },
      { id: "q_bijiris_session_trial", label: "トライアルと答えた方へ", type: "text", required: false, options: [] },
    ],
  },
  {
    id: "survey_bijiris_ticket_end",
    title: "ビジリス回数券終了アンケート",
    description: "回数券終了時点での体感や日常生活の変化をお聞かせください。",
    status: "published",
    questions: [
      { id: "q_ticket_end_feeling", label: "本日のビジリスの体感はいかがでしたか？", type: "textarea", required: true, options: [] },
      { id: "q_ticket_end_life_changes", label: "日常生活で変化を感じたことはありますか？（複数回答可）", type: "checkbox", required: false, options: ["立っている時や座っている時の姿勢が楽になった", "長時間歩いても疲れにくくなった", "ズボンやスカートが緩くなった気がする", "腰痛・股関節痛が軽くなった", "冷え性が良くなった（体がポカポカする）", "睡眠の質が良くなった", "階段の上り下りが楽になった", "便通が良くなった", "その他"] },
      { id: "q_ticket_end_improve", label: "今後もっと改善したい部分はありますか？", type: "checkbox", required: false, options: ["もっとお腹周りを引き締めたい", "痛みのない生活を送りたい", "姿勢をもっと良くしたい", "今の良い状態をキープしたい", "トイレトラブルを改善したい", "睡眠の質を高めたい", "妊娠しやすい体づくりをしたい", "その他"] },
      { id: "q_ticket_end_photo_first", label: "計測写真(1回目)", type: "photo", required: false, options: [] },
      { id: "q_ticket_end_photo_last", label: "計測写真(6回目or10回目)", type: "photo", required: false, options: [] },
      { id: "q_ticket_end_consultation", label: "ご質問・ご相談(自由記述)", type: "textarea", required: false, options: [] },
    ],
  },
  {
    id: "survey_bijiris_monitor_end",
    title: "モニター終了アンケート",
    description: "モニター終了時点での体感、変化、今後のご希望をお聞かせください。",
    status: "published",
    questions: [
      { id: "q_monitor_end_usage", label: "ビジリスの刺激や使用感はいかがでしたか？", type: "checkbox", required: true, options: ["痛気持ちよくて効いている感じがした", "最初は驚いたが慣れた", "リラックスして座っていられた", "その他"] },
      { id: "q_monitor_end_life_changes", label: "ビジリスを6回体験して、日常生活で変化を感じたことはありますか？（複数回答可）", type: "checkbox", required: false, options: ["立っている時や座っている時の姿勢が楽になった", "長時間歩いても疲れにくくなった", "尿漏れや頻尿が気にならなくなった", "ズボンやスカートが緩くなった気がする", "冷え性が改善された（体がポカポカする）", "腰痛・股関節痛が軽くなった", "便通が良くなった", "睡眠の質が良くなった", "階段の上り下りが楽になった", "その他"] },
      { id: "q_monitor_end_improve", label: "今後もっと改善したい部分はありますか？", type: "checkbox", required: false, options: ["もっとお腹周りを引き締めたい", "完全に痛みのない生活を送りたい", "姿勢をもっと良くしたい", "今の良い状態をキープしたい", "睡眠の質を高めたい", "トイレトラブルを改善したい", "妊娠しやすい体づくりをしたい", "骨盤底筋をもっと鍛えたい", "その他"] },
      { id: "q_monitor_end_sns_permission", label: "今回の測定結果や感想を、個人が特定できない形でSNSや院内掲示に掲載させていただいてもよろしいでしょうか？", type: "choice", required: true, options: ["写真・数値・感想すべてOK", "数値・感想のみOK", "感想のみOK", "掲載不可"] },
      { id: "q_monitor_end_photo_first", label: "計測写真(1回目)", type: "photo", required: false, options: [] },
      { id: "q_monitor_end_advice_sheet", label: "(任意)あなたの身体の変化を「見える化」！「ビフォーアフター写真＆個別アドバイスシート」をプレゼント", type: "choice", required: false, options: ["希望する", "希望しない"] },
      { id: "q_monitor_end_next", label: "今後はどうしていきたいですか？", type: "choice", required: true, options: ["6回の効果を無駄にしないために継続していきたい", "継続は考えていない", "迷っている", "その他"] },
      { id: "q_monitor_end_plan", label: "継続していきたい方へ\n＊今後の継続プラン(回数券)について、ご希望のコースをお選びください", type: "choice", required: false, options: ["SNS掲載御礼！特別感謝コース（初回30%OFF）", "SNS掲載御礼！特別感謝コース（30%OFF）", "モニター様優待コース（10%OFF）", "その他"] },
      { id: "q_monitor_end_consultation", label: "ご質問・ご相談(自由記述)", type: "textarea", required: false, options: [] },
      { id: "q_monitor_end_photo_last", label: "計測写真(6回目)", type: "photo", required: false, options: [] },
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

function handleGet_(e) {
  var params = e.parameter || {};
  var action = params.action || "health";

  if (action === "health") return { ok: true, backend: "gas" };
  if (action === "surveys") return { surveys: getSurveys_() };
  if (action === "history") {
    return {
      responses: getResponses_({
        clientId: params.clientId,
        customerName: params.name,
      }),
    };
  }
  if (action === "adminLogin") return adminLogin_(params.loginId, params.password);

  requireAdmin_(params.token);
  if (action === "adminInfo") return getAdminInfo_();
  if (action === "adminUpdateCredentials") {
    return updateAdminCredentials_(params.loginId, params.password);
  }
  if (action === "adminSurveys") return { surveys: getSurveys_() };
  if (action === "adminResponses") return { responses: getResponses_({}) };
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
      responses: getResponses_({}),
      exportedAt: new Date().toISOString(),
    };
  }

  throw new Error("API が見つかりません。");
}

function handlePost_(body) {
  if (body.action === "submitResponse") {
    return saveResponse_(body);
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
  var timestamp = new Date().toISOString();
  return SURVEYS.map(function (survey) {
    return Object.assign({}, survey, {
      createdAt: timestamp,
      updatedAt: timestamp,
    });
  });
}

function findSurvey_(surveyId) {
  for (var i = 0; i < SURVEYS.length; i += 1) {
    if (SURVEYS[i].id === surveyId) return SURVEYS[i];
  }
  throw new Error("アンケートが見つかりません。");
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
    var customer = payload.customer || {};
    var customerName = normalizeText_(customer.name);
    if (!customerName) throw new Error("お名前を入力してください。");

    var response = {
      id: responseId,
      surveyId: survey.id,
      surveyTitle: survey.title,
      customerClientId: body.clientId || payload.clientId || "",
      customerName: customerName,
      customerEmail: "",
      answers: buildAnswers_(survey, payload.answers || [], responseId, customerName),
      status: "new",
      adminMemo: "",
      submittedAt: new Date().toISOString(),
    };
    appendMasterRow_(response);
    appendSurveyRow_(survey, response);
    return { response: response };
  } finally {
    lock.releaseLock();
  }
}

function buildAnswers_(survey, rawAnswers, responseId, customerName) {
  return survey.questions.map(function (question) {
    var raw = findRawAnswer_(rawAnswers, question.id);
    if (question.type === "photo") {
      var files = savePhotoFiles_(raw.files || [], responseId, question.id, customerName);
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
    return {
      questionId: question.id,
      label: question.label,
      type: question.type,
      value: values.join(", "),
    };
  });
}

function findRawAnswer_(answers, questionId) {
  for (var i = 0; i < answers.length; i += 1) {
    if (answers[i].questionId === questionId) return answers[i];
  }
  return {};
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
        (!filter.customerName || response.customerName === String(filter.customerName));
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

function updateResponse_(responseId, status, adminMemo) {
  ensureSpreadsheet_();
  var sheet = getSpreadsheet_().getSheetByName(MASTER_SHEET_NAME);
  var rowIndex = findMasterRowIndex_(responseId);
  if (!rowIndex) throw new Error("回答が見つかりません。");
  var normalizedStatus = normalizeStatus_(status);
  var memo = normalizeText_(adminMemo);
  var managedAt = new Date().toISOString();
  sheet.getRange(rowIndex, 8).setValue(normalizedStatus);
  sheet.getRange(rowIndex, 9).setValue(memo);
  sheet.getRange(rowIndex, 12).setValue(managedAt);

  var response = getResponseById_(responseId);
  updateSurveySheetManagement_(response.surveyTitle, responseId, normalizedStatus, memo);
  return response;
}

function deleteResponse_(responseId) {
  ensureSpreadsheet_();
  var response = getResponseById_(responseId);
  if (!response) throw new Error("回答が見つかりません。");
  deleteResponseFiles_(response);
  deleteRowByResponseId_(getSpreadsheet_().getSheetByName(response.surveyTitle), responseId, 2);
  deleteRowByResponseId_(getSpreadsheet_().getSheetByName(MASTER_SHEET_NAME), responseId, 2);
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

function updateSurveySheetManagement_(sheetName, responseId, status, adminMemo) {
  var sheet = getSpreadsheet_().getSheetByName(sheetName);
  if (!sheet) return;
  var rowIndex = findRowIndexByColumn_(sheet, 2, responseId);
  if (!rowIndex) return;
  sheet.getRange(rowIndex, 6).setValue(status);
  sheet.getRange(rowIndex, 7).setValue(adminMemo);
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
  SURVEYS.forEach(ensureSurveySheet_);
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
  return {
    backend: "gas",
    adminUsername: credentials.username,
    ownerEmail: getOwnerEmail_(),
    spreadsheetId: spreadsheet.getId(),
    spreadsheetUrl: spreadsheet.getUrl(),
    masterSheetName: MASTER_SHEET_NAME,
    photoRootFolderName: ROOT_DRIVE_FOLDER_NAME,
    photoRootFolderUrl: rootFolder.getUrl(),
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
  var credentials = getAdminCredentials_();
  if (normalizeText_(loginId) !== credentials.username || String(password || "") !== credentials.password) {
    throw new Error("ログインIDまたはパスワードが違います。");
  }
  var expiresAt = Date.now() + 8 * 60 * 60 * 1000;
  return {
    token: makeToken_(credentials.username, expiresAt),
    expiresAt: new Date(expiresAt).toISOString(),
  };
}

function getAdminCredentials_() {
  var properties = PropertiesService.getScriptProperties();
  var username = normalizeText_(properties.getProperty("ADMIN_USERNAME"));
  var password = String(properties.getProperty("ADMIN_PASSWORD") || "");

  if (!username || username === LEGACY_ADMIN_USERNAME) {
    username = DEFAULT_ADMIN_USERNAME;
    properties.setProperty("ADMIN_USERNAME", username);
  }

  if (!password || password === LEGACY_ADMIN_PASSWORD) {
    password = DEFAULT_ADMIN_PASSWORD;
    properties.setProperty("ADMIN_PASSWORD", password);
  }

  return {
    username: username,
    password: password,
  };
}

function updateAdminCredentials_(loginId, password) {
  var properties = PropertiesService.getScriptProperties();
  var current = getAdminCredentials_();
  var nextLoginId = normalizeText_(loginId);
  var nextPassword = String(password || "");

  if (!nextLoginId) throw new Error("ログインIDを入力してください。");
  if (!nextPassword) nextPassword = current.password;
  if (String(nextPassword).length < 4) {
    throw new Error("パスワードは4文字以上で入力してください。");
  }

  properties.setProperty("ADMIN_USERNAME", nextLoginId);
  properties.setProperty("ADMIN_PASSWORD", nextPassword);

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
  return ["new", "checked", "done"].indexOf(String(status)) >= 0 ? String(status) : "new";
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
