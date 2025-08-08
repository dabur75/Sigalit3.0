const { Pool } = require('pg');

// PostgreSQL connection pool configuration
const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'sigalit_pg',
    user: process.env.DB_USER || 'sigalit_user',
    password: process.env.DB_PASSWORD || 'sigalit_password',
    port: process.env.DB_PORT || 5432,
    max: 20, // Maximum number of clients in the pool
    idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
    connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

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
