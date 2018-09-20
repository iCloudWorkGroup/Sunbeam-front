<template>
    <div class="fui-body">
        <span class="fui-layout">
            <div class="fui-section fui-transverse"
                 data-initiator="hide"
                 @click="ejectMenu($event,'hide')">
                <div class="fui-cf-extend-ico ico-frozencustomized fui-cf-alone"></div>
                <div class="fui-cf-desc">
                    <div class="fui-cf-text">隐藏</div>
                </div>
            </div>
        </span>
        <span class="fui-layout">
            <div class="fui-section fui-transverse"
                 data-initiator="show"
                 @click="ejectMenu($event,'show')">
                <div class="fui-cf-extend-ico ico-frozencustomized fui-cf-alone"></div>
                <div class="fui-cf-desc">
                    <div class="fui-cf-text">取消隐藏</div>
                </div>
            </div>
        </span>
        <div class="widget" ref="hide"
            v-show="tool === 'hide'">
            <div class="widget-panel">
                <ul class="widget-menu frozenBox" style="min-width:220px">
                    <li @mousedown.stop="hideRow">
                        <span class=" widget-ico"></span>
                        <span class="widget-content">
                            <div class="widget-weight">隐藏行</div>
                        </span>
                    </li>
                    <li @mousedown.stop="hideCol">
                        <span class="widget-ico"></span>
                        <span class="widget-content">
                            <div class="widget-weight">隐藏列</div>
                        </span>
                    </li>
                </ul>
            </div>
        </div>
        <div class="widget" ref="show"
            v-show="tool === 'show'">
            <div class="widget-panel">
                <ul class="widget-menu frozenBox" style="min-width:220px">
                    <li @mousedown.stop="showRow">
                        <span class="widget-ico"></span>
                        <span class="widget-content">
                            <div class="widget-weight">取消隐藏行</div>
                        </span>
                    </li>
                    <li @mousedown.stop="showCol">
                        <span class="widget-ico"></span>
                        <span class="widget-content">
                            <div class="widget-weight">取消隐藏列</div>
                        </span>
                    </li>
                </ul>
            </div>
        </div>
    </div>
</template>
<script type="text/javascript">
import {
    COLS_HIDE,
    ROWS_HIDE,
    COLS_CANCELHIDE,
    ROWS_CANCELHIDE
} from '../../store/action-types'
import {
    SWITCH_NAME
} from '../store/mutation-type'
import {
    unit
} from '../../filters/unit'
export default {
    computed: {
        tool() {
            return this.$store.getters.activeTool
        }
    },
    methods: {
        ejectMenu(e, menuName) {
            let el = e.currentTarget
            let menu = this.$refs[menuName]
            let menuEl
            if (menu != null && (menuEl = menu.$el) != null) {
                menuEl.style.top = unit(el.offsetHeight + el.offsetTop - 1)
                menuEl.style.left = unit(el.offsetLeft)
                this.$store.commit(SWITCH_NAME, menuName)
            }
        },
        hideCol() {
            this.$store.dispatch(COLS_HIDE)
        },
        hideRow() {
            this.$store.dispatch(ROWS_HIDE)
        },
        showCol() {
            this.$store.dispatch(COLS_CANCELHIDE)
        },
        showRow() {
            this.$store.dispatch(ROWS_CANCELHIDE)
        }
    }
}
</script>
<style type="text/css">
</style>