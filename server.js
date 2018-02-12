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

// Serve the files on port 8080.
app.listen(8080, function () {
  console.log('Example app listening on port 8080!\n');
});