function* gen(counterArgs) {
    let counter = counterArgs
    while (true) {
        counter++
        yield counter.toString()
    }
}

function createGenerator(counter) {
    let myGen = gen(counter)
    return function() {
        let val = myGen.next().value
        return val
    }
}
export default {
    rowAliasGenerator(counter = 0) {
        this.rowAliasGenerator = createGenerator(counter)
        return counter.toString()
    },
    colAliasGenerator(counter = 0) {
        this.colAliasGenerator = createGenerator(counter)
        return counter.toString()
    },
    cellAliasGenerator(counter = 0) {
        this.cellAliasGenerator = createGenerator(counter)
        return counter.toString()
    },
    selectAliasGenerator(counter = 0) {
        this.selectAliasGenerator = createGenerator(counter)
        return counter.toString()
    }
}