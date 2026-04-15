/**
 * 页面状态管理器 - 确保退出编辑模式后照片不消失
 */

(function() {
    console.log('🔧 页面状态管理器加载');
    
    // 保存原始galleryData的引用
    let originalGalleryData = null;
    
    // 监听编辑模式变化
    document.addEventListener('cms-edit-mode-changed', function(event) {
        console.log('🔄 编辑模式变化:', event.detail);
        
        if (event.detail === 'exit') {
            // 退出编辑模式时，确保照片重新显示
            console.log('退出编辑模式，重新加载照片...');
            reloadGalleryAfterEdit();
        }
    });
    
    // 监听页面加载
    window.addEventListener('load', function() {
        console.log('📦 页面加载完成，初始化状态管理器');
        
        // 保存初始galleryData
        if (window.galleryData) {
            originalGalleryData = [...window.galleryData];
            console.log(`✅ 保存初始照片数据: ${originalGalleryData.length} 张`);
        }
        
        // 检查是否有编辑模式变化
        setTimeout(checkEditMode, 1000);
    });
    
    function checkEditMode() {
        const editModeBtn = document.getElementById('edit-mode-btn');
        const exitEditBtn = document.getElementById('exit-edit-btn');
        
        if (editModeBtn && exitEditBtn) {
            console.log('🔍 检测到编辑模式按钮');
            
            // 监听退出编辑按钮点击
            exitEditBtn.addEventListener('click', function() {
                console.log('🔄 用户点击退出编辑按钮');
                setTimeout(reloadGalleryAfterEdit, 500);
            });
        }
    }
    
    function reloadGalleryAfterEdit() {
        console.log('🔄 重新加载相册...');
        
        // 方法1：重新调用filterGallery
        if (typeof window.filterGallery === 'function' && window.currentFilter) {
            console.log(`🎨 重新渲染相册，筛选: ${window.currentFilter}`);
            window.filterGallery(window.currentFilter);
        }
        
        // 方法2：直接重新加载数据
        else if (window.galleryData && window.galleryData.length > 0) {
            console.log(`📊 重新显示 ${window.galleryData.length} 张照片`);
            
            const container = document.querySelector('.gallery-grid') || document.querySelector('#photoGallery');
            if (container) {
                container.innerHTML = '';
                
                // 显示当前筛选的照片
                const filtered = window.currentFilter === 'all' 
                    ? window.galleryData 
                    : window.galleryData.filter(p => p.category === window.currentFilter);
                
                filtered.forEach(photo => {
                    const photoItem = document.createElement('div');
                    photoItem.className = 'photo-item';
                    photoItem.dataset.photoId = photo.id;
                    
                    // 获取图片URL
                    let imageUrl = photo.src;
                    if (photo.dataUrl && photo.dataUrl.startsWith('data:image/')) {
                        imageUrl = photo.dataUrl;
                    } else if (photo.src.startsWith('images/')) {
                        const baseUrl = window.location.href;
                        const pagePath = baseUrl.substring(0, baseUrl.lastIndexOf('/') + 1);
                        imageUrl = pagePath + photo.src;
                    }
                    
                    photoItem.innerHTML = `
                        <img src="${imageUrl}" alt="${photo.title}" 
                             style="width: 100%; height: 200px; object-fit: cover; border-radius: 8px;"
                             onerror="console.error('图片加载失败:', this.src)">
                        <div style="padding: 10px;">
                            <h4 style="margin: 0; font-size: 14px;">${photo.title}</h4>
                            <p style="margin: 5px 0 0 0; font-size: 12px; color: #666;">${photo.description}</p>
                        </div>
                    `;
                    container.appendChild(photoItem);
                });
                
                console.log(`✅ 重新显示完成: ${filtered.length} 张照片`);
            }
        }
        
        // 方法3：使用原始保存的数据
        else if (originalGalleryData) {
            console.log(`📂 使用保存的原始数据: ${originalGalleryData.length} 张照片`);
            window.galleryData = [...originalGalleryData];
            
            if (typeof window.filterGallery === 'function') {
                window.filterGallery(window.currentFilter || 'all');
            }
        }
    }
    
    // 提供手动重新加载函数
    window.reloadGallery = reloadGalleryAfterEdit;
    
    console.log('✅ 页面状态管理器初始化完成');
})();