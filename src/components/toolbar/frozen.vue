<template>
<div class="fui-body">
    <div class="fui-layout">
        <div class="fui-section fui-alone"
             data-widget="frozen"
             @click="activeWidget">
            <div class="fui-cf-extend-ico ico-frozencustomized fui-cf-alone"></div>
            <div class="fui-cf-desc">
                <div class="fui-cf-text">冻结窗口</div>
                <div class="fui-cf-extend caret"></div>
            </div>
        </div>
    </div>
    <div class="widget"
         ref="frozen"
         v-show="activeWidgetId === 'frozen'">
        <div class="widget-panel">
            <ul class="widget-menu frozenBox"
                style="min-width:220px">
                <li v-show="currentState.isFrozen"
                    @mousedown="unFrozen">
                    <span class="fui-cf-extend-ico ico-frozencustomized widget-ico"></span>
                    <span class="widget-content">
                            <div class="widget-weight">取消冻结窗口</div>
                            <div class="widget-desc">解除所有行和列锁定，以滚动整个工作表。</div>
                        </span>
                </li>
                <li v-show="!currentState.isFrozen"
                    @mousedown="frozen">
                    <span class="fui-cf-extend-ico ico-frozencustomized widget-ico"></span>
                    <span class="widget-content">
                            <div class="widget-weight">冻结拆分窗口</div>
                            <div class="widget-desc">滚动工作表其余部分时，保持行和列可见(基于当前的选择)</div>
                        </span>
                </li>
                <li v-show="!currentState.isFrozen"
                    @mousedown="rowFrozen">
                    <span class="fui-cf-extend-ico ico-frozencustomized widget-ico"></span>
                    <span class="widget-content">
                            <div class="widget-weight">冻结首行</div>
                            <div class="widget-desc">滚动工作表其余部分时，保持首行可见</div>
                        </span>
                </li>
                <li v-show="!currentState.isFrozen"
                    @mousedown="colFrozen">
                    <span class="fui-cf-extend-ico ico-frozencustomized widget-ico"></span>
                    <span class="widget-content">
                            <div class="widget-weight">冻结首列</div>
                            <div class="widget-desc">滚动工作表其余部分时，保持行列可见</div>
                        </span>
                </li>
            </ul>
        </div>
    </div>
</div>
</template>
<script type="text/javascript">

import {SHEET_FROZEN, SHEET_UNFROZEN} from '../../store/action-types'

export default {
    props: [
        'activeWidgetId'
    ],
    computed: {
        currentState() {
            let currentSheet = this.$store.state.currentSheet
            let sheets = this.$store.state.sheets.list
            let sheet

            for (let i = 0, len = sheets.length; i < len; i++) {
                sheet = sheets[i]
                if (sheet.alias === currentSheet) {
                    break
                }
            }

            let frozenState = sheet.frozenState
            return frozenState
        }
    },
    methods: {
        activeWidget(e) {
            let elem = e.currentTarget
            let widgetId = elem.dataset.widget
            let widget
            let box

            if (!widgetId) {
                return
            }
            this.$emit('updateActiveWidgetId', widgetId)
        },
        unFrozen(e) {
            this.$store.dispatch(SHEET_UNFROZEN)
        },
        frozen(e) {
            this.$store.dispatch(SHEET_FROZEN)
        },
        rowFrozen(e) {
            this.$store.dispatch(SHEET_FROZEN, 'firstRowFrozen')
        },
        colFrozen(e) {
            this.$store.dispatch(SHEET_FROZEN, 'firstColFrozen')
        },
        getValue(elem, currentTarget) {
            let value = elem.dataset.value
            if (value === undefined) {
                if (elem === currentTarget) {
                    return
                } else {
                    return this.getValue(elem.parentNode, currentTarget)
                }
            } else {
                return value
            }
        }
    }
}
</script>