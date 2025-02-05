# frontend/Dockerfile

# Node.js LTS 버전 사용 (예: Node 18)
FROM node:18

# pnpm 설치
RUN npm install -g pnpm@latest

# 작업 디렉토리 설정
WORKDIR /app

# 의존성 파일 복사
COPY package.json pnpm-lock.yaml ./

# 의존성 설치
RUN pnpm install

# 소스 코드 복사
COPY . .

# 개발 서버 실행
CMD ["pnpm", "run", "dev"]