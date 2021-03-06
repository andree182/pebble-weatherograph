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

#include <pebble.h>
#include "pebble-weather.h"

#define MAX_HOURS_COUNT (55)

static bool haveData = false;
static int dataCount = 1, curData = 0;
static time_t firstTime;
static int hoursCount;
static float temperature[MAX_HOURS_COUNT];
static float precipitation[MAX_HOURS_COUNT];
static float precipitation_snow[MAX_HOURS_COUNT];
static int sky[MAX_HOURS_COUNT];

static Window *window;
static Layer *displayLayer;
static int curPos, maxPos;
const int posSteps = 8;
static int screenWidth;
static GBitmap *hourlyIcons, *hourlyIcon[W_ICON_COUNT];
static int sceneW, sceneH;
static char infoStr[64] = "communication";

static void get_float_data(float *dest, int offset, int len, uint8_t *data)
{
	int i;
	if (offset + len > MAX_HOURS_COUNT)
		len = MAX_HOURS_COUNT - offset;
	for (i = 0; i < len; i++) {
		int16_t vI, vF;
		bool neg = false;
		vI = data[2 * i];
		vF = data[2 * i + 1];
		if (vI >= 128) {
			vI = vI - 128;
			neg = true;
		}
		if (vF >= 128) {
			vF = vF - 128;
			neg = true;
		}
		dest[offset + i] =
			((float)(neg ? -1 : 1)) * ((float)vI + ((float)vF) / 100);
	}
	if (offset + len > hoursCount)
		hoursCount = offset + len;
}

static void get_sky_data(int *sky, int len, uint8_t *data)
{
	int i;
	if (len > MAX_HOURS_COUNT)
		len = MAX_HOURS_COUNT;

	for (i = 0; i < len; i++)
		sky[i] = data[i];
}

static void inbox_received_callback(DictionaryIterator *iterator, void *context)
{
	Tuple *commType = dict_find(iterator, COMM_TYPE);
	Tuple *commOffset = dict_find(iterator, COMM_OFFSET);
	Tuple *commData = dict_find(iterator, COMM_DATA);

	if ((commType->value->int8 != TYPE_EOF) &&
		((commData == NULL) || (commData->value == NULL))
	) {
		APP_LOG(
			APP_LOG_LEVEL_ERROR,
			"Got unexpected NULL data for %d!", commType->value->int8
		);
		goto exit;
	}

	switch (commType->value->int8) {
	case TYPE_DATA_COUNT:
		dataCount = commData->value->int8;
		break;
	case TYPE_FIRST_TIME:
		firstTime = commData->value->int8 * 3600;
		curData++;
		break;
	case TYPE_TEMPERATURE:
		get_float_data(temperature, commOffset->value->int8, commData->length / 2, commData->value->data);
		curData++;
		break;
	case TYPE_PRECIPITATION:
		get_float_data(precipitation, commOffset->value->int8, commData->length / 2, commData->value->data);
		curData++;
		break;
	case TYPE_PRECIPITATION_SNOW:
		get_float_data(precipitation_snow, commOffset->value->int8, commData->length / 2, commData->value->data);
		curData++;
		break;
	case TYPE_SKY:
		get_sky_data(sky, commData->length, commData->value->data);
		curData++;
		break;
	case TYPE_EOF:
		haveData = true;
		break;
	case TYPE_STATUS:
		if (commData->length > sizeof(infoStr)) {
			strncpy(infoStr, "Bad string received", sizeof(infoStr));
		} else {
			memcpy(infoStr, commData->value->data, commData->length);
			infoStr[commData->length] = '\0';
		}
		break;
	}

exit:
	layer_mark_dirty(window_get_root_layer(window));
}

static void inbox_dropped_callback(AppMessageResult reason, void *context) {
	APP_LOG(APP_LOG_LEVEL_ERROR, "Message dropped!");
}

static void outbox_failed_callback(DictionaryIterator *iterator, AppMessageResult reason, void *context) {
	APP_LOG(APP_LOG_LEVEL_ERROR, "Outbox send failed!");
}

static void outbox_sent_callback(DictionaryIterator *iterator, void *context) {
	APP_LOG(APP_LOG_LEVEL_DEBUG, "Outbox send success!");
}

static void set_pos(int pos)
{
	Layer *windowLayer = window_get_root_layer(window);
	GRect bounds = layer_get_bounds(windowLayer);
	PropertyAnimation *s_property_animation;
	GRect from_frame, to_frame;

	if (!haveData)
		return;

	from_frame = GRect(-curPos, bounds.size.h / 2 - sceneH / 2, sceneW, sceneH);
	curPos = pos;
	to_frame = from_frame;
	to_frame.origin.x = -curPos;

	s_property_animation = property_animation_create_layer_frame(displayLayer, &from_frame, &to_frame);
	animation_schedule((Animation*) s_property_animation);
}

static void select_click_handler(ClickRecognizerRef recognizer, void *context)
{
#ifdef PBL_ROUND
	set_pos(-screenWidth / 3);
#else
	set_pos(0);
#endif
}

static void up_click_handler(ClickRecognizerRef recognizer, void *context)
{
	int pos = curPos - maxPos / posSteps;
#ifdef PBL_ROUND
	if (pos < -screenWidth / 3)
		pos = maxPos + screenWidth / 3;
#else
	if (pos < 0)
		pos = maxPos;
#endif
	set_pos(pos);
}

static void down_click_handler(ClickRecognizerRef recognizer, void *context)
{
	int pos = curPos + maxPos / posSteps;
#ifdef PBL_ROUND
	if (pos > maxPos + screenWidth / 3)
		pos = -screenWidth / 3;
#else
	if (pos > maxPos)
		pos = 0;
#endif
	set_pos(pos);
}

static void click_config_provider(void *context)
{
	window_single_click_subscribe(BUTTON_ID_SELECT, select_click_handler);
	window_single_click_subscribe(BUTTON_ID_UP, up_click_handler);
	window_single_click_subscribe(BUTTON_ID_DOWN, down_click_handler);
}

void printFloat(char *str, int strSize, float val, const char *suffix)
{
	int dec, flt;
	const char *minus = "";

	if (val < 0) {
		minus = "-";
		val = -val;
	}

	dec = (int)val;
	flt = ((int)(val * 10)) % 10;

	snprintf(str, strSize, "%s%d.%d%s", minus, dec, flt, suffix);
}

static void draw_icons(GContext *ctx, int w, int h)
{
	int i;

	for (i = 0; i < hoursCount / 2; i += 2) {
		graphics_draw_bitmap_in_rect(
			ctx, hourlyIcon[sky[i]],
			GRect((i * 2) * w / hoursCount - 10, -3, 20, 20)
		);
		graphics_draw_bitmap_in_rect(
			ctx, hourlyIcon[sky[i + 1]],
			GRect(((i + 1) * 2) * w / hoursCount - 10, 20 - 5, 20, 20)
		);
	}
}

static void draw_temp_annotations(
	GContext *ctx, int offset, int w, int h, int hGraphsOffset,
	float vMin, float vMax
)
{
	char tempText[32];

	/* temperature annotations */
	printFloat(tempText, sizeof(tempText), vMax, "°C");
	graphics_draw_text(
		ctx, tempText, fonts_get_system_font(FONT_KEY_GOTHIC_18_BOLD),
		GRect(offset, hGraphsOffset, w, 20),
		GTextOverflowModeTrailingEllipsis, GTextAlignmentLeft, NULL
	);

	printFloat(tempText, sizeof(tempText), (vMax + vMin) / 2, "°C");
	graphics_draw_text(
		ctx, tempText, fonts_get_system_font(FONT_KEY_GOTHIC_18_BOLD),
		GRect(offset, hGraphsOffset + h / 2, w, 20),
		GTextOverflowModeTrailingEllipsis, GTextAlignmentLeft, NULL
	);

	printFloat(tempText, sizeof(tempText), vMin, "°C");
	graphics_draw_text(
		ctx, tempText, fonts_get_system_font(FONT_KEY_GOTHIC_18_BOLD),
		GRect(offset, h + hGraphsOffset - 20, w, 20),
		GTextOverflowModeTrailingEllipsis, GTextAlignmentLeft, NULL
	);
}

/* Draw each 6 hours */
static void draw_time_annotations(GContext *ctx, int w, int yOff, int h)
{
	int curHour = firstTime / 3600;
	const int interval = 6;
	int startOffset;
	bool bigHour;
	int i;
	char buf[32];
	int w6h = 6 * w / hoursCount;

	if ((curHour % interval) == 0) {
		startOffset = 0;
	} else {
		int timeToNext = interval - (curHour % interval);
		startOffset = timeToNext;
		curHour += startOffset;
	}

	if ((curHour % (interval * 2)) == 0)
		bigHour = true;
	else
		bigHour = false;

	graphics_context_set_stroke_color(ctx, PBL_IF_COLOR_ELSE(GColorDarkGray, GColorWhite));
	graphics_context_set_antialiased(ctx, false);

	for (i = startOffset; i < hoursCount;) {
		int pos = i * w / hoursCount;
		graphics_context_set_stroke_width(ctx, bigHour ? 3 : 1);
		graphics_draw_line(
			ctx,
			GPoint(pos, yOff), GPoint(pos, yOff + h)
		);

		snprintf(buf, sizeof(buf), "%02dh", curHour);
		graphics_draw_text(
			ctx, buf, fonts_get_system_font(FONT_KEY_GOTHIC_14_BOLD),
			GRect(pos - w6h / 2, yOff - 15, w6h, 20),
			GTextOverflowModeTrailingEllipsis, GTextAlignmentCenter, NULL
		);

		bigHour = !bigHour;
		curHour = (curHour + interval) % 24;
		i += interval;
	}

	/* TODO: draw current time */
}

static inline int clamp(int max, int v)
{
	if (v > max)
		return max;
	else
		return v;
}

static void redraw_display(Layer *layer, GContext *ctx)
{
	int i;
	GRect bounds = layer_get_bounds(layer);
	const int w = bounds.size.w;
	const int h = bounds.size.h * 7 / 10;
	float vMin = temperature[0], vMax = temperature[0];
	float vDiff;
	const int hGraphsOffset = bounds.size.h * 3 / 10;

	graphics_context_set_fill_color(ctx, GColorBlack);
	graphics_fill_rect(ctx, bounds, 0, GCornerNone);

	if (!haveData) {
		graphics_draw_text(
			ctx, "Loading...", fonts_get_system_font(FONT_KEY_GOTHIC_24_BOLD),
			GRect(12, 0, bounds.size.w, 30),
			GTextOverflowModeTrailingEllipsis, GTextAlignmentLeft, NULL
		);
		graphics_draw_bitmap_in_rect(
			ctx, hourlyIcons,
			GRect(bounds.size.w / 3 / 2 - 50, bounds.size.h / 2 - 50, 100, 100 * curData / dataCount)
		);
		graphics_draw_text(
			ctx, infoStr, fonts_get_system_font(FONT_KEY_GOTHIC_24_BOLD),
			GRect(0, bounds.size.h - 30, screenWidth, 30),
			GTextOverflowModeTrailingEllipsis, GTextAlignmentRight, NULL
		);
		return;
	}

	for (i = 1; i < hoursCount; i++) {
		if (vMin > temperature[i])
			vMin = temperature[i];
		if (vMax < temperature[i])
			vMax = temperature[i];
	}
	vDiff = vMax - vMin;
	// let's not ever divide by zero
	if (vDiff == 0)
		vDiff = 0.001;

	draw_icons(ctx, w, hGraphsOffset);
	draw_time_annotations(ctx, w, hGraphsOffset, h);
	if ((vMax > 0) && (vMin < 0)) {
		/* zero temperature line */
		graphics_context_set_fill_color(ctx, PBL_IF_COLOR_ELSE(GColorBlueMoon, GColorLightGray));
		graphics_context_set_antialiased(ctx, false);
		graphics_context_set_stroke_width(ctx, 4);

		int zeroPos = hGraphsOffset + h * vMax / vDiff;
		graphics_fill_rect(ctx, GRect(0, zeroPos - 2, w, 4), 0, GCornerNone);
	}
	graphics_context_set_stroke_color(ctx, PBL_IF_COLOR_ELSE(GColorLightGray, GColorWhite));
	graphics_context_set_antialiased(ctx, false);
	graphics_context_set_stroke_width(ctx, 1);
	graphics_draw_line(ctx, GPoint(0, hGraphsOffset), GPoint(w, hGraphsOffset));
	graphics_draw_line(ctx, GPoint(0, hGraphsOffset + h / 2), GPoint(w, hGraphsOffset + h / 2));

	/* precipitation graph */
	graphics_context_set_antialiased(ctx, false);
	graphics_context_set_stroke_width(ctx, 0);
	for (i = 0; i < hoursCount; i++) {
		int v;

		graphics_context_set_fill_color(ctx, PBL_IF_COLOR_ELSE(GColorBlue, GColorLightGray));
		// 4mm/h is heavy rain, so let's clamp it around there
		v = clamp(h, precipitation[i] * h / 6);
		graphics_fill_rect(
			ctx,
			GRect(
				w * (2 * i - 1) / (2 * hoursCount),
				hGraphsOffset + h - v,
				w / hoursCount - 1, v
			), 0, GCornerNone
		);
		graphics_context_set_fill_color(ctx, PBL_IF_COLOR_ELSE(GColorWhite, GColorWhite));
		v = clamp(h, precipitation_snow[i] * h / 6);
		graphics_fill_rect(
			ctx,
			GRect(
				w * (2 * i - 1) / (2 * hoursCount),
				hGraphsOffset + h - v,
				w / hoursCount - 1, v
			), 0, GCornerNone
		);
	}

	/* temperature graph */
	graphics_context_set_stroke_color(ctx, PBL_IF_COLOR_ELSE(GColorOrange, GColorWhite));
	graphics_context_set_antialiased(ctx, true);
	graphics_context_set_stroke_width(ctx, 2);
	for (i = 0; i < hoursCount - 1; i++) {
		graphics_draw_line(
			ctx,
			GPoint(w * i / hoursCount, hGraphsOffset + h * (1 - (temperature[i] - vMin) / vDiff)),
			GPoint(w * (i + 1) / hoursCount, hGraphsOffset + h * (1 - (temperature[i + 1] - vMin) / vDiff))
		);
	}

	draw_temp_annotations(ctx, 0 * screenWidth, w, h, hGraphsOffset, vMin, vMax);
	draw_temp_annotations(ctx, 1 * screenWidth, w, h, hGraphsOffset, vMin, vMax);
	draw_temp_annotations(ctx, 2 * screenWidth, w, h, hGraphsOffset, vMin, vMax);

	/* right border */
	graphics_context_set_stroke_color(ctx, PBL_IF_COLOR_ELSE(GColorRed, GColorWhite));
	graphics_context_set_antialiased(ctx, false);
	graphics_context_set_stroke_width(ctx, 5);
	graphics_draw_line(ctx, GPoint(w, 0), GPoint(w, bounds.size.h));
}

static void window_load(Window *window)
{
	Layer *windowLayer = window_get_root_layer(window);
	GRect bounds = layer_get_bounds(windowLayer);
	unsigned i;
	const int size = 20;
	sceneH = bounds.size.h;

	window_set_background_color(window, GColorBlack);

	screenWidth = bounds.size.w;
	sceneW = screenWidth * 3;
	curPos = 0;
#ifdef PBL_ROUND
	// let's make it more narrow
	sceneH = bounds.size.h * 2 / 3;
#endif

	hourlyIcons = gbitmap_create_with_resource(RESOURCE_ID_ICON_20X20);
	for (i = 0; i < sizeof(hourlyIcon) / sizeof(hourlyIcon[0]); i++) {
		hourlyIcon[i] =  gbitmap_create_as_sub_bitmap(
			hourlyIcons, GRect(i % 5 * size, ((int)(i / 5)) * size, size, size)
		);
	}

	maxPos = screenWidth * 2;
	displayLayer = layer_create(
		GRect(curPos, bounds.size.h / 2 - sceneH / 2, sceneW, sceneH)
	);
	layer_set_update_proc(displayLayer, redraw_display);
	layer_add_child(windowLayer, displayLayer);

	app_message_register_inbox_received(inbox_received_callback);
	app_message_register_inbox_dropped(inbox_dropped_callback);
	app_message_register_outbox_failed(outbox_failed_callback);
	app_message_register_outbox_sent(outbox_sent_callback);
#if APP_MESSAGE_INBOX_SIZE_MINIMUM < 120
#error "need to adjust STEP in parseFloatArray in JS"
#endif
	app_message_open(APP_MESSAGE_INBOX_SIZE_MINIMUM, 16);
}

static void window_unload(Window *window)
{
	unsigned i;

	app_message_deregister_callbacks();
	layer_destroy(displayLayer);
	for (i = 0; i < sizeof(hourlyIcon) / sizeof(hourlyIcon[0]); i++) {
		gbitmap_destroy(hourlyIcon[i]);
	}
	gbitmap_destroy(hourlyIcons);
}

static void init(void)
{
	window = window_create();
	window_set_click_config_provider(window, click_config_provider);
	window_set_window_handlers(window, (WindowHandlers) {
		.load = window_load,
		.unload = window_unload,
	});
	const bool animated = true;
	window_stack_push(window, animated);
}

static void deinit(void)
{
	window_destroy(window);
}

int main(void)
{
	init();
	app_event_loop();
	deinit();
}
