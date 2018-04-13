import * as actionTypes from '../../action-types';
import * as mutaionTypes from '../../mutation-types';
import config from '../../../config';
import cache from '../../../tools/cache';
import {
    getRowDisplayName
} from '../../../util/displayname';
import extend from '../../../util/extend';
import generator from '../../../tools/generator';
import template from './template';

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
        commit(mutaionTypes.ADD_ROW, {
            rows: temp,
            currentSheet: rootState.currentSheet
        });
    },
    [actionTypes.ROWS_INSERTROWS]({
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
        commit(mutaionTypes.INSERT_ROW, {
            rows: temp,
            currentSheet: rootState.currentSheet
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
        commit(mutaionTypes.ADD_ROW, {
            rows: temp,
            currentSheet
        });
    }
};