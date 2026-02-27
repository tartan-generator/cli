export type FormattableNode = {
    value: string;
    children: FormattableNode[];
};

export function renderTree<T>(
    node: T,
    transform: (node: T, parent?: T) => { value: string; children: T[] },
): string {
    return getStringsForNode<T>(node, transform).join("\n");
}

function getStringsForNode<T>(
    node: T,
    transform: (node: T, parent?: T) => { value: string; children: T[] },
    parent?: T,
): string[] {
    const transformed = transform(node, parent);
    const values: string[] = [transformed.value];
    const children: string[][] = transformed.children.map((child) =>
        getStringsForNode(child, transform, node),
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
