import http from 'http';
import {Server} from 'socket.io';

// HTTP 서버 생성
const server = http.createServer();

// 서버 실행
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

// Socket.IO 서버 초기화
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // SvelteKit 기본 포트
    methods: ["GET", "POST"],
    credentials: true
  }
});

io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('eventFromClient', (msg) => {
      console.log('Message from client:', msg);
      // 클라이언트에 응답
      socket.emit('eventFromServer', `Echo: ${msg}`);
  });

  socket.on('disconnect', () => {
      console.log('User disconnected');
  });
});


