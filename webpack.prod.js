const webpack = require('webpack');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const base = require('./webpack.base.js')
const merge = require('webpack-merge')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const baseConfig = merge(base, {
	devtool: 'source-map',
	entry: {
		main: './src/api/sunbeam.js'
	},
	output: {
		// publicPath: 'http://excel-inc.acmr.com.cn:20064/vender/master/',
        publicPath: 'http://192.168.1.250:8088/sunbeam/',
		filename: 'sunbeam.js',
		library: 'Sunbeam',
		libraryExport: 'default'
	},
	plugins: [
		new UglifyJsPlugin({
			exclude: '/(node_modules|bower_components)/',
			sourceMap: true
		}),
		new webpack.DefinePlugin({
			'process.env.NODE_ENV': JSON.stringify('production')
		}),
		new HtmlWebpackPlugin({
			template: 'index.tps'
		}),
		new CleanWebpackPlugin(['dist']),
	]
})
baseConfig.module.rules[0].loader = 'vue-loader'
module.exports = baseConfig