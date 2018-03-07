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
					if (vertical > 0) {
						// this.addBottom(vertical);
					} else {
						// this.addTop();
					}
					this.$emit('changeScrollTop', vertical);
				} else {
					if (transverse > 0) {
					// 	this.deleteLeft();
						this.addRight(transverse);
					} else {
					// 	this.deleteRight();
						// this.addLeft();
					}
					this.$emit('changeScrollLeft', transverse);
				}
			},
			addRight(transverse) {
				let colList = this.$store.getters.colList,
					lastCol = colList[colList.length - 1],
					maxRight = lastCol.left + lastCol.width,
					limitRight = this.$el.scrollLeft + this.$el.offsetWidth + config.prestrainWidth,
					occupyEndColAlias = this.colOccupy[this.colOccupy.length -1],
					occupyEndCol = this.$store.getters.getColByAlias(occupyEndColAlias),
					occupyRight = occupyEndCol.left + occupyEndCol.width;
				

				if(maxRight < limitRight){
					this.transverseRequest(maxRight+ 1, limitRight + config.scrollBufferWidth, true);

				}else if(occupyRight < limitRight){
					let colRecord = cache.colRecord,
						rowRecord = cache.rowRecord,
						regionRecord = cache.regionRecord,
						temp = [occupyEndColAlias],
						i = colRecord.indexOf(occupyEndColAlias) + 1;

					for (let len = colRecord.length; i < len; i++) {
						let col = this.$store.getters.getColByAlias(colRecord[i]);
						temp.push(col.alias);
						if(col.left + col.width > limitRight){
							limitRight = col.left + col.width;
							break;
						}
					}
					let flag = false;
					for (let i = 0, len1 = temp.length - 1; i < len1; i++) {
						for (let j = 0, len2 = rowRecord.length - 1; j < len2; j++) {
							let sign = temp[i] + '_' + temp[i + 1] + '_' +
								rowRecord[j] + '_' + rowRecord[j + 1];
							if (!regionRecord.get(sign)) {
								regionRecord.set(sign, true);
								flag = true;
							}
						}
					}
					if (flag) {
						transverseRequest(occupyRight + 1, limitRight, false);
					}
				}
			},
			transverseRequest(left, right, addCol) {
				let startRowAlias = this.rowOccupy[0],
					endRowAlias = this.rowOccupy[this.rowOccupy.length - 1],
					startRow = this.$store.getters.getRowByAlias(startRowAlias),
					endRow = this.$store.getters.getRowByAlias(endRowAlias),
					top = startRow.top,
					bottom = endRow.top + endRow.height;

					send({
						url: 'load',
						data: {
							left,
							top,
							right,
							bottom
						},
						success: (data) => {
							data = data.returndata;

							if (data.spreadSheet && data.spreadSheet[0] &&
								(sheetData = data.spreadSheet[0].sheet)) {
								if(addCol){
									let endColAlias = cols[cols.length - 1].alias;
									cols = sheetData.glX;
									this.$store.dispath(types.ROWS_ADDCOLS, cols);	
									cache.colRecord.push(endColAlias);
								}
								cells = sheetData.cells;
								this.$store.dispath(types.CELLS_RESTORECELL, cells);

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
