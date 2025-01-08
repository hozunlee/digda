import http from "http";
import { attach_sockets } from "./lib/server_sockets.js";

// HTTP 서버 생성
const server = http.createServer();

// 서버 실행
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

attach_sockets(server);
