import {
    views
} from '../../mutation-types'
export default {
    // 更新scrollTop, left的共享值
    [views.UPDATE_SCROLL](state, {
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
    }
}