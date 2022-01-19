/**
 * Created by HOANGNGUYEN on 8/5/2015.
 */

var LoginHelper = function(){};

LoginHelper.getRequest = function(url,data,timeout,onTimeout,onResponse,onError){
    var xhr = cc.loader.getXMLHttpRequest();
    //if(onTimeout)
    //    xhr["ontimeout"] = onTimeout;
    if(onResponse)
        xhr.onreadystatechange = onResponse;
    //if(timeout)
    //    xhr.timeout = timeout;

    if(onError)
        xhr["onerror"] = onError;

    xhr.open("POST",url);
    xhr.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
    xhr.send(data);

    return xhr;
};

LoginHelper.registerRequest = function (url,timeout,onTimeout,onResponse,onError, isGet) {
    var xhr = cc.loader.getXMLHttpRequest();
    if(onResponse)
        xhr.onreadystatechange = onResponse;

    if(onError)
        xhr["onerror"] = onError;

    var method = isGet ? "GET" : "POST";
    xhr.open(method,url,true);
    xhr.send();
    return xhr;
};