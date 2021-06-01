/**
 * chartjs-plugin-gridline-background.js
 * version 1.0
 */

'use strict';

// Copied from Chart.js scale, since it is not exported there.
function getLineValue(scale, index, offsetGridLines) {
	var lineValue = scale.getPixelForTick(index);

	if (offsetGridLines) {
		if (index === 0) {
			lineValue -= (scale.getPixelForTick(1) - lineValue) / 2;
		} else {
			lineValue -= (lineValue - scale.getPixelForTick(index - 1)) / 2;
		}
	}
	return lineValue;
}

// Setup defaults; this will draw one fully transparent rectangle for each axis.
// So, if the user only includes the plugin, but sets no configuration,
// (s)he won't see any difference.
Chart.defaults.global.plugins.gridBgColor = {
	backgroundColorRepeat: false,
	backgroundColor: 'rgba(127,127,127,0.0)',
};
function pluginChart() {
	var pluginChartJS = {
		id: 'gridBgColor',

		beforeDraw: function (chartInstance) {

			// This is what the plugin does.
			//
			//		for (scales) {
			//			for (gridLines) {
			//				if (isarray(backgroundColor)) {
			//					draw the grindline background
			//				} else { if (isString(backgroundColor)) {
			//								draw the background for the whole axis, thus for the chartArea
			//						 }
			//				}
			//			}
			//		}

			const ctx = chartInstance.chart.ctx;
			const canvas = chartInstance.chart.canvas;
			const chartArea = chartInstance.chartArea;

			var scale;
			var si;
			var ti;
			var bgCol = [], bgColRpt;
			var x1, y1, x2, y2;
			var axisWidth;
			var isHorizontal;
			var scaleType;
			var gridLines;
			var lineWidth;

			for (si in chartInstance.scales) {
				scale = chartInstance.scales[si];
				axisWidth = scale.options.gridLines.lineWidth;
				isHorizontal = scale.isHorizontal();
				scaleType = scale.options.type;
				gridLines = chartInstance.scales[si].options.gridLines;
				lineWidth = gridLines.lineWidth;
				bgCol = scale.options.gridLines.backgroundColor;
				bgCol = (bgCol == undefined ? chartInstance.chart.options.plugins.gridBgColor.backgroundColor : bgCol);
				bgColRpt = scale.options.gridLines.backgroundColorRepeat;
				bgColRpt = (bgColRpt == undefined ? chartInstance.chart.options.plugins.gridBgColor.backgroundColorRepeat : bgColRpt);

				if (!scale.options.display || bgCol == undefined) {
					// No background coloring for this scale; next scale.
					continue;
				}
				;

				if (typeof bgCol === 'string') {
					// One color for the complete scale background.
					// One rectangle for the chart area.
					ctx.fillStyle = bgCol;
					ctx.fillRect(chartArea.left, chartArea.bottom
						, chartArea.right - chartArea.left, chartArea.top - chartArea.bottom);
					continue; // next scale
				}
				;

				if (bgCol.constructor === Array) {

					// Color the individual gridline backgrounds.
					// Algorithm in essence:
					// Loop through the gridLines (ticks),
					//	 If backgroundColor is different from previous,
					//		 draw the background rectangle and
					//		 save the new coordinates as the start of the next rectangle

					// A simpler algorithm would be to draw each gridLine's background individually,
					// but I got overlaps and gaps (of 1 pixel width), so that was too ugly.
					// Plus, this one is more efficient, as it draws less background rectangles.

					var prevTick = {
						bgCol: '',
						x1: 0,
						y1: 0,
						x2: 0,
						y2: 0,
					};
					var curBgCol;
					var numToDo = scale.ticks.length - (scaleType != 'category' ? 1 : 0);

					for (ti = 0; ti <= numToDo; ti++) { // Note: this does one extra tick!

						ti = Number(ti);

						if (ti == numToDo) {
							// This is the last gridline, make sure we draw it.
							// Also, there probably is no more bgCol[ti]
							curBgCol = 'differentFromPrevious';
						} else {
							// Repeat the bgColors if necessary.
							if (bgColRpt) {
								curBgCol = bgCol[ti % bgCol.length];
							} else {
								curBgCol = bgCol[ti];
							}
							;
						}
						;

						if (curBgCol != prevTick.bgCol) {
							// Some code copied from Chart.js scale.
							if (isHorizontal) {
								// Vertical grid line / grid background
								var xLineValue = getLineValue(scale, ti, gridLines.offsetGridLines && scale.ticks.length > 1);
								xLineValue += (lineWidth % 2 === 0) ? 0 : 0.5;
								x1 = x2 = xLineValue;
								y1 = chartArea.top;
								y2 = chartArea.bottom + axisWidth;
							} else {
								// Horizontal grid line
								var yLineValue = getLineValue(scale, ti, gridLines.offsetGridLines && scale.ticks.length > 1);
								yLineValue += (lineWidth % 2 === 0) ? 0 : 0.5;
								x1 = chartArea.left;
								x2 = chartArea.right + axisWidth;
								y1 = y2 = yLineValue;
							}
							;

							if (gridLines.drawOnChartArea && prevTick.bgCol != '') {

								ctx.save();
								ctx.fillStyle = prevTick.bgCol;

								if (isHorizontal) {
									// Horizontal scale, vertical grid line / grid background
									ctx.fillRect(
										prevTick.x1, prevTick.y1,
										Math.abs(x2 - prevTick.x1), Math.abs(y2 - prevTick.y1)
									);
								} else {
									// Horizontal grid line
									ctx.fillRect(
										prevTick.x1, prevTick.y1,
										Math.abs(x2 - prevTick.x1), Math.abs(y2 - prevTick.y1)
									);
								}
								;
							}
							; // gl.drawonChartArea
							ctx.restore();

							// Save the new coordinates
							prevTick.bgCol = curBgCol;
							prevTick.x1 = x1;
							prevTick.y1 = y1;
							prevTick.x2 = x2;
							prevTick.y2 = y2;

						}
						; // bgCol != bgCol

					}
					; //for ti in ticks

					continue;
				}
				; // if bgCol is of type array

				// If we get here, that's an error!
				console.log("chartjs-plugin-gridline-background.js: Error, unknown type of backgroundColor (not String or Array): " + bgCol);

			}
			; // for si

		} // beforeDraw: function
	} // plugin
	return pluginChartJS;
}
Chart.plugins.register(pluginChart());
