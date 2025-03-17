/**
 * 季节控制模块
 * 处理季节切换和日夜模式转换的逻辑
 */

// 季节相关变量
let currentSeason = 'spring';
let isNightMode = false;

// 季节颜色配置
const seasonColors = {
    spring: 0xf8c3cd,
    summer: 0x1eb980,
    autumn: 0xe08e45,
    winter: 0xd4f1f9
};

/**
 * 切换季节
 * @param {string} season - 目标季节
 * @param {THREE.Scene} scene - 场景对象
 * @param {object} lights - 场景中的光源
 */
function changeSeason(season, scene, lights) {
    // 设置按钮状态
    const seasonButtons = {
        spring: document.getElementById('spring-btn'),
        summer: document.getElementById('summer-btn'),
        autumn: document.getElementById('autumn-btn'),
        winter: document.getElementById('winter-btn')
    };
    
    Object.keys(seasonButtons).forEach(key => {
        seasonButtons[key].classList.remove('active');
    });
    seasonButtons[season].classList.add('active');
    
    // 更新季节名称
    const seasonTitle = document.querySelector('.season-name');
    seasonTitle.className = `season-name ${season}`;
    seasonTitle.textContent = getSeasonsChineseCharacter(season);
    
    // 季节对应的背景色
    let targetBgColor;
    switch(season) {
        case 'spring':
            targetBgColor = isNightMode ? new THREE.Color(0x0c1445) : new THREE.Color(0x87ceeb);
            break;
        case 'summer':
            targetBgColor = isNightMode ? new THREE.Color(0x000020) : new THREE.Color(0x87ceeb);
            break;
        case 'autumn':
            targetBgColor = isNightMode ? new THREE.Color(0x12203c) : new THREE.Color(0xe9967a);
            break;
        case 'winter':
            targetBgColor = isNightMode ? new THREE.Color(0x051938) : new THREE.Color(0xe0ffff);
            break;
    }
    
    // 平滑过渡背景色
    gsap.to(scene.background, {
        r: targetBgColor.r,
        g: targetBgColor.g,
        b: targetBgColor.b,
        duration: 1.5
    });
    
    // 更新地面颜色
    let targetGroundColor;
    switch(season) {
        case 'spring':
            targetGroundColor = 0x7cbb69; // 浅绿色
            break;
        case 'summer':
            targetGroundColor = 0x2e8b57; // 深绿色
            break;
        case 'autumn':
            targetGroundColor = 0xcd853f; // 秋色棕色
            break;
        case 'winter':
            targetGroundColor = 0xd3d3d3; // 浅灰色
            break;
    }
    
    gsap.to(terrain.material.color, {
        r: new THREE.Color(targetGroundColor).r,
        g: new THREE.Color(targetGroundColor).g,
        b: new THREE.Color(targetGroundColor).b,
        duration: 1.5
    });
    
    // 显示当前季节的元素，隐藏其他季节元素
    trees.forEach(treeObj => {
        const visible = treeObj.season === season;
        if (treeObj.tree) treeObj.tree.visible = visible;
        if (treeObj.crown) treeObj.crown.visible = visible;
    });
    
    particles.forEach(particleObj => {
        // 特殊处理雪地
        if (particleObj.ground) {
            particleObj.particles.visible = season === 'winter';
            return;
        }
        particleObj.particles.visible = particleObj.season === season;
    });
    
    // 调整光源
    lights.forEach(lightObj => {
        // 设置所有季节的光源强度为0
        lightObj.light.intensity = 0;
        
        // 如果是当前季节，则根据日夜模式设置合适的强度
        if (lightObj.season === season) {
            // 在夜间模式下，光照强度降低
            lightObj.light.intensity = isNightMode ? 0.3 : 1.0;
        }
    });
    
    // 调整环境光亮度
    const ambientLight = scene.children.find(child => child instanceof THREE.AmbientLight);
    if (ambientLight) {
        ambientLight.intensity = isNightMode ? 0.2 : 0.4;
    }
    
    // 根据季节更新房子状态
    if (house) {
        // 冬季显示屋顶积雪
        house.snowRoof.visible = season === 'winter';
        
        // 烟雾只在冬季显示，其他季节隐藏
        if (season === 'winter') {
            house.smoke.visible = true;
            house.smoke.material.opacity = 0.8;
            house.smoke.material.size = 0.6;
        } else {
            house.smoke.visible = false;
            house.smoke.material.opacity = 0; // 完全透明
        }
        
        // 更新窗户发光效果
        if (house.windows) {
            house.windows.forEach(window => {
                if (window.material) {
                    window.material.emissive.set(isNightMode ? 0xffd700 : 0x000000);
                    window.material.emissiveIntensity = isNightMode ? 0.8 : 0;
                }
            });
        }
    }
    
    // 更新木板路外观
    if (woodenPath) {
        // 冬季时木板路覆盖雪
        if (season === 'winter') {
            // 给木板添加雪覆盖材质
            woodenPath.boards.forEach(board => {
                board.material = woodenPath.materials.snow.clone();
            });
            
            // 为扶手添加雪覆盖效果
            if (woodenPath.railings) {
                woodenPath.railings.forEach(rail => {
                    // 为扶手添加雪覆盖 - 改变颜色并增加厚度
                    rail.material.color.set(0xE8E8E8);
                    rail.material.roughness = 0.7;
                    // 略微增加扶手顶部厚度模拟积雪
                    rail.scale.set(1.05, 1, 1.05);
                });
            }
            
            // 隐藏路边的花朵和部分石头
            woodenPath.details.forEach(detail => {
                // 石头仍然可见，但有积雪效果
                if (detail.geometry instanceof THREE.SphereGeometry) {
                    detail.material.color.set(0xE8E8E8);
                    detail.material.roughness = 0.7;
                    detail.visible = true;
                } else {
                    // 花朵在冬季不可见
                    detail.visible = false;
                }
            });
        } else {
            // 其他季节恢复木板原本的材质
            woodenPath.boards.forEach(board => {
                board.material = woodenPath.materials.normal.clone();
            });
            
            // 恢复扶手原本样式
            if (woodenPath.railings) {
                woodenPath.railings.forEach(rail => {
                    rail.material.color.set(0x8B4513);
                    rail.material.roughness = 0.75;
                    rail.scale.set(1, 1, 1);
                });
            }
            
            // 显示路边的装饰物，根据季节调整颜色
            woodenPath.details.forEach(detail => {
                detail.visible = true;
                
                // 石头恢复原色
                if (detail.geometry instanceof THREE.SphereGeometry) {
                    detail.material.color.set(0x808080);
                    detail.material.roughness = 0.9;
                } 
                // 花朵根据季节变化颜色
                else if (detail.geometry instanceof THREE.CylinderGeometry) {
                    switch(season) {
                        case 'spring':
                            // 春季粉色和黄色花朵
                            detail.material.color.set(Math.random() > 0.5 ? 0xFFB6C1 : 0xFFFF00);
                            break;
                        case 'summer':
                            // 夏季各种鲜艳的花朵
                            const summerColors = [0xFF0000, 0xFFFF00, 0xFF00FF, 0x00FF00, 0x0000FF];
                            detail.material.color.set(summerColors[Math.floor(Math.random() * summerColors.length)]);
                            break;
                        case 'autumn':
                            // 秋季橙色和棕色
                            detail.material.color.set(Math.random() > 0.5 ? 0xFFA500 : 0x8B4513);
                            break;
                    }
                }
                // 草丛也要根据季节调整颜色
                else if (detail.geometry instanceof THREE.ConeGeometry) {
                    switch(season) {
                        case 'spring':
                            // 春季嫩绿色草丛
                            detail.material.color.set(0x7CCD7C);
                            break;
                        case 'summer':
                            // 夏季深绿色草丛
                            detail.material.color.set(0x4CA64C);
                            break;
                        case 'autumn':
                            // 秋季黄褐色草丛
                            detail.material.color.set(0xD2B48C);
                            break;
                    }
                }
            });
        }
    }
    
    // 更新星星
    if (stars) {
        scene.remove(stars);
        createStars(scene, season, isNightMode);
        stars.visible = isNightMode;
    }
    
    // 更新银河系 - 仅在夏季夜晚显示
    if (galaxy) {
        galaxy.visible = (season === 'summer' && isNightMode);
    }
    
    // 更新日夜切换按钮图标
    const dayNightBtn = document.getElementById('day-night-btn');
    dayNightBtn.innerHTML = isNightMode ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';
    
    // 更新标签显示
    updateLabelsVisibility(season);
    
    // 保存当前季节
    currentSeason = season;
}

/**
 * 切换日夜模式
 * @param {THREE.Scene} scene - 场景对象
 * @param {Array} lights - 所有光源数组
 */
function toggleDayNight(scene, lights) {
    isNightMode = !isNightMode;
    
    // 更新日夜切换按钮图标
    const dayNightBtn = document.getElementById('day-night-btn');
    dayNightBtn.innerHTML = isNightMode ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';
    
    // 获取当前季节的天空颜色
    let dayColor, nightColor;
    
    // 设置季节对应的夜晚天空颜色
    switch(currentSeason) {
        case 'spring':
            dayColor = new THREE.Color(0x87ceeb);  // 日间天蓝色
            nightColor = new THREE.Color(0x0c1445); // 夜间深蓝色
            break;
        case 'summer':
            dayColor = new THREE.Color(0x87ceeb);  // 日间天蓝色
            nightColor = new THREE.Color(0x000020); // 夏季夜晚颜色调整为更深的蓝黑色
            break;
        case 'autumn':
            dayColor = new THREE.Color(0xe9967a);  // 日间微橙色
            nightColor = new THREE.Color(0x12203c); // 夜间深蓝色，略带紫红
            break;
        case 'winter':
            dayColor = new THREE.Color(0xe0ffff);  // 日间淡青色
            nightColor = new THREE.Color(0x051938); // 夜间深蓝色
            break;
    }
    
    // 使用GSAP动画平滑过渡天空颜色
    gsap.to(scene.background, {
        r: isNightMode ? nightColor.r : dayColor.r,
        g: isNightMode ? nightColor.g : dayColor.g,
        b: isNightMode ? nightColor.b : dayColor.b,
        duration: 1.5
    });
    
    // 显示或隐藏星星
    if (stars) {
        stars.visible = isNightMode;
    } else if (isNightMode) {
        // 首次创建星星
        createStars(scene, currentSeason, isNightMode);
    }
    
    // 控制银河系是否显示 - 仅在夏季夜晚显示
    if (galaxy) {
        galaxy.visible = (currentSeason === 'summer' && isNightMode);
    }
    
    // 调整光源亮度
    lights.forEach(lightObj => {
        if (lightObj.season === currentSeason) {
            // 夜间模式降低主光源亮度
            gsap.to(lightObj.light, {
                intensity: isNightMode ? 0.3 : 1.0,
                duration: 1.5
            });
        }
    });
    
    // 调整环境光亮度
    const ambientLight = scene.children.find(child => child instanceof THREE.AmbientLight);
    if (ambientLight) {
        gsap.to(ambientLight, {
            intensity: isNightMode ? 0.2 : 0.4,
            duration: 1.5
        });
    }
    
    // 调整房子窗户发光效果
    if (house && house.windows) {
        house.windows.forEach(window => {
            if (window.material) {
                gsap.to(window.material, {
                    emissiveIntensity: isNightMode ? 0.8 : 0,
                    duration: 1.0
                });
                window.material.emissive.set(isNightMode ? 0xffd700 : 0x000000);
            }
        });
    }
}

/**
 * 更新标签可见性
 * @param {string} season - 当前季节
 */
function updateLabelsVisibility(season) {
    labels.forEach(label => {
        if (label.season === season) {
            label.element.style.display = '';
        } else {
            label.element.style.display = 'none';
        }
    });
} 