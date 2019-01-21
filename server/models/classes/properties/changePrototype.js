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
    constructor(name, prefix=null) {
        // initialise the base property (name)
        super(name);

        if (prefix) {
            this._dbPropertyPrefix = prefix;
        } else {
            // defaults to the name of the property
            this._dbPropertyPrefix = name;
        }

        this._changed = false;
        this._previousValue = null;

        // saved/changed facts
        this._savedBy = null;
        this._changedBy = null;
        this._savedAt = null;
        this._changedAt = null;
        this._auditEvents = null;
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
    get auditEvents() {
        return this._auditEvents;
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
        const changePropertyDefaultName = `${this._dbPropertyPrefix}Value`;

        if (document[changePropertyDefaultName]) {
            this.property = this.restorePropertyFromSequelize(document);
            this._changedAt = document[`${this._dbPropertyPrefix}ChangedAt`];
            this._changedBy = document[`${this._dbPropertyPrefix}ChangedBy`];
            this._savedAt = document[`${this._dbPropertyPrefix}SavedAt`];
            this._savedBy = document[`${this._dbPropertyPrefix}SavedBy`];

            // this.property = document.gender;
            this.reset();
        }

        // restore audit events for this property - if defined
        if (document.auditEvents) {
            // filter out those for this property only
            this._auditEvents = document.auditEvents.filter(thisEvent => thisEvent.property == this.name);
        }
    }

    // returns the Worker record properties, in addition to a set of auditEvents
    save(username) {
        const sequelizeSaveDefinition = {};
        const auditEvents = [];

        // refer to concrete class to 
        const thisPropertyDef = this.savePropertyToSequelize();

        const currentTimestamp = new Date();
        this._savedAt = currentTimestamp;
        this._savedBy = username;
        sequelizeSaveDefinition[`${this._dbPropertyPrefix}SavedAt`] = this._savedAt;
        sequelizeSaveDefinition[`${this._dbPropertyPrefix}SavedBy`] = this._savedBy;

        // create a 'saved' audit event for this property
        auditEvents.push({
            username,
            type: 'saved',
            property: this.name
        });

        // only update the change history if this property has indeed changed
        if (this.changed) {
            this._changedBy = username;
            this._changedAt = currentTimestamp;
            sequelizeSaveDefinition[`${this._dbPropertyPrefix}ChangedAt`] = this._changedAt;
            sequelizeSaveDefinition[`${this._dbPropertyPrefix}ChangedBy`] = this._changedBy;
            
            // create a 'changed' audit event for this property
            auditEvents.push({
                username,
                type: 'changed',
                property: this.name,
                event: {
                    current: this.previousProperty,
                    new: this.property
                }
            });
        }

        return {
            properties: {
                ...thisPropertyDef,
                ...sequelizeSaveDefinition
            },
            audit: auditEvents
        };
    }

    // helper function to format the change history
    formatChangeHistory(auditEvent) {
        // when reporting on the change history for 
        //  a given property, only inclue from the audit:
        //  1. username
        //  2. when
        //  3. type: map to "event"
        //  4. event: map to "change" [optional]
        const historyEvent = {
            username: auditEvent.username,
            when: auditEvent.when,
            event: auditEvent.type
        };
        if (auditEvent.event) {
            historyEvent.change = auditEvent.event
        }

        return historyEvent;
    }


    // return JSON for the change properties
    changePropsToJSON(showPropertyHistoryOnly) {
        const propertyJSON = {
            lastSavedBy : this.savedBy ? this.savedBy : null,
            lastChangedBy : this.changedBy ? this.changedBy : null,
            lastSaved : this.savedAt ? this.savedAt.toJSON() : null,
            lastChanged : this.changedAt ? this.changedAt.toJSON() : null
        };
        if (!showPropertyHistoryOnly && this.auditEvents) {
            propertyJSON.changeHistory = this.auditEvents.map(this.formatChangeHistory);
        }
        return propertyJSON;
    }
}

module.exports.ChangePropertyPrototype = ChangePropertyPrototype;