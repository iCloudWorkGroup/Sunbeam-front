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
import generator from '../../../tools/generator';

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
            cellList,
            updateCellInfo = [],
            rowHeight = row.height,
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
            let occupy = cell.occupy.row,
                temp;

            if ((temp = occupy.indexOf(rowAlias)) === 0 || temp === -1) {
                updateCellInfo.push({
                    cell,
                    propName: 'physicsBox.top',
                    value: cell.physicsBox.top + rowHeight + 1
                });
            } else {
                updateCellInfo.push({
                    cell,
                    propName: 'physicsBox.height',
                    value: cell.physicsBox.height + rowHeight + 1
                });
                let newOccupy = occupy.slice(0).splice(temp, 0, rowAlias);
                updateCellInfo.push({
                    cell,
                    propName: 'occupy.row',
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
            startPosi = getters.getRowByAlias(wholePosi.startRowAlias).top;
            endPosi = getters.getRowByAlias(wholePosi.endRowAlias).top;

            if (startPosi >= rowTop) {
                updateSelectInfo.push({
                    select,
                    propName: 'physicsBox.top',
                    value: select.physicsBox.top + rowHeight + 1
                });
            } else if (endPosi > rowTop) {
                updateSelectInfo.push({
                    select,
                    propName: 'physicsBox.height',
                    value: select.physicsBox.height + rowHeight + 1
                });
            }
        });

        commit(mutationTypes.BATCH_UPDATE_SELECT, {
            currentSheet,
            info: updateSelectInfo
        });

        let updateRowInfo = [];
        for (let i = index, len = rows.length; i < len; i++) {
            let row = rows[i];
            updateRowInfo.push({
                row,
                propName: 'top',
                value: row.top + rowHeight + 1
            }, {
                row,
                propName: 'sort',
                value: row.sort + 1
            },{
                row,
                propName: 'displayName',
                value: getRowDisplayName(row.sort + 1)
            });
        }
        commit(mutationTypes.BATCH_UPDATE_ROW, {
            currentSheet,
            info: updateRowInfo
        });        
        commit(mutationTypes.INSERT_ROW, {
            currentSheet,
            rows: [row]
        });
    },
    [actionTypes.ROWS_GENERAT]({
        state,
        rootState,
        commit
    }, num) {
        let currentSheet = rootState.currentSheet,
            rowList = state[currentSheet],
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

        cache.localRowPosi = temp[temp.length - 1].top + temp[temp.length - 1].height;
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

        commit(mutationTypes.CANCEL_ACTIVE_ROW, {
            currentSheet,
            startIndex,
            endIndex
        });

        startIndex = getters.getRowIndexByAlias(newStartAlias);
        endIndex = getters.getRowIndexByAlias(newEndAlias);

        commit(mutationTypes.ACTIVE_ROW, {
            currentSheet,
            startIndex,
            endIndex
        });
    }
};