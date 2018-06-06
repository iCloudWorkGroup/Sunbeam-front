module.exports = {
	'reload': function(brower) {
		brower
			.url('http://localhost:8080')
			.waitForElementVisible('.select-group', 5000)

		brower.moveTo('.select-group', 428, 247)
			.dblClick(function(e) {
				console.log(e)
				// brower.dblClick('.select-group')
			})
	}
}