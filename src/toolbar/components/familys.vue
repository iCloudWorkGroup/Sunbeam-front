<template>
<div class="widget"
     @mousedown.stop="">
    <div class="widget-panel"
         style="max-height:200px;">
        <ul class="font-list" style="min-width:160px">
            <li v-for="(family, idx) in familys"
                :key="idx"
                :data-value="family.en">
                <span :style="{ fontFamily: family.en}">{{ family.cn }}</span>
            </li>
        </ul>
    </div>
</div>
</template>
<script>
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
    }
}
</script>