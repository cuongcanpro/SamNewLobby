/**
 * Created by GSN on 9/30/2015.
 */
var fr = fr || {};
fr.facebook = {
    userId: "",
    userName: "",
    userAvatarUrl: "",
    loginSuccess: 2,
    pluginUser: null,
    accessToken: null,
    sessionKey: null,

    init: function () {
        this.callback = null;
        if (plugin.PluginManager == null)
            return false;
        this.pluginUser = plugin.PluginManager.getInstance().loadPlugin("UserFacebook");
        return true;
    },

    /**
     *
     * @param callback
     */
    login: function (callbackFunc) {
        var self = this;
        if (this.pluginUser.isLoggedIn()) {
            this.pluginUser.logout(function () {
                self._requestLogin(callbackFunc);
            });
        } else {
            self._requestLogin(callbackFunc);
        }
    },

    logout: function () {
        if (this.pluginUser.isLoggedIn()) {
            this.pluginUser.logout(function () {

            });
        }
    },

    _requestLogin: function (callbackFunc) {
        this.pluginUser.login(function (result, response) {
            if (result == plugin.ProtocolUser.UserActionResultCode.LOGIN_SUCCEED) {
                var data = JSON.parse(response);
                var accessToken = data["accessToken"];
                callbackFunc(true, accessToken);
            } else {
                if (result != plugin.ProtocolUser.UserActionResultCode.LOGOUT_SUCCEED) {
                    var error = response;
                    callbackFunc(false, "fb:" + error);
                }
            }
        });
    },

    getFriendsPlayedGame: function (callbackFunc) {
        var url = "https://graph.facebook.com/v2.5/me/friends?fields=id,name,picture.width(160).height(160)&limit=1000&access_token=" + this.getAccessToken();
        fr.Network.requestJsonGet(url, function (result, response) {
            if (result) {
                callbackFunc(true, response.data);
            } else {
                callbackFunc(false, "");
            }
        });
    },

    getFriendsNotPlayGame: function (callbackFunc) {
        var url = "https://graph.facebook.com/v2.5/me/invitable_friends?fields=id,name,picture.width(160).height(160)&limit=500&access_token=" + this.getAccessToken();
        fr.Network.requestJsonGet(url, function (result, response) {
                if (result) {
                    callbackFunc(true, response.data);

                } else {
                    callbackFunc(false, "");
                }
            }
        );
    },

    inviteRequest: function (toFriend, message, callbackFunc, title) {
        if (!toFriend) {
            if (callbackFunc != undefined) {
                callbackFunc(false, "List friend empty!")
            }
            return;
        }

        if (title == undefined) {
            title = "invite_install_zingplay";
        }
        var map = {
            "message": message,
            "title": title,
            "to": toFriend
        };
        plugin.FacebookAgent.getInstance().appRequest(map, function (result, response) {
            if (result == plugin.FacebookAgent.CODE_SUCCEED) {
                callbackFunc(true, "Success!");
            } else {

                callbackFunc(false, "Failed!");
            }
        });
    },

    getDeepLink: function () {
        if (this.pluginUser) {
            return this.pluginUser.callStringFuncWithParam("getDeepLink");
        }
        return "";
    },

    shareScreenShoot : function (img, callBack) {
        cc.log("[Facebook] <sharePhoto> image = " + img);
        var info = {
            "dialog": "sharePhoto",
            "photo": img
        };

        plugin.FacebookAgent.getInstance().dialog(info, function(ret, msg){
            cc.log("facebook ret = " + ret);
            cc.log("facebook msg = " + JSON.stringify(msg));
            switch (ret) {
                case plugin.FacebookAgent.CODE_SUCCEED:
                    cc.log("facebook SUCCEED!!!");
                    callBack(0);
                    break;
                case 1: // FAILED - NO APP
                    cc.log("facebook FAILED NO APP!!!");
                    callBack(-1);
                    break;
                case 2: // CANCELED
                    cc.log("facebook CANCELED!!!");
                    callBack(1);
                    break;
                default: // default: FAILED
                    cc.log("facebook FAILED!!!");
                    callBack(2);
                    break;
            }
        });
    }
};
