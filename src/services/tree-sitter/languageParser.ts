import * as path from "path"
import Parser from "web-tree-sitter"
import { LanguageFactoryRegistry } from "./LanguageFactoryRegistry"
import "./factories" // Side-effect import to register all language factories

/**
 * Defines the structure for the map of loaded language parsers.
 * Keys are file extensions (without the dot, e.g., "js"), and values
 * are objects containing the initialized TreeSitter parser and its query.
 */
export interface LanguageParser {
	[key: string]: {
		parser: Parser
		query: Parser.Query
	}
}

let isParserInitialized = false

/**
 * Initializes the global TreeSitter Parser instance.
 * This function ensures that `Parser.init()` is called only once.
 * It must be called before any language grammars are loaded.
 */
async function initializeGlobalParser(): Promise<void> {
	if (!isParserInitialized) {
		// Initialize the TreeSitter WASM utility.
		// This is required once before any languages can be loaded.
		await Parser.init()
		isParserInitialized = true
	}
}

/*
This module is responsible for loading TreeSitter language parsers and queries
based on the file extensions of the files to be parsed. It now uses a
Factory pattern to delegate the loading of specific language grammars and
queries to dedicated factory classes.

The process involves:
1. Initializing the global TreeSitter parser (if not already done).
2. Extracting unique file extensions from the list of files to parse.
3. For each unique extension, retrieving the corresponding language factory
   from the LanguageFactoryRegistry.
4. Calling the `load()` method on the factory to get the initialized parser
   and compiled query for that language.
5. Storing these assets in a map, keyed by extension, for use by other
   parts of the TreeSitter service.

This approach replaces a large switch statement, making the system more
extensible, maintainable, and testable, as new languages can be added
by simply creating a new factory and registering it.
*/
export async function loadRequiredLanguageParsers(filesToParse: string[]): Promise<LanguageParser> {
	await initializeGlobalParser() // Ensure TreeSitter itself is initialized

	const parsers: LanguageParser = {}
	const uniqueExtensions = new Set(filesToParse.map((file) => path.extname(file).toLowerCase().slice(1)))

	for (const ext of uniqueExtensions) {
		if (!ext) {
			// Handle files without extensions or empty extensions
			continue
		}

		const factory = LanguageFactoryRegistry.getByExtension(ext)
		if (factory) {
			try {
				// The factory's load() method is responsible for loading WASM
				// and compiling the query, and includes caching.
				parsers[ext] = await factory.load()
			} catch (error) {
				console.error(
					`[TreeSitter] Failed to load parser for extension ".${ext}":`,
					error instanceof Error ? error.message : String(error),
				)
				// Optionally, re-throw or handle more gracefully depending on requirements.
				// For now, we log the error and skip this language.
			}
		} else {
			// Log a warning if no factory is found for a given extension.
			// This indicates an unsupported language for TreeSitter parsing.
			console.warn(`[TreeSitter] No language factory found for extension: ".${ext}"`)
		}
	}
	return parsers
}
