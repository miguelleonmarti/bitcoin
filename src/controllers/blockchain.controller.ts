import axios, { AxiosResponse } from "axios";
import uuid from "uuid/v1";
import Blockchain from "../models/blockchain.model";
import { ec } from "elliptic";
import { Response, Request } from "express";
import ITransaction from "../interfaces/transaction.interface";
import Transaction from "../models/transaction.model";
import IBlock from "../interfaces/block.interface";
import Block from "../models/block.model";
import IBlockchain from "../interfaces/blockchain.interface";
const ellipticCurve = new ec("secp256k1");
const nodeAddress = uuid()
  .split("-")
  .join("");
const bitcoin: Blockchain = new Blockchain();

export const getBlockchain = (req: Request, res: Response) => {
  res.json(bitcoin);
};

export const createTransaction = (req: Request, res: Response) => {
  const newTransaction: ITransaction = req.body;

  if (!newTransaction.isValid()) {
    return res.json({ message: "Transaction is not valid" });
  }

  try {
    const blockIndex = bitcoin.addTransaction(newTransaction);
    res.json({ message: `Transaction will be added in block ${blockIndex}` });
  } catch (error) {
    res.json({ message: error.message });
  }
};

export const broadcastTransaction = async (req: Request, res: Response) => {
  const { amount, fromAddress, toAddress, signature, id } = req.body;
  const newTransaction: ITransaction = new Transaction(
    fromAddress,
    toAddress,
    amount,
  );

  newTransaction.id = id;
  newTransaction.signature = signature;

  console.log(newTransaction);
  if (!newTransaction.isValid()) {
    return res.json({ message: "Transaction is not valid." });
  }

  console.log("Hey")
  bitcoin.addTransaction(newTransaction);

  const promises: Promise<AxiosResponse<any>>[] = [];
  bitcoin.networkNodes.forEach(networkNodeUrl => {
    const promise = axios.post(`${networkNodeUrl}/transaction`, {
      data: newTransaction
    });
    promises.push(promise);
  });

  try {
    await Promise.all(promises);
    return res.json({
      message: "Transaction created and broadcast successfully."
    });
  } catch (error) {
    return res.status(500).send({ error: error });
  }
};

export const mine = async (req: Request, res: Response) => {
  // TODO:
  const lastBlock: IBlock = bitcoin.getLatestBlock();
  const previousBlockHash: string = lastBlock.hash;

  const newBlock = bitcoin.addBlock(
    new Block(bitcoin.pendingTransactions, previousBlockHash)
  );

  const promises: Promise<AxiosResponse<any>>[] = [];
  bitcoin.networkNodes.forEach(networkNodeUrl => {
    const promise = axios.post(`${networkNodeUrl}/receive-new-block`, {
      data: { newBlock: newBlock }
    });
    promises.push(promise);
  });

  try {
    await Promise.all(promises);
    await axios.post(`${bitcoin.currentNodeUrl}/transaction/broadcast`, {
      amount: 12.5,
      fromAddress: "",
      toAddress: nodeAddress
    });
    return res.json({
      message: "New block mined successfully.",
      block: newBlock
    });
  } catch (error) {
    return res.status(500).send({ error: error });
  }
};

export const receiveNewBlock = (req: Request, res: Response) => {
  const newBlock: IBlock = req.body.newBlock;
  const lastBlock: IBlock = bitcoin.getLatestBlock();
  const correctHash: boolean = lastBlock.hash === newBlock.previousHash;
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
  } else {
    return res.json({
      message: "New block rejected.",
      newBlock: newBlock
    });
  }
};

export const registerAndBroadcastNode = async (req: Request, res: Response) => {
  const newNodeUrl = req.body.newNodeUrl;

  // TODO: controlar el else
  if (!bitcoin.networkNodes.includes(newNodeUrl))
    bitcoin.networkNodes.push(newNodeUrl);

  const promises: Promise<AxiosResponse<any>>[] = [];
  bitcoin.networkNodes.forEach(networkNodeUrl => {
    const promise: Promise<AxiosResponse<any>> = axios.post(
      `${networkNodeUrl}/register-node`,
      {
        data: { newNodeUrl: newNodeUrl }
      }
    );
    promises.push(promise);
  });

  try {
    await Promise.all(promises);
    await axios.post(`${newNodeUrl}/register-nodes-bulk`, {
      data: {
        allNetworkNodes: [...bitcoin.networkNodes, bitcoin.currentNodeUrl]
      }
    });
    return res.json({
      message: "New node registered with network successfully."
    });
  } catch (error) {
    return res.status(500).send({ error: error });
  }
};

export const registerNode = (req: Request, res: Response) => {
  const newNodeUrl = req.body.newNodeUrl;

  const nodeNotAlreadyPresent = !bitcoin.networkNodes.includes(newNodeUrl);
  const notCurrentNode = bitcoin.currentNodeUrl !== newNodeUrl;

  if (nodeNotAlreadyPresent && notCurrentNode)
    bitcoin.networkNodes.push(newNodeUrl);

  return res.json({ message: "New node registered successfully." });
};

export const registerNodesBulk = (req: Request, res: Response) => {
  const allNetworkNodes = req.body.allNetworkNodes;
  allNetworkNodes.forEach((networkNodeUrl: string) => {
    const nodeNotAlreadyPresent = !bitcoin.networkNodes.includes(
      networkNodeUrl
    );
    const notCurrentNode = bitcoin.currentNodeUrl !== networkNodeUrl;
    if (nodeNotAlreadyPresent && notCurrentNode)
      bitcoin.networkNodes.push(networkNodeUrl);
  });

  return res.json({ message: "Bulk registration successful." });
};

export const consensus = async (req: Request, res: Response) => {
  const promises: Promise<AxiosResponse<any>>[] = [];

  bitcoin.networkNodes.forEach((networkNodeUrl: string) => {
    promises.push(axios.get(`${networkNodeUrl}/blockchain`));
  });

  try {
    const blockchains = await Promise.all(promises);

    const currentChainLenght = bitcoin.chain.length;
    let maxChainLength = currentChainLenght;
    let newLongestChain = null;
    let newPendingTransactions = null;

    blockchains.forEach((blockchain: any) => {
      blockchain = JSON.parse(blockchain);
      if (blockchain.chain.length > maxChainLength) {
        maxChainLength = blockchain.chain.length;
        newLongestChain = blockchain.chain;
        newPendingTransactions = blockchain.pendingTransactions;
      }
    });

    if (
      !newLongestChain ||
      (newLongestChain && !bitcoin.isChainValid(newLongestChain))
    ) {
      return res.json({
        message: "Current chain has not been replaced.",
        chain: bitcoin.chain
      });
    } else {
      bitcoin.chain = newLongestChain;
      if (newPendingTransactions) {
        bitcoin.pendingTransactions = newPendingTransactions;
      }
      return res.json({
        message: "This chain has been replaced",
        chain: bitcoin.chain
      });
    }
  } catch (error) {
    return res.status(500).send({ error: error });
  }
};

export const findBlock = (req: Request, res: Response) => {
  const blockHash: string = req.params.blockHash;
  const block: IBlock | undefined = bitcoin.getBlock(blockHash);
  if (block) return res.json({ block: block });
  return res.json({ message: "There is no block with this hash." });
};

export const findTransaction = (req: Request, res: Response) => {
  const transactionId = req.params.transactionId;
  const transaction: ITransaction | undefined = bitcoin.getTransaction(
    transactionId
  );

  if (transaction)
    return res.json({
      transaction: transaction
    });
  return res.json({ message: "There is no transaction with this identifier." }); // TODO: test this endpoint
};

export const findAddress = (req: Request, res: Response) => {
  const address = req.params.address;
  const balance: number = bitcoin.getBalanceOfAddress(address);

  return res.json({ balance: balance });
};
