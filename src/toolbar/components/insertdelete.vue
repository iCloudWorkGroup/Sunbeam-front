<template>
    <div class="widget">
        <div class="widget-panel"
             style="max-height:200px;">
            <ul class="widget-menu frozenBox" style="min-width:220px">
                <li @mousedown.stop="insertRow">
                    <span class=" widget-ico"></span>
                    <span class="widget-content">
                            <div class="widget-weight">插入工作表行</div>
                        </span>
                </li>
                <li @mousedown.stop="insertCol">
                    <span class="widget-ico"></span>
                    <span class="widget-content">
                            <div class="widget-weight">插入工作表列</div>
                        </span>
                </li>
                <li @mousedown.stop="deleteRow">
                    <span class="widget-ico"></span>
                    <span class="widget-content">
                            <div class="widget-weight">删除工作表行</div>
                        </span>
                </li>
                <li @mousedown.stop="delectCol">
                    <span class="widget-ico"></span>
                    <span class="widget-content">
                            <div class="widget-weight">删除工作表列</div>
                        </span>
                </li>
            </ul>
        </div>
    </div>
</template>
<script>
// import {
//     CELLS_UPDATE,
// } from '../../store/action-types'
// import {
//     pathToStruct
// } from '../../tools/format'
export default {
    data() {
        return {
        }
    },
    methods: {
    }
}
</script>

