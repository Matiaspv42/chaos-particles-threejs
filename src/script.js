import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'
import vertexAizawa from './shaders/vertexAizawa.glsl'
import fragmentAizawa from './shaders/fragmentAizawa.glsl'
import vertexPickover from './shaders/vertexPickover.glsl'
import fragmentPickover from './shaders/fragmentPickover.glsl'


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
let material2 = null

const generateGalaxy = () =>
{
    if(points !== null)
    {
        geometry.dispose()
        material.dispose()
        scene.remove(points)
    }
  // // Lorenz
    // let lorenzPoints = [Math.random(),Math.random(),Math.random()]
    // let iterations = 1000000
    // let step = 0.022
    // let a = 10
    // let b = 28
    // let c = 8/3

    // for(let i = 0; i<(iterations/3) ;i++){
    //     const i3 = i*3

    //     // Current position
    //     let x = lorenzPoints[i3]
    //     let y = lorenzPoints[i3+1]
    //     let z = lorenzPoints[i3+2]

    //     // Increments calculation
    //     var dx = (a * (y - x))   * step;
    //     var dy = (x * (b-z) - y) * step;
    //     var dz = (x*y - (c*z))   * step;

    //     // new position

    //     lorenzPoints.push( dx + x, dy + y, dz + z)

    // }

    // aizawa
    let aizawaPoints = [0.1,0.0,0.0]
    let iterations = 1000000
    let step = 0.01
    let a = 0.95
    let b = 0.7
    let c = 0.6
    let d = 3.5
    let e = 0.25
    let f = 0.1

    for(let i = 0; i<(iterations/3) ;i++){
        const i3 = i*3

        // Current position
        let x = aizawaPoints[i3]
        let y = aizawaPoints[i3+1]
        let z = aizawaPoints[i3+2]

        // Increments calculation
        var dx = ((z-b)*x - (d*y))   * step;
        var dy = ((d*x) + (z-b)*y) * step;
        var dz = (c + (a*z) - ((z*z*z)/3)-(x*x + y*y)*(1 + e*z) + f*z*x*x*x)   * step;

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
    a = 1.4


    for(let i = 0; i<(iterations/3) ;i++){
        const i3 = i*3

        // Current position
        let x = halvorsenPoints[i3]
        let y = halvorsenPoints[i3+1]
        let z = halvorsenPoints[i3+2]

        // Increments calculation
        var dx = (-a*x -4*y - 4*z - y*y)   * step;
        var dy = (-a*y - 4*z -4*x - z*z) * step;
        var dz = (-a*z-4*x-4*y-x*x)   * step;

        // new position

        halvorsenPoints.push( dx + x, dy + y, dz + z)

    }
    
    // Geometry Halsorven

    const positionsHalsorven = new Float32Array(iterations)
    const geometryHalsorven = new THREE.BufferGeometry()

    

    for(let i = 0 ; i<(iterations);i++){
        positionsHalsorven[i] = halvorsenPoints[i]
    }
    
    // Pickover Attractor

    let pointsPickover =[1,1,0]
    let constantsPickover = {
        a:-1.4,
        b:1.6,
        c:1.0,
        d:0.7
    }

    for(let i = 0; i<(iterations/3) ;i++){
        const i3 = i*3

        // Current position
        let x_old = pointsPickover[i3]
        let y_old = pointsPickover[i3+1]
        let z_old = pointsPickover[i3+2]

        // Increments calculation
        var x_new = (Math.sin(constantsPickover.a * y_old) + c*Math.cos(a*x_old));
        var y_new = (Math.sin(constantsPickover.b * x_old) + d *Math.cos(constantsPickover.b * y_old));
        // var z_new = (x_old*Math.sin(constantsPickover.a));
        var z_new = z_old

        // new position

        pointsPickover.push(x_new,y_new,z_new)

    }

    const positionsPickover = new Float32Array(iterations)
    const geometryPickover = new THREE.BufferGeometry()

    

    for(let i = 0 ; i<(iterations);i++){
        positionsPickover[i] = pointsPickover[i]
    }

    geometryPickover.setAttribute('position', new THREE.BufferAttribute(positionsPickover,3))

    // Roessler
    // for(let i = 0; i<(iterations/3) ;i++){
    //     const i3 = i*3

    //     // Current position
    //     let x = pointsPickover[i3]
    //     let y = pointsPickover[i3+1]
    //     let z = pointsPickover[i3+2]

    //     // Increments calculation
    //     var dx = -(y+z) * step
    //     var dy = (x+ a *y)*step;
    //     var dz = (b + z*(x-c));

    //     // new position

    //     pointsPickover.push(dx,dy,dz)

    // }
    
    // Add positions
    geometryHalsorven.setAttribute('position', new THREE.BufferAttribute(positionsHalsorven,3))
    geometryHalsorven.setAttribute('positionAizawa', new THREE.BufferAttribute(positionsAizawa,3))
    geometryAizawa.setAttribute('position', new THREE.BufferAttribute(positionsAizawa,3))


    // Material
    material = new THREE.ShaderMaterial({
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexShader: vertexAizawa ,
        fragmentShader: fragmentAizawa,
        uniforms:{
            uTime:{value : 0},
            uSize:{value: 30 * renderer.getPixelRatio()},
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

    points = new THREE.Points(geometryPickover, material2)
    scene.add(points)

   

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
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 4.22
camera.position.y = 10.5
camera.position.z = 8.1







gui.add(parameters, 'positionCameraX').min(-30).max(30).step(0.1).onChange(value => camera.position.x = value)
gui.add(parameters, 'positionCameraY').min(-30).max(30).step(0.1).onChange(value => camera.position.y = value)
gui.add(parameters, 'positionCameraZ').min(-30).max(30).step(0.1).onChange(value => camera.position.z = value)



// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true
let cameraDirection = new THREE.Vector3()
controls.addEventListener( "change", event => {  
    camera.lookAt(points.position)
    console.log('Position', controls.object.position ); 
    console.log('Looking at',    camera.getWorldDirection(cameraDirection))
    console.log('Angle', camera.rotation)
} )


/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

// generate galaxy

generateGalaxy()

// helper

const axesHelper = new THREE.AxesHelper( 5 );
scene.add( axesHelper );

scene.add(camera)
/**
 * Animate
 */
const clock = new THREE.Clock()


const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // update material

    // material.uniforms.uTime.value = elapsedTime

    // // update camera
    // camera.position.x = Math.sin(elapsedTime * 0.2)*0.2  
    // camera.position.z = Math.cos(elapsedTime* 0.2)*0.3  
    
    // camera.lookAt(points.position)
    
    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()

