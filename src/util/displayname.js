const colName = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L',
    'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'
]

export function getColDisplayName(indexArgs) {
    let displayText = ''
    let remainder
    let divisible
    let index = indexArgs
    remainder = index % colName.length
    divisible = Math.floor(index / colName.length)
    displayText = colName[remainder] + displayText
    while (divisible > 0) {
        index = divisible - 1
        remainder = index % colName.length
        divisible = Math.floor(index / colName.length)
        displayText = colName[remainder] + displayText
    }
    return displayText
}
export function getRowDisplayName(index) {
    if (index === 'MAX') {
        return 'MAX'
    }
    return (index + 1).toString()
}

export function getColIndex(displayName) {
    let num = 0
    let arr = displayName.split('')
    arr.forEach((value, index) => {
        num += (displayName.charCodeAt(displayName.length - index - 1) - 64) *
            Math.pow(26, index)
    })
    return num - 1
}

export function getRowIndex(displayName) {
    return displayName - 1
}
