var TutorialLayer = cc.Class.extend({
    ctor: function (bgParent, layer) {
        this.bgTutorial = ccui.Layout();
        this.bgTutorial.setContentSize(cc.winSize);
        this.bgTutorial.setBackGroundColor(cc.BLACK);
        this.bgTutorial.setBackGroundColorOpacity(200);
        this.bgTutorial.setBackGroundColorType(ccui.Layout.BG_COLOR_SOLID);
        this.bgTutorial.setAnchorPoint(cc.p(0, 0));
        bgParent.addChild(this.bgTutorial, 1);

        this.bgClipping = new cc.ClippingNode();

        this.layerDark = ccui.Layout();
        this.layerDark.setContentSize(cc.winSize);
        this.layerDark.setBackGroundColor(cc.BLACK);
        this.layerDark.setBackGroundColorOpacity(200);
        this.layerDark.setBackGroundColorType(ccui.Layout.BG_COLOR_SOLID);

        this.drawNode = new cc.DrawNode();
        var green = cc.color(0, 255, 0, 255);
        this.drawNode.drawRect(cc.p(0, 0), cc.p(0,0), green);

        this.bgClipping.setInverted(true);

        this.bgClipping.stencil = this.drawNode;
        this.bgClipping.addChild(this.layerDark);
        layer.addChild(this.bgClipping, 100);
    },

    addView: function (startPoint, size) {

        var green = cc.color(0, 255, 0, 255);
        this.drawNode.drawRect(startPoint, cc.p(startPoint.x + size.width, startPoint.y + size.height), green);
        this.bgClipping.stencil = this.drawNode;
    },

    clearTutorial: function () {
        this.drawNode = new cc.DrawNode();
    },

    addViewFromCenter: function (node, dx, dy) {
        if (!dx)
            dx = 0;
        if (!dy)
            dy = 0;
        var startPoint = node.getParent().convertToWorldSpace(node.getPosition());
        startPoint.x = startPoint.x - node.getContentSize().width * 0.5 + dx;
        startPoint.y = startPoint.y - node.getContentSize().height * 0.5 + dy;
        this.addView(startPoint, cc.size(node.getContentSize().width - 2 * dx, node.getContentSize().height - 2 * dy));
    }
})