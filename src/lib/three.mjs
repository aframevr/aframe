import * as SUPER_THREE from 'three';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader.js';
import { OBB } from 'three/addons/math/OBB.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { LightProbeGenerator } from 'three/examples/jsm/lights/LightProbeGenerator.js';

var THREE = { ...SUPER_THREE };
THREE.DRACOLoader = DRACOLoader;
THREE.GLTFLoader = GLTFLoader;
THREE.KTX2Loader = KTX2Loader;
THREE.OBJLoader = OBJLoader;
THREE.MTLLoader = MTLLoader;
THREE.OBB = OBB;
THREE.BufferGeometryUtils = BufferGeometryUtils;
THREE.LightProbeGenerator = LightProbeGenerator;

export default THREE;
