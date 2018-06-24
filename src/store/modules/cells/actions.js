import * as actionTypes from '../../action-types'
import * as mutationTypes from '../../mutation-types'
import {indexAttrBinary} from '../../../util/binary'
import extend from '../../../util/extend'
import template from './template'
import {SELECT} from '../../../tools/constant'
import generator from '../../../tools/generator'
import config from '../../../config'
import send from '../../../util/send'

export default {
    /**
     * 还原单元格, 由occupy生成盒模型信息
     */
    [actionTypes.CELLS_RESTORECELL]({
        commit,
        dispatch,
        state,
        rootState,
        getters
    }, payload) {
        let cellList = payload
        if (!Array.isArray(cellList)) {
            cellList = [cellList]
        }

        let sheet = rootState.currentSheet
        let cols = getters.colList
        let rows = getters.rowList
        let cells = getters.cellList
        let limitRowIndex = rows.length - 1
        let limitColIndex = cols.length - 1
        let getPointInfo = getters.getPointInfo
        let getColIndexByAlias = getters.getColIndexByAlias
        let getRowIndexByAlias = getters.getRowIndexByAlias

        for (let i = 0, len = cellList.length; i < len; i++) {
			let cell = cellList[i]
			let aliasColList = cell.occupy.col
			let aliasRowList = cell.occupy.row
			let startRowIndex
			let startColIndex
			let endRowIndex
			let endColIndex
			let aliasCol
			let aliasRow
			let cellIndex
			let width = 0
			let height = 0
			let physicsBox

			aliasCol = aliasColList[0];
			aliasRow = aliasRowList[0];

			cellIndex = getPointInfo(aliasCol, aliasRow, 'cellIndex');

			startRowIndex = getRowIndexByAlias(aliasRow);
			endRowIndex = startRowIndex + aliasRowList.length - 1;

			if (endRowIndex > limitRowIndex) {
				endRowIndex = limitRowIndex
			}
			if (startRowIndex === -1) {
				continue
			}
			startColIndex = getColIndexByAlias(aliasCol)
			endColIndex = startColIndex + aliasColList.length - 1

			if (endColIndex > limitColIndex) {
				endColIndex = limitColIndex
			}
			if (endColIndex === -1) {
				continue
			}

			for (let j = startColIndex; j < endColIndex + 1; j++) {
				let col = cols[j]
				if (!col.hidden) {
					width += col.width + 1
				}
			}
			for (let j = startRowIndex; j < endRowIndex + 1; j++) {
				let row = rows[j]
				if (!row.hidden) {
					height += row.height + 1
				}
			}
			physicsBox = {
				top: rows[startRowIndex].top,
				left: cols[startColIndex].left,
				width: width - 1,
				height: height - 1
			}
			/**
			 * 更新坐标信息
			 */
			if (typeof cellIndex !== 'number') {
				let colAlias, rowAlias
				for (let j = 0; j < aliasColList.length; j++) {
					for (let k = 0; k < aliasRowList.length; k++) {
						colAlias = aliasColList[j]
						rowAlias = aliasRowList[k]
						commit(mutationTypes.UPDATE_POINTINFO, {
							currentSheet: sheet,
							info: {
								colAlias,
								rowAlias,
								type: 'cellIndex',
								value: cells.length
							}
						})
					}
				}
				physicsBox.border = cell.border
				delete cell.border
				cell.physicsBox = physicsBox
				cell = extend({}, template, cell)
				commit(mutationTypes.INSERT_CELL, {
					currentSheet: sheet,
					cell
				})
			} else {
				commit(mutationTypes.UPDATE_CELL, [{
					cell: cells[cellIndex],
					props: {
						physicsBox: {
							height: physicsBox.height,
							width: physicsBox.width
						}
					}
				}])
			}
		}
	},
	[actionTypes.CELLS_UPDATE]({commit, dispatch, getters}, payload){
		let {
			startColIndex,
			endColIndex,
			startRowIndex,
			endRowIndex,
			propNames,
			value
		} = payload;

		//获取操作区域
		if(typeof startColIndex === 'undefined'){
			let select = getters.activeSelect
			let	wholePosi = select.wholePosi
			
			startColIndex = getters.getColIndexByAlias(wholePosi.startColAlias)
			endColIndex = getters.getColIndexByAlias(wholePosi.endColAlias)
			startRowIndex = getters.getRowIndexByAlias(wholePosi.startRowAlias)
			endRowIndex = getters.getRowIndexByAlias(wholePosi.endRowAlias)
		}
		endColIndex = endColIndex || startColIndex
		endRowIndex = endRowIndex || startRowIndex

		propNames = propNames.split('.')

		let propValue
		for (let i = 0; i < propNames.length; i++) {
			if(i === 0){
				propValue = template[propNames[i]]
			}else{
				propValue = propValue[propNames[i]]
			}
		}
		//获取更新值
		if (value === undefined && (typeof propValue === 'boolean' ||
				propValue === 0 || propValue === 1)) {
			let cellList = getters.getCellsByVertical({
				startColIndex,
				endColIndex,
				startRowIndex,
				endRowIndex
			})
			if (cellList.length === 0) {
				if(typeof propValue === 'boolean'){
					value = true
				}else{
					value = 1
				}
			} else {
				let temp;
				for (let i = 0; i < propNames.length; i++) {
					if (i === 0) {
						temp = cellList[0][propNames[i]]
					} else {
						temp = temp[propNames[i]]
					}
				}
				if(typeof propValue === 'boolean'){
					value = !temp
				}else{
					value = 1^temp
				}
			}
		}

		let	props = {}
		let	temp

		for (let i = 0, len = propNames.length; i < len; i++) {
			if (i === 0) {
				temp = props[propNames[0]] = {}
			}else if (i < len - 1) {	
				temp[propNames[i]] = temp = {}
			}else {
				temp[propNames[i]] = value
			} 
		}

		let cols = getters.colList
		let	rows = getters.rowList
		let	oper = propNames[propNames.length - 1]
		let	url = config.operUrl[oper]
		let	data = {}

		data.coordinate = [{
			startCol: cols[startColIndex].sort,
			startRow: rows[startRowIndex].sort,
			endCol: endColIndex === 'MAX' ? -1 : cols[endColIndex].sort,
			endRow: endRowIndex === 'MAX' ? -1 : rows[endRowIndex].sort
		}]
		if(value !== undefined){
			let sendPropName = config.operSendPropName[oper] || oper
			data[sendPropName] = value
		}
		send({
			url,
			data: JSON.stringify(data)
		});
		success()
		function success() {
			if (endRowIndex === 'MAX') {
				dispatch(actionTypes.COLS_OPERCOLS, {
					startIndex: startColIndex,
					endIndex: endColIndex,
					props
				})
			} else if (endColIndex === 'MAX') {
				dispatch(actionTypes.ROWS_OPERROWS, {
					startIndex: startRowIndex,
					endIndex: endRowIndex,
					props
				})
			} else {
				dispatch(actionTypes.CELLS_UPDATE_PROP, {
					startColIndex,
					endColIndex,
					startRowIndex,
					endRowIndex,
					props
				})
			}
		}
	},
	[actionTypes.CELLS_UPDATE_PROP]({commit, dispatch, getters}, {
		startColIndex,
		endColIndex,
		startRowIndex,
		endRowIndex,
		props
	}) {
		let getPointInfo = getters.getPointInfo,
			tempSign = {},
			cols = getters.colList,
			rows = getters.rowList,
			cells = getters.cellList,
			updateCellInfo = [],
			insertCellList = [],
			colAlias,
			rowAlias,
			cellIndex;

		for (let i = startColIndex; i <= endColIndex; i++) {
			for (let j = startRowIndex; j <= endRowIndex; j++) {
				colAlias = cols[i].alias;
				rowAlias = rows[j].alias;
				cellIndex = getPointInfo(colAlias, rowAlias, 'cellIndex');
				if (typeof cellIndex === 'number') {
					let cell;
					if ((cell = cells[cellIndex]) && !tempSign[cell.alias]) {
						updateCellInfo.push({
			       			cell,
			       			props
			       		});
					}
				} else {
					insertCellList.push(extend({
						occupy: {
							col: [colAlias],
							row: [rowAlias]
						}
					}, props));
				}
			}
		}

		dispatch(actionTypes.CELLS_INSERTCELL, insertCellList);
		if (updateCellInfo.length > 0) {
			commit(mutationTypes.UPDATE_CELL, updateCellInfo);
		}
	},
	[actionTypes.CELLS_UPDATE_BORDER]({commit, dispatch, getters}, payload) {
		let {
			startColIndex,
			endColIndex,
			startRowIndex,
			endRowIndex,
			value
		} = payload

		if(typeof startColIndex === 'undefined'){
			let select = getters.activeSelect
			let	wholePosi = select.wholePosi
			startColIndex = getters.getColIndexByAlias(wholePosi.startColAlias)
			endColIndex = getters.getColIndexByAlias(wholePosi.endColAlias)
			startRowIndex = getters.getRowIndexByAlias(wholePosi.startRowAlias)
			endRowIndex = getters.getRowIndexByAlias(wholePosi.endRowAlias)
		}
		let thick = false
		if (value.indexOf('-thick') !== -1) {
			thick = true
			value = value.split('-')[0]
		}

		let operates = []

		switch (value) {
			case 'bottom':
				setBottom()
				break
			case 'top':
				setTop()
				break
			case 'left':
				setLeft()
				break
			case 'right':
				setRight()
				break
			case 'none':
				setNone()
				break
			case 'all':
				setAll()
				break
			case 'outer':
				setOuter()
				break
		}


		function setBottom() {
			if (endRowIndex !== 'MAX') {
				operates.push({
					startRowIndex: endRowIndex,
					startColIndex,
					endRowIndex,
					endColIndex,
					props: {
						physicsBox: {
							border: {
								bottom: thick ? 2 : 1
							}
						}
					}
				})
			}
		}

		function setTop() {
			operates.push({
				startRowIndex,
				startColIndex,
				endRowIndex: startRowIndex,
				endColIndex,
				props: {
					physicsBox: {
						border: {
							top: thick ? 2 : 1
						}
					}
				}
			})
		}

		function setLeft() {
			operates.push( {
				startRowIndex,
				startColIndex,
				endRowIndex,
				endColIndex: startColIndex,
				props: {
					physicsBox: {
						border: {
							left: thick ? 2 : 1
						}
					}
				}
			})
		}

		function setRight() {
			if (endColIndex !== 'MAX') {
				operates.push({
					startRowIndex,
					startColIndex: endColIndex,
					endRowIndex,
					endColIndex,
					props: {
						physicsBox: {
							border: {
								right: thick ? 2 : 1
							}
						}
					}
				})
			}
		}

		function setNone() {
			operates.push({
				startRowIndex,
				startColIndex,
				endRowIndex,
				endColIndex,
				props: {
					physicsBox: {
						border: {
							right: 0,
							left: 0,
							top: 0,
							bottom: 0
						}
					}
				}
			})
		}

		function setAll() {
			operates.push({
				startRowIndex,
				startColIndex,
				endRowIndex,
				endColIndex,
				props: {
					physicsBox: {
						border: {
							right: 1,
							left: 1,
							top: 1,
							bottom: 1
						}
					}
				}
			})
		}

		function setOuter() {
			if (endRowIndex !== 'MAX') {
				operates.push({
					startRowIndex: endRowIndex,
					startColIndex,
					endRowIndex,
					endColIndex,
					props: {
						physicsBox: {
							border: {
								bottom: thick ? 2 : 1
							}
						}
					}
				})
				operates.push({
					startRowIndex,
					startColIndex,
					endRowIndex: startRowIndex,
					endColIndex,
					props: {
						physicsBox: {
							border: {
								top: thick ? 2 : 1
							}
						}
					}
				})
			}

			if (endColIndex !== 'MAX') {
				operates.push({
					startRowIndex,
					startColIndex: endColIndex,
					endRowIndex,
					endColIndex,
					props: {
						physicsBox: {
							border: {
								right: thick ? 2 : 1
							}
						}
					}
				})
				operates.push({
					startRowIndex,
					startColIndex,
					endRowIndex,
					endColIndex: startColIndex,
					props: {
						physicsBox: {
							border: {
								left: thick ? 2 : 1
							}
						}
					}
				})
			}
		}
		let url = config.operUrl.border
		let	cols = getters.colList
		let	rows = getters.rowList
		let	data

		data = {
			coordinate: [{
				startCol: cols[startColIndex].sort,
				startRow: rows[startRowIndex].sort,
				endCol: endColIndex === 'MAX' ? -1 : cols[endColIndex].sort,
				endRow: endRowIndex === 'MAX' ? -1 : rows[endRowIndex].sort
			}],
			direction: value
		}
		if (value !== 'none') {
			data.line = thick ? 2 : 1
		}
		send({
			url,
			data: JSON.stringify(data),
		})
		success()
		function success() {
			if (endRowIndex === 'MAX') {
				operates.forEach((item) => {
					dispatch(actionTypes.COLS_OPERCOLS, {
						startIndex: item.startColIndex,
						endIndex: item.endColIndex,
						props: item.props
					})
				})
			} else if (endColIndex === 'MAX') {
				operates.forEach((item) => {
					dispatch(actionTypes.ROWS_OPERROWS, {
						startIndex: item.startRowIndex,
						endIndex: item.endRowIndex,
						props: item.props
					})
				})
			} else {
				operates.forEach((item) => {
					dispatch(actionTypes.CELLS_UPDATE_PROP, item)
				})
			}
		}
		
	},
	/**
	 * 插入单元格
	 * 传入单元初始化属性和占位
	 * 计算出单元格的盒模型，同时维护pointsinfo
	 */
	[actionTypes.CELLS_INSERTCELL]({commit, state, rootState, getters}, cellList){
		let insertCellInfo = []
		let	cols = getters.colList
		let	rows = getters.rowList
		let	sheet = rootState.currentSheet
		let	indexCounter = getters.cellList.length
			
		cellList.forEach(function(cell) {
			let aliasColList = cell.occupy.col
			let	aliasRowList = cell.occupy.row
			let	startRowIndex
			let	startColIndex
			let	endColIndex
			let	endRowIndex

			cell = extend({}, template, cell)

			startColIndex = getters.getColIndexByAlias(aliasColList[0])			
			endColIndex = getters.getColIndexByAlias(aliasColList[aliasColList.length -1])
			startRowIndex = getters.getRowIndexByAlias(aliasRowList[0])
			endRowIndex = getters.getRowIndexByAlias(aliasRowList[aliasRowList.length -1])

			let top = rows[startRowIndex].top
			let	left = cols[startColIndex].left
			let	width
			let	height

			for (let i = endColIndex; i > startColIndex - 1; i--) {
				if (cols[i].hidden) {
					continue
				} else {
					width = cols[i].left + cols[i].width - cols[startColIndex].left
					break
				}
			}
			width = width || -1

			for (let i = endRowIndex; i > startRowIndex - 1; i--) {
				if (rows[i].hidden) {
					continue
				} else {
					height = rows[i].top + rows[i].height - rows[startRowIndex].top
					break
				}
			}
			height = height || -1

			let physicsBox = {
				top,
				left,
				width,
				height
			}

			extend(cell, {physicsBox})

			cell.alias = generator.cellAliasGenerator()
			commit(mutationTypes.INSERT_CELL, {
				currentSheet: rootState.currentSheet,
				cell
			})
			for (let j = 0; j < aliasColList.length; j++) {
				for (let k = 0; k < aliasRowList.length; k++) {
					let colAlias = aliasColList[j]
					let	rowAlias = aliasRowList[k]

					commit(mutationTypes.UPDATE_POINTINFO, {
						currentSheet: rootState.currentSheet,
						info: {
							colAlias,
							rowAlias,
							type: 'cellIndex',
							value: indexCounter
						}
					})
				}
			}
			indexCounter++
		})
	},
	[actionTypes.COLS_OPERCOLS]({getters, state, rootState, commit, dispatch}, 
        {startIndex, endIndex, props}){

        let updateCellInfo = []
       	let cellList = getters.getCellsByVertical({
       		startRowIndex: 0,
       		endRowIndex: 'MAX',
       		startColIndex: startIndex,
       		endColIndex: endIndex
       	})
       	cellList.forEach(function(cell){
       		updateCellInfo.push({
       			cell,
       			props
       		})
       	})
       	commit(mutationTypes.UPDATE_CELL, updateCellInfo)

       	let insertCellInfo = []
		let	editViewOccupy = getters.getEditViewOccupy()
		let	cols = getters.colList
		let	rows = getters.rowList

       	for(let key in editViewOccupy){
			let viewOccupyRow = editViewOccupy[key].row,
				startRowIndex,
				endRowIndex;
			if (viewOccupyRow.length == 0) {
				continue
			}
			startRowIndex = getters.getRowIndexByAlias(viewOccupyRow[0])
			endRowIndex = getters.getRowIndexByAlias(viewOccupyRow[viewOccupyRow.length - 1])

			for (let i = startRowIndex; i < endRowIndex + 1; i++) {
				for (let j = startIndex; j < endIndex + 1; j++) {
					let colAlias = cols[j].alias
					let	rowAlias = rows[i].alias
					let	cellIndex = getters.getPointInfo(colAlias, rowAlias, 'cellIndex')
					if (typeof cellIndex !== 'number') {
						let cell = extend({}, props)
						cell.occupy = {
							col: [colAlias],
							row: [rowAlias]
						}
						insertCellInfo.push(cell)
					}
				}
			}
       	}
       	dispatch(actionTypes.CELLS_INSERTCELL, insertCellInfo)
	},
	[actionTypes.ROWS_OPERROWS]({getters, state, rootState, commit, dispatch}, 
        {startIndex, endIndex, props}){

		let updateCellInfo = []

		let cellList = getters.getCellsByVertical({
			startRowIndex: startIndex,
			endRowIndex: endIndex,
			startColIndex: 0,
			endColIndex: 'MAX'
		});
		cellList.forEach(function(cell) {
			updateCellInfo.push({
				cell,
				props
			})
		})
		commit(mutationTypes.UPDATE_CELL, updateCellInfo)

		let insertCellInfo = []
		let	editViewOccupy = getters.getEditViewOccupy()
		let	cols = getters.colList
		let	rows = getters.rowList

		for (let key in editViewOccupy) {
			let viewOccupyCol = editViewOccupy[key].col
			let	startColIndex
			let	endColIndex

			if (viewOccupyCol.length === 0) {
				continue
			}
			startColIndex = getters.getColIndexByAlias(viewOccupyCol[0])
			endColIndex = getters.getColIndexByAlias(viewOccupyCol[viewOccupyCol.length - 1])

			for (let i = startColIndex; i < endColIndex + 1; i++) {
				for (let j = startIndex; j < endIndex + 1; j++) {
					let colAlias = cols[i].alias
					let	rowAlias = rows[j].alias
					let	cellIndex = getters.getPointInfo(colAlias, rowAlias, 'cellIndex')
					let	cell = extend({}, props)

					cell.occupy = {
						col: [colAlias],
						row: [rowAlias]
					}
					if (typeof cellIndex !== 'number') {
						insertCellInfo.push(cell)
					}
				}
			}
		}
		dispatch(actionTypes.CELLS_INSERTCELL, insertCellInfo)
	},
	[actionTypes.OCCUPY_UPDATE]({commit, getters, rootState, dispatch}, {col, row}){
		if (col.length === 0 || row.length === 0) {
			return
		}
		let startRowIndex = getters.getRowIndexByAlias(row[0])
		let	startColIndex = getters.getColIndexByAlias(col[0])
		let	endRowIndex = getters.getRowIndexByAlias(row[row.length - 1])
		let	endColIndex = getters.getColIndexByAlias(col[col.length - 1])
		let	cols = getters.colList
		let	rows = getters.rowList
		let	getPointInfo = getters.getPointInfo
		let	temp

		for (let i = startRowIndex; i < endRowIndex + 1; i++) {
			if (!isEmpty((temp = rows[i].props))) {
				for (let j = startColIndex; j < endColIndex + 1; j++) {
					let rowAlias = rows[i].alias
					let	colAlias = cols[j].alias
					let	index = getPointInfo(colAlias, rowAlias, 'cellIndex')
					let	cell = extend({}, temp)

					cell.occupy = {
						col: [colAlias],
						row: [rowAlias]
					}
					if (typeof index !== 'number') {
						dispatch(actionTypes.CELLS_INSERTCELL, [cell])
					}
				}
			}
		}


		for (let i = startColIndex; i < endColIndex + 1; i++) {
			if (!isEmpty((temp = cols[i].props))) {
				for (let j = startRowIndex; j < endRowIndex + 1; j++) {
					let rowAlias = rows[j].alias
					let	colAlias = cols[i].alias
					let	index = getPointInfo(colAlias, rowAlias, 'cellIndex')
					let	cell = extend({}, temp)

					cell.occupy = {
						col: [colAlias],
						row: [rowAlias]
					}
					if (typeof index !== 'number') {
						dispatch(actionTypes.CELLS_INSERTCELL, [cell])
					}
				}
			}
		}

		function isEmpty(obj) {
			let flag = true
			for (let key in obj) {
				flag = false
			}
			if(flag){
				return true
			}
			for (let key in obj.content) {
				return false
			}
			for (let key in obj.border) {
				return false
			}
			for (let key in obj.customProp) {
				return false
			}
			return true
		}
	},
	[actionTypes.CELLS_HANDLEMERGE]({
		dispatch,
		getters,
		rootState
	}, payload) {
		let {
			startColIndex,
			startRowIndex,
			endRowIndex,
			endColIndex,
			value
		} = payload

		if (typeof startColIndex === 'undefined') {
			let select = getters.activeSelect
			let	wholePosi = select.wholePosi

			startColIndex = getters.getColIndexByAlias(wholePosi.startColAlias)
			endColIndex = getters.getColIndexByAlias(wholePosi.endColAlias)
			startRowIndex = getters.getRowIndexByAlias(wholePosi.startRowAlias)
			endRowIndex = getters.getRowIndexByAlias(wholePosi.endRowAlias)
		}
		endColIndex = endColIndex || startColIndex
		endRowIndex = endRowIndex || startRowIndex
		if(endRowIndex === 'MAX' || endColIndex === 'MAX'){
			return
		}

		if (value === undefined) {
			value = !getters.getMergeState()
		}
		let action = value ? 'merge' : 'split'
		let	url = config.operUrl[action]
		let	cols = getters.colList
		let	rows = getters.rowList
		let	data

		data = {
			coordinate: [{
				startCol: cols[startColIndex].sort,
				startRow: rows[startRowIndex].sort,
				endCol: endColIndex === 'MAX' ? -1 : cols[endColIndex].sort,
				endRow: endRowIndex === 'MAX' ? -1 : rows[endRowIndex].sort
			}]
		}
		send({
			url,
			data: JSON.stringify(data)
		})

		if (value) {
			dispatch(actionTypes.CELLS_MERGE, {
				startColIndex,
				endColIndex,
				startRowIndex,
				endRowIndex
			})
		} else {
			dispatch(actionTypes.CELLS_SPLIT, {
				startColIndex,
				endColIndex,
				startRowIndex,
				endRowIndex
			})
		}
	},
	[actionTypes.CELLS_MERGE]({
		dispatch,
		getters
	}, {
		startColIndex,
		endColIndex,
		startRowIndex,
		endRowIndex
	}) {
		let cellList = getters.getCellsByTransverse({
			startColIndex,
			endColIndex,
			startRowIndex,
			endRowIndex
		})
		let cell
		for (let i = 0, len = cellList.length; i < len; i++) {
			if (cellList[i].content.texts) {
				cell = cellList[i]
				break
			}
		}
		if (!cell) {
			cell = getters.getCellsByTransverse({startColIndex, startRowIndex})[0]
		}
		cell = extend({}, cell || {})

		let cols = getters.colList
		let	rows = getters.rowList
		let	rowAliasList = []
		let	colAliasList = []

		for (let i = startColIndex; i < endColIndex + 1; i++) {
			colAliasList.push(cols[i].alias)
		}
		for (let i = startRowIndex; i < endRowIndex + 1; i++) {
			rowAliasList.push(rows[i].alias)
		}

		cell.occupy = {
			row: rowAliasList,
			col: colAliasList
		}
		dispatch(actionTypes.CELLS_INSERTCELL, [cell])
	},
	[actionTypes.CELLS_SPLIT]({
		rootState,
		dispatch,
		getters,
		commit
	}, {
		startColIndex,
		endColIndex,
		startRowIndex,
		endRowIndex
	}) {
		let cellList = getters.getCellsByTransverse({
			startColIndex,
			endColIndex,
			startRowIndex,
			endRowIndex
		})

		let insertCellList = []
		let currentSheet = rootState.currentSheet

		cellList.forEach(cell => {
			let occupyCol = cell.occupy.col
			let occupyRow = cell.occupy.row
			if (occupyRow.length > 1 || occupyCol.length > 1) {
				for (let i = 0, len1 = occupyCol.length; i < len1; i++) {
					for (let j = 0, len2 = occupyRow.length; j < len2; j++) {
						let insertCell = extend(cell)
						if (i !== 0 || j !== 0) {
							insertCell.content.texts = ''
						}
						insertCell.occupy = {
							col: [occupyCol[i]],
							row: [occupyRow[j]]
						}
						insertCellList.push(insertCell)
					}
				}
			}
		});
		dispatch(actionTypes.CELLS_INSERTCELL, insertCellList)
	}
};

