/**
 * 设置管理模块
 * 版本: 1.0
 * 依赖: db-core.js
 * 路径: js/settings-manager.js
 * 功能: 头像拖拽位置保存、恢复
 */

/**
 * 初始化设置管理器
 * @param {string} selector - 可拖拽元素选择器
 * @param {Object} options - 配置选项
 */
async function initSettingsManager(selector = '#avatar', options = {}) {
    if (document.readyState === 'loading') {
        await new Promise(resolve => {
            document.addEventListener('DOMContentLoaded', resolve);
        });
    }
    
    const element = document.querySelector(selector);
    if (!element) {
        console.warn('设置管理器：未找到元素', selector);
        return;
    }
    
    // 恢复保存的位置
    const savedPosition = await DB.getSetting('avatarPosition');
    if (savedPosition) {
        element.style.position = 'relative';
        element.style.left = savedPosition.left;
        element.style.top = savedPosition.top;
    }
    
    // 实现拖拽保存
    let isDragging = false;
    let startX, startY, startLeft, startTop;
    
    element.addEventListener('mousedown', (e) => {
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        startLeft = parseInt(element.style.left) || 0;
        startTop = parseInt(element.style.top) || 0;
        element.style.cursor = 'grabbing';
        e.preventDefault();
    });
    
    window.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        const newLeft = startLeft + dx;
        const newTop = startTop + dy;
        
        element.style.left = newLeft + 'px';
        element.style.top = newTop + 'px';
    });
    
    window.addEventListener('mouseup', async () => {
        if (!isDragging) return;
        
        isDragging = false;
        element.style.cursor = '';
        
        // 保存位置
        await DB.saveSetting('avatarPosition', {
            left: element.style.left,
            top: element.style.top
        });
        console.log('头像位置已保存');
    });
    
    console.log('设置管理器初始化完成');
}

window.SettingsManager = {
    init: initSettingsManager
};