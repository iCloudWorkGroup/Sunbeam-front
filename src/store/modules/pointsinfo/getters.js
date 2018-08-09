export default {
    getPointInfo(state, getters, rootState) {
        return function(colAlias, rowAlias, type) {
            let points = state.col
            let tmp
            if (points[colAlias] &&
                (tmp = points[colAlias][rowAlias])) {
                if (typeof type !== 'undefined') {
                    return tmp[type]
                } else {
                    return tmp
                }
            }
            return null
        }
    },
    cellIdxByRow: function(state) {
        return function(colAlias, rowAlias) {
            let map = state.RowMap
            return map.get(rowAlias) != null &&
                map.get(rowAlias).get(colAlias) != null ?
                map.get(rowAlias).get(colAlias) :
                -1
        }
    },
    cellIdxByCol: function(state) {
        return function(colAlias, rowAlias) {
            let map = state.RowMap
            return map.get(colAlias).get(rowAlias) != null ?
                map.get(colAlias).get(rowAlias) :
                -1
        }

    }
}