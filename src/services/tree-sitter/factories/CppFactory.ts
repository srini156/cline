import Parser from "web-tree-sitter"
import path from "path"
import { BaseLanguageFactory, LanguageAssets } from "./BaseLanguageFactory"
import { cppQuery } from "../queries"

/**
 * Factory for creating C++ TreeSitter parsers and queries.
 * Supports .cpp and .hpp file extensions.
 */
class CppFactory extends BaseLanguageFactory {
	/**
	 * The file extensions supported by this factory.
	 */
	public readonly extensions: readonly string[] = ["cpp", "hpp"]

	/**
	 * Loads the TreeSitter parser and query for the C++ language.
	 *
	 * @returns A promise that resolves to the LanguageAssets for C++.
	 * @protected
	 */
	protected async _loadInternal(): Promise<LanguageAssets> {
		const languageWasmPath = path.join(__dirname, "..", "tree-sitter-cpp.wasm")

		const language = await Parser.Language.load(languageWasmPath)
		const parser = new Parser()
		parser.setLanguage(language)
		const query = language.query(cppQuery)

		return { parser, query }
	}
}

// Export a singleton instance for registration with LanguageFactoryRegistry
export default new CppFactory()
