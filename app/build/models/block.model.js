"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var v1_1 = __importDefault(require("uuid/v1"));
var sha256_1 = __importDefault(require("sha256"));
var Block = /** @class */ (function () {
    function Block(transactions, previousHash) {
        if (previousHash === void 0) { previousHash = ""; }
        this.id = this.generateId();
        this.timestamp = Date.now();
        this.previousHash = previousHash;
        this.nonce = 0;
        this.transactions = transactions;
        this.hash = this.calculateHash();
    }
    Block.prototype.generateId = function () {
        return v1_1.default()
            .split("-")
            .join("");
    };
    Block.prototype.calculateHash = function () {
        return sha256_1.default(this.id +
            this.timestamp +
            this.previousHash +
            this.nonce +
            JSON.stringify(this.transactions)).toString();
    };
    Block.prototype.mine = function (difficulty) {
        while (this.hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")) {
            this.nonce++;
            this.hash = this.calculateHash();
        }
    };
    // TODO:  mejorar con un some
    Block.prototype.hasValidTransactions = function () {
        for (var _i = 0, _a = this.transactions; _i < _a.length; _i++) {
            var transaction = _a[_i];
            if (!transaction.isValid()) {
                return false;
            }
        }
        return true;
    };
    return Block;
}());
exports.default = Block;
