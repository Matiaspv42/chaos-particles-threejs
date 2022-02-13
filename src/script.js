import './style.css'
import * as THREE from 'three'
import { FlyControls } from 'three/examples/jsm/controls/FlyControls.js'

import * as dat from 'lil-gui'
import vertexAizawa from './shaders/vertexAizawa.glsl'
import fragmentAizawa from './shaders/fragmentAizawa.glsl'
import vertexPickover from './shaders/vertexPickover.glsl'
import fragmentPickover from './shaders/fragmentPickover.glsl'
import gsap from "gsap";




/**
 * Base
 */
// Debug
const gui = new dat.GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Galaxy
 */
const parameters = {}
parameters.count = 200000
parameters.size = 0.005
parameters.radius = 5
parameters.branches = 3
parameters.spin = 1
parameters.randomness = 0.5
parameters.randomnessPower = 3
parameters.insideColor = '#ff6030'
parameters.outsideColor = '#1b3984'
parameters.positionCameraX = 0
parameters.positionCameraY = 0
parameters.positionCameraZ = 0

let geometry = null
let material = null
let points = null
let randomPoints = null
let material2 = null

const generateGalaxy = () =>
{
    if(points !== null)
    {
        geometry.dispose()
        material.dispose()
        scene.remove(points)
    }
  
    // Random Points

    let iterations = 1000000

    let randomPointsPositions = new Float32Array(iterations)

    for(let i = 0; i<iterations ; i++){
        const i3 = i*3
        randomPointsPositions[i3 + 0] = (Math.random() - 0.5) * 100
        randomPointsPositions[i3 + 1] = (Math.random() - 0.5) * 100
        randomPointsPositions[i3 + 2] = (Math.random() - 0.5) * 100
    }

    const randomParticles = new THREE.BufferGeometry()
    randomParticles.setAttribute('position', new THREE.BufferAttribute(randomPointsPositions,3))

    let staticPointsPositions = new Float32Array(iterations)

    for(let i = 0; i<iterations/10 ; i++){
        const i3 = i*3
        staticPointsPositions[i3 + 0] = (Math.random() - 0.5) * 600
        staticPointsPositions[i3 + 1] = (Math.random() - 0.5) * 600
        staticPointsPositions[i3 + 2] = (Math.random() - 0.5) * 600
    }

    const staticParticles = new THREE.BufferGeometry()
    staticParticles.setAttribute('position', new THREE.BufferAttribute(staticPointsPositions,3))
    
    // aizawa
    let aizawaPoints = [0.1,0.0,0.0]
    let step = 0.01
    let constantsAizawa = {}
    constantsAizawa.a = 0.95
    constantsAizawa.b = 0.7
    constantsAizawa.c = 0.6
    constantsAizawa.d = 3.5
    constantsAizawa.e = 0.25
    constantsAizawa.f = 0.1

    for(let i = 0; i<(iterations/3) ;i++){
        const i3 = i*3

        // Current position
        let x = aizawaPoints[i3]
        let y = aizawaPoints[i3+1]
        let z = aizawaPoints[i3+2]

        // Increments calculation
        var dx = ((z-constantsAizawa.b)*x - (constantsAizawa.d*y))   * step;
        var dy = ((constantsAizawa.d*x) + (z-constantsAizawa.b)*y) * step;
        var dz = (constantsAizawa.c + ( constantsAizawa.a*z) - ((z*z*z)/3)-(x*x + y*y)*(1 + constantsAizawa.e*z) + constantsAizawa.f*z*x*x*x)   * step;

        // new position

        aizawaPoints.push( dx + x, dy + y, dz + z)

    }
    

    // Geometry Aizawa
    const positionsAizawa = new Float32Array(iterations)
    const geometryAizawa = new THREE.BufferGeometry()

    for(let i = 0 ; i<(iterations);i++){
        positionsAizawa[i] = aizawaPoints[i]
    }



    // Halvorsen Attraktor
    let halvorsenPoints = [1,0,0]
    iterations = 100000
    step = 0.001
    let constantsHalsorven = {}
    constantsHalsorven.a = 1.4


    for(let i = 0; i<(iterations/3) ;i++){
        const i3 = i*3

        // Current position
        let x = halvorsenPoints[i3]
        let y = halvorsenPoints[i3+1]
        let z = halvorsenPoints[i3+2]

        // Increments calculation
        var dx = (-constantsHalsorven.a*x -4*y - 4*z - y*y)   * step;
        var dy = (-constantsHalsorven.a*y - 4*z -4*x - z*z) * step;
        var dz = (-constantsHalsorven.a*z-4*x-4*y-x*x)   * step;

        // new position

        halvorsenPoints.push( dx + x, dy + y, dz + z)

    }
    
    // Geometry Halsorven

    const positionsHalsorven = new Float32Array(iterations)
    const geometryHalsorven = new THREE.BufferGeometry()

    

    for(let i = 0 ; i<(iterations);i++){
        positionsHalsorven[i] = halvorsenPoints[i]
    }
    
    
    // Add positions
    geometryHalsorven.setAttribute('position', new THREE.BufferAttribute(positionsHalsorven,3))
    geometryHalsorven.setAttribute('positionAizawa', new THREE.BufferAttribute(positionsAizawa,3))
    geometryAizawa.setAttribute('position', new THREE.BufferAttribute(positionsAizawa,3))
    randomParticles.setAttribute('positionHalsorven', new THREE.BufferAttribute(positionsHalsorven,3))
    randomParticles.setAttribute('positionAizawa',  new THREE.BufferAttribute(positionsAizawa,3))

    // Material
    material = new THREE.ShaderMaterial({
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexShader: vertexAizawa ,
        fragmentShader: fragmentAizawa,
        vertexColors: true,
        uniforms:{
            uTime:{value : 0},
            uSize:{value: 100 * renderer.getPixelRatio()},
            uSectionNumber:{value:0},
            uScrollY: {value:0},
            uAizawa: {value:0},
            uHalsorven: {value:0}
        }
    })

    // Material
    material2 = new THREE.ShaderMaterial({
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexShader: vertexPickover ,
        fragmentShader: fragmentPickover,
        uniforms:{
            uSize:{value: 30 * renderer.getPixelRatio()},
        }
    })

    

    // We create the points

    points = new THREE.Points(geometryHalsorven, material)
    randomPoints = new THREE.Points(randomParticles, material)
    // scene.add(points)
    scene.add(randomPoints)
    scene.add(staticParticles)
    points.position.x = 18
    points.position.y = 4
    points.position.z = -6
}



// gui.add(parameters, 'count').min(100).max(1000000).step(100).onFinishChange(generateGalaxy)
// gui.add(parameters, 'radius').min(0.01).max(20).step(0.01).onFinishChange(generateGalaxy)
// gui.add(parameters, 'branches').min(2).max(20).step(1).onFinishChange(generateGalaxy)
// gui.add(parameters, 'randomness').min(0).max(2).step(0.001).onFinishChange(generateGalaxy)
// gui.add(parameters, 'randomnessPower').min(1).max(10).step(0.001).onFinishChange(generateGalaxy)
// gui.addColor(parameters, 'insideColor').onFinishChange(generateGalaxy)
// gui.addColor(parameters, 'outsideColor').onFinishChange(generateGalaxy)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Scroll
 */
let scrollY = window.scrollY
// section number is going to be used to trigger the shaders
let currentSection = 0.0
window.addEventListener('scroll', ()=>{
    scrollY = window.scrollY
    material.uniforms.uScrollY.value = scrollY/sizes.height
    const newSection = Math.floor(scrollY/sizes.height) 
    
    material.uniforms.uSectionNumber.value = newSection

    if(newSection != currentSection){
        currentSection = newSection
        gsap.to(
            material.uniforms.uAizawa,
            {
                duration:3.5,
                value: 1
            }
        )   
        gsap.to(
            camera.position,
            {
                duration:3.5,
                x:14,
                y:4.4,
                z:-3.26
            }
        )
        gsap.to(
            camera.rotation,
            {
                duration:3.5,
                x:0.,
                y:-0.62,
                z:-0.22
            }
        )
       

    }
    

})


/**
 * Parallax
 */

const cursor = {}
cursor.x = 0
cursor.y = 0
window.addEventListener('mousemove',(event)=>{
    cursor.x = event.clientX / sizes.width -0.5
    cursor.y = event.clientY / sizes.height -0.5
    
})

/**
 * Camera
 */
// group
const cameraGroup = new THREE.Group()
scene.add(cameraGroup)
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.x = -2.0
camera.position.y = 1.4
camera.position.z = 17.0
camera.lookAt(-2.0,1.4,-83.0)
scene.add(camera)






gui.add(parameters, 'positionCameraX').min(-30).max(30).step(0.1).onChange(value => camera.position.x = value)
gui.add(parameters, 'positionCameraY').min(-30).max(30).step(0.1).onChange(value => camera.position.y = value)
gui.add(parameters, 'positionCameraZ').min(-30).max(30).step(0.1).onChange(value => camera.position.z = value)



// Controls
// Initiate FlyControls with various params
const controls = new FlyControls( camera, canvas );
controls.movementSpeed = 100;
controls.rollSpeed = Math.PI / 24;
controls.autoForward = false;
controls.dragToLook = true;

// set the spans with the queried HTML DOM elements
// 3. define cameraDirection and span variables
let cameraDirection = new THREE.Vector3()
let camPositionSpan, camLookAtSpan
camPositionSpan = document.querySelector("#position");
camLookAtSpan = document.querySelector("#lookingAt");





/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

// generate galaxy

generateGalaxy()

// helper

const axesHelper = new THREE.AxesHelper( 5 );
scene.add( axesHelper );


/**
 * Animate
 */
const clock = new THREE.Clock()


const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()


    // update material

    material.uniforms.uTime.value = elapsedTime

    
    // Update controls
    controls.update(0.01)
     // calculate and display the vector values on screen
    // this copies the camera's unit vector direction to cameraDirection
    camera.getWorldDirection(cameraDirection)
    // scale the unit vector up to get a more intuitive value
    cameraDirection.set(cameraDirection.x * 100, cameraDirection.y * 100, cameraDirection.z * 100)
    // update the onscreen spans with the camera's position and lookAt vectors
    camPositionSpan.innerHTML = `Position: (${camera.position.x.toFixed(1)}, ${camera.position.y.toFixed(1)}, ${camera.position.z.toFixed(1)})`
    camLookAtSpan.innerHTML = `LookAt: (${(camera.position.x + cameraDirection.x).toFixed(1)}, ${(camera.position.y + cameraDirection.y).toFixed(1)}, ${(camera.position.z + cameraDirection.z).toFixed(1)})`
    
    
    // Update points

    points.rotation.x = elapsedTime*0.01
    points.rotation.y = elapsedTime*0.02

    
    // Update camera
    

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()

