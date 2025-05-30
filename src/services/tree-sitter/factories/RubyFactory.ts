import Parser from "web-tree-sitter";
import path from "path";
import { BaseLanguageFactory, LanguageAssets } from "./BaseLanguageFactory";
import { rubyQuery } from "../queries";

/**
 * Factory for creating Ruby TreeSitter parsers and queries.
 * Supports .rb file extensions.
 */
class RubyFactory extends BaseLanguageFactory {
  /**
   * The file extensions supported by this factory.
   */
  public readonly extensions: readonly string[] = ["rb"];

  /**
   * Loads the TreeSitter parser and query for the Ruby language.
   * 
   * @returns A promise that resolves to the LanguageAssets for Ruby.
   * @protected
   */
  protected async _loadInternal(): Promise<LanguageAssets> {
    const languageWasmPath = path.join(
      __dirname,
      "..",
      "tree-sitter-ruby.wasm"
    );

    const language = await Parser.Language.load(languageWasmPath);
    const parser = new Parser();
    parser.setLanguage(language);
    const query = language.query(rubyQuery);

    return { parser, query };
  }
}

// Export a singleton instance for registration with LanguageFactoryRegistry
export default new RubyFactory();