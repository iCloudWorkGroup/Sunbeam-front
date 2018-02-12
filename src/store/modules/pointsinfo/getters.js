export default {
	getPointInfo(state, getters, rootState) {
		return function(colAlias, rowAlias, type) {
			let currentSheet = rootState.currentSheet,
				pointsInfo = state[currentSheet].col,
				tmp;

			if (pointsInfo[colAlias] && (tmp = pointsInfo[colAlias][rowAlias])) {
				if (typeof type !== 'undefined') {
					return tmp[type];
				} else {
					return tmp;
				}
			}
			return null;
		}
	}
}