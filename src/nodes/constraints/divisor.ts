import { In } from "../../compile/compile.js"
import type { Node } from "../node.js"
import { defineNodeKind } from "../node.js"

export type DivisorNode = Node<"divisor", number>

export const DivisorNode = defineNodeKind<DivisorNode>({
    kind: "divisor",
    compile: (rule) => `${In} % ${rule} === 0`,
    intersect: (l, r): DivisorNode =>
        DivisorNode(
            Math.abs((l.rule * r.rule) / greatestCommonDivisor(l.rule, r.rule))
        ),
    describe: (node) => `a multiple of ${node.rule}`
})

// compile: (n, condition, s) => s.ifNotThen(condition, s.problem("divisor", n))

// https://en.wikipedia.org/wiki/Euclidean_algorithm
const greatestCommonDivisor = (l: number, r: number) => {
    let previous
    let greatestCommonDivisor = l
    let current = r
    while (current !== 0) {
        previous = current
        current = greatestCommonDivisor % current
        greatestCommonDivisor = previous
    }
    return greatestCommonDivisor
}
