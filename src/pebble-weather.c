#include <pebble.h>
#include "pebble-weather.h"

#define valuesCount (55)
static time_t firstTime = 13 * 3600;
static float temperature[valuesCount] = {
	4.2687073,4.748932,5.13443,5.2689514,4.895172,3.9354553,2.9615784,2.5785217,1.8629456,2.2106018,1.8207092,1.832428,1.5890198,1.6986389,1.8890686,2.0956116,2.1898499,2.4928284,2.8443909,3.3570862,4.0487366,5.00235,6.4552307,8.059235,8.662506,8.902252,9.085358,9.007965,7.8226624,7.9862366,6.9215393,5.955719,5.0292053,6.224762,2.3175354,4.8246155,4.8768616,2.8734436,3.1700745,3.1373596,3.1341858,2.9283752,2.514801,2.2118225,2.5509338,3.405182,4.065338,4.6544495,5.072418,5.1732483,4.8451233,4.6004944,4.014801,3.2306213,2.6029358
};
static float precipitation[valuesCount] = {
	9.378195E-4,9.378195E-4,0.0017940998,3.0636787E-5,1.5187263E-4,9.6678734E-5,2.5510788E-5,6.687641E-5,-3.4499168E-4,1.0204315E-4,-3.619194E-4,0.0010166168,0.32828712,0.2517929,0.43693542,0.18448448,0.110227585,0.0035219193,0.0043668747,1.20162964E-4,0.09121132,0.0324955,-0.0013656616,0.0034046173,8.163452E-4,0.0014019012,0.0025939941,4.6539307E-4,8.5258484E-4,7.5531006E-4,-2.2315979E-4,-0.0017852783,5.235672E-4,-8.46982E-4,4.6789646E-4,6.529093E-4,5.943775E-4,0.075973034,0.38362753,0.7989588,0.6017678,0.16940427,0.09969807,0.05063057,0.006038666,-0.0014591217,-3.6621094E-4,0.0012378693,6.771088E-5,-0.0010023117,0.001581192,-0.0022554398,9.384155E-4,-7.314682E-4,2.2220612E-4
};
static int clouds[valuesCount] = {
	sym_cloud,sym_day_cloud,sym_night_cloud,sym_night_cloud,sym_cloud,sym_cloud,sym_cloud_rain_light,sym_cloud_rain_light,sym_cloud_rain_light,sym_cloud,sym_cloud,sym_day_cloud,sym_day_cloud,sym_day_cloud,sym_night_cloud,sym_night_cloud,sym_cloud,sym_cloud,sym_cloud,sym_cloud_rain_light,sym_cloud_rain_light,sym_cloud,sym_day_cloud,sym_cloud,sym_day_cloud,sym_day_cloud,sym_night_cloud,sym_night_cloud
};

static Window *window;
static Layer *displayLayer;
static int curPos = 0;
static int screenWidth;

static void set_pos(int pos)
{
	Layer *windowLayer = window_get_root_layer(window);
	GRect bounds = layer_get_bounds(windowLayer);

	curPos = pos;

	layer_set_frame(
		displayLayer,
		GRect(-(curPos * bounds.size.w), 0, bounds.size.w * 3, bounds.size.h)
	);
}

static void select_click_handler(ClickRecognizerRef recognizer, void *context)
{
	set_pos(0);
}

static void up_click_handler(ClickRecognizerRef recognizer, void *context)
{
	set_pos((curPos + 2) % 3); /* ~= curPos - 1 */
}

static void down_click_handler(ClickRecognizerRef recognizer, void *context)
{
	set_pos((curPos + 1) % 3);
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
	int w6h = 6 * w / valuesCount;

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

	graphics_context_set_stroke_color(ctx, GColorDarkGray);
	graphics_context_set_antialiased(ctx, false);

	for (i = startOffset; i < valuesCount;) {
		int pos = i * w / valuesCount;
		graphics_context_set_stroke_width(ctx, bigHour ? 3 : 1);
		graphics_draw_line(
			ctx,
			GPoint(pos, yOff), GPoint(pos, yOff + h)
		);

		snprintf(buf, sizeof(buf), "%02dh", curHour);
		graphics_draw_text(
			ctx, buf, fonts_get_system_font(FONT_KEY_GOTHIC_18_BOLD),
			GRect(pos - w6h / 2, yOff - 20, w6h, 20),
			GTextOverflowModeTrailingEllipsis, GTextAlignmentCenter, NULL
		);

		bigHour = !bigHour;
		curHour = (curHour + interval) % 24;
		i += interval;
	}
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

	for (i = 1; i < valuesCount; i++) {
		if (vMin > temperature[i])
			vMin = temperature[i];
		if (vMax < temperature[i])
			vMax = temperature[i];
	}
	vDiff = vMax - vMin;

	graphics_context_set_fill_color(ctx, GColorBlack);
	graphics_fill_rect(ctx, bounds, 0, GCornerNone);

	draw_time_annotations(ctx, w, hGraphsOffset, h);
	if (vMin < 0) {
		/* zero temperature line */
		graphics_context_set_stroke_color(ctx, GColorBlueMoon);
		graphics_context_set_antialiased(ctx, false);
		graphics_context_set_stroke_width(ctx, 4);

		int zeroPos =	 + h * vMax / (vMax - vMin);
		graphics_draw_line(ctx, GPoint(0, zeroPos), GPoint(w, zeroPos));
	}
	graphics_context_set_stroke_color(ctx, GColorLightGray);
	graphics_context_set_antialiased(ctx, false);
	graphics_context_set_stroke_width(ctx, 1);
	graphics_draw_line(ctx, GPoint(0, hGraphsOffset), GPoint(w, hGraphsOffset));
	graphics_draw_line(ctx, GPoint(0, hGraphsOffset + h / 2), GPoint(w, hGraphsOffset + h / 2));

	/* precipitation graph */
	graphics_context_set_fill_color(ctx, GColorBlue);
	graphics_context_set_antialiased(ctx, false);
	graphics_context_set_stroke_width(ctx, 0);
	for (i = 0; i < valuesCount; i++) {
		graphics_fill_rect(
			ctx,
			GRect(
				w * (2 * i - 1) / (2 * valuesCount),
				hGraphsOffset + (1 - precipitation[i]) * h,
				w / valuesCount, precipitation[i] * h
			), 0, GCornerNone
		);
	}

	/* temperature graph */
	graphics_context_set_stroke_color(ctx, GColorOrange);
	graphics_context_set_antialiased(ctx, true);
	graphics_context_set_stroke_width(ctx, 2);
	for (i = 0; i < valuesCount - 1; i++) {
		graphics_draw_line(
			ctx,
			GPoint(w * i / valuesCount, hGraphsOffset + h * (1 - (temperature[i] - vMin) / vDiff)),
			GPoint(w * (i + 1) / valuesCount, hGraphsOffset + h * (1 - (temperature[i + 1] - vMin) / vDiff))
		);
	}

	draw_temp_annotations(ctx, 0 * screenWidth, w, h, hGraphsOffset, vMin, vMax);
	draw_temp_annotations(ctx, 1 * screenWidth, w, h, hGraphsOffset, vMin, vMax);
	draw_temp_annotations(ctx, 2 * screenWidth, w, h, hGraphsOffset, vMin, vMax);
}

static void window_load(Window *window)
{
	Layer *windowLayer = window_get_root_layer(window);
	GRect bounds = layer_get_bounds(windowLayer);
	screenWidth = bounds.size.w;
	
	displayLayer = layer_create(
		GRect(0, 0, screenWidth * 3, bounds.size.h)
	);
	layer_set_update_proc(displayLayer, redraw_display);
	layer_add_child(windowLayer, displayLayer);
}

static void window_unload(Window *window)
{
	layer_destroy(displayLayer);
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
