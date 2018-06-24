export default function() {
    let virtualEl
    let scrollNone
    let scrollExist

    virtualEl = document.createElement('div')
    virtualEl.style.cssText =
        'width:50px;height:50px;overflow: hidden;position: absolute;top: -200;left: -200;'
    virtualEl.innerHTML = '<div style="height:1000px;">'
    document.body.appendChild(virtualEl)

    scrollNone = getWidth()
    virtualEl.style.overflowY = 'auto'
    scrollExist = getWidth()

    document.body.removeChild(virtualEl)

    function getWidth() {
        return parseInt(virtualEl.clientWidth, 0)
    }
    return (scrollNone - scrollExist)
}