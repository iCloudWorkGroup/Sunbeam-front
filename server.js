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
let counter = 0;
app.get('/clear', function(request, response){
	counter = 0;
	response.send('clear');
});
app.post('/sheet/area', function(request, response) {
	if (counter === 0) {
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
						"cells": [],
						"frozen": {},
						"glX": [{
							"alias": "11",
							"sort": 10,
							"hidden": false,
							"index": 10,
							"left": 720,
							"operProp": {
								"border": {},
								"content": {},
								"customProp": {},
								"formate": {
									"isValid": true
								}
							},
							"originWidth": 69,
							"width": 71
						}, {
							"alias": "12",
							"sort": 11,
							"hidden": false,
							"index": 11,
							"left": 792,
							"operProp": {
								"border": {},
								"content": {},
								"customProp": {},
								"formate": {
									"isValid": true
								}
							},
							"originWidth": 69,
							"width": 71
						}, {
							"alias": "13",
							"sort": 12,
							"hidden": false,
							"index": 12,
							"left": 864,
							"operProp": {
								"border": {},
								"content": {},
								"customProp": {},
								"formate": {
									"isValid": true
								}
							},
							"originWidth": 69,
							"width": 71
						}, {
							"alias": "14",
							"sort": 13,
							"hidden": false,
							"index": 13,
							"left": 936,
							"operProp": {
								"border": {},
								"content": {},
								"customProp": {},
								"formate": {
									"isValid": true
								}
							},
							"originWidth": 69,
							"width": 71
						}, {
							"alias": "15",
							"sort": 14,
							"hidden": false,
							"index": 14,
							"left": 1008,
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
							"alias": "1",
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
							"alias": "2",
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
							"alias": "3",
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
							"alias": "4",
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
							"alias": "5",
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
							"alias": "6",
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
							"alias": "7",
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
							"alias": "8",
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
							"alias": "9",
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
							"alias": "10",
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
							"alias": "11",
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
							"alias": "12",
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
							"alias": "13",
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
							"alias": "14",
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
							"alias": "15",
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
							"alias": "16",
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
							"alias": "17",
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
							"alias": "18",
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
							"alias": "19",
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
							"alias": "20",
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
								"alias": {}
							},
							"strandY": {
								"alias": {}
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
	} 
	counter++;
	// else {
	// 	return response.send({
	// 		"colNum": 0,
	// 		"dataColStartIndex": 0,
	// 		"dataRowStartIndex": 56,
	// 		"maxColPixel": 0,
	// 		"maxPixel": 0,
	// 		"maxRowPixel": 2639,
	// 		"protect": false,
	// 		"returncode": 200,
	// 		"returndata": {
	// 			"name": "新建excel",
	// 			"spreadSheet": [{
	// 				"sheet": {
	// 					"cells": [{

	// 					}],
	// 					"frozen": {},
	// 					"glX": [{
	// 						"alias": "11",
	// 						"hidden": false,
	// 						"index": 10,
	// 						"left": 700,
	// 						"operProp": {
	// 							"border": {},
	// 							"content": {},
	// 							"customProp": {},
	// 							"formate": {
	// 								"isValid": true
	// 							}
	// 						},
	// 						"originWidth": 69,
	// 						"width": 69
	// 					}, {
	// 						"alias": "12",
	// 						"hidden": false,
	// 						"index": 11,
	// 						"left": 770,
	// 						"operProp": {
	// 							"border": {},
	// 							"content": {},
	// 							"customProp": {},
	// 							"formate": {
	// 								"isValid": true
	// 							}
	// 						},
	// 						"originWidth": 69,
	// 						"width": 69
	// 					}, {
	// 						"alias": "13",
	// 						"hidden": false,
	// 						"index": 12,
	// 						"left": 840,
	// 						"operProp": {
	// 							"border": {},
	// 							"content": {},
	// 							"customProp": {},
	// 							"formate": {
	// 								"isValid": true
	// 							}
	// 						},
	// 						"originWidth": 69,
	// 						"width": 69
	// 					}, {
	// 						"alias": "14",
	// 						"hidden": false,
	// 						"index": 13,
	// 						"left": 910,
	// 						"operProp": {
	// 							"border": {},
	// 							"content": {},
	// 							"customProp": {},
	// 							"formate": {
	// 								"isValid": true
	// 							}
	// 						},
	// 						"originWidth": 69,
	// 						"width": 69
	// 					}, {
	// 						"alias": "15",
	// 						"hidden": false,
	// 						"index": 14,
	// 						"left": 980,
	// 						"operProp": {
	// 							"border": {},
	// 							"content": {},
	// 							"customProp": {},
	// 							"formate": {
	// 								"isValid": true
	// 							}
	// 						},
	// 						"originWidth": 69,
	// 						"width": 69
	// 					}],
	// 					"glY": [{
	// 						"alias": "21",
	// 						"height": 19,
	// 						"hidden": false,
	// 						"index": 20,
	// 						"operProp": {
	// 							"border": {},
	// 							"content": {},
	// 							"customProp": {},
	// 							"formate": {
	// 								"isValid": true
	// 							}
	// 						},
	// 						"originHeight": 0,
	// 						"top": 400
	// 					}, {
	// 						"alias": "22",
	// 						"height": 19,
	// 						"hidden": false,
	// 						"index": 21,
	// 						"operProp": {
	// 							"border": {},
	// 							"content": {},
	// 							"customProp": {},
	// 							"formate": {
	// 								"isValid": true
	// 							}
	// 						},
	// 						"originHeight": 0,
	// 						"top": 420
	// 					}, {
	// 						"alias": "23",
	// 						"height": 19,
	// 						"hidden": false,
	// 						"index": 22,
	// 						"operProp": {
	// 							"border": {},
	// 							"content": {},
	// 							"customProp": {},
	// 							"formate": {
	// 								"isValid": true
	// 							}
	// 						},
	// 						"originHeight": 0,
	// 						"top": 440
	// 					}, {
	// 						"alias": "24",
	// 						"height": 19,
	// 						"hidden": false,
	// 						"index": 23,
	// 						"operProp": {
	// 							"border": {},
	// 							"content": {},
	// 							"customProp": {},
	// 							"formate": {
	// 								"isValid": true
	// 							}
	// 						},
	// 						"originHeight": 0,
	// 						"top": 460
	// 					}, {
	// 						"alias": "25",
	// 						"height": 19,
	// 						"hidden": false,
	// 						"index": 24,
	// 						"operProp": {
	// 							"border": {},
	// 							"content": {},
	// 							"customProp": {},
	// 							"formate": {
	// 								"isValid": true
	// 							}
	// 						},
	// 						"originHeight": 0,
	// 						"top": 480
	// 					}, {
	// 						"alias": "26",
	// 						"height": 19,
	// 						"hidden": false,
	// 						"index": 25,
	// 						"operProp": {
	// 							"border": {},
	// 							"content": {},
	// 							"customProp": {},
	// 							"formate": {
	// 								"isValid": true
	// 							}
	// 						},
	// 						"originHeight": 0,
	// 						"top": 500
	// 					}, {
	// 						"alias": "27",
	// 						"height": 19,
	// 						"hidden": false,
	// 						"index": 26,
	// 						"operProp": {
	// 							"border": {},
	// 							"content": {},
	// 							"customProp": {},
	// 							"formate": {
	// 								"isValid": true
	// 							}
	// 						},
	// 						"originHeight": 0,
	// 						"top": 520
	// 					}, {
	// 						"alias": "28",
	// 						"height": 19,
	// 						"hidden": false,
	// 						"index": 27,
	// 						"operProp": {
	// 							"border": {},
	// 							"content": {},
	// 							"customProp": {},
	// 							"formate": {
	// 								"isValid": true
	// 							}
	// 						},
	// 						"originHeight": 0,
	// 						"top": 540
	// 					}, {
	// 						"alias": "29",
	// 						"height": 19,
	// 						"hidden": false,
	// 						"index": 28,
	// 						"operProp": {
	// 							"border": {},
	// 							"content": {},
	// 							"customProp": {},
	// 							"formate": {
	// 								"isValid": true
	// 							}
	// 						},
	// 						"originHeight": 0,
	// 						"top": 560
	// 					}, {
	// 						"alias": "30",
	// 						"height": 19,
	// 						"hidden": false,
	// 						"index": 29,
	// 						"operProp": {
	// 							"border": {},
	// 							"content": {},
	// 							"customProp": {},
	// 							"formate": {
	// 								"isValid": true
	// 							}
	// 						},
	// 						"originHeight": 0,
	// 						"top": 580
	// 					}, {
	// 						"alias": "31",
	// 						"height": 19,
	// 						"hidden": false,
	// 						"index": 30,
	// 						"operProp": {
	// 							"border": {},
	// 							"content": {},
	// 							"customProp": {},
	// 							"formate": {
	// 								"isValid": true
	// 							}
	// 						},
	// 						"originHeight": 0,
	// 						"top": 600
	// 					}, {
	// 						"alias": "32",
	// 						"height": 19,
	// 						"hidden": false,
	// 						"index": 31,
	// 						"operProp": {
	// 							"border": {},
	// 							"content": {},
	// 							"customProp": {},
	// 							"formate": {
	// 								"isValid": true
	// 							}
	// 						},
	// 						"originHeight": 0,
	// 						"top": 620
	// 					}, {
	// 						"alias": "33",
	// 						"height": 19,
	// 						"hidden": false,
	// 						"index": 32,
	// 						"operProp": {
	// 							"border": {},
	// 							"content": {},
	// 							"customProp": {},
	// 							"formate": {
	// 								"isValid": true
	// 							}
	// 						},
	// 						"originHeight": 0,
	// 						"top": 640
	// 					}, {
	// 						"alias": "34",
	// 						"height": 19,
	// 						"hidden": false,
	// 						"index": 33,
	// 						"operProp": {
	// 							"border": {},
	// 							"content": {},
	// 							"customProp": {},
	// 							"formate": {
	// 								"isValid": true
	// 							}
	// 						},
	// 						"originHeight": 0,
	// 						"top": 660
	// 					}, {
	// 						"alias": "35",
	// 						"height": 19,
	// 						"hidden": false,
	// 						"index": 34,
	// 						"operProp": {
	// 							"border": {},
	// 							"content": {},
	// 							"customProp": {},
	// 							"formate": {
	// 								"isValid": true
	// 							}
	// 						},
	// 						"originHeight": 0,
	// 						"top": 680
	// 					}, {
	// 						"alias": "36",
	// 						"height": 19,
	// 						"hidden": false,
	// 						"index": 35,
	// 						"operProp": {
	// 							"border": {},
	// 							"content": {},
	// 							"customProp": {},
	// 							"formate": {
	// 								"isValid": true
	// 							}
	// 						},
	// 						"originHeight": 0,
	// 						"top": 700
	// 					}, {
	// 						"alias": "37",
	// 						"height": 19,
	// 						"hidden": false,
	// 						"index": 36,
	// 						"operProp": {
	// 							"border": {},
	// 							"content": {},
	// 							"customProp": {},
	// 							"formate": {
	// 								"isValid": true
	// 							}
	// 						},
	// 						"originHeight": 0,
	// 						"top": 720
	// 					}, {
	// 						"alias": "38",
	// 						"height": 19,
	// 						"hidden": false,
	// 						"index": 37,
	// 						"operProp": {
	// 							"border": {},
	// 							"content": {},
	// 							"customProp": {},
	// 							"formate": {
	// 								"isValid": true
	// 							}
	// 						},
	// 						"originHeight": 0,
	// 						"top": 740
	// 					}, {
	// 						"alias": "39",
	// 						"height": 19,
	// 						"hidden": false,
	// 						"index": 38,
	// 						"operProp": {
	// 							"border": {},
	// 							"content": {},
	// 							"customProp": {},
	// 							"formate": {
	// 								"isValid": true
	// 							}
	// 						},
	// 						"originHeight": 0,
	// 						"top": 760
	// 					}, {
	// 						"alias": "40",
	// 						"height": 19,
	// 						"hidden": false,
	// 						"index": 39,
	// 						"operProp": {
	// 							"border": {},
	// 							"content": {},
	// 							"customProp": {},
	// 							"formate": {
	// 								"isValid": true
	// 							}
	// 						},
	// 						"originHeight": 0,
	// 						"top": 780
	// 					}],
	// 					"posi": {
	// 						"max": {},
	// 						"strandX": {
	// 							"alias": {}
	// 						},
	// 						"strandY": {
	// 							"alias": {}
	// 						}
	// 					},
	// 					"presetCells": [],
	// 					"startAlais": {}
	// 				},
	// 				"sort": 0,
	// 				"validate": {
	// 					"rules": [],
	// 					"total": 0
	// 				}
	// 			}]
	// 		},
	// 		"rowLength": 0,
	// 		"rowNum": 0
	// 	});
	// }
	// counter++;
});

// Serve the files on port 8080.
app.listen(8080, function () {
  console.log('Example app listening on port 8080!\n');
});