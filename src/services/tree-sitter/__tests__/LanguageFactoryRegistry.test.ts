import { expect } from "chai";
import { LanguageFactoryRegistry } from "../LanguageFactoryRegistry";
import { BaseLanguageFactory } from "../factories/BaseLanguageFactory";
import Parser from "web-tree-sitter";

class MockLanguageFactory extends BaseLanguageFactory {
  public readonly extensions: readonly string[] = ["mock"];
  
  protected async _loadInternal() {
    const mockParser = {} as Parser;
    const mockQuery = {} as Parser.Query;
    return { parser: mockParser, query: mockQuery };
  }
}

class DuplicateExtensionFactory extends BaseLanguageFactory {
  public readonly extensions: readonly string[] = ["mock"];
  
  protected async _loadInternal() {
    const mockParser = {} as Parser;
    const mockQuery = {} as Parser.Query;
    return { parser: mockParser, query: mockQuery };
  }
}

class MultiExtensionFactory extends BaseLanguageFactory {
  public readonly extensions: readonly string[] = ["ext1", "ext2", "ext3"];
  
  protected async _loadInternal() {
    const mockParser = {} as Parser;
    const mockQuery = {} as Parser.Query;
    return { parser: mockParser, query: mockQuery };
  }
}

describe("LanguageFactoryRegistry", () => {
  beforeEach(() => {
    LanguageFactoryRegistry.clear();
  });

  describe("register", () => {
    it("should register a factory with single extension", () => {
      const factory = new MockLanguageFactory();
      LanguageFactoryRegistry.register(factory);
      
      const retrieved = LanguageFactoryRegistry.getByExtension("mock");
      expect(retrieved).to.equal(factory);
    });

    it("should register a factory with multiple extensions", () => {
      const factory = new MultiExtensionFactory();
      LanguageFactoryRegistry.register(factory);
      
      expect(LanguageFactoryRegistry.getByExtension("ext1")).to.equal(factory);
      expect(LanguageFactoryRegistry.getByExtension("ext2")).to.equal(factory);
      expect(LanguageFactoryRegistry.getByExtension("ext3")).to.equal(factory);
    });

    it("should handle case-insensitive extension registration", () => {
      const factory = new MockLanguageFactory();
      LanguageFactoryRegistry.register(factory);
      
      expect(LanguageFactoryRegistry.getByExtension("MOCK")).to.equal(factory);
      expect(LanguageFactoryRegistry.getByExtension("Mock")).to.equal(factory);
    });

    it("should throw error for duplicate extension registration", () => {
      const factory1 = new MockLanguageFactory();
      const factory2 = new DuplicateExtensionFactory();
      
      LanguageFactoryRegistry.register(factory1);
      
      expect(() => {
        LanguageFactoryRegistry.register(factory2);
      }).to.throw(/Duplicate factory registration attempted for extension: "\.mock"/);
    });
  });

  describe("getByExtension", () => {
    it("should return undefined for unregistered extension", () => {
      const result = LanguageFactoryRegistry.getByExtension("nonexistent");
      expect(result).to.be.undefined;
    });

    it("should handle case-insensitive lookup", () => {
      const factory = new MockLanguageFactory();
      LanguageFactoryRegistry.register(factory);
      
      expect(LanguageFactoryRegistry.getByExtension("mock")).to.equal(factory);
      expect(LanguageFactoryRegistry.getByExtension("MOCK")).to.equal(factory);
      expect(LanguageFactoryRegistry.getByExtension("Mock")).to.equal(factory);
    });
  });

  describe("clear", () => {
    it("should remove all registered factories", () => {
      const factory = new MockLanguageFactory();
      LanguageFactoryRegistry.register(factory);
      
      expect(LanguageFactoryRegistry.getByExtension("mock")).to.equal(factory);
      
      LanguageFactoryRegistry.clear();
      
      expect(LanguageFactoryRegistry.getByExtension("mock")).to.be.undefined;
    });
  });

  describe("getRegisteredFactoryCount", () => {
    it("should return 0 for empty registry", () => {
      expect(LanguageFactoryRegistry.getRegisteredFactoryCount()).to.equal(0);
    });

    it("should return correct count for single factory", () => {
      const factory = new MockLanguageFactory();
      LanguageFactoryRegistry.register(factory);
      
      expect(LanguageFactoryRegistry.getRegisteredFactoryCount()).to.equal(1);
    });

    it("should return correct count for factory with multiple extensions", () => {
      const factory = new MultiExtensionFactory();
      LanguageFactoryRegistry.register(factory);
      
      // Should count unique factories, not extensions
      expect(LanguageFactoryRegistry.getRegisteredFactoryCount()).to.equal(1);
    });

    it("should return correct count for multiple factories", () => {
      const factory1 = new MockLanguageFactory();
      const factory2 = new MultiExtensionFactory();
      
      LanguageFactoryRegistry.register(factory1);
      LanguageFactoryRegistry.register(factory2);
      
      expect(LanguageFactoryRegistry.getRegisteredFactoryCount()).to.equal(2);
    });
  });

  describe("getAllRegisteredExtensions", () => {
    it("should return empty array for empty registry", () => {
      const extensions = LanguageFactoryRegistry.getAllRegisteredExtensions();
      expect(extensions).to.be.an("array").that.is.empty;
    });

    it("should return all registered extensions", () => {
      const factory1 = new MockLanguageFactory();
      const factory2 = new MultiExtensionFactory();
      
      LanguageFactoryRegistry.register(factory1);
      LanguageFactoryRegistry.register(factory2);
      
      const extensions = LanguageFactoryRegistry.getAllRegisteredExtensions();
      expect(extensions).to.have.members(["mock", "ext1", "ext2", "ext3"]);
    });
  });
});