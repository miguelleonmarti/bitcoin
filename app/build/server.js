"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var routes_1 = __importDefault(require("./routes/routes"));
var app = express_1.default();
var PORT;
if (process.env.PORT)
    PORT = process.env.PORT;
else if (process.argv[2])
    PORT = process.argv[2];
else
    PORT = 3000;
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: false }));
app.use("/", routes_1.default);
var server = app.listen(PORT);
exports.default = server;
