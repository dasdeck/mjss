import UnitNumber from "../src/UnitNumber";

describe('UnitNumber', () => {

    it('utils', () => {

        expect(UnitNumber.create('1.1px').getFinestResolution()).toBe(0.1);
        expect(UnitNumber.create('1.11px').getDecimals()).toBe(2);
        expect(UnitNumber.create('5px').withIncrement(UnitNumber.create('1px')).toString()).toBe('6px');

    });

});