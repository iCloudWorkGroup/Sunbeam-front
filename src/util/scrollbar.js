export default (function() {
    let width
    return function() {
        if (width != null) {
            return width
        }
        let virtualEl = document.createElement('div')
        virtualEl.style.cssText =
            'width:50px;height:50px;overflow: hidden;position: absolute;top: -200;left: -200;'
        virtualEl.innerHTML = '<div style="height:1000px;">'
        document.body.appendChild(virtualEl)

        let scrollNone = getWidth()
        virtualEl.style.overflowY = 'auto'
        let scrollExist = getWidth()
        document.body.removeChild(virtualEl)

        function getWidth() {
            return parseInt(virtualEl.clientWidth, 0)
        }
        width = scrollNone - scrollExist
        return width
    }
})()