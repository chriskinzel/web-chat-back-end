export interface CommandListenerEvent<T = any> {
    data: T;
}

export type CommandHandler<T> = (event: CommandListenerEvent<T>, ...args: string[]) => void;

interface CommandListener<T> {
    command: RegExp | string;
    handler: CommandHandler<T>;
}

export class CommandParser {
    private readonly registeredCommands: CommandListener<any>[] = [];

    public on<T>(command: RegExp | string, handler: CommandHandler<T>) {
        this.registeredCommands.push({command: command, handler: handler});
    }

    public parseCommand(command: string, data?: any) {
        for (const commandListner of this.registeredCommands) {
            if (typeof commandListner.command === 'string' && commandListner.command === command) {
                commandListner.handler({data: data});
                return;
            } else if (commandListner.command instanceof RegExp && commandListner.command.test(command)) {
                const args = command.match(commandListner.command).slice(1);
                commandListner.handler({data: data}, ...args);
                return;
            }
        }

        throw 'Invalid Command';
    }
}
