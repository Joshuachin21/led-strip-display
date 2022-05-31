const ws281x = require('rpi-ws281x');
const Gpio = require('onoff').Gpio;
let buttonLeft;
let buttonRight;
let buttonCenter;
let buttonRunUp;
let buttonRunDown;

let jackpotInterval;
let fillInterval;
let bounceInterval;
let runUpInterval;
let runDownInterval;

class Example {

    constructor() {
        // Current pixel position
        this.offset = 0;
        this.directionUp = true;
        this.stored = 150;
        this.jackpot = false;
        this.allOn = false;
        // Set my Neopixel configuration
        this.config = {leds: 150};
        this.config.stripType = 'grb';
        // Configure ws281x
        ws281x.configure(this.config);

    }

    init() {
        console.log('init')
        this.configureButtons()
        process.on('SIGINT', _ => {
            if (buttonLeft) {
                buttonLeft.unexport();
            }
            if (buttonRight) {
                buttonRight.unexport();
            }
            if (buttonCenter) {
                buttonCenter.unexport();
            }
            if (runUpInterval) {
                runUpInterval.unexport();
            }
            if (runDownInterval) {
                runDownInterval.unexport();
            }
        });
    }

    configureButtons() {
        console.log('configure buttons')
       this.configureLeftButton()
        this.configureRightButton()
        this.configureCenterButton()
    }

    clearAll() {
        console.log('clearAll')
this.jackpot = false;
this.stored = 150;
this.offset = 0;
this.allOn = false;
        if (jackpotInterval) {
            clearInterval(jackpotInterval)
        }
        if (fillInterval) {
            clearInterval(fillInterval)
        }
        if (bounceInterval) {
            clearInterval(bounceInterval)
        }
        if (runUpInterval) {
            clearInterval(runUpInterval)
        }
        if (runDownInterval) {
            clearInterval(runDownInterval)
        }
    }

    configureLeftButton() {
        console.log('configure left button')
        buttonLeft = new Gpio(13, 'in', 'rising', {debounceTimeout: 10});
        buttonLeft.watch((err, value) => {
            this.clearAll()
            console.log('value configureLeftButton', value)
            if (err) {
                console.log('configureLeftButton ERROR', err)
                throw err;
            }
            this.jackpotShow()
        });
    }

    configureRightButton() {
        console.log('configuring right button')
        buttonRight = new Gpio(27, 'in', 'rising', {debounceTimeout: 10});
        buttonRight.watch((err, value) => {
            this.clearAll()
            console.log('value configureRightButton', value)
            if (err) {
                console.log('configureRightButton ERROR', err)
                throw err;
            }
            this.fill()
        });
    }

    configureCenterButton() {
        console.log('configure left button')
        buttonCenter = new Gpio(22, 'in', 'rising', {debounceTimeout: 10});
        buttonCenter.watch((err, value) => {
            this.clearAll()
            console.log('value configureCenterButton', value)
            if (err) {
                console.log('configureCenterButton ERROR', err)
                throw err;
            }
            this.bounce()
        });
    }


    configureRunUpButton() {
        console.log('configure runUp button')
        buttonRunUp = new Gpio(19, 'in', 'rising', {debounceTimeout: 10});
        buttonRunUp.watch((err, value) => {
            this.clearAll()
            console.log('value configureRunUpButton', value)
            if (err) {
                console.log('configureRunUpButton ERROR', err)
                throw err;
            }
            this.runUp()
        });
    }

    configureRunDownButton() {
        console.log('configure runUp button')
        buttonRunDown = new Gpio(26, 'in', 'rising', {debounceTimeout: 10});
        buttonRunDown.watch((err, value) => {
            this.clearAll()
            console.log('value configureRunDownButton', value)
            if (err) {
                console.log('configureRunDownButton ERROR', err)
                throw err;
            }
            this.runDown()
        });
    }

    jackpotShow() {
       jackpotInterval = setInterval(() => {
            let pixels
            if (this.allOn) {
                const color = 0xD71AE5;

                pixels = new Uint32Array(this.config.leds);

                for (let i = 0; i < this.config.leds - 1; i++) {
                    pixels[i] = color
                }

                ws281x.render(pixels);
            } else {
                pixels = new Uint32Array(this.config.leds);
                ws281x.render(pixels);

            }
            this.allOn = !this.allOn;
        }, 50)
    }

    fill() {
        fillInterval = setInterval(() => {
            if (this.jackpot) {
                this.jackpotShow()
            }
            let pixels = new Uint32Array(this.config.leds);
            const color = 0xD71AE5;
            // Set a specific pixel
            pixels[this.offset] = color;

            for (let i = this.config.leds - 1; i > this.stored; i--) {
                pixels[i] = color
            }

            const filled = this.stored;
            if (this.offset === filled) {
                this.offset = 0
                this.stored = this.stored - 1;
                if (this.stored === 0) {
                    this.stored = this.config.leds
                }
            } else {
                this.offset = this.offset + 1;
            }


            // Render to strip
            ws281x.render(pixels);
        }, 1)
    }


    bounce() {

        bounceInterval = setInterval(() => {

            let pixels = new Uint32Array(this.config.leds);

            // Set a specific pixel
            pixels[this.offset] = 0xD71AE5;

            // Move on to next

            if (this.offset === this.config.leds) {
                this.directionUp = false
            }
            if (this.offset === 0 && !this.directionUp) {
                this.directionUp = true;
            }
            if (this.directionUp) {
                this.offset = this.offset + 1;
            } else {
                this.offset = this.offset - 1;
            }

            // Render to strip
            ws281x.render(pixels);
        }, 1)
    }

    runUp() {
this.offset = 0;

        runUpInterval = setInterval(() => {

            let pixels = new Uint32Array(this.config.leds);

            // Set a specific pixel
            pixels[this.offset] = 0xD71AE5;

            // Move on to next



            if (this.offset === this.config.leds) {
this.clearAll();
            }
                this.offset = this.offset + 1;

            // Render to strip
            ws281x.render(pixels);
        }, 1)
    }

    runDown() {
this.offset = this.config.leds;

        runUpInterval = setInterval(() => {

            let pixels = new Uint32Array(this.config.leds);

            // Set a specific pixel
            pixels[this.offset] = 0xD71AE5;

            // Move on to next



            if (this.offset === 0) {
this.clearAll();
            }
                this.offset = this.offset - 1;

            // Render to strip
            ws281x.render(pixels);
        }, 1)
    }
}

var example = new Example();
example.init();