class PropertyPrototype {
    constructor(name) {
        this._changed = false;
        this._property = null;
        this._name = name;
    }

    // the encapsulated property
    get property() {
        return this._property;
    }
    set property(value) {
        this._property = value;
        this._changed = true;
    }

    // returns true if the property value has been changed
    get changed() {
        return this._changed;
    }
    reset() {
        this._changed = false;
    }

    // returns the "type name" of property
    get name() {
        return this._name;
    }

    // is called upon by Property Manager; returns an instance of itself down casted (PropertyPrototype), having    //  found itself within the given JSON document
    static async cloneFromJson(document) {
        throw new Error("Abstract method");
    }
    // is called upon by Property Manager; returns an instance of itself down casted
    //  (PropertyPrototype), having found itself within the given sequelize document
    static async cloneFromSequelize(document) {
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
        throw new Error("Abstract method");
    }


}

module.exports.PropertyPrototype = PropertyPrototype;