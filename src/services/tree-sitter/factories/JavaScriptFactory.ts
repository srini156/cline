import Parser from "web-tree-sitter";
import path from "path";
import { BaseLanguageFactory, LanguageAssets } from "./BaseLanguageFactory";
import { javascriptQuery } from "../queries"; // Correct path from factories/ to queries/

/**
 * Factory for creating JavaScript and JSX TreeSitter parsers and queries.
 * It extends the BaseLanguageFactory to provide specific implementations
 * for loading JavaScript language grammar and the corresponding Tree-sitter query.
 */
class JavaScriptFactory extends BaseLanguageFactory {
  /**
   * The file extensions supported by this factory, specifically "js" and "jsx".
   * These are lowercase and do not include the leading dot.
   */
  public readonly extensions: readonly string[] = ["js", "jsx"];

  /**
   * Loads the TreeSitter parser and query for the JavaScript language.
   * This method handles the actual loading of the JavaScript WASM grammar
   * and compilation of the JavaScript-specific query.
   *
   * @returns A promise that resolves to the LanguageAssets (parser and query) for JavaScript.
   * @protected
   */
  protected async _loadInternal(): Promise<LanguageAssets> {
    // It's assumed that Parser.init() is called once globally before this.
    // For example, in initializeGlobalParser() in languageParser.ts.

    const languageWasmPath = path.join(
      __dirname, // Current directory of the compiled factory file (e.g., dist/.../factories)
      "..",      // Navigate up to the parent directory (e.g., dist/.../tree-sitter)
      "tree-sitter-javascript.wasm" // Name of the WASM file
    );
    // Note: In a VS Code extension, for bundled resources, a more robust way might involve
    // using vscode.Uri.joinPath(extensionContext.extensionUri, 'path/to/wasm/file.wasm').fsPath

    const language = await Parser.Language.load(languageWasmPath);
    const parser = new Parser();
    parser.setLanguage(language);
    const query = language.query(javascriptQuery);

    return { parser, query };
  }
}

// Export a singleton instance of the JavaScriptFactory.
// This instance will be registered with the LanguageFactoryRegistry.
export default new JavaScriptFactory();
