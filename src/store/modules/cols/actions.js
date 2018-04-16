import Vue from 'vue';
import * as actionTypes from '../../action-types';
import * as mutationTypes from '../../mutation-types';
import {getColDisplayName} from '../../../util/displayname';
import generator from '../../../tools/generator';
import extend from '../../../util/extend';
import config from '../../../config';
import cache from '../../../tools/cache';
import template from './template';
import {SELECT} from '../../../tools/basic';
import generator from '../../../tools/generator';

export default {
    [actionTypes.COLS_ADDCOLS]({state, rootState, commit}, cols) {
        let temp = [];
        if (!Array.isArray(cols)) {
            cols = [cols];
        }
        for (let i = 0, len = cols.length; i < len; i++) {
            temp.push(extend({}, template, cols[i]));
        }
        commit(mutationTypes.ADD_COL, {
            cols: temp,
            currentSheet: rootState.currentSheet
        });
    },
    [actionTypes.COLS_RESTORECOLS]({
        state,
        rootState,
        commit
    }, cols) {
        let map = state[rootState.currentSheet].map,
            temp = [];

        if (!Array.isArray(cols)) {
            cols = [cols];
        }

        for (let i = 0, len = cols.length; i < len; i++) {
            if (!map.get(cols[i].alias)) {
                temp.push(extend({}, template, cols[i]));
            }
        }
        commit(mutationTypes.INSERT_COL, {
            cols: temp,
            currentSheet: rootState.currentSheet
        });
    },
    [actionTypes.COLS_DELETECOLS]({
        state,
        rootState,
        commit,
        getters,
        dispatch
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
            index = getters.getColIndexByAlias(select.wholePosi.startColAlias);
        }

        let cols = getters.colList,
            col = cols[index],
            deleteCells = [],
            updateCellInfo = [],
            colWidth = col.width,
            colAlias = col.alias;

       let cellList = getters.getCellsByVertical({
            startColIndex: index,
            startRowIndex: 0,
            endColIndex: 'MAX',
            endRowIndex: 'MAX',
        });

        cellList.forEach(function(cell) {
            let occupy = cell.occupy.col,
                temp;

            if ((temp = occupy.indexOf(colAlias)) !== -1) {
                if(occupy.length ===1 ){
                    deleteCells.push(cell);
                }else{
                    updateCellInfo.push({
                        cell,
                        propName: 'physicsBox.width',
                        value: cell.physicsBox.width - colWidth - 1
                    });
                }
            } else {
                updateCellInfo.push({
                    cell,
                    propName: 'physicsBox.left',
                    value: cell.physicsBox.left - colWidth - 1
                });

                let newOccupy = occupy.slice(0).splice(temp, 1);

                updateCellInfo.push({
                    cell,
                    propName: 'occupy.col',
                    value: newOccupy
                });
            }
        });

        commit(mutationTypes.DELETE_CELL_POINTINFO, {
            currentSheet,
            cells: deleteCells
        });
        commit(mutationTypes.BATCH_UPDATE_CELL, {
            currentSheet,
            info: updateCellInfo
        });


        let updateSelectInfo = [],
            colLeft = col.left;

        selects.forEach(function(select) {
            let wholePosi = select.wholePosi,
                startPosi,
                endPosi;
            startPosi = getters.getColByAlias(wholePosi.startColAlias).left;
            endPosi = getters.getColByAlias(wholePosi.endColAlias).left;

            if (startPosi >= colLeft) {
                if (startPosi === endPosi) {
                    updateSelectInfo.push({
                        select,
                        propName: 'physicsBox.width',
                        value: cols[index + 1].width
                    });
                    updateSelectInfo.push({
                        select,
                        propName: 'wholePosi.startColAlias',
                        value: cols[index + 1].alias
                    });
                    updateSelectInfo.push({
                        select,
                        propName: 'wholePosi.endColAlias',
                        value: cols[index + 1].alias
                    });
                    commit(mutationTypes.ACTIVE_COL, {
                        currentSheet,
                        startIndex: index + 1
                    });
                }else{
                    updateSelectInfo.push({
                        select,
                        propName: 'physicsBox.width',
                        value: select.physicsBox.width - colWidth -1
                    });
                    updateSelectInfo.push({
                        select,
                        propName: 'wholePosi.startColAlias',
                        value: cols[index + 1].alias
                    });
                }

            } else if (endPosi > colLeft) {
                updateSelectInfo.push({
                    select,
                    propName: 'physicsBox.left',
                    value: select.physicsBox.left + colWidth + 1
                });
            }
        });

        commit(mutationTypes.BATCH_UPDATE_SELECT, {
            currentSheet,
            info: updateSelectInfo
        });

        let updateColInfo = [];
        for (let i = index, len = cols.length; i < len; i++) {
            let col = cols[i];
            updateColInfo.push({
                col,
                propName: 'left',
                value: col.left - colWidth - 1
            }, {
                col,
                propName: 'sort',
                value: col.sort - 1
            },{
                col,
                propName: 'displayName',
                value: getColDisplayName(col.sort - 1)
            });
        }

        // let colRecord = cache.colRecord;
        // if (colRecord.indexOf(colAlias) !== -1) {
        //     dispatch(actionTypes.DELETE_COL_RECORD, colAlias);
        // }
        if(cache.localColPosi > 0){
            cache.localColPosi -= colWidth;
        }
        commit(mutationTypes.BATCH_UPDATE_COL, {
            currentSheet,
            info: updateColInfo
        });
        Vue.nextTick(function() {
            commit(mutationTypes.DELETE_COL, {
                currentSheet,
                index
            });
        });
    },
    [actionTypes.COLS_INSERTCOLS]({
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
            index = getters.getColIndexByAlias(select.wholePosi.startColAlias);
        }

        let col = extend(template),
            cols = getters.colList,
            cellList,
            updateCellInfo = [],
            colWidth = col.width,
            colAlias = generator.colAliasGenerator(),
            colLeft = cols[index].left;

        col.sort = index;
        col.alias = colAlias;
        col.displayName =  getColDisplayName(index);
        col.left = colLeft;

        cellList = getters.getCellsByVertical({
            startColIndex: index,
            startRowIndex: 0,
            endColIndex: 'MAX',
            endRowIndex: 'MAX',
        });

        cellList.forEach(function(cell) {
            let occupy = cell.occupy.col,
                temp;

            if ((temp = occupy.indexOf(colAlias)) === 0 || temp === -1) {
                updateCellInfo.push({
                    cell,
                    propName: 'physicsBox.left',
                    value: cell.physicsBox.left + colWidth + 1
                });
            } else {
                updateCellInfo.push({
                    cell,
                    propName: 'physicsBox.width',
                    value: cell.physicsBox.width + colWidth + 1
                });

                let newOccupy = occupy.slice(0).splice(temp, 0, colAlias);
                updateCellInfo.push({
                    cell,
                    propName: 'occupy.col',
                    value: newOccupy
                });
            }
        });

        commit(mutationTypes.BATCH_UPDATE_CELL, {
            currentSheet,
            info: updateCellInfo
        });


        let updateSelectInfo = [];

        selects.forEach(function(select) {
            let wholePosi = select.wholePosi,
                startPosi,
                endPosi;
            startPosi = getters.getColByAlias(wholePosi.startColAlias).left;
            endPosi = getters.getColByAlias(wholePosi.endColAlias).left;

            if (startPosi >= colLeft) {
                updateSelectInfo.push({
                    select,
                    propName: 'physicsBox.left',
                    value: select.physicsBox.left + colWidth + 1
                });
            } else if (endPosi > colLeft) {
                updateSelectInfo.push({
                    select,
                    propName: 'physicsBox.left',
                    value: select.physicsBox.left + colWidth + 1
                });
            }
        });

        commit(mutationTypes.BATCH_UPDATE_SELECT, {
            currentSheet,
            info: updateSelectInfo
        });

        let updateColInfo = [];
        for (let i = index, len = cols.length; i < len; i++) {
            let col = cols[i];
            updateColInfo.push({
                col,
                propName: 'left',
                value: col.left + colWidth + 1
            }, {
                col,
                propName: 'sort',
                value: col.sort + 1
            },{
                col,
                propName: 'displayName',
                value: getColDisplayName(col.sort + 1)
            });
        }
        commit(mutationTypes.BATCH_UPDATE_COL, {
            currentSheet,
            info: updateColInfo
        });        
        commit(mutationTypes.INSERT_COL, {
            currentSheet,
            cols: [col]
        });
    },
    [actionTypes.COLS_GENERAT]({state, rootState, commit}, num){
        let currentSheet = rootState.currentSheet,
            colList = state[currentSheet],
            lastCol = colList[colList.length - 1],
            currentLeft = lastCol.left + lastCol.width + 1,
            currentSort = lastCol.sort + 1,
            initWidth = config.colWidth,
            temp = [];
            
        for (let i = 0; i < num; i++) {
            temp.push(extend({}, template, {
                alias: generator.colAliasGenerator(),
                left: currentLeft + (initWidth + 1) * i,
                sort: currentSort + i,
                displayName: getColDisplayName(currentSort + i)
            }));
        }

        cache.localColPosi = temp[temp.length -1].left + temp[temp.length -1].width;
        commit(mutationTypes.ADD_COL, {
            cols: temp,
            currentSheet
        });
    },
    [actionTypes.COLS_UPDATEACTIVECOLS]({getters, rootState, commit},
        {oldStartAlias, newStartAlias, oldEndAlias, newEndAlias}){
        let currentSheet = rootState.currentSheet,
            startIndex,
            endIndex;

        startIndex = getters.getColIndexByAlias(oldStartAlias);
        endIndex = getters.getColIndexByAlias(oldEndAlias);
        endIndex = endIndex === 'MAX' ? getters.colList.length - 1 : endIndex;
       
        commit(mutationTypes.CANCEL_ACTIVE_COL,{
            currentSheet,
            startIndex,
            endIndex
        });

        startIndex = getters.getColIndexByAlias(newStartAlias);
        endIndex = getters.getColIndexByAlias(newEndAlias);
        endIndex = endIndex === 'MAX' ? getters.colList.length - 1 : endIndex;
        
        commit(mutationTypes.ACTIVE_COL, {
            currentSheet,
            startIndex,
            endIndex
        });
    }
};