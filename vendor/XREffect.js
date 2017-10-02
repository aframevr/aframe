/**
 * @author dmarcos / https://github.com/dmarcos
 * @author mrdoob / http://mrdoob.com
 *
 * WebVR Spec: http://mozvr.github.io/webvr-spec/webvr.html
 *
 * Firefox: http://mozvr.com/downloads/
 * Chromium: https://webvr.info/get-chrome
 *
 */

THREE.XREffect = function( renderer, onError ) {
    console.log('creating an XREffect on the renderer',renderer);

    var vrDisplay, vrDisplays;
    this.renderer = renderer;


    if(typeof navigator.XR === 'undefined'){
        console.log('No WebXR API found, usually because the WebXR polyfill has not loaded')
        return
    }

    this.showMessage = function(messageText){
        console.log("XREffect: ",messageText);
    };

    this._startSession = function(){
        console.log("starting a session");
        let sessionInitParamers = {
            exclusive: false,
            type: XRSession.AUGMENTATION
        };
        for(let display of this.displays){
            if(display.supportsSession(sessionInitParamers)){
                this.display = display;
                break;
            }
        }
        console.log("got the display", this.display);
        if(this.display === null){
            this.showMessage('Could not find a display for this type of session');
            return
        }
        this.display.requestSession(sessionInitParamers).then(session => {
            console.log("got the requested session",session);
            this.session = session;
            this.session.depthNear = 0.1;
            this.session.depthFar = 1000.0;

            // Handle session lifecycle events
            // this.session.addEventListener('focus', ev => { this.handleSessionFocus(ev) });
            // this.session.addEventListener('blur', ev => { this.handleSessionBlur(ev) });
            // this.session.addEventListener('end', ev => { this.handleSessionEnded(ev) });

            if(true){
                // VR Displays need startPresenting called due to input events like a click
                this.startPresenting()
            }
        }).catch(err => {
            console.error('Error requesting session', err)
            this.showMessage('Could not initiate the session')
        })
    };

    this.startPresenting = function() {
        this.showMessage("starting presenting");
        if (this.session === null) {
            this.showMessage('Can not start presenting without a session');
            throw new Error('Can not start presenting without a session');
        }
        console.log("nothing to do in start presenting");
        console.log("renderer = ",this.renderer);
        this.session.baseLayer = new XRWebGLLayer(this.session, this.renderer.context);
    };


    this.initXR = function() {
        // Get displays and then request a session
        navigator.XR.getDisplays().then(displays => {
            if(displays.length === 0) {
                this.showMessage('No displays are available');
                return
            }
            this.displays = displays;
            this._startSession();
        }).catch(err => {
            console.error('Error getting XR displays', err);
            this.showMessage('Could not get XR displays')
        })
    };

    this.initXR();

    this.getVRDisplay = function() {
        this.showMessage("get vr display called");
        return vrDisplay;
    };

    this.setVRDisplay = function( value ) {
        this.showMessage("get vr display called");
        vrDisplay = value;
    };

    this.getVRDisplays = function() {
        console.warn( 'THREE.VREffect: getVRDisplays() is being deprecated.' );
        return vrDisplays;
    };

    this.setSize = function( width, height, updateStyle ) {
        this.showMessage("set size is called");
        rendererSize = { width: width, height: height };
        rendererUpdateStyle = updateStyle;
        renderer.setPixelRatio( rendererPixelRatio );
        renderer.setSize( width, height, updateStyle );
    };

    this.requestAnimationFrame = function( f ) {
        return this.session.requestFrame(f);
    };

    this.render = function( scene, camera, renderTarget, forceClear, frameData ) {
        this.scene = scene;
        this.camera = camera;
        if(!frameData) {
            this.showMessage("no frame yet");
            return;
        }
        let stageCoordinateSystem = frameData.getCoordinateSystem(XRCoordinateSystem.STAGE);
        if(stageCoordinateSystem === null){
            this.showMessage('Could not get a usable stage coordinate system');
            return;
        }
        // Get the two poses we care about: the foot level stage and
        // the head pose which is updated by ARKit, ARCore, or orientation events
        // let stagePose = frameData.getViewPose(stageCoordinateSystem);
        let headPose = frameData.getViewPose(frameData.getCoordinateSystem(XRCoordinateSystem.HEAD_MODEL));


        // Prep THREE.js for the render of each XRView
        //this.renderer.resetGLState()
        this.scene.matrixAutoUpdate = false;
        this.renderer.autoClear = false;
        this.renderer.setSize(this.session.baseLayer.framebufferWidth, this.session.baseLayer.framebufferHeight, false);
        this.renderer.clear();

        // Render each view into this.session.baseLayer.context
        for(const view of frameData.views){
            // Each XRView has its own projection matrix, so set the camera to use that
            this.camera.projectionMatrix.fromArray(view.projectionMatrix)

            // Set the scene's view matrix using the head pose
            this.scene.matrix.fromArray(headPose.getViewMatrix(view))
            this.scene.updateMatrixWorld(true)

            // Set up the renderer to the XRView's viewport and then render
            this.renderer.clearDepth()
            const viewport = view.getViewport(this.session.baseLayer)
            this.renderer.setViewport(viewport.x, viewport.y, viewport.width, viewport.height)
            this.renderer.render(this.scene, this.camera)
        }

        //just delgate back to the standard renderer
        // renderer.render( scene, camera, renderTarget, forceClear );
    };
    this.submitFrame = function() {
        if ( vrDisplay !== undefined && scope.isPresenting ) {
            vrDisplay.submitFrame();
        }
    };

};
