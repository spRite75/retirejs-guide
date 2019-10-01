#!/usr/bin/env node
import chalk from 'chalk';
import clear from 'clear';
import figlet from 'figlet';
import path from 'path';
import program from 'commander';
import { readFileSync } from 'fs';
import { analyseRetireJSONResult } from './retire-json-result';

program
    .version('0.0.1')
    .option('-r --result <file>', 'json file to parse')
    .parse(process.argv);

const resultsFile = "" + program.result;

if (!resultsFile.endsWith('.json')) {
    console.log(chalk.red('Please specify a retire results json file with -r'));
    process.exit(1);
}

const retireResults = JSON.parse(readFileSync(resultsFile, ''));

console.log(analyseRetireJSONResult(retireResults));
