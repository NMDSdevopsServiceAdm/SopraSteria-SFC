// the nameOrId property is a simple string
const ChangePropertyPrototype = require('../../properties/changePrototype').ChangePropertyPrototype;

exports.WorkerNameOrIdProperty = class WorkerNameOrIdProperty extends ChangePropertyPrototype {
    constructor() {
        super('NameOrId');
    }

    static clone() {
        return new WorkerNameOrIdProperty();
    }

    async restoreFromJson(document) {
        if (document.nameOrId) {
            if (document.nameOrId.length <= 50) {
                this.property = document.nameOrId;
            } else {
                this.property = null;
            }
        }
    }
    async restoreFromSequelize(document) {
        if (document.nameId) {
            this.property = document.nameId;
            this.reset();
        }
    }

    get isEqual() {
        // TODO
        return true;
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
};