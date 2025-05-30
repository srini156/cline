import { expect } from "chai"
import * as sinon from "sinon"
import { loadRequiredLanguageParsers, LanguageParser } from "../languageParser"
import { LanguageFactoryRegistry } from "../LanguageFactoryRegistry"
import { BaseLanguageFactory, LanguageAssets } from "../factories/BaseLanguageFactory"
import Parser from "web-tree-sitter"

class MockTestFactory extends BaseLanguageFactory {
	public readonly extensions: readonly string[] = ["mocktest"]

	protected async _loadInternal(): Promise<LanguageAssets> {
		const mockParser = { test: "parser" } as any as Parser
		const mockQuery = { test: "query" } as any as Parser.Query
		return { parser: mockParser, query: mockQuery }
	}
}

class FailingFactory extends BaseLanguageFactory {
	public readonly extensions: readonly string[] = ["failing"]

	protected async _loadInternal(): Promise<LanguageAssets> {
		throw new Error("Factory loading failed")
	}
}

describe("languageParser", () => {
	beforeEach(() => {
		LanguageFactoryRegistry.clear()
	})

	afterEach(() => {
		sinon.restore()
	})

	describe("loadRequiredLanguageParsers", () => {
		it("should return empty object for empty file list", async () => {
			const result = await loadRequiredLanguageParsers([])
			expect(result).to.deep.equal({})
		})

		it("should return empty object for files without extensions", async () => {
			const files = ["README", "Makefile", "LICENSE"]
			const result = await loadRequiredLanguageParsers(files)
			expect(result).to.deep.equal({})
		})

		it("should load parser for single supported extension", async () => {
			const mockFactory = new MockTestFactory()
			LanguageFactoryRegistry.register(mockFactory)

			const files = ["test.mocktest"]
			const result = await loadRequiredLanguageParsers(files)

			expect(result).to.have.property("mocktest")
			expect(result.mocktest).to.have.property("parser")
			expect(result.mocktest).to.have.property("query")
			expect(result.mocktest.parser).to.deep.equal({ test: "parser" })
			expect(result.mocktest.query).to.deep.equal({ test: "query" })
		})

		it("should load parsers for multiple different extensions", async () => {
			const mockFactory1 = new MockTestFactory()

			class AnotherMockFactory extends BaseLanguageFactory {
				public readonly extensions: readonly string[] = ["another"]

				protected async _loadInternal(): Promise<LanguageAssets> {
					const mockParser = { test: "another-parser" } as any as Parser
					const mockQuery = { test: "another-query" } as any as Parser.Query
					return { parser: mockParser, query: mockQuery }
				}
			}

			const mockFactory2 = new AnotherMockFactory()

			LanguageFactoryRegistry.register(mockFactory1)
			LanguageFactoryRegistry.register(mockFactory2)

			const files = ["file1.mocktest", "file2.another", "file3.mocktest"]
			const result = await loadRequiredLanguageParsers(files)

			expect(result).to.have.property("mocktest")
			expect(result).to.have.property("another")
			expect(Object.keys(result)).to.have.lengthOf(2)
		})

		it("should handle case-insensitive file extensions", async () => {
			const mockFactory = new MockTestFactory()
			LanguageFactoryRegistry.register(mockFactory)

			const files = ["test.MOCKTEST", "another.MockTest"]
			const result = await loadRequiredLanguageParsers(files)

			expect(result).to.have.property("mocktest")
			expect(Object.keys(result)).to.have.lengthOf(1)
		})

		it("should deduplicate extensions from multiple files", async () => {
			const mockFactory = new MockTestFactory()
			LanguageFactoryRegistry.register(mockFactory)

			const loadSpy = sinon.spy(mockFactory, "load")

			const files = ["file1.mocktest", "file2.mocktest", "file3.mocktest"]

			const result = await loadRequiredLanguageParsers(files)

			expect(result).to.have.property("mocktest")
			expect(Object.keys(result)).to.have.lengthOf(1)
			expect(loadSpy.callCount).to.equal(1) // Should only load once despite multiple files
		})

		it("should handle unsupported extensions gracefully", async () => {
			const mockFactory = new MockTestFactory()
			LanguageFactoryRegistry.register(mockFactory)

			const consoleWarnStub = sinon.stub(console, "warn")

			const files = ["test.mocktest", "unsupported.xyz"]
			const result = await loadRequiredLanguageParsers(files)

			expect(result).to.have.property("mocktest")
			expect(result).to.not.have.property("xyz")
			expect(consoleWarnStub.calledOnceWith('[TreeSitter] No language factory found for extension: ".xyz"')).to.be.true
		})

		it("should handle factory loading errors gracefully", async () => {
			const mockFactory = new MockTestFactory()
			const failingFactory = new FailingFactory()

			LanguageFactoryRegistry.register(mockFactory)
			LanguageFactoryRegistry.register(failingFactory)

			const consoleErrorStub = sinon.stub(console, "error")

			const files = ["test.mocktest", "error.failing"]
			const result = await loadRequiredLanguageParsers(files)

			expect(result).to.have.property("mocktest")
			expect(result).to.not.have.property("failing")
			expect(consoleErrorStub.calledOnce).to.be.true
			expect(consoleErrorStub.firstCall.args[0]).to.equal('[TreeSitter] Failed to load parser for extension ".failing":')
		})

		it("should extract file extensions correctly", async () => {
			const mockFactory = new MockTestFactory()
			LanguageFactoryRegistry.register(mockFactory)

			const files = [
				"/path/to/file.mocktest",
				"./relative/path/file.mocktest",
				"../another/path/file.mocktest",
				"file.mocktest",
				"complex.file.name.mocktest",
			]

			const result = await loadRequiredLanguageParsers(files)

			expect(result).to.have.property("mocktest")
			expect(Object.keys(result)).to.have.lengthOf(1)
		})

		it("should handle files with no extension", async () => {
			const files = ["README", "Makefile", "/path/to/file_without_extension"]

			const result = await loadRequiredLanguageParsers(files)
			expect(result).to.deep.equal({})
		})

		it("should handle empty extension (files ending with dot)", async () => {
			const files = ["file.", "another."]

			const result = await loadRequiredLanguageParsers(files)
			expect(result).to.deep.equal({})
		})
	})
})
