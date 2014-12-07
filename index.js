var stream = require('stream');
var util = require('util');

var async = require('async');

var Transform = stream.Transform;

function SlidingStream (options) {
  var self = this;
  if (!(self instanceof SlidingStream)) {
    return new SlidingStream(options);
  }
  if (!options) options = {};
  options.chunkSize = options.chunkSize ? options.chunkSize : 16384;
  options.paddingSize = options.paddingSize ? options.paddingSize : 16;
  options.bufferSize = options.chunkSize + options.paddingSize;
  Transform.call(self, options);
  self.options = options;
  self.buffer = new Buffer(options.bufferSize); 
  self.buffer.fill(0);
  self.defaultTransform = function (data, encoding, cb) {
    return cb(null);
  };
  self.transform = self.transform ? self.transform : self.defaultTransform;
}

util.inherits(SlidingStream, Transform);

SlidingStream.prototype._transform = function (data, encoding, callback) {
  var self = this;
  var cursor = 0;
  var paddingBuffer = new Buffer(self.options.paddingSize);
  paddingBuffer.fill(0);
  async.until(
    function () {
      return cursor >= data.length;
    }, function (cb) {
    var remainingLength = data.length - cursor;
    var paddingLength = remainingLength >= self.options.paddingSize
      ? self.options.paddingSize
      : remainingLength;
    data.copy(paddingBuffer, 0, cursor, cursor + paddingLength);
    self.buffer.copy(
      self.buffer,
      0,
      paddingLength,
      self.options.bufferSize
    );
    paddingBuffer.copy(
      self.buffer,
      self.options.bufferSize - paddingLength,
      0,
      paddingLength
    );
    var sliced = self.buffer.slice(
      self.options.paddingSize,
      self.options.paddingSize + self.options.chunkSize
    );
    self.transform(
      sliced,
      encoding,
      function (err) {
        if (err) {
          return process.nextTick(function () {
            return cb(err);
          });
        }
        cursor += paddingLength;
        return process.nextTick(function () {
          return cb(null);
        });
      }
    );
  }, function (err) {
    if (err) return callback(err);
    return callback(null, data);
  });
};

module.exports = SlidingStream;
