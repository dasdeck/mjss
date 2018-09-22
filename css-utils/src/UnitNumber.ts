export default class UnitNumber {

    val:number
    unit:string

    constructor(value, unit = null) {

        if (!unit && typeof value === 'string') {
            this.val = parseFloat(value);
            this.unit = value.replace(String(this.val), '');
        } else {
            this.val = value;
            this.unit = unit || '';
        }

        this.val = Math.round(this.val * 100000) / 100000; // round to same digit as less-css

    }

    toString() {
        return this.unit ? `${this.val}${this.unit}` : this.val;
    }

    valueOf() {
        return this.val;
    }

    static create(value) {

        if (value instanceof UnitNumber) {

            return value;

        } else {

            const floatVal = parseFloat(value);

            if (floatVal !== floatVal) {
                throw value + ' is not a number';
            }

            const hasUnits = floatVal != value; // eslint-disable-line

            if (hasUnits) {
                return new UnitNumber(value);
            } else {
                return floatVal;
            }

        }
    }

    static operations = {

        mul(a, b) {

            a = UnitNumber.create(a);
            b = UnitNumber.create(b);

            return new UnitNumber(a * b, a.unit || b.unit);
        },

        div(a, b) {

            a = UnitNumber.create(a);
            b = UnitNumber.create(b);

            return new UnitNumber(a / b, a.unit || b.unit);
        },

        add(a, b) {

            a = UnitNumber.create(a);
            b = UnitNumber.create(b);

            return new UnitNumber(a + b, a.unit || b.unit);
        },

        sub(a, b) {

            a = UnitNumber.create(a);
            b = UnitNumber.create(b);

            return new UnitNumber(a - b, a.unit || b.unit);
        }

    };

}

