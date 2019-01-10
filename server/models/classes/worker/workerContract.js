class WorkerContract {
    constructor(contract=null) {
        this._contract = contract;
    }

    get contract() {
        return _contract;
    }

    set contract(contract) {
        this._contract = contract;

        return this._contract;
    }

    toJSON() {
        return {
            contract: this._contract
        };
    }
};

module.exports.WorkerContract = WorkerContract;