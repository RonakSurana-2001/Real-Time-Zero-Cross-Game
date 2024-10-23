"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
const FRONTEND_PORT = process.env.PORT || 5143;
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
});
app.listen(FRONTEND_PORT, () => {
    console.log("Frontend Running on port 5143");
});
