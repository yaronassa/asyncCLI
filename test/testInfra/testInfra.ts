class TestInfra {
    public static sharedStorage: {[name: string]: any} = {};

    public static buildRunArgs(commandName: string, args: string[] = []) {
        return [commandName].concat(args);
    }
}

export {TestInfra};
