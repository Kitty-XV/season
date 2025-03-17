/**
 * 3D对象创建模块
 * 包含创建场景中所有3D对象的函数
 */

// 全局变量
let house;
let terrain;
let trees = [];
let particles = [];
let stars;
let galaxy;
let labels = [];
let woodenPath; // 添加木板路变量

/**
 * 创建地形
 * @param {THREE.Scene} scene - 场景对象
 */
function createTerrain(scene) {
    const geometry = new THREE.CircleGeometry(20, 64);
    const material = new THREE.MeshStandardMaterial({ 
        color: 0x7cbb69,
        roughness: 0.8,
        metalness: 0.2
    });
    
    terrain = new THREE.Mesh(geometry, material);
    terrain.rotation.x = -Math.PI / 2;
    terrain.receiveShadow = true;
    scene.add(terrain);
    
    return terrain;
}

/**
 * 创建小房子
 * @param {THREE.Scene} scene - 场景对象
 */
function createHouse(scene) {
    // 房子组合对象
    const houseGroup = new THREE.Group();
    houseGroup.position.set(-5, 0, -3);
    scene.add(houseGroup);
    
    // 房子主体
    const houseGeometry = new THREE.BoxGeometry(2.5, 2, 2);
    const houseMaterial = new THREE.MeshStandardMaterial({ color: 0xf5f5dc });
    const houseMesh = new THREE.Mesh(houseGeometry, houseMaterial);
    houseMesh.position.y = 1;
    houseMesh.castShadow = true;
    houseMesh.receiveShadow = true;
    houseGroup.add(houseMesh);
    
    // 屋顶
    const roofGeometry = new THREE.ConeGeometry(2, 1.5, 4);
    const roofMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
    const roofMesh = new THREE.Mesh(roofGeometry, roofMaterial);
    roofMesh.position.y = 2.75;
    roofMesh.rotation.y = Math.PI / 4;
    roofMesh.castShadow = true;
    houseGroup.add(roofMesh);
    
    // 雪屋顶 - 只在冬季显示
    const snowRoofGeometry = new THREE.ConeGeometry(2.05, 1.55, 4);
    const snowRoofMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xffffff,
        roughness: 0.7
    });
    const snowRoofMesh = new THREE.Mesh(snowRoofGeometry, snowRoofMaterial);
    snowRoofMesh.position.y = 2.75;
    snowRoofMesh.rotation.y = Math.PI / 4;
    snowRoofMesh.castShadow = true;
    snowRoofMesh.visible = false;
    houseGroup.add(snowRoofMesh);
    
    // 烟囱
    const chimneyGeometry = new THREE.BoxGeometry(0.4, 1, 0.4);
    const chimneyMaterial = new THREE.MeshStandardMaterial({ color: 0x8b0000 });
    const chimneyMesh = new THREE.Mesh(chimneyGeometry, chimneyMaterial);
    chimneyMesh.position.set(0.6, 3, 0.6);
    chimneyMesh.castShadow = true;
    houseGroup.add(chimneyMesh);
    
    // 计算烟囱在世界坐标中的顶部位置
    const chimneyTopWorldPos = new THREE.Vector3();
    chimneyMesh.getWorldPosition(chimneyTopWorldPos);
    chimneyTopWorldPos.y += 0.5; // 烟囱顶部
    
    // 门
    const doorGeometry = new THREE.PlaneGeometry(0.6, 1.2);
    const doorMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x8b4513,
        side: THREE.DoubleSide
    });
    const doorMesh = new THREE.Mesh(doorGeometry, doorMaterial);
    doorMesh.position.set(0, 0.6, 1.01);
    houseGroup.add(doorMesh);
    
    // 存储窗户引用
    const windows = [];
    
    // 正面窗户
    const windowFrontGeometry = new THREE.PlaneGeometry(0.5, 0.5);
    const windowFrontMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xadd8e6,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.7,
        emissive: 0x000000,
        emissiveIntensity: 0
    });
    const windowFrontMesh = new THREE.Mesh(windowFrontGeometry, windowFrontMaterial);
    windowFrontMesh.position.set(-0.7, 1.3, 1.01);
    houseGroup.add(windowFrontMesh);
    windows.push(windowFrontMesh);
    
    // 侧面窗户
    const windowSideGeometry = new THREE.PlaneGeometry(0.5, 0.5);
    const windowSideMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xadd8e6,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.7,
        emissive: 0x000000, 
        emissiveIntensity: 0
    });
    const windowSideMesh = new THREE.Mesh(windowSideGeometry, windowSideMaterial);
    windowSideMesh.position.set(1.26, 1.3, 0);
    windowSideMesh.rotation.y = Math.PI / 2;
    houseGroup.add(windowSideMesh);
    windows.push(windowSideMesh);
    
    // 后面窗户
    const windowBackGeometry = new THREE.PlaneGeometry(0.5, 0.5);
    const windowBackMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xadd8e6,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.7,
        emissive: 0x000000,
        emissiveIntensity: 0
    });
    const windowBackMesh = new THREE.Mesh(windowBackGeometry, windowBackMaterial);
    windowBackMesh.position.set(0, 1.3, -1.01);
    windowBackMesh.rotation.y = Math.PI;
    houseGroup.add(windowBackMesh);
    windows.push(windowBackMesh);
    
    // 创建烟雾粒子
    const smokeParticles = new THREE.BufferGeometry();
    const smokeCount = 100;
    const smokePositions = new Float32Array(smokeCount * 3);
    const smokeSizes = new Float32Array(smokeCount);
    
    for (let i = 0; i < smokeCount; i++) {
        const i3 = i * 3;
        const spread = 0.2;
        // 以烟囱顶部为中心生成烟雾粒子
        smokePositions[i3] = chimneyTopWorldPos.x + (Math.random() - 0.5) * spread;
        smokePositions[i3 + 1] = chimneyTopWorldPos.y + Math.random() * 1.5;
        smokePositions[i3 + 2] = chimneyTopWorldPos.z + (Math.random() - 0.5) * spread;
        
        smokeSizes[i] = Math.random() * 0.5 + 0.1;
    }
    
    smokeParticles.setAttribute('position', new THREE.BufferAttribute(smokePositions, 3));
    smokeParticles.setAttribute('size', new THREE.BufferAttribute(smokeSizes, 1));
    
    const smokeMaterial = new THREE.PointsMaterial({
        color: 0xaaaaaa,
        size: 0.4,
        transparent: true,
        opacity: 0.6,
        sizeAttenuation: true
    });
    
    const smoke = new THREE.Points(smokeParticles, smokeMaterial);
    // 默认隐藏烟雾，只有在冬季才会显示
    smoke.visible = false;
    scene.add(smoke);
    
    return {
        group: houseGroup,
        smoke: smoke,
        position: houseGroup.position,
        snowRoof: snowRoofMesh,
        windows: windows,
        chimneyTopPosition: chimneyTopWorldPos // 保存烟囱顶部位置
    };
}

/**
 * 创建通向小房子的蜿蜒木板路
 * @param {THREE.Scene} scene - 场景对象
 * @returns {THREE.Group} 木板路对象组
 */
function createWoodenPath(scene) {
    // 创建木板路组
    const pathGroup = new THREE.Group();
    
    // 木板的材质
    const woodMaterial = new THREE.MeshStandardMaterial({
        color: 0x8B4513,
        roughness: 0.9,
        metalness: 0.1
    });
    
    // 雪覆盖的木板材质 - 冬季使用
    const snowWoodMaterial = new THREE.MeshStandardMaterial({
        color: 0xE8E8E8,
        roughness: 0.7,
        metalness: 0.1
    });
    
    // 计算小房子门的确切位置
    // 房子位置: (-5, 0, -3)，门的相对位置是(0, 0.6, 1.01)
    const housePosition = new THREE.Vector3(-5, 0, -3);
    const doorWorldPosition = new THREE.Vector3(
        housePosition.x, // x不变
        0.05, // 与木板路高度保持一致
        housePosition.z + 1.01 // 添加门的z偏移
    );
    
    // 重新设计路径点 - 调整为更靠近房子前面的路径
    const pathPoints = [
        doorWorldPosition.clone(),                   // 从门口开始
        new THREE.Vector3(-4.7, 0.05, -0.5),         // 门口前更近的弯曲点
        new THREE.Vector3(-3.5, 0.05, 1),            // 向右前方延伸
        new THREE.Vector3(-2, 0.05, 2),              // 继续向右前方延伸
        new THREE.Vector3(0, 0.05, 2.5),             // 前方区域
        new THREE.Vector3(2, 0.05, 2),               // 缓慢转向
        new THREE.Vector3(4, 0.05, 1),               // 远处区域转向
        new THREE.Vector3(6, 0.05, 1.5),             // 更远处弯曲
        new THREE.Vector3(8, 0.05, 3)                // 地图边缘
    ];
    
    // 创建平滑曲线
    const curve = new THREE.CatmullRomCurve3(pathPoints);
    curve.tension = 0.15; // 降低曲线张力，使其更加平滑自然
    
    // 沿曲线创建木板
    const divisions = 60; // 保持木板数量
    const points = curve.getPoints(divisions);
    
    // 存储所有木板，以便在季节变化时更新
    const boards = [];
    
    for (let i = 0; i < points.length - 1; i++) {
        const currentPoint = points[i];
        const nextPoint = points[i + 1];
        
        // 计算木板方向
        const direction = new THREE.Vector3().subVectors(nextPoint, currentPoint).normalize();
        const angle = Math.atan2(direction.x, direction.z);
        
        // 计算木板宽度 - 在路径不同部分变化宽度
        let boardWidth;
        const distanceFromStart = currentPoint.distanceTo(doorWorldPosition);
        
        if (distanceFromStart < 2) {
            // 门口附近较窄
            boardWidth = 0.4 + distanceFromStart * 0.05;
        } else if (distanceFromStart > 10) {
            // 远离房子时变宽
            boardWidth = 0.65;
        } else {
            // 中间部分渐变宽度
            boardWidth = 0.5 + (distanceFromStart - 2) * 0.02;
        }
        
        // 创建木板
        const boardGeometry = new THREE.BoxGeometry(boardWidth, 0.06, 0.3);
        const boardMesh = new THREE.Mesh(boardGeometry, woodMaterial.clone());
        
        // 设置位置和旋转
        boardMesh.position.set(currentPoint.x, currentPoint.y, currentPoint.z);
        boardMesh.rotation.y = angle;
        boardMesh.receiveShadow = true;
        boardMesh.castShadow = true;
        
        pathGroup.add(boardMesh);
        boards.push(boardMesh);
    }
    
    // 创建路边细节
    const pathDetails = [];
    
    // 创建路边小细节 - 更多样化的装饰
    for (let i = 0; i < 35; i++) { // 增加细节数量
        // 随机选择路径上的点，避开门口附近
        const randomIndex = Math.floor(Math.random() * (points.length * 0.9) + points.length * 0.1);
        const pathPoint = points[randomIndex];
        
        // 随机偏移位置(路径两侧)
        const offsetDir = Math.random() > 0.5 ? 1 : -1;
        const offset = (Math.random() * 0.4 + 0.2) * offsetDir;
        
        // 计算垂直于路径的方向
        const tangent = curve.getTangent(randomIndex / divisions);
        const normalDir = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();
        
        // 创建小细节
        let detailMesh;
        
        if (Math.random() > 0.7) {
            // 石头
            const stoneGeometry = new THREE.SphereGeometry(0.08 + Math.random() * 0.05, 6, 6);
            const stoneMaterial = new THREE.MeshStandardMaterial({
                color: 0x808080,
                roughness: 0.9
            });
            detailMesh = new THREE.Mesh(stoneGeometry, stoneMaterial.clone());
            // 随机压扁石头
            detailMesh.scale.y = 0.6 + Math.random() * 0.4;
        } else if (Math.random() > 0.5) {
            // 花朵
            const flowerGeometry = new THREE.CylinderGeometry(0.05, 0.03, 0.15, 8);
            const flowerColors = [0xFFB6C1, 0xFFFF00, 0xFF6347, 0x9370DB, 0x87CEEB];
            const randomColor = flowerColors[Math.floor(Math.random() * flowerColors.length)];
            const flowerMaterial = new THREE.MeshStandardMaterial({
                color: randomColor,
                roughness: 0.8
            });
            detailMesh = new THREE.Mesh(flowerGeometry, flowerMaterial.clone());
            // 添加花头
            const flowerHead = new THREE.Mesh(
                new THREE.SphereGeometry(0.06, 8, 8),
                new THREE.MeshStandardMaterial({
                    color: randomColor,
                    roughness: 0.7
                })
            );
            flowerHead.position.y = 0.1;
            detailMesh.add(flowerHead);
        } else {
            // 草丛
            const grassGeometry = new THREE.ConeGeometry(0.06, 0.15, 4);
            const grassMaterial = new THREE.MeshStandardMaterial({
                color: 0x4CA64C,
                roughness: 0.9
            });
            detailMesh = new THREE.Mesh(grassGeometry, grassMaterial.clone());
            // 随机旋转草丛
            detailMesh.rotation.y = Math.random() * Math.PI;
            
            // 添加更多草叶形成丛
            for (let j = 0; j < 3; j++) {
                const extraGrass = new THREE.Mesh(
                    new THREE.ConeGeometry(0.04, 0.1 + Math.random() * 0.1, 3),
                    grassMaterial.clone()
                );
                extraGrass.position.set(
                    (Math.random() - 0.5) * 0.08,
                    Math.random() * 0.05,
                    (Math.random() - 0.5) * 0.08
                );
                extraGrass.rotation.y = Math.random() * Math.PI;
                extraGrass.rotation.z = (Math.random() - 0.5) * 0.2;
                detailMesh.add(extraGrass);
            }
        }
        
        // 设置位置
        detailMesh.position.set(
            pathPoint.x + normalDir.x * offset,
            pathPoint.y,
            pathPoint.z + normalDir.z * offset
        );
        
        detailMesh.castShadow = true;
        detailMesh.receiveShadow = true;
        pathGroup.add(detailMesh);
        pathDetails.push(detailMesh);
    }
    
    // 为木板路添加扶手
    const railings = addRailingsToPath(points, curve, pathGroup);
    
    scene.add(pathGroup);
    woodenPath = {
        group: pathGroup,
        boards: boards,
        details: pathDetails,
        railings: railings,
        materials: {
            normal: woodMaterial,
            snow: snowWoodMaterial
        }
    };
    
    return woodenPath;
}

/**
 * 为木板路添加扶手
 * @param {Array} points - 路径上的点
 * @param {THREE.CurveBase} curve - 路径曲线
 * @param {THREE.Group} parentGroup - 父组
 * @returns {Array} 扶手模型数组
 */
function addRailingsToPath(points, curve, parentGroup) {
    const railings = [];
    const railMaterial = new THREE.MeshStandardMaterial({
        color: 0x8B4513,
        roughness: 0.75,
        metalness: 0.2
    });
    
    // 每隔几个点添加一个扶手
    for (let i = 1; i < points.length - 2; i += 5) {
        const pathPoint = points[i];
        
        // 计算垂直于路径的方向
        const tangent = curve.getTangent(i / (points.length - 1));
        const normalDir = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();
        
        // 计算到起点(门口)的距离比例
        const distanceRatio = i / (points.length - 1);
        
        // 左侧扶手 - 从路径30%处开始添加，到达90%处停止
        if (distanceRatio > 0.3 && distanceRatio < 0.9) {
            const leftPostGeometry = new THREE.CylinderGeometry(0.03, 0.03, 0.6, 6);
            const leftPost = new THREE.Mesh(leftPostGeometry, railMaterial.clone());
            leftPost.position.set(
                pathPoint.x + normalDir.x * 0.35,
                pathPoint.y + 0.3,
                pathPoint.z + normalDir.z * 0.35
            );
            parentGroup.add(leftPost);
            railings.push(leftPost);
        }
        
        // 右侧扶手 - 从路径25%处开始添加，到达85%处停止
        if (distanceRatio > 0.25 && distanceRatio < 0.85) {
            const rightPostGeometry = new THREE.CylinderGeometry(0.03, 0.03, 0.6, 6);
            const rightPost = new THREE.Mesh(rightPostGeometry, railMaterial.clone());
            rightPost.position.set(
                pathPoint.x - normalDir.x * 0.35,
                pathPoint.y + 0.3,
                pathPoint.z - normalDir.z * 0.35
            );
            parentGroup.add(rightPost);
            railings.push(rightPost);
        }
    }
    
    return railings;
}

/**
 * 创建春季元素
 * @param {THREE.Scene} scene - 场景对象
 */
function createSpringElements(scene) {
    // 添加樱花树
    const treeGeometry = new THREE.CylinderGeometry(0.2, 0.4, 4, 12);
    const treeMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 }); 
    
    // 主树
    const tree = new THREE.Mesh(treeGeometry, treeMaterial);
    tree.position.set(0, 2, 0);
    tree.castShadow = true;
    tree.receiveShadow = true;
    scene.add(tree);
    
    // 樱花树冠
    const blossomGeometry = new THREE.SphereGeometry(2.5, 20, 20);
    const blossomMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xffc6d9,
        roughness: 0.8
    });
    
    const blossom = new THREE.Mesh(blossomGeometry, blossomMaterial);
    blossom.position.set(0, 5, 0);
    blossom.castShadow = true;
    scene.add(blossom);
    
    trees.push({ tree, crown: blossom, season: 'spring' });
    
    // 添加花瓣粒子系统
    const particleCount = 500;
    const particleGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleSizes = new Float32Array(particleCount);
    
    for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        particlePositions[i3] = (Math.random() - 0.5) * 20;
        particlePositions[i3 + 1] = Math.random() * 8;
        particlePositions[i3 + 2] = (Math.random() - 0.5) * 20;
        particleSizes[i] = Math.random() * 0.2 + 0.1;
    }
    
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    particleGeometry.setAttribute('size', new THREE.BufferAttribute(particleSizes, 1));
    
    const particleMaterial = new THREE.PointsMaterial({
        color: 0xffc6d9,
        size: 0.1,
        transparent: true,
        opacity: 0.8,
        sizeAttenuation: true
    });
    
    const petals = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(petals);
    
    particles.push({ particles: petals, season: 'spring' });
    
    // 添加蝴蝶
    const butterflyGroup = new THREE.Group();
    butterflyGroup.position.set(3, 4, 2);
    
    const wingGeometry = new THREE.CircleGeometry(0.5, 8, 0, Math.PI);
    const wingMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xffaacc, 
        side: THREE.DoubleSide 
    });
    
    const leftWing = new THREE.Mesh(wingGeometry, wingMaterial);
    leftWing.position.set(-0.25, 0, 0);
    leftWing.rotation.z = Math.PI / 2;
    butterflyGroup.add(leftWing);
    
    const rightWing = new THREE.Mesh(wingGeometry, wingMaterial);
    rightWing.position.set(0.25, 0, 0);
    rightWing.rotation.z = -Math.PI / 2;
    butterflyGroup.add(rightWing);
    
    scene.add(butterflyGroup);
    particles.push({ particles: butterflyGroup, season: 'spring', butterfly: true });
}

/**
 * 创建夏季元素
 * @param {THREE.Scene} scene - 场景对象
 */
function createSummerElements(scene) {
    // 添加茂盛的绿树
    const trunkGeometry = new THREE.CylinderGeometry(0.3, 0.5, 5, 12);
    const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
    
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.position.set(0, 2.5, 0);
    trunk.castShadow = true;
    trunk.receiveShadow = true;
    scene.add(trunk);
    
    // 树冠
    const leavesGeometry = new THREE.SphereGeometry(3, 20, 20);
    const leavesMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x2e8b57,
        roughness: 0.8
    });
    
    const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
    leaves.position.set(0, 6, 0);
    leaves.castShadow = true;
    scene.add(leaves);
    
    trees.push({ tree: trunk, crown: leaves, season: 'summer' });
    
    // 添加蜻蜓
    const dragonflyGroup = new THREE.Group();
    dragonflyGroup.position.set(-3, 3, -2);
    
    const bodyGeometry = new THREE.CylinderGeometry(0.05, 0.02, 1, 8);
    const bodyMaterial = new THREE.MeshBasicMaterial({ color: 0x6495ED });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.rotation.x = Math.PI / 2;
    dragonflyGroup.add(body);
    
    const wingGeometry = new THREE.PlaneGeometry(0.6, 0.2);
    const wingMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xffffff, 
        transparent: true,
        opacity: 0.5,
        side: THREE.DoubleSide
    });
    
    const leftWing1 = new THREE.Mesh(wingGeometry, wingMaterial);
    leftWing1.position.set(-0.3, 0, -0.2);
    leftWing1.rotation.y = Math.PI / 4;
    leftWing1.userData = { baseRotation: Math.PI / 4 };
    dragonflyGroup.add(leftWing1);
    
    const leftWing2 = new THREE.Mesh(wingGeometry, wingMaterial);
    leftWing2.position.set(-0.3, 0, 0.2);
    leftWing2.rotation.y = Math.PI / 4;
    leftWing2.userData = { baseRotation: Math.PI / 4 };
    dragonflyGroup.add(leftWing2);
    
    const rightWing1 = new THREE.Mesh(wingGeometry, wingMaterial);
    rightWing1.position.set(0.3, 0, -0.2);
    rightWing1.rotation.y = -Math.PI / 4;
    rightWing1.userData = { baseRotation: -Math.PI / 4 };
    dragonflyGroup.add(rightWing1);
    
    const rightWing2 = new THREE.Mesh(wingGeometry, wingMaterial);
    rightWing2.position.set(0.3, 0, 0.2);
    rightWing2.rotation.y = -Math.PI / 4;
    rightWing2.userData = { baseRotation: -Math.PI / 4 };
    dragonflyGroup.add(rightWing2);
    
    scene.add(dragonflyGroup);
    particles.push({ particles: dragonflyGroup, season: 'summer', dragonfly: true });
    
    // 模拟阳光光斑
    const sunSpots = new THREE.Group();
    for (let i = 0; i < 30; i++) {
        const spotGeometry = new THREE.PlaneGeometry(Math.random() * 0.5 + 0.2, Math.random() * 0.5 + 0.2);
        const spotMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffcc,
            transparent: true,
            opacity: Math.random() * 0.4 + 0.1,
            side: THREE.DoubleSide
        });
        const spot = new THREE.Mesh(spotGeometry, spotMaterial);
        spot.position.set(
            (Math.random() - 0.5) * 10,
            Math.random() * 0.1 + 0.05,
            (Math.random() - 0.5) * 10
        );
        spot.rotation.x = -Math.PI / 2;
        spot.userData = {
            initialOpacity: spotMaterial.opacity,
            flickerSpeed: Math.random() * 2 + 1
        };
        sunSpots.add(spot);
    }
    scene.add(sunSpots);
    particles.push({ particles: sunSpots, season: 'summer', sunspots: true });
}

/**
 * 创建秋季元素
 * @param {THREE.Scene} scene - 场景对象
 */
function createAutumnElements(scene) {
    // 添加枫树
    const trunkGeometry = new THREE.CylinderGeometry(0.25, 0.4, 4.5, 12);
    const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
    
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.position.set(0, 2.25, 0);
    trunk.castShadow = true;
    trunk.receiveShadow = true;
    scene.add(trunk);
    
    // 树冠
    const leavesGeometry = new THREE.SphereGeometry(2.5, 20, 20);
    const leavesMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xd2691e,
        roughness: 0.8
    });
    
    const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
    leaves.position.set(0, 5.5, 0);
    leaves.castShadow = true;
    scene.add(leaves);
    
    trees.push({ tree: trunk, crown: leaves, season: 'autumn' });
    
    // 添加飘落的树叶
    const leafCount = 300;
    const leafGeometry = new THREE.BufferGeometry();
    const leafPositions = new Float32Array(leafCount * 3);
    const leafSizes = new Float32Array(leafCount);
    const leafColors = new Float32Array(leafCount * 3);
    
    const colorOptions = [
        new THREE.Color(0xd2691e), // 棕色
        new THREE.Color(0xff8c00), // 深橙色
        new THREE.Color(0xcd853f), // 秘鲁色
        new THREE.Color(0xb8860b)  // 暗金色
    ];
    
    for (let i = 0; i < leafCount; i++) {
        const i3 = i * 3;
        leafPositions[i3] = (Math.random() - 0.5) * 20;
        leafPositions[i3 + 1] = Math.random() * 8;
        leafPositions[i3 + 2] = (Math.random() - 0.5) * 20;
        leafSizes[i] = Math.random() * 0.3 + 0.15;
        
        const colorIndex = Math.floor(Math.random() * colorOptions.length);
        const color = colorOptions[colorIndex];
        leafColors[i3] = color.r;
        leafColors[i3 + 1] = color.g;
        leafColors[i3 + 2] = color.b;
    }
    
    leafGeometry.setAttribute('position', new THREE.BufferAttribute(leafPositions, 3));
    leafGeometry.setAttribute('size', new THREE.BufferAttribute(leafSizes, 1));
    leafGeometry.setAttribute('color', new THREE.BufferAttribute(leafColors, 3));
    
    const leafMaterial = new THREE.PointsMaterial({
        size: 0.2,
        vertexColors: true,
        transparent: true,
        opacity: 0.9,
        sizeAttenuation: true
    });
    
    const leaves3D = new THREE.Points(leafGeometry, leafMaterial);
    scene.add(leaves3D);
    
    particles.push({ particles: leaves3D, season: 'autumn' });
}

/**
 * 创建冬季元素
 * @param {THREE.Scene} scene - 场景对象
 */
function createWinterElements(scene) {
    // 添加冬季树
    const trunkGeometry = new THREE.CylinderGeometry(0.2, 0.35, 4, 12);
    const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x5c5c5c });
    
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.position.set(0, 2, 0);
    trunk.castShadow = true;
    trunk.receiveShadow = true;
    scene.add(trunk);
    
    // 枯树的枝干
    const branchesGroup = new THREE.Group();
    
    // 枯树的树枝
    const branchMaterial = new THREE.MeshStandardMaterial({ color: 0x5c5c5c });
    
    function createBranch(length, thickness, angle, startX, startY, startZ) {
        const branchGeometry = new THREE.CylinderGeometry(thickness * 0.7, thickness, length, 8);
        const branch = new THREE.Mesh(branchGeometry, branchMaterial);
        branch.position.set(startX, startY, startZ);
        branch.rotation.z = angle;
        branch.translateY(length / 2);
        branch.castShadow = true;
        return branch;
    }
    
    const mainBranch1 = createBranch(2, 0.1, Math.PI / 4, 0, 3.5, 0);
    branchesGroup.add(mainBranch1);
    
    const mainBranch2 = createBranch(1.8, 0.1, -Math.PI / 3, 0, 3, 0);
    branchesGroup.add(mainBranch2);
    
    const mainBranch3 = createBranch(1.5, 0.08, Math.PI / 2.5, 0, 2.5, 0);
    branchesGroup.add(mainBranch3);
    
    const mainBranch4 = createBranch(1.3, 0.08, -Math.PI / 2.8, 0, 3.2, 0);
    branchesGroup.add(mainBranch4);
    
    // 添加小枝条
    for (let i = 0; i < 15; i++) {
        const baseY = 2 + Math.random() * 2;
        const angle = (Math.random() - 0.5) * Math.PI;
        const branch = createBranch(
            0.5 + Math.random() * 0.8, 
            0.02 + Math.random() * 0.03, 
            angle, 
            (Math.random() - 0.5) * 0.5, 
            baseY, 
            (Math.random() - 0.5) * 0.5
        );
        branchesGroup.add(branch);
    }
    
    scene.add(branchesGroup);
    trees.push({ tree: trunk, crown: branchesGroup, season: 'winter' });
    
    // 添加雪花
    const snowCount = 1000;
    const snowGeometry = new THREE.BufferGeometry();
    const snowPositions = new Float32Array(snowCount * 3);
    const snowSizes = new Float32Array(snowCount);
    
    for (let i = 0; i < snowCount; i++) {
        const i3 = i * 3;
        snowPositions[i3] = (Math.random() - 0.5) * 30;
        snowPositions[i3 + 1] = Math.random() * 15;
        snowPositions[i3 + 2] = (Math.random() - 0.5) * 30;
        snowSizes[i] = Math.random() * 0.2 + 0.1;
    }
    
    snowGeometry.setAttribute('position', new THREE.BufferAttribute(snowPositions, 3));
    snowGeometry.setAttribute('size', new THREE.BufferAttribute(snowSizes, 1));
    
    const snowMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.1,
        transparent: true,
        opacity: 0.8,
        sizeAttenuation: true
    });
    
    const snow = new THREE.Points(snowGeometry, snowMaterial);
    scene.add(snow);
    
    particles.push({ particles: snow, season: 'winter' });
    
    // 地面上的雪
    const snowCoverGeometry = new THREE.CircleGeometry(20, 64);
    const snowCoverMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xf0f8ff,
        roughness: 0.8,
        metalness: 0.1
    });
    
    const snowCover = new THREE.Mesh(snowCoverGeometry, snowCoverMaterial);
    snowCover.rotation.x = -Math.PI / 2;
    snowCover.position.y = 0.05;
    snowCover.receiveShadow = true;
    scene.add(snowCover);
    
    snowCover.visible = false;
    particles.push({ particles: snowCover, season: 'winter', ground: true });
}

/**
 * 创建星空背景
 * @param {THREE.Scene} scene - 场景对象
 * @param {string} currentSeason - 当前季节
 * @param {boolean} isNightMode - 是否为夜晚模式
 */
function createStars(scene, currentSeason, isNightMode) {
    // 如果已经有星星，则先移除
    if (stars) {
        scene.remove(stars);
    }
    
    // 创建星星几何体
    const starsGeometry = new THREE.BufferGeometry();
    const starsCount = 2000;
    
    // 位置、大小和颜色数组
    const positions = new Float32Array(starsCount * 3);
    const sizes = new Float32Array(starsCount);
    const colors = new Float32Array(starsCount * 3);
    const speeds = new Float32Array(starsCount);
    
    // 根据季节调整星星数量
    let extraStars = 0;
    if (currentSeason === 'winter') {
        extraStars = 1000; // 冬季多1000颗星星
    } else if (currentSeason === 'summer') {
        extraStars = 12800;  // 夏季多12800颗星星
    }
    const totalStars = starsCount + extraStars;
    
    // 设置星星属性
    for (let i = 0; i < totalStars; i++) {
        const i3 = i * 3;
        // 在天空穹顶上随机分布星星
        const radius = 200; // 星空半径
        const theta = 2 * Math.PI * Math.random();
        const phi = Math.acos(2 * Math.random() - 1);
        
        // 将球坐标转换为笛卡尔坐标
        positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
        positions[i3 + 1] = Math.abs(radius * Math.cos(phi)); // 确保星星在上半球
        positions[i3 + 2] = radius * Math.sin(phi) * Math.sin(theta);
        
        // 根据季节调整星星大小
        if (currentSeason === 'winter') {
            // 冬季星星更大
            sizes[i] = Math.random() * 2 + 0.5;
        } else if (currentSeason === 'summer') { 
            // 夏季星星也较大，但略小于冬季
            sizes[i] = Math.random() * 3.8 + 0.6;
        } else {
            // 其他季节正常大小
            sizes[i] = Math.random() + 0.5;
        }
        
        // 星星颜色 - 根据季节调整颜色分布
        if (currentSeason === 'summer') {
            // 夏季星空中增加明亮的星星比例
            if (Math.random() > 0.7) {
                // 更亮的蓝白色星星 - 夏季特有
                colors[i3] = 0.85 + Math.random() * 0.15;
                colors[i3 + 1] = 0.85 + Math.random() * 0.15;
                colors[i3 + 2] = 1.0;
            } else if (Math.random() > 0.5) {
                // 明亮的金黄色星星 - 夏季特有
                colors[i3] = 1.0;
                colors[i3 + 1] = 0.9 + Math.random() * 0.1;
                colors[i3 + 2] = 0.5 + Math.random() * 0.3;
            } else if (Math.random() > 0.3) {
                // 明亮的白色星星
                colors[i3] = 0.95 + Math.random() * 0.05;
                colors[i3 + 1] = 0.95 + Math.random() * 0.05;
                colors[i3 + 2] = 0.95 + Math.random() * 0.05;
            } else {
                // 淡紫色星星 - 夏季独有
                colors[i3] = 0.8 + Math.random() * 0.2;
                colors[i3 + 1] = 0.7 + Math.random() * 0.2;
                colors[i3 + 2] = 0.9 + Math.random() * 0.1;
            }
        } else {
            // 其他季节常规颜色
            if (Math.random() > 0.8) {
                // 蓝白色星星
                colors[i3] = 0.8 + Math.random() * 0.2;
                colors[i3 + 1] = 0.8 + Math.random() * 0.2;
                colors[i3 + 2] = 1.0;
            } else if (Math.random() > 0.6) {
                // 黄白色星星
                colors[i3] = 1.0;
                colors[i3 + 1] = 0.9 + Math.random() * 0.1;
                colors[i3 + 2] = 0.6 + Math.random() * 0.3;
            } else {
                // 纯白色星星
                colors[i3] = 0.9 + Math.random() * 0.1;
                colors[i3 + 1] = 0.9 + Math.random() * 0.1;
                colors[i3 + 2] = 0.9 + Math.random() * 0.1;
            }
        }
        
        // 闪烁速度 - 夏季星星闪烁频率更快
        if (currentSeason === 'summer') {
            speeds[i] = 0.5 + Math.random() * 1.2; // 夏季闪烁更活跃
        } else {
            speeds[i] = 0.3 + Math.random() * 1.0; // 其他季节正常闪烁
        }
    }
    
    // 设置几何体属性
    starsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    starsGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    starsGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    starsGeometry.setAttribute('speed', new THREE.BufferAttribute(speeds, 1));
    
    // 创建着色器材质 - 为夏季增强闪烁效果
    const twinkleAmplitude = currentSeason === 'summer' ? 0.5 : 0.4; // 夏季闪烁幅度更大
    const starsMaterial = new THREE.ShaderMaterial({
        uniforms: {
            time: { value: 0 }
        },
        vertexShader: `
            attribute float size;
            attribute vec3 color;
            attribute float speed;
            uniform float time;
            varying vec3 vColor;
            
            void main() {
                vColor = color;
                vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                
                // 使用时间和速度计算闪烁效果
                float twinkle = 0.6 + ${twinkleAmplitude} * sin(time * speed);
                
                gl_PointSize = size * twinkle;
                gl_Position = projectionMatrix * mvPosition;
            }
        `,
        fragmentShader: `
            varying vec3 vColor;
            
            void main() {
                float distance = length(gl_PointCoord - vec2(0.5, 0.5));
                if (distance > 0.5) discard; // 创建圆形点
                
                gl_FragColor = vec4(vColor, 1.0) * (1.0 - distance * 1.2); // 渐变效果
            }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending
    });
    
    // 创建星星系统
    stars = new THREE.Points(starsGeometry, starsMaterial);
    stars.visible = isNightMode; // 初始默认不可见，仅在夜间模式显示
    scene.add(stars);
    
    return stars;
}

/**
 * 创建银河
 * @param {THREE.Scene} scene - 场景对象
 * @returns {THREE.Points} 银河粒子系统
 */
function createGalaxy(scene) {
    // 创建银河粒子系统
    const galaxyParams = {
        count: 100000,      // 增加粒子数量
        size: 0.05,         // 增加粒子大小
        radius: 150,        // 增加银河半径
        branches: 5,
        spin: 1.2,
        randomness: 0.3,
        randomnessPower: 3,
        insideColor: 0x6495ED,    // 淡蓝色
        outsideColor: 0xff1493    // 更鲜艳的紫红色
    };
    
    // 创建几何体
    const galaxyGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(galaxyParams.count * 3);
    const colors = new Float32Array(galaxyParams.count * 3);
    
    // 定义颜色
    const colorInside = new THREE.Color(galaxyParams.insideColor);
    const colorOutside = new THREE.Color(galaxyParams.outsideColor);
    
    // 创建粒子
    for (let i = 0; i < galaxyParams.count; i++) {
        const i3 = i * 3;
        
        // 位置
        const radius = Math.random() * galaxyParams.radius;
        const spinAngle = radius * galaxyParams.spin;
        const branchAngle = (i % galaxyParams.branches) / galaxyParams.branches * Math.PI * 2;
        
        const randomX = Math.pow(Math.random(), galaxyParams.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * galaxyParams.randomness * radius;
        const randomY = Math.pow(Math.random(), galaxyParams.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * galaxyParams.randomness * radius;
        const randomZ = Math.pow(Math.random(), galaxyParams.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * galaxyParams.randomness * radius;
        
        positions[i3] = Math.cos(branchAngle + spinAngle) * radius + randomX;
        positions[i3 + 1] = randomY + 70; // 增加高度，使银河更明显
        positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ;
        
        // 颜色
        const mixedColor = colorInside.clone();
        mixedColor.lerp(colorOutside, radius / galaxyParams.radius);
        
        colors[i3] = mixedColor.r;
        colors[i3 + 1] = mixedColor.g;
        colors[i3 + 2] = mixedColor.b;
    }
    
    galaxyGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    galaxyGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    // 创建材质
    const galaxyMaterial = new THREE.PointsMaterial({
        size: galaxyParams.size,
        sizeAttenuation: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexColors: true,
        transparent: true,
        opacity: 1.0    // 增加不透明度
    });
    
    // 创建粒子系统
    const galaxy = new THREE.Points(galaxyGeometry, galaxyMaterial);
    
    // 重新定位银河到房子后方
    galaxy.rotation.x = Math.PI * 0.35; // 调整倾斜角度
    galaxy.rotation.y = Math.PI * 0.1; // 添加水平方向的轻微倾斜
    galaxy.position.set(-10, 0, -15); // 将位置调整到房子后方
    
    galaxy.visible = false; // 初始隐藏
    scene.add(galaxy);
    
    return galaxy;
}

/**
 * 创建标签系统
 * @param {THREE.Scene} scene - 场景对象
 */
function createLabels(scene) {
    // 春季标签
    createLabel('樱花树 - 生命活力的象征', 0, 7, 0, 'spring');
    createLabel('飘落的花瓣 - 生生不息', -4, 3, 4, 'spring');
    
    // 夏季标签
    createLabel('茂盛的绿树 - 生命的盛放', 0, 7, 0, 'summer');
    createLabel('蜻蜓 - 夏日的精灵', -3, 3.5, -2, 'summer');
    
    // 秋季标签
    createLabel('金色枫树 - 岁月的收获', 0, 7, 0, 'autumn');
    createLabel('飘落的落叶 - 季节的转换', 3, 4, 3, 'autumn');
    
    // 冬季标签
    createLabel('枯树 - 生命的休眠', 0, 7, 0, 'winter');
    createLabel('雪花 - 寒冬的礼物', -3, 5, 3, 'winter');
    
    // 小房子标签 - 在所有季节都显示
    createLabel('温馨小屋 - 四季守望者', -5, 3.5, -3, 'spring');
    createLabel('温馨小屋 - 避暑胜地', -5, 3.5, -3, 'summer');
    createLabel('温馨小屋 - 秋日归途', -5, 3.5, -3, 'autumn');
    createLabel('温馨小屋 - 冬日温暖', -5, 3.5, -3, 'winter');
    
    // 木板路标签 - 在所有季节都显示
    createLabel('蜿蜒木板路 - 通向温馨小屋', 0, 1.5, 2.5, 'spring');
    createLabel('蜿蜒木板路 - 通向温馨小屋', 0, 1.5, 2.5, 'summer');
    createLabel('蜿蜒木板路 - 通向温馨小屋', 0, 1.5, 2.5, 'autumn');
    createLabel('蜿蜒木板路 - 通向温馨小屋', 0, 1.5, 2.5, 'winter');
}

/**
 * 创建3D场景中的标签
 * @param {string} text - 标签文本
 * @param {number} x - X坐标位置
 * @param {number} y - Y坐标位置
 * @param {number} z - Z坐标位置
 * @param {string} season - 所属季节
 */
function createLabel(text, x, y, z, season) {
    const label = document.createElement('div');
    label.className = 'label';
    label.textContent = text;
    label.style.opacity = 0;
    document.body.appendChild(label);
    
    labels.push({
        element: label,
        position: new THREE.Vector3(x, y, z),
        season: season
    });
} 