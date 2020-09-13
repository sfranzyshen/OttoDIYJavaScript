/**
JavaScript driver to Generate sinusoidal oscillations in the servos
Oscillator.pde: GPL license (c) Juan Gonzalez-Gomez (Obijuan), 2011
OttoDIY JavaScript Project, 2020 | sfranzyshen
**/

var OscillatorHW = function(trim) {
  if (trim === undefined) {
    trim = 0;
  }
  
  // Oscillators parameters
  this._A = 0;                # Amplitude (degrees)
  this._O = 0;                # Offset (degrees)
  this._T = 0;                # Period (miliseconds)
  this._phase0 = 0.0;         # Phase (radians)

  // Internal variables
  this._servo = require('otto_servo').init(); # Servo that is attached to the oscillator
  this._pos = 0;              # Current servo pos
  this._trim = trim;          # Calibration offset
  this._phase = 0.0;          # Current phase
  this._inc = 0.0;            # Increment of phase
  this._N = 0.0;              # Number of samples
  this._TS = 0;               # sampling period (ms)
  this._previousMillis = 0; 
  this._currentMillis = 0;
  this._stop = true;          # Oscillation mode. If true, the servo is stopped
  this._rev = false;          # Reverse mode
};

OscillatorHW.prototype.attach = function(pin, rev = false) {

};

OscillatorHW.prototype.detach = function() {

};

OscillatorHW.prototype.SetA = function(A) {
  this._A = A;
};

OscillatorHW.prototype.SetO = function(O) {
  this._O = O;
};
  
OscillatorHW.prototype.SetPh = function(Ph) {
  this._phase0 = Ph;
};
  
OscillatorHW.prototype.SetT = function(T) {

};
  
OscillatorHW.prototype.SetTrim = function(trim){
  this._trim = trim;
};
  
OscillatorHW.prototype.getTrim = function() {
  return this._trim;
};
  
OscillatorHW.prototype.SetPosition = function(position) {

};

OscillatorHW.prototype.Stop = function() {
  this._stop = true;
};
  
OscillatorHW.prototype.Play = function() {
  this._stop = false;
};
  
OscillatorHW.prototype.Reset = function() {
  this._phase = 0;
};
  
OscillatorHW.prototype.refresh = function() {

};

OscillatorHW.prototype.__next_sample = function() {

};

exports.init = function(options) {
  return new OscillatorHW(options);
};

