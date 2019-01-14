<template>
    <div class="widget">
        <div class="widget-panel"
             style="max-height:200px;">
            <ul class="widget-menu frozenBox" style="min-width:220px">
                <li @click="insertRow" id="insertRow" v-show="opr === 'insert'">
                    <span class=" widget-ico"></span>
                    <span class="widget-content">
                            <div class="widget-weight">插入行</div>
                    </span>
                </li>
                <li @click="insertCol" id="insertCol" v-show="opr === 'insert'">
                    <span class="widget-ico"></span>
                    <span class="widget-content">
                            <div class="widget-weight">插入列</div>
                        </span>
                </li>
                <li @click="deleteRow" id="deleteRow" v-show="opr === 'delete'">
                    <span class="widget-ico"></span>
                    <span class="widget-content">
                            <div class="widget-weight">删除行</div>
                        </span>
                </li>
                <li @click="deleteCol" id="deleteCol" v-show="opr === 'delete'">
                    <span class="widget-ico"></span>
                    <span class="widget-content">
                            <div class="widget-weight">删除列</div>
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
    computed: {
        deleteRowFlag() {
            return this.$store.state.oprclick.deleteRowFlag
        },
        deleteColFlag() {
            return this.$store.state.oprclick.deleteColFlag
        },
        insertRowFlag() {
            return this.$store.state.oprclick.insertRowFlag
        },
        insertColFlag() {
            return this.$store.state.oprclick.insertColFlag
        },
    },
    methods: {
        insertRow() {
            if (!this.insertRowFlag) {
                return
            }
            this.$store.dispatch(ROWS_INSERTROW)
        },
        deleteRow() {
            if (!this.deleteRowFlag) {
                return
            }
            this.$store.dispatch(ROWS_DELETEROW)
        },
        insertCol() {
            if (!this.insertColFlag) {
                return
            }
            this.$store.dispatch(COLS_INSERTCOL)
        },
        deleteCol() {
            if (!this.deleteColFlag) {
                return
            }
            this.$store.dispatch(COLS_DELETECOL)
        },
    }
}
</script>