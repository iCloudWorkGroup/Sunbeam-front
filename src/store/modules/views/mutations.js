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
        state.share.viewAlias = {
            startRow,
            startCol,
            overRow,
            overCol
        }
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
        state.max = {
            rowAlias,
            colAlias,
            rowPixel,
            colPixed
        }
    }
}