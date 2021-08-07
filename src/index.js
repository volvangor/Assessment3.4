import * as THREE from "three";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls.js";
import {GUI} from "three/examples/jsm/libs/dat.gui.module.js";


const _VS = `
varying vec3 vNormal;
varying vec3 cameraVector;
varying vec3 vPosition;
varying vec2 vUv;

void main() {
    vNormal = normal;
    vec4 vPosition4 = modelMatrix * vec4(position, 1.0);
    vPosition = vPosition4.xyz;
    cameraVector = cameraPosition - vPosition;
    vUv = uv;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const _FS = `
uniform vec3 pointLightPosition;
uniform vec3 shaderColour;
uniform float shaderStrength;

varying vec3 vNormal;
varying vec3 vPosition;
varying vec3 cameraVector;
varying vec2 vUv;

void main() {
    float PI = 3.14159265358979323846264;
    vec3 light = pointLightPosition - vPosition;
    vec3 cameraDir = normalize(cameraVector);
    
    light = normalize(light);
    
    float lightAngle = max(0.0, dot(vNormal, light));
    lightAngle = 1.0;
    float viewAngle = max(0.0, dot(vNormal, cameraDir));
    float adjustedLightAngle = min(0.6, lightAngle) / 0.6;
    float adjustedViewAngle = min(0.65, viewAngle) / 0.65;
    float invertedViewAngle = pow(acos(viewAngle), 3.0) * 0.4;
    
    float dProd = 0.0;
    dProd += 0.5 * lightAngle;
    dProd += 0.2 * lightAngle * (invertedViewAngle - 0.1);
    dProd += invertedViewAngle * 0.5 * (max(-0.35, dot(vNormal, light)) + 0.35);
    dProd *= shaderStrength + pow(invertedViewAngle/(PI/2.0), 2.0);
    
    dProd *= 0.5;
    vec4 atmColor = vec4(shaderColour, dProd);
    gl_FragColor = min(atmColor, 1.0);
}
`;


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

// Lighting
const light = new THREE.HemisphereLight(0x8bb9dd, 0x9b7653, 0.25);
scene.add(light);

const pointLight = new THREE.PointLight(0xffffff, 1, 200);
scene.add(pointLight);
pointLight.position.set(40, 60, 40);
const pointLightHelper = new THREE.PointLightHelper(pointLight, 5, 0x00ff00);
scene.add(pointLightHelper);

// Objects
let s1_radius = 4;
let s1_pos = {x: 5, y: s1_radius, z: 0};
let s1 = new THREE.Mesh(
    new THREE.SphereBufferGeometry(s1_radius, 32, 32),
    new THREE.MeshStandardMaterial({color: 0x43a1f4, side: THREE.FrontSide}));
s1.position.set(s1_pos.x, s1_pos.y, s1_pos.z);
s1.castShadow = true;
s1.receiveShadow = true;
scene.add(s1);

let s2_radius = 4;
let s2_pos = {x: -5, y: s2_radius, z: 0};
let s2 = new THREE.Mesh(
    new THREE.SphereBufferGeometry(s2_radius, 32, 32),
    new THREE.ShaderMaterial({
        side: THREE.FrontSide,
        transparent: true,
        uniforms: {
            "pointLightPosition": {"type": "v3", "value": pointLight.position},
            "shaderColour": {"type": "v3", "value": s1.material.color},
            "shaderStrength": {"value": 0.3}
        },
        vertexShader: _VS,
        fragmentShader: _FS
    })
);

s2.position.set(s2_pos.x, s2_pos.y, s2_pos.z);
s2.castShadow = true;
s2.receiveShadow = true;
scene.add(s2);

// region GUI setup...
let menu_params = {
    light_x_pos: pointLight.position.x,
    light_y_pos: pointLight.position.y,
    light_z_pos: pointLight.position.z,
    shader_strength: s2.material.uniforms.shaderStrength.value
};

function updateLight() {
    pointLight.position.set(menu_params.light_x_pos, menu_params.light_y_pos, menu_params.light_z_pos);
}

function updateShader() {
    s2.material.uniforms.shaderStrength.value = menu_params.shader_strength;
}

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
viewFolder.add(menu_params, "light_x_pos", -100, 100).onChange(updateLight);
viewFolder.add(menu_params, "light_y_pos", -100, 100).onChange(updateLight);
viewFolder.add(menu_params, "light_z_pos", -100, 100).onChange(updateLight);
viewFolder.add(menu_params, "shader_strength", -1.0, 4.0).onChange(updateShader);
viewFolder.addColor(new ColorGUIHelper(s1.material, "color"), "value");
// viewFolder.addColor(s2.material.uniforms.shaderColour, "value");

viewFolder.open();

// endregion


const animate = function () {
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
};

animate();