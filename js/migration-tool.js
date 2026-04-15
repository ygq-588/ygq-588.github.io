/**
 * 数据迁移工具
 * 版本: 1.1
 * 依赖: db-core.js
 * 路径: js/migration-tool.js
 * 功能: 从 JSON 文件迁移数据到 IndexedDB
 */

// 迁移状态
let migrationStatus = {
  photos: { status: 'pending', total: 0, completed: 0, errors: [] },
  contents: { status: 'pending', total: 0, completed: 0, errors: [] },
  settings: { status: 'pending', total: 0, completed: 0, errors: [] }
};

// 回调函数
let onProgressCallback = null;
let onCompleteCallback = null;

/**
 * 设置进度回调
 */
function setCallbacks(onProgress, onComplete) {
  onProgressCallback = onProgress;
  onCompleteCallback = onComplete;
}

/**
 * 更新进度
 */
function updateProgress(type, completed, total, status = 'processing') {
  migrationStatus[type].completed = completed;
  migrationStatus[type].total = total;
  migrationStatus[type].status = status;
  
  if (onProgressCallback) {
    onProgressCallback(migrationStatus);
  }
}

/**
 * 读取 JSON 文件
 */
function readJSONFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        resolve(data);
      } catch (err) {
        reject(new Error('JSON 解析失败: ' + err.message));
      }
    };
    reader.onerror = () => reject(new Error('文件读取失败'));
    reader.readAsText(file);
  });
}

/**
 * 从 URL 下载图片并转换为 DataURL
 */
async function urlToDataUrl(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL('image/jpeg'));
    };
    img.onerror = () => reject(new Error('图片加载失败，可能跨域或URL无效'));
    img.src = url;
  });
}

/**
 * 健康检查 - 确认 DB 对象可用
 */
async function healthCheck() {
  if (typeof DB === 'undefined') {
    throw new Error('db-core.js 未加载，请刷新页面重试');
  }
  if (typeof DB.openDatabase !== 'function') {
    throw new Error('DB.openDatabase 方法不存在，请检查 db-core.js 版本');
  }
  try {
    const db = await DB.openDatabase();
    if (!db) throw new Error('数据库连接失败');
    return true;
  } catch (err) {
    throw new Error(`数据库连接失败: ${err.message}`);
  }
}

/**
 * 迁移照片数据
 * @param {File} file - photos.json 文件
 */
async function migratePhotos(file) {
  try {
    updateProgress('photos', 0, 0, 'processing');
    const data = await readJSONFile(file);
    
    let photos = [];
    if (Array.isArray(data)) {
      photos = data;
    } else if (data.photos && Array.isArray(data.photos)) {
      photos = data.photos;
    } else if (data.data && Array.isArray(data.data)) {
      photos = data.data;
    } else {
      throw new Error('无法识别的照片数据结构');
    }
    
    const total = photos.length;
    updateProgress('photos', 0, total, 'processing');
    
    let completed = 0;
    const errors = [];
    
    // 获取现有文件名列表（用于冲突检测）
    const existingPhotos = await DB.getAllPhotos();
    const existingFilenames = new Set(existingPhotos.map(p => p.filename));
    
    for (const photo of photos) {
      try {
        let dataUrl = photo.dataUrl || photo.base64 || null;
        
        // 如果没有 dataUrl，尝试从 url 转换
        if (!dataUrl && photo.url) {
          if (photo.url.startsWith('http')) {
            try {
              dataUrl = await urlToDataUrl(photo.url);
            } catch (err) {
              errors.push({ filename: photo.filename || 'unknown', error: `外部URL下载失败: ${err.message}` });
              completed++;
              updateProgress('photos', completed, total, 'processing');
              continue;
            }
          } else if (photo.url.startsWith('data:')) {
            dataUrl = photo.url;
          } else {
            errors.push({ filename: photo.filename || 'unknown', error: '无效的图片URL' });
            completed++;
            updateProgress('photos', completed, total, 'processing');
            continue;
          }
        }
        
        if (!dataUrl) {
          errors.push({ filename: photo.filename || 'unknown', error: '缺少图片数据' });
          completed++;
          updateProgress('photos', completed, total, 'processing');
          continue;
        }
        
        let filename = photo.filename || photo.name || `migrated_${Date.now()}_${completed}.jpg`;
        const category = photo.category || photo.album || '未分类';
        const uploadDate = photo.uploadDate || photo.date || new Date().toISOString();
        
        // 文件名冲突处理：自动重命名
        let finalFilename = filename;
        let counter = 1;
        while (existingFilenames.has(finalFilename)) {
          const lastDot = filename.lastIndexOf('.');
          if (lastDot > 0) {
            finalFilename = filename.substring(0, lastDot) + ` (${counter})` + filename.substring(lastDot);
          } else {
            finalFilename = filename + ` (${counter})`;
          }
          counter++;
        }
        existingFilenames.add(finalFilename);
        
        await DB.savePhotoFromDataUrl(dataUrl, category, {
          filename: finalFilename,
          uploadDate: uploadDate
        });
        
        completed++;
        updateProgress('photos', completed, total, 'processing');
        
        // 小延迟避免阻塞
        await new Promise(r => setTimeout(r, 10));
        
      } catch (err) {
        errors.push({ filename: photo.filename || 'unknown', error: err.message });
        completed++;
        updateProgress('photos', completed, total, 'processing');
      }
    }
    
    migrationStatus.photos.errors = errors;
    migrationStatus.photos.status = errors.length > 0 ? 'completed_with_errors' : 'completed';
    updateProgress('photos', total, total, migrationStatus.photos.status);
    
    return { success: errors.length === 0, total, errors: errors.length };
    
  } catch (err) {
    migrationStatus.photos.status = 'failed';
    migrationStatus.photos.errors = [{ error: err.message }];
    updateProgress('photos', 0, 0, 'failed');
    throw err;
  }
}

/**
 * 迁移文字内容数据
 * @param {File} file - text-edits.json 文件
 */
async function migrateContents(file) {
  try {
    updateProgress('contents', 0, 0, 'processing');
    const data = await readJSONFile(file);
    
    let contents = [];
    if (Array.isArray(data)) {
      contents = data;
    } else if (data.contents && Array.isArray(data.contents)) {
      contents = data.contents;
    } else if (data.edits && Array.isArray(data.edits)) {
      contents = data.edits;
    } else {
      contents = Object.entries(data).map(([key, value]) => ({
        key: key,
        content: typeof value === 'string' ? value : JSON.stringify(value),
        lastModified: new Date().toISOString()
      }));
    }
    
    const total = contents.length;
    updateProgress('contents', 0, total, 'processing');
    
    let completed = 0;
    const errors = [];
    
    for (const item of contents) {
      try {
        const key = item.key || item.id || item.selector || `migrated_${Date.now()}_${completed}`;
        const content = item.content || item.html || item.text || '';
        const lastModified = item.lastModified || item.timestamp || new Date().toISOString();
        
        await DB.saveContent(key, content, lastModified);
        
        completed++;
        updateProgress('contents', completed, total, 'processing');
        
        await new Promise(r => setTimeout(r, 5));
        
      } catch (err) {
        errors.push({ key: item.key || 'unknown', error: err.message });
        completed++;
        updateProgress('contents', completed, total, 'processing');
      }
    }
    
    migrationStatus.contents.errors = errors;
    migrationStatus.contents.status = errors.length > 0 ? 'completed_with_errors' : 'completed';
    updateProgress('contents', total, total, migrationStatus.contents.status);
    
    return { success: errors.length === 0, total, errors: errors.length };
    
  } catch (err) {
    migrationStatus.contents.status = 'failed';
    migrationStatus.contents.errors = [{ error: err.message }];
    updateProgress('contents', 0, 0, 'failed');
    throw err;
  }
}

/**
 * 迁移设置数据
 * @param {File} file - settings.json 文件
 */
async function migrateSettings(file) {
  try {
    updateProgress('settings', 0, 0, 'processing');
    const data = await readJSONFile(file);
    
    let settings = [];
    if (typeof data === 'object' && !Array.isArray(data)) {
      settings = Object.entries(data).map(([key, value]) => ({ key, value }));
    } else if (Array.isArray(data)) {
      settings = data;
    } else {
      throw new Error('无法识别的设置数据结构');
    }
    
    const total = settings.length;
    updateProgress('settings', 0, total, 'processing');
    
    let completed = 0;
    const errors = [];
    
    for (const item of settings) {
      try {
        const key = item.key;
        const value = item.value !== undefined ? item.value : item;
        
        await DB.saveSetting(key, value);
        
        completed++;
        updateProgress('settings', completed, total, 'processing');
        
        await new Promise(r => setTimeout(r, 5));
        
      } catch (err) {
        errors.push({ key: item.key || 'unknown', error: err.message });
        completed++;
        updateProgress('settings', completed, total, 'processing');
      }
    }
    
    migrationStatus.settings.errors = errors;
    migrationStatus.settings.status = errors.length > 0 ? 'completed_with_errors' : 'completed';
    updateProgress('settings', total, total, migrationStatus.settings.status);
    
    return { success: errors.length === 0, total, errors: errors.length };
    
  } catch (err) {
    migrationStatus.settings.status = 'failed';
    migrationStatus.settings.errors = [{ error: err.message }];
    updateProgress('settings', 0, 0, 'failed');
    throw err;
  }
}

/**
 * 执行完整迁移
 * @param {Object} files - 包含 photos, contents, settings 文件的 File 对象
 */
async function runFullMigration(files) {
  // 健康检查
  try {
    await healthCheck();
  } catch (err) {
    if (onCompleteCallback) {
      onCompleteCallback(null, migrationStatus, err);
    }
    return { success: false, error: err.message };
  }
  
  const results = {};
  
  // 重置状态
  migrationStatus = {
    photos: { status: 'pending', total: 0, completed: 0, errors: [] },
    contents: { status: 'pending', total: 0, completed: 0, errors: [] },
    settings: { status: 'pending', total: 0, completed: 0, errors: [] }
  };
  
  try {
    if (files.photos) {
      results.photos = await migratePhotos(files.photos);
    }
    if (files.contents) {
      results.contents = await migrateContents(files.contents);
    }
    if (files.settings) {
      results.settings = await migrateSettings(files.settings);
    }
    
    if (onCompleteCallback) {
      onCompleteCallback(results, migrationStatus);
    }
    
    return { success: true, results };
    
  } catch (err) {
    console.error('迁移失败:', err);
    if (onCompleteCallback) {
      onCompleteCallback(null, migrationStatus, err);
    }
    return { success: false, error: err.message };
  }
}

/**
 * 检查 IndexedDB 中是否有数据
 */
async function checkExistingData() {
  const photos = await DB.getAllPhotos();
  const contents = await DB.getAllContents();
  const settings = await DB.getAllSettings();
  
  return {
    hasPhotos: photos.length > 0,
    hasContents: contents.length > 0,
    hasSettings: settings.length > 0,
    photoCount: photos.length,
    contentCount: contents.length,
    settingCount: settings.length
  };
}

/**
 * 清空所有数据（迁移前清理）
 */
async function clearAllData() {
  if (confirm('⚠️ 确定要清空所有现有数据吗？此操作不可恢复！')) {
    await DB.clearAllData();
    return true;
  }
  return false;
}

// 导出函数
window.MigrationTool = {
  setCallbacks,
  runFullMigration,
  checkExistingData,
  clearAllData,
  getStatus: () => migrationStatus,
  healthCheck
};

// 扩展 DB 对象，添加 savePhotoFromDataUrl 方法（如果不存在）
if (!DB.savePhotoFromDataUrl) {
  DB.savePhotoFromDataUrl = async function(dataUrl, category, metadata = {}) {
    return new Promise(async (resolve, reject) => {
      try {
        const response = await fetch(dataUrl);
        const blob = await response.blob();
        const file = new File([blob], metadata.filename || 'migrated_photo.jpg', { type: blob.type });
        
        const photoData = {
          filename: file.name,
          size: file.size,
          type: file.type,
          category: category || '未分类',
          uploadDate: metadata.uploadDate || new Date().toISOString(),
          dataUrl: dataUrl
        };
        
        const db = await DB.openDatabase();
        const transaction = db.transaction([DB.STORES.PHOTOS], 'readwrite');
        const store = transaction.objectStore(DB.STORES.PHOTOS);
        const request = store.add(photoData);
        
        request.onsuccess = () => {
          photoData.id = request.result;
          resolve(photoData);
        };
        request.onerror = () => reject(request.error);
        
      } catch (err) {
        reject(err);
      }
    });
  };
}

// 扩展 DB 对象，添加 getAllContents 方法
if (!DB.getAllContents) {
  DB.getAllContents = async function() {
    return new Promise(async (resolve, reject) => {
      try {
        const db = await DB.openDatabase();
        const transaction = db.transaction([DB.STORES.CONTENTS], 'readonly');
        const store = transaction.objectStore(DB.STORES.CONTENTS);
        const request = store.getAll();
        
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
        
      } catch (err) {
        reject(err);
      }
    });
  };
}

// 扩展 DB 对象，添加 getAllSettings 方法
if (!DB.getAllSettings) {
  DB.getAllSettings = async function() {
    return new Promise(async (resolve, reject) => {
      try {
        const db = await DB.openDatabase();
        const transaction = db.transaction([DB.STORES.SETTINGS], 'readonly');
        const store = transaction.objectStore(DB.STORES.SETTINGS);
        const request = store.getAll();
        
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
        
      } catch (err) {
        reject(err);
      }
    });
  };
}