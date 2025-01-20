import { getRequestUrl } from "../utils.js";
import { generatePKCE } from "./PKCE.js";
import { URL } from "node:url";

const EDGEDB_AUTH_BASE_URL = process.env.EDGEDB_AUTH_BASE_URL;

export const handleRegisterOptions = async (req, res) => {
    let body = "";
    req.on("data", (chunk) => {
        body += chunk.toString();
    });
    req.on("end", async () => {
        // body가 비어있는지 확인
        if (!body) {
            res.writeHead(400);
            res.end("Empty request body");
            return;
        }
        const { email } = JSON.parse(body);
        if (!email) {
            res.status = 400;
            res.end(
                `Request body malformed. Expected JSON body with 'email' key, but got: ${body}`
            );
            return;
        }

        const registerUrl = new URL(
            "webauthn/register/options",
            EDGEDB_AUTH_BASE_URL
        );
        registerUrl.searchParams.set("email", email);

        const registerResponse = await fetch(registerUrl.href);

        if (!registerResponse.ok) {
            const text = await registerResponse.text();
            res.status = 400;
            res.end(`Error from the auth server: ${text}`);
            return;
        }

        const registerData = await registerResponse.json();

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(registerData));
    });
};

export const handleAuthenticateOptions = async (req, res) => {
    let body = "";
    req.on("data", (chunk) => {
        body += chunk.toString();
    });
    req.on("end", async () => {
        const { email } = JSON.parse(body);
        if (!email) {
            res.status = 400;
            res.end(
                `Request body malformed. Expected JSON body with 'email' key, but got: ${body}`
            );
            return;
        }

        const authenticateUrl = new URL(
            "webauthn/authenticate/options",
            EDGEDB_AUTH_BASE_URL
        );
        authenticateUrl.searchParams.set("email", email);

        const authenticateResponse = await fetch(authenticateUrl.href);

        if (!authenticateResponse.ok) {
            const text = await authenticateResponse.text();
            res.status = 400;
            res.end(`Error from the auth server: ${text}`);
            return;
        }

        const authenticateData = await authenticateResponse.json();

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(authenticateData));
    });
};

// Register a new credential
export const handleRegister = async (req, res) => {
    let body = "";
    req.on("data", (chunk) => {
        body += chunk.toString();
    });
    req.on("end", async () => {
        const { challenge, verifier } = generatePKCE();
        const { email, provider, credentials, verify_url, user_handle } =
            JSON.parse(body);
        if (
            !email ||
            !provider ||
            !credentials ||
            !verify_url ||
            !user_handle
        ) {
            res.status = 400;
            res.end(
                `Request body malformed. Expected JSON body with 'email', 'provider', 'credentials', 'verify_url', and 'user_handle' keys, but got: ${body}`
            );
            return;
        }

        const registerUrl = new URL("webauthn/register", EDGEDB_AUTH_BASE_URL);

        const registerResponse = await fetch(registerUrl.href, {
            method: "post",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                provider,
                email,
                credentials,
                verify_url,
                user_handle,
                challenge,
            }),
        });

        if (!registerResponse.ok) {
            const text = await registerResponse.text();
            res.status = 400;
            res.end(`Error from the auth server: ${text}`);
            return;
        }

        const registerData = await registerResponse.json();
        if ("code" in registerData) {
            const tokenUrl = new URL("token", EDGEDB_AUTH_BASE_URL);
            tokenUrl.searchParams.set("code", registerData.code);
            tokenUrl.searchParams.set("verifier", verifier);
            const tokenResponse = await fetch(tokenUrl.href, {
                method: "get",
            });

            if (!tokenResponse.ok) {
                const text = await authenticateResponse.text();
                res.status = 400;
                res.end(`Error from the auth server: ${text}`);
                return;
            }

            const { auth_token } = await tokenResponse.json();
            res.writeHead(204, {
                "Set-Cookie": `edgedb-auth-token=${auth_token}; HttpOnly; Path=/; Secure; SameSite=Strict`,
            });
            res.end();
        } else {
            res.writeHead(204, {
                "Set-Cookie": `edgedb-pkce-verifier=${pkce.verifier}; HttpOnly; Path=/; Secure; SameSite=Strict`,
            });
            res.end();
        }
    });
};

// Authenticate with an existing credential

export const handleAuthenticate = async (req, res) => {
    let body = "";
    req.on("data", (chunk) => {
        body += chunk.toString();
    });
    req.on("end", async () => {
        const { challenge, verifier } = generatePKCE();
        const { email, provider, assertion } = JSON.parse(body);
        if (!email || !provider || !assertion) {
            res.status = 400;
            res.end(
                `Request body malformed. Expected JSON body with 'email', 'provider', and 'assertion' keys, but got: ${body}`
            );
            return;
        }

        const authenticateUrl = new URL(
            "webauthn/authenticate",
            EDGEDB_AUTH_BASE_URL
        );

        const authenticateResponse = await fetch(authenticateUrl.href, {
            method: "post",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                provider,
                email,
                assertion,
                challenge,
            }),
        });

        if (!authenticateResponse.ok) {
            const text = await authenticateResponse.text();
            res.status = 400;
            res.end(`Error from the auth server: ${text}`);
            return;
        }

        const authenticateData = await authenticateResponse.json();
        if ("code" in authenticateData) {
            const tokenUrl = new URL("token", EDGEDB_AUTH_BASE_URL);
            tokenUrl.searchParams.set("code", authenticateData.code);
            const tokenResponse = await fetch(tokenUrl.href, {
                method: "get",
            });

            if (!tokenResponse.ok) {
                const text = await authenticateResponse.text();
                res.status = 400;
                res.end(`Error from the auth server: ${text}`);
                return;
            }

            const { auth_token } = await tokenResponse.json();
            res.writeHead(204, {
                "Set-Cookie": `edgedb-auth-token=${auth_token}; HttpOnly; Path=/; Secure; SameSite=Strict`,
            });
            res.end();
        } else {
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(
                JSON.stringify({
                    error: "Email must be verified before being able to authenticate.",
                })
            );
        }
    });
};

/**
 * Handles the link in the email verification flow.
 *
 * @param {Request} req
 * @param {Response} res
 */
export const handleVerify = async (req, res) => {
    const requestUrl = getRequestUrl(req);
    const verification_token =
        requestUrl.searchParams.get("verification_token");
    if (!verification_token) {
        res.status = 400;
        res.end(
            `Verify request is missing 'verification_token' search param. The verification email is malformed.`
        );
        return;
    }

    const cookies = req.headers.cookie?.split("; ");
    const verifier = cookies
        ?.find((cookie) => cookie.startsWith("edgedb-pkce-verifier="))
        ?.split("=")[1];
    if (!verifier) {
        res.status = 400;
        res.end(
            `Could not find 'verifier' in the cookie store. Is this the same user agent/browser that started the authorization flow?`
        );
        return;
    }

    const verifyUrl = new URL("verify", EDGEDB_AUTH_BASE_URL);
    const verifyResponse = await fetch(verifyUrl.href, {
        method: "post",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            verification_token,
            verifier,
            provider: "builtin::webauthn",
        }),
    });

    if (!verifyResponse.ok) {
        const text = await verifyResponse.text();
        res.status = 400;
        res.end(`Error from the auth server: ${text}`);
        return;
    }

    const { code } = await verifyResponse.json();

    const tokenUrl = new URL("token", EDGEDB_AUTH_BASE_URL);
    tokenUrl.searchParams.set("code", code);
    tokenUrl.searchParams.set("verifier", verifier);
    const tokenResponse = await fetch(tokenUrl.href, {
        method: "get",
    });

    if (!tokenResponse.ok) {
        const text = await tokenResponse.text();
        res.status = 400;
        res.end(`Error from the auth server: ${text}`);
        return;
    }

    const { auth_token } = await tokenResponse.json();
    res.writeHead(204, {
        "Set-Cookie": `edgedb-auth-token=${auth_token}; HttpOnly; Path=/; Secure; SameSite=Strict`,
    });
    res.end();
};
