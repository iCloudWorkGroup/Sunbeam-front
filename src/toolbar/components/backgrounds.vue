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
                                 :data-value="color.trans === true ? color.code : 'rgb(' + color.code + ')'"
                                 :data-struct="'content.background'"
                                 :style="{ backgroundColor: color.trans === true ? color.code : 'rgb(' + color.code + ')'}">
                            </div>
                        </span>
                    </td>
                </tr>
            </table>
        </div>
        <div class="other-color" @click="adjustColor">其他颜色...</div>
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
            colors: [{
                code: '192, 0, 0',
                name: '深红色'
            }, {
                code: 'transparent',
                name: '透明',
                trans: true
            }, {
                code: '255, 0, 0',
                name: '红色'
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
                code: '255, 255, 255',
                name: '白色'
            }, {
                code: '112, 48, 160',
                name: '紫色'
            }]
        }
    },
    methods: {
        adjustColor() {
            this.$store.commit('UPDATE_SHEET_POPUP', {
                show: true,
                title: '修改背景色',
                type: 'color',
            })
            this.$store.commit('M_SELECT_UPDATE_STATE', 'SELECT')
            let selects = this.$store.state.selects.list
            let destroyDataSource = {}
            selects.forEach((item, index) => {
                if (item.type === 'DATASOURCE') {
                    destroyDataSource = item
                }
            })
            this.$store.dispatch('SELECTS_DELETE', {
                select: destroyDataSource
            })
        },
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
            this.$store.dispatch('A_CELLS_UPDATE', {
                propName: 'background',
                propStruct
            })
        }
    }
}
</script>