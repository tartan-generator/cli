import { afterEach, Mock, vi } from "vitest";
import { TartanConfig } from "../../src/exports.js";
import * as config from "../../src/util/config.js";
import * as tartan from "@tartan/core";

vi.mock("@tartan/core", async (importOriginal) => ({
    ...(await importOriginal()),
}));

afterEach(() => {
    vi.restoreAllMocks();
});

export function mockConfig(
    mockValue: TartanConfig,
): Mock<typeof config.loadConfig> {
    return vi.spyOn(config, "loadConfig").mockResolvedValue(mockValue);
}

type CoreMocks = {
    discovery: Mock<typeof tartan.loadContextTreeNode>;
    processing: Mock<typeof tartan.processNode>;
    resolving: Mock<typeof tartan.resolveNode>;
    finalizing: Mock<typeof tartan.finalizeNode>;
    output: Mock<typeof tartan.outputNode>;
};

export function mockPhase<T extends keyof CoreMocks>(phase: T): CoreMocks[T] {
    switch (phase) {
        case "discovery":
            return vi.spyOn(tartan, "loadContextTreeNode") as CoreMocks[T];
        case "processing":
            return vi.spyOn(tartan, "processNode") as CoreMocks[T];
        case "resolving":
            return vi.spyOn(tartan, "resolveNode") as CoreMocks[T];
        case "finalizing":
            return vi.spyOn(tartan, "finalizeNode") as CoreMocks[T];
        case "output":
            return vi.spyOn(tartan, "outputNode") as CoreMocks[T];
    }
}

export function mockAllPhases(): CoreMocks {
    return {
        discovery: mockPhase("discovery"),
        processing: mockPhase("processing"),
        resolving: mockPhase("resolving"),
        finalizing: mockPhase("finalizing"),
        output: mockPhase("output"),
    };
}
