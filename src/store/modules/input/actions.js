import * as actionTypes from '../../action-types'
// import {
//     parseExpress,
//     formatText,
//     isNum,
//     isDate
// } from '../../../tools/format'

export default {
    [actionTypes.EDIT_SHOW]({
        state,
        rootState,
        getters,
        commit
    }) {
        // 获取当前选中的单元格
        // 算出选中个的位置、宽高信息
        // 设置该模型覆盖其位置
        let activeCell = getters.activeCell()
        let propStruct = {}
        if (activeCell != null) {
            let content = activeCell.content
            let physicsBox = activeCell.physicsBox
            propStruct = {
                physical: {
                    left: physicsBox.left,
                    top: physicsBox.top,
                    width: physicsBox.width,
                    height: physicsBox.height,
                    texts: content.texts,
                    size: content.size,
                    family: content.family,
                    color: content.color,
                    weight: content.weight,
                    italic: content.italic
                },
                assist: {
                    colAlias: activeCell.occupy.col[0],
                    rowAlias: activeCell.occupy.row[0],
                    status: true
                }
            }
        } else {
            let select = getters.selectByType('SELECT')
            let colAlias = select.wholePosi.startColAlias
            let rowAlias = select.wholePosi.startRowAlias
            let colIndex = getters.colIndexByAlias(colAlias)
            let rowIndex = getters.rowIndexByAlias(rowAlias)
            let cols = getters.allCols
            let rows = getters.allRows
            let colItem = cols[colIndex]
            let rowItem = rows[rowIndex]
            propStruct = {
                physical: {
                    left: colItem.left,
                    top: rowItem.top,
                    width: colItem.width,
                    height: rowItem.height,
                },
                assist: {
                    colAlias,
                    rowAlias
                }
            }
        }
        commit('M_INPUT_UPDATE_PROPS', propStruct)
    },
    async A_INPUT_EDITDONE({
        getters,
        dispatch,
        commit
    }, texts) {
        let props = getters.inputProps
        let colAlias = props.assist.colAlias
        let rowAlias = props.assist.rowAlias
        if (colAlias == null || rowAlias == null) {
            return
        }
        await dispatch('A_CELLS_UPDATE', {
            propName: 'texts',
            propStruct: {
                content: {
                    texts,
                    displayTexts: texts
                }
            },
            coordinate: {
                startColAlias: colAlias,
                endColAlias: colAlias,
                startRowAlias: rowAlias,
                endRowAlias: rowAlias,
            }
        })

        // 恢复到初始状态
        commit('M_INPUT_RESET')
    }
}