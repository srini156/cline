import Parser from "web-tree-sitter";
import path from "path";
import { BaseLanguageFactory, LanguageAssets } from "./BaseLanguageFactory";
import { swiftQuery } from "../queries";

/**
 * Factory for creating Swift TreeSitter parsers and queries.
 * Supports .swift file extensions.
 */
class SwiftFactory extends BaseLanguageFactory {
  /**
   * The file extensions supported by this factory.
   */
  public readonly extensions: readonly string[] = ["swift"];

  /**
   * Loads the TreeSitter parser and query for the Swift language.
   * 
   * @returns A promise that resolves to the LanguageAssets for Swift.
   * @protected
   */
  protected async _loadInternal(): Promise<LanguageAssets> {
    const languageWasmPath = path.join(
      __dirname,
      "..",
      "tree-sitter-swift.wasm"
    );

    const language = await Parser.Language.load(languageWasmPath);
    const parser = new Parser();
    parser.setLanguage(language);
    const query = language.query(swiftQuery);

    return { parser, query };
  }
}

// Export a singleton instance for registration with LanguageFactoryRegistry
export default new SwiftFactory();