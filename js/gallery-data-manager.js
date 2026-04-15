/**
 * 王子殿下网站 - 相册数据管理器
 * 支持三级目录系统的照片数据管理
 */

class GalleryDataManager {
    constructor() {
        this.data = null;
        this.currentCategory = 'all';
        this.currentSubdirectory = null;
        this.init();
    }
    
    /**
     * 初始化数据管理器
     */
    async init() {
        console.log('📊 相册数据管理器初始化...');
        
        try {
            // 尝试加载新的数据结构
            const response = await fetch('data/photos-new.json');
            if (response.ok) {
                this.data = await response.json();
                console.log('✅ 加载新的相册数据结构成功');
            } else {
                // 回退到旧的数据结构
                await this.loadLegacyData();
            }
        } catch (error) {
            console.warn('⚠️ 无法加载新的数据结构，使用旧数据:', error);
            await this.loadLegacyData();
        }
        
        // 初始化默认值
        this.currentCategory = 'all';
        this.currentSubdirectory = null;
        
        // 监听分类变化
        this.setupEventListeners();
    }
    
    /**
     * 加载旧版数据并转换为新格式
     */
    async loadLegacyData() {
        try {
            const response = await fetch('data/photos.json');
            const legacyData = await response.json();
            
            // 转换为新格式
            this.data = this.convertLegacyToNewFormat(legacyData);
            console.log('✅ 旧数据转换成功');
        } catch (error) {
            console.error('❌ 加载相册数据失败:', error);
            this.data = this.createEmptyData();
        }
    }
    
    /**
     * 将旧格式转换为新格式
     */
    convertLegacyToNewFormat(legacyData) {
        const newData = {
            categories: {
                travel: {
                    name: '旅行记录',
                    description: '各地旅行拍摄的照片',
                    icon: 'fas fa-plane',
                    subdirectories: {}
                },
                nature: {
                    name: '自然风光',
                    description: '整合原黄山风景，包含所有自然景观',
                    icon: 'fas fa-mountain-sun',
                    subdirectories: {}
                },
                personal: {
                    name: '个人风采',
                    description: '个人照片和肖像',
                    icon: 'fas fa-user-tie',
                    subdirectories: {}
                },
                daily: {
                    name: '日常生活',
                    description: '记录日常美好时刻',
                    icon: 'fas fa-home',
                    subdirectories: {}
                }
            },
            photos: []
        };
        
        // 转换照片数据
        Object.entries(legacyData).forEach(([category, photos]) => {
            if (Array.isArray(photos)) {
                photos.forEach(photo => {
                    // 确定新分类
                    let newCategory = 'nature'; // 默认自然风光
                    let subdirectory = null;
                    
                    if (category.includes('黄山') || photo.category === 'huangshan') {
                        newCategory = 'travel';
                        subdirectory = 'huangshan';
                    } else if (category.includes('travel') || photo.category === 'travel') {
                        newCategory = 'travel';
                        subdirectory = 'general';
                    } else if (category.includes('daily') || photo.category === 'daily') {
                        newCategory = 'daily';
                        subdirectory = 'general';
                    } else if (category.includes('work') || photo.category === 'work') {
                        newCategory = 'daily';
                        subdirectory = 'work';
                    }
                    
                    // 确保子目录存在
                    if (subdirectory && !newData.categories[newCategory].subdirectories[subdirectory]) {
                        newData.categories[newCategory].subdirectories[subdirectory] = {
                            name: this.getSubdirectoryName(subdirectory),
                            description: `${this.getSubdirectoryName(subdirectory)}照片`,
                            photos: []
                        };
                    }
                    
                    // 添加照片
                    const newPhoto = {
                        ...photo,
                        category: newCategory,
                        subdirectory: subdirectory
                    };
                    
                    newData.photos.push(newPhoto);
                });
            }
        });
        
        return newData;
    }
    
    /**
     * 获取子目录名称
     */
    getSubdirectoryName(key) {
        const names = {
            'huangshan': '黄山风景',
            'general': '通用',
            'work': '工作日常',
            'mountains': '山脉风光',
            'lakes': '湖泊河流',
            'forests': '森林草原',
            'portraits': '正式肖像',
            'casual': '生活随拍',
            'activities': '活动记录',
            'breakfast': '早餐记录',
            'weekend': '周末休闲'
        };
        
        return names[key] || key;
    }
    
    /**
     * 创建空数据结构
     */
    createEmptyData() {
        return {
            categories: {
                travel: {
                    name: '旅行记录',
                    description: '各地旅行拍摄的照片',
                    icon: 'fas fa-plane',
                    subdirectories: {}
                },
                nature: {
                    name: '自然风光',
                    description: '整合原黄山风景，包含所有自然景观',
                    icon: 'fas fa-mountain-sun',
                    subdirectories: {}
                },
                personal: {
                    name: '个人风采',
                    description: '个人照片和肖像',
                    icon: 'fas fa-user-tie',
                    subdirectories: {}
                },
                daily: {
                    name: '日常生活',
                    description: '记录日常美好时刻',
                    icon: 'fas fa-home',
                    subdirectories: {}
                }
            },
            photos: []
        };
    }
    
    /**
     * 设置事件监听器
     */
    setupEventListeners() {
        // 监听分类变化 - 使用唯一的事件名避免冲突
        document.addEventListener('gallery-category-changed', (event) => {
            console.log('📁 数据管理器收到分类变化事件:', event.detail);
            this.currentCategory = event.detail.category;
            this.currentSubdirectory = null;
            // 同时更新全局变量，供CMS使用
            window.currentSubdirectory = null;
            this.updateSubdirectoryList();
            
            // 立即过滤照片
            this.filterPhotos();
        });
        
        // 监听子目录变化 - 使用唯一的事件名
        document.addEventListener('gallery-subdirectory-changed', (event) => {
            console.log('📂 数据管理器收到子目录变化事件:', event.detail);
            this.currentSubdirectory = event.detail.subdirectory;
            // 同时更新全局变量，供CMS使用
            window.currentSubdirectory = event.detail.subdirectory;
            this.filterPhotos();
        });
    }
    
    /**
     * 更新子目录列表
     */
    updateSubdirectoryList() {
        if (this.currentCategory === 'all') {
            // 隐藏子目录导航
            const nav = document.getElementById('subdirectory-nav');
            if (nav) nav.style.display = 'none';
            return;
        }
        
        const category = this.data.categories[this.currentCategory];
        if (!category) return;
        
        // 显示子目录导航
        const nav = document.getElementById('subdirectory-nav');
        const list = document.getElementById('subdirectory-list');
        const currentCategory = document.getElementById('current-category');
        
        if (nav && list && currentCategory) {
            currentCategory.textContent = category.name;
            list.innerHTML = '';
            
            // 添加"全部"选项
            const allItem = this.createSubdirectoryItem('全部', true);
            list.appendChild(allItem);
            
            // 添加子目录项
            Object.entries(category.subdirectories).forEach(([key, subdir]) => {
                const item = this.createSubdirectoryItem(subdir.name, false, key);
                list.appendChild(item);
            });
            
            nav.style.display = 'block';
        }
    }
    
    /**
     * 创建子目录项
     */
    createSubdirectoryItem(name, isAll = false, key = null) {
        const item = document.createElement('div');
        item.className = 'subdirectory-item';
        item.style.cssText = `
            padding: 8px 16px;
            background: ${isAll ? 'linear-gradient(135deg, #8B4513, #D4AF37)' : 'white'};
            color: ${isAll ? 'white' : '#333'};
            border-radius: 20px;
            cursor: pointer;
            font-size: 14px;
            font-weight: ${isAll ? '600' : '500'};
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            transition: all 0.3s ease;
            border: 1px solid ${isAll ? 'transparent' : '#e0e0e0'};
        `;
        
        item.innerHTML = `
            <i class="fas ${isAll ? 'fa-th-large' : 'fa-folder'}"></i>
            ${name}
        `;
        
        item.addEventListener('click', () => {
            // 移除所有子目录项的激活状态
            document.querySelectorAll('.subdirectory-item').forEach(el => {
                el.style.background = 'white';
                el.style.color = '#333';
                el.style.border = '1px solid #e0e0e0';
            });
            
            // 设置当前项为激活状态
            item.style.background = 'linear-gradient(135deg, #4CAF50, #2E7D32)';
            item.style.color = 'white';
            item.style.border = '1px solid #2E7D32';
            item.style.boxShadow = '0 4px 12px rgba(76, 175, 80, 0.3)';
            
            // 触发子目录变化事件 - 使用唯一的事件名
            const event = new CustomEvent('gallery-subdirectory-changed', {
                detail: {
                    subdirectory: isAll ? null : key,
                    name: name
                }
            });
            document.dispatchEvent(event);
        });
        
        return item;
    }
    
    /**
     * 过滤照片
     */
    filterPhotos() {
        const filteredPhotos = this.getFilteredPhotos();
        this.displayPhotos(filteredPhotos);
    }
    
    /**
     * 获取过滤后的照片
     */
    getFilteredPhotos() {
        if (!this.data || !this.data.photos) return [];
        
        return this.data.photos.filter(photo => {
            if (this.currentCategory === 'all') return true;
            
            if (photo.category !== this.currentCategory) return false;
            
            if (this.currentSubdirectory) {
                return photo.subdirectory === this.currentSubdirectory;
            }
            
            return true;
        });
    }
    
    /**
     * 显示照片
     */
    displayPhotos(photos) {
        const gallery = document.getElementById('photoGallery');
        if (!gallery) return;
        
        gallery.innerHTML = '';
        
        if (photos.length === 0) {
            gallery.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #666;">
                    <i class="fas fa-images" style="font-size: 48px; margin-bottom: 20px; opacity: 0.3;"></i>
                    <h3>暂无照片</h3>
                    <p>请上传照片或选择其他分类</p>
                </div>
            `;
            return;
        }
        
        photos.forEach(photo => {
            const item = this.createPhotoItem(photo);
            gallery.appendChild(item);
        });
    }
    
    /**
     * 创建照片项
     */
    createPhotoItem(photo) {
        const item = document.createElement('div');
        item.className = 'gallery-item';
        item.style.cssText = `
            position: relative;
            overflow: hidden;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            transition: transform 0.3s ease;
        `;
        
        item.innerHTML = `
            <div class="photo-item" style="position: relative;">
                ${photo.fileType.startsWith('video/') ? 
                    `<video src="${photo.src}" style="width: 100%; height: 200px; object-fit: cover;" controls></video>` :
                    `<img src="${photo.src}" alt="${photo.title}" style="width: 100%; height: 200px; object-fit: cover;">`
                }
                <div style="padding: 12px; background: white;">
                    <h4 style="margin: 0 0 5px 0; font-size: 14px; color: #333;">${photo.title}</h4>
                    <p style="margin: 0; font-size: 12px; color: #666;">${photo.description || '无描述'}</p>
                    <div style="margin-top: 8px; font-size: 11px; color: #999;">
                        ${new Date(photo.uploadDate).toLocaleDateString('zh-CN')}
                    </div>
                </div>
            </div>
        `;
        
        return item;
    }
    
    /**
     * 添加照片
     */
    addPhoto(photoData) {
        // 生成ID
        const id = Date.now();
        const newPhoto = {
            id: id,
            ...photoData,
            uploadDate: new Date().toISOString()
        };
        
        // 添加到数据
        this.data.photos.push(newPhoto);
        
        // 保存数据
        this.saveData();
        
        // 更新显示
        this.filterPhotos();
        
        return newPhoto;
    }
    
    /**
     * 删除照片
     */
    deletePhoto(photoId) {
        const index = this.data.photos.findIndex(photo => photo.id === photoId);
        if (index !== -1) {
            this.data.photos.splice(index, 1);
            this.saveData();
            this.filterPhotos();
            return true;
        }
        return false;
    }
    
    /**
     * 保存数据
     */
    async saveData() {
        try {
            // 这里应该实现保存到服务器的逻辑
            // 暂时只更新内存中的数据
            console.log('💾 相册数据已更新（内存中）');
            
            // 触发数据更新事件
            const event = new CustomEvent('gallery-data-updated', {
                detail: { data: this.data }
            });
            document.dispatchEvent(event);
        } catch (error) {
            console.error('❌ 保存相册数据失败:', error);
        }
    }
    
    /**
     * 添加子目录
     */
    addSubdirectory(category, name, description = '') {
        if (!this.data.categories[category]) {
            console.error(`❌ 分类不存在: ${category}`);
            return false;
        }
        
        // 生成key
        const key = name.toLowerCase().replace(/[^a-z0-9]/g, '_');
        
        // 添加子目录
        this.data.categories[category].subdirectories[key] = {
            name: name,
            description: description || `${name}照片`,
            photos: []
        };
        
        // 保存数据
        this.saveData();
        
        // 更新显示
        this.updateSubdirectoryList();
        
        return key;
    }
}

// 创建全局实例
window.galleryDataManager = new GalleryDataManager();