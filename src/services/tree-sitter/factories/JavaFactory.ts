import Parser from "web-tree-sitter";
import path from "path";
import { BaseLanguageFactory, LanguageAssets } from "./BaseLanguageFactory";
import { javaQuery } from "../queries";

/**
 * Factory for creating Java TreeSitter parsers and queries.
 * Supports .java file extensions.
 */
class JavaFactory extends BaseLanguageFactory {
  /**
   * The file extensions supported by this factory.
   */
  public readonly extensions: readonly string[] = ["java"];

  /**
   * Loads the TreeSitter parser and query for the Java language.
   * 
   * @returns A promise that resolves to the LanguageAssets for Java.
   * @protected
   */
  protected async _loadInternal(): Promise<LanguageAssets> {
    const languageWasmPath = path.join(
      __dirname,
      "..",
      "tree-sitter-java.wasm"
    );

    const language = await Parser.Language.load(languageWasmPath);
    const parser = new Parser();
    parser.setLanguage(language);
    const query = language.query(javaQuery);

    return { parser, query };
  }
}

// Export a singleton instance for registration with LanguageFactoryRegistry
export default new JavaFactory();