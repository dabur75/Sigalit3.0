const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Backup configuration
const BACKUP_DIR = path.join(__dirname, '../backups');
const DB_NAME = process.env.DB_NAME || 'sigalit_pg';
const DB_USER = process.env.DB_USER || 'sigalit_user';

// Ensure backup directory exists
if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

// Create timestamp for backup filename
function getTimestamp() {
    const now = new Date();
    return now.toISOString().replace(/[:.]/g, '-').split('T')[0] + '_' + 
           now.toTimeString().split(' ')[0].replace(/:/g, '-');
}

// Create backup function
async function createBackup() {
    const timestamp = getTimestamp();
    const backupFile = path.join(BACKUP_DIR, `sigalit_backup_${timestamp}.sql`);
    
    console.log(`🔄 Creating backup: ${backupFile}`);
    
    const command = `pg_dump -U ${DB_USER} -d ${DB_NAME} -f "${backupFile}"`;
    
    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error('❌ Backup failed:', error.message);
                reject(error);
                return;
            }
            
            if (stderr) {
                console.warn('⚠️ Backup warnings:', stderr);
            }
            
            console.log(`✅ Backup completed successfully: ${backupFile}`);
            
            // Get file size
            const stats = fs.statSync(backupFile);
            const fileSizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
            console.log(`📊 Backup size: ${fileSizeInMB} MB`);
            
            resolve(backupFile);
        });
    });
}

// Restore backup function
async function restoreBackup(backupFile) {
    if (!fs.existsSync(backupFile)) {
        throw new Error(`Backup file not found: ${backupFile}`);
    }
    
    console.log(`🔄 Restoring from backup: ${backupFile}`);
    
    const command = `psql -U ${DB_USER} -d ${DB_NAME} -f "${backupFile}"`;
    
    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error('❌ Restore failed:', error.message);
                reject(error);
                return;
            }
            
            if (stderr) {
                console.warn('⚠️ Restore warnings:', stderr);
            }
            
            console.log('✅ Restore completed successfully');
            resolve();
        });
    });
}

// List available backups
function listBackups() {
    if (!fs.existsSync(BACKUP_DIR)) {
        console.log('📁 No backup directory found');
        return [];
    }
    
    const files = fs.readdirSync(BACKUP_DIR)
        .filter(file => file.endsWith('.sql'))
        .sort()
        .reverse();
    
    console.log('📋 Available backups:');
    files.forEach((file, index) => {
        const filePath = path.join(BACKUP_DIR, file);
        const stats = fs.statSync(filePath);
        const fileSizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
        const date = stats.mtime.toLocaleString();
        console.log(`${index + 1}. ${file} (${fileSizeInMB} MB) - ${date}`);
    });
    
    return files;
}

// Clean old backups (keep last 10)
function cleanOldBackups() {
    const files = fs.readdirSync(BACKUP_DIR)
        .filter(file => file.endsWith('.sql'))
        .map(file => ({
            name: file,
            path: path.join(BACKUP_DIR, file),
            time: fs.statSync(path.join(BACKUP_DIR, file)).mtime.getTime()
        }))
        .sort((a, b) => b.time - a.time);
    
    if (files.length > 10) {
        const toDelete = files.slice(10);
        console.log(`🗑️ Cleaning ${toDelete.length} old backups...`);
        
        toDelete.forEach(file => {
            fs.unlinkSync(file.path);
            console.log(`   Deleted: ${file.name}`);
        });
    }
}

// Main function
async function main() {
    const command = process.argv[2];
    
    try {
        switch (command) {
            case 'backup':
                await createBackup();
                cleanOldBackups();
                break;
                
            case 'restore':
                const backupFile = process.argv[3];
                if (!backupFile) {
                    console.error('❌ Please specify backup file to restore');
                    process.exit(1);
                }
                await restoreBackup(backupFile);
                break;
                
            case 'list':
                listBackups();
                break;
                
            default:
                console.log('📖 Usage:');
                console.log('  node backup.js backup     - Create a new backup');
                console.log('  node backup.js restore <file> - Restore from backup file');
                console.log('  node backup.js list       - List available backups');
                break;
        }
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    main();
}

module.exports = {
    createBackup,
    restoreBackup,
    listBackups,
    cleanOldBackups
};
