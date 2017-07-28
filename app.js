'use strict';

var httpReq = require('request');

var accessStr = 'accessToken=at.5gsgxsz92uuhxnyn41dpfuru87lno9k6-1l8wr7bzxd-1gjxks5-bpn5qgzv2&deviceSerial=736177818&channelNo=1';
var alarmURLBase = 'https://open.ys7.com/api/lapp/alarm/list' + '?' +
                    accessStr + 'status=2';
var captureURL = 'https://open.ys7.com/api/lapp/device/capture' + '?' + accessStr;
var picUrl = "https://s.yimg.com/ny/api/res/1.2/gHdeZYeIMSl6nC5Fz__2jw--/YXBwaWQ9aGlnaGxhbmRlcjtzbT0xO3c9NzQ0O2g9NDk2/http://media.zenfs.com/en/homerun/feed_manager_auto_publish_494/7ecd920c717cafe9754deada28caea9b";

const querystring = require('querystring');

function getSnapshot() {
    // Get alarm data
    getAlarms(5);
    // If > 1, do a capture
    // If successful, return image url
}

function alarmCallback(error, response, body) {
    if (!error && response.statusCode == 200) {
        var info = JSON.parse(body);
        var total = info.page.total;
        console.log("body: " + info);
        console.log("total: " + total);
        if (total > 0) {
            capture();
        }
    }
    else {
        console.log("error: " + error);
    }
}

function captureCallback(error, response, body) {
    if (!error && response.statusCode == 200) {
        var info = JSON.parse(body);
        picUrl = info.data.picUrl;
        console.log("body: " + info);
        console.log("picUrl: " + picUrl);
    }
    else {
        console.log("error: " + error);
    }
}

function getRequestBase(httpReq, url) {
    return {
        url: url,
        headers: {
            'User-Agent': 'request',
            'Content-Type': 'application/x-www-form-urlencoded',
            'Host': 'open.ys7.com'
        }
    }
}

function getAlarms(minAgo) {
    // build alarmURL with right startTime
    var d = new Date();
    //var d2 = d.setMinutes(d.getMinutes() - minAgo);
    var d2 = '1500883639099';
    console.log(d2);

    var timeStr = '&startTime=' + d2 + '&endTime=';
    var alarmURL = alarmURLBase + timeStr;

    var options = getRequestBase(httpReq, alarmURL);

    httpReq.post(options, alarmCallback);
   
}

function capture() {
    var options = getRequestBase(httpReq, captureURL);
    httpReq.post(options, captureCallback);
}

function showError(error) {
    if (!error) {
        var errInfo = JSON.parse(error);
        console.log("error code: " + errInfo.code);
        console.log("error message: " + errInfo.message);
    }
}

function processImage(picUrl) {
    // **********************************************
    // *** Update or verify the following values. ***
    // **********************************************

    // Replace the subscriptionKey string value with your valid subscription key.
    var subscriptionKey = "d1dc1e967e954b35b2d70cee1151cb5c";

    // Replace or verify the region.
    //
    // You must use the same region in your REST API call as you used to obtain your subscription keys.
    // For example, if you obtained your subscription keys from the westus region, replace
    // "westcentralus" in the URI below with "westus".
    //
    // NOTE: Free trial subscription keys are generated in the westcentralus region, so if you are using
    // a free trial subscription key, you should not need to change this region.
    var uriBase = "https://westus.api.cognitive.microsoft.com/face/v1.0/detect";

    // Request parameters.
    var params = {
        "returnFaceId": "true",
        "returnFaceLandmarks": "false",
        "returnFaceAttributes": "age,gender,headPose,smile,facialHair,glasses,emotion,hair,makeup,occlusion,accessories,blur,exposure,noise",
    };

    var paramsStr = querystring.stringify(params);
    console.log(paramsStr);

    var option = {
        url: uriBase + '?' + paramsStr,
        json: true,
        headers: {
            'Content-Type': 'application/json',
            'Ocp-Apim-Subscription-Key': subscriptionKey
        },
        body: {
            'url': picUrl
        }
    };

    httpReq.post(option, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var bodyStr = JSON.stringify(body[0]);
            console.log(bodyStr);
            var info = JSON.parse(bodyStr);
            console.log("body: " + info.faceAttributes);
        }
        else {
            if (error)
                showError(error);
            else
                console.log("statusCode: " + response.statusCode);
        }
    });
};

//getAlarms(5);
processImage(picUrl);

