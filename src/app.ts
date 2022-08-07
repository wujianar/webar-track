class App {
    private scene: THREE.Scene = new THREE.Scene();
    private camera: THREE.Camera = new THREE.PerspectiveCamera();
    private renderer: THREE.WebGLRenderer;
    private clock = new THREE.Clock();
    private animations: Map<String, () => void> = new Map();
    private mixers: THREE.AnimationMixer[] = [];

    private webAR: any;
    private stats: any;

    constructor() {
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.domElement.style.position = 'absolute;z-index:100';
        const container = document.querySelector('#container');
        container!.appendChild(this.renderer.domElement);

        // WEBAR云识别设置
        // @ts-ignore
        this.webAR = new window.WUJIAN.WebAR({
            container: container,
            endpointUrl: 'https://iss-cn2.wujianar.com',
            token: 'MDU5ODFmNjYyZjExYTY4NWIzYzRlYjZmMjZhM2Q0MGU2Njg0NjYxYjBmNWYzYWZiNGFmYzE2MTAzMTlhY2ZlNnsiYWNjZXNzS2V5IjoiODg3ZjE2MmFlYTY4NDk0OGE3OTI1MzNkNWZlZjY0NmQiLCJleHBpcmVzIjoxNjg3ODUzNjU2MjIwfQ==',
            scaleOffset: new THREE.Vector3(1.5, 3, 4),
        });
        this.webAR.setThree({ scene: this.scene, camera: this.camera, renderer: this.renderer });

        // @ts-ignore
        this.stats = new window.Stats();
        this.stats.showPanel(0);
        document.body.appendChild(this.stats.dom);

        const light = new THREE.HemisphereLight(0xFFFFFF, 0x444444, 2);
        light.position.set(0, 200, 0);
        this.scene.add(light);

        this.webAR.onTargetFound = () => {
            console.info('found');
        };
        this.webAR.onTargetLost = () => {
            console.info('lost');
            return true;
        };
    }


    public initBtnEvent(): void {
        this.bindClick('btnStart', () => {
            this.webAR.openCamera().then(() => {
            }).catch((err: any) => {
                this.webAR.ui.hideLoading();
            });
        });

        // 本地识别
        this.bindClick('btnAr', async () => {
            this.webAR.openCamera().then(() => {
                this.webAR.ui.showLoading();

                // 使用预编译好的特征数据
                this.webAR.loadData('assets/data/kl.dat').then(() => {
                    console.info('loaded');
                    this.addCube();
                    this.render();
                    this.webAR.start(() => {
                        this.webAR.ui.hideLoading();
                    });

                    // const data = { brief: `{"modelUrl": "assets/models/SambaDancing.fbx", "rotation":[0.1, 0, 0], "scale": 0.005,"clipAction": 0}` };
                    // this.loadModel(JSON.parse(data.brief), () => {
                    //     this.render();
                    //     this.webAR.start(() => {
                    //         this.webAR.ui.hideLoading();
                    //     });
                    // });
                }).catch((err: any) => {
                    console.info(err);
                });

                // 直接使用图片，很耗时间，待优化
                // this.webAR.loadTarget('assets/images/marker.jpg', () => {
                //     // 识别图编译进度
                // }).then(() => {
                //     console.info('loaded');
                //     this.addCube();
                //     this.render();
                //     this.webAR.start(() => {
                //         this.webAR.ui.hideLoading();
                //     });
                // });
            }).catch((err: any) => {
                this.webAR.ui.hideLoading();
            });
        });

        // 云识别 (技术支持：　https://www.wujianar.com/)
        this.bindClick('btnSearch', async () => {
            this.webAR.openCamera().then(() => {
                this.webAR.ui.showScanning();

                this.webAR.startSearch((data: any) => {
                    // 识别成功后的回调
                    this.webAR.ui.hideScanning();
                    this.webAR.ui.showLoading();

                    this.addCube();
                    this.render();
                    this.webAR.start(() => {
                        this.webAR.ui.hideLoading();
                    });
                });
            }).catch((err: any) => {
                this.webAR.ui.hideLoading();
            });
        });
        this.bindClick('btnPause', () => {
            //　暂停跟踪
            this.webAR.pause();
        });
        this.bindClick('btnRestart', () => {
            //　恢复跟踪
            this.webAR.start();
        });
    }

    private bindClick(target: string, cb: () => void): void {
        document.querySelector(`#${target}`)?.addEventListener('click', () => {
            cb.call(this);
        });
    }

    private render(): void {
        this.renderer.setAnimationLoop(() => {
            this.renderer.render(this.scene, this.camera);

            this.stats.update();

            this.mixers.forEach(i => {
                i.update(this.clock.getDelta());
            });

            this.animations.forEach((v, _) => {
                v.call(this);
            });
        });
    }

    private stopRender(): void {
        this.renderer.setAnimationLoop(null);
    }

    private addCube(): void {
        const cube = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.5), new THREE.MeshLambertMaterial({ color: '#88AACC' }));
        cube.position.z = 0.3;
        // 加入跟踪对象中
        this.webAR.addObject(cube);

        this.animations.set('cube', () => {
            cube.rotation.x += 0.01;
            cube.rotation.y += 0.01;
            cube.rotation.z += 0.01;
        });
    }

    /**
     * 
     * @param setting 加载模型
     * @param cb 
     * @returns 
     */
    private loadModel(setting: { modelUrl: string, position?: number[], rotation?: number[]; scale?: number, clipAction?: number; }, cb: () => void) {
        const loader = this.getLoader(setting.modelUrl);
        if (loader == null) {
            return;
        }

        loader.load(setting.modelUrl, (obj: any) => {
            const player = obj.scene || obj;
            player.scale.setScalar(setting.scale || 1);

            if (setting.position) {
                player.position.x = setting.position[0];
                player.position.y = setting.position[1];
                player.position.z = setting.position[2];
            }

            if (setting.rotation) {
                player.rotation.x = setting.rotation[0];
                player.rotation.y = setting.rotation[1];
                player.rotation.z = setting.rotation[2];
            }

            // 将模型加入跟踪对象中
            this.webAR.addObject(player);

            if (obj.animations.length > 0) {
                const mixer = new THREE.AnimationMixer(player);
                mixer.clipAction(obj.animations[setting.clipAction || 0]).play();
                this.mixers.push(mixer);
            }

            cb.call(this);
        }, (e: any) => {
            console.info(e);
        }, (err: any) => {
            console.error('加载模型错误:', err);
        });
    }

    /**
     * 获取模型加载器
     * @param url 
     * @returns 
     */
    private getLoader(url: string): any {
        let loader = null;
        const suffix = url.split('.').pop()?.toUpperCase();
        switch (suffix) {
            case 'FBX':
                // @ts-ignore
                loader = new THREE.FBXLoader();
                break;

            case 'GLB':
            case 'GLTF':
                // @ts-ignore
                loader = new THREE.GLTFLoader();
                break;
            default:
                alert(`请扩展${suffix}文件加载器`);
        }
        return loader;
    }
}

const app = new App();
app.initBtnEvent();