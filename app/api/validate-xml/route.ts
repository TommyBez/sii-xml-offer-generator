import { NextRequest, NextResponse } from "next/server";
import { getDefaultValidator, enhanceXSDErrors } from "@/lib/xml-validation";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { xml } = body;

    if (!xml || typeof xml !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid XML content" },
        { status: 400 }
      );
    }

    // Validate XML
    const validator = getDefaultValidator();
    const validationResult = validator.validateXML(xml);
    
    // Enhance errors for better user experience
    const enhancedErrors = enhanceXSDErrors(validationResult.errors);

    return NextResponse.json({
      valid: validationResult.valid,
      errors: enhancedErrors,
      errorCount: enhancedErrors.length,
      criticalErrors: enhancedErrors.filter(e => e.level === "error").length,
      warnings: enhancedErrors.filter(e => e.level === "warning").length
    });
  } catch (error) {
    console.error("XML validation error:", error);
    return NextResponse.json(
      { error: "Failed to validate XML" },
      { status: 500 }
    );
  }
} 