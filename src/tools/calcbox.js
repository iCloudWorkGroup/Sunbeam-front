export function getTextHeight(text, fontSize, fontFamily, width) {
    let el
    el = document.createElement('div')
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
    el.style.cssText = `display:none;`
    result = parseInt(result.substring(0, result.length - 2), 10)
    return result
}