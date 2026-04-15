/**
 * IndexedDB 核心数据库封装
 * 版本: 1.0
 * 功能: 照片存储、文字内容存储、设置存储
 * 路径: js/db-core.js
 */

const DB_NAME = 'LocalWebsiteDB';
const DB_VERSION = 1;

// 存储对象名称
const STORES = {
    PHOTOS: 'photos',      // 照片存储
    CONTENTS: 'contents',  // 文字内容存储
    SETTINGS: 'settings'   // 设置存储（头像位置等）
};

// 默认分类
const DEFAULT_CATEGORIES = ['自然风光', '个人风采', '日常生活', '旅行记录'];

/**
 * 打开/创建数据库
 * @returns {Promise<IDBDatabase>}
 */
function openDatabase() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        
        request.onerror = () => {
            console.error('数据库打开失败:', request.error);
            reject(request.error);
        };
        
        request.onsuccess = () => {
            console.log('数据库打开成功');
            resolve(request.result);
        };
        
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            console.log('创建/升级数据库...');
            
            // 创建照片存储
            if (!db.objectStoreNames.contains(STORES.PHOTOS)) {
                const photoStore = db.createObjectStore(STORES.PHOTOS, {
                    keyPath: 'id',
                    autoIncrement: true
                });
                photoStore.createIndex('category', 'category', { unique: false });
                photoStore.createIndex('uploadDate', 'uploadDate', { unique: false });
                photoStore.createIndex('filename', 'filename', { unique: false });
                console.log('照片存储创建完成');
            }
            
            // 创建内容存储
            if (!db.objectStoreNames.contains(STORES.CONTENTS)) {
                const contentStore = db.createObjectStore(STORES.CONTENTS, {
                    keyPath: 'key'
                });
                contentStore.createIndex('lastModified', 'lastModified', { unique: false });
                console.log('内容存储创建完成');
            }
            
            // 创建设置存储
            if (!db.objectStoreNames.contains(STORES.SETTINGS)) {
                const settingStore = db.createObjectStore(STORES.SETTINGS, {
                    keyPath: 'key'
                });
                console.log('设置存储创建完成');
            }
        };
    });
}

/**
 * 保存照片到数据库
 * @param {File} file - 图片文件
 * @param {string} category - 分类名称
 * @returns {Promise<Object>} 保存的照片记录
 */
async function savePhoto(file, category) {
    return new Promise(async (resolve, reject) => {
        try {
            const db = await openDatabase();
            const reader = new FileReader();
            
            reader.onload = async (event) => {
                const photoData = {
                    filename: file.name,
                    size: file.size,
                    type: file.type,
                    category: category || '未分类',
                    uploadDate: new Date().toISOString(),
                    blob: event.target.result // Base64 格式存储
                };
                
                const transaction = db.transaction([STORES.PHOTOS], 'readwrite');
                const store = transaction.objectStore(STORES.PHOTOS);
                const request = store.add(photoData);
                
                request.onsuccess = () => {
                    console.log('照片保存成功, ID:', request.result);
                    photoData.id = request.result;
                    resolve(photoData);
                };
                
                request.onerror = () => {
                    console.error('照片保存失败:', request.error);
                    reject(request.error);
                };
            };
            
            reader.onerror = () => {
                reject(reader.error);
            };
            
            reader.readAsDataURL(file);
        } catch (error) {
            reject(error);
        }
    });
}

/**
 * 获取所有照片
 * @returns {Promise<Array>} 照片列表
 */
async function getAllPhotos() {
    return new Promise(async (resolve, reject) => {
        try {
            const db = await openDatabase();
            const transaction = db.transaction([STORES.PHOTOS], 'readonly');
            const store = transaction.objectStore(STORES.PHOTOS);
            const request = store.getAll();
            
            request.onsuccess = () => {
                console.log('获取照片成功，数量:', request.result.length);
                resolve(request.result);
            };
            
            request.onerror = () => {
                console.error('获取照片失败:', request.error);
                reject(request.error);
            };
        } catch (error) {
            reject(error);
        }
    });
}

/**
 * 按分类获取照片
 * @param {string} category - 分类名称
 * @returns {Promise<Array>}
 */
async function getPhotosByCategory(category) {
    return new Promise(async (resolve, reject) => {
        try {
            const db = await openDatabase();
            const transaction = db.transaction([STORES.PHOTOS], 'readonly');
            const store = transaction.objectStore(STORES.PHOTOS);
            const index = store.index('category');
            const request = index.getAll(category);
            
            request.onsuccess = () => {
                console.log(`获取分类"${category}"照片成功，数量:`, request.result.length);
                resolve(request.result);
            };
            
            request.onerror = () => {
                console.error('按分类获取照片失败:', request.error);
                reject(request.error);
            };
        } catch (error) {
            reject(error);
        }
    });
}

/**
 * 删除照片
 * @param {number} id - 照片ID
 * @returns {Promise<void>}
 */
async function deletePhoto(id) {
    return new Promise(async (resolve, reject) => {
        try {
            const db = await openDatabase();
            const transaction = db.transaction([STORES.PHOTOS], 'readwrite');
            const store = transaction.objectStore(STORES.PHOTOS);
            const request = store.delete(id);
            
            request.onsuccess = () => {
                console.log('照片删除成功, ID:', id);
                resolve();
            };
            
            request.onerror = () => {
                console.error('照片删除失败:', request.error);
                reject(request.error);
            };
        } catch (error) {
            reject(error);
        }
    });
}

/**
 * 批量删除照片
 * @param {Array<number>} ids - 照片ID数组
 * @returns {Promise<void>}
 */
async function deletePhotos(ids) {
    for (const id of ids) {
        await deletePhoto(id);
    }
}

/**
 * 保存文字内容
 * @param {string} key - 内容标识（如 'index.html' 或 '#intro-text'）
 * @param {string} content - HTML内容
 * @returns {Promise<void>}
 */
async function saveContent(key, content) {
    return new Promise(async (resolve, reject) => {
        try {
            const db = await openDatabase();
            const transaction = db.transaction([STORES.CONTENTS], 'readwrite');
            const store = transaction.objectStore(STORES.CONTENTS);
            const record = {
                key: key,
                content: content,
                lastModified: new Date().toISOString()
            };
            
            const request = store.put(record);
            
            request.onsuccess = () => {
                console.log('内容保存成功:', key);
                resolve();
            };
            
            request.onerror = () => {
                console.error('内容保存失败:', request.error);
                reject(request.error);
            };
        } catch (error) {
            reject(error);
        }
    });
}

/**
 * 获取文字内容
 * @param {string} key - 内容标识
 * @returns {Promise<string|null>}
 */
async function getContent(key) {
    return new Promise(async (resolve, reject) => {
        try {
            const db = await openDatabase();
            const transaction = db.transaction([STORES.CONTENTS], 'readonly');
            const store = transaction.objectStore(STORES.CONTENTS);
            const request = store.get(key);
            
            request.onsuccess = () => {
                const result = request.result;
                resolve(result ? result.content : null);
            };
            
            request.onerror = () => {
                console.error('获取内容失败:', request.error);
                reject(request.error);
            };
        } catch (error) {
            reject(error);
        }
    });
}

/**
 * 保存设置
 * @param {string} key - 设置键名
 * @param {any} value - 设置值
 * @returns {Promise<void>}
 */
async function saveSetting(key, value) {
    return new Promise(async (resolve, reject) => {
        try {
            const db = await openDatabase();
            const transaction = db.transaction([STORES.SETTINGS], 'readwrite');
            const store = transaction.objectStore(STORES.SETTINGS);
            const record = {
                key: key,
                value: value,
                lastModified: new Date().toISOString()
            };
            
            const request = store.put(record);
            
            request.onsuccess = () => {
                console.log('设置保存成功:', key);
                resolve();
            };
            
            request.onerror = () => {
                console.error('设置保存失败:', request.error);
                reject(request.error);
            };
        } catch (error) {
            reject(error);
        }
    });
}

/**
 * 获取设置
 * @param {string} key - 设置键名
 * @returns {Promise<any|null>}
 */
async function getSetting(key) {
    return new Promise(async (resolve, reject) => {
        try {
            const db = await openDatabase();
            const transaction = db.transaction([STORES.SETTINGS], 'readonly');
            const store = transaction.objectStore(STORES.SETTINGS);
            const request = store.get(key);
            
            request.onsuccess = () => {
                const result = request.result;
                resolve(result ? result.value : null);
            };
            
            request.onerror = () => {
                console.error('获取设置失败:', request.error);
                reject(request.error);
            };
        } catch (error) {
            reject(error);
        }
    });
}

/**
 * 清空所有数据（谨慎使用）
 */
async function clearAllData() {
    return new Promise(async (resolve, reject) => {
        try {
            const db = await openDatabase();
            const stores = Object.values(STORES);
            
            for (const storeName of stores) {
                const transaction = db.transaction([storeName], 'readwrite');
                const store = transaction.objectStore(storeName);
                store.clear();
                console.log(`清空存储: ${storeName}`);
            }
            
            resolve();
        } catch (error) {
            reject(error);
        }
    });
}

// 导出函数
window.DB = {
    openDatabase,
    savePhoto,
    getAllPhotos,
    getPhotosByCategory,
    deletePhoto,
    deletePhotos,
    saveContent,
    getContent,
    saveSetting,
    getSetting,
    clearAllData,
    STORES,
    DEFAULT_CATEGORIES
};