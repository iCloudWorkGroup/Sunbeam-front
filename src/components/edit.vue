<template>
	<div class="edit" @scroll="onScroll" :style="{width: width + 'px', height: height + 'px'}">
		<edit-panel :frozenRule="frozenRule"></edit-panel>
	</div>
</template>
<script type="text/javascript">
	import EditPanel from './edit-panel.vue';
	import config from '../config';
	import cache from '../tools/cache';
	import send from '../util/send';
	import Vue from 'vue';
	import * as actionTypes from '../store/action-types';
	import * as mutationTypes from '../store/mutation-types';
	import {getColDisplayName, getRowDisplayName} from '../util/displayname';

	export default {
		props: ['editWidth',
			'editHeight', 
			'frozenRule',
			'scrollTop',
			'scrollLeft'
		],
		data() {
			let offsetLeft = this.frozenRule ? this.frozenRule.offsetLeft : 0,
				offsetTop = this.frozenRule ? this.frozenRule.offsetTop : 0;

			return {
				colOccupy: [],
				rowOccupy: [],
				recordScrollTop: 0,
				recordScrollLeft: 0,
				timeoutId: '',
				lastScrollHandleTime: 0,
				currentPromise: null,
				offsetLeft, 
				offsetTop
			}
		},	
		mounted() {
			let frozenRule = this.frozenRule;
			this.getOccupy();
			if(!frozenRule || frozenRule.type==='mainRule'){
				this.$store.commit(mutationTypes.UPDATE_USERVIEW, {
					left: this.offsetLeft,
					top: this.offsetTop,
					right: this.offsetLeft + this.$el.clientWidth + config.prestrainWidth,
					bottom: this.offsetTop + this.$el.clientHeight + config.prestrainHeight
				});
			}
		},
		computed: {
			width() {
				return this.editWidth;
			},
			height() {
				return this.editHeight;
			}
		},
		components: {
			EditPanel
		},
		methods: {
			onScroll() {
				let frozenRule = this.frozenRule,
					self = this;

				let currentScrollLeft = this.$el.scrollLeft,
					currentScrollTop = this.$el.scrollTop;

				if (!frozenRule || frozenRule.type === 'mainRule') {
					this.$emit('changeScrollLeft', currentScrollLeft);
					this.$emit('changeScrollTop', currentScrollTop);

				}
				if (this.timeoutId !== '') {
					clearTimeout(this.timeoutId);
				}

				this.timeoutId = setTimeout(function() {
					self.handleScroll(currentScrollLeft, currentScrollTop);
				}, 50);
			},

			handleScroll(currentScrollLeft, currentScrollTop){
				let currentPromise = this.currentPromise,
					frozenRule = this.frozenRule,
					endColIndex,
					endRowIndex,
					self = this;

				if(frozenRule){
					endColIndex = frozenRule.endColIndex;
					endRowIndex = frozenRule.endRowIndex;
				}

				currentPromise = currentPromise || new Promise(function(resolve){
					resolve();
				});
				this.currentPromise = currentPromise.then(function(){
					let transverse = currentScrollLeft - self.recordScrollLeft,
						vertical = currentScrollTop - self.recordScrollTop,
						limitTop,
						limitBottom,
						limitLeft,
						limitRight,
						p1, p2;

					self.recordScrollTop = currentScrollTop;
					self.recordScrollLeft = currentScrollLeft;

					if (vertical !== 0 && endRowIndex === undefined) {
						limitTop = self.recordScrollTop - config.prestrainHeight;
						limitTop = limitTop > 0 ? limitTop : 0;
						limitTop += self.offsetTop;
						limitBottom = limitTop + self.$el.clientHeight 
							+ config.prestrainHeight 
							+ self.offsetTop;

						if (vertical > 0) {
							p1 = new Promise(function(resolve) {
								self.scrollToBottom(limitTop, limitBottom, resolve);
							});
						} else {
							p1 = new Promise(function(resolve) {
								self.scrollToTop(limitTop, limitBottom, resolve);
							});
						}
						p1.then(function() {
							self.$store.commit(mutationTypes.UPDATE_USERVIEW, {
								top: self.recordScrollTop + self.offsetTop,
								bottom: limitBottom
							});
						});
					}

					if (transverse !== 0 && endColIndex === undefined) {
						limitLeft = self.recordScrollLeft - config.prestrainWidth;
					    limitLeft = limitLeft > 0 ? limitLeft : 0;
					    limitLeft += self.offsetLeft;
						limitRight = limitLeft + self.$el.clientWidth 
							+ config.prestrainWidth
							+ self.offsetLeft;

						if (transverse > 0) {
							p2 = new Promise(function(resolve){
								self.scrollToRight(limitLeft, limitRight, resolve);
							});
						} else {
							p2 = new Promise(function(resolve){
								self.scrollToLeft(limitLeft, limitRight, resolve);
							});
						}
						p2.then(function() {
							self.$store.commit(mutationTypes.UPDATE_USERVIEW, {
								left: self.recordScrollLeft + self.offsetLeft,
								right: limitRight
							});
						});

					}
					if(!p1){
						p1 = new Promise((resolve) => {
							resolve();
						});
					}
					if(!p2){
						p2 = new Promise((resolve) => {
							resolve();
						});
					}
					return Promise.all([p1, p2]);	
				});
			},
			scrollToBottom(limitTop, limitBottom, resolve) {
				let rowList = this.$store.getters.rowList,
					maxBottom = cache.localRowPosi,
					bufferHeight = config.scrollBufferWidth,
					rowRecord = cache.rowRecord,
					rowOccupy = this.rowOccupy,
					colOccupy = this.colOccupy,
					regionRecord = cache.regionRecord,
					occupyEndRowAlias = rowOccupy[rowOccupy.length - 1],
					occupyEndRow = this.$store.getters.getRowByAlias(occupyEndRowAlias),
					occupyBottom = occupyEndRow.top + occupyEndRow.height,
					frozenRule = this.frozenRule,
					addRowNum = 0,
					self = this,
					promise;
				
				/**
				 * 当前视图边界值超过了后台对象的最大值
				 * 需要自动增加列
				 */
				if (limitBottom > maxBottom && (!frozenRule || frozenRule.type === 'mainRule')) {
					addRowNum = Math.ceil((limitBottom - maxBottom + bufferHeight) / config.rowHeight);
					limitBottom = maxBottom;
				}

				promise = new Promise(function(currentResolve){
					getNextRow(currentResolve);
				}).then(function(){
					return new Promise(function(currentResolve){
						getRegion(currentResolve);
					});
				}).then(function(){
					addRow();
					removeOccupyRow();
					resolve();
				});
				/**
				 * 当前视图边界值超过了已加载对象最大值
				 * 起始值为当前所占块下边界
				 * 终止值为视图边界+缓存高度
				 */
				function getNextRow(resolve) {
					let lastRow = rowList[rowList.length - 1],
						currentMaxBottom = lastRow.top + lastRow.height;

					if (currentMaxBottom < limitBottom) {

						limitBottom = limitBottom + bufferHeight;
						limitBottom = limitBottom < maxBottom ? limitBottom : maxBottom;

						self.verticalRequest(currentMaxBottom + 1, limitBottom, resolve,
							function(alias) {
								let rowOccupy = self.rowOccupy,
									colOccupy = self.colOccupy,
									occupyBottomAlias = rowOccupy[rowOccupy.length - 1],
									occupyBottomIndex = rowRecord.indexOf(occupyBottomAlias),
									temp = []; //记录请求区间跨域加载块

								temp.push(rowRecord[occupyBottomIndex]);
								for (let i = occupyBottomIndex + 1, len = rowRecord.length; i < len; i++) {
									temp.push(rowRecord[i]);
									rowOccupy.push(rowRecord[i]);
								}
								temp.push(alias);

								for (let i = 0, len1 = colOccupy.length - 1; i < len1; i++) {
									for (let j = 0, len2 = temp.length - 1; j < len2; j++) {
										let sign = colOccupy[i] + '_' + colOccupy[i + 1] + '_' +
											temp[j] + '_' + temp[j + 1];
										if (!regionRecord.get(sign)) {
											regionRecord.set(sign, true);
										}
									}
								}
								rowOccupy.push(alias);
								if(rowRecord.indexOf(alias)=== -1){
									rowRecord.push(alias);
								}
								let lastRow = rowList[rowList.length - 1];
								occupyBottom = lastRow.top + lastRow.height;
							});
					} else {
						resolve();
					}
				}

				function getRegion(resolve){
			 		if (occupyBottom < limitBottom) {
						let temp = [occupyEndRowAlias],
							i = rowRecord.indexOf(occupyEndRowAlias) + 1;

						for (let len = rowRecord.length; i < len; i++) {
							let row = self.$store.getters.getRowByAlias(rowRecord[i]);
							temp.push(row.alias);
							rowOccupy.push(row.alias);
							if (row.top + row.height > limitBottom) {
								limitBottom = row.top + row.height;
								break;
							}
						}
						let flag = false;
						for (let i = 0, len1 = temp.length - 1; i < len1; i++) {
							for (let j = 0, len2 = colOccupy.length - 1; j < len2; j++) {
								let sign = colOccupy[j] + '_' + colOccupy[j + 1] + '_' +
										temp[i] + '_' + temp[i + 1];
								if (!regionRecord.get(sign)) {
									regionRecord.set(sign, true);
									flag = true;
								}
							}
						}
						if (flag) {
							self.verticalRequest(occupyBottom + 1, limitBottom, resolve);
						}else{
							resolve();
						}
					}else{
						resolve();
					}
				}

				function addRow() {
					addRowNum = addRowNum + rowList.length < config.maxRowNum ?
						addRowNum : config.maxRowNum - rowList.length;

					if (addRowNum > 0) {
						let colOccupy = this.colOccupy,
							tempAlias = rowList[rowList.length - 1].alias,
							currentAlias;

						this.$store.dispatch(actionTypes.ROWS_GENERAT, addRowNum);

						currentAlias = rowList[rowList.length - 1].alias;

						for (let i = 0, len = colOccupy.length - 1; i < len; i++) {
							let sign = colOccupy[i] + '_' + colOccupy[i + 1] + '_' +
								tempAlias + '_' + currentAlias;
							regionRecord.set(sign, true);
						}
						rowOccupy.push(currentAlias);
						rowRecord.push(currentAlias);
					}
				}
				function removeOccupyRow() {
					let counter = 0,
						flag = false;
					for (let i = 0, len = rowOccupy.length; i < len; i++) {
						let row = self.$store.getters.getRowByAlias(rowOccupy[i]);
						if (row.top > limitTop) {
							counter--;
							break;
						}
						counter++;
					}
					for (let i = 0; i < counter; i++) {
						rowOccupy.shift();
					}
				}
			},
			scrollToTop(limitTop, limitBottom, resolve){
				let rowOccupy = this.rowOccupy,
					colOccupy = this.colOccupy,
					rowRecord = cache.rowRecord,
					occupyStartRowAlias = rowOccupy[0],
					occupyStartRow = this.$store.getters.getRowByAlias(occupyStartRowAlias),
					currentTop = occupyStartRow.top,
					self = this;

				new Promise(function(currentResolve){
					getTop(currentResolve);
				}).then(function(){
					adjustOccupy();
					resolve();
				});

				function getTop(resolve) {
					if (limitTop < currentTop) {
						let regionRecord = cache.regionRecord,
							temp = [rowOccupy[0]],
							i = rowRecord.indexOf(occupyStartRowAlias) - 1;

						if (i === -1) {
							return;
						}
						for (; i > -1; i--) {
							let row = self.$store.getters.getRowByAlias(rowRecord[i]);
							temp.unshift(row.alias);
							rowOccupy.unshift(row.alias);
							if (row.top <= limitTop) {
								limitTop = row.top;
								break;
							}
						}
						let flag = false;
						for (let i = 0, len1 = temp.length - 1; i < len1; i++) {
							for (let j = 0, len2 = colOccupy.length - 1; j < len2; j++) {
								let sign = colOccupy[j] + '_' + colOccupy[j + 1] + '_' +
									temp[i] + '_' + temp[i + 1];
								if (!regionRecord.get(sign)) {
									regionRecord.set(sign, true);
									flag = true;
								}
							}
						}
						if (flag) {
							self.verticalRequest(limitTop, currentTop - 1, resolve);
						}else{
							resolve();
						}
					}else{
						resolve();
					}
				}

				function adjustOccupy() {
					//移除上方多余行
					let counter = 0;

					for (let i = rowOccupy.length - 1; i > -1; i--) {
						let row = self.$store.getters.getRowByAlias(rowOccupy[i]);
						if (row.top + row.height < limitBottom) {
							counter--;
							break;
						}
						counter++;
					}
					for (let i = 0; i < counter; i++) {
						rowOccupy.pop();
					}
				}
			},
			scrollToRight(limitLeft, limitRight, resolve) {
				let colList = this.$store.getters.colList,
					maxRight = cache.localColPosi,
					bufferWidth = config.scrollBufferWidth,
					colRecord = cache.colRecord,
					colOccupy = this.colOccupy,
					regionRecord = cache.regionRecord,
					lastCol = colList[colList.length - 1],
					currentMaxRight = lastCol.left + lastCol.width,
					occupyEndColAlias = colOccupy[colOccupy.length - 1],
					occupyEndCol = this.$store.getters.getColByAlias(occupyEndColAlias),
					occupyRight = occupyEndCol.left + occupyEndCol.width,
					frozenRule = this.frozenRule,
					addColNum = 0,
					self = this,
					promise;

				/**
				 * 当前视图边界值超过了后台对象的最大值
				 * 需要自动增加列
				 */
				if (limitRight > maxRight && (!frozenRule || frozenRule.type === 'mainRule')) {
					addColNum = Math.ceil((limitRight - maxRight + bufferWidth) / config.colWidth);
					limitRight = maxRight;
				}

				promise = new Promise(function(currentResolve){
					getNextCol(currentResolve);
				}).then(function(){
					return new Promise(function(currentResolve){
						getRight(currentResolve);
					});
				}).then(function(){
					addCol();
					removeOccupyCol();
					resolve();
				});

				/**
				 * 当前视图边界值超过了已加载对象最大值
				 * 起始值为当前所占块下边界
				 * 终止值为视图边界+缓存高度
				 */
				function getNextCol(resolve) {
					if (currentMaxRight < limitRight) {
						limitRight = limitRight + config.scrollBufferWidth;
						limitRight = limitRight < maxRight ? limitRight : maxRight;
					/**
					 * 横向请求
					 * 起始值为当前所占块右边界
					 * 终止值为视图边界+缓存宽度
					 */
					self.transverseRequest(currentMaxRight + 1, limitRight, resolve,
						function(alias) {
							let rowOccupy = self.rowOccupy,
								colOccupy = self.colOccupy,
								occupyRightAlias = colOccupy[colOccupy.length - 1],
								occupyRightIndex = colRecord.indexOf(occupyRightAlias),
								temp = []; //记录请求区间跨域加载块

							for (let i = occupyRightIndex, len = colRecord.length; i < len; i++) {
								temp.push(colRecord[i]);
							}

							temp.push(alias);

							for (let i = 0, len1 = rowOccupy.length - 1; i < len1; i++) {
								for (let j = 0, len2 = temp.length - 1; j < len2; j++) {
									let sign = temp[j] + '_' + temp[j + 1] + '_' +
										rowOccupy[i] + '_' + rowOccupy[i + 1];
									if (!regionRecord.get(sign)) {
										regionRecord.set(sign, true);
									}
								}
							}
							colOccupy.push(alias);
							if (colRecord.indexOf(alias) === -1) {
								colRecord.push(alias);
							}
						});
					}else{
						resolve();
					}
				}

				function getRight(resolve) {
					if (occupyRight < limitRight) {
						let rowOccupy = self.rowOccupy,
							temp = [occupyEndColAlias],
							i = colRecord.indexOf(occupyEndColAlias) + 1;

						for (let len = colRecord.length; i < len; i++) {
							let col = self.$store.getters.getColByAlias(colRecord[i]);
							temp.push(col.alias);
							colOccupy.push(col.alias);
							if (col.left + col.width > limitRight) {
								limitRight = col.left + col.width;
								break;
							}
						}
						let flag = false;
						for (let i = 0, len1 = temp.length - 1; i < len1; i++) {
							for (let j = 0, len2 = rowOccupy.length - 1; j < len2; j++) {
								let sign = temp[i] + '_' + temp[i + 1] + '_' +
									rowOccupy[j] + '_' + rowOccupy[j + 1];
								if (!regionRecord.get(sign)) {
									regionRecord.set(sign, true);
									flag = true;
								}
							}
						}
						if (flag) {
							self.transverseRequest(occupyRight + 1, limitRight, resolve);
						} else {
							resolve();
						}
					} else {
						resolve();
					}
				}

				function addCol() {
					addColNum = addColNum + colList.length < config.maxColNum ?
						addColNum : config.maxColNum - colList.length;

					if (addColNum > 0) {
						let rowOccupy = self.rowOccupy,
							tempAlias = colList[colList.length - 1].alias,
							currentAlias;

						self.$store.dispatch(actionTypes.COLS_GENERAT, addColNum);

						currentAlias = colList[colList.length - 1].alias;

						for (let i = 0, len = rowOccupy.length - 1; i < len; i++) {
							let sign = tempAlias + '_' + currentAlias + '_' +
								rowOccupy[i] + '_' + rowOccupy[i + 1];
								regionRecord.set(sign, true);
						}
						colOccupy.push(currentAlias);
						colRecord.push(currentAlias);
					}
				}
				function removeOccupyCol() {
					//移除左侧多余列
					let counter = 0,
						flag = false;
					for (let i = 0, len = colOccupy.length; i < len; i++) {
						let col = self.$store.getters.getColByAlias(colOccupy[i]);
						if (col.left > limitLeft) {
							counter--;
							break;
						}
						counter++;
					}

					for (let i = 0; i < counter; i++) {
						colOccupy.shift();
					}
				}
			},
			scrollToLeft(limitLeft, limitRight, resolve){
				let colOccupy = this.colOccupy,
					rowOccupy = this.rowOccupy,
					occupyStartColAlias = colOccupy[0],
					occupyStartCol = this.$store.getters.getColByAlias(occupyStartColAlias),
					currentLeft = occupyStartCol.left,
					colRecord = cache.colRecord,
					self = this;

				new Promise(function(currentResolve){
					getLeft(currentResolve);
				}).then(function(){
					adjustOccupy();
					resolve();
				});

				function getLeft(resolve) {
					if (limitLeft < 0) {
						limitLeft = 0;
					}

					if (limitLeft < currentLeft) {
						let regionRecord = cache.regionRecord,
							temp = [colOccupy[0]],
							i = colRecord.indexOf(occupyStartColAlias) - 1;

						if (i === -1) {
							return;
						}
						for (; i > -1; i--) {
							let col = self.$store.getters.getColByAlias(colRecord[i]);
							temp.unshift(col.alias);
							colOccupy.unshift(col.alias);
							if (col.left <= limitLeft) {
								limitLeft = col.left;
								break;
							}
						}
						let flag = false;
						for (let i = 0, len1 = temp.length - 1; i < len1; i++) {
							for (let j = 0, len2 = rowOccupy.length - 1; j < len2; j++) {
								let sign = temp[i] + '_' + temp[i + 1] + '_' +
									rowOccupy[j] + '_' + rowOccupy[j + 1];
								if (!regionRecord.get(sign)) {
									regionRecord.set(sign, true);
									flag = true;
								}
							}
						}
						if (flag) {
							self.transverseRequest(limitLeft, currentLeft - 1);
						} else {
							resolve();
						}
					} else {
						resolve();
					}
				}
				//移除右侧多余列
				function adjustOccupy() {
					let counter = 0;

					for (let i = colOccupy.length -1; i > -1; i--) {
						let col = self.$store.getters.getColByAlias(colOccupy[i]);
						if (col.left + col.width < limitRight) {
							counter--;
							break;
						}
						counter++;
					}
					for (let i = 0; i < counter; i++) {
						colOccupy.pop();
					}
				}
			},
			transverseRequest(left, right, resolve, fn) {
				let startRowAlias = this.rowOccupy[0],
					endRowAlias = this.rowOccupy[this.rowOccupy.length - 1],
					startRow = this.$store.getters.getRowByAlias(startRowAlias),
					endRow = this.$store.getters.getRowByAlias(endRowAlias),
					top = startRow.top,
					bottom = endRow.top + endRow.height;

					send({
						url: 'sheet/area',
						isPublic: false,
						data: JSON.stringify({
							left,
							top,
							right,
							bottom
						}),
						success: (data) => {
							let sheetData;
							data = data.returndata;

							if (data.spreadSheet && data.spreadSheet[0] &&
								(sheetData = data.spreadSheet[0].sheet)) {
								if(fn){
									let cols = sheetData.glX,
										endColAlias = cols[cols.length - 1].aliasX;

									cols.forEach(function(col) {
										col.sort = col.index;
										col.alias = col.aliasX;
										col.displayName = getColDisplayName(col.sort);
									});
									this.$store.dispatch(actionTypes.COLS_INSERTCOLS, cols);	
									fn(endColAlias);
								}
								let cells = sheetData.cells;	
								this.$store.dispatch(actionTypes.CELLS_RESTORECELL, cells);
							}
							resolve();
						}
					});
			},
			verticalRequest(top, bottom, resolve, fn){
				let startColAlias = this.colOccupy[0],
					endColAlias = this.colOccupy[this.colOccupy.length - 1],
					startCol = this.$store.getters.getColByAlias(startColAlias),
					endCol = this.$store.getters.getColByAlias(endColAlias),
					left = startCol.left,
					right = endCol.left + endCol.width;

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
							let sheetData;
							data = data.returndata;

							if (data.spreadSheet && data.spreadSheet[0] &&
								(sheetData = data.spreadSheet[0].sheet)) {
								if(fn){
									let rows = sheetData.glY,
										endRowAlias = rows[rows.length - 1].aliasY;

									rows.forEach(function(row) {
										row.sort = row.index;
										row.alias = row.aliasY;
										row.displayName = getRowDisplayName(row.sort);
									});
									this.$store.dispatch(actionTypes.ROWS_INSERTROWS, rows);	
									fn(endRowAlias);
								}
								let cells = sheetData.cells;
								this.$store.dispatch(actionTypes.CELLS_RESTORECELL, cells);
							}
							resolve();
						}
					});
			},
			getOccupy(){
				let colList = this.$store.getters.colList,
					rowList = this.$store.getters.rowList,
					offsetLeft = this.offsetLeft,
					offsetTop = this.offsetTop,
					clientWidth = this.$el.clientWidth,
					clientHeight = this.$el.clientHeight,
					endColIndex,
					endRowIndex,
					startRowIndex = 0,
					startColIndex = 0,
					frozenRule = this.frozenRule,
					getters = this.$store.getters;

				if (frozenRule) {
					if (frozenRule.endRowIndex !== undefined &&
						frozenRule.endColIndex !== undefined) {
						return;
					}
					startRowIndex = frozenRule.startRowIndex;
					startColIndex = frozenRule.startColIndex;

					endRowIndex = frozenRule.endRowIndex ||
						this.$store.getters.getRowIndexByPosi(offsetTop + clientHeight + config.prestrainHeight);
					endColIndex = frozenRule.endColIndex ||
						this.$store.getters.getColIndexByPosi(offsetLeft + clientWidth + config.prestrainWidth);
				} else {
					endRowIndex = this.$store.getters.getRowIndexByPosi(clientHeight + config.prestrainHeight);
					endColIndex = this.$store.getters.getColIndexByPosi(clientWidth + config.prestrainWidth);
				}

				let colRecord = cache.colRecord,
					rowRecord = cache.rowRecord,
					startCol = colList[startColIndex],
					endCol = colList[endColIndex],
					startRow = rowList[startRowIndex],
					endRow = rowList[endRowIndex];

				for (let i = 0, len = colRecord.length - 1; i < len; i++) {
					let col = getters.getColByAlias(colRecord[i]),
						nextCol = getters.getColByAlias(colRecord[i + 1]);

					if (col.left <= startCol.left && nextCol.left > startCol.left) {
						this.colOccupy.push(colRecord[i]);
					}
					if (col.left > startCol.left && col.left < endCol.left) {
						this.colOccupy.push(colRecord[i]);
					}
					if (col.left < endCol.left && nextCol.left >= endCol.left) {
						this.colOccupy.push(colRecord[i + 1]);
					}
				}

				for (let i = 0, len = rowRecord.length - 1; i < len; i++) {
					let row = getters.getRowByAlias(rowRecord[i]),
						nextRow = getters.getRowByAlias(rowRecord[i + 1]);

					if (row.top <= startRow.top && nextRow.top > startRow.top) {
						this.rowOccupy.push(rowRecord[i]);
					}
					if (row.top > startRow.top && row.top < endRow.top) {
						this.rowOccupy.push(rowRecord[i]);
					}
					if (row.top < endRow.top && nextRow.top >= endRow.top) {
						this.rowOccupy.push(rowRecord[i + 1]);
					}
				}
			}
		},
		watch: {
			frozenRule(newVal, oldVal){
				let self = this;
				Vue.nextTick(function(){
					if(newVal){
						self.$el.scrollTop = 0;
						self.$el.scrollLeft = 0;
						self.offsetLeft = self.frozenRule ? self.frozenRule.offsetLeft : 0,
						self.offsetTop = self.frozenRule ? self.frozenRule.offsetTop : 0;
						clearTimeout(self.timeoutId);
						self.handleScroll(0, 0);
					}else{
						self.offsetLeft = 0;
						self.offsetTop = 0;
						self.$el.scrollTop = oldVal.userViewTop;
						self.$el.scrollLeft = oldVal.userViewLeft;
						clearTimeout(self.timeoutId);
						self.handleScroll(oldVal.userViewLeft, oldVal.userViewTop);
					}
					self.getOccupy();
				});
			},
			scrollLeft(val) {
				this.$el.scrollLeft = val;
			},
			scrollTop(val) {
				this.$el.scrollTop = val;
			}
		},
	};
</script>
<style type="text/css">
	.edit {
		overflow: hidden;
	}
	.edit.scroll-box {
	    overflow: auto;
	}
</style>