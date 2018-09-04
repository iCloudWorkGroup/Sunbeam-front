import {
    UPDATE_VIEW_SCROLL,
    UPDATE_VIEW_ALIAS,
    ADD_VIEW_LOADED,
    UPDATE_VIEW_MAX
} from '../../mutation-types'
export default {
    // 更新scrollTop, left的共享值
    [UPDATE_VIEW_SCROLL](state, {
        scrollTop,
        scrollLeft
    }) {
        let stateShare = state.share
        if (scrollLeft != null &&
            scrollLeft !== stateShare.scrollLeft) {
            state.share.scrollLeft = scrollLeft
        }
        if (scrollTop != null &&
            scrollTop !== stateShare.scrollTop) {
            state.share.scrollTop = scrollTop
        }
    },
    [UPDATE_VIEW_ALIAS](state, {
        startRow,
        startCol,
        overRow,
        overCol
    }) {
        let viewAlias = state.share.viewAlias
        state.share.viewAlias.startRow = startRow != null ?
            startRow : viewAlias.startRow
        state.share.viewAlias.startCol = startCol != null ?
            startCol : viewAlias.startCol
        state.share.viewAlias.overRow = overRow != null ?
            overRow : viewAlias.overRow
        state.share.viewAlias.overCol = overCol != null ?
            overCol : viewAlias.overCol
    },
    [ADD_VIEW_LOADED](state, {
        colAlias,
        rowAlias
    }) {
        let loaded = state.loaded
        loaded.col.push(colAlias)
        loaded.row.push(rowAlias)
        loaded.map.set(colAlias, {
            [rowAlias]: true
        })
    },
    [UPDATE_VIEW_MAX](state, {
        rowAlias,
        colAlias,
        rowPixel,
        colPixed
    }) {
        let max = state.max
        state.max.rowAlias = rowAlias != null ? rowAlias : max.rowAlias
        state.max.colAlias = colAlias != null ? colAlias : max.colAlias
        state.max.rowPixel = rowPixel != null ? rowPixel : max.rowPixel
        state.max.colPixed = colPixed != null ? colPixed : max.colPixed
    }
}