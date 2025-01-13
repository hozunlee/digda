import http from "http";
import { attach_sockets } from "./lib/server_sockets.js";
import edgeClient from "./src/db/client.js";
// HTTP 서버 생성
const server = http.createServer();

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
