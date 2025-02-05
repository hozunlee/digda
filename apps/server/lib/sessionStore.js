import { createClient } from "redis"; // Redis 사용 시

// 1. 메모리 스토어 구현 (개발용, 프로덕션에서는 Redis 권장)
class MemoryStore {
    constructor() {
        this.sessions = new Map();
    }

    async set(key, value, ttl = 3600) {
        this.sessions.set(key, {
            value,
            expires: Date.now() + ttl * 1000,
        });
    }

    async get(key) {
        const session = this.sessions.get(key);
        if (!session) return null;

        if (Date.now() > session.expires) {
            this.sessions.delete(key);
            return null;
        }

        return session.value;
    }

    async delete(key) {
        return this.sessions.delete(key);
    }
}

// 2. Redis 스토어 구현 (프로덕션용)
class RedisStore {
    constructor() {
        this.client = createClient({
            url: process.env.REDIS_URL,
        });
        this.client.connect().catch(console.error);
    }

    async set(key, value, ttl = 3600) {
        await this.client.set(key, value, { EX: ttl });
    }

    async get(key) {
        return await this.client.get(key);
    }

    async delete(key) {
        await this.client.del(key);
    }
}

// 환경에 따라 적절한 스토어 선택
const sessionStore =
    process.env.NODE_ENV === "production"
        ? new RedisStore()
        : new MemoryStore();

export default sessionStore;
