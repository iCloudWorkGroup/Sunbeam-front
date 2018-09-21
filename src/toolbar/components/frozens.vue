<template>
<div class="widget">
    <div class="widget-panel">
        <ul class="widget-menu frozenBox">
            <li @click="setFrozen"
                v-for="(frozen, idx) in frozens"
                v-show="frozen.status === isFrozen"
                :data-value="frozen.value">
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
                status: true,
                value: 'OFF'
            }, {
                title: '冻结拆分窗口',
                desc: '滚动工作表其余部分时，保持行和列可见(基于当前的选择)',
                status: false,
                value: 'CUSTOM'
            }, {
                title: '冻结首行',
                desc: '滚动工作表其余部分时，保持首行可见',
                status: false,
                value: 'ROW'
            }, {
                title: '冻结首列',
                desc: '滚动工作表其余部分时，保持行列可见',
                status: false,
                value: 'COL'
            }]
        }
    },
    computed: {
        isFrozen() {
            return this.$store.getters.isFrozen()
        }
    },
    methods: {
        setFrozen(e) {
            let type = e.currentTarget.dataset.value
            if (type !== 'OFF') {
                this.$store.dispatch('A_SHEETS_FROZEN', type)
            } else {
                this.$store.dispatch('A_SHEETS_UNFROZEN')
            }
        }
    }
}
</script>