export default {
    colWidth: 71,
    rowHeight: 19,
    initRowNum: 100,
    initColNum: 26,
    maxRowNum: 10000,
    maxColNum: 52,
    /**
     * 页面左侧距离
     * @property {int} outerLeft
     */
    cornerWidth: 37,
    /**
     * 页面顶部距离
     * @property {int} outerTop
     */
    cornerHeight: 20,
    /**
     * 请求预加载区域宽度,单位px
     */
    prestrainWidth: 600,
    prestrainHeight: 300,
    /**
     * 请求区域缓存宽度
     * @type {Number}
     */
    scrollBufferWidth: 500,
    scrollBufferHeight: 200,
    /**
     * 工具栏宽度
     * @type {Number}
     */
    toolbarHeight: 130,
    operUrl: {
        'family': 'cell/font-family',
        'size': 'cell/font-size',
        'weight': 'cell/font-weight',
        'italic': 'cell/font-italic',
        'color': 'cell/font-color',
        'underline': 'cell/font-underline',
        'background': 'cell/bg',
        'alignRow': 'cell/align-landscape',
        'alignCol': 'cell/align-portrait',
        'frozen': 'sheet/frozen',
        'unfrozen': 'sheet/unfrozen',
        'rowadjust': 'row/adjust',
        'coladjust': 'col/adjust',
        'border': 'cell/border',
        'texts': 'cell/data-set',
        'merge': 'cell/merge',
        'split': 'cell/split',
        'adjustrow': 'row/adjust',
        'adjustcol': 'col/adjust',
        'deleterow': 'row/reduce',
        'deletecol': 'col/reduce',
        'insertrow': 'row/plus',
        'insertcol': 'col/plus',
        'hiderow': 'row/hide',
        'hidecol': 'col/hide',
        'showrow': 'row/show',
        'showcol': 'col/show',
        'addrowcol': 'sheet/expand',
        'format': 'cell/format',
        'undo': 'sheet/undo',
        'redo': 'sheet/redo',
        'outerpaste': 'sheet/paste',
        'cut': 'sheet/cut',
        'copy': 'sheet/copy'
    },
    operSendPropName: {
        'alignRow': 'align',
        'alignCol': 'align',
        'background': 'color',
        'texts': 'content'
    },
    historyRecordActions: {
    },
    historyUndo: {

    },
    /**
     * 请求地址根路径
     * @type {String}
     */
    // rootPath: 'http://localhost:8080/'
    rootPath: 'http://excel-inc.acmr.com.cn/'
}
