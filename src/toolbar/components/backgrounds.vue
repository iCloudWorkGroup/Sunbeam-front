<template>
<div class="widget">
    <div class="widget-panel">
        <div style="padding:5px 3px;">
            <table cellspacing="0" cellpadding="0">
                <tr @click="setBackground">
                    <td v-for="(color, idx) in colors"
                        :key="idx">
                        <span class="color-box"
                            :title="color.name">
                            <div class="color-body"
                                 :data-value="'rgb(' + color.code + ')'"
                                 :data-struct="'content.background'"
                                 :style="'background-color: rgb(' + color.code +');'">
                            </div>
                        </span>
                    </td>
                </tr>
            </table>
        </div>
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
            colors: [{
                code: '192, 0, 0',
                name: '深红色'
            }, {
                code: '255, 0, 0',
                name: '红色'
            }, {
                code: '255, 255, 255',
                name: '白色'
            }, {
                code: '255, 192, 0',
                name: '橙色'
            }, {
                code: '0, 0, 0',
                name: '黑色'
            }, {
                code: '255, 255, 0',
                name: '黄色'
            }, {
                code: '146, 208, 80',
                name: '浅绿色'
            }, {
                code: '0, 176, 240',
                name: '浅蓝色'
            }, {
                code: '0, 112, 192',
                name: '蓝色'
            }, {
                code: '0, 32, 96',
                name: '深蓝色'
            }, {
                code: '112, 48, 160',
                name: '紫色'
            }]
        }
    },
    methods: {
        setBackground(e) {
            let el = e.target
            if (el.className !== 'color-body') {
                return
            }
            let structName = el.dataset.struct
            let value = el.dataset.value
            let propStruct = pathToStruct({
                structName,
                value
            })
            this.$store.dispatch(CELLS_UPDATE, {
                propName: 'background',
                propStruct
            })
        }
    }
}
</script>