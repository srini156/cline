import Parser from "web-tree-sitter"
import path from "path"
import { BaseLanguageFactory, LanguageAssets } from "./BaseLanguageFactory"
import { typescriptQuery } from "../queries" // TSX uses the TypeScript query

/**
 * Factory for creating TSX (TypeScript XML) TreeSitter parsers and queries.
 * It extends the BaseLanguageFactory to provide specific implementations
 * for loading TSX language grammar and the corresponding Tree-sitter query.
 * Note: TSX uses the TypeScript query for parsing.
 */
class TsxFactory extends BaseLanguageFactory {
	/**
	 * The file extensions supported by this factory, specifically "tsx".
	 * This is lowercase and does not include the leading dot.
	 */
	public readonly extensions: readonly string[] = ["tsx"]

	/**
	 * Loads the TreeSitter parser and query for the TSX language.
	 * This method handles the actual loading of the TSX WASM grammar
	 * and compilation of the TypeScript-specific query (as TSX shares query logic).
	 *
	 * @returns A promise that resolves to the LanguageAssets (parser and query) for TSX.
	 * @protected
	 */
	protected async _loadInternal(): Promise<LanguageAssets> {
		// It's assumed that Parser.init() is called once globally before this.

		const languageWasmPath = path.join(
			__dirname, // Current directory of the compiled factory file
			"..", // Navigate up to the parent directory (tree-sitter service root)
			"tree-sitter-tsx.wasm", // Name of the WASM file for TSX
		)

		const language = await Parser.Language.load(languageWasmPath)
		const parser = new Parser()
		parser.setLanguage(language)
		// TSX uses the same query as TypeScript for definition extraction
		const query = language.query(typescriptQuery)

		return { parser, query }
	}
}

// Export a singleton instance of the TsxFactory.
export default new TsxFactory()
