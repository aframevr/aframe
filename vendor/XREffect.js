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
    var eyeTranslationL = new THREE.Vector3();
    var eyeTranslationR = new THREE.Vector3();
    var renderRectL, renderRectR;
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
            this.session.addEventListener('focus', ev => { this.handleSessionFocus(ev) });
            this.session.addEventListener('blur', ev => { this.handleSessionBlur(ev) });
            this.session.addEventListener('end', ev => { this.handleSessionEnded(ev) });

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

    }


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
    }
    this.initXR();

    // var frameData = null;
    //
    // if ( 'VRFrameData' in window ) {
    //
    //     frameData = new window.VRFrameData();
    //
    // }

    // window.addEventListener('vrdisplayconnect', function (evt) { vrDisplay = evt.display; });
    // window.addEventListener('vrdisplaydisconnect', function (evt) {
    //     var f;

        // scope.exitPresent();
        // Cancels current request animation frame.
        // f = scope.cancelAnimationFrame();
        // vrDisplay = undefined;
        // Resumes the request animation frame.
        // scope.requestAnimationFrame(f);
    // });

    /*
    function gotVRDisplays( displays ) {

        vrDisplays = displays;

        if ( displays.length > 0 ) {

            vrDisplay = displays[ 0 ];

        } else {

            if ( onError ) onError( 'HMD not available' );

        }

    }

    if ( navigator.getVRDisplays ) {

        navigator.getVRDisplays().then( gotVRDisplays ).catch( function() {

            console.warn( 'THREE.VREffect: Unable to get VR Displays' );

        } );

    }
    */

    //

    // this.isPresenting = false;

    // var scope = this;

    // var rendererSize = renderer.getSize();
    // var rendererUpdateStyle = false;
    // var rendererPixelRatio = renderer.getPixelRatio();

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

        // if ( scope.isPresenting ) {
        //
        //     var eyeParamsL = vrDisplay.getEyeParameters( 'left' );
        //     renderer.setPixelRatio( 1 );
        //     renderer.setSize( eyeParamsL.renderWidth * 2, eyeParamsL.renderHeight, false );
        //
        // } else {
            renderer.setPixelRatio( rendererPixelRatio );
            renderer.setSize( width, height, updateStyle );
        // }
    //
    };


    this.requestAnimationFrame = function( f ) {
        this.xrFrame = f;
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
            // this.session.cancelFrame(nextFrameRequest);
            // this.session.endSession();
            // Production apps could render a 'waiting' message and keep checking for an acceptable coordinate system
            return;
        }
        // Get the two poses we care about: the foot level stage and head pose which is updated by ARKit, ARCore, or orientation events
        let stagePose = frameData.getViewPose(stageCoordinateSystem);
        let headPose = frameData.getViewPose(frameData.getCoordinateSystem(XRCoordinateSystem.HEAD_MODEL));
        // this.showMessage("got a head pose");


        // Prep THREE.js for the render of each XRView
        //this.renderer.resetGLState()
        this.scene.matrixAutoUpdate = false;
        this.renderer.autoClear = false;
        this.renderer.setSize(this.session.baseLayer.framebufferWidth, this.session.baseLayer.framebufferHeight, false);
        this.renderer.clear();

        //this.session.baseLayer.context.bindFramebuffer(this.session.baseLayer.context.FRAMEBUFFER, this.session.baseLayer.framebuffer)

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


        // VR presentation

    /*
    var canvas = renderer.domElement;
    var defaultLeftBounds = [ 0.0, 0.0, 0.5, 1.0 ];
    var defaultRightBounds = [ 0.5, 0.0, 0.5, 1.0 ];

    function onVRDisplayPresentChange() {

        var wasPresenting = scope.isPresenting;
        scope.isPresenting = vrDisplay !== undefined && vrDisplay.isPresenting;

        if ( scope.isPresenting ) {

            var eyeParamsL = vrDisplay.getEyeParameters( 'left' );
            var eyeWidth = eyeParamsL.renderWidth;
            var eyeHeight = eyeParamsL.renderHeight;

            if ( ! wasPresenting ) {

                rendererPixelRatio = renderer.getPixelRatio();
                rendererSize = renderer.getSize();

                renderer.setPixelRatio( 1 );
                renderer.setSize( eyeWidth * 2, eyeHeight, false );

            }

        } else if ( wasPresenting ) {

            renderer.setPixelRatio( rendererPixelRatio );
            renderer.setSize( rendererSize.width, rendererSize.height, rendererUpdateStyle );

        }

    }

    window.addEventListener( 'vrdisplaypresentchange', onVRDisplayPresentChange, false );

    this.setFullScreen = function( boolean ) {

        return new Promise( function( resolve, reject ) {

            if ( vrDisplay === undefined ) {

                reject( new Error( 'No VR hardware found.' ) );
                return;

            }

            if ( scope.isPresenting === boolean ) {

                resolve();
                return;

            }

            if ( boolean ) {

                resolve( vrDisplay.requestPresent( [ { source: canvas } ] ) );

            } else {

                resolve( vrDisplay.exitPresent() );

            }

        } );

    };

    this.requestPresent = function() {

        return this.setFullScreen( true );

    };

    this.exitPresent = function() {

        return this.setFullScreen( false );

    };

    this.requestAnimationFrame = function( f ) {

        var f = scope.f = f || scope.f;

        if (!f) { return; }

        if ( vrDisplay !== undefined ) {
            return vrDisplay.requestAnimationFrame( f );
        } else {

            return window.requestAnimationFrame( f );

        }

    };

    this.cancelAnimationFrame = function( h ) {

        var f = scope.f;

        scope.f = undefined;

        if ( vrDisplay !== undefined ) {

            vrDisplay.cancelAnimationFrame( h );

        } else {

            window.cancelAnimationFrame( h );

        }

        return f;
    };

    this.submitFrame = function() {

        if ( vrDisplay !== undefined && scope.isPresenting ) {

            vrDisplay.submitFrame();

        }

    };

    this.autoSubmitFrame = true;

    // render

    var cameraL = new THREE.PerspectiveCamera();
    cameraL.layers.enable( 1 );

    var cameraR = new THREE.PerspectiveCamera();
    cameraR.layers.enable( 2 );

    this.render = function( scene, camera, renderTarget, forceClear ) {
        console.log("render called");

        if ( vrDisplay && scope.isPresenting ) {

            var autoUpdate = scene.autoUpdate;

            if ( autoUpdate ) {

                scene.updateMatrixWorld();
                scene.autoUpdate = false;

            }

            var eyeParamsL = vrDisplay.getEyeParameters( 'left' );
            var eyeParamsR = vrDisplay.getEyeParameters( 'right' );

            eyeTranslationL.fromArray( eyeParamsL.offset );
            eyeTranslationR.fromArray( eyeParamsR.offset );

            if ( Array.isArray( scene ) ) {

                console.warn( 'THREE.VREffect.render() no longer supports arrays. Use object.layers instead.' );
                scene = scene[ 0 ];

            }

            // When rendering we don't care what the recommended size is, only what the actual size
            // of the backbuffer is.
            var size = renderer.getSize();
            var layers = vrDisplay.getLayers();
            var leftBounds;
            var rightBounds;

            if ( layers.length ) {

                var layer = layers[ 0 ];

                leftBounds = layer.leftBounds !== null && layer.leftBounds.length === 4 ? layer.leftBounds : defaultLeftBounds;
                rightBounds = layer.rightBounds !== null && layer.rightBounds.length === 4 ? layer.rightBounds : defaultRightBounds;

            } else {

                leftBounds = defaultLeftBounds;
                rightBounds = defaultRightBounds;

            }

            renderRectL = {
                x: Math.round( size.width * leftBounds[ 0 ] ),
                y: Math.round( size.height * leftBounds[ 1 ] ),
                width: Math.round( size.width * leftBounds[ 2 ] ),
                height: Math.round( size.height * leftBounds[ 3 ] )
            };
            renderRectR = {
                x: Math.round( size.width * rightBounds[ 0 ] ),
                y: Math.round( size.height * rightBounds[ 1 ] ),
                width: Math.round( size.width * rightBounds[ 2 ] ),
                height: Math.round( size.height * rightBounds[ 3 ] )
            };

            if ( renderTarget ) {

                renderer.setRenderTarget( renderTarget );
                renderTarget.scissorTest = true;

            } else {

                renderer.setRenderTarget( null );
                renderer.setScissorTest( true );

            }

            if ( renderer.autoClear || forceClear ) renderer.clear();

            if ( camera.parent === null ) camera.updateMatrixWorld();

            camera.matrixWorld.decompose( cameraL.position, cameraL.quaternion, cameraL.scale );

            cameraR.position.copy(cameraL.position);
            cameraR.quaternion.copy(cameraL.quaternion);
            cameraR.scale.copy(cameraL.scale);

            cameraL.translateOnAxis( eyeTranslationL, cameraL.scale.x );
            cameraR.translateOnAxis( eyeTranslationR, cameraR.scale.x );

            if ( vrDisplay.getFrameData ) {

                vrDisplay.depthNear = camera.near;
                vrDisplay.depthFar = camera.far;

                vrDisplay.getFrameData( frameData );

                cameraL.projectionMatrix.elements = frameData.leftProjectionMatrix;
                cameraR.projectionMatrix.elements = frameData.rightProjectionMatrix;

            } else {

                cameraL.projectionMatrix = fovToProjection( eyeParamsL.fieldOfView, true, camera.near, camera.far );
                cameraR.projectionMatrix = fovToProjection( eyeParamsR.fieldOfView, true, camera.near, camera.far );

            }

            // render left eye
            if ( renderTarget ) {

                renderTarget.viewport.set( renderRectL.x, renderRectL.y, renderRectL.width, renderRectL.height );
                renderTarget.scissor.set( renderRectL.x, renderRectL.y, renderRectL.width, renderRectL.height );

            } else {

                renderer.setViewport( renderRectL.x, renderRectL.y, renderRectL.width, renderRectL.height );
                renderer.setScissor( renderRectL.x, renderRectL.y, renderRectL.width, renderRectL.height );

            }
            renderer.render( scene, cameraL, renderTarget, forceClear );

            // render right eye
            if ( renderTarget ) {

                renderTarget.viewport.set( renderRectR.x, renderRectR.y, renderRectR.width, renderRectR.height );
                renderTarget.scissor.set( renderRectR.x, renderRectR.y, renderRectR.width, renderRectR.height );

            } else {

                renderer.setViewport( renderRectR.x, renderRectR.y, renderRectR.width, renderRectR.height );
                renderer.setScissor( renderRectR.x, renderRectR.y, renderRectR.width, renderRectR.height );

            }
            renderer.render( scene, cameraR, renderTarget, forceClear );

            if ( renderTarget ) {

                renderTarget.viewport.set( 0, 0, size.width, size.height );
                renderTarget.scissor.set( 0, 0, size.width, size.height );
                renderTarget.scissorTest = false;
                renderer.setRenderTarget( null );

            } else {

                renderer.setViewport( 0, 0, size.width, size.height );
                renderer.setScissorTest( false );

            }

            if ( autoUpdate ) {

                scene.autoUpdate = true;

            }

            if ( scope.autoSubmitFrame ) {

                scope.submitFrame();

            }

            return;

        }

        // Regular render mode if not HMD


        if ()

        renderer.render( scene, camera, renderTarget, forceClear );

    };

    this.dispose = function() {

        window.removeEventListener( 'vrdisplaypresentchange', onVRDisplayPresentChange, false );

    };

    //

    function fovToNDCScaleOffset( fov ) {

        var pxscale = 2.0 / ( fov.leftTan + fov.rightTan );
        var pxoffset = ( fov.leftTan - fov.rightTan ) * pxscale * 0.5;
        var pyscale = 2.0 / ( fov.upTan + fov.downTan );
        var pyoffset = ( fov.upTan - fov.downTan ) * pyscale * 0.5;
        return { scale: [ pxscale, pyscale ], offset: [ pxoffset, pyoffset ] };

    }

    function fovPortToProjection( fov, rightHanded, zNear, zFar ) {

        rightHanded = rightHanded === undefined ? true : rightHanded;
        zNear = zNear === undefined ? 0.01 : zNear;
        zFar = zFar === undefined ? 10000.0 : zFar;

        var handednessScale = rightHanded ? - 1.0 : 1.0;

        // start with an identity matrix
        var mobj = new THREE.Matrix4();
        var m = mobj.elements;

        // and with scale/offset info for normalized device coords
        var scaleAndOffset = fovToNDCScaleOffset( fov );

        // X result, map clip edges to [-w,+w]
        m[ 0 * 4 + 0 ] = scaleAndOffset.scale[ 0 ];
        m[ 0 * 4 + 1 ] = 0.0;
        m[ 0 * 4 + 2 ] = scaleAndOffset.offset[ 0 ] * handednessScale;
        m[ 0 * 4 + 3 ] = 0.0;

        // Y result, map clip edges to [-w,+w]
        // Y offset is negated because this proj matrix transforms from world coords with Y=up,
        // but the NDC scaling has Y=down (thanks D3D?)
        m[ 1 * 4 + 0 ] = 0.0;
        m[ 1 * 4 + 1 ] = scaleAndOffset.scale[ 1 ];
        m[ 1 * 4 + 2 ] = - scaleAndOffset.offset[ 1 ] * handednessScale;
        m[ 1 * 4 + 3 ] = 0.0;

        // Z result (up to the app)
        m[ 2 * 4 + 0 ] = 0.0;
        m[ 2 * 4 + 1 ] = 0.0;
        m[ 2 * 4 + 2 ] = zFar / ( zNear - zFar ) * - handednessScale;
        m[ 2 * 4 + 3 ] = ( zFar * zNear ) / ( zNear - zFar );

        // W result (= Z in)
        m[ 3 * 4 + 0 ] = 0.0;
        m[ 3 * 4 + 1 ] = 0.0;
        m[ 3 * 4 + 2 ] = handednessScale;
        m[ 3 * 4 + 3 ] = 0.0;

        mobj.transpose();
        return mobj;

    }

    function fovToProjection( fov, rightHanded, zNear, zFar ) {

        var DEG2RAD = Math.PI / 180.0;

        var fovPort = {
            upTan: Math.tan( fov.upDegrees * DEG2RAD ),
            downTan: Math.tan( fov.downDegrees * DEG2RAD ),
            leftTan: Math.tan( fov.leftDegrees * DEG2RAD ),
            rightTan: Math.tan( fov.rightDegrees * DEG2RAD )
        };

        return fovPortToProjection( fovPort, rightHanded, zNear, zFar );

    }
    */
};
