import { Writable } from "node:stream";
import { createLogger, format, Logger, transports } from "winston";
import { CommandModule } from "yargs";

export type TestableOutput = {
    logger: Logger;
    /**
     * For outputting things that aren't logs, like a representation of the context tree or smth.
     */
    stdout: Writable;
};
export type TestableCommandModule<T = {}, U = {}> = Omit<
    CommandModule<T, U>,
    "handler"
> & {
    handler: (
        ...params: [
            ...Parameters<CommandModule<T, U>["handler"]>,
            output?: TestableOutput,
        ]
    ) => ReturnType<CommandModule<T, U>["handler"]>;
};

export function useOutput(output: TestableOutput | undefined): TestableOutput {
    return (
        output ?? {
            logger: createLogger({
                format: format.combine(format.cli()),
                transports: [new transports.Console()],
            }),
            stdout: process.stdout,
        }
    );
}
