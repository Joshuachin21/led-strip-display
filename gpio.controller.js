const DEBUG = process.env.DEBUG || false; //to develop on non ARM chips / non raspi
const gpio = !DEBUG ? require('onoff').Gpio : null; //include onoff to interact with the GPIO

class GpioController {

  constructor() {
    if (!DEBUG) {
      this.button1 = new gpio(18, 'in', 'rising', {
        debounceTimeout: 500
      });
      this.button2 = new gpio(23, 'in', 'rising', {
        debounceTimeout: 500
      });
      this.button3 = new gpio(24, 'in', 'rising', {
        debounceTimeout: 500
      });
      this.button4 = new gpio(27, 'in', 'rising', {
        debounceTimeout: 500
      });
      this.button5 = new gpio(17, 'in', 'rising', {
        debounceTimeout: 500
      });
      this.button6 = new gpio(22, 'in', 'rising', {
        debounceTimeout: 500
      });
    }

    this.allButtons = [
      this.button1,
      this.button2,
      this.button3,
      this.button4,
      this.button5,
      this.button6
    ];
    console.log(this.allButtons);
    this.unwatchAll();
  }

  destroyGpioConnections() {
    if (!DEBUG) {
      this.allButtons.forEach((button) => {
        console.log(`destroy gpio ${button}`);
        button.unexport();
      });
    }
  }

  unwatchAll() {
    if (!DEBUG) {
      this.allButtons.forEach((button) => {
        console.log(`unwatch all gpio ${button}`);
        button.unwatchAll();
      });
    }
  }

  setListenerFunction(gpioName, fn) {
    console.log(`set listener gpio ${gpioName}`);
    if (!this[gpioName]) {
      Error('missing gpio named ' + gpioName);
      return null;
    }
    this[gpioName].watch(fn);
  }
}

module.exports = GpioController;
