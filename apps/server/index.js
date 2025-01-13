import http from "http";
import "dotenv/config";

import { getRequestUrl } from "./lib/utils.js";

// socket.io 서버 연결
import { attach_sockets } from "./lib/server_sockets.js";
// edgeDB 클라이언트 연결
import edgeClient from "./src/db/client.js";

import {
    handleRegisterOptions,
    handleRegister,
    handleAuthenticateOptions,
    handleAuthenticate,
    handleVerify,
} from "./lib/auth/webauthn.js";

// HTTP 서버 생성 - WebAuthn 라우팅 포함
const server = http.createServer(async (req, res) => {
    const requestUrl = getRequestUrl(req);
    console.log("🚀 ~ server ~ requestUrl:", requestUrl);

    switch (requestUrl.pathname) {
        case "/auth/webauthn/register/options": {
            await handleRegisterOptions(req, res);
            break;
        }

        case "/auth/webauthn/register": {
            console.log("실행?");
            await handleRegister(req, res);
            break;
        }

        case "/auth/webauthn/authenticate/options": {
            await handleAuthenticateOptions(req, res);
            break;
        }

        case "/auth/webauthn/authenticate": {
            await handleAuthenticate(req, res);
            break;
        }

        case "/auth/webauthn/verify": {
            await handleVerify(req, res);
            break;
        }

        default: {
            res.writeHead(404);
            res.end("Not found");
            break;
        }
    }
});

async function testConnection() {
    try {
        // 테이블이 비어있을 수 있으므로 exists로 확인
        const result = await edgeClient.querySingle(`
        SELECT EXISTS (
          SELECT Movie
        );
        `);
        console.log("🔌 EdgeDB Connected:", result);
    } catch (error) {
        console.error("❌ EdgeDB Connection Error:", error);
    }
}

// 서버 실행
const PORT = process.env.PORT || 3000;
// 서버 시작 시 DB 연결 테스트
server.listen(PORT, async () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    await testConnection();
});

attach_sockets(server);
