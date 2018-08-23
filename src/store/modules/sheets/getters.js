let viewTypes = {
    mainRule: 'mainView',
    leftRule: 'leftView',
    topRule: 'topView',
    cornerRule: 'cornerView'
}

export default {
    frozenState(state, getters, rootState) {
        return function() {
            let alias = rootState.currentSheet
            let list = state.list
            let sheet
            for (let i = 0, len = list.length; i < len; i++) {
                if (list[i].alias === alias) {
                    sheet = list[i]
                    break
                }
            }
            return sheet.frozenState
        }
    },
    getEditViewOccupy(state, getters, rootState) {
        return function(type) {
            let alias = rootState.currentSheet
            let list = state.list
            let sheet

            for (let i = 0, len = list.length; i < len; i++) {
                if (list[i].alias === alias) {
                    sheet = list[i]
                    break
                }
            }
            if (type == null) {
                return sheet.editViewOccupy
            } else {
                return sheet.editViewOccupy[viewTypes[type]]
            }
        }
    },
    loaded(state) {
        return state.loaded
    },
    loadedIdxByAlias(state) {
        return function({
            alias,
            type
        }) {
            let loads = state.loaded[type.toLowerCase()]
            for (let i = 0, len = loads.length; i < len; i++) {
                let item = loads[i]
                if (alias === item) {
                    return i
                }
            }
            return -1
        }
    },
    max(state) {
        return state.max
    }
}