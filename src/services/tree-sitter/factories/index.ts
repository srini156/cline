import { LanguageFactoryRegistry } from "../LanguageFactoryRegistry"

// Import all concrete factory instances
import JavaScriptFactory from "./JavaScriptFactory"
import TypeScriptFactory from "./TypeScriptFactory"
import TsxFactory from "./TsxFactory"
import PythonFactory from "./PythonFactory"
import RustFactory from "./RustFactory"
import GoFactory from "./GoFactory"
import CppFactory from "./CppFactory"
import CFactory from "./CFactory"
import CSharpFactory from "./CSharpFactory"
import RubyFactory from "./RubyFactory"
import JavaFactory from "./JavaFactory"
import PhpFactory from "./PhpFactory"
import SwiftFactory from "./SwiftFactory"
import KotlinFactory from "./KotlinFactory"

const factoriesToRegister = [
	JavaScriptFactory,
	TypeScriptFactory,
	TsxFactory,
	PythonFactory,
	RustFactory,
	GoFactory,
	CppFactory,
	CFactory,
	CSharpFactory,
	RubyFactory,
	JavaFactory,
	PhpFactory,
	SwiftFactory,
	KotlinFactory,
]

factoriesToRegister.forEach((factory) => {
	if (factory) {
		LanguageFactoryRegistry.register(factory)
	}
})
