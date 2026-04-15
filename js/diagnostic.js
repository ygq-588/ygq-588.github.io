// 相册CMS诊断工具
console.log('🔧 相册CMS诊断开始...');

// 1. 检查容器
console.log('1. 检查相册容器:');
const containerSelectors = [
    '.gallery-grid',
    '.gallery-container', 
    '.photo-grid',
    '#gallery',
    '#photoGallery'
];

containerSelectors.forEach(selector => {
    const element = document.querySelector(selector);
    if (element) {
        console.log(`   ✅ ${selector}: 找到`);
        console.log(`     类名: ${element.className}`);
        console.log(`     ID: ${element.id}`);
        console.log(`     子元素数量: ${element.children.length}`);
    } else {
        console.log(`   ❌ ${selector}: 未找到`);
    }
});

// 2. 检查图片
console.log('2. 检查黄山图片:');
const huangshanImages = [1,2,3,4,5,6].map(i => `images/黄山/黄山${i}.jpg`);
huangshanImages.forEach(src => {
    const img = new Image();
    img.onload = () => console.log(`   ✅ ${src}: 加载成功`);
    img.onerror = () => console.log(`   ❌ ${src}: 加载失败`);
    img.src = src;
});

// 3. 检查CMS元素
console.log('3. 检查CMS元素:');
setTimeout(() => {
    const cmsButton = document.querySelector('.cms-control-btn');
    if (cmsButton) {
        console.log('   ✅ CMS控制按钮: 找到');
        console.log(`     文本: ${cmsButton.textContent}`);
    } else {
        console.log('   ❌ CMS控制按钮: 未找到');
    }
    
    // 检查编辑模式
    const editables = document.querySelectorAll('.editable');
    console.log(`   可编辑元素: ${editables.length} 个`);
    
    // 检查拖拽区域
    const dragZone = document.querySelector('.drag-drop-zone');
    if (dragZone) {
        console.log('   ✅ 拖拽区域: 已创建');
    } else {
        console.log('   ❌ 拖拽区域: 未创建');
    }
}, 1000);

// 4. 页面结构摘要
console.log('4. 页面结构摘要:');
console.log(`   Body子元素: ${document.body.children.length}`);
console.log(`   所有Div数量: ${document.querySelectorAll('div').length}`);
console.log(`   图片总数: ${document.querySelectorAll('img').length}`);

console.log('🔧 诊断完成，请查看上方结果');
