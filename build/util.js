import { readFile } from "node:fs/promises";

export async function getVersion() {
    return readFile("./package.json").then(
        (file) => JSON.parse(file.toString()).version,
    );
}
