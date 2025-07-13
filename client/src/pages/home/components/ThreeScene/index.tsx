import React, { useRef, useEffect, JSX } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, useGLTF, Environment } from '@react-three/drei'
import { OrbitControls as ThreeOrbitControls } from 'three-stdlib'
import * as THREE from 'three'
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader'
import { Typography } from '@mui/material'
import GUI from 'lil-gui'

// Settings interface for GUI controls
interface ControlsSettings {
    modelScale: number
    rotX: number
    rotY: number
    rotZ: number
    camX: number
    camY: number
    camZ: number
    fov: number
}

// Props for the model component
interface RotatingSpaceShuttleModelProps {
    modelRef: React.RefObject<THREE.Group | null>
}

// Component that loads and animates the GLB model
function RotatingSpaceShuttleModel({ modelRef }: RotatingSpaceShuttleModelProps): JSX.Element {
    const { scene, animations } = useGLTF('/assets/SpaceShuttle.glb') as unknown as GLTF
    const mixer = useRef<THREE.AnimationMixer | null>(null)

    // Initialize animation mixer and play all clips
    useEffect(() => {
        if (animations.length > 0 && modelRef.current) {
            mixer.current = new THREE.AnimationMixer(modelRef.current)
            animations.forEach((clip: THREE.AnimationClip) => {
                mixer.current
                    ?.clipAction(clip, modelRef.current as THREE.Object3D)
                    ?.play()
            })
        }
    }, [animations, modelRef])

    // Update animation mixer each frame
    useFrame((_, delta: number) => {
        mixer.current?.update(delta)
    })

    return <primitive ref={modelRef} object={scene} scale={modelRef.current?.scale.x} />
}

// Main scene component with GUI
export default function ThreeScene(): JSX.Element {
    const modelRef = useRef<THREE.Group>(null)
    const cameraRef = useRef<THREE.PerspectiveCamera>(null)
    const guiRef = useRef<GUI | null>(null)
    const orbitRef = useRef<ThreeOrbitControls>(null)

    const settings = useRef<ControlsSettings>({
        modelScale: 1.33982,
        rotX: 0.747699,
        rotY: -1.57079,
        rotZ: 0.050265,
        camX: -3.28,
        camY: -3.52,
        camZ: 9.02,
        fov: 8.722,
    })

    useEffect(() => {
        const orbit = orbitRef.current
        const cam = cameraRef.current

        if (orbit && cam) {
            const target = new THREE.Vector3(10, 120, 100)
            orbit.target.copy(target)
            orbit.update()

            cam.lookAt(target)
        }
    }, [])

    // Setup GUI on mount
    useEffect(() => {
        if (guiRef.current) return // already initialized

        const gui = new GUI()
        guiRef.current = gui

        // Model folder
        const modelFolder = gui.addFolder('Model')
        modelFolder
            .add(settings.current, 'modelScale', 0.01, 2)
            .onChange((v: number) => modelRef.current?.scale.setScalar(v))
        modelFolder
            .add(settings.current, 'rotX', -Math.PI, Math.PI)
            .onChange((v: number) => {
                if (modelRef.current) modelRef.current.rotation.x = v
            })
        modelFolder
            .add(settings.current, 'rotY', -Math.PI, Math.PI)
            .onChange((v: number) => {
                if (modelRef.current) modelRef.current.rotation.y = v
            })
        modelFolder
            .add(settings.current, 'rotZ', -Math.PI, Math.PI)
            .onChange((v: number) => {
                if (modelRef.current) modelRef.current.rotation.z = v
            })
        modelFolder.open()

        // Camera folder
        const camFolder = gui.addFolder('Camera')
        camFolder
            .add(settings.current, 'camX', -10, 10)
            .onChange((v: number) => {
                if (cameraRef.current) cameraRef.current.position.x = v
            })
        camFolder
            .add(settings.current, 'camY', -10, 10)
            .onChange((v: number) => {
                if (cameraRef.current) cameraRef.current.position.y = v
            })
        camFolder
            .add(settings.current, 'camZ', -10, 10)
            .onChange((v: number) => {
                if (cameraRef.current) cameraRef.current.position.z = v
            })
        camFolder
            .add(settings.current, 'fov', 1, 100)
            .onChange((v: number) => {
                if (cameraRef.current) {
                    cameraRef.current.fov = v
                    cameraRef.current.updateProjectionMatrix()
                }
            })
        camFolder.open()

        // Apply initial settings
        if (modelRef.current) {
            modelRef.current.scale.setScalar(settings.current.modelScale)
            modelRef.current.rotation.set(
                settings.current.rotX,
                settings.current.rotY,
                settings.current.rotZ
            )
        }
        if (cameraRef.current) {
            cameraRef.current.position.set(
                settings.current.camX,
                settings.current.camY,
                settings.current.camZ
            )
            cameraRef.current.fov = settings.current.fov
            cameraRef.current.updateProjectionMatrix()
        }

        return () => {
            gui.destroy()
            guiRef.current = null
        }
    }, [])

    return (
        <>
            <Canvas
                camera={{
                    position: [
                        settings.current.camX,
                        settings.current.camY,
                        settings.current.camZ,
                    ],
                    fov: settings.current.fov,
                }}
                onCreated={({ camera }) => {
                    // Cast to PerspectiveCamera
                    cameraRef.current = camera as THREE.PerspectiveCamera
                }}
                style={{ height: 'inherit' }}
            >
                <ambientLight intensity={0.5} />
                <directionalLight position={[4, 30, 5]} intensity={1.2} />
                <Environment preset="warehouse" />

                <React.Suspense fallback={null}>
                    <RotatingSpaceShuttleModel modelRef={modelRef} />
                </React.Suspense>

                <OrbitControls
                    ref={orbitRef}
                    enableZoom={true}
                    enablePan={true}
                    enableRotate={true}
                />
            </Canvas>
            <Typography>Photo from X</Typography>
        </>
    )
}
