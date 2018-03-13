const express = require("express")
const webpack = require("webpack")
const webpackDevMiddleware = require('webpack-dev-middleware')
const webpackHotMiddleware = require('webpack-hot-middleware')
const WebpackConfig = require("./webpack.dev")


const app = express();
const compiler = webpack(WebpackConfig)

app.use(webpackDevMiddleware(compiler, {
	publicPath: WebpackConfig.output.publicPath
}))
app.use(webpackHotMiddleware(compiler))

app.use(express.static(__dirname))

const port = process.env.PORT || 8080
module.exports = app.listen(port, () => {
	console.log(`server started, listening on ${port}`)
})
