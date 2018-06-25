<template>
<div class="fui-body">
    <div class="fui-layout">
        <div class="fui-transverse"
             @click="setAlign"
             data-type="content.alignCol">
            <span class="ico-section"
                  data-value="top"
                  :class="{active: alignCol === 'top'}">
                    <span class="fui-cf-ico ico-aligntop"></span>
            </span>
            <span class="ico-section"
                  data-value="middle"
                  :class="{active: alignCol === 'middle'}">
                    <span class="fui-cf-ico ico-alignmiddle"></span>
            </span>
            <span class="ico-section"
                  data-value="bottom"
                  :class="{active: alignCol === 'bottom'}">
                    <span class="fui-cf-ico ico-alignbottom"></span>
            </span>
        </div>
        <div class="fui-transverse"
             @click="setAlign"
             data-type="content.alignRow">
            <span class="ico-section"
                  data-value="left"
                  :class="{active: alignRow === 'left'}">
                    <span class="fui-cf-ico ico-alignleft"></span>
            </span>
            <span class="ico-section"
                  data-value="center"
                  :class="{active: alignRow === 'center'}">
                    <span class="fui-cf-ico ico-aligncenter"></span>
            </span>
            <span class="ico-section"
                  data-value="right"
                  :class="{active: alignRow === 'right'}">
                    <span class="fui-cf-ico ico-alignright"></span>
            </span>
        </div>
    </div>
</div>

</template>

<script type="text/javascript">
import {
    CELLS_UPDATE
} from '../../store/action-types'

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
        },
        alignRow() {
            let cellProps = this.$store.getters.getSelectCell
            return cellProps.content.alignRow
        },
        alignCol() {
            let cellProps = this.$store.getters.getSelectCell
            return cellProps.content.alignCol
        }
    },
    methods: {
        setAlign(e) {
            let currentTarget = e.currentTarget
            let type = currentTarget.dataset.type
            let target = e.target
            let value

            value = this.getValue(target, currentTarget)
            if (value == null) {
                return
            }
            this.$store.dispatch(CELLS_UPDATE, {
                propNames: type,
                value
            })
        },
        getValue(elem, currentTarget) {
            let value = elem.dataset.value
            if (value == null) {
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