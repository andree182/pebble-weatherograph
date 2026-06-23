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
TYPE_STATUS = 5;
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

var tosend = [];
var currentProvider = parseInt(localStorage.getItem('provider') || '0', 10);

var aladin2icon = [];
aladin2icon["wi_day"] = W_ICON_CLEAR_DAY;
aladin2icon["wi_day_cloud"] = W_ICON_PARTLY_CLOUDY_DAY;
aladin2icon["wi_day_cloud_rain"] = W_ICON_RAIN;
aladin2icon["wi_day_cloud_snow"] = W_ICON_SNOW;
aladin2icon["wi_night"] = W_ICON_CLEAR_NIGHT;
aladin2icon["wi_night_cloud"] = W_ICON_PARTLY_CLOUDY_NIGHT;
aladin2icon["wi_night_cloud_rain"] = W_ICON_RAIN;
aladin2icon["wi_night_cloud_snow"] = W_ICON_SNOW;

aladin2icon["wi_cloud"] = W_ICON_CLOUDY;
aladin2icon["wi_cloud_rain"] = W_ICON_RAIN;
aladin2icon["wi_cloud_rain_light"] = W_ICON_DRIZZLE;
aladin2icon["wi_cloud_rain_medium"] = W_ICON_RAIN;
aladin2icon["wi_cloud_rain_heavy"] = W_ICON_RAIN;
aladin2icon["wi_cloud_snow"] = W_ICON_HEAVY_SNOW;
aladin2icon["wi_cloud_snow_light"] = W_ICON_SNOW;
aladin2icon["wi_cloud_snow_medium"] = W_ICON_SNOW;
aladin2icon["wi_cloud_snow_heavy"] = W_ICON_HEAVY_SNOW;

function metno2icon(symbolCode) {
    if (!symbolCode) return W_ICON_NOT_AVAILABLE;
    
    // Normalize to lowercase
    var code = symbolCode.toLowerCase();
    
    var isNight = (code.indexOf('night') !== -1 || code.indexOf('polarnight') !== -1);
    
    if (code.indexOf('thunder') !== -1) {
        if (!isNight && (code.indexOf('sun') !== -1 || code.indexOf('showers') !== -1)) {
            return W_ICON_THUNDER_SUN;
        }
        return W_ICON_THUNDER;
    }
    
    if (code.indexOf('sleet') !== -1) {
        if (code.indexOf('snow') !== -1) return W_ICON_SNOW_SLEET;
        if (code.indexOf('rain') !== -1) return W_ICON_RAIN_SLEET;
        return W_ICON_SLEET;
    }
    
    if (code.indexOf('snow') !== -1) {
        if (code.indexOf('rain') !== -1) return W_ICON_RAIN_SNOW;
        if (code.indexOf('heavy') !== -1) return W_ICON_HEAVY_SNOW;
        return W_ICON_SNOW;
    }
    
    if (code.indexOf('rain') !== -1) {
        if (code.indexOf('light') !== -1) return W_ICON_DRIZZLE;
        if (!isNight && (code.indexOf('sun') !== -1 || code.indexOf('showers') !== -1)) {
            return W_ICON_RAIN_SUN;
        }
        return W_ICON_RAIN;
    }
    
    if (code.indexOf('fog') !== -1 || code.indexOf('mist') !== -1) {
        return W_ICON_FOG;
    }
    
    if (code.indexOf('wind') !== -1) {
        return W_ICON_WIND;
    }
    
    if (code.indexOf('cloudy') !== -1) {
        if (code.indexOf('partly') !== -1) {
            return isNight ? W_ICON_PARTLY_CLOUDY_NIGHT : W_ICON_PARTLY_CLOUDY_DAY;
        }
        if (code.indexOf('mostly') !== -1 || code.indexOf('heavy') !== -1) {
            return isNight ? W_ICON_CLOUDY : W_ICON_MOSTLY_CLOUDY_DAY;
        }
        return W_ICON_CLOUDY;
    }
    
    if (code.indexOf('fair') !== -1) {
        return isNight ? W_ICON_FAIR_NIGHT : W_ICON_FAIR_DAY;
    }
    
    if (code.indexOf('clearsky') !== -1 || code.indexOf('clear') !== -1) {
        return isNight ? W_ICON_CLEAR_NIGHT : W_ICON_CLEAR_DAY;
    }
    
    return W_ICON_NOT_AVAILABLE;
}

function findClosestEntry(timeseries, targetTimeMs) {
    var closestEntry = timeseries[0];
    var minDiff = Math.abs(new Date(closestEntry.time).getTime() - targetTimeMs);
    
    for (var k = 1; k < timeseries.length; k++) {
        var diff = Math.abs(new Date(timeseries[k].time).getTime() - targetTimeMs);
        if (diff < minDiff) {
            minDiff = diff;
            closestEntry = timeseries[k];
        }
    }
    return closestEntry;
}

var xhrRequest = function (url, type, callback, errback) {
  var xhr = new XMLHttpRequest();
  xhr.onload = function () {
    if (xhr.status >= 200 && xhr.status < 300) {
      callback(this.responseText);
    } else {
      console.log('HTTP status ' + xhr.status + ' for ' + url);
      if (errback) errback(new Error('HTTP status ' + xhr.status));
    }
  };
  xhr.onerror = function () {
    console.log('Network error for ' + url);
    if (errback) errback(new Error('Network error'));
  };
  xhr.open(type, url);
  xhr.setRequestHeader('User-Agent', 'Pebble-Weatherograph/0.4 (https://github.com/coredevices/pebble-weatherograph)');
  xhr.send();
};

function parseFloatArray(output, type, arr)
{
    var STEP = 40;

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
    var rv = [];
    for (var i = 0; i < sky.length; i++) {
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

    // Doesn't work on iOS, so for now let's go dumber way...
    // var d = new Date(json.forecastTimeIso);
    // var hours = d.getHours();
    var hours = parseInt(json.forecastTimeIso.substr(11, 2));
    output.push({'COMM_TYPE': TYPE_FIRST_TIME, 'COMM_DATA': hours});

    parseFloatArray(output, TYPE_TEMPERATURE, json.parameterValues.TEMPERATURE);
    parseFloatArray(output, TYPE_PRECIPITATION, json.parameterValues.PRECIPITATION_TOTAL);
    parseFloatArray(output, TYPE_PRECIPITATION_SNOW, json.parameterValues.PRECIPITATION_SNOW);
    parseAladinSky(output, TYPE_SKY, json.weatherIconNames);
    output.push({'COMM_TYPE': TYPE_EOF});

    output.unshift({'COMM_TYPE': TYPE_DATA_COUNT, 'COMM_DATA': output.length});
    return output;
}

function parseMetNo(json) {
    var output = [];

    // Extract the timeseries array
    var timeseries = json.properties.timeseries;
    if (!timeseries || timeseries.length === 0) {
        throw new Error('Empty timeseries');
    }

    var startTimeMs = new Date(timeseries[0].time).getTime();
    var firstTimeIso = timeseries[0].time;
    var d = new Date(firstTimeIso);
    var hours = d.getHours();
    
    output.push({'COMM_TYPE': TYPE_FIRST_TIME, 'COMM_DATA': hours});

    var temps = [];
    var precips = [];
    var snows = [];
    var skies = [];

    for (var i = 0; i < 55; i++) {
        var targetTimeMs = startTimeMs + i * 3600 * 1000;
        var entry = findClosestEntry(timeseries, targetTimeMs);
        
        var temp = 0.0;
        if (entry.data && entry.data.instant && entry.data.instant.details && entry.data.instant.details.air_temperature !== undefined) {
            temp = entry.data.instant.details.air_temperature;
        }
        temps.push(temp);

        var precip = 0.0;
        var symbol = "";
        if (entry.data) {
            if (entry.data.next_1_hours) {
                if (entry.data.next_1_hours.details && entry.data.next_1_hours.details.precipitation_amount !== undefined) {
                    precip = entry.data.next_1_hours.details.precipitation_amount;
                }
                if (entry.data.next_1_hours.summary && entry.data.next_1_hours.summary.symbol_code) {
                    symbol = entry.data.next_1_hours.summary.symbol_code;
                }
            } else if (entry.data.next_6_hours) {
                if (entry.data.next_6_hours.details && entry.data.next_6_hours.details.precipitation_amount !== undefined) {
                    precip = entry.data.next_6_hours.details.precipitation_amount / 6.0;
                }
                if (entry.data.next_6_hours.summary && entry.data.next_6_hours.summary.symbol_code) {
                    symbol = entry.data.next_6_hours.summary.symbol_code;
                }
            } else if (entry.data.next_12_hours) {
                if (entry.data.next_12_hours.details && entry.data.next_12_hours.details.precipitation_amount !== undefined) {
                    precip = entry.data.next_12_hours.details.precipitation_amount / 12.0;
                }
                if (entry.data.next_12_hours.summary && entry.data.next_12_hours.summary.symbol_code) {
                    symbol = entry.data.next_12_hours.summary.symbol_code;
                }
            }
        }
        precips.push(precip);

        var isSnow = (temp <= 1.0) || (symbol.indexOf('snow') !== -1 || symbol.indexOf('sleet') !== -1);
        var snow = isSnow ? precip : 0.0;
        snows.push(snow);

        var iconVal = metno2icon(symbol);
        skies.push(iconVal);
    }

    parseFloatArray(output, TYPE_TEMPERATURE, temps);
    parseFloatArray(output, TYPE_PRECIPITATION, precips);
    parseFloatArray(output, TYPE_PRECIPITATION_SNOW, snows);
    output.push({'COMM_TYPE': TYPE_SKY, 'COMM_DATA': skies});
    output.push({'COMM_TYPE': TYPE_EOF});

    output.unshift({'COMM_TYPE': TYPE_DATA_COUNT, 'COMM_DATA': output.length});
    return output;
}

function sendToApp(e)
{
    if (tosend.length == 0) {
        console.log('All data sent!');
        return;
    }

    var v = tosend[0];
    tosend.shift();

    Pebble.sendAppMessage(v,
        sendToApp,
        function(e) { console.log('Error sending weather info to Pebble!'); }
    );
}

// Listen for when the watchface is opened
Pebble.addEventListener('ready', function(e) {getWeather()});

// Listen for messages from C app (like provider changes)
Pebble.addEventListener('appmessage', function(e) {
    if (e.payload && e.payload.PROVIDER !== undefined) {
        var provider = e.payload.PROVIDER;
        currentProvider = provider;
        localStorage.setItem('provider', String(provider));
        getWeather();
    }
});

function notifyApp(str)
{
    Pebble.sendAppMessage({'COMM_TYPE': TYPE_STATUS, 'COMM_DATA': str},
        function(e) { /* success */ },
        function(e) { console.log('Error sending message to Pebble!'); }
    );
}

function locationSuccess(pos) {
    var lat = Math.round(pos.coords.latitude * 10000) / 10000;
    var lon = Math.round(pos.coords.longitude * 10000) / 10000;
    
    var url;
    if (currentProvider === 1) {
        // Aladin
        url = 'https://www.oblacno.cz/subdom/aladinonline/get_data.php?latitude=' + lat + '&longitude=' + lon;
    } else {
        // yr.no
        url = 'https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=' + lat + '&lon=' + lon;
    }

    notifyApp("forecast");
    xhrRequest(url, 'GET',
        function(responseText) {
            try {
                var json = JSON.parse(responseText);
                if (currentProvider === 1) {
                    tosend = parseAladin(json);
                } else {
                    tosend = parseMetNo(json);
                }

                notifyApp("data");
                sendToApp(0);
            } catch (e) {
                console.log('Error parsing weather response: ' + e);
                notifyApp("parse error");
            }
        },
        function(err) {
            notifyApp("http error");
        }
    );
}

function locationError(err) {
    console.log('Error requesting location!');
    notifyApp("location error, retrying...");
    
}

function getWeather() {
    var retryCount = 0;
    var MAX_RETRIES = 3;

    notifyApp("location");
    navigator.geolocation.getCurrentPosition(
        locationSuccess,
        function(error) {
            if (retryCount < MAX_RETRIES) {
                retryCount++;
                setTimeout(getWeather, 1000); 
            } else {
                locationError(error);
            }
        },
        {timeout: 5000, maximumAge: 60000}
    );
}
