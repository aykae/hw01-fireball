import {vec3, vec4} from 'gl-matrix';
const Stats = require('stats-js');
import * as DAT from 'dat.gui';
import Icosphere from './geometry/Icosphere';
import OpenGLRenderer from './rendering/gl/OpenGLRenderer';
import Camera from './Camera';
import {setGL} from './globals';
import ShaderProgram, {Shader} from './rendering/gl/ShaderProgram';

// Define an object with application parameters and button callbacks
// This will be referred to by dat.GUI's functions that add GUI elements.

let icosphere: Icosphere;
let prevTesselations: number = 5;
let initTesselations: number = 4;
let colorVec: vec4;
let colors:string[] = ["Original", "Cool Blue", "Emerald Green"];
let selectedColor:string = "Original";
let intensity:number = 5.0;

const colorDict = new Map();
colorDict.set("Original", [1., 120./255., 80./255., 1.]);
colorDict.set("Cool Blue", [1., 120./255., 80./255., 1.]);
colorDict.set("Emerald Green", [1., 120./255., 80./255., 1.]);

var color = colorDict.get("Original");

const controls = {
  'Color': selectedColor, //PLACEHOLDER
  'Flame Intensity': intensity,
  'Reset': resetScene //PLACEHOLDER
};

function loadScene() {
  icosphere = new Icosphere(vec3.fromValues(0, 0, 0), 1, initTesselations);
  icosphere.create();
}

function resetScene() {
  icosphere = new Icosphere(vec3.fromValues(0, 0, 0), 1, initTesselations);
  icosphere.create();
  selectedColor = "Original";
  intensity = 5.0;
  console.log("Reset Scene");
}

function main() {
  // Initial display for framerate
  const stats = Stats();
  stats.setMode(0);
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.left = '0px';
  stats.domElement.style.top = '0px';
  document.body.appendChild(stats.domElement);

  // Add controls to the gui
  const gui = new DAT.GUI();
  //gui.add(controls, 'tesselations', 0, 8).step(1);

  gui.add({ Color: selectedColor }, "Color", colors);

  gui.add(controls, 'Flame Intensity', 0, 10).step(0.1);
  gui.add(controls, 'Reset');

  gui.__controllers[0].onChange(function (value) {
    color = colorDict.get(value);
    console.log("Selected option: " + value);
  });

  // get canvas and webgl context
  const canvas = <HTMLCanvasElement> document.getElementById('canvas');
  const gl = <WebGL2RenderingContext> canvas.getContext('webgl2');
  if (!gl) {
    alert('WebGL 2 not supported!');
  }
  // `setGL` is a function imported above which sets the value of `gl` in the `globals.ts` module.
  // Later, we can import `gl` from `globals.ts` to access it
  setGL(gl);

  // Initial call to load scene
  loadScene();

  const camera = new Camera(vec3.fromValues(0, 0, 5), vec3.fromValues(0, 0, 0));
  //AKR
  //const d = new Date();
  let t = 0.0;

  const renderer = new OpenGLRenderer(canvas);

  // Background Color
  renderer.setClearColor(0.05, 0.05, 0.05, 1);

  gl.enable(gl.DEPTH_TEST);

  let fbm = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/fire-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/fire-frag.glsl')),
  ]);

  // This function will be called every frame
  function tick() {
    camera.update();
    stats.begin();
    gl.viewport(0, 0, window.innerWidth, window.innerHeight);
    renderer.clear();

    renderer.render(camera, fbm, [
      icosphere
    ]);

    fbm.setTime(t);
    t = t + 1.0;

    stats.end();

    // Tell the browser to call `tick` again whenever it renders a new frame
    requestAnimationFrame(tick);
  }

  window.addEventListener('resize', function() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.setAspectRatio(window.innerWidth / window.innerHeight);
    camera.updateProjectionMatrix();
  }, false);

  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.setAspectRatio(window.innerWidth / window.innerHeight);
  camera.updateProjectionMatrix();

  // Start the render loop
  tick();
}

main();
