import * as SUPER_THREE from 'super-three';
import { DRACOLoader } from 'super-three/examples/jsm/loaders/DRACOLoader.js';
import { GLTFLoader } from 'super-three/examples/jsm/loaders/GLTFLoader.js';
import { KTX2Loader } from 'super-three/examples/jsm/loaders/KTX2Loader.js';
import { OBB } from 'super-three/addons/math/OBB.js';
import { OBJLoader } from 'super-three/examples/jsm/loaders/OBJLoader.js';
import { MTLLoader } from 'super-three/examples/jsm/loaders/MTLLoader.js';
import * as BufferGeometryUtils from 'super-three/examples/jsm/utils/BufferGeometryUtils.js';
import { LightProbeGenerator } from 'super-three/examples/jsm/lights/LightProbeGenerator.js';

var THREE = window.THREE = { ...SUPER_THREE };
THREE.DRACOLoader = DRACOLoader;
THREE.GLTFLoader = GLTFLoader;
THREE.KTX2Loader = KTX2Loader;
THREE.OBJLoader = OBJLoader;
THREE.MTLLoader = MTLLoader;
THREE.OBB = OBB;
THREE.BufferGeometryUtils = BufferGeometryUtils;
THREE.LightProbeGenerator = LightProbeGenerator;

export default THREE;
