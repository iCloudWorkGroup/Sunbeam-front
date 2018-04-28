function* gen(counter) {
	while (true) {
		counter++;
		yield counter + '';
	}
}

function createGenerator(counter) {
	let myGen = gen(counter);
	return function() {
		let val = myGen.next().value;
		return val;
	};
}
export default {
	rowAliasGenerator(counter = 0) {
		this.rowAliasGenerator = createGenerator(counter);
		return counter + '';
	},
	colAliasGenerator(counter = 0) {
		this.colAliasGenerator = createGenerator(counter);
		return counter + '';
	},
	cellAliasGenerator(counter = 0) {
		this.cellAliasGenerator = createGenerator(counter);
		return counter + '';
	},
	selectAliasGenerator(counter = 0) {
		this.selectAliasGenerator = createGenerator(counter);
		return counter + '';
	}
};