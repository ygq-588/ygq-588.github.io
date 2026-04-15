/**
 * 内容管理模块
 * 版本: 2.1
 * 依赖: db-core.js
 * 路径: js/content-manager.js
 * 功能: 文字编辑持久化（双击编辑、自动保存、完整富文本工具栏）
 */

// 保存防抖定时器
const saveDebounceTimers = new Map();

// 默认配置
const DEFAULT_CONFIG = {
    debounceDelay: 500,
    supportedTags: ['P', 'DIV', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'LI', 'SPAN', 'SECTION', 'ARTICLE'],
    toolbarEnabled: true
};

// 富文本工具栏实例
let currentToolbar = null;
let currentActiveElement = null;

/**
 * 生成内容唯一键
 */
function generateContentKey(element) {
    if (element.id) return element.id;
    if (element.dataset.key) return element.dataset.key;
    const pagePath = window.location.pathname;
    const index = Array.from(document.querySelectorAll('[contenteditable]')).indexOf(element);
    return `${pagePath}_editable_${index}`;
}

/**
 * 保存内容到 IndexedDB（防抖）
 */
function debouncedSave(element, key, content) {
    if (saveDebounceTimers.has(key)) {
        clearTimeout(saveDebounceTimers.get(key));
    }
    
    const timer = setTimeout(async () => {
        try {
            await DB.saveContent(key, content);
            console.log('内容已保存:', key);
            showSaveIndicator(element);
        } catch (error) {
            console.error('内容保存失败:', key, error);
            showSaveError(element);
        }
        saveDebounceTimers.delete(key);
    }, DEFAULT_CONFIG.debounceDelay);
    
    saveDebounceTimers.set(key, timer);
}

/**
 * 显示保存成功提示
 */
function showSaveIndicator(element) {
    const indicator = document.createElement('span');
    indicator.className = 'save-indicator';
    indicator.textContent = '✓';
    indicator.style.cssText = `
        position: absolute;
        right: -20px;
        top: 0;
        color: #4caf50;
        font-size: 16px;
        opacity: 1;
        transition: opacity 0.3s;
    `;
    
    element.style.position = 'relative';
    element.appendChild(indicator);
    
    setTimeout(() => {
        indicator.style.opacity = '0';
        setTimeout(() => indicator.remove(), 300);
    }, 1000);
}

/**
 * 显示保存失败提示
 */
function showSaveError(element) {
    const errorMsg = document.createElement('span');
    errorMsg.className = 'save-error';
    errorMsg.textContent = '⚠️ 保存失败';
    errorMsg.style.cssText = `
        position: absolute;
        right: -60px;
        top: 0;
        color: #f44336;
        font-size: 12px;
        background: white;
        padding: 2px 6px;
        border-radius: 4px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.2);
    `;
    
    element.style.position = 'relative';
    element.appendChild(errorMsg);
    setTimeout(() => errorMsg.remove(), 2000);
}

/**
 * 获取富文本工具栏（完整版）
 */
function getToolbar() {
    if (currentToolbar) return currentToolbar;
    
    const toolbar = document.createElement('div');
    toolbar.className = 'rich-text-toolbar';
    toolbar.style.cssText = `
        position: fixed;
        background: white;
        border: 1px solid #ddd;
        border-radius: 8px;
        padding: 8px 12px;
        display: none;
        gap: 6px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        flex-wrap: wrap;
        max-width: 500px;
        font-family: 'Microsoft YaHei', sans-serif;
    `;
    
    // 添加强制样式，确保下划线在底部
    const style = document.createElement('style');
    style.textContent = `
        /* 修复下划线位置 */
        .rich-text-toolbar + * u,
        .rich-text-toolbar + * [style*="text-decoration: underline"] {
            text-decoration: underline !important;
            text-decoration-skip-ink: none !important;
            text-underline-position: under !important;
        }
        /* 修复背景色样式 */
        .rich-text-toolbar + * [style*="background-color"] {
            padding: 1px 3px !important;
            border-radius: 2px !important;
        }
    `;
    document.head.appendChild(style);
    
    // 分组1：基础格式
    const group1 = document.createElement('div');
    group1.style.cssText = 'display: flex; gap: 4px; border-right: 1px solid #ddd; padding-right: 8px; margin-right: 8px;';
    
    const buttons = [
        { cmd: 'bold', icon: 'B', title: '加粗 (Ctrl+B)' },
        { cmd: 'italic', icon: 'I', title: '斜体 (Ctrl+I)' },
        { cmd: 'underline', icon: 'U', title: '下划线 (Ctrl+U)' },
        { cmd: 'strikeThrough', icon: 'S', title: '删除线' }
    ];
    
    buttons.forEach(btn => {
        const button = createToolbarButton(btn.icon, btn.title);
        button.onclick = () => {
            document.execCommand(btn.cmd, false, null);
            button.blur();
        };
        group1.appendChild(button);
    });
    
    toolbar.appendChild(group1);
    
    // 分组2：标题和字体大小
    const group2 = document.createElement('div');
    group2.style.cssText = 'display: flex; gap: 4px; border-right: 1px solid #ddd; padding-right: 8px; margin-right: 8px;';
    
    // 标题下拉
    const headingSelect = document.createElement('select');
    headingSelect.style.cssText = 'height: 30px; padding: 0 8px; border: 1px solid #ddd; border-radius: 4px; background: white;';
    headingSelect.innerHTML = `
        <option value="">段落</option>
        <option value="H1">H1 大标题</option>
        <option value="H2">H2 标题</option>
        <option value="H3">H3 副标题</option>
        <option value="H4">H4 小标题</option>
    `;
    headingSelect.onchange = () => {
        const value = headingSelect.value;
        if (value) {
            document.execCommand('formatBlock', false, value);
            headingSelect.value = '';
        }
    };
    group2.appendChild(headingSelect);
    
    // 字体大小下拉
    const fontSizeSelect = document.createElement('select');
    fontSizeSelect.style.cssText = 'height: 30px; padding: 0 8px; border: 1px solid #ddd; border-radius: 4px; background: white;';
    fontSizeSelect.innerHTML = `
        <option value="">字体大小</option>
        <option value="12px">12px</option>
        <option value="14px">14px</option>
        <option value="16px">16px</option>
        <option value="18px">18px</option>
        <option value="20px">20px</option>
        <option value="24px">24px</option>
        <option value="28px">28px</option>
        <option value="32px">32px</option>
    `;
    fontSizeSelect.onchange = () => {
        const value = fontSizeSelect.value;
        if (value) {
            document.execCommand('fontSize', false, '7');
            // 修改实际字体大小
            const selection = window.getSelection();
            if (selection.rangeCount > 0) {
                const span = document.createElement('span');
                span.style.fontSize = value;
                const range = selection.getRangeAt(0);
                range.surroundContents(span);
            }
            fontSizeSelect.value = '';
        }
    };
    group2.appendChild(fontSizeSelect);
    
    toolbar.appendChild(group2);
    
    // 分组3：颜色（带标签说明）
    const group3 = document.createElement('div');
    group3.style.cssText = 'display: flex; gap: 4px; border-right: 1px solid #ddd; padding-right: 8px; margin-right: 8px; align-items: center;';
    
    // 文字颜色（带标签）
    const textColorContainer = document.createElement('div');
    textColorContainer.style.cssText = 'display: flex; flex-direction: column; align-items: center; gap: 2px;';
    
    const textColorLabel = document.createElement('span');
    textColorLabel.textContent = '文字';
    textColorLabel.style.cssText = 'font-size: 10px; color: #666;';
    
    const textColorInput = document.createElement('input');
    textColorInput.type = 'color';
    textColorInput.title = '文字颜色 - 先选中文字，再选择颜色';
    textColorInput.value = '#000000'; // 默认黑色
    textColorInput.style.cssText = 'width: 30px; height: 30px; border: 1px solid #ddd; border-radius: 4px; cursor: pointer;';
    textColorInput.onchange = () => {
        document.execCommand('foreColor', false, textColorInput.value);
    };
    
    textColorContainer.appendChild(textColorLabel);
    textColorContainer.appendChild(textColorInput);
    group3.appendChild(textColorContainer);
    
    // 背景颜色（修复：改用 hiliteColor）
    const bgColorContainer = document.createElement('div');
    bgColorContainer.style.cssText = 'display: flex; flex-direction: column; align-items: center; gap: 2px;';
    
    const bgColorLabel = document.createElement('span');
    bgColorLabel.textContent = '背景';
    bgColorLabel.style.cssText = 'font-size: 10px; color: #666;';
    
    const bgColorInput = document.createElement('input');
    bgColorInput.type = 'color';
    bgColorInput.title = '背景颜色（高亮）';
    bgColorInput.value = '#ffffff'; // 默认白色
    bgColorInput.style.cssText = 'width: 30px; height: 30px; border: 1px solid #ddd; border-radius: 4px; cursor: pointer;';
    bgColorInput.onchange = () => {
        // 优先使用 hiliteColor
        try {
            document.execCommand('hiliteColor', false, bgColorInput.value);
        } catch (e) {
            // fallback: 用 backColor
            document.execCommand('backColor', false, bgColorInput.value);
        }
    };
    
    bgColorContainer.appendChild(bgColorLabel);
    bgColorContainer.appendChild(bgColorInput);
    group3.appendChild(bgColorContainer);
    
    toolbar.appendChild(group3);
    
    // 分组3.5：段落背景色（新增功能）
    const group3_5 = document.createElement('div');
    group3_5.style.cssText = 'display: flex; gap: 4px; border-right: 1px solid #ddd; padding-right: 8px; margin-right: 8px; align-items: center;';
    
    // 段落背景色按钮（独立按钮）
    const paragraphBgButton = createToolbarButton('🎨', '段落背景色 - 点击设置整个段落背景');
    paragraphBgButton.style.cssText = `
        width: 32px;
        height: 32px;
        border: 1px solid #ddd;
        border-radius: 4px;
        background: white;
        cursor: pointer;
        font-weight: 500;
        transition: all 0.2s ease;
        font-size: 16px;
    `;
    
    paragraphBgButton.onclick = () => {
        // 获取当前光标所在的块级元素
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            let element = range.commonAncestorContainer;
            
            // 向上查找块级元素
            while (element && element.nodeType !== 1) {
                element = element.parentElement;
            }
            
            if (element) {
                // 如果是文本节点，向上找父元素
                if (element.nodeType === 3) {
                    element = element.parentElement;
                }
                
                // 确保是块级元素，如果不是则找最近的块级父元素
                while (element && !isBlockElement(element)) {
                    element = element.parentElement;
                }
                
                if (element) {
                    // 创建颜色选择器
                    const colorPicker = document.createElement('input');
                    colorPicker.type = 'color';
                    colorPicker.style.cssText = `
                        position: absolute;
                        opacity: 0;
                        width: 0;
                        height: 0;
                    `;
                    
                    colorPicker.onchange = () => {
                        // 设置段落背景色
                        element.style.backgroundColor = colorPicker.value;
                        element.style.padding = '8px 12px';
                        element.style.borderRadius = '4px';
                        element.style.transition = 'background-color 0.3s ease';
                        
                        // 保存到数据库
                        const key = generateContentKey(element) + '_paragraph_bg';
                        debouncedSave(element, key, colorPicker.value);
                        
                        // 移除颜色选择器
                        document.body.removeChild(colorPicker);
                    };
                    
                    // 触发颜色选择器
                    document.body.appendChild(colorPicker);
                    colorPicker.click();
                }
            }
        }
        
        paragraphBgButton.blur();
    };
    
    group3_5.appendChild(paragraphBgButton);
    toolbar.appendChild(group3_5);
    
    // 分组4：对齐方式
    const group4 = document.createElement('div');
    group4.style.cssText = 'display: flex; gap: 4px; border-right: 1px solid #ddd; padding-right: 8px; margin-right: 8px;';
    
    const alignButtons = [
        { cmd: 'justifyLeft', icon: '◀', title: '左对齐' },
        { cmd: 'justifyCenter', icon: '◀▶', title: '居中' },
        { cmd: 'justifyRight', icon: '▶', title: '右对齐' },
        { cmd: 'justifyFull', icon: '☰', title: '两端对齐' }
    ];
    
    alignButtons.forEach(btn => {
        const button = createToolbarButton(btn.icon, btn.title);
        button.onclick = () => {
            document.execCommand(btn.cmd, false, null);
            button.blur();
        };
        group4.appendChild(button);
    });
    
    toolbar.appendChild(group4);
    
    // 分组5：撤销/重做
    const group5 = document.createElement('div');
    group5.style.cssText = 'display: flex; gap: 4px; border-right: 1px solid #ddd; padding-right: 8px; margin-right: 8px;';
    
    const undoRedoButtons = [
        { cmd: 'undo', icon: '↶', title: '撤销 (Ctrl+Z)' },
        { cmd: 'redo', icon: '↷', title: '重做 (Ctrl+Y)' }
    ];
    
    undoRedoButtons.forEach(btn => {
        const button = createToolbarButton(btn.icon, btn.title);
        button.onclick = () => {
            document.execCommand(btn.cmd, false, null);
            button.blur();
        };
        group5.appendChild(button);
    });
    
    toolbar.appendChild(group5);
    
    // 分组6：列表
    const group6 = document.createElement('div');
    group6.style.cssText = 'display: flex; gap: 4px;';
    
    const listButtons = [
        { cmd: 'insertUnorderedList', icon: '•', title: '项目符号' },
        { cmd: 'insertOrderedList', icon: '1.', title: '编号列表' }
    ];
    
    listButtons.forEach(btn => {
        const button = createToolbarButton(btn.icon, btn.title);
        button.onclick = () => {
            document.execCommand(btn.cmd, false, null);
            button.blur();
        };
        group6.appendChild(button);
    });
    
    toolbar.appendChild(group6);
    
    document.body.appendChild(toolbar);
    currentToolbar = toolbar;
    return toolbar;
}

/**
 * 判断元素是否为块级元素
 */
function isBlockElement(element) {
    if (!element || !element.style) return false;
    
    const blockElements = [
        'DIV', 'P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6',
        'SECTION', 'ARTICLE', 'HEADER', 'FOOTER', 'NAV',
        'MAIN', 'ASIDE', 'FIGURE', 'FIGCAPTION', 'BLOCKQUOTE',
        'UL', 'OL', 'LI', 'TABLE', 'FORM', 'FIELDSET', 'LEGEND'
    ];
    
    // 检查标签名
    if (blockElements.includes(element.tagName)) {
        return true;
    }
    
    // 检查CSS display属性
    const computedStyle = window.getComputedStyle(element);
    const display = computedStyle.display;
    
    return display === 'block' || 
           display === 'flex' || 
           display === 'grid' || 
           display === 'table' ||
           display === 'list-item';
}

/**
 * 创建工具栏按钮
 */
function createToolbarButton(icon, title) {
    const button = document.createElement('button');
    button.textContent = icon;
    button.title = title;
    button.style.cssText = `
        width: 32px;
        height: 32px;
        border: 1px solid #ddd;
        border-radius: 4px;
        background: white;
        cursor: pointer;
        font-weight: 500;
        transition: all 0.2s ease;
    `;
    
    button.addEventListener('mouseenter', () => {
        button.style.backgroundColor = '#f0f0f0';
        button.style.transform = 'translateY(-1px)';
        button.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
    });
    
    button.addEventListener('mouseleave', () => {
        button.style.backgroundColor = 'white';
        button.style.transform = 'translateY(0)';
        button.style.boxShadow = 'none';
    });
    
    button.addEventListener('click', () => {
        // 添加点击反馈
        button.style.backgroundColor = '#e0e0e0';
        setTimeout(() => {
            button.style.backgroundColor = 'white';
        }, 150);
    });
    
    return button;
}

/**
 * 显示富文本工具栏
 */
function showToolbar(element) {
    if (!DEFAULT_CONFIG.toolbarEnabled) return;
    
    const toolbar = getToolbar();
    const rect = element.getBoundingClientRect();
    currentActiveElement = element;
    
    toolbar.style.display = 'flex';
    toolbar.style.left = `${Math.max(10, rect.left)}px`;
    toolbar.style.top = `${rect.top - 50}px`;
}

/**
 * 隐藏富文本工具栏
 */
function hideToolbar() {
    if (currentToolbar) {
        currentToolbar.style.display = 'none';
    }
    currentActiveElement = null;
}

/**
 * 初始化单个可编辑元素
 */
async function initEditableElement(element) {
    const key = generateContentKey(element);
    
    element.setAttribute('contenteditable', 'true');
    element.style.cursor = 'text';
    element.style.outline = 'none';
    element.style.transition = 'background-color 0.2s';
    
    // 恢复段落背景色（如果有保存）
    const paragraphBgKey = key + '_paragraph_bg';
    try {
        const savedBgColor = await DB.get('content', paragraphBgKey);
        if (savedBgColor) {
            element.style.backgroundColor = savedBgColor;
            element.style.padding = '8px 12px';
            element.style.borderRadius = '4px';
        }
    } catch (error) {
        console.log('无段落背景色保存:', paragraphBgKey);
    }
    
    element.addEventListener('mouseenter', () => {
        element.style.backgroundColor = '#fef9e6';
    });
    
    element.addEventListener('mouseleave', () => {
        element.style.backgroundColor = '';
    });
    
    element.addEventListener('focus', () => {
        element.style.backgroundColor = '#fff8e7';
        element.style.border = '1px dashed #ff9800';
        showToolbar(element);
    });
    
    element.addEventListener('blur', () => {
        element.style.backgroundColor = '';
        element.style.border = '';
        setTimeout(() => {
            if (!currentActiveElement) hideToolbar();
        }, 200);
        debouncedSave(element, key, element.innerHTML);
    });
    
    element.addEventListener('input', () => {
        debouncedSave(element, key, element.innerHTML);
    });
    
    // 添加快捷键支持
    element.addEventListener('keydown', (e) => {
        // Ctrl+Z: 撤销
        if (e.ctrlKey && e.key === 'z') {
            e.preventDefault();
            document.execCommand('undo', false, null);
        }
        // Ctrl+Y: 重做
        if (e.ctrlKey && e.key === 'y') {
            e.preventDefault();
            document.execCommand('redo', false, null);
        }
        // Ctrl+B: 加粗
        if (e.ctrlKey && e.key === 'b') {
            e.preventDefault();
            document.execCommand('bold', false, null);
        }
        // Ctrl+I: 斜体
        if (e.ctrlKey && e.key === 'i') {
            e.preventDefault();
            document.execCommand('italic', false, null);
        }
        // Ctrl+U: 下划线
        if (e.ctrlKey && e.key === 'u') {
            e.preventDefault();
            document.execCommand('underline', false, null);
        }
    });
    
    // 恢复保存的内容
    const savedContent = await DB.getContent(key);
    if (savedContent && savedContent !== element.innerHTML) {
        element.innerHTML = savedContent;
        console.log('内容已恢复:', key);
    }
}

/**
 * 初始化内容管理器
 */
async function initContentManager(target = '[contenteditable]', options = {}) {
    Object.assign(DEFAULT_CONFIG, options);
    
    if (document.readyState === 'loading') {
        await new Promise(resolve => {
            document.addEventListener('DOMContentLoaded', resolve);
        });
    }
    
    let elements = [];
    if (typeof target === 'string') {
        elements = Array.from(document.querySelectorAll(target));
    } else if (target instanceof HTMLElement) {
        elements = [target];
    } else if (Array.isArray(target)) {
        elements = target;
    }
    
    elements = elements.filter(el => 
        DEFAULT_CONFIG.supportedTags.includes(el.tagName)
    );
    
    console.log(`内容管理器初始化，找到 ${elements.length} 个可编辑元素`);
    
    for (const element of elements) {
        await initEditableElement(element);
    }
}

/**
 * 手动保存指定元素的内容
 */
async function saveElementContent(target) {
    const element = typeof target === 'string' ? document.querySelector(target) : target;
    if (element && element.isContentEditable) {
        const key = generateContentKey(element);
        await DB.saveContent(key, element.innerHTML);
        console.log('手动保存成功:', key);
        showSaveIndicator(element);
    }
}

/**
 * 刷新所有内容
 */
async function reloadAllContents() {
    const elements = document.querySelectorAll('[contenteditable]');
    for (const element of elements) {
        const key = generateContentKey(element);
        const savedContent = await DB.getContent(key);
        if (savedContent && savedContent !== element.innerHTML) {
            element.innerHTML = savedContent;
        }
    }
    console.log('所有内容已重新加载');
}

// 导出函数
window.ContentManager = {
    init: initContentManager,
    saveElement: saveElementContent,
    reload: reloadAllContents,
    clearAll: async () => {
        if (confirm('确定要清空所有保存的内容吗？此操作不可恢复！')) {
            const elements = document.querySelectorAll('[contenteditable]');
            for (const element of elements) {
                const key = generateContentKey(element);
                await DB.saveContent(key, '');
            }
            await reloadAllContents();
            console.log('所有内容已清空');
        }
    }
};