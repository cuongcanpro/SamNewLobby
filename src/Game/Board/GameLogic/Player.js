/**
 * Created by HOANG on 8/17/2015.
 */

var Player = cc.Class.extend({


    ctor: function()
    {
        this._ingame= false;
        this._active=false;
        this._chairInServer= -1;
        this._type= 1;
        this._cards= [];                 // for my
        this._state= 0;
        this._status= -1;

        // user info
        this._info= null;
    }
});

Player.MY = 0;
Player.ENEMY = 1;

Player.STATE_NONE = 0;
Player.STATE_VIEWING = 1;
Player.STATE_BAOSAM = 2;
//Player.STATE_