<template>
    <div class="sheet">
        <table class="cui-grid" cellspacing="0" cellpadding="0" id="table">
            <tbody>
                <tr>
                    <td>
                        <div class="corner" ref="corner"></div>
                    </td>
                    <td v-if="colFrozen">
                        <col-head class="frozen-right-border"
                        :frozen-rule="leftRule" 
                        :col-head-width="leftRule.width" 
                        :scroll-left="0">
                        </col-head>
                    </td>
                    <td>
                        <col-head 
                        :frozen-rule="mainRule" 
                        :scroll-left="scrollLeft" 
                        :col-head-width="colHeadWidth">
                        </col-head>
                    </td>
                </tr>
                <tr v-if="rowFrozen">
                    <td>
                        <row-head class="frozen-bottom-border"
                        :frozen-rule="topRule" 
                        :row-head-height="topRule.height">
                        </row-head>
                    </td>
                    <td v-if="colFrozen">
                        <edit class="frozen-right-border frozen-bottom-border"
                        :frozen-rule="cornerRule" 
                        :edit-width="cornerRule.width" 
                        :edit-height="cornerRule.height"></edit>
                    </td>
                    <td>
                        <edit class="frozen-bottom-border"
                        :frozen-rule="topRule" 
                        :edit-height="topRule.height" 
                        :edit-width="colHeadWidth"
                        :scroll-left="scrollLeft">
                        </edit>
                    </td>
                </tr>
                <tr>
                    <td>
                        <row-head 
                        :frozen-rule="mainRule" 
                        :scroll-top="scrollTop" 
                        :row-head-height="rowHeadHeight">
                        </row-head>
                    </td>
                    <td v-if="colFrozen">
                        <edit class="frozen-right-border"
                        :frozen-rule="leftRule" 
                        :edit-height="rowHeadHeight" 
                        :edit-width="leftRule.width"
                        :scroll-top="scrollTop"></edit>
                    </td>
                    <td>
                        <edit class="scroll-box"
                        :frozen-rule="mainRule" 
                        :edit-width="editWidth" 
                        :edit-height="editHeight" 
                        @changeScrollTop="changeScrollTop"
                        @changeScrollLeft="changeScrollLeft" >
                        </edit>
                    </td>
                </tr>
            </tbody>
        </table>
        <!-- <input-box :scroll-left="scrollLeft" :scroll-top="scrollTop" ></input-box> -->
    </div>
</template>
<script type="text/javascript">
import config from '../config';
import getScrollbarWidth from '../util/scrollbarWidth';
import ColHead from './col-head.vue';
import RowHead from './row-head.vue';
import Edit from './edit.vue';
import InputBox from './input-box.vue';

export default {
    props: [
        'sheetWidth',
        'sheetHeight'
    ],
    data() {
        return {
            scrollbarWidth: getScrollbarWidth(),
            scrollTop: 0,
            scrollLeft: 0
        };
    },
    computed: {
        rowFrozen() {
            let frozenState = this.$store.getters.frozenState;
            return frozenState.rowFrozen;
        },
        colFrozen() {
            let frozenState = this.$store.getters.frozenState;
            return frozenState.colFrozen;
        },
        cornerRule() {
            let rules = this.$store.getters.frozenState.rules,
                rule;
            rules.forEach(function(item) {
                if (item.type === 'cornerRule') {
                    rule = item;
                }
            });
            return rule;
        },
        leftRule() {
            let rules = this.$store.getters.frozenState.rules,
                rule;
            rules.forEach(function(item) {
                if (item.type === 'leftRule') {
                    rule = item;
                }
            });
            return rule;
        },
        topRule() {
            let rules = this.$store.getters.frozenState.rules,
                rule;
            rules.forEach(function(item) {
                if (item.type === 'topRule') {
                    rule = item;
                }
            });
            return rule;
        },
        mainRule() {
            let rules = this.$store.getters.frozenState.rules,
                rule;
            rules.forEach(function(item) {
                if (item.type === 'mainRule') {
                    rule = item;
                }
            });
            return rule;
        },
        width() {
            return this.sheetWidth;
        },
        height() {
            return this.sheetHeight;
        },
        colHeadWidth() {
            let frozenState = this.$store.getters.frozenState,
                offsetLeft = 0,
                userViewLeft = 0;

            if (frozenState.colFrozen) {
                frozenState.rules.forEach(function(item) {
                    if (item.type === 'topRule') {
                        offsetLeft = item.offsetLeft;
                        userViewLeft = item.userViewLeft;
                    }
                });
            }

            return this.sheetWidth - config.cornerWidth -
                this.scrollbarWidth - offsetLeft +
                userViewLeft;
        },
        rowHeadHeight() {
            let frozenState = this.$store.getters.frozenState,
                offsetTop = 0,
                userViewTop = 0;

            if (frozenState.rowFrozen) {
                frozenState.rules.forEach(function(item) {
                    if (item.type === 'leftRule') {
                        offsetTop = item.offsetTop;
                        userViewTop = item.userViewTop;
                    }
                });
            }
            return this.sheetHeight - config.cornerHeight -
                this.scrollbarWidth - offsetTop +
                userViewTop;
        },
        editWidth() {
            let frozenState = this.$store.getters.frozenState,
                offsetLeft = 0,
                userViewLeft = 0;

            if (frozenState.colFrozen) {
                frozenState.rules.forEach(function(item) {
                    if (item.type === 'mainRule') {
                        offsetLeft = item.offsetLeft;
                        userViewLeft = item.userViewLeft;
                    }
                });
            }
            return this.sheetWidth - config.cornerWidth - offsetLeft +
                userViewLeft;
        },
        editHeight() {
            let frozenState = this.$store.getters.frozenState,
                offsetTop = 0,
                userViewTop = 0;

            if (frozenState.rowFrozen) {
                frozenState.rules.forEach(function(item) {
                    if (item.type === 'mainRule') {
                        offsetTop = item.offsetTop;
                        userViewTop = item.userViewTop;
                    }
                });
            }
            return this.sheetHeight - config.cornerHeight - offsetTop +
                userViewTop;
        }
    },
    components: {
        ColHead,
        RowHead,
        Edit,
        InputBox
    },
    methods: {
        changeScrollTop(val) {
            this.scrollTop = val;

        },
        changeScrollLeft(val) {
            this.scrollLeft = val;
        }
    },
};
</script>
<style type="text/css">
.sheet {
    position: absolute;
    top: 0;
    left: 0;
}

.corner {
    border-width: 0 1px 1px 0;
    border-color: #bfbfbf;
    border-style: solid;
    height: 19px;
    width: 36px;
}
</style>