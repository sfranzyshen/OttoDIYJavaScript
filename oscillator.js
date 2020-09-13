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
  this._A = 0                 # Amplitude (degrees)
  this._O = 0                 # Offset (degrees)
  this._T = 0                 # Period (miliseconds)
  this._phase0 = 0.0          # Phase (radians)

  // Internal variables
  this._servo = servo.Servo() # Servo that is attached to the oscillator
  this._pos = 0               # Current servo pos
  this._trim = trim           # Calibration offset
  this._phase = 0.0           # Current phase
  this._inc = 0.0             # Increment of phase
  this._N = 0.0               # Number of samples
  this._TS = 0                # sampling period (ms)
  this._previousMillis = 0 
  this._currentMillis = 0
  this._stop = true           # Oscillation mode. If true, the servo is stopped
  this._rev = false           # Reverse mode
};

exports.init = function(options) {
  return new OscillatorHW(options);
};

