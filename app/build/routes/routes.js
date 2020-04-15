"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var router = express_1.default.Router();
var BlockchainController = require("../controllers/blockchain.controller");
router.get("/blockchain", BlockchainController.getBlockchain);
router.post("/transaction", BlockchainController.createTransaction);
router.post("/transaction/broadcast", BlockchainController.broadcastTransaction);
router.get("/mine", BlockchainController.mine);
router.post("/receive-new-block", BlockchainController.receiveNewBlock);
// (first step) register a node and broadcast it the network (emit by new node)
// because it can cause an infinite loop
router.post("/register-and-broadcast-node", BlockchainController.registerAndBroadcastNode);
// (second step) register a node with the network (receive by other nodes)
router.post("/register-node", BlockchainController.registerNode);
// (third step) register multiple nodes at once
router.post("/register-nodes-bulk", BlockchainController.registerNodesBulk);
router.get("/consensus", BlockchainController.consensus);
router.get("/block/:blockHash", BlockchainController.findBlock);
router.get("/transaction/:transactionId", BlockchainController.findTransaction);
router.get("/address/:address", BlockchainController.findAddress);
exports.default = router;
