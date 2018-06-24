import Vue from 'vue'
import extend from '../../../util/extend'
import template from './template'
import * as types from '../../mutation-types'

export default {
	[types.INSERT_SHEET](state, sheet) {
		Vue.set(state, sheet.alias, {
			col: {},
			row: {}
		})
	},
	[types.UPDATE_POINTINFO](state, {
		currentSheet,
		info: {
			colAlias,
			rowAlias,
			type,
			value
		}
	}) {
		let colInfo = state[currentSheet].col
		let rowInfo = state[currentSheet].row
		let tmp

		if (colInfo[colAlias] && (tmp = colInfo[colAlias][rowAlias])) {
			tmp[type] = value
			tmp = rowInfo[rowAlias][colAlias]
			tmp[type] = value
		} else {
			if (!colInfo[colAlias]) {
				Vue.set(colInfo, colAlias, {
					[rowAlias]: extend(template)
				})
			}
			if (!rowInfo[rowAlias]) {
				Vue.set(rowInfo, rowAlias, {
					[colAlias]: extend(template)
				})
			}
			if (!colInfo[colAlias][rowAlias]) {
				Vue.set(colInfo[colAlias], rowAlias, extend(template))
			}
			if (!rowInfo[rowAlias][colAlias]) {
				Vue.set(rowInfo[rowAlias], colAlias, extend(template))
			}

			colInfo[colAlias][rowAlias][type] = value
			rowInfo[rowAlias][colAlias][type] = value
		}
	}
}
