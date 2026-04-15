/**
 * 照片管理模块
 * 版本: 1.1
 * 依赖: db-core.js
 * 路径: js/photo/photo-manager.js
 */

// 当前选中的分类
let currentCategory = '全部';

// 当前显示的照片列表
let currentPhotos = [];

// 缩略图 URL 缓存（用于释放内存）
const thumbnailURLs = [];

// 并发控制：同时处理的最大缩略图数量
const MAX_CONCURRENT = 6;

/**
 * 释放所有缩略图 URL（防止内存泄漏）
 */
function revokeAllThumbnails() {
    for (const url of thumbnailURLs) {
        URL.revokeObjectURL(url);
    }
    thumbnailURLs.length = 0;
}

/**
 * 创建缩略图（接收 dataUrl 或 Blob）
 * @param {string|Blob} source - dataUrl 字符串或 Blob 对象
 * @returns {Promise<string>} 缩略图URL
 */
async function createThumbnail(source) {
    return new Promise((resolve, reject) => {
        // 统一转换为 Blob（如果是 dataUrl 则先转换）
        let blobPromise;
        if (typeof source === 'string') {
            blobPromise = fetch(source).then(res => res.blob());
        } else if (source instanceof Blob) {
            blobPromise = Promise.resolve(source);
        } else {
            reject(new Error('不支持的图片格式'));
            return;
        }
        
        blobPromise.then(blob => {
            const img = new Image();
            const url = URL.createObjectURL(blob);
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                const size = 200;
                canvas.width = size;
                canvas.height = size;
                const minSize = Math.min(img.width, img.height);
                const sx = (img.width - minSize) / 2;
                const sy = (img.height - minSize) / 2;
                ctx.drawImage(img, sx, sy, minSize, minSize, 0, 0, size, size);
                canvas.toBlob((thumbnailBlob) => {
                    const thumbnailUrl = URL.createObjectURL(thumbnailBlob);
                    thumbnailURLs.push(thumbnailUrl);
                    URL.revokeObjectURL(url);
                    resolve(thumbnailUrl);
                }, 'image/jpeg', 0.7);
            };
            img.onerror = reject;
            img.src = url;
        }).catch(reject);
    });
}

/**
 * 批量创建缩略图（并行，带并发控制）
 * @param {Array} photos - 照片列表
 * @returns {Promise<Array>} 带缩略图URL的照片列表
 */
async function batchCreateThumbnails(photos) {
    const results = [];
    const queue = [...photos];
    async function processNext() {
        while (queue.length > 0) {
            const photo = queue.shift();
            try {
                // 使用dataUrl字段创建缩略图
                const thumbnailUrl = await createThumbnail(photo.dataUrl);
                results.push({ ...photo, thumbnailUrl });
            } catch (error) {
                console.error('缩略图生成失败:', error);
                results.push({ ...photo, thumbnailUrl: null });
            }
        }
    }
    // 启动并发任务
    const workers = Array(Math.min(MAX_CONCURRENT, photos.length))
        .fill()
        .map(() => processNext());
    await Promise.all(workers);
    return results;
}

/**
 * 渲染照片列表
 * @param {Array} photos - 照片列表（每个元素应包含 dataUrl 字段）
 * @param {HTMLElement} container - 容器元素
 */
async function renderPhotos(photos, container) {
    if (!container) return;
    
    // 释放上一轮的缩略图 URL
    revokeAllThumbnails();
    container.innerHTML = '';
    
    if (photos.length === 0) {
        container.innerHTML = '<div class="empty-message">暂无照片，请点击上方按钮上传</div>';
        return;
    }
    
    // 并行生成缩略图（传入 dataUrl）
    const photosWithThumbnails = await batchCreateThumbnails(photos);
    
    // 渲染到页面
    for (const photo of photosWithThumbnails) {
        const photoCard = document.createElement('div');
        photoCard.className = 'photo-card';
        photoCard.dataset.id = photo.id;
        
        const thumbnailHtml = photo.thumbnailUrl ?
            `<img src="${photo.thumbnailUrl}" alt="${photo.filename}" class="photo-thumbnail">` :
            `<div class="photo-thumbnail error">图片加载失败</div>`;
        
        photoCard.innerHTML = `
            ${thumbnailHtml}
            <div class="photo-info">
                <div class="photo-filename" title="${photo.filename}">${photo.filename.substring(0, 20)}${photo.filename.length > 20 ? '...' : ''}</div>
                <div class="photo-category">分类: ${photo.category}</div>
                <div class="photo-date">上传: ${new Date(photo.uploadDate).toLocaleDateString()}</div>
            </div>
            <div class="photo-actions">
                <button class="btn-delete" data-id="${photo.id}" title="删除">🗑️</button>
            </div>
        `;
        
        container.appendChild(photoCard);
    }
    
    // 使用增强删除功能（如果可用）
    if (typeof EnhancedDelete !== 'undefined') {
        EnhancedDelete.init(container);
    } else {
        // 回退到基本删除功能
        container.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const id = parseInt(btn.dataset.id);
                if (confirm('确定要删除这张照片吗？')) {
                    await DB.deletePhoto(id);
                    await loadPhotos(currentCategory);
                }
            });
        });
    }
}

/**
 * 加载照片
 * @param {string} category - 分类名称
 */
async function loadPhotos(category = '全部') {
    currentCategory = category;
    let photos;
    if (category === '全部') {
        photos = await DB.getAllPhotos();
    } else {
        photos = await DB.getPhotosByCategory(category);
    }
    currentPhotos = photos;
    const container = document.getElementById('photoContainer');
    if (container) {
        await renderPhotos(photos, container);
    }
}

/**
 * 初始化照片管理器
 * @param {string} containerId - 容器元素ID
 */
async function initPhotoManager(containerId) {
    if (document.readyState === 'loading') {
        await new Promise(resolve => {
            document.addEventListener('DOMContentLoaded', resolve);
        });
    }
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`容器元素 #${containerId} 不存在`);
        return;
    }
    await loadPhotos('全部');
    const uploadBtn = document.getElementById('uploadPhotoBtn');
    const fileInput = document.getElementById('photoFileInput');
    if (uploadBtn && fileInput) {
        uploadBtn.addEventListener('click', () => {
            fileInput.click();
        });
        fileInput.addEventListener('change', async (e) => {
            const files = Array.from(e.target.files);
            const categorySelect = document.getElementById('photoCategory');
            const category = categorySelect ? categorySelect.value : '未分类';
            
            // 创建进度条容器
            const progressContainer = document.createElement('div');
            progressContainer.id = 'uploadProgressContainer';
            progressContainer.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: white;
                padding: 20px;
                border-radius: 10px;
                box-shadow: 0 5px 20px rgba(0,0,0,0.2);
                z-index: 10000;
                min-width: 300px;
                max-width: 500px;
            `;
            
            progressContainer.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                    <div style="font-weight: bold; color: #333;">📤 上传进度</div>
                    <button id="closeProgressBtn" style="background: none; border: none; font-size: 18px; cursor: pointer; color: #999; padding: 0 5px;">×</button>
                </div>
                <div id="uploadProgressBar" style="height: 20px; background: #f0f0f0; border-radius: 10px; overflow: hidden; margin-bottom: 10px;">
                    <div id="uploadProgressFill" style="height: 100%; width: 0%; background: linear-gradient(90deg, #4CAF50, #8BC34A); transition: width 0.3s ease;"></div>
                </div>
                <div id="uploadProgressText" style="text-align: center; font-size: 14px; color: #666;">准备上传...</div>
                <div id="uploadFileInfo" style="margin-top: 10px; font-size: 12px; color: #888; max-height: 100px; overflow-y: auto; padding: 5px; background: #f9f9f9; border-radius: 5px;"></div>
            `;
            
            // 添加关闭按钮事件
            progressContainer.querySelector('#closeProgressBtn').addEventListener('click', () => {
                progressContainer.remove();
            });
            
            document.body.appendChild(progressContainer);
            
            let uploadedCount = 0;
            const totalFiles = files.length;
            
            // 更新进度条
            function updateProgress(current, total, currentFile = '') {
                const percentage = Math.round((current / total) * 100);
                const progressFill = document.getElementById('uploadProgressFill');
                const progressText = document.getElementById('uploadProgressText');
                const fileInfo = document.getElementById('uploadFileInfo');
                
                if (progressFill) progressFill.style.width = `${percentage}%`;
                if (progressText) progressText.textContent = `上传中: ${current}/${total} (${percentage}%)`;
                if (fileInfo && currentFile) {
                    fileInfo.innerHTML += `<div>✓ ${currentFile}</div>`;
                    fileInfo.scrollTop = fileInfo.scrollHeight;
                }
            }
            
            try {
                for (let i = 0; i < files.length; i++) {
                    const file = files[i];
                    
                    // 更新当前文件信息
                    updateProgress(uploadedCount, totalFiles, `准备: ${file.name}`);
                    
                    if (!file.type.startsWith('image/')) {
                        const fileInfo = document.getElementById('uploadFileInfo');
                        if (fileInfo) {
                            fileInfo.innerHTML += `<div style="color: orange;">⚠️ ${file.name} 不是图片，已跳过</div>`;
                        }
                        continue;
                    }
                    
                    // 更新上传状态
                    updateProgress(uploadedCount, totalFiles, `上传中: ${file.name}`);
                    
                    // 上传文件
                    await DB.savePhoto(file, category);
                    uploadedCount++;
                    
                    // 更新进度
                    updateProgress(uploadedCount, totalFiles, `完成: ${file.name}`);
                }
                
                // 上传完成
                updateProgress(uploadedCount, totalFiles);
                const progressText = document.getElementById('uploadProgressText');
                if (progressText) {
                    progressText.textContent = `上传完成! ${uploadedCount}/${totalFiles} 个文件`;
                    progressText.style.color = '#4CAF50';
                    progressText.style.fontWeight = 'bold';
                }
                
                // 3秒后关闭进度条
                setTimeout(() => {
                    if (progressContainer.parentNode) {
                        progressContainer.remove();
                    }
                    fileInput.value = '';
                    loadPhotos(currentCategory);
                }, 3000);
                
            } catch (error) {
                console.error('上传错误:', error);
                const progressText = document.getElementById('uploadProgressText');
                if (progressText) {
                    progressText.textContent = `上传失败: ${error.message}`;
                    progressText.style.color = '#f44336';
                }
                
                // 5秒后关闭进度条
                setTimeout(() => {
                    if (progressContainer.parentNode) {
                        progressContainer.remove();
                    }
                }, 5000);
            }
        });
    }
    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter) {
        categoryFilter.addEventListener('change', async (e) => {
            await loadPhotos(e.target.value);
        });
    }
    console.log('照片管理器初始化完成');
}

// 导出函数
window.PhotoManager = {
    init: initPhotoManager,
    loadPhotos,
    renderPhotos,
    revokeAllThumbnails
};