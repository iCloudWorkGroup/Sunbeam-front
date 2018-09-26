export default {
    physical: {
        left: -9999,
        top: -9999,
        width: 0,
        height: 0,
        maxWidth: 0,
        maxHeight: 0,
        texts: '',
        type: '',
        size: 11,
        family: 'SimSun',
        color: 'rgb(0, 0, 0)',
        weight: false,
        italic: false,
        underline: false,
        background: 'rgb(255, 255, 255)',
        edit: ''
    },
    /**
     * 用于确定当前对象的信息
     * @type {Object}
     */
    assist: {
        colAlias: null,
        rowAlias: null,
        /**
         * 用于区分当前的编辑状态
         * 1. 在textarea里直接输入内容，属于：显性编辑
         * 2. 在用户直接按enter或者直接粘贴，需要触发textarea的绑定事件
         * 这种情况属于：隐形编辑
         * status属性，用于确定当前是否属于那种状态
         *
         * false 代表显性编辑状态
         * true 代表隐形编辑状态
         * 两种编辑状态下，paste事件的逻辑不通
         * @type {Boolean}
         */
        status: false
    },
}