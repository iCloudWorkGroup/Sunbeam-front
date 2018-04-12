import * as actionTypes from '../../action-types';
import * as mutaionTypes from '../../mutation-types';
import {getColDisplayName} from '../../../util/displayname';
import generator from '../../../tools/generator';
import extend from '../../../util/extend';
import config from '../../../config';
import cache from '../../../tools/cache';
import template from './template';

export default {
    [actionTypes.COLS_ADDCOLS]({state, rootState, commit}, cols) {
        let temp = [];
        if (!Array.isArray(cols)) {
            cols = [cols];
        }
        for (let i = 0, len = cols.length; i < len; i++) {
            temp.push(extend({}, template, cols[i]));
        }
        commit(mutaionTypes.ADD_COL, {
            cols: temp,
            currentSheet: rootState.currentSheet
        });
    },
    [actionTypes.COLS_INSERTCOLS]({state, rootState, commit}, cols) {
        let map = state[rootState.currentSheet].map,
            temp = [];

        if (!Array.isArray(cols)) {
            cols = [cols];
        }

        for (let i = 0, len = cols.length; i < len; i++) {
            if(!map.get(cols[i].alias)){
                temp.push(extend({}, template, cols[i]));
            }
        }
        commit(mutaionTypes.INSERT_COL, {
            cols: temp,
            currentSheet: rootState.currentSheet
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
        commit(mutaionTypes.ADD_COL, {
            cols: temp,
            currentSheet
        });
    }
};