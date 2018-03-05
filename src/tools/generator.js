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
		return counter;
	},
	colAliasGenerator(counter = 0) {
		this.rowAliasGenerator = createGenerator(counter);
		return counter;
	},
	cellAliasGenerator(counter = 0) {
		this.rowAliasGenerator = createGenerator(counter);
		return counter;
	},
	selectAliasGenerator(counter = 0) {
		this.rowAliasGenerator = createGenerator(counter);
		return counter;
	}
};