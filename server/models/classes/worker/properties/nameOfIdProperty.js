// the nameOrId property is a simple string
const PropertyPrototype = require('../../properties/prototype').PropertyPrototype;

exports.WorkerNameOrIdProperty = class WorkerNameOrIdProperty extends PropertyPrototype {
    constructor(nameOrId) {
        super('NameOrId');
        super.property = nameOrId;
    }

    static async cloneFromJson(document) {
        if (document.nameOrId) {
            return new WorkerNameOrIdProperty(document.nameOrId);
        }
    }
    static async cloneFromSequelize(document) {
        if (document.nameId) {
            return new WorkerNameOrIdProperty(document.nameId);
        }
    }
    save() {
        return {
            nameId: this.property
        }
    }
    toJSON() {
        return {
            nameOrId: this.property
        }
    }

    // nameOrId upto 50 characters
    get valid() {
        return this.property && this.property.length <= 50;
    }
};