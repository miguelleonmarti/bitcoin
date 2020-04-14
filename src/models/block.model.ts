import uuid from "uuid/v1";
import sha256 from "sha256";
import IBlock from "../interfaces/block.interface";
import ITransaction from "../interfaces/transaction.interface";

export default class Block implements IBlock {
  id: string;
  timestamp: number;
  hash: string;
  previousHash: string;
  nonce: number;
  transactions: ITransaction[];

  constructor(transactions: ITransaction[], previousHash: string = "") {
    this.id = this.generateId();
    this.timestamp = Date.now();
    this.previousHash = previousHash;
    this.nonce = 0;
    this.transactions = transactions;
    this.hash = this.calculateHash();
  }

  generateId(): string {
    return uuid()
      .split("-")
      .join("");
  }

  calculateHash(): string {
    return sha256(
      this.id +
        this.timestamp +
        this.previousHash +
        this.nonce +
        JSON.stringify(this.transactions)
    ).toString();
  }

  mine(difficulty: number): void {
    while (
      this.hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")
    ) {
      this.nonce++;
      this.hash = this.calculateHash();
    }
  }

  // TODO:  mejorar con un some
  hasValidTransactions(): boolean {
    for (const transaction of this.transactions) {
      if (!transaction.isValid()) {
        return false;
      }
    }

    return true;
  }
}
