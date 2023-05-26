import type { Comparator } from "../../../nodes/constraints/range.js"
import type { Dict } from "../../../utils/records.js"

export class Scanner<Lookahead extends string = string> {
    private chars: string[]
    private i: number
    finalized = false

    constructor(def: string) {
        this.chars = [...def]
        this.i = 0
    }

    /** Get lookahead and advance scanner by one */
    shift() {
        return (this.chars[this.i++] ?? "") as Lookahead
    }

    get lookahead() {
        return (this.chars[this.i] ?? "") as Lookahead
    }

    shiftUntil(condition: Scanner.UntilCondition): string {
        let shifted = ""
        while (this.lookahead) {
            if (condition(this, shifted)) {
                if (shifted[shifted.length - 1] === Scanner.escapeToken) {
                    shifted = shifted.slice(0, -1)
                } else {
                    break
                }
            }
            shifted += this.shift()
        }
        return shifted
    }

    shiftUntilNextTerminator() {
        this.shiftUntil(Scanner.lookaheadIsNotWhitespace)
        return this.shiftUntil(Scanner.lookaheadIsTerminator)
    }

    get unscanned() {
        return this.chars.slice(this.i, this.chars.length).join("")
    }

    lookaheadIs<Char extends Lookahead>(char: Char): this is Scanner<Char> {
        return this.lookahead === char
    }

    lookaheadIsIn<Tokens extends Dict>(
        tokens: Tokens
    ): this is Scanner<Extract<keyof Tokens, string>> {
        return this.lookahead in tokens
    }
}

export namespace Scanner {
    export type UntilCondition = (scanner: Scanner, shifted: string) => boolean

    export type OnInputEndFn = (scanner: Scanner, shifted: string) => string

    export type ShiftUntilOptions = {
        onInputEnd?: OnInputEndFn
    }

    export const lookaheadIsTerminator: UntilCondition = (scanner: Scanner) =>
        scanner.lookahead in terminatingChars

    export const lookaheadIsNotWhitespace: UntilCondition = (
        scanner: Scanner
    ) => !(scanner.lookahead in whiteSpaceTokens)

    export const terminatingChars = {
        "<": true,
        ">": true,
        "=": true,
        "|": true,
        "&": true,
        ")": true,
        "[": true,
        "%": true,
        " ": true,
        ",": true
    } as const

    export type TerminatingChar = keyof typeof terminatingChars

    export const finalizingLookaheads = {
        ">": true,
        ",": true,
        "": true
    } as const

    export type FinalizingLookahead = keyof typeof finalizingLookaheads

    export type InfixToken = Comparator | "|" | "&" | "%" | ":" | "=>" | "|>"

    export type PostfixToken = "[]"

    export type OperatorToken = InfixToken | PostfixToken

    export const escapeToken = "\\"

    export type EscapeToken = typeof escapeToken

    export const whiteSpaceTokens = {
        " ": true,
        "\n": true
    } as const

    export type WhiteSpaceToken = keyof typeof whiteSpaceTokens

    export type shift<
        Lookahead extends string,
        Unscanned extends string
    > = `${Lookahead}${Unscanned}`

    export type shiftUntil<
        unscanned extends string,
        terminator extends string,
        scanned extends string = ""
    > = unscanned extends shift<infer lookahead, infer nextUnscanned>
        ? lookahead extends terminator
            ? scanned extends `${infer base}${EscapeToken}`
                ? shiftUntil<nextUnscanned, terminator, `${base}${lookahead}`>
                : [scanned, unscanned]
            : shiftUntil<nextUnscanned, terminator, `${scanned}${lookahead}`>
        : [scanned, ""]

    export type shiftUntilNot<
        unscanned extends string,
        nonTerminator extends string,
        scanned extends string = ""
    > = unscanned extends shift<infer lookahead, infer nextUnscanned>
        ? lookahead extends nonTerminator
            ? shiftUntilNot<
                  nextUnscanned,
                  nonTerminator,
                  `${scanned}${lookahead}`
              >
            : [scanned, unscanned]
        : [scanned, ""]

    export type shiftUntilNextTerminator<unscanned extends string> = shiftUntil<
        unscanned,
        TerminatingChar
    >

    export type skipWhitespace<unscanned extends string> = shiftUntilNot<
        unscanned,
        WhiteSpaceToken
    >[1]

    export type shiftResult<
        scanned extends string,
        unscanned extends string
    > = [scanned, unscanned]
}
