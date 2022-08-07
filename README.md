# WebAR 本地识别与跟踪实现

3D渲染 threejs。

技术支持：https://www.wujianar.com/

## 1. 初始化WebAR
```typescript

// 初始化WebAR
this.webAR = new window.WUJIAN.WebAR({
    container: container,
    endpointUrl: 'https://iss-cn2.wujianar.com',
    token: 'MDU5........UzNjU2MjIwfQ==',
    scaleOffset: new THREE.Vector3(1.5, 3, 4),
});

// 设置threejs
this.webAR.setThree({ scene: this.scene, camera: this.camera, renderer: this.renderer });

```

## 2. 打开相机
```typescript
this.webAR.openCamera().then(() => {
    // 相机打开后加载本地特征数据，加载模型等。
}).catch((err: any) => {
});
```

## 3. 加载特征数据及跟踪
```typescript
// 使用预编译好的特征数据
this.webAR.loadData('assets/data/kl.dat').then(() => {
    this.addCube();
    this.render();

    // 打开跟踪功能
    this.webAR.start();
}).catch((err: any) => {
    console.info(err);
});
```

### 4. 使用云识别，识别成功后并在本地跟踪
```typescript
this.webAR.startSearch((data: any) => {
    // data为绑定的breif数据(3d模型或视频的数据可在保存在breif中)

    // 识别成功后的回调
    this.addCube();
    this.render();

    // 打开跟踪功能
    this.webAR.start();
});
```

### 5. 暂停/恢复跟踪功能
```typescript
// 暂停
this.webAR.pause();
// 恢复
this.webAR.start();
```

### 6. demo预览 (建议在微信浏览中预览)


![二维码](assets/images/qrcode.png)

![识别图](assets/images/marker.jpg)
