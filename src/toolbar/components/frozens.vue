<template>
<div class="widget">
    <div class="widget-panel">
        <ul class="widget-menu frozenBox"
        @click="setFrozen">
            <li v-for="(frozen, idx) in frozens"
                v-show="frozen.status === undefined || frozen.status === frozenState">
                <span class="fui-cf-extend-ico ico-frozencustomized widget-ico"></span>
                <span class="widget-content">
                    <div class="widget-weight">{{frozen.title}}</div>
                    <div class="widget-desc">{{frozen.desc}}</div>
                </span>
            </li>
        </ul>
    </div>
</div>
</template>
<script>
export default {
    data() {
        return {
            frozens: [{
                title: '取消冻结窗口',
                desc: '解除所有行和列锁定，以滚动整个工作表。',
                status: true
            }, {
                title: '冻结拆分窗口',
                desc: '滚动工作表其余部分时，保持行和列可见(基于当前的选择)',
                status: false
            }, {
                title: '冻结首行',
                desc: '滚动工作表其余部分时，保持首行可见',
                status: false
            }, {
                title: '冻结首列',
                desc: '滚动工作表其余部分时，保持行列可见',
                status: false
            }]
        }
    },
    computed: {
        frozenState() {
            return this.$store.getters.isFrozen()
        }
    },
    methods: {
        setFrozen(e) {
            console.log(e)
            // let el = e.target
            // let structName = el.dataset.struct
            // let value = el.dataset.value
            // let propStruct = pathToStruct({
            //     structName,
            //     value
            // })
            // this.$store.dispatch('A_CELLS_UPDATE', {
            //     propName: 'family',
            //     propStruct
            // })
        }
    }
}
</script>