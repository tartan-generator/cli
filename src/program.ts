import yargs from "yargs";
import build from "./commands/build.js";

declare const PACKAGE_VERSION: string;

export type TartanArgs = {
    config: string;
    source?: string;
    output?: string;
    rootContext?: string;
};

export function createTartan() {
    return (
        yargs()
            // setup
            .scriptName("tartan")

            // params
            .string("config")
            .describe("config", "A tartan object file to load config from.")
            .default("config", "tartan.config")

            .string("source")
            .describe("source", "The source directory of the project.")
            .alias("source", "src")

            .string("output")
            .describe(
                "output",
                "The directory to output the processed site to.",
            )
            .alias("output", "out")

            .string("context")
            .describe(
                "context",
                "An uninitialized context object file to use as the root context.",
            )

            // commands
            .command(build)
            .demandCommand()

            // extra
            .version(`CLI v${PACKAGE_VERSION}`)
            .alias("version", "V")
            .help()
            .alias("help", "h")
            .strict()
            .completion()
            .fail((msg, err, yargs) => {}) // without this it shows the help menu for some reason
    );
}
