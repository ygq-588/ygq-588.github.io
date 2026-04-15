/**
 * 极简按钮修复 - 确保按钮点击能激活
 * 版本：1.0 - 完全独立，不依赖其他脚本
 */

(function() {
    console.log('🔧 加载极简按钮修复脚本 v1.0');
    
    // 等待页面完全加载
    window.addEventListener('load', function() {
        console.log('📦 页面加载完成，开始修复按钮');
        
        // 延迟执行，确保其他脚本已加载
        setTimeout(initButtonFix, 1500);
    });
    
    function initButtonFix() {
        console.log('🛠️ 初始化按钮修复');
        
        // 1. 找到所有分类按钮
        const filterButtons = document.querySelectorAll('.filter-btn');
        console.log(`找到 ${filterButtons.length} 个分类按钮`);
        
        if (filterButtons.length === 0) {
            console.warn('⚠️ 未找到分类按钮，检查HTML结构');
            return;
        }
        
        // 2. 移除所有按钮的active类（除了"全部照片"）
        filterButtons.forEach(btn => {
            if (btn.getAttribute('data-filter') !== 'all') {
                btn.classList.remove('active');
            }
        });
        
        // 3. 确保"全部照片"按钮激活
        const allBtn = document.querySelector('.filter-btn[data-filter="all"]');
        if (allBtn) {
            allBtn.classList.add('active');
            window.currentFilter = 'all';
            console.log('✅ 确保"全部照片"按钮激活');
        }
        
        // 4. 给每个按钮添加极简点击处理
        filterButtons.forEach(btn => {
            // 移除所有现有的事件监听器（避免冲突）
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);
            
            // 重新添加点击事件
            newBtn.addEventListener('click', handleButtonClick);
        });
        
        console.log('✅ 按钮修复完成');
    }
    
    function handleButtonClick(event) {
        const btn = event.currentTarget;
        const btnText = btn.querySelector('h3')?.textContent || btn.textContent;
        const dataFilter = btn.getAttribute('data-filter');
        
        console.log(`🎯 按钮点击: "${btnText}" (data-filter="${dataFilter}")`);
        
        // 1. 移除所有按钮的active类
        document.querySelectorAll('.filter-btn').forEach(b => {
            b.classList.remove('active');
        });
        
        // 2. 给当前按钮添加active类
        btn.classList.add('active');
        console.log(`✅ 按钮激活状态: ${btn.classList.contains('active')}`);
        
        // 3. 保存到全局变量（供上传使用）
        if (dataFilter) {
            window.currentFilter = dataFilter;
            console.log(`📝 设置 window.currentFilter = "${dataFilter}"`);
        }
        
        // 4. 调用原始的filterGallery函数（如果存在）
        if (typeof window.filterGallery === 'function' && dataFilter) {
            console.log(`🔄 调用原始filterGallery('${dataFilter}')`);
            window.filterGallery(dataFilter);
        }
        
        // 5. 显示当前激活按钮
        const activeBtn = document.querySelector('.filter-btn.active');
        if (activeBtn) {
            const activeText = activeBtn.querySelector('h3')?.textContent || activeBtn.textContent;
            console.log(`🎯 当前激活按钮: "${activeText}"`);
        }
    }
    
    // 添加CSS样式（确保按钮有激活状态）
    function addButtonStyles() {
        const style = document.createElement('style');
        style.textContent = `
            /* 极简按钮激活样式 - 最高优先级 */
            .filter-btn.active {
                border: 4px solid #4CAF50 !important;
                background: linear-gradient(135deg, rgba(76, 175, 80, 0.2), rgba(76, 175, 80, 0.3)) !important;
                box-shadow: 0 8px 25px rgba(76, 175, 80, 0.5) !important;
                transform: translateY(-8px) scale(1.05) !important;
                z-index: 10 !important;
            }
            
            .filter-btn.active .feature-icon {
                background: linear-gradient(135deg, #4CAF50, #1B5E20) !important;
                color: white !important;
                transform: scale(1.1) !important;
                box-shadow: 0 4px 12px rgba(27, 94, 32, 0.4) !important;
            }
            
            .filter-btn.active h3 {
                color: #1B5E20 !important;
                font-weight: 900 !important;
                font-size: 1.3em !important;
                text-shadow: 0 2px 4px rgba(0,0,0,0.1) !important;
            }
            
            /* 确保按钮可点击 */
            .filter-btn {
                cursor: pointer !important;
                transition: all 0.3s ease !important;
            }
        `;
        document.head.appendChild(style);
        console.log('🎨 添加按钮样式');
    }
    
    // 初始化
    addButtonStyles();
})();