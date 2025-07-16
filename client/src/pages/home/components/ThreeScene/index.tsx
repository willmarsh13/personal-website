// src/components/Scene.tsx

import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
import {MathUtils} from "three";

const Scene: React.FC = () => {
    const mountRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const mount = mountRef.current;
        if (!mount) return;

        //
        // 1. Renderer
        //
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(mount.clientWidth, mount.clientHeight);
        renderer.setClearColor(0x000000, 0);

        // cast only this one line to any so TS won’t complain
        (renderer as any).physicallyCorrectLights = true;

        // use new API: outputColorSpace + SRGBColorSpace
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.5;

        mount.appendChild(renderer.domElement);

        //
        // 2. Scene + Camera (45° FOV to avoid fisheye)
        //
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(
            45,
            mount.clientWidth / mount.clientHeight,
            0.1,
            1000
        );
        camera.position.set(0, 0, 10);
        const ambient = new THREE.AmbientLight(0xffffff, 1.2);
        scene.add(ambient);

        const dir = new THREE.DirectionalLight(0xffffff, 2);
        dir.position.set(5, 10, 7.5);
        scene.add(dir);

        //
        // 3. Controls
        //
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;

        //
        // 4. HDR Environment
        //
        const pmremGen = new THREE.PMREMGenerator(renderer);
        pmremGen.compileEquirectangularShader();
        new RGBELoader()
            .setDataType(THREE.UnsignedByteType)
            .load('/assets/environment.hdr', (hdr) => {
                const envMap = pmremGen.fromEquirectangular(hdr).texture;
                scene.environment = envMap;
                scene.background = null;
                scene.environmentIntensity = 2.0;
                hdr.dispose();
                pmremGen.dispose();
            });

        //
        // 5. Fallback Lights
        //
        scene.add(new THREE.AmbientLight(0xffffff, 0.5));
        const dl = new THREE.DirectionalLight(0xffffff, 1);
        dl.position.set(5, 10, 7.5);
        scene.add(dl);

        //
        // 6. Load, scale, center & fix textures
        //
        const loader = new GLTFLoader();
        let mixer: THREE.AnimationMixer | null = null;

        loader.load(
            '/assets/JetEngine.glb',
            (gltf) => {
                const model = gltf.scene;

                model.scale.setScalar(0.6);

                const box = new THREE.Box3().setFromObject(model);
                const center = box.getCenter(new THREE.Vector3());
                model.position.sub(center);

                model.rotation.y = MathUtils.degToRad(40);
                model.rotation.x = MathUtils.degToRad(10);

                model.traverse((o) => {
                    if ((o as THREE.Mesh).isMesh) {
                        const m = (o as THREE.Mesh).material as THREE.MeshStandardMaterial;

                        if (m.map) {
                            (m.map as any).colorSpace = THREE.SRGBColorSpace;
                        }

                        if (m.emissiveMap) {
                            (m.emissiveMap as any).colorSpace = THREE.SRGBColorSpace;
                        }

                        m.needsUpdate = true;
                    }
                });

                scene.add(model);

                if (gltf.animations.length) {
                    mixer = new THREE.AnimationMixer(model);
                    gltf.animations.forEach((clip) => {
                        mixer!.clipAction(clip).play();
                    });
                }
            },
            undefined,
            (err) => console.error('GLTF load error:', err)
        );

        //
        // 7. Render loop
        //
        const clock = new THREE.Clock();
        let reqId: number;
        const animate = () => {
            reqId = requestAnimationFrame(animate);
            const delta = clock.getDelta();
            mixer?.update(delta);
            controls.update();
            renderer.render(scene, camera);
        };
        animate();

        //
        // 8. Resize
        //
        const onResize = () => {
            camera.aspect = mount.clientWidth / mount.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(mount.clientWidth, mount.clientHeight);
        };
        window.addEventListener('resize', onResize);

        //
        // 9. Cleanup
        //
        return () => {
            cancelAnimationFrame(reqId);
            window.removeEventListener('resize', onResize);
            controls.dispose();
            renderer.dispose();
            scene.clear();
            mount.removeChild(renderer.domElement);
        };
    }, []);

    return <div ref={mountRef} style={{ width: '100%', height: '100%' }} />;
};

export default Scene;
