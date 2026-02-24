import { defineConfig } from "vitest/config";
import { exec as exec_cp } from "node:child_process";
import { readFile } from "node:fs/promises";
import { promisify } from "node:util";

const exec = promisify(exec_cp);

const packageVersion = await readFile("./package.json").then(
    (file) => JSON.parse(file.toString()).version,
);

export default defineConfig({
    test: {
        environment: "node",
        include: ["tests/**/*.test.ts"],
    },
    define: {
        PACKAGE_VERSION: `"${packageVersion}"`,
    },
});
