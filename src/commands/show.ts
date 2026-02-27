import { TartanArgs } from "../program.js";
import { loadConfig, TartanConfig } from "../util/config.js";
import {
    useOutput,
    TestableCommandModule,
    formatError,
} from "../util/outputs.js";
import { inspect } from "node:util";
import {
    ContextTreeNode,
    loadContextTreeNode,
    NullTransport,
} from "@tartan/core";
import { createLogger } from "winston";
import { renderTree } from "../util/tree.js";
import path, { basename } from "node:path";

export default <TestableCommandModule<{}, TartanArgs>>{
    command: "show",
    describe: "Show the context tree that would be built",
    handler: async (args, output) => {
        const { logger, stdout } = useOutput(output);
        const config: TartanConfig = await loadConfig(args, logger);
        logger.debug(`using config\n${inspect(config, { colors: true })}`);

        try {
            const baseLogger = createLogger({
                transports: [new NullTransport()], // supress core logs by default
            });

            const node: ContextTreeNode = await loadContextTreeNode({
                directory: config.sourceDirectory,
                rootContext: config.rootContext,
                baseLogger,
            });

            const rendered: string = renderTree(node, (val, parent) => ({
                value: `${parent ? path.relative(parent.path, val.path) : path.relative(".", config.sourceDirectory)} (${val.type})`,
                children: val.children.toSorted((a, b) =>
                    basename(a.path) > basename(b.path) ? 1 : -1,
                ),
            }));

            stdout.write(rendered);
            stdout.write("\n");
        } catch (err: any) {
            logger.error(formatError(err));
        }
    },
};
