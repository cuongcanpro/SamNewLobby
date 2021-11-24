/**
 * Created by AnhLN6 on 8/13/2021
 * Logic of slot machine's reels
 */

var Reel = cc.Node.extend({
    ctor: function(slotList){
        this._super();
        this.slotList = slotList;
        
        //init info
        this.position = Reel.REEL_START_POS;
        this.speed = 0;
        this.acceleration = 0;
        this.timeSpin = 0;
        this.result = null;
        this.intenseLastRound = null;
        this.slowDownDuration = null;
        this.slowDownTravelDistance = 0;
        this.minSlowDownTravelDistance = null;
        
        //state variables
        this.isSlowingDown = false;
        this.isAtMaxSpeed = false;
        this.hasStopped = false;
        this.hasJustSlowedDown = false;
    },
    
    init: function(acceleration, slowDownDuration, minSlowDownTravelDistance, result, intenseLastRound){
        this.reset();
        this.acceleration = acceleration;
        this.result = result;
        this.slowDownDuration = slowDownDuration;
        this.minSlowDownTravelDistance = minSlowDownTravelDistance;
        this.intenseLastRound = intenseLastRound;
    },
    
    reset: function(){
        if (this.result !== null){
            this.position = ReelConfig[this.result].position;
        }
        this.speed = 0;
        this.acceleration = 0;
        this.timeSpin = 0;
        this.slowDownTravelDistance = 0;

        this.isSlowingDown = false;
        this.isAtMaxSpeed = false;
        this.hasStopped = false;
        this.hasJustSlowedDown = false;
    },
    
    update: function(dt){
        this.updateSpeed(dt);
        this.updateTime(dt);
        this.updatePosition(dt);
        for (var i = 0; i < this.slotList.length; i++){
            this.updateSlot(this.slotList[i], dt);
        }
        this.checkMaxSpeed();
        this.checkSlowDown(dt);
        this.checkStop(dt);
    },
    
    updateSlot: function(slot, dt){
        slot.y += this.speed * dt + 0.5 * this.acceleration * dt * dt;
        this.checkReposition(slot);
    },
    
    updateSpeed: function(dt){
        this.speed += this.acceleration * dt;
    },
    
    updatePosition: function(dt){
        this.position -= this.speed * dt + 0.5 * this.acceleration * dt * dt;
        if (this.position > Reel.SLOT_MAX_POS_Y + Reel.REPOSITION_BUFFER){
            this.position = Reel.SLOT_DISAPPEAR_POS + this.position - Reel.SLOT_MAX_POS_Y;
        }
    },
    
    updateTime: function(dt){
        this.timeSpin += dt;
    },
    
    checkReposition: function(slot){
        if (slot.y < Reel.SLOT_DISAPPEAR_POS - Reel.REPOSITION_BUFFER){
            slot.y = Reel.SLOT_MAX_POS_Y + slot.y - Reel.SLOT_DISAPPEAR_POS;
        }
    },
    
    checkMaxSpeed: function(){
        if (!this.isAtMaxSpeed){
            if (this.speed < Reel.SLOT_MAX_SPEED){
                this.isAtMaxSpeed = true;
                this.speed = Reel.SLOT_MAX_SPEED;
                this.acceleration = 0;
            }
        }
    },
    
    checkSlowDown: function(dt){
        if (!this.isSlowingDown){
            if (this.timeSpin > Reel.SLOT_DURATION_BEFORE_SLOWDOWN){
                this.isSlowingDown = true;
                this.acceleration = this.calculateAcceleration(this.result, this.position);
            }
        }
    },
    
    checkStop: function(dt){
        if (!this.hasStopped) {
            if (this.isSlowingDown) {
                if (!this.hasJustSlowedDown){
                    this.hasJustSlowedDown = true;
                }
                else {
                    this.slowDownTravelDistance -= this.speed * dt + 0.5 * this.acceleration * dt * dt;
                }
                if (
                    //threshold to catch the stopping moment
                    this.position < ReelConfig[this.result].position + Reel.SLOT_DESTINATION_THRESHOLD &&
                    this.position > ReelConfig[this.result].position &&
                    this.slowDownTravelDistance > this.minSlowDownTravelDistance
                ) {
                    this.speed = 0;
                    this.acceleration = 0;
                    this.hasStopped = true;
                    for (var i = 0; i < this.slotList.length; i++) {
                        if (this.intenseLastRound){
                            var distance = -60;
                            var action1 = cc.MoveBy(0.5, 0, distance);
                            //correct modulus negative number case
                            var distanceFixed = Reel.REEL_START_POS - distance - ((this.slotList[i].y % 100) + 100) % 100;
                            var action2 = cc.MoveBy(0.5, 0, distanceFixed);
                        }
                        else {
                            var distance = -20;
                            var action1 = cc.MoveBy(0.1, 0, distance);
                            //correct modulus negative number case
                            var distanceFixed = Reel.REEL_START_POS - distance - ((this.slotList[i].y % 100) + 100) % 100;
                            var action2 = cc.MoveBy(0.1, 0, distanceFixed);
                        }
                        action1.easing(cc.easeBackOut());
                        var sequence = cc.sequence(action1, action2);
                        this.slotList[i].runAction(sequence);
                    }
                }
            }
        }
    },
    
    runGlowAnimation: function(){
        var glowAnim = ccui.ImageView("res/Lobby/GUILuckyBonus/token/" + (this.result + 1).toString() + "_glow.png");
        glowAnim.setScale(0.8, 0.8);
        glowAnim.setPosition(cc.p(this.slotList[this.result].width / 2, this.slotList[this.result].height / 2));
        this.slotList[this.result].addChild(glowAnim);

        var actionArray = [];
        for (var j = 0; j < Reel.NUMBER_OF_GLOW; j++){
            var actionScaleDown = cc.ScaleTo(0.5, 0.6, 0.6);
            var actionScaleUp = cc.ScaleTo(0.5, 0.8, 0.8);
            actionArray.push(actionScaleDown);
            actionArray.push(actionScaleUp);
        }
        var sequence = cc.sequence(actionArray);
        glowAnim.runAction(sequence);
        this.slotList[this.result].removeChild(glowAnim);
    },
    
    calculateAcceleration: function(slotTypeDestination, currentPos){
        var distance = ReelConfig[slotTypeDestination].position - currentPos;
        while (distance < this.minSlowDownTravelDistance){
            distance += Reel.SLOT_SLOW_DOWN_DISTANCE_INCREMENT;
        }
        //if distance > minSlowDownTravelDistance, distance traveled is sure to match with calculated distance
        this.minSlowDownTravelDistance = distance - 100;
        //accelatarion formula
        var acceleration = -2 * (distance + this.speed * this.slowDownDuration) / Math.pow(this.slowDownDuration, 2);
        return acceleration;
    }
})

Reel.REEL_START_POS = 80;
Reel.REEL_MIN_SLOW_DOWN_TRAVEL_DISTANCE = 8000;
Reel.REEL_SLOW_DOWN_TRAVEL_DISTANCE_INCREMENT = 4000;
Reel.REPOSITION_BUFFER = 50;
Reel.NUMBER_OF_SLOT = 10;
Reel.SLOT_MAX_POS_Y = 980;
Reel.SLOT_DISAPPEAR_POS = -20;
Reel.SLOT_MAX_SPEED = -4000;
Reel.SLOT_DURATION_BEFORE_SLOWDOWN = 2;
Reel.SLOT_SLOW_DOWN_DISTANCE_INCREMENT = 1000;
Reel.SLOT_SLOW_DOWN_DEFAULT_DURATION = 3;
Reel.SLOT_SLOW_DOWN_DURATION_INCREMENT = 1;
Reel.SLOT_DESTINATION_THRESHOLD = 50;
Reel.NUMBER_OF_GLOW = 3;

Reel.SLOT = {
    FOX: 0,
    SEVEN: 1,
    HOOF: 2,
    BELL: 3,
    HEART: 4,
    DIAMOND: 5,
    CLUB: 6,
    SPADE: 7,
    BAR: 8,
    CHERRY: 9
}

var ReelConfig = [
    {
        type: Reel.SLOT.FOX,
        position: 80
    },
    {
        type: Reel.SLOT.SEVEN,
        position: 180
    },
    {
        type: Reel.SLOT.HOOF,
        position: 280
    },
    {
        type: Reel.SLOT.BELL,
        position: 380
    },
    {
        type: Reel.SLOT.HEART,
        position: 480
    },
    {
        type: Reel.SLOT.DIAMOND,
        position: 580
    },
    {
        type: Reel.SLOT.CLUB,
        position: 680
    },
    {
        type: Reel.SLOT.SPADE,
        position: 780
    },
    {
        type: Reel.SLOT.BAR,
        position: 880
    },
    {
        type: Reel.SLOT.CHERRY,
        position: 980
    },
];