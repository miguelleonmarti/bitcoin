"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var uuid_1 = require("uuid");
var sha256_1 = __importDefault(require("sha256"));
var elliptic_1 = require("elliptic");
var ellipticCurve = new elliptic_1.ec("secp256k1");
var Transaction = /** @class */ (function () {
    function Transaction(fromAddress, toAddress, amount) {
        this.id = this.generateId();
        this.fromAddress = fromAddress;
        this.toAddress = toAddress;
        this.amount = amount;
    }
    Transaction.prototype.generateId = function () {
        return uuid_1.v1()
            .split("-")
            .join("");
    };
    Transaction.prototype.signTransaction = function (signPrivateKey) {
        if (signPrivateKey.getPublic("hex") !== this.fromAddress) {
            throw new Error("You cannot sign transactions for other wallets!");
        }
        var transactionHash = this.calculateHash();
        this.signature = signPrivateKey.sign(transactionHash, "base64").toDER("hex");
    };
    Transaction.prototype.calculateHash = function () {
        return sha256_1.default(this.id + this.fromAddress + this.toAddress + this.amount).toString();
    };
    Transaction.prototype.isValid = function () {
        if (!this.fromAddress)
            return false;
        if (!this.signature || this.signature.length === 0)
            return false;
        var publicKey = ellipticCurve.keyFromPublic(this.fromAddress, "hex");
        return publicKey.verify(this.calculateHash(), this.signature);
    };
    return Transaction;
}());
exports.default = Transaction;
