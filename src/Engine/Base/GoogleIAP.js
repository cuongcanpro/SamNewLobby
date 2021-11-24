fr.googleIap = {

    init: function () {
        if (plugin.PluginManager != undefined) {
            var pluginManager = plugin.PluginManager.getInstance();
            if (pluginManager != null) {
                this.plugin = pluginManager.loadPlugin("IAPGooglePlay");
                if (this.plugin) {
                    this.plugin.setListener(this);

                    var listProductId = fr.paymentInfo.getAllProductsID().toString();
                    var licenseKey = fr.paymentInfo.getLicenseKey();

                    cc.log("listProductId: " + JSON.stringify(listProductId), + "\n" + licenseKey);
                    this.plugin.configDeveloperInfo({
                        listProductId: StringUtility.replaceAll(listProductId,",","|"),
                        GooglePlayAppKey: licenseKey
                    });
                }
            }
        }
    },

    requestPayProduct: function (productKey) {
        cc.log("--requestPayProduct : " + productKey);

        var productId = fr.paymentInfo.getProductID(productKey);
        if (this.plugin) {
            var paramMap = {};
            paramMap["IAPId"] = productId;
            paramMap["IAPSecKey"] = fr.paymentInfo.getLicenseKey();
            cc.log("requestPayProduct " + JSON.stringify(paramMap));
            this.plugin.payForProduct(paramMap);
            return true;
        }
        return false;
    },

    onPayResult: function (ret, msg) {
        cc.log("GOOGLE IAP", ret, msg);
        var obj = null;
        if(msg && msg.length > 0) {
            try {
                obj = JSON.parse(msg);
            }catch (e){
                obj = {};
            }
        }

        if(ret == plugin.ProtocolIAP.PayResultCode.PayFail) ret = IAPHandler.PURCHASE_ERROR;
        if(ret == plugin.ProtocolIAP.PayResultCode.PayTimeOut) ret = IAPHandler.PURCHASE_ERROR;
        if(ret == plugin.ProtocolIAP.PayResultCode.PayCancel) ret = IAPHandler.PURCHASE_CANCELED;
        if(ret == plugin.ProtocolIAP.PayResultCode.PaySuccess) ret = IAPHandler.PURCHASE_SUCCESS;

        iapHandler.onIAPPurchase(JSON.stringify({
            result  : ret,
            num : obj ? 1 : 0,
            data0 : obj ? JSON.stringify(obj.purchaseData) : "",
            signature0 : obj ? obj.signature : ""
        }));
    },

    finishTransactions: function (_purchaseData, signature) {
        var purchaseData = null;
        try {
            purchaseData = JSON.parse(_purchaseData);
        }
        catch(e) {

        }

        if (purchaseData) {

            if (purchaseData.productId === undefined) {
                return;
            }
            // send to finish purchase
            var data = {
                purchaseData: purchaseData,
                signature: signature
            };
            cc.log("--consumeItem " + JSON.stringify(data));
            if (this.plugin) {
                this.plugin.callFuncWithParam("consumePurchase",
                    plugin.PluginParam(plugin.PluginParam.ParamType.TypeString, JSON.stringify(data)));
            }
        }
    },

    getProductLocalCurrencyById: function (productKey) {
        var productId = fr.paymentInfo.getProductID(productKey);
        cc.log("DEBUG PRODUCT", productId, productKey);
        if (this.plugin) {
            return this.plugin.callStringFuncWithParam("getProductLocalCurrencyById",
                plugin.PluginParam(plugin.PluginParam.ParamType.TypeString, productId));
        }
        else {
            return "";
        }
    },

    getProductCurrency: function (productKey) {
        var productId = fr.paymentInfo.getProductID(productKey);
        if (this.plugin) {
            return this.plugin.callStringFuncWithParam("getProductLocalCurrencyById",
                plugin.PluginParam(plugin.PluginParam.ParamType.TypeString, productId));
        }
        else {
            return "";
        }
    },

    getProductPrice: function (productKey) {
        var productId = fr.paymentInfo.getProductID(productKey);
        if (this.plugin) {
            return this.plugin.callStringFuncWithParam("getProductLocalCurrencyById",
                plugin.PluginParam(plugin.PluginParam.ParamType.TypeString, productId));
        }
        else {
            return "";
        }
    }
};
