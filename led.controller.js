var ws281x = require('rpi-ws281x');

class Example {

    constructor() {
        // Current pixel position
        this.offset = 0;
        this.directionUp = true;
        this.stored = 0;

        // Set my Neopixel configuration
        this.config = {leds:150};
        this.config.stripType = 'grb';
        // Configure ws281x
        ws281x.configure(this.config);
    }

    fill() {

        setInterval(()=>{

            var pixels = new Uint32Array(this.config.leds);
const color = 0xD71AE5;
            // Set a specific pixel
            pixels[this.offset] = color;
            pixels[100] = color;
            pixels[99] = color;
            pixels[98] = color;
            pixels[97] = color;
            pixels[96] = color;
            pixels[95] = color;
            pixels[94] = color;
            pixels[93] = color;
            pixels[92] = color;
            pixels[91] = color;
            pixels[90] = color;
            pixels[89] = color;

             for(let i =80 - 1;i<100;i++){
                 pixels[i] =color
             }

            const filled = this.stored;
            if(this.offset === this.config.leds - filled){
                this.offset = 0
                this.stored = this.stored+1;
                if(this.stored === this.config.leds){
                    this.stored = 0
                }
            }else {
                this.offset = this.offset + 1;

            }



            // Render to strip
            ws281x.render(pixels);
        }, 1)
    }


    bounce() {

        setInterval(()=>{

            var pixels = new Uint32Array(this.config.leds);

            // Set a specific pixel
            pixels[this.offset] = 0xD71AE5;

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



    run() {
        // Loop every 100 ms
        this.fill()
        //setInterval(this.loop.bind(this), 10);
    }
}

var example = new Example();
example.run();