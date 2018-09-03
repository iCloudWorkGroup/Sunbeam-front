import Vue from 'vue'
Vue.directive('focus', {
    update: function(el) {
        el.focus()
    }
})