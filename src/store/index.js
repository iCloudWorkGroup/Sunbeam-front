import actions from './actions'
import mutations from './mutations'
import cols from './modules/cols'
import rows from './modules/rows'
import cells from './modules/cells'
import selects from './modules/selects'
import sheets from './modules/sheets'
import input from './modules/input'
import history from './modules/history'
// import historyPlugin from './plugins/historyplugin'
// import clipPlugin from './plugins/clipplugin'
import Vue from 'vue'
import Vuex from '../lib/vuex.esm'
Vue.use(Vuex)

const state = {
    /**
     * 当前选中sheet的alias
     * @type {String}
     */
    active: null,
    loading: false,
    name: ''
}
export default new Vuex.Store({
    state,
    actions,
    mutations,
    modules: {
        cols,
        rows,
        cells,
        selects,
        sheets,
        input,
        history
    },
    // plugins: [historyPlugin, clipPlugin]
})