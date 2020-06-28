import * as request from "supertest";
import app from "../server";
import IBlockchain from "../interfaces/blockchain.interface";
import Blockchain from "../models/blockchain.model";
import IBlock from "../interfaces/block.interface";
import Block from "../models/block.model";
import ITransaction from "../interfaces/transaction.interface";
import Transaction from "../models/transaction.model";

let mockBlockchain: IBlockchain;
let mockBlock: IBlock;
let mockTransaction: ITransaction;

describe("Blockchain endpoints at first", () => {
  beforeEach(() => {
    mockBlockchain = new Blockchain();
  });
  test("Get blockchain first state", async () => {
    const res = await request.agent(app).get("/blockchain");
    expect(res.status).toEqual(200);
    expect(res.body).toMatchObject(new Blockchain())
  })
  test("Mine a new block", async () => {
    const res = await request.agent(app).get("/mine");
    expect(res.status).toEqual(200);
    expect(res.body.block).toHaveProperty('id');
    expect(res.body.block).toHaveProperty('timestamp');
    expect(res.body.block).toHaveProperty('previousHash');
    expect(res.body.block).toHaveProperty('nonce');
    expect(res.body.block).toHaveProperty('transactions');
    expect(res.body.block).toHaveProperty('hash');
  }),
    afterAll(async () => {
      try {
        app.close();
      } catch (error) {
        console.log(error);
      }
    });
});
