const express = require("express")

const app = express();

app.use(express.static(__dirname))

const port = process.env.PORT || 8887
module.exports = app.listen(port, () => {
	console.log(`server started, listening on ${port}`)
})
