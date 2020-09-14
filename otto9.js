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
    this._servo[0].attach(this._servo_pins[0]);
    this._servo[1].attach(this._servo_pins[1]);
    this._servo[2].attach(this._servo_pins[2]);
    this._servo[3].attach(this._servo_pins[3]);
};

Otto9HW.prototype.detachServos = function() {
    this._servo[0].detach();
    this._servo[1].detach();
    this._servo[2].detach();
    this._servo[3].detach();
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
void Otto9::_moveServos(int time, int  servo_target[]) {

  attachServos();
  if(getRestState()==true){
        setRestState(false);
  }

  if(time>10){
    for (int i = 0; i < 4; i++) increment[i] = ((servo_target[i]) - servo_position[i]) / (time / 10.0);
    final_time =  millis() + time;

    for (int iteration = 1; millis() < final_time; iteration++) {
      partial_time = millis() + 10;
      for (int i = 0; i < 4; i++) servo[i].SetPosition(servo_position[i] + (iteration * increment[i]));
      while (millis() < partial_time); //pause
    }
  }
  else{
    for (int i = 0; i < 4; i++) servo[i].SetPosition(servo_target[i]);
  }
  for (int i = 0; i < 4; i++) servo_position[i] = servo_target[i];
}

void Otto9::_moveSingle(int position, int servo_number) {
if (position > 180) position = 90;
if (position < 0) position = 90;
  attachServos();
  if(getRestState()==true){
        setRestState(false);
  }
int servoNumber = servo_number;
if (servoNumber == 0){
  servo[0].SetPosition(position);
}
if (servoNumber == 1){
  servo[1].SetPosition(position);
}
if (servoNumber == 2){
  servo[2].SetPosition(position);
}
if (servoNumber == 3){
  servo[3].SetPosition(position);
}
}

void Otto9::oscillateServos(int A[4], int O[4], int T, double phase_diff[4], float cycle=1){

  for (int i=0; i<4; i++) {
    servo[i].SetO(O[i]);
    servo[i].SetA(A[i]);
    servo[i].SetT(T);
    servo[i].SetPh(phase_diff[i]);
  }
  double ref=millis();
   for (double x=ref; x<=T*cycle+ref; x=millis()){
     for (int i=0; i<4; i++){
        servo[i].refresh();
     }
  }
}


void Otto9::_execute(int A[4], int O[4], int T, double phase_diff[4], float steps = 1.0){

  attachServos();
  if(getRestState()==true){
        setRestState(false);
  }


  int cycles=(int)steps;    

  //-- Execute complete cycles
  if (cycles >= 1) 
    for(int i = 0; i < cycles; i++) 
      oscillateServos(A,O, T, phase_diff);
      
  //-- Execute the final not complete cycle    
  oscillateServos(A,O, T, phase_diff,(float)steps-cycles);
}



///////////////////////////////////////////////////////////////////
//-- HOME = Otto at rest position -------------------------------//
///////////////////////////////////////////////////////////////////
void Otto9::home(){

  if(isOttoResting==false){ //Go to rest position only if necessary

    int homes[4]={90, 90, 90, 90}; //All the servos at rest position
    _moveServos(500,homes);   //Move the servos in half a second

    detachServos();
    isOttoResting=true;
  }
}

bool Otto9::getRestState(){

    return isOttoResting;
}

void Otto9::setRestState(bool state){

    isOttoResting = state;
}


exports.init = function() {
  return new Otto9HW();
};
