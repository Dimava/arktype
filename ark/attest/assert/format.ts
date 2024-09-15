import { existsSync, readFileSync, writeFileSync } from "fs"
import { join } from "path"
import { format } from "prettier"
import { getConfig } from "../config.ts"

const prettier =
	typeof Bun === "undefined" ? await import("@prettier/sync") : undefined

const declarationPrefix = "type T = "

const formatCachePath = join(getConfig().cacheDir, "..", "formatCache.json")
const formatCache: Record<string, string | null> = JSON.parse(
	existsSync(formatCachePath) ?
		(readFileSync(formatCachePath, "utf8") ?? "{}")
	:	"{}"
)

export const formatTypeString = (typeString: string): string => {
	if (!prettier) {
		if (formatCache[typeString]) return formatCache[typeString]
		addFormat(typeString)
		return '(not formatter yet) ' + typeString.trim()
	}

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

const addFormat = (typeString: string) => {
	formatCache[typeString] = null
	writeFileSync(formatCachePath, JSON.stringify(formatCache, null, 2))
}

await Promise.all(
	Object.entries(formatCache).map(async ([typeString, formatted]) => {
		// if (formatted) return
		formatted = await format(`${declarationPrefix}${typeString}`, {
			semi: false,
			printWidth: 60,
			trailingComma: "none",
			parser: "typescript",
			...getConfig().typeToStringFormat,
			...{
				useTabs: true,
			}
		})
		formatted = formatted.slice(declarationPrefix.length).trimEnd()
		formatCache[typeString] = formatted
	})
)
writeFileSync(formatCachePath, JSON.stringify(formatCache, null, 2))

// const addFormat = async (typeString: string) => {
// 	console.log('start', typeString)
// 	formatCache[typeString] = null
// 	writeFileSync(formatCachePath, JSON.stringify(formatCache))
// 	const formatted = await format(`${declarationPrefix}${typeString}`, {
// 		semi: false,
// 		printWidth: 60,
// 		trailingComma: "none",
// 		parser: "typescript",
// 		...getConfig().typeToStringFormat
// 	})
// 	const result = formatted.slice(declarationPrefix.length).trimEnd()
// 	console.log('done', result)
// 	formatCache[typeString] = result
// 	writeFileSync(formatCachePath, JSON.stringify(formatCache))
// }
