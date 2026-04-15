/**
 * 紧急修复脚本 - 直接解决相册问题
 * 使用方法：在浏览器控制台执行此代码，或添加到页面中
 */

(function() {
    console.log('🚨 紧急修复脚本开始执行');
    
    // 等待页面加载
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', main);
    } else {
        main();
    }
    
    function main() {
        console.log('🔧 开始修复...');
        
        // 修复1：确保关键函数存在
        ensureFunctions();
        
        // 修复2：确保数据加载
        loadData();
        
        // 修复3：确保事件监听
        setupEventListeners();
        
        console.log('✅ 紧急修复完成');
    }
    
    function ensureFunctions() {
        console.log('🔧 确保关键函数存在...');
        
        // addToGallery函数
        if (typeof window.addToGallery !== 'function') {
            console.log('⚠️ 创建addToGallery函数');
            window.addToGallery = function(imageData) {
                console.log(`➕ 添加新照片: ${imageData.title}`);
                
                // 确保有ID
                if (!imageData.id) {
                    imageData.id = Date.now() + Math.floor(Math.random() * 1000);
                }
                
                // 确保有数据数组
                if (!window.galleryData) {
                    window.galleryData = [];
                }
                
                // 添加到数组
                window.galleryData.push(imageData);
                console.log(`📊 照片添加成功，总数: ${window.galleryData.length}`);
                
                // 重新渲染
                if (typeof window.renderGallery === 'function' && window.currentFilter) {
                    window.renderGallery(window.currentFilter);
                }
                
                return imageData.id;
            };
            console.log('✅ addToGallery函数已创建');
        }
        
        // filterGallery函数
        if (typeof window.filterGallery !== 'function') {
            console.log('⚠️ 创建filterGallery函数');
            window.filterGallery = function(filter) {
                console.log(`🔍 筛选: ${filter}`);
                window.currentFilter = filter;
                
                if (typeof window.renderGallery === 'function') {
                    window.renderGallery(filter);
                }
            };
            console.log('✅ filterGallery函数已创建');
        }
        
        // renderGallery函数（简化版）
        if (typeof window.renderGallery !== 'function') {
            console.log('⚠️ 创建renderGallery函数');
            window.renderGallery = function(filter) {
                console.log(`🎨 渲染相册，筛选: ${filter}`);
                
                const container = document.getElementById('photoGallery');
                if (!container) {
                    console.error('❌ 找不到相册容器');
                    return;
                }
                
                // 清空容器
                container.innerHTML = '';
                
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
                
                // 渲染每张照片
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
    
    function loadData() {
        console.log('📂 加载数据...');
        
        // 尝试从photos.json加载
        fetch('data/photos.json')
            .then(response => {
                if (!response.ok) throw new Error('无法加载photos.json');
                return response.json();
            })
            .then(photosData => {
                console.log('✅ photos.json加载成功');
                
                // 转换为galleryData格式
                let loadedData = [];
                Object.keys(photosData).forEach(category => {
                    const categoryPhotos = photosData[category];
                    categoryPhotos.forEach(photo => {
                        loadedData.push({
                            id: photo.id || Date.now() + Math.random(),
                            src: photo.src || `images/${photo.fileName || 'unknown.jpg'}`,
                            dataUrl: photo.dataUrl || null,
                            category: photo.category || category,
                            title: photo.title || '未命名照片',
                            description: photo.description || '上传的照片'
                        });
                    });
                });
                
                // 更新全局数据
                if (!window.galleryData) window.galleryData = [];
                
                // 合并数据（避免重复）
                loadedData.forEach(newPhoto => {
                    const exists = window.galleryData.some(p => p.id === newPhoto.id || p.src === newPhoto.src);
                    if (!exists) {
                        window.galleryData.push(newPhoto);
                    }
                });
                
                console.log(`📊 数据加载完成: ${window.galleryData.length} 张照片`);
                
                // 重新渲染
                if (typeof window.filterGallery === 'function') {
                    window.filterGallery(window.currentFilter || 'all');
                }
            })
            .catch(error => {
                console.warn('⚠️ 无法从photos.json加载数据:', error.message);
                
                // 使用默认数据
                if (!window.galleryData || window.galleryData.length === 0) {
                    console.log('🔄 使用默认数据');
                    window.galleryData = [
                        {id: 101, src: "images/黄山/IMG_20250402_073324.jpg", category: "huangshan", title: "黄山迎客松", description: "黄山标志性景观迎客松"}
                    ];
                    
                    if (typeof window.filterGallery === 'function') {
                        window.filterGallery('all');
                    }
                }
            });
    }
    
    function setupEventListeners() {
        console.log('🎯 设置事件监听...');
        
        // 监听退出编辑按钮
        const exitBtn = document.getElementById('exit-edit-btn');
        if (exitBtn) {
            exitBtn.addEventListener('click', function() {
                console.log('🔄 退出编辑模式，重新渲染相册');
                setTimeout(() => {
                    if (typeof window.filterGallery === 'function' && window.currentFilter) {
                        window.filterGallery(window.currentFilter);
                    }
                }, 500);
            });
        }
        
        // 监听分类按钮
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const filter = this.getAttribute('data-filter');
                if (filter && typeof window.filterGallery === 'function') {
                    window.filterGallery(filter);
                }
            });
        });
    }
    
    // 提供手动修复函数
    window.emergencyFix = function() {
        console.log('🔧 执行手动修复');
        ensureFunctions();
        loadData();
        setupEventListeners();
    };
    
    console.log('🚨 紧急修复脚本加载完成');
    console.log('💡 如需手动修复，请在控制台执行: emergencyFix()');
})();