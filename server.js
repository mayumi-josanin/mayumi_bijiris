const crypto = require("node:crypto");
const fs = require("node:fs/promises");
const http = require("node:http");
const os = require("node:os");
const path = require("node:path");
const { URL } = require("node:url");

const ROOT_DIR = __dirname;
const DATA_DIR = process.env.DATA_DIR || path.join(ROOT_DIR, "data");
const DB_FILE = process.env.DB_FILE || path.join(DATA_DIR, "db.json");
const PORT = Number(process.env.PORT || 3000);
const HOST = process.env.HOST || "0.0.0.0";
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";
const SESSION_SECRET =
  process.env.SESSION_SECRET || "change-this-secret-before-production";
const TOKEN_TTL_SECONDS = 60 * 60 * 8;
const BODY_LIMIT_BYTES = 1024 * 1024;

let writeQueue = Promise.resolve();

function sendJson(res, status, data) {
  const body = JSON.stringify(data);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "Access-Control-Allow-Origin": process.env.CORS_ORIGIN || "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  });
  res.end(body);
}

function sendError(res, status, message) {
  sendJson(res, status, { error: message });
}

function id(prefix) {
  return `${prefix}_${crypto.randomUUID()}`;
}

function now() {
  return new Date().toISOString();
}

function getLanUrls() {
  return Object.values(os.networkInterfaces())
    .flat()
    .filter((network) => network && network.family === "IPv4" && !network.internal)
    .map((network) => `http://${network.address}:${PORT}`);
}

function base64Url(input) {
  return Buffer.from(input).toString("base64url");
}

function signToken(payload) {
  const encodedPayload = base64Url(JSON.stringify(payload));
  const signature = crypto
    .createHmac("sha256", SESSION_SECRET)
    .update(encodedPayload)
    .digest("base64url");
  return `${encodedPayload}.${signature}`;
}

function verifyToken(token) {
  if (!token || !token.includes(".")) return false;
  const [encodedPayload, signature] = token.split(".");
  const expected = crypto
    .createHmac("sha256", SESSION_SECRET)
    .update(encodedPayload)
    .digest("base64url");
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (
    signatureBuffer.length !== expectedBuffer.length ||
    !crypto.timingSafeEqual(signatureBuffer, expectedBuffer)
  ) {
    return false;
  }

  try {
    const payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8"));
    return payload.sub === "admin" && payload.exp > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}

function requireAdmin(req, res) {
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!verifyToken(token)) {
    sendError(res, 401, "管理者ログインが必要です。");
    return false;
  }
  return true;
}

function seedDb() {
  const firstSurveyId = id("survey");
  const secondSurveyId = id("survey");
  return {
    surveys: [
      {
        id: firstSurveyId,
        title: "ご利用満足度アンケート",
        description: "サービスをより良くするため、率直なご意見をお聞かせください。",
        status: "published",
        createdAt: now(),
        updatedAt: now(),
        questions: [
          {
            id: id("question"),
            label: "今回のサービス全体の満足度を教えてください。",
            type: "rating",
            options: [],
          },
          {
            id: id("question"),
            label: "スタッフの対応はいかがでしたか。",
            type: "choice",
            options: ["とても良い", "良い", "普通", "改善してほしい"],
          },
          {
            id: id("question"),
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
        createdAt: now(),
        updatedAt: now(),
        questions: [
          {
            id: id("question"),
            label: "興味のある内容を選んでください。",
            type: "choice",
            options: ["個別相談", "資料作成", "業務効率化", "その他"],
          },
          {
            id: id("question"),
            label: "具体的に相談したい内容があれば入力してください。",
            type: "textarea",
            options: [],
          },
        ],
      },
    ],
    responses: [],
  };
}

async function ensureDb() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(DB_FILE);
  } catch {
    await fs.writeFile(DB_FILE, `${JSON.stringify(seedDb(), null, 2)}\n`);
  }
}

async function readDb() {
  await ensureDb();
  const raw = await fs.readFile(DB_FILE, "utf8");
  return JSON.parse(raw);
}

async function writeDb(db) {
  await fs.writeFile(DB_FILE, `${JSON.stringify(db, null, 2)}\n`);
}

async function updateDb(mutator) {
  const run = async () => {
    const db = await readDb();
    const result = await mutator(db);
    await writeDb(db);
    return result;
  };
  writeQueue = writeQueue.then(run, run);
  return writeQueue;
}

async function readBody(req) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > BODY_LIMIT_BYTES) {
      throw new Error("送信データが大きすぎます。");
    }
    chunks.push(chunk);
  }
  if (!chunks.length) return {};
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

function normalizeText(value) {
  return String(value ?? "").trim();
}

function normalizeEmail(value) {
  return normalizeText(value).toLowerCase();
}

function validateSurveyPayload(payload, existing) {
  const title = normalizeText(payload.title);
  const description = normalizeText(payload.description);
  const status = payload.status === "draft" ? "draft" : "published";
  const questions = Array.isArray(payload.questions) ? payload.questions : [];

  if (!title) throw new Error("タイトルを入力してください。");
  if (!description) throw new Error("説明文を入力してください。");
  if (!questions.length) throw new Error("質問は1つ以上必要です。");

  const normalizedQuestions = questions.map((question) => {
    const type = ["text", "textarea", "rating", "choice"].includes(question.type)
      ? question.type
      : "text";
    const label = normalizeText(question.label);
    const options = Array.isArray(question.options)
      ? question.options.map(normalizeText).filter(Boolean)
      : [];

    if (!label) throw new Error("質問文を入力してください。");
    if (type === "choice" && options.length < 2) {
      throw new Error("選択式の質問は選択肢を2つ以上入力してください。");
    }

    return {
      id: question.id || id("question"),
      label,
      type,
      options: type === "choice" ? options : [],
    };
  });

  return {
    id: existing?.id || id("survey"),
    title,
    description,
    status,
    questions: normalizedQuestions,
    createdAt: existing?.createdAt || now(),
    updatedAt: now(),
  };
}

function validateResponsePayload(db, payload) {
  const survey = db.surveys.find(
    (item) => item.id === payload.surveyId && item.status === "published",
  );
  if (!survey) throw new Error("回答できるアンケートが見つかりません。");

  const customerName = normalizeText(payload.customer?.name);
  const customerEmail = normalizeEmail(payload.customer?.email);
  if (!customerName) throw new Error("お名前を入力してください。");
  if (!customerEmail || !customerEmail.includes("@")) {
    throw new Error("メールアドレスを入力してください。");
  }

  const answerMap = new Map(
    (Array.isArray(payload.answers) ? payload.answers : []).map((answer) => [
      answer.questionId,
      normalizeText(answer.value),
    ]),
  );

  const answers = survey.questions.map((question) => {
    const value = answerMap.get(question.id) || "";
    if (!value) throw new Error("未回答の質問があります。");
    if (question.type === "rating" && !["1", "2", "3", "4", "5"].includes(value)) {
      throw new Error("評価は1から5で回答してください。");
    }
    if (question.type === "choice" && !question.options.includes(value)) {
      throw new Error("選択肢から回答してください。");
    }
    return {
      questionId: question.id,
      label: question.label,
      type: question.type,
      value,
    };
  });

  return {
    id: id("response"),
    surveyId: survey.id,
    surveyTitle: survey.title,
    customerName,
    customerEmail,
    answers,
    submittedAt: now(),
  };
}

function getRouteId(pathname, prefix) {
  if (!pathname.startsWith(prefix)) return "";
  return decodeURIComponent(pathname.slice(prefix.length));
}

async function handleApi(req, res, pathname, searchParams) {
  if (req.method === "OPTIONS") {
    sendJson(res, 204, {});
    return;
  }

  try {
    if (req.method === "GET" && pathname === "/api/health") {
      sendJson(res, 200, { ok: true });
      return;
    }

    if (req.method === "GET" && pathname === "/api/public/surveys") {
      const db = await readDb();
      sendJson(res, 200, {
        surveys: db.surveys.filter((survey) => survey.status === "published"),
      });
      return;
    }

    if (req.method === "GET" && pathname === "/api/public/responses") {
      const email = normalizeEmail(searchParams.get("email"));
      const db = await readDb();
      sendJson(res, 200, {
        responses: email
          ? db.responses.filter((response) => response.customerEmail === email)
          : [],
      });
      return;
    }

    if (req.method === "POST" && pathname === "/api/public/responses") {
      const payload = await readBody(req);
      const result = await updateDb((db) => {
        const response = validateResponsePayload(db, payload);
        db.responses.push(response);
        return { response };
      });
      sendJson(res, 201, result);
      return;
    }

    if (req.method === "POST" && pathname === "/api/admin/login") {
      const payload = await readBody(req);
      if (
        normalizeText(payload.loginId) !== ADMIN_USERNAME ||
        String(payload.password ?? "") !== ADMIN_PASSWORD
      ) {
        sendError(res, 401, "ログインIDまたはパスワードが違います。");
        return;
      }

      const exp = Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS;
      const token = signToken({ sub: "admin", exp });
      sendJson(res, 200, { token, expiresAt: new Date(exp * 1000).toISOString() });
      return;
    }

    if (pathname.startsWith("/api/admin/") && !requireAdmin(req, res)) {
      return;
    }

    if (req.method === "GET" && pathname === "/api/admin/surveys") {
      const db = await readDb();
      sendJson(res, 200, { surveys: db.surveys });
      return;
    }

    if (req.method === "POST" && pathname === "/api/admin/surveys") {
      const payload = await readBody(req);
      const result = await updateDb((db) => {
        const survey = validateSurveyPayload(payload);
        db.surveys.unshift(survey);
        return { survey };
      });
      sendJson(res, 201, result);
      return;
    }

    if (req.method === "PUT" && pathname.startsWith("/api/admin/surveys/")) {
      const surveyId = getRouteId(pathname, "/api/admin/surveys/");
      const payload = await readBody(req);
      const result = await updateDb((db) => {
        const existing = db.surveys.find((survey) => survey.id === surveyId);
        if (!existing) throw new Error("アンケートが見つかりません。");
        const survey = validateSurveyPayload(payload, existing);
        db.surveys = db.surveys.map((item) => (item.id === surveyId ? survey : item));
        return { survey };
      });
      sendJson(res, 200, result);
      return;
    }

    if (req.method === "DELETE" && pathname.startsWith("/api/admin/surveys/")) {
      const surveyId = getRouteId(pathname, "/api/admin/surveys/");
      const result = await updateDb((db) => {
        const before = db.surveys.length;
        db.surveys = db.surveys.filter((survey) => survey.id !== surveyId);
        if (db.surveys.length === before) throw new Error("アンケートが見つかりません。");
        return { ok: true };
      });
      sendJson(res, 200, result);
      return;
    }

    if (req.method === "GET" && pathname === "/api/admin/responses") {
      const db = await readDb();
      sendJson(res, 200, { responses: db.responses });
      return;
    }

    if (req.method === "GET" && pathname === "/api/admin/export") {
      const db = await readDb();
      sendJson(res, 200, { ...db, exportedAt: now() });
      return;
    }

    sendError(res, 404, "API が見つかりません。");
  } catch (error) {
    const message =
      error instanceof SyntaxError
        ? "JSON の形式が正しくありません。"
        : error.message || "サーバーエラーが発生しました。";
    sendError(res, 400, message);
  }
}

function contentTypeFor(filePath) {
  const ext = path.extname(filePath);
  return (
    {
      ".html": "text/html; charset=utf-8",
      ".js": "text/javascript; charset=utf-8",
      ".css": "text/css; charset=utf-8",
      ".json": "application/json; charset=utf-8",
      ".webmanifest": "application/manifest+json; charset=utf-8",
      ".svg": "image/svg+xml",
      ".png": "image/png",
      ".ico": "image/x-icon",
    }[ext] || "application/octet-stream"
  );
}

async function serveStatic(req, res, pathname) {
  const requestedPath = pathname === "/" ? "/index.html" : pathname;
  const decodedPath = decodeURIComponent(requestedPath);
  if (decodedPath.startsWith("/data/") || decodedPath.includes("..")) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  const filePath = path.join(ROOT_DIR, decodedPath);
  if (!filePath.startsWith(ROOT_DIR)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  try {
    const file = await fs.readFile(filePath);
    res.writeHead(200, {
      "Content-Type": contentTypeFor(filePath),
      "Cache-Control": filePath.endsWith("index.html")
        ? "no-cache"
        : "public, max-age=3600",
    });
    res.end(file);
  } catch {
    const index = await fs.readFile(path.join(ROOT_DIR, "index.html"));
    res.writeHead(200, {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-cache",
    });
    res.end(index);
  }
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  if (url.pathname.startsWith("/api/")) {
    await handleApi(req, res, url.pathname, url.searchParams);
    return;
  }
  await serveStatic(req, res, url.pathname);
});

ensureDb()
  .then(() => {
    server.listen(PORT, HOST, () => {
      const localUrl = `http://localhost:${PORT}`;
      const lanUrls = getLanUrls();
      console.log("Mayumi Bijiris app is running.");
      console.log(`Admin URL: ${localUrl}/?app=admin`);
      console.log(`Customer URL: ${localUrl}/?app=customer`);
      if (lanUrls.length) {
        console.log("Same Wi-Fi customer URLs:");
        lanUrls.forEach((url) => {
          console.log(`- ${url}/?app=customer`);
        });
        console.log("Same Wi-Fi admin URLs:");
        lanUrls.forEach((url) => {
          console.log(`- ${url}/?app=admin`);
        });
      }
    });
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
