/**
 * Created by HOANGNGUYEN on 7/20/2015.
 */
    
var engine = engine || {};

var BaseLayer  = cc.Layer.extend({
    
    ctor: function(id) {
        cc.Layer.prototype.ctor.call(this);

        this._hasInit = false;

        this._id = id;
        this._layout = null;
        this._bg = null;
        this._layoutPath = "";
        this._scale = -1;
        this._scaleRealX = -1;
        this._scaleRealY = -1;

        this.buttonIgnoreSounds = {};
        this.buttonIgnoreAllSound = false;

        this._layerGUI = null;
        this._aaPopup = false;

        this._showHideAnimate = false;
        this._bgShowHideAnimate = null;
        this._currentScaleBg = 1;

        this._enableBack = false;
        this.disableMouseEvent = false;
        this._listButton = [];
        if(this._scale  < 0)
        {
            if(sceneMgr.nDesignResolution == 0)
                this._scale = cc.director.getWinSize().width/Constant.WIDTH;
            else
                this._scale = cc.director.getWinSize().height/Constant.HEIGHT;

            this._scale = (this._scale > 1) ? 1 : this._scale;
        }

        this._scaleRealX = cc.director.getWinSize().width/Constant.WIDTH;
        this._scaleRealY = cc.director.getWinSize().height/Constant.HEIGHT;

        this._layerColor = new cc.LayerColor(cc.BLACK);
        this.addChild(this._layerColor);
        this._layerColor.setVisible(false);

        this._layerGUI = new cc.Layer();
        this._layerGUI.setLocalZOrder(999);
        this._layerGUI.setVisible(true);
        this.addChild(this._layerGUI);

        this._keyboardEvent = cc.EventListener.create({
            event:cc.EventListener.KEYBOARD,
            onKeyReleased:function(keyCode, event){
                if(keyCode == cc.KEY.back || keyCode == 27){
                    event.getCurrentTarget().backKeyPress();
                }
            }
        });
        cc.eventManager.addListener(this._keyboardEvent, this);
    },

    onEnter: function(){
        this.isShow = true;
        cc.Layer.prototype.onEnter.call(this);

        this._listener = cc.EventListener.create({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: true,
            onTouchBegan: function(touch,event){return true;},
            onTouchMoved: function(touch,event){},
            onTouchEnded: function(touch,event){}
        });

        this.setContentSize(cc.winSize);
        this.setAnchorPoint(0.5,0.5);

        if(!this._hasInit)
        {
            this._hasInit = true;
            this.customizeGUI();
        }

        this.onEnterFinish();
        if (sceneMgr.getRunningScene().getMainLayer() != this) {
            for (var i in this._listButton){
                sceneMgr.getRunningScene().getMainLayer()._listButton.push(this._listButton[i]);
            }
            sceneMgr.getRunningScene().getMainLayer().disableMouseEvent = true;
        }
        this.disableMouseEvent = false;
        if( 'mouse' in cc.sys.capabilities && !cc.sys.isNative) {
            cc.eventManager.addListener({
                event: cc.EventListener.MOUSE,
                onMouseMove: function(event){
                    var pointer = false;
                    var pos = event.getLocation(), target = event.getCurrentTarget();
                    if (!target.disableMouseEvent){
                        for (var i =0; i< target._listButton.length; i++){
                            if (target.hasContainMouse(target._listButton[i],pos)){
                                //cc.log(JSON.stringify(target._listButton.length))
                                pointer = true;
                                if (target._listButton[i] instanceof ccui.Button){
                                    target._listButton[i].setHighlighted(true);
                                } else {
                                    target._listButton[i].setColor(cc.color(255,255,255,0));
                                }
                            } else {

                                if (target._listButton[i] instanceof ccui.Button){
                                    target._listButton[i].setHighlighted(false);
                                } else {
                                    target._listButton[i].setColor(cc.color(200,200,200,0));
                                }
                            }
                        }
                        if (pointer){
                            cc.$("#gameCanvas").style.cursor = "pointer";

                        } else {
                            cc.$("#gameCanvas").style.cursor = "default";
                            //cc.log("change to mouse to default");
                            //cc.log(target)
                        }
                    }
                }
            }, this);
        }
    },

    onExit : function () {
        cc.Layer.prototype.onExit.call(this);

        if(this._aaPopup && this._cachePopup)
        {
            this.retain();
        }
        if (sceneMgr.getRunningScene().getMainLayer() != this) {
            sceneMgr.getRunningScene().getMainLayer().disableMouseEvent = false;
        }
        this.disableMouseEvent = true;
        this.isShow = false;
    },

    initWithJsonFile: function(json){
        this._layoutPath = json;
        var jsonLayout = ccs.load(json);
        this._layout = jsonLayout.node;
        this._layout.setContentSize(cc.director.getWinSize());
        ccui.Helper.doLayout(this._layout);
        this.addChild(this._layout);
        this.initGUI();
    },

    initWithBinaryFile: function(json){
        cc.log("LOAD JSON : " + json);

        var start = new Date().getTime();
        this._layoutPath = json;
        var jsonLayout = ccs.load(json);
        this._layout = jsonLayout.node;
        this._layout.setContentSize(cc.director.getWinSize());
        ccui.Helper.doLayout(this._layout);
        this.addChild(this._layout);

        var end = new Date().getTime();
        cc.log("## Time Load " + json + " : " + (end - start));

        this.initGUI();
        var end2 = new Date().getTime();
        cc.log("## Time Init " + json + " : " + (end2 - end));
    },

    initWithBinaryFileAndOtherSize: function (json, designSize) {
        cc.log("LOAD JSON : " + json);
        var start = new Date().getTime();
        var jsonLayout = ccs.load(json);
        this._layout = jsonLayout.node;

        var scale = 1;
        var size = cc.director.getWinSize();
        if (size.height === Constant.HEIGHT) {
            this._layout.setContentSize(cc.size(designSize.height * size.width / size.height, designSize.height));
            scale = size.height / designSize.height;
        } else {
            this._layout.setContentSize(cc.size(designSize.width, designSize.width * size.height / size.width));
            scale = size.width / designSize.width;
        }
        this._layout.setScale(scale);
        ccui.Helper.doLayout(this._layout);
        this.addChild(this._layout);

        var end = new Date().getTime();
        cc.log("## Time Load " + json + " : " + (end - start));

        this.initGUI();
        var end2 = new Date().getTime();
        cc.log("## Time Init " + json + " : " + (end2 - end));
    },

    setAsPopup : function (value,isCache) {
        this._aaPopup = value;
        this._cachePopup = isCache;

        if(value && this._layerGUI)
        {
            this._layerGUI.removeFromParent();
            this._layerGUI = null;
        }
    },

    customizeButton: function(name,tag,parent) {
        if(!this._layout)
            return;

        var button = null;
        if(parent)
        {
            button = ccui.Helper.seekWidgetByName(parent,name);
        }
        else
        {
            button = ccui.Helper.seekWidgetByName(this._layout,name);
        }

        if(!button)
            return null;
        button.setPressedActionEnabled(true);
        button.setTag(tag);
        button.addTouchEventListener(this.onTouchEventHandler,this);
        this._listButton.push(button);
        return button;
    },
    
    customButton : function (name, tag, parent,action) {
        if(action === undefined)
            action = true;

        var btn = this.getControl(name,parent);
        if(!btn) return null;
        btn.setPressedActionEnabled(action);
        btn.setTag(tag);
        btn.addTouchEventListener(this.onTouchEventHandler,this);
        this._listButton.push(btn);
        return btn;
    },

    ignoreButtonSound : function (id) {
        this.buttonIgnoreSounds[id] = true;
    },

    ignoreAllButtonSound : function () {
        this.buttonIgnoreAllSound = true;
    },

    hasContainMouse: function(btn,pos){
        var realPos = btn.getParent().convertToWorldSpace(btn.getPosition());
        var width = btn.getBoundingBox().width;
        var height = btn.getBoundingBox().height;
        if (!btn.isVisible() || !btn.getParent().isVisible()) return false;
        return (realPos.x-width/2 <= pos.x && realPos.x + width/2 > pos.x && (realPos.y - height/2 <= pos.y && realPos.y + height/2 > pos.y));
    },

    setLabelText : function (text, control) {
        if(typeof  text === 'undefined') return;
        if(typeof  control === 'undefined') return;
        if(control == null) return;
        if(typeof  control.getString() === 'undefined') return;

        var str = control.getString();
        var l1 = str.length;
        var l2 = text.length;

        if(control.subText !== undefined)
        {
            l1 = control.subText;

            if(l2 <= l1)
            {
                control.setString(text);
            }
            else
            {
                control.setString(text.substring(0,l1-2) + "...");
            }
        }
        else if(control.wrapText !== undefined)
        {
            var s1 = control.width;
            var num = text.length;
            var str = "";
            var result = "";
            for(var i = 0 ; i < num ; i++)
            {
                str += text.charAt(i);
                result += text.charAt(i);
                control.setString(str);
                if(text.charAt(i) == " ")
                {
                    if(control.width > s1)
                    {
                        result += "\n";
                        str = "";
                    }
                }
            }
            control.setString(result);
        }
        else if(control._customSize !== undefined)
        {
            var s1 = control.width;
            var num = text.length;
            var str = "";
            var row = "";
            var result = "";
            var label = new ccui.Text();
            label.setFontName("fonts/tahoma.ttf");
            label.setFontSize(17);
            label.ignoreContentAdaptWithSize(true);
            for(var i = 0 ; i < num ; i++)
            {
                str += text.charAt(i);
                if(text.charAt(i) == " ")
                {
                    row += str;
                    label.setString(row);
                    if (label.getContentSize().width > s1*0.9){
                        row = row.substr(0,row.length-str.length-1);
                        row += "\n";
                        result += row;
                        row = str;
                    }
                    str = "";
                }

            }
            row += str;
            result += row;
            control.setString(result);
        }
        else
        {
            control.setString(text);
        }
    },

    getControl : function (cName,parent) {
        var p = null;
        var sParent = "";
        if(typeof  parent === 'undefined')
        {
            p = this._layout;
            sParent = "layout";
        }
        else if(typeof parent === 'string')
        {
            p = ccui.Helper.seekWidgetByName(this._layout,parent);
            sParent = parent;
        }
        else
        {
            p = parent;
            sParent = "object";
        }

        if(p == null)
        {
            cc.log("ERROR : parent getControl " + cName + "/" + sParent );
            return null;
        }
        var control = ccui.Helper.seekWidgetByName(p,cName);
        if (control == null) control = p.getChildByName(cName);
        if (control == null)
        {
            cc.log("ERROR : getControl " + cName + "/" + sParent );
            return null;
        }
        this.analyzeCustomControl(control);
        control.defaultPos = control.getPosition();
        return control;
    },

    processScaleControl : function (control,direct) {
        if(direct === undefined)
        {
            control.setScale(this._scale);
        }
        else if(direct == 1)
        {
            control.setScaleX(this._scale);
        }
        else
        {
            control.setScaleY(this._scale);
        }
    },

    analyzeCustomControl : function (control) {
        if(control.customData === undefined)
        {
            if(control.getTag() < 0) // scale theo ty le nho nhat
            {
                this.processScaleControl(control);
            }
            return;
        }

        var s = control.customData;

        if(s.indexOf("scale") > -1) // scale theo ty le nho nhat
        {
            if(s.indexOf("scaleX") > -1)
            {
                this.processScaleControl(control,1);
            }
            else if(s.indexOf("scaleY") > -1)
            {
                this.processScaleControl(control,0);
            }
            else
            {
                this.processScaleControl(control);
            }
        }

        if(s.indexOf("subText") > -1 && control["subText"] == null) // set text gioi han string
        {
            control["subText"] = control.getString().length;
        }

        if(s.indexOf("wrapText") > -1 && control["wrapText"] == null) // set text cat strign xuong dong
        {
            control["wrapText"] = control.getString().length;
        }
    },

    processListControl : function (name, num) {
        if(name === undefined || num === undefined) return;

        for(var i = 0 ; i < num ; i++)
        {
            this.getControl(name + i);
        }
    },

    setFog: function(bool,alpha){
        if(alpha === undefined) alpha = 205;
        this._layerColor.setVisible(true);
        cc.eventManager.addListener(this._listener,this);
        this._layerColor.runAction(cc.fadeTo(0.25,alpha));
    },

    enableFog : function() {
        this._fog = new cc.LayerColor(cc.BLACK);
        this._fog.setVisible(true);
        this.addChild(this._fog,-999);

        this._listener = cc.EventListener.create({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: true,
            onTouchBegan: function(touch,event){return true;},
            onTouchMoved: function(touch,event){},
            onTouchEnded: function(touch,event){}
        });

        cc.eventManager.addListener(this._listener,this);
        this._fog.runAction(cc.fadeTo(.25,150));
    },

    setDelayInit : function (time) {
        if(time === undefined)
            time = BaseLayer.TIME_APPEAR_GUI;
        if(time < BaseLayer.TIME_APPEAR_GUI)
            time = BaseLayer.TIME_APPEAR_GUI;

        this.runAction(cc.sequence(cc.delayTime(time),cc.callFunc(this.functionDelayInit,this)));
    },
    
    setShowHideAnimate : function (parent,customScale) {
        this._showHideAnimate = true;
        if(parent === undefined)
        {
            this._bgShowHideAnimate = this._layout;
        }
        else
        {
            this._bgShowHideAnimate = parent;
        }

        if(customScale === undefined)
        {
            customScale = false;
        }
        this._currentScaleBg = customScale?this._scale : 1;

        this._bgShowHideAnimate.setScale(0.5*this._currentScaleBg);
        this._bgShowHideAnimate.setOpacity(0);
        this._bgShowHideAnimate.runAction(cc.sequence(cc.spawn(new cc.EaseBackOut(cc.scaleTo(0.3,this._currentScaleBg)),cc.fadeIn(0.3)),cc.callFunc(this.finishAnimate,this)));

        if(this._layerColor)
        {
            this._layerColor.setVisible(true);
            this._layerColor.runAction(cc.fadeTo(0.3,150));
        }

        if(this._fog)
        {
            this._fog.setVisible(true);
            this._fog.runAction(cc.fadeTo(0.3,150));
        }
    },

    onClose : function () {
        if(this._layerColor && this._layerColor.isVisible())
            this._layerColor.runAction(cc.fadeTo(0.3,0));

        if(this._fog && this._fog.isVisible())
            this._fog.runAction(cc.fadeTo(0.3,0));

        if(this._showHideAnimate)
        {
            this._bgShowHideAnimate.setScale(this._currentScaleBg);
            this._bgShowHideAnimate.runAction(cc.spawn(new cc.EaseBackIn(cc.scaleTo(0.2,0.2)),cc.fadeOut(0.2)));
            this.runAction(cc.sequence(cc.delayTime(0.2),cc.callFunc(this.onCloseDone.bind(this))));
        }
        else
        {
            this.onCloseDone();
        }
    },

    onCloseDone : function () {
        cc.log("REMOVE FROM PARENT ");
        this.removeFromParent(cc.sys.isNative); // neu la ban web khong remove, vi remove se xoa het eventListener khi cache
    },

    setBackEnable : function (enable) {
        this._enableBack = enable;
    },
    
    backKeyPress : function () {
        if(!this._enableBack) return;

        this.onBack();
    },

    checkGuiAvailable : function (tag,id) {
        if(tag === undefined) return false;
        var g = this.getChildByTag(tag);
        if(g !== undefined && g != null)
        {
            if(id === undefined) return true;
            if(g._id !== undefined && g._id == id) return true;
        }

        return false;
    },
    
    resetDefaultPosition : function (control) {
        if(control === undefined) return;

        try
        {
            if(control.defaultPos === undefined) control.defaultPos = control.getPosition();
            else control.setPosition(control.defaultPos);
        }
        catch(e)
        {

        }
    },

    /************ touch event handler *************/
    onTouchEventHandler: function(sender,type){
        switch (type){
            case ccui.Widget.TOUCH_BEGAN:
                this.onButtonTouched(sender,sender.getTag());
                break;
            case ccui.Widget.TOUCH_ENDED:
                if (!sender.notPlaySound || sender.notPlaySound === false)
                    this.playSoundButton(sender.getTag());

                this.onButtonRelease(sender,sender.getTag());
                fr.crashLytics.logPressButton(this._id + sender.getTag());
                break;
        }
    },
    ////////////////////////////////////////////

    /******* functions need override  *******/
    customizeGUI: function(){
        /*    override meeeeeeeeee  */
    },

    onEnterFinish : function () {

    },

    onButtonRelease: function(button,id){
        /*    override meeeeeeeeee  */
    },

    onButtonTouched: function(button,id){
        /*    override meeeeeeeeee  */
    },

    onUpdateGUI: function(data){

    },

    initGUI : function () {

    },
    
    functionDelayInit : function () {

    },
    
    finishAnimate : function () {
    },
    
    onBack : function () {
        
    },

    playSoundButton: function(id){
        //cc.log("++PlayButotn : " + id + " in " + JSON.stringify(this.buttonIgnoreSounds) + " and " + this.buttonIgnoreAllSound);
        if(this.buttonIgnoreSounds[id]) return;
        if(this.buttonIgnoreAllSound) return;

        //cc.log("--haha");
        if (gamedata.sound) {
            cc.audioEngine.playEffect(lobby_sounds.click, false);
        }
    }
    //////////////////////////////////////////////////////
});

/*
 * CREATE CONTROL
 */
BaseLayer.createLabelText = function (txt,color) {
    var ret = new ccui.Text()
    ret.setAnchorPoint(cc.p(0.5, 0.5));
    ret.setFontName(SceneMgr.FONT_NORMAL);
    ret.setFontSize(17);
    ret.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_LEFT);
    if(txt !== undefined) ret.setString(txt);
    if(color !== undefined) ret.setColor(color);
    return ret;
};

BaseLayer.createEditBox = function (tf) {
    var ret = new cc.EditBox(tf.getContentSize(), new cc.Scale9Sprite());
    ret.setFontName(tf.getFontName());
    ret.setFontSize(tf.getFontSize());
    ret.setPlaceHolder(tf.getPlaceHolder());
    ret.setPlaceholderFontName(tf.getFontName());
    ret.setPlaceholderFontSize(tf.getFontSize());
    ret.setPosition(tf.getPosition());
    ret.setAnchorPoint(tf.getAnchorPoint());
    ret.setReturnType(cc.KEYBOARD_RETURNTYPE_DONE);
    ret.setMaxLength(100);
    return ret;
};

BaseLayer.subLabelText = function (lb, str) {
    if(lb === undefined || lb == null) return;
    if(str === undefined || str == null) return;

    var lbStr = lb.getString();
    if("defaultString" in lb) lbStr = lb["defaultString"];

    var size = lbStr.length;
    if(str.length <= size)
    {
        lb.setString(str);
    }
    else
    {
        lb.setString(str.substring(0,size-2) + "...");
    }
};

BaseLayer.cloneLabel = function (lb) {
    var ret = BaseLayer.createLabelText();
    ret.setFontSize(lb.getFontSize());
    ret.setTextColor(lb.getTextColor());
    ret.setFontName(lb.getFontName());
    ret.setPosition(lb.getPosition());
    ret.setTextHorizontalAlignment(lb.getTextHorizontalAlignment());
    ret.setTextVerticalAlignment(lb.getTextVerticalAlignment());
    ret.setAnchorPoint(lb.getAnchorPoint());
    lb.getParent().addChild(ret);
    lb.setVisible(false);
    return ret;
};

BaseLayer.TIME_APPEAR_GUI = 0.35;

// RichText
var RichLabelText = cc.Node.extend({

    ctor : function () {
        this._super();

        this.listText = [];
    },

    /**
     * Array RichText Object
     * Object :
     *  + text
     *  + color
     *  + font
     *  + size
     */
    setText : function (txts) {
        if(!txts) return;

        this.removeAllChildren();
        this.listText = [];

        for(var i = 0, size = txts.length ; i < size ; i++)
        {
            var info = txts[i];

            var lb = BaseLayer.createLabelText();

            if(info.font) lb.setFontName(info.font);
            else lb.setFontName(SceneMgr.FONT_NORMAL);

            if(info.size) lb.setFontSize(info.size);
            else lb.setFontSize(SceneMgr.FONT_SIZE_DEFAULT);

            if(info.color) lb.setColor(info.color);
            else lb.setColor(sceneMgr.ccWhite);

            if(info.text) lb.setString(info.text);
            else lb.setString("");

            if(info.anchor) lb.setAnchorPoint(info.anchor);
            else lb.setAnchorPoint(cc.p(0,0));

            if(info.hAlign) lb.setTextHorizontalAlignment(info.hAlign);
            if(info.vAlign) lb.setTextVerticalAlignment(info.vAlign);

            lb.textInfo = info;
            this.addChild(lb);
            this.listText.push(lb);
        }

        this.updatePosition();
    },

    updateText : function (idx, txt) {
        this.listText[idx].textInfo.text = txt;
        this.updatePosition();
    },

    updatePosition : function () {
        var nextWidth = 0;
        for(var i = 0, size = this.listText.length ; i < size ; i++)
        {
            var lb = this.listText[i];
            lb.setString(lb.textInfo.text);
            lb.setPositionX(nextWidth);

            nextWidth = lb.getContentSize().width + lb.getPositionX() + 5;
        }
    },

    getWidth : function () {
        var retVal = 0;
        for(var i = 0, size = this.listText.length ; i < size ; i++)
        {
            var lb = this.listText[i];
            retVal += lb.getContentSize().width;
        }

        return retVal;
    },

    getHeight : function () {
        var maxHeight = 0;
        for(var i = 0, size = this.listText.length ; i < size ; i++)
        {
            var lb = this.listText[i];
            if(maxHeight < lb.getContentSize().height)
                maxHeight = lb.getContentSize().height;
        }

        return maxHeight;
    }
});

// NumberGroup

var NumberGroupCustom = cc.Node.extend({
    /*
       type: 0 la loai co chu, type: 1 la loai chi co so
     */
    ctor: function(resource, pad, type) {
        this._super();
        this.arrayChar = [];
        this.resource = resource;
        this.pad = pad;
        if (type)
            this.type = type;
        else
            this.type = 0;
    },

    setNumber: function(number) {
        for (var i = 0; i < this.arrayChar.length; i++) {
            this.arrayChar[i].removeFromParent();
        }
        this.arrayChar = [];
        var string = "";
        if (this.type == 0)
            string = StringUtility.formatNumberSymbol(number);
        else
            string = StringUtility.pointNumber(number);
        for (var i = 0; i < string.length; i++) {
            var image;
            if (string.charAt(i) != '.') {
                image = new cc.Sprite(this.resource + string.charAt(i) + ".png");
                cc.log("DU " + i + " " + (this.resource + string.charAt(i) + ".png"));
            }
            else {
                image = new cc.Sprite(this.resource + "Dot.png");
                cc.log("DU " + i + " " + (this.resource + "Dot.png"));
                //this.pad = -image.getContentSize().width * 0.4;
            }
            this.addChild(image);
            this.arrayChar.push(image);
        }
        var sum = 0;
        for (var i = 0; i < this.arrayChar.length; i++) {
            sum = sum + this.arrayChar[i].getContentSize().width + (i == 0 ? 0 : this.pad);
        }
        this.setContentSize(cc.size(sum, this.arrayChar[0].getContentSize().height));
        var startX = -sum * 0.5;
        for (var i = 0; i < this.arrayChar.length; i++) {
            if (string.charAt(i) == '.')
                this.arrayChar[i].setPositionY(-this.getContentSize().height * 0.5 + this.arrayChar[i].getContentSize().width * 0.8);
            this.arrayChar[i].setPositionX(startX + this.arrayChar[i].getContentSize().width * 0.5);
            startX = startX + this.arrayChar[i].getContentSize().width + this.pad;
        }
    },

    setString: function(number) {
        this.setNumber(number);
    }

})


var BaseImage = cc.Sprite.extend({
    ctor: function (res) {
        this._super(res);
    },

    setWidth: function (width) {
        var scale = width / this.getContentSize().width;
        this.setScaleX(scale);
    },

    setHeight: function (height) {
        var scale = height / this.getContentSize().height;
        this.setScaleY(scale);
    },

    getRealWidth: function () {
        return this.getContentSize().width * this.getScaleX();
    },

    getRealHeight: function () {
        return this.getContentSize().height * this.getScaleY();
    },

    setPos: function (x, y) {
        this.setPosition(x, y);
    }
})