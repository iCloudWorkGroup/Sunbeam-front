<template>
    <div class="widget">
        <div class="widget-panel"
             style="max-height:200px;">
            <ul class="widget-menu frozenBox" style="min-width:220px">
                <li @mousedown.stop="insertRow" v-show="opr === 'insert'">
                    <span class=" widget-ico"></span>
                    <span class="widget-content">
                            <div class="widget-weight">插入工作表行</div>
                        </span>
                </li>
                <li @mousedown.stop="insertCol" v-show="opr === 'insert'">
                    <span class="widget-ico"></span>
                    <span class="widget-content">
                            <div class="widget-weight">插入工作表列</div>
                        </span>
                </li>
                <li @mousedown.stop="deleteRow" v-show="opr === 'delete'">
                    <span class="widget-ico"></span>
                    <span class="widget-content">
                            <div class="widget-weight">删除工作表行</div>
                        </span>
                </li>
                <li @mousedown.stop="deleteCol" v-show="opr === 'delete'">
                    <span class="widget-ico"></span>
                    <span class="widget-content">
                            <div class="widget-weight">删除工作表列</div>
                        </span>
                </li>
            </ul>
        </div>
    </div>
</template>
<script>
import {
    ROWS_INSERTROW,
    ROWS_DELETEROW,
    COLS_INSERTCOL,
    COLS_DELETECOL
} from '../../store/action-types'
// import {
//     pathToStruct
// } from '../../tools/format'
export default {
    data() {
        return {
        }
    },
    props: ['opr'],
    methods: {
        insertRow() {
            this.$store.dispatch(ROWS_INSERTROW)
        },
        deleteRow() {
            this.$store.dispatch(ROWS_DELETEROW)
        },
        insertCol() {
            this.$store.dispatch(COLS_INSERTCOL)
        },
        deleteCol() {
            this.$store.dispatch(COLS_DELETECOL)
        },
    }
}
</script>

