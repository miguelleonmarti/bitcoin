import IBlockchain from "../interfaces/blockchain.interface";
import IBlock from "../interfaces/block.interface";
import ITransaction from "../interfaces/transaction.interface";
import Block from "./block.model";
import Transaction from "./transaction.model";

export default class Blockchain implements IBlockchain {
  currentNodeUrl: string;
  chain: IBlock[];
  pendingTransactions: ITransaction[];
  difficulty: number;
  miningReward: number;
  networkNodes: string[];

  constructor() {
    this.currentNodeUrl = `http://localhost:${process.argv[2]}`;
    this.chain = [this.createGenesisBlock()];
    this.pendingTransactions = [];
    this.networkNodes = [];
    this.miningReward = 12.5;
    this.difficulty = 5;
  }

  createGenesisBlock(): IBlock {
    return new Block([], "0");
  }

  addTransaction(transaction: ITransaction): number {
    if (!transaction.fromAddress || !transaction.toAddress) {
      throw new Error("Transaction must include fromAddress and toAddress");
    }

    if (!transaction.isValid()) {
      throw new Error("Cannot add invalid transaction to chain");
    }

    return this.pendingTransactions.push(transaction);
  }
  
  minePendingTransactions(miningRewardAddress: string): void {
    const block = new Block(this.pendingTransactions, this.getLatestBlock().hash);
    block.mine(this.difficulty);

    this.chain.push(block);

    this.pendingTransactions = [
      new Transaction("", miningRewardAddress, this.miningReward) // TODO:  revisar lo del fromAddress
    ];
  }

  addBlock(block: IBlock): void {
    // TODO: no entiendo este método si hay otro minePendingTransactions
    block.previousHash = this.getLatestBlock().hash;
    block.mine(this.difficulty);
    this.pendingTransactions = []; // TODO: lo acabo de poner
    this.chain.push(block);
  }

  getLatestBlock(): IBlock {
    return this.chain[this.chain.length - 1];
  }

  isChainValid(chain: IBlock[]): boolean {
    const length: number = chain.length;
    for (let i = 1; i < length; i++) {
      const currentBlock: IBlock = chain[i];
      const previousBlock: IBlock = chain[i - 1];

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
  }

  // TODO:  mejorar con forEach
  getBalanceOfAddress(address: string): number {
    let balance = 0;

    for (const block of this.chain) {
      for (const transaction of block.transactions) {
        if (transaction.fromAddress === address) {
          balance -= transaction.amount;
        }

        if (transaction.toAddress === address) {
          balance += transaction.amount;
        }
      }
    }

    return balance;
  }

  getBlock(hash: string): IBlock | undefined {
    return this.chain.find((block: IBlock) => block.hash === hash);
  }

  getTransaction(id: string): ITransaction | undefined {
    this.chain.forEach((block: IBlock) => {
      const t: ITransaction | undefined = block.transactions.find(
        (transaction: ITransaction) => transaction.id === id
      );

      if (t) return t;
    });
    return undefined;
  }
}
