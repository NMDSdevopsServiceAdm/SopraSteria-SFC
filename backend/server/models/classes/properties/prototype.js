class PropertyPrototype {
    constructor(name) {
        this._modified = false;
        this._property = null;
        this._name = name;
        this._notSet = true;
        this._allowNull = false;
    }

    // the encapsulated property
    get property() {
        return this._property;
    }
    set property(value) {
        this._property = value;
        this._modified = true;

        // reset the firsttime set status
        if (this._notSet) this._notSet = false;
    }

    // returns true if the property value has been modified (doesn't care if the value has changed)
    get modified() {
        return this._modified;
    }

    get allowNull() {
      return this._allowNull;
  }

    reset() {
        this._modified = false;
    }

    // returns true if the property has not yet been set (ie. it has been cloned by no value assigned)
    get isInitialised() {
        if (!this._notSet) return true;
        else return false;
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
    save(username) {
        throw new Error("Abstract method");
    }

    // is called upon by Property Manager; returns an object representing the JSON equivalent
    toJSON(withHistory=false, showPropertyHistoryOnly=true) {
        throw new Error("Abstract method");
    }

    // returns true if the property is valid; otherwise false
    get valid() {
        if (this._notSet || (this._property !== null || this._allowNull)) {
            return true;
        } else {
            return false;
        }
    }


}

module.exports.PropertyPrototype = PropertyPrototype;
