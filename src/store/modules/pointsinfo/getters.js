export default {
    getPointInfo(state, getters, rootState) {
        return function(colAlias, rowAlias, type) {
            let currentSheet = rootState.currentSheet
            let pointsInfo = state[currentSheet].col
            let tmp

            if (pointsInfo[colAlias] &&
                (tmp = pointsInfo[colAlias][rowAlias])) {
                if (typeof type !== 'undefined') {
                    return tmp[type]
                } else {
                    return tmp
                }
            }
            return null
        }
    }
}