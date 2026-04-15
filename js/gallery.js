// 相册数据
const galleryData = [
    // 黄山旅游相册 - 2025年4月3日
    {
        id: 101,
        src: "images/黄山/IMG_20250402_073324.jpg",
        category: "huangshan",
        title: "黄山迎客松",
        description: "黄山标志性景观迎客松，树龄已超过800年，姿态优美，如张开双臂欢迎游客。"
    },
    {
        id: 102,
        src: "images/黄山/IMG_20250402_074608.jpg",
        category: "huangshan",
        title: "云海奇观",
        description: "黄山四大奇观之一的云海，云雾缭绕，山峰若隐若现，如仙境般美丽。"
    },
    {
        id: 103,
        src: "images/黄山/IMG_20250402_080852.jpg",
        category: "huangshan",
        title: "光明顶日出",
        description: "在黄山第二高峰光明顶观看日出，太阳从云海中缓缓升起，金光洒满群山。"
    },
    {
        id: 104,
        src: "images/黄山/IMG_20250402_093050.jpg",
        category: "huangshan",
        title: "奇石怪峰",
        description: "黄山的奇石景观，经过亿万年风化形成的独特岩石造型，令人叹为观止。"
    },
    {
        id: 105,
        src: "images/黄山/IMG_20250402_093600.jpg",
        category: "huangshan",
        title: "西海大峡谷",
        description: "黄山最壮观的峡谷之一，栈道蜿蜒于悬崖峭壁之间，景色险峻秀丽。"
    },
    {
        id: 106,
        src: "images/黄山/IMG_20250402_100122.jpg",
        category: "huangshan",
        title: "温泉景区",
        description: "黄山温泉，古称'朱砂泉', 水质清澈，富含矿物质，登山后泡温泉格外舒适。"
    },
    
    // 原有相册数据
    {
        id: 1,
        src: "https://images.unsplash.com/photo-1519681393784-d120267933ba?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        category: "nature",
        title: "山间日出",
        description: "清晨在山顶拍摄的日出美景，阳光穿透云层，温暖而宁静。"
    },
    {
        id: 2,
        src: "https://images.unsplash.com/photo-1528164344705-47542687000d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        category: "travel",
        title: "京都寺庙",
        description: "日本京都的古老寺庙，宁静的庭院和精致的建筑细节。"
    },
    {
        id: 3,
        src: "https://images.unsplash.com/photo-1516542076529-1ea3854896f2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        category: "daily",
        title: "晨间咖啡",
        description: "一天的美好从一杯精心准备的咖啡开始。"
    },
    {
        id: 4,
        src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        category: "nature",
        title: "雪山之巅",
        description: "冬季登山时拍摄的雪山景色，纯净而壮观。"
    },
    {
        id: 5,
        src: "https://images.unsplash.com/photo-1533105079780-92b9be482077?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        category: "travel",
        title: "巴黎铁塔",
        description: "夜晚的埃菲尔铁塔，灯光璀璨，浪漫至极。"
    },
    {
        id: 6,
        src: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        category: "daily",
        title: "书房时光",
        description: "安静的下午，在书房阅读和思考的时光。"
    },
    {
        id: 7,
        src: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        category: "nature",
        title: "森林小径",
        description: "秋日的森林小径，落叶铺成金色地毯。"
    },
    {
        id: 8,
        src: "https://images.unsplash.com/photo-1534008897995-27a23e859048?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        category: "travel",
        title: "威尼斯水城",
        description: "意大利威尼斯的运河和古老建筑，水上城市的独特魅力。"
    },
    {
        id: 9,
        src: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        category: "daily",
        title: "烹饪乐趣",
        description: "在厨房尝试新食谱，享受烹饪的创造过程。"
    },
    {
        id: 10,
        src: "https://images.unsplash.com/photo-1505142468610-359e7d316be0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        category: "nature",
        title: "湖畔黄昏",
        description: "日落时分的湖边，水面倒映着晚霞的绚丽色彩。"
    },
    {
        id: 11,
        src: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        category: "travel",
        title: "巴厘岛海滩",
        description: "印度尼西亚巴厘岛的白色沙滩和清澈海水，度假天堂。"
    },
    {
        id: 12,
        src: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        category: "daily",
        title: "音乐时刻",
        description: "弹奏钢琴的宁静时刻，音乐让心灵得到放松。"
    }
];

// 图片查看器状态
let currentImageIndex = 0;
let currentFilter = 'all';

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 初始化相册
    renderGallery('all');
    
    // 添加图片查看器样式
    addImageViewerStyles();
});

// 渲染相册
function renderGallery(filter) {
    currentFilter = filter;
    const galleryElement = document.getElementById('photoGallery');
    
    if (!galleryElement) return;
    
    // 清空现有内容
    galleryElement.innerHTML = '';
    
    // 筛选图片
    const filteredImages = filter === 'all' 
        ? galleryData 
        : galleryData.filter(img => img.category === filter);
    
    // 渲染图片
    filteredImages.forEach((image, index) => {
        const galleryItem = document.createElement('div');
        galleryItem.className = 'gallery-item';
        galleryItem.setAttribute('data-category', image.category);
        galleryItem.setAttribute('data-index', index);
        
        galleryItem.innerHTML = `
            <img src="${image.src}" alt="${image.title}" loading="lazy" data-src="${image.src}">
            <div class="gallery-caption">
                <h4>${image.title}</h4>
                <p>${image.description}</p>
            </div>
        `;
        
        // 添加点击事件
        galleryItem.addEventListener('click', () => openImageViewer(index, filter));
        
        galleryElement.appendChild(galleryItem);
    });
    
    // 更新分类按钮状态
    updateFilterButtons(filter);
}

// 筛选相册
function filterGallery(category) {
    renderGallery(category);
    
    // 滚动到相册区域
    const gallerySection = document.querySelector('.gallery-grid');
    if (gallerySection) {
        gallerySection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// 更新筛选按钮状态
function updateFilterButtons(activeFilter) {
    const filterButtons = document.querySelectorAll('.feature-card[onclick^="filterGallery"]');
    
    filterButtons.forEach(button => {
        const filter = button.getAttribute('onclick').match(/'([^']+)'/)[1];
        if (filter === activeFilter) {
            button.style.boxShadow = '0 0 0 2px var(--secondary-color)';
            button.style.transform = 'translateY(-5px)';
        } else {
            button.style.boxShadow = '';
            button.style.transform = '';
        }
    });
}

// 打开图片查看器
function openImageViewer(index, filter) {
    const filteredImages = filter === 'all' 
        ? galleryData 
        : galleryData.filter(img => img.category === filter);
    
    currentImageIndex = index;
    const image = filteredImages[index];
    
    const viewer = document.getElementById('imageViewer');
    const viewerImage = document.getElementById('viewerImage');
    const imageCaption = document.getElementById('imageCaption');
    
    if (viewer && viewerImage && imageCaption) {
        viewerImage.src = image.src;
        viewerImage.alt = image.title;
        imageCaption.innerHTML = `
            <h3>${image.title}</h3>
            <p>${image.description}</p>
            <p><small>分类: ${getCategoryName(image.category)}</small></p>
        `;
        
        viewer.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

// 关闭图片查看器
function closeImageViewer() {
    const viewer = document.getElementById('imageViewer');
    if (viewer) {
        viewer.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// 上一张图片
function prevImage() {
    const filteredImages = currentFilter === 'all' 
        ? galleryData 
        : galleryData.filter(img => img.category === currentFilter);
    
    currentImageIndex = (currentImageIndex - 1 + filteredImages.length) % filteredImages.length;
    const image = filteredImages[currentImageIndex];
    
    const viewerImage = document.getElementById('viewerImage');
    const imageCaption = document.getElementById('imageCaption');
    
    if (viewerImage && imageCaption) {
        viewerImage.src = image.src;
        viewerImage.alt = image.title;
        imageCaption.innerHTML = `
            <h3>${image.title}</h3>
            <p>${image.description}</p>
            <p><small>分类: ${getCategoryName(image.category)}</small></p>
        `;
    }
}

// 下一张图片
function nextImage() {
    const filteredImages = currentFilter === 'all' 
        ? galleryData 
        : galleryData.filter(img => img.category === currentFilter);
    
    currentImageIndex = (currentImageIndex + 1) % filteredImages.length;
    const image = filteredImages[currentImageIndex];
    
    const viewerImage = document.getElementById('viewerImage');
    const imageCaption = document.getElementById('imageCaption');
    
    if (viewerImage && imageCaption) {
        viewerImage.src = image.src;
        viewerImage.alt = image.title;
        imageCaption.innerHTML = `
            <h3>${image.title}</h3>
            <p>${image.description}</p>
            <p><small>分类: ${getCategoryName(image.category)}</small></p>
        `;
    }
}

// 获取分类名称
function getCategoryName(category) {
    const categoryNames = {
        'all': '全部',
        'travel': '旅行记忆',
        'daily': '日常生活',
        'nature': '自然风光',
        'huangshan': '黄山旅游'
    };
    
    return categoryNames[category] || category;
}

// 添加图片查看器样式
function addImageViewerStyles() {
    const styles = `
        <style>
            .image-viewer {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.9);
                z-index: 2000;
                display: flex;
                align-items: center;
                justify-content: center;
                animation: fadeIn 0.3s ease;
            }
            
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            
            .viewer-content {
                position: relative;
                max-width: 90%;
                max-height: 90%;
                background-color: var(--white);
                border-radius: var(--border-radius);
                overflow: hidden;
                box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
            }
            
            .close-viewer {
                position: absolute;
                top: 15px;
                right: 15px;
                font-size: 2rem;
                color: var(--white);
                background-color: rgba(0, 0, 0, 0.5);
                width: 40px;
                height: 40px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                z-index: 10;
                transition: var(--transition);
            }
            
            .close-viewer:hover {
                background-color: rgba(0, 0, 0, 0.8);
                transform: scale(1.1);
            }
            
            #viewerImage {
                display: block;
                max-width: 100%;
                max-height: 70vh;
                margin: 0 auto;
            }
            
            .image-caption {
                padding: 1.5rem;
                background-color: var(--white);
                color: var(--text-color);
            }
            
            .image-caption h3 {
                color: var(--primary-color);
                margin-bottom: 0.5rem;
            }
            
            .image-caption p {
                margin-bottom: 0.5rem;
                line-height: 1.6;
            }
            
            .viewer-nav {
                position: absolute;
                top: 50%;
                left: 0;
                right: 0;
                display: flex;
                justify-content: space-between;
                padding: 0 20px;
                transform: translateY(-50%);
                pointer-events: none;
            }
            
            .viewer-btn {
                pointer-events: auto;
                width: 50px;
                height: 50px;
                border-radius: 50%;
                background-color: rgba(0, 0, 0, 0.5);
                border: none;
                color: var(--white);
                font-size: 1.5rem;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: var(--transition);
            }
            
            .viewer-btn:hover {
                background-color: rgba(0, 0, 0, 0.8);
                transform: scale(1.1);
            }
            
            /* 键盘导航提示 */
            .keyboard-hint {
                position: absolute;
                bottom: 20px;
                left: 0;
                right: 0;
                text-align: center;
                color: rgba(255, 255, 255, 0.7);
                font-size: 0.9rem;
            }
            
            @media (max-width: 768px) {
                .viewer-content {
                    max-width: 95%;
                    max-height: 95%;
                }
                
                .viewer-btn {
                    width: 40px;
                    height: 40px;
                    font-size: 1.2rem;
                }
                
                .close-viewer {
                    top: 10px;
                    right: 10px;
                    width: 35px;
                    height: 35px;
                    font-size: 1.5rem;
                }
            }
        </style>
    `;
    
    document.head.insertAdjacentHTML('beforeend', styles);
}

// 键盘导航支持
document.addEventListener('keydown', function(e) {
    const viewer = document.getElementById('imageViewer');
    if (viewer && viewer.style.display === 'flex') {
        switch(e.key) {
            case 'Escape':
                closeImageViewer();
                break;
            case 'ArrowLeft':
                prevImage();
                break;
            case 'ArrowRight':
                nextImage();
                break;
        }
    }
});

// 点击背景关闭查看器
document.addEventListener('click', function(e) {
    const viewer = document.getElementById('imageViewer');
    if (viewer && viewer.style.display === 'flex' && e.target === viewer) {
        closeImageViewer();
    }
});