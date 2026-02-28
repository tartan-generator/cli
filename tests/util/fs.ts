import fs from "fs/promises";
import path from "path";
import { beforeAll } from "vitest";

beforeAll(async () => {
    await fs.mkdir(".tmp", { recursive: true });
});

export async function makeTempFiles(files: {
    [key: string]: string;
}): Promise<string> {
    const tmpDir: string = path.resolve(await fs.mkdtemp(".tmp/test-"));

    await Promise.all(
        Object.entries(files).map(async ([relativePath, contents]) => {
            const filePath = path.join(tmpDir, relativePath);
            await fs.mkdir(path.dirname(filePath), { recursive: true });

            await fs.writeFile(filePath, contents);
        }),
    );
    return tmpDir;
}
