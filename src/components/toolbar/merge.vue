<template>
<div class="fui-body">
    <span class="fui-layout">
            <div class="fui-section fui-transverse" @click="setMerge">
                <div class="fui-transverse-model" :class="{active: mergeState}">
                    <span class="fui-cf-ico ico-section-ico ico-combincells"></span>
                    <span class="fui-cf-text">合并单元格</span>
                </div>
            </div>
    </span>
</div>
</template>
<script type="text/javascript">
<<<<<<< HEAD
	import {CELLS_HANDLEMERGE} from '../../store/action-types';

	export default {
		computed: {
			mergeState(){
				return this.$store.getters.getMergeState();
			}
		},
		methods: {
			setMerge() {
				this.$store.dispatch(CELLS_HANDLEMERGE);
			}
		}
	}
</script>
<style type="text/css">
	
</style>
=======
import {
    CELLS_MERGE
} from '../../store/action-types'
export default {
    computed: {
        mergeState() {
            return this.$store.getters.getMergeState()
        }
    },
    methods: {
        setMerge() {
            this.$store.dispatch(CELLS_MERGE)
        }
    }
}
</script>
>>>>>>> master
