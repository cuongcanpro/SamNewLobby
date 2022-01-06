/**
 * Created by HOANG on 9/7/2015.
 */

var FriendData = cc.Class.extend({
    ctor: function () {
        this.openID = "";
        this.avatar = "";
        this.displayname = "";
        this.username = "";
        this.usingApp = true;
    }
})

var SocialFriendData = cc.Class.extend({
    ctor: function(){
        this.listFriend = [];
        this.listIvitable = [];
    }
})

