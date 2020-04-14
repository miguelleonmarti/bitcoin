import ITransaction from "../interfaces/transaction.interface";
import uuid from "uuid/v1";
import sha256 from "sha256";
import { ec } from "elliptic";
const ellipticCurve = new ec("secp256k1");

export default class Transaction implements ITransaction {
  id: string;
  fromAddress: string;
  toAddress: string;
  amount: number;
  signature?: string;

  constructor(
    fromAddress: string,
    toAddress: string,
    amount: number
  ) {
    this.id = this.generateId();
    this.fromAddress = fromAddress;
    this.toAddress = toAddress;
    this.amount = amount;
  }

  generateId(): string {
    return uuid()
      .split("-")
      .join("");
  }

  signTransaction(signPrivateKey: ec.KeyPair): string {
    if (signPrivateKey.getPublic("hex") !== this.fromAddress) {
      throw new Error("You cannot sign transactions for other wallets!");
    }

    const transactionHash = this.calculateHash();
    const signature = signPrivateKey.sign(transactionHash, "base64");
    return signature.toDER("hex");
  }

  calculateHash(): string {
    return sha256(
      this.id + this.fromAddress + this.toAddress + this.amount
    ).toString();
  }

  isValid(): boolean {
    if (!this.fromAddress) return false;
    if (!this.signature || this.signature.length === 0) return false;

    const publicKey = ellipticCurve.keyFromPublic(this.fromAddress, "hex");
    return publicKey.verify(this.calculateHash(), this.signature);
  }
}
