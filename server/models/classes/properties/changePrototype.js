// a Change Property is one that is able to manage it's own change history, which
//  includes last saved timestamp, last saved by (username), last changed timestamp,
//   and last changes by (username), in addition to an Audit Trail of history events
//   both "saved" and "changed".
//
// CHangePropertyPrototype assumes a given database schema, based on the
//   PropertyPropotype::name (<name>):
//  <name>Value
//  <name>Saved - timestamp
//  <name>SavedBy - username
//  <name>Changed - timestamp (can be null)
//  <name>ChangedBy - username (can be null)
//
// "changed" audit events include before and atfer values.
//
// The ChangedPropertyPrototype extends from PropertyPrototype; the latter holding
//  the current value; ChangePropertyPrototype holds the previous value, which
//  is set only if the given value differs to the current value.
//

const PropertyPrototype = require('./prototype').PropertyPrototype;

class ChangePropertyPrototype extends PropertyPrototype {
    constructor(name) {
        // initialise the base property (name)
        super(name);
        this._changed = false;
        this._previousValue = null;
    }

    // the encapsulated property
    get previousProperty() {
        return this._previousValue;
    }

    // throws true if equal, otherwise false
    get isEqual() {
        throw new Error("Abstract method");
    }

    // kludge to allow override on the setter of property
    get property() {
        return super.property;
    }
    // overrides the base set property - to capture change
    set property(value) {
        // now check if the property value has changed, which will depend
        //  on the final Property type
        if (super.property && !this.isEqual) {
            this._previousValue = super.property;
            this._changed = true;
        }

        // finally capture the current value in the base Prototype
        super.property = value;
    }

    // returns true if the property value has been changed
    get changed() {
        return this._changed;
    }
    reset() {
        this._changed = false;
        super.reset();
    }
}

module.exports.ChangePropertyPrototype = ChangePropertyPrototype;