/**
 * @author dmarcos / https://github.com/dmarcos
 * @author mrdoob / http://mrdoob.com
 */

THREE.XRControls = function ( object, onError ) {
    'use strict';
    console.log("creating XRControls on object");

    // var scope = this;

    var vrDisplay, vrDisplays;

    var standingMatrix = new THREE.Matrix4();

    var frameData = null;

    if ( 'VRFrameData' in window ) {

        frameData = new window.VRFrameData();

    }

    this.scale = 1;

    this.standing = false;

    this.userHeight = 1.6;
    this.update = function (frameData) {
        let stageCoordinateSystem = frameData.getCoordinateSystem(XRCoordinateSystem.STAGE);
        if(stageCoordinateSystem === null){
            console.log('Could not get a usable stage coordinate system');
            return;
        }
        // Get the two poses we care about: the foot level stage and
        // the head pose which is updated by ARKit, ARCore, or orientation events
        let headPose = frameData.getViewPose(frameData.getCoordinateSystem(XRCoordinateSystem.HEAD_MODEL))
        object.quaternion.fromArray( headPose._orientation );
        object.position.fromArray( headPose._position );
    };

    this.resetPose = function () {
        if ( vrDisplay ) {
            vrDisplay.resetPose();
        }
    };

    this.resetSensor = function () {
        console.warn( 'THREE.VRControls: .resetSensor() is now .resetPose().' );
        this.resetPose();
    };

    this.zeroSensor = function () {

        console.warn( 'THREE.VRControls: .zeroSensor() is now .resetPose().' );
        this.resetPose();

    };

    this.dispose = function () {

        vrDisplay = null;

    };

};
