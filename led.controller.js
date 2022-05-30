const ws281x = require('rpi-ws281x');
const Gpio = require('onoff').Gpio;
const buttonLeft = new Gpio(4, 'in', 'rising', {debounceTimeout: 10});
const buttonRight = new Gpio(27, 'in', 'rising', {debounceTimeout: 10});
const buttonCenter = new Gpio(22, 'in', 'rising', {debounceTimeout: 10});

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
        this.configureButtons()
        process.on('SIGINT', _ => {
            buttonLeft.unexport();
            buttonRight.unexport();
        });
    }

    configureButtons() {
        this.configureLeftButton()
        this.configureRightButton()
        this.configureCenterButton()
    }

    configureLeftButton() {
        buttonLeft.watch((err, value) => {
            console.log('value configureLeftButton', value)
            if (err) {
                console.log('configureLeftButton ERROR', err)
                throw err;
            }
            this.jackpotShow()
        });
    }

    configureRightButton() {
        buttonRight.watch((err, value) => {
            console.log('value configureRightButton', value)
            if (err) {
                console.log('configureRightButton ERROR', err)
                throw err;
            }
            this.fill()
        });
    }

    configureCenterButton() {
        buttonCenter.watch((err, value) => {
            console.log('value configureCenterButton', value)
            if (err) {
                console.log('configureCenterButton ERROR', err)
                throw err;
            }
            this.bounce()
        });
    }

    jackpotShow() {
        setInterval(() => {
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

        setInterval(() => {
            if (this.jackpot) {
                this.jackpotShow()
            }
            var pixels = new Uint32Array(this.config.leds);
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

        setInterval(() => {

            var pixels = new Uint32Array(this.config.leds);

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

    run() {
        // Loop every 100 ms
        this.jackpotShow()
        //setInterval(this.loop.bind(this), 10);
    }
}

var example = new Example();
example.configureButtons();