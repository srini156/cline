import Parser from "web-tree-sitter"
import path from "path"
import { BaseLanguageFactory, LanguageAssets } from "./BaseLanguageFactory"
import { cQuery } from "../queries"

/**
 * Factory for creating C TreeSitter parsers and queries.
 * Supports .c and .h file extensions.
 */
class CFactory extends BaseLanguageFactory {
	/**
	 * The file extensions supported by this factory.
	 */
	public readonly extensions: readonly string[] = ["c", "h"]

	/**
	 * Loads the TreeSitter parser and query for the C language.
	 *
	 * @returns A promise that resolves to the LanguageAssets for C.
	 * @protected
	 */
	protected async _loadInternal(): Promise<LanguageAssets> {
		const languageWasmPath = path.join(__dirname, "..", "tree-sitter-c.wasm")

		const language = await Parser.Language.load(languageWasmPath)
		const parser = new Parser()
		parser.setLanguage(language)
		const query = language.query(cQuery)

		return { parser, query }
	}
}

// Export a singleton instance for registration with LanguageFactoryRegistry
export default new CFactory()
