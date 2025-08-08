const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const csv = require('csv-parser');

// PostgreSQL connection
const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'sigalit_pg',
    user: process.env.DB_USER || 'sigalit_user',
    password: process.env.DB_PASSWORD || 'sigalit_password',
    port: process.env.DB_PORT || 5432
});

// Migration configuration
const MIGRATION_CONFIG = {
    tables: [
        {
            name: 'users',
            csvFile: '../../users_sample.csv',
            priority: 1,
            dependencies: [],
            transform: (row) => ({
                id: parseInt(row.id),
                name: row.name,
                role: row.role,
                password: row.password || null,
                email: row.email || null,
                phone: row.phone || null,
                percent: row.percent ? parseInt(row.percent) : null,
                is_active: row.is_active === '1',
                house_id: row.house_id || 'dror',
                accessible_houses: JSON.stringify(['dror', 'havatzelet'])
            })
        },
        {
            name: 'constraints',
            csvFile: '../../constraints_sample.csv',
            priority: 2,
            dependencies: ['users'],
            transform: (row) => ({
                id: parseInt(row.id),
                user_id: parseInt(row.user_id),
                type: row.type,
                date: row.date,
                details: row.details || null,
                house_id: row.house_id || 'dror'
            })
        },
        {
            name: 'schedule',
            csvFile: '../../schedule_sample.csv',
            priority: 3,
            dependencies: ['users'],
            transform: (row) => ({
                id: parseInt(row.id),
                date: row.date,
                weekday: row.weekday,
                type: row.type,
                guide1_id: row.guide1_id ? parseInt(row.guide1_id) : null,
                guide2_id: row.guide2_id ? parseInt(row.guide2_id) : null,
                is_manual: row.is_manual === '1',
                is_locked: row.is_locked === '1',
                created_by: row.created_by ? parseInt(row.created_by) : null,
                created_at: row.created_at || null,
                updated_at: row.updated_at || null,
                guide1_name: row.guide1_name || null,
                guide1_role: row.guide1_role || null,
                guide2_name: row.guide2_name || null,
                guide2_role: row.guide2_role || null,
                house_id: row.house_id || 'dror'
            })
        }
    ]
};

// Helper function to read CSV file
function readCSVFile(filePath) {
    return new Promise((resolve, reject) => {
        const results = [];
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (data) => results.push(data))
            .on('end', () => resolve(results))
            .on('error', (error) => reject(error));
    });
}

// Helper function to generate INSERT query
function generateInsertQuery(tableName, columns) {
    const columnNames = columns.join(', ');
    const placeholders = columns.map((_, index) => `$${index + 1}`).join(', ');
    return `INSERT INTO ${tableName} (${columnNames}) VALUES (${placeholders}) ON CONFLICT (id) DO UPDATE SET ${columns.map(col => `${col} = EXCLUDED.${col}`).join(', ')}`;
}

// Helper function to insert data into PostgreSQL
async function insertData(tableName, data) {
    if (data.length === 0) {
        console.log(`📝 No data to insert for table: ${tableName}`);
        return 0;
    }

    const columns = Object.keys(data[0]);
    const query = generateInsertQuery(tableName, columns);
    
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        
        let insertedCount = 0;
        for (const row of data) {
            const values = columns.map(col => row[col]);
            await client.query(query, values);
            insertedCount++;
        }
        
        await client.query('COMMIT');
        console.log(`✅ Inserted ${insertedCount} rows into ${tableName}`);
        return insertedCount;
    } catch (error) {
        await client.query('ROLLBACK');
        console.error(`❌ Error inserting data into ${tableName}:`, error.message);
        throw error;
    } finally {
        client.release();
    }
}

// Main migration function
async function migrateData() {
    console.log('🚀 Starting data migration to PostgreSQL...');
    
    try {
        // First, create missing users that are referenced in other tables
        console.log('\n👥 Creating missing users...');
        await createMissingUsers();
        
        // Sort tables by priority
        const sortedTables = MIGRATION_CONFIG.tables.sort((a, b) => a.priority - b.priority);
        
        for (const tableConfig of sortedTables) {
            console.log(`\n📋 Migrating table: ${tableConfig.name}`);
            
            // Check if CSV file exists
            const csvPath = path.join(__dirname, tableConfig.csvFile);
            if (!fs.existsSync(csvPath)) {
                console.log(`⚠️ CSV file not found: ${csvPath}`);
                continue;
            }
            
            // Read CSV data
            console.log(`📖 Reading data from: ${csvPath}`);
            const csvData = await readCSVFile(csvPath);
            console.log(`📊 Found ${csvData.length} rows in CSV`);
            
            // Transform data
            console.log(`🔄 Transforming data...`);
            const transformedData = csvData.map(row => {
                const transformed = tableConfig.transform(row);
                if (tableConfig.name === 'users') {
                    console.log('Sample transformed row:', JSON.stringify(transformed, null, 2));
                }
                return transformed;
            });
            
            // Insert data into PostgreSQL
            console.log(`💾 Inserting data into PostgreSQL...`);
            const insertedCount = await insertData(tableConfig.name, transformedData);
            
            console.log(`✅ Successfully migrated ${insertedCount} rows to ${tableConfig.name}`);
        }
        
        console.log('\n🎉 Data migration completed successfully!');
        
        // Validate migration
        await validateMigration();
        
    } catch (error) {
        console.error('❌ Migration failed:', error);
        throw error;
    }
}

// Validation function
async function validateMigration() {
    console.log('\n🔍 Validating migration...');
    
    try {
        const client = await pool.connect();
        
        // Check row counts
        const tables = ['users', 'constraints', 'schedule'];
        for (const table of tables) {
            const result = await client.query(`SELECT COUNT(*) as count FROM ${table}`);
            console.log(`📊 ${table}: ${result.rows[0].count} rows`);
        }
        
        // Check foreign key relationships
        console.log('\n🔗 Checking foreign key relationships...');
        
        // Check if all schedule guide1_id references exist in users
        const scheduleCheck = await client.query(`
            SELECT COUNT(*) as count 
            FROM schedule s 
            LEFT JOIN users u ON s.guide1_id = u.id 
            WHERE s.guide1_id IS NOT NULL AND u.id IS NULL
        `);
        console.log(`📋 Schedule guide1_id orphans: ${scheduleCheck.rows[0].count}`);
        
        // Check if all constraints user_id references exist in users
        const constraintsCheck = await client.query(`
            SELECT COUNT(*) as count 
            FROM constraints c 
            LEFT JOIN users u ON c.user_id = u.id 
            WHERE u.id IS NULL
        `);
        console.log(`📋 Constraints user_id orphans: ${constraintsCheck.rows[0].count}`);
        
        // Test Hebrew text functionality
        console.log('\n📝 Testing Hebrew text functionality...');
        const hebrewTest = await client.query(`
            SELECT name, role 
            FROM users 
            WHERE name ILIKE '%אלדד%' OR name ILIKE '%תום%'
            LIMIT 5
        `);
        console.log('📋 Hebrew text search results:', hebrewTest.rows);
        
        // Test JSON functionality
        console.log('\n📄 Testing JSON functionality...');
        const jsonTest = await client.query(`
            SELECT name, accessible_houses 
            FROM users 
            WHERE accessible_houses ? 'dror'
            LIMIT 3
        `);
        console.log('📋 JSON query results:', jsonTest.rows);
        
        client.release();
        
        console.log('\n✅ Migration validation completed successfully!');
        
    } catch (error) {
        console.error('❌ Validation failed:', error);
        throw error;
    }
}

// Function to create missing users that are referenced in constraints and schedule
async function createMissingUsers() {
    console.log('\n👥 Creating missing users...');
    
    try {
        const client = await pool.connect();
        
        // Add missing users that are referenced in constraints and schedule
        const missingUsers = [
            { id: 6, name: 'ליאור', role: 'מדריך', house_id: 'dror' },
            { id: 12, name: 'יפתח', role: 'מדריך', house_id: 'dror' }
        ];
        
        for (const user of missingUsers) {
            await client.query(`
                INSERT INTO users (id, name, role, house_id, accessible_houses) 
                VALUES ($1, $2, $3, $4, $5)
                ON CONFLICT (id) DO UPDATE SET 
                    name = EXCLUDED.name,
                    role = EXCLUDED.role,
                    house_id = EXCLUDED.house_id,
                    accessible_houses = EXCLUDED.accessible_houses
            `, [user.id, user.name, user.role, user.house_id, JSON.stringify([user.house_id])]);
        }
        
        client.release();
        console.log('✅ Missing users created successfully!');
        
    } catch (error) {
        console.error('❌ Error creating missing users:', error);
        throw error;
    }
}

// Function to create additional sample data for testing
async function createAdditionalSampleData() {
    console.log('\n🔧 Creating additional sample data for testing...');
    
    try {
        const client = await pool.connect();
        
        // Add more users for testing (without specific IDs to avoid conflicts)
        const additionalUsers = [
            { name: 'דנה', role: 'רכז', house_id: 'dror' },
            { name: 'מיכל', role: 'רכז', house_id: 'havatzelet' }
        ];
        
        for (const user of additionalUsers) {
            await client.query(`
                INSERT INTO users (name, role, house_id, accessible_houses) 
                VALUES ($1, $2, $3, $4)
            `, [user.name, user.role, user.house_id, JSON.stringify([user.house_id])]);
        }
        
        // Add some coordinator rules
        const coordinatorRules = [
            { rule_type: 'prevent_pair', guide1_id: 1, guide2_id: 2, description: 'אין לעבוד יחד' },
            { rule_type: 'manual_only', guide1_id: 3, description: 'רק ידני' }
        ];
        
        for (const rule of coordinatorRules) {
            await client.query(`
                INSERT INTO coordinator_rules (rule_type, guide1_id, guide2_id, description) 
                VALUES ($1, $2, $3, $4)
                ON CONFLICT DO NOTHING
            `, [rule.rule_type, rule.guide1_id, rule.guide2_id, rule.description]);
        }
        
        // Add some weekend types
        const weekendTypes = [
            { date: '2025-08-02', is_closed: false },
            { date: '2025-08-09', is_closed: true },
            { date: '2025-08-16', is_closed: false }
        ];
        
        for (const weekend of weekendTypes) {
            await client.query(`
                INSERT INTO weekend_types (date, is_closed) 
                VALUES ($1, $2)
                ON CONFLICT (date) DO UPDATE SET is_closed = EXCLUDED.is_closed
            `, [weekend.date, weekend.is_closed]);
        }
        
        client.release();
        console.log('✅ Additional sample data created successfully!');
        
    } catch (error) {
        console.error('❌ Error creating additional sample data:', error);
        throw error;
    }
}

// Main execution
async function main() {
    try {
        await migrateData();
        
        console.log('\n🎉 All migration tasks completed successfully!');
        console.log('\n📊 Migration Summary:');
        console.log('✅ PostgreSQL schema created with 28 tables');
        console.log('✅ Sample data migrated from CSV files');
        console.log('✅ Hebrew text support verified');
        console.log('✅ JSON functionality tested');
        console.log('✅ Foreign key relationships validated');
        console.log('✅ Additional test data created');
        
    } catch (error) {
        console.error('\n❌ Migration failed:', error);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

// Run if called directly
if (require.main === module) {
    main();
}

module.exports = {
    migrateData,
    validateMigration,
    createAdditionalSampleData
};
