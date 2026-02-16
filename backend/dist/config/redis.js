"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRedisClient = void 0;
const redis_1 = require("redis");
const env_1 = require("./env");
let client;
const getRedisClient = async () => {
    if (!client) {
        client = (0, redis_1.createClient)({
            socket: {
                host: env_1.config.redis.host,
                port: env_1.config.redis.port,
            },
        });
        client.on('error', (err) => console.error('Redis Client Error', err));
        await client.connect();
    }
    return client;
};
exports.getRedisClient = getRedisClient;
//# sourceMappingURL=redis.js.map