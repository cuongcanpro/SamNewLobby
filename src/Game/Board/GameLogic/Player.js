/**
 * Created by HOANG on 8/17/2015.
 */

var Player = cc.Class.extend({


    ctor: function()
    {
        this.ingame= false;
        this.active=false;
        this.chairInServer= -1;
        this.chairLocal= -1;
        this.type= 1;
        this.numberCards= 10;           // for enemy
        this.cards= [];                 // for my
        this.state= 0;
        this.status= -1;
        this.isCompareBai = false;
        this.isBinhLung = false;
        this.compareBinh = false;
        // user info
        this._info= null;
    }
})

Player.MY = 0;
Player.ENEMY = 1;

Player.NONE = 0;
Player.VIEWING = 1;
Player.PLAYING = 2;
//Player.STATE_