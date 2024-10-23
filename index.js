"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const express_1 = __importDefault(require("express"));
const WebSocket = require('websocket').server;
const app = (0, express_1.default)();
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
});
app.listen(5143, () => {
    console.log("Frontend Running on port 5143");
});
const server = http_1.default.createServer();
const wss = new WebSocket({ "httpServer": server });
let games = {};
let clients = {};
let gameChance = {};
wss.on('request', (request) => {
    const connection = request.accept(null, request.origin);
    connection.on('open', () => console.log('Opened'));
    connection.on('close', () => console.log('Closed'));
    const clientId = guid();
    let board = {};
    let chance = {};
    let payload = {
        "method": "connect",
        "clientId": clientId
    };
    clients[clientId] = {
        "connection": connection
    };
    connection.send(JSON.stringify(payload));
    connection.on('message', (message) => {
        const result = JSON.parse(message.utf8Data);
        if (result.method == "create") {
            let gameId = guid();
            games[gameId] = {
                "id": gameId,
                "createrId": result.clientId,
                "players": []
            };
            gameChance[gameId] = 0;
            games[gameId].players.push({
                "clientId": result.clientId,
                "symbol": 'X'
            });
            payload = {
                "method": "create",
                "game": games[gameId]
            };
            chance[clientId] = {
                "key": 0
            };
            const con = clients[clientId].connection;
            con.send(JSON.stringify(payload));
        }
        else if (result.method == "join") {
            const joinerClientId = result.clientId;
            let gameidnumber = result.gameId;
            if (games[gameidnumber].players.length > 1) {
                payload = {
                    "method": "not-accept",
                };
                const con = clients[clientId].connection;
                con.send(JSON.stringify(payload));
            }
            else {
                games[gameidnumber].players.push({
                    "clientId": joinerClientId,
                    "symbol": 'O'
                });
                payload = {
                    "method": "join",
                    "joinerClientId": joinerClientId,
                    "game": games[gameidnumber]
                };
                chance[clientId] = {
                    "key": 1
                };
                games[gameidnumber].players.forEach((client) => {
                    clients[client.clientId].connection.send(JSON.stringify(payload));
                });
            }
        }
        else if (result.method == "play") {
            try {
                if (gameChance[result.gameId] == chance[clientId].key) {
                    board[result.boxId] = {
                        "clientId": clientId,
                        "symbol": games[result.gameId].players.find((p) => p.clientId === clientId).symbol
                    };
                    payload = {
                        "method": "play",
                        "board": board
                    };
                    UpdateBoard(result.gameId);
                    gameChance[result.gameId] = gameChance[result.gameId] == 0 ? 1 : 0;
                    const con = clients[clientId].connection;
                    con.send(JSON.stringify(payload));
                }
                else {
                    payload = {
                        "method": "another-player-chance",
                    };
                    const con = clients[clientId].connection;
                    con.send(JSON.stringify(payload));
                }
            }
            catch (e) {
                payload = {
                    "method": "not-accept",
                };
                const con = clients[clientId].connection;
                con.send(JSON.stringify(payload));
            }
        }
    });
    function UpdateBoard(gameidnumber) {
        payload = {
            "method": "update",
            "board": board
        };
        games[gameidnumber].players.forEach((client) => {
            clients[client.clientId].connection.send(JSON.stringify(payload));
        });
    }
});
function S4() {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
}
// then to call it, plus stitch in '4' in the third group
const guid = () => (S4() + S4() + "-" + S4() + "-4" + S4().substr(0, 3) + "-" + S4() + "-" + S4() + S4() + S4()).toLowerCase();
server.listen(3000, () => {
    console.log(new Date() + ' Server is listening on port 3000');
});
