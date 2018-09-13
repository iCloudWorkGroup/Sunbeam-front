export function getTextHeight(text, fontSize, fontFamily, width) {
    let el
    el = document.createElement('div')
    el.setAttribute('id', 'getHeight')
    el.style.cssText = `font-size:${fontSize}pt;
            font-family:${fontFamily};width:${width}px;
            word-break:break-word;position:absolute;
            visibility:hidden;white-space:pre-line;`
    el.innerText = text
    document.body.appendChild(el)
    let style
    if (window.getComputedStyle) {
        style = window.getComputedStyle(el)
    } else {
        style = el.currentStyle
    }
    let result = style.height
    result = parseInt(result.substring(0, result.length - 2), 10)
    // 移除dom
    let dom = document.getElementById('getHeight')
    dom.parentNode.removeChild(dom)
    return result
}