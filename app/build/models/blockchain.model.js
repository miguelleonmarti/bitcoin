"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var block_model_1 = __importDefault(require("./block.model"));
var Blockchain = /** @class */ (function () {
    function Blockchain() {
        this.currentNodeUrl = "http://localhost:3000"; //`http://localhost:${process.argv[2]}`;
        this.chain = [this.createGenesisBlock()];
        this.pendingTransactions = [];
        this.networkNodes = [];
        this.miningReward = 12.5;
        this.difficulty = 3;
    }
    Blockchain.prototype.createGenesisBlock = function () {
        var genesisBlock = new block_model_1.default([], "0");
        genesisBlock.timestamp = 1586967497007;
        genesisBlock.id = "0";
        genesisBlock.hash = genesisBlock.calculateHash();
        return genesisBlock;
    };
    Blockchain.prototype.addTransaction = function (transaction) {
        if (!transaction.fromAddress || !transaction.toAddress) {
            throw new Error("Transaction must include fromAddress and toAddress");
        }
        if (!transaction.isValid() && transaction.fromAddress !== "0") {
            // TODO:  de momento
            throw new Error("Cannot add invalid transaction to chain");
        }
        var transactionCopy = Object.assign({}, transaction);
        return this.pendingTransactions.push(transactionCopy);
    };
    Blockchain.prototype.minePendingTransactions = function (miningRewardAddress) {
        var block = new block_model_1.default(this.pendingTransactions, this.getLatestBlock().hash);
        block.mine(this.difficulty);
        this.chain.push(Object.assign({}, block));
        this.pendingTransactions = [
        //new Transaction("0", miningRewardAddress, this.miningReward) // TODO:  revisar lo del fromAddress
        ];
    };
    Blockchain.prototype.addBlock = function (block) {
        // TODO: no entiendo este método si hay otro minePendingTransactions
        block.previousHash = this.getLatestBlock().hash;
        block.mine(this.difficulty);
        this.pendingTransactions = []; // TODO: lo acabo de poner
        this.chain.push(block);
    };
    Blockchain.prototype.getLatestBlock = function () {
        return this.chain[this.chain.length - 1];
    };
    Blockchain.prototype.isChainValid = function (chain) {
        var length = chain.length;
        for (var i = 1; i < length; i++) {
            var currentBlock = chain[i];
            var previousBlock = chain[i - 1];
            if (!currentBlock.hasValidTransactions()) {
                return false;
            }
            if (currentBlock.hash != currentBlock.calculateHash()) {
                return false;
            }
            if (currentBlock.previousHash !== previousBlock.hash) {
                return false;
            }
        }
        return true;
    };
    // TODO:  mejorar con forEach
    Blockchain.prototype.getBalanceOfAddress = function (address) {
        var balance = 0;
        for (var _i = 0, _a = this.chain; _i < _a.length; _i++) {
            var block = _a[_i];
            for (var _b = 0, _c = block.transactions; _b < _c.length; _b++) {
                var transaction = _c[_b];
                if (transaction.fromAddress === address) {
                    balance -= transaction.amount;
                }
                if (transaction.toAddress === address) {
                    balance += transaction.amount;
                }
            }
        }
        return balance;
    };
    Blockchain.prototype.getBlock = function (hash) {
        return this.chain.find(function (block) { return block.hash === hash; });
    };
    Blockchain.prototype.getTransaction = function (id) {
        for (var _i = 0, _a = this.chain; _i < _a.length; _i++) {
            var block = _a[_i];
            var t = block.transactions.find(function (transaction) { return transaction.id === id; });
            if (t)
                return t;
        }
        return undefined;
    };
    return Blockchain;
}());
exports.default = Blockchain;
