import yargs from "yargs";
import build from "./commands/build.js";
import show from "./commands/show.js";

declare const PACKAGE_VERSION: string;

export type TartanArgs = {
    config: string;
    source?: string;
    output?: string;
    rootContext?: string;
};

export function createTartan(version?: string) {
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
            .command(show)
            .demandCommand()

            // extra
            .version(`CLI v${version ?? PACKAGE_VERSION}`)
            .alias("version", "V")
            .help()
            .alias("help", "h")
            .strict()
            .completion()
    );
}
