import { getConfig } from "../config.ts"

const prettier =
	typeof Bun === "undefined" ? await import("@prettier/sync") : undefined

const declarationPrefix = "type T = "

export const formatTypeString = (typeString: string): string => {
	if (!prettier) return typeString.trim()
	return prettier
		.format(`${declarationPrefix}${typeString}`, {
			semi: false,
			printWidth: 60,
			trailingComma: "none",
			parser: "typescript",
			...getConfig().typeToStringFormat
		})
		.slice(declarationPrefix.length)
		.trimEnd()
}
