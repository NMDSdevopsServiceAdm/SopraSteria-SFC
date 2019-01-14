// the property manager holds a collection of Properties (PrototypeProperty instances)
//  as a result of passing a given Document

class PropertyManager {
    constructor() {
        this._properties = {};  // intentionally an object not array
        this._propertyTypes = [];
    }

    static get JSON_DOCUMENT() { return 100; }
    static get SEQUELIZE_DOCUMENT() { return 200; }

    // adds the property with given name
    _addProperty(property) {
        this._properties[property.name] = property;
    }

    // returns the property value of given name
    get(propertyTypeName) {
        const thisProperty = this._properties[propertyTypeName];

        if (thisProperty)
            return thisProperty;
        else
            return null;
    }

    // returns true if all properties are valid, else returns the list
    //  of invalid properties
    get isValid() {
        let isValid = true;   // assume all properties are valid, unless otherwise told
        const invalidProperties = [];
        const allProperties = Object.keys(this._properties);
        allProperties.forEach(thisPropertyType => {
            const thisProperty = this._properties[thisPropertyType];
            if (!thisProperty.valid) {
                isValid = false;
                invalidProperties.push(thisPropertyType);
            }
        });

        if (!isValid) {
            return invalidProperties;
        } else {
            return true;
        }
    }

    // runs through all known (registered) property types
    //  restoring from given document type
    async restore(document, documentType) {
        // reset of all existing properties
        this._properties = [];

        const typePromises = [];
        this._propertyTypes.forEach(async thisType => {
            let newProperty = null;

            switch (documentType) {
                case PropertyManager.JSON_DOCUMENT:
                    typePromises.push(thisType.cloneFromJson(document));
                    break;

                case PropertyManager.SEQUELIZE_DOCUMENT:
                    typePromises.push(thisType.cloneFromSequelize(document));
                    break;

                default:
                    // do nothing - newProperty remains null
            }
        });

        const newProperties = await Promise.all(typePromises);

        // having restored all known properties, add them
        newProperties.forEach(thisProperty => {
            // can return undefined from individual clone methods - ignore
            if (thisProperty) {
                if (documentType === PropertyManager.SEQUELIZE_DOCUMENT) {
                    // if restoring from fact (DB), we know the property to be unchanged
                    thisProperty.reset();
                }
                this._addProperty(thisProperty);
            }
        });


    };

    // runs through all known properties, adding them to the given
    //  document to save (using sequelize), only if they have been changed.
    // Returns modified save document.
    save (document) {
        const allProperties = Object.keys(this._properties);
        allProperties.forEach(thisPropertyType => {
            const thisProperty = this._properties[thisPropertyType];

            if (thisProperty.changed) {
                const saveProperties = thisProperty.save();

                // unlike JSON with allows for rich sub-documents,
                //  sequelize maps onto relational tables which
                //  are flat. So rather than containing a sub-document,
                //  it is necessary to merge properties
                document = { ...document, ...saveProperties};
            }
        });

        return document;
    }

    // returns a JSON object representation of all known properties
    toJSON() {
        let thisJsonObject = {};
        const allProperties = Object.keys(this._properties);

        allProperties.forEach(thisProperty => {
            thisJsonObject = {
                ...thisJsonObject,
                ...this._properties[thisProperty].toJSON()
            }
        });

        return thisJsonObject;
    }

    // registers a given property type, by referencing
    //  it's "class not object" function only
    registerProperty(propertyType) {
        this._propertyTypes.push(propertyType);
    }

    // returns a list of all Properties by name
    get properties() {
        const myProperties = [];
        const allProperties = Object.keys(this._properties);

        allProperties.forEach(thisProperty => {
            myProperties.push(this._properties[thisProperty].name);
        });
        return myProperties;
    }

    // returns a list of all registered Properties by name
    get types() {
        const myProperties = [];
        this._propertyTypes.forEach(thisPropertyType => {
            myProperties.push(thisPropertyType.name);
        });
        return myProperties;
    }
};

module.exports.PropertyManager = PropertyManager;