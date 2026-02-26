import { describe, expect, it, vi } from "vitest";
import { mockAllPhases, mockConfig } from "../util/mocks.js";
import { makeTempFiles } from "../util/fs.js";
import path from "node:path";
import build from "../../src/commands/build.js";
import { ArgumentsCamelCase } from "yargs";
import { TartanArgs } from "../../src/program.js";
import { readFile } from "node:fs/promises";
import { createLogger } from "winston";
import {
    ContextTreeNode,
    NullTransport,
    ProcessedNode,
    ResolvedNode,
} from "@tartan/core";
import { Writable } from "node:stream";
import { TartanConfig } from "../../src/exports.js";

describe("The build command", () => {
    it("should call the config util", async () => {
        const tmpDir = await makeTempFiles({});
        const configSpy = mockConfig({
            sourceDirectory: path.join(tmpDir, "src"),
            outputDirectory: path.join(tmpDir, "dist"),
            rootContext: {
                pageMode: "directory",
                pageSource: "index.html",
            },
        });
        const phaseMocks = mockAllPhases();
        for (const mock of Object.values(phaseMocks)) {
            // @ts-ignore
            mock.mockResolvedValue("waow");
        }

        await build.handler({} as ArgumentsCamelCase<TartanArgs>);

        expect(configSpy).toHaveBeenCalledOnce();
    });
    it("should build a rly basic site", async () => {
        const tmpDir = await makeTempFiles({
            "src/index": "hello world",
        });
        const configSpy = mockConfig({
            sourceDirectory: path.join(tmpDir, "src"),
            outputDirectory: path.join(tmpDir, "dist"),
            rootContext: {
                pageMode: "directory",
                pageSource: "index",
            },
        });

        await build.handler({} as ArgumentsCamelCase<TartanArgs>, {
            stdout: new Writable(),
            logger: createLogger({ transports: [new NullTransport()] }),
        });

        const outputtedFile: string = await readFile(
            path.join(tmpDir, "dist", "index.html"),
        ).then((val) => val.toString());

        expect(outputtedFile).toBe("hello world");
    });
    it("should call all the functions in the right way", async () => {
        const config: TartanConfig = {
            sourceDirectory: "source",
            outputDirectory: "output",
            rootContext: {
                pageMode: "directory",
                pageSource: "index",
            },
        };
        mockConfig(config);
        const phaseMocks = mockAllPhases();
        const fakeNode = {
            id: "fakeid",
        };
        phaseMocks.discovery.mockResolvedValue(
            fakeNode as ContextTreeNode<"page">,
        );
        phaseMocks.processing.mockResolvedValue(fakeNode as ProcessedNode);
        phaseMocks.resolving.mockReturnValue(fakeNode as ResolvedNode);
        phaseMocks.finalizing.mockResolvedValue(fakeNode as ResolvedNode);
        phaseMocks.output.mockResolvedValue(fakeNode as ResolvedNode);

        await build.handler({} as ArgumentsCamelCase<TartanArgs>, {
            stdout: new Writable(),
            logger: createLogger({ transports: [new NullTransport()] }),
        });

        expect(phaseMocks.processing).toBeCalledWith(
            expect.objectContaining({ node: fakeNode }),
        );
        expect(phaseMocks.resolving).toBeCalledWith(
            fakeNode,
            //expect.objectContaining({ node: fakeNode }),
        );
        expect(phaseMocks.finalizing).toBeCalledWith(
            expect.objectContaining({ node: fakeNode }),
        );
        expect(phaseMocks.output).toBeCalledWith(fakeNode, expect.anything());
    });
});
