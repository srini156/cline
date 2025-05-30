import Parser from "web-tree-sitter";
import path from "path";
import { BaseLanguageFactory, LanguageAssets } from "./BaseLanguageFactory";
import { kotlinQuery } from "../queries";

/**
 * Factory for creating Kotlin TreeSitter parsers and queries.
 * Supports .kt file extensions.
 */
class KotlinFactory extends BaseLanguageFactory {
  /**
   * The file extensions supported by this factory.
   */
  public readonly extensions: readonly string[] = ["kt"];

  /**
   * Loads the TreeSitter parser and query for the Kotlin language.
   * 
   * @returns A promise that resolves to the LanguageAssets for Kotlin.
   * @protected
   */
  protected async _loadInternal(): Promise<LanguageAssets> {
    const languageWasmPath = path.join(
      __dirname,
      "..",
      "tree-sitter-kotlin.wasm"
    );

    const language = await Parser.Language.load(languageWasmPath);
    const parser = new Parser();
    parser.setLanguage(language);
    const query = language.query(kotlinQuery);

    return { parser, query };
  }
}

// Export a singleton instance for registration with LanguageFactoryRegistry
export default new KotlinFactory();