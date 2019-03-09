export type CommandHandler = (...args: string[]) => void;

export class InvalidCommandError extends Error {
    constructor() {
        super('Invalid command');
    }
}

interface CommandListener {
    commandName: string;
    argumentsFormat: RegExp[];
    handler: CommandHandler;
    errorHandler: CommandHandler;
}

export class CommandParser {
    private readonly registeredCommands: CommandListener[] = [];

    public on<T>(commandName: string, handler: CommandHandler, errorHandler?: CommandHandler)
    public on<T>(commandName: string,
                 argumentsFormat: RegExp[],
                 handler: CommandHandler,
                 errorHandler?: CommandHandler);
    public on<T>(commandName: string,
                 argumentsFormatOrHandler: RegExp[] | CommandHandler,
                 handlerOrErrorHandler?: CommandHandler,
                 errorHandler?: CommandHandler) {
        if (Array.isArray(argumentsFormatOrHandler)) {
            const argumentsFormat = argumentsFormatOrHandler as RegExp[];

            this.registeredCommands.push({
                commandName: commandName,
                argumentsFormat: argumentsFormat,
                handler: handlerOrErrorHandler,
                errorHandler: errorHandler
            });
        } else {
            const handler = argumentsFormatOrHandler as CommandHandler;

            this.registeredCommands.push({
                commandName: commandName,
                argumentsFormat: [],
                handler: handler,
                errorHandler: handlerOrErrorHandler
            });
        }
    }

    public parseCommand(command: string) {
        for (const commandListener of this.registeredCommands) {
            const escapedCommandName = escapeRegExp(commandListener.commandName);

            const abstractArgumentFormat = new Array(commandListener.argumentsFormat.length)
                .fill(undefined)
                .map((_, index) => commandListener.argumentsFormat[index].source.slice(-1) !== '?'
                    ? '\\s+(.+)'
                    : '(?:\\s+(.+))?')
                .join('');

            const commandAbstractFormatRegex = new RegExp(
                `^\\\\${escapedCommandName}(?:${abstractArgumentFormat})?\\s*$`
            );

            if (commandAbstractFormatRegex.test(command)) {
                const argumentsFormat = commandListener.argumentsFormat
                    .map(regex => regex.source.slice(-1) !== '?'
                        ? `\\s+(${regex.source})`
                        : `(?:\\s+(${regex.source.slice(0, -1)}))?`)
                    .join('');

                const commandRegex = new RegExp(`^\\\\${escapedCommandName}${argumentsFormat}\\s*$`);

                if (commandRegex.test(command)) {
                    const args = command.match(commandRegex).slice(1);
                    commandListener.handler(...args);
                } else if (commandListener.errorHandler) {
                    const args = command.match(commandAbstractFormatRegex).slice(1);
                    commandListener.errorHandler(...args);
                } else {
                    throw new InvalidCommandError();
                }

                return;
            }
        }

        throw new InvalidCommandError();
    }
}

/**
 * Code from https://stackoverflow.com/questions/3561493/is-there-a-regexp-escape-function-in-javascript/3561711#3561711
 */
function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}
