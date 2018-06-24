const express = require("express")

const app = express();

app.use(express.static(__dirname + '/dist/'))

const port = process.env.PORT || 8087
module.exports = app.listen(port, () => {
	console.log(`server started, listening on ${port}`)
})