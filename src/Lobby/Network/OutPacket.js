// PACKET
var engine = engine || {};

if (cc.sys.isNative)
    engine.OutPacket.extend = cc.Class.extend;
else {
    engine.OutPacket = cc.Class.extend(
        {
            ctor: function () {
                this._controllerId = 1;
                this._cmdId = 0;
                this.reset();
            },
            setCmdId: function (cmdId) {
                this._cmdId = cmdId;
            },
            setControllerId: function (controllerId) {
                this._controllerId = controllerId;
            },
            initData: function (capacity) {
                this._data = [capacity];
                this._capacity = capacity;
            },
            reset: function () {
                this._pos = 0;
                this._length = 0;
                this._isPackedHeader = false;
            },
            packHeader: function () {
                if (this._isPackedHeader) {
                    return;
                }
                this._isPackedHeader = true;

                var header = PacketHeaderAnalyze.genHeader(false, false);
                this.putByte(header);
                this.putUnsignedShort(this._length);
                this.putByte(this._controllerId);
                this.putShort(this._cmdId);
            },
            putByte: function (b) {
                this._data[this._pos++] = b;
                this._length = this._pos;
                return this;
            },
            putByteArray: function (bytes) {
                this.putShort(bytes.length);
                this.putBytes(bytes);
                return this;
            },

            putBytes: function (bytes) {
                for (var i = 0; i < bytes.length; i++) {
                    this.putByte(bytes[i]);
                }
                return this;
            },

            putShort: function (v) {
                this.putByte((v >> 8) & 0xFF);
                this.putByte((v >> 0) & 0xFF);
                return this;
            },
            putUnsignedShort: function (v) {
                this.putByte(v >> 8);
                this.putByte(v >> 0);
                return this;
            },
            putInt: function (v) {
                this.putByte((v >> 24) & 0xff);
                this.putByte((v >> 16) & 0xff);
                this.putByte((v >> 8) & 0xff);
                this.putByte((v >> 0) & 0xff);
                return this;
            },
            doubleToByteArray: function (number) {
                var buffer = new ArrayBuffer(8);         // JS numbers are 8 bytes long, or 64 bits
                var longNum = new Float64Array(buffer);  // so equivalent to Float64

                longNum[0] = number;

                return Array.from(new Int8Array(buffer)).reverse();  // reverse to get little endian
            },
            putLong: function (v) {

                // var length = 7;
                // var byte = [];
                // while(length >= 0)
                // {
                //     byte.push((v >> 0) & 0xff);
                //     v = v / 256;
                //     //v = v >> 8;
                //     length--;
                // }
                var byte = this.doubleToByteArray(v);
                for (var i = 0; i < byte.length; i++) {
                    this.putByte(byte[i]);
                }
                return this;
            },
            putString: function (str, isNotEncode) {
                this.putByteArray(this._stringConvertToByteArray(str, isNotEncode));
                return this;
            },
            updateUnsignedShortAtPos: function (v, pos) {
                this._data[pos] = v >> 8;
                this._data[pos + 1] = v >> 0;
            },
            updateSize: function () {
                this.updateUnsignedShortAtPos(this._length - 3, INDEX_SIZE_PACKET);
            },
            getData: function () {
                return this._data.slice(0, this._length);
            },
            _stringConvertToByteArray: function (strData, isNotEndCode) {
                if (strData == null)
                    return null;
                if (!isNotEndCode) {
                    strData = encodeURI(strData);
                }
                var arrData = new Uint8Array(strData.length);
                for (var i = 0; i < strData.length; i++) {
                    arrData[i] = strData.charCodeAt(i);
                }
                return arrData;
            },
            clean: function () {

            }
        }
    );

    var BIT_IS_BINARY_INDEX = 7;
    var BIT_IS_ENCRYPT_INDEX = 6;
    var BIT_IS_COMPRESS_INDEX = 5;
    var BIT_IS_BLUE_BOXED_INDEX = 4;
    var BIT_IS_BIG_SIZE_INDEX = 3;
    var BYTE_PACKET_SIZE_INDEX = 1;
    var BIG_HEADER_SIZE = 5;
    var NORMAL_HEADER_SIZE = 3;

    PacketHeaderAnalyze = {
        getDataSize: function (data) {
            var bigSize = this.isBigSize(data);
            if (bigSize)
                return this.getIntAt(data, BYTE_PACKET_SIZE_INDEX);
            else
                return this.getUnsignedShortAt(data, BYTE_PACKET_SIZE_INDEX);
        },
        getCmdIdFromData: function (data) {
            return this.getShortAt(data, 1);
        },
        isBigSize: function (data) {
            return this.getBit(data[0], BIT_IS_BIG_SIZE_INDEX);
        },
        isCompress: function (data) {
            return this.getBit(data[0], BIT_IS_COMPRESS_INDEX);
        },
        getValidSize: function (data) {
            var bigSize = this.isBigSize(data);
            var dataSize = 0;
            var addSize = 0;
            if (bigSize) {
                if (length < BIG_HEADER_SIZE)
                    return -1;
                dataSize = this.getIntAt(data, BYTE_PACKET_SIZE_INDEX);
                addSize = BIG_HEADER_SIZE;
            } else {
                if (length < NORMAL_HEADER_SIZE)
                    return -1;
                dataSize = this.getUnsignedShortAt(data, BYTE_PACKET_SIZE_INDEX);
                addSize = NORMAL_HEADER_SIZE;
            }
            return dataSize + addSize;
        },
        getBit: function (input, index) {
            var result = input & (1 << index);
            return (result != 0);
        },
        genHeader: function (bigSize, compress) {
            var header = 0;
            //set bit dau la binary hay ko
            header = this.setBit(header, 7, true);
            //bit 2: ko ma hoa
            header = this.setBit(header, 6, false);
            //bit 3: ko nen
            header = this.setBit(header, 5, compress);
            //bit 4: isBlueBoxed?
            header = this.setBit(header, 4, true);
            //bit 5: isBigSize?
            header = this.setBit(header, 3, bigSize);
            return header;
        },
        setBit: function (input, index, hasBit) {
            if (hasBit) {
                input |= 1 << index;
            } else {
                input &= ~(1 << index);
            }
            return input;
        },
        getIntAt: function (data, index) {
            return ((data[index] & 255) << 24) +
                ((data[index + 1] & 255) << 16) +
                ((data[index + 2] & 255) << 8) +
                ((data[index + 3] & 255) << 0);
        },
        getUnsignedShortAt: function (data, index) {
            var a = (data[index] & 255) << 8;
            var b = (data[index + 1] & 255) << 0;
            return a + b;
        },
        getShortAt: function (data, index) {
            return (data[index] << 8) + (data[index + 1] & 255);
        }
    };
}

CmdSendCommon = engine.OutPacket.extend({
    _jData: "{}",
    ctor: function () {
        this._super();
    },

    setCmdId: function (cmdId) {
        this._super(cmdId);
        this._cmdId = cmdId;
    },

    putIntArray: function (arr) {
        this.putShort(arr.length);
        for (var i = 0; i < arr.length; i++) {
            this.putInt(arr[i]);
        }
        return this;
    },

    putLongArray: function(arr) {
        this.putShort(arr.length);
        for (var i = 0; i < arr.length; i++) {
            this.putLong(arr[i]);
        }
        return this;
    }
});

CmdSendHandshake = CmdSendCommon.extend({
    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(0);
        this.setCmdId(CMD.HAND_SHAKE);

        this.putData();
    },
    putData: function () {
        //pack
        this.packHeader();
        //update
        this.updateSize();
    }
});

CmdSendLogin = CmdSendCommon.extend({
    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(CMD.CMD_LOGIN);

    },
    putData: function (sessionkey) {
        //pack
        this.packHeader();

        var session = CookieUtility.getCookie(CookieUtility.KEY_SESSION_KEY);
        if (session !== "") {
            sessionkey = GameData.getInstance().sessionkey;
        }
        if (cc.sys.isNative || Config.ENABLE_DEV) {
            this.putString(sessionkey);
        } else {
            this.putString(sessionkey, true);
        }
        this.putString(NativeBridge.getDeviceID());
        if (session !== "") {
            this.putInt(!cc.sys.isNative);
        }
        //update
        this.updateSize();
    }
});

CmdSendPingPong = CmdSendCommon.extend({
    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(0);
        this.setCmdId(CMD.CMD_PINGPONG);
        this.putData();

    },
    putData: function () {
        //pack
        this.packHeader();
        //update
        this.updateSize();
    }
});

CmdSendMobile = CmdSendCommon.extend({
    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(CMD.CMD_MOBILE);

    },
    putData: function (deviceModel, osVersion, mobile, deviceID, update, installDate) {
        cc.log("SendMobile : " + deviceModel + "/" + osVersion + "/" + mobile + "/" + deviceID + "/" + update + "/" + installDate);
        //pack
        this.packHeader();
        this.putString("" + deviceModel);
        this.putString("" + osVersion);
        this.putByte(mobile);
        this.putString("" + deviceID);

        this.putString(gamedata.appVersion);
        this.putString("aa");
        this.putString("aa");
        this.putInt(Constant.APP_FOOTBALL);

        this.putByte(update);
        this.putString(installDate);

        if (gamedata.networkOperator != "") {
            this.putShort(1);
            this.putString(gamedata.networkOperator);
        } else {
            this.putShort(0);
        }

        this.updateSize();
    }
});

CmdSendGetConfig = CmdSendCommon.extend({
    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(CMD.CMD_GET_CONFIG);

        this.putData();
    },
    putData: function () {
        //pack
        this.packHeader();
        //update
        this.updateSize();
    }
});

CmdSendSearchTable = CmdSendCommon.extend({
    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(CMD.SEARCH_TABLE);

    },
    putData: function (roomID) {
        //pack
        this.packHeader();
        this.putInt(roomID);
        //update
        this.updateSize();
    }
});

CmdSendGetUserInfo = CmdSendCommon.extend({
    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(CMD.CMD_GET_USER_INFO);

        this.putData();
    },
    putData: function () {
        //pack
        this.packHeader();
        //update
        this.putInt(parseInt(gamedata.appVersion));
        this.updateSize();
    }
});

CmdSendSelectChanel = CmdSendCommon.extend({
    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(CMD.CMD_SELECT_CHANEL);

    },
    putData: function (chanelID) {
        //pack
        this.packHeader();
        this.putByte(chanelID);
        //update
        this.updateSize();
    }
});

CmdSendRefreshTable = CmdSendCommon.extend({
    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(CMD.CMD_REFRESH_TABLE);
        this.putData();
    },
    putData: function () {
        //pack
        this.packHeader();
        //update
        this.updateSize();
    }
});

CmdSendHold = CmdSendCommon.extend({

    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(CMD.CMD_HOLD);
        this.putData();
    },
    putData: function () {
        //pack
        this.packHeader();
        //update
        this.updateSize();
    }
});

CmdSendLogInvite = CmdSendCommon.extend({
    ctor: function () {
        this._super();
        this.initData(1000);
        this.setControllerId(1);
        this.setCmdId(CMD.CMD_SEND_LOG_INVITE);
    },
    putData: function (listinvite) {
        //pack
        this.packHeader();

        this.putString(listinvite + "");
        //update
        this.updateSize();
    }
});


// USER PACKET

CmdBuyGold = CmdSendCommon.extend({
    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(CMD.CMD_SHOP_GOLD);
    },

    putData: function (id) {
        this.packHeader();
        this.putByte(id);
        this.updateSize();
    }
});

CmdGetGiftCode = CmdSendCommon.extend({
    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(CMD.CMD_CHECKCODE);
    },

    putData: function (code) {
        this.packHeader();
        this.putString(code);
        this.updateSize();
    }
});

CmdRefreshTopUser = CmdSendCommon.extend({
    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(CMD.CMD_REFRESH_TOP_USER);
        this.putData();
    },

    putData: function () {
        this.packHeader();
        this.updateSize();
    }
});

CmdSendAcceptInvitation = CmdSendCommon.extend({
    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(CMD.ACCEPT_INVITATION);
    },

    putData: function (pack) {
        this.packHeader();
        this.putInt(pack);
        this.updateSize();
    }
});

CmdSendGetDailyGift = CmdSendCommon.extend({
    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(CMD.GET_DAILY_GIFT);
    },

    putData: function (index) {
        this.packHeader();
        this.putByte(index);
        this.updateSize();
    }
});

CmdSendGetInfoVip = CmdSendCommon.extend({
    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(CMD.INFO_VIP);
        this.putData();
    },

    putData: function () {
        this.packHeader();
        this.updateSize();
    }
});

CmdSendGetSupportBean = CmdSendCommon.extend({
    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(CMD.SUPPORT_BEAN);
        this.putData();
    },

    putData: function () {
        this.packHeader();
        this.updateSize();
    }
});

CmdSendInputCard = CmdSendCommon.extend({
    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(CMD.NAP_CARD);
    },

    putData: function (type, num, seri) {
        this.packHeader();
        this.putInt(type);
        this.putString(num);
        this.putString(seri);
        this.updateSize();
    }
});

CmdSendPingpong = CmdSendCommon.extend({
    ctor: function () {
        this._super();
        this.initData(1000);
        this.setControllerId(0);
        this.setCmdId(CMD.CMD_PINGPONG);
        this.putData();
    },

    putData: function () {
        this.packHeader();

        this.updateSize();
    }
});

CmdSendRegVip = CmdSendCommon.extend({
    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(CMD.REGISTER_VIP);
    },

    putData: function (index) {
        this.packHeader();
        this.putByte(index);
        this.updateSize();
    }
});

CmdSendGetCode = CmdSendCommon.extend({
    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(CMD.CMD_GETCODE);
        this.putData();
    },

    putData: function () {
        this.packHeader();
        this.updateSize();
    }
});

CmdSendChatEmotion = CmdSendCommon.extend({
    ctor: function () {
        this._super();
        this.initData(1000);
        this.setControllerId(1);
        this.setCmdId(CMD.CMD_EMOTICON);
    },

    putData: function (pos) {
        this.packHeader();
        this.putByte(pos);
        this.putByte(0);
        this.updateSize();
    }
});

CmdSendChatString = CmdSendCommon.extend({
    ctor: function () {
        this._super();
        this.initData(1000);
        this.setControllerId(1);
        this.setCmdId(CMD.CMD_SEND_MESSAGE);
    },

    putData: function (msg) {
        this.packHeader();
        this.putString(msg);
        this.updateSize();
    }
});

CmdSendPurchaseCard = CmdSendCommon.extend({
    ctor: function () {
        this._super();
        this.initData(1000);
        this.setControllerId(1);
        this.setCmdId(CMD.CMD_PURCHASE_CARD);
    },

    putData: function (type, code, seri, isBuyGold, isForOffer) {
        this.packHeader();
        this.putInt(type);
        this.putString(code);
        this.putString(seri);
        if (isBuyGold)
            this.putByte(isBuyGold);
        else
            this.putByte(0);
        if (!isForOffer)
            isForOffer = 0;
        this.putByte(isForOffer);
        cc.log("IS FOR OFFER " + isForOffer);
        this.updateSize();
    }
});

CmdSendPurchaseSMS = CmdSendCommon.extend({
    ctor: function () {
        this._super();
        this.initData(1000);
        this.setControllerId(1);
        this.setCmdId(CMD.CMD_PURCHASE_SMS);
    },

    putData: function (operator, amount, event, isForOffer) {
        cc.log("++SMS Request : " + JSON.stringify(arguments));

        this.packHeader();
        this.putInt(operator);
        this.putInt(amount);
        this.putByte(event);
        this.putByte(isForOffer);
        this.updateSize();
    }
});

CmdSendPurchaseIAPGoogle = CmdSendCommon.extend({
    ctor: function () {
        this._super();
        this.initData(1000);
        this.setControllerId(1);
        this.setCmdId(CMD.CMD_PURCHASE_IAP_GOOGLE);
    },

    putData: function (data, signature, isOffer) {
        this.packHeader();
        this.putString(data);
        this.putString(signature);
        this.putByte(isOffer);
        cc.log("SEND OFFER *** " + isOffer);
        this.updateSize();
    }
});

CmdSendPurchaseIAPApple = CmdSendCommon.extend({
    ctor: function () {
        this._super();
        this.initData(1000);
        this.setControllerId(1);
        this.setCmdId(CMD.CMD_PURCHASE_IAP_APPLE);
    },

    putData: function (receiptData) {
        this.packHeader();
        this.putString(receiptData);
        this.updateSize();
    }
});

CmdSendRequestEventShop = CmdSendCommon.extend({
    ctor: function () {
        this._super();
        this.initData(1000);
        this.setControllerId(1);
        this.setCmdId(CMD.CMD_UPDATE_BUYGOLD);
        this.putData();
    },

    putData: function () {
        this.packHeader();
        this.updateSize();
    }
});

CmdSendPurchaseValidate = CmdSendCommon.extend({
    ctor: function () {
        this._super();
        this.initData(1000);
        this.setControllerId(1);
        this.setCmdId(CMD.CMD_PURCHASE_IAP_VALIDATE);
    },

    putData: function (packId) {
        this.packHeader();
        this.putInt(packId);
        this.updateSize();
    }
});

CmdSendPurchaseIAPGoogleMultiPortal = CmdSendCommon.extend({
    ctor: function () {
        this._super();
        this.initData(1000);
        this.setControllerId(1);
        this.setCmdId(CMD.CMD_PURCHASE_IAP_GOOGLE_MULTI_PORTAL);
    },

    putData: function (data, signature, packageName, isOffer) {
        this.packHeader();
        this.putString(data);
        cc.log("SEND PURCHAASE PORTAL " + packageName);
        this.putString(signature);
        this.putString(packageName);
        if (!isOffer)
            isOffer = 0;
        cc.log("IS OFFER **** " + isOffer);
        this.putByte(isOffer);
        this.updateSize();
    }
});

// CHAT
CmdSendChatNew = CmdSendCommon.extend({
    ctor: function () {
        this._super();
        this.initData(1000);
        this.setControllerId(1);
        this.setCmdId(3000);
    },

    putData: function (msg) {
        this.packHeader();
        this.putString(msg);
        this.updateSize();
    }
});

CmdSendChatTotal = CmdSendCommon.extend({
    ctor: function () {
        this._super();
        this.initData(1000);
        this.setControllerId(1);
        this.setCmdId(CMD.CMD_CHAT_TOTAL);
    },

    putData: function (toId, typeMsg, msg) {
        this.packHeader();
        this.putInt(typeMsg);
        this.putInt(toId);
        this.putString(msg);
        this.updateSize();
    }
});

CmdSendModFriend = CmdSendCommon.extend({
    ctor: function () {
        this._super();
        this.initData(1000);
        this.setControllerId(1);
        this.setCmdId(CMD.CMD_MOD_FRIEND);
    },

    putData: function (add_delete, uId) {
        this.packHeader();
        this.putInt(add_delete);
        this.putInt(uId);
        this.updateSize();
    }
});

CmdSendUpdateStatusFriend = CmdSendCommon.extend({
    ctor: function () {
        this._super();
        this.initData(1000);
        this.setControllerId(1);
        this.setCmdId(CMD.CMD_UPDATE_STATTUS_FRIEND);
        this.putData();
    },

    putData: function () {
        this.packHeader();
        this.updateSize();
    }
});

// ROOM
CmdSendQuickPlay = CmdSendCommon.extend({
    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(CMD.CMD_QUICK_PLAY);
        this.putData();
    },
    putData: function () {
        //pack
        this.packHeader();
        this.putByte(-1);
        //update
        this.updateSize();
    }
});

CmdSendQuickPlayChannel = CmdSendCommon.extend({
    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(CMD.CMD_QUICK_PLAY);
        this.putData();
    },
    putData: function () {
        //pack
        this.packHeader();
        this.putByte(gamedata.selectedChanel);
        cc.log("CmdSendQuickPlay: ", gamedata.selectedChanel);
        //update
        this.updateSize();
    }
});

CmdSendQuickPlayCustom = CmdSendCommon.extend({
    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(CMD.CMD_QUICK_PLAY_CUSTOM);
    },
    putData: function (channelId, bet) {
        //pack
        this.packHeader();
        this.putByte(channelId);
        this.putByte(bet);
        cc.log("CmdSendQuickPlayCustom: ", JSON.stringify(arguments));

        //update
        this.updateSize();
    }
});

CmdSendBuyGZalo = CmdSendCommon.extend({
    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(CMD.CMD_BUY_G_ZALO);

    },
    putData: function (number, isBuyGold, isForOffer) {
        //pack
        cc.log("isBuy Gold " + isBuyGold);
        this.packHeader();
        this.putInt(number);
        this.putByte(isBuyGold);
        this.putByte(isForOffer);
        cc.log("IS FOR OFFER " + isForOffer);
        //update
        this.updateSize();
    }
});

CmdSendBuyZaloPayV2 = CmdSendCommon.extend({
    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(CMD.CMD_BUY_ZALO_V2);

    },
    putData: function (number, isBuyGold, isForOffer, offerId, packageName) {
        //pack
        cc.log("isBuy Gold " + isBuyGold + " isForOffer " + isForOffer + " offerID " + offerId);
        this.packHeader();
        this.putInt(number);
        this.putByte(isBuyGold);
        this.putByte(isForOffer);
        if (offerId == undefined || offerId == null) this.putInt(-1);
        else this.putInt(offerId);
        if (packageName == undefined || packageName == null) this.putString("");
        else this.putString(packageName);
        //update
        this.updateSize();
    }
});

// PACKET NEW FLOW
CmdSendGameInfo = CmdSendCommon.extend({
    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(CMD.CMD_GET_CONFIG);
    },

    putData: function (deviceName, osVersion, platform, deviceId, appVersion, trackingSource, mac, footballVersion, isUpdateApp, installDate, configVersion, quickConnect) {
        cc.log("++GameInfo " + JSON.stringify(arguments));

        //pack
        this.packHeader();

        this.putString(deviceName);
        this.putString(osVersion);
        this.putByte(platform);
        this.putString(deviceId);
        this.putString(appVersion);
        this.putString(trackingSource);
        this.putString(mac);
        this.putInt(footballVersion);
        this.putByte(isUpdateApp ? 1 : 0);
        this.putString(installDate);

        this.putInt(configVersion);
        this.putByte(quickConnect ? 1 : 0);

        var networkInfo = NativeBridge.getTelephoneInfo();
        if (networkInfo && networkInfo != "") {
            this.putShort(1);
            this.putString(networkInfo);
            cc.log("Sim Operator : " + networkInfo);
        } else {
            this.putShort(0);
        }

        //update
        this.updateSize();
    }
});

CmdSendRequestMission = CmdSendCommon.extend({
    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(CMD.CMD_UPDATE_BUYGOLD);

        this.putData();
    },

    putData: function () {
        this.packHeader();
        this.updateSize();
    }
});


CmdSendBuyGATM = CmdSendCommon.extend({
    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(CMD.CMD_SEND_BUY_G_ATM);

    },
    putData: function (number, bankCode, isBuyGold, isForOffer) {
        //pack
        cc.log(" SEND BANK " + number + " " + bankCode + " " + isBuyGold + " IS OFFER " + isForOffer);
        this.packHeader();
        this.putInt(number);
        this.putString(bankCode);
        this.putByte(isBuyGold);
        this.putByte(isForOffer);
        //update
        this.updateSize();
    }
});

CmdSendGetConfigShop = CmdSendCommon.extend({
    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(CMD.CMD_GET_CONFIG_SHOP);

    },
    putData: function (type, version) {
        //pack
        this.packHeader();
        this.putByte(type);
        this.putInt(version);
        //update
        this.updateSize();
    }
});

CmdSendGetConfigShop.GOLD = 1;
CmdSendGetConfigShop.G = 2;
CmdSendGetConfigShop.ALL = 3;

CmdSendMapZalo = CmdSendCommon.extend({
    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(CMD.CMD_MAP_ZALO);

    },
    putData: function (sessionKey) {
        //pack
        this.packHeader();
        this.putString(sessionKey);
        //update
        this.updateSize();
    }
});

CmdSendResetMapZalo = CmdSendCommon.extend({
    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(CMD.CMD_CHEAT_ZALO);

    },
    putData: function () {
        //pack
        this.packHeader();
        //update
        this.updateSize();
    }
});

var CmdSendClientInfo = CmdSendCommon.extend({
    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(CMD.CMD_GET_INFO_CLIENT);
    },
    putData: function (log, type) {
        //pack
        this.packHeader();
        this.putString(log);
        this.putByte(type);
        //update
        this.updateSize();
    }
});

var CmdSendPortalQuest = CmdSendCommon.extend({
    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(CMD.CMD_PORTAL_QUEST);
    },
    putData: function (listQuestId, expireTime, portalId) {
        //pack
        this.packHeader();
        this.putIntArray(listQuestId);
        this.putLong(expireTime);
        this.putLong(portalId);
        //update
        this.updateSize();
    }
});

var CmdSendPortalGiftCode = CmdSendCommon.extend({
    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(CMD.CMD_PORTAL_GIFT_CODE);
    },
    putData: function (giftCode) {
        //pack
        this.packHeader();
        this.putString(giftCode);
        //update
        this.updateSize();
    }
});

var CmdSendEventChangeAward = CmdSendCommon.extend({

    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(CMD.CMD_SEND_EVENT_REGISTER);
    },

    putData: function (idEvent, id, name, add, cmnd, phone, email) {
        if (name === undefined) name = "";
        if (phone === undefined) phone = "";
        if (cmnd === undefined) cmnd = "";
        if (add === undefined) add = "";
        if (email === undefined) email = "";

        cc.log("#SendChangeAward : " + idEvent + "," + id + "," + name + " , " + phone + " , " + cmnd + " , " + add + " , " + email);

        this.packHeader();
        this.putString(idEvent);
        this.putInt(id);

        this.putString(name);
        this.putString(phone);
        this.putString(cmnd);
        this.putString(add);
        this.putString(email);
        this.updateSize();
    },
});

var CmdSendCheatBot = CmdSendCommon.extend({
    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(CMD.CMD_CHEAT_BOT);
        this.putData();
    },
    putData: function () {
        //pack
        this.packHeader();
        //update
        this.updateSize();
    }
})