import { expect } from "chai"
import { BaseLanguageFactory, LanguageAssets } from "../factories/BaseLanguageFactory"
import Parser from "web-tree-sitter"
import * as sinon from "sinon"

class TestLanguageFactory extends BaseLanguageFactory {
	public readonly extensions: readonly string[] = ["test"]
	public loadInternalCalled = 0

	protected async _loadInternal(): Promise<LanguageAssets> {
		this.loadInternalCalled++

		// Mock the parser and query
		const mockParser = {} as Parser
		const mockQuery = {} as Parser.Query

		return { parser: mockParser, query: mockQuery }
	}
}

class ErrorThrowingFactory extends BaseLanguageFactory {
	public readonly extensions: readonly string[] = ["error"]

	protected async _loadInternal(): Promise<LanguageAssets> {
		throw new Error("Test error during loading")
	}
}

class SlowLoadingFactory extends BaseLanguageFactory {
	public readonly extensions: readonly string[] = ["slow"]

	protected async _loadInternal(): Promise<LanguageAssets> {
		// Simulate slow loading
		await new Promise((resolve) => setTimeout(resolve, 10))

		const mockParser = {} as Parser
		const mockQuery = {} as Parser.Query

		return { parser: mockParser, query: mockQuery }
	}
}

describe("BaseLanguageFactory", () => {
	describe("load", () => {
		it("should return language assets on successful load", async () => {
			const factory = new TestLanguageFactory()

			const assets = await factory.load()

			expect(assets).to.have.property("parser")
			expect(assets).to.have.property("query")
			expect(factory.loadInternalCalled).to.equal(1)
		})

		it("should cache the result and not call _loadInternal multiple times", async () => {
			const factory = new TestLanguageFactory()

			const assets1 = await factory.load()
			const assets2 = await factory.load()
			const assets3 = await factory.load()

			expect(assets1).to.equal(assets2)
			expect(assets2).to.equal(assets3)
			expect(factory.loadInternalCalled).to.equal(1)
		})

		it("should handle concurrent load calls correctly", async () => {
			const factory = new SlowLoadingFactory()

			// Start multiple concurrent loads
			const promises = [factory.load(), factory.load(), factory.load()]

			const results = await Promise.all(promises)

			// All should return the same cached result
			expect(results[0]).to.equal(results[1])
			expect(results[1]).to.equal(results[2])
		})

		it("should propagate errors from _loadInternal", async () => {
			const factory = new ErrorThrowingFactory()

			try {
				await factory.load()
				expect.fail("Expected error to be thrown")
			} catch (error) {
				expect(error).to.be.an("error")
				expect(error.message).to.equal("Test error during loading")
			}
		})

		it("should not cache failed loads", async () => {
			const factory = new ErrorThrowingFactory()

			// First call should fail
			try {
				await factory.load()
				expect.fail("Expected first call to throw")
			} catch (error) {
				expect(error.message).to.equal("Test error during loading")
			}

			// Second call should also fail (not cached)
			try {
				await factory.load()
				expect.fail("Expected second call to throw")
			} catch (error) {
				expect(error.message).to.equal("Test error during loading")
			}
		})
	})

	describe("extensions property", () => {
		it("should be readonly and defined by concrete implementations", () => {
			const factory = new TestLanguageFactory()

			expect(factory.extensions).to.deep.equal(["test"])

			// Should be readonly (TypeScript compile-time check)
			// Runtime test: try to modify (should not affect the original)
			const extensions = factory.extensions as string[]
			extensions.push("modified")

			expect(factory.extensions).to.deep.equal(["test"])
		})
	})
})
