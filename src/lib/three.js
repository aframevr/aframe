import * as SUPER_THREE from 'three';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { KTX2Loader } from 'three/addons/loaders/KTX2Loader.js';
import { OBB } from 'three/addons/math/OBB.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';
import { LightProbeGenerator } from 'three/addons/lights/LightProbeGenerator.js';
import { DeviceOrientationControls } from '../../vendor/DeviceOrientationControls.js'; // THREE.DeviceOrientationControls

var THREE = globalThis.THREE = {...SUPER_THREE};

// TODO: Eventually include these only if they are needed by a component.
THREE.DRACOLoader = DRACOLoader;
THREE.GLTFLoader = GLTFLoader;
THREE.KTX2Loader = KTX2Loader;
THREE.OBJLoader = OBJLoader;
THREE.MTLLoader = MTLLoader;
THREE.OBB = OBB;
THREE.BufferGeometryUtils = BufferGeometryUtils;
THREE.LightProbeGenerator = LightProbeGenerator;
THREE.DeviceOrientationControls = DeviceOrientationControls;

THREE.Cache.enabled = true;

export default THREE;
