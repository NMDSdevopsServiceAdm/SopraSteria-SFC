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

        // saved/changed facts
        this._savedBy = null;
        this._changedBy = null;
        this._savedAt = null;
        this._changedAt = null;
    }

    // the encapsulated property
    get previousProperty() {
        return this._previousValue;
    }

    // throws true if equal, otherwise false
    isEqual(currentValue, newValue) {
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
        // console.log("WA DEBUG - ChangePropertyPrototype::set property: value/this: ", value, this)
        if (this.property && !this.isEqual(this.property, value)) {
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

    // saved/changed facts
    get savedBy() {
        return this._savedBy;
    }
    get changedBy() {
        return this._changedBy;
    }
    get savedAt() {
        return this._savedAt;
    }
    get changedAt() {
        return this._changedAt;
    }

    // the property as recovered from the database may not be a simple property.
    //  The property may be decomposed across mutliple columns/tables.
    //  Therefore refer to the concrete class to resolve.
    restorePropertyFromSequelize(document) {
        throw new Error("Abstract method");
    }

    // the property as saved to the database may not be a simple property.
    //  The property may be decomposed across mutliple columns/tables.
    //  Therefore refer to the concrete class to resolve.
    savePropertyToSequelize(document) {
        throw new Error("Abstract method");
    }
    
    // restore property based on property name
    async restoreFromSequelize(document) {
        const changePropertyDefaultName = `${this.name}Value`;
        console.log(`WA DEBUG - attempting to restore ${this.name} given ${changePropertyDefaultName}`)

        if (document[changePropertyDefaultName]) {
            this.property = this.restorePropertyFromSequelize(document);

            this._changedAt = document[`${this.name}ChangedAt`];
            this._changedBy = document[`${this.name}ChangedBy`];
            this._savedAt = document[`${this.name}SavedAt`];
            this._savedBy = document[`${this.name}SavedBy`];

            // this.property = document.gender;
            this.reset();
            console.log(`WA DEBUG - restoring ${this.name}: `, this);
        }
    }

    save(username) {
        console.log(`WA DEBUG - saving ${this.name}`)
        const sequelizeSaveDefinition = {};

        // refer to concrete class to 
        const thisPropertyDef = this.savePropertyToSequelize();

        const currentTimestamp = new Date();
        this._savedAt = currentTimestamp;
        this._savedBy = username;
        sequelizeSaveDefinition[`${this.name}SavedAt`] = this._savedAt;
        sequelizeSaveDefinition[`${this.name}SavedBy`] = this._savedBy;

        // only update the change history if this property has indeed changed
        if (this.changed) {
            this._changedBy = username;
            this._changedAt = currentTimestamp;
            sequelizeSaveDefinition[`${this.name}ChangedAt`] = this._changedAt;
            sequelizeSaveDefinition[`${this.name}ChangedBy`] = this._changedBy;    
        }

        return {
            ...thisPropertyDef,
            ...sequelizeSaveDefinition
        };
    }
}

module.exports.ChangePropertyPrototype = ChangePropertyPrototype;