  const API_BASE = (location.hostname === 'localhost' || location.hostname === '127.0.0.1') ? 'http://localhost:4000' : '';
const statusEl = document.getElementById('status');
const rowsCard = document.getElementById('rows-card');
const rowsTitle = document.getElementById('rows-title');
const rowsEl = document.getElementById('rows');
const refreshBtn = document.getElementById('refresh');
const filtersCard = document.getElementById('filters-card');
const filtersTitle = document.getElementById('filters-title');
const searchFilter = document.getElementById('search-filter');
const checkboxFiltersContainer = document.getElementById('checkbox-filters-container');
const detailsModal = document.getElementById('details-modal');
const detailsClose = document.getElementById('details-close');
const detailsEdit = document.getElementById('details-edit');
const detailsSave = document.getElementById('details-save');
const detailsCancel = document.getElementById('details-cancel');
const detailsDelete = document.getElementById('details-delete');
const detailsContent = document.getElementById('details-content');
const detailsModalTitle = document.getElementById('details-modal-title');
const databaseModal = document.getElementById('database-modal');
const dbClose = document.getElementById('db-close');
const dbEdit = document.getElementById('db-edit');
const dbSave = document.getElementById('db-save');
const dbCancel = document.getElementById('db-cancel');
const databaseContent = document.getElementById('database-content');
const apiModal = document.getElementById('api-modal');
const apiClose = document.getElementById('api-close');
const apiEdit = document.getElementById('api-edit');
const apiSave = document.getElementById('api-save');
const apiCancel = document.getElementById('api-cancel');
const apiContent = document.getElementById('api-content');
const btnHamburger = document.getElementById('btn-hamburger');
const appDrawer = document.getElementById('app-drawer');
const btnDrawerClose = document.getElementById('btn-drawer-close');
const buttonsContainer = document.getElementById('buttons-container');
const statusButtonsSection = document.getElementById('status-buttons-section');
const htxActionsSection = document.getElementById('htx-actions-section');
const pendingButtonsSection = document.getElementById('pending-buttons-section');
const statusConfirmModal = document.getElementById('status-confirm-modal');
const statusConfirmMessage = document.getElementById('status-confirm-message');
const statusConfirmYes = document.getElementById('status-confirm-yes');
const statusConfirmNo = document.getElementById('status-confirm-no');
const statusConfirmClose = document.getElementById('status-confirm-close');
const addRowBtn = document.getElementById('add-row-btn');
// Import CSV button removed - not used
const pendingConfirmModal = document.getElementById('pending-confirm-modal');
const pendingConfirmMessage = document.getElementById('pending-confirm-message');
const pendingConfirmYes = document.getElementById('pending-confirm-yes');
const pendingConfirmNo = document.getElementById('pending-confirm-no');
const pendingConfirmClose = document.getElementById('pending-confirm-close');
const toastEl = document.getElementById('toast');
const loginScreen = document.getElementById('login-screen');
const loginRoleButtons = document.querySelectorAll('.login-role-btn');
const loginNameInput = document.getElementById('login-name');
const loginPasswordInput = document.getElementById('login-password');
const loginSubmit = document.getElementById('login-submit');
const loginStatus = document.getElementById('login-status');
const loginNameDatalist = document.getElementById('login-name-options');
  let originalRows = [];
let currentTable = null;
let currentMeta = null; // { primaryKey: string[], columns: string[], columnTypes: {} }
let currentRow = null;
let editMode = false;
let addMode = false;
let dbEditMode = false;
let pendingStatusUpdate = null;
let pendingStatusUpdateToggle = null;
let pendingActionRequest = null;
let holidayApiConfig = {
  endpoint: 'https://suppliers.htxstaging.com',
  apiKey: 'htscon_c3d9fdff123b138330f00f627d092728ea7469628c5bae1761019e5c77c2f0fed7499cd93ce3b3b3',
  apiVersion: '2025-01'
};
let apiEditMode = false;
let dbConfig = {
  PORT: '4000',
  DB_HOST: '103.150.116.213',
  DB_PORT: '3306',
  DB_NAME: 'balikunewdb',
  DB_USER: 'baliku',
  DB_PASSWORD: 'Jakarta@1945'
};
let authUser = null;
let appInitialized = false;
const loginOptionsCache = {
  driver: [],
  guide: []
};
let currentLoginRole = 'driver';
// Stopwatch timer variables
let stopwatchInterval = null;
let stopwatchStartTime = null;
let stopwatchElapsedTime = 0; // Total elapsed time in milliseconds
let stopwatchRunning = false;
const stopwatchHoursEl = document.getElementById('stopwatch-hours');
const stopwatchMinutesEl = document.getElementById('stopwatch-minutes');
const stopwatchSecondsEl = document.getElementById('stopwatch-seconds');
const rightSideSection = document.getElementById('right-side-section');
  // Drawer logic
btnHamburger?.addEventListener('click', () => {
  appDrawer?.classList.add('open');
  appDrawer?.setAttribute('aria-hidden','false');
});
btnDrawerClose?.addEventListener('click', () => {
  appDrawer?.classList.remove('open');
  appDrawer?.setAttribute('aria-hidden','true');
});
appDrawer?.querySelector('.overlay')?.addEventListener('click', () => {
  appDrawer?.classList.remove('open');
  appDrawer?.setAttribute('aria-hidden','true');
});
  // Drawer menu bindings
document.getElementById('menu-order-schedule')?.addEventListener('click', () => { appDrawer.classList.remove('open'); loadTable('operasional services', true, 'Order filters'); });
document.getElementById('menu-services')?.addEventListener('click', () => { appDrawer.classList.remove('open'); loadTable('services', true, 'Service filters'); });
document.getElementById('menu-driver')?.addEventListener('click', () => { appDrawer.classList.remove('open'); loadTable('driver', true, 'Filter Driver'); });
document.getElementById('menu-guide')?.addEventListener('click', () => { appDrawer.classList.remove('open'); loadTable('guide', true, 'Filter Guide'); });
document.getElementById('menu-car')?.addEventListener('click', () => { appDrawer.classList.remove('open'); loadTable('car', true, 'Filter Car'); });
document.getElementById('menu-places')?.addEventListener('click', () => { appDrawer.classList.remove('open'); loadTable('places', true, 'Filter Places'); });
document.getElementById('menu-agency')?.addEventListener('click', () => { appDrawer.classList.remove('open'); loadTable('agency', true, 'Filter Agency'); });
document.getElementById('menu-pricelist')?.addEventListener('click', () => { appDrawer.classList.remove('open'); loadTable('pricelist', true, 'Filter Pricelist'); });
document.getElementById('menu-pending-order')?.addEventListener('click', () => { appDrawer.classList.remove('open'); loadTable('pendings', true, 'Pending Order'); });
  // Helper function to get authorization headers
  function getAuthHeaders(additionalHeaders = {}){
    const headers = { ...additionalHeaders };
    if(authUser?.token){
      headers['Authorization'] = `Bearer ${authUser.token}`;
    }
    return headers;
  }
  async function fetchJson(path){
  statusEl.textContent = 'Loading…';
  try{
    const headers = getAuthHeaders();
    const res = await fetch(API_BASE + path, { headers });
    if(!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    statusEl.textContent = '';
    return data;
  }catch(err){
    statusEl.textContent = 'Error: ' + err.message;
    throw err;
  }
}
  const TARGET_TABLE = 'operasional services';
const normalize = (s) => String(s).toLowerCase().replace(/_/g, ' ').trim();
  function showLoginScreen(){
  if(loginScreen){
    loginScreen.classList.remove('hidden');
    document.body.classList.add('login-active');
  }
}
  function hideLoginScreen(){
  if(loginScreen){
    loginScreen.classList.add('hidden');
    document.body.classList.remove('login-active');
  }
}
  function loadAuthFromStorage(){
  try{
    const raw = localStorage.getItem('balikuAuth');
    if(!raw) return null;
    const parsed = JSON.parse(raw);
    if(parsed && parsed.token && parsed.name && parsed.role){
      authUser = parsed;
      return authUser;
    }
  }catch(err){
    console.warn('Failed to parse auth data', err);
  }
  authUser = null;
  return null;
}
  function saveAuthToStorage(){
  if(authUser){
    localStorage.setItem('balikuAuth', JSON.stringify(authUser));
  }
}
  function clearAuthStorage(){
  localStorage.removeItem('balikuAuth');
}
  // Validate token with backend
  async function validateToken(token){
    try{
      const res = await fetch(API_BASE + '/api/tables', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return res.ok;
    }catch(err){
      return false;
    }
  }
  async function startApp(){
  // Check if user has valid session and auto-login
  loadAuthFromStorage();
  if(authUser && authUser.token){
    // Validate token with backend before auto-login
    const isValid = await validateToken(authUser.token);
    if(isValid){
      hideLoginScreen();
      await initApp();
      // Apply role-based menu visibility after auto-login
      applyRoleBasedMenuVisibility();
      return;
    } else {
      // Token invalid, clear storage and show login
      clearAuthStorage();
      authUser = null;
    }
  }
  // No valid session, show login screen
  showLoginScreen();
  setLoginRole('driver');
}
  async function initApp(){
  if(appInitialized) return;
  await init();
  // Apply role-based menu visibility
  applyRoleBasedMenuVisibility();
  appInitialized = true;
}
  function setLoginRole(role){
  currentLoginRole = role;
  // Update button states and checkboxes
  loginRoleButtons.forEach(btn => {
    const checkbox = btn.querySelector('.role-checkbox');
    if(btn.getAttribute('data-role') === role){
      btn.classList.add('active');
      if(checkbox) checkbox.checked = true;
    } else {
      btn.classList.remove('active');
      if(checkbox) checkbox.checked = false;
    }
  });
  if(loginNameInput){
    loginNameInput.value = '';
    loginNameInput.placeholder = 'Username';
  }
  if(loginPasswordInput){
    loginPasswordInput.value = '';
  }
  loginStatus.textContent = '';
  updateLoginButtonState();
  if(loginOptionsCache[role] && loginOptionsCache[role].length > 0){
    renderLoginOptions(role);
  } else {
    loadLoginOptions(role);
  }
}
  function renderLoginOptions(role){
  if(!loginNameDatalist) return;
  const options = loginOptionsCache[role] || [];
  loginNameDatalist.innerHTML = options.map(name => `<option value="${escapeHtml(name)}"></option>`).join('');
}
  async function loadLoginOptions(role){
  if(!role) return;
  try{
    if(loginStatus) loginStatus.textContent = 'Memuat daftar nama...';
    const res = await fetch(API_BASE + '/api/login/options?type=' + encodeURIComponent(role));
    if(!res.ok){
      throw new Error('HTTP ' + res.status);
    }
    const data = await res.json();
    loginOptionsCache[role] = Array.isArray(data.options) ? data.options.map(opt => opt.name).filter(Boolean) : [];
    renderLoginOptions(role);
    if(loginStatus) loginStatus.textContent = '';
  }catch(err){
    console.error('Failed to load login options:', err);
    if(loginStatus) loginStatus.textContent = 'Gagal memuat daftar nama';
  }
}
  function updateLoginButtonState(){
  const nameFilled = loginNameInput ? loginNameInput.value.trim().length > 0 : false;
  const passFilled = loginPasswordInput ? loginPasswordInput.value.length > 0 : false;
  if(loginSubmit){
    loginSubmit.disabled = !(nameFilled && passFilled);
  }
}
  async function handleLogin(){
  if(!loginNameInput || !loginPasswordInput) return;
  const name = loginNameInput.value.trim();
  const password = loginPasswordInput.value;
  if(!name || !password){
    if(loginStatus) loginStatus.textContent = 'Lengkapi nama dan password';
    return;
  }
  if(loginSubmit){
    loginSubmit.disabled = true;
  }
  if(loginStatus) loginStatus.textContent = 'Memverifikasi...';
  try{
    const res = await fetch(API_BASE + '/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: currentLoginRole, name, password })
    });
    let data;
    if(!res.ok){
      const errorText = await res.text();
      try{
        data = JSON.parse(errorText);
      }catch{
        data = { error: errorText || 'Login gagal' };
      }
      throw new Error(data.error || 'Login gagal');
    }
    data = await res.json();
    authUser = { role: data.role, name: data.name, token: data.token };
    saveAuthToStorage();
    hideLoginScreen();
    if(loginStatus) loginStatus.textContent = '';
    await initApp();
    // Apply role-based menu visibility after login
    applyRoleBasedMenuVisibility();
  }catch(err){
    console.error('Login error:', err);
    if(loginStatus) loginStatus.textContent = err.message || 'Login gagal';
  }finally{
    if(loginSubmit){
      loginSubmit.disabled = false;
    }
  }
}
  function logoutUser(){
  clearAuthStorage();
  authUser = null;
  appInitialized = false;
  window.location.reload();
}

// Apply role-based menu visibility
function applyRoleBasedMenuVisibility(){
  if(!authUser) return;
  
  const menuServices = document.getElementById('menu-services');
  const menuDriver = document.getElementById('menu-driver');
  const menuGuide = document.getElementById('menu-guide');
  const menuCar = document.getElementById('menu-car');
  const menuPlaces = document.getElementById('menu-places');
  const menuAgency = document.getElementById('menu-agency');
  const menuPendingOrder = document.getElementById('menu-pending-order');
  const btnDatabase = document.getElementById('btn-database');
  const btnApiConnection = document.getElementById('btn-api-connection');
  const addRowBtn = document.getElementById('add-row-btn');
  // Find Settings title - it's in a div with "Settings" text
  const settingsTitle = Array.from(document.querySelectorAll('.drawer .panel > div')).find(div => {
    const strong = div.querySelector('strong');
    return strong && strong.textContent.trim() === 'Settings';
  });
  const btnSendToHtx = document.getElementById('btn-send-to-htx');
  const btnChangeCar = document.getElementById('btn-change-car');
  const btnResetTimer = document.getElementById('btn-reset-timer');
  const detailsEditBtn = document.getElementById('details-edit');
  const detailsDeleteBtn = document.getElementById('details-delete');
  const dbEditBtn = document.getElementById('db-edit');
  
  if(authUser.role === 'driver'){
    // Hide: menu-services, menu-guide, menu-car, menu-places, menu-agency, menu-pending-order, btn-database, btn-api-connection
    if(menuServices) menuServices.style.display = 'none';
    if(menuGuide) menuGuide.style.display = 'none';
    if(menuCar) menuCar.style.display = 'none';
    if(menuPlaces) menuPlaces.style.display = 'none';
    if(menuAgency) menuAgency.style.display = 'none';
    if(menuPendingOrder) menuPendingOrder.style.display = 'none';
    if(btnDatabase) btnDatabase.style.display = 'none';
    if(btnApiConnection) btnApiConnection.style.display = 'none';
    // Hide: Add button
    if(addRowBtn) addRowBtn.style.display = 'none';
    // Hide: Settings title and its container
    if(settingsTitle){
      settingsTitle.style.display = 'none';
    }
    // Hide: Send to HTX, Change Car, Reset Timer buttons
    if(btnSendToHtx) btnSendToHtx.style.display = 'none';
    if(btnChangeCar) btnChangeCar.style.display = 'none';
    if(btnResetTimer) btnResetTimer.style.display = 'none';
    // Hide: Edit and Delete buttons (Driver cannot edit/delete data)
    if(detailsEditBtn) detailsEditBtn.style.display = 'none';
    if(detailsDeleteBtn) detailsDeleteBtn.style.display = 'none';
    if(dbEditBtn) dbEditBtn.style.display = 'none';
    // Show: menu-driver (if hidden)
    if(menuDriver) menuDriver.style.display = '';
  } else if(authUser.role === 'guide'){
    // Hide: menu-services, menu-driver, menu-car, menu-places, menu-agency, menu-pending-order, btn-database, btn-api-connection
    if(menuServices) menuServices.style.display = 'none';
    if(menuDriver) menuDriver.style.display = 'none';
    if(menuCar) menuCar.style.display = 'none';
    if(menuPlaces) menuPlaces.style.display = 'none';
    if(menuAgency) menuAgency.style.display = 'none';
    if(menuPendingOrder) menuPendingOrder.style.display = 'none';
    if(btnDatabase) btnDatabase.style.display = 'none';
    if(btnApiConnection) btnApiConnection.style.display = 'none';
    // Hide: Add button
    if(addRowBtn) addRowBtn.style.display = 'none';
    // Hide: Settings title and its container
    if(settingsTitle){
      settingsTitle.style.display = 'none';
    }
    // Hide: Send to HTX, Change Car, Reset Timer buttons
    if(btnSendToHtx) btnSendToHtx.style.display = 'none';
    if(btnChangeCar) btnChangeCar.style.display = 'none';
    if(btnResetTimer) btnResetTimer.style.display = 'none';
    // Hide: Edit and Delete buttons (Guide cannot edit/delete data)
    if(detailsEditBtn) detailsEditBtn.style.display = 'none';
    if(detailsDeleteBtn) detailsDeleteBtn.style.display = 'none';
    if(dbEditBtn) dbEditBtn.style.display = 'none';
    // Show: menu-guide (if hidden)
    if(menuGuide) menuGuide.style.display = '';
  } else {
    // Admin or other roles - show all menus
    if(menuServices) menuServices.style.display = '';
    if(menuDriver) menuDriver.style.display = '';
    if(menuGuide) menuGuide.style.display = '';
    if(menuCar) menuCar.style.display = '';
    if(menuPlaces) menuPlaces.style.display = '';
    if(menuAgency) menuAgency.style.display = '';
    if(menuPendingOrder) menuPendingOrder.style.display = '';
    if(btnDatabase) btnDatabase.style.display = '';
    if(btnApiConnection) btnApiConnection.style.display = '';
    if(addRowBtn) addRowBtn.style.display = '';
    if(settingsTitle){
      settingsTitle.style.display = '';
    }
    if(btnSendToHtx) btnSendToHtx.style.display = '';
    if(btnChangeCar) btnChangeCar.style.display = '';
    if(btnResetTimer) btnResetTimer.style.display = '';
    // Show: Edit and Delete buttons (Admin can edit/delete)
    if(detailsEditBtn) detailsEditBtn.style.display = '';
    if(detailsDeleteBtn) detailsDeleteBtn.style.display = '';
    if(dbEditBtn) dbEditBtn.style.display = '';
  }
}

// Apply role-based field visibility in details modal
function applyRoleBasedFieldVisibility(){
  if(!authUser || !detailsContent) return;
  
  const isOperasionalServices = currentTable && normalize(currentTable) === normalize('operasional services');
  if(!isOperasionalServices) return;
  
  // Fields to hide for Driver role
  const driverHiddenFields = [
    'Timestamps', 'Services ID', 'Service Rate', 'Nett Rate', 'Currency', 
    'Driver or Guide', 'Guide Commision', 'Guide Fee', 'Driver Service Time',
    'Printcode', 'Nameboard path', 'Deposit Type', 'Driver/Guide OK', 'Send HTX',
    'key_id', 'plat_mobil', 'car_brand', 'color_vehicle', 'car_id',
    'pic_name', 'driver_license', 'pic_contact',
    'Services Category', 'Order ID', 'Program Category', 'Adult', 'Child', 'Infant'
  ];
  
  // Fields to hide for Guide role
  const guideHiddenFields = [
    'Timestamps', 'Services ID', 'Service Rate', 'Nett Rate', 'Currency',
    'Driver or Guide', 'Driver Fee', 'Driver Service Time', 'BBM', 'Ticket',
    'Printcode', 'Nameboard path', 'Deposit Type', 'Driver/Guide OK', 'Send HTX',
    'key_id', 'plat_mobil', 'car_brand', 'color_vehicle', 'car_id',
    'pic_name', 'driver_license', 'pic_contact',
    'Services Category', 'Order ID', 'Program Category', 'Number of (pax)'
  ];
  
  const hiddenFields = authUser.role === 'driver' ? driverHiddenFields : 
                       authUser.role === 'guide' ? guideHiddenFields : [];
  
  if(hiddenFields.length === 0) return;
  
  // Find all .kv elements and hide those matching hidden fields
  const kvElements = detailsContent.querySelectorAll('.kv');
  kvElements.forEach(kv => {
    const mutedDiv = kv.querySelector('.muted');
    if(mutedDiv){
      const fieldName = mutedDiv.textContent.trim();
      // Remove " (primary key)" suffix if present
      const cleanFieldName = fieldName.replace(/\s*\(primary key\)\s*$/, '');
      
      // Check if this field should be hidden
      const shouldHide = hiddenFields.some(hiddenField => 
        normName(cleanFieldName) === normName(hiddenField)
      );
      
      if(shouldHide){
        kv.style.display = 'none';
      }
    }
  });
}
  loginRoleButtons.forEach(btn => {
  btn.addEventListener('click', (e) => {
    // Prevent checkbox click from triggering button click twice
    if(e.target.classList.contains('role-checkbox')){
      e.stopPropagation();
    }
    const role = btn.getAttribute('data-role');
    if(role){
      setLoginRole(role);
    }
  });
  // Also handle checkbox clicks directly
  const checkbox = btn.querySelector('.role-checkbox');
  if(checkbox){
    checkbox.addEventListener('click', (e) => {
      e.stopPropagation();
      const role = btn.getAttribute('data-role');
      if(role){
        setLoginRole(role);
      }
    });
  }
});
loginNameInput?.addEventListener('input', updateLoginButtonState);
loginPasswordInput?.addEventListener('input', updateLoginButtonState);
loginPasswordInput?.addEventListener('keydown', (e) => {
  if(e.key === 'Enter'){
    e.preventDefault();
    if(loginSubmit && !loginSubmit.disabled){
      handleLogin();
    }
  }
});
loginSubmit?.addEventListener('click', (e) => {
  e.preventDefault();
  handleLogin();
});
  async function init(){
  await loadHolidayApiConfig();
  const data = await fetchJson('/api/tables');
  const tables = Array.isArray(data.tables) ? data.tables : [];
  const match = tables.find(t => normalize(t) === normalize(TARGET_TABLE));
  if(!match){
    statusEl.textContent = 'Table "operasional services" not found';
    return;
  }
  // Load with filters and rows visible by default
  await loadTable(match, true, 'Order filters');
}
  async function ensureMeta(table){
  if(currentMeta && currentMeta.table === table) return currentMeta;
  currentMeta = await fetchJson('/api/tables/' + encodeURIComponent(table) + '/meta');
  return currentMeta;
}
  const normName = (s) => String(s).toLowerCase().replace(/_/g,' ').trim();

// Helper function to parse MySQL column type
function parseColumnType(typeStr) {
  if (!typeStr) return { base: 'varchar', size: 255 };
  const lower = typeStr.toLowerCase();
  if (lower.includes('int')) {
    return { base: 'int', unsigned: lower.includes('unsigned') };
  }
  if (lower.includes('decimal') || lower.includes('numeric') || lower.includes('float') || lower.includes('double')) {
    const match = lower.match(/decimal\((\d+),(\d+)\)/);
    if (match) {
      return { base: 'decimal', precision: parseInt(match[1]), scale: parseInt(match[2]) };
    }
    return { base: 'decimal', precision: 10, scale: 2 };
  }
  if (lower.includes('datetime') || lower.includes('timestamp')) {
    return { base: 'datetime' };
  }
  if (lower.includes('date')) {
    return { base: 'date' };
  }
  if (lower.includes('time')) {
    return { base: 'time' };
  }
  return { base: 'varchar', size: 255 };
}

function formatDateCell(val){
  try{
    let d;
      // Handle MySQL datetime format: YYYY-MM-DD HH:mm:ss (UTC)
    if (typeof val === 'string' && val.match(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/)) {
      d = new Date(val.replace(' ', 'T') + 'Z'); // Add Z to indicate UTC
    } else {
      d = new Date(val);
    }
      if (isNaN(d)) return String(val);
    return d.toLocaleString(undefined, {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true
    });
  }catch{ return String(val); }
}
  function formatDateOnly(val){
  try{
    let d;
      // Handle MySQL datetime format: YYYY-MM-DD HH:mm:ss (UTC)
    if (typeof val === 'string' && val.match(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/)) {
      d = new Date(val.replace(' ', 'T') + 'Z'); // Add Z to indicate UTC
    } else {
      d = new Date(val);
    }
      if (isNaN(d)) return String(val);
    return d.toLocaleString(undefined, {
      month: 'short', day: 'numeric', year: 'numeric'
    });
  }catch{ return String(val); }
}

function formatNumberCell(val) {
  if (val === null || val === undefined || val === '') return '';
  const num = Number(val);
  if (isNaN(num)) return String(val);
  // Format with thousand separators
  return num.toLocaleString();
}
  function toDatetimeLocalValue(val){
  try{
    console.log('toDatetimeLocalValue input:', val, typeof val);
    let d;
      // Handle MySQL datetime format: YYYY-MM-DD HH:mm:ss (UTC)
    if (typeof val === 'string' && val.match(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/)) {
      // Parse as UTC datetime
      d = new Date(val.replace(' ', 'T') + 'Z');
      console.log('Parsed UTC datetime:', d);
    } else {
      d = new Date(val);
      console.log('Parsed other datetime:', d);
    }
      if (isNaN(d)) {
      console.log('Invalid date, returning empty string');
      return '';
    }
      // Convert to local time for datetime-local input
    const pad = (n) => String(n).padStart(2,'0');
    const yyyy = d.getFullYear();
    const mm = pad(d.getMonth()+1);
    const dd = pad(d.getDate());
    const hh = pad(d.getHours());
    const mi = pad(d.getMinutes());
    const result = `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
    console.log('toDatetimeLocalValue result:', result);
    return result;
  }catch(e){
    console.log('toDatetimeLocalValue error:', e);
    return '';
  }
}
  function formatCell(columnName, value){
  const n = normName(columnName);
  // Check if it's a date field (by name or type)
  if (
    n === normName('Date of Services') ||
    n === normName('Driver Service Time') ||
    n === normName('Timestamps') ||
    n === normName('Booking Date')
  ){
    return formatDateCell(value);
  }
  // Check column type for date/datetime
  if (currentMeta?.columnTypes?.[columnName]) {
    const colType = parseColumnType(currentMeta.columnTypes[columnName]);
    if (colType.base === 'datetime' || colType.base === 'date' || colType.base === 'timestamp') {
      return formatDateCell(value);
    }
  }
    if (THOUSAND_SEPARATOR_COLUMNS.some(col => normName(col) === n)) {
    return formatNumberCell(value);
  }
  return String(value);
}
  const VISIBLE_HEADERS = ['Service Status','Services','Program/Activity','Flight Details','Date of Services'];
const SERVICES_VISIBLE_HEADERS = ['Guest Name','Agency','Reference No.','Flight Details','Start Point','End Point','Date Of Services','Service Status'];
const THOUSAND_SEPARATOR_COLUMNS = [
  'Service Rate',
  'Nett Rate',
  'Guide Fee',
  'Guide Commision',
  'Driver Fee',
  'BBM',
  'Ticket'
];
  // Table grouping configuration
const TABLE_GROUPING = {
  'operasional services': { column: 'Date of Services', type: 'date' },
  'services': { column: 'Date Of Services', type: 'date' },
  'driver': { column: 'Driver Status', type: 'text' },
  'guide': { column: 'Address', type: 'text' },
  'car': { column: 'Car Type', type: 'text' },
  'places': { column: 'Zone', type: 'text' },
  'program activity': { column: 'Provider', type: 'text' },
  'pendings': { column: 'StatusCode', type: 'text' }
};
  function renderRows(rows){
  if(rows.length === 0){
    rowsEl.innerHTML = '<tr><td class="muted">No rows</td></tr>';
    rowsCard.style.display = 'block';
    return;
  }
  const allCols = Object.keys(rows[0]);
  // Only filter columns for "operasional services" table, show all for others
  const isOperasionalServices = currentTable && normalize(currentTable) === normalize(TARGET_TABLE);
  let cols, headerHtml;
    const isServicesTable = currentTable && normalize(currentTable) === 'services';
    if(isOperasionalServices){
    // For operasional services, show only selected columns
    cols = VISIBLE_HEADERS.map(h => allCols.find(k => normName(k) === normName(h))).filter(Boolean);
    headerHtml = VISIBLE_HEADERS.filter(h => cols.find(c => normName(c) === normName(h)) ).map(h=>`<th>${h}</th>`).join('');
  } else if(isServicesTable){
    // For services table, show only selected columns
    cols = SERVICES_VISIBLE_HEADERS.map(h => allCols.find(k => normName(k) === normName(h))).filter(Boolean);
    headerHtml = SERVICES_VISIBLE_HEADERS.filter(h => cols.find(c => normName(c) === normName(h)) ).map(h=>`<th>${h}</th>`).join('');
  } else {
    // For all other tables, show all columns
    cols = allCols;
    headerHtml = allCols.map(c => `<th>${c}</th>`).join('');
  }
  const actionHeader = '<th>Action</th>';
  let html = '<thead><tr>' + actionHeader + headerHtml + '</tr></thead><tbody>';
    // Check if this table should be grouped
  const tableGrouping = TABLE_GROUPING[normalize(currentTable)];
    if(tableGrouping){
    // Group rows by the specified column
    const groupCol = Object.keys(rows[0] || {}).find(k => normName(k) === normName(tableGrouping.column));
      if(groupCol){
      // Group rows by the grouping column
      const groupedRows = {};
      rows.forEach(row => {
        let groupKey = String(row[groupCol] || 'No Value');
          if(tableGrouping.type === 'date' && groupKey.match(/^\d{4}-\d{2}-\d{2}/)) {
          // For date grouping, extract date part only (ignore time)
          let rowDate;
          if (typeof row[groupCol] === 'string' && row[groupCol].match(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/)) {
            rowDate = new Date(row[groupCol].replace(' ', 'T') + 'Z');
          } else {
            rowDate = new Date(row[groupCol]);
          }
            if (!isNaN(rowDate)) {
            const pad = (n) => String(n).padStart(2,'0');
            groupKey = `${rowDate.getFullYear()}-${pad(rowDate.getMonth()+1)}-${pad(rowDate.getDate())}`;
          }
        }
          if (!groupedRows[groupKey]) {
          groupedRows[groupKey] = [];
        }
        groupedRows[groupKey].push(row);
      });
        // Sort group keys (for date groups, sort by date descending; for text groups, sort alphabetically)
      let sortedGroupKeys;
      if(tableGrouping.type === 'date'){
        sortedGroupKeys = Object.keys(groupedRows).sort((a, b) => new Date(b) - new Date(a));
      } else {
        sortedGroupKeys = Object.keys(groupedRows).sort();
      }
        // Render grouped rows with headers
      sortedGroupKeys.forEach(groupKey => {
        const groupRows = groupedRows[groupKey];
        let displayGroupName = groupKey;
          // Format the group name for display
        if (tableGrouping.type === 'date' && groupKey && groupRows.length > 0) {
          const sampleValue = groupRows[0][groupCol];
          displayGroupName = formatDateOnly(sampleValue);
        } else if (groupKey === 'No Value') {
          displayGroupName = 'No ' + tableGrouping.column;
        }
          // Add group header
        html += `<tr class="group-header"><td colspan="${cols.length + 1}" class="group-header-cell">${displayGroupName} (${groupRows.length} record${groupRows.length > 1 ? 's' : ''})</td></tr>`;
          // Add rows for this group
        groupRows.forEach(r => {
          const cells = cols.map(c => `<td>${formatCell(c, r[c])}</td>`).join('');
          const actionCell = `<td><button data-details='${encodeURIComponent(JSON.stringify(r))}' title="Show Details"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/></svg></button></td>`;
          html += '<tr>' + actionCell + cells + '</tr>';
        });
      });
    } else {
      // Fallback to regular rendering if grouping column not found
      for(const r of rows){
        const cells = cols.map(c => `<td>${formatCell(c, r[c])}</td>`).join('');
        const actionCell = `<td><button data-details='${encodeURIComponent(JSON.stringify(r))}' title="Show Details"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/></svg></button></td>`;
        html += '<tr>' + actionCell + cells + '</tr>';
      }
    }
  } else {
    // Regular rendering for tables without grouping
    for(const r of rows){
      const cells = cols.map(c => `<td>${formatCell(c, r[c])}</td>`).join('');
      const actionCell = `<td><button data-details='${encodeURIComponent(JSON.stringify(r))}' title="Show Details"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/></svg></button></td>`;
      html += '<tr>' + actionCell + cells + '</tr>';
    }
  }
    html += '</tbody>';
  rowsEl.innerHTML = html;
  rowsCard.style.display = 'block';
    rowsEl.querySelectorAll('button[data-details]').forEach(btn => {
    btn.addEventListener('click', () => {
      const data = JSON.parse(decodeURIComponent(btn.getAttribute('data-details')));
      showDetails(data);
    });
  });
}
  function findDateOfServicesColumn(row){
  if(!row) return null;
  const keys = Object.keys(row);
  const dateCol = keys.find(k => normName(k) === normName('Date of Services'));
  return dateCol || null;
}
  function findColumnByName(row, targetName){
  if(!row) return null;
  const keys = Object.keys(row);
  return keys.find(k => normName(k) === normName(targetName)) || null;
}
  function applyFilters(){
  const searchTerm = (searchFilter?.value || '').toLowerCase().trim();
  const checkbox48Hours = document.getElementById('checkbox-48-hours');
  const checkbox7Days = document.getElementById('checkbox-7-days');
  const checkboxPcon = document.getElementById('checkbox-pcon');
  const checkboxPamm = document.getElementById('checkbox-pamm');
  const checkboxPcan = document.getElementById('checkbox-pcan');
  const check48Hours = checkbox48Hours?.checked || false;
  const check7Days = checkbox7Days?.checked || false;
  const checkPcon = checkboxPcon?.checked || false;
  const checkPamm = checkboxPamm?.checked || false;
  const checkPcan = checkboxPcan?.checked || false;
  
  let rows = originalRows.slice();
  
  // Apply date filter only for "operasional services" and "services" tables
  const isOperasionalServices = currentTable && normalize(currentTable) === normalize(TARGET_TABLE);
  const isServicesTable = currentTable && normalize(currentTable) === 'services';
  const isPendingsTable = currentTable && normalize(currentTable) === 'pendings';
  console.log('[DEBUG] Table check:', { currentTable, isOperasionalServices, isServicesTable, isPendingsTable, check48Hours, check7Days, checkPcon, checkPamm, checkPcan, rowsLength: rows.length });
    if((isOperasionalServices || isServicesTable) && (check48Hours || check7Days) && rows.length > 0){
    console.log('[DEBUG] Date filtering for table:', currentTable);
    const dateCol = isOperasionalServices ? findDateOfServicesColumn(rows[0]) :
                  isServicesTable ? Object.keys(rows[0] || {}).find(k => normName(k) === 'date of services') : null;
    console.log('[DEBUG] Found date column:', dateCol);
    console.log('[DEBUG] Available columns:', Object.keys(rows[0] || {}));
    console.log('[DEBUG] Normalized available columns:', Object.keys(rows[0] || {}).map(k => normName(k)));
    if(dateCol){
      console.log('[DEBUG] Starting date filtering...');
      const startRange = new Date();
      startRange.setHours(0, 0, 0, 0); // beginning of today
        let endRange = null;
      if(check7Days){
        endRange = new Date(startRange);
        endRange.setDate(endRange.getDate() + 7);
        endRange.setHours(23, 59, 59, 999);
        console.log('[DEBUG] Filter range: 7 days -', startRange.toISOString(), 'to', endRange.toISOString());
      } else if(check48Hours){
        endRange = new Date(startRange);
        endRange.setDate(endRange.getDate() + 1);
        endRange.setHours(23, 59, 59, 999);
        console.log('[DEBUG] Filter range: 48 hours -', startRange.toISOString(), 'to', endRange.toISOString());
      }
        if(endRange){
        rows = rows.filter((row, index) => {
          const rawValue = row[dateCol];
          console.log(`[DEBUG] Processing row ${index + 1}: "${rawValue}"`);
            if(!rawValue) {
            console.log(`[DEBUG] EXCLUDED - No value`);
            return false;
          }
            let rowDate;
          if (typeof rawValue === 'string' && rawValue.match(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/)) {
            // Handle MySQL datetime format: YYYY-MM-DD HH:mm:ss (stored as UTC)
            rowDate = new Date(rawValue.replace(' ', 'T') + 'Z'); // Parse as UTC
          } else {
            rowDate = new Date(rawValue);
          }
            console.log(`[DEBUG] Parsed date:`, rowDate.toISOString(), `Is valid: ${!isNaN(rowDate)}`);
            if(isNaN(rowDate)) {
            console.log(`[DEBUG] EXCLUDED - Invalid date`);
            return false;
          }
            const isInRange = rowDate >= startRange && rowDate <= endRange;
          console.log(`[DEBUG] ${isInRange ? 'INCLUDED' : 'EXCLUDED'} - ${rowDate >= startRange ? '≥ start' : '< start'} && ${rowDate <= endRange ? '≤ end' : '> end'}`);
            return isInRange;
        });
          console.log(`[DEBUG] Filtered ${rows.length} rows out of ${originalRows.length} total rows`);
      } else {
        console.log('[DEBUG] No date column found for filtering');
      }
    }
  }
  
  // Apply StatusCode filter for "pendings" table
  if(isPendingsTable && (checkPcon || checkPamm || checkPcan) && rows.length > 0){
    const statusCodeCol = Object.keys(rows[0] || {}).find(k => normName(k) === normName('StatusCode'));
    if(statusCodeCol){
      rows = rows.filter(row => {
        const statusCode = String(row[statusCodeCol] || '').trim();
        if(checkPcon && statusCode === 'PCON') return true;
        if(checkPamm && statusCode === 'PAMM') return true;
        if(checkPcan && statusCode === 'PCAN') return true;
        return false;
      });
    }
  }
  
  // Restrict tables based on logged-in user role
  if(authUser && rows.length > 0){
    const targetName = String(authUser.name || '').trim().toLowerCase();
    
    if(authUser.role === 'driver'){
      // Filter "operasional services" by Driver Name
      if(currentTable && normalize(currentTable) === normalize('operasional services')){
        const driverNameCol = Object.keys(rows[0] || {}).find(k => normName(k) === normName('Driver Name'));
        if(driverNameCol){
          rows = rows.filter(row => String(row[driverNameCol] || '').trim().toLowerCase() === targetName);
        }
      }
      // Filter "driver" table by Driver Name
      if(currentTable && normalize(currentTable) === 'driver'){
        const driverNameCol = Object.keys(rows[0] || {}).find(k => normName(k) === normName('Driver Name'));
        if(driverNameCol){
          rows = rows.filter(row => String(row[driverNameCol] || '').trim().toLowerCase() === targetName);
        }
      }
    } else if(authUser.role === 'guide'){
      // Filter "operasional services" by Guide Name
      if(currentTable && normalize(currentTable) === normalize('operasional services')){
        const guideNameCol = Object.keys(rows[0] || {}).find(k => normName(k) === normName('Guide Name'));
        if(guideNameCol){
          rows = rows.filter(row => String(row[guideNameCol] || '').trim().toLowerCase() === targetName);
        }
      }
      // Filter "guide" table by Guide Name
      if(currentTable && normalize(currentTable) === 'guide'){
        const guideNameCol = Object.keys(rows[0] || {}).find(k => normName(k) === normName('Guide Name'));
        if(guideNameCol){
          rows = rows.filter(row => String(row[guideNameCol] || '').trim().toLowerCase() === targetName);
        }
      }
    }
  }
  
  // Apply search filter
  if(searchTerm){
    rows = rows.filter(row => {
      return Object.values(row).some(val => {
        return String(val).toLowerCase().includes(searchTerm);
      });
    });
  }
  
  renderRows(rows);
}
  async function loadRows(table){
  const data = await fetchJson('/api/tables/' + encodeURIComponent(table) + '?limit=200');
  rowsTitle.textContent = 'Rows: ' + table;
  originalRows = data.rows || [];
  if(searchFilter) searchFilter.value = ''; // Clear search on new table load
  // Uncheck date filters when loading new table
  const checkbox48Hours = document.getElementById('checkbox-48-hours');
  const checkbox7Days = document.getElementById('checkbox-7-days');
  if(checkbox48Hours) checkbox48Hours.checked = false;
  if(checkbox7Days) checkbox7Days.checked = false;
  
  applyFilters();
}
  searchFilter?.addEventListener('input', applyFilters);
document.getElementById('checkbox-48-hours')?.addEventListener('change', applyFilters);
document.getElementById('checkbox-7-days')?.addEventListener('change', applyFilters);
document.getElementById('checkbox-pcon')?.addEventListener('change', applyFilters);
document.getElementById('checkbox-pamm')?.addEventListener('change', applyFilters);
document.getElementById('checkbox-pcan')?.addEventListener('change', applyFilters);
startApp();
  function escapeHtml(s){
  return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
  let carTypesCache = null;
let driverNamesCache = null;
let guideNamesCache = null;
  async function loadCarTypes(){
  if(carTypesCache) return carTypesCache;
  try {
    const data = await fetchJson('/api/tables/' + encodeURIComponent('car') + '?limit=1000');
    const rows = data.rows || [];
    const carTypes = new Set();
    rows.forEach(row => {
      const carTypeInfo = row['Car_type_info'] || row['car_type_info'] || row['Car Type Info'];
      if(carTypeInfo && String(carTypeInfo).trim()){
        carTypes.add(String(carTypeInfo).trim());
      }
    });
    carTypesCache = Array.from(carTypes).sort();
    return carTypesCache;
  } catch(err) {
    console.error('Failed to load car types:', err);
    return [];
  }
}
  async function loadDriverNames(){
  if(driverNamesCache) return driverNamesCache;
  try {
    const data = await fetchJson('/api/tables/' + encodeURIComponent('driver') + '?limit=1000');
    const rows = data.rows || [];
    const driverNames = new Set();
    rows.forEach(row => {
      const driverDetails = row['driver_details'] || row['Driver_details'] || row['Driver Details'];
      if(driverDetails && String(driverDetails).trim()){
        driverNames.add(String(driverDetails).trim());
      }
    });
    driverNamesCache = Array.from(driverNames).sort();
    return driverNamesCache;
  } catch(err) {
    console.error('Failed to load driver names:', err);
    return [];
  }
}
  async function loadGuideNames(){
  if(guideNamesCache) return guideNamesCache;
  try {
    const data = await fetchJson('/api/tables/' + encodeURIComponent('guide') + '?limit=1000');
    const rows = data.rows || [];
    const guideNames = new Set();
    rows.forEach(row => {
      const guideDetails = row['guide_details'] || row['Guide_details'] || row['Guide Details'];
      if(guideDetails && String(guideDetails).trim()){
        guideNames.add(String(guideDetails).trim());
      }
    });
    guideNamesCache = Array.from(guideNames).sort();
    return guideNamesCache;
  } catch(err) {
    console.error('Failed to load guide names:', err);
    return [];
  }
}
  async function renderDetails(row){
  const keys = Object.keys(row);
  const pkSet = new Set((currentMeta?.primaryKey)||[]);
  const generatedColumnsSet = new Set((currentMeta?.generatedColumns)||[]);
  
  // Check if field is editable based on role restrictions (for driver/guide in their own tables)
  const isDriverTable = currentTable && normalize(currentTable) === normalize('driver');
  const isGuideTable = currentTable && normalize(currentTable) === normalize('guide');
  const isDriverViewingDriverTable = authUser && authUser.role === 'driver' && isDriverTable;
  const isGuideViewingGuideTable = authUser && authUser.role === 'guide' && isGuideTable;
  
  // Check if we need car types, driver names, or guide names for searchable dropdowns
  const isOperasionalServices = currentTable && normalize(currentTable) === normalize(TARGET_TABLE);
  const needsCarTypes = isOperasionalServices && (editMode || addMode) && 
    keys.some(k => normName(k) === normName('Car Type'));
  const needsDriverNames = isOperasionalServices && (editMode || addMode) && 
    keys.some(k => normName(k) === normName('Driver Name'));
  const needsGuideNames = isOperasionalServices && (editMode || addMode) && 
    keys.some(k => normName(k) === normName('Guide Name'));
  
  let carTypes = [];
  let driverNames = [];
  let guideNames = [];
  if(needsCarTypes){
    carTypes = await loadCarTypes();
  }
  if(needsDriverNames){
    driverNames = await loadDriverNames();
  }
  if(needsGuideNames){
    guideNames = await loadGuideNames();
  }
  
  const html = keys.map(k => {
    const v = row[k];
    const isGenerated = generatedColumnsSet.has(k);
    
    // Determine field type from column metadata or field name
    let fieldType = null;
    let isDateLike = false;
    let isNumeric = false;
    let numericConfig = { step: '1', min: '' };
    
    if (currentMeta?.columnTypes?.[k]) {
      const colType = parseColumnType(currentMeta.columnTypes[k]);
      if (colType.base === 'datetime' || colType.base === 'timestamp') {
        isDateLike = true;
        fieldType = 'datetime-local';
      } else if (colType.base === 'date') {
        isDateLike = true;
        fieldType = 'date';
      } else if (colType.base === 'time') {
        isDateLike = true;
        fieldType = 'time';
      } else if (colType.base === 'int') {
        isNumeric = true;
        fieldType = 'number';
        numericConfig.step = '1';
        // Don't set min for all ints - some might be negative (like IDs can be)
        // Only set min for unsigned ints if we detect it
        if (colType.unsigned) {
          numericConfig.min = '0';
        }
      } else if (colType.base === 'decimal') {
        isNumeric = true;
        fieldType = 'number';
        // For decimal(10, 0), step should be 1, otherwise use decimal step
        if (colType.scale === 0) {
          numericConfig.step = '1';
        } else {
          numericConfig.step = '0.' + '0'.repeat(colType.scale - 1) + '1';
        }
        numericConfig.min = '';
      }
    } else {
      // Fallback: check by field name
      const n = normName(k);
      if (
        n === normName('Date of Services') ||
        n === normName('Driver Service Time') ||
        n === normName('Timestamps') ||
        n === normName('Booking Date')
      ) {
        isDateLike = true;
        fieldType = 'datetime-local';
      }
    }
  
    // For driver/guide in their own tables, only password field is editable
    let isFieldEditable = true;
    if((isDriverViewingDriverTable || isGuideViewingGuideTable) && (editMode || addMode)){
      const normalizedFieldName = normalizeFieldName(k);
      const normalizedPassword = normalizeFieldName('Password');
      isFieldEditable = normalizedFieldName === normalizedPassword;
    }
  
    if((editMode || addMode) && !pkSet.has(k) && !isGenerated && isFieldEditable){
      if(isDateLike && fieldType){
        let dateValue = '';
        if (fieldType === 'datetime-local') {
          dateValue = toDatetimeLocalValue(v);
        } else if (fieldType === 'date') {
          try {
            let d;
            // Handle MySQL datetime format: YYYY-MM-DD HH:mm:ss (UTC)
            if (typeof v === 'string' && v.match(/^\d{4}-\d{2}-\d{2}/)) {
              if (v.includes(' ')) {
                d = new Date(v.replace(' ', 'T') + 'Z'); // Parse as UTC
              } else {
                d = new Date(v + 'T00:00:00Z'); // Date only, assume midnight UTC
              }
            } else {
              d = new Date(v);
            }
            if (!isNaN(d)) {
              const pad = (n) => String(n).padStart(2,'0');
              dateValue = `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
            }
          } catch {}
        } else if (fieldType === 'time') {
          try {
            let d;
            // Handle MySQL datetime format: YYYY-MM-DD HH:mm:ss (UTC)
            if (typeof v === 'string' && v.match(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/)) {
              d = new Date(v.replace(' ', 'T') + 'Z'); // Parse as UTC
            } else {
              d = new Date(v);
            }
            if (!isNaN(d)) {
              const pad = (n) => String(n).padStart(2,'0');
              dateValue = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
            }
          } catch {}
        }
        console.log(`Creating ${fieldType} input for ${k}: original value =`, v, `converted value =`, dateValue);
        return `<div class="kv"><div class="muted">${escapeHtml(k)}</div><div><input type="${fieldType}" data-field="${escapeHtml(k)}" value="${escapeHtml(dateValue)}" style="width:100%;padding:8px;border-radius:8px;border:1px solid #1f2a44;background:#0b1225;color:#e6edf3" /></div></div>`;
      } else if(isNumeric && fieldType === 'number'){
        let numValue = v !== null && v !== undefined ? Number(v) : '';
          // Auto-fill default value 0 for integer columns if empty/null
        if (currentMeta?.columnTypes?.[k]) {
          const colType = parseColumnType(currentMeta.columnTypes[k]);
          if (colType.base === 'int' && (v === null || v === undefined || v === '' || isNaN(numValue))) {
            numValue = 0;
          }
        }
          const stepAttr = numericConfig.step ? ` step="${escapeHtml(numericConfig.step)}"` : '';
        const minAttr = numericConfig.min !== '' ? ` min="${escapeHtml(numericConfig.min)}"` : '';
        return `<div class="kv"><div class="muted">${escapeHtml(k)}</div><div><input type="number" data-field="${escapeHtml(k)}" value="${numValue}"${stepAttr}${minAttr} style="width:100%;padding:8px;border-radius:8px;border:1px solid #1f2a44;background:#0b1225;color:#e6edf3" /></div></div>`;
      } else {
        // Check if this is "Car Type", "Driver Name", or "Guide Name" field in "operasional services" table
        const isCarTypeField = isOperasionalServices && normName(k) === normName('Car Type');
        const isDriverNameField = isOperasionalServices && normName(k) === normName('Driver Name');
        const isGuideNameField = isOperasionalServices && normName(k) === normName('Guide Name');
        
        if(isCarTypeField && carTypes.length > 0){
          const currentValue = String(v ?? '');
          const fieldId = `car-type-${k.replace(/\s+/g, '-').toLowerCase()}`;
          const options = carTypes.map(ct => {
            return `<div class="dropdown-option" data-value="${escapeHtml(ct)}">${escapeHtml(ct)}</div>`;
          }).join('');
          return `<div class="kv"><div class="muted">${escapeHtml(k)}</div><div style="position:relative"><input type="text" id="${fieldId}" data-field="${escapeHtml(k)}" data-dropdown="car-type" value="${escapeHtml(currentValue)}" placeholder="Type to search car type..." autocomplete="off" style="width:100%;padding:8px;border-radius:8px;border:1px solid #1f2a44;background:#0b1225;color:#e6edf3" /><div class="dropdown-list" id="${fieldId}-dropdown" style="display:none;position:absolute;top:100%;left:0;right:0;max-height:200px;overflow-y:auto;background:#0f172a;border:1px solid #1f2a44;border-radius:8px;margin-top:4px;z-index:1000;box-shadow:0 4px 12px rgba(0,0,0,.3)">${options}</div></div></div>`;
        } else if(isDriverNameField && driverNames.length > 0){
          const currentValue = String(v ?? '');
          const fieldId = `driver-name-${k.replace(/\s+/g, '-').toLowerCase()}`;
          const options = driverNames.map(dn => {
            return `<div class="dropdown-option" data-value="${escapeHtml(dn)}">${escapeHtml(dn)}</div>`;
          }).join('');
          return `<div class="kv"><div class="muted">${escapeHtml(k)}</div><div style="position:relative"><input type="text" id="${fieldId}" data-field="${escapeHtml(k)}" data-dropdown="driver-name" value="${escapeHtml(currentValue)}" placeholder="Type to search driver name..." autocomplete="off" style="width:100%;padding:8px;border-radius:8px;border:1px solid #1f2a44;background:#0b1225;color:#e6edf3" /><div class="dropdown-list" id="${fieldId}-dropdown" style="display:none;position:absolute;top:100%;left:0;right:0;max-height:200px;overflow-y:auto;background:#0f172a;border:1px solid #1f2a44;border-radius:8px;margin-top:4px;z-index:1000;box-shadow:0 4px 12px rgba(0,0,0,.3)">${options}</div></div></div>`;
        } else if(isGuideNameField && guideNames.length > 0){
          const currentValue = String(v ?? '');
          const fieldId = `guide-name-${k.replace(/\s+/g, '-').toLowerCase()}`;
          const options = guideNames.map(gn => {
            return `<div class="dropdown-option" data-value="${escapeHtml(gn)}">${escapeHtml(gn)}</div>`;
          }).join('');
          return `<div class="kv"><div class="muted">${escapeHtml(k)}</div><div style="position:relative"><input type="text" id="${fieldId}" data-field="${escapeHtml(k)}" data-dropdown="guide-name" value="${escapeHtml(currentValue)}" placeholder="Type to search guide name..." autocomplete="off" style="width:100%;padding:8px;border-radius:8px;border:1px solid #1f2a44;background:#0b1225;color:#e6edf3" /><div class="dropdown-list" id="${fieldId}-dropdown" style="display:none;position:absolute;top:100%;left:0;right:0;max-height:200px;overflow-y:auto;background:#0f172a;border:1px solid #1f2a44;border-radius:8px;margin-top:4px;z-index:1000;box-shadow:0 4px 12px rgba(0,0,0,.3)">${options}</div></div></div>`;
        } else {
          const inputValue = String(v ?? '');
          // Use password input type for Password field
          const isPasswordField = normalizeFieldName(k) === normalizeFieldName('Password');
          const inputType = isPasswordField ? 'password' : 'text';
          return `<div class="kv"><div class="muted">${escapeHtml(k)}</div><div><input type="${inputType}" data-field="${escapeHtml(k)}" value="${escapeHtml(inputValue)}" style="width:100%;padding:8px;border-radius:8px;border:1px solid #1f2a44;background:#0b1225;color:#e6edf3" /></div></div>`;
        }
      }
    } else {
      const display = formatCell(k, v);
      const readonly = pkSet.has(k) && editMode ? ' (primary key)' : '';
      
      // For driver/guide in their own tables, show readonly indicator for non-password fields in edit mode
      let readonlyIndicator = readonly;
      if((isDriverViewingDriverTable || isGuideViewingGuideTable) && editMode && !pkSet.has(k)){
        const normalizedFieldName = normalizeFieldName(k);
        const normalizedPassword = normalizeFieldName('Password');
        if(normalizedFieldName !== normalizedPassword){
          readonlyIndicator = ' (readonly)';
        }
      }
      
      return `<div class="kv"><div class="muted">${escapeHtml(k)}${readonlyIndicator}</div><div>${escapeHtml(display)}</div></div>`;
    }
  });
  detailsContent.innerHTML = html.join('') || '<div class="muted">No details</div>';
  
  // Initialize searchable dropdowns for Car Type, Driver Name, and Guide Name fields
  if(isOperasionalServices && (editMode || addMode)){
    initializeSearchableDropdowns();
  }
  
  // Apply role-based field visibility
  applyRoleBasedFieldVisibility();
}
  function initializeSearchableDropdowns(){
  // Initialize all searchable dropdowns (car-type, driver-name, guide-name)
  const dropdownInputs = detailsContent.querySelectorAll('input[data-dropdown]');
  dropdownInputs.forEach(input => {
    const dropdownId = input.id + '-dropdown';
    const dropdown = document.getElementById(dropdownId);
    if(!dropdown) return;
    
    let isDropdownOpen = false;
    
    // Show dropdown on focus or when typing
    input.addEventListener('focus', () => {
      filterDropdownOptions(input, dropdown);
      dropdown.style.display = 'block';
      isDropdownOpen = true;
    });
    
    input.addEventListener('input', () => {
      filterDropdownOptions(input, dropdown);
      dropdown.style.display = 'block';
      isDropdownOpen = true;
    });
    
    // Handle option selection
    dropdown.querySelectorAll('.dropdown-option').forEach(option => {
      option.addEventListener('click', () => {
        const value = option.getAttribute('data-value');
        input.value = value;
        dropdown.style.display = 'none';
        isDropdownOpen = false;
        input.blur();
      });
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if(isDropdownOpen && !input.contains(e.target) && !dropdown.contains(e.target)){
        dropdown.style.display = 'none';
        isDropdownOpen = false;
      }
    });
    
    // Handle keyboard navigation
    let highlightedIndex = -1;
    input.addEventListener('keydown', (e) => {
      const options = Array.from(dropdown.querySelectorAll('.dropdown-option:not([style*="display:none"])'));
      
      if(e.key === 'ArrowDown'){
        e.preventDefault();
        highlightedIndex = Math.min(highlightedIndex + 1, options.length - 1);
        updateHighlight(options, highlightedIndex);
        if(options[highlightedIndex]){
          options[highlightedIndex].scrollIntoView({ block: 'nearest' });
        }
      } else if(e.key === 'ArrowUp'){
        e.preventDefault();
        highlightedIndex = Math.max(highlightedIndex - 1, -1);
        updateHighlight(options, highlightedIndex);
        if(options[highlightedIndex]){
          options[highlightedIndex].scrollIntoView({ block: 'nearest' });
        }
      } else if(e.key === 'Enter' && highlightedIndex >= 0 && options[highlightedIndex]){
        e.preventDefault();
        options[highlightedIndex].click();
      } else if(e.key === 'Escape'){
        dropdown.style.display = 'none';
        isDropdownOpen = false;
        input.blur();
      }
    });
  });
}
  function filterDropdownOptions(input, dropdown){
  const searchTerm = input.value.toLowerCase().trim();
  const options = dropdown.querySelectorAll('.dropdown-option');
  let visibleCount = 0;
  
  options.forEach(option => {
    const value = option.getAttribute('data-value').toLowerCase();
    if(value.includes(searchTerm)){
      option.style.display = 'block';
      visibleCount++;
    } else {
      option.style.display = 'none';
    }
  });
  
  // Show dropdown only if there are visible options
  if(visibleCount === 0 && searchTerm === ''){
    dropdown.style.display = 'block';
  } else if(visibleCount === 0){
    dropdown.style.display = 'none';
  }
}
  function updateHighlight(options, index){
  options.forEach((opt, i) => {
    if(i === index){
      opt.classList.add('highlight');
    } else {
      opt.classList.remove('highlight');
    }
  });
}
  async function showDetails(row){
  // Stop tracking previous row if switching to a different row
  if(currentRow && currentRow !== row){
    const prevBookingRefCol = findColumnByName(currentRow, 'Reference No.');
    const newBookingRefCol = findColumnByName(row, 'Reference No.');
    if(prevBookingRefCol && newBookingRefCol){
      const prevRef = currentRow[prevBookingRefCol];
      const newRef = row[newBookingRefCol];
      if(prevRef !== newRef){
        // Different booking, stop previous tracking
        stopLocationTracking();
      }
    }
  }
  
  currentRow = row;
  editMode = false;
  addMode = false;
  detailsModalTitle.textContent = 'Row Details';
  
  // Hide edit/delete buttons for Driver and Guide roles
  if(authUser && (authUser.role === 'driver' || authUser.role === 'guide')){
    detailsEdit.style.display = 'none';
    detailsDelete.style.display = 'none';
  } else {
    detailsEdit.style.display = '';
    detailsDelete.style.display = '';
  }
  
  detailsSave.style.display = 'none';
  detailsCancel.style.display = 'none';
  if(buttonsContainer){
    if(currentTable && normalize(currentTable) === normalize(TARGET_TABLE)){
      buttonsContainer.style.display = 'flex';
      if(statusButtonsSection) statusButtonsSection.style.display = 'flex';
      if(rightSideSection) rightSideSection.style.display = 'flex';
      if(htxActionsSection) htxActionsSection.style.display = 'flex';
      // Show GPS status indicator for operasional services table
      const gpsStatusEl = document.getElementById('gps-status');
      if(gpsStatusEl) gpsStatusEl.style.display = '';
      // Initialize toggle states based on current Pickup Status
      initializeToggleStates(row);
      // Initialize stopwatch based on current status
      initializeStopwatch(row);
      // Check if GPS tracking is active for this row
      if(currentTrackingRow && currentTrackingRow === row && currentTrackingStatus){
        updateGPSStatus(true, null, 'GPS tracking active');
      } else {
        updateGPSStatus(false);
      }
    } else {
      buttonsContainer.style.display = 'none';
      if(statusButtonsSection) statusButtonsSection.style.display = 'none';
      if(rightSideSection) rightSideSection.style.display = 'none';
      if(htxActionsSection) htxActionsSection.style.display = 'none';
      // Hide GPS status indicator for other tables
      const gpsStatusEl = document.getElementById('gps-status');
      if(gpsStatusEl) gpsStatusEl.style.display = 'none';
      // Stop stopwatch when modal is closed or different table
      stopStopwatch();
      // Stop GPS tracking when switching to different table
      stopLocationTracking();
    }
  }
  if(pendingButtonsSection){
    if(currentTable && normalize(currentTable) === 'pendings'){
      pendingButtonsSection.style.display = 'flex';
    } else {
      pendingButtonsSection.style.display = 'none';
    }
  }
  await renderDetails(row);
  // Remove hidden and pointer-events-none, add hs-overlay-open for Preline UI
  detailsModal.classList.remove('hidden', 'pointer-events-none');
  detailsModal.classList.add('hs-overlay-open');
  detailsModal.setAttribute('aria-hidden','false');
  // Force a reflow to trigger animations
  void detailsModal.offsetWidth;
}
  // Prevent multiple simultaneous saves
  let isSaving = false;
  
  async function saveDetails(){
  if(!currentRow || !currentTable) return;
  
  // Prevent multiple simultaneous saves
  if(isSaving) {
    console.log('Save already in progress, ignoring duplicate request');
    return;
  }
  
  // Disable save button to prevent multiple clicks
  if(detailsSave) {
    detailsSave.disabled = true;
    detailsSave.textContent = 'Saving...';
  }
  
  isSaving = true;
  
  try {
    await ensureMeta(currentTable);
    const pkCols = currentMeta.primaryKey || [];
    if(pkCols.length === 0){
      alert('Cannot update: table has no primary key');
      isSaving = false;
      if(detailsSave) {
        detailsSave.disabled = false;
        detailsSave.textContent = 'Save';
      }
      return;
    }
    const key = {};
    for(const c of pkCols){ key[c] = currentRow[c]; }
    const inputs = detailsContent.querySelectorAll('input[data-field], select[data-field]');
    const data = {};
    const generatedColumnsSet = new Set((currentMeta?.generatedColumns)||[]);
    
    inputs.forEach(inp => {
      const field = inp.getAttribute('data-field');
      // Skip generated/virtual columns - they cannot be updated
      if(generatedColumnsSet.has(field)){
        return;
      }
      const inputType = inp.type || (inp.tagName === 'SELECT' ? 'select' : 'text');
      let value = inp.value;
        // First, check column type and convert based on that (more reliable than input type)
      if (currentMeta?.columnTypes?.[field]) {
        const colType = parseColumnType(currentMeta.columnTypes[field]);
        if (colType.base === 'int') {
          if (value === '' || value === null || value === undefined) {
            value = 0;
          } else {
            const numVal = Number(value);
            if (isNaN(numVal)) {
              alert(`Invalid integer value for field "${field}". Please enter a valid number.`);
              throw new Error('Invalid integer');
            }
            value = Math.floor(numVal);
          }
        } else if (colType.base === 'decimal') {
          if (value === '' || value === null || value === undefined) {
            value = null;
          } else {
            const numVal = Number(value);
            if (isNaN(numVal)) {
              alert(`Invalid decimal value for field "${field}". Please enter a valid number.`);
              throw new Error('Invalid decimal');
            }
            value = numVal;
          }
        } else if (colType.base === 'datetime' || colType.base === 'timestamp') {
          if (value === '' || value === null || value === undefined) {
            value = null;
          } else if (inputType === 'datetime-local') {
            // datetime-local format: YYYY-MM-DDTHH:mm (local time)
            // Convert to UTC for MySQL storage
            const date = new Date(value);
            if (isNaN(date.getTime())) {
              alert(`Invalid date/time value for field "${field}". Please enter a valid date and time.`);
              throw new Error('Invalid datetime');
            }
            // Format as MySQL datetime in UTC: YYYY-MM-DD HH:mm:ss
            const pad = (n) => String(n).padStart(2,'0');
            value = `${date.getUTCFullYear()}-${pad(date.getUTCMonth()+1)}-${pad(date.getUTCDate())} ${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}:${pad(date.getUTCSeconds())}`;
          }
        } else if (colType.base === 'date') {
          if (value === '' || value === null || value === undefined) {
            value = null;
          } else if (inputType === 'date') {
            // date format: YYYY-MM-DD (local date input)
            // Convert to UTC date for MySQL storage
            const date = new Date(value + 'T00:00:00');
            if (isNaN(date.getTime())) {
              alert(`Invalid date value for field "${field}". Please enter a valid date.`);
              throw new Error('Invalid date');
            }
            const pad = (n) => String(n).padStart(2,'0');
            value = `${date.getUTCFullYear()}-${pad(date.getUTCMonth()+1)}-${pad(date.getUTCDate())}`;
          }
        } else if (colType.base === 'time') {
          if (value === '' || value === null || value === undefined) {
            value = null;
          } else if (inputType === 'time') {
            // time format: HH:mm (local time input)
            // For time fields, we typically store as-is since MySQL TIME doesn't have timezone
            value = value + ':00'; // Add seconds
          }
        }
      } else {
        // Fallback: convert based on input type if no column type info
        if (inputType === 'number') {
          if (value === '' || value === null || value === undefined) {
            value = 0;
          } else {
            const numVal = Number(value);
            if (isNaN(numVal)) {
              alert(`Invalid number value for field "${field}". Please enter a valid number.`);
              throw new Error('Invalid number');
            }
            value = numVal;
          }
        } else if (inputType === 'datetime-local') {
          if (value === '' || value === null || value === undefined) {
            value = null;
          } else {
            const date = new Date(value);
            if (isNaN(date.getTime())) {
              alert(`Invalid date/time value for field "${field}". Please enter a valid date and time.`);
              throw new Error('Invalid datetime');
            }
            const pad = (n) => String(n).padStart(2,'0');
            value = `${date.getUTCFullYear()}-${pad(date.getUTCMonth()+1)}-${pad(date.getUTCDate())} ${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}:${pad(date.getUTCSeconds())}`;
          }
        } else if (inputType === 'date') {
          if (value === '' || value === null || value === undefined) {
            value = null;
          } else {
            const date = new Date(value + 'T00:00:00');
            if (isNaN(date.getTime())) {
              alert(`Invalid date value for field "${field}". Please enter a valid date.`);
              throw new Error('Invalid date');
            }
            const pad = (n) => String(n).padStart(2,'0');
            value = `${date.getUTCFullYear()}-${pad(date.getUTCMonth()+1)}-${pad(date.getUTCDate())}`;
          }
        } else if (inputType === 'time') {
          if (value === '' || value === null || value === undefined) {
            value = null;
          } else {
            value = value + ':00'; // Add seconds
          }
        }
      }
        data[field] = value;
    });
    
    statusEl.textContent = 'Saving...';
    const apiUrl = API_BASE + '/api/tables/' + encodeURIComponent(currentTable);
    console.log('Saving to:', apiUrl, { key, data });
    
    // Build headers with Authorization if available
    const headers = getAuthHeaders({ 'Content-Type': 'application/json' });
    
    const res = await fetch(apiUrl, {
      method: 'PUT', 
      headers: headers,
      body: JSON.stringify({ key, data })
    });
    
    if(!res.ok){
      const errorText = await res.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { error: `HTTP ${res.status}: ${errorText}` };
      }
      const errorMessage = errorData.error || 'Unknown error';
      const errorDetails = errorData.details ? '\nDetails: ' + errorData.details : '';
      alert('Update failed: ' + errorMessage + errorDetails);
      console.error('Save error:', res.status, errorData);
      statusEl.textContent = 'Save failed';
      setTimeout(() => { statusEl.textContent = ''; }, 3000);
      isSaving = false;
      if(detailsSave) {
        detailsSave.disabled = false;
        detailsSave.textContent = 'Save';
      }
      return;
    }
    
    const result = await res.json();
    if(result.updated){
      statusEl.textContent = 'Saved successfully!';
      // Refresh rows and close
      await loadRows(currentTable);
      setTimeout(() => { statusEl.textContent = ''; }, 2000);
      editMode = false;
      
      // Hide edit/delete buttons for Driver and Guide roles
      if(authUser && (authUser.role === 'driver' || authUser.role === 'guide')){
        detailsEdit.style.display = 'none';
        detailsDelete.style.display = 'none';
      } else {
        detailsEdit.style.display = '';
        detailsDelete.style.display = '';
      }
      
      detailsSave.style.display = 'none';
      detailsCancel.style.display = 'none';
      detailsModal.classList.add('hidden', 'pointer-events-none');
      detailsModal.classList.remove('hs-overlay-open');
      detailsModal.setAttribute('aria-hidden','true');
      // Update currentRow with saved data
      currentRow = { ...currentRow, ...data };
    } else {
      alert('Update did not affect any rows. The record may have been deleted or no changes were made.');
      statusEl.textContent = 'No changes saved';
      setTimeout(() => { statusEl.textContent = ''; }, 3000);
    }
    
    isSaving = false;
    if(detailsSave) {
      detailsSave.disabled = false;
      detailsSave.textContent = 'Save';
    }
  } catch(err) {
    alert('Save error: ' + err.message);
    statusEl.textContent = '';
  }
}
  detailsClose?.addEventListener('click', () => {
  detailsModal.classList.add('hidden', 'pointer-events-none');
  detailsModal.classList.remove('hs-overlay-open');
  detailsModal.setAttribute('aria-hidden','true');
  addMode = false;
  editMode = false;
  detailsModalTitle.textContent = 'Row Details';
  if(buttonsContainer){
    buttonsContainer.style.display = 'none';
  }
  if(statusButtonsSection){
    statusButtonsSection.style.display = 'none';
  }
  if(rightSideSection){
    rightSideSection.style.display = 'none';
  }
  if(htxActionsSection){
    htxActionsSection.style.display = 'none';
  }
  if(pendingButtonsSection){
    pendingButtonsSection.style.display = 'none';
  }
  // Don't stop stopwatch when modal closes - it continues running until "Completed" is tapped
});
detailsModal?.addEventListener('click', (e) => {
  if(e.target === detailsModal){
    detailsModal.classList.add('hidden', 'pointer-events-none');
    detailsModal.classList.remove('hs-overlay-open');
    detailsModal.setAttribute('aria-hidden','true');
    addMode = false;
    editMode = false;
    detailsModalTitle.textContent = 'Row Details';
    if(buttonsContainer){
      buttonsContainer.style.display = 'none';
    }
    if(statusButtonsSection){
      statusButtonsSection.style.display = 'none';
    }
    if(rightSideSection){
      rightSideSection.style.display = 'none';
    }
    if(htxActionsSection){
      htxActionsSection.style.display = 'none';
    }
    if(pendingButtonsSection){
      pendingButtonsSection.style.display = 'none';
    }
    // Don't stop stopwatch when modal closes - it continues running until "Completed" is tapped
  }
});
  detailsEdit?.addEventListener('click', async () => {
  // Check if user can edit this table
  if(authUser){
    const isDriverTable = currentTable && normalize(currentTable) === normalize('driver');
    const isGuideTable = currentTable && normalize(currentTable) === normalize('guide');
    const isDriverViewingDriverTable = authUser.role === 'driver' && isDriverTable;
    const isGuideViewingGuideTable = authUser.role === 'guide' && isGuideTable;
    
    // Allow edit for driver/guide in their own table (password only)
    if(!isDriverViewingDriverTable && !isGuideViewingGuideTable && (authUser.role === 'driver' || authUser.role === 'guide')){
      alert('You do not have permission to edit this data.');
      return;
    }
  }
  
  editMode = true;
  detailsEdit.style.display = 'none';
  detailsSave.style.display = '';
  detailsCancel.style.display = '';
  detailsDelete.style.display = '';
  await renderDetails(currentRow);
});
detailsCancel?.addEventListener('click', async () => {
  if(addMode) {
    addMode = false;
    detailsModal.classList.add('hidden', 'pointer-events-none');
    detailsModal.classList.remove('hs-overlay-open');
    detailsModal.setAttribute('aria-hidden','true');
    detailsModalTitle.textContent = 'Row Details';
  } else {
  editMode = false;
  
  // Hide edit/delete buttons for Driver and Guide roles
  if(authUser && (authUser.role === 'driver' || authUser.role === 'guide')){
    detailsEdit.style.display = 'none';
    detailsDelete.style.display = 'none';
  } else {
    detailsEdit.style.display = '';
    detailsDelete.style.display = '';
  }
  
  detailsSave.style.display = 'none';
  detailsCancel.style.display = 'none';
    await renderDetails(currentRow);
  }
});
detailsSave?.addEventListener('click', () => { 
  if(addMode) {
    saveNewRow();
  } else {
    saveDetails();
  }
});
  async function showAddForm(){
  if(!currentTable) {
    alert('Please select a table first');
    return;
  }
  try {
    await ensureMeta(currentTable);
    // Create an empty row object with all columns
    const emptyRow = {};
    const columns = currentMeta?.columns || [];
    
    // Initialize all columns with empty values
    // The backend will handle skipping auto-increment primary keys
    columns.forEach(col => {
      emptyRow[col] = null;
    });
    
    currentRow = emptyRow;
    addMode = true;
    editMode = true; // Show fields as editable
    detailsModalTitle.textContent = 'Add New Row';
    detailsEdit.style.display = 'none';
    detailsSave.style.display = '';
    detailsCancel.style.display = '';
    detailsDelete.style.display = 'none';
    if(buttonsContainer){
      buttonsContainer.style.display = 'none';
    }
    if(statusButtonsSection){
      statusButtonsSection.style.display = 'none';
    }
    if(htxActionsSection){
      htxActionsSection.style.display = 'none';
    }
    await renderDetails(emptyRow);
    detailsModal.classList.remove('hidden', 'pointer-events-none');
    detailsModal.classList.add('hs-overlay-open');
    detailsModal.setAttribute('aria-hidden','false');
  } catch(err) {
    alert('Error loading table metadata: ' + err.message);
  }
}
  // Prevent multiple simultaneous saves for new rows
  let isSavingNew = false;
  
  async function saveNewRow(){
  if(!currentTable) return;
  
  // Prevent multiple simultaneous saves
  if(isSavingNew) {
    console.log('Save already in progress, ignoring duplicate request');
    return;
  }
  
  // Disable save button to prevent multiple clicks
  if(detailsSave) {
    detailsSave.disabled = true;
    detailsSave.textContent = 'Saving...';
  }
  
  isSavingNew = true;
  
  try {
    await ensureMeta(currentTable);
    const inputs = detailsContent.querySelectorAll('input[data-field], select[data-field]');
    const data = {};
    const generatedColumnsSet = new Set((currentMeta?.generatedColumns)||[]);
    
    inputs.forEach(inp => {
      const field = inp.getAttribute('data-field');
      // Skip generated/virtual columns - they cannot be inserted
      if(generatedColumnsSet.has(field)){
        return;
      }
      const inputType = inp.type || (inp.tagName === 'SELECT' ? 'select' : 'text');
      let value = inp.value;
        // First, check column type and convert based on that (more reliable than input type)
      if (currentMeta?.columnTypes?.[field]) {
        const colType = parseColumnType(currentMeta.columnTypes[field]);
        if (colType.base === 'int') {
          if (value === '' || value === null || value === undefined) {
            value = 0;
          } else {
            const numVal = Number(value);
            if (isNaN(numVal)) {
              alert(`Invalid integer value for field "${field}". Please enter a valid number.`);
              throw new Error('Invalid integer');
            }
            value = Math.floor(numVal);
          }
        } else if (colType.base === 'decimal') {
          if (value === '' || value === null || value === undefined) {
            value = null;
          } else {
            const numVal = Number(value);
            if (isNaN(numVal)) {
              alert(`Invalid decimal value for field "${field}". Please enter a valid number.`);
              throw new Error('Invalid decimal');
            }
            value = numVal;
          }
        } else if (colType.base === 'datetime' || colType.base === 'timestamp') {
          if (value === '' || value === null || value === undefined) {
            value = null;
          } else if (inputType === 'datetime-local') {
            const date = new Date(value);
            if (isNaN(date.getTime())) {
              alert(`Invalid date/time value for field "${field}". Please enter a valid date and time.`);
              throw new Error('Invalid datetime');
            }
            const pad = (n) => String(n).padStart(2,'0');
            value = `${date.getUTCFullYear()}-${pad(date.getUTCMonth()+1)}-${pad(date.getUTCDate())} ${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}:${pad(date.getUTCSeconds())}`;
          }
        } else if (colType.base === 'date') {
          if (value === '' || value === null || value === undefined) {
            value = null;
          } else if (inputType === 'date') {
            const date = new Date(value + 'T00:00:00');
            if (isNaN(date.getTime())) {
              alert(`Invalid date value for field "${field}". Please enter a valid date.`);
              throw new Error('Invalid date');
            }
            const pad = (n) => String(n).padStart(2,'0');
            value = `${date.getUTCFullYear()}-${pad(date.getUTCMonth()+1)}-${pad(date.getUTCDate())}`;
          }
        } else if (colType.base === 'time') {
          if (value === '' || value === null || value === undefined) {
            value = null;
          } else if (inputType === 'time') {
            value = value + ':00';
          }
        }
      } else {
        // Fallback: convert based on input type if no column type info
        if (inputType === 'number') {
          if (value === '' || value === null || value === undefined) {
            value = 0;
          } else {
            const numVal = Number(value);
            if (isNaN(numVal)) {
              alert(`Invalid number value for field "${field}". Please enter a valid number.`);
              throw new Error('Invalid number');
            }
            value = numVal;
          }
        } else if (inputType === 'datetime-local') {
          if (value === '' || value === null || value === undefined) {
            value = null;
          } else {
            const date = new Date(value);
            if (isNaN(date.getTime())) {
              alert(`Invalid date/time value for field "${field}". Please enter a valid date and time.`);
              throw new Error('Invalid datetime');
            }
            const pad = (n) => String(n).padStart(2,'0');
            value = `${date.getUTCFullYear()}-${pad(date.getUTCMonth()+1)}-${pad(date.getUTCDate())} ${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}:${pad(date.getUTCSeconds())}`;
          }
        } else if (inputType === 'date') {
          if (value === '' || value === null || value === undefined) {
            value = null;
          } else {
            const date = new Date(value + 'T00:00:00');
            if (isNaN(date.getTime())) {
              alert(`Invalid date value for field "${field}". Please enter a valid date.`);
              throw new Error('Invalid date');
            }
            const pad = (n) => String(n).padStart(2,'0');
            value = `${date.getUTCFullYear()}-${pad(date.getUTCMonth()+1)}-${pad(date.getUTCDate())}`;
          }
        } else if (inputType === 'time') {
          if (value === '' || value === null || value === undefined) {
            value = null;
          } else {
            value = value + ':00';
          }
        }
      }
        data[field] = value;
    });
    
    statusEl.textContent = 'Saving...';
    const apiUrl = API_BASE + '/api/tables/' + encodeURIComponent(currentTable);
    console.log('Saving new row to:', apiUrl, { data });
    
    // Build headers with Authorization if available
    const headers = getAuthHeaders({ 'Content-Type': 'application/json' });
    
    const res = await fetch(apiUrl, {
      method: 'POST', 
      headers: headers,
      body: JSON.stringify({ data })
    });
    
    if(!res.ok){
      const errorText = await res.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { error: `HTTP ${res.status}: ${errorText}` };
      }
      alert('Add failed: ' + (errorData.error || 'Unknown error') + (errorData.details ? '\nDetails: ' + errorData.details : ''));
      console.error('Save error:', res.status, errorData);
      statusEl.textContent = '';
      return;
    }
    
    const result = await res.json();
    if(result.inserted){
      statusEl.textContent = 'Added successfully!';
      // Refresh rows and close
      await loadRows(currentTable);
      setTimeout(() => { statusEl.textContent = ''; }, 2000);
      detailsModal.classList.add('hidden', 'pointer-events-none');
      detailsModal.classList.remove('hs-overlay-open');
      detailsModal.setAttribute('aria-hidden','true');
      addMode = false;
      editMode = false;
      
      // Hide edit/delete buttons for Driver and Guide roles
      if(authUser && (authUser.role === 'driver' || authUser.role === 'guide')){
        detailsEdit.style.display = 'none';
        detailsDelete.style.display = 'none';
      } else {
        detailsEdit.style.display = '';
        detailsDelete.style.display = '';
      }
      
      detailsSave.style.display = 'none';
      detailsCancel.style.display = 'none';
      detailsModalTitle.textContent = 'Row Details';
    } else {
      alert('Add did not succeed. Please check the data and try again.');
      statusEl.textContent = 'Save failed';
      setTimeout(() => { statusEl.textContent = ''; }, 3000);
    }
    
    isSavingNew = false;
    if(detailsSave) {
      detailsSave.disabled = false;
      detailsSave.textContent = 'Save';
    }
  } catch(err) {
    console.error('Save error:', err);
    alert('Error saving: ' + (err.message || 'Unknown error occurred. Please try again.'));
    statusEl.textContent = 'Save failed';
    setTimeout(() => { statusEl.textContent = ''; }, 3000);
    isSavingNew = false;
    if(detailsSave) {
      detailsSave.disabled = false;
      detailsSave.textContent = 'Save';
    }
  }
}
  addRowBtn?.addEventListener('click', () => {
  showAddForm();
});
// CSV import functionality removed - not used
  async function deleteRow(){
  if(!currentRow || !currentTable) return;
  
  // Prevent delete if user is Driver or Guide
  if(authUser && (authUser.role === 'driver' || authUser.role === 'guide')){
    alert('You do not have permission to delete data.');
    return;
  }
  
  // Confirm deletion
  if(!confirm('Are you sure you want to delete this row? This action cannot be undone.')){
    return;
  }
  
  try {
    await ensureMeta(currentTable);
    const pkCols = currentMeta.primaryKey || [];
    if(pkCols.length === 0){
      alert('Cannot delete: table has no primary key');
      return;
    }
    const key = {};
    for(const c of pkCols){ key[c] = currentRow[c]; }
    
    statusEl.textContent = 'Deleting...';
    const apiUrl = API_BASE + '/api/tables/' + encodeURIComponent(currentTable);
    console.log('Deleting from:', apiUrl, { key });
    
    const res = await fetch(apiUrl, {
      method: 'DELETE', 
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ key })
    });
    
    if(!res.ok){
      const errorText = await res.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { error: `HTTP ${res.status}: ${errorText}` };
      }
      alert('Delete failed: ' + (errorData.error || 'Unknown error') + (errorData.details ? '\nDetails: ' + errorData.details : ''));
      console.error('Delete error:', res.status, errorData);
      statusEl.textContent = '';
      return;
    }
    
    const result = await res.json();
    if(result.deleted){
      statusEl.textContent = 'Deleted successfully!';
      // Refresh rows and close modal
      await loadRows(currentTable);
      setTimeout(() => { statusEl.textContent = ''; }, 2000);
      detailsModal.classList.add('hidden', 'pointer-events-none');
      detailsModal.classList.remove('hs-overlay-open');
      detailsModal.setAttribute('aria-hidden','true');
      addMode = false;
      editMode = false;
      detailsModalTitle.textContent = 'Row Details';
    } else {
      alert('Delete did not affect any rows. The record may have already been deleted.');
      statusEl.textContent = '';
    }
  } catch(err) {
    alert('Delete error: ' + err.message);
    statusEl.textContent = '';
  }
}
  detailsDelete?.addEventListener('click', () => {
  deleteRow();
});
  refreshBtn.onclick = () => loadTable(TARGET_TABLE, true, 'Order filters');
  function openStatusConfirm(statusValue){
  pendingStatusUpdate = statusValue;
  if(statusConfirmMessage){
    statusConfirmMessage.textContent = 'Do you want to update location ?';
  }
  if(statusConfirmModal){
    statusConfirmModal.classList.remove('hidden', 'pointer-events-none');
    statusConfirmModal.classList.add('hs-overlay-open');
    statusConfirmModal.setAttribute('aria-hidden','false');
  }
  // Store the toggle element that triggered this
  const toggle = statusButtonsSection?.querySelector(`[data-status-value="${statusValue}"]`);
  if(toggle){
    pendingStatusUpdateToggle = toggle;
  }
}
  function closeStatusConfirm(){
  // Uncheck toggle if user cancelled
  if(pendingStatusUpdateToggle && pendingStatusUpdateToggle.checked){
    pendingStatusUpdateToggle.checked = false;
  }
  pendingStatusUpdate = null;
  pendingStatusUpdateToggle = null;
  if(statusConfirmModal){
    statusConfirmModal.classList.add('hidden', 'pointer-events-none');
    statusConfirmModal.classList.remove('hs-overlay-open');
    statusConfirmModal.setAttribute('aria-hidden','true');
  }
}
  function openSendToHtxConfirm(){
  if(statusConfirmMessage){
    statusConfirmMessage.textContent = 'Are you sure you want to send driver and vehicle details to Holiday Taxis?';
  }
  if(statusConfirmModal){
    statusConfirmModal.classList.remove('hidden', 'pointer-events-none');
    statusConfirmModal.classList.add('hs-overlay-open');
    statusConfirmModal.setAttribute('aria-hidden','false');
  }
  // Store a flag to indicate this is for Send to HTX
  pendingStatusUpdate = 'SEND_TO_HTX';
}
  function openChangeCarConfirm(){
  if(statusConfirmMessage){
    statusConfirmMessage.textContent = 'Are you sure you want to de-allocate the vehicle and driver from this booking?';
  }
  if(statusConfirmModal){
    statusConfirmModal.classList.remove('hidden', 'pointer-events-none');
    statusConfirmModal.classList.add('hs-overlay-open');
    statusConfirmModal.setAttribute('aria-hidden','false');
  }
  // Store a flag to indicate this is for Change Car (de-allocation)
  pendingStatusUpdate = 'CHANGE_CAR';
}
  function closeSendToHtxConfirm(){
  if(pendingStatusUpdate === 'SEND_TO_HTX'){
    pendingStatusUpdate = null;
  }
  if(statusConfirmModal){
    statusConfirmModal.classList.add('hidden', 'pointer-events-none');
    statusConfirmModal.classList.remove('hs-overlay-open');
    statusConfirmModal.setAttribute('aria-hidden','true');
  }
}
  function closeChangeCarConfirm(){
  if(pendingStatusUpdate === 'CHANGE_CAR'){
    pendingStatusUpdate = null;
  }
  if(statusConfirmModal){
    statusConfirmModal.classList.add('hidden', 'pointer-events-none');
    statusConfirmModal.classList.remove('hs-overlay-open');
    statusConfirmModal.setAttribute('aria-hidden','true');
  }
}
  function formatPhoneNumber(phone){
  if(!phone) return '';
  let formatted = String(phone).trim();
  // Remove any existing + sign and spaces
  formatted = formatted.replace(/^\+/, '').replace(/\s+/g, '');
  // Add + prefix if not empty
  if(formatted) {
    formatted = '+' + formatted;
  }
  return formatted;
}
  async function sendToHtx(){
  if(!currentRow || !currentTable){
    closeSendToHtxConfirm();
    return;
  }
    try {
    // Find required fields using findColumnByName
    const bookingRefCol = findColumnByName(currentRow, 'Reference No.');
    const vehicleIdCol = findColumnByName(currentRow, 'car_id');
    const picNameCol = findColumnByName(currentRow, 'pic_name');
    const driverLicenseCol = findColumnByName(currentRow, 'driver_license');
    const picContactCol = findColumnByName(currentRow, 'pic_contact');
    const carBrandCol = findColumnByName(currentRow, 'car_brand');
    const colorVehicleCol = findColumnByName(currentRow, 'color_vehicle');
    const platMobilCol = findColumnByName(currentRow, 'plat_mobil');
      // Validate required fields
    if(!bookingRefCol){
      alert('Reference No. field not found in the row.');
      closeSendToHtxConfirm();
      return;
    }
    if(!vehicleIdCol){
      alert('car_id field not found in the row.');
      closeSendToHtxConfirm();
      return;
    }
      const bookingRef = currentRow[bookingRefCol];
    const vehicleIdentifier = currentRow[vehicleIdCol];
      if(!bookingRef || !vehicleIdentifier){
      alert('Reference No. and car_id are required to send to Holiday Taxis.');
      closeSendToHtxConfirm();
      return;
    }
      // Build request body
    const driver = {
      name: picNameCol ? (currentRow[picNameCol] || '') : '',
      licenseNumber: driverLicenseCol ? (currentRow[driverLicenseCol] || '') : '',
      phoneNumber: picContactCol ? formatPhoneNumber(currentRow[picContactCol]) : '',
      preferredContactMethod: 'WHATSAPP',
      contactMethods: ['VOICE', 'SMS', 'WHATSAPP']
    };
      const vehicle = {
      brand: carBrandCol ? (currentRow[carBrandCol] || '') : '',
      color: colorVehicleCol ? (currentRow[colorVehicleCol] || '') : '',
      registration: platMobilCol ? (currentRow[platMobilCol] || '') : ''
    };
      // Show loading state
    statusEl.textContent = 'Sending to Holiday Taxis...';
      // Call backend endpoint
    const res = await fetch(
      API_BASE + '/api/holiday-taxis/bookings/' + encodeURIComponent(bookingRef) + '/vehicles/' + encodeURIComponent(vehicleIdentifier),
      {
        method: 'PUT',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ driver, vehicle })
      }
    );
      const responseText = await res.text();
    let responseData;
    try {
      responseData = responseText ? JSON.parse(responseText) : {};
    } catch {
      responseData = { error: responseText || 'Unknown error' };
    }
      if(!res.ok){
      const errorMsg = responseData.error || responseData.details || `HTTP ${res.status}`;
      alert('Failed to send to Holiday Taxis: ' + errorMsg);
      statusEl.textContent = '';
      closeSendToHtxConfirm();
      return;
    }
      // Success
    statusEl.textContent = 'Successfully sent to Holiday Taxis!';
    setTimeout(() => {
      if(statusEl.textContent === 'Successfully sent to Holiday Taxis!'){
        statusEl.textContent = '';
      }
    }, 2000);
    showToast('Driver and vehicle details sent to Holiday Taxis');
    closeSendToHtxConfirm();
    } catch(err) {
    alert('Error sending to Holiday Taxis: ' + err.message);
    statusEl.textContent = '';
    closeSendToHtxConfirm();
  }
}
  async function changeCar(){
  if(!currentRow || !currentTable){
    closeChangeCarConfirm();
    return;
  }
    try {
    // Find required fields using findColumnByName
    const bookingRefCol = findColumnByName(currentRow, 'Reference No.');
    const vehicleIdCol = findColumnByName(currentRow, 'car_id');
      // Validate required fields
    if(!bookingRefCol){
      alert('Reference No. field not found in the row.');
      closeChangeCarConfirm();
      return;
    }
    if(!vehicleIdCol){
      alert('car_id field not found in the row.');
      closeChangeCarConfirm();
      return;
    }
      const bookingRef = currentRow[bookingRefCol];
    const vehicleIdentifier = currentRow[vehicleIdCol];
      if(!bookingRef || !vehicleIdentifier){
      alert('Reference No. and car_id are required to de-allocate from Holiday Taxis.');
      closeChangeCarConfirm();
      return;
    }
      // Show loading state
    statusEl.textContent = 'De-allocating vehicle and driver...';
      // Call backend endpoint
    const res = await fetch(
      API_BASE + '/api/holiday-taxis/bookings/' + encodeURIComponent(bookingRef) + '/vehicles/' + encodeURIComponent(vehicleIdentifier),
      {
        method: 'DELETE',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' })
      }
    );
      const responseText = await res.text();
    let responseData;
    try {
      responseData = responseText ? JSON.parse(responseText) : {};
    } catch {
      responseData = { error: responseText || 'Unknown error' };
    }
      if(!res.ok){
      const errorMsg = responseData.error || responseData.details || `HTTP ${res.status}`;
      alert('Failed to de-allocate from Holiday Taxis: ' + errorMsg);
      statusEl.textContent = '';
      closeChangeCarConfirm();
      return;
    }
      // Success
    statusEl.textContent = 'Successfully de-allocated vehicle and driver!';
    setTimeout(() => {
      if(statusEl.textContent === 'Successfully de-allocated vehicle and driver!'){
        statusEl.textContent = '';
      }
    }, 2000);
    showToast('Vehicle and driver de-allocated from Holiday Taxis');
    closeChangeCarConfirm();
    } catch(err) {
    alert('Error de-allocating from Holiday Taxis: ' + err.message);
    statusEl.textContent = '';
    closeChangeCarConfirm();
  }
}
  function showToast(message){
  if(!toastEl) return;
  toastEl.textContent = message;
  toastEl.classList.add('show');
  setTimeout(() => {
    toastEl.classList.remove('show');
  }, 2500);
}
  function formatLatlong(coords){
  if(!coords) return null;
  const lat = Number(coords.latitude);
  const lon = Number(coords.longitude);
  if(!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
  return `${lat.toFixed(6)}, ${lon.toFixed(6)}`;
}
  function parseLatlong(latlongStr){
  if(!latlongStr) return null;
  const str = String(latlongStr).trim();
  const parts = str.split(',').map(s => s.trim());
  if(parts.length !== 2) return null;
  const lat = Number(parts[0]);
  const lng = Number(parts[1]);
  if(!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return { lat, lng };
}
  function formatTimestampUTC(){
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, '0');
  const day = String(now.getUTCDate()).padStart(2, '0');
  const hours = String(now.getUTCHours()).padStart(2, '0');
  const minutes = String(now.getUTCMinutes()).padStart(2, '0');
  const seconds = String(now.getUTCSeconds()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}+00:00`;
}
  let locationUpdateInterval = null;
let currentTrackingRow = null;
let currentTrackingStatus = null;
  function stopLocationTracking(){
  if(locationUpdateInterval){
    clearInterval(locationUpdateInterval);
    locationUpdateInterval = null;
  }
  currentTrackingRow = null;
  currentTrackingStatus = null;
  // Update GPS status indicator
  updateGPSStatus(false);
  console.log('Location tracking stopped');
}
  async function sendLocationToHtx(row, status = null){
  if(!row) return false;
  
  try {
    const bookingRefCol = findColumnByName(row, 'Reference No.');
    const vehicleIdCol = findColumnByName(row, 'car_id');
    const latlongCol = findColumnByName(row, 'Latlong');
    const pickupStatusCol = findColumnByName(row, 'Pickup Status');
      if(!bookingRefCol || !vehicleIdCol){
      console.warn('Missing bookingRef or vehicleId for location update');
      return false;
    }
      const bookingRef = row[bookingRefCol];
    const vehicleIdentifier = row[vehicleIdCol];
    
    if(!bookingRef || !vehicleIdentifier){
      console.warn('Empty bookingRef or vehicleIdentifier for location update');
      return false;
    }
      // Get location from Latlong field
    let location = null;
    if(latlongCol && row[latlongCol]){
      location = parseLatlong(row[latlongCol]);
    }
      // If no location in database, try to get current GPS location
    if(!location){
      const { coords, error, accuracy } = await requestCurrentPosition();
      if(coords){
        location = { lat: coords.latitude, lng: coords.longitude };
        // Log accuracy for monitoring
        if(accuracy){
          console.log(`Location update accuracy: ${Math.round(accuracy)} meters`);
        }
      } else {
        console.warn('No location available for update', error);
        if(error && error.message){
          showToast(error.message);
        }
        return false;
      }
    }
      // Get status from Pickup Status field if not provided
    let statusValue = status;
    if(!statusValue && pickupStatusCol){
      statusValue = row[pickupStatusCol];
    }
      const timestamp = formatTimestampUTC();
    const requestBody = {
      timestamp,
      location: {
        lat: location.lat,
        lng: location.lng
      }
    };
    if(statusValue){
      requestBody.status = statusValue;
    }
      const res = await fetch(
      API_BASE + '/api/holiday-taxis/bookings/' + encodeURIComponent(bookingRef) + '/vehicles/' + encodeURIComponent(vehicleIdentifier) + '/location',
      {
        method: 'POST',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(requestBody)
      }
    );
      if(!res.ok){
      const responseText = await res.text();
      let responseData;
      try {
        responseData = responseText ? JSON.parse(responseText) : {};
      } catch {
        responseData = { error: responseText || 'Unknown error' };
      }
      console.error('Failed to send location to Holiday Taxis:', responseData.error || responseData.details || `HTTP ${res.status}`);
      return false;
    }
      return true;
  } catch(err) {
    console.error('Error sending location to Holiday Taxis:', err);
    return false;
  }
}
  async function sendLocationToHtxPeriodic(row){
  // For periodic updates, don't include status in the body (only timestamp and location)
  // This function: 1. Gets latest GPS from browser, 2. Updates database, 3. Sends to Holiday Taxis
  if(!row || !currentTable) return false;
  
  try {
    const bookingRefCol = findColumnByName(row, 'Reference No.');
    const vehicleIdCol = findColumnByName(row, 'car_id');
    const latlongCol = findColumnByName(row, 'Latlong');
      if(!bookingRefCol || !vehicleIdCol){
      return false;
    }
      const bookingRef = row[bookingRefCol];
    const vehicleIdentifier = row[vehicleIdCol];
    
    if(!bookingRef || !vehicleIdentifier){
      return false;
    }
      // Step 1: Get latest GPS location from browser
    const { coords, error, accuracy } = await requestCurrentPosition();
    if(!coords || error){
      console.warn('Failed to get GPS location for periodic update:', error);
      // Update GPS status indicator
      updateGPSStatus(false, null, error?.message);
      // Don't stop tracking, will retry on next interval
      return false;
    }
    
    // Validate accuracy (should already be validated in requestCurrentPosition, but double-check)
    if(accuracy && accuracy > GPS_ACCURACY_THRESHOLD){
      console.warn(`Periodic update: GPS accuracy too poor (${Math.round(accuracy)}m), skipping this update`);
      updateGPSStatus(true, accuracy, `Poor accuracy (${Math.round(accuracy)}m)`);
      return false; // Skip this update, will retry next interval
    }
    
    const location = { lat: coords.latitude, lng: coords.longitude };
    const latlongValue = formatLatlong(coords); // Format as "lat, lng"
    
    // Update GPS status indicator with good accuracy
    updateGPSStatus(true, accuracy);
      // Step 2: Update "Latlong" field in database
    if(latlongCol){
      try {
        await ensureMeta(currentTable);
        const pkCols = currentMeta?.primaryKey || [];
        if(pkCols.length > 0){
          const key = {};
          pkCols.forEach(col => { key[col] = row[col]; });
          const payloadData = { [latlongCol]: latlongValue };
          const payload = { key, data: payloadData };
            const updateRes = await fetch(API_BASE + '/api/tables/' + encodeURIComponent(currentTable), {
            method: 'PUT',
            headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
            body: JSON.stringify(payload)
          });
            if(updateRes.ok){
            const updateResult = await updateRes.json();
            if(updateResult.updated){
              // Update the row object with new latlong value
              row[latlongCol] = latlongValue;
              // Also update in originalRows if it exists
              if(Array.isArray(originalRows)){
                const matchIndex = originalRows.findIndex(r => pkCols.every(col => r[col] === row[col]));
                if(matchIndex !== -1){
                  originalRows[matchIndex][latlongCol] = latlongValue;
                }
              }
              console.log('Updated Latlong field in database:', latlongValue);
            }
          } else {
            console.warn('Failed to update Latlong field in database');
          }
        }
      } catch(updateErr) {
        console.error('Error updating Latlong field:', updateErr);
        // Continue to send to Holiday Taxis even if DB update fails
      }
    }
      // Step 3: Send latest location to Holiday Taxis
    const timestamp = formatTimestampUTC();
    const requestBody = {
      timestamp,
      location: {
        lat: location.lat,
        lng: location.lng
      }
    };
      const res = await fetch(
      API_BASE + '/api/holiday-taxis/bookings/' + encodeURIComponent(bookingRef) + '/vehicles/' + encodeURIComponent(vehicleIdentifier) + '/location',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      }
    );
      if(!res.ok){
      const responseText = await res.text();
      console.error('Failed to send periodic location to Holiday Taxis:', responseText);
      return false;
    }
      console.log(`Sent periodic location to Holiday Taxis: ${location.lat}, ${location.lng} (accuracy: ${accuracy ? Math.round(accuracy) + 'm' : 'unknown'})`);
    return true;
  } catch(err) {
    console.error('Error in periodic location update:', err);
    return false;
  }
}
  function startLocationTracking(row, status){
  // Stop any existing tracking
  stopLocationTracking();
    if(!row || !status) return;
    // Determine interval based on status
  let intervalMs = null;
  if(status === 'BEFORE_PICKUP'){
    intervalMs = 3 * 60 * 1000; // 3 minutes (180 seconds)
  } else if(status === 'AFTER_PICKUP'){
    intervalMs = 5 * 60 * 1000; // 5 minutes (300 seconds)
  } else {
    // WAITING_FOR_CUSTOMER or COMPLETED - don't track
    return;
  }
    currentTrackingRow = row;
  currentTrackingStatus = status;
    // Send initial location with status (when button is clicked)
  sendLocationToHtx(row, status);
    // Set up periodic updates (without status in body)
  locationUpdateInterval = setInterval(async () => {
    if(currentTrackingRow && currentTrackingStatus){
      await sendLocationToHtxPeriodic(currentTrackingRow);
    }
  }, intervalMs);
    console.log(`Started location tracking for status ${status} with interval ${intervalMs}ms`);
  // Update GPS status indicator
  updateGPSStatus(true, null, 'Starting GPS tracking...');
}
  // GPS accuracy threshold (in meters)
  // Reject readings with accuracy > 100 meters (too inaccurate for vehicle tracking)
  const GPS_ACCURACY_THRESHOLD = 100;
  
  function requestCurrentPosition(){
  return new Promise((resolve) => {
    if(!('geolocation' in navigator)){
      resolve({ coords: null, error: { code: 0, message: 'Geolocation not supported on this device' } });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const accuracy = position.coords.accuracy || 0;
        // Validate accuracy - reject if too poor
        if(accuracy > GPS_ACCURACY_THRESHOLD){
          console.warn(`GPS accuracy too poor: ${Math.round(accuracy)} meters (threshold: ${GPS_ACCURACY_THRESHOLD}m)`);
          resolve({ 
            coords: null, 
            error: { 
              code: 4, 
              message: `GPS accuracy too poor (${Math.round(accuracy)}m). Please try again in an area with better GPS signal.`,
              accuracy: accuracy
            } 
          });
          return;
        }
        // Log accuracy for monitoring
        console.log(`GPS location obtained with accuracy: ${Math.round(accuracy)} meters`);
        resolve({ coords: position.coords, error: null, accuracy: accuracy });
      },
      (error) => {
        // Map error codes to user-friendly messages
        let errorMessage = 'Unknown GPS error';
        switch(error.code){
          case 1: // PERMISSION_DENIED
            errorMessage = 'GPS permission denied. Please enable GPS permission in your browser settings to use location tracking.';
            break;
          case 2: // POSITION_UNAVAILABLE
            errorMessage = 'GPS signal not available. Please try again in an open area with better GPS signal.';
            break;
          case 3: // TIMEOUT
            errorMessage = 'GPS request timed out. Please try again.';
            break;
          default:
            errorMessage = error.message || 'Unable to get GPS location. Please check your GPS settings.';
        }
        resolve({ coords: null, error: { code: error.code, message: errorMessage } });
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  });
}
  // GPS Status Indicator Functions
  function updateGPSStatus(isActive, accuracy = null, message = null){
  const statusEl = document.getElementById('gps-status');
  if(!statusEl) return;
  
  if(isActive){
    if(accuracy !== null && accuracy !== undefined){
      const accuracyMeters = Math.round(accuracy);
      let statusText = `GPS Active (${accuracyMeters}m)`;
      let statusClass = 'gps-status active';
      
      // Color code based on accuracy
      if(accuracyMeters <= 20){
        statusClass += ' good'; // Green - excellent accuracy
      } else if(accuracyMeters <= 50){
        statusClass += ' medium'; // Yellow - good accuracy
      } else if(accuracyMeters <= 100){
        statusClass += ' poor'; // Orange - acceptable but poor
      } else {
        statusClass += ' very-poor'; // Red - too poor
      }
      
      statusEl.textContent = statusText;
      statusEl.className = statusClass;
    } else if(message){
      statusEl.textContent = message;
      statusEl.className = 'gps-status active';
    } else {
      statusEl.textContent = 'GPS Active';
      statusEl.className = 'gps-status active';
    }
  } else {
    if(message){
      statusEl.textContent = message;
    } else {
      statusEl.textContent = 'GPS Inactive';
    }
    statusEl.className = 'gps-status inactive';
  }
}
  
  // Stop GPS tracking when page unloads or becomes hidden
  window.addEventListener('beforeunload', () => {
    stopLocationTracking();
  });
  
  // Stop GPS tracking when page becomes hidden (tab switch, minimize, etc.)
  document.addEventListener('visibilitychange', () => {
    if(document.hidden){
      // Page is hidden - optionally stop tracking to save battery
      // Commented out: keep tracking even when hidden (user might switch tabs)
      // stopLocationTracking();
    }
  });
  
  // Stop GPS tracking when page is being unloaded
  window.addEventListener('pagehide', () => {
    stopLocationTracking();
  });
  
  async function applyStatusUpdate(statusValue, latlongValue){
  if(!statusValue || !currentRow || !currentTable){
    closeStatusConfirm();
    return;
  }
  try{
    await ensureMeta(currentTable);
    const pickupCol = findColumnByName(currentRow, 'Pickup Status');
    const latlongCol = findColumnByName(currentRow, 'Latlong');
    if(!pickupCol){
      alert('Pickup Status column not found.');
      closeStatusConfirm();
      return;
    }
    const pkCols = currentMeta?.primaryKey || [];
    if(pkCols.length === 0){
      alert('Cannot update: table has no primary key.');
      closeStatusConfirm();
      return;
    }
    const key = {};
    pkCols.forEach(col => { key[col] = currentRow[col]; });
    const payloadData = { [pickupCol]: statusValue };
    if(latlongCol && latlongValue){
      payloadData[latlongCol] = latlongValue;
    }
    const payload = { key, data: payloadData };
    statusEl.textContent = 'Saving...';
    const res = await fetch(API_BASE + '/api/tables/' + encodeURIComponent(currentTable), {
      method:'PUT',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(payload)
    });
    if(!res.ok){
      const errorText = await res.text();
      let errorMessage = 'Update failed';
      try{
        const parsed = JSON.parse(errorText);
        errorMessage = parsed.error || errorMessage;
      }catch{
        if(errorText) errorMessage = errorText;
      }
      alert(errorMessage);
      statusEl.textContent = '';
      closeStatusConfirm();
      return;
    }
    const result = await res.json();
    if(result.updated){
      currentRow[pickupCol] = statusValue;
      if(latlongCol && latlongValue){
        currentRow[latlongCol] = latlongValue;
      }
      await renderDetails(currentRow);
      // Update toggle states after status update
      updateToggleStates(statusValue);
      // Update stopwatch based on new status
      handleStopwatchStatusChange(statusValue);
      if(Array.isArray(originalRows)){
        const matchIndex = originalRows.findIndex(row => pkCols.every(col => row[col] === currentRow[col]));
        if(matchIndex !== -1){
          originalRows[matchIndex][pickupCol] = statusValue;
          if(latlongCol && latlongValue){
            originalRows[matchIndex][latlongCol] = latlongValue;
          }
        }
      }
      applyFilters();
      
      // Send location to Holiday Taxis when status changes
      const bookingRefCol = findColumnByName(currentRow, 'Reference No.');
      const vehicleIdCol = findColumnByName(currentRow, 'car_id');
      if(bookingRefCol && vehicleIdCol && currentRow[bookingRefCol] && currentRow[vehicleIdCol]){
        // Send location update with status
        sendLocationToHtx(currentRow, statusValue).catch(err => {
          console.error('Failed to send location to Holiday Taxis:', err);
        });
      }
        // Manage automatic location tracking based on status
      if(statusValue === 'BEFORE_PICKUP'){
        startLocationTracking(currentRow, 'BEFORE_PICKUP');
      } else if(statusValue === 'WAITING_FOR_CUSTOMER'){
        stopLocationTracking();
      } else if(statusValue === 'AFTER_PICKUP'){
        startLocationTracking(currentRow, 'AFTER_PICKUP');
      } else if(statusValue === 'COMPLETED'){
        stopLocationTracking();
      }
        statusEl.textContent = latlongCol && latlongValue ? 'Pickup status & location updated!' : 'Pickup status updated!';
      setTimeout(() => {
        if(statusEl.textContent === 'Pickup status updated!' || statusEl.textContent === 'Pickup status & location updated!'){
          statusEl.textContent = '';
        }
      }, 2000);
    showToast(latlongCol && latlongValue ? 'Pickup status & location updated' : 'Pickup status updated');
    } else {
      alert('Update did not affect any rows.');
      statusEl.textContent = '';
    }
  }catch(err){
    alert('Save error: ' + err.message);
    statusEl.textContent = '';
  }finally{
    closeStatusConfirm();
  }
}
  async function loadTable(tableName, showFilters = false, filterTitle = 'Order filters'){
  currentTable = tableName;
  try { await ensureMeta(tableName); } catch(e) { /* non-fatal */ }
  await loadRows(tableName);
  // Show or hide filters based on the table
  if(showFilters){
    if(filtersTitle) filtersTitle.textContent = filterTitle;
    filtersCard.style.display = 'block';
    
    const isOperasionalServices = normalize(tableName) === normalize(TARGET_TABLE);
    const isServicesTable = normalize(tableName) === 'services';
    const isPendingsTable = normalize(tableName) === 'pendings';
    
    if(checkboxFiltersContainer){
      // Show checkbox container for tables that need filters
      checkboxFiltersContainer.style.display = (isOperasionalServices || isServicesTable || isPendingsTable) ? 'flex' : 'none';
      
      // Show/hide specific checkboxes based on table
      const checkbox48HoursLabel = document.getElementById('checkbox-48-hours-label');
      const checkbox7DaysLabel = document.getElementById('checkbox-7-days-label');
      const checkboxPconLabel = document.getElementById('checkbox-pcon-label');
      const checkboxPammLabel = document.getElementById('checkbox-pamm-label');
      const checkboxPcanLabel = document.getElementById('checkbox-pcan-label');
      
      if(checkbox48HoursLabel) checkbox48HoursLabel.style.display = (isOperasionalServices || isServicesTable) ? 'flex' : 'none';
      if(checkbox7DaysLabel) checkbox7DaysLabel.style.display = (isOperasionalServices || isServicesTable) ? 'flex' : 'none';
      if(checkboxPconLabel) checkboxPconLabel.style.display = isPendingsTable ? 'flex' : 'none';
      if(checkboxPammLabel) checkboxPammLabel.style.display = isPendingsTable ? 'flex' : 'none';
      if(checkboxPcanLabel) checkboxPcanLabel.style.display = isPendingsTable ? 'flex' : 'none';
    }
  } else {
    filtersCard.style.display = 'none';
  }
}
  function renderDatabaseConfig(){
  const keys = Object.keys(dbConfig);
  const html = keys.map(k => {
    const v = dbConfig[k];
    if(dbEditMode){
      const inputType = k === 'DB_PASSWORD' ? 'password' : 'text';
      return `<div class="kv"><div class="muted">${escapeHtml(k)}</div><div><input data-field="${escapeHtml(k)}" value="${escapeHtml(v)}" type="${inputType}" style="width:100%" /></div></div>`;
    } else {
      const display = k === 'DB_PASSWORD' ? '••••••••' : String(v);
      return `<div class="kv"><div class="muted">${escapeHtml(k)}</div><div>${escapeHtml(display)}</div></div>`;
    }
  }).join('');
  databaseContent.innerHTML = html || '<div class="muted">No config</div>';
}
  function showDatabaseConfig(){
  // Close drawer if open
  appDrawer?.classList.remove('open');
  appDrawer?.setAttribute('aria-hidden','true');
  
  dbEditMode = false;
  dbEdit.style.display = '';
  dbSave.style.display = 'none';
  dbCancel.style.display = 'none';
  renderDatabaseConfig();
  databaseModal.classList.remove('hidden', 'pointer-events-none');
  databaseModal.classList.add('hs-overlay-open');
  databaseModal.setAttribute('aria-hidden','false');
}
  dbClose?.addEventListener('click', () => {
  databaseModal.classList.add('hidden', 'pointer-events-none');
  databaseModal.classList.remove('hs-overlay-open');
  databaseModal.setAttribute('aria-hidden','true');
});
databaseModal?.addEventListener('click', (e) => {
  if(e.target === databaseModal){
    databaseModal.classList.add('hidden', 'pointer-events-none');
  databaseModal.classList.remove('hs-overlay-open');
    databaseModal.setAttribute('aria-hidden','true');
  }
});
dbEdit?.addEventListener('click', () => {
  // Prevent edit if user is Driver or Guide
  if(authUser && (authUser.role === 'driver' || authUser.role === 'guide')){
    alert('You do not have permission to edit database configuration.');
    return;
  }
  
  dbEditMode = true;
  dbEdit.style.display = 'none';
  dbSave.style.display = '';
  dbCancel.style.display = '';
  renderDatabaseConfig();
});
dbCancel?.addEventListener('click', () => {
  dbEditMode = false;
  dbEdit.style.display = '';
  dbSave.style.display = 'none';
  dbCancel.style.display = 'none';
  renderDatabaseConfig();
});
dbSave?.addEventListener('click', () => {
  const inputs = databaseContent.querySelectorAll('input[data-field]');
  inputs.forEach(inp => { const field = inp.getAttribute('data-field'); dbConfig[field] = inp.value; });
  alert('Database configuration saved locally. Note: This does not update the server config.');
  dbEditMode = false;
  dbEdit.style.display = '';
  dbSave.style.display = 'none';
  dbCancel.style.display = 'none';
  renderDatabaseConfig();
});
  document.getElementById('btn-database')?.addEventListener('click', showDatabaseConfig);
  function renderApiConfig(){
  if(!apiContent) return;
  const rows = [
    { key: 'endpoint', label: 'Endpoint URL', type: 'text' },
    { key: 'apiKey', label: 'API Key', type: 'password' },
    { key: 'apiVersion', label: 'API Version', type: 'text' }
  ];
  const html = rows.map(row => {
    const value = holidayApiConfig[row.key] ?? '';
    if(apiEditMode){
      return `<div class="kv"><div class="muted">${escapeHtml(row.label)}</div><div><input data-field="${escapeHtml(row.key)}" value="${escapeHtml(value)}" type="${row.type}" style="width:100%" /></div></div>`;
    }
    const display = row.key === 'apiKey' && value ? '••••••••' : String(value || '');
    return `<div class="kv"><div class="muted">${escapeHtml(row.label)}</div><div>${escapeHtml(display)}</div></div>`;
  }).join('');
  apiContent.innerHTML = html || '<div class="muted">No config</div>';
}
  async function loadHolidayApiConfig(){
  try {
    const res = await fetch(API_BASE + '/api/holiday-taxis/config');
    if(res.ok){
      const data = await res.json();
      holidayApiConfig = { ...holidayApiConfig, ...data };
    }
  } catch (err) {
    console.error('Failed to load Holiday Taxis config', err);
  }
}
  async function showApiConfig(){
  // Close drawer if open
  appDrawer?.classList.remove('open');
  appDrawer?.setAttribute('aria-hidden','true');
  apiEditMode = false;
  apiEdit.style.display = '';
  apiSave.style.display = 'none';
  apiCancel.style.display = 'none';
  await loadHolidayApiConfig();
  renderApiConfig();
  apiModal.classList.remove('hidden', 'pointer-events-none');
  apiModal.classList.add('hs-overlay-open');
  apiModal.setAttribute('aria-hidden','false');
}
  apiClose?.addEventListener('click', () => {
  apiModal.classList.add('hidden', 'pointer-events-none');
  apiModal.classList.remove('hs-overlay-open');
  apiModal.setAttribute('aria-hidden','true');
});
  apiModal?.addEventListener('click', (e) => {
  if(e.target === apiModal){
    apiModal.classList.add('hidden', 'pointer-events-none');
  apiModal.classList.remove('hs-overlay-open');
    apiModal.setAttribute('aria-hidden','true');
  }
});
  apiEdit?.addEventListener('click', () => {
  apiEditMode = true;
  apiEdit.style.display = 'none';
  apiSave.style.display = '';
  apiCancel.style.display = '';
  renderApiConfig();
});
  apiCancel?.addEventListener('click', () => {
  apiEditMode = false;
  apiEdit.style.display = '';
  apiSave.style.display = 'none';
  apiCancel.style.display = 'none';
  renderApiConfig();
});
  apiSave?.addEventListener('click', async () => {
  if(!apiContent) return;
  const inputs = apiContent.querySelectorAll('input[data-field]');
  const updated = { ...holidayApiConfig };
  inputs.forEach(inp => {
    const field = inp.getAttribute('data-field');
    updated[field] = inp.value.trim();
  });
  try {
    const res = await fetch(API_BASE + '/api/holiday-taxis/config', {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(updated)
    });
    if(!res.ok){
      const errorText = await res.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { error: `HTTP ${res.status}: ${errorText}` };
      }
      alert('Failed to save API config: ' + (errorData.error || 'Unknown error'));
      return;
    }
    const data = await res.json();
    holidayApiConfig = { ...holidayApiConfig, ...(data.config || updated) };
    apiEditMode = false;
    apiEdit.style.display = '';
    apiSave.style.display = 'none';
    apiCancel.style.display = 'none';
    renderApiConfig();
    showToast('API configuration saved');
  } catch(err) {
    alert('Save error: ' + err.message);
  }
});
  document.getElementById('btn-api-connection')?.addEventListener('click', () => {
  showApiConfig();
});
  document.getElementById('btn-logout')?.addEventListener('click', () => {
  appDrawer?.classList.remove('open');
  appDrawer?.setAttribute('aria-hidden','true');
  if(confirm('Are you sure you want to logout?')){
    logoutUser();
  }
});
  if('serviceWorker' in navigator){
  navigator.serviceWorker.register('/sw.js').catch(()=>{});
}
  // Toggle switch event listeners
  const statusToggles = statusButtonsSection?.querySelectorAll('.status-toggle-input');
  statusToggles?.forEach(toggle => {
    toggle.addEventListener('change', (event) => {
      event.preventDefault();
      if(!currentRow){
        alert('Please select a row before updating status.');
        toggle.checked = false;
        return;
      }
      const statusValue = toggle.getAttribute('data-status-value');
      if(statusValue && toggle.checked){
        // Check if this is the next sequential status
        if(!canActivateStatus(statusValue)){
          // If it's already checked (previous status), don't allow unchecking
          const currentStatus = getCurrentStatus(currentRow);
          const statusIndex = STATUS_ORDER.indexOf(statusValue);
          const currentIndex = currentStatus ? STATUS_ORDER.indexOf(currentStatus) : -1;
          if(statusIndex <= currentIndex){
            // This is a previous status, keep it checked
            toggle.checked = true;
            return;
          }
          toggle.checked = false;
          alert('Please activate statuses in sequence: Before Pickup → Waiting Customer → After Pickup → Completed');
          return;
        }
        openStatusConfirm(statusValue);
      } else if(statusValue && !toggle.checked){
        // Prevent unchecking previous statuses
        const currentStatus = getCurrentStatus(currentRow);
        const statusIndex = STATUS_ORDER.indexOf(statusValue);
        const currentIndex = currentStatus ? STATUS_ORDER.indexOf(currentStatus) : -1;
        if(statusIndex <= currentIndex && currentStatus !== 'COMPLETED'){
          // This is a previous status, keep it checked
          toggle.checked = true;
        }
      }
    });
  });
  const pendingButtons = pendingButtonsSection?.querySelectorAll('[data-pending-action]');
pendingButtons?.forEach(button => {
  button.addEventListener('click', (event) => {
    event.preventDefault();
    if(!currentRow){
      alert('Please select a row before performing action.');
      return;
    }
    const action = button.getAttribute('data-pending-action');
    if(action){
      openPendingConfirm(action);
    }
  });
});
  document.getElementById('btn-send-to-htx')?.addEventListener('click', (event) => {
  event.preventDefault();
  if(!currentRow){
    alert('Please select a row before sending to HTX.');
    return;
  }
  openSendToHtxConfirm();
});
  document.getElementById('btn-change-car')?.addEventListener('click', (event) => {
  event.preventDefault();
  if(!currentRow){
    alert('Please select a row before changing car.');
    return;
  }
  openChangeCarConfirm();
});
  function openPendingConfirm(action){
  pendingActionRequest = action;
  if(pendingConfirmMessage){
    pendingConfirmMessage.textContent = `Are you sure you want to apply "${action}" to this booking?`;
  }
  if(pendingConfirmModal){
    pendingConfirmModal.classList.remove('hidden', 'pointer-events-none');
    pendingConfirmModal.classList.add('hs-overlay-open');
    pendingConfirmModal.setAttribute('aria-hidden','false');
  }
}
  function closePendingConfirm(){
  pendingActionRequest = null;
  if(pendingConfirmModal){
    pendingConfirmModal.classList.add('hidden', 'pointer-events-none');
    pendingConfirmModal.classList.remove('hs-overlay-open');
    pendingConfirmModal.setAttribute('aria-hidden','true');
  }
}
  pendingConfirmYes?.addEventListener('click', () => {
  if(pendingActionRequest){
    handlePendingAction(pendingActionRequest);
  }
  closePendingConfirm();
});
  pendingConfirmNo?.addEventListener('click', () => {
  closePendingConfirm();
});
  pendingConfirmClose?.addEventListener('click', () => {
  closePendingConfirm();
});
  pendingConfirmModal?.addEventListener('click', (e) => {
  if(e.target === pendingConfirmModal){
    closePendingConfirm();
  }
});
  async function handlePendingAction(action){
  if(!currentRow || !currentTable) return;
  
  // Confirm action
  const actionNames = {
    'ACON': 'ACON',
    'AAMM': 'AAMM',
    'ACAN': 'ACAN',
    'ACTION4': 'Action 4'
  };
  const actionName = actionNames[action] || action;
  
  try {
    await ensureMeta(currentTable);
    const pkCols = currentMeta.primaryKey || [];
    if(pkCols.length === 0){
      alert('Cannot update: table has no primary key');
      return;
    }
    
    // Determine which column to update
    let statusCol = null;
    const isPendingsTable = normalize(currentTable) === 'pendings';
    if(isPendingsTable){
      statusCol = findColumnByName(currentRow, 'StatusCode');
    }
    if(!statusCol){
      statusCol = findColumnByName(currentRow, 'Status') || findColumnByName(currentRow, 'Action Status') || findColumnByName(currentRow, 'Pending Status');
    }
    
    const key = {};
    for(const c of pkCols){ key[c] = currentRow[c]; }
    
    const data = {};
    if(statusCol){
      data[statusCol] = action;
    } else {
      // If no status column found, show warning
      alert('Status column not found. Please check your table structure.');
      return;
    }
    
    statusEl.textContent = `Updating ${actionName}...`;
    const apiUrl = API_BASE + '/api/tables/' + encodeURIComponent(currentTable);
    console.log('Updating pending action:', apiUrl, { key, data });
    
    const res = await fetch(apiUrl, {
      method: 'PUT',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ key, data })
    });
    
    if(!res.ok){
      const errorText = await res.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { error: `HTTP ${res.status}: ${errorText}` };
      }
      alert('Update failed: ' + (errorData.error || 'Unknown error') + (errorData.details ? '\nDetails: ' + errorData.details : ''));
      console.error('Update error:', res.status, errorData);
      statusEl.textContent = '';
      return;
    }
    
    const result = await res.json();
    if(result.updated){
      statusEl.textContent = `${actionName} action completed successfully!`;
      // Update local row data so the modal reflects the new value immediately
      if(statusCol){
        currentRow[statusCol] = action;
        await renderDetails(currentRow);
      }
      if(isPendingsTable && action !== 'ACTION4'){
        await syncHolidayStatus(action);
      }
      // Refresh rows and update current row
      await loadRows(currentTable);
      setTimeout(() => { statusEl.textContent = ''; }, 2000);
      showToast(`${actionName} updated successfully`);
    } else {
      alert('Update did not affect any rows. The record may have been deleted.');
      statusEl.textContent = '';
    }
  } catch(err) {
    alert('Action error: ' + err.message);
    statusEl.textContent = '';
  }
}
  async function syncHolidayStatus(action){
  if(!currentRow) return;
  const bookingRefCol = findColumnByName(currentRow, 'SUPP_REF');
  if(!bookingRefCol){
    console.warn('SUPP_REF column not found, skipping Holiday Taxis sync');
    return;
  }
  const bookingRef = currentRow[bookingRefCol];
  if(!bookingRef){
    console.warn('SUPP_REF value missing, skipping Holiday Taxis sync');
    return;
  }
  try {
    const url = API_BASE + '/api/holiday-taxis/bookings/' + encodeURIComponent(bookingRef) + '/status';
    const res = await fetch(url, {
      method: 'PUT',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ status: action })
    });
    if(!res.ok){
      const errorText = await res.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { error: `HTTP ${res.status}: ${errorText}` };
      }
      alert('Holiday Taxis update failed: ' + (errorData.error || 'Unknown error') + (errorData.details ? '\nDetails: ' + errorData.details : ''));
      console.error('Holiday Taxis update error:', res.status, errorData);
      return;
    }
    await res.json().catch(() => ({}));
    showToast('Holiday Taxis updated');
  } catch(err) {
    alert('Holiday Taxis update error: ' + err.message);
  }
}
  function setStatusConfirmDisabled(disabled){
  if(statusConfirmYes) statusConfirmYes.disabled = disabled;
  if(statusConfirmNo) statusConfirmNo.disabled = disabled;
  if(statusConfirmClose) statusConfirmClose.disabled = disabled;
}
  statusConfirmYes?.addEventListener('click', async () => {
  if(pendingStatusUpdate === 'SEND_TO_HTX'){
    await sendToHtx();
    return;
  }
  if(pendingStatusUpdate === 'CHANGE_CAR'){
    await changeCar();
    return;
  }
  if(!pendingStatusUpdate){
    closeStatusConfirm();
    return;
  }
  setStatusConfirmDisabled(true);
  let latlongValue = null;
  try{
    const { coords, error, accuracy } = await requestCurrentPosition();
    if(coords){
      latlongValue = formatLatlong(coords);
      // Update GPS status indicator
      updateGPSStatus(true, accuracy);
      if(accuracy){
        console.log(`Status update location accuracy: ${Math.round(accuracy)} meters`);
      }
    } else if(error){
      console.warn('Geolocation error:', error);
      // Show user-friendly error message
      const errorMessage = error.message || 'Unable to get current location. Pickup status will be updated without location.';
      showToast(errorMessage);
      // Update GPS status indicator
      updateGPSStatus(false, null, errorMessage);
    }
  }finally{
    setStatusConfirmDisabled(false);
  }
  applyStatusUpdate(pendingStatusUpdate, latlongValue);
});
statusConfirmNo?.addEventListener('click', () => {
  if(pendingStatusUpdate === 'SEND_TO_HTX'){
    closeSendToHtxConfirm();
  } else if(pendingStatusUpdate === 'CHANGE_CAR'){
    closeChangeCarConfirm();
  } else {
    closeStatusConfirm();
  }
});
statusConfirmClose?.addEventListener('click', () => {
  if(pendingStatusUpdate === 'SEND_TO_HTX'){
    closeSendToHtxConfirm();
  } else if(pendingStatusUpdate === 'CHANGE_CAR'){
    closeChangeCarConfirm();
  } else {
    closeStatusConfirm();
  }
});
statusConfirmModal?.addEventListener('click', (e) => {
  if(e.target === statusConfirmModal){
    if(pendingStatusUpdate === 'SEND_TO_HTX'){
      closeSendToHtxConfirm();
    } else if(pendingStatusUpdate === 'CHANGE_CAR'){
      closeChangeCarConfirm();
    } else {
      closeStatusConfirm();
    }
  }
});

// ========== TOGGLE AND STOPWATCH MANAGEMENT FUNCTIONS ==========

// Status order for sequential activation
const STATUS_ORDER = ['BEFORE_PICKUP', 'WAITING_FOR_CUSTOMER', 'AFTER_PICKUP', 'COMPLETED'];

// Get current status from row
function getCurrentStatus(row){
  if(!row) return null;
  const pickupCol = findColumnByName(row, 'Pickup Status');
  return pickupCol ? row[pickupCol] : null;
}

// Check if a status can be activated (must be next in sequence)
function canActivateStatus(targetStatus){
  if(!currentRow) return false;
  const currentStatus = getCurrentStatus(currentRow);
  if(!currentStatus){
    // No current status, only allow BEFORE_PICKUP
    return targetStatus === 'BEFORE_PICKUP';
  }
  const currentIndex = STATUS_ORDER.indexOf(currentStatus);
  const targetIndex = STATUS_ORDER.indexOf(targetStatus);
  // Can only activate next status in sequence
  return targetIndex === currentIndex + 1;
}

// Initialize toggle states based on current status
function initializeToggleStates(row){
  if(!statusButtonsSection) return;
  const currentStatus = getCurrentStatus(row);
  const toggles = statusButtonsSection.querySelectorAll('.status-toggle-input');
  
  toggles.forEach(toggle => {
    const statusValue = toggle.getAttribute('data-status-value');
    const statusIndex = STATUS_ORDER.indexOf(statusValue);
    const currentIndex = currentStatus ? STATUS_ORDER.indexOf(currentStatus) : -1;
    const wrapper = toggle.closest('.status-toggle-wrapper');
    const textEl = wrapper?.querySelector('.status-toggle-text');
    
    if(currentStatus === 'COMPLETED'){
      // All toggles red and disabled
      toggle.checked = true;
      toggle.disabled = true;
      if(textEl){
        textEl.style.color = '#dc2626';
        textEl.style.fontWeight = '600';
        textEl.style.opacity = '0.6';
      }
    } else if(currentIndex >= 0 && statusIndex <= currentIndex){
      // Previous/completed statuses: checked and enabled (red, can't be unchecked but can see they're active)
      toggle.checked = true;
      toggle.disabled = false; // Keep enabled so they stay red
      if(textEl){
        textEl.style.color = '#dc2626';
        textEl.style.fontWeight = '600';
        textEl.style.opacity = '1';
      }
    } else if(statusIndex === currentIndex + 1){
      // Next status: enabled (can be activated)
      toggle.checked = false;
      toggle.disabled = false;
      if(textEl){
        textEl.style.color = '#6b7280';
        textEl.style.fontWeight = 'normal';
        textEl.style.opacity = '1';
      }
    } else {
      // Future statuses: disabled (not yet available)
      toggle.checked = false;
      toggle.disabled = true;
      if(textEl){
        textEl.style.color = '#6b7280';
        textEl.style.fontWeight = 'normal';
        textEl.style.opacity = '0.6';
      }
    }
  });
}

// Update toggle states after status change
function updateToggleStates(newStatus){
  if(!statusButtonsSection) return;
  const toggles = statusButtonsSection.querySelectorAll('.status-toggle-input');
  const newIndex = STATUS_ORDER.indexOf(newStatus);
  
  toggles.forEach(toggle => {
    const statusValue = toggle.getAttribute('data-status-value');
    const statusIndex = STATUS_ORDER.indexOf(statusValue);
    const wrapper = toggle.closest('.status-toggle-wrapper');
    const textEl = wrapper?.querySelector('.status-toggle-text');
    
    if(newStatus === 'COMPLETED'){
      // All toggles red and disabled
      toggle.checked = true;
      toggle.disabled = true;
      if(textEl){
        textEl.style.color = '#dc2626';
        textEl.style.fontWeight = '600';
        textEl.style.opacity = '0.6';
      }
    } else if(statusIndex <= newIndex){
      // Previous/completed statuses: checked and enabled (red, stay active)
      toggle.checked = true;
      toggle.disabled = false; // Keep enabled so they stay red
      if(textEl){
        textEl.style.color = '#dc2626';
        textEl.style.fontWeight = '600';
        textEl.style.opacity = '1';
      }
    } else if(statusIndex === newIndex + 1){
      // Next status: enabled
      toggle.checked = false;
      toggle.disabled = false;
      if(textEl){
        textEl.style.color = '#6b7280';
        textEl.style.fontWeight = 'normal';
        textEl.style.opacity = '1';
      }
    } else {
      // Future statuses: disabled
      toggle.checked = false;
      toggle.disabled = true;
      if(textEl){
        textEl.style.color = '#6b7280';
        textEl.style.fontWeight = 'normal';
        textEl.style.opacity = '0.6';
      }
    }
  });
}

// Stopwatch functions
function updateStopwatchDisplay(){
  if(!stopwatchHoursEl || !stopwatchMinutesEl || !stopwatchSecondsEl) return;
  
  const totalSeconds = Math.floor(stopwatchElapsedTime / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  stopwatchHoursEl.textContent = String(hours).padStart(2, '0');
  stopwatchMinutesEl.textContent = String(minutes).padStart(2, '0');
  stopwatchSecondsEl.textContent = String(seconds).padStart(2, '0');
}

function startStopwatch(){
  if(stopwatchRunning) return;
  stopwatchRunning = true;
  if(!stopwatchStartTime){
    stopwatchStartTime = Date.now() - stopwatchElapsedTime;
  } else {
    // Resume: adjust start time to account for elapsed time
    stopwatchStartTime = Date.now() - stopwatchElapsedTime;
  }
  
  stopwatchInterval = setInterval(() => {
    stopwatchElapsedTime = Date.now() - stopwatchStartTime;
    updateStopwatchDisplay();
  }, 100);
}

function stopStopwatch(){
  stopwatchRunning = false;
  if(stopwatchInterval){
    clearInterval(stopwatchInterval);
    stopwatchInterval = null;
  }
  // Keep elapsed time for resume
}

function resetStopwatch(){
  stopStopwatch();
  stopwatchElapsedTime = 0;
  stopwatchStartTime = null;
  updateStopwatchDisplay();
}

// Initialize stopwatch based on current status
function initializeStopwatch(row){
  const currentStatus = getCurrentStatus(row);
  
  // If stopwatch is already running, don't reset it - just ensure it's running
  if(stopwatchRunning && (currentStatus === 'BEFORE_PICKUP' || currentStatus === 'AFTER_PICKUP')){
    // Already running, just update display
    updateStopwatchDisplay();
    return;
  }
  
  // If not running, reset and start if needed
  if(currentStatus === 'BEFORE_PICKUP' || currentStatus === 'AFTER_PICKUP'){
    // Timer should be running - only reset if it wasn't running before
    if(!stopwatchRunning){
      resetStopwatch();
      startStopwatch();
    } else {
      // Already running, just update display
      updateStopwatchDisplay();
    }
  } else {
    // Timer should be stopped - but don't reset elapsed time if it was running
    if(stopwatchRunning){
      stopStopwatch();
    } else {
      resetStopwatch();
    }
  }
}

// Handle stopwatch when status changes
function handleStopwatchStatusChange(newStatus){
  if(newStatus === 'BEFORE_PICKUP'){
    // Start timer
    resetStopwatch();
    startStopwatch();
  } else if(newStatus === 'WAITING_FOR_CUSTOMER'){
    // Stop timer (keep elapsed time)
    stopStopwatch();
  } else if(newStatus === 'AFTER_PICKUP'){
    // Resume timer (continue from elapsed time)
    startStopwatch();
  } else if(newStatus === 'COMPLETED'){
    // Stop timer permanently
    stopStopwatch();
  }
}

// Reset timer function - resets all toggles and timer
function resetTimer(){
  if(!currentRow || !currentTable) return;
  
  // Reset all toggles to grey (unchecked, enabled)
  if(statusButtonsSection){
    const toggles = statusButtonsSection.querySelectorAll('.status-toggle-input');
    toggles.forEach(toggle => {
      toggle.checked = false;
      toggle.disabled = false;
      const wrapper = toggle.closest('.status-toggle-wrapper');
      const textEl = wrapper?.querySelector('.status-toggle-text');
      if(textEl){
        textEl.style.color = '#6b7280';
        textEl.style.fontWeight = 'normal';
        textEl.style.opacity = '1';
      }
    });
  }
  
  // Reset stopwatch
  resetStopwatch();
  
  // Update database to clear Pickup Status
  (async () => {
    try {
      await ensureMeta(currentTable);
      const pickupCol = findColumnByName(currentRow, 'Pickup Status');
      if(!pickupCol){
        alert('Pickup Status column not found.');
        return;
      }
      const pkCols = currentMeta?.primaryKey || [];
      if(pkCols.length === 0){
        alert('Cannot update: table has no primary key.');
        return;
      }
      const key = {};
      pkCols.forEach(col => { key[col] = currentRow[col]; });
      const payloadData = { [pickupCol]: null }; // Clear the status
      const payload = { key, data: payloadData };
      
      const res = await fetch(API_BASE + '/api/tables/' + encodeURIComponent(currentTable), {
        method:'PUT',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(payload)
      });
      
      if(!res.ok){
        const errorText = await res.text();
        let errorMessage = 'Reset failed';
        try{
          const parsed = JSON.parse(errorText);
          errorMessage = parsed.error || errorMessage;
        }catch{
          if(errorText) errorMessage = errorText;
        }
        alert(errorMessage);
        return;
      }
      
      const result = await res.json();
      if(result.updated){
        currentRow[pickupCol] = null;
        // Refresh rows
        await loadRows(currentTable);
        applyFilters();
        showToast('Timer reset successfully');
      } else {
        alert('Reset did not affect any rows.');
      }
    } catch(err) {
      alert('Reset error: ' + err.message);
    }
  })();
}

// Add event listener for Reset Timer button
document.getElementById('btn-reset-timer')?.addEventListener('click', () => {
  if(!currentRow){
    alert('Please select a row before resetting timer.');
    return;
  }
  if(confirm('Are you sure you want to reset the timer? This will clear all status toggles and reset the timer to 00:00:00.')){
    resetTimer();
  }
});
    