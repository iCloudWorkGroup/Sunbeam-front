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
        let selects = getters.selectList;

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
            row = rows[index];

        send({
            url: config.operUrl['hiderow'],
            data: JSON.stringify({
                row: row.sort
            }),
        });
        dispatch(actionTypes.ROWS_EXECHIDE, index);
    },
    [actionTypes.ROWS_EXECHIDE]({
        state,
        rootState,
        commit,
        getters,
        dispatch
    }, index){
        let rows = getters.rowList;
        let visibleRows = getters.visibleRowList;
        let row = rows[index];

        let updateCellInfo = [],
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


        let updateSelectInfo = [];
        let rowTop = row.top;
        let selects = getters.selectList;
        let currentSheet = rootState.currentSheet;
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
        dispatch(actionTypes.ROWS_EXECCANCELHIDE, row.sort);
    },
    [actionTypes.ROWS_EXECCANCELHIDE]({
        state,
        rootState,
        commit,
        getters,
        dispatch
    }, sort) {

        let index = getters.getRowIndexBySort(sort);
        let rows = getters.rowList;
        let row = rows[index];

        let updateCellInfo = [],
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
            
        let selects = getters.selectList;
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
    [actionTypes.COLS_INSERTCOL]({
        getters,
        dispatch
    }, index) {
        let selects = getters.selectList;
        if (index === undefined) {
            let select;
            for (let i = 0, len = selects.length; i < len; i++) {
                if (selects[i].type === SELECT) {
                    select = selects[i];
                    break;
                }
            }
            if(select.wholePosi.endColAlias === 'MAX'){
                return;
            }
            index = getters.getColIndexByAlias(select.wholePosi.startColAlias);
        }

        let sort = getters.colList[index].sort;
        send({
            url: config.operUrl['insertcol'],
            data: JSON.stringify({
                col: sort,
            }),
        });
        dispatch(actionTypes.COLS_EXECINSERTCOL, {sort});
    },
    [actionTypes.COLS_EXECINSERTCOL]({
        getters,
        commit,
        dispatch,
        rootState
    }, {
        sort,
        colModel
    }) {
        let insertCol;
        let cols = getters.colList;
        let index = getters.getColIndexBySort(sort);
        if (!colModel) {
            insertCol = extend(template);
            insertCol.alias = generator.colAliasGenerator();
            insertCol.sort = sort;
            insertCol.displayName = getColDisplayName(sort);
            insertCol.left = cols[index].left;
        } else {
            insertCol = colModel;
        }

        let colWidth = insertCol.width;
        let insertColAlias = insertCol.alias;
        let currentColAlias = cols[index].alias;
        let insertColLeft = insertCol.left;
        let cellList;
        let currentSheet = rootState.currentSheet;

        cellList = getters.getCellsByVertical({
            startColIndex: index,
            startRowIndex: 0,
            endColIndex: 'MAX',
            endRowIndex: 'MAX',
        });

        let updateCellInfo = [];
        cellList.forEach(function(cell) {
            let occupyCol = cell.occupy.col;
            if (cell.physicsBox.left >= insertColLeft) {
                updateCellInfo.push({
                    cell,
                    props: {
                        physicsBox: {
                            left: cell.physicsBox.left + colWidth + 1
                        }
                    }
                });
            } else {
                let aliasIndex = occupyCol.indexOf(currentColAlias),
                    newOccupy = [...occupyCol],
                    occupyRow = cell.occupy.row,
                    cellIndex;

                newOccupy.splice(aliasIndex, 0, insertColAlias);
                cellIndex = getters.getPointInfo(occupyCol[0], occupyRow[0], 'cellIndex');
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
                occupyRow.forEach(function(rowAlias) {
                    commit(mutationTypes.UPDATE_POINTINFO, {
                        currentSheet,
                        info: {
                            colAlias: insertColAlias,
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
        let selects = getters.selectList;
        selects.forEach(function(select) {
            let wholePosi = select.wholePosi,
                startIndex,
                endIndex;
            startIndex = getters.getColIndexByAlias(wholePosi.startColAlias);
            endIndex = getters.getColIndexByAlias(wholePosi.endColAlias);

            if (startIndex >= index) {
                updateSelectInfo.push({
                    select,
                    props: {
                        physicsBox: {
                            left: select.physicsBox.left + colWidth + 1
                        }
                    }
                });
            } else if (endIndex > index) {
                updateSelectInfo.push({
                    select,
                    props: {
                        physicsBox: {
                            width: select.physicsBox.width + colWidth + 1
                        }
                    }
                });
                insertCol.active = true;
            }
        });
        commit(mutationTypes.UPDATE_SELECT, updateSelectInfo);


        insertCol.left = cols[index].left;
        let updateColInfo = [];
        for (let i = index, len = cols.length; i < len; i++) {
            let col = cols[i];
            updateColInfo.push({
                col,
                props: {
                    left: col.left + colWidth + 1,
                    sort: col.sort + 1,
                    displayName: getColDisplayName(col.sort + 1)
                }
            });
        }
        commit(mutationTypes.UPDATE_COL, updateColInfo);
        commit(mutationTypes.INSERT_COL, {
            currentSheet: rootState.currentSheet,
            cols: [insertCol]
        });
        if (cache.localColPosi > 0) {
            cache.localColPosi += colWidth + 1;
        }
        /**
         * 只有在删除单元格的回退操作，才会传入列对象
         * 回退操作不需要进行前一列上单元格的复制操作
         */
        if (!colModel && index > 0) {
            cellList = getters.getCellsByVertical({
                startColIndex: index - 1,
                startRowIndex: 0,
                endColIndex: index - 1,
                endRowIndex: 'MAX',
            });
            let insertCellList = [];
            let previousAlias = cols[index - 1].alias;
            cellList.forEach(cell => {
                let occupyCol = cell.occupy.col;
                let occupyRow = cell.occupy.row;
                if (occupyCol.indexOf(previousAlias) === occupyCol.length - 1) {
                    occupyRow.forEach(alias => {
                        let insertCell = extend(cell);
                        insertCell.occupy = {
                            col: [insertColAlias],
                            row: [alias]
                        };
                        insertCell.content.texts = '';
                        insertCellList.push(insertCell);
                    });
                }
            });
            dispatch(actionTypes.CELLS_INSERTCELL, insertCellList);
        }
    },
    [actionTypes.ROWS_ADJUSTHEIGHT]({dispatch, getters}, 
        {index, height}){

        let rows = getters.rowList,
            row = rows[index];

        send({
            url: config.operUrl['adjustrow'],
            data: JSON.stringify({
                row: row.sort,
                offset: height
            }),
        });
        dispatch(actionTypes.ROWS_EXECADJUSTHEIGHT, {
            sort: row.sort,
            value: height
        });
    },
    [actionTypes.ROWS_EXECADJUSTHEIGHT]({state, rootState, commit, getters}, {sort, value}) {    
        let currentSheet = rootState.currentSheet,
            rows = getters.rowList,
            index = getters.getRowIndexBySort(sort),
            row = rows[index],
            rowAlias = row.alias,
            adjustHeight = value - row.height,
            updateCellInfo = [];

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
            if (i === index) {
                updateRowInfo.push({
                    row,
                    props: {
                        height: value,
                    }
                });
            } else {
                updateRowInfo.push({
                    row,
                    props: {
                        top: row.top + adjustHeight,
                    }
                });
            }

        }

        if (cache.localRowPosi > 0) {
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