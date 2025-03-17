/**
 * 四季变迁3D场景
 * 主入口文件
 * 展示春夏秋冬四个季节的3D交互体验
 */
(function() {
    /**
     * 检测是否为移动设备
     * @returns {boolean} 是否为移动设备
     */
    function isMobileDevice() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
               window.innerWidth < 768;
    }
    
    /**
     * 初始化交互事件
     */
    function initEvents() {
        // 季节切换按钮
        const seasonButtons = {
            spring: document.getElementById('spring-btn'),
            summer: document.getElementById('summer-btn'),
            autumn: document.getElementById('autumn-btn'),
            winter: document.getElementById('winter-btn')
        };
        
        seasonButtons.spring.addEventListener('click', () => changeSeason('spring', scene, lights));
        seasonButtons.summer.addEventListener('click', () => changeSeason('summer', scene, lights));
        seasonButtons.autumn.addEventListener('click', () => changeSeason('autumn', scene, lights));
        seasonButtons.winter.addEventListener('click', () => changeSeason('winter', scene, lights));
        
        // 日夜切换按钮
        const dayNightBtn = document.getElementById('day-night-btn');
        dayNightBtn.addEventListener('click', () => toggleDayNight(scene, lights));
        
        // 恢复提示信息
        const instructions = document.querySelector('.instructions');
        document.addEventListener('click', () => {
            if (instructions.style.opacity === '0') {
                instructions.style.opacity = '0.7';
                setTimeout(() => {
                    instructions.style.opacity = '0';
                }, 5000); // 延长在移动设备上的显示时间
            }
        });
        
        // 在场景中显示标签
        if (!isMobileDevice()) {
            // 鼠标移动显示标签只在桌面设备上启用
            renderer.domElement.addEventListener('mousemove', showLabelsOnHover);
        } else {
            // 在移动设备上，点击显示标签
            renderer.domElement.addEventListener('touchstart', function(event) {
                if (event.touches.length === 1) {
                    const touch = event.touches[0];
                    const fakeEvent = {
                        clientX: touch.clientX,
                        clientY: touch.clientY
                    };
                    showLabelsOnHover(fakeEvent);
                }
            });
        }
        
        // 添加窗口调整事件监听器
        window.addEventListener('resize', onWindowResize);
    }
    
    /**
     * 应用初始化
     */
    function init() {
        // 初始化场景
        const { scene: sceneObj, camera: cameraObj, renderer: rendererObj } = initScene();
        scene = sceneObj;
        camera = cameraObj;
        renderer = rendererObj;
        
        // 添加光源
        lights = addLights(scene);
        
        // 创建相机控制器
        controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.rotateSpeed = isMobileDevice() ? 0.5 : 0.7; // 移动设备上降低旋转速度
        controls.minDistance = 5;
        controls.maxDistance = 30;
        controls.maxPolarAngle = Math.PI / 2 - 0.1; // 限制相机不能到地面以下
        controls.minPolarAngle = 0.1; // 限制相机俯角
        controls.target.set(0, 3, 0);
        controls.update();
        
        // 创建地面
        terrain = createTerrain(scene);
        
        // 创建小房子
        house = createHouse(scene);
        
        // 创建通向小房子的蜿蜒木板路
        createWoodenPath(scene);
        
        // 创建星星背景
        createStars(scene, currentSeason, isNightMode);
        
        // 创建银河系(仅在夏季夜晚显示)
        galaxy = createGalaxy(scene);
        
        // 创建季节元素
        createSpringElements(scene);
        createSummerElements(scene);
        createAutumnElements(scene);
        createWinterElements(scene);
        
        // 添加标签系统
        createLabels(scene);
        
        // 仅显示春季元素
        changeSeason('spring', scene, lights);
        
        // 如果初始季节是冬季，确保显示烟雾
        if (currentSeason === 'winter' && house && house.smoke) {
            house.smoke.visible = true;
        }
        
        // 初始化交互事件
        initEvents();
        
        // 根据设备类型调整指引
        updateInstructionsForDevice();
        
        // 隐藏加载指示器
        const instructions = document.querySelector('.instructions');
        setTimeout(() => {
            instructions.style.opacity = "0.7";
            setTimeout(() => {
                instructions.style.opacity = "0";
            }, isMobileDevice() ? 8000 : 5000); // 移动设备上显示更长时间
        }, 2000);
        
        // 开始动画循环
        animate();
    }
    
    /**
     * 根据设备类型更新交互指南
     */
    function updateInstructionsForDevice() {
        const isMobile = isMobileDevice();
        const mobileInstructions = document.querySelectorAll('.mobile-only');
        const desktopInstructions = document.querySelectorAll('.desktop-only');
        
        mobileInstructions.forEach(elem => {
            elem.style.display = isMobile ? 'block' : 'none';
        });
        
        desktopInstructions.forEach(elem => {
            elem.style.display = isMobile ? 'none' : 'block';
        });
    }
    
    // 启动应用
    init();
})(); 