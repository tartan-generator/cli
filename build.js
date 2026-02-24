import * as esbuild from "esbuild";
import { exec as exec_cp } from "node:child_process";
import { mkdir, readFile, rm } from "node:fs/promises";
import { promisify } from "node:util";

const exec = promisify(exec_cp);

await rm("dist", { recursive: true, force: true });
await mkdir("dist");

const packageVersion = await readFile("./package.json").then(
    (file) => JSON.parse(file.toString()).version,
);

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
        PACKAGE_VERSION: `"${packageVersion}"`,
    },
});

if (!process.env.DEV_BUILD) {
    await exec("npx tsc --project tsconfig.buildtime.json");
}
