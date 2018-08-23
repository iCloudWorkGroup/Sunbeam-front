import CONFIG from '../config'
import extend from './extend'
import cache from '../tools/cache'

export default function(options, recordStep = true) {
    if (recordStep === true) {
        // cache.step++
    }
    let fixOptions = extend({
        mode: 'cors',
        method: 'POST',
        headers: {
            'content-type': 'application/json; charset=UTF-8',
            'X-Step': cache.step,
            'X-Book-Id': cache.AUTHENTIC_KEY
        }
    }, options)
    fixOptions.url = CONFIG.rootPath + fixOptions.url
    return fetch(fixOptions.url, fixOptions)
        .then((response) => {
            return response.json()
        })
        .then((data) => {
            if (data.isLegal != null &&
                data.isLegal === false) {
                cache.step--
            }
            return data
        })
        .catch(() => {
            return
        })
}