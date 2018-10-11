export default function(textArgs) {
    let result = {
        data: [],
        rowLen: 0,
        colLen: 0
    }
    let text = textArgs
    if (text.lastIndexOf('\n') === text.length - 1) {
        text = text.substring(0, text.length - 1)
    }
    let rows = text.split('\n')
    for (let i = 0, len = rows.length; i < len; i++) {
        let row = rows[i]
        let cells = row.split('\t')
        if (i === 0) {
            result.rowLen = rows.length
            result.colLen = cells.length
        }
        for (let j = 0, len = cells.length; j < len; j++) {
            let cell = cells[j]
            cell = cell.toString().replace(/[\n\r]/g, '')
            result.data.push({
                colRelative: j,
                rowRelative: i,
                text: cell
            })
        }
    }
    return result
}