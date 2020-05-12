# Async CLI

[Project on GitHub](https://github.com/yaronassa/asyncCLI)

## Description

Async-CLI turns [*yargs*](https://github.com/yargs/yargs) into *yaaaaaaaaaargs*. It's an opinionated yargs wrapper, allowing you to easily create async-based CLIs, while still enjoying yargs pirate-y goodness.

It gives you

* All the parsing, grouping and options you know and love in yargs
* Built in global logger (easily overridable)
* Properly propagated async-actions
* Very lean boilerplate - Most of the nags are under the hood

## Installation

`npm i async-cli` / `yarn i async-cli` / whatever the cool kids use these days.

## TL;DR Usage

An Async-CLI project consists of two parts

* Command files that control how each CLI command should be parsed and executed (these are basically [yargs command modules](https://github.com/yargs/yargs/blob/master/docs/advanced.md#providing-a-command-module)). 
* The code file that will be actually run by node - it creates a `CLI` object and invokes its `.runFromArgs` method.

Below are simple implementation examples* for both parts:

<sup>*All examples are given in typescript. For regular javascript, just use require instead of imports (e.g. `const CLI = require('async-cli/lib/cli').CLI`).</sup>

### Build your command files by extending `AbstractCLICommand`

```typescript
import {AbstractCLICommand, Argv, IBaseCLIArgs} from "async-cli/lib/abstractCLICommand";

interface IMyCommandCLIArgs extends IBaseCLIArgs { myOption: string }

class MyCommand extends AbstractCLICommand {
    protected command = 'MyCommandName' // You can add aliases and a description

    protected buildCommandArgs(args: Argv): Argv {
        // Chain any yargs parser manipulation. For example
        return args
                .option('myOption', {default: 'someValue'});
    }

    protected async handleCommand(args: IMyCommandCLIArgs): Promise<any> {
        // Do some async things
    }   
}

export default MyCommand; //This is important
```

### Then, add the code file that will actually be run

```typescript
import {CLI} from 'async-cli/lib/cli';
    
const cli = new CLI({commandsDir: './src/cliCommands'}); // Your command files directory
await cli.runFromArgs();
```

## Beyond the TL;DR

* Read the [basic usage guide](docs/usageGuide.md)
* Go through the [example project](docs/exampleProject/exampleProject.md)
* Delve into [extending and customizing](docs/extendingGuide.md) the CLI
* Browse the [code documentation](https://yaronassa.github.io/asyncCLI)




