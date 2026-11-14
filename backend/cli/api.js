const { resolveApiUrl, readGlobalConfig } = require("./config");

class ApiError extends Error {
    constructor(message, status, body) {
        super(message);
        this.name = "ApiError";
        this.status = status;
        this.body = body;
    }
}

async function apiRequest(pathname, options = {}) {
    const {
        method = "GET",
        body,
        apiUrl,
        token,
        auth = true,
        headers: extraHeaders = {},
    } = options;

    const base = await resolveApiUrl(apiUrl);
    const global = token === undefined ? await readGlobalConfig() : {};
    const authToken = token !== undefined ? token : global.token;

    if (auth && !authToken) {
        throw new Error("Not signed in. Run `basicvcs login` first.");
    }

    const headers = { ...extraHeaders };
    if (body !== undefined) headers["Content-Type"] = "application/json";
    if (auth && authToken) headers.Authorization = `Bearer ${authToken}`;

    const response = await fetch(`${base}${pathname}`, {
        method,
        headers,
        body: body === undefined ? undefined : JSON.stringify(body),
    });

    const text = await response.text();
    let payload;
    try {
        payload = text ? JSON.parse(text) : {};
    } catch (err) {
        payload = text;
    }

    if (!response.ok) {
        const message =
            (payload && (payload.error || payload.message)) ||
            `Request failed with ${response.status}`;
        throw new ApiError(message, response.status, payload);
    }

    return payload;
}

module.exports = { apiRequest, ApiError };
