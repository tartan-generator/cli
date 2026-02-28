import { expect, it } from "vitest";
import { createTartan } from "../src/program.js";

it("should log version in the right format", async () => {
    let a: string = "";
    createTartan("0.0.0").showVersion((version) => (a = version));

    expect(a.toString()).toMatch(/^CLI v\d+\.\d+\.\d+$/);
});
