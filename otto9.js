/*
OttoDIY JavaScript Project, 2020 | sfranzyshen
*/

let Otto9HW = function() {
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
    let servo_trim = 0;
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

    let final_time = (getTime() * 1000) + time;
    let partial_time = 0;
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
  let ref = getTime() * 1000;
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
  let cycles = parseInt(steps);

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
    let homes = [90, 90, 90, 90];          // All the servos at rest position
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

Otto9HW.prototype.sleep_ms = function(milliseconds) {
  let currentTime = null;
  do {
    currentTime = getTime() * 1000;
  } while (currentTime - (getTime() * 1000) < milliseconds);
};

Otto9HW.prototype._DEG2RAD = function(g) {
  ((g) * Math.PI) / 180;
};

// PREDETERMINED MOTION SEQUENCES

// Otto movement: Jump
//  Parameters:
//    steps: Number of steps
//    T: Period
Otto9HW.prototype.jump = function(steps, T) {
  let up = [90,90,150,30];
  this._moveServos(T, up);
  let down = [90,90,90,90];
  this._moveServos(T, down);
};

// Otto gait: Walking  (forward or backward)    
//  Parameters:
//    * steps:  Number of steps
//    * T : Period
//    * Dir: Direction: FORWARD / BACKWARD
Otto9HW.prototype.walk = function(steps, T, dir) {
  // Oscillator parameters for walking
  // Hip sevos are in phase
  // Feet servos are in phase
  // Hip and feet are 90 degrees out of phase
  //      -90 : Walk forward
  //       90 : Walk backward
  // Feet servos also have the same offset (for tiptoe a little bit)
  let A = [30, 30, 20, 20];
  let O = [0, 0, 4, -4];
  let phase_diff = [0, 0, this._DEG2RAD(dir * -90), this._DEG2RAD(dir * -90)];

  // Let's oscillate the servos!
  this._execute(A, O, T, phase_diff, steps);
};

// Otto gait: Turning (left or right)
//  Parameters:
//   * Steps: Number of steps
//   * T: Period
//   * Dir: Direction: LEFT / RIGHT
Otto9HW.prototype.turn = function(steps, T, dir) {
  // Same coordination than for walking (see Otto::walk)
  // The Amplitudes of the hip's oscillators are not igual
  // When the right hip servo amplitude is higher, the steps taken by
  //   the right leg are bigger than the left. So, the robot describes an 
  //   left arc
  let A = [30, 30, 20, 20];
  let O = [0, 0, 4, -4];
  let phase_diff = [0, 0, this._DEG2RAD(-90), this._DEG2RAD(-90)];
    
  if(dir === LEFT) {  
    A[0] = 30; // Left hip servo
    A[1] = 10; // Right hip servo
  }
  else {
    A[0] = 10;
    A[1] = 30;
  }
    
  // Let's oscillate the servos!
  this._execute(A, O, T, phase_diff, steps); 
};

// Otto gait: Lateral bend
//  Parameters:
//    steps: Number of bends
//    T: Period of one bend
//    dir: RIGHT=Right bend LEFT=Left bend
Otto9HW.prototype.bend = function(steps, T, dir) {
  // Parameters of all the movements. Default: Left bend
  let bend1 = [90, 90, 62, 35]; 
  let bend2 = [90, 90, 62, 105];
  let homes = [90, 90, 90, 90];
  // Time of one bend, constrained in order to avoid movements too fast.
  // T=max(T, 600);
  // Changes in the parameters if right direction is chosen 
  if(dir === -1)
  {
    bend1[2] = 180-35;
    bend1[3] = 180-60;  // Not 65. Otto is unbalanced
    bend2[2] = 180-105;
    bend2[3] = 180-60;
  }
  // Time of the bend movement. Fixed parameter to avoid falls
  let T2 = 800;
  // Bend movement
  let t = 0;
  for (i = 0; i < steps; i++) {
    this._moveServos(T2 / 2, bend1);
    this._moveServos(T2 / 2, bend2);
    t = (getTime() * 1000) + (T * 0.8);
    while((getTime() * 1000) < t);
    this._moveServos(500, homes);
  }
};


// Otto gait: Shake a leg
//  Parameters:
//    steps: Number of shakes
//    T: Period of one shake
//    dir: RIGHT=Right leg LEFT=Left leg
Otto9HW.prototype.shakeLeg = function(steps, T, dir) {
  // This variable change the amount of shakes
  let numberLegMoves = 2;
  // Parameters of all the movements. Default: Right leg
  let shake_leg1 = [90, 90, 58, 35];
  let shake_leg2 = [90, 90, 58, 120];
  let shake_leg3 = [90, 90, 58, 60];
  let homes = [90, 90, 90, 90];
  // Changes in the parameters if left leg is chosen
  if(dir === -1) {
    shake_leg1[2] = 180 - 35;
    shake_leg1[3] = 180 - 58;
    shake_leg2[2] = 180 - 120;
    shake_leg2[3] = 180 - 58;
    shake_leg3[2] = 180 - 60;
    shake_leg3[3] = 180 - 58;
  }
  
  // Time of the bend movement. Fixed parameter to avoid falls
  let T2 = 1000;
  // Time of one shake, constrained in order to avoid movements too fast.            
  T = T - T2;
  T = Math.max(T, 200 * numberLegMoves);
  for(j = 0; j < steps; j++) {
    // Bend movement
    this._moveServos(T2 / 2, shake_leg1);
    this._moveServos(T2 / 2, shake_leg2);
    // Shake movement
    for (i = 0; i < numberLegMoves; i++) {
      this._moveServos(T / (2 * numberLegMoves), shake_leg3);
      this._moveServos(T / (2 * numberLegMoves), shake_leg2);
    }
    this._moveServos(500, homes); // Return to home position
  }
  let t = (getTime() * 1000) + T;
  while((getTime() * 1000) < t) {
    // pause
  }
};

// Otto movement: up & down
//  Parameters:
//    * steps: Number of jumps
//    * T: Period
//    * h: Jump height: SMALL / MEDIUM / BIG 
//              (or a number in degrees 0 - 90)
Otto9HW.prototype.updown = function(steps, T, h) {
  // Both feet are 180 degrees out of phase
  // Feet amplitude and offset are the same
  // Initial phase for the right foot is -90, so that it starts
  //   in one extreme position (not in the middle)
  let A = [0, 0, h, h];
  let O = [0, 0, h, -h];
  let phase_diff = [0, 0, this._DEG2RAD(-90), this._DEG2RAD(90)];
 
  // Let's oscillate the servos!
  this._execute(A, O, T, phase_diff, steps);
};

// Otto movement: swinging side to side
//  Parameters:
//     steps: Number of steps
//     T : Period
//     h : Amount of swing (from 0 to 50 aprox)
Otto9HW.prototype.swing = function(steps, T, h) {
  // Both feets are in phase. The offset is half the amplitude
  // It causes the robot to swing from side to side
  let A = [0, 0, h, h];
  let O = [0, 0, h / 2, -h / 2];
  let phase_diff = [0, 0, this._DEG2RAD(0), this._DEG2RAD(0)];
  
  // Let's oscillate the servos!
  this._execute(A, O, T, phase_diff, steps); 
};

// Otto movement: swinging side to side without touching the floor with the heel
//  Parameters:
//     steps: Number of steps
//     T : Period
//     h : Amount of swing (from 0 to 50 aprox)
Otto9HW.prototype.tiptoeSwing = function(steps, T, h) {
  // Both feets are in phase. The offset is not half the amplitude in order to tiptoe
  // It causes the robot to swing from side to side
  let A = [0, 0, h, h];
  let O = [0, 0, h, -h];
  let phase_diff = [0, 0, 0, 0];
  
  // Let's oscillate the servos!
  this._execute(A, O, T, phase_diff, steps);
};

// Otto gait: Jitter 
//  Parameters:
//    steps: Number of jitters
//    T: Period of one jitter 
//    h: height (Values between 5 - 25)   
Otto9HW.prototype.jitter = function(steps, T, h) {
  // Both feet are 180 degrees out of phase
  // Feet amplitude and offset are the same
  // Initial phase for the right foot is -90, so that it starts
  //   in one extreme position (not in the middle)
  // h is constrained to avoid hit the feets
  h = Math.min(25, h);
  let A = [h, h, 0, 0];
  let O = [0, 0, 0, 0];
  let phase_diff = [this._DEG2RAD(-90), this.DEG2RAD(90), 0, 0];
  
  // Let's oscillate the servos!
  this._execute(A, O, T, phase_diff, steps);
};

// Otto gait: Ascending & turn (Jitter while up&down)
//  Parameters:
//    steps: Number of bends
//    T: Period of one bend
//    h: height (Values between 5 - 15) 
Otto9HW.prototype.ascendingTurn = function(steps, T, h) {
  // Both feet and legs are 180 degrees out of phase
  // Initial phase for the right foot is -90, so that it starts
  //   in one extreme position (not in the middle)
  // h is constrained to avoid hit the feets
  h = Math.min(13, h);
  let A = [h, h, h, h];
  let O = [0, 0, h + 4, -h + 4];
  let phase_diff = [this._DEG2RAD(-90), this._DEG2RAD(90), this._DEG2RAD(-90), this._DEG2RAD(90)];

  // Let's oscillate the servos!
  this._execute(A, O, T, phase_diff, steps); 
};

//  Parameters:
//    Steps: Number of steps
//    T: Period
//    h: Height. Typical valures between 15 and 40
//    dir: Direction: LEFT / RIGHT
Otto9HW.prototype.moonwalker = function(steps, T, h, dir) {
  // This motion is similar to that of the caterpillar robots: A travelling
  // wave moving from one side to another
  // The two Otto's feet are equivalent to a minimal configuration. It is known
  // that 2 servos can move like a worm if they are 120 degrees out of phase
  // In the example of Otto, the two feet are mirrored so that we have:
  //    180 - 120 = 60 degrees. The actual phase difference given to the oscillators
  //  is 60 degrees.
  //  Both amplitudes are equal. The offset is half the amplitud plus a little bit of
  //  offset so that the robot tiptoe lightly
  let A = [0, 0, h, h];
  let O = [0, 0, h / 2 + 2, -h / 2 - 2];
  let phi = -dir * 90;
  let phase_diff = [0, 0, this._DEG2RAD(phi), this._DEG2RAD(-60 * dir + phi)];
  
  // Let's oscillate the servos!
  this._execute(A, O, T, phase_diff, steps); 
};

// Otto gait: Crusaito. A mixture between moonwalker and walk
//   Parameters:
//     steps: Number of steps
//     T: Period
//     h: height (Values between 20 - 50)
//     dir:  Direction: LEFT / RIGHT
Otto9HW.prototype.crusaito = function(steps, T, h, dir) {
  let A = [25, 25, h, h];
  let O = [0, 0, h / 2 + 4, -h / 2 - 4];
  let phase_diff = [90, 90, this._DEG2RAD(0), this._DEG2RAD(-60 * dir)];
  
  // Let's oscillate the servos!
  this._execute(A, O, T, phase_diff, steps); 
};

// Otto gait: Flapping
//  Parameters:
//    steps: Number of steps
//    T: Period
//    h: height (Values between 10 - 30)
//    dir: direction: FOREWARD, BACKWARD
Otto9HW.prototype.flapping = function(steps, T, h, dir) {
  let A = [12, 12, h, h];
  let O = [0, 0, h - 10, -h + 10];
  let phase_diff = [this._DEG2RAD(0), this._DEG2RAD(180), this._DEG2RAD(-90 * dir), this._DEG2RAD(90 * dir)];
  
  // Let's oscillate the servos!
  this._execute(A, O, T, phase_diff, steps); 
};

exports.init = function() {
  return new Otto9HW();
};

//end
