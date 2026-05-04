const Database = require('better-sqlite3');
const db = new Database('./dev.db');
db.prepare("UPDATE User SET role = 'ADMIN'").run();
console.log('All users updated to ADMIN');
