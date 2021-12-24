const ws281x = require('rpi-ws281x-native');
const options = {
  dma: 10,
  freq: 800000,
  gpio: 18,
  invert: false,
  brightness: 255,
  stripType: ws281x.stripType.WS2812
};

const channel = ws281x(20, options);
const colors = channel.array;

// update color-values

const startLights = async (index, delay) => {
  return new Promise((resolve, reject) => {
    colors[index] = 0xffcc22;
    setTimeout(() => {
      resolve(true);
    }, delay);
  });
};

const startShow = async () => {
  for (let i = 0; i < 100; i++) {
    await startLights(i);
    ws281x.render();
  }
};
startShow();
