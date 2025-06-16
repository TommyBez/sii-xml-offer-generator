export { XMLGenerator } from "./xml-generator";
export { XMLFormatter } from "./xml-formatter";
export { XMLOptimizer } from "./xml-optimizer";
// export { StreamingXMLGenerator } from "./streaming-generator"; // Server-side only
export { FileNamingService, type FileNameParams } from "./file-naming";
export { XMLGenerationError, FileNameError } from "./errors";

// Main service that combines all functionality
import { XMLGenerator } from "./xml-generator";
import { XMLOptimizer } from "./xml-optimizer";
import { FileNamingService, FileNameParams } from "./file-naming";
import { SIIOfferta } from "@/types/sii-generated";
// import { SimpleXSDValidator } from "@/lib/xml-validation/simple-xsd-validator";

export interface GenerateXMLOptions {
  data: SIIOfferta;
  fileNameParams?: FileNameParams;
  optimize?: boolean;
  minify?: boolean;
  validate?: boolean;
}

export interface GenerateXMLResult {
  xml: string;
  fileName?: string;
  stats?: {
    originalSize: number;
    minifiedSize: number;
    elementCount: number;
  };
  validationResult?: {
    valid: boolean;
    errors?: any[];
  };
}

export class XMLGenerationService {
  private generator: XMLGenerator;
  private optimizer: XMLOptimizer;
  private fileNaming: FileNamingService;
  // private validator?: SimpleXSDValidator;

  constructor() {
    this.generator = new XMLGenerator();
    this.optimizer = new XMLOptimizer();
    this.fileNaming = new FileNamingService();
  }

  // async initializeValidator(xsdPath: string) {
  //   this.validator = new SimpleXSDValidator(xsdPath);
  //   await this.validator.initialize();
  // }

  async generateXML(options: GenerateXMLOptions): Promise<GenerateXMLResult> {
    const result: GenerateXMLResult = {
      xml: ""
    };

    // Generate base XML
    result.xml = this.generator.generateOfferXML(options.data);

    // Optimize if requested
    if (options.optimize) {
      result.xml = this.optimizer.optimizeXML(result.xml, options.minify);
    }

    // Generate file name if params provided
    if (options.fileNameParams) {
      result.fileName = this.fileNaming.generateFileName(options.fileNameParams);
    }

    // Get stats
    result.stats = this.optimizer.getXMLStats(result.xml);

    // Validate if requested and validator is initialized
    // if (options.validate && this.validator) {
    //   result.validationResult = await this.validator.validate(result.xml);
    // }

    return result;
  }

  /**
   * Quick method to generate and save XML to file (server-side only)
   */
  // async generateAndSaveXML(
  //   data: SIIOfferta,
  //   outputPath: string,
  //   options: Partial<GenerateXMLOptions> = {}
  // ): Promise<void> {
  //   const result = await this.generateXML({
  //     data,
  //     ...options
  //   });

  //   // Use Node.js fs promises
  //   const { writeFile } = await import("fs/promises");
  //   await writeFile(outputPath, result.xml, "utf8");
  // }
} 