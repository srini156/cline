import Parser from "web-tree-sitter"
import path from "path"
import { BaseLanguageFactory, LanguageAssets } from "./BaseLanguageFactory"
import { phpQuery } from "../queries"

/**
 * Factory for creating PHP TreeSitter parsers and queries.
 * Supports .php file extensions.
 */
class PhpFactory extends BaseLanguageFactory {
	/**
	 * The file extensions supported by this factory.
	 */
	public readonly extensions: readonly string[] = ["php"]

	/**
	 * Loads the TreeSitter parser and query for the PHP language.
	 *
	 * @returns A promise that resolves to the LanguageAssets for PHP.
	 * @protected
	 */
	protected async _loadInternal(): Promise<LanguageAssets> {
		const languageWasmPath = path.join(__dirname, "..", "tree-sitter-php.wasm")

		const language = await Parser.Language.load(languageWasmPath)
		const parser = new Parser()
		parser.setLanguage(language)
		const query = language.query(phpQuery)

		return { parser, query }
	}
}

// Export a singleton instance for registration with LanguageFactoryRegistry
export default new PhpFactory()
