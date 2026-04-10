window.MayumiSurveyApi = (() => {
  const API_BASE_STORAGE_KEY = "mayumi_bijiris_api_base";
  const DEFAULT_PUBLIC_API_BASE = "https://mayumi-bijiris.onrender.com";
  const FIREBASE_APP_NAME = "mayumi-bijiris";

  function safeGetLocal(key) {
    try {
      return localStorage.getItem(key) || "";
    } catch {
      return "";
    }
  }

  function safeSetLocal(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch {
      // Ignore storage errors in private browsing modes.
    }
  }

  function cleanBaseUrl(value) {
    return String(value || "").trim().replace(/\/$/, "");
  }

  function now() {
    return new Date().toISOString();
  }

  function normalizeText(value) {
    return String(value ?? "").trim();
  }

  function normalizeEmail(value) {
    return normalizeText(value).toLowerCase();
  }

  function normalizeStatus(status) {
    return ["new", "checked", "done"].includes(status) ? status : "new";
  }

  function isSameOriginApiHost() {
    const host = window.location.hostname;
    return (
      host === "localhost" ||
      host === "127.0.0.1" ||
      host === "0.0.0.0" ||
      host.endsWith(".local") ||
      host.endsWith(".onrender.com") ||
      /^10\./.test(host) ||
      /^172\.(1[6-9]|2\d|3[0-1])\./.test(host) ||
      /^192\.168\./.test(host)
    );
  }

  function resolveExplicitApiBase() {
    const params = new URLSearchParams(window.location.search);
    const queryBase = cleanBaseUrl(params.get("apiBase"));
    if (queryBase) {
      safeSetLocal(API_BASE_STORAGE_KEY, queryBase);
      return queryBase;
    }

    const configuredBase = cleanBaseUrl(window.MAYUMI_BIJIRIS_API_BASE);
    if (configuredBase) return configuredBase;

    return cleanBaseUrl(safeGetLocal(API_BASE_STORAGE_KEY));
  }

  function getDefaultSurveys() {
    const makeSurveys = window.MayumiDefaultSurveys;
    return typeof makeSurveys === "function" ? makeSurveys(now()) : [];
  }

  function getRouteId(path, prefix) {
    if (!path.startsWith(prefix)) return "";
    return decodeURIComponent(path.slice(prefix.length));
  }

  function hasFirebaseConfig() {
    const config = window.MAYUMI_FIREBASE_CONFIG || {};
    return Boolean(
      window.firebase &&
        config.apiKey &&
        config.authDomain &&
        config.projectId &&
        config.appId,
    );
  }

  function initFirebaseApi() {
    const config = window.MAYUMI_FIREBASE_CONFIG;
    const app =
      window.firebase.apps.find((item) => item.name === FIREBASE_APP_NAME) ||
      window.firebase.initializeApp(config, FIREBASE_APP_NAME);
    const auth = window.firebase.auth(app);
    const db = window.firebase.firestore(app);
    const authReady = new Promise((resolve) => {
      const unsubscribe = auth.onAuthStateChanged(() => {
        unsubscribe();
        resolve();
      });
    });

    async function ensureCustomerAuth() {
      await authReady;
      if (!auth.currentUser || !auth.currentUser.isAnonymous) {
        await auth.signInAnonymously();
      }
      return auth.currentUser;
    }

    async function ensureAdminAuth() {
      await authReady;
      if (!auth.currentUser || auth.currentUser.isAnonymous) {
        throw new Error("管理者ログインが必要です。");
      }
      return auth.currentUser;
    }

    function buildResponse(payload, user) {
      const surveys = getDefaultSurveys();
      const survey = surveys.find(
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
          answer,
        ]),
      );

      const answers = survey.questions.map((question) => {
        const answer = answerMap.get(question.id) || {};
        if (question.type === "photo") {
          const files = Array.isArray(answer.files) ? answer.files : [];
          return {
            questionId: question.id,
            label: question.label,
            type: question.type,
            value: files.length ? `${files.length}枚の写真` : "",
            files,
          };
        }

        const rawValue = answer.value;
        const values = Array.isArray(rawValue)
          ? rawValue.map(normalizeText).filter(Boolean)
          : [normalizeText(rawValue)].filter(Boolean);
        const value = values.join(", ");

        return {
          questionId: question.id,
          label: question.label,
          type: question.type,
          value,
        };
      });

      const responseRef = db.collection("responses").doc();
      return {
        id: responseRef.id,
        ref: responseRef,
        data: {
          id: responseRef.id,
          surveyId: survey.id,
          surveyTitle: survey.title,
          customerUid: user.uid,
          customerName,
          customerEmail,
          answers,
          status: "new",
          adminMemo: "",
          submittedAt: now(),
        },
      };
    }

    function normalizeResponseDoc(doc) {
      return {
        id: doc.id,
        status: "new",
        adminMemo: "",
        ...doc.data(),
      };
    }

    async function request(path, options = {}) {
      if (path === "/api/health") {
        return { ok: true, backend: "firebase" };
      }

      if (path === "/api/public/surveys") {
        return {
          surveys: getDefaultSurveys().filter((survey) => survey.status === "published"),
        };
      }

      if (path.startsWith("/api/public/responses") && (options.method || "GET") === "GET") {
        const user = await ensureCustomerAuth();
        const snapshot = await db
          .collection("responses")
          .where("customerUid", "==", user.uid)
          .get();
        return {
          responses: snapshot.docs.map(normalizeResponseDoc),
        };
      }

      if (path === "/api/public/responses" && options.method === "POST") {
        const user = await ensureCustomerAuth();
        const response = buildResponse(options.body || {}, user);
        await response.ref.set(response.data);
        return { response: response.data };
      }

      if (path === "/api/admin/login" && options.method === "POST") {
        const loginId = normalizeText(options.body?.loginId);
        const password = String(options.body?.password || "");
        try {
          const credential = await auth.signInWithEmailAndPassword(loginId, password);
          const token = await credential.user.getIdToken();
          return {
            token,
            expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
          };
        } catch {
          throw new Error("ログインIDまたはパスワードが違います。");
        }
      }

      if (path === "/api/admin/surveys" && (options.method || "GET") === "GET") {
        await ensureAdminAuth();
        return { surveys: getDefaultSurveys() };
      }

      if (path === "/api/admin/responses" && (options.method || "GET") === "GET") {
        await ensureAdminAuth();
        const snapshot = await db.collection("responses").get();
        return { responses: snapshot.docs.map(normalizeResponseDoc) };
      }

      if (path.startsWith("/api/admin/responses/") && options.method === "PUT") {
        await ensureAdminAuth();
        const responseId = getRouteId(path, "/api/admin/responses/");
        const update = {
          status: normalizeStatus(options.body?.status),
          adminMemo: normalizeText(options.body?.adminMemo),
          managedAt: now(),
        };
        const responseRef = db.collection("responses").doc(responseId);
        await responseRef.update(update);
        const doc = await responseRef.get();
        return { response: normalizeResponseDoc(doc) };
      }

      if (path.startsWith("/api/admin/responses/") && options.method === "DELETE") {
        await ensureAdminAuth();
        const responseId = getRouteId(path, "/api/admin/responses/");
        await db.collection("responses").doc(responseId).delete();
        return { ok: true };
      }

      if (path === "/api/admin/export" && (options.method || "GET") === "GET") {
        await ensureAdminAuth();
        const snapshot = await db.collection("responses").get();
        return {
          surveys: getDefaultSurveys(),
          responses: snapshot.docs.map(normalizeResponseDoc),
          exportedAt: now(),
        };
      }

      throw new Error("API が見つかりません。");
    }

    async function logout() {
      await auth.signOut();
    }

    return { request, logout, mode: "firebase" };
  }

  const explicitApiBase = resolveExplicitApiBase();
  const firebaseApi = !explicitApiBase && hasFirebaseConfig() ? initFirebaseApi() : null;
  const usesSameOriginRest = isSameOriginApiHost();
  const isUnconfiguredStatic = !firebaseApi && !explicitApiBase && !usesSameOriginRest;
  const restApiBase =
    explicitApiBase || (usesSameOriginRest || firebaseApi ? "" : DEFAULT_PUBLIC_API_BASE);

  async function request(path, options = {}) {
    if (firebaseApi) {
      return firebaseApi.request(path, options);
    }

    if (isUnconfiguredStatic) {
      if (path === "/api/health") {
        return { ok: false, backend: "unconfigured" };
      }
      if (path === "/api/public/surveys") {
        return {
          surveys: getDefaultSurveys().filter((survey) => survey.status === "published"),
        };
      }
      throw new Error("保存先が未設定です。Firebase設定を行ってください。");
    }

    const headers = {
      Accept: "application/json",
      ...(options.headers || {}),
    };

    if (options.body !== undefined) {
      headers["Content-Type"] = "application/json";
    }

    if (options.token) {
      headers.Authorization = `Bearer ${options.token}`;
    }

    const response = await fetch(`${restApiBase}${path}`, {
      method: options.method || "GET",
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
    });
    const contentType = response.headers.get("content-type") || "";
    const data = contentType.includes("application/json") ? await response.json() : {};

    if (!response.ok) {
      throw new Error(data.error || `API error: ${response.status}`);
    }

    return data;
  }

  async function logout() {
    if (firebaseApi) await firebaseApi.logout();
  }

  return {
    request,
    logout,
    mode: firebaseApi ? "firebase" : "rest",
  };
})();
