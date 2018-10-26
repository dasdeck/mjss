export default class UnitNumber {

    val:number
    unit:string

    constructor(value, unit = null) {

        if (!unit && typeof value === 'string') {
            this.val = parseFloat(value);
            this.unit = value.replace(this.val.toString(), '');
        } else {
            this.val = value;
            this.unit = unit || '';
        }

        this.val = Math.round(this.val * 100000) / 100000; // round to same digit as less-css

    }

    withIncrement(increment) {

        if (Math.abs(increment) < 1) {
            const factor = 1/increment;
            return new UnitNumber(Math.round((this.val + increment) * factor) / factor, this.unit);
        } else {
            return new UnitNumber(this.val + increment, this.unit);
        }

    }

    toString() {
        return this.unit ? `${this.val}${this.unit}` : this.val;
    }

    valueOf() {
        return this.val;
    }

    getFinestResolution() {
        const decimals = this.getDecimals();
        if(decimals) {
            const size = Math.pow(10, -decimals);
            return size;
        } else {
            return 1;
        }
    }

    getDecimals() {
        return (this.val.toString().split('.')[1] || '').length;
    }

    static createOrZero(value) {
        try {
            return UnitNumber.create(value);
        } catch (e) {
            return new UnitNumber(0);
        }
    }

    static create(value, always = false) {

        if (value instanceof UnitNumber) {

            return value;

        } else {

            const floatVal = parseFloat(value);

            if (floatVal !== floatVal) {
                throw value + ' is not a number';
            }

            const hasUnits = floatVal != value; // eslint-disable-line

            if (hasUnits || always) {
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

