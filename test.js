var Soil = require('./index');

var options = {
  // the interval at which to slide the buffer
  paddingSize: 4,
  // the size of the window
  chunkSize: 16
};

var soil = new Soil(options);

soil.transform = function (data, encoding, callback) {
  console.log('data', data.toString('utf8'));
  // act on a slide window
  return callback(null);
}

soil.write('hello world hello world hello world');
