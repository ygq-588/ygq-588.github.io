/**
 * 统一小齿轮菜单系统
 * 包含：密码保护、背景设置、头像设置、文本编辑、照片管理、站点信息
 */

// ========== 密码保护模块 ==========
const PASSWORD_KEY = 'site_password';
const FAIL_COUNT_KEY = 'password_fail_count';
const LOCK_UNTIL_KEY = 'password_lock_until';
const AUTH_TIME_KEY = 'last_auth_time';
const DEFAULT_PASSWORD = '12345';

let currentMenu = null;

function initPassword() {
    if (!localStorage.getItem(PASSWORD_KEY)) {
        localStorage.setItem(PASSWORD_KEY, DEFAULT_PASSWORD);
    }
}

function getPassword() { return localStorage.getItem(PASSWORD_KEY); }
function setPassword(newPwd) { localStorage.setItem(PASSWORD_KEY, newPwd); }

function getFailCount() {
    const count = localStorage.getItem(FAIL_COUNT_KEY);
    return count ? parseInt(count) : 0;
}

function setFailCount(count) {
    localStorage.setItem(FAIL_COUNT_KEY, count);
}

function getLockUntil() {
    const until = localStorage.getItem(LOCK_UNTIL_KEY);
    return until ? parseInt(until) : 0;
}

function setLockUntil(timestamp) {
    if (timestamp) localStorage.setItem(LOCK_UNTIL_KEY, timestamp);
    else localStorage.removeItem(LOCK_UNTIL_KEY);
}

function isLocked() {
    const lockUntil = getLockUntil();
    if (lockUntil && Date.now() < lockUntil) {
        return true;
    }
    if (lockUntil && Date.now() >= lockUntil) {
        setLockUntil(null);
        setFailCount(0);
    }
    return false;
}

function getRemainingLockTime() {
    const lockUntil = getLockUntil();
    if (!lockUntil) return 0;
    const remaining = Math.ceil((lockUntil - Date.now()) / 1000 / 60);
    return remaining > 0 ? remaining : 0;
}

function isAuthenticated() {
    const lastAuth = localStorage.getItem(AUTH_TIME_KEY);
    if (lastAuth && (Date.now() - parseInt(lastAuth)) < 10 * 60 * 1000) {
        return true;
    }
    return false;
}

function setAuthenticated() {
    localStorage.setItem(AUTH_TIME_KEY, Date.now());
}

function clearAuthentication() {
    localStorage.removeItem(AUTH_TIME_KEY);
}

function showPasswordDialog(callback) {
    if (isAuthenticated()) {
        if (callback) callback();
        return;
    }
    
    if (isLocked()) {
        const remaining = getRemainingLockTime();
        alert(`🔒 密码错误次数过多，请 ${remaining} 分钟后重试`);
        return;
    }
    
    const overlay = document.createElement('div');
    overlay.style.cssText = `position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);z-index:20000;display:flex;align-items:center;justify-content:center;`;
    
    const dialog = document.createElement('div');
    dialog.style.cssText = `background:white;border-radius:12px;padding:25px;min-width:300px;text-align:center;box-shadow:0 10px 30px rgba(0,0,0,0.3);`;
    dialog.innerHTML = `
        <h3 style="margin:0 0 15px 0;color:#8B4513;">🔐 请输入密码</h3>
        <input type="password" id="pwdInput" placeholder="请输入密码" style="width:100%;padding:10px;border:2px solid #ddd;border-radius:8px;margin-bottom:15px;">
        <div style="display:flex;gap:10px;justify-content:center;">
            <button id="pwdConfirm" style="padding:8px 20px;background:#4CAF50;color:white;border:none;border-radius:6px;cursor:pointer;">确认</button>
            <button id="pwdCancel" style="padding:8px 20px;background:#999;color:white;border:none;border-radius:6px;cursor:pointer;">取消</button>
        </div>
        <div id="pwdError" style="color:#f44336;margin-top:10px;font-size:12px;"></div>
    `;
    
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);
    
    const input = dialog.querySelector('#pwdInput');
    const confirmBtn = dialog.querySelector('#pwdConfirm');
    const cancelBtn = dialog.querySelector('#pwdCancel');
    const errorDiv = dialog.querySelector('#pwdError');
    
    input.focus();
    
    function verify() {
        const inputPwd = input.value;
        if (inputPwd === getPassword()) {
            setFailCount(0);
            setAuthenticated();
            overlay.remove();
            if (callback) callback();
        } else {
            let failCount = getFailCount() + 1;
            setFailCount(failCount);
            const remaining = 3 - failCount;
            if (failCount >= 3) {
                setLockUntil(Date.now() + 10 * 60 * 1000);
                errorDiv.innerHTML = `密码错误3次！已锁定10分钟`;
                setTimeout(() => overlay.remove(), 2000);
            } else {
                errorDiv.innerHTML = `密码错误，还剩 ${remaining} 次尝试机会`;
                input.value = '';
                input.focus();
            }
        }
    }
    
    confirmBtn.onclick = verify;
    cancelBtn.onclick = () => overlay.remove();
    input.onkeypress = (e) => { if (e.key === 'Enter') verify(); };
}

function showChangePasswordDialog() {
    const overlay = document.createElement('div');
    overlay.style.cssText = `position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);z-index:20000;display:flex;align-items:center;justify-content:center;`;
    
    const dialog = document.createElement('div');
    dialog.style.cssText = `background:white;border-radius:12px;padding:25px;min-width:320px;box-shadow:0 10px 30px rgba(0,0,0,0.3);`;
    dialog.innerHTML = `
        <h3 style="margin:0 0 15px 0;color:#8B4513;">🔐 修改密码</h3>
        <input type="password" id="oldPwd" placeholder="当前密码" style="width:100%;padding:10px;border:2px solid #ddd;border-radius:8px;margin-bottom:10px;">
        <input type="password" id="newPwd" placeholder="新密码" style="width:100%;padding:10px;border:2px solid #ddd;border-radius:8px;margin-bottom:10px;">
        <input type="password" id="confirmPwd" placeholder="确认新密码" style="width:100%;padding:10px;border:2px solid #ddd;border-radius:8px;margin-bottom:15px;">
        <div style="display:flex;gap:10px;justify-content:center;">
            <button id="changeConfirm" style="padding:8px 20px;background:#4CAF50;color:white;border:none;border-radius:6px;cursor:pointer;">确认修改</button>
            <button id="changeCancel" style="padding:8px 20px;background:#999;color:white;border:none;border-radius:6px;cursor:pointer;">取消</button>
        </div>
        <div id="changeError" style="color:#f44336;margin-top:10px;font-size:12px;"></div>
    `;
    
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);
    
    const oldInput = dialog.querySelector('#oldPwd');
    const newInput = dialog.querySelector('#newPwd');
    const confirmInput = dialog.querySelector('#confirmPwd');
    const confirmBtn = dialog.querySelector('#changeConfirm');
    const cancelBtn = dialog.querySelector('#changeCancel');
    const errorDiv = dialog.querySelector('#changeError');
    
    function change() {
        const oldPwd = oldInput.value;
        const newPwd = newInput.value;
        const confirmPwd = confirmInput.value;
        
        if (oldPwd !== getPassword()) {
            errorDiv.innerHTML = '当前密码错误';
            return;
        }
        if (newPwd.length === 0) {
            errorDiv.innerHTML = '新密码不能为空';
            return;
        }
        if (newPwd !== confirmPwd) {
            errorDiv.innerHTML = '两次输入的新密码不一致';
            return;
        }
        
        setPassword(newPwd);
        alert('✅ 密码修改成功！');
        overlay.remove();
    }
    
    confirmBtn.onclick = change;
    cancelBtn.onclick = () => overlay.remove();
}

// ========== 以下为原有功能（背景、头像、文本编辑等，保持不变） ==========

// ========== IndexedDB 初始化 ==========
const SETTINGS_DB_NAME = 'PrinceSettingsDB';
const SETTINGS_STORE = 'settings';
let settingsDB = null;

function openSettingsDB() {
    return new Promise((resolve, reject) => {
        if (settingsDB) { resolve(settingsDB); return; }
        const request = indexedDB.open(SETTINGS_DB_NAME, 1);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => { settingsDB = request.result; resolve(settingsDB); };
        request.onupgradeneeded = (e) => {
            const db = e.target.result;
            if (!db.objectStoreNames.contains(SETTINGS_STORE)) {
                db.createObjectStore(SETTINGS_STORE, { keyPath: 'key' });
            }
        };
    });
}

async function saveImageToDB(key, dataUrl) {
    const db = await openSettingsDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(SETTINGS_STORE, 'readwrite');
        const store = tx.objectStore(SETTINGS_STORE);
        const request = store.put({ key: key, value: dataUrl, updatedAt: Date.now() });
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

async function loadImageFromDB(key) {
    const db = await openSettingsDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(SETTINGS_STORE, 'readonly');
        const store = tx.objectStore(SETTINGS_STORE);
        const request = store.get(key);
        request.onsuccess = () => resolve(request.result ? request.result.value : null);
        request.onerror = () => reject(request.error);
    });
}

// ========== 应用背景（默认背景 + 用户自定义） ==========
async function applyBackground() {
    const userBgColor = localStorage.getItem('pageBackground');
    const userBgImage = await loadImageFromDB('backgroundImage');
    
    // 如果用户有自定义背景，使用用户的
    if (userBgImage) {
        document.body.style.backgroundImage = `url(${userBgImage})`;
        document.body.style.backgroundSize = 'cover';
        document.body.style.backgroundAttachment = 'fixed';
        document.body.style.backgroundColor = '';
        return;
    }
    
    if (userBgColor && userBgColor !== 'null') {
        document.body.style.backgroundColor = userBgColor;
        document.body.style.backgroundImage = 'none';
        return;
    }
    
    // 没有自定义背景时，使用默认背景图片
    document.body.style.backgroundImage = "url('images/default-bg.jpg')";
    document.body.style.backgroundSize = 'cover';
    document.body.style.backgroundAttachment = 'fixed';
    document.body.style.backgroundPosition = 'center';
}
// ========== 背景设置对话框 ==========
function openBackgroundSettings() {
    const overlay = document.createElement('div');
    overlay.style.cssText = `position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);z-index:10000;`;
    
    const dialog = document.createElement('div');
    dialog.id = 'bgSettingsDialog';
    dialog.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        border-radius: 12px;
        box-shadow: 0 15px 40px rgba(0,0,0,0.2);
        z-index: 10001;
        min-width: 350px;
        max-width: 500px;
        cursor: default;
    `;
    
    const titleBar = document.createElement('div');
    titleBar.style.cssText = `
        padding: 12px 15px;
        background: linear-gradient(135deg, #8B4513, #D4AF37);
        border-radius: 12px 12px 0 0;
        color: white;
        font-weight: bold;
        cursor: move;
        display: flex;
        justify-content: space-between;
        align-items: center;
    `;
    titleBar.innerHTML = `<span><span style="color:#2196F3;">🎨</span> 背景设置</span><span style="cursor:pointer;" id="closeBgDialog">✕</span>`;
    
    const savedOverlayOpacity = localStorage.getItem('bgOverlayOpacity') || '0';
    
    const content = document.createElement('div');
    content.style.cssText = `padding: 20px; max-height: 70vh; overflow-y: auto;`;
    content.innerHTML = `
        <div style="margin-bottom:20px;">
            <div style="margin-bottom:15px;">
                <label style="display:block;margin-bottom:8px;font-weight:bold;">当前背景预览：</label>
                <div id="bg-preview" style="width:100%;height:100px;border-radius:8px;border:2px solid #eee;background:#f5f0e8;background-size:cover;background-position:center;"></div>
            </div>
            <div style="margin-bottom:20px;">
                <h4 style="margin:0 0 10px 0;font-size:14px;">背景颜色：</h4>
                <div style="display:flex;gap:10px;flex-wrap:wrap;">
                    <button class="bg-color-btn" data-color="#F5F5DC" style="background:#F5F5DC;border:2px solid #D4AF37;padding:10px;border-radius:6px;cursor:pointer;flex:1;">米色</button>
                    <button class="bg-color-btn" data-color="#FFFFFF" style="background:#FFFFFF;border:2px solid #ddd;padding:10px;border-radius:6px;cursor:pointer;flex:1;">纯白</button>
                    <button class="bg-color-btn" data-color="#F0F8FF" style="background:#F0F8FF;border:2px solid #ddd;padding:10px;border-radius:6px;cursor:pointer;flex:1;">淡蓝</button>
                    <button class="bg-color-btn" data-color="#FFF5E6" style="background:#FFF5E6;border:2px solid #ddd;padding:10px;border-radius:6px;cursor:pointer;flex:1;">淡黄</button>
                    <button class="bg-color-btn" data-color="#F9F9F9" style="background:#F9F9F9;border:2px solid #ddd;padding:10px;border-radius:6px;cursor:pointer;flex:1;">浅灰</button>
                </div>
            </div>
            <div style="margin-bottom:20px;">
                <h4 style="margin:0 0 10px 0;font-size:14px;">背景图片：</h4>
                <input type="file" id="bg-upload" accept="image/*" style="width:100%;padding:8px;border:2px dashed #ccc;border-radius:6px;margin-bottom:10px;">
            </div>
            <div style="margin-bottom:20px;">
                <h4 style="margin:0 0 10px 0;font-size:14px;">遮罩层透明度（让文字更清晰）：</h4>
                <input type="range" id="overlay-opacity" min="0" max="0.6" step="0.05" value="${savedOverlayOpacity}" style="width:100%;">
                <div style="display:flex;justify-content:space-between;margin-top:5px;font-size:12px;"><span>无遮罩</span><span id="opacity-value">${Math.round(savedOverlayOpacity * 100)}%</span><span>60%</span></div>
            </div>
        </div>
        <div style="display:flex;gap:10px;justify-content:flex-end;">
            <button id="cancel-bg" style="padding:8px 16px;background:#f5f5f5;border:1px solid #ddd;border-radius:6px;cursor:pointer;">取消</button>
            <button id="save-bg" style="padding:8px 16px;background:#4CAF50;color:white;border:none;border-radius:6px;cursor:pointer;">保存背景</button>
        </div>
    `;
    
    dialog.appendChild(titleBar);
    dialog.appendChild(content);
    document.body.appendChild(overlay);
    document.body.appendChild(dialog);
    
    const savedPos = localStorage.getItem('bgDialogPosition');
    if (savedPos) {
        try {
            const pos = JSON.parse(savedPos);
            dialog.style.top = pos.top;
            dialog.style.left = pos.left;
            dialog.style.transform = 'none';
        } catch(e) {}
    }
    
    let isDragging = false;
    let startX, startY, startLeft, startTop;
    
    titleBar.addEventListener('mousedown', (e) => {
        if (e.target.id === 'closeBgDialog') return;
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        const rect = dialog.getBoundingClientRect();
        startLeft = rect.left;
        startTop = rect.top;
        dialog.style.transform = 'none';
        dialog.style.left = startLeft + 'px';
        dialog.style.top = startTop + 'px';
        dialog.style.margin = '0';
        e.preventDefault();
    });
    
    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        dialog.style.left = (startLeft + dx) + 'px';
        dialog.style.top = (startTop + dy) + 'px';
    });
    
    document.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            localStorage.setItem('bgDialogPosition', JSON.stringify({
                top: dialog.style.top,
                left: dialog.style.left
            }));
        }
    });
    
    const preview = document.getElementById('bg-preview');
    const opacitySlider = document.getElementById('overlay-opacity');
    const opacityValue = document.getElementById('opacity-value');
    
    opacitySlider.oninput = () => {
        const val = opacitySlider.value;
        opacityValue.textContent = Math.round(val * 100) + '%';
    };
    
    const savedBgColor = localStorage.getItem('pageBackground');
    if (savedBgColor && savedBgColor !== 'null') {
        preview.style.backgroundColor = savedBgColor;
        preview.style.backgroundImage = 'none';
    }
    loadImageFromDB('backgroundImage').then(img => {
        if (img) { preview.style.backgroundImage = `url(${img})`; preview.style.backgroundSize = 'cover'; }
    });
    
    dialog.querySelectorAll('.bg-color-btn').forEach(btn => {
        btn.onclick = () => {
            const color = btn.dataset.color;
            preview.style.backgroundColor = color;
            preview.style.backgroundImage = 'none';
            dialog.querySelectorAll('.bg-color-btn').forEach(b => b.style.borderColor = '#ddd');
            btn.style.borderColor = '#4CAF50';
        };
    });
    
    document.getElementById('bg-upload').onchange = (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                preview.style.backgroundImage = `url(${ev.target.result})`;
                preview.style.backgroundSize = 'cover';
                preview.style.backgroundColor = '';
            };
            reader.readAsDataURL(file);
        }
    };
    
    document.getElementById('save-bg').onclick = async () => {
        const bgImage = preview.style.backgroundImage;
        const overlayOpacity = opacitySlider.value;
        
        if (bgImage !== 'none') {
            const imgUrl = bgImage.replace(/url\(["']?(.*?)["']?\)/, '$1');
            await saveImageToDB('backgroundImage', imgUrl);
            localStorage.removeItem('pageBackground');
            document.body.style.backgroundImage = bgImage;
            document.body.style.backgroundSize = 'cover';
            document.body.style.backgroundAttachment = 'fixed';
        } else if (preview.style.backgroundColor && preview.style.backgroundColor !== 'rgba(0, 0, 0, 0)') {
            localStorage.setItem('pageBackground', preview.style.backgroundColor);
            document.body.style.backgroundColor = preview.style.backgroundColor;
            document.body.style.backgroundImage = 'none';
        }
        
        localStorage.setItem('bgOverlayOpacity', overlayOpacity);
        
        alert('✅ 背景已保存');
        document.body.removeChild(overlay);
        document.body.removeChild(dialog);
        applyBackground();
    };
    
    document.getElementById('cancel-bg').onclick = () => {
        document.body.removeChild(overlay);
        document.body.removeChild(dialog);
    };
    document.getElementById('closeBgDialog').onclick = () => {
        document.body.removeChild(overlay);
        document.body.removeChild(dialog);
    };
    overlay.onclick = () => {
        document.body.removeChild(overlay);
        document.body.removeChild(dialog);
    };
}

// ========== 头像设置对话框 ==========
function openAvatarSettings() {
    const overlay = document.createElement('div');
    overlay.style.cssText = `position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);z-index:10000;`;
    
    const dialog = document.createElement('div');
    dialog.id = 'avatarSettingsDialog';
    dialog.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        border-radius: 12px;
        box-shadow: 0 15px 40px rgba(0,0,0,0.2);
        z-index: 10001;
        min-width: 300px;
        max-width: 400px;
        cursor: default;
    `;
    
    const titleBar = document.createElement('div');
    titleBar.style.cssText = `
        padding: 12px 15px;
        background: linear-gradient(135deg, #8B4513, #D4AF37);
        border-radius: 12px 12px 0 0;
        color: white;
        font-weight: bold;
        cursor: move;
        display: flex;
        justify-content: space-between;
        align-items: center;
    `;
    titleBar.innerHTML = `<span><span style="color:#FF9800;">👤</span> 头像设置</span><span style="cursor:pointer;" id="closeAvatarDialog">✕</span>`;
    
    const content = document.createElement('div');
    content.style.cssText = `padding: 20px;`;
    content.innerHTML = `
        <div style="text-align:center;margin-bottom:15px;">
            <img id="avatar-preview" src="images/avatar.jpg" style="width:120px;height:120px;border-radius:50%;border:4px solid #D4AF37;object-fit:cover;">
        </div>
        <div style="margin-bottom:15px;">
            <label style="display:block;margin-bottom:8px;font-weight:bold;">上传新头像：</label>
            <input type="file" id="avatar-upload" accept="image/*" style="width:100%;padding:8px;border:2px dashed #ccc;border-radius:6px;">
        </div>
        <div style="margin-bottom:20px;">
            <label style="display:block;margin-bottom:8px;font-weight:bold;">头像大小调整：</label>
            <input type="range" id="avatar-size" min="80" max="200" value="120" style="width:100%;">
            <div style="display:flex;justify-content:space-between;margin-top:5px;font-size:12px;"><span>小</span><span id="size-value">120px</span><span>大</span></div>
        </div>
        <div style="display:flex;gap:10px;justify-content:flex-end;">
            <button id="cancel-avatar" style="padding:8px 16px;background:#f5f5f5;border:1px solid #ddd;border-radius:6px;cursor:pointer;">取消</button>
            <button id="save-avatar" style="padding:8px 16px;background:#4CAF50;color:white;border:none;border-radius:6px;cursor:pointer;">保存设置</button>
        </div>
    `;
    
    dialog.appendChild(titleBar);
    dialog.appendChild(content);
    document.body.appendChild(overlay);
    document.body.appendChild(dialog);
    
    const savedPos = localStorage.getItem('avatarDialogPosition');
    if (savedPos) {
        try {
            const pos = JSON.parse(savedPos);
            dialog.style.top = pos.top;
            dialog.style.left = pos.left;
            dialog.style.transform = 'none';
        } catch(e) {}
    }
    
    let isDragging = false;
    let startX, startY, startLeft, startTop;
    
    titleBar.addEventListener('mousedown', (e) => {
        if (e.target.id === 'closeAvatarDialog') return;
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        const rect = dialog.getBoundingClientRect();
        startLeft = rect.left;
        startTop = rect.top;
        dialog.style.transform = 'none';
        dialog.style.left = startLeft + 'px';
        dialog.style.top = startTop + 'px';
        dialog.style.margin = '0';
        e.preventDefault();
    });
    
    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        dialog.style.left = (startLeft + dx) + 'px';
        dialog.style.top = (startTop + dy) + 'px';
    });
    
    document.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            localStorage.setItem('avatarDialogPosition', JSON.stringify({
                top: dialog.style.top,
                left: dialog.style.left
            }));
        }
    });
    
    const preview = document.getElementById('avatar-preview');
    const sizeSlider = document.getElementById('avatar-size');
    const sizeValue = document.getElementById('size-value');
    
    loadImageFromDB('avatarImage').then(img => { if (img) preview.src = img; });
    const savedSize = localStorage.getItem('avatarSize');
    if (savedSize) { sizeSlider.value = savedSize; sizeValue.textContent = savedSize + 'px'; preview.style.width = savedSize + 'px'; preview.style.height = savedSize + 'px'; }
    
    sizeSlider.oninput = () => {
        const size = sizeSlider.value;
        sizeValue.textContent = size + 'px';
        preview.style.width = size + 'px';
        preview.style.height = size + 'px';
    };
    
    document.getElementById('avatar-upload').onchange = (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (ev) => { preview.src = ev.target.result; };
            reader.readAsDataURL(file);
        }
    };
    
    document.getElementById('save-avatar').onclick = async () => {
        const avatarImg = document.getElementById('avatarImage');
        if (avatarImg) avatarImg.src = preview.src;
        await saveImageToDB('avatarImage', preview.src);
        localStorage.setItem('avatarSize', sizeSlider.value);
        alert('✅ 头像已保存');
        document.body.removeChild(overlay);
        document.body.removeChild(dialog);
    };
    
    document.getElementById('cancel-avatar').onclick = () => {
        document.body.removeChild(overlay);
        document.body.removeChild(dialog);
    };
    document.getElementById('closeAvatarDialog').onclick = () => {
        document.body.removeChild(overlay);
        document.body.removeChild(dialog);
    };
    overlay.onclick = () => {
        document.body.removeChild(overlay);
        document.body.removeChild(dialog);
    };
}

// ========== 文本编辑功能 ==========
let textEditMode = false;
let textToolbar = null;

function enableTextEdit() {
    if (textEditMode) {
        disableTextEdit();
        return;
    }
    textEditMode = true;
    document.body.setAttribute('contenteditable', 'true');
    document.body.style.outline = '2px solid #D4AF37';
    showTextToolbar();
    alert('✏️ 文本编辑模式已开启\n\n• 直接点击文字即可编辑\n• 选中文字可调整格式\n• 再次点击齿轮→文本修改可关闭');
}

function disableTextEdit() {
    textEditMode = false;
    document.body.removeAttribute('contenteditable');
    document.body.style.outline = '';
    if (textToolbar) {
        textToolbar.remove();
        textToolbar = null;
    }
}

function applyStyleToSelection(styleName, value) {
    const selection = window.getSelection();
    if (selection.rangeCount > 0 && !selection.isCollapsed) {
        const range = selection.getRangeAt(0);
        const span = document.createElement('span');
        span.style[styleName] = value;
        range.surroundContents(span);
        selection.removeAllRanges();
    } else {
        alert('请先选中要修改的文字');
    }
}

function showTextToolbar() {
    if (textToolbar) {
        textToolbar.remove();
        textToolbar = null;
    }
    
    textToolbar = document.createElement('div');
    textToolbar.id = 'textEditToolbar';
    textToolbar.style.cssText = `
        position: fixed;
        top: 80px;
        left: 50%;
        transform: translateX(-50%);
        background: white;
        border-radius: 40px;
        padding: 10px 20px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        z-index: 10002;
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
        border: 2px solid #D4AF37;
        background: linear-gradient(135deg, #fff, #f9f5f0);
        cursor: move;
        max-width: 90%;
    `;
    
    textToolbar.innerHTML = `
        <div style="display:flex; gap:8px; flex-wrap:wrap; cursor: default;" id="toolbarButtons">
            <button id="toolbar-bold" style="padding:6px 12px;border:none;border-radius:20px;cursor:pointer;font-weight:bold;background:#f0f0f0;">B</button>
            <button id="toolbar-italic" style="padding:6px 12px;border:none;border-radius:20px;cursor:pointer;font-style:italic;background:#f0f0f0;">I</button>
            <select id="toolbar-fontfamily" style="padding:6px;border-radius:20px;border:1px solid #ddd;">
                <option value="">字体</option>
                <option value="'Microsoft YaHei'">微软雅黑</option>
                <option value="'SimSun'">宋体</option>
                <option value="'KaiTi'">楷体</option>
                <option value="'SimHei'">黑体</option>
            </select>
            <select id="toolbar-fontsize" style="padding:6px;border-radius:20px;border:1px solid #ddd;">
                <option value="12">12px</option><option value="14" selected>14px</option><option value="16">16px</option><option value="18">18px</option><option value="20">20px</option><option value="24">24px</option>
            </select>
            <select id="toolbar-lineheight" style="padding:6px;border-radius:20px;border:1px solid #ddd;">
                <option value="1.2">1.2</option><option value="1.5" selected>1.5</option><option value="1.6">1.6</option><option value="1.8">1.8</option><option value="2.0">2.0</option>
            </select>
            <button id="toolbar-indent" style="padding:6px 12px;border:none;border-radius:20px;cursor:pointer;background:#f0f0f0;">首行缩进</button>
            <input type="color" id="toolbar-color" style="width:36px;height:36px;border:none;border-radius:50%;cursor:pointer;border:2px solid #D4AF37;">
            <button id="toolbar-close" style="padding:6px 15px;border:none;border-radius:20px;cursor:pointer;background:#f44336;color:white;">关闭</button>
        </div>
    `;
    
    document.body.appendChild(textToolbar);
    
    let isDragging = false;
    let startX, startY, startLeft, startTop;
    
    textToolbar.addEventListener('mousedown', (e) => {
        if (e.target.closest('#toolbarButtons')) return;
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        const rect = textToolbar.getBoundingClientRect();
        startLeft = rect.left;
        startTop = rect.top;
        textToolbar.style.transform = 'none';
        textToolbar.style.left = startLeft + 'px';
        textToolbar.style.top = startTop + 'px';
        e.preventDefault();
    });
    
    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        textToolbar.style.left = (startLeft + dx) + 'px';
        textToolbar.style.top = (startTop + dy) + 'px';
    });
    
    document.addEventListener('mouseup', () => {
        isDragging = false;
    });
    
    document.getElementById('toolbar-bold').onclick = () => document.execCommand('bold', false, null);
    document.getElementById('toolbar-italic').onclick = () => document.execCommand('italic', false, null);
    document.getElementById('toolbar-fontsize').onchange = (e) => document.execCommand('fontSize', false, e.target.value);
    document.getElementById('toolbar-color').onchange = (e) => document.execCommand('foreColor', false, e.target.value);
    document.getElementById('toolbar-fontfamily').onchange = (e) => document.execCommand('fontName', false, e.target.value);
    document.getElementById('toolbar-lineheight').onchange = (e) => applyStyleToSelection('lineHeight', e.target.value);
    document.getElementById('toolbar-indent').onclick = () => applyStyleToSelection('textIndent', '2em');
    document.getElementById('toolbar-close').onclick = () => disableTextEdit();
}

// ========== 站点信息设置对话框 ==========
function openSiteSettings() {
    const overlay = document.createElement('div');
    overlay.style.cssText = `position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);z-index:10000;`;
    
    const dialog = document.createElement('div');
    dialog.id = 'siteSettingsDialog';
    dialog.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        border-radius: 12px;
        box-shadow: 0 15px 40px rgba(0,0,0,0.2);
        z-index: 10001;
        min-width: 400px;
        max-width: 500px;
        cursor: default;
    `;
    
    const titleBar = document.createElement('div');
    titleBar.style.cssText = `
        padding: 12px 15px;
        background: linear-gradient(135deg, #8B4513, #D4AF37);
        border-radius: 12px 12px 0 0;
        color: white;
        font-weight: bold;
        cursor: move;
        display: flex;
        justify-content: space-between;
        align-items: center;
    `;
    titleBar.innerHTML = `<span><span style="color:#FF9800;">🏠</span> 站点信息设置</span><span style="cursor:pointer;" id="closeSiteDialog">✕</span>`;
    
    const savedTitle = localStorage.getItem('siteTitle') || '王子殿下的个人网站';
    const savedSubtitle = localStorage.getItem('siteSubtitle') || '探索我的生活、工作和创意空间';
    const savedCopyright = localStorage.getItem('siteCopyright') || '2026';
    const savedKeywords = localStorage.getItem('siteKeywords') || '个人网站,王子殿下,相册,日常,工作';
    const savedDescription = localStorage.getItem('siteDescription') || '王子殿下的个人网站，展示我的生活、工作和创意空间';
    
    const content = document.createElement('div');
    content.style.cssText = `padding: 20px;`;
    content.innerHTML = `
        <div style="margin-bottom:15px;">
            <label style="display:block;margin-bottom:5px;font-weight:bold;">网站标题（浏览器标签页）</label>
            <input type="text" id="siteTitle" value="${savedTitle.replace(/"/g, '&quot;')}" style="width:100%;padding:8px;border:2px solid #ddd;border-radius:6px;">
        </div>
        <div style="margin-bottom:15px;">
            <label style="display:block;margin-bottom:5px;font-weight:bold;">副标题/Slogan</label>
            <input type="text" id="siteSubtitle" value="${savedSubtitle.replace(/"/g, '&quot;')}" style="width:100%;padding:8px;border:2px solid #ddd;border-radius:6px;">
        </div>
        <div style="margin-bottom:15px;">
            <label style="display:block;margin-bottom:5px;font-weight:bold;">版权年份</label>
            <input type="text" id="siteCopyright" value="${savedCopyright}" style="width:100%;padding:8px;border:2px solid #ddd;border-radius:6px;">
        </div>
        <div style="margin-bottom:15px;">
            <label style="display:block;margin-bottom:5px;font-weight:bold;">网站关键词（SEO）</label>
            <input type="text" id="siteKeywords" value="${savedKeywords.replace(/"/g, '&quot;')}" style="width:100%;padding:8px;border:2px solid #ddd;border-radius:6px;">
        </div>
        <div style="margin-bottom:20px;">
            <label style="display:block;margin-bottom:5px;font-weight:bold;">网站描述（SEO）</label>
            <textarea id="siteDescription" rows="3" style="width:100%;padding:8px;border:2px solid #ddd;border-radius:6px;">${savedDescription.replace(/"/g, '&quot;')}</textarea>
        </div>
        <div style="display:flex;gap:10px;justify-content:flex-end;">
            <button id="cancel-site" style="padding:8px 16px;background:#f5f5f5;border:1px solid #ddd;border-radius:6px;cursor:pointer;">取消</button>
            <button id="save-site" style="padding:8px 16px;background:#4CAF50;color:white;border:none;border-radius:6px;cursor:pointer;">保存设置</button>
        </div>
    `;
    
    dialog.appendChild(titleBar);
    dialog.appendChild(content);
    document.body.appendChild(overlay);
    document.body.appendChild(dialog);
    
    const savedPos = localStorage.getItem('siteDialogPosition');
    if (savedPos) {
        try {
            const pos = JSON.parse(savedPos);
            dialog.style.top = pos.top;
            dialog.style.left = pos.left;
            dialog.style.transform = 'none';
        } catch(e) {}
    }
    
    let isDragging = false;
    let startX, startY, startLeft, startTop;
    
    titleBar.addEventListener('mousedown', (e) => {
        if (e.target.id === 'closeSiteDialog') return;
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        const rect = dialog.getBoundingClientRect();
        startLeft = rect.left;
        startTop = rect.top;
        dialog.style.transform = 'none';
        dialog.style.left = startLeft + 'px';
        dialog.style.top = startTop + 'px';
        dialog.style.margin = '0';
        e.preventDefault();
    });
    
    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        dialog.style.left = (startLeft + dx) + 'px';
        dialog.style.top = (startTop + dy) + 'px';
    });
    
    document.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            localStorage.setItem('siteDialogPosition', JSON.stringify({
                top: dialog.style.top,
                left: dialog.style.left
            }));
        }
    });
    
    document.getElementById('save-site').onclick = () => {
        localStorage.setItem('siteTitle', document.getElementById('siteTitle').value);
        localStorage.setItem('siteSubtitle', document.getElementById('siteSubtitle').value);
        localStorage.setItem('siteCopyright', document.getElementById('siteCopyright').value);
        localStorage.setItem('siteKeywords', document.getElementById('siteKeywords').value);
        localStorage.setItem('siteDescription', document.getElementById('siteDescription').value);
        applySiteSettings();
        alert('✅ 站点信息已保存');
        document.body.removeChild(overlay);
        document.body.removeChild(dialog);
    };
    
    document.getElementById('cancel-site').onclick = () => {
        document.body.removeChild(overlay);
        document.body.removeChild(dialog);
    };
    document.getElementById('closeSiteDialog').onclick = () => {
        document.body.removeChild(overlay);
        document.body.removeChild(dialog);
    };
    overlay.onclick = () => {
        document.body.removeChild(overlay);
        document.body.removeChild(dialog);
    };
}

function applySiteSettings() {
    const siteTitle = localStorage.getItem('siteTitle');
    if (siteTitle) document.title = siteTitle;
    
    const siteSubtitle = localStorage.getItem('siteSubtitle');
    if (siteSubtitle) {
        const subtitleEl = document.querySelector('.hero-subtitle');
        if (subtitleEl) subtitleEl.textContent = siteSubtitle;
    }
    
    const siteCopyright = localStorage.getItem('siteCopyright');
    if (siteCopyright) {
        const footerText = document.querySelector('.footer-text');
        if (footerText) footerText.textContent = `个人网站 © ${siteCopyright} - 展示我的世界`;
    }
    
    const keywords = localStorage.getItem('siteKeywords');
    const description = localStorage.getItem('siteDescription');
    
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    let metaDescription = document.querySelector('meta[name="description"]');
    
    if (keywords) {
        if (metaKeywords) metaKeywords.setAttribute('content', keywords);
        else { metaKeywords = document.createElement('meta'); metaKeywords.name = 'keywords'; metaKeywords.content = keywords; document.head.appendChild(metaKeywords); }
    }
    if (description) {
        if (metaDescription) metaDescription.setAttribute('content', description);
        else { metaDescription = document.createElement('meta'); metaDescription.name = 'description'; metaDescription.content = description; document.head.appendChild(metaDescription); }
    }
}

function openPhotoManagement() { window.location.href = 'gallery.html'; }
function enterFullEditMode() { alert('🚀 完整编辑模式\n\n后续支持板块增删改、拖拽排序等功能'); }

// ========== 小齿轮菜单初始化（带密码保护） ==========
function initUniversalSettings() {
    const gearBtn = document.getElementById('gearBtn');
    currentMenu = document.getElementById('settingsMenu');
    if (!gearBtn || !currentMenu) return;
    
    // 确保菜单高度足够显示所有按钮
    currentMenu.style.maxHeight = '500px';
    currentMenu.style.overflowY = 'auto';
    
    gearBtn.onclick = (e) => {
        e.stopPropagation();
        showPasswordDialog(() => {
            currentMenu.style.display = 'block';
        });
    };
    
    document.onclick = () => {
        if (currentMenu) currentMenu.style.display = 'none';
    };
    if (currentMenu) currentMenu.onclick = (e) => e.stopPropagation();
    
    const ids = ['menuTextEdit', 'menuBgSettings', 'menuAvatarSettings', 'menuPhotoManage', 'menuSiteInfo', 'menuChangePassword', 'menuFullEdit'];
    const handlers = [enableTextEdit, openBackgroundSettings, openAvatarSettings, openPhotoManagement, openSiteSettings, showChangePasswordDialog, enterFullEditMode];
    
    ids.forEach((id, i) => {
        const btn = document.getElementById(id);
        if (btn) btn.addEventListener('click', () => { handlers[i](); if (currentMenu) currentMenu.style.display = 'none'; });
    });
}

// 初始化密码
initPassword();

document.addEventListener('DOMContentLoaded', () => {
    initUniversalSettings();
    applyBackground();
    applySiteSettings();
});