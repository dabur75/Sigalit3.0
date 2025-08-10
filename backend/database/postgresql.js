const { Pool } = require('pg');

// PostgreSQL connection pool configuration
const poolConfig = process.env.DATABASE_URL ? 
    {
        connectionString: process.env.DATABASE_URL,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    } : 
    {
        host: process.env.DB_HOST || 'localhost',
        database: process.env.DB_NAME || 'sigalit_pg',
        user: process.env.DB_USER || 'sigalit_user',
        password: process.env.DB_PASSWORD || 'sigalit_password',
        port: process.env.DB_PORT || 5432,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    };

const pool = new Pool(poolConfig);

// Test the connection
pool.on('connect', (client) => {
    console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err, client) => {
    console.error('❌ Unexpected error on idle client', err);
    process.exit(-1);
});

// Health check function
async function testConnection() {
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT NOW() as current_time, \'שלום עולם\' as hebrew_test');
        client.release();
        console.log('✅ PostgreSQL connection test successful:', result.rows[0]);
        return true;
    } catch (error) {
        console.error('❌ PostgreSQL connection test failed:', error.message);
        return false;
    }
}

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('🔄 Shutting down PostgreSQL connection pool...');
    await pool.end();
    process.exit(0);
});

module.exports = {
    pool,
    testConnection,
    query: (text, params) => pool.query(text, params),
    getClient: () => pool.connect()
};
