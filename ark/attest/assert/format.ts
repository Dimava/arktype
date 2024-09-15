import type { format } from "prettier"
import { createSyncFn } from "synckit"
import { getConfig } from "../config.ts"

const formatSync = createSyncFn<typeof format>(
	require.resolve("./formatWorker.js")
)

const declarationPrefix = "type T = "

export const formatTypeString = (
	typeString: string,
	filename: string
): string =>
	formatSync(`${declarationPrefix}${typeString}`, {
		semi: false,
		printWidth: 60,
		trailingComma: "none",
		filepath: filename,
		// parser: "typescript",
		...getConfig().typeToStringFormat
	})
		.slice(declarationPrefix.length)
		.trimEnd()
