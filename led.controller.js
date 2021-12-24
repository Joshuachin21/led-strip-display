var ws281x = require('rpi-ws281x');

class Example {

    constructor() {
        // Current pixel position
        this.offset = 0;
        this.directionUp = true;

        // Set my Neopixel configuration
        this.config = {leds:150};
        this.config.stripType = 'grb';
        // Configure ws281x
        ws281x.configure(this.config);
    }

    loop() {
        setInterval(()=>{

            var pixels = new Uint32Array(this.config.leds);

            // Set a specific pixel
            pixels[this.offset] = 0xFFFFFF;

            // Move on to next

            if(this.offset === this.config.leds){
                this.directionUp = false
            }
            if(this.offset === 0 && !this.directionUp){
                this.directionUp = true;
            }
            if(this.directionUp){
                this.offset = this.offset + 1;
            }
            else {
                this.offset = this.offset - 1;
            }

            // Render to strip
            ws281x.render(pixels);
        }, 1)
    }


    bounce() {

        setInterval(()=>{

            var pixels = new Uint32Array(this.config.leds);

            // Set a specific pixel
            pixels[this.offset] = 0xFF0000;


            this.offset = (this.offset + 1) % this.config.leds;

            // Render to strip
            ws281x.render(pixels);
        }, 10)
    }



    run() {
        // Loop every 100 ms
        this.loop()
        //setInterval(this.loop.bind(this), 10);
    }
}

var example = new Example();
example.run();