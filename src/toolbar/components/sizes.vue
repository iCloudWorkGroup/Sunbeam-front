<template>
<div class="widget">
    <div class="widget-panel"
         style="max-height:200px;">
        <ul class="font-list"
            @click="setSize">
            <li v-for="(size, idx) in sizes"
                :key="idx"
                :data-value="size"
                data-struct="content.size">
                <span :style="{ fontSize: size + 'pt' }"
                      :data-value="size"
                      data-struct="content.size">
                    {{ size }}
                </span>
            </li>
        </ul>
    </div>
</div>
</template>
<script>
import {
    CELLS_UPDATE,
} from '../../store/action-types'
import {
    pathToStruct
} from '../../tools/format'
export default {
    data() {
        return {
            sizes: [8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 26, 28, 36]
        }
    },
    methods: {
        setSize(e) {
            let el = e.target
            // if (el.tagName !== 'LI') {
            //     console.log(e)
            //     return
            // }
            let structName = el.dataset.struct
            let value = el.dataset.value
            let propStruct = pathToStruct({
                structName,
                value
            })
            this.$store.dispatch(CELLS_UPDATE, {
                propName: 'size',
                propStruct
            })
        }
    }
}
</script>

