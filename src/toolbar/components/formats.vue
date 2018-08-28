<template>
    <div class="widget"
         @mousedown.stop="setFormat">
        <div class="widget-panel">
            <ul class="widget-menu">
                <li data-value="routine-G">
                    <span class="fui-cf-ico ico-routine  widget-ico"></span>
                    <span class="widget-content">
                            <div class="widget-pad">常规</div>
                        </span>
                </li>
                <li data-value="text-@">
                    <span class="fui-cf-ico ico-text  widget-ico"></span>
                    <span class="widget-content">
                            <div class="widget-pad">文本</div>
                        </span>
                </li>
                <li data-value="number-0">
                    <span class="fui-cf-ico ico-numeric widget-ico"></span>
                    <span class="widget-content">
                            <div class="widget-pad">数字 0</div>
                        </span>
                </li>
                <li data-value="number-0.0">
                    <span class="fui-cf-ico ico-numeric widget-ico"></span>
                    <span class="widget-content">
                            <div class="widget-pad">数字 0.0</div>
                        </span>
                </li>
                <li data-value="number-0.00">
                    <span class="fui-cf-ico ico-numeric widget-ico"></span>
                    <span class="widget-content">
                            <div class="widget-pad">数字 0.00</div>
                        </span>
                </li>
                <li data-value="number-0.000">
                    <span class="fui-cf-ico ico-numeric widget-ico"></span>
                    <span class="widget-content">
                            <div class="widget-pad">数字 0.000</div>
                        </span>
                </li>
                <li data-value="number-0.0000">
                    <span class="fui-cf-ico ico-numeric widget-ico"></span>
                    <span class="widget-content">
                            <div class="widget-pad">数字 0.0000</div>
                        </span>
                </li>
                <li data-value="date-yyyy/mm/dd">
                    <span class="fui-cf-ico ico-date widget-ico"></span>
                    <span class="widget-content">
                            <div class="widget-pad">日期 1999/01/01</div>
                        </span>
                </li>
                <li data-value="date-yyyy年mm月dd日">
                    <span class="fui-cf-ico ico-date widget-ico"></span>
                    <span class="widget-content">
                            <div class="widget-pad">日期 1999年01月01日</div>
                        </span>
                </li>
                <li data-value="percent-0.00%">
                    <span class="fui-cf-ico ico-percent widget-ico"></span>
                    <span class="widget-content">
                            <div class="widget-pad">百分比</div>
                        </span>
                </li>
                <li data-value="currency-$#,##0.00">
                    <span class="fui-cf-ico ico-currency widget-ico"></span>
                    <span class="widget-content">
                            <div class="widget-pad">货币 $</div>
                        </span>
                </li>
                <li data-value="currency-¥#,##0.00">
                    <span class="fui-cf-ico ico-currency widget-ico"></span>
                    <span class="widget-content">
                            <div class="widget-pad">货币 ¥</div>
                        </span>
                </li>
            </ul>
        </div>
    </div>
</template>
<script>
import {
    CELLS_FORMAT
} from '../../store/action-types'
export default {
    methods: {
        setFormat(e) {
            e.stopPropagation()
            let currentTarget = e.currentTarget
            let target = e.target
            let value
            value = this.getValue(target, currentTarget)
            if (value == null) {
                return
            }
            this.$store.dispatch(CELLS_FORMAT, {
                value
            })
        },
        getValue(elem, currentTarget) {
            let value = elem.dataset.value
            if (value == null) {
                if (elem === currentTarget) {
                    return
                } else {
                    return this.getValue(elem.parentNode, currentTarget)
                }
            } else {
                return value
            }
        }
    }
}
</script>
 <style scoped>
 </style>