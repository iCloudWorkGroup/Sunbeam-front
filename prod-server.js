const express = require("express")
const webpack = require("webpack")
const webpackDevMiddleware = require('webpack-dev-middleware')
const webpackHotMiddleware = require('webpack-hot-middleware')
const WebpackConfig = require("./webpack.dev")
const data = require("./data.json")

const app = express();

app.use(express.static(__dirname + '/dist/'))
app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers",
        "Content-Type,Content-Length, Authorization, Accept,X-Requested-With"
    );
    res.header("Access-Control-Allow-Methods",
        "PUT,POST,GET,DELETE,OPTIONS");
    res.header("X-Powered-By", ' 3.2.1')
    if (req.method == "OPTIONS") res.send(200);
    else next();
});
app.post('/reload', function(req, res, next) {
    res.send(data.reload);
});
const port = process.env.PORT || 8087

module.exports = app.listen(port, () => {
    console.log(`server started, listening on ${port}`)
})