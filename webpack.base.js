const path = require('path')
const webpack = require('webpack')
module.exports = {
	output: {
		path: path.resolve(__dirname, 'dist'),
		publicPath: '/dist/'
	},
	module: {
		rules: [{
			test: /\.vue(\?[^?]+)?$/
		}, {
			test: /\.css$/,
			use: [
				'style-loader',
				'css-loader'
			]
		}, {
			test: /\.(png|svg|jpg|gif)$/,
			use: [
				'file-loader'
			]
		}, {
			test: /\.(woff|woff2|eot|ttf|otf)$/,
			use: [
				'file-loader'
			]
		}]
	},
	resolve: {
        alias: {
            'vue': 'vue/dist/vue.js'
        }
    }
}