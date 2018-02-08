export default {
	getPointInfo(state) {
		return function(colAlias, rowAlias, type) {
			let pointsInfo = state.col,
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