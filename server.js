const express = require('express');
const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');
const data = require('./data.json');

const app = express();
const config = require('./webpack.dev.js');
const compiler = webpack(config);

// console.log(data);

// Tell express to use the webpack-dev-middleware and use the webpack.config.js
// configuration file as a base.
app.use(webpackDevMiddleware(compiler, {
  publicPath: config.output.publicPath
}));

app.all('/reload', function(req, res) {
	res.send(data.reload);
});
app.post('/sheet/area', function(request, response) {
	if (first) {
		first = false;
		return response.send({
			"colNum": 0,
			"dataColStartIndex": 0,
			"dataRowStartIndex": 56,
			"maxColPixel": 0,
			"maxPixel": 0,
			"maxRowPixel": 2639,
			"protect": false,
			"returncode": 200,
			"returndata": {
				"name": "新建excel",
				"spreadSheet": [{
					"sheet": {
						"cells": [{

						}],
						"frozen": {},
						"glX": [{
							"aliasX": "11",
							"hidden": false,
							"index": 10,
							"left": 700,
							"operProp": {
								"border": {},
								"content": {},
								"customProp": {},
								"formate": {
									"isValid": true
								}
							},
							"originWidth": 69,
							"width": 69
						}, {
							"aliasX": "12",
							"hidden": false,
							"index": 11,
							"left": 770,
							"operProp": {
								"border": {},
								"content": {},
								"customProp": {},
								"formate": {
									"isValid": true
								}
							},
							"originWidth": 69,
							"width": 69
						}, {
							"aliasX": "13",
							"hidden": false,
							"index": 12,
							"left": 840,
							"operProp": {
								"border": {},
								"content": {},
								"customProp": {},
								"formate": {
									"isValid": true
								}
							},
							"originWidth": 69,
							"width": 69
						}, {
							"aliasX": "14",
							"hidden": false,
							"index": 13,
							"left": 910,
							"operProp": {
								"border": {},
								"content": {},
								"customProp": {},
								"formate": {
									"isValid": true
								}
							},
							"originWidth": 69,
							"width": 69
						}, {
							"aliasX": "15",
							"hidden": false,
							"index": 14,
							"left": 980,
							"operProp": {
								"border": {},
								"content": {},
								"customProp": {},
								"formate": {
									"isValid": true
								}
							},
							"originWidth": 69,
							"width": 69
						}],
						"glY": [{
							"aliasY": "1",
							"height": 19,
							"hidden": false,
							"index": 0,
							"operProp": {
								"border": {},
								"content": {},
								"customProp": {},
								"formate": {
									"isValid": true
								}
							},
							"originHeight": 0,
							"top": 0
						}, {
							"aliasY": "2",
							"height": 19,
							"hidden": false,
							"index": 1,
							"operProp": {
								"border": {},
								"content": {},
								"customProp": {},
								"formate": {
									"isValid": true
								}
							},
							"originHeight": 0,
							"top": 20
						}, {
							"aliasY": "3",
							"height": 19,
							"hidden": false,
							"index": 2,
							"operProp": {
								"border": {},
								"content": {},
								"customProp": {},
								"formate": {
									"isValid": true
								}
							},
							"originHeight": 0,
							"top": 40
						}, {
							"aliasY": "4",
							"height": 19,
							"hidden": false,
							"index": 3,
							"operProp": {
								"border": {},
								"content": {},
								"customProp": {},
								"formate": {
									"isValid": true
								}
							},
							"originHeight": 0,
							"top": 60
						}, {
							"aliasY": "5",
							"height": 19,
							"hidden": false,
							"index": 4,
							"operProp": {
								"border": {},
								"content": {},
								"customProp": {},
								"formate": {
									"isValid": true
								}
							},
							"originHeight": 0,
							"top": 80
						}, {
							"aliasY": "6",
							"height": 19,
							"hidden": false,
							"index": 5,
							"operProp": {
								"border": {},
								"content": {},
								"customProp": {},
								"formate": {
									"isValid": true
								}
							},
							"originHeight": 0,
							"top": 100
						}, {
							"aliasY": "7",
							"height": 19,
							"hidden": false,
							"index": 6,
							"operProp": {
								"border": {},
								"content": {},
								"customProp": {},
								"formate": {
									"isValid": true
								}
							},
							"originHeight": 0,
							"top": 120
						}, {
							"aliasY": "8",
							"height": 19,
							"hidden": false,
							"index": 7,
							"operProp": {
								"border": {},
								"content": {},
								"customProp": {},
								"formate": {
									"isValid": true
								}
							},
							"originHeight": 0,
							"top": 140
						}, {
							"aliasY": "9",
							"height": 19,
							"hidden": false,
							"index": 8,
							"operProp": {
								"border": {},
								"content": {},
								"customProp": {},
								"formate": {
									"isValid": true
								}
							},
							"originHeight": 0,
							"top": 160
						}, {
							"aliasY": "10",
							"height": 19,
							"hidden": false,
							"index": 9,
							"operProp": {
								"border": {},
								"content": {},
								"customProp": {},
								"formate": {
									"isValid": true
								}
							},
							"originHeight": 0,
							"top": 180
						}, {
							"aliasY": "11",
							"height": 19,
							"hidden": false,
							"index": 10,
							"operProp": {
								"border": {},
								"content": {},
								"customProp": {},
								"formate": {
									"isValid": true
								}
							},
							"originHeight": 0,
							"top": 200
						}, {
							"aliasY": "12",
							"height": 19,
							"hidden": false,
							"index": 11,
							"operProp": {
								"border": {},
								"content": {},
								"customProp": {},
								"formate": {
									"isValid": true
								}
							},
							"originHeight": 0,
							"top": 220
						}, {
							"aliasY": "13",
							"height": 19,
							"hidden": false,
							"index": 12,
							"operProp": {
								"border": {},
								"content": {},
								"customProp": {},
								"formate": {
									"isValid": true
								}
							},
							"originHeight": 0,
							"top": 240
						}, {
							"aliasY": "14",
							"height": 19,
							"hidden": false,
							"index": 13,
							"operProp": {
								"border": {},
								"content": {},
								"customProp": {},
								"formate": {
									"isValid": true
								}
							},
							"originHeight": 0,
							"top": 260
						}, {
							"aliasY": "15",
							"height": 19,
							"hidden": false,
							"index": 14,
							"operProp": {
								"border": {},
								"content": {},
								"customProp": {},
								"formate": {
									"isValid": true
								}
							},
							"originHeight": 0,
							"top": 280
						}, {
							"aliasY": "16",
							"height": 19,
							"hidden": false,
							"index": 15,
							"operProp": {
								"border": {},
								"content": {},
								"customProp": {},
								"formate": {
									"isValid": true
								}
							},
							"originHeight": 0,
							"top": 300
						}, {
							"aliasY": "17",
							"height": 19,
							"hidden": false,
							"index": 16,
							"operProp": {
								"border": {},
								"content": {},
								"customProp": {},
								"formate": {
									"isValid": true
								}
							},
							"originHeight": 0,
							"top": 320
						}, {
							"aliasY": "18",
							"height": 19,
							"hidden": false,
							"index": 17,
							"operProp": {
								"border": {},
								"content": {},
								"customProp": {},
								"formate": {
									"isValid": true
								}
							},
							"originHeight": 0,
							"top": 340
						}, {
							"aliasY": "19",
							"height": 19,
							"hidden": false,
							"index": 18,
							"operProp": {
								"border": {},
								"content": {},
								"customProp": {},
								"formate": {
									"isValid": true
								}
							},
							"originHeight": 0,
							"top": 360
						}, {
							"aliasY": "20",
							"height": 19,
							"hidden": false,
							"index": 19,
							"operProp": {
								"border": {},
								"content": {},
								"customProp": {},
								"formate": {
									"isValid": true
								}
							},
							"originHeight": 0,
							"top": 380
						}],
						"posi": {
							"max": {},
							"strandX": {
								"aliasX": {}
							},
							"strandY": {
								"aliasY": {}
							}
						},
						"presetCells": [],
						"startAlais": {}
					},
					"sort": 0,
					"validate": {
						"rules": [],
						"total": 0
					}
				}]
			},
			"rowLength": 0,
			"rowNum": 0
		})
	} else {
		return response.send({
			"colNum": 0,
			"dataColStartIndex": 0,
			"dataRowStartIndex": 56,
			"maxColPixel": 0,
			"maxPixel": 0,
			"maxRowPixel": 2639,
			"protect": false,
			"returncode": 200,
			"returndata": {
				"name": "新建excel",
				"spreadSheet": [{
					"sheet": {
						"cells": [{

						}],
						"frozen": {},
						"glX": [{
							"aliasX": "11",
							"hidden": false,
							"index": 10,
							"left": 700,
							"operProp": {
								"border": {},
								"content": {},
								"customProp": {},
								"formate": {
									"isValid": true
								}
							},
							"originWidth": 69,
							"width": 69
						}, {
							"aliasX": "12",
							"hidden": false,
							"index": 11,
							"left": 770,
							"operProp": {
								"border": {},
								"content": {},
								"customProp": {},
								"formate": {
									"isValid": true
								}
							},
							"originWidth": 69,
							"width": 69
						}, {
							"aliasX": "13",
							"hidden": false,
							"index": 12,
							"left": 840,
							"operProp": {
								"border": {},
								"content": {},
								"customProp": {},
								"formate": {
									"isValid": true
								}
							},
							"originWidth": 69,
							"width": 69
						}, {
							"aliasX": "14",
							"hidden": false,
							"index": 13,
							"left": 910,
							"operProp": {
								"border": {},
								"content": {},
								"customProp": {},
								"formate": {
									"isValid": true
								}
							},
							"originWidth": 69,
							"width": 69
						}, {
							"aliasX": "15",
							"hidden": false,
							"index": 14,
							"left": 980,
							"operProp": {
								"border": {},
								"content": {},
								"customProp": {},
								"formate": {
									"isValid": true
								}
							},
							"originWidth": 69,
							"width": 69
						}],
						"glY": [{
							"aliasY": "21",
							"height": 19,
							"hidden": false,
							"index": 20,
							"operProp": {
								"border": {},
								"content": {},
								"customProp": {},
								"formate": {
									"isValid": true
								}
							},
							"originHeight": 0,
							"top": 400
						}, {
							"aliasY": "22",
							"height": 19,
							"hidden": false,
							"index": 21,
							"operProp": {
								"border": {},
								"content": {},
								"customProp": {},
								"formate": {
									"isValid": true
								}
							},
							"originHeight": 0,
							"top": 420
						}, {
							"aliasY": "23",
							"height": 19,
							"hidden": false,
							"index": 22,
							"operProp": {
								"border": {},
								"content": {},
								"customProp": {},
								"formate": {
									"isValid": true
								}
							},
							"originHeight": 0,
							"top": 440
						}, {
							"aliasY": "24",
							"height": 19,
							"hidden": false,
							"index": 23,
							"operProp": {
								"border": {},
								"content": {},
								"customProp": {},
								"formate": {
									"isValid": true
								}
							},
							"originHeight": 0,
							"top": 460
						}, {
							"aliasY": "25",
							"height": 19,
							"hidden": false,
							"index": 24,
							"operProp": {
								"border": {},
								"content": {},
								"customProp": {},
								"formate": {
									"isValid": true
								}
							},
							"originHeight": 0,
							"top": 480
						}, {
							"aliasY": "26",
							"height": 19,
							"hidden": false,
							"index": 25,
							"operProp": {
								"border": {},
								"content": {},
								"customProp": {},
								"formate": {
									"isValid": true
								}
							},
							"originHeight": 0,
							"top": 500
						}, {
							"aliasY": "27",
							"height": 19,
							"hidden": false,
							"index": 26,
							"operProp": {
								"border": {},
								"content": {},
								"customProp": {},
								"formate": {
									"isValid": true
								}
							},
							"originHeight": 0,
							"top": 520
						}, {
							"aliasY": "28",
							"height": 19,
							"hidden": false,
							"index": 27,
							"operProp": {
								"border": {},
								"content": {},
								"customProp": {},
								"formate": {
									"isValid": true
								}
							},
							"originHeight": 0,
							"top": 540
						}, {
							"aliasY": "29",
							"height": 19,
							"hidden": false,
							"index": 28,
							"operProp": {
								"border": {},
								"content": {},
								"customProp": {},
								"formate": {
									"isValid": true
								}
							},
							"originHeight": 0,
							"top": 560
						}, {
							"aliasY": "30",
							"height": 19,
							"hidden": false,
							"index": 29,
							"operProp": {
								"border": {},
								"content": {},
								"customProp": {},
								"formate": {
									"isValid": true
								}
							},
							"originHeight": 0,
							"top": 580
						}, {
							"aliasY": "31",
							"height": 19,
							"hidden": false,
							"index": 30,
							"operProp": {
								"border": {},
								"content": {},
								"customProp": {},
								"formate": {
									"isValid": true
								}
							},
							"originHeight": 0,
							"top": 600
						}, {
							"aliasY": "32",
							"height": 19,
							"hidden": false,
							"index": 31,
							"operProp": {
								"border": {},
								"content": {},
								"customProp": {},
								"formate": {
									"isValid": true
								}
							},
							"originHeight": 0,
							"top": 620
						}, {
							"aliasY": "33",
							"height": 19,
							"hidden": false,
							"index": 32,
							"operProp": {
								"border": {},
								"content": {},
								"customProp": {},
								"formate": {
									"isValid": true
								}
							},
							"originHeight": 0,
							"top": 640
						}, {
							"aliasY": "34",
							"height": 19,
							"hidden": false,
							"index": 33,
							"operProp": {
								"border": {},
								"content": {},
								"customProp": {},
								"formate": {
									"isValid": true
								}
							},
							"originHeight": 0,
							"top": 660
						}, {
							"aliasY": "35",
							"height": 19,
							"hidden": false,
							"index": 34,
							"operProp": {
								"border": {},
								"content": {},
								"customProp": {},
								"formate": {
									"isValid": true
								}
							},
							"originHeight": 0,
							"top": 680
						}, {
							"aliasY": "36",
							"height": 19,
							"hidden": false,
							"index": 35,
							"operProp": {
								"border": {},
								"content": {},
								"customProp": {},
								"formate": {
									"isValid": true
								}
							},
							"originHeight": 0,
							"top": 700
						}, {
							"aliasY": "37",
							"height": 19,
							"hidden": false,
							"index": 36,
							"operProp": {
								"border": {},
								"content": {},
								"customProp": {},
								"formate": {
									"isValid": true
								}
							},
							"originHeight": 0,
							"top": 720
						}, {
							"aliasY": "38",
							"height": 19,
							"hidden": false,
							"index": 37,
							"operProp": {
								"border": {},
								"content": {},
								"customProp": {},
								"formate": {
									"isValid": true
								}
							},
							"originHeight": 0,
							"top": 740
						}, {
							"aliasY": "39",
							"height": 19,
							"hidden": false,
							"index": 38,
							"operProp": {
								"border": {},
								"content": {},
								"customProp": {},
								"formate": {
									"isValid": true
								}
							},
							"originHeight": 0,
							"top": 760
						}, {
							"aliasY": "40",
							"height": 19,
							"hidden": false,
							"index": 39,
							"operProp": {
								"border": {},
								"content": {},
								"customProp": {},
								"formate": {
									"isValid": true
								}
							},
							"originHeight": 0,
							"top": 780
						}],
						"posi": {
							"max": {},
							"strandX": {
								"aliasX": {}
							},
							"strandY": {
								"aliasY": {}
							}
						},
						"presetCells": [],
						"startAlais": {}
					},
					"sort": 0,
					"validate": {
						"rules": [],
						"total": 0
					}
				}]
			},
			"rowLength": 0,
			"rowNum": 0
		});
	}
});

// Serve the files on port 8080.
app.listen(8080, function () {
  console.log('Example app listening on port 8080!\n');
});