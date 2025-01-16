import { Server } from "socket.io";
import { generatePKCE } from "./auth/PKCE.js";

const EDGEDB_AUTH_BASE_URL = process.env.EDGEDB_AUTH_BASE_URL;

export function attach_sockets(server) {
    // Socket.IO 서버 초기화
    const io = new Server(server, {
        cors: {
            origin: "http://localhost:5173", // SvelteKit 기본 포트
            methods: ["GET", "POST"],
            credentials: true,
        },
    });

    // 클라이언트 연결 이벤트
    // 메세징 이벤트는 io.on 안에 작성
    io.on("connection", (socket) => {
        console.log(socket.id, "user connected");

        socket.on("eventFromClient", (msg) => {
            console.log("📟 Message from client:", msg);
            // 클라이언트에 응답
            socket.emit("eventFromServer", `📟서버입니다: ${msg}`);
        });

        socket.on("disconnect", () => {
            console.log("📟 User disconnected");
        });

        //webauthn 인증과정

        // 등록 옵션 요청
        socket.on("webauthn:register:options", async (data) => {
            console.log("📟 user로부터 register options 요청이 왔습니다.");
            try {
                const { email } = data;
                if (!email) {
                    socket.emit("webauthn:error", "Email is required");
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
                    socket.emit(
                        "webauthn:error",
                        `Error from auth server: ${text}`
                    );
                    return;
                }

                const registerData = await registerResponse.json();
                socket.emit("webauthn:register:options:response", registerData);
            } catch (error) {
                console.error("Registration options error:", error);
                socket.emit("webauthn:error", "Internal server error");
            }
        });

        // 회원 ``등록 요청
        socket.on("webauthn:register", async (data) => {
            console.log("📟 user로부터 register 최종 요청이 왔습니다.");
            try {
                const { challenge, verifier } = generatePKCE();
                const registerUrl = new URL(
                    "webauthn/register",
                    EDGEDB_AUTH_BASE_URL
                );

                const response = await fetch(registerUrl.href, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ ...data, challenge }),
                });

                const result = await response.json();
                socket.emit("webauthn:register:response", {
                    verifier,
                    message: "회원가입 성공",
                });
            } catch (error) {
                socket.emit("webauthn:error", error.message);
            }
        });

        // 인증 옵션 요청
        socket.on("webauthn:authenticate:options", async (data) => {
            try {
                const { email } = data;
                const authUrl = new URL(
                    "webauthn/authenticate/options",
                    EDGEDB_AUTH_BASE_URL
                );
                authUrl.searchParams.set("email", email);

                const response = await fetch(authUrl.href);
                const result = await response.json();

                socket.emit("webauthn:authenticate:options:response", result);
            } catch (error) {
                socket.emit("webauthn:error", error.message);
            }
        });
    });
}
