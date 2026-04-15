/**
 * 数据迁移脚本 - 修复照片显示问题
 * 将现有照片数据迁移到新格式
 */

(function() {
    console.log('🔧 数据迁移脚本开始执行');
    
    // 等待页面加载
    window.addEventListener('load', function() {
        setTimeout(migratePhotoData, 2000);
    });
    
    async function migratePhotoData() {
        console.log('🔄 开始迁移照片数据...');
        
        try {
            // 检查当前galleryData
            if (!window.galleryData || !Array.isArray(window.galleryData)) {
                console.log('❌ 没有找到galleryData');
                return;
            }
            
            console.log(`📊 当前有 ${window.galleryData.length} 张照片`);
            
            // 检查每张照片的数据结构
            let migratedCount = 0;
            window.galleryData.forEach((photo, index) => {
                // 检查是否需要迁移
                const needsMigration = 
                    !photo.hasOwnProperty('hasDataUrl') || 
                    (!photo.dataUrl && photo.src.startsWith('data:image/'));
                
                if (needsMigration) {
                    console.log(`🔄 迁移照片 ${index + 1}: ${photo.title}`);
                    
                    // 如果src是Data URL，移动到dataUrl字段
                    if (photo.src.startsWith('data:image/')) {
                        photo.dataUrl = photo.src;
                        photo.src = `images/photo_${photo.id}.jpg`; // 生成一个路径
                        photo.hasDataUrl = true;
                        migratedCount++;
                    } else if (!photo.hasDataUrl) {
                        photo.hasDataUrl = false;
                        migratedCount++;
                    }
                }
            });
            
            if (migratedCount > 0) {
                console.log(`✅ 迁移完成: ${migratedCount} 张照片已更新`);
                
                // 重新渲染相册
                if (typeof window.renderGallery === 'function' && window.currentFilter) {
                    console.log('🎨 重新渲染相册...');
                    window.renderGallery(window.currentFilter);
                }
            } else {
                console.log('✅ 数据已经是最新格式，无需迁移');
            }
            
        } catch (error) {
            console.error('❌ 数据迁移失败:', error);
        }
    }
    
    // 立即执行一次
    migratePhotoData();
})();