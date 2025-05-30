import Parser from "web-tree-sitter";
import path from "path";
import { BaseLanguageFactory, LanguageAssets } from "./BaseLanguageFactory";
import { goQuery } from "../queries";

/**
 * Factory for creating Go TreeSitter parsers and queries.
 * Supports .go file extensions.
 */
class GoFactory extends BaseLanguageFactory {
  /**
   * The file extensions supported by this factory.
   */
  public readonly extensions: readonly string[] = ["go"];

  /**
   * Loads the TreeSitter parser and query for the Go language.
   * 
   * @returns A promise that resolves to the LanguageAssets for Go.
   * @protected
   */
  protected async _loadInternal(): Promise<LanguageAssets> {
    const languageWasmPath = path.join(
      __dirname,
      "..",
      "tree-sitter-go.wasm"
    );

    const language = await Parser.Language.load(languageWasmPath);
    const parser = new Parser();
    parser.setLanguage(language);
    const query = language.query(goQuery);

    return { parser, query };
  }
}

// Export a singleton instance for registration with LanguageFactoryRegistry
export default new GoFactory();
