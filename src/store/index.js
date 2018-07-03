import actions from './actions'
import mutations from './mutations'
import cols from './modules/cols/index'
import rows from './modules/rows/index'
import cells from './modules/cells/index'
import selects from './modules/selects/index'
import sheets from './modules/sheets/index'
import pointsInfo from './modules/pointsinfo/index'
import input from './modules/input/index'
import history from './modules/history/index'
import historyPlugin from './plugins/historyplugin'
import clipPlugin from './plugins/clipplugin'
import { LOCATE } from '../tools/constant'
import Vue from 'vue'
import Vuex from '../lib/vuex.esm'
Vue.use(Vuex)

const state = {
    /**
     * 当前选中sheet的alias
     * @type {String}
     */
    currentSheet: '',
    userView: {
        left: 0,
        right: 0,
        top: 0,
        bottom: 0
    },
    mouseState: LOCATE,
    focusState: false
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
        pointsInfo,
        input,
        history
    },
    plugins: [historyPlugin, clipPlugin]
})