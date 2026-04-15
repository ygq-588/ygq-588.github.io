// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 处理头像图片加载
    const avatarImage = document.getElementById('avatarImage');
    if (avatarImage) {
        // 检查头像图片是否加载成功
        avatarImage.onerror = function() {
            // 如果加载失败，使用默认头像
            this.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><circle cx="100" cy="100" r="95" fill="%238B4513" stroke="%23D4AF37" stroke-width="3"/><circle cx="100" cy="80" r="30" fill="%23F5F5DC"/><path d="M60,140 Q100,180 140,140" fill="none" stroke="%23F5F5DC" stroke-width="8" stroke-linecap="round"/><text x="100" y="190" text-anchor="middle" fill="%23D4AF37" font-family="Arial" font-size="24" font-weight="bold">👑</text></svg>';
            this.alt = '默认头像 - 请上传您的照片';
            
            // 添加提示
            const avatarContainer = document.querySelector('.hero-avatar');
            if (avatarContainer) {
                const tip = document.createElement('div');
                tip.className = 'avatar-tip';
                tip.innerHTML = '<small>提示：请将您的头像图片命名为 avatar.jpg 并放在 images 文件夹中</small>';
                avatarContainer.appendChild(tip);
            }
        };
        
        // 添加点击功能：调整裁剪位置
        let cropPosition = 30; // 默认裁剪位置 30%
        avatarImage.addEventListener('click', function(e) {
            e.preventDefault();
            
            // 切换裁剪位置
            cropPosition = cropPosition === 30 ? 50 : cropPosition === 50 ? 70 : 30;
            this.style.objectPosition = `center ${cropPosition}%`;
            
            // 显示提示
            const positions = {
                30: '头部特写',
                50: '标准居中',
                70: '上半身'
            };
            
            // 创建或更新提示
            let tip = document.querySelector('.crop-tip');
            if (!tip) {
                tip = document.createElement('div');
                tip.className = 'crop-tip';
                this.parentElement.appendChild(tip);
            }
            
            tip.textContent = `裁剪模式：${positions[cropPosition]} (点击切换)`;
            tip.style.display = 'block';
            
            // 3秒后隐藏提示
            setTimeout(() => {
                tip.style.display = 'none';
            }, 2000);
        });
        
        // 添加右键菜单：上传提示
        avatarImage.addEventListener('contextmenu', function(e) {
            e.preventDefault();
            alert('头像使用说明：\n\n1. 更换头像：将照片命名为 avatar.jpg 放在 images 文件夹\n2. 调整裁剪：左键点击切换头部/上半身显示\n3. 当前尺寸：220x220像素\n4. 边框颜色：可修改CSS中的 --secondary-color 变量');
            return false;
        });
    }
    
    // 移动端导航菜单切换
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            navToggle.innerHTML = navMenu.classList.contains('active') 
                ? '<i class="fas fa-times"></i>' 
                : '<i class="fas fa-bars"></i>';
        });
        
        // 点击菜单项后关闭移动端菜单
        const navLinks = document.querySelectorAll('.nav-menu a');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                if (window.innerWidth <= 768) {
                    navMenu.classList.remove('active');
                    navToggle.innerHTML = '<i class="fas fa-bars"></i>';
                }
            });
        });
    }
    
    // 平滑滚动到锚点
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // 动态更新版权年份
    const yearElement = document.querySelector('.footer-text');
    if (yearElement) {
        const currentYear = new Date().getFullYear();
        yearElement.textContent = yearElement.textContent.replace('2026', currentYear);
    }
    
    // 添加页面加载动画
    const animateOnScroll = function() {
        const elements = document.querySelectorAll('.feature-card, .gallery-item, .diary-entry');
        
        elements.forEach(element => {
            const elementPosition = element.getBoundingClientRect().top;
            const screenPosition = window.innerHeight / 1.2;
            
            if (elementPosition < screenPosition) {
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }
        });
    };
    
    // 初始化元素样式
    const animatedElements = document.querySelectorAll('.feature-card, .gallery-item, .diary-entry');
    animatedElements.forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        element.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    });
    
    // 监听滚动事件
    window.addEventListener('scroll', animateOnScroll);
    
    // 初始触发一次
    animateOnScroll();
    
    // 添加主题切换功能（可选）
    const themeToggle = document.createElement('button');
    themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    themeToggle.className = 'theme-toggle';
    themeToggle.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background: var(--primary-color);
        color: white;
        border: none;
        cursor: pointer;
        z-index: 1000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.2rem;
        transition: all 0.3s ease;
    `;
    
    document.body.appendChild(themeToggle);
    
    themeToggle.addEventListener('click', function() {
        document.body.classList.toggle('dark-theme');
        const icon = this.querySelector('i');
        if (document.body.classList.contains('dark-theme')) {
            icon.className = 'fas fa-sun';
            this.style.background = 'var(--secondary-color)';
        } else {
            icon.className = 'fas fa-moon';
            this.style.background = 'var(--primary-color)';
        }
    });
    
    // 暗色主题样式
    const darkThemeStyles = `
        <style>
            .dark-theme {
                --light-color: #1a1a1a;
                --white: #2d2d2d;
                --text-color: #e0e0e0;
                --text-light: #b0b0b0;
                --dark-color: #121212;
                --shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            }
            
            .dark-theme .feature-card,
            .dark-theme .diary-entry {
                background-color: #2d2d2d;
            }
            
            .dark-theme .quote-section {
                background-color: rgba(139, 69, 19, 0.1);
            }
        </style>
    `;
    
    document.head.insertAdjacentHTML('beforeend', darkThemeStyles);
    
    // 图片懒加载
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    const src = img.getAttribute('data-src');
                    if (src) {
                        img.src = src;
                        img.removeAttribute('data-src');
                    }
                    observer.unobserve(img);
                }
            });
        });
        
        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }
    
    // 控制台欢迎信息
    console.log('%c👑 欢迎来到我的小屋！', 'color: #D4AF37; font-size: 18px; font-weight: bold;');
    console.log('%c网站已成功加载，祝您浏览愉快！', 'color: #8B4513; font-size: 14px;');
});