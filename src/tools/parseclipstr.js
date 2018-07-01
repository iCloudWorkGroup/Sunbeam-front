export default function(text) {
    let result = {
        data: []
        rowLen: 0,
        colLen: 0
    }
    let rows = text.split('\n')
    for (let i = 0, len = rows.length; i < len; i++) {
        let row = rows[i]
        let cells = row.split('\t')
        if (i === 0) {
            result.rowLen = rows.length
            result.colLen = cols.length
        }
        for (let j = 0, len = cells.length; j < len; j++) {
            let cell = cells[j]
            result.data.push({
                colRelative: j,
                rowRelative: i,
                text: cell
            })
        }
    }
}