/**
 * 场景初始化模块
 * 负责创建和管理Three.js场景、相机、渲染器等基础组件
 */

// 场景变量
let scene, camera, renderer, controls;
let lights = [];
let clock;

/**
 * 初始化场景
 * @returns {Object} 包含场景对象、相机和渲染器
 */
function initScene() {
    // 创建场景
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb); // 天空蓝色背景
    
    // 设置摄像机
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 5, 15);
    
    // 设置渲染器
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    // 获取容器并添加渲染器的canvas
    const container = document.getElementById('scene-container');
    container.appendChild(renderer.domElement);
    
    // 初始化时钟
    clock = new THREE.Clock();
    
    return { scene, camera, renderer };
}

/**
 * 添加场景光源
 * @param {THREE.Scene} scene - 场景对象
 * @returns {Array} 光源数组
 */
function addLights(scene) {
    // 环境光
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);
    
    // 春季光源 - 柔和的粉色调
    const springLight = new THREE.DirectionalLight(0xffe6e6, 1);
    springLight.position.set(5, 10, 5);
    springLight.castShadow = true;
    springLight.shadow.mapSize.width = 1024;
    springLight.shadow.mapSize.height = 1024;
    scene.add(springLight);
    lights.push({ light: springLight, season: 'spring' });
    
    // 夏季光源 - 明亮的黄色调
    const summerLight = new THREE.DirectionalLight(0xffffcc, 1.3);
    summerLight.position.set(0, 15, 0);
    summerLight.castShadow = true;
    summerLight.shadow.mapSize.width = 1024;
    summerLight.shadow.mapSize.height = 1024;
    scene.add(summerLight);
    lights.push({ light: summerLight, season: 'summer' });
    
    // 秋季光源 - 温暖的橙色调
    const autumnLight = new THREE.DirectionalLight(0xffd6a5, 1);
    autumnLight.position.set(-5, 10, 5);
    autumnLight.castShadow = true;
    autumnLight.shadow.mapSize.width = 1024;
    autumnLight.shadow.mapSize.height = 1024;
    scene.add(autumnLight);
    lights.push({ light: autumnLight, season: 'autumn' });
    
    // 冬季光源 - 冷蓝色调
    const winterLight = new THREE.DirectionalLight(0xe6f0ff, 0.8);
    winterLight.position.set(0, 10, 10);
    winterLight.castShadow = true;
    winterLight.shadow.mapSize.width = 1024;
    winterLight.shadow.mapSize.height = 1024;
    scene.add(winterLight);
    lights.push({ light: winterLight, season: 'winter' });
    
    return lights;
}

/**
 * 根据鼠标或触摸位置显示最近的标签
 * @param {Event} event - 鼠标或触摸事件
 */
function showLabelsOnHover(event) {
    // 计算鼠标在归一化设备坐标(NDC)中的位置
    const mouse = new THREE.Vector2();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    // 使用光线投射确定鼠标下的对象
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);
    
    // 检测设备类型，移动设备上使用更大的触摸响应区域
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
                   window.innerWidth < 768;
    const hitThreshold = isMobile ? 0.2 : 0.1; // 触摸设备上提供更大的点击区域
    
    // 更新标签位置
    labels.forEach(label => {
        if (label.season === currentSeason) {
            // 将3D位置转换为屏幕位置
            const screenPosition = label.position.clone().project(camera);
            
            // 计算到鼠标的距离
            const distance = Math.sqrt(
                Math.pow(screenPosition.x - mouse.x, 2) + 
                Math.pow(screenPosition.y - mouse.y, 2)
            );
            
            // 如果鼠标靠近标签点，则显示标签
            if (distance < hitThreshold) {
                label.element.style.opacity = '1';
                
                // 确保标签在移动设备上好阅读
                const fontSize = isMobile ? '1rem' : '';
                if (isMobile) {
                    label.element.style.fontSize = fontSize;
                }
                
                // 转换为屏幕坐标
                const x = (screenPosition.x + 1) / 2 * window.innerWidth;
                const y = -(screenPosition.y - 1) / 2 * window.innerHeight;
                
                // 移动端优化 - 确保标签不会超出屏幕
                let posX = x;
                let posY = y;
                
                const labelWidth = label.element.offsetWidth || 200; // 估计的宽度
                const labelHeight = label.element.offsetHeight || 50; // 估计的高度
                
                // 确保标签在水平方向上不超出屏幕
                if (posX + labelWidth > window.innerWidth) {
                    posX = window.innerWidth - labelWidth - 10;
                }
                if (posX < 0) {
                    posX = 10;
                }
                
                // 确保标签在垂直方向上不超出屏幕
                if (posY - labelHeight < 0) {
                    posY = labelHeight + 10;
                }
                if (posY > window.innerHeight) {
                    posY = window.innerHeight - 10;
                }
                
                // 更新标签位置
                label.element.style.left = `${posX}px`;
                label.element.style.top = `${posY}px`;
                
                // 在移动设备上，标签显示一定时间后自动消失
                if (isMobile) {
                    clearTimeout(label.hideTimeout);
                    label.hideTimeout = setTimeout(() => {
                        label.element.style.opacity = '0';
                    }, 3000); // 3秒后自动隐藏
                }
            } else if (!isMobile) {
                // 在非移动设备上，鼠标移开时立即隐藏
                label.element.style.opacity = '0';
            }
        }
    });
}

/**
 * 窗口调整大小处理
 */
function onWindowResize() {
    // 更新相机
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    
    // 更新渲染器
    renderer.setSize(window.innerWidth, window.innerHeight);
}

/**
 * 动画更新函数
 * 处理每帧的场景更新和动画
 */
function animate() {
    requestAnimationFrame(animate);
    
    if (controls) controls.update();
    
    const elapsedTime = clock.getElapsedTime();
    
    // 更新星星闪烁（如果在夜间模式且星星已创建）
    if (isNightMode && stars && stars.material.uniforms) {
        stars.material.uniforms.time.value = elapsedTime;
    }
    
    // 银河旋转动画
    if (galaxy && galaxy.visible) {
        galaxy.rotation.y = elapsedTime * 0.03;
        // 让银河缓慢脉动以增强视觉效果
        const pulseFactor = 1.0 + Math.sin(elapsedTime * 0.2) * 0.05; // 5%的脉动范围
        galaxy.scale.set(pulseFactor, pulseFactor, pulseFactor);
    }
    
    // 烟雾动画 - 只在冬季（烟雾可见时）从烟囱上升
    if (house && house.smoke && house.smoke.visible) {
        const smokeParticles = house.smoke.geometry.attributes.position.array;
        for (let i = 0; i < smokeParticles.length; i += 3) {
            smokeParticles[i] += Math.sin((elapsedTime + i) * 0.1) * 0.001;
            smokeParticles[i + 1] += 0.01;
            smokeParticles[i + 2] += Math.cos((elapsedTime + i) * 0.1) * 0.001;
            
            // 重置位置 - 如果烟雾上升过高，将其重置到烟囱顶部
            // 通常是烟雾上升到比烟囱顶部高5个单位时
            if (smokeParticles[i + 1] > house.chimneyTopPosition.y + 5) {
                const spread = 0.2;
                smokeParticles[i] = house.chimneyTopPosition.x + (Math.random() - 0.5) * spread;
                smokeParticles[i + 1] = house.chimneyTopPosition.y;
                smokeParticles[i + 2] = house.chimneyTopPosition.z + (Math.random() - 0.5) * spread;
            }
        }
        house.smoke.geometry.attributes.position.needsUpdate = true;
    }
    
    // 针对当前季节的粒子动画
    updateSeasonalParticles(elapsedTime);
    
    // 渲染场景
    renderer.render(scene, camera);
}

/**
 * 更新季节特定的粒子效果
 * @param {number} elapsedTime - 逝去的时间
 */
function updateSeasonalParticles(elapsedTime) {
    if (currentSeason === 'spring') {
        // 花瓣飘落
        const petals = particles.find(p => p.season === 'spring' && !p.butterfly)?.particles;
        if (petals) {
            const positions = petals.geometry.attributes.position.array;
            for (let i = 0; i < positions.length; i += 3) {
                positions[i] += Math.sin((elapsedTime + i) * 0.1) * 0.01;
                positions[i + 1] -= 0.01;
                positions[i + 2] += Math.cos((elapsedTime + i) * 0.1) * 0.01;
                
                // 重置到顶部
                if (positions[i + 1] < 0) {
                    positions[i + 1] = Math.random() * 8;
                }
            }
            petals.geometry.attributes.position.needsUpdate = true;
        }
        
        // 蝴蝶飞行
        const butterfly = particles.find(p => p.butterfly)?.particles;
        if (butterfly) {
            butterfly.position.x = 3 + Math.sin(elapsedTime * 0.5) * 2;
            butterfly.position.y = 4 + Math.sin(elapsedTime * 0.7) * 0.5;
            butterfly.position.z = 2 + Math.cos(elapsedTime * 0.5) * 2;
            
            butterfly.rotation.y = Math.sin(elapsedTime * 0.5);
            
            // 翅膀扇动
            butterfly.children.forEach((wing, index) => {
                if (index === 0) { // 左翼
                    wing.rotation.z = Math.PI / 2 + Math.sin(elapsedTime * 15) * 0.2;
                } else { // 右翼
                    wing.rotation.z = -Math.PI / 2 - Math.sin(elapsedTime * 15) * 0.2;
                }
            });
        }
    } 
    else if (currentSeason === 'summer') {
        // 蜻蜓飞行
        const dragonfly = particles.find(p => p.dragonfly)?.particles;
        if (dragonfly) {
            dragonfly.position.x = -3 + Math.sin(elapsedTime * 0.7) * 3;
            dragonfly.position.y = 3 + Math.sin(elapsedTime * 0.5) * 0.5;
            dragonfly.position.z = -2 + Math.cos(elapsedTime * 0.7) * 3;
            
            dragonfly.rotation.y = Math.atan2(
                Math.cos(elapsedTime * 0.7) * 3,
                Math.sin(elapsedTime * 0.7) * 3
            );
            
            // 翅膀振动
            dragonfly.children.forEach((part, index) => {
                if (index > 0) { // 翅膀
                    part.rotation.y = Math.sin(elapsedTime * 30) * 0.2 + part.userData.baseRotation;
                }
            });
        }
        
        // 阳光斑点闪烁
        const sunspots = particles.find(p => p.sunspots)?.particles;
        if (sunspots) {
            sunspots.children.forEach(spot => {
                spot.material.opacity = spot.userData.initialOpacity * (0.7 + Math.sin(elapsedTime * spot.userData.flickerSpeed) * 0.3);
            });
        }
    } 
    else if (currentSeason === 'autumn') {
        // 落叶飘落
        const leaves = particles.find(p => p.season === 'autumn')?.particles;
        if (leaves) {
            const positions = leaves.geometry.attributes.position.array;
            for (let i = 0; i < positions.length; i += 3) {
                positions[i] += Math.sin((elapsedTime + i) * 0.2) * 0.01;
                positions[i + 1] -= 0.015;
                positions[i + 2] += Math.cos((elapsedTime + i) * 0.2) * 0.01;
                
                // 重置到顶部
                if (positions[i + 1] < 0) {
                    positions[i + 1] = Math.random() * 8;
                }
            }
            leaves.geometry.attributes.position.needsUpdate = true;
        }
    } 
    else if (currentSeason === 'winter') {
        // 雪花飘落
        const snow = particles.find(p => p.season === 'winter' && !p.ground)?.particles;
        if (snow) {
            const positions = snow.geometry.attributes.position.array;
            for (let i = 0; i < positions.length; i += 3) {
                positions[i] += Math.sin((elapsedTime + i) * 0.05) * 0.01;
                positions[i + 1] -= 0.02;
                positions[i + 2] += Math.cos((elapsedTime + i) * 0.05) * 0.01;
                
                // 重置到顶部
                if (positions[i + 1] < 0) {
                    positions[i + 1] = Math.random() * 15;
                    positions[i] = (Math.random() - 0.5) * 30;
                    positions[i + 2] = (Math.random() - 0.5) * 30;
                }
            }
            snow.geometry.attributes.position.needsUpdate = true;
        }
    }
} 