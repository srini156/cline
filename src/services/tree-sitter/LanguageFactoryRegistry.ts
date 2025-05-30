import { BaseLanguageFactory } from "./factories/BaseLanguageFactory";

/**
 * Internal class implementing the registry logic for TreeSitter language factories.
 * This class is not exported directly; a singleton instance is exported instead.
 */
class LanguageFactoryRegistryInternal {
  private readonly factoryMap = new Map<string, BaseLanguageFactory>();

  /**
   * Registers a language factory with the registry.
   * Each factory can support multiple file extensions. If an attempt is made
   * to register a factory for an extension that is already associated with
   * another factory, an error will be thrown.
   *
   * @param factory - The language factory instance to register.
   * @throws Error if an extension provided by the factory is already registered.
   */
  public register(factory: BaseLanguageFactory): void {
    factory.extensions.forEach(ext => {
      const lowerExt = ext.toLowerCase();
      if (this.factoryMap.has(lowerExt)) {
        // As per the plan, throw an error on duplicate.
        // The previous example showed a warning, but the plan was stricter.
        throw new Error(
          `[LanguageFactoryRegistry] Duplicate factory registration attempted for extension: ".${lowerExt}". ` +
          `Extension already registered by factory for "${this.factoryMap.get(lowerExt)?.extensions.join(", ")}".`
        );
      }
      this.factoryMap.set(lowerExt, factory);
    });
  }

  /**
   * Retrieves a language factory for a given file extension.
   * The lookup is case-insensitive.
   *
   * @param extension - The file extension (e.g., "js", "py") without the leading dot.
   * @returns The corresponding `BaseLanguageFactory` instance if found, otherwise `undefined`.
   */
  public getByExtension(extension: string): BaseLanguageFactory | undefined {
    return this.factoryMap.get(extension.toLowerCase());
  }

  /**
   * Clears all registered factories from the registry.
   * This method is primarily intended for use in testing environments to ensure
   * test isolation when dealing with the singleton registry instance.
   */
  public clear(): void {
    this.factoryMap.clear();
  }

  /**
   * Gets the number of registered factories.
   * Useful for debugging or testing.
   * @returns The number of unique factory instances registered.
   */
  public getRegisteredFactoryCount(): number {
    // To count unique factories, we can put them in a Set
    const uniqueFactories = new Set<BaseLanguageFactory>();
    this.factoryMap.forEach(factory => uniqueFactories.add(factory));
    return uniqueFactories.size;
  }

   /**
   * Gets all registered extensions.
   * Useful for debugging or testing.
   * @returns An array of all registered extensions.
   */
  public getAllRegisteredExtensions(): string[] {
    return Array.from(this.factoryMap.keys());
  }
}

/**
 * Singleton instance of the `LanguageFactoryRegistryInternal`.
 * This instance should be used throughout the application to register and
 * retrieve TreeSitter language factories.
 */
export const LanguageFactoryRegistry = new LanguageFactoryRegistryInternal();
