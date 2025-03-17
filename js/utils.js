/**
 * 工具函数集合
 * 包含四季变迁应用中使用的各种辅助函数
 */

/**
 * 返回季节对应的中文字符
 * @param {string} season - 季节名称
 * @returns {string} - 中文字符
 */
function getSeasonsChineseCharacter(season) {
    switch(season) {
        case 'spring': return '春';
        case 'summer': return '夏';
        case 'autumn': return '秋';
        case 'winter': return '冬';
        default: return '';
    }
}

/**
 * OrbitControls 实现
 * 简化版的相机轨道控制器
 */
class OrbitControls {
    constructor(camera, domElement) {
        this.camera = camera;
        this.domElement = domElement;
        
        // 控制参数
        this.target = new THREE.Vector3();
        this.enableDamping = false;
        this.dampingFactor = 0.05;
        this.rotateSpeed = 1.0;
        this.minDistance = 0;
        this.maxDistance = Infinity;
        this.minPolarAngle = 0;
        this.maxPolarAngle = Math.PI;
        
        // 内部状态
        this.spherical = new THREE.Spherical();
        this.sphericalDelta = new THREE.Spherical();
        this.scale = 1;
        this.zoomChanged = false;
        this.rotateStart = new THREE.Vector2();
        this.rotateEnd = new THREE.Vector2();
        this.rotateDelta = new THREE.Vector2();
        this.panStart = new THREE.Vector2();
        this.panEnd = new THREE.Vector2();
        this.panDelta = new THREE.Vector2();
        this.isMouseDown = false;
        this.isTouching = false;
        
        // 鼠标事件处理
        this.domElement.addEventListener('mousedown', this.onMouseDown.bind(this));
        this.domElement.addEventListener('mousemove', this.onMouseMove.bind(this));
        this.domElement.addEventListener('mouseup', this.onMouseUp.bind(this));
        this.domElement.addEventListener('wheel', this.onMouseWheel.bind(this));
        
        // 触摸事件处理
        this.domElement.addEventListener('touchstart', this.onTouchStart.bind(this), { passive: false });
        this.domElement.addEventListener('touchmove', this.onTouchMove.bind(this), { passive: false });
        this.domElement.addEventListener('touchend', this.onTouchEnd.bind(this));
        
        // 初始化
        this.update();
    }
    
    onMouseDown(event) {
        event.preventDefault();
        this.isMouseDown = true;
        
        this.rotateStart.set(event.clientX, event.clientY);
    }
    
    onMouseMove(event) {
        if (!this.isMouseDown) return;
        
        this.rotateEnd.set(event.clientX, event.clientY);
        this.rotateDelta.subVectors(this.rotateEnd, this.rotateStart);
        
        // 在屏幕坐标系中旋转
        this.sphericalDelta.theta -= 2 * Math.PI * this.rotateDelta.x / this.domElement.clientHeight * this.rotateSpeed;
        this.sphericalDelta.phi -= 2 * Math.PI * this.rotateDelta.y / this.domElement.clientHeight * this.rotateSpeed;
        
        this.rotateStart.copy(this.rotateEnd);
        
        this.update();
    }
    
    onMouseUp() {
        this.isMouseDown = false;
    }
    
    onMouseWheel(event) {
        event.preventDefault();
        
        if (event.deltaY < 0) {
            this.scale /= 0.95;
        } else {
            this.scale *= 0.95;
        }
        
        this.zoomChanged = true;
        
        this.update();
    }
    
    /**
     * 触摸开始事件处理
     * @param {TouchEvent} event - 触摸事件
     */
    onTouchStart(event) {
        event.preventDefault();
        this.isTouching = true;
        
        // 获取第一个触摸点位置
        const touch = event.touches[0];
        this.rotateStart.set(touch.clientX, touch.clientY);
        
        // 如果是两个手指触摸，处理缩放
        if (event.touches.length === 2) {
            const dx = event.touches[0].clientX - event.touches[1].clientX;
            const dy = event.touches[0].clientY - event.touches[1].clientY;
            this.touchZoomDistanceStart = Math.sqrt(dx * dx + dy * dy);
        }
    }
    
    /**
     * 触摸移动事件处理
     * @param {TouchEvent} event - 触摸事件
     */
    onTouchMove(event) {
        event.preventDefault();
        
        if (!this.isTouching) return;
        
        // 单指触摸处理旋转
        if (event.touches.length === 1) {
            const touch = event.touches[0];
            this.rotateEnd.set(touch.clientX, touch.clientY);
            this.rotateDelta.subVectors(this.rotateEnd, this.rotateStart);
            
            // 触摸旋转速度调整
            const rotateSpeed = this.rotateSpeed * 0.7; // 触摸时降低旋转速度
            
            // 在屏幕坐标系中旋转
            this.sphericalDelta.theta -= 2 * Math.PI * this.rotateDelta.x / this.domElement.clientHeight * rotateSpeed;
            this.sphericalDelta.phi -= 2 * Math.PI * this.rotateDelta.y / this.domElement.clientHeight * rotateSpeed;
            
            this.rotateStart.copy(this.rotateEnd);
        } 
        // 双指触摸处理缩放
        else if (event.touches.length === 2) {
            const dx = event.touches[0].clientX - event.touches[1].clientX;
            const dy = event.touches[0].clientY - event.touches[1].clientY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // 计算缩放比例
            const touchZoomDistanceEnd = distance;
            
            if (this.touchZoomDistanceStart > 0) {
                if (touchZoomDistanceEnd > this.touchZoomDistanceStart) {
                    // 手指分开，放大
                    this.scale /= 0.95;
                } else {
                    // 手指靠拢，缩小
                    this.scale *= 0.95;
                }
                this.zoomChanged = true;
                this.touchZoomDistanceStart = touchZoomDistanceEnd;
            }
        }
        
        this.update();
    }
    
    /**
     * 触摸结束事件处理
     */
    onTouchEnd() {
        this.isTouching = false;
    }
    
    update() {
        const offset = new THREE.Vector3();
        
        // 从目标点到相机的向量
        offset.copy(this.camera.position).sub(this.target);
        
        // 将向量转换为球坐标
        this.spherical.setFromVector3(offset);
        
        // 应用旋转变化
        this.spherical.theta += this.sphericalDelta.theta;
        this.spherical.phi += this.sphericalDelta.phi;
        
        // 限制phi在min和max之间
        this.spherical.phi = Math.max(this.minPolarAngle, Math.min(this.maxPolarAngle, this.spherical.phi));
        
        // 限制半径在min和max之间
        this.spherical.radius = Math.max(this.minDistance, Math.min(this.maxDistance, this.spherical.radius * this.scale));
        
        // 将球坐标转回向量
        offset.setFromSpherical(this.spherical);
        
        // 更新相机位置
        this.camera.position.copy(this.target).add(offset);
        this.camera.lookAt(this.target);
        
        // 重置变化
        this.sphericalDelta.set(0, 0, 0);
        this.scale = 1;
        
        return true;
    }
} 