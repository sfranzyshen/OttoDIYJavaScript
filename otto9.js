/*
OttoDIY JavaScript Project, 2020 | sfranzyshen
*/

var Otto9HW = function() {
  this._servo = [require('oscillator').init(), require('oscillator').init(), require('oscillator').init(), require('oscillator').init()]
  this._servo_pins = [0, 0, 0, 0]
  this._servo_trim = [0, 0, 0, 0]
  this._servo_position = [90, 90, 90, 90] // initialised to what the oscillator code defaults to 
  this._final_time = 0
  this._partial_time = 0
  this._increment = [0, 0, 0, 0]
  this._isOttoResting = true
};

Otto9HW.prototype.init = function(YL, YR, RL, RR, load_calibration, NoiseSensor, Buzzer, USTrigger, USEcho) {
  this._servo_pins[0] = YL;
  this._servo_pins[1] = YR;
  this._servo_pins[2] = RL;
  this._servo_pins[3] = RR;
  this.attachServos();
  this.setRestState(false);

  if(load_calibration) {
    for(i = 0; i < 4; i++) {
      servo_trim = 0; // FIXME EEPROM.read(i);
      if(servo_trim > 128) { 
        servo_trim -= 256;
      }
      this._servo[i].SetTrim(servo_trim);
    }
  }
  for(i = 0; i < 4; i++) { 
    this._servo_position[i] = 90;
  }
};

// ATTACH & DETACH FUNCTIONS
Otto9HW.prototype.attachServos = function() {
  for(i = 0; i < 4; i++) { 
    this._servo[i].attach(this._servo_pins[i]);
  }
};

Otto9HW.prototype.detachServos = function() {
  for(i = 0; i < 4; i++) { 
    this._servo[i].detach();
  }
};

// OSCILLATORS TRIMS
Otto9HW.prototype.setTrims = function(YL, YR, RL, RR) {
  this._servo[0].SetTrim(YL);
  this._servo[1].SetTrim(YR);
  this._servo[2].SetTrim(RL);
  this._servo[3].SetTrim(RR);
};

Otto9HW.prototype.saveTrimsOnEEPROM = function() {
  for(i = 0; i < 4; i++) { 
    //EEPROM.write(i, servo[i].getTrim()); FIXME
  } 
};

// BASIC MOTION FUNCTIONS
Otto9HW.prototype._moveServos = function(time, servo_target) {
  this.attachServos();
  if(this.getRestState() === true) {
    this.setRestState(false);
  }

  if(time > 10) {
    for(i = 0; i < 4; i++) {
      this._increment[i] = ((servo_target[i]) - this._servo_position[i]) / (time / 10.0);
    }

    final_time = (getTime() * 1000) + time;
    for(iteration = 1; getTime() * 1000 < final_time; iteration++) {
      partial_time = (getTime() * 1000) + 10;
      for(i = 0; i < 4; i++) {
        this._servo[i].SetPosition(this._servo_position[i] + (iteration * this._increment[i]));
      }
      while(getTime() * 1000 < partial_time) {
        // pause
      }
    }
  } else {
    for(i = 0; i < 4; i++) {
      this._servo[i].SetPosition(servo_target[i]);
    }
  }
  for(i = 0; i < 4; i++) {
    this._servo_position[i] = servo_target[i];
  }
}

Otto9HW.prototype._moveSingle = function(position, servo_number) {
  if(position > 180) { position = 180; }
  if(position < 0) { position = 0; }
  this.attachServos();
  if(this.getRestState() === true) {
    this.setRestState(false);
  }
  this._servo[servo_number].SetPosition(position);
};

Otto9HW.prototype.oscillateServos = function(A, O, T, phase_diff, cycle) {
  if(cycle === undefined) { cycle = 1.0; }
  for (i = 0; i < 4; i++) {
    this._servo[i].SetO(O[i]);
    this._servo[i].SetA(A[i]);
    this._servo[i].SetT(T);
    this._servo[i].SetPh(phase_diff[i]);
  }
  ref = getTime() * 1000;
  for(x = ref; x <= T * cycle + ref; x = getTime() * 1000) {
    for(i = 0; i < 4; i++) {
      this._servo[i].refresh();
    }
  }
};

Otto9HW.prototype._execute = function(A, O, T, phase_diff, steps) {
  if(steps === undefined) { steps = 1.0; }
  this.attachServos();
  if(this.getRestState() === true) {
    this.setRestState(false);
  }
  cycles = parseInt(steps);

  // Execute complete cycles
  if(cycles >= 1) { 
    for(i = 0; i < cycles; i++) {
      this._oscillateServos(A, O, T, phase_diff);
    }
  }
      
  // Execute the final not complete cycle    
  this._oscillateServos(A, O, T, phase_diff,steps - cycles);
};

// HOME = Otto at rest position
Otto9HW.prototype.home = function() {
  if(this._isOttoResting === false) {  // Go to rest position only if necessary
    homes = [90, 90, 90, 90];          // All the servos at rest position
    this._moveServos(500, homes);      // Move the servos in half a second
    this.detachServos();
    this._isOttoResting = true;
  }
};

Otto9HW.prototype.getRestState = function() {
  return this._isOttoResting;
};

Otto9HW.prototype.setRestState = function(state) {
  this._isOttoResting = state;
};

exports.init = function() {
  return new Otto9HW();
};
