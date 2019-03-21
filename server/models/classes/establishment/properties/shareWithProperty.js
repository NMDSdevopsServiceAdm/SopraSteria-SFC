// the "share with" property is a value (enum) property only, but stored as a set of individual properties (shareWithLA and shareWithCQC)
const ChangePropertyPrototype = require('../../properties/changePrototype').ChangePropertyPrototype;

const OPTION_LOCAL_AUTHORITY = 'Local Authority';
const OPTION_CQC = 'CQC';

exports.ShareWithProperty = class ShareWithProperty extends ChangePropertyPrototype {
    constructor() {
        super('ShareData');
    }

    static clone() {
        return new ShareWithProperty();
    }

    // concrete implementations
    async restoreFromJson(document) {
        if (document.share) {
            const shareOptions = document.share;
            const EXPECTED_SHARE_OPTIONS = [OPTION_CQC, OPTION_LOCAL_AUTHORITY];

            if (typeof shareOptions.enabled === 'boolean') {
                if (!shareOptions.enabled) {
                    this.property = {
                        enabled: false
                    };
                } else {
                    // share is enabled - could be zero, one or both "with" options
                    if (!document.share.with ||
                        !Array.isArray(document.share.with)) {
                        // if enabled, "share.with" must be defined and it must be an Array, even if an empty array
                        this.property = null;
                    } else {
                        const validOptions = document.share.with.every(thisWithOption => {
                            return EXPECTED_SHARE_OPTIONS.includes(thisWithOption);
                        });
                        if (validOptions) {
                            this.property = {
                                enabled: true,
                                with: document.share.with
                            };
                        } else {
                            // all with options must be valid
                            this.property = null;
                        }
                    }
                }

            } else {
               this.property = null;
            }
        }
    }

    restorePropertyFromSequelize(document) {
        if (document.ShareDataValue) {
            const shareWith = [];
            
            if (document.shareWithCQC) shareWith.push(OPTION_CQC);
            if (document.shareWithLA) shareWith.push(OPTION_LOCAL_AUTHORITY);

            return {
                    enabled: true,
                    with: shareWith
                };

        } else {
            return {
                    enabled: false
                };
        }
    }
    savePropertyToSequelize() {
        const updateDocument = {
            ShareDataValue: this.property.enabled
        };

        // only update the with options is share is enabled
        if (this.property.enabled) {
            // note - must reset the specific share option if it is not in the with set
            if (this.property.with.includes(OPTION_CQC)) {
                updateDocument.shareWithCQC = true;
            } else {
                updateDocument.shareWithCQC = false;
            }
            if (this.property.with.includes(OPTION_LOCAL_AUTHORITY)) {
                updateDocument.shareWithLA = true;
            } else {
                updateDocument.shareWithLA = false;
            }
        }

        return updateDocument;
    }

    isEqual(currentValue, newValue) {
        // share data is a simple object - need to compare "enabled" and "with" attributes (the latter being an array)
        let shareWithOptionsEqual = true;

        if (currentValue && newValue && currentValue.enabled && newValue.enabled) {
            // current and new are both enabled
            if (currentValue.with.length != newValue.with.length) {
                // not the same length, so not equal
                shareWithOptionsEqual = false;
            } else {
                // check every value in current is in new
                shareWithOptionsEqual = currentValue.with.every(thisCurrentWithOption => {
                    return newValue.with.find(thisCurrentWithOption => thisCurrentWithOption === thisCurrentWithOption);
                });
            }
        }

        return currentValue !== null && newValue !== null && currentValue.enabled === newValue.enabled && shareWithOptionsEqual;
    }

    toJSON(withHistory=false, showPropertyHistoryOnly=true) {
        if (!withHistory) {
            // simple form
            return {
                share: this.property
            };
        }
        
        return {
            share: {
                currentValue: this.property,
                ... this.changePropsToJSON(showPropertyHistoryOnly)
            }
        };
    }
};