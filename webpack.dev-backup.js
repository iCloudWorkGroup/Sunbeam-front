const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
	entry: './src/app.js',
	output: {
		filename: 'sm.js',
		path: path.resolve(__dirname, 'dist'),
		publicPath: '/'
	},
	devtool: 'source-map',
	devServer: {
		contentBase: './',
	},
	module: {
		rules: [{
			test: /\.css$/,
			use: [
				'style-loader',
				'css-loader'
			]
		}, 
		// {
		// 	test: /\.(js|vue)$/,
		// 	loader: 'eslint-loader',
		// 	enforce: 'pre',
		// 	include: [path.resolve(__dirname, 'src')],
		// 	options: {
		// 		formatter: require('eslint-friendly-formatter'),
		// 	}
		// }
		// ,
		 {
			test: /\.vue$/,
			loader: 'vue-loader'
		}, {
			test: /\.js$/,
			loader: 'babel-loader',
			exclude: /node_modules/
		}]
	},
	plugins: [
		new HtmlWebpackPlugin({
			template: './src/index.html'
		}),
		// new UglifyJSPlugin()
	],
	resolve: {
		alias: {
			vue: 'vue/dist/vue.js',
		}
	}
}