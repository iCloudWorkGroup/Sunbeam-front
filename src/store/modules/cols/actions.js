import Vue from 'vue'
import * as actionTypes from '../../action-types'
import * as mutationTypes from '../../mutation-types'
import {
    getColDisplayName
<<<<<<< HEAD
} from '../../../util/displayname';
import generator from '../../../tools/generator';
import extend from '../../../util/extend';
import config from '../../../config';
import cache from '../../../tools/cache';
import template from './template';
import { SELECT } from '../../../tools/constant';
import send from '../../../util/send';
=======
} from '../../../util/displayname'
import generator from '../../../tools/generator'
import extend from '../../../util/extend'
import config from '../../../config'
import cache from '../../../tools/cache'
import template from './template'
import {
    SELECT
} from '../../../tools/constant'
>>>>>>> master

export default {
    [actionTypes.COLS_ADDCOLS]({
        state,
        rootState,
        commit
    }, cols) {
        let temp = []
        for (let i = 0, len = cols.length; i < len; i++) {
            temp.push(extend({}, template, cols[i]))
        }
        commit(mutationTypes.ADD_COL, {
            cols: temp,
            currentSheet: rootState.currentSheet
        })
    },
    [actionTypes.COLS_RESTORECOLS]({
        state,
        rootState,
        commit
    }, cols) {
        let map = state[rootState.currentSheet].map
        let temp = []

        for (let i = 0, len = cols.length; i < len; i++) {
            if (!map.get(cols[i].alias)) {
                temp.push(extend({}, template, cols[i]))
            }
        }
        commit(mutationTypes.INSERT_COL, {
            cols: temp,
            currentSheet: rootState.currentSheet
        })
    },
    [actionTypes.COLS_ADJUSTWIDTH]({
        dispatch,
        getters
    }, {
        index,
        width
    }) {
<<<<<<< HEAD
        let cols = getters.colList,
            col = cols[index];

        send({
            url: config.operUrl['adjustcol'],
            data: JSON.stringify({
                col: col.sort,
                offset: width
            }),
        });
        dispatch(actionTypes.COLS_EXECADJUSTWIDTH, {
            sort: col.sort,
            value: width
        });
    },
    [actionTypes.COLS_EXECADJUSTWIDTH]({
        state,
        rootState,
        commit,
        getters
    }, {
        sort,
        value
    }){

    let currentSheet = rootState.currentSheet,
        index = getters.getColIndexBySort(sort),
        cols = getters.colList,
        col = cols[index],
        colAlias = col.alias,
        adjustWidth = value - col.width,
        updateCellInfo = [];

    let cellList = getters.getCellsByVertical({
=======
        let cols = getters.colList
        let col = cols[index]
        let adjustWidth = width - col.width
        let updateCellInfo = []
        let colAlias = col.alias

        let cellList = getters.getCellsByVertical({
>>>>>>> master
            startColIndex: index,
            startRowIndex: 0,
            endColIndex: 'MAX',
            endRowIndex: 'MAX',
        })

        cellList.forEach(function(cell) {
<<<<<<< HEAD
            let occupy = cell.occupy.col,
                temp;

            if ((temp = occupy.indexOf(colAlias)) !== -1) {
=======
            let occupy = cell.occupy.row

            if (occupy.indexOf(colAlias) !== -1) {
>>>>>>> master
                updateCellInfo.push({
                    cell,
                    props: {
                        physicsBox: {
                            width: cell.physicsBox.width +
                                adjustWidth
                        }
                    }
                })

            } else {
                updateCellInfo.push({
                    cell,
                    props: {
                        physicsBox: {
                            left: cell.physicsBox.left +
                                adjustWidth
                        }
                    }
                })
            }
        })
        commit(mutationTypes.UPDATE_CELL, updateCellInfo)

        let updateSelectInfo = []
        let colLeft = col.left
        let selects = getters.selectList

        selects.forEach(function(select) {
            let wholePosi = select.wholePosi
            let startPosi
            let endPosi

            startPosi = getters.getColByAlias(wholePosi.startColAlias).left
            endPosi = getters.getColByAlias(wholePosi.endColAlias).left
            if (startPosi === colLeft) {
                updateSelectInfo.push({
                    select,
                    props: {
                        physicsBox: {
                            width: select.physicsBox.width +
                                adjustWidth
                        }
                    }
                })
            } else if (startPosi > colLeft) {
                updateSelectInfo.push({
                    select,
                    props: {
                        physicsBox: {
                            left: select.physicsBox.left +
                                adjustWidth
                        }
                    }
                })

            } else if (endPosi > colLeft) {
                updateSelectInfo.push({
                    select,
                    props: {
                        physicsBox: {
                            width: select.physicsBox.width +
                                adjustWidth
                        }
                    }
                })
            }
        })

        commit(mutationTypes.UPDATE_SELECT, updateSelectInfo)

        let updateColInfo = []
        for (let i = index, len = cols.length; i < len; i++) {
            let col = cols[i]
            if (i === index) {
                updateColInfo.push({
                    col,
                    props: {
                        width: value
                    }
                })
            } else {
                updateColInfo.push({
                    col,
                    props: {
                        left: col.left + adjustWidth,
                    }
                })
            }

        }

        if (cache.localColPosi > 0) {
            cache.localColPosi += adjustWidth
        }
        commit(mutationTypes.UPDATE_COL, updateColInfo)
    },
    [actionTypes.COLS_DELETECOL]({
        getters,
<<<<<<< HEAD
        dispatch,
    }, index) {
        let selects = getters.selectList;
=======
        dispatch
    }, indexArgs) {
        let index = indexArgs
        let selects = getters.selectList
        let currentSheet = rootState.currentSheet
>>>>>>> master

        if (index === 'undefined') {
            let select
            for (let i = 0, len = selects.length; i < len; i++) {
                if (selects[i].type === SELECT) {
                    select = selects[i]
                    break
                }
            }
<<<<<<< HEAD
            if (select.wholePosi.endColAlias === 'MAX') {
                return;
            }
            index = getters.getColIndexByAlias(select.wholePosi.startColAlias);
        }


        let cols = getters.colList,
            col = cols[index];
=======
            index = getters.getColIndexByAlias(select.wholePosi.startColAlias)
        }

        let cols = getters.colList
        let col = cols[index]
        let deleteCells = []
        let updateCellInfo = []
        let colWidth = col.width
        let colAlias = col.alias
>>>>>>> master

        send({
            url: config.operUrl['deletecol'],
            data: JSON.stringify({
                col: col.sort,
            }),
        });
        dispatch(actionTypes.COLS_EXECDELETECOL, col.sort);
    },
    [actionTypes.COLS_EXECDELETECOL]({
        rootState,
        commit,
        getters,
        dispatch
    }, sort) {
        let currentSheet = rootState.currentSheet;
        let index = getters.getColIndexBySort(sort);
        let cellList = getters.getCellsByVertical({
            startColIndex: index,
            startRowIndex: 0,
            endColIndex: 'MAX',
            endRowIndex: 'MAX',
        })

        let cols = getters.colList;
        let deleteCol = cols[index];
        let deleteColAlias = deleteCol.alias;
        let deleteColWidth = deleteCol.width;
        let updateOccupys = [];
        let updateCellInfo = [];
        cellList.forEach(function(cell) {
<<<<<<< HEAD
            let occupyCol = cell.occupy.col;
            let aliasIndex;
            if ((aliasIndex = occupyCol.indexOf(deleteColAlias)) !== -1) {             
                cell.occupy.row.forEach(alias => {
                    updateOccupys.push({
                        colAlias: deleteColAlias,
                        rowAlias: alias,
                        type: 'cellIndex',
                        value: null
                    });
                });
                if (occupyCol.length !== 1) {
                    let newOccupyCol = [...occupyCol];
                    newOccupyCol.splice(aliasIndex, 1);
=======
            let occupy = cell.occupy.col
            let temp

            if ((temp = occupy.indexOf(colAlias)) !== -1) {
                if (occupy.length === 1) {
                    deleteCells.push(cell)
                } else {
                    deleteCells.push({
                        col: [colAlias],
                        row: cell.occupy.row
                    })
>>>>>>> master
                    updateCellInfo.push({
                        cell,
                        props: {
                            occupy: {
                                col: newOccupyCol
                            },
                            physicsBox: {
<<<<<<< HEAD
                                width: cell.physicsBox.width - deleteColWidth - 1
=======
                                width: cell.physicsBox.width -
                                    colWidth - 1
>>>>>>> master
                            }
                        }
                    })
                }
            } else {
<<<<<<< HEAD
=======
                let newOccupy = occupy.slice(0)
                newOccupy.splice(temp, 1)

>>>>>>> master
                updateCellInfo.push({
                    cell,
                    props: {
                        physicsBox: {
<<<<<<< HEAD
                            left: cell.physicsBox.left - deleteColWidth - 1
=======
                            left: cell.physicsBox.left -
                                colWidth - 1
                        },
                        occupy: {
                            col: newOccupy
>>>>>>> master
                        }
                    }
                })
            }
<<<<<<< HEAD
        });
        updateOccupys.forEach(info => {
            commit(mutationTypes.UPDATE_POINTINFO, {
                currentSheet,
                info
            });
        });
        commit(mutationTypes.UPDATE_CELL, updateCellInfo);

        let updateSelectInfo = [];
        let selects = getters.selectList;
        selects.forEach(function(select) {
            let wholePosi = select.wholePosi;
            let startIndex = getters.getColIndexByAlias(wholePosi.startColAlias);
            let endIndex = getters.getColIndexByAlias(wholePosi.endColAlias);

            if (startIndex === index) {
                if (startIndex === endIndex) {
                    if (index === cols.length - 1) {
                        updateSelectInfo.push({
                            select,
                            props: {
                                physicsBox: {
                                    width: cols[index - 1].width
                                },
                                wholePosi: {
                                    startColAlias: cols[index - 1].alias,
                                    endColAlias: cols[index - 1].alias
                                }
                            }
                        });
                        commit(mutationTypes.ACTIVE_COL, {
                            currentSheet,
                            startIndex: index - 1
                        });
                    } else {
                        updateSelectInfo.push({
                            select,
                            props: {
                                physicsBox: {
                                    width: cols[index + 1].width
                                },
                                wholePosi: {
                                    startColAlias: cols[index + 1].alias,
                                    endColAlias: cols[index + 1].alias
                                }
                            }
                        });
                        commit(mutationTypes.ACTIVE_COL, {
                            currentSheet,
                            startIndex: index + 1
                        });
                    }
=======
        })

        commit(mutationTypes.DELETE_CELL_POINTINFO, {
            currentSheet,
            cells: deleteCells
        })
        commit(mutationTypes.UPDATE_CELL, updateCellInfo)

        let updateSelectInfo = []
        let colLeft = col.left

        selects.forEach(function(select) {
            let wholePosi = select.wholePosi
            let startPosi = getters.getColByAlias(wholePosi.startColAlias)
                .left
            let endPosi = getters.getColByAlias(wholePosi.endColAlias).left


            if (startPosi >= colLeft) {
                if (startPosi === endPosi) {
                    updateSelectInfo.push({
                        select,
                        props: {
                            physicsBox: {
                                width: cols[index + 1].width
                            },
                            wholePosi: {
                                startColAlias: cols[index + 1].alias,
                                endColAlias: cols[index + 1].alias
                            }
                        }
                    })
                    commit(mutationTypes.ACTIVE_COL, {
                        currentSheet,
                        startIndex: index + 1
                    })
>>>>>>> master
                } else {
                    updateSelectInfo.push({
                        select,
                        props: {
                            physicsBox: {
<<<<<<< HEAD
                                width: select.physicsBox.width - cols[index + 1].width - 1
=======
                                width: select.physicsBox.width -
                                    colWidth - 1
>>>>>>> master
                            },
                            wholePosi: {
                                startColAlias: cols[index + 1].alias
                            }
                        }
                    })
                }
            } else if (startIndex > index) {
                updateSelectInfo.push({
                    select,
                    props: {
                        physicsBox: {
<<<<<<< HEAD
                            left: select.physicsBox.left - deleteColWidth - 1
                        }
                    }
                });
            } else if (endIndex === index) {
                updateSelectInfo.push({
                    select,
                    props: {
                        physicsBox: {
                            width: select.physicsBox.width - cols[index + 1].width - 1
                        },
                        wholePosi: {
                            endColAlias: cols[index - 1].alias
                        }
                    }
                });
            } else if (endIndex < index) {
                updateSelectInfo.push({
                    select,
                    props: {
                        physicsBox: {
                            width: select.physicsBox.width - cols[index + 1].width - 1
=======
                            left: select.physicsBox.left +
                                colWidth + 1
>>>>>>> master
                        }
                    }
                })
            }
        })

        commit(mutationTypes.UPDATE_SELECT, updateSelectInfo)

<<<<<<< HEAD
        let updateColInfo = [];
        for (let i = index + 1, len = cols.length; i < len; i++) {
            let col = cols[i];
=======
        let updateColInfo = []
        for (let i = index, len = cols.length; i < len; i++) {
            let col = cols[i]
>>>>>>> master
            updateColInfo.push({
                col,
                props: {
                    left: col.left - deleteColWidth - 1,
                    sort: col.sort - 1,
                    displayName: getColDisplayName(col.sort - 1)
                }
            })
        }

        if (cache.localColPosi > 0) {
<<<<<<< HEAD
            cache.localColPosi -= deleteColWidth + 1;
        }
        commit(mutationTypes.UPDATE_COL, updateColInfo);

        let self = this;
        Vue.nextTick(function() {
            let colRecord = cache.colRecord,
                temp;
            if ((temp = colRecord.indexOf(deleteColAlias)) !== -1) {
                _updateLoadInfo(temp, getters);
                dispatch(actionTypes.OCCUPY_DELETECOL, deleteColAlias);
                colRecord.splice(temp, 1);
=======
            cache.localColPosi -= colWidth
        }
        commit(mutationTypes.UPDATE_COL, updateColInfo)
        Vue.nextTick(function() {
            let colRecord = cache.colRecord
            let temp
            if ((temp = colRecord.indexOf(colAlias)) !== -1) {
                _updateLoadInfo(temp, getters)
                dispatch(actionTypes.OCCUPY_DELETECOL, colAlias)
                colRecord.splice(temp, 1)
>>>>>>> master
            }
            commit(mutationTypes.DELETE_COL, {
                currentSheet,
                index
            })
        })

        function _updateLoadInfo(index, getters) {
            let regionLoadRecord = cache.regionRecord
            let colLoadRecord = cache.colRecord
            let rowLoadRecord = cache.rowRecord
            let cols = getters.colList
            let alias = colLoadRecord[index]
            let colIndex = getters.getColIndexByAlias(alias)
            let previousAlias
            let nextAlias
            let replaceAlias

            if (index === 0) {
                replaceAlias = cols[colIndex + 1].alias
                nextAlias = colLoadRecord[1]
            } else if (index === colLoadRecord.length - 1) {
                replaceAlias = cols[colIndex - 1].alias
                previousAlias = colLoadRecord[index - 1]
            } else {
                replaceAlias = cols[colIndex - 1].alias
                previousAlias = colLoadRecord[index - 1]
                nextAlias = colLoadRecord[index + 1]
            }
            if (nextAlias !== 'undefined' && replaceAlias !== nextAlias) {
                for (let i = 0, len = rowLoadRecord.length - 1; i < len; i++) {
                    let sign = alias + '_' + nextAlias + '_' +
                        rowLoadRecord[i] + '_' + rowLoadRecord[i + 1]
                    if (regionLoadRecord.get(sign)) {
                        regionLoadRecord.delete(sign)

                        sign = replaceAlias + '_' + nextAlias + '_' +
                            rowLoadRecord[i] + '_' + rowLoadRecord[i + 1]
                        regionLoadRecord.set(sign, true)
                    }
                }
            }
            if (previousAlias !== 'undefined') {
                for (let i = 0, len = rowLoadRecord.length - 1; i < len; i++) {
                    let sign = previousAlias + '_' + alias + '_' +
                        rowLoadRecord[i] + '_' + rowLoadRecord[i + 1]
                    if (regionLoadRecord.get(sign)) {
                        regionLoadRecord.delete(sign)

                        sign = previousAlias + '_' + replaceAlias + '_' +
                            rowLoadRecord[i] + '_' + rowLoadRecord[i + 1]
                        regionLoadRecord.set(sign, true)
                    }
                }
            }
        }
    },
    [actionTypes.COLS_HIDE]({
        getters,
        dispatch
<<<<<<< HEAD
    }, index) {
=======
    }, indexArgs) {
        let index = indexArgs
        let selects = getters.selectList
        let currentSheet = rootState.currentSheet

>>>>>>> master
        if (getters.visibleColList.length < 2) {
            return
        }
<<<<<<< HEAD
        if (index === undefined) {
            let selects = getters.selectList;
            let select;
=======
        if (index === 'undefined') {
            let select
>>>>>>> master
            for (let i = 0, len = selects.length; i < len; i++) {
                if (selects[i].type === SELECT) {
                    select = selects[i]
                    break
                }
            }
<<<<<<< HEAD
            if (select.wholePosi.endColAlias === 'MAX') {
                return;
            }
            index = getters.getColIndexByAlias(select.wholePosi.startColAlias);
        }
        let cols = getters.colList;
        let col = cols[index];

        send({
            url: config.operUrl['hidecol'],
            data: JSON.stringify({
                col: col.sort
            }),
        });
        dispatch(actionTypes.COLS_EXECHIDE, col.sort);
    },
    [actionTypes.COLS_EXECHIDE]({
        state,
        rootState,
        commit,
        getters,
        dispatch
    }, sort){
            let cols = getters.colList;
            let index = getters.getColIndexBySort(sort);
            let col = cols[index],
            visibleCols = getters.visibleColList,
            updateCellInfo = [],
            colWidth = col.width,
            colAlias = col.alias;
=======
            index = getters.getColIndexByAlias(select.wholePosi.startColAlias)
        }

        let cols = getters.colList
        let visibleCols = getters.visibleColList
        let col = cols[index]
        let updateCellInfo = []
        let colWidth = col.width
        let colAlias = col.alias
>>>>>>> master

        let cellList = getters.getCellsByVertical({
            startColIndex: index,
            startRowIndex: 0,
            endColIndex: 'MAX',
            endRowIndex: 'MAX',
        })

        cellList.forEach(function(cell) {
            let occupy = cell.occupy.col

            if (occupy.indexOf(colAlias) !== -1) {
                updateCellInfo.push({
                    cell,
                    props: {
                        physicsBox: {
                            width: cell.physicsBox.width -
                                colWidth - 1
                        }
                    }
                })
            } else {
                updateCellInfo.push({
                    cell,
                    props: {
                        physicsBox: {
                            left: cell.physicsBox.left -
                                colWidth - 1
                        }
                    }
                })
            }
        })
        commit(mutationTypes.UPDATE_CELL, updateCellInfo)


<<<<<<< HEAD
        let updateSelectInfo = [];
        let colLeft = col.left;
        let selects = getters.selectList;
        let currentSheet = rootState.currentSheet;
=======
        let updateSelectInfo = []
        let colLeft = col.left

>>>>>>> master
        selects.forEach(function(select) {
            let wholePosi = select.wholePosi
            let startSort
            let endSort
            let colSort = col.sort
            let endVisibleSort = visibleCols[visibleCols.length - 1].sort

            startSort = getters.getColByAlias(wholePosi.startColAlias).sort
            endSort = getters.getColByAlias(wholePosi.endColAlias).sort

            if (startSort >= colSort) {
                if (startSort === endVisibleSort) {
                    updateSelectInfo.push({
                        select,
                        props: {
                            physicsBox: {
                                left: cols[index - 1].left,
                                width: cols[index - 1].width
                            },
                            wholePosi: {
                                startColAlias: cols[index - 1].alias,
                                endColAlias: cols[index - 1].alias
                            }
                        }
                    })
                    commit(mutationTypes.ACTIVE_COL, {
                        currentSheet,
                        startIndex: index - 1
                    })
                } else if (startSort === endSort) {
                    updateSelectInfo.push({
                        select,
                        props: {
                            physicsBox: {
                                width: cols[index + 1].width
                            },
                            wholePosi: {
                                startColAlias: cols[index + 1].alias,
                                endColAlias: cols[index + 1].alias
                            }
                        }
                    })
                    commit(mutationTypes.ACTIVE_COL, {
                        currentSheet,
                        startIndex: index + 1
                    })
                } else {
                    updateSelectInfo.push({
                        select,
                        props: {
                            physicsBox: {
                                width: select.physicsBox.width -
                                    colWidth - 1
                            }
                        }
                    })
                }

            } else if (endSort > colLeft) {
                updateSelectInfo.push({
                    select,
                    props: {
                        physicsBox: {
                            left: select.physicsBox.left -
                                colWidth - 1
                        }
                    }
                })
            }
        })

        commit(mutationTypes.UPDATE_SELECT, updateSelectInfo)

        let updateColInfo = [{
            col: cols[index],
            props: {
                hidden: true,
                active: false
            }
        }]

        if (index > 0) {
            updateColInfo.push({
                col: cols[index - 1],
                props: {
                    rightAjacentHide: true
                }
            })
        }
        for (let i = index + 1, len = cols.length; i < len; i++) {
            let col = cols[i]
            updateColInfo.push({
                col,
                props: {
                    left: col.left - colWidth - 1
                }
            })
        }
<<<<<<< HEAD
        commit(mutationTypes.UPDATE_COL, updateColInfo);

        if (cache.localColPosi > 0) {
            cache.localColPosi -= colWidth + 1;
        }
=======
        commit(mutationTypes.UPDATE_COL, updateColInfo)
>>>>>>> master
    },
    [actionTypes.COLS_CANCELHIDE]({
        getters,
        dispatch
<<<<<<< HEAD
    }, index) {
        let visibleCols = getters.visibleColList;
        let cols = getters.colList;
        if (index === undefined) {
            let selects = getters.selectList;  
            let select,
                startIndex,
                endIndex,
                visibleStartCol = visibleCols[0],
                visibleEndCol = visibleCols[visibleCols.length - 1];
=======
    }, indexArgs) {
        let index = indexArgs
        let selects = getters.selectList
        let cols = getters.colList
        let visibleCols = getters.visibleColList

        if (index === 'undefined') {
            let select
            let startIndex
            let endIndex
            let visibleStartCol = visibleCols[0]
            let visibleEndCol = visibleCols[visibleCols.length - 1]
>>>>>>> master

            for (let i = 0, len = selects.length; i < len; i++) {
                if (selects[i].type === SELECT) {
                    select = selects[i]
                    break
                }
            }
<<<<<<< HEAD
            if(select.wholePosi.endColAlias === 'MAX'){
                return;
            }
            let startColAlias = select.wholePosi.startColAlias,
                endColAlias = select.wholePosi.endColAlias;

=======
            let startColAlias = select.wholePosi.startColAlias
            let endColAlias = select.wholePosi.endColAlias
>>>>>>> master
            if (visibleStartCol.alias === startColAlias &&
                visibleStartCol !== cols[0]) {
                index = 0
            } else if (visibleEndCol.alias === endColAlias &&
                visibleEndCol !== cols[cols.length - 1]) {
                index = cols.length - 1
            } else {
<<<<<<< HEAD
                startIndex = getters.getColIndexByAlias(startColAlias);
                endIndex = getters.getColIndexByAlias(endColAlias);
=======
                startIndex = getters.getColIndexByAlias(startColAlias)
                endIndex = getters.getColIndexByAlias(endColAlias)

>>>>>>> master
                for (let i = startIndex; i < endIndex + 1; i++) {
                    if (cols[i].hidden) {
                        index = i
                        break
                    }
                }
            }

        }
        if (index === 'undefined' || !cols[index].hidden) {
            return
        }
<<<<<<< HEAD
        let col = cols[index];
        send({
            url: config.operUrl['showcol'],
            data: JSON.stringify({
                col: col.sort
            })
        });
        dispatch(actionTypes.COLS_EXECCANCELHIDE, col.sort);
    },
    [actionTypes.COLS_EXECCANCELHIDE]({
        rootState,
        commit,
        getters,
        dispatch
    }, sort) {
        let index = getters.getColIndexBySort(sort);
        let cols = getters.colList;
        let col = cols[index];
        let colWidth = col.width;
        let colAlias = col.alias;
        let currentSheet = rootState.currentSheet;
        let visibleCols = getters.visibleColList;
        let updateCellInfo = [];
=======

        let col = cols[index]
        let updateCellInfo = []
        let colWidth = col.width
        let colAlias = col.alias
>>>>>>> master

        let cellList = getters.getCellsByVertical({
            startColIndex: index,
            startRowIndex: 0,
            endColIndex: 'MAX',
            endRowIndex: 'MAX',
        })

        cellList.forEach(function(cell) {
            let occupy = cell.occupy.col

            if (occupy.indexOf(colAlias) !== -1) {
                updateCellInfo.push({
                    cell,
                    props: {
                        physicsBox: {
                            width: cell.physicsBox.width +
                                colWidth + 1
                        }
                    }
                })
            } else {
                updateCellInfo.push({
                    cell,
                    props: {
                        physicsBox: {
                            left: cell.physicsBox.left +
                                colWidth + 1
                        }
                    }
                })
            }
        })
        commit(mutationTypes.UPDATE_CELL, updateCellInfo)


<<<<<<< HEAD
        let updateSelectInfo = [],
            colLeft = col.left;
        let selects = getters.selectList;
=======
        let updateSelectInfo = []
>>>>>>> master

        selects.forEach(function(select) {
            let wholePosi = select.wholePosi
            let startIndex
            let endIndex

            startIndex = getters.getColIndexByAlias(wholePosi.startColAlias)
            endIndex = getters.getColIndexByAlias(wholePosi.endColAlias)
            if (startIndex > index) {
                updateSelectInfo.push({
                    select,
                    props: {
                        physicsBox: {
                            left: select.physicsBox.left +
                                colWidth + 1
                        }
                    }
                })
            } else if (endIndex > index) {
                updateSelectInfo.push({
                    select,
                    props: {
                        physicsBox: {
                            width: select.physicsBox.width +
                                colWidth + 1
                        }
                    }
                })
                commit(mutationTypes.UPDATE_COL, [{
                    col: cols[index],
                    props: {
                        active: true
                    }
                }])
            }
        })

        commit(mutationTypes.UPDATE_SELECT, updateSelectInfo)

        let updateColInfo = [{
            col: cols[index],
            props: {
                hidden: false
            }
        }]

        if (index > 0) {
            updateColInfo.push({
                col: cols[index - 1],
                props: {
                    rightAjacentHide: false
                }
            })
        }
        for (let i = index + 1, len = cols.length; i < len; i++) {
            let col = cols[i]
            updateColInfo.push({
                col,
                props: {
                    left: col.left + colWidth + 1
                }
            })
        }
<<<<<<< HEAD
        commit(mutationTypes.UPDATE_COL, updateColInfo);

        if (cache.localColPosi > 0) {
            cache.localColPosi += colWidth + 1;
        }
    },
    [actionTypes.COLS_INSERTCOL]({
        getters,
        dispatch
    }, index) {
        let selects = getters.selectList;
        if (index === undefined) {
            let select;
=======
        commit(mutationTypes.UPDATE_COL, updateColInfo)
    },
    [actionTypes.COLS_INSERTCOLS]({
        state,
        rootState,
        commit,
        getters
    }, indexArgs) {
        let index = indexArgs
        let selects = getters.selectList
        let currentSheet = rootState.currentSheet

        if (index === 'undefined') {
            let select
>>>>>>> master
            for (let i = 0, len = selects.length; i < len; i++) {
                if (selects[i].type === SELECT) {
                    select = selects[i]
                    break
                }
            }
<<<<<<< HEAD
            if(select.wholePosi.endColAlias === 'MAX'){
                return;
            }
            index = getters.getColIndexByAlias(select.wholePosi.startColAlias);
        }

        let sort = getters.colList[index].sort;
        send({
            url: config.operUrl['insertcol'],
            data: JSON.stringify({
                col: sort,
            }),
        });
        dispatch(actionTypes.COLS_EXECINSERTCOL, {sort});
    },
    [actionTypes.COLS_EXECINSERTCOL]({
        getters,
        commit,
        dispatch,
        rootState
    }, {
        sort,
        colModel
    }) {
        let insertCol;
        let cols = getters.colList;
        let index = getters.getColIndexBySort(sort);
        if (!colModel) {
            insertCol = extend(template);
            insertCol.alias = generator.colAliasGenerator();
            insertCol.sort = sort;
            insertCol.displayName = getColDisplayName(sort);
            insertCol.left = cols[index].left;
        } else {
            insertCol = colModel;
        }

        let colWidth = insertCol.width;
        let insertColAlias = insertCol.alias;
        let currentColAlias = cols[index].alias;
        let insertColLeft = insertCol.left;
        let cellList;
        let currentSheet = rootState.currentSheet;
=======
            index = getters.getColIndexByAlias(select.wholePosi.startColAlias)
        }

        let col = extend(template)
        let cols = getters.colList
        let getPointInfo = getters.getPointInfo
        let cellList
        let updateCellInfo = []
        let originalColAlias = cols[index]
        let colWidth = col.width
        let colAlias = generator.colAliasGenerator()
        let colLeft = cols[index].left

        col.sort = index
        col.alias = colAlias
        col.displayName = getColDisplayName(index)
        col.left = colLeft
>>>>>>> master

        cellList = getters.getCellsByVertical({
            startColIndex: index,
            startRowIndex: 0,
            endColIndex: 'MAX',
            endRowIndex: 'MAX',
        })

        let updateCellInfo = [];
        cellList.forEach(function(cell) {
<<<<<<< HEAD
            let occupyCol = cell.occupy.col;
            if (cell.physicsBox.left >= insertColLeft) {
=======
            let occupy = cell.occupy.col

            if (cell.physicsBox.left >= colLeft) {
>>>>>>> master
                updateCellInfo.push({
                    cell,
                    props: {
                        physicsBox: {
                            left: cell.physicsBox.left +
                                colWidth + 1
                        }
                    }
                })
            } else {
<<<<<<< HEAD
                let aliasIndex = occupyCol.indexOf(currentColAlias),
                    newOccupy = [...occupyCol],
                    occupyRow = cell.occupy.row,
                    cellIndex;

                newOccupy.splice(aliasIndex, 0, insertColAlias);
                cellIndex = getters.getPointInfo(occupyCol[0], occupyRow[0], 'cellIndex');
=======
                let index = occupy.indexOf(originalColAlias)
                let newOccupy = occupy.slice(0)
                let occupyRow = cell.occupy.row
                let cellIndex

                newOccupy.splice(index, 0, colAlias)
                cellIndex = getPointInfo(occupy[0], occupyRow[0],
                    'cellIndex')

>>>>>>> master
                updateCellInfo.push({
                    cell,
                    props: {
                        physicsBox: {
                            width: cell.physicsBox.width +
                                colWidth + 1
                        },
                        occupy: {
                            col: newOccupy
                        }
                    }
                })
                occupyRow.forEach(function(rowAlias) {
                    commit(mutationTypes.UPDATE_POINTINFO, {
                        currentSheet,
                        info: {
                            colAlias: insertColAlias,
                            rowAlias,
                            type: 'cellIndex',
                            value: cellIndex
                        }
                    })
                })
            }
<<<<<<< HEAD
        });
        commit(mutationTypes.UPDATE_CELL, updateCellInfo);

        let updateSelectInfo = [];
        let selects = getters.selectList;
        selects.forEach(function(select) {
            let wholePosi = select.wholePosi,
                startIndex,
                endIndex;
            startIndex = getters.getColIndexByAlias(wholePosi.startColAlias);
            endIndex = getters.getColIndexByAlias(wholePosi.endColAlias);
=======
        })

        commit(mutationTypes.UPDATE_CELL, updateCellInfo)


        let updateSelectInfo = []

        selects.forEach(function(select) {
            let wholePosi = select.wholePosi
            let startPosi = getters.getColByAlias(wholePosi.startColAlias)
                .left
            let endPosi = getters.getColByAlias(wholePosi.endColAlias).left
>>>>>>> master

            if (startIndex >= index) {
                updateSelectInfo.push({
                    select,
                    props: {
                        physicsBox: {
                            left: select.physicsBox.left +
                                colWidth + 1
                        }
                    }
<<<<<<< HEAD
                });
            } else if (endIndex > index) {
=======
                })
            } else if (endPosi > colLeft) {
>>>>>>> master
                updateSelectInfo.push({
                    select,
                    props: {
                        physicsBox: {
<<<<<<< HEAD
                            width: select.physicsBox.width + colWidth + 1
                        }
                    }
                });
                insertCol.active = true;
            }
        });
        commit(mutationTypes.UPDATE_SELECT, updateSelectInfo);


        insertCol.left = cols[index].left;
        let updateColInfo = [];
=======
                            left: select.physicsBox.left +
                                colWidth + 1
                        }
                    }
                })
            }
        })

        commit(mutationTypes.UPDATE_SELECT, updateSelectInfo)

        let updateColInfo = []
>>>>>>> master
        for (let i = index, len = cols.length; i < len; i++) {
            let col = cols[i]
            updateColInfo.push({
                col,
                props: {
                    left: col.left + colWidth + 1,
                    sort: col.sort + 1,
                    displayName: getColDisplayName(col.sort + 1)
                }
            })
        }
        commit(mutationTypes.UPDATE_COL, updateColInfo)
        commit(mutationTypes.INSERT_COL, {
<<<<<<< HEAD
            currentSheet: rootState.currentSheet,
            cols: [insertCol]
        });
        if (cache.localColPosi > 0) {
            cache.localColPosi += colWidth + 1;
        }
        /**
         * 只有在删除单元格的回退操作，才会传入列对象
         * 回退操作不需要进行前一列上单元格的复制操作
         */
        if (!colModel && index > 0) {
            cellList = getters.getCellsByVertical({
                startColIndex: index - 1,
                startRowIndex: 0,
                endColIndex: index - 1,
                endRowIndex: 'MAX',
            });
            let insertCellList = [];
            let previousAlias = cols[index - 1].alias;
            cellList.forEach(cell => {
                let occupyCol = cell.occupy.col;
                let occupyRow = cell.occupy.row;
                if (occupyCol.indexOf(previousAlias) === occupyCol.length - 1) {
                    occupyRow.forEach(alias => {
                        let insertCell = extend(cell);
                        insertCell.occupy = {
                            col: [insertColAlias],
                            row: [alias]
                        };
                        insertCell.content.texts = '';
                        insertCellList.push(insertCell);
                    });
                }
            });
            dispatch(actionTypes.CELLS_INSERTCELL, insertCellList);
        }
=======
            currentSheet,
            cols: [col]
        })
>>>>>>> master
    },
    [actionTypes.COLS_GENERAT]({
        state,
        rootState,
        commit
    }, num) {
        let currentSheet = rootState.currentSheet
        let colList = state[currentSheet].list
        let lastCol = colList[colList.length - 1]
        let currentLeft = lastCol.left + lastCol.width + 1
        let currentSort = lastCol.sort + 1
        let initWidth = config.colWidth
        let temp = []

        for (let i = 0; i < num; i++) {
            temp.push(extend({}, template, {
                alias: generator.colAliasGenerator(),
                left: currentLeft + (initWidth + 1) * i,
                sort: currentSort + i,
                displayName: getColDisplayName(currentSort + i)
            }))
        }

<<<<<<< HEAD
=======
        if (cache.localColPosi > 0) {
            cache.localColPosi = temp[temp.length - 1].left + temp[temp.length -
                1].width
        }
>>>>>>> master
        commit(mutationTypes.ADD_COL, {
            cols: temp,
            currentSheet
        })
    },
    [actionTypes.COLS_UPDATEACTIVECOLS]({
        getters,
        rootState,
        commit
    }, {
        oldStartAlias,
        newStartAlias,
        oldEndAlias,
        newEndAlias
    }) {
        let currentSheet = rootState.currentSheet

        let startIndex = getters.getColIndexByAlias(oldStartAlias)
        let endIndex = getters.getColIndexByAlias(oldEndAlias)
        endIndex = endIndex === 'MAX' ? getters.colList.length - 1 : endIndex

        commit(mutationTypes.CANCEL_ACTIVE_COL, {
            currentSheet,
            startIndex,
            endIndex
        })

        startIndex = getters.getColIndexByAlias(newStartAlias)
        endIndex = getters.getColIndexByAlias(newEndAlias)
        endIndex = endIndex === 'MAX' ? getters.colList.length - 1 : endIndex

        commit(mutationTypes.ACTIVE_COL, {
            currentSheet,
            startIndex,
            endIndex
        })
    },
    [actionTypes.COLS_OPERCOLS]({
        getters,
        commit
    }, {
        startIndexArgs,
        endIndexArgs,
        propsArgs
    }) {
        let startIndex = startIndexArgs
        let endIndex = endIndexArgs
        let props = propsArgs
        if (startIndex === 'undefined') {
            let selects = getters.selectList
            let select
            for (let i = 0, len = selects.length; i < len; i++) {
                if (selects[i].type === SELECT) {
                    select = selects[i]
                    break
                }
            }
            startIndex = getters.getColIndexByAlias(select.wholePosi.startColAlias)
            endIndex = getters.getColIndexByAlias(select.wholePosi.endColAlias)
        }
        endIndex = endIndex === 'undefined' ? startIndex : endIndex

        let updateColInfo = []
        let cols = getters.colList

        for (let i = startIndex; i < endIndex + 1; i++) {
            updateColInfo.push({
                col: cols[i],
                props: {
                    oprProp: props
                }
            })
        }
        commit(mutationTypes.UPDATE_COL, updateColInfo)
    }
}