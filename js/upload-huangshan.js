// 黄山图片上传管理
class HuangshanUploader {
    constructor() {
        this.files = [];
        this.maxFileSize = 5 * 1024 * 1024; // 5MB
        this.supportedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        this.huangshanFolder = 'images/黄山/';
        this.init();
    }
    
    // 初始化
    init() {
        this.setupEventListeners();
        this.loadCurrentFiles();
        this.updateUI();
    }
    
    // 设置事件监听器
    setupEventListeners() {
        const uploadArea = document.getElementById('uploadArea');
        const fileInput = document.getElementById('fileInput');
        const uploadBtn = document.getElementById('uploadBtn');
        const cancelBtn = document.getElementById('cancelBtn');
        
        if (uploadArea && fileInput) {
            // 点击上传区域
            uploadArea.addEventListener('click', () => fileInput.click());
            
            // 拖放功能
            uploadArea.addEventListener('dragover', (e) => {
                e.preventDefault();
                uploadArea.style.borderColor = 'var(--secondary-color)';
                uploadArea.style.background = 'rgba(212, 175, 55, 0.15)';
            });
            
            uploadArea.addEventListener('dragleave', () => {
                uploadArea.style.borderColor = 'var(--primary-color)';
                uploadArea.style.background = 'rgba(212, 175, 55, 0.05)';
            });
            
            uploadArea.addEventListener('drop', (e) => {
                e.preventDefault();
                uploadArea.style.borderColor = 'var(--primary-color)';
                uploadArea.style.background = 'rgba(212, 175, 55, 0.05)';
                
                if (e.dataTransfer.files.length) {
                    this.handleFiles(e.dataTransfer.files);
                }
            });
            
            // 文件选择变化
            fileInput.addEventListener('change', (e) => {
                if (e.target.files.length) {
                    this.handleFiles(e.target.files);
                }
            });
        }
        
        if (uploadBtn) {
            uploadBtn.addEventListener('click', () => this.uploadFiles());
        }
        
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.clearFiles());
        }
    }
    
    // 处理选择的文件
    handleFiles(fileList) {
        const newFiles = Array.from(fileList);
        let validFiles = [];
        let invalidFiles = [];
        
        // 验证文件
        newFiles.forEach(file => {
            if (!this.supportedTypes.includes(file.type)) {
                invalidFiles.push(`${file.name} - 不支持的文件格式`);
            } else if (file.size > this.maxFileSize) {
                invalidFiles.push(`${file.name} - 文件大小超过5MB`);
            } else {
                validFiles.push(file);
            }
        });
        
        // 显示错误信息
        if (invalidFiles.length > 0) {
            this.showMessage(`以下文件不符合要求：<br>${invalidFiles.join('<br>')}`, 'error');
        }
        
        // 添加有效文件
        if (validFiles.length > 0) {
            this.files = [...this.files, ...validFiles];
            this.updateUI();
            this.showMessage(`已选择 ${validFiles.length} 个文件，共 ${this.files.length} 个文件待上传`, 'info');
        }
    }
    
    // 更新UI
    updateUI() {
        const uploadBtn = document.getElementById('uploadBtn');
        const fileList = document.getElementById('fileList');
        
        // 更新上传按钮状态
        if (uploadBtn) {
            uploadBtn.disabled = this.files.length === 0;
        }
        
        // 更新文件列表
        if (fileList) {
            fileList.innerHTML = '';
            
            if (this.files.length === 0) {
                fileList.innerHTML = '<p style="text-align: center; color: var(--text-light); padding: 2rem;">暂无文件</p>';
                return;
            }
            
            this.files.forEach((file, index) => {
                const fileItem = this.createFileItem(file, index);
                fileList.appendChild(fileItem);
            });
        }
    }
    
    // 创建文件项
    createFileItem(file, index) {
        const item = document.createElement('div');
        item.className = 'file-item';
        item.dataset.index = index;
        
        const fileSize = this.formatFileSize(file.size);
        const fileName = this.getHuangshanFileName(index);
        
        item.innerHTML = `
            <div class="file-info">
                <div class="file-icon">
                    <i class="fas fa-image"></i>
                </div>
                <div>
                    <div class="file-name">${fileName}</div>
                    <div class="file-size">${fileSize} • ${file.type.replace('image/', '').toUpperCase()}</div>
                    <div class="upload-progress">
                        <div class="progress-bar" id="progress-${index}"></div>
                    </div>
                </div>
            </div>
            <button class="btn-cancel" onclick="huangshanUploader.removeFile(${index})" style="padding: 0.3rem 0.8rem; font-size: 0.9rem;">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        return item;
    }
    
    // 获取黄山文件名
    getHuangshanFileName(index) {
        // 查找已存在的黄山文件数量
        const existingCount = this.getExistingFileCount();
        const fileNumber = existingCount + index + 1;
        return `黄山${fileNumber}.${this.getFileExtension(this.files[index])}`;
    }
    
    // 获取文件扩展名
    getFileExtension(file) {
        const ext = file.name.split('.').pop().toLowerCase();
        return ext === 'jpg' ? 'jpg' : ext;
    }
    
    // 获取已存在的文件数量
    getExistingFileCount() {
        // 这里应该从服务器获取，暂时返回0
        return 0;
    }
    
    // 格式化文件大小
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    // 移除文件
    removeFile(index) {
        this.files.splice(index, 1);
        this.updateUI();
        this.showMessage('文件已移除', 'info');
    }
    
    // 清空文件
    clearFiles() {
        this.files = [];
        this.updateUI();
        const fileInput = document.getElementById('fileInput');
        if (fileInput) fileInput.value = '';
        this.showMessage('已清空所有文件', 'info');
    }
    
    // 上传文件
    async uploadFiles() {
        if (this.files.length === 0) return;
        
        this.showMessage('开始上传文件...', 'info');
        
        // 模拟上传过程
        for (let i = 0; i < this.files.length; i++) {
            await this.uploadFile(this.files[i], i);
        }
        
        this.showMessage(`成功上传 ${this.files.length} 个文件到黄山相册！`, 'success');
        this.clearFiles();
        this.loadCurrentFiles();
        
        // 提示用户刷新相册页面
        setTimeout(() => {
            this.showMessage('请刷新 <a href="gallery.html" style="color: var(--secondary-color); font-weight: bold;">相册页面</a> 查看上传的图片', 'info');
        }, 2000);
    }
    
    // 上传单个文件
    uploadFile(file, index) {
        return new Promise((resolve) => {
            // 模拟上传进度
            let progress = 0;
            const progressBar = document.getElementById(`progress-${index}`);
            const interval = setInterval(() => {
                progress += Math.random() * 20;
                if (progress > 100) {
                    progress = 100;
                    clearInterval(interval);
                    
                    // 在实际应用中，这里应该将文件上传到服务器
                    // 由于浏览器限制，我们只能模拟上传过程
                    this.saveFileLocally(file, index).then(resolve);
                }
                
                if (progressBar) {
                    progressBar.style.width = `${progress}%`;
                }
            }, 100);
        });
    }
    
    // 模拟保存文件到本地（实际应用中需要服务器支持）
    async saveFileLocally(file, index) {
        // 在实际应用中，这里应该使用FormData和fetch上传到服务器
        // 由于我们是在本地文件系统，只能提供下载功能
        
        const fileName = this.getHuangshanFileName(index);
        const blob = new Blob([file], { type: file.type });
        const url = URL.createObjectURL(blob);
        
        // 创建下载链接（实际应用中应该上传到服务器）
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        // 显示保存提示
        console.log(`文件已保存为: ${fileName}`);
        
        // 在实际应用中，这里应该返回服务器响应
        return { success: true, filename: fileName };
    }
    
    // 加载当前文件
    loadCurrentFiles() {
        const currentFiles = document.getElementById('currentFiles');
        if (!currentFiles) return;
        
        // 模拟加载现有文件
        // 在实际应用中，这里应该从服务器获取文件列表
        currentFiles.innerHTML = `
            <div class="file-preview">
                <div style="height: 120px; background: #f5f5f5; display: flex; align-items: center; justify-content: center; color: #999;">
                    <i class="fas fa-image" style="font-size: 2rem;"></i>
                </div>
                <div class="file-name">黄山1.jpg</div>
            </div>
            <div class="file-preview">
                <div style="height: 120px; background: #f5f5f5; display: flex; align-items: center; justify-content: center; color: #999;">
                    <i class="fas fa-image" style="font-size: 2rem;"></i>
                </div>
                <div class="file-name">黄山2.jpg</div>
            </div>
            <div class="file-preview">
                <div style="height: 120px; background: #f5f5f5; display: flex; align-items: center; justify-content: center; color: #999;">
                    <i class="fas fa-image" style="font-size: 2rem;"></i>
                </div>
                <div class="file-name">黄山3.jpg</div>
            </div>
        `;
    }
    
    // 显示消息
    showMessage(text, type = 'info') {
        const messageEl = document.getElementById('message');
        if (!messageEl) return;
        
        messageEl.className = `message ${type}`;
        messageEl.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${text}</span>
            <button onclick="this.parentElement.style.display='none'" style="margin-left: auto; background: none; border: none; color: inherit; cursor: pointer;">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        // 自动隐藏信息消息
        if (type === 'info') {
            setTimeout(() => {
                messageEl.style.display = 'none';
            }, 5000);
        }
    }
    
    // 手动上传说明
    showManualUploadInstructions() {
        const instructions = `
            <div style="background: rgba(139, 69, 19, 0.05); padding: 1.5rem; border-radius: var(--border-radius); margin-top: 2rem;">
                <h3 style="color: var(--primary-color); margin-top: 0;"><i class="fas fa-hands-helping"></i> 手动上传说明</h3>
                <p>由于浏览器安全限制，无法直接保存文件到本地文件夹。请按以下步骤操作：</p>
                <ol style="padding-left: 1.5rem; margin: 1rem 0;">
                    <li>点击"开始上传"按钮，文件将自动下载</li>
                    <li>打开文件夹：<code>C:\\Users\\Administrator\\Desktop\\网站\\images\\黄山\\</code></li>
                    <li>将下载的文件复制到该文件夹</li>
                    <li>按照提示重命名文件：黄山1.jpg, 黄山2.jpg 等</li>
                    <li>刷新相册页面查看效果</li>
                </ol>
                <p><strong>快速访问路径：</strong> <code>桌面 → 网站 → images → 黄山</code></p>
            </div>
        `;
        
        const container = document.querySelector('.upload-container');
        if (container) {
            const existingInstructions = document.querySelector('.manual-instructions');
            if (!existingInstructions) {
                const div = document.createElement('div');
                div.className = 'manual-instructions';
                div.innerHTML = instructions;
                container.appendChild(div);
            }
        }
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    window.huangshanUploader = new HuangshanUploader();
    
    // 添加手动上传说明
    setTimeout(() => {
        huangshanUploader.showManualUploadInstructions();
    }, 1000);
    
    // 控制台提示
    console.log('%c🏔️ 黄山图片上传页面已加载', 'color: #8B4513; font-size: 16px; font-weight: bold;');
    console.log('%c📁 黄山文件夹路径: C:\\Users\\Administrator\\Desktop\\网站\\images\\黄山\\', 'color: #4A6741;');
});