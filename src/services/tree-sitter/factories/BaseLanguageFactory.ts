import Parser from "web-tree-sitter";

/**
 * Represents the loaded TreeSitter parser and its corresponding query
 * for a specific language.
 */
export interface LanguageAssets {
  parser: Parser;
  query: Parser.Query;
}

/**
 * Defines the abstract base class for all TreeSitter language factories.
 * This class provides a contract for concrete language factories and includes
 * shared functionality such as lazy-loading and caching of parser assets.
 */
export abstract class BaseLanguageFactory {
  /**
   * A list of file extensions (e.g., "js", "jsx") that this factory supports.
   * Implementations should provide this as a lowercase array of strings without the leading dot.
   * Example: `readonly extensions: readonly string[] = ["js", "jsx"];`
   */
  public abstract readonly extensions: readonly string[];

  private _cachedAssets?: Promise<LanguageAssets>;

  /**
   * Loads the TreeSitter parser and query for the specific language supported by this factory.
   * The language assets (parser and query) are lazy-loaded upon the first call
   * and cached for subsequent calls to optimize performance.
   *
   * Failed loads are not cached, allowing retry attempts on subsequent calls.
   *
   * Note: It is assumed that `Parser.init()` has been called globally once
   * before any factory's `load()` method is invoked.
   *
   * @returns A promise that resolves to the `LanguageAssets` (parser and query).
   */
  public async load(): Promise<LanguageAssets> {
    if (!this._cachedAssets) {
      this._cachedAssets = this._loadInternal().catch(error => {
        // Clear the cached promise on error to allow retry
        this._cachedAssets = undefined;
        throw error;
      });
    }
    return this._cachedAssets;
  }

  /**
   * Abstract method to be implemented by concrete (derived) factories.
   * This method should contain the language-specific logic for loading
   * the TreeSitter WASM grammar and compiling the appropriate query.
   *
   * @returns A promise that resolves to the `LanguageAssets` for the specific language.
   * @protected
   */
  protected abstract _loadInternal(): Promise<LanguageAssets>;
}
