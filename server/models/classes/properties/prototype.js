class PropertyPrototype {
    constructor(name) {
        this._modified = false;
        this._property = null;
        this._name = name;
    }

    // the encapsulated property
    get property() {
        return this._property;
    }
    set property(value) {
        this._property = value;
        this._modified = true;
    }

    // returns true if the property value has been modified (doesn't care if the value has changed)
    get modified() {
        return this._modified;
    }
    reset() {
        this._modified = false;
    }

    // returns the "type name" of property
    get name() {
        return this._name;
    }

    // called upon by PropertyManager to create an instance of itself
    static clone() {
        throw new Error("Abstract method");
    }

    // is called upon by Property Manager; returns an instance of itself down casted (PropertyPrototype), having    //  found itself within the given JSON document
    async restoreFromJson(document) {
        // note - always if for the property existing within the document as a single test.
        // Within that existence test, then test the validity of the property, and if not
        //  valid, set the property to null (this becoming invalid)
        throw new Error("Abstract method");
    }
    // is called upon by Property Manager; returns an instance of itself down casted
    //  (PropertyPrototype), having found itself within the given sequelize document
    async restoreFromSequelize(document) {
        // NOTE - remember to reset having set property
        throw new Error("Abstract method");
    }

    // is called upon by Property Manager; returns false if nothing to persist, otherwise
    //  an object with a set of properties to merge
    save() {
        throw new Error("Abstract method");
    }

    // is called upon by Property Manager; returns an object representing the JSON equivalent
    toJSON() {
        throw new Error("Abstract method");
    }

    // returns true if the property is valid; otherwise false
    get valid() {
        if (this._property) {
            return true;
        } else {
            return false;
        }
    }


}

module.exports.PropertyPrototype = PropertyPrototype;