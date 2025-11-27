import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST || '103.150.116.213',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'baliku',
  password: process.env.DB_PASSWORD || 'Jakarta@1945',
  database: process.env.DB_NAME || 'balikunewdb',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

async function updateAllIntColumns() {
  let connection;
  try {
    console.log('Connecting to database...');
    connection = await mysql.createConnection(dbConfig);
    console.log('Connected successfully!\n');

    // Get all tables
    const [tables] = await connection.query('SHOW TABLES');
    const tableKey = Object.keys(tables[0])[0];
    const tableNames = tables.map(t => t[tableKey]);

    console.log(`Found ${tableNames.length} tables in database "${dbConfig.database}"\n`);

    let totalUpdates = 0;

    // Process each table
    for (const tableName of tableNames) {
      console.log(`\n=== Processing table: ${tableName} ===`);

      // Get all columns for this table
      const [columns] = await connection.query(`SHOW COLUMNS FROM \`${tableName}\``);
      
      // Filter INT columns
      const intColumns = columns.filter(col => {
        const type = col.Type.toLowerCase();
        return type.includes('int') || type.includes('tinyint') || type.includes('smallint') || 
               type.includes('mediumint') || type.includes('bigint');
      });

      if (intColumns.length === 0) {
        console.log(`  No integer columns found`);
        continue;
      }

      console.log(`  Found ${intColumns.length} integer column(s):`);
      intColumns.forEach(col => console.log(`    - ${col.Field} (${col.Type})`));

      // Update each INT column
      for (const col of intColumns) {
        const columnName = col.Field;
        
        try {
          // Check if there are any NULL values first
          const [countResult] = await connection.query(
            `SELECT COUNT(*) as count FROM \`${tableName}\` WHERE \`${columnName}\` IS NULL`
          );
          const nullCount = countResult[0].count;

          if (nullCount > 0) {
            // Update NULL values to 0
            const [updateResult] = await connection.query(
              `UPDATE \`${tableName}\` SET \`${columnName}\` = 0 WHERE \`${columnName}\` IS NULL`
            );
            console.log(`    ✓ Updated ${updateResult.affectedRows} NULL values in "${columnName}" to 0`);
            totalUpdates += updateResult.affectedRows;
          } else {
            console.log(`    ✓ Column "${columnName}" has no NULL values`);
          }
        } catch (err) {
          console.error(`    ✗ Error updating column "${columnName}":`, err.message);
        }
      }
    }

    console.log(`\n${'='.repeat(50)}`);
    console.log(`✓ COMPLETED: Updated ${totalUpdates} total rows across all tables`);
    console.log(`${'='.repeat(50)}\n`);

  } catch (err) {
    console.error('\n✗ ERROR:', err.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('Database connection closed.');
    }
  }
}

// Run the update
console.log('===================================');
console.log('INT Columns NULL to 0 Updater');
console.log('===================================\n');
console.log('This script will update all integer columns in all tables');
console.log('to set NULL values to 0.\n');

updateAllIntColumns();

