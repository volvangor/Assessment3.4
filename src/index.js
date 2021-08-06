import * as THREE from "three";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls.js";
import {GUI} from "three/examples/jsm/libs/dat.gui.module.js";


// Camera
const camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.01, 1000);
camera.position.y = 20;
camera.position.z = 20;
camera.position.x = -10;
camera.lookAt(0, 10, 0);

function updateCamera() {
    camera.updateProjectionMatrix();
}

// scene
const scene = new THREE.Scene();

// renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.update();

// Window resizing
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener("resize", onWindowResize, false);

// region GUI setup...
let menu_params = {
    sky_color: 0,
    ground_color: 0,
    floor_y: 0,
};

// noinspection JSUnusedGlobalSymbols
class ColorGUIHelper {
    constructor(object, prop) {
        this.object = object;
        this.prop = prop;
    }

    get value() {
        return `#${this.object[this.prop].getHexString()}`;
    }

    set value(hexString) {
        this.object[this.prop].set(hexString);
    }
}

const gui = new GUI();
const viewFolder = gui.addFolder("View");
viewFolder.add(camera, "fov", 30, 175).onChange(updateCamera);
viewFolder.addColor(new ColorGUIHelper(sphere.material, "color"), "value");
viewFolder.addColor(new ColorGUIHelper(sphere.material, "color"), "value");
viewFolder.open();

// endregion


const light = new THREE.HemisphereLight(0xffffbb, 0x080820, 1);
scene.add(light);


let radius = 4;
let pos = {x: 5, y: radius, z: 0};

let sphere = new THREE.Mesh(new THREE.SphereBufferGeometry(radius, 32, 32),
    new THREE.MeshPhongMaterial({color: 0x43a1f4, side: THREE.FrontSide}));
sphere.position.set(pos.x, pos.y, pos.z);
sphere.castShadow = true;
sphere.receiveShadow = true;
scene.add(sphere);

sphere.userData.draggable = true;
sphere.userData.name = "SPHERE";


const animate = function () {
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
};

animate();