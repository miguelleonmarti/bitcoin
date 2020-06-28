"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var block_model_1 = __importDefault(require("../models/block.model"));
var mockBlock;
describe("Block model methods", function () {
    beforeAll(function () {
        mockBlock = new block_model_1.default([], "0");
    });
    test("Calculate hash", function () {
        mockBlock.id = "0";
        mockBlock.timestamp = 1586967497007;
        mockBlock.nonce = 0;
        expect(mockBlock.calculateHash()).toEqual("7dbd505d358dca188c333293495cb45b220b1993eba0248cd82c16672d5954df");
    }),
        test("Identifier correct format", function () {
            var identifier = mockBlock.generateId();
            expect(identifier).toHaveLength(32);
            expect(identifier).not.toContain('-');
        }),
        test("Mine algorithm (difficulty = 3)", function () {
            mockBlock.id = "0";
            mockBlock.timestamp = 1586967497007;
            mockBlock.nonce = 0;
            mockBlock.mine(3);
            expect(mockBlock.hash.substring(0, 3)).toEqual("000");
            expect(mockBlock.nonce).toEqual(2846);
        });
    test("Mine algorithm (difficulty = 4)", function () {
        mockBlock.id = "0";
        mockBlock.timestamp = 1586967497007;
        mockBlock.nonce = 0;
        mockBlock.mine(4);
        expect(mockBlock.hash.substring(0, 4)).toEqual("0000");
        expect(mockBlock.nonce).toEqual(4067);
    });
    test("Mine algorithm (difficulty = 5)", function () {
        mockBlock.id = "0";
        mockBlock.timestamp = 1586967497007;
        mockBlock.nonce = 0;
        mockBlock.mine(5);
        expect(mockBlock.hash.substring(0, 5)).toEqual("00000");
        expect(mockBlock.nonce).toEqual(548969);
    });
});
