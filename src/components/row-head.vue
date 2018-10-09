<template>
<div class="row-head-container"
     :style="{ height: viewHeight}">
    <div class="row-head-bg row-head-width"
         :style="{ height }">
        <row-head-panel
            :start="start"
            :over="over"
            :offsetTop="offsetTop" />
        <row-head-line
            v-for="item in selects"
            :key="item.alias"
            :row="item"
            :offsetTop="offsetTop"/>
    </div>
</div>
</template>
<script type="text/javascript">
import RowHeadPanel from './row-head-panel.vue'
import RowHeadLine from './row-head-line.vue'
// import cache from '../tools/cache'
import config from '../config'
import {
    unit
} from '../filters/unit'
import scrollbar from '../util/scrollbar'
export default {
    props: [
        'start',
        'over',
        'needSider',
        'scrollTop'
    ],
    computed: {
        offsetTop() {
            return this.$store.getters.offsetTop(this.start, this.over)
        },
        height() {
            let rowMap = this.$store.state.rows.map
            let startRow = rowMap.get(this.start)
            let overRow = rowMap.get(this.over)
            return unit(overRow.top + overRow.height - startRow.top)
        },
        viewHeight() {
            let rows = this.$store.state.rows
            let startRow = rows.map.get(this.start)
            let overRow = rows.map.get(this.over)
            let lastRow = rows.list[rows.list.length - 1]
            let limitHeight = 0
            console.log('row-head start')
            console.log(lastRow.alias)
            console.log(this.over, rows.map)
            console.log('row-head end')
            if (overRow.alias === lastRow.alias) {
                limitHeight = this.$store.getters.offsetHeight -
                    config.cornerHeight - config.sheetSider
                if (this.needSider) {
                    limitHeight -= scrollbar()
                }
            } else {
                limitHeight = overRow.top + overRow.height
            }
            return unit(limitHeight - startRow.top)
        },
        selects() {
            return this.$store.getters.allSelects
        }
    },
    components: {
        RowHeadPanel,
        RowHeadLine
    },
    watch: {
        scrollTop(value) {
            if (value != null) {
                this.$el.scrollTop = value
            }
        }
    }
}
</script>
<style>
    .row-head-container{
        z-index: 100;
        background: white;
    }
</style>