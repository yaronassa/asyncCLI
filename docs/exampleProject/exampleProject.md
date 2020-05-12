# Async CLI Example Project

This example project shows many of the available options when working with the Async CLI library.

While the commands themselves are still placeholders for actual real-world commands, you can learn a lot by examining the project's structure and code.

## Installation

In the example project directory, run `npm i --force`.

## Running the project

In the example project directory, execute the run script `runProject.sh` with a valid command and parameters.

For example `sh ./runProject.sh add -x=3 -y=10`.

After you go through the output, visit the project's source files and settings, to get a layout of how to structure an Async CLI project yourself.

## Items of note

### Loading a settings file

The run script uses the `--settingsFile` argument to load [a settings file](exampleSettingsFile.json) with preconfigured settings.

This can be seen in the log messages:
> Loaded settings file from ./exampleSettingsFile.json. 1 settings were loaded.

### Shared options and settings

The [ExampleCLI](src/exampleCLI.ts) class extends the libraries CLI class to add shared options and change yarg's parser config.

This is done by overriding the CLI's `.addSharedOptions` method, and extending the IBaseCLIArgs interface to keep things tidy.

### Shard command structures and operations

The project also extends the AbstractCLICommand class in [abstractExampleCLICommand](src/exampleCommands/abstractExampleCLICommand.ts).

This allows overriding the pre and post command hook, to add setup and teardown actions to all derived commands.

You can add any behaviours you'd like, including overriding the `.toYargsCommand` method, giving you complete control over when is actually called by the CLI itself (personally I think that would be an overkill, but the option is available).

### Consumable and runnable CLI

The [ExampleCLI](src/exampleCLI.ts) itself is consumable (i.e. the class is exported and can be used from another piece of code).

However, it's also know to invoke itself when it's being run directly by node.

This is achieved by using the `if (require.main === module)` trick (look at the code for the specifics).

### Configurable logger

When creating the [ExampleCLI](src/exampleCLI.ts) object, the logs root path is set to `./temp/examples/{RUN_ID}`.

Note that you can use the `{RUN_ID}` notation for a timestamp representing the run start.
Other log options are available, as well as the possibility to provide your own logger object.

See [The code documentation](https://yassa.github.io/asyncCLI/interfaces/icliinitoptions.html#loggerconfiguration) for details.
