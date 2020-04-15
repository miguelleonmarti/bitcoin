"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var axios_1 = __importDefault(require("axios"));
var v1_1 = __importDefault(require("uuid/v1"));
var blockchain_model_1 = __importDefault(require("../models/blockchain.model"));
var elliptic_1 = require("elliptic");
var transaction_model_1 = __importDefault(require("../models/transaction.model"));
var ellipticCurve = new elliptic_1.ec("secp256k1");
var nodeAddress = v1_1.default()
    .split("-")
    .join("");
var bitcoin = new blockchain_model_1.default();
exports.getBlockchain = function (req, res) {
    res.json(bitcoin);
};
exports.createTransaction = function (req, res) {
    var _a = req.body.data, fromAddress = _a.fromAddress, toAddress = _a.toAddress, amount = _a.amount, id = _a.id, signature = _a.signature;
    var newTransaction = new transaction_model_1.default(fromAddress, toAddress, amount);
    if (id)
        newTransaction.id = id;
    if (signature)
        newTransaction.signature = signature;
    if (!newTransaction.isValid() && newTransaction.fromAddress !== "0") {
        // TODO: de momento
        return res.json({ message: "Transaction is not valid" });
    }
    try {
        var blockIndex = bitcoin.addTransaction(newTransaction);
        res.json({ message: "Transaction will be added in block " + blockIndex });
    }
    catch (error) {
        res.json({ message: error.message });
    }
};
exports.broadcastTransaction = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, amount, fromAddress, toAddress, signature, id, newTransaction, promises, error_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = req.body, amount = _a.amount, fromAddress = _a.fromAddress, toAddress = _a.toAddress, signature = _a.signature, id = _a.id;
                newTransaction = new transaction_model_1.default(fromAddress, toAddress, amount);
                if (id)
                    newTransaction.id = id;
                if (signature)
                    newTransaction.signature = signature;
                if (!newTransaction.isValid() && newTransaction.fromAddress !== "0") {
                    // TODO: de momento
                    return [2 /*return*/, res.json({ message: "Transaction is not valid." })];
                }
                bitcoin.addTransaction(newTransaction);
                promises = [];
                bitcoin.networkNodes.forEach(function (networkNodeUrl) {
                    var promise = axios_1.default.post(networkNodeUrl + "/transaction", {
                        data: newTransaction
                    });
                    promises.push(promise);
                });
                _b.label = 1;
            case 1:
                _b.trys.push([1, 3, , 4]);
                return [4 /*yield*/, Promise.all(promises)];
            case 2:
                _b.sent();
                return [2 /*return*/, res.json({
                        message: "Transaction created and broadcast successfully."
                    })];
            case 3:
                error_1 = _b.sent();
                return [2 /*return*/, res.status(500).send({ error: error_1 })];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.mine = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var promises, rewardTransaction, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                bitcoin.minePendingTransactions("0000"); // TODO: HARDCODE
                promises = [];
                bitcoin.networkNodes.forEach(function (networkNodeUrl) {
                    var promise = axios_1.default.post(networkNodeUrl + "/receive-new-block", {
                        data: { newBlock: Object.assign({}, bitcoin.getLatestBlock()) }
                    });
                    promises.push(promise);
                });
                _a.label = 1;
            case 1:
                _a.trys.push([1, 4, , 5]);
                return [4 /*yield*/, Promise.all(promises)];
            case 2:
                _a.sent();
                rewardTransaction = new transaction_model_1.default("0", nodeAddress, 12.5);
                return [4 /*yield*/, axios_1.default.post(bitcoin.currentNodeUrl + "/transaction/broadcast", Object.assign({}, rewardTransaction))];
            case 3:
                _a.sent();
                return [2 /*return*/, res.json({
                        message: "New block mined successfully.",
                        block: bitcoin.getLatestBlock()
                    })];
            case 4:
                error_2 = _a.sent();
                return [2 /*return*/, res.status(500).send({ error: error_2 })];
            case 5: return [2 /*return*/];
        }
    });
}); };
exports.receiveNewBlock = function (req, res) {
    var newBlock = req.body.data.newBlock;
    var lastBlock = bitcoin.getLatestBlock();
    var correctHash = lastBlock.hash === newBlock.previousHash;
    //const correctIndex = lastBlock.index + 1 === newBlock.index; //TODO:
    // TODO: comprobar que el nonce es el correcto
    if (correctHash) {
        // && correctIndex) {
        bitcoin.chain.push(newBlock);
        bitcoin.pendingTransactions = [];
        return res.json({
            message: "New block received and accepted.",
            newBlock: newBlock
        });
    }
    else {
        return res.json({
            message: "New block rejected.",
            newBlock: newBlock
        });
    }
};
exports.registerAndBroadcastNode = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var newNodeUrl, promises, error_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                newNodeUrl = req.body.newNodeUrl;
                // TODO: controlar el else
                if (!bitcoin.networkNodes.includes(newNodeUrl))
                    bitcoin.networkNodes.push(newNodeUrl);
                promises = [];
                bitcoin.networkNodes.forEach(function (networkNodeUrl) {
                    var promise = axios_1.default.post(networkNodeUrl + "/register-node", {
                        data: { newNodeUrl: newNodeUrl }
                    });
                    promises.push(promise);
                });
                _a.label = 1;
            case 1:
                _a.trys.push([1, 4, , 5]);
                return [4 /*yield*/, Promise.all(promises)];
            case 2:
                _a.sent();
                return [4 /*yield*/, axios_1.default.post(newNodeUrl + "/register-nodes-bulk", {
                        data: {
                            allNetworkNodes: __spreadArrays(bitcoin.networkNodes, [bitcoin.currentNodeUrl])
                        }
                    })];
            case 3:
                _a.sent();
                return [2 /*return*/, res.json({
                        message: "New node registered with network successfully."
                    })];
            case 4:
                error_3 = _a.sent();
                return [2 /*return*/, res.status(500).send({ error: error_3 })];
            case 5: return [2 /*return*/];
        }
    });
}); };
exports.registerNode = function (req, res) {
    var newNodeUrl = req.body.data.newNodeUrl; // TODO: acabo de poner el data
    var nodeNotAlreadyPresent = !bitcoin.networkNodes.includes(newNodeUrl);
    var notCurrentNode = bitcoin.currentNodeUrl !== newNodeUrl;
    if (nodeNotAlreadyPresent && notCurrentNode) {
        bitcoin.networkNodes.push(newNodeUrl);
    }
    return res.json({ message: "New node registered successfully." });
};
exports.registerNodesBulk = function (req, res) {
    var allNetworkNodes = req.body.data.allNetworkNodes;
    allNetworkNodes.forEach(function (networkNodeUrl) {
        var nodeNotAlreadyPresent = !bitcoin.networkNodes.includes(networkNodeUrl);
        var notCurrentNode = bitcoin.currentNodeUrl !== networkNodeUrl;
        if (nodeNotAlreadyPresent && notCurrentNode) {
            bitcoin.networkNodes.push(networkNodeUrl);
        }
    });
    return res.json({ message: "Bulk registration successful." });
};
exports.consensus = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var promises, blockchains, currentChainLenght, maxChainLength_1, newLongestChain_1, newPendingTransactions_1, error_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                promises = [];
                bitcoin.networkNodes.forEach(function (networkNodeUrl) {
                    promises.push(axios_1.default.get(networkNodeUrl + "/blockchain"));
                });
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, Promise.all(promises)];
            case 2:
                blockchains = _a.sent();
                currentChainLenght = bitcoin.chain.length;
                maxChainLength_1 = currentChainLenght;
                newLongestChain_1 = null;
                newPendingTransactions_1 = null;
                blockchains.forEach(function (blockchain) {
                    blockchain = JSON.parse(blockchain);
                    if (blockchain.chain.length > maxChainLength_1) {
                        maxChainLength_1 = blockchain.chain.length;
                        newLongestChain_1 = blockchain.chain;
                        newPendingTransactions_1 = blockchain.pendingTransactions;
                    }
                });
                if (!newLongestChain_1 ||
                    (newLongestChain_1 && !bitcoin.isChainValid(newLongestChain_1))) {
                    return [2 /*return*/, res.json({
                            message: "Current chain has not been replaced.",
                            chain: bitcoin.chain
                        })];
                }
                else {
                    bitcoin.chain = newLongestChain_1;
                    if (newPendingTransactions_1) {
                        bitcoin.pendingTransactions = newPendingTransactions_1;
                    }
                    return [2 /*return*/, res.json({
                            message: "This chain has been replaced",
                            chain: bitcoin.chain
                        })];
                }
                return [3 /*break*/, 4];
            case 3:
                error_4 = _a.sent();
                return [2 /*return*/, res.status(500).send({ error: error_4 })];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.findBlock = function (req, res) {
    var blockHash = req.params.blockHash;
    var block = bitcoin.getBlock(blockHash);
    if (block)
        return res.json({ block: block });
    return res.json({ message: "There is no block with this hash." });
};
exports.findTransaction = function (req, res) {
    var transactionId = req.params.transactionId;
    var transaction = bitcoin.getTransaction(transactionId);
    if (!transaction) {
        return res
            .status(404)
            .json({ message: "There is no transaction with this identifier." }); // TODO: test this endpoint
    }
    return res.json({
        transaction: transaction
    });
};
exports.findAddress = function (req, res) {
    var address = req.params.address;
    var balance = bitcoin.getBalanceOfAddress(address);
    return res.json({ balance: balance });
};
