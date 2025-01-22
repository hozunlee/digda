# 디그다 프로젝트

## 실시간 통신(ws)을 통한 2인 함께하는 두더지 게임
1. webauthn을 활용하여 로그인 구현한다. ( client - back 통신은 socketIO로 한다)


## 기술스택

프론트엔드: svelteKit, Socket.IO-client, shadcn(css)
백엔드: Node.js, Socket.IO
데이터베이스: edgeDB 
로그인인증 : webauthn( w3c 웹표준 with degeDB)
호스팅 및 배포: 
Docker-compose(local) 
Cloudflare
- backend : workers
- frontend : pages
