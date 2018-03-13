module.exports = {
	devtool: 'inline-source-map',
	entry: ['./src/js/app.js'],
	module: {
		loaders: [{
			test: /\.js$/,
			exclude: /(node_modules|bower_components)/,
			loader: 'babel-loader'
		}, {
			test: /\.js$/,
			exclude: /(node_modules|bower_components|\.spec\.js)/,
			use: {
				loader: 'istanbul-instrumenter-loader',
				options: {
					esModules: true
				}
			},
			enforce: 'post'
		}, {
			test: /\.vue$/,
			loader: 'vue-loader',
			options: {
				loaders: {
					js: 'babel-loader'
				},
				postLoaders: {
					js: 'istanbul-instrumenter-loader?esModules=true'
				}
			}
		}]
	}
}