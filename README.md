# Soil
A transform stream that maintains and acts on a sliding window buffer

# Example
```
var Soil = require('soil');

var options = {
  // the interval at which to slide the buffer
  paddingSize: 16,
  // the size of the window
  chunkSize: 16384
};

var soil = new Soil(options);

soil.transform = function (data, encoding, callback) {
  console.log('data', data.toString('utf8'));
  // act on a window slide
  return callback(null);
}

soil.write('hello world hello world hello world');
```
