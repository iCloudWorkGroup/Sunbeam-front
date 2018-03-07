function* gen(counter) {
	while (true) {
		yield counter + '';
		counter++;
	}
}

function createGenerator(counter) {
	let myGen = gen(counter);
	return function() {
		return myGen.next();
	};
}
export default {
	rowAliasGenerator(counter = 0) {
		this.rowAliasGenerator = createGenerator(counter);
	},
	colAliasGenerator(counter = 0) {
		this.rowAliasGenerator = createGenerator(counter);
	},
	cellAliasGenerator(counter = 0) {
		this.rowAliasGenerator = createGenerator(counter);
	},
	selectAliasGenerator(counter = 0) {
		this.rowAliasGenerator = createGenerator(counter);
	}
};