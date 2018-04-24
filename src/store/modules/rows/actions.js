import Vue from 'vue';
import * as actionTypes from '../../action-types';
import * as mutationTypes from '../../mutation-types';
import config from '../../../config';
import cache from '../../../tools/cache';
import {
    getRowDisplayName
} from '../../../util/displayname';
import extend from '../../../util/extend';
import generator from '../../../tools/generator';
import template from './template';
import {SELECT} from '../../../tools/basic';

export default {
    [actionTypes.ROWS_ADDROWS]({
        state,
        rootState,
        commit
    }, rows) {
        let temp = [];
        if (!Array.isArray(rows)) {
            rows = [rows];
        }
        for (let i = 0, len = rows.length; i < len; i++) {
            temp.push(extend({}, template, rows[i]));
        }
        commit(mutationTypes.ADD_ROW, {
            rows: temp,
            currentSheet: rootState.currentSheet
        });
    },
    [actionTypes.ROWS_RESTOREROWS]({
        state,
        rootState,
        commit
    }, rows) {
        let map = state[rootState.currentSheet].map,
            temp = [];

        if (!Array.isArray(rows)) {
            rows = [rows];
        }

        for (let i = 0, len = rows.length; i < len; i++) {
            if (!map.get(rows[i].alias)) {
                temp.push(extend({}, template, rows[i]));
            }
        }
        commit(mutationTypes.INSERT_ROW, {
            rows: temp,
            currentSheet: rootState.currentSheet
        });
    },
    [actionTypes.ROWS_INSERTROWS]({
        state,
        rootState,
        commit,
        getters
    }, index) {
        let selects = getters.selectList,
            currentSheet = rootState.currentSheet;

        if (index === undefined) {
            let select;
            for (let i = 0, len = selects.length; i < len; i++) {
                if (selects[i].type === SELECT) {
                    select = selects[i];
                    break;
                }
            }
            index = getters.getRowIndexByAlias(select.wholePosi.startRowAlias);
        }

        let row = extend(template),
            rows = getters.rowList,
            getPointInfo = getters.getPointInfo,
            cellList,
            updateCellInfo = [],
            updatePointInfo = [],
            rowHeight = row.height,
            originalRowAlias = rows[index].alias,
            rowAlias = generator.rowAliasGenerator(),
            rowTop = rows[index].top;


        row.sort = index;
        row.alias = rowAlias;
        row.displayName =  getRowDisplayName(index);
        row.top = rowTop;

        cellList = getters.getCellsByVertical({
            startColIndex: 0,
            startRowIndex: index,
            endColIndex: 'MAX',
            endRowIndex: 'MAX',
        });

        cellList.forEach(function(cell) {
            let occupy = cell.occupy.row;
            if (cell.physicsBox.top >= rowTop) {
                updateCellInfo.push({
                    cell,
                    props: {
                        physicsBox: {
                            top: cell.physicsBox.top + rowHeight + 1
                        }
                    }
                });
            } else {
                let index = occupy.indexOf(originalRowAlias),
                    newOccupy = occupy.slice(0),
                    occupyCol = cell.occupy.col,
                    cellIndex;

                    newOccupy.splice(index, 0, rowAlias);
                    cellIndex = getPointInfo(occupyCol[0], occupy[0], 'cellIndex');
    
                updateCellInfo.push({
                    cell,
                    props: {
                        physicsBox: {
                            height: cell.physicsBox.height + rowHeight + 1
                        },
                        occupy: {
                            row: newOccupy
                        }
                    }
                });

                occupyCol.forEach(function(colAlias) {
                    commit(mutationTypes.UPDATE_POINTINFO, {
                        currentSheet,
                        info: {
                            colAlias,
                            rowAlias,
                            type: 'cellIndex',
                            value: cellIndex
                        }
                    });
                });
            }
        });

        commit(mutationTypes.UPDATE_CELL, updateCellInfo);


        let updateSelectInfo = [];

        selects.forEach(function(select) {
            let wholePosi = select.wholePosi,
                startPosi,
                endPosi;
            startPosi = getters.getRowByAlias(wholePosi.startRowAlias).top;
            endPosi = getters.getRowByAlias(wholePosi.endRowAlias).top;

            if (startPosi >= rowTop) {
                updateSelectInfo.push({
                    select,
                    props: {
                        physicsBox: {
                            top: select.physicsBox.top + rowHeight + 1
                        }
                    }
                });
            } else if (endPosi > rowTop) {
                updateSelectInfo.push({
                    select,
                    props: {
                        physicsBox: {
                            height: select.physicsBox.height + rowHeight + 1
                        }
                    }
                });
            }
        });

        commit(mutationTypes.UPDATE_SELECT, updateSelectInfo);

        let updateRowInfo = [];
        for (let i = index, len = rows.length; i < len; i++) {
            let row = rows[i];
            updateRowInfo.push({
                row,
                props: {
                    top: row.top + rowHeight + 1,
                    sort: row.sort + 1,
                    displayName: getRowDisplayName(row.sort + 1)
                }
            });
        }
        commit(mutationTypes.UPDATE_ROW, updateRowInfo);        
        commit(mutationTypes.INSERT_ROW, {
            currentSheet,
            rows: [row]
        });
    },
    [actionTypes.ROWS_DELETEROWS]({
        state,
        rootState,
        commit,
        getters
    }, index) {
        let selects = getters.selectList,
            currentSheet = rootState.currentSheet;

        if (index === undefined) {
            let select;
            for (let i = 0, len = selects.length; i < len; i++) {
                if (selects[i].type === SELECT) {
                    select = selects[i];
                    break;
                }
            }
            index = getters.getRowIndexByAlias(select.wholePosi.startRowAlias);
        }

        let rows = getters.rowList,
            row = rows[index],
            deleteCells = [],
            updateCellInfo = [],
            rowHeight = row.height,
            rowAlias = row.alias;

       let cellList = getters.getCellsByVertical({
            startColIndex: 0,
            startRowIndex: index,
            endColIndex: 'MAX',
            endRowIndex: 'MAX',
        });

        cellList.forEach(function(cell) {
            let occupy = cell.occupy.row,
                temp;

            if ((temp = occupy.indexOf(rowAlias)) !== -1) {
                if(occupy.length ===1 ){
                    deleteCells.push(cell);
                }else{
                    deleteCells.push({
                        col: cell.occupy.col,
                        row: [rowAlias]
                    });
                    updateCellInfo.push({
                        cell,
                        props: {
                            physicsBox: {
                                height: cell.physicsBox.height - rowHeight - 1
                            }
                        }
                    });
                }
            } else {
                let newOccupy = occupy.slice(0).splice(temp, 1);
                updateCellInfo.push({
                    cell,
                    props: {
                        physicsBox: {
                            top: cell.physicsBox.top - rowHeight - 1
                        },
                        occupy: {
                            row: newOccupy
                        }
                    }
                });
            }
        });

        commit(mutationTypes.DELETE_CELL_POINTINFO, {
            currentSheet,
            cells: deleteCells
        });
        commit(mutationTypes.UPDATE_CELL, updateCellInfo);


        let updateSelectInfo = [],
            rowTop = row.top;

        selects.forEach(function(select) {
            let wholePosi = select.wholePosi,
                startPosi,
                endPosi;

            startPosi = getters.getRowByAlias(wholePosi.startRowAlias).top;
            endPosi = getters.getRowByAlias(wholePosi.endRowAlias).top;

            if (startPosi >= rowTop) {
                if (startPosi === endPosi) {
                    updateSelectInfo.push({
                        select,
                        props: {
                            physicsBox: {
                                height: rows[index + 1].height
                            },
                            wholePosi: {
                                startRowAlias: rows[index + 1].alias,
                                endRowAlias: rows[index + 1].alias
                            }
                        }
                    });
                    commit(mutationTypes.ACTIVE_ROW, {
                        currentSheet,
                        startIndex: index + 1
                    });
                }else{
                    updateSelectInfo.push({
                        select,
                        props: {
                            physicsBox: {
                                height: select.physicsBox.height - rowHeight - 1
                            },
                            wholePosi: {
                                startRowAlias: rows[index + 1].alias
                            }
                        }
                    });
                }

            } else if (endPosi > rowTop) {
                updateSelectInfo.push({
                    select,
                    props: {
                        physicsBox: {
                            top: select.physicsBox.top + rowHeight + 1
                        }
                    }
                });
            }
        });

        commit(mutationTypes.UPDATE_SELECT, updateSelectInfo);

        let updateRowInfo = [];
        for (let i = index, len = rows.length; i < len; i++) {
            let row = rows[i];
            updateRowInfo.push({
                row,
                props: {
                    top:  row.top - rowHeight - 1,
                    sort: row.sort - 1,
                    displayName: getRowDisplayName(row.sort - 1)
                }
            });
        }
 
        if(cache.localRowPosi > 0){
            cache.localRowPosi -= rowHeight;
        }
        commit(mutationTypes.UPDATE_ROW, updateRowInfo);
        Vue.nextTick(function() {
            let rowRecord = cache.rowRecord,
                temp;
            if ((temp = rowRecord.indexOf(rowAlias)) !== -1) {
                _updateLoadInfo(temp, getters);
                dispatch(actionTypes.OCCUPY_DELETEROW, rowAlias);
                rowRecord.splice(temp, 1);
            }
            commit(mutationTypes.DELETE_ROW, {
                currentSheet,
                index
            });
        });
        function _updateLoadInfo(index, getters) {
            let regionLoadRecord = cache.regionRecord,
                colLoadRecord = cache.colRecord,
                rowLoadRecord = cache.rowRecord,
                rows = getters.rowList,
                alias = rowLoadRecord[index],
                rowIndex = getters.getRowIndexByAlias(alias),
                previousAlias,
                nextAlias,
                replaceAlias;

            if (index === 0) {
                replaceAlias = rows[colIndex + 1].alias;
                nextAlias = rowLoadRecord[1];
            } else if (index === rowLoadRecord.length - 1) {
                replaceAlias = rows[colIndex - 1].alias;
                previousAlias = rowLoadRecord[index - 1];
            } else {
                replaceAlias = rows[colIndex - 1].alias;
                previousAlias = rowLoadRecord[index - 1];
                nextAlias = rowLoadRecord[index + 1];
            }
            if (nextAlias !== undefined && replaceAlias !== nextAlias) {
                for (let i = 0, len = colLoadRecord.length - 1; i < len; i++) {
                    let sign = colLoadRecord[i] + '_' + colLoadRecord[i + 1] + '_' +
                        previousAlias + '_' + alias;
                    if (regionLoadRecord.get(sign)) {
                        regionLoadRecord.delete(sign);

                        sign = colLoadRecord[i] + '_' + colLoadRecord[i + 1] + '_' +
                            previousAlias + '_' + replaceAlias;
                        regionLoadRecord.set(sign, true);
                    }
                }
            }
            if (previousAlias !== undefined) {
                for (let i = 0, len = rowLoadRecord.length - 1; i < len; i++) {
                    let sign = previousAlias + '_' + alias + '_' +
                        rowLoadRecord[i] + '_' + rowLoadRecord[i + 1];
                    if (regionLoadRecord.get(sign)) {
                        regionLoadRecord.delete(sign);

                        sign = previousAlias + '_' + replaceAlias + '_' +
                            rowLoadRecord[i] + '_' + rowLoadRecord[i + 1];
                        regionLoadRecord.set(sign, true);
                    }
                }
            }
        }
    },
    [actionTypes.ROWS_GENERAT]({
        state,
        rootState,
        commit
    }, num) {
        let currentSheet = rootState.currentSheet,
            rowList = state[currentSheet].list,
            lastRow = rowList[rowList.length - 1],
            currentTop = lastRow.top + lastRow.height + 1,
            currentSort = lastRow.sort + 1,
            initHeight = config.rowHeight,
            temp = [];
        for (let i = 0; i < num; i++) {
            temp.push(extend({}, template, {
                alias: generator.rowAliasGenerator(),
                top: currentTop + (initHeight + 1) * i,
                sort: currentSort + i,
                displayName: getRowDisplayName(currentSort + i)
            }));
        }
        if (cache.localRowPosi > 0) {
            cache.localRowPosi = temp[temp.length - 1].top + temp[temp.length - 1].height;
        }
        commit(mutationTypes.ADD_ROW, {
            rows: temp,
            currentSheet
        });
    },
    [actionTypes.ROWS_UPDATEACTIVEROWS]({
        getters,
        rootState,
        commit
    }, {
        oldStartAlias,
        newStartAlias,
        oldEndAlias,
        newEndAlias
    }) {
        let currentSheet = rootState.currentSheet,
            startIndex,
            endIndex;

        startIndex = getters.getRowIndexByAlias(oldStartAlias);
        endIndex = getters.getRowIndexByAlias(oldEndAlias);
        endIndex = endIndex === 'MAX' ? getters.rowList.length - 1 : endIndex;

        commit(mutationTypes.CANCEL_ACTIVE_ROW, {
            currentSheet,
            startIndex,
            endIndex
        });

        startIndex = getters.getRowIndexByAlias(newStartAlias);
        endIndex = getters.getRowIndexByAlias(newEndAlias);
        endIndex = endIndex === 'MAX' ? getters.rowList.length - 1 : endIndex;
        
        commit(mutationTypes.ACTIVE_ROW, {
            currentSheet,
            startIndex,
            endIndex
        });
    },
    [actionTypes.ROWS_OPERROWS]({getters, state, rootState, commit}, 
        {startIndex, endIndex, props}){

        if(startIndex === undefined){
            let selects = getters.selectList,
                select;
            for (let i = 0, len = selects.length; i < len; i++) {
                if (selects[i].type === SELECT) {
                    select = selects[i];
                    break;
                }
            }
            startIndex =  getters.getRowIndexByAlias(select.wholePosi.startRowAlias);
            endIndex =  getters.getRowIndexByAlias(select.wholePosi.endRowAlias);
        }
        endIndex = endIndex === undefined ? startIndex : endIndex;
        
        let updateRowInfo = [],
            rows = getters.rowList;

        for (let i = startIndex; i < endIndex + 1; i++) {
            updateRowInfo.push({
                row: rows[i],
                props: {
                    oprProp: props
                }
            });
        }
        commit(mutationTypes.UPDATE_ROW, updateRowInfo);
    }
};