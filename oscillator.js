/*
JavaScript driver to generate sinusoidal oscillations in the servos
Oscillator.pde: GPL license (c) Juan Gonzalez-Gomez (Obijuan), 2011
OttoDIY JavaScript Project, 2020 | sfranzyshen
*/

var OscillatorHW = function(trim) {
  if (trim === undefined) {
    trim = 0;
  }
  
  // Oscillators parameters
  this._A = 0;                // Amplitude (degrees)
  this._O = 0;                // Offset (degrees)
  this._T = 0.0;              // Period (miliseconds)
  this._phase0 = 0.0;         // Phase (radians)

  // Internal variables
  this._servo = require('otto_servo').init(); // Servo that is attached to the oscillator
  this._pos = 0;              // Current servo pos
  this._trim = trim;          // Calibration offset
  this._phase = 0.0;          // Current phase
  this._inc = 0.0;            // Increment of phase
  this._N = 0.0;              // Number of samples
  this._TS = 0.0;             // sampling period (ms)
  this._previousMillis = 0.0; 
  this._currentMillis = 0.0;
  this._stop = true;          // Oscillation mode. If true, the servo is stopped
  this._rev = false;          // Reverse mode
};

// Attach an oscillator to a servo
// Input: pin is the data pin were the servo is connected
OscillatorHW.prototype.attach = function(pin, rev) {
  if(pin === undefined) {
    return;
  }

  if(rev === undefined) {
    rev = false;
  }
  
  if(!this._servo.attached()) {	// If the oscillator is detached, attach it.
    // Attach the servo and move it to the home position
    this._servo.attach(pin);
    this._servo.write(90);

    // Initialization of oscilaltor parameters
    this._TS = 30;
    this._T = 2000;
    this._N = this._T / this._TS;
    this._inc = 2 * Math.PI / this._N;
    this._previousMillis = 0.0;

    // Default parameters
    this._A = 45;
    this._phase = 0;
    this._phase0 = 0;
    this._O = 0;
    this._stop = false;

    //-- Reverse mode
    this._rev = rev;
  }
};

OscillatorHW.prototype.detach = function() {
  // If the oscillator is attached, detach it.
  if(this._servo.attached()) {
    this._servo.detach();
  }
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

// Set the oscillator period, in ms
OscillatorHW.prototype.SetT = function(T) {
  // Assign the new period
  this._T = T;
  
  // Recalculate the parameters
  this._N = this._T / this._TS;
  this._inc = 2 * Math.PI / this._N;
};
  
OscillatorHW.prototype.SetTrim = function(trim){
  this._trim = trim;
};
  
OscillatorHW.prototype.getTrim = function() {
  return this._trim;
};

// Manual set of the position
OscillatorHW.prototype.SetPosition = function(position) {
  this._servo.write(position + this._trim);
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

// This function should be periodically called
// in order to maintain the oscillations. It calculates
// if another sample should be taken and position the servo if so
OscillatorHW.prototype.refresh = function() {
  // Only When TS milliseconds have passed, the new sample is obtained
  if(this.__next_sample()) {
    // If the oscillator is not stopped, calculate the servo position
    if(!this._stop) {
      // Sample the sine function and set the servo pos
      this._pos = Math.round(this._A * Math.sin(this._phase + this._phase0) + this._O);
      if(this._rev) {
        this._pos = -this._pos;
      }
      this._servo.write(this._pos + 90 + this._trim);
    }
    // Increment the phase
    // It is always increased, even when the oscillator is stop
    // so that the coordination is always kept
    this._phase = this._phase + this._inc;
  }
};

// This function returns true if another sample
// should be taken (i.e. the TS time has passed since
// the last sample was taken
OscillatorHW.prototype.__next_sample = function() {
  // Read current time
  this._currentMillis = getTime() * 1000;
 
  // Check if the timeout has passed
  if(this._currentMillis - this._previousMillis > this._TS) {
    this._previousMillis = this._currentMillis;   
    return true;
  }
};

exports.init = function(options) {
  return new OscillatorHW(options);
};
