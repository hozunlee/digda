# 디그다 프로젝트

<img width="1152" alt="image" src="https://github.com/user-attachments/assets/4771eafb-745c-4934-9c5b-3c6d475bf178" />


## 실시간 통신(ws)을 통한 2인 함께하는 두더지 게임
1. webauthn을 활용하여 로그인 구현한다. ( client - back 통신은 socketIO로 한다)

## update log: [hololog_blog](https://hololog.dev/series/%EB%94%94%EA%B7%B8%EB%8B%A4%20%ED%94%84%EB%A1%9C%EC%A0%9D%ED%8B%89%EB%8B%88%EB%8B%A4.)

## 기술스택

프론트엔드: svelteKit, Socket.IO-client, shadcn(css)

백엔드: Node.js, express, Socket.IO

데이터베이스: edgeDB(Cloud)

로그인인증 : webauthn( w3c 웹표준 with degeDB)

호스팅 및 배포: 
Docker-compose(local) 
Cloudflare
- backend : workers
- frontend : pages
