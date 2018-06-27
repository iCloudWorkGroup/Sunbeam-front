describe('all', () => {
    beforeAll(()=>{
        console.log('beforeAll')
    })
    afterAll(()=>{
        console.log('afterAll')
    })
    beforeEach(() => {
        console.log('beforeEach')
    })
    afterEach(() => {
        console.log('afterEach')
    })
    it('main', function() {
        console.log('testing main')
    })
    it('main', function() {
        console.log('second main')
    })
    describe('item', () => {
        beforeEach(()=>{
            console.log(' item process')
        })
        it('mei ci dou zou', () => {
            console.log('item meici ')
        });
        it('mei ci dou zou2', () => {
            console.log('item meici 2')
        });
    });
})