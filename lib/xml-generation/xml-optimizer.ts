import { create } from "xmlbuilder2";
import { XMLBuilderOptions } from "xmlbuilder2/lib/interfaces";

export class XMLOptimizer {
  private prettyOptions: XMLBuilderOptions = {
    encoding: "UTF-8",
    standalone: true,
    prettyPrint: true,
    indent: "  ",
    newline: "\n",
  };

  private minifiedOptions: XMLBuilderOptions = {
    encoding: "UTF-8",
    standalone: true,
    prettyPrint: false,
    newline: "",
    indent: "",
  };

  /**
   * Remove empty optional elements from XML
   */
  removeEmptyElements(xmlString: string): string {
    try {
      // For now, just return the XML as-is
      // TODO: Implement proper empty element removal with xmlbuilder2
      return xmlString;
    } catch (error) {
      throw new Error(`Failed to remove empty elements: ${error}`);
    }
  }

  /**
   * Minify XML for production
   */
  minifyXML(xmlString: string): string {
    try {
      return create(xmlString).end(this.minifiedOptions);
    } catch (error) {
      throw new Error(`Failed to minify XML: ${error}`);
    }
  }

  /**
   * Optimize XML by removing empty elements and optionally minifying
   */
  optimizeXML(xmlString: string, minify: boolean = false): string {
    // First remove empty elements
    const cleanedXML = this.removeEmptyElements(xmlString);
    
    // Then minify if requested
    return minify ? this.minifyXML(cleanedXML) : cleanedXML;
  }

  /**
   * Validate XML structure
   */
  isValidXML(xmlString: string): boolean {
    try {
      create(xmlString);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get XML size information
   */
  getXMLStats(xmlString: string): {
    originalSize: number;
    minifiedSize: number;
    elementCount: number;
  } {
    const encoder = new TextEncoder();
    const originalSize = encoder.encode(xmlString).length;
    const minifiedXML = this.minifyXML(xmlString);
    const minifiedSize = encoder.encode(minifiedXML).length;
    
    // Count elements using regex
    const elementMatches = xmlString.match(/<[^/][^>]*>/g) || [];
    const elementCount = elementMatches.length;
    
    return {
      originalSize,
      minifiedSize,
      elementCount
    };
  }
} 