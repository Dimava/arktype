import { suite, test } from "mocha"
import { scope, type } from "../../src/main.js"
import {
    prematureRestMessage,
    writeNonArrayRestMessage
} from "../../src/parse/ast/tuple.js"
import { attest } from "../attest/main.js"

suite("tuple", () => {
    test("shallow", () => {
        const t = type(["string", "number"])
        attest(t.infer).typed as [string, number]
        attest(t.root.key).snap(
            '$arkRoot instanceof Array && typeof $arkRoot["0"] === "string" && typeof $arkRoot["1"] === "number" && $arkRoot.length === 2'
        )
    })
    test("nested", () => {
        const t = type([["string", "number"], [{ a: "boolean", b: ["null"] }]])
        attest(t.infer).typed as [
            [string, number],
            [
                {
                    a: boolean
                    b: [null]
                }
            ]
        ]
    })
    suite("variadic", () => {
        test("spreads simple arrays", () => {
            const wellRested = type(["string", "...number[]"])
            attest(wellRested.infer).typed as [string, ...number[]]
            attest(wellRested.root.key)
                .snap(`$arkRoot instanceof Array && typeof $arkRoot["0"] === "string" && $arkRoot.length === 2 && (() => {
            let valid = true;
            for(let $arkIndex = 1; $arkIndex < $arkRoot.length; $arkIndex++) {
                valid = typeof $arkRoot[$arkIndex] === "number" && valid;
            }
            return valid
        })()`)
        })
        test("tuple expression", () => {
            const wellRestedTuple = type([
                "number",
                ["...", [{ a: "string" }, "[]"]]
            ])
            attest(wellRestedTuple.infer).typed as [number, ...{ a: string }[]]
        })
        test("spreads array expressions", () => {
            const greatSpread = type([{ a: "boolean" }, "...(Date|RegExp)[]"])
            attest(greatSpread.infer).typed as [
                {
                    a: boolean
                },
                ...(RegExp | Date)[]
            ]
            attest(greatSpread.root.key).snap()
        })
        test("allows array keyword", () => {
            const types = scope({
                myArrayKeyword: "boolean[]",
                myVariadicKeyword: ["string", "...myArrayKeyword"]
            }).compile()
            attest(types.myVariadicKeyword.infer).typed as [
                string,
                ...boolean[]
            ]
        })
        test("errors on non-array", () => {
            // @ts-expect-error
            attest(() => type(["email", "...symbol"])).throwsAndHasTypeError(
                writeNonArrayRestMessage("symbol")
            )
            attest(() =>
                // @ts-expect-error
                type(["number", ["...", "string"]])
            ).throwsAndHasTypeError(writeNonArrayRestMessage("string"))
        })
        test("errors on non-last element", () => {
            // @ts-expect-error
            attest(() => type(["...number[]", "string"])).throwsAndHasTypeError(
                prematureRestMessage
            )
            attest(() =>
                // @ts-expect-error
                type([["...", "string[]"], "number"])
            ).throwsAndHasTypeError(prematureRestMessage)
        })
    })
    suite("intersections", () => {
        test("tuple", () => {
            const t = type([[{ a: "string" }], "&", [{ b: "boolean" }]])
            attest(t.root).is(type([{ a: "string", b: "boolean" }]).root)
        })
        test("array", () => {
            const tupleAndArray = type([
                [{ a: "string" }],
                "&",
                [{ b: "boolean" }, "[]"]
            ])
            const arrayAndTuple = type([
                [{ b: "boolean" }, "[]"],
                "&",
                [{ a: "string" }]
            ])
            const expected = type([{ a: "string", b: "boolean" }]).root
            attest(tupleAndArray.root).is(expected)
            attest(arrayAndTuple.root).is(expected)
        })
        test("variadic", () => {})
    })
})
