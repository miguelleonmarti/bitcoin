import IBlock from "../interfaces/block.interface";
import Block from "../models/block.model";

let mockBlock: IBlock;

describe("Block model methods", () => {
    beforeAll(() => {
        mockBlock = new Block([], "0")
    });
    test("Calculate hash", () => {
        mockBlock.id = "0";
        mockBlock.timestamp = 1586967497007;
        mockBlock.nonce = 0;
        expect(mockBlock.calculateHash()).toEqual("7dbd505d358dca188c333293495cb45b220b1993eba0248cd82c16672d5954df") 
    }),
    test("Identifier correct format", () => {
        const identifier = mockBlock.generateId();
        expect(identifier).toHaveLength(32);
        expect(identifier).not.toContain('-');
    }),
    test("Mine algorithm (difficulty = 3)", () => {
        mockBlock.id = "0";
        mockBlock.timestamp = 1586967497007;
        mockBlock.nonce = 0;
        mockBlock.mine(3);
        expect(mockBlock.hash.substring(0, 3)).toEqual("000")
        expect(mockBlock.nonce).toEqual(2846)
    })
    test("Mine algorithm (difficulty = 4)", () => {
        mockBlock.id = "0";
        mockBlock.timestamp = 1586967497007;
        mockBlock.nonce = 0;
        mockBlock.mine(4);
        expect(mockBlock.hash.substring(0, 4)).toEqual("0000")
        expect(mockBlock.nonce).toEqual(4067)
    })
    test("Mine algorithm (difficulty = 5)", () => {
        mockBlock.id = "0";
        mockBlock.timestamp = 1586967497007;
        mockBlock.nonce = 0;
        mockBlock.mine(5);
        expect(mockBlock.hash.substring(0, 5)).toEqual("00000")
        expect(mockBlock.nonce).toEqual(548969)
    })
})