import cell from './util/format'
import Vue from 'vue'
import Vuex from 'vuex'
Vue.use(Vuex)

describe('format -> ', () => {
    let exps
    let strVal
    let store
    beforeAll(() => {
        store = new Vuex.Store({
            modules: {
                cells
            }
        })
    })
    afterAll(() => {
        store = null
    })
    afterEach(() => {
        store.replaceState(initData)
    })

    function execute(inptVal, exps) {
        return store.dispatch('cells/format', {
            exps,
            inptVal
        })
    }

    function cellContent() {
        return store.state.cells[0].content
    }
    describe('diff type for routine (G) -> ', () => {
        let exps = 'G'

        it('number', function() {
            execute({
                inptVal: 123,
                exps
            }).then(() => {
                expect(cellContent()['format'])
                    .toEqual(
                        'number')
            })
        })
        it('text', function() {
            execute({
                inptVal: 'zhangsan-中文',
                exps
            }).then(() => {
                expect(cellContent()['format'])
                    .toEqual(
                        'text')
            })
        })
        it('date', function() {
            execute({
                inptVal: '2015/12/1',
                exps
            }).then(() => {
                expect(cellContent()['format'])
                    .toEqual(
                        'date')
            })
        })
    })
    it('text (@)', () => {
        execute({
            exps: '@',
            inptVal: 123
        }).then(() => {
            expect(cellContent()['format']).toEqual(
                'text');
        })
    })
    it('#,##', () => {
        execute({
            exps: '#,##'
            inptVal: 100044
        }).then(() => {
            expect(cellContent()['displayText']).toEqual(
                '100,004');
            expect(cellContent()['format']).toEqual(
                'number');
        })
    })
    it('0 for rounding 5', function() {
        execute({
            exps: '0',
            inptVal: 34.5
        }).then(() => {
            expect(cellContent()[
                'displayText']).toEqual(
                35);
        })
    })
    it('0 for rounding 4', function() {
        execute({
            exps: '0',
            inptVal: 34.4
        }).then(() => {
            expect(cellContent()[
                'displayText']).toEqual(
                34);
        })
    })
    it('0.00', () => {
        execute({
            exps: '0.00',
            inptVal: 456.789
        }).then(() => {
            expect(cellContent()[
                'displayText']).toEqual(
                456.79);
        })
    })
    it('0.000', () => {
        execute({
            exps: '0.00',
            inptVal: 456.7
        }).then(() => {
            expect(cellContent()[
                'displayText']).toEqual(
                456.700);
        })
    })
    it('$ or ￥', function() {
        execute({
            exps: '$',
            inptVal: 345
        }).then(() => {
            expect(cellContent()['displayText']).toEqual(
                '$345');
        })
    })
    it('% for int number', () => {
        execute({
            exps: '%',
            inptVal: 40
        }).then(() => {
            expect(cellContent()['displayText']).toEqual(
                '4000%');
        })
    });
    it('% for double number', () => {
        execute({
            exps: '%',
            inptVal: 40.789
        }).then(() => {
            expect(cellContent()['displayText']).toEqual(
                '4078.9%');
        })
    })
})