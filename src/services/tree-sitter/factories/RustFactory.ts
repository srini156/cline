import Parser from "web-tree-sitter"
import path from "path"
import { BaseLanguageFactory, LanguageAssets } from "./BaseLanguageFactory"
import { rustQuery } from "../queries"

/**
 * Factory for creating Rust TreeSitter parsers and queries.
 * Supports .rs file extensions.
 */
class RustFactory extends BaseLanguageFactory {
	/**
	 * The file extensions supported by this factory.
	 */
	public readonly extensions: readonly string[] = ["rs"]

	/**
	 * Loads the TreeSitter parser and query for the Rust language.
	 *
	 * @returns A promise that resolves to the LanguageAssets for Rust.
	 * @protected
	 */
	protected async _loadInternal(): Promise<LanguageAssets> {
		const languageWasmPath = path.join(__dirname, "..", "tree-sitter-rust.wasm")

		const language = await Parser.Language.load(languageWasmPath)
		const parser = new Parser()
		parser.setLanguage(language)
		const query = language.query(rustQuery)

		return { parser, query }
	}
}

// Export a singleton instance for registration with LanguageFactoryRegistry
export default new RustFactory()
