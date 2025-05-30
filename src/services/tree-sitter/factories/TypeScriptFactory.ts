import Parser from "web-tree-sitter"
import path from "path"
import { BaseLanguageFactory, LanguageAssets } from "./BaseLanguageFactory"
import { typescriptQuery } from "../queries"

/**
 * Factory for creating TypeScript TreeSitter parsers and queries.
 * Supports .ts file extensions.
 */
class TypeScriptFactory extends BaseLanguageFactory {
	/**
	 * The file extensions supported by this factory.
	 */
	public readonly extensions: readonly string[] = ["ts"]

	/**
	 * Loads the TreeSitter parser and query for the TypeScript language.
	 *
	 * @returns A promise that resolves to the LanguageAssets for TypeScript.
	 * @protected
	 */
	protected async _loadInternal(): Promise<LanguageAssets> {
		const languageWasmPath = path.join(__dirname, "..", "tree-sitter-typescript.wasm")

		const language = await Parser.Language.load(languageWasmPath)
		const parser = new Parser()
		parser.setLanguage(language)
		const query = language.query(typescriptQuery)

		return { parser, query }
	}
}

// Export a singleton instance for registration with LanguageFactoryRegistry
export default new TypeScriptFactory()
