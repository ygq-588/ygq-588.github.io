/**
 * 王子殿下网站 - 完整修复版相册JS
 * 修复照片上传后不显示的问题
 */

// 相册数据 - 初始数据
let galleryData = [
    {id: 101, src: "images/黄山/IMG_20250402_073324.jpg", category: "huangshan", title: "黄山迎客松", description: "黄山标志性景观迎客松"},
    {id: 102, src: "images/黄山/IMG_20250402_074608.jpg", category: "huangshan", title: "云海奇观", description: "黄山四大奇观之一的云海"},
    {id: 103, src: "images/黄山/IMG_20250402_080852.jpg", category: "huangshan", title: "光明顶日出", description: "在黄山第二高峰光明顶观看日出"},
    {id: 104, src: "images/黄山/IMG_20250402_093050.jpg", category: "huangshan", title: "奇石怪峰", description: "黄山的奇石景观"},
    {id: 105, src: "images/黄山/IMG_20250402_093600.jpg", category: "huangshan", title: "西海大峡谷", description: "黄山最壮观的峡谷之一"},
    {id: 106, src: "images/黄山/IMG_20250402_100122.jpg", category: "huangshan", title: "温泉景区", description: "黄山温泉，古称'朱砂泉'"}
];

let currentImageIndex = 0;
let currentFilter = 'all';

// 确保函数在全局作用域
window.renderGallery = function(filter) {
    console.log(`🎨 渲染相册，筛选: ${filter}`);
    currentFilter = filter;
    const gallery = document.getElementById("photoGallery");
    if (!gallery) {
        console.error("❌ 找不到相册容器 #photoGallery");
        return;
    }
    
    gallery.innerHTML = "";
    const images = filter === 'all' ? galleryData : galleryData.filter(img => img.category === filter);
    
    console.log(`📊 显示 ${images.length} 张照片`);
    
    if (images.length === 0) {
        gallery.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #666;">
                <i class="fas fa-images" style="font-size: 48px; margin-bottom: 20px; opacity: 0.3;"></i>
                <h3>暂无照片</h3>
                <p>请上传照片或选择其他分类</p>
            </div>
        `;
        return;
    }
    
    images.forEach((image, index) => {
        const item = document.createElement("div");
        item.className = "gallery-item";
        item.setAttribute("data-category", image.category);
        item.setAttribute("data-index", index);
        
        // 检查图片是否存在
        const img = new Image();
        img.onload = function() {
            // 图片加载成功
            item.innerHTML = `
                <img src="${image.src}" alt="${image.title}" loading="lazy" style="width: 100%; height: 200px; object-fit: cover;">
                <div class="photo-info">
                    <div class="photo-title">${image.title}</div>
                    <div class="photo-description">${image.description}</div>
                    <div style="font-size: 12px; color: #999; margin-top: 5px;">
                        <i class="fas fa-tag"></i> ${image.category}
                    </div>
                </div>
            `;
        };
        
        img.onerror = function() {
            // 图片加载失败
            item.innerHTML = `
                <div style="width: 100%; height: 200px; background: #f0f0f0; display: flex; align-items: center; justify-content: center; color: #999;">
                    <i class="fas fa-image" style="font-size: 48px;"></i>
                </div>
                <div class="photo-info">
                    <div class="photo-title">${image.title}</div>
                    <div class="photo-description">${image.description}</div>
                    <div style="font-size: 12px; color: #ff6b6b; margin-top: 5px;">
                        <i class="fas fa-exclamation-triangle"></i> 图片加载失败
                    </div>
                </div>
            `;
        };
        
        img.src = image.src;
        
        // 点击查看大图
        item.style.cursor = "pointer";
        item.addEventListener("click", function() {
            const globalIndex = galleryData.findIndex(img => img.id === image.id);
            if (globalIndex !== -1) {
                openImageViewer(globalIndex);
            }
        });
        
        gallery.appendChild(item);
    });
    
    console.log("✅ 相册渲染完成");
};

window.filterGallery = function(filter) {
    console.log(`🔍 筛选: ${filter}`);
    console.log(`📝 设置 currentFilter = "${filter}"`);
    console.log(`📝 设置 window.currentFilter = "${filter}"`);
    
    // 1. 更新全局变量
    currentFilter = filter;
    window.currentFilter = filter;
    
    // 2. 更新按钮状态 - 超级简单版
    console.log('🔄 更新按钮状态...');
    
    // 找到所有按钮
    const buttons = document.querySelectorAll('.filter-btn');
    console.log(`找到 ${buttons.length} 个.filter-btn按钮`);
    
    if (buttons.length === 0) {
        console.warn('⚠️ 未找到.filter-btn按钮，检查HTML结构');
    }
    
    // 记录激活的按钮
    let activatedButton = null;
    
    // 遍历所有按钮
    buttons.forEach((btn, index) => {
        // 移除所有active类
        btn.classList.remove('active');
        
        // 获取按钮信息
        const dataFilter = btn.getAttribute('data-filter');
        const btnText = btn.querySelector('h3')?.textContent.trim() || btn.textContent.trim();
        
        console.log(`  按钮${index+1}: "${btnText}", data-filter="${dataFilter}"`);
        
        // 检查是否匹配
        if (dataFilter === filter) {
            btn.classList.add('active');
            activatedButton = btn;
            console.log(`  ✅ 匹配成功！激活按钮`);
        }
    });
    
    // 报告结果
    if (activatedButton) {
        const btnText = activatedButton.querySelector('h3')?.textContent.trim() || activatedButton.textContent.trim();
        console.log(`🎯 已激活按钮: "${btnText}"`);
        console.log(`✅ 按钮激活状态: ${activatedButton.classList.contains('active')}`);
        
        // 强制应用样式（备用方案）
        activatedButton.style.border = '4px solid #4CAF50';
        activatedButton.style.background = 'linear-gradient(135deg, rgba(76, 175, 80, 0.15), rgba(76, 175, 80, 0.25))';
        activatedButton.style.boxShadow = '0 8px 25px rgba(76, 175, 80, 0.4)';
        activatedButton.style.transform = 'translateY(-8px) scale(1.05)';
    } else {
        console.warn(`⚠️ 未找到匹配的按钮！filter="${filter}"`);
        console.log('尝试激活第一个按钮作为备用...');
        if (buttons.length > 0) {
            buttons[0].classList.add('active');
        }
    }
    
    // 3. 渲染相册
    console.log('🎨 开始渲染相册...');
    renderGallery(filter);
};

window.openImageViewer = function(index) {
    console.log(`🖼️ 打开图片查看器: 索引 ${index}`);
    currentImageIndex = index;
    const image = galleryData[index];
    
    const viewer = document.getElementById("imageViewer");
    const viewerImage = document.getElementById("viewerImage");
    const viewerTitle = document.getElementById("viewerTitle");
    const viewerDescription = document.getElementById("viewerDescription");
    const viewerIndex = document.getElementById("viewerIndex");
    
    if (viewer && viewerImage && viewerTitle && viewerDescription) {
        viewerImage.src = image.src;
        viewerImage.alt = image.title;
        viewerTitle.textContent = image.title;
        viewerDescription.textContent = image.description;
        
        if (viewerIndex) {
            viewerIndex.textContent = `${index + 1} / ${galleryData.length}`;
        }
        
        viewer.classList.add("active");
        document.body.style.overflow = "hidden"; // 防止背景滚动
        
        console.log(`✅ 显示图片: ${image.title}`);
    } else {
        console.error("❌ 找不到图片查看器元素");
    }
};

window.closeImageViewer = function() {
    console.log("❌ 关闭图片查看器");
    const viewer = document.getElementById("imageViewer");
    if (viewer) {
        viewer.classList.remove("active");
        document.body.style.overflow = ""; // 恢复滚动
    }
};

window.prevImage = function() {
    if (galleryData.length === 0) return;
    
    currentImageIndex--;
    if (currentImageIndex < 0) {
        currentImageIndex = galleryData.length - 1;
    }
    
    console.log(`⬅️ 上一张: 索引 ${currentImageIndex}`);
    openImageViewer(currentImageIndex);
};

window.nextImage = function() {
    if (galleryData.length === 0) return;
    
    currentImageIndex++;
    if (currentImageIndex >= galleryData.length) {
        currentImageIndex = 0;
    }
    
    console.log(`➡️ 下一张: 索引 ${currentImageIndex}`);
    openImageViewer(currentImageIndex);
};

// 添加新照片到相册
window.addToGallery = function(imageData) {
    console.log(`➕ 添加新照片: ${imageData.title}`);
    
    // 确保有唯一ID
    if (!imageData.id) {
        imageData.id = Date.now() + Math.floor(Math.random() * 1000);
    }
    
    // 添加到数据数组
    galleryData.push(imageData);
    
    // 重新渲染当前筛选
    renderGallery(currentFilter);
    
    console.log(`✅ 照片添加成功，相册总数: ${galleryData.length}`);
    return imageData.id;
};

// 从相册删除照片
window.removeFromGallery = function(imageId) {
    console.log(`🗑️ 删除照片: ID ${imageId}`);
    
    const initialLength = galleryData.length;
    galleryData = galleryData.filter(img => img.id !== imageId);
    
    if (galleryData.length < initialLength) {
        renderGallery(currentFilter);
        console.log(`✅ 照片删除成功，剩余: ${galleryData.length}`);
        return true;
    } else {
        console.log(`❌ 未找到ID为 ${imageId} 的照片`);
        return false;
    }
};

// 获取相册数据
window.getGalleryData = function() {
    return galleryData;
};

// 保存相册数据到本地存储
window.saveGalleryToLocalStorage = function() {
    try {
        localStorage.setItem('princeGalleryData', JSON.stringify(galleryData));
        console.log(`💾 相册数据已保存到本地存储: ${galleryData.length} 张照片`);
        return true;
    } catch (error) {
        console.error('❌ 保存到本地存储失败:', error);
        return false;
    }
};

// 从本地存储加载相册数据
window.loadGalleryFromLocalStorage = function() {
    try {
        const savedData = localStorage.getItem('princeGalleryData');
        if (savedData) {
            const parsedData = JSON.parse(savedData);
            if (Array.isArray(parsedData)) {
                galleryData = parsedData;
                console.log(`📂 从本地存储加载相册数据: ${galleryData.length} 张照片`);
                return true;
            }
        }
    } catch (error) {
        console.error('❌ 从本地存储加载失败:', error);
    }
    return false;
};

// 页面加载时初始化
document.addEventListener("DOMContentLoaded", function() {
    console.log("📄 页面DOM加载完成");
    
    // 尝试从本地存储加载数据
    if (!loadGalleryFromLocalStorage()) {
        console.log("📝 使用初始相册数据");
    }
    
    // 初始渲染
    renderGallery("all");
    
    // 设置键盘快捷键
    document.addEventListener("keydown", function(event) {
        const viewer = document.getElementById("imageViewer");
        if (viewer && viewer.classList.contains("active")) {
            switch(event.key) {
                case "Escape":
                    closeImageViewer();
                    break;
                case "ArrowLeft":
                    prevImage();
                    break;
                case "ArrowRight":
                    nextImage();
                    break;
            }
        }
    });
    
    // 点击查看器背景关闭
    const viewer = document.getElementById("imageViewer");
    if (viewer) {
        viewer.addEventListener("click", function(event) {
            if (event.target === viewer) {
                closeImageViewer();
            }
        });
    }
    
    console.log("✅ 相册系统初始化完成");
});

// 导出全局函数和变量
window.galleryData = galleryData;
window.currentImageIndex = currentImageIndex;
window.currentFilter = currentFilter;

console.log("🎉 修复版相册JS加载完成");