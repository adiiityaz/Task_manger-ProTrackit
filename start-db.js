const { execSync, spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const PGDATA = path.join(__dirname, 'pgdata');
const PORT = 5434;

function findPgCtl() {
    const localPath = path.join(__dirname, 'pgsql', 'bin', 'pg_ctl.exe');
    
    // Common paths for PostgreSQL on Windows
    const commonPaths = [
        localPath,
        'pg_ctl', // If in PATH
        path.join(process.env.ProgramFiles || 'C:\\Program Files', 'PostgreSQL', '17', 'bin', 'pg_ctl.exe'),
        path.join(process.env.ProgramFiles || 'C:\\Program Files', 'PostgreSQL', '16', 'bin', 'pg_ctl.exe')
    ];

    for (const p of commonPaths) {
        try {
            const cmd = p.includes(' ') ? `"${p}"` : p;
            execSync(`${cmd} --version`, { stdio: 'ignore' });
            return p;
        } catch (e) {
            // Continue
        }
    }
    return null;
}

async function startDb() {
    console.log('🚀 Checking Portable PostgreSQL...');
    
    const pgCtl = findPgCtl();
    if (!pgCtl) {
        console.error('❌ Error: PostgreSQL binaries (pg_ctl.exe) not found.');
        console.log('💡 Tip: Downloading binaries to project root...');
        return; // Wait for binaries to finish downloading
    }

    const binDir = path.dirname(pgCtl);
    const initDb = path.join(binDir, 'initdb.exe');

    // 1. Initialize if pgdata is missing
    if (!fs.existsSync(path.join(PGDATA, 'PG_VERSION'))) {
        console.log('📁 Initializing new database cluster in pgdata...');
        try {
            execSync(`"${initDb}" -D "${PGDATA}" -U postgres --auth=trust`, { stdio: 'inherit' });
        } catch (err) {
            console.error('❌ Failed to initialize database:', err.message);
            process.exit(1);
        }
    }

    console.log(`✅ Found PostgreSQL binaries: ${pgCtl}`);

    try {
        console.log('🔄 Starting PostgreSQL server...');
        // Check if PID file exists
        const pidFile = path.join(PGDATA, 'postmaster.pid');
        if (fs.existsSync(pidFile)) {
            console.log('ℹ️ PostgreSQL seems to be already running (postmaster.pid exists).');
            return;
        }

        const cmd = `"${pgCtl}" -D "${PGDATA}" -o "-p ${PORT}" start`;
        execSync(cmd, { stdio: 'inherit' });
        console.log(`✨ PostgreSQL is running on port ${PORT}`);
    } catch (err) {
        // Even if it fails, if the port is active, we are good
        console.log('ℹ️ Checking if PostgreSQL is already active on port...');
        try {
            execSync(`netstat -ano | findstr :${PORT}`, { stdio: 'ignore' });
            console.log(`✅ PostgreSQL is already active on port ${PORT}.`);
        } catch (e) {
            console.error('❌ Failed to start PostgreSQL:', err.message);
            process.exit(1);
        }
    }
}


startDb();

// Keep the process alive so concurrently doesn't think the DB task is "finished"
// (which would cause it to kill the API and Web processes)
setInterval(() => {}, 60000);
