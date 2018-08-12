<template>
<div class="col-head-container"
     :style="{width: viewWidth}">
    <div class="col-head-bg col-head-height"
         :style="{width: width}">
        <col-head-panel
            :start="start"
            :over="over"
            :offsetLeft="offsetLeft"/>
        <col-head-line
            v-for="item in selects"
            key="item.alias"
            :col="item"
            :offsetLeft="offsetLeft"
            />
    </div>
</div>
</template>
<script type="text/javascript">
import ColHeadPanel from './col-head-panel.vue'
import ColHeadLine from './col-head-line.vue'
import cache from '../tools/cache'
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
        'scrollLeft'
    ],
    computed: {
        offsetLeft() {
            return this.$store.getters.offsetLeft(this.start, this.over)
        },
        width() {
            let colMap = this.$store.state.cols.map
            let startCol = colMap.get(this.start)
            let overCol = colMap.get(this.over)
            return unit(overCol.left + overCol.width - startCol.left)
        },
        viewWidth() {
            let cols = this.$store.state.cols
            let startCol = cols.map.get(this.start)
            let overCol = cols.map.get(this.over)
            let lastCol = cols.list[cols.list.length - 1]
            let limitWidth = 0
            if (overCol.alias === lastCol.alias) {
                limitWidth = cache.rootEl.offsetWidth - config.cornerWidth
                if (this.needSider) {
                    limitWidth -= scrollbar()
                }
            } else {
                limitWidth = overCol.left + overCol.width
            }
            return unit(limitWidth - startCol.left)
        },
        selects() {
            return this.$store.getters.allSelects
        }
    },
    components: {
        ColHeadPanel,
        ColHeadLine
    },
    watch: {
        scrollLeft(value) {
            if (value != null) {
                this.$el.scrollLeft = value
            }
        }
    },
    mounted() {
        if (this.scrollLeft != null) {
            this.$el.scrollLeft = this.scrollLeft
        }
    }
}
</script>
<style>
.col-head-container {
    z-index: 100;
    background: white;
}
</style>