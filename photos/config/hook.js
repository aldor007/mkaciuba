module.exports = ({ env }) => ({
    timeout: 2000,
    settings: {
        cache: {
            enabled: true,
            config: {
                host: env('REDIS_HOST', '127.0.0.1'), // Redis host
                port: env.int('REDIS_PORT', 6379), // Redis port
                password: env('REDIS_PASSWORD', ''),
                db: env('REDIS_DB', '1')
            }
        }
    },
});