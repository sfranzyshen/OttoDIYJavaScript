/*
A simple class for controlling hobby servos. Modeled after the ESP8266 Arduino Servo Driver
OttDIY JavaScript Project, 2020 | sfranzyshen
*/ 

var ServoHW = function(options) {
  this._pin = undefined;
  this._freq = 50;
  this._pulseMin = 0.5;
  this._pulseMax = 2.5;
  this._valueMin = 0;
  this._valueMax = 180;
  this._attached = false;
  
  if (options && options.freq) {
    this._freq = options.freq;
  }
  if (options && options.pulseMin) {
    this._pulseMin = options.pulseMin;
  }
  if (options && options.pulseMax) {
    this._pulseMax = options.pulseMax;
  }
  if (options && options.valueMin) {
    this._valueMin = options.valueMin;
  }
  if (options && options.valueMax) {
    this._valueMax = options.valueMax;
  }

  this._period = 1000 / this._freq;
  this._valueStart = this._pulseMin / this._period;
  var pulsDiff = this._pulseMax - this._pulseMin;
  this._valueStep = pulsDiff / (this._valueMax - this._valueMin) / this._period;
};

ServoHW.prototype.attached = function() {
  return this._attached;
};

ServoHW.prototype.detach = function() {
  digitalWrite(this._pin, 0);
  this._attached = false;
};

ServoHW.prototype.attach = function(pin) {
  if (pin === undefined) {
    return;
  }
  
  this._pin = pin;
  analogWrite(this._pin, 0, {freq: this._freq});
  this._attached = true;
};

ServoHW.prototype.write = function(value) {
  if (value === undefined) {
    return;
  }
  
  value = E.clip(value, this._valueMin, this._valueMax);
  analogWrite(this._pin, this._valueStart + this._valueStep * (value - this._valueMin), { freq: this._freq });
};

ServoHW.prototype.write_us = function(value) {
  if (value === undefined) {
    return;
  }
  
  value = E.clip(value, this._pulseMin * 1000, this._pulseMax * 1000);
  analogWrite(this._pin, value / 1000 / this._period, { freq: this._freq });
};

exports.init = function(options) {
  return new ServoHW(options);
};
