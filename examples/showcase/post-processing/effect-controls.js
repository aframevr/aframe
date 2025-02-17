import AFRAME from 'aframe';
AFRAME.registerComponent('effect-controls', {
    schema: {
        hand: { type: 'string', default: 'left' }
    },

    events: {
        pinchstarted: function () {
            this.toggleEffect();
        },
        buttondown: function () {
            this.toggleEffect();
        }
    },

    init: function () {
        // initialize control variable
        this.effectOn = true;

        // set the proper controller on the specified hand
        this.el.setAttribute('meta-touch-controls', {
            hand: this.data.hand
        });
        this.el.setAttribute('hand-tracking-controls', {
            hand: this.data.hand
        });
    },

    toggleEffect: function () {
        // get the scene
        var scene = this.el.sceneEl;

        // toggle the effect
        if (this.effectOn) {
            scene.setAttribute('bloom', {
                enabled: false
            });
        } else {
            scene.setAttribute('bloom', {
                enabled: true
            });
        }

        // set the control variable
        this.effectOn = !this.effectOn;
    }
});
