/**
 * 相册数据加载器 - 从photos.json动态加载数据
 */

(function() {
    console.log('📂 相册数据加载器开始执行');
    
    // 原始的galleryData（备份）
    const initialGalleryData = window.galleryData || [];
    
    // 加载photos.json数据
    async function loadGalleryData() {
        console.log('🔄 尝试从photos.json加载数据...');
        
        try {
            // 尝试从data/photos.json加载
            const response = await fetch('data/photos.json');
            if (!response.ok) {
                console.log('❌ 无法加载photos.json，使用初始数据');
                return initialGalleryData;
            }
            
            const photosData = await response.json();
            console.log('✅ photos.json加载成功');
            
            // 将photos.json的数据转换为galleryData格式
            let loadedData = [];
            
            // photos.json的结构: { "分类": [照片数组], ... }
            Object.keys(photosData).forEach(category => {
                const categoryPhotos = photosData[category];
                
                categoryPhotos.forEach(photo => {
                    // 确保照片有正确的结构
                    loadedData.push({
                        id: photo.id || Date.now() + Math.random(),
                        src: photo.src || `images/${photo.fileName || 'unknown.jpg'}`,
                        dataUrl: photo.dataUrl || null,
                        category: photo.category || category,
                        title: photo.title || '未命名照片',
                        description: photo.description || '上传的照片',
                        fileName: photo.fileName,
                        originalName: photo.originalName,
                        hasDataUrl: !!photo.dataUrl
                    });
                });
            });
            
            console.log(`📊 从photos.json加载了 ${loadedData.length} 张照片`);
            
            // 合并初始数据（避免重复）
            const mergedData = [...loadedData];
            initialGalleryData.forEach(initialPhoto => {
                // 检查是否已存在
                const exists = mergedData.some(p => p.id === initialPhoto.id || p.src === initialPhoto.src);
                if (!exists) {
                    mergedData.push(initialPhoto);
                }
            });
            
            console.log(`📦 最终数据: ${mergedData.length} 张照片`);
            return mergedData;
            
        } catch (error) {
            console.error('❌ 加载photos.json失败:', error);
            console.log('🔄 使用初始数据');
            return initialGalleryData;
        }
    }
    
    // 替换全局的galleryData
    async function initGalleryData() {
        const loadedData = await loadGalleryData();
        window.galleryData = loadedData;
        
        console.log('✅ galleryData已更新:', window.galleryData.length, '张照片');
        
        // 如果当前有筛选，重新渲染
        if (typeof window.renderGallery === 'function' && window.currentFilter) {
            console.log(`🎨 重新渲染相册: ${window.currentFilter}`);
            setTimeout(() => {
                window.renderGallery(window.currentFilter);
            }, 500);
        }
    }
    
    // 页面加载后执行
    window.addEventListener('load', function() {
        console.log('📦 页面加载完成，初始化相册数据');
        setTimeout(initGalleryData, 1000);
    });
    
    // 提供重新加载函数
    window.reloadGalleryData = initGalleryData;
    
    console.log('✅ 相册数据加载器初始化完成');
})();