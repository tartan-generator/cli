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
    ProcessedNode,
    ResolvedNode,
    loadContextTreeNode,
    processNode,
    resolveNode,
    finalizeNode,
    outputNode,
    NullTransport,
} from "@tartan/core";
import { createLogger } from "winston";

export default <TestableCommandModule<{}, TartanArgs>>{
    command: "build",
    describe: "Build a tartan project",
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
            const processed: ProcessedNode = await processNode({
                node,
                rootContext: config.rootContext,
                sourceDirectory: config.sourceDirectory,
                baseLogger,
            });
            const resolved: ResolvedNode = resolveNode(processed);
            const finalized: ResolvedNode = await finalizeNode({
                node: resolved,
                sourceDirectory: config.sourceDirectory,
            });
            await outputNode(finalized, config.outputDirectory);
        } catch (err: any) {
            logger.error(formatError(err));
        }
    },
};
