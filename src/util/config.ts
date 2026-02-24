import {
    FullTartanContext,
    initializeContext,
    loadObject,
    PartialTartanContext,
    TartanContextFile,
    TartanInput,
} from "@tartan/core";
import { TartanArgs } from "../program.js";
import { Logger } from "winston";
import path from "node:path";

export type TartanConfigFile = {
    /**
     * The root of the website's source directory.
     */
    sourceDirectory?: string;
    /**
     * The directory to output files to.
     */
    outputDirectory?: string;
    /**
     * Either a module specifier pointing at an object file that provides an unitialized context object, or the uninitialized object itself.
     */
    rootContext?: string | TartanContextFile;
};

export type TartanConfigParams = Omit<TartanConfigFile, "rootContext"> & {
    rootContext?: string;
};

export type TartanConfig = Required<
    Omit<TartanConfigFile, "rootContext"> & {
        /**
         * A fully initialized context object to use as the root.
         */
        rootContext: FullTartanContext;
    }
>;

export async function loadConfig(
    cliArgs: TartanArgs,
    logger: Logger,
): Promise<TartanConfig> {
    const configFile: TartanInput<TartanConfigFile> =
        await loadObject<TartanConfigFile>(cliArgs.config, {}, logger);

    const sourceDirectory: string = path.resolve(
        cliArgs.source ?? configFile.value.sourceDirectory ?? "src",
    );
    const outputDirectory: string = path.resolve(
        cliArgs.output ?? configFile.value.outputDirectory ?? "dist",
    );

    // loading the root context is more complex
    // for now we'll just have it inherit from a default root context, for simplicity
    const baseContext: FullTartanContext = {
        pageMode: "directory",
        pageSource: "index.html",
    };
    let contextFile: TartanInput<TartanContextFile>;
    if (cliArgs.rootContext) {
        contextFile = await loadObject<TartanContextFile>(
            cliArgs.rootContext,
            {},
            logger,
        );
    } else if (typeof configFile.value.rootContext === "string") {
        contextFile = await loadObject<TartanContextFile>(
            configFile.value.rootContext,
            {},
            logger,
        );
    } else {
        contextFile = {
            value: configFile.value.rootContext ?? {},
            url: configFile.url,
        };
    }

    const initializedContext: PartialTartanContext = await initializeContext(
        {
            "~source-directory": sourceDirectory,
        },
        contextFile,
        logger,
    ).then((val) => val.value);

    const rootContext: FullTartanContext = {
        ...baseContext,
        ...initializedContext,
    } as FullTartanContext; // I'll make guarantees later

    return {
        sourceDirectory,
        outputDirectory,
        rootContext,
    };
}
