export default function(text){

}
    function clipBoardDataPaste(pasteText) {
        var encodeText,
            rowData = [],
            cellData = [],
            sendData = [],
            rowCellData = [],
            selectRowIndex,
            selectColIndex,
            selectRegion,
            clipRegion,
            colSort,
            rowSort,
            rowLen,
            colLen,
            i,
            j;



        encodeText = encodeURI(pasteText);
        rowData = encodeText.split('%0D%0A');

        rowLen = rowData.length - 1;
        if (rowData[rowLen] !== '') {
            rowLen++;
        }

        colLen = rowData[0].split('%09').length;
        decodeURI

        selectRegion = selectRegions.getModelByType('selected');
        selectRowIndex = rows.getIndexByAlias(selectRegion.get('wholePosi').startY);
        selectColIndex = cols.getIndexByAlias(selectRegion.get('wholePosi').startX);

        rowSort = rowList[selectRowIndex].get('sort');
        colSort = colList[selectColIndex].get('sort');

        for (i = 0; i < rowLen; i++) {
            rowCellData = rowData[i].split('%09');
            for (j = 0; j < rowCellData.length; j++) {
                if (rowCellData[j] !== '') {
                    sendData.push({
                        'col': colSort + j,
                        'row': rowSort + i,
                        'content': decodeURI(analysisText(rowCellData[j]))
                    });
                    cellData.push({
                        relativeColIndex: j,
                        relativeRowIndex: i,
                        text: decodeURI(analysisText(rowCellData[j]))
                    });
                }
            }
        }

        send.PackAjax({
            url: config.url.sheet.paste,
            async: false,
            data: JSON.stringify({
                sheetId: '1',
                oprCol: colList[selectColIndex].get('sort'),
                oprRow: rowList[selectRowIndex].get('sort'),
                colLen: colLen,
                rowLen: rowLen,
                pasteData: sendData
            }),
            success: function(data) {
                if (data && data.isLegal) {
                    fillData();
                } else {
                    Backbone.trigger('event:showMsgBar:show', '该区域不能进行此操作');
                }
            }
        });

        function fillData() {
            var cellStrand = cache.CellsPosition.strandX,
                originalModelIndexs = [],
                currentModelIndexs = [],
                originalRuleData = [],
                rowAlias,
                colAlias,
                cellModel,
                actions = [],
                tempRuleIndex;

            for (i = selectRowIndex; i < selectRowIndex + rowLen; i++) {
                for (j = selectColIndex; j < selectColIndex + colLen; j++) {
                    if (i >= rows.length || j >= cols.length) {
                        continue;
                    }
                    rowAlias = rowList[i].get('alias');
                    colAlias = colList[j].get('alias');
                    cellModel = cells.getCellByVertical(j, i)[0];
                    if (cellModel && cellModel.get('isDestroy') === false) {
                        originalModelIndexs.push(cellStrand[colAlias][rowAlias]);
                        cellModel.set('isDestroy', true);
                    }
                    cache.deletePosi(rowAlias, colAlias);
                    if ((tempRuleIndex = strandMap.getPointRecord(colAlias, rowAlias, 'validate')) !== undefined) {
                        originalRuleData.push({
                            colAlias: colAlias,
                            rowAlias: rowAlias,
                            index: tempRuleIndex
                        });
                        strandMap.deletePointRecord(colAlias, rowAlias, 'validate');
                    }
                }
            }
            for (i = 0; i < cellData.length; i++) {
                cellModel = new Cell();
                cellModel.set('content.texts', cellData[i].text);
                cellModel = adaptCell(cellModel, cellData[i].relativeColIndex, cellData[i].relativeRowIndex);
                if (cellModel) {
                    setTextType.typeRecognize(cellModel);
                    setTextType.generateDisplayText(cellModel);
                    cells.add(cellModel);
                    currentModelIndexs.push(cells.length - 1);
                }
            }
            actions.push(history.getCellCoverAction(currentModelIndexs, originalModelIndexs));
            actions.push(history.getValidateCoverAction([], originalRuleData));
            history.addAction(actions);
        }

        function analysisText(text) {
            var head = '',
                tail = '';
            if (text.indexOf('%0A') === -1) {
                return text;
            }
            text = text.substring(3, text.length - 3);
            while (true) {
                if (text.indexOf('%22%22') === 0) {
                    text = text.substring(6);
                    head += '%22';
                } else {
                    break;
                }
            }
            while (true) {
                if (text.lastIndexOf('%22%22') === text.length - 6 && text.length > 6) {
                    text = text.substring(0, text.length - 6);
                    tail += '%22';
                } else {
                    break;
                }
            }
            text = head + text + tail;
            return text;
        }
    }