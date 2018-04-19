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
                        props: {
                            physicsBox: {
                                width: cell.physicsBox.width - colWidth - 1
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
                            left: cell.physicsBox.left - colWidth - 1
                        },
                        occupy: {
                            col: newOccupy
                        }
                    }
                });
            }
        });

        commit(mutationTypes.DELETE_CELL_POINTINFO, {
            currentSheet,
            cells: deleteCells
        });
        commit(mutationTypes.UPDATE_CELL, {
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
                        props: {
                            physicsBox: {
                                width: cols[index + 1].width
                            },
                            wholePosi: {
                                startColAlias: cols[index + 1].alias,
                                endColAlias: cols[index + 1].alias
                            }
                        }   
                    });
                    commit(mutationTypes.ACTIVE_COL, {
                        currentSheet,
                        startIndex: index + 1
                    });
                }else{
                    updateSelectInfo.push({
                        select,
                        props: {
                            physicsBox: {
                                width: select.physicsBox.width - colWidth -1
                            },
                            wholePosi: {
                                startColAlias: cols[index + 1].alias
                            }
                        }
                    });
                }

            } else if (endPosi > colLeft) {
                updateSelectInfo.push({
                    select,
                    props: {
                        physicsBox: {
                            left: select.physicsBox.left + colWidth + 1
                        }
                    }
                });
            }
        });

        commit(mutationTypes.UPDATE_SELECT, updateSelectInfo);

        let updateColInfo = [];
        for (let i = index, len = cols.length; i < len; i++) {
            let col = cols[i];
            updateColInfo.push({
                col,
                props: {
                    left: col.left - colWidth - 1,
                    sort: col.sort - 1,
                    displayName: getColDisplayName(col.sort - 1)
                }
            });
        }

        if(cache.localColPosi > 0){
            cache.localColPosi -= colWidth;
        }
        commit(mutationTypes.UPDATE_COL, updateColInfo);
        let self = this;
        Vue.nextTick(function() {
            let colRecord = cache.colRecord,
                temp;
            if ((temp = colRecord.indexOf(colAlias)) !== -1) {
                _updateLoadInfo(temp, getters);
                dispatch(actionTypes.OCCUPY_DELETECOL, colAlias);
                colRecord.splice(temp, 1);
            }
            commit(mutationTypes.DELETE_COL, {
                currentSheet,
                index
            });
        });

        function _updateLoadInfo(index, getters) {
            let regionLoadRecord = cache.regionRecord,
                colLoadRecord = cache.colRecord,
                rowLoadRecord = cache.rowRecord,
                cols = getters.colList,
                alias = colLoadRecord[index],
                colIndex = getters.getColIndexByAlias(alias),
                previousAlias,
                nextAlias,
                replaceAlias;

            if (index === 0) {
                replaceAlias = cols[colIndex + 1].alias;
                nextAlias = colLoadRecord[1];
            } else if (index === colLoadRecord.length - 1) {
                replaceAlias = cols[colIndex - 1].alias;
                previousAlias = colLoadRecord[index - 1];
            } else {
                replaceAlias = cols[colIndex - 1].alias;
                previousAlias = colLoadRecord[index - 1];
                nextAlias = colLoadRecord[index + 1];
            }
            if (nextAlias !== undefined && replaceAlias !== nextAlias) {
                for (let i = 0, len = rowLoadRecord.length - 1; i < len; i++) {
                    let sign = alias + '_' + nextAlias + '_' +
                        rowLoadRecord[i] + '_' + rowLoadRecord[i + 1];
                    if (regionLoadRecord.get(sign)) {
                        regionLoadRecord.delete(sign);

                        sign = replaceAlias + '_' + nextAlias + '_' +
                            rowLoadRecord[i] + '_' + rowLoadRecord[i + 1];
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
                    props: {
                        physicsBox: {
                            left: cell.physicsBox.left + colWidth + 1
                        }
                    }
                });
            } else {
                let newOccupy = occupy.slice(0).splice(temp, 0, colAlias);
                updateCellInfo.push({
                    cell,
                    props: {
                        physicsBox: {
                            width: cell.physicsBox.width + colWidth + 1
                        },
                        occupy: {
                            col: newOccupy
                        }
                    }
                });
            }
        });

        commit(mutationTypes.UPDATE_CELL, {
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
                    props: {
                        physicsBox: {
                            left: select.physicsBox.left + colWidth + 1
                        }
                    }
                });
            } else if (endPosi > colLeft) {
                updateSelectInfo.push({
                    select,
                    props: {
                        physicsBox: {
                            left: select.physicsBox.left + colWidth + 1
                        }
                    }
                });
            }
        });

        commit(mutationTypes.UPDATE_SELECT, updateSelectInfo);

        let updateColInfo = [];
        for (let i = index, len = cols.length; i < len; i++) {
            let col = cols[i];
            updateColInfo.push({
                col,
                props: {
                    left: col.left + colWidth + 1,
                    sort: col.sort + 1,
                    displayName: col.sort + 1
                }
            });
        }
        commit(mutationTypes.UPDATE_COL, updateColInfo);        
        commit(mutationTypes.INSERT_COL, {
            currentSheet,
            cols: [col]
        });
    },
    [actionTypes.COLS_GENERAT]({state, rootState, commit}, num){
        let currentSheet = rootState.currentSheet,
            colList = state[currentSheet].list,
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

        if(cache.localColPosi > 0){
            cache.localColPosi = temp[temp.length -1].left + temp[temp.length -1].width;
        }
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
    },
    [actionTypes.COLS_OPERCOLS]({getters, state, rootState, commit}, 
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
            startIndex =  getters.getColIndexByAlias(select.wholePosi.startColAlias);
            endIndex =  getters.getColIndexByAlias(select.wholePosi.endColAlias);
        }
        endIndex = endIndex === undefined ? startIndex : endIndex;
        
        let updateColInfo = [],
            cols = getters.colList;

        for (let i = startIndex; i < endIndex + 1; i++) {
            updateColInfo.push({
                col: cols[i],
                props: {
                    oprProp: props
                }
            });
        }
        commit(mutationTypes.UPDATE_COL, updateColInfo);
    }
};