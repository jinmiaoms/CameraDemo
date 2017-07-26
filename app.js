'use strict';

var httpReq = require('request');

var accessStr = 'accessToken=at.5gsgxsz92uuhxnyn41dpfuru87lno9k6-1l8wr7bzxd-1gjxks5-bpn5qgzv2&deviceSerial=736177818&channelNo=1';
var alarmURLBase = 'https://open.ys7.com/api/lapp/alarm/list' + '?' +
                    accessStr + 'status=2';
var captureURL = 'https://open.ys7.com/api/lapp/device/capture' + '?' + accessStr;
var picUrl;

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

    // Display the image.
    var sourceImageUrl = document.getElementById("inputImage").value;
    document.querySelector("#sourceImage").src = sourceImageUrl;

    var option = {
        url: uriBase + '?' + paramsStr,
        headers: {
            'Content-Type': 'application/json',
            'Ocp-Apim-Subscription-Key': subscriptionKey
        },
        data: '{"url": ' + '"' + picUrl + '"}'
    };

    // Perform the REST API call.
    $.ajax({
        url: uriBase + "?" + $.param(params),

        // Request headers.
        beforeSend: function (xhrObj) {
            xhrObj.setRequestHeader("Content-Type", "application/json");
            xhrObj.setRequestHeader("Ocp-Apim-Subscription-Key", subscriptionKey);
        },

        type: "POST",

        // Request body.
        data: '{"url": ' + '"' + sourceImageUrl + '"}',
    })

        .done(function (data) {
            // Show formatted JSON on webpage.
            $("#responseTextArea").val(JSON.stringify(data, null, 2));
        })

        .fail(function (jqXHR, textStatus, errorThrown) {
            // Display error message.
            var errorString = (errorThrown === "") ? "Error. " : errorThrown + " (" + jqXHR.status + "): ";
            errorString += (jqXHR.responseText === "") ? "" : (jQuery.parseJSON(jqXHR.responseText).message) ?
                jQuery.parseJSON(jqXHR.responseText).message : jQuery.parseJSON(jqXHR.responseText).error.message;
            alert(errorString);
        });
};

getAlarms(5);
