import { cleanup, setup } from "@ark/attest"
import { afterAll, beforeAll, describe, it } from "bun:test"

process.env.TZ = "America/New_York"

// $ bun test --preload ./setup.ts
Object.assign(globalThis, { describe, it })

beforeAll(() =>
	setup({
		typeToStringFormat: {
			useTabs: true
		}
	})
)

afterAll(cleanup)
