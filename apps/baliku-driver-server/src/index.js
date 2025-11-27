import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';
import rateLimit from 'express-rate-limit';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Rate limiting configuration
// API limiter: 100 requests per 15 minutes per IP
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests from this IP, please try again after 15 minutes.' },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Login limiter: 5 attempts per 15 minutes per IP
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login attempts per windowMs
  message: { error: 'Too many login attempts from this IP, please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful requests
});

// Database configuration with security and performance improvements
const dbConfig = {
  host: process.env.DB_HOST || '103.150.116.213',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'baliku',
  password: process.env.DB_PASSWORD || 'Jakarta@1945',
  database: process.env.DB_NAME || 'balikunewdb',
  // Connection pool settings
  waitForConnections: true,
  connectionLimit: Number(process.env.DB_POOL_SIZE || 20), // Increased from 10 to 20
  queueLimit: 0,
  // Timeout settings for better reliability
  connectTimeout: 10000,      // 10 seconds to establish connection
  acquireTimeout: 60000,      // 60 seconds to get connection from pool
  timeout: 30000,             // 30 seconds query timeout
  // Connection health settings
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  // SSL/TLS encryption (enable in production)
  // ssl: process.env.DB_SSL === 'true' ? {
  //   rejectUnauthorized: false // Set to true with proper certificate in production
  // } : false
};

let pool;
async function getPool() {
  if (!pool) {
    // Adjust pool settings for serverless environment (Vercel)
    const isVercel = process.env.VERCEL === '1' || process.env.VERCEL_ENV;
    const poolConfig = {
      ...dbConfig,
      // For serverless: smaller pool, shorter timeouts
      connectionLimit: isVercel ? 5 : Number(process.env.DB_POOL_SIZE || 20),
      connectTimeout: isVercel ? 5000 : 10000,
      acquireTimeout: isVercel ? 10000 : 60000,
      timeout: isVercel ? 10000 : 30000,
      // For serverless: don't keep connections alive too long
      ...(isVercel && {
        idleTimeout: 10000,
        maxIdle: 2
      })
    };
    
    pool = mysql.createPool(poolConfig);
    
    // Handle connection errors and reconnect
    pool.on('error', (err) => {
      console.error('Database pool error:', err);
      if (err.code === 'PROTOCOL_CONNECTION_LOST' || err.code === 'ECONNRESET') {
        console.log('Database connection lost, pool will recreate connections automatically');
        // Reset pool to null so it gets recreated on next call (important for serverless)
        if (isVercel) {
          pool = null;
        }
      }
    });
    
    // Log pool events for monitoring (optional, remove in production if too verbose)
    if (process.env.NODE_ENV === 'development') {
      pool.on('connection', (connection) => {
        console.log('New database connection established');
      });
    }
  }
  return pool;
}

// Periodic health check to ensure connections are alive
// Skip in Vercel serverless environment (functions are stateless)
if (typeof setInterval !== 'undefined' && process.env.VERCEL !== '1' && !process.env.VERCEL_ENV) {
  setInterval(async () => {
    try {
      const p = await getPool();
      await p.query('SELECT 1');
    } catch (err) {
      console.error('Database health check failed:', err.message);
    }
  }, 30000); // Every 30 seconds
}

const dataDir = path.join(process.cwd(), 'data');
const holidayConfigPath = path.join(dataDir, 'holiday-taxis-config.json');
const defaultHolidayConfig = {
  endpoint: process.env.HOLIDAY_TAXIS_ENDPOINT || 'https://suppliers.htxstaging.com',
  apiKey: process.env.HOLIDAY_TAXIS_API_KEY || '',
  apiVersion: process.env.HOLIDAY_TAXIS_API_VERSION || '2025-01'
};

// Admin credentials from environment variables
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '4dm1n';

const loginConfig = {
  driver: {
    table: 'driver',
    nameField: 'Driver Name',
    passwordField: 'Password'
  },
  guide: {
    table: 'guide',
    nameField: 'Guide Name',
    passwordField: 'Password'
  },
  admin: {
    // Admin uses environment variables, not database
    type: 'env',
    username: ADMIN_USERNAME,
    password: ADMIN_PASSWORD
  }
};

const activeSessions = new Map();
const SESSION_MAX_AGE = 24 * 60 * 60 * 1000; // 24 hours

function createSession(payload = {}) {
  const token = crypto.randomBytes(32).toString('hex');
  activeSessions.set(token, { ...payload, createdAt: Date.now() });
  return token;
}

// Authentication middleware
function authenticateUser(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required. Please login first.' });
  }
  
  const token = authHeader.substring(7);
  const session = activeSessions.get(token);
  
  if (!session) {
    return res.status(401).json({ error: 'Invalid or expired token. Please login again.' });
  }
  
  // Check session expiry
  if (Date.now() - session.createdAt > SESSION_MAX_AGE) {
    activeSessions.delete(token);
    return res.status(401).json({ error: 'Session expired. Please login again.' });
  }
  
  // Attach user info to request
  req.user = {
    role: session.role,
    name: session.name,
    token: token
  };
  
  next();
}

// Helper function to normalize field names for comparison
function normalizeFieldName(name) {
  return String(name || '').toLowerCase().trim().replace(/\s+/g, ' ');
}

// Get hidden fields for a role and table
function getHiddenFieldsForRole(role, tableName) {
  const normalizedTable = normalizeFieldName(tableName);
  
  // Handle "operasional services" table
  if (normalizedTable === normalizeFieldName('operasional services')) {
    if (role === 'driver') {
      return [
        'Timestamps', 'Services ID', 'Service Rate', 'Nett Rate', 'Currency',
        'Driver or Guide', 'Guide Commision', 'Guide Fee', 'Driver Service Time',
        'Printcode', 'Nameboard path', 'Deposit Type', 'Driver/Guide OK', 'Send HTX',
        'key_id', 'plat_mobil', 'car_brand', 'color_vehicle', 'car_id',
        'pic_name', 'driver_license', 'pic_contact',
        'Services Category', 'Order ID', 'Program Category', 'Adult', 'Child', 'Infant'
      ];
    } else if (role === 'guide') {
      return [
        'Timestamps', 'Services ID', 'Service Rate', 'Nett Rate', 'Currency',
        'Driver or Guide', 'Driver Fee', 'Driver Service Time', 'BBM', 'Ticket',
        'Printcode', 'Nameboard path', 'Deposit Type', 'Driver/Guide OK', 'Send HTX',
        'key_id', 'plat_mobil', 'car_brand', 'color_vehicle', 'car_id',
        'pic_name', 'driver_license', 'pic_contact',
        'Services Category', 'Order ID', 'Program Category', 'Number of (pax)'
      ];
    }
  }
  
  // Handle "driver" table
  if (normalizedTable === normalizeFieldName('driver')) {
    if (role === 'driver') {
      return [
        'key_id', 'driver_details'
      ];
    }
  }
  
  // Handle "guide" table
  if (normalizedTable === normalizeFieldName('guide')) {
    if (role === 'guide') {
      return [
        'key_id', 'guide_details'
      ];
    }
  }
  
  return [];
}

// Get editable fields for a role and table (fields that can be edited)
// Returns empty array if all visible fields are editable, or array of field names that are editable
function getEditableFieldsForRole(role, tableName) {
  const normalizedTable = normalizeFieldName(tableName);
  
  // For driver role in driver table: only password is editable
  if (normalizedTable === normalizeFieldName('driver') && role === 'driver') {
    return ['Password'];
  }
  
  // For guide role in guide table: only password is editable
  if (normalizedTable === normalizeFieldName('guide') && role === 'guide') {
    return ['Password'];
  }
  
  // For other cases, all visible fields are editable (return empty array means no restriction)
  return [];
}

async function ensureDataDir(){
  await fs.mkdir(dataDir, { recursive: true });
}

async function readHolidayConfig(){
  try {
    const raw = await fs.readFile(holidayConfigPath, 'utf-8');
    const parsed = JSON.parse(raw);
    return {
      ...defaultHolidayConfig,
      ...parsed
    };
  } catch (err) {
    return { ...defaultHolidayConfig };
  }
}

async function writeHolidayConfig(config){
  await ensureDataDir();
  const payload = {
    endpoint: config.endpoint || defaultHolidayConfig.endpoint,
    apiKey: config.apiKey || '',
    apiVersion: config.apiVersion || defaultHolidayConfig.apiVersion
  };
  await fs.writeFile(holidayConfigPath, JSON.stringify(payload, null, 2), 'utf-8');
  return payload;
}

app.get('/', (_req, res) => {
  res.json({ name: 'Baliku Driver API', status: 'ok' });
});

// Apply API rate limiter to all /api routes (except /api/login which has its own limiter)
// Note: This must be before route definitions but after login routes
app.use('/api', (req, res, next) => {
  // Skip rate limiting for login endpoint (it has its own limiter)
  if (req.path === '/login' && req.method === 'POST') {
    return next();
  }
  // Apply API limiter to all other /api routes
  return apiLimiter(req, res, next);
});

// List tables in the database
app.get('/api/tables', authenticateUser, async (_req, res) => {
  try {
    const p = await getPool();
    const [rows] = await p.query('SHOW TABLES');
    const key = Object.keys(rows[0] || { 'Tables_in_db': '' })[0];
    const tables = rows.map(r => r[key]);
    res.json({ tables });
  } catch (err) {
    res.status(500).json({ error: 'Failed to list tables', details: String(err) });
  }
});

// Get rows of a specific table (limited) - with role-based filtering
app.get('/api/tables/:name', authenticateUser, async (req, res) => {
  const { name } = req.params;
  const user = req.user;
  const limit = Math.min(Number(req.query.limit || 50), 500);
  
  try {
    const p = await getPool();
    const normalizedTableName = normalizeFieldName(name);
    
    // Build WHERE clause based on user role
    // Admin has full access - no filtering
    let whereClause = '';
    let whereParams = [];
    
    if (user.role === 'admin') {
      // Admin sees all data - no WHERE clause
      whereClause = '';
      whereParams = [];
    } else if (user.role === 'driver') {
      if (normalizedTableName === normalizeFieldName('operasional services')) {
        whereClause = 'WHERE LOWER(TRIM(`Driver Name`)) = LOWER(TRIM(?))';
        whereParams.push(user.name);
      } else if (normalizedTableName === 'driver') {
        whereClause = 'WHERE LOWER(TRIM(`Driver Name`)) = LOWER(TRIM(?))';
        whereParams.push(user.name);
      }
    } else if (user.role === 'guide') {
      if (normalizedTableName === normalizeFieldName('operasional services')) {
        whereClause = 'WHERE LOWER(TRIM(`Guide Name`)) = LOWER(TRIM(?))';
        whereParams.push(user.name);
      } else if (normalizedTableName === 'guide') {
        whereClause = 'WHERE LOWER(TRIM(`Guide Name`)) = LOWER(TRIM(?))';
        whereParams.push(user.name);
      }
    }
    
    // Get all columns first
    const [colRows] = await p.query(`SHOW COLUMNS FROM \`${name}\``);
    const allColumns = colRows.map(col => col.Field);
    
    // Get primary key columns - these must ALWAYS be included even if hidden
    const [pkRows] = await p.query(`SHOW KEYS FROM \`${name}\` WHERE Key_name = 'PRIMARY'`);
    const primaryKeyColumns = pkRows.map(r => r.Column_name);
    
    // Filter out hidden fields based on role
    // Admin sees all fields - no filtering
    const hiddenFields = user.role === 'admin' ? [] : getHiddenFieldsForRole(user.role, name);
    const visibleColumns = allColumns.filter(col => {
      const normalizedCol = normalizeFieldName(col);
      // Always include primary key columns, even if they're in hidden fields
      if (primaryKeyColumns.includes(col)) {
        return true;
      }
      return !hiddenFields.some(hidden => normalizeFieldName(hidden) === normalizedCol);
    });
    
    // Build SELECT clause - use visible columns or all if no filtering needed
    const selectFields = hiddenFields.length > 0 && visibleColumns.length > 0
      ? visibleColumns.map(col => `\`${col}\``).join(', ')
      : '*';
    
    // Build SQL query
    const sql = `SELECT ${selectFields} FROM \`${name}\` ${whereClause} LIMIT ?`;
    const queryParams = [...whereParams, limit];
    
    const [rows] = await p.query(sql, queryParams);
    
    // Get column types to handle datetime formatting
    const columnTypes = {};
    colRows.forEach(col => {
      columnTypes[col.Field] = col.Type;
    });

    // Process rows to ensure datetime values are properly formatted
    const processedRows = rows.map(row => {
      const processedRow = {};
      for (const [key, value] of Object.entries(row)) {
        if (value instanceof Date) {
          // Convert Date objects to MySQL datetime format strings (UTC)
          const pad = (n) => String(n).padStart(2, '0');
          processedRow[key] = `${value.getUTCFullYear()}-${pad(value.getUTCMonth() + 1)}-${pad(value.getUTCDate())} ${pad(value.getUTCHours())}:${pad(value.getUTCMinutes())}:${pad(value.getUTCSeconds())}`;
        } else {
          processedRow[key] = value;
        }
      }
      return processedRow;
    });

    res.json({ table: name, rows: processedRows });
  } catch (err) {
    res.status(500).json({ error: `Failed to fetch table ${name}`, details: String(err) });
  }
});

// Holiday Taxis configuration routes
app.get('/api/holiday-taxis/config', authenticateUser, async (_req, res) => {
  try {
    const config = await readHolidayConfig();
    res.json(config);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load Holiday Taxis config', details: String(err) });
  }
});

app.post('/api/holiday-taxis/config', authenticateUser, async (req, res) => {
  const { endpoint, apiKey, apiVersion } = req.body || {};
  if (!endpoint || typeof endpoint !== 'string') {
    return res.status(400).json({ error: 'endpoint is required' });
  }
  try {
    const config = await writeHolidayConfig({
      endpoint: endpoint.trim(),
      apiKey: (apiKey || '').trim(),
      apiVersion: (apiVersion || defaultHolidayConfig.apiVersion).trim()
    });
    res.json({ success: true, config });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save Holiday Taxis config', details: String(err) });
  }
});

// Get table metadata: primary key columns, column list, and column types
app.get('/api/tables/:name/meta', authenticateUser, async (req, res) => {
  const name = decodeURIComponent(req.params.name);
  const user = req.user;
  try {
    const p = await getPool();
    const [pkRows] = await p.query(`SHOW KEYS FROM \`${name}\` WHERE Key_name = 'PRIMARY'`);
    const primaryKey = pkRows.map(r => r.Column_name);
    const [colRows] = await p.query(`SHOW COLUMNS FROM \`${name}\``);
    
    // Filter out hidden columns based on role
    // BUT always include primary key columns (needed for updates)
    // Admin sees all columns - no filtering
    const hiddenFields = user.role === 'admin' ? [] : getHiddenFieldsForRole(user.role, name);
    const allColumns = colRows.map(r => r.Field);
    const visibleColumns = hiddenFields.length > 0
      ? allColumns.filter(col => {
          const normalizedCol = normalizeFieldName(col);
          // Always include primary key columns, even if they're in hidden fields
          if (primaryKey.includes(col)) {
            return true;
          }
          return !hiddenFields.some(hidden => normalizeFieldName(hidden) === normalizedCol);
        })
      : allColumns;
    
    // Build column types map and detect generated/virtual columns
    // Include ALL columns in columnTypes (including primary keys even if hidden)
    // This ensures primary keys are available for updates even if hidden from UI
    const columnTypes = {};
    const generatedColumns = [];
    colRows.forEach(col => {
      // Always include column type, even if hidden (needed for primary keys)
      columnTypes[col.Field] = col.Type;
      // Check if column is generated/virtual
      if (col.Extra && (col.Extra.includes('GENERATED ALWAYS AS') || col.Extra.includes('VIRTUAL') || col.Extra.includes('STORED'))) {
        generatedColumns.push(col.Field);
      }
    });
    
    res.json({ table: name, primaryKey, columns: visibleColumns, columnTypes, generatedColumns });
  } catch (err) {
    res.status(500).json({ error: `Failed to fetch meta for ${name}`, details: String(err) });
  }
});

app.get('/api/login/options', async (req, res) => {
  const type = String(req.query.type || '').toLowerCase();
  const config = loginConfig[type];
  if (!config) {
    return res.status(400).json({ error: 'Invalid login type. Expected "driver", "guide", or "admin".' });
  }
  
  // Admin uses environment variables - return hardcoded username
  if (type === 'admin' && config.type === 'env') {
    return res.json({ options: [{ name: config.username }] });
  }
  
  try {
    const p = await getPool();
    const sql = `
      SELECT DISTINCT \`${config.nameField}\` AS name
      FROM \`${config.table}\`
      WHERE \`${config.nameField}\` IS NOT NULL
        AND TRIM(\`${config.nameField}\`) <> ''
      ORDER BY \`${config.nameField}\`
      LIMIT 1000
    `;
    const [rows] = await p.query(sql);
    const options = rows
      .map(row => row.name)
      .filter(Boolean)
      .map(name => ({ name }));
    res.json({ options });
  } catch (err) {
    console.error('Error fetching login options:', err);
    res.status(500).json({ error: 'Failed to fetch login options', details: String(err) });
  }
});

// Login endpoint has its own stricter rate limiter
app.post('/api/login', loginLimiter, async (req, res) => {
  const { type, name, password } = req.body || {};
  const normalizedType = String(type || '').toLowerCase();
  const config = loginConfig[normalizedType];
  if (!config) {
    return res.status(400).json({ error: 'Invalid login type. Expected "driver", "guide", or "admin".' });
  }
  if (!name || !password) {
    return res.status(400).json({ error: 'Name and password are required.' });
  }
  
  // Handle admin login via environment variables
  if (normalizedType === 'admin' && config.type === 'env') {
    const normalizedName = String(name || '').trim().toLowerCase();
    const normalizedConfigUsername = String(config.username || '').trim().toLowerCase();
    if (normalizedName === normalizedConfigUsername && String(password) === String(config.password)) {
      const sessionToken = createSession({
        role: 'admin',
        name: config.username
      });
      return res.json({
        success: true,
        token: sessionToken,
        role: 'admin',
        name: config.username
      });
    } else {
      return res.status(401).json({ error: 'Invalid name or password.' });
    }
  }
  
  // Handle driver/guide login via database
  try {
    const p = await getPool();
    const sql = `
      SELECT \`${config.nameField}\` AS nameValue,
             \`${config.passwordField}\` AS passwordValue
      FROM \`${config.table}\`
      WHERE LOWER(TRIM(\`${config.nameField}\`)) = LOWER(TRIM(?))
      LIMIT 1
    `;
    const [rows] = await p.query(sql, [name]);
    if (!rows || rows.length === 0) {
      return res.status(401).json({ error: 'Invalid name or password.' });
    }
    const record = rows[0];
    const storedPassword = record.passwordValue !== null && record.passwordValue !== undefined
      ? String(record.passwordValue)
      : '';
    if (storedPassword !== String(password)) {
      return res.status(401).json({ error: 'Invalid name or password.' });
    }
    const sessionToken = createSession({
      role: normalizedType,
      name: record.nameValue
    });
    res.json({
      success: true,
      token: sessionToken,
      role: normalizedType,
      name: record.nameValue
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed', details: String(err) });
  }
});

// Bulk import rows (for CSV import) - MUST be before /api/tables/:name route
// Body: { rows: [{ col: value, ... }, ...] }
app.post('/api/tables/:name/bulk-import', authenticateUser, async (req, res) => {
  const name = decodeURIComponent(req.params.name);
  console.log(`POST /api/tables/${name}/bulk-import`, { rowCount: req.body.rows?.length || 0 });
  const { rows } = req.body || {};
  if (!rows || !Array.isArray(rows) || rows.length === 0) {
    return res.status(400).json({ error: 'Invalid body. Expect { rows: [] } with at least one row' });
  }
  
  try {
    const p = await getPool();
    
    // Get column types to handle data conversion
    const [colRows] = await p.query(`SHOW COLUMNS FROM \`${name}\``);
    const columnTypes = {};
    const columnInfo = {};
    colRows.forEach(col => {
      columnTypes[col.Field] = col.Type;
      columnInfo[col.Field] = col;
    });

    // Get primary key columns to check if they're auto-increment
    const [pkRows] = await p.query(`SHOW KEYS FROM \`${name}\` WHERE Key_name = 'PRIMARY'`);
    const autoIncrementCols = new Set();
    pkRows.forEach(pk => {
      const colInfo = columnInfo[pk.Column_name];
      if (colInfo && colInfo.Extra && colInfo.Extra.toLowerCase().includes('auto_increment')) {
        autoIncrementCols.add(pk.Column_name);
      }
    });

    let inserted = 0;
    let failed = 0;
    const errors = [];

    // Get all valid column names from database
    const validColumns = new Set(colRows.map(col => col.Field));
    
    // Process each row
    for (let i = 0; i < rows.length; i++) {
      const rowData = rows[i];
      try {
        // Build INSERT columns and values - only include columns that exist in database
        const insertCols = Object.keys(rowData).filter(col => {
          // Skip auto-increment primary keys
          if (autoIncrementCols.has(col)) {
            return false;
          }
          // Only include columns that exist in the database
          if (!validColumns.has(col)) {
            console.warn(`Row ${i + 1}: Column "${col}" not found in table, skipping`);
            return false;
          }
          return true;
        });
        
        if (insertCols.length === 0) {
          const invalidCols = Object.keys(rowData).filter(col => !validColumns.has(col) && !autoIncrementCols.has(col));
          if (invalidCols.length > 0) {
            failed++;
            errors.push(`Row ${i + 1}: No valid columns to insert. Invalid columns: ${invalidCols.join(', ')}`);
          } else {
            failed++;
            errors.push(`Row ${i + 1}: No fields to insert (all columns are auto-increment or missing)`);
          }
          continue;
        }

        // Convert data values based on column types
        const processedData = {};
        for (const col of insertCols) {
          let value = rowData[col];
          if (columnTypes[col]) {
            const typeStr = columnTypes[col].toLowerCase();
            if (typeStr.includes('int')) {
              if (value === '' || value === null || value === undefined) {
                const colInfo = columnInfo[col];
                if (colInfo && colInfo.Null === 'YES') {
                  value = null;
                } else {
                  value = 0;
                }
              } else {
                value = Number(value);
                if (!Number.isFinite(value)) {
                  value = 0;
                } else {
                  value = Math.floor(value);
                }
              }
            } else if ((typeStr.includes('decimal') || typeStr.includes('float') || typeStr.includes('double'))) {
              if (value === '' || value === null || value === undefined) {
                value = null;
              } else {
                value = Number(value);
                if (!Number.isFinite(value)) {
                  value = null;
                }
              }
            } else if (typeStr.includes('datetime') || typeStr.includes('timestamp') || typeStr.includes('date')) {
              // Handle datetime fields - keep as string if valid format, otherwise null
              if (value === '' || value === null || value === undefined) {
                value = null;
              } else {
                // Keep datetime as string - MySQL will validate format
                value = String(value).trim();
                if (value === '') {
                  value = null;
                }
              }
            }
          }
          
          // Check if column is required (NOT NULL and no default)
          const colInfo = columnInfo[col];
          if (colInfo && colInfo.Null === 'NO' && !colInfo.Default && (value === null || value === '')) {
            throw new Error(`Required column "${col}" is missing or empty`);
          }
          
          processedData[col] = value;
        }

        const columns = insertCols.map(c => `\`${c}\``).join(', ');
        const placeholders = insertCols.map(() => '?').join(', ');
        const values = insertCols.map(c => processedData[c]);
        const sql = `INSERT INTO \`${name}\` (${columns}) VALUES (${placeholders})`;
        await p.query(sql, values);
        inserted++;
      } catch (err) {
        failed++;
        const errorMsg = err.message || String(err);
        const errorCode = err.code || '';
        errors.push(`Row ${i + 1}: ${errorMsg}${errorCode ? ` (Code: ${errorCode})` : ''}`);
        console.error(`Failed to import row ${i + 1}:`, err);
        console.error(`Row data:`, JSON.stringify(rowData, null, 2));
      }
    }

    res.json({ 
      inserted, 
      failed, 
      total: rows.length,
      errors: errors.length > 0 ? errors.slice(0, 10) : [] // Return first 10 errors
    });
  } catch (err) {
    res.status(500).json({ error: `Failed to bulk import rows into ${name}`, details: String(err) });
  }
});

// Holiday Taxis: Update booking status
app.put('/api/holiday-taxis/bookings/:bookingRef/status', authenticateUser, async (req, res) => {
  const bookingRef = decodeURIComponent(req.params.bookingRef);
  const { status } = req.body || {};
  if (!status) {
    return res.status(400).json({ error: 'Status is required' });
  }
  if (!bookingRef) {
    return res.status(400).json({ error: 'bookingRef is required' });
  }
  try {
    const config = await readHolidayConfig();
    if (!config.apiKey) {
      return res.status(400).json({ error: 'Holiday Taxis API key is not configured' });
    }
    const endpoint = (config.endpoint || '').replace(/\/+$/, '');
    if (!endpoint) {
      return res.status(400).json({ error: 'Holiday Taxis endpoint is not configured' });
    }
    const targetUrl = `${endpoint}/bookings/${encodeURIComponent(bookingRef)}`;
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Api_key': config.apiKey
    };
    if (config.apiVersion) {
      headers['VERSION'] = config.apiVersion;
    }
    console.log('Holiday Taxis PUT', targetUrl, { status });
    const response = await fetch(targetUrl, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ status })
    });
    const text = await response.text();
    let payload;
    try {
      payload = text ? JSON.parse(text) : {};
    } catch {
      payload = { raw: text };
    }
    if (!response.ok) {
      console.error('Holiday Taxis API error:', response.status, payload);
      return res.status(response.status).json({
        error: payload.error || payload.message || payload.title || 'Holiday Taxis API error',
        details: payload.details || payload.message || payload.description || payload.error_description || payload.raw || text || `HTTP ${response.status}`
      });
    }
    res.json({
      success: true,
      data: payload
    });
  } catch (err) {
    console.error('Holiday Taxis status update error:', err);
    res.status(500).json({ error: 'Failed to update Holiday Taxis booking status', details: String(err) });
  }
});

// Update vehicle and driver details for a booking
// PUT /api/holiday-taxis/bookings/:bookingRef/vehicles/:vehicleIdentifier
app.put('/api/holiday-taxis/bookings/:bookingRef/vehicles/:vehicleIdentifier', authenticateUser, async (req, res) => {
  const bookingRef = decodeURIComponent(req.params.bookingRef);
  const vehicleIdentifier = decodeURIComponent(req.params.vehicleIdentifier);
  const { driver, vehicle } = req.body || {};
  
  if (!bookingRef) {
    return res.status(400).json({ error: 'bookingRef is required' });
  }
  if (!vehicleIdentifier) {
    return res.status(400).json({ error: 'vehicleIdentifier is required' });
  }
  if (!driver || !vehicle) {
    return res.status(400).json({ error: 'Both driver and vehicle objects are required' });
  }
  
  try {
    const config = await readHolidayConfig();
    if (!config.apiKey) {
      return res.status(400).json({ error: 'Holiday Taxis API key is not configured' });
    }
    const endpoint = (config.endpoint || '').replace(/\/+$/, '');
    if (!endpoint) {
      return res.status(400).json({ error: 'Holiday Taxis endpoint is not configured' });
    }
    const targetUrl = `${endpoint}/bookings/${encodeURIComponent(bookingRef)}/vehicles/${encodeURIComponent(vehicleIdentifier)}`;
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Api_key': config.apiKey
    };
    if (config.apiVersion) {
      headers['VERSION'] = config.apiVersion;
    }
    
    const requestBody = { driver, vehicle };
    console.log('Holiday Taxis PUT vehicle/driver', targetUrl, requestBody);
    
    const response = await fetch(targetUrl, {
      method: 'PUT',
      headers,
      body: JSON.stringify(requestBody)
    });
    
    const text = await response.text();
    let payload;
    try {
      payload = text ? JSON.parse(text) : {};
    } catch {
      payload = { raw: text };
    }
    
    if (!response.ok) {
      console.error('Holiday Taxis API error:', response.status, payload);
      return res.status(response.status).json({
        error: payload.error || payload.message || payload.title || 'Holiday Taxis API error',
        details: payload.details || payload.message || payload.description || payload.error_description || payload.raw || text || `HTTP ${response.status}`
      });
    }
    
    res.json({
      success: true,
      data: payload
    });
  } catch (err) {
    console.error('Holiday Taxis vehicle/driver update error:', err);
    res.status(500).json({ error: 'Failed to update Holiday Taxis vehicle/driver details', details: String(err) });
  }
});

// De-allocate a vehicle and driver from a booking
// DELETE /api/holiday-taxis/bookings/:bookingRef/vehicles/:vehicleIdentifier
app.delete('/api/holiday-taxis/bookings/:bookingRef/vehicles/:vehicleIdentifier', authenticateUser, async (req, res) => {
  const bookingRef = decodeURIComponent(req.params.bookingRef);
  const vehicleIdentifier = decodeURIComponent(req.params.vehicleIdentifier);
  
  if (!bookingRef) {
    return res.status(400).json({ error: 'bookingRef is required' });
  }
  if (!vehicleIdentifier) {
    return res.status(400).json({ error: 'vehicleIdentifier is required' });
  }
  
  try {
    const config = await readHolidayConfig();
    if (!config.apiKey) {
      return res.status(400).json({ error: 'Holiday Taxis API key is not configured' });
    }
    const endpoint = (config.endpoint || '').replace(/\/+$/, '');
    if (!endpoint) {
      return res.status(400).json({ error: 'Holiday Taxis endpoint is not configured' });
    }
    const targetUrl = `${endpoint}/bookings/${encodeURIComponent(bookingRef)}/vehicles/${encodeURIComponent(vehicleIdentifier)}`;
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Api_key': config.apiKey
    };
    if (config.apiVersion) {
      headers['VERSION'] = config.apiVersion;
    }
    
    console.log('Holiday Taxis DELETE vehicle/driver', targetUrl);
    
    const response = await fetch(targetUrl, {
      method: 'DELETE',
      headers
    });
    
    const text = await response.text();
    let payload;
    try {
      payload = text ? JSON.parse(text) : {};
    } catch {
      payload = { raw: text };
    }
    
    if (!response.ok) {
      console.error('Holiday Taxis API error:', response.status, payload);
      return res.status(response.status).json({
        error: payload.error || payload.message || payload.title || 'Holiday Taxis API error',
        details: payload.details || payload.message || payload.description || payload.error_description || payload.raw || text || `HTTP ${response.status}`
      });
    }
    
    res.json({
      success: true,
      data: payload
    });
  } catch (err) {
    console.error('Holiday Taxis vehicle/driver de-allocation error:', err);
    res.status(500).json({ error: 'Failed to de-allocate Holiday Taxis vehicle/driver', details: String(err) });
  }
});

// Provide current location of a vehicle
// POST /api/holiday-taxis/bookings/:bookingRef/vehicles/:vehicleIdentifier/location
app.post('/api/holiday-taxis/bookings/:bookingRef/vehicles/:vehicleIdentifier/location', authenticateUser, async (req, res) => {
  const bookingRef = decodeURIComponent(req.params.bookingRef);
  const vehicleIdentifier = decodeURIComponent(req.params.vehicleIdentifier);
  const { timestamp, location, status } = req.body || {};
  
  if (!bookingRef) {
    return res.status(400).json({ error: 'bookingRef is required' });
  }
  if (!vehicleIdentifier) {
    return res.status(400).json({ error: 'vehicleIdentifier is required' });
  }
  if (!location || typeof location.lat !== 'number' || typeof location.lng !== 'number') {
    return res.status(400).json({ error: 'location object with lat and lng is required' });
  }
  
  try {
    const config = await readHolidayConfig();
    if (!config.apiKey) {
      return res.status(400).json({ error: 'Holiday Taxis API key is not configured' });
    }
    const endpoint = (config.endpoint || '').replace(/\/+$/, '');
    if (!endpoint) {
      return res.status(400).json({ error: 'Holiday Taxis endpoint is not configured' });
    }
    const targetUrl = `${endpoint}/bookings/${encodeURIComponent(bookingRef)}/vehicles/${encodeURIComponent(vehicleIdentifier)}/location`;
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Api_key': config.apiKey
    };
    if (config.apiVersion) {
      headers['VERSION'] = config.apiVersion;
    }
    
    // Build request body - include timestamp and status if provided
    const requestBody = {
      timestamp: timestamp || new Date().toISOString().replace(/\.\d{3}Z$/, '+00:00'),
      location: {
        lat: Number(location.lat),
        lng: Number(location.lng)
      }
    };
    if (status) {
      requestBody.status = status;
    }
    
    console.log('Holiday Taxis POST location', targetUrl, requestBody);
    
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody)
    });
    
    const text = await response.text();
    let payload;
    try {
      payload = text ? JSON.parse(text) : {};
    } catch {
      payload = { raw: text };
    }
    
    if (!response.ok) {
      console.error('Holiday Taxis API error:', response.status, payload);
      return res.status(response.status).json({
        error: payload.error || payload.message || payload.title || 'Holiday Taxis API error',
        details: payload.details || payload.message || payload.description || payload.error_description || payload.raw || text || `HTTP ${response.status}`
      });
    }
    
    res.json({
      success: true,
      data: payload
    });
  } catch (err) {
    console.error('Holiday Taxis location update error:', err);
    res.status(500).json({ error: 'Failed to update Holiday Taxis vehicle location', details: String(err) });
  }
});

// Create a new row
// Body: { data: { col: value, ... } }
app.post('/api/tables/:name', authenticateUser, async (req, res) => {
  const name = decodeURIComponent(req.params.name);
  console.log(`POST /api/tables/${name}`, { data: req.body.data });
  const { data } = req.body || {};
  if (!data || typeof data !== 'object') {
    return res.status(400).json({ error: 'Invalid body. Expect { data: {} }' });
  }
  try {
    const p = await getPool();
    
    // Get column types to handle data conversion
    const [colRows] = await p.query(`SHOW COLUMNS FROM \`${name}\``);
    const columnTypes = {};
    const columnInfo = {};
    colRows.forEach(col => {
      columnTypes[col.Field] = col.Type;
      columnInfo[col.Field] = col;
    });

    // Get primary key columns to check if they're auto-increment
    const [pkRows] = await p.query(`SHOW KEYS FROM \`${name}\` WHERE Key_name = 'PRIMARY'`);
    const pkCols = pkRows.map(r => r.Column_name);
    const autoIncrementCols = new Set();
    pkRows.forEach(pk => {
      const colInfo = columnInfo[pk.Column_name];
      if (colInfo && colInfo.Extra && colInfo.Extra.toLowerCase().includes('auto_increment')) {
        autoIncrementCols.add(pk.Column_name);
      }
    });

    // Build INSERT columns and values
    const insertCols = Object.keys(data).filter(col => {
      // Skip auto-increment primary keys if they're not provided or are empty
      if (autoIncrementCols.has(col)) {
        return false;
      }
      return true;
    });
    
    if (insertCols.length === 0) {
      return res.status(400).json({ error: 'No fields to insert' });
    }

    // Convert data values based on column types
    const processedData = {};
    for (const col of insertCols) {
      let value = data[col];
      if (columnTypes[col]) {
        const typeStr = columnTypes[col].toLowerCase();
        if (typeStr.includes('int')) {
          if (value === '' || value === null || value === undefined) {
            // Check if column allows NULL
            const colInfo = columnInfo[col];
            if (colInfo && colInfo.Null === 'YES') {
              value = null;
            } else {
              value = 0;
            }
          } else {
            value = Number(value);
            if (!Number.isFinite(value)) {
              value = 0;
            } else {
              value = Math.floor(value);
            }
          }
        } else if ((typeStr.includes('decimal') || typeStr.includes('float') || typeStr.includes('double'))) {
          if (value === '' || value === null || value === undefined) {
            value = null;
          } else {
            value = Number(value);
            if (!Number.isFinite(value)) {
              value = null;
            }
          }
        }
      }
      processedData[col] = value;
    }

    const columns = insertCols.map(c => `\`${c}\``).join(', ');
    const placeholders = insertCols.map(() => '?').join(', ');
    const values = insertCols.map(c => processedData[c]);
    const sql = `INSERT INTO \`${name}\` (${columns}) VALUES (${placeholders})`;
    const [result] = await p.query(sql, values);
    res.json({ inserted: true, insertId: result.insertId });
  } catch (err) {
    res.status(500).json({ error: `Failed to insert row into ${name}`, details: String(err) });
  }
});

// Delete a row by primary key
// Body: { key: { pkCol: value, ... } }
app.delete('/api/tables/:name', authenticateUser, async (req, res) => {
  const name = decodeURIComponent(req.params.name);
  console.log(`DELETE /api/tables/${name}`, { key: req.body.key });
  const { key } = req.body || {};
  if (!key || typeof key !== 'object') {
    return res.status(400).json({ error: 'Invalid body. Expect { key: {} }' });
  }
  try {
    const p = await getPool();
    // Validate primary key
    const [pkRows] = await p.query(`SHOW KEYS FROM \`${name}\` WHERE Key_name = 'PRIMARY'`);
    const pkCols = pkRows.map(r => r.Column_name);
    if (pkCols.length === 0) {
      return res.status(400).json({ error: `Table ${name} has no primary key` });
    }
    const missing = pkCols.filter(c => !(c in key));
    if (missing.length) {
      return res.status(400).json({ error: `Missing primary key columns: ${missing.join(', ')}` });
    }

    // Build WHERE clause safely
    const whereClause = pkCols.map(c => `\`${c}\` = ?`).join(' AND ');
    const values = pkCols.map(c => key[c]);
    const sql = `DELETE FROM \`${name}\` WHERE ${whereClause} LIMIT 1`;
    const [result] = await p.query(sql, values);
    res.json({ deleted: result.affectedRows === 1 });
  } catch (err) {
    res.status(500).json({ error: `Failed to delete row from ${name}`, details: String(err) });
  }
});

// Update a row by primary key
// Body: { key: { pkCol: value, ... }, data: { col: value, ... } }
app.put('/api/tables/:name', authenticateUser, async (req, res) => {
  const name = decodeURIComponent(req.params.name);
  console.log(`PUT /api/tables/${name}`, { key: req.body.key, data: req.body.data });
  const { key, data } = req.body || {};
  const user = req.user;
  
  // Validate editable fields for driver/guide roles in their own tables
  const editableFields = getEditableFieldsForRole(user.role, name);
  if (editableFields.length > 0) {
    // Only specific fields are editable (e.g., only Password for driver/guide)
    const dataKeys = Object.keys(data || {});
    const invalidFields = dataKeys.filter(field => {
      const normalizedField = normalizeFieldName(field);
      return !editableFields.some(editable => normalizeFieldName(editable) === normalizedField);
    });
    if (invalidFields.length > 0) {
      return res.status(403).json({ 
        error: `You can only edit the following fields: ${editableFields.join(', ')}. Attempted to edit: ${invalidFields.join(', ')}` 
      });
    }
  }
  if (!key || !data || typeof key !== 'object' || typeof data !== 'object') {
    return res.status(400).json({ error: 'Invalid body. Expect { key: {}, data: {} }' });
  }
  try {
    const p = await getPool();
    // Validate primary key
    const [pkRows] = await p.query(`SHOW KEYS FROM \`${name}\` WHERE Key_name = 'PRIMARY'`);
    const pkCols = pkRows.map(r => r.Column_name);
    if (pkCols.length === 0) {
      return res.status(400).json({ error: `Table ${name} has no primary key` });
    }
    const missing = pkCols.filter(c => !(c in key));
    if (missing.length) {
      return res.status(400).json({ error: `Missing primary key columns: ${missing.join(', ')}` });
    }

    // Get column types to handle data conversion and detect generated columns
    const [colRows] = await p.query(`SHOW COLUMNS FROM \`${name}\``);
    const columnTypes = {};
    const generatedColumns = new Set();
    colRows.forEach(col => {
      columnTypes[col.Field] = col.Type;
      // Check if column is generated/virtual (Extra field contains "GENERATED ALWAYS AS" or "VIRTUAL")
      if (col.Extra && (col.Extra.includes('GENERATED ALWAYS AS') || col.Extra.includes('VIRTUAL') || col.Extra.includes('STORED'))) {
        generatedColumns.add(col.Field);
      }
    });

    // Build SET and WHERE clauses safely - exclude generated columns
    const setCols = Object.keys(data).filter(col => !generatedColumns.has(col));
    if (setCols.length === 0) {
      return res.status(400).json({ error: 'No fields to update (all fields are generated/virtual columns)' });
    }

    // Convert data values based on column types
    const processedData = {};
    for (const col of setCols) {
      let value = data[col];
      if (columnTypes[col]) {
        const typeStr = columnTypes[col].toLowerCase();
        if (typeStr.includes('int')) {
          if (value === '' || value === null || value === undefined) {
            value = 0;
          } else {
            value = Number(value);
            if (!Number.isFinite(value)) {
              value = 0;
            } else {
              value = Math.floor(value);
            }
          }
        } else if ((typeStr.includes('decimal') || typeStr.includes('float') || typeStr.includes('double'))) {
          if (value === '' || value === null || value === undefined) {
            value = null;
          } else {
            value = Number(value);
            if (!Number.isFinite(value)) {
              value = null;
            }
          }
        }
      }
      processedData[col] = value;
    }

    const setClause = setCols.map(c => `\`${c}\` = ?`).join(', ');
    const whereClause = pkCols.map(c => `\`${c}\` = ?`).join(' AND ');
    const values = [...setCols.map(c => processedData[c]), ...pkCols.map(c => key[c])];
    const sql = `UPDATE \`${name}\` SET ${setClause} WHERE ${whereClause} LIMIT 1`;
    const [result] = await p.query(sql, values);
    res.json({ updated: result.affectedRows === 1 });
  } catch (err) {
    res.status(500).json({ error: `Failed to update row in ${name}`, details: String(err) });
  }
});

// Only start server if not in Vercel environment
// Vercel uses serverless functions, so we don't need app.listen()
if (process.env.VERCEL !== '1' && !process.env.VERCEL_ENV) {
  const port = Number(process.env.PORT || 4000);
  app.listen(port, () => {
    console.log(`Baliku Driver API running on http://localhost:${port}`);
  });
}

// Export app for Vercel serverless function
export default app;


