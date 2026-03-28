import { onUnmounted } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import type { Contract, MaterialDefinition } from '@/types/contract'
import { assetUrl } from '@/utils/assetUrl'

export function useThreeScene() {
  let renderer: THREE.WebGLRenderer | null = null
  let scene: THREE.Scene | null = null
  let camera: THREE.PerspectiveCamera | null = null
  let controls: OrbitControls | null = null
  let animFrameId: number | null = null
  let resizeObserver: ResizeObserver | null = null
  let mixer: THREE.AnimationMixer | null = null
  const clock = new THREE.Clock()
  const animationClips = new Map<string, THREE.AnimationClip>()
  const meshMap: Record<string, THREE.Object3D> = {}
  const baseQuaternions = new Map<string, THREE.Quaternion>()
  const originalMaterials = new Map<string, THREE.Material | THREE.Material[]>()
  const textureLoader = new THREE.TextureLoader()

  function init(canvasEl: HTMLCanvasElement) {
    renderer = new THREE.WebGLRenderer({ canvas: canvasEl, antialias: true, alpha: false })
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(canvasEl.clientWidth, canvasEl.clientHeight)
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.2

    scene = new THREE.Scene()
    scene.background = new THREE.Color(0x111111)

    camera = new THREE.PerspectiveCamera(45, canvasEl.clientWidth / canvasEl.clientHeight, 0.1, 100)
    camera.position.set(2.5, 1.8, 3.5)

    const ambient = new THREE.AmbientLight(0xffffff, 0.4)
    scene.add(ambient)

    const key = new THREE.DirectionalLight(0xffffff, 1.5)
    key.position.set(3, 6, 4)
    key.castShadow = true
    key.shadow.mapSize.set(2048, 2048)
    key.shadow.camera.near = 0.1
    key.shadow.camera.far = 20
    key.shadow.camera.left = -5
    key.shadow.camera.right = 5
    key.shadow.camera.top = 5
    key.shadow.camera.bottom = -5
    scene.add(key)

    const fill = new THREE.DirectionalLight(0xffeedd, 0.4)
    fill.position.set(-3, 2, -2)
    scene.add(fill)

    const grid = new THREE.GridHelper(8, 16, 0x222222, 0x1a1a1a)
    scene.add(grid)

    controls = new OrbitControls(camera, canvasEl)
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controls.minDistance = 1
    controls.maxDistance = 12
    controls.maxPolarAngle = Math.PI / 2

    resizeObserver = new ResizeObserver(() => {
      if (!renderer || !camera) return
      const w = canvasEl.clientWidth
      const h = canvasEl.clientHeight
      renderer.setSize(w, h)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
    })
    resizeObserver.observe(canvasEl)

    loop()
  }

  function loop() {
    animFrameId = requestAnimationFrame(loop)
    const delta = clock.getDelta()
    mixer?.update(delta)
    controls?.update()
    if (renderer && scene && camera) renderer.render(scene, camera)
  }

  async function loadModel(url: string): Promise<void> {
    clearMeshes()
    mixer = null
    animationClips.clear()
    if (!scene) return

    const loader = new GLTFLoader()
    const gltf = await loader.loadAsync(url)

    // Register all named nodes in meshMap, store base quaternions and original materials
    gltf.scene.traverse((child) => {
      if (child.name) {
        meshMap[child.name] = child
        baseQuaternions.set(child.name, child.quaternion.clone())
      }
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh
        mesh.castShadow = true
        mesh.receiveShadow = true
        originalMaterials.set(mesh.uuid, mesh.material)
      }
    })

    // Set up AnimationMixer
    if (gltf.animations.length > 0) {
      mixer = new THREE.AnimationMixer(gltf.scene)
      gltf.animations.forEach((clip) => animationClips.set(clip.name, clip))
    }

    // Center model and fit camera
    const box = new THREE.Box3().setFromObject(gltf.scene)
    const center = box.getCenter(new THREE.Vector3())
    const size = box.getSize(new THREE.Vector3())
    gltf.scene.position.sub(center)
    gltf.scene.position.y += size.y / 2

    scene.add(gltf.scene)

    // Fit camera to model
    if (camera && controls) {
      const maxDim = Math.max(size.x, size.y, size.z)
      const fov = (camera.fov * Math.PI) / 180
      const distance = (maxDim / 2 / Math.tan(fov / 2)) * 1.8
      camera.position.set(distance * 0.6, distance * 0.5, distance * 0.8)
      controls.target.set(0, size.y / 4, 0)
      controls.update()
    }

    // Shadow floor
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(8, 8),
      new THREE.ShadowMaterial({ opacity: 0.15 }),
    )
    floor.rotation.x = -Math.PI / 2
    floor.receiveShadow = true
    scene.add(floor)
  }

  function playAnimation(name: string) {
    if (!mixer) return
    const clip = animationClips.get(name)
    if (!clip) return
    mixer.stopAllAction()
    const action = mixer.clipAction(clip)
    action.reset()
    action.setLoop(THREE.LoopOnce, 1)
    action.clampWhenFinished = true
    action.play()
  }

  function buildPlaceholderModel(contract: Contract) {
    clearMeshes()
    if (!scene) return

    for (const part of Object.values(contract.parts)) {
      const mat = new THREE.MeshStandardMaterial({ color: 0xc8a87a, roughness: 0.75, metalness: 0 })

      if (part.nodeName === 'Door') {
        const mesh = new THREE.Mesh(new THREE.BoxGeometry(0.05, 2, 0.9), mat)
        mesh.castShadow = true
        const pivot = new THREE.Group()
        pivot.position.set(0, 1, 0)
        mesh.position.set(0, 0, 0.45)
        pivot.add(mesh)
        scene.add(pivot)
        meshMap[part.nodeName] = pivot

      } else if (part.nodeName === 'Frame') {
        const group = new THREE.Group()
        const m = mat.clone() as THREE.MeshStandardMaterial
        const top = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 1.1), m)
        top.position.set(0, 2.04, 0)
        const left = new THREE.Mesh(new THREE.BoxGeometry(0.08, 2.1, 0.08), m)
        left.position.set(0, 1, -0.55)
        const right = new THREE.Mesh(new THREE.BoxGeometry(0.08, 2.1, 0.08), m)
        right.position.set(0, 1, 0.55)
        group.add(top, left, right)
        scene.add(group)
        meshMap[part.nodeName] = group

      } else if (part.nodeName === 'Seat') {
        const group = new THREE.Group()
        const m = mat.clone() as THREE.MeshStandardMaterial
        const seat = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.15, 0.85), m)
        seat.position.set(0, 0.45, 0)
        seat.castShadow = true
        const back = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.75, 0.12), m)
        back.position.set(0, 0.9, -0.43)
        back.castShadow = true
        group.add(seat, back)
        scene.add(group)
        meshMap[part.nodeName] = group

      } else if (part.nodeName === 'Armrests') {
        const m = mat.clone() as THREE.MeshStandardMaterial
        const pivot = new THREE.Group()
        pivot.position.set(0, 0.55, 0)
        const leftArm = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.08, 0.65), m)
        leftArm.position.set(0.44, 0, 0)
        const rightArm = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.08, 0.65), m)
        rightArm.position.set(-0.44, 0, 0)
        pivot.add(leftArm, rightArm)
        scene.add(pivot)
        meshMap[part.nodeName] = pivot

      } else if (part.nodeName === 'Legs') {
        const legMat = new THREE.MeshStandardMaterial({ color: 0x8a6a4a, roughness: 0.6, metalness: 0.1 })
        const group = new THREE.Group()
        const positions: [number, number][] = [[0.35, 0.35], [0.35, -0.35], [-0.35, 0.35], [-0.35, -0.35]]
        for (const [x, z] of positions) {
          const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.03, 0.45), legMat)
          leg.position.set(x, 0.225, z)
          leg.castShadow = true
          group.add(leg)
        }
        scene.add(group)
        meshMap[part.nodeName] = group
      }
    }

    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(8, 8),
      new THREE.ShadowMaterial({ opacity: 0.15 }),
    )
    floor.rotation.x = -Math.PI / 2
    floor.receiveShadow = true
    scene.add(floor)
  }

  function clearMeshes() {
    for (const key of Object.keys(meshMap)) {
      scene?.remove(meshMap[key])
      delete meshMap[key]
    }
    baseQuaternions.clear()
    originalMaterials.clear()
  }

  function applyRotation(nodeName: string, axis: 'x' | 'y' | 'z', valueDeg: number) {
    const obj = meshMap[nodeName]
    if (!obj) return
    const base = baseQuaternions.get(nodeName) ?? new THREE.Quaternion()
    const axisVec = new THREE.Vector3(
      axis === 'x' ? 1 : 0,
      axis === 'y' ? 1 : 0,
      axis === 'z' ? 1 : 0,
    )
    const delta = new THREE.Quaternion().setFromAxisAngle(axisVec, (valueDeg * Math.PI) / 180)
    obj.quaternion.multiplyQuaternions(base, delta)
  }

  function applyMaterial(matDef: MaterialDefinition) {
    const apply = (texture: THREE.Texture | null) => {
      for (const obj of Object.values(meshMap)) {
        obj.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh
            const orig = originalMaterials.get(mesh.uuid)
            if (orig) mesh.material = orig

            const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
            for (const m of materials as THREE.MeshStandardMaterial[]) {
              if (texture) {
                texture.colorSpace = THREE.SRGBColorSpace
                texture.flipY = false
                m.map = texture
              }
              m.color.set(matDef.color)
              m.roughness = matDef.roughness
              m.metalness = matDef.metalness
              m.needsUpdate = true
            }
          }
        })
      }
    }

    if (matDef.textureUrl) {
      textureLoader.load(assetUrl(matDef.textureUrl), apply)
    } else {
      apply(null)
    }
  }

  function dispose() {
    if (animFrameId !== null) cancelAnimationFrame(animFrameId)
    resizeObserver?.disconnect()
    controls?.dispose()
    renderer?.dispose()
    clearMeshes()
  }

  onUnmounted(dispose)

  return { init, loadModel, buildPlaceholderModel, playAnimation, applyRotation, applyMaterial }
}
