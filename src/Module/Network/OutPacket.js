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


// PACKET NEW FLOW

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


