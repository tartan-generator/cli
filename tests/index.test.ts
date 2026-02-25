import { expect, it } from "vitest";
import { createTartan } from "../src/program.js";

it("should log version in the right format", async () => {
    let a: string = "";
    createTartan().showVersion((version) => (a = version));

    expect(a.toString()).toMatch(/^CLI v\d+\.\d+\.\d+$/);
});
