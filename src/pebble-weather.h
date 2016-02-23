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

#ifndef PEBBLEWEATHER_H
#define PEBBLEWEATHER_H

// unused
typedef enum {
#if 0
	W_ICON_CLEAR_DAY = 0,
	W_ICON_FAIR_DAY,
	W_ICON_PARTLY_CLOUDY_DAY,
	W_ICON_MOSTLY_CLOUDY_DAY,
	W_ICON_CLOUDY,
	W_ICON_CLEAR_NIGHT,
	W_ICON_FAIR_NIGHT,
	W_ICON_PARTLY_CLOUDY_NIGHT,
	W_ICON_WIND,
	W_ICON_FOG,
	W_ICON_DRIZZLE,
	W_ICON_RAIN,
	W_ICON_RAIN_SLEET,
	W_ICON_SLEET,
	W_ICON_SNOW_SLEET,
	W_ICON_HEAVY_SNOW,
	W_ICON_SNOW,
	W_ICON_RAIN_SNOW,
	W_ICON_RAIN_SUN,
	W_ICON_THUNDER_SUN,
	W_ICON_THUNDER,
	W_ICON_COLD,
	W_ICON_HOT,
	W_ICON_PHONE_ERROR,
	W_ICON_NOT_AVAILABLE,
	W_ICON_COUNT
#else
	W_ICON_COUNT = 5 * 5
#endif
} WeatherIcon;

enum {
	COMM_TYPE = 0,
	COMM_OFFSET = 1,
	COMM_DATA = 2,
};

enum {
	TYPE_FIRST_TIME = 0,
	TYPE_TEMPERATURE = 1,
	TYPE_PRECIPITATION = 2,
	TYPE_SKY = 3,
	TYPE_EOF = 4,
	TYPE_STATUS = 5,
	TYPE_DATA_COUNT = 6,
	TYPE_PRECIPITATION_SNOW = 7,
};

#endif // PEBBLEWEATHER_H
