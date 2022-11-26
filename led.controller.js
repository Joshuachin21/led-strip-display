let ws281x = require('rpi-ws281x');
const Gpio = require('onoff').Gpio;
let buttonLeft;
let buttonRight;
let buttonCenter;
let buttonRunUp;
let buttonRunDown;

let jackpotInterval;
let pulse1Interval;
let fillInterval;
let bounceInterval;
let runUpInterval;
let runDownInterval;
const PRIMARY_COLOR_CODE = 0x1ff042;
const SECONDARY_COLOR_CODE = 0xF0351F;
const LED_TOTAL_LENGTH = 600;

class Example {
  constructor() {
    // Current pixel position
    this.offset = 0;
    this.directionUp = true;
    this.stored = LED_TOTAL_LENGTH;
    this.jackpot = false;
    this.allOn = false;
    // Set my Neopixel configuration
    this.config = { leds: LED_TOTAL_LENGTH };
    this.config.stripType = 'grb';
    this.config.brightness = 125;

    // Configure ws281x
    ws281x.configure(this.config);
  }

  init() {
    console.log('init');
    this.configureButtons();
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
    console.log('configure buttons');
    this.configureLeftButton();
    this.configureRightButton();
    this.configureCenterButton();
    this.configureRunUpButton();
    this.configureRunDownButton();
    //this.bounce()
    this.jackpotShow();
    this.pulse1();
  }

  clearAll() {
    console.log('clearAll');
    this.jackpot = false;
    this.stored = LED_TOTAL_LENGTH;
    this.offset = 0;
    this.allOn = false;
    if (jackpotInterval) {
      clearInterval(jackpotInterval);
    }
    if (pulse1Interval) {
      clearInterval(pulse1Interval);
    }
    if (fillInterval) {
      clearInterval(fillInterval);
    }
    if (bounceInterval) {
      clearInterval(bounceInterval);
    }
    if (runUpInterval) {
      clearInterval(runUpInterval);
    }
    if (runDownInterval) {
      clearInterval(runDownInterval);
    }
  }

  configureLeftButton() {
    console.log('configure left button');
    buttonLeft = new Gpio(13, 'in', 'rising', { debounceTimeout: 10 });
    buttonLeft.watch((err, value) => {
      this.clearAll();
      console.log('value configureLeftButton', value);
      if (err) {
        console.log('configureLeftButton ERROR', err);
        throw err;
      }
      this.jackpotShow();
    });
  }

  configureRightButton() {
    console.log('configuring right button');
    buttonRight = new Gpio(27, 'in', 'rising', { debounceTimeout: 10 });
    buttonRight.watch((err, value) => {
      this.clearAll();
      console.log('value configureRightButton', value);
      if (err) {
        console.log('configureRightButton ERROR', err);
        throw err;
      }
      this.fill();
    });
  }

  configureCenterButton() {
    console.log('configure left button');
    buttonCenter = new Gpio(22, 'in', 'rising', { debounceTimeout: 10 });
    buttonCenter.watch((err, value) => {
      this.clearAll();
      console.log('value configureCenterButton', value);
      if (err) {
        console.log('configureCenterButton ERROR', err);
        throw err;
      }
      this.bounce();
    });
  }


  configureRunUpButton() {
    console.log('configure runUp button');
    buttonRunUp = new Gpio(19, 'in', 'rising', { debounceTimeout: 10 });
    buttonRunUp.watch((err, value) => {
      this.clearAll();
      console.log('value configureRunUpButton', value);
      if (err) {
        console.log('configureRunUpButton ERROR', err);
        throw err;
      }
      this.runUp();
    });
  }

  configureRunDownButton() {
    console.log('configure runUp button');
    buttonRunDown = new Gpio(26, 'in', 'rising', { debounceTimeout: 10 });
    buttonRunDown.watch((err, value) => {
      this.clearAll();
      console.log('value configureRunDownButton', value);
      if (err) {
        console.log('configureRunDownButton ERROR', err);
        throw err;
      }
      this.runDown();
    });
  }

  jackpotShow() {
    let colorAlt = false;
    jackpotInterval = setInterval(() => {
      let pixels;
      if (this.allOn) {
        let color = PRIMARY_COLOR_CODE;
        if (colorAlt) {
          color = SECONDARY_COLOR_CODE;
        }
        pixels = new Uint32Array(this.config.leds);
        for (let i = 0; i < this.config.leds - 1; i++) {
          pixels[i] = color;
        }
        colorAlt = !colorAlt;
        ws281x.render(pixels);
      } else {
        pixels = new Uint32Array(this.config.leds);
        ws281x.render(pixels);
      }
      this.allOn = !this.allOn;
    }, 100);
  }


  pulse1() {

    /*
    *     ws281x.configure(this.config);

*/
    let pulseLevel = 0;
    const brightMax = 125;
    let asc = true;
    let colorAlt = false;
    pulse1Interval = setInterval(() => {
      ws281x = require('rpi-ws281x');
      let pixels;
      let color = PRIMARY_COLOR_CODE;
      if (colorAlt) {
        color = SECONDARY_COLOR_CODE;
      }
      pixels = new Uint32Array(this.config.leds);
      for (let i = 0; i < this.config.leds - 1; i++) {
        pixels[i] = color;
      }
      this.config.brightness = pulseLevel;
      ws281x.configure(this.config);
      colorAlt = !colorAlt;
      ws281x.render(pixels);


      if (asc) {
        pulseLevel = pulseLevel + 1;
        if (pulseLevel === brightMax) {
          asc = false;
        }
      }
      else {
        pulseLevel = pulseLevel - 1;
        if (pulseLevel === 0) {
          asc = true;
        }
      }

    }, 100);
  }

  fill() {
    fillInterval = setInterval(() => {
      if (this.jackpot) {
        this.jackpotShow();
      }
      let pixels = new Uint32Array(this.config.leds);
      const color = PRIMARY_COLOR_CODE;
      // Set a specific pixel
      pixels[this.offset] = color;

      for (let i = this.config.leds - 1; i > this.stored; i--) {
        pixels[i] = color;
      }
      const filled = this.stored;
      if (this.offset === filled) {
        this.offset = 0;
        this.stored = this.stored - 1;
        if (this.stored === 0) {
          this.stored = this.config.leds;
        }
      } else {
        this.offset = this.offset + 1;
      }
      // Render to strip
      ws281x.render(pixels);
    }, 1);
  }


  bounce() {
    bounceInterval = setInterval(() => {
      let pixels = new Uint32Array(this.config.leds);
      // Set a specific pixel
      pixels[this.offset] = PRIMARY_COLOR_CODE;
      // Move on to next
      if (this.offset === this.config.leds) {
        this.directionUp = false;
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
    }, 1);
  }

  triple() {/*

      this.offset = 1;
      runUpInterval = setInterval(() => {
        let pixels = new Uint32Array(this.config.leds);
        // Set a specific pixel


        for (let i = 0; i<LED_TOTAL_LENGTH; i++) {


          switch (this.offset) {
            case 1:
              if(i+1%3===1){
                pixels[i] = PRIMARY_COLOR_CODE
              }
              break;


            case 2:
              break;


            case 3:
              break;



          }
        }

        this.offset = this.offset + 1;

        if(this.offset > 3){
          this.offset = 1;
        }
        // Render to strip
        ws281x.render(pixels);
      }, 200)*/
  }

  runUp() {
    this.offset = 0;
    runUpInterval = setInterval(() => {
      let pixels = new Uint32Array(this.config.leds);
      // Set a specific pixel
      pixels[this.offset] = PRIMARY_COLOR_CODE;
      // Move on to next
      if (this.offset === this.config.leds) {
        this.clearAll();
      }
      this.offset = this.offset + 1;
      // Render to strip
      ws281x.render(pixels);
    }, 1);
  }

  runDown() {
    this.offset = this.config.leds;
    runUpInterval = setInterval(() => {
      let pixels = new Uint32Array(this.config.leds);
      // Set a specific pixel
      pixels[this.offset] = PRIMARY_COLOR_CODE;
      // Move on to next
      if (this.offset === 0) {
        this.clearAll();
      }
      this.offset = this.offset - 1;
      // Render to strip
      ws281x.render(pixels);
    }, 1);
  }
}

var example = new Example();
example.init();
