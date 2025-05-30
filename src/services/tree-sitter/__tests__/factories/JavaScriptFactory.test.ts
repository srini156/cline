import { expect } from "chai"
import * as sinon from "sinon"
import Parser from "web-tree-sitter"
import javascriptFactory from "../../factories/JavaScriptFactory"
import { javascriptQuery } from "../../queries"
import * as path from "path"

describe("JavaScriptFactory", () => {
	afterEach(() => {
		sinon.restore()
	})

	describe("extensions", () => {
		it("should support js and jsx extensions", () => {
			expect(javascriptFactory.extensions).to.deep.equal(["js", "jsx"])
		})
	})

	describe("load", () => {
		it("should load JavaScript language assets", async () => {
			// Mock Parser.Language.load
			const mockLanguage = {
				query: sinon.stub().returns({ test: "query" }),
			} as any

			const mockParser = {
				setLanguage: sinon.stub(),
			} as any

			const languageLoadStub = sinon.stub(Parser.Language, "load").resolves(mockLanguage)
			const parserConstructorStub = sinon.stub(Parser.prototype, "constructor" as any).returns(mockParser)

			// Mock Parser constructor
			const originalParser = Parser
			;(Parser as any) = function () {
				return mockParser
			}
			Object.setPrototypeOf(Parser, originalParser)
			Object.assign(Parser, originalParser)

			try {
				const assets = await javascriptFactory.load()

				expect(assets).to.have.property("parser")
				expect(assets).to.have.property("query")
				expect(assets.parser).to.equal(mockParser)
				expect(assets.query).to.deep.equal({ test: "query" })

				// Verify the correct WASM path is used
				const expectedPath = path.join(
					path.dirname(require.resolve("../../factories/JavaScriptFactory")),
					"..",
					"tree-sitter-javascript.wasm",
				)

				expect(languageLoadStub.calledOnce).to.be.true
				expect(mockParser.setLanguage.calledOnceWith(mockLanguage)).to.be.true
				expect(mockLanguage.query.calledOnceWith(javascriptQuery)).to.be.true
			} finally {
				// Restore Parser
				Object.setPrototypeOf(Parser, originalParser.prototype)
				Object.assign(Parser, originalParser)
			}
		})

		it("should cache the loaded assets", async () => {
			// Mock the dependencies
			const mockLanguage = {
				query: sinon.stub().returns({ test: "query" }),
			} as any

			const mockParser = {
				setLanguage: sinon.stub(),
			} as any

			const languageLoadStub = sinon.stub(Parser.Language, "load").resolves(mockLanguage)

			// Mock Parser constructor
			const originalParser = Parser
			;(Parser as any) = function () {
				return mockParser
			}
			Object.setPrototypeOf(Parser, originalParser)
			Object.assign(Parser, originalParser)

			try {
				// Load twice
				const assets1 = await javascriptFactory.load()
				const assets2 = await javascriptFactory.load()

				// Should return the same cached instance
				expect(assets1).to.equal(assets2)

				// Should only call the expensive operations once
				expect(languageLoadStub.calledOnce).to.be.true
				expect(mockParser.setLanguage.calledOnce).to.be.true
				expect(mockLanguage.query.calledOnce).to.be.true
			} finally {
				// Restore Parser
				Object.setPrototypeOf(Parser, originalParser.prototype)
				Object.assign(Parser, originalParser)
			}
		})

		it("should handle loading errors", async () => {
			const error = new Error("Failed to load WASM")
			sinon.stub(Parser.Language, "load").rejects(error)

			try {
				await javascriptFactory.load()
				expect.fail("Expected error to be thrown")
			} catch (thrownError) {
				expect(thrownError).to.equal(error)
			}
		})
	})
})
