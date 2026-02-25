import { defineConfig } from "vitest/config";
import { getVersion } from "./build/util";

export default defineConfig({
    test: {
        environment: "node",
        include: ["tests/**/*.test.ts"],
    },
    define: {
        PACKAGE_VERSION: `"${await getVersion()}"`,
    },
});
