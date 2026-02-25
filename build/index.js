import * as esbuild from "esbuild";
import { exec as exec_cp } from "node:child_process";
import { mkdir, rm } from "node:fs/promises";
import { promisify } from "node:util";
import { getVersion } from "./util.js";

const cliVersion = await getVersion();

const exec = promisify(exec_cp);

await rm("dist", { recursive: true, force: true });
await mkdir("dist");

await esbuild.build({
    entryPoints: ["./src/bin.ts", "./src/exports.ts"],
    bundle: true,
    minify: true,
    sourcemap: true,
    platform: "node",
    format: "esm",
    outdir: "dist",
    packages: "external",
    define: {
        PACKAGE_VERSION: `"${cliVersion}"`,
    },
});

if (!process.env.DEV_BUILD) {
    await exec("npx tsc --project tsconfig.buildtime.json");
}
