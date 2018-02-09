import * as types from '../../action-types';
import selectDefault from '../../defaults/select';
import extend from '../../../util/extend';
 
export default {
	// [types.RESTORE_SELECT]({state, commit, rootState, rootGetters}) {
	// 	let select = extend(selectDefault),
	// 		region;

	// 	region = rootGetters.cells.getFullOprRegion({
	// 		startColIndex: 0,
	// 		startRowIndex: 0
	// 	});

	// 	startColIndex = region.startColIndex;
	// 	startRowIndex = region.startRowIndex;
	// 	endColIndex = region.endColIndex;
	// 	endRowIndex = region.endRowIndex;

	// 	width = colModelList[endColIndex].get('width') + colModelList[endColIndex].get('left') - colModelList[startColIndex].get('left');
	// 	height = rowModelList[endRowIndex].get('height') + rowModelList[endRowIndex].get('top') - rowModelList[startRowIndex].get('top');

	// 	if (this.model.get('selectType') === 'selected') {
	// 		this.changeHeadLineModel(startColIndex, startRowIndex, endColIndex, endRowIndex);
	// 		siderLineRows.models[0].set({
	// 			top: rowModelList[startRowIndex].get('top'),
	// 			height: height
	// 		});
	// 		siderLineCols.models[0].set({
	// 			left: colModelList[startColIndex].get('left'),
	// 			width: width
	// 		});
	// 	}
	// 	this.model.set('physicsBox', {
	// 		top: rowModelList[startRowIndex].get('top'),
	// 		left: colModelList[startColIndex].get('left'),
	// 		width: width,
	// 		height: height
	// 	});
	// 	temp = {
	// 		startX: colModelList[startColIndex].get('alias'),
	// 		startY: rowModelList[startRowIndex].get('alias'),
	// 		endX: colModelList[endColIndex].get('alias'),
	// 		endY: rowModelList[endRowIndex].get('alias')
	// 	}

	// 	//判断是否为整行或整列操作
	// 	if (modelJSON.tempPosi.mouseColIndex === 'MAX' || modelJSON.tempPosi.initColIndex === 'MAX') {
	// 		temp.endX = 'MAX';
	// 		colDisplayNames.push('1');
	// 		colDisplayNames.push('MAX');
	// 		rowDisplayNames.push(rowModelList[startRowIndex].get('displayName'));
	// 		rowDisplayNames.push(rowModelList[endRowIndex].get('displayName'));
	// 	} else if (modelJSON.tempPosi.mouseRowIndex === 'MAX' || modelJSON.tempPosi.initRowIndex === 'MAX') {
	// 		temp.endY = 'MAX';
	// 		rowDisplayNames.push('1');
	// 		rowDisplayNames.push('MAX');
	// 		colDisplayNames.push(colModelList[startColIndex].get('displayName'));
	// 		colDisplayNames.push(colModelList[endColIndex].get('displayName'));
	// 	} else {
	// 		for (i = startColIndex; i < endColIndex + 1; i++) {
	// 			colDisplayNames.push(colModelList[i].get('displayName'));
	// 		}
	// 		for (i = startRowIndex; i < endRowIndex + 1; i++) {
	// 			rowDisplayNames.push(rowModelList[i].get('displayName'));
	// 		}
	// 	}
	// }
}