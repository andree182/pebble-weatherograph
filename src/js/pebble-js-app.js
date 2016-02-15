/*
This file is part of Weather-O-Graph.
Copyright 2016 Andrej Krutak

Weather-O-Graph is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

Weather-O-Graph is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with boxyface.  If not, see <http://www.gnu.org/licenses/>.
*/

TYPE_FIRST_TIME = 0;
TYPE_TEMPERATURE = 1;
TYPE_PRECIPITATION = 2;
TYPE_SKY = 3;
TYPE_EOF = 4;
TYPE_ERROR = 5;
TYPE_DATA_COUNT = 6;
TYPE_PRECIPITATION_SNOW = 7;

W_ICON_CLEAR_DAY = 0;
W_ICON_FAIR_DAY = 1;
W_ICON_PARTLY_CLOUDY_DAY = 2;
W_ICON_MOSTLY_CLOUDY_DAY = 3;
W_ICON_CLOUDY = 4;
W_ICON_CLEAR_NIGHT = 5;
W_ICON_FAIR_NIGHT = 6;
W_ICON_PARTLY_CLOUDY_NIGHT = 7;
W_ICON_WIND = 8;
W_ICON_FOG = 9;
W_ICON_DRIZZLE = 10;
W_ICON_RAIN = 11;
W_ICON_RAIN_SLEET = 12;
W_ICON_SLEET = 13;
W_ICON_SNOW_SLEET = 14;
W_ICON_HEAVY_SNOW = 15;
W_ICON_SNOW = 16;
W_ICON_RAIN_SNOW = 17;
W_ICON_RAIN_SUN = 18;
W_ICON_THUNDER_SUN = 19;
W_ICON_THUNDER = 20;
W_ICON_COLD = 21;
W_ICON_HOT = 22;
W_ICON_PHONE_ERROR = 23;
W_ICON_NOT_AVAILABLE = 24;

var aladin2icon = [];
aladin2icon["wi_cloud"] = W_ICON_CLOUDY;
aladin2icon["wi_day"] = W_ICON_CLEAR_DAY;
aladin2icon["wi_day_cloud"] = W_ICON_PARTLY_CLOUDY_DAY;
aladin2icon["wi_day_cloud_rain"] = W_ICON_DRIZZLE;
aladin2icon["wi_night"] = W_ICON_CLEAR_NIGHT;
aladin2icon["wi_night_cloud"] = W_ICON_PARTLY_CLOUDY_NIGHT;
aladin2icon["wi_night_cloud_rain"] = W_ICON_DRIZZLE;
aladin2icon["wi_cloud_rain_light"] = W_ICON_DRIZZLE;
aladin2icon["wi_cloud_rain"] = W_ICON_RAIN;
aladin2icon["wi_cloud_snow_light"] = W_ICON_SNOW;
aladin2icon["wi_cloud_snow"] = W_ICON_HEAVY_SNOW;

//sampleData = '{"forecastTime":"Feb 13, 2016 1:00:00 PM","forecastTimeIso":"2016-02-13 13:00:00","parameterValues":{"PRESSURE":[99531.0,99467.94,99427.69,99388.06,99383.25,99340.81,99303.31,99242.875,99226.875,99167.25,99134.94,99099.31,99068.81,99030.0,99002.69,98994.31,98952.19,98940.75,98928.25,98938.0,98976.125,99004.375,99047.75,99053.81,99069.0,99107.56,99107.31,99142.25,99175.25,99213.56,99255.44,99283.81,99326.94,99413.81,99509.625,99545.94,99599.56,99710.06,99832.19,99936.44,100042.75,100161.69,100270.125,100392.5,100485.375,100565.125,100709.25,100758.125,100836.81,100882.19,100985.06,101093.875,101213.81,101358.875,101505.81],"WIND_SPEED":[0.56970996,0.77192,1.1390835,1.3988787,1.5529774,2.2690792,1.8005468,2.0399077,1.2840048,0.9823024,1.8438699,2.115743,1.7854062,2.0029008,2.157827,3.2805483,3.684424,3.9198468,4.1045904,4.1911025,4.4718223,4.6980405,5.3943944,5.6671286,5.8146734,5.5543704,3.7875113,2.8858504,1.2473345,0.52064294,0.5734912,1.1835525,1.3743062,0.6782194,0.3219788,0.95176,0.731615,1.2958518,2.4740255,3.285184,4.173953,3.5217872,3.0091474,2.8378305,2.5780094,3.0104363,2.3238935,3.6559596,3.5583172,4.3294725,4.204104,3.6560748,3.7532778,3.3701086,3.3542671],"WIND_GUST_DIRECTION":[85.36091,301.2024,329.38177,339.59396,293.51746,276.68994,278.04843,291.64624,284.8148,293.39764,330.90958,349.29575,343.85025,318.6965,319.7541,348.91635,359.41724,5.0928454,7.2301755,15.503611,24.23152,25.895435,28.56204,29.758928,35.650455,37.98027,38.786785,52.885784,50.0871,50.460926,150.11877,189.5479,172.6521,172.54442,301.90247,143.35144,142.99814,89.06913,104.26454,109.706345,117.41368,118.07689,122.630806,121.59534,118.40956,121.85417,128.02545,124.939865,127.0211,129.616,130.01273,127.88822,121.007645,115.25928,116.26839],"CLOUDS_LOW":[0.5469208,0.078125,0.375,0.4765625,0.640625,0.21875,0.3125,0.3203125,0.54296875,0.109375,0.203125,0.46875,0.71875,0.796875,0.8671875,0.9140625,0.8359375,0.7890625,0.6875,0.734375,0.6640625,0.6640625,0.5625,0.59375,0.6328125,0.5234375,0.00390625,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.03125,0.0625,0.3125,0.65625,0.75,0.8359375,0.921875,0.953125,0.859375,0.8828125,0.765625,0.640625,0.90625,0.4765625,0.6796875,0.44931066,0.703125,0.71485907,0.640625,0.5390625,0.65625],"PRECIPITATION_TOTAL":[9.378195E-4,9.378195E-4,0.0017940998,3.0636787E-5,1.5187263E-4,9.6678734E-5,2.5510788E-5,6.687641E-5,-3.4499168E-4,1.0204315E-4,-3.619194E-4,0.0010166168,0.32828712,0.2517929,0.43693542,0.18448448,0.110227585,0.0035219193,0.0043668747,1.20162964E-4,0.09121132,0.0324955,-0.0013656616,0.0034046173,8.163452E-4,0.0014019012,0.0025939941,4.6539307E-4,8.5258484E-4,7.5531006E-4,-2.2315979E-4,-0.0017852783,5.235672E-4,-8.46982E-4,4.6789646E-4,6.529093E-4,5.943775E-4,0.075973034,0.38362753,0.7989588,0.6017678,0.16940427,0.09969807,0.05063057,0.006038666,-0.0014591217,-3.6621094E-4,0.0012378693,6.771088E-5,-0.0010023117,0.001581192,-0.0022554398,9.384155E-4,-7.314682E-4,2.2220612E-4],"CLOUDS_HIGH":[1.5258993E-5,0.0,0.078125,0.28125,0.4140625,0.625,0.60546875,0.5234375,0.515625,0.06640625,0.1640625,0.390625,0.9765625,0.82421875,0.22265625,0.6796875,0.8984375,0.5703125,0.20703125,0.48828125,0.65234375,0.0,0.0,0.0,0.0,0.109375,0.24609375,0.2890625,0.37109375,0.4453125,0.6371781,0.73828125,0.8828125,0.82421875,0.890625,0.97265625,0.8984375,0.69921875,0.9375,0.828125,0.92578125,0.0,0.0,0.0,0.0,0.0,0.0,0.4140625,0.37890625,0.171875,0.0,0.0,0.0,0.0,0.08203125],"CLOUDS_MEDIUM":[0.8906555,0.71875,0.46875,0.3359375,0.09375,0.5859375,0.65625,0.6796875,0.796875,0.8984375,0.96875,0.984375,1.0,0.9921875,1.0,0.8828125,0.98465073,0.8125153,0.9765625,1.0,0.9921875,0.9609375,0.8125,0.3046875,0.0859375,0.0,0.0,0.41015625,0.78125,0.6171875,0.546875,0.6640625,0.7421875,0.859375,0.9417892,0.9921875,0.9921875,0.9921875,1.0,0.9921875,0.9921875,0.9140625,0.859375,0.8046875,0.5703125,0.44140625,0.5546875,0.5390625,0.234375,0.1484375,0.046875,0.046875,0.140625,0.09375,0.125],"CLOUDS_TOTAL":[0.94932556,0.74220276,0.6132965,0.74220276,0.808609,0.82032776,0.839859,0.8792267,0.9420166,0.9146271,0.9726715,0.98838806,1.0004425,1.0010071,0.996109,0.992218,1.\
//0003967,0.960968,0.9922638,0.996109,0.996109,0.97657776,0.88282776,0.66407776,0.6445465,0.57814026,0.25001526,0.5820465,0.8632965,0.78907776,0.8325653,0.8603668,0.94667053,0.9575653,0.98890686,1.0005798,1.0002747,1.0000916,0.996109,0.996109,0.996109,0.996109,0.9726715,0.96510315,0.86343384,0.78912354,0.95422363,0.86027527,0.8489227,0.60995483,0.7120209,0.73069763,0.6914673,0.5820465,0.72657776],"WIND_DIRECTION":[85.7782,301.35754,329.42984,306.5577,285.6468,276.6632,300.11227,291.69672,334.0371,290.60968,330.76465,344.04538,330.17343,317.5931,319.6523,348.9234,359.68768,5.1030965,5.720537,15.51764,26.563469,25.881851,28.579876,31.396608,37.85612,38.150597,53.599537,49.547222,50.963207,53.585487,150.08997,191.9699,172.71425,225.1119,313.7245,143.7145,90.50388,89.313354,104.17051,109.740265,117.47246,122.52644,121.50748,118.51771,118.179276,121.85919,116.34655,124.94795,130.64255,129.67725,128.64162,121.231964,116.02997,115.04194,119.13516],"APPARENT_TEMPERATURE":[3.7687073,4.248932,4.63443,4.7689514,3.7951722,2.8354554,1.8615783,1.4785217,1.3629456,1.7106018,0.7207092,0.73242795,0.48901975,0.5986389,0.7890686,0.29561162,-0.41015005,-0.107171535,0.24439096,0.7570863,1.4487367,1.5023499,2.9552307,3.5592346,4.162506,4.402252,6.4853578,7.207965,7.3226624,7.4862366,6.4215393,5.455719,4.5292053,5.724762,2.3175354,4.3246155,4.3768616,2.3734436,2.0700746,1.3373597,0.5341859,0.32837534,0.7148011,0.41182256,0.7509339,1.6051819,2.9653382,2.0544496,2.4724183,2.5732484,2.2451234,2.0004945,1.4148011,1.4306214,0.80293584],"WIND_GUST_SPEED":[1.4798185,1.9508394,2.7174244,3.1161835,3.2535722,4.3585544,4.37408,3.429931,4.606309,1.4940723,2.481223,4.1505494,3.4380171,3.6240783,4.1731896,6.5028644,7.4876857,7.7650056,8.481165,8.30319,9.289797,9.4888935,10.905974,11.511904,11.954401,11.750767,11.283326,7.556103,5.6088996,1.5935313,0.6906035,1.5664335,1.7052093,1.6911323,1.2763126,1.2108928,1.1406988,1.7649407,4.420323,6.5802183,8.395027,8.400858,7.0419493,5.9532895,5.6367025,6.215172,6.7499795,7.532519,7.658227,8.865466,9.001004,8.685265,8.23451,7.3916016,6.991698],"TEMPERATURE":[4.2687073,4.748932,5.13443,5.2689514,4.895172,3.9354553,2.9615784,2.5785217,1.8629456,2.2106018,1.8207092,1.832428,1.5890198,1.6986389,1.8890686,2.0956116,2.1898499,2.4928284,2.8443909,3.3570862,4.0487366,5.00235,6.4552307,8.059235,8.662506,8.902252,9.085358,9.007965,7.8226624,7.9862366,6.9215393,5.955719,5.0292053,6.224762,2.3175354,4.8246155,4.8768616,2.8734436,3.1700745,3.1373596,3.1341858,2.9283752,2.514801,2.2118225,2.5509338,3.405182,4.065338,4.6544495,5.072418,5.1732483,4.8451233,4.6004944,4.014801,3.2306213,2.6029358],"HUMIDITY":[0.6493158,0.65710396,0.6256966,0.6004644,0.62238973,0.6949362,0.7733129,0.79351145,0.8104555,0.7675598,0.7822467,0.8510078,0.926823,0.94827724,0.95487267,0.94395286,0.95657027,0.9357776,0.9321712,0.90132236,0.9195136,0.90546125,0.85717046,0.8020543,0.750678,0.70699394,0.67775685,0.66125494,0.69071406,0.6705052,0.71353924,0.7609307,0.8107143,0.76536876,0.9391126,0.83110833,0.84013706,0.93850636,0.9546955,0.9654484,0.967887,0.96849704,0.9724949,0.9782825,0.9632127,0.9162459,0.8449383,0.80588996,0.7768845,0.7619552,0.77264106,0.76980984,0.7626692,0.7905495,0.7974765],"PRECIPITATION_SNOW":[0.0,0.0,3.3473969E-4,-6.4373016E-6,6.556511E-5,8.356571E-5,1.5974045E-5,0.0,-2.399683E-4,2.8371811E-5,2.3841858E-5,2.0503998E-5,1.859665E-5,2.2888184E-5,6.67572E-5,9.584427E-5,4.7683716E-5,7.6293945E-6,9.536743E-6,5.722046E-6,3.8146973E-6,4.7683716E-6,0.0,0.0,0.0,0.0,0.0,9.536743E-7,0.0,9.536743E-7,5.722046E-6,2.0980835E-5,2.3841858E-5,1.04904175E-5,7.6293945E-6,1.9073486E-6,9.536743E-7,0.0,0.0,0.0,4.7683716E-6,1.9073486E-6,5.4359436E-5,-7.4386597E-4,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0]},"forecastLength":55,"weatherIconNames":["wi_cloud","wi_day_cloud","wi_night_cloud","wi_night_cloud","wi_cloud","wi_cloud","wi_cloud_rain_light","wi_cloud_rain_light","wi_cloud_rain_light","wi_cloud","wi_cloud","wi_day_cloud","wi_day_cloud","wi_day_cloud","wi_night_cloud","wi_night_cloud","wi_cloud","wi_cloud","wi_cloud","wi_cloud_rain_light","wi_cloud_rain_\
//light","wi_cloud","wi_day_cloud","wi_cloud","wi_day_cloud","wi_day_cloud","wi_night_cloud","wi_night_cloud"],"rainIntensity5":4.0,"rainIntensity4":2.0,"rainIntensity3":0.8,"rainIntensity2":0.2,"rainIntensity1":0.1,"minSnowFractionToShowFlakes":0.8}';

var xhrRequest = function (url, type, callback) {
  var xhr = new XMLHttpRequest();
  xhr.onload = function () {
    callback(this.responseText);
  };
  xhr.open(type, url);
  xhr.send();
};

function parseFloatArray(output, type, arr)
{
    var STEP = 8;

    for (i = 0; i < arr.length; i += STEP) {
        var rvPart = [];
        var offset = i;
        for (j = 0; j < STEP; j++) {
            if (i + j >= arr.length)
                break;
            v = arr[i + j];
            isNeg = (v < 0);
            v = Math.abs(v);
            vInt = Math.floor(v);
            vFloat = Math.floor((v - vInt) * 100);
            if (isNeg && vInt > 0)
                vInt += 128;
            if (isNeg && vInt == 0)
                vFloat += 128;

            rvPart.push(vInt);
            rvPart.push(vFloat);
        }
        output.push({'COMM_TYPE': type, 'COMM_OFFSET': offset, 'COMM_DATA': rvPart});
    }
}

function parseAladinSky(output, type, sky)
{
    rv = [];
    for (i = 0; i < sky.length; i++) {
        if (sky[i] in aladin2icon)
            rv.push(aladin2icon[sky[i]]);
        else {
            console.log(sky[i]);
            rv.push(W_ICON_NOT_AVAILABLE);
        }
    }
    output.push({'COMM_TYPE': type, 'COMM_DATA': rv});
}

function parseAladin(json) {
    var output = [];

    var d = new Date(json.forecastTimeIso);
    output.push({'COMM_TYPE': TYPE_FIRST_TIME, 'COMM_DATA': d.getHours()});

    parseFloatArray(output, TYPE_TEMPERATURE, json.parameterValues.TEMPERATURE);
    parseFloatArray(output, TYPE_PRECIPITATION, json.parameterValues.PRECIPITATION_TOTAL);
    parseFloatArray(output, TYPE_PRECIPITATION_SNOW, json.parameterValues.PRECIPITATION_SNOW);
    parseAladinSky(output, TYPE_SKY, json.weatherIconNames);
    output.push({'COMM_TYPE': TYPE_EOF});

    output.unshift({'COMM_TYPE': TYPE_DATA_COUNT, 'COMM_DATA': output.length})
    return output;
}

function sendToApp(e)
{
    if (tosend.length == 0) {
//        console.log('All sent!');
        return;
    }

    var v = tosend[0];
    tosend.shift();

//    console.log(JSON.stringify(v));

    Pebble.sendAppMessage(v,
        sendToApp,
        function(e) { console.log('Error sending weather info to Pebble!'); }
    );
}

function locationSuccess(pos) {
    var url = 'http://aladinonline.androworks.org/get_data.php?latitude=' +
              pos.coords.latitude + '&longitude=' + pos.coords.longitude;

    xhrRequest(url, 'GET',
    function(responseText) {
//        responseText = sampleData;

        var json = JSON.parse(responseText);
        tosend = parseAladin(json);

        sendToApp(0);
    }
  );
}

function locationError(err) {
    console.log('Error requesting location!');
}

function getWeather() {
  navigator.geolocation.getCurrentPosition(
    locationSuccess,
    locationError,
    {timeout: 15000, maximumAge: 60000}
  );
//    var x = {coords: {latitude: 50.15, longitude: 14.45}};
//    locationSuccess(x);
}

// Listen for when the watchface is opened
Pebble.addEventListener('ready', function(e) {getWeather()});
