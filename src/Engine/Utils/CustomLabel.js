/**
 * Created by Cantaloupe on 4/24/2016.
 */

RichTextColor = {
    RED:"RED",
    GREEN:"GREEN",
    BLUE:"BLUE",
    BLACK:"BLACK",
    WHITE:"WHITE",
    YELLOW:"YELLOW"
},

RichTextAlignment = {
    LEFT:0,
    RIGHT:1,
    CENTER:2,
    JUSTIFIED:3,
    TOP:4,
    MIDDLE:5,
    BOTTOM:6
}

var CustomLabel = cc.Layer.extend({
    ctor:function(size) {
        this._super();
        this.setCascadeOpacityEnabled(true);
        this.setCascadeColorEnabled(true);
        this._listener = null;
        this._curId = 0;

        this._font = SceneMgr.FONT_NORMAL;
        this._size = 20;
        this._color = cc.color.WHITE;

        this._richText = new ccui.RichText();
     //   this._richText.setFontName(SceneMgr.FONT_NORMAL);
        this.addChild(this._richText);

        if (size) {
            this.setTextContentSize(size);
        }
        else {
            this.setTextContentSize(cc.size(500, 200));
        }

        this._richText.ignoreContentAdaptWithSize(false);
        if (!cc.sys.isNative) {
            this._richText.setLineBreakOnSpace(true);
        }
    },

    setIgnoreSize:function(val) {
        this._richText.ignoreContentAdaptWithSize(val);
    },

    setTextContentSize:function(size) {
        this._richText.setContentSize(size);
    },

    getTextContentSize:function() {
        this._richText.getContentSize();
    },

    setDefaultFont:function(font) {
        this._font = font;
    },

    setDefaultSize:function(size) {
        this._size = size;
    },

    setDefaultColor:function(color) {
        this._color = color;
    },

    _convertAlignmentFromNativeToWebDefine:function(val) {
        switch (val) {
            case RichTextAlignment.LEFT:
                return cc.TEXT_ALIGNMENT_LEFT;
            case RichTextAlignment.RIGHT:
                return cc.TEXT_ALIGNMENT_RIGHT;
            case RichTextAlignment.CENTER:
                return cc.TEXT_ALIGNMENT_CENTER;
            case RichTextAlignment.TOP:
                return cc.VERTICAL_TEXT_ALIGNMENT_TOP;
            case RichTextAlignment.MIDDLE:
                return cc.VERTICAL_TEXT_ALIGNMENT_CENTER;
            case RichTextAlignment.BOTTOM:
                return cc.VERTICAL_TEXT_ALIGNMENT_BOTTOM;
        }
        return -1;
    },

    setDefaultAlignHorizontal:function(val) {
        if(!cc.sys.isNative) {
            this._richText.setTextHorizontalAlignment(this._convertAlignmentFromNativeToWebDefine(val));
            return;
        }
        this._richText.setAlignmentHorizontal(val);
    },

    setDefaultAlignVertical:function(val) {
        if(!cc.sys.isNative) {
            this._richText.setTextVerticalAlignment(this._convertAlignmentFromNativeToWebDefine(val));
            return;
        }
        this._richText.setAlignmentVertical(val);
    },

    setTouchListener:function(listener) {
        this._listener = listener;
    },

    appendText:function(text, font, size, color, opacity, enableTouch) {
        var el = new ccui.RichElementText(
            this.getAutoId(),
            (color) ? color : this._color,
            (opacity) ? opacity : 255,
            text,
            (font) ? font : this._font,
            (size) ? parseInt(size) : this._size
        );
        if (enableTouch) {
            el.setTouchEnabled(true, this.onElementTouch.bind(this));
        }
        this._richText.pushBackElement(el);
        this._richText.formatText();
    },

    onElementTouch:function(id, type) {
        if (this._listener) {
            this._listener(id, type);
        }
    },

    clearText:function() {
        for (var i = 0; i < this._curId; ++i) {
            this._richText.removeElement(0);
        }
        this._curId = 0;
    },

    getAutoId:function() {
        return ++this._curId;
    },

    setString:function(text) {
        this.clearText();

        var splitArr = [];

        var tmpStr = text;
        while (true) {
            var index1 = tmpStr.indexOf("<");
            if (index1 == 0) {
                index1 = tmpStr.indexOf("<", 1);
            }
            if (index1 < 0) {
                splitArr.push(tmpStr);
                break;
            }

            splitArr.push(tmpStr.substr(0, index1));
            tmpStr = tmpStr.substr(index1);
        }

        var tmp1 = [];
        for (var i = 0; i < splitArr.length; ++i) {
            var tmpIdx = splitArr[i].indexOf(">");
            if (tmpIdx < 0) {
                tmp1.push(splitArr[i]);
                continue;
            }
            tmp1.push(splitArr[i].substr(0, tmpIdx + 1));
            if (tmpIdx + 1 < splitArr[i].length) {
                tmp1.push(splitArr[i].substr(tmpIdx + 1));
            }
        }

        var isCreateNewElement = false;
        var obj;
        var numTag = 0;
        for (var i = 0; i < tmp1.length; ++i) {
            if (isCreateNewElement == false) {
                numTag = 0;
                obj = {};
                isCreateNewElement = true;
            }

            if (tmp1[i].indexOf("</") < 0 && tmp1[i].indexOf("<") < 0) {
                obj.text = tmp1[i];
                if (numTag == 0) {
                    // begin or end of text -> use default format
                    this.appendText(obj.text);
                    isCreateNewElement = false;
                }
                continue;
            }
            if (tmp1[i].indexOf("</") < 0 && tmp1[i].indexOf("<") >= 0) {
                // have override format
                numTag++;
                var oneTag = tmp1[i];
                obj[oneTag.substr(1, oneTag.indexOf(" ") - 1)] = oneTag.substr(oneTag.lastIndexOf(" ") + 1, oneTag.indexOf(">") - oneTag.lastIndexOf(" ") - 1);
                continue;
            }
            if (tmp1[i].indexOf("</") >= 0) {
                // end of format
                numTag--;
                if (numTag <= 0) {
                    //cc.log(JSON.stringify(obj));
                    this.appendText(obj["text"], obj["font"], obj["size"], cc.color[obj["color"]], obj["opacity"], obj["touch"]?(obj["touch"] == "true")?true:false:false);
                    isCreateNewElement = false;
                }
            }
        }
    }
})