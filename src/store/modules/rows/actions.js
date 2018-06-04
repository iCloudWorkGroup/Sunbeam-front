import Vue from 'vue';
import * as actionTypes from '../../action-types';
import * as mutationTypes from '../../mutation-types';
import config from '../../../config';
import cache from '../../../tools/cache';
import extend from '../../../util/extend';
import generator from '../../../tools/generator';
import template from './template';
import {getRowDisplayName} from '../../../util/displayname';
import {SELECT} from '../../../tools/constant';
import send from '../../../util/send';


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
    [actionTypes.ROWS_HIDE]({
        state,
        rootState,
        commit,
        getters,
        dispatch
    }, index) {
        let selects = getters.selectList,
            currentSheet = rootState.currentSheet;

        if(getters.visibleRowList.length < 2){
            return;
        }

        if (index === undefined) {
            let select;
            for (let i = 0, len = selects.length; i < len; i++) {
                if (selects[i].type === SELECT) {
                    select = selects[i];
                    break;
                }
            }
            if(select.wholePosi.endRowAlias === 'MAX'){
                return;
            }
            index = getters.getRowIndexByAlias(select.wholePosi.startRowAlias);
        }
        let rows = getters.rowList,
            visibleRows = getters.visibleRowList,
            row = rows[index],
            updateCellInfo = [],
            rowHeight = row.height,
            rowAlias = row.alias;
        
        send({
            url: config.operUrl['hiderow'],
            data: JSON.stringify({
                row: row.sort
            }),
        });

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
                updateCellInfo.push({
                    cell,
                    props: {
                        physicsBox: {
                            height: cell.physicsBox.height - rowHeight - 1
                        }
                    }
                });
            } else {
                updateCellInfo.push({
                    cell,
                    props: {
                        physicsBox: {
                            top: cell.physicsBox.top - rowHeight - 1
                        }
                    }
                });
            }
        });
        commit(mutationTypes.UPDATE_CELL, updateCellInfo);


        let updateSelectInfo = [],
            rowTop = row.top;

        selects.forEach(function(select) {
            let wholePosi = select.wholePosi,
                startSort,
                endSort,
                rowSort = row.sort,
                endVisibleSort = visibleRows[visibleRows.length - 1].sort;

            startSort = getters.getRowByAlias(wholePosi.startRowAlias).sort;
            endSort = getters.getRowByAlias(wholePosi.endRowAlias).sort;
            
            if (startSort >= rowSort) {
                if(startSort === endVisibleSort){
                    updateSelectInfo.push({
                        select,
                        props: {
                            physicsBox: {
                                top: rows[index -1].top,
                                height: rows[index - 1].height
                            },
                            wholePosi: {
                                startRowAlias: rows[index - 1].alias,
                                endRowAlias: rows[index - 1].alias
                            }
                        }   
                    });
                    commit(mutationTypes.ACTIVE_ROW, {
                        currentSheet,
                        startIndex: index - 1
                    });
                }else if (startSort === endSort) {
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
                                height: select.physicsBox.height - rowHeight -1
                            }
                        }
                    });
                }

            } else if (endSort > rowTop) {
                updateSelectInfo.push({
                    select,
                    props: {
                        physicsBox: {
                            top: select.physicsBox.top - rowHeight -1
                        }
                    }
                });
            }
        });

        commit(mutationTypes.UPDATE_SELECT, updateSelectInfo);

        let updateRowInfo = [{
            row: rows[index],
            props: {
                hidden: true,
                active: false
            }
        }];

        if (index > 0) {
            updateRowInfo.push({
                row: rows[index - 1],
                props: {
                    bottomAjacentHide: true
                }
            });
        }
        for (let i = index + 1, len = rows.length; i < len; i++) {
            let row = rows[i];
            updateRowInfo.push({
                row,
                props: {
                    top: row.top - rowHeight - 1
                }
            });
        }
        commit(mutationTypes.UPDATE_ROW, updateRowInfo);  
        if (cache.localRowPosi > 0) {
            cache.localRowPosi -= rowHeight + 1;
        }
    },
    [actionTypes.ROWS_CANCELHIDE]({
        state,
        rootState,
        commit,
        getters,
        dispatch
    }, index) {
        let selects = getters.selectList,
            currentSheet = rootState.currentSheet,
            rows = getters.rowList,
            visibleRows = getters.visibleRowList;

        if (index === undefined) {
            let select,
                startIndex,
                endIndex,
                visibleStartRow = visibleRows[0],
                visibleEndRow = visibleRows[visibleRows.length - 1];

            for (let i = 0, len = selects.length; i < len; i++) {
                if (selects[i].type === SELECT) {
                    select = selects[i];
                    break;
                }
            }
            let startRowAlias = select.wholePosi.startRowAlias,
                endRowAlias = select.wholePosi.endRowAlias;

            if(endRowAlias === 'MAX'){
                return;
            }
            if (visibleStartRow.alias === startRowAlias &&
                visibleStartRow !== rows[0]) {
                index = 0;
            } else if (visibleEndRow.alias === endRowAlias &&
                visibleEndRow !== rows[rows.length - 1]) {
                index = rows.length - 1;
            } else {
                startIndex = getters.getColIndexByAlias(startRowAlias);
                endIndex = getters.getColIndexByAlias(endRowAlias);

                for (let i = startIndex; i < endIndex + 1; i++) {
                    if (rows[i].hidden) {
                        index = i;
                        break;
                    }
                }
            }

        }
        if (index === undefined || !rows[index].hidden) {
            return;
        }

        let row = rows[index],
            updateCellInfo = [],
            rowHeight = row.height,
            rowAlias = row.alias;

        send({
            url: config.operUrl['showrow'],
            data: JSON.stringify({
                row: row.sort
            }),
        });
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
                updateCellInfo.push({
                    cell,
                    props: {
                        physicsBox: {
                            height: cell.physicsBox.height + rowHeight + 1
                        }
                    }
                });
            } else {
                updateCellInfo.push({
                    cell,
                    props: {
                        physicsBox: {
                            top: cell.physicsBox.top + rowHeight + 1
                        }
                    }
                });
            }
        });
        commit(mutationTypes.UPDATE_CELL, updateCellInfo);


        let updateSelectInfo = [],
            rowTop = row.top;

        selects.forEach(function(select) {
            let wholePosi = select.wholePosi,
                startIndex,
                endIndex;

            startIndex = getters.getRowIndexByAlias(wholePosi.startRowAlias);
            endIndex = getters.getRowIndexByAlias(wholePosi.endRowAlias);

            if (startIndex > index) {
                updateSelectInfo.push({
                    select,
                    props: {
                        physicsBox: {
                            top: select.physicsBox.top + rowHeight + 1
                        }
                    }
                });
            } else if (endIndex > index) {
                updateSelectInfo.push({
                    select,
                    props: {
                        physicsBox: {
                            height: select.physicsBox.height + rowHeight + 1
                        }
                    }
                });
                commit(mutationTypes.UPDATE_ROW, [{
                    row: rows[index],
                    props: {
                        active: true
                    }
                }]);
            }
            if (cache.localRowPosi > 0) {
                cache.localRowPosi += rowHeight + 1;
            }
        });

        commit(mutationTypes.UPDATE_SELECT, updateSelectInfo);

        let updateRowInfo = [{
            row: rows[index],
            props: {
                hidden: false
            }
        }];

        if (index > 0) {
            updateRowInfo.push({
                row: rows[index - 1],
                props: {
                    bottomAjacentHide: false
                }
            });
        }
        for (let i = index + 1, len = rows.length; i < len; i++) {
            let row = rows[i];
            updateRowInfo.push({
                row,
                props: {
                    top: row.top + rowHeight + 1
                }
            });
        }
        commit(mutationTypes.UPDATE_ROW, updateRowInfo);  
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
            if(select.wholePosi.endRowAlias === 'MAX'){
                return;
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
        
        send({
            url: config.operUrl['insertrow'],
            data: JSON.stringify({
                row: rows[index].sort,
            }),
        });

        row.sort = index;
        row.alias = rowAlias;
        row.displayName = getRowDisplayName(index);
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
        if (cache.localRowPosi > 0) {
            cache.localRowPosi -= rowHeight + 1;
        }
    },
    [actionTypes.ROWS_ADJUSTHEIGHT]({state, rootState, commit, getters}, 
        {index, height}){

         let currentSheet = rootState.currentSheet,
            rows = getters.rowList,
            row = rows[index],
            rowAlias = row.alias,
            adjustHeight = height - row.height,
            updateCellInfo = [];

        send({
            url: config.operUrl['adjustrow'],
            data: JSON.stringify({
                row: row.sort,
                offset: height
            }),
        });
        let cellList = getters.getCellsByVertical({
            startColIndex: 0,
            startRowIndex: index,
            endColIndex: 'MAX',
            endRowIndex: 'MAX',
        });

        cellList.forEach(function(cell) {
            let occupy = cell.occupy.row,
                temp;

            if ((temp = occupy.indexOf(rowAlias)) !== -1){
                    updateCellInfo.push({
                        cell,
                        props: {
                            physicsBox: {
                                height: cell.physicsBox.height + adjustHeight
                            }
                        }
                    });
                
            } else {
                updateCellInfo.push({
                    cell,
                    props: {
                        physicsBox: {
                            top: cell.physicsBox.top + adjustHeight
                        }                   
                    }
                });
            }
        });
        commit(mutationTypes.UPDATE_CELL, updateCellInfo);

        let updateSelectInfo = [],
            rowTop = row.top,
            rowHeight = row.height,
            selects = getters.selectList;

        selects.forEach(function(select) {
            let wholePosi = select.wholePosi,
                startPosi,
                endPosi;

            startPosi = getters.getRowByAlias(wholePosi.startRowAlias).top;
            endPosi = getters.getRowByAlias(wholePosi.endRowAlias).top;
            if (startPosi === rowTop) {
                updateSelectInfo.push({
                    select,
                    props: {
                        physicsBox: {
                            height: select.physicsBox.height + adjustHeight
                        }
                    }
                });
            } else if (startPosi > rowTop) {
                updateSelectInfo.push({
                    select,
                    props: {
                        physicsBox: {
                            top: select.physicsBox.top + adjustHeight
                        }
                    }
                });

            } else if (endPosi > rowTop) {
                updateSelectInfo.push({
                    select,
                    props: {
                        physicsBox: {
                            height: select.physicsBox.height + adjustHeight
                        }
                    }
                });
            }
        });

        commit(mutationTypes.UPDATE_SELECT, updateSelectInfo);

        let updateRowInfo = [];
        for (let i = index, len = rows.length; i < len; i++) {
            let row = rows[i];
            if(i === index){
                updateRowInfo.push({
                    row,
                    props: {
                        height: height,
                    }
                });
            }else{
                updateRowInfo.push({
                    row,
                    props: {
                        top:  row.top + adjustHeight,
                    }
                });
            }

        }
 
        if(cache.localRowPosi > 0){
            cache.localRowPosi += adjustHeight;
        }
        commit(mutationTypes.UPDATE_ROW, updateRowInfo);
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
            if(select.wholePosi.endRowAlias === 'MAX'){
                return;
            }
            index = getters.getRowIndexByAlias(select.wholePosi.startRowAlias);
        }

        let rows = getters.rowList,
            row = rows[index],
            deleteOccupys = [],
            updateCellInfo = [],
            rowHeight = row.height,
            rowAlias = row.alias;

        send({
            url: config.operUrl['deleterow'],
            data: JSON.stringify({
                row: row.sort,
            }),
        });
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
                if (occupy.length === 1) {
                    deleteOccupys.push(cell.occupy);
                }else{
                    deleteOccupys.push({
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
            occupys: deleteOccupys
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
                } else {
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

        if (cache.localRowPosi > 0) {
            cache.localRowPosi -= rowHeight + 1;
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