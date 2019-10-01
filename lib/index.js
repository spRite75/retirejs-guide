#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var clear_1 = __importDefault(require("clear"));
var commander_1 = __importDefault(require("commander"));
clear_1.default();
commander_1.default
    .version('0.0.1')
    .option('-r --result <file>', 'json file to parse')
    .parse(process.argv);
console.log(commander_1.default.result);
