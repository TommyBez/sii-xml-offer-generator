export class XMLGenerationError extends Error {
  constructor(
    message: string,
    public section: string,
    public field?: string,
    public originalError?: Error
  ) {
    super(message);
    this.name = "XMLGenerationError";
    
    // Maintain proper stack trace for where our error was thrown (available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, XMLGenerationError);
    }
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      section: this.section,
      field: this.field,
      originalError: this.originalError ? {
        name: this.originalError.name,
        message: this.originalError.message,
        stack: this.originalError.stack
      } : undefined,
      stack: this.stack
    };
  }
}

export class FileNameError extends Error {
  constructor(message: string, public piva?: string, public description?: string) {
    super(message);
    this.name = "FileNameError";
    
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, FileNameError);
    }
  }
} 