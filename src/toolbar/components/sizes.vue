<template>
<div class="widget">
    <div class="widget-panel"
         style="max-height:200px;">
        <ul class="font-list"
            @click="">
            <li v-for="(size, idx) in sizes"
                :key="idx"
                :data-value="size">
                <span :style="{ fontSize: size + 'pt' }">
                    {{ size }}
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
            sizes: [8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 26, 28, 36]
        }
    },
    methods: {
        setSize(e) {
            let el = e.target()
            if (el.dataset.value == null) {
                return
            }
        }
    }
}
</script>

