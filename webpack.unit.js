module.exports = {
    devtool: 'inline-source-map',
    module: {
        rules: [{
            test: /\.vue(\?[^?]+)?$/,
            loader: 'vue-loader'
        }, {
            test: /\.js$/,
            use: {
                loader: 'istanbul-instrumenter-loader',
                options: {
                    esModules: true
                }
            },
            enforce: 'pre',
            exclude: /node_modules|\.spec\.js%/,
        }, {
            test: /\.js$/,
            use: {
                loader: 'babel-loader',
                options: {
                    presets: ['env'],
                    plugins: ['istanbul', 
                    "transform-object-rest-spread", 
                    ["transform-runtime", {
                        "helpers": false,
                        "polyfill": false,
                        "regenerator": true,
                        "moduleName": "babel-runtime"
                    }]]
                }
            },
            exclude: /node_modules/
        }]
    }
}