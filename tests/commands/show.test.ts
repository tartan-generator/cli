import { describe, expect, it } from "vitest";
import { makeTempFiles } from "../util/fs.js";
import { NullTransport, TartanContextFile } from "@tartan/core";
import show from "../../src/commands/show.js";
import { ArgumentsCamelCase } from "yargs";
import { TartanArgs } from "../../src/program.js";
import { createLogger } from "winston";
import { PassThrough } from "node:stream";
import { mockConfig } from "../util/mocks.js";
import path from "node:path";
import { text } from "node:stream/consumers";

describe("the show command", () => {
    it("should render the tree correctly", async () => {
        const tmpDir = await makeTempFiles({
            "src/index": "",
            // have to set default context because of an upstream bug
            "src/tartan.context.default.json": JSON.stringify(<
                TartanContextFile
            >{
                pageMode: "file",
                pagePattern: "*.child",
            }),
            "src/sub-page/index": "",
            "src/assets/tartan.context.default.json": JSON.stringify(<
                TartanContextFile
            >{ pageMode: "asset", pagePattern: "asset*" }),
            "src/assets/asset-a": "",
            "src/assets/asset-b": "",
            "src/assets/sub-assets/asset": "",
            "src/handoff/tartan.context.json": JSON.stringify(<
                TartanContextFile
            >{ pageMode: "handoff" }),
        });
        const expected: string = `${path.join(path.relative(".", tmpDir), "src")} (page)
├──assets (page)
│   ├──asset-a (asset)
│   ├──asset-b (asset)
│   └──sub-assets (page)
│       └──asset (asset)
├──handoff (handoff)
└──sub-page (page)
`;
        mockConfig({
            sourceDirectory: path.join(tmpDir, "src"),
            outputDirectory: path.join(tmpDir, "dist"),
            rootContext: {
                pageMode: "directory",
                pageSource: "index",
            },
        });

        const stdout: PassThrough = new PassThrough();
        (
            show.handler({} as ArgumentsCamelCase<TartanArgs>, {
                logger: createLogger({ transports: [new NullTransport()] }),
                stdout,
            }) as Promise<void>
        ).then(() => stdout.end());

        const output: string = (await text(stdout)).toString();

        expect(output).toBe(expected);
    });
});
