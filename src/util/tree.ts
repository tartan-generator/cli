export type FormattableNode = {
    value: string;
    children: FormattableNode[];
};

export function renderTree(node: FormattableNode): string {
    return getStringsForNode(node).join("\n");
}

function getStringsForNode(node: FormattableNode): string[] {
    const values: string[] = [node.value];
    const children: string[][] = node.children.map((child) =>
        getStringsForNode(child),
    );

    children.forEach((child, i) => {
        const last: boolean = i === children.length - 1;

        values.push((last ? "└──" : "├──") + child[0]);
        values.push(
            ...child.slice(1).map((val) => (last ? "    " : "│   ") + val),
        );
    });

    return values;
}
