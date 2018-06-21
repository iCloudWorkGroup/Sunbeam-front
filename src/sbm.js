import './css/main.css'
import Vue from 'vue'
import Vuex from 'vuex'
import options from './store/index'
import {
    RESTORE
} from './store/action-types'
import {
    UPDATE_MOUSESTATE,
    UPDATE_FOCUSSTATE
} from './store/mutation-types'
import Book from './components/book.vue'
import Toolbar from './components/toolbar/toolbar.vue'
import {
    LOCATE
} from './tools/constant'
import dataloader from './tools/dataloader'
import font from './entrance/font'
import config from './config'

Vue.use(Vuex)

// 后期需要进行修改
window.SPREADSHEET_AUTHENTIC_KEY = '1e624f96-17ac-44f5-9def-fe989a1f6bec'

function SBM(wrapperId) {
    if (!(this instanceof SBM)) {
        return new SBM(wrapperId)
    }

    let wrapper = document.getElementById(wrapperId)
    let right = wrapper.offsetWidth
    let bottom = wrapper.offsetHeight
    let store = new Vuex.Store(options)

    dataloader({
        left: 0,
        top: 0,
        right,
        bottom
    }, function(data) {
        store.dispatch(RESTORE, data)
    })

    let template =
        `<div style="position:absolute;left:0;right:0;top:0;bottom:0;"
                        @mouseup="getFocus">
                        <toolbar></toolbar>
                        <book :book-width="bookWidth" 
                            :book-height="bookHeight">
                        </book>
                    </div>`

    new Vue({
        store,
        template,
        data: {
            bookWidth: 0,
            bookHeight: 0
        },
        components: {
            Book,
            Toolbar
        },
        created() {
            this.bookWidth = wrapper.offsetWidth
            this.bookHeight = wrapper.offsetHeight - config.toolbarHeight
        },
        mounted() {
            let self = this
            document.addEventListener('mouseup', function() {
                self.$store.commit(UPDATE_MOUSESTATE, {
                    state: LOCATE
                })
            }, false)
        },
        methods: {
            getFocus() {
                this.$store.commit(UPDATE_FOCUSSTATE, false)
            }
        }
    }).$mount('#' + wrapperId)
    font(this, store)
}

export default SBM