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
		}]
	},
	resolve: {
        alias: {
            'vue': 'vue/dist/vue.js'
        }
    }
}