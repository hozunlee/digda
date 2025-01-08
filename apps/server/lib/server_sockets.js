import { Server } from "socket.io";

export function attach_sockets(server) {
    // Socket.IO 서버 초기화
    const io = new Server(server, {
        cors: {
            origin: "http://localhost:5173", // SvelteKit 기본 포트
            methods: ["GET", "POST"],
            credentials: true,
        },
    });

    io.on("connection", (socket) => {
        console.log(socket.id, "user connected");

        socket.on("eventFromClient", (msg) => {
            console.log("📟 Message from client:", msg);
            // 클라이언트에 응답
            socket.emit("eventFromServer", `서버입니다: ${msg}`);
        });

        socket.on("disconnect", () => {
            console.log("User disconnected");
        });
    });
}
