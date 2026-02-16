export declare const config: {
    env: string;
    port: number;
    db: {
        host: string;
        port: number;
        name: string;
        user: string;
        password: string;
    };
    redis: {
        host: string;
        port: number;
    };
    jwt: {
        secret: string;
        expiresIn: string;
    };
    mail: {
        host: string;
        port: number;
        user: string;
        password: string;
        from: string;
    };
    telegram: {
        botToken: string;
    };
    whatsapp: {
        apiUrl: string;
        apiKey: string;
    };
    rateLimit: {
        windowMs: number;
        max: number;
    };
};
//# sourceMappingURL=env.d.ts.map