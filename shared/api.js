window.MayumiSurveyApi = (() => {
  const API_BASE_STORAGE_KEY = "mayumi_bijiris_api_base";
  const DEFAULT_PUBLIC_API_BASE = "https://mayumi-bijiris.onrender.com";

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

  function resolveApiBase() {
    const params = new URLSearchParams(window.location.search);
    const queryBase = cleanBaseUrl(params.get("apiBase"));
    if (queryBase) {
      safeSetLocal(API_BASE_STORAGE_KEY, queryBase);
      return queryBase;
    }

    const configuredBase = cleanBaseUrl(window.MAYUMI_BIJIRIS_API_BASE);
    if (configuredBase) return configuredBase;

    const storedBase = cleanBaseUrl(safeGetLocal(API_BASE_STORAGE_KEY));
    if (storedBase) return storedBase;

    return isSameOriginApiHost() ? "" : DEFAULT_PUBLIC_API_BASE;
  }

  const API_BASE = resolveApiBase();

  async function request(path, options = {}) {
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

    const response = await fetch(`${API_BASE}${path}`, {
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

  return { request };
})();
