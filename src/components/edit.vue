<template>
<div class="edit"
     @scroll="onScroll"
     :style="{
        width: width + 'px',
        height: height + 'px'
        }">
    <edit-panel :frozenRule="frozenRule"></edit-panel>
</div>

</template>

<script type="text/javascript">
import EditPanel from './edit-panel.vue'
import config from '../config'
import cache from '../tools/cache'
import send from '../util/send'
import Vue from 'vue'
import * as actionTypes from '../store/action-types'
import * as mutationTypes from '../store/mutation-types'
import generator from '../tools/generator'
import { getColDisplayName, getRowDisplayName } from '../util/displayname'

export default {
    props: [
		'editWidth',
		'editHeight',
		'frozenRule',
		'scrollTop',
		'scrollLeft'
	],
	data() {
		let offsetLeft = this.frozenRule ? this.frozenRule.offsetLeft : 0
		let	offsetTop = this.frozenRule ? this.frozenRule.offsetTop : 0

		return {
			recordScrollTop: 0,
			recordScrollLeft: 0,
			timeoutId: '',
			currentPromise: null,
			offsetLeft,
			offsetTop
		}
	},
	mounted() {
		this.setOccupy()
		this.updateUserView()
	},
	beforeDestroy() {
		this.updateOccupy([], [])
	},
	computed: {
		width() {
			return this.editWidth
		},
		height() {
			return this.editHeight
		},
		colOccupy() {
			let type = this.frozenRule && this.frozenRule.type || 'mainRule'
			return this.$store.getters.getEditViewOccupy(type).col
		},
		rowOccupy() {
			let type = this.frozenRule && this.frozenRule.type || 'mainRule'
			return this.$store.getters.getEditViewOccupy(type).row
		},
		colMaxPosi() {
			return this.$store.getters.getColMaxPosi
		},
		rowMaxPosi() {
			return this.$store.getters.getRowMaxPosi
		}
	},
	components: {
		EditPanel
	},
	methods: {
		onScroll() {
			let frozenRule = this.frozenRule
			let	self = this
			let currentScrollLeft = this.$el.scrollLeft
			let	currentScrollTop = this.$el.scrollTop

			if (!frozenRule || frozenRule.type === 'mainRule') {
				this.$emit('changeScrollLeft', currentScrollLeft)
				this.$emit('changeScrollTop', currentScrollTop)
			}
			if (this.timeoutId !== '') {
				clearTimeout(this.timeoutId)
			}
			this.timeoutId = setTimeout(function() {
				self.handleScroll(currentScrollLeft, currentScrollTop)
			}, 50)
		},
		handleScroll(currentScrollLeft, currentScrollTop, adjustCol = false, adjustRow = false) {
			let currentPromise = this.currentPromise
			let	frozenRule = this.frozenRule
			let	endColIndex
			let	endRowIndex
			let	self = this

			if (frozenRule) {
				endColIndex = frozenRule.endColIndex
				endRowIndex = frozenRule.endRowIndex
			}

			currentPromise = currentPromise || Promise.resolve()

			this.currentPromise = currentPromise.then(function() {
				let transverse = currentScrollLeft - self.recordScrollLeft
				let	vertical = currentScrollTop - self.recordScrollTop
				let	limitTop
				let	limitBottom
				let	limitLeft
				let	limitRight
				let	p1
				let p2

				self.recordScrollTop = currentScrollTop
				self.recordScrollLeft = currentScrollLeft

				if ((vertical !== 0 && typeof endRowIndex === 'undefined') || adjustRow) {
					limitTop = self.recordScrollTop - config.prestrainHeight
					limitTop = limitTop > 0 ? limitTop : 0
					limitTop += self.offsetTop
					limitBottom = limitTop + self.$el.clientHeight
						+ config.prestrainHeight
						+ self.offsetTop

					if (vertical > 0 || adjustRow) {
						p1 = new Promise(function(resolve) {
							self.scrollToBottom(limitTop, limitBottom, resolve)
						})
					} else {
						p1 = new Promise(function(resolve) {
							self.scrollToTop(limitTop, limitBottom, resolve)
						})
					}
					p1.then(function() {
						self.$store.commit(mutationTypes.UPDATE_USERVIEW, {
							top: self.recordScrollTop + self.offsetTop,
							bottom: limitBottom
						})
					})
				}

				if ((transverse !== 0 && typeof endColIndex === 'undefined') || adjustCol) {
					limitLeft = self.recordScrollLeft - config.prestrainWidth
					limitLeft = limitLeft > 0 ? limitLeft : 0
					limitLeft += self.offsetLeft
					limitRight = limitLeft + self.$el.clientWidth
						+ config.prestrainWidth
						+ self.offsetLeft

					if (transverse > 0 || adjustCol) {
						p2 = new Promise(function(resolve) {
							self.scrollToRight(limitLeft, limitRight, resolve)
						})
					} else {
						p2 = new Promise(function(resolve) {
							self.scrollToLeft(limitLeft, limitRight, resolve)
						})
					}
					p2.then(function() {
						self.$store.commit(mutationTypes.UPDATE_USERVIEW, {
							left: self.recordScrollLeft + self.offsetLeft,
							right: limitRight
						})
					})
				}
				if (!p1) {
					p1 = new Promise((resolve) => {
						resolve()
					})
				}
				if (!p2) {
					p2 = new Promise((resolve) => {
						resolve()
					})
				}
				return Promise.all([p1, p2])
			})
		},
		scrollToBottom(top, bottom, resolve) {
			let rowList = this.$store.getters.rowList
			let	localMaxBottom = cache.localRowPosi
			let	bufferHeight = config.scrollBufferWidth
			let	rowRecord = cache.rowRecord
			let	rowOccupy = this.rowOccupy.slice(0)
			let	colOccupy = this.colOccupy.slice(0)
			let	regionRecord = cache.regionRecord
			let	occupyEndRowAlias = rowOccupy[rowOccupy.length - 1]
			let	occupyEndRow = this.$store.getters.getRowByAlias(occupyEndRowAlias)
			let	occupyBottom = occupyEndRow.top + occupyEndRow.height
			let	frozenRule = this.frozenRule
			let	addRowNum = 0
			let	self = this
			let limitBottom = bottom
			let limitTop = top
			limitBottom = parseInt(limitBottom, 0)
			/**
			 * 当前视图边界值超过了后台对象的最大值
			 * 需要自动增加列
			 */
			let lastRow = rowList[rowList.length - 1]
			let maxBottom = lastRow.top + lastRow.height
			maxBottom = maxBottom > localMaxBottom ? maxBottom : localMaxBottom

			if (limitBottom > maxBottom && (!frozenRule || frozenRule.type === 'mainRule')) {
				addRowNum = Math.ceil((limitBottom - maxBottom + bufferHeight) / config.rowHeight)
				limitBottom = maxBottom
			}

			if (cache.localRowPosi === 0) {
				addRow()
				resolve()
				return
			}

			new Promise(function(currentResolve) {
				getNextRow(currentResolve)
			}).then(function() {
				return new Promise(function(currentResolve) {
					getRegion(currentResolve)
				})
			}).then(function() {
				addRow()
				removeOccupyRow()
				self.updateOccupy(colOccupy, rowOccupy)
				resolve()
			})
			/**
			 * 当前视图边界值超过了已加载对象最大值
			 * 起始值为当前所占块下边界
			 * 终止值为视图边界+缓存高度
			 */
			function getNextRow(resolve) {
				let lastRow = rowList[rowList.length - 1]
				let currentMaxBottom = lastRow.top + lastRow.height

				if (currentMaxBottom < limitBottom) {
					limitBottom = limitBottom + bufferHeight
					limitBottom = limitBottom < localMaxBottom ? limitBottom : localMaxBottom

					self.verticalRequest(currentMaxBottom + 1, limitBottom, resolve,
						function(alias) {
							let occupyBottomAlias = rowOccupy[rowOccupy.length - 1]
							let	occupyBottomIndex = rowRecord.indexOf(occupyBottomAlias)
							let	temp = [] // 记录请求区间跨域加载块
							temp.push(rowRecord[occupyBottomIndex])
							for (let i = occupyBottomIndex + 1, len = rowRecord.length; i < len; i++) {
								temp.push(rowRecord[i])
								rowOccupy.push(rowRecord[i])
							}
							temp.push(alias)

							for (let i = 0, len1 = colOccupy.length - 1; i < len1; i++) {
								for (let j = 0, len2 = temp.length - 1; j < len2; j++) {
									let sign = colOccupy[i] + '_' + colOccupy[i + 1] + '_' +
										temp[j] + '_' + temp[j + 1]
									if (!regionRecord.get(sign)) {
										regionRecord.set(sign, true)
									}
								}
							}
							rowOccupy.push(alias)
							if (rowRecord.indexOf(alias) === -1) {
								rowRecord.push(alias)
							}
							let lastRow = rowList[rowList.length - 1]
							occupyBottom = lastRow.top + lastRow.height
						})
				} else {
					resolve()
				}
			}

			function getRegion(resolve) {
				if (occupyBottom < limitBottom) {
					let temp = [occupyEndRowAlias]
					let i = rowRecord.indexOf(occupyEndRowAlias) + 1

					for (let len = rowRecord.length; i < len; i++) {
						let row = self.$store.getters.getRowByAlias(rowRecord[i])

						temp.push(row.alias)
						rowOccupy.push(row.alias)
						if (row.top + row.height > limitBottom) {
							limitBottom = row.top + row.height
							break
						}
					}
					let flag = false
					for (let i = 0, len1 = temp.length - 1; i < len1; i++) {
						for (let j = 0, len2 = colOccupy.length - 1; j < len2; j++) {
							let sign = colOccupy[j] + '_' + colOccupy[j + 1] + '_' +
								temp[i] + '_' + temp[i + 1]
							if (!regionRecord.get(sign)) {
								regionRecord.set(sign, true)
								flag = true
							}
						}
					}
					self.updateOccupy(colOccupy, rowOccupy)
					if (flag) {
						self.verticalRequest(occupyBottom + 1, limitBottom, resolve)
					} else {
						resolve()
					}
				} else {
					resolve()
				}
			}

			function addRow() {
				addRowNum = addRowNum + rowList.length < config.maxRowNum ?
					addRowNum : config.maxRowNum - rowList.length

				if (addRowNum > 0) {
					let tempAlias = rowList[rowList.length - 1].alias
					let	currentAlias

					self.$store.dispatch(actionTypes.ROWS_GENERAT, addRowNum)

					currentAlias = rowList[rowList.length - 1].alias

					for (let i = 0, len = colOccupy.length - 1; i < len; i++) {
						let sign = colOccupy[i] + '_' + colOccupy[i + 1] + '_' +
							tempAlias + '_' + currentAlias
						regionRecord.set(sign, true)
					}
					rowOccupy.push(currentAlias)
					rowRecord.push(currentAlias)
				}
			}
			function removeOccupyRow() {
				let counter = 0
				for (let i = 0, len = rowOccupy.length; i < len; i++) {
					let row = self.$store.getters.getRowByAlias(rowOccupy[i])
					if (row.top > limitTop) {
						counter--
						break
					}
					counter++
				}
				for (let i = 0; i < counter; i++) {
					rowOccupy.shift()
				}
			}
		},
		scrollToTop(top, bottom, resolve) {
			let rowOccupy = this.rowOccupy.slice(0)
			let	colOccupy = this.colOccupy.slice(0)
			let	rowRecord = cache.rowRecord
			let	occupyStartRowAlias = rowOccupy[0]
			let	occupyStartRow = this.$store.getters.getRowByAlias(occupyStartRowAlias)
			let	currentTop = occupyStartRow.top
			let	self = this
			let limitTop = top
			let limitBottom = bottom
			if (cache.localRowPosi === 0) {
				resolve()
				return
			}
			new Promise(function(currentResolve) {
				getTop(currentResolve)
			}).then(function() {
				adjustOccupy()
				self.updateOccupy(colOccupy, rowOccupy)
				resolve()
			})

			function getTop(resolve) {
				if (limitTop < currentTop) {
					let regionRecord = cache.regionRecord
					let temp = [rowOccupy[0]]
					let i = rowRecord.indexOf(occupyStartRowAlias)

					if (i === -1) {
						return
					}
					i--
					for (; i > -1; i--) {
						let row = self.$store.getters.getRowByAlias(rowRecord[i])
						temp.unshift(row.alias)
						rowOccupy.unshift(row.alias)
						if (row.top <= limitTop) {
							limitTop = row.top
							break
						}
					}
					let flag = false
					for (let i = 0, len1 = temp.length - 1; i < len1; i++) {
						for (let j = 0, len2 = colOccupy.length - 1; j < len2; j++) {
							let sign = colOccupy[j] + '_' + colOccupy[j + 1] + '_' +
								temp[i] + '_' + temp[i + 1]
							if (!regionRecord.get(sign)) {
								regionRecord.set(sign, true)
								flag = true
							}
						}
					}
					if (flag) {
						self.verticalRequest(limitTop, currentTop - 1, resolve)
					} else {
						resolve()
					}
				} else {
					resolve()
				}
			}

			function adjustOccupy() {
				// 移除上方多余行
				let counter = 0
				for (let i = rowOccupy.length - 1; i > -1; i--) {
					let row = self.$store.getters.getRowByAlias(rowOccupy[i])
					if (row.top + row.height < limitBottom) {
						counter--
						break
					}
					counter++
				}
				for (let i = 0; i < counter; i++) {
					rowOccupy.pop()
				}
			}
		},
		scrollToRight(left, right, resolve) {
			let getters = this.$store.getters
			let	colList = getters.colList
			let	localMaxRight = cache.localColPosi
			let	bufferWidth = config.scrollBufferWidth
			let	colRecord = cache.colRecord
			let	colOccupy = this.colOccupy.slice(0)
			let	rowOccupy = this.rowOccupy.slice(0)
			let	regionRecord = cache.regionRecord
			let	occupyEndColAlias = colOccupy[colOccupy.length - 1]
			let	occupyEndCol = this.$store.getters.getColByAlias(occupyEndColAlias)
			let	occupyRight = occupyEndCol.left + occupyEndCol.width
			let	frozenRule = this.frozenRule
			let	addColNum = 0
			let	self = this
			let limitLeft = left
			let limitRight = right
			limitRight = parseInt(limitRight, 0)
			/**
			 * 当前视图边界值超过了后台对象的最大值
			 * 需要自动增加列
			 */
			let lastCol = colList[colList.length - 1]
			let maxRight = lastCol.left + lastCol.width
			maxRight = maxRight > localMaxRight ? maxRight : localMaxRight
			if (limitRight > maxRight && (!frozenRule || frozenRule.type === 'mainRule')) {
				addColNum = Math.ceil((limitRight - maxRight + bufferWidth) / config.colWidth)
				limitRight = maxRight
			}

			if (cache.localRowPosi === 0) {
				addCol()
				resolve()
				return
			}
			new Promise(function(currentResolve) {
				getNextCol(currentResolve)
			}).then(function() {
				return new Promise(function(currentResolve) {
					getRight(currentResolve)
				})
			}).then(function() {
				addCol()
				removeOccupyCol()
				self.updateOccupy(colOccupy, rowOccupy)
				resolve()
			})

			/**
			 * 当前视图边界值超过了已加载对象最大值
			 * 起始值为当前所占块下边界
			 * 终止值为视图边界+缓存高度
			 */
			function getNextCol(resolve) {
				let lastCol = colList[colList.length - 1]
				let	currentMaxRight = lastCol.left + lastCol.width
				if (currentMaxRight < limitRight) {
					limitRight = limitRight + config.scrollBufferWidth
					limitRight = limitRight < maxRight ? limitRight : maxRight
					/**
					 * 横向请求
					 * 起始值为当前所占块右边界
					 * 终止值为视图边界+缓存宽度
					 */
					self.transverseRequest(currentMaxRight + 1, limitRight, resolve,
						function(alias) {
							let occupyRightAlias = colOccupy[colOccupy.length - 1]
							let	occupyRightIndex = colRecord.indexOf(occupyRightAlias)
							let	temp = [] // 记录请求区间跨域加载块

							for (let i = occupyRightIndex, len = colRecord.length; i < len; i++) {
								temp.push(colRecord[i])
							}

							temp.push(alias)

							for (let i = 0, len1 = rowOccupy.length - 1; i < len1; i++) {
								for (let j = 0, len2 = temp.length - 1; j < len2; j++) {
									let sign = temp[j] + '_' + temp[j + 1] + '_' +
										rowOccupy[i] + '_' + rowOccupy[i + 1]
									if (!regionRecord.get(sign)) {
										regionRecord.set(sign, true)
									}
								}
							}
							colOccupy.push(alias)
							if (colRecord.indexOf(alias) === -1) {
								colRecord.push(alias)
							}
						})
				} else {
					resolve()
				}
			}

			function getRight(resolve) {
				if (occupyRight < limitRight) {
					let temp = [occupyEndColAlias]
					let	i = colRecord.indexOf(occupyEndColAlias) + 1

					for (let len = colRecord.length; i < len; i++) {
						let col = self.$store.getters.getColByAlias(colRecord[i])
						temp.push(col.alias)
						colOccupy.push(col.alias)
						if (col.left + col.width > limitRight) {
							limitRight = col.left + col.width
							break
						}
					}
					let flag = false
					for (let i = 0, len1 = temp.length - 1; i < len1; i++) {
						for (let j = 0, len2 = rowOccupy.length - 1; j < len2; j++) {
							let sign = temp[i] + '_' + temp[i + 1] + '_' +
								rowOccupy[j] + '_' + rowOccupy[j + 1]
							if (!regionRecord.get(sign)) {
								regionRecord.set(sign, true)
								flag = true
							}
						}
					}
					if (flag) {
						self.transverseRequest(occupyRight + 1, limitRight, resolve)
					} else {
						resolve()
					}
				} else {
					resolve()
				}
			}

			function addCol() {
				addColNum = addColNum + colList.length < config.maxColNum ?
					addColNum : config.maxColNum - colList.length

				if (addColNum > 0) {
					let tempAlias = colList[colList.length - 1].alias
					let currentAlias

					self.$store.dispatch(actionTypes.COLS_GENERAT, addColNum)
					currentAlias = colList[colList.length - 1].alias

					for (let i = 0, len = rowOccupy.length - 1; i < len; i++) {
						let sign = tempAlias + '_' + currentAlias + '_' +
							rowOccupy[i] + '_' + rowOccupy[i + 1]
						regionRecord.set(sign, true)
					}
					colOccupy.push(currentAlias)
					colRecord.push(currentAlias)
				}
			}

			function removeOccupyCol() {
				// 移除左侧多余列
				let counter = 0
				for (let i = 0, len = colOccupy.length; i < len; i++) {
					let col = self.$store.getters.getColByAlias(colOccupy[i])
					if (col.left > limitLeft) {
						counter--
						break
					}
					counter++
				}

				for (let i = 0; i < counter; i++) {
					colOccupy.shift()
				}
			}
		},
		scrollToLeft(left, right, resolve) {
			let colOccupy = this.colOccupy.slice(0)
			let rowOccupy = this.rowOccupy.slice(0)
			let occupyStartColAlias = colOccupy[0]
			let occupyStartCol = this.$store.getters.getColByAlias(occupyStartColAlias)
			let currentLeft = occupyStartCol.left
			let colRecord = cache.colRecord
			let self = this
			let limitLeft = left
			let limitRight = right

			if (cache.localRowPosi === 0) {
				resolve()
				return
			}
			new Promise(function(currentResolve) {
				getLeft(currentResolve)
			}).then(function() {
				adjustOccupy()
				self.updateOccupy(colOccupy, rowOccupy)
				resolve()
			})

			function getLeft(resolve) {
				if (limitLeft < 0) {
					limitLeft = 0
				}

				if (limitLeft < currentLeft) {
					let regionRecord = cache.regionRecord
					let temp = [colOccupy[0]]
					let i = colRecord.indexOf(occupyStartColAlias) - 1

					if (i === -1) {
						return
					}
					for (; i > -1; i--) {
						let col = self.$store.getters.getColByAlias(colRecord[i])
						temp.unshift(col.alias)
						colOccupy.unshift(col.alias)
						if (col.left <= limitLeft) {
							limitLeft = col.left
							break
						}
					}
					let flag = false
					for (let i = 0, len1 = temp.length - 1; i < len1; i++) {
						for (let j = 0, len2 = rowOccupy.length - 1; j < len2; j++) {
							let sign = temp[i] + '_' + temp[i + 1] + '_' +
								rowOccupy[j] + '_' + rowOccupy[j + 1]
							if (!regionRecord.get(sign)) {
								regionRecord.set(sign, true)
								flag = true
							}
						}
					}
					if (flag) {
						self.transverseRequest(limitLeft, currentLeft - 1, resolve)
					} else {
						resolve()
					}
				} else {
					resolve()
				}
			}
			// 移除右侧多余列
			function adjustOccupy() {
				let counter = 0

				for (let i = colOccupy.length - 1; i > -1; i--) {
					let col = self.$store.getters.getColByAlias(colOccupy[i])
					if (col.left + col.width < limitRight) {
						counter--
						break
					}
					counter++
				}
				for (let i = 0; i < counter; i++) {
					colOccupy.pop()
				}
			}
		},
		transverseRequest(left, right, resolve, fn) {
			let startRowAlias = this.rowOccupy[0]
			let endRowAlias = this.rowOccupy[this.rowOccupy.length - 1]
			let startRow = this.$store.getters.getRowByAlias(startRowAlias)
			let endRow = this.$store.getters.getRowByAlias(endRowAlias)
			let top = startRow.top
			let bottom = endRow.top + endRow.height

				send({
					url: 'sheet/area',
					isPublic: false,
					data: JSON.stringify({
						left,
						top,
						right,
						bottom
					}),
					success: data => {
						if (fn) {
							let colData = data.gridLineCol
							let endColAlias = colData[colData.length - 1].alias
							let firstCol = colData[0]

							if (firstCol.hidden) {
								let index = this.$store.getters.getColIndexByAlias(firstCol.alias)
								if (index > 0) {
									let cols = this.$store.getters.colList
									this.$store.commit(mutationTypes.UPDATE_COL, {
										col: cols[index - 1],
										props: {
											rightAjacentHide: true
										}
									})
								}
							}
							for (let i = 0, len = colData.length; i < len; i++) {
								let col = colData[i]
								if (col.hidden && i > 0) {
									colData[i - 1].rightAjacentHide = true
								}
								col.displayName = getColDisplayName(col.sort)
							}
							this.$store.dispatch(actionTypes.COLS_RESTORECOLS, colData)
							fn(endColAlias)
						}
						let cells = data.cells
						cells.forEach(function(cell) {
							cell.alias = generator.cellAliasGenerator()
						})
						this.$store.dispatch(actionTypes.CELLS_RESTORECELL, cells)
						resolve()
					}
				})
		},
		verticalRequest(top, bottom, resolve, fn) {
			let startColAlias = this.colOccupy[0]
			let	endColAlias = this.colOccupy[this.colOccupy.length - 1]
			let	startCol = this.$store.getters.getColByAlias(startColAlias)
			let	endCol = this.$store.getters.getColByAlias(endColAlias)
			let	left = startCol.left
			let	right = endCol.left + endCol.width
			return send({
				url: 'sheet/area',
				isPublic: false,
				data: JSON.stringify({
					left,
					top,
					right,
					bottom
				}),
				success: (data) => {
					if (fn) {
						let rowData = data.gridLineRow
						let	endRowAlias = rowData[rowData.length - 1].alias
						let	firstRow = rowData[0]

						if (firstRow.hidden) {
							let index = this.$store.getters.getRowIndexByAlias(firstRow.alias)
							if (index > 0) {
								let rows = this.$store.getters.rowList
								this.$store.commit(mutationTypes.UPDATE_ROW, {
									row: rows[index - 1],
									props: {
										bottomAjacentHide: true
									}
								})
							}
						}
						for (let i = 0, len = rowData.length; i < len; i++) {
							let row = rowData[i]
							if (row.hidden && i > 0) {
								rowData[i - 1].bottomAjacentHide = true
							}
							row.displayName = getRowDisplayName(row.sort)
						}

						this.$store.dispatch(actionTypes.ROWS_RESTOREROWS, rowData)
						fn(endRowAlias)
					}
					let cells = data.cells
					cells.forEach(function(cell) {
						cell.alias = generator.cellAliasGenerator()
					})
					this.$store.dispatch(actionTypes.CELLS_RESTORECELL, cells)
					resolve()
				}
			})
		},
		updateOccupy(colOccupy, rowOccupy) {
			this.$store.dispatch(actionTypes.OCCUPY_UPDATE, {
				type: this.frozenRule && this.frozenRule.type,
				col: colOccupy,
				row: rowOccupy
			})
		},
		setOccupy() {
			let getters = this.$store.getters
			let	colList = getters.colList
			let	rowList = getters.rowList
			let	offsetLeft = this.$el.scrollLeft
			let	offsetTop = this.$el.scrollTop
			let	clientWidth = this.$el.clientWidth
			let	clientHeight = this.$el.clientHeight
			let	startRowIndex = 0
			let	startColIndex = 0
			let	endColIndex
			let	endRowIndex
			let	frozenRule = this.frozenRule
			let	colOccupy = []
			let	rowOccupy = []
			if (frozenRule) {
				startRowIndex = frozenRule.startRowIndex
				startColIndex = frozenRule.startColIndex
				endRowIndex = frozenRule.endRowIndex
				endColIndex = frozenRule.endColIndex

				offsetTop += frozenRule.offsetTop
				offsetLeft += frozenRule.offsetLeft
			}

			endColIndex = typeof endColIndex !== 'undefined' ? endColIndex :
				getters.getColIndexByPosi(offsetLeft + clientWidth +
					config.prestrainWidth)

			endRowIndex = typeof endRowIndex !== 'undefined' ? endRowIndex :
				getters.getRowIndexByPosi(offsetTop + clientHeight +
					config.prestrainHeight)
			let colRecord = cache.colRecord
			let	rowRecord = cache.rowRecord
			let	startCol = colList[startColIndex]
			let	endCol = colList[endColIndex]
			let	startRow = rowList[startRowIndex]
			let	endRow = rowList[endRowIndex]

			for (let i = 0, len = colRecord.length - 1; i < len; i++) {
				let col = getters.getColByAlias(colRecord[i])
				let	nextCol = getters.getColByAlias(colRecord[i + 1])

				if (col.left <= startCol.left && nextCol.left > startCol.left) {
					colOccupy.push(colRecord[i])
				}
				if (col.left > startCol.left && col.left < endCol.left) {
					colOccupy.push(colRecord[i])
				}
				if (col.left < endCol.left && nextCol.left >= endCol.left) {
					colOccupy.push(colRecord[i + 1])
				}
			}

			for (let i = 0, len = rowRecord.length - 1; i < len; i++) {
				let row = getters.getRowByAlias(rowRecord[i])
				let	nextRow = getters.getRowByAlias(rowRecord[i + 1])

				if (row.top <= startRow.top && nextRow.top > startRow.top) {
					rowOccupy.push(rowRecord[i])
				}
				if (row.top > startRow.top && row.top < endRow.top) {
					rowOccupy.push(rowRecord[i])
				}
				if (row.top < endRow.top && nextRow.top >= endRow.top) {
					rowOccupy.push(rowRecord[i + 1])
				}
			}
			this.updateOccupy(colOccupy, rowOccupy)
		},
		updateUserView() {
			let frozenRule = this.frozenRule
			if (!frozenRule || frozenRule.type === 'mainRule') {
				this.$store.commit(mutationTypes.UPDATE_USERVIEW, {
					left: this.offsetLeft,
					top: this.offsetTop,
					right: this.offsetLeft + this.$el.clientWidth + config.prestrainWidth,
					bottom: this.offsetTop + this.$el.clientHeight + config.prestrainHeight
				})
			}
		}
	},
	watch: {
		frozenRule(newVal, oldVal) {
			let self = this
			Vue.nextTick(function() {
				if (newVal) {
					self.$el.scrollTop = 0
					self.$el.scrollLeft = 0
					self.offsetLeft = self.frozenRule ? self.frozenRule.offsetLeft : 0
					self.offsetTop = self.frozenRule ? self.frozenRule.offsetTop : 0
					clearTimeout(self.timeoutId)
					self.handleScroll(0, 0)
				} else {
					self.offsetLeft = 0
					self.offsetTop = 0
					self.$el.scrollTop = oldVal.userViewTop
					self.$el.scrollLeft = oldVal.userViewLeft
					clearTimeout(self.timeoutId)
					self.handleScroll(oldVal.userViewLeft, oldVal.userViewTop)
				}
				self.setOccupy()
				self.updateUserView()
			})
		},
		scrollLeft(val) {
			this.$el.scrollLeft = val
		},
		scrollTop(val) {
			this.$el.scrollTop = val
		},
		colMaxPosi(newVal, oldVal) {
			let frozenRule = this.frozenRule
			if (newVal < oldVal && (!frozenRule || typeof frozenRule.endColIndex === 'undefined')) {
				this.handleScroll(this.recordScrollLeft, this.recordScrollTop, true, false)
			}
		},
		rowMaxPosi(newVal, oldVal) {
			let frozenRule = this.frozenRule
			if (newVal < oldVal && (!frozenRule || typeof frozenRule.endRowIndex === 'undefined')) {
				this.handleScroll(this.recordScrollLeft, this.recordScrollTop, false, true)
			}
		}
	}
}

</script>
<style type="text/css">
.edit {
    overflow: hidden;
    background: white;
}

.scroll-box {
    overflow: auto;
}
</style>