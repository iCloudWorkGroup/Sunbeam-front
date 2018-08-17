import {
    VIEWS_LOADED,
    VIEW_MAX,
    VIEW_ALIAS
} from '../../action-types'
import {
    ADD_VIEW_LOADED,
    UPDATE_VIEW_ALIAS,
    UPDATE_VIEW_MAX
} from '../../mutation-types'
export default {
    SHEETS_LOADED({
        state,
        commit
    }, {
        colAlias,
        rowAlias,
    }) {
        commit(ADD_VIEW_LOADED, {
            colAlias,
            rowAlias
        })
    }
}