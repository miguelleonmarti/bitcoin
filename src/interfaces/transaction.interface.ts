import { ec } from "elliptic";

export default interface ITransaction {
    id: string;
    fromAddress: string;
    toAddress: string;
    amount: number;
    signature?: string;

    generateId: () => string;
    calculateHash: () => string;
    isValid: () => boolean;
    signTransaction: (signPrivateKey: ec.KeyPair) => string;
}