const path = require('path')
const webpack = require('webpack')
module.exports = {
	output: {
		path: path.resolve(__dirname, 'dist'),
		publicPath: './'
	},
	module: {
		rules: [{
			test: /\.vue(\?[^?]+)?$/
		}, {
			test: /\.vue(\?[^?]+)?$|\.js$/,
			exclude: /(node_modules|bower_components|lib)/,
			loader: 'eslint-loader'
		}, {
			test: /\.css$/,
			loader: ['style-loader', 'css-loader']
		}, {
			test: /\.(png|svg|jpg|gif)$/,
			loader: ['file-loader']
		}, {
			test: /\.(woff|woff2|eot|ttf|otf)$/,
			loader: ['file-loader']
		}]
	}
}