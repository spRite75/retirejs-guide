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

const { components, errors } = analyseRetireJSONResult(retireResults);

components.forEach((result, key) => {
    console.log(chalk.yellow(key));
    console.log('\t', `oldest version found:\t\t${result.currentLowestVersion}`);
    console.log('\t', `minimum required version:\t${result.minimumRequiredVersion}`);
    console.log('\t', `highest severity:\t\t${result.highestSeverity}`);
    console.log('\t', `affected file/s:`);
    result.affectedFiles.forEach(file => {
        console.log('\t\t', file);
    });
    console.log();
});

if (errors.length > 0) {
    console.log(chalk.red(`${errors.length} vulnerabilities had errors and could not be processed:`));
    console.log(chalk.red('--'));
    errors.forEach((error) => {
        console.log(error);
        console.log(chalk.red('--'));
    })
}
