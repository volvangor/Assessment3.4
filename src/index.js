import * as THREE from "three";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls.js";
import {GUI} from "three/examples/jsm/libs/dat.gui.module.js";

function rand_normal() {
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

function getPoint() {
    let u = Math.random() * 100000000000;
    let x1 = rand_normal();
    let x2 = rand_normal();
    let x3 = rand_normal();

    let mag = Math.sqrt(x1 * x1 + x2 * x2 + x3 * x3);
    x1 /= mag;
    x2 /= mag;
    x3 /= mag;

    // Math.cbrt is cube root
    let c = Math.cbrt(u);

    return {x: x1 * c, y: x2 * c, z: x3 * c};
}

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

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.01, 1000000);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
const controls = new OrbitControls(camera, renderer.domElement);
camera.position.z = 50;
controls.update();

window.addEventListener("resize", onWindowResize, false);

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

const vertices = [];
for (let i = 0; i < 50000; i++) {
    const coord = getPoint();
    vertices.push(coord.x, coord.y, coord.z);
}

const geometry = new THREE.BufferGeometry();
geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
const material = new THREE.PointsMaterial({color: "#FFF8E7"});
material.size = 5;
const points = new THREE.Points(geometry, material);
scene.add(points);


let menu_params = {
    rotation_rate_x: 0.00001,
    rotation_rate_y: 0.00001,
    rotation_rate_z: 0,
    cam_focal: camera.getFocalLength()
};

function updateCamera() {
    camera.updateProjectionMatrix();
}

const gui = new GUI();
const pointsFolder = gui.addFolder("Points");
pointsFolder.add(points.material, "size", 0.001, 10);
pointsFolder.addColor(new ColorGUIHelper(material, "color"), "value");
pointsFolder.add(points.position, "x", -5000, 5000);
pointsFolder.add(points.position, "y", -5000, 5000);
pointsFolder.add(points.position, "z", -5000, 5000);
pointsFolder.open();
const viewFolder = gui.addFolder("View");
viewFolder.add(camera, "fov", 30, 175).onChange(updateCamera);
viewFolder.add(menu_params, "rotation_rate_x", 0, 0.001);
viewFolder.add(menu_params, "rotation_rate_y", 0, 0.001);
viewFolder.add(menu_params, "rotation_rate_z", 0, 0.001);
viewFolder.open();


const animate = function () {
    requestAnimationFrame(animate);
    points.rotation.x += menu_params.rotation_rate_x;
    points.rotation.y += menu_params.rotation_rate_y;
    points.rotation.z += menu_params.rotation_rate_z;
    //console.log(camera.position)

    controls.update();
    renderer.render(scene, camera);
};

animate();