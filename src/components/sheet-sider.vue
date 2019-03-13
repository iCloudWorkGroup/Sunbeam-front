<template>
    <div class="sheet-layout">
        <div class="sheet-body">
            <!--<div class="sheet-cf-box glyphicons glyphicon-plus"></div>-->
            <!--<div class="sheet-cf-box active glyphicons glyphicon-th-list"></div>-->
            <div class="sheet-cf-list">
                <ul class="sheet-list">
                    <li class="active"><span>{{sheetName}}</span></li>
                </ul>
            </div>
        </div>
    </div>
</template>
<script type="text/javascript">
export default {
    computed: {
        sheetName() {
            return this.$store.state.sheets.list[0].name
        }
    }
}
</script>