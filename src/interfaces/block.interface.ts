import ITransaction from "./transaction.interface";

export default interface IBlock {
  id: string;
  timestamp: number;
  hash: string;
  previousHash: string;
  nonce: number;
  transactions: ITransaction[];

  generateId: () => string;
  calculateHash: () => string;
  mine: (difficulty: number) => void;
  hasValidTransactions: () => boolean;
}
