/**
 * 四季变迁3D场景
 * 主入口文件
 * 展示春夏秋冬四个季节的3D交互体验
 */
(function() {
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
                }, 3000);
            }
        });
        
        // 在场景中显示标签
        renderer.domElement.addEventListener('mousemove', showLabelsOnHover);
        
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
        controls.rotateSpeed = 0.7;
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
        
        // 隐藏加载指示器
        const instructions = document.querySelector('.instructions');
        setTimeout(() => {
            instructions.style.opacity = "0.7";
            setTimeout(() => {
                instructions.style.opacity = "0";
            }, 10000);
        }, 2000);
        
        // 开始动画循环
        animate();
    }
    
    // 启动应用
    init();
})(); 