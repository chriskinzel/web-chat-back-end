export interface CommandListenerEvent<T = any> {
    data: T;
}

export type CommandHandler<T> = (event: CommandListenerEvent<T>, ...args: string[]) => void;

interface CommandListener<T> {
    commandName: string;
    argumentsFormat: RegExp[];
    handler: CommandHandler<T>;
    errorHandler: CommandHandler<T>;
}

export class CommandParser {
    private readonly registeredCommands: CommandListener<any>[] = [];

    public on<T>(commandName: string, handler: CommandHandler<T>, errorHandler?: CommandHandler<T>)
    public on<T>(commandName: string,
                 argumentsFormat: RegExp[],
                 handler: CommandHandler<T>,
                 errorHandler?: CommandHandler<T>);
    public on<T>(commandName: string,
                 argumentsFormatOrHandler: RegExp[] | CommandHandler<T>,
                 handlerOrErrorHandler?: CommandHandler<T>,
                 errorHandler?: CommandHandler<T>) {
        if (Array.isArray(argumentsFormatOrHandler)) {
            const argumentsFormat = argumentsFormatOrHandler as RegExp[];

            this.registeredCommands.push({
                commandName: commandName,
                argumentsFormat: argumentsFormat,
                handler: handlerOrErrorHandler,
                errorHandler: errorHandler
            });
        } else {
            const handler = argumentsFormatOrHandler as CommandHandler<T>;

            this.registeredCommands.push({
                commandName: commandName,
                argumentsFormat: [],
                handler: handler,
                errorHandler: handlerOrErrorHandler
            });
        }
    }

    public parseCommand(command: string, data?: any) {
        for (const commandListener of this.registeredCommands) {
            const escapedCommandName = escapeRegExp(commandListener.commandName);

            const abstractArgumentFormat = new Array(commandListener.argumentsFormat.length)
                .fill(undefined)
                .map((_, index) => commandListener.argumentsFormat[index].source.slice(-1) !== '?'
                    ? '\\s+(.+)'
                    : '(?:\\s+(.+))?')
                .join('');

            const commandAbstractFormatRegex = (commandListener.argumentsFormat.length === 0)
                ? new RegExp(`^\\\\${escapedCommandName}\\s*$`)
                : new RegExp(`^\\\\${escapedCommandName}${abstractArgumentFormat}\\s*$`);

            if (commandAbstractFormatRegex.test(command)) {
                const argumentsFormat = commandListener.argumentsFormat
                    .map(regex => regex.source.slice(-1) !== '?'
                        ? `\\s+(${regex.source})`
                        : `(?:\\s+(${regex.source.slice(0, -1)}))?`)
                    .join('');

                const commandRegex = (commandListener.argumentsFormat.length === 0)
                    ? new RegExp(`^\\\\${escapedCommandName}\\s*$`)
                    : new RegExp(`^\\\\${escapedCommandName}${argumentsFormat}\\s*$`);

                if (commandRegex.test(command)) {
                    const args = command.match(commandRegex).slice(1);
                    commandListener.handler({data: data}, ...args);
                } else if (commandListener.errorHandler) {
                    const args = command.match(commandAbstractFormatRegex).slice(1);
                    commandListener.errorHandler({data: data}, ...args);
                } else {
                    throw 'Invalid Command';
                }

                return;
            }
        }

        throw 'Invalid Command';
    }
}

/**
 * Code from https://stackoverflow.com/questions/3561493/is-there-a-regexp-escape-function-in-javascript/3561711#3561711
 */
function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}
