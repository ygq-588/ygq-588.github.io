/**
 * 终极修复脚本 - 直接解决所有问题
 * 这个脚本会修复按钮激活、照片显示、数据同步等问题
 */

(function() {
    console.log('🚀 终极修复脚本开始执行');
    
    // 等待页面完全加载
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        setTimeout(init, 1000);
    }
    
    function init() {
        console.log('🔧 初始化终极修复');
        
        // 修复1：确保关键函数存在
        ensureCoreFunctions();
        
        // 修复2：修复按钮点击事件
        fixButtonClickEvents();
        
        // 修复3：确保数据同步
        ensureDataSync();
        
        // 修复4：监听编辑模式变化
        setupEditModeListeners();
        
        console.log('✅ 终极修复完成');
        showNotification('✅ 相册系统已修复完成！');
    }
    
    function ensureCoreFunctions() {
        console.log('🔧 确保核心函数存在...');
        
        // 1. addToGallery函数
        if (typeof window.addToGallery !== 'function') {
            console.log('⚠️ 创建addToGallery函数');
            window.addToGallery = function(imageData) {
                console.log(`➕ 添加新照片: ${imageData.title}`);
                
                // 确保数据
                if (!imageData.id) imageData.id = Date.now();
                if (!window.galleryData) window.galleryData = [];
                if (!window.currentFilter) window.currentFilter = 'all';
                
                // 添加到数组
                window.galleryData.push(imageData);
                console.log(`📊 照片添加成功，总数: ${window.galleryData.length}`);
                
                // 重新渲染
                if (typeof window.renderGallery === 'function') {
                    window.renderGallery(window.currentFilter);
                }
                
                return imageData.id;
            };
            console.log('✅ addToGallery函数已创建');
        }
        
        // 2. filterGallery函数
        if (typeof window.filterGallery !== 'function') {
            console.log('⚠️ 创建filterGallery函数');
            window.filterGallery = function(filter) {
                console.log(`🔍 筛选: ${filter}`);
                window.currentFilter = filter;
                
                // 更新按钮状态
                document.querySelectorAll('.filter-btn').forEach(btn => {
                    btn.classList.remove('active');
                    const btnFilter = btn.getAttribute('data-filter');
                    if (btnFilter === filter) {
                        btn.classList.add('active');
                        console.log(`🎯 按钮激活: ${btn.querySelector('h3')?.textContent || btn.textContent}`);
                    }
                });
                
                // 重新渲染
                if (typeof window.renderGallery === 'function') {
                    window.renderGallery(filter);
                }
            };
            console.log('✅ filterGallery函数已创建');
        }
        
        // 3. 如果renderGallery不存在，创建一个简单的
        if (typeof window.renderGallery !== 'function') {
            console.log('⚠️ 创建简单版renderGallery函数');
            window.renderGallery = function(filter) {
                console.log(`🎨 渲染相册，筛选: ${filter}`);
                
                const container = document.getElementById('photoGallery');
                if (!container) {
                    console.error('❌ 找不到相册容器');
                    return;
                }
                
                // 获取要显示的照片
                let photosToShow = [];
                if (window.galleryData && Array.isArray(window.galleryData)) {
                    if (filter === 'all') {
                        photosToShow = window.galleryData;
                    } else {
                        photosToShow = window.galleryData.filter(p => p.category === filter);
                    }
                }
                
                console.log(`📸 显示 ${photosToShow.length} 张照片`);
                
                // 清空并重新渲染
                container.innerHTML = '';
                photosToShow.forEach(photo => {
                    const photoItem = document.createElement('div');
                    photoItem.className = 'photo-item';
                    photoItem.dataset.photoId = photo.id;
                    
                    // 获取图片URL
                    let imageUrl = photo.src;
                    if (photo.dataUrl && photo.dataUrl.startsWith('data:image/')) {
                        imageUrl = photo.dataUrl;
                    }
                    
                    photoItem.innerHTML = `
                        <img src="${imageUrl}" alt="${photo.title}" 
                             style="width: 100%; height: 200px; object-fit: cover; border-radius: 8px;">
                        <div style="padding: 10px;">
                            <h4 style="margin: 0; font-size: 14px;">${photo.title}</h4>
                            <p style="margin: 5px 0 0 0; font-size: 12px; color: #666;">${photo.description}</p>
                        </div>
                    `;
                    container.appendChild(photoItem);
                });
            };
            console.log('✅ renderGallery函数已创建');
        }
    }
    
    function fixButtonClickEvents() {
        console.log('🔧 修复按钮点击事件...');
        
        // 找到所有分类按钮
        const buttons = document.querySelectorAll('.filter-btn');
        console.log(`找到 ${buttons.length} 个分类按钮`);
        
        buttons.forEach(btn => {
            // 移除现有事件监听器
            btn.replaceWith(btn.cloneNode(true));
        });
        
        // 重新添加事件监听器
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const filter = this.getAttribute('data-filter');
                console.log(`🖱️ 按钮点击: ${filter}`);
                
                // 调用filterGallery
                if (typeof window.filterGallery === 'function') {
                    window.filterGallery(filter);
                } else {
                    // 备用方案
                    window.currentFilter = filter;
                    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                    this.classList.add('active');
                    console.log(`✅ 按钮激活: ${this.querySelector('h3')?.textContent || this.textContent}`);
                }
            });
        });
        
        console.log('✅ 按钮点击事件已修复');
        
        // 激活当前筛选的按钮
        if (window.currentFilter) {
            const activeBtn = document.querySelector(`.filter-btn[data-filter="${window.currentFilter}"]`);
            if (activeBtn) {
                activeBtn.classList.add('active');
                console.log(`🎯 已激活按钮: ${window.currentFilter}`);
            }
        }
    }
    
    function ensureDataSync() {
        console.log('🔧 确保数据同步...');
        
        // 确保galleryData存在
        if (!window.galleryData) {
            window.galleryData = [];
            console.log('📊 创建galleryData数组');
        }
        
        // 确保currentFilter存在
        if (!window.currentFilter) {
            window.currentFilter = 'all';
            console.log('🎯 设置currentFilter为"all"');
        }
        
        // 尝试从photos.json加载数据
        setTimeout(() => {
            fetch('data/photos.json')
                .then(response => {
                    if (!response.ok) throw new Error('无法加载');
                    return response.json();
                })
                .then(data => {
                    console.log('✅ 从photos.json加载数据成功');
                    
                    // 转换数据格式
                    let loadedPhotos = [];
                    Object.keys(data).forEach(category => {
                        data[category].forEach(photo => {
                            loadedPhotos.push({
                                id: photo.id || Date.now(),
                                src: photo.src || `images/${photo.fileName || 'unknown.jpg'}`,
                                dataUrl: photo.dataUrl || null,
                                category: photo.category || category,
                                title: photo.title || '未命名照片',
                                description: photo.description || '上传的照片'
                            });
                        });
                    });
                    
                    // 合并到galleryData
                    loadedPhotos.forEach(newPhoto => {
                        const exists = window.galleryData.some(p => p.id === newPhoto.id || p.src === newPhoto.src);
                        if (!exists) {
                            window.galleryData.push(newPhoto);
                        }
                    });
                    
                    console.log(`📊 数据同步完成: ${window.galleryData.length} 张照片`);
                    
                    // 重新渲染
                    if (typeof window.filterGallery === 'function') {
                        window.filterGallery(window.currentFilter);
                    }
                })
                .catch(error => {
                    console.log('⚠️ 无法从photos.json加载数据，使用现有数据');
                });
        }, 1000);
    }
    
    function setupEditModeListeners() {
        console.log('🔧 设置编辑模式监听...');
        
        // 监听退出编辑按钮
        const exitBtn = document.getElementById('exit-edit-btn');
        if (exitBtn) {
            exitBtn.addEventListener('click', function() {
                console.log('🚪 退出编辑模式，重新渲染相册');
                setTimeout(() => {
                    if (typeof window.filterGallery === 'function' && window.currentFilter) {
                        window.filterGallery(window.currentFilter);
                    }
                }, 500);
            });
        }
        
        // 监听CMS自定义事件
        document.addEventListener('cms-edit-mode-changed', function(event) {
            console.log('🔄 CMS编辑模式变化:', event.detail);
            if (event.detail === 'exit') {
                setTimeout(() => {
                    if (typeof window.filterGallery === 'function' && window.currentFilter) {
                        window.filterGallery(window.currentFilter);
                    }
                }, 500);
            }
        });
    }
    
    function showNotification(message) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: #4CAF50;
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;
        
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
        
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) notification.remove();
        }, 3000);
    }
    
    // 提供手动修复函数
    window.ultimateFix = function() {
        console.log('🔧 执行手动终极修复');
        ensureCoreFunctions();
        fixButtonClickEvents();
        ensureDataSync();
        setupEditModeListeners();
        showNotification('✅ 手动修复完成！');
    };
    
    console.log('🚀 终极修复脚本加载完成');
    console.log('💡 如需手动修复，请在控制台执行: ultimateFix()');
})();