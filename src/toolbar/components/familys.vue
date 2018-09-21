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
    pathToStruct
} from '../../tools/format'
export default {
    data() {
        return {
            familys: [{
                en: 'microsoft Yahei',
                cn: 'microsoft Yahei'
            }, {
                en: 'SimSun',
                cn: 'SimSun'
            }, {
                en: 'SimHei',
                cn: 'SimHei'
            }, {
                en: 'Tahoma',
                cn: 'Tahoma'
            }, {
                en: 'Arial',
                cn: 'Arial'
            }, {
                en: 'KaiTi',
                cn: 'KaiTi'
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
            this.$store.dispatch('A_CELLS_UPDATE', {
                propName: 'family',
                propStruct
            })
        }
    }
}
</script>