import { TartanArgs } from "../program.js";
import { loadConfig, TartanConfig } from "../util/config.js";
import { useOutput, TestableCommandModule } from "../util/outputs.js";
import { inspect } from "node:util";

const module: TestableCommandModule<{}, TartanArgs> = {
    command: "build",
    describe: "Build a tartan project",
    handler: async (args, output) => {
        const { logger, stdout } = useOutput(output);
        const config: TartanConfig = await loadConfig(args, logger);

        logger.debug(`using config\n${inspect(config, { colors: true })}`);
        // I'll implement stuff later
    },
};

export default module;
