import Parser from "web-tree-sitter";
import path from "path";
import { BaseLanguageFactory, LanguageAssets } from "./BaseLanguageFactory";
import { csharpQuery } from "../queries";

/**
 * Factory for creating C# TreeSitter parsers and queries.
 * Supports .cs file extensions.
 */
class CSharpFactory extends BaseLanguageFactory {
  /**
   * The file extensions supported by this factory.
   */
  public readonly extensions: readonly string[] = ["cs"];

  /**
   * Loads the TreeSitter parser and query for the C# language.
   * 
   * @returns A promise that resolves to the LanguageAssets for C#.
   * @protected
   */
  protected async _loadInternal(): Promise<LanguageAssets> {
    const languageWasmPath = path.join(
      __dirname,
      "..",
      "tree-sitter-c_sharp.wasm"
    );

    const language = await Parser.Language.load(languageWasmPath);
    const parser = new Parser();
    parser.setLanguage(language);
    const query = language.query(csharpQuery);

    return { parser, query };
  }
}

// Export a singleton instance for registration with LanguageFactoryRegistry
export default new CSharpFactory();