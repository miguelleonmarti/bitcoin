import IBlock from "./block.interface";
import ITransaction from "./transaction.interface";

export default interface IBlockchain {
  currentNodeUrl: string;
  chain: IBlock[];
  pendingTransactions: ITransaction[];
  networkNodes: string[];
  difficulty: number;
  miningReward: number;

  createGenesisBlock: () => void;
  minePendingTransactions: (miningRewardAddress: string) => void;
  getTransaction: (id: string) => ITransaction | undefined;
  addTransaction: (transaction: ITransaction) => number;
  addBlock: (block: IBlock) => void;
  getBlock: (hash: string) => IBlock | undefined;
  getLatestBlock: () => IBlock;
  getBalanceOfAddress: (address: string) => number;
  isChainValid: (chain: IBlock[]) => boolean;
}
