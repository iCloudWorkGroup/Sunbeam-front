<template>
<div class="widget">
    <div class="widget-panel">
        <ul class="widget-menu">
            <li v-for="(border,idx) in borders"
                :key="idx"
                :data-struct="'border.' + border.toward"
                :data-value="border.thick"
                @click="setBorder">
                <span class="fui-cf-ico ico-section-ico widget-ico"
                    :class="'ico-border' + border.toward"></span>
                <span class="widget-content">
                    <div>{{border.name}}</div>
                </span>
            </li>
        </ul>
    </div>
</div>
</template>
<script>
import {
    pathToStruct
} from '../../tools/format'
import extend from '../../util/extend'
export default {
    data() {
        return {
            borders: [{
                name: '下边框',
                toward: 'bottom',
                thick: 1
            }, {
                name: '上边框',
                toward: 'top',
                thick: 1
            }, {
                name: '左边框',
                toward: 'left',
                thick: 1
            }, {
                name: '右边框',
                toward: 'right',
                thick: 1
            }, {
                name: '无边框',
                toward: 'none',
                thick: 0
            }, {
                name: '全边框',
                toward: 'all',
                thick: 1
            }, {
                name: '粗下边框',
                toward: 'bottom',
                thick: 2
            }, {
                name: '粗上边框',
                toward: 'top',
                thick: 2
            }, {
                name: '粗左边框',
                toward: 'left',
                thick: 2
            }, {
                name: '粗右边框',
                toward: 'right',
                thick: 2
            }, {
                name: '粗全边框',
                toward: 'all',
                thick: 2
            }]
        }
    },
    methods: {
        setBorder(e) {
            let el = e.currentTarget
            let structName = null
            let value = null
            if (el == null ||
                (structName = el.dataset.struct) == null ||
                (value = parseInt(el.dataset.value, 10)) == null) {
                return
            }
            let propStruct = {}
            if (structName === 'border.all' ||
                structName === 'border.none') {
                let toward = ['top', 'right', 'bottom', 'left']
                for (let i = 0, len = toward.length; i < len; i++) {
                    let item = pathToStruct({
                        structName: 'border.' + toward[i],
                        value
                    })
                    propStruct = extend(propStruct, item)
                }
            } else {
                propStruct = pathToStruct({
                    structName,
                    value
                })
            }
            this.$store.dispatch('A_CELLS_UPDATE', {
                propName: structName,
                propStruct
            })
        }
    }
}
</script>