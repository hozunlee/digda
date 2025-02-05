import express from "express";
import http from "http";
import cookieParser from "cookie-parser";
import "dotenv/config";

import { getRequestUrl } from "./lib/utils.js";

// socket.io 서버 연결
import { attach_sockets } from "./lib/server_sockets.js";
// edgeDB 클라이언트 연결
import edgeClient from "./src/db/client.js";
import sessionStore from "./lib/sessionStore.js";

const app = express();

// 미들웨어 설정
app.use(cookieParser());
app.use(express.json());

// CORS 설정 수정
app.use((req, res, next) => {
    const origin = req.headers.origin;
    // 서버 간 통신도 허용
    if (origin === "http://localhost:5173" || req.hostname === "localhost") {
        res.header("Access-Control-Allow-Origin", origin);
    }
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    next();
});

// 토큰 설정을 위한 엔드포인트
app.post("/auth/set-token", async (req, res) => {
    const { sessionToken } = req.body;
    if (!sessionToken) {
        return res.status(400).json({ error: "세션 토큰이 없습니다." });
    }

    // 저장된 실제 JWT 토큰 조회
    const auth_token = await sessionStore.get(sessionToken);
    console.log("🚀 ~ app.post ~ auth_token:", auth_token);
    if (!auth_token) {
        return res.status(401).json({ error: "유효하지 않은 세션" });
    }

    // 세션 토큰 즉시 삭제 (일회용)
    await sessionStore.delete(sessionToken);

    // 실제 JWT로 쿠키 설정
    res.cookie("auth_token", auth_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 3600000,
    });

    res.json({ success: true });
});

// 쿠키 확인 엔드포인트 수정
app.get("/auth/check-cookie", (req, res) => {
    console.log("쿠키 확인:", req.cookies);
    const authToken = req.cookies.auth_token;
    res.json({
        isAuthenticated: !!authToken,
        cookies: req.cookies, // 디버깅용
    });
});

const server = http.createServer(app);

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
