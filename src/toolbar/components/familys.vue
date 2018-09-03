<template>
<div class="widget">
    <div class="widget-panel"
         style="max-height:200px;">
        <ul class="font-list"
            style="min-width:160px"
            @click="setFamily">
            <li v-for="(family, idx) in familys"
                :key="idx"
                :data-value="family.en"
                data-struct="content.family">
                <span :style="{ fontFamily: family.en}"
                      :data-value="family.en"
                      data-struct="content.family">{{ family.cn }}</span>
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
            familys: [{
                en: 'microsoft Yahei',
                cn: '微软雅黑'
            }, {
                en: 'SimSun',
                cn: '宋体'
            }, {
                en: 'SimHei',
                cn: '黑体'
            }, {
                en: 'Tahoma',
                cn: 'Tahoma'
            }, {
                en: 'Arial',
                cn: 'Arial'
            }, {
                en: 'KaiTi',
                cn: '楷体'
            }]
        }
    },
    methods: {
        setFamily(e) {
            let el = e.target
            // if (el.tagName !== 'LI') {
            //     return
            // }
            let structName = el.dataset.struct
            let value = el.dataset.value
            let propStruct = pathToStruct({
                structName,
                value
            })
            this.$store.dispatch(CELLS_UPDATE, {
                propName: 'family',
                propStruct
            })
        }
    }
}
</script>