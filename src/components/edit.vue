<template>
	<div class="edit scroll-box" @scroll="onScroll" :style="{width: width + 'px', height: height + 'px'}">
		<edit-panel></edit-panel>
	</div>
</template>
<script type="text/javascript">
	import EditPanel from './edit-panel.vue';
	import config from '../config';
	import cache from '../tools/cache';
	import send from '../util/send';
	import * as types from '../store/action-types';
	import {getColDisplayName, getRowDisplayName} from '../util/displayname';

	export default {
		props: ['editWidth', 'editHeight'],
		data() {
			return {
				colOccupy: [],
				rowOccupy: [],
				recordScrollTop: 0,
				recordScrollLeft: 0
			}
		},
		created() {
			let colList = this.$store.getters.colList,
				rowList = this.$store.getters.rowList,
				lastCol = colList[colList.length - 1],
				lastRow = rowList[rowList.length - 1];
			//未处理冻结情况，添加冻结操作，需要通过计算，获取初始化值
			this.colOccupy.push(colList[0].alias, lastCol.alias);
			this.rowOccupy.push(rowList[0].alias, lastRow.alias);
			window.regionRecord =cache.regionRecord;
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
				let	transverse = this.$el.scrollLeft - this.recordScrollLeft,
					vertical = this.$el.scrollTop - this.recordScrollTop;
					
				this.recordScrollTop = this.$el.scrollTop;
				this.recordScrollLeft = this.$el.scrollLeft;

				if (vertical !== 0) {
					this.$emit('changeScrollTop', this.recordScrollTop);
					if (vertical > 0) {
						this.scrollToBttom();
					} else {
						this.scrollToTop();
					}
					
				} else {
					this.$emit('changeScrollLeft', this.recordScrollLeft);
					if (transverse > 0) {
						this.scrollToRight();
					} else {
						this.scrollToLeft();
					}
				}
			},
			scrollToBttom() {
				let rowList = this.$store.getters.rowList,
					maxBottom = cache.localRowPosi,
					bufferHeight = config.scrollBufferWidth,
					rowRecord = cache.rowRecord,
					rowOccupy = this.rowOccupy,
					regionRecord = cache.regionRecord,
					lastRow = rowList[rowList.length - 1],
					currentMaxBottom = lastRow.top + lastRow.height,
					limitBottom = this.$el.scrollTop + this.$el.offsetHeight + config.prestrainWidth,
					limitTop = this.$el.scrollTop,
					occupyEndRowAlias = rowOccupy[rowOccupy.length - 1],
					occupyEndRow = this.$store.getters.getRowByAlias(occupyEndRowAlias),
					occupyBottom = occupyEndRow.top + occupyEndRow.height,
					addRowNum = 0;

				/**
				 * 当前视图边界值超过了后台对象的最大值
				 * 需要自动增加列
				 */
				if (limitBottom > maxBottom) {
					addRowNum = Math.ceil((limitBottom - maxBottom + bufferHeight) / config.rowHeight);
					limitBottom = maxBottom;
				}

				/**
				 * 当前视图边界值超过了已加载对象最大值
				 * 需要请求数据
				 */

				if (currentMaxBottom < limitBottom) {
					let self = this;
					
					limitBottom = limitBottom + bufferHeight;
					limitBottom = limitBottom < maxBottom ? limitBottom : maxBottom;
					/**
					 * 横向请求
					 * 起始值为当前所占块右边界
					 * 终止值为视图边界+缓存宽度
					 */
					this.verticalRequest(currentMaxBottom + 1, limitBottom,
						function(alias) {
							let rowOccupy = self.rowOccupy,
								colOccupy = self.colOccupy,
								occupyBottomAlias = rowOccupy[rowOccupy.length - 1],
								occupyBottomIndex = rowRecord.indexOf(occupyBottomAlias),
								temp = []; //记录请求区间跨域加载块

							for (let i = occupyBottomIndex, len = rowRecord.length; i < len; i++) {
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
							rowRecord.push(alias);
						});
					/**
					 * 当前视图边界值超出了，视图所占块的边界值
					 * 需要判断超出边界区域是否已经加载过
					 */
				} else if (occupyBottom < limitBottom) {
					let colOccupy = this.colOccupy,
						temp = [occupyEndRowAlias],
						i = rowRecord.indexOf(occupyEndRowAlias) + 1;

					for (let len = rowRecord.length; i < len; i++) {
						let row = this.$store.getters.getRowByAlias(rowRecord[i]);
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
						this.verticalRequest(occupyBottom + 1, limitBottom);
					}
				}
				/**
				 * 自动增加行
				 */
				addRowNum = addRowNum + rowList.length < config.maxRowNum ?
					addRowNum : config.maxRowNum - rowList.length;

				if (addRowNum > 0) {
					let colOccupy = this.colOccupy,
						tempAlias = rowList[rowList.length - 1].alias,
						currentAlias;

					this.$store.dispatch(types.ROWS_GENERAT, addRowNum);

					currentAlias = rowList[rowList.length - 1].alias;

					for (let i = 0, len = colOccupy.length - 1; i < len; i++) {
						let sign = colOccupy[i] + '_' + colOccupy[i + 1] + '_' +
							 tempAlias + '_' + currentAlias;
						regionRecord.set(sign, true);
					}
					rowOccupy.push(currentAlias);
					rowRecord.push(currentAlias);
				}
				//移除上方多余行
				let counter = 0,
					flag = false;
				for (let i = 0, len = rowOccupy.length; i < len; i++) {
					let row = this.$store.getters.getRowByAlias(rowOccupy[i]);
					if (row.top > limitTop) {
						counter--;
						break;
					}
					counter++;
				}

				for (let i = 0; i < counter; i++) {
					rowOccupy.shift();
				}
			},
			scrollToTop(){
				let rowOccupy = this.rowOccupy,
					colOccupy = this.colOccupy,
					rowRecord = cache.rowRecord,
					occupyStartRowAlias = rowOccupy[0],
					occupyStartRow = this.$store.getters.getRowByAlias(occupyStartRowAlias),
					currentTop = occupyStartRow.top,
					limitTop = this.$el.scrollTop - config.prestrainHeight,
					limitBottom = this.$el.scrollTop + this.$el.offsetHeight;


				if(limitTop < 0){
					limitTop = 0;
				}

				if (limitTop < currentTop) {
					let regionRecord = cache.regionRecord,
						temp = [rowOccupy[0]],
						i = rowRecord.indexOf(occupyStartRowAlias) - 1;

					if(i === -1){
						return;
					}
					for (; i > -1; i--) {
						let row = this.$store.getters.getRowByAlias(rowRecord[i]);
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
						this.verticalRequest(limitTop, currentTop - 1);
					}
				}

				//移除上方多余行
				let counter = 0;

				for (let i = rowOccupy.length -1; i > -1; i--) {
					let row = this.$store.getters.getRowByAlias(rowOccupy[i]);
					if (row.top + row.height < limitBottom) {
						counter--;
						break;
					}
					counter++;
				}
				for (let i = 0; i < counter; i++) {
					rowOccupy.pop();
				}
			},
			scrollToRight() {
				let colList = this.$store.getters.colList,
					maxRight = cache.localColPosi,
					bufferWidth = config.scrollBufferWidth,
					colRecord = cache.colRecord,
					colOccupy = this.colOccupy,
					regionRecord = cache.regionRecord,
					lastCol = colList[colList.length - 1],
					currentMaxRight = lastCol.left + lastCol.width,
					limitRight = this.$el.scrollLeft + this.$el.offsetWidth + config.prestrainWidth,
					limitLeft = this.$el.scrollLeft,
					occupyEndColAlias = colOccupy[colOccupy.length - 1],
					occupyEndCol = this.$store.getters.getColByAlias(occupyEndColAlias),
					occupyRight = occupyEndCol.left + occupyEndCol.width,
					addColNum = 0;

				/**
				 * 当前视图边界值超过了后台对象的最大值
				 * 需要自动增加列
				 */
				if (limitRight > maxRight) {
					addColNum = Math.ceil((limitRight - maxRight + bufferWidth) / config.colWidth);
					limitRight = maxRight;
				}

				/**
				 * 当前视图边界值超过了已加载对象最大值
				 * 需要请求数据
				 */
				if (currentMaxRight < limitRight) {
					let self = this;
					
					limitRight = limitRight + config.scrollBufferWidth;
					limitRight = limitRight < maxRight ? limitRight : maxRight;
					/**
					 * 横向请求
					 * 起始值为当前所占块右边界
					 * 终止值为视图边界+缓存宽度
					 */
					this.transverseRequest(currentMaxRight + 1, limitRight,
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
							colRecord.push(alias);
						});
					/**
					 * 当前视图边界值超出了，视图所占块的边界值
					 * 需要判断超出边界区域是否已经加载过
					 */
				} else if (occupyRight < limitRight) {
					let rowOccupy = this.rowOccupy,
						temp = [occupyEndColAlias],
						i = colRecord.indexOf(occupyEndColAlias) + 1;

					for (let len = colRecord.length; i < len; i++) {
						let col = this.$store.getters.getColByAlias(colRecord[i]);
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
						this.transverseRequest(occupyRight + 1, limitRight);
					}
				}
				/**
				 * 自动增加列
				 */
				addColNum = addColNum + colList.length < config.maxColNum ?
					addColNum : config.maxColNum - colList.length;

				if (addColNum > 0) {
					let rowOccupy = this.rowOccupy,
						tempAlias = colList[colList.length - 1].alias,
						currentAlias;

					this.$store.dispatch(types.COLS_GENERAT, addColNum);

					currentAlias = colList[colList.length - 1].alias;

					for (let i = 0, len = rowOccupy.length - 1; i < len; i++) {
						let sign = tempAlias + '_' + currentAlias + '_' +
							rowOccupy[i] + '_' + rowOccupy[i + 1];
							regionRecord.set(sign, true);
					}
					colOccupy.push(currentAlias);
					colRecord.push(currentAlias);
				}
				//移除左侧多余列
				let counter = 0,
					flag = false;
				for (let i = 0, len = colOccupy.length; i < len; i++) {
					let col = this.$store.getters.getColByAlias(colOccupy[i]);
					if (col.left > limitLeft) {
						counter--;
						break;
					}
					counter++;
				}

				for (let i = 0; i < counter; i++) {
					colOccupy.shift();
				}

			},
			scrollToLeft(){
				let colOccupy = this.colOccupy,
					rowOccupy = this.rowOccupy,
					occupyStartColAlias = colOccupy[0],
					occupyStartCol = this.$store.getters.getColByAlias(occupyStartColAlias),
					currentLeft = occupyStartCol.left,
					limitLeft = this.$el.scrollLeft - config.prestrainWidth,
					limitRight = this.$el.scrollLeft + this.$el.offsetWidth,
					colRecord = cache.colRecord;

				if(limitLeft < 0){
					limitLeft = 0;
				}

				if (limitLeft < currentLeft) {
					let regionRecord = cache.regionRecord,
						temp = [colOccupy[0]],
						i = colRecord.indexOf(occupyStartColAlias) - 1;

					if(i === -1){
						return;
					}
					for (; i > -1; i--) {
						let col = this.$store.getters.getColByAlias(colRecord[i]);
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
						this.transverseRequest(limitLeft, currentLeft - 1);
					}
				}

				//移除右侧多余列
				let counter = 0;

				for (let i = colOccupy.length -1; i > -1; i--) {
					let col = this.$store.getters.getColByAlias(colOccupy[i]);
					if (col.left + col.width < limitRight) {
						counter--;
						break;
					}
					counter++;
				}
				for (let i = 0; i < counter; i++) {
					colOccupy.pop();
				}
			},
			transverseRequest(left, right, fn) {
				let startRowAlias = this.rowOccupy[0],
					endRowAlias = this.rowOccupy[this.rowOccupy.length - 1],
					startRow = this.$store.getters.getRowByAlias(startRowAlias),
					endRow = this.$store.getters.getRowByAlias(endRowAlias),
					top = startRow.top,
					bottom = endRow.top + endRow.height;

					send({
						url: 'sheet/area',
						async: false,
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
									this.$store.dispatch(types.COLS_ADDCOLS, cols);	
									fn(endColAlias);
								}
								let cells = sheetData.cells;	
								this.$store.dispatch(types.CELLS_RESTORECELL, cells);

							}
						}
					});
			},
			verticalRequest(top, bottom, fn){
				let startColAlias = this.colOccupy[0],
					endColAlias = this.colOccupy[this.colOccupy.length - 1],
					startCol = this.$store.getters.getColByAlias(startColAlias),
					endCol = this.$store.getters.getColByAlias(endColAlias),
					left = startCol.left,
					right = endCol.left + endCol.width;

					send({
						url: 'sheet/area',
						async: false,
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
									this.$store.dispatch(types.ROWS_ADDROWS, rows);	
									fn(endRowAlias);
								}
								let cells = sheetData.cells;
								this.$store.dispatch(types.CELLS_RESTORECELL, cells);
							}
						}
					});
			}
		}
	};
</script>
<style type="text/css">
.scroll-box {
    overflow: auto;
}
</style>