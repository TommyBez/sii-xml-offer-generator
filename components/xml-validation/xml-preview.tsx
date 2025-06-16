"use client";

import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { AlertCircle, CheckCircle2, AlertTriangle, Info } from "lucide-react";
import { getDefaultValidator, enhanceXSDErrors, formatErrorForDisplay, getErrorSeverity } from "@/lib/xml-validation";
import type { EnhancedError } from "@/lib/xml-validation";

interface XMLPreviewProps {
  xml: string;
  className?: string;
  showLineNumbers?: boolean;
  highlightErrors?: boolean;
}

export function XMLPreview({ 
  xml, 
  className,
  showLineNumbers = true,
  highlightErrors = true 
}: XMLPreviewProps) {
  const [validation, setValidation] = useState<{
    valid: boolean;
    errors: EnhancedError[];
  } | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  useEffect(() => {
    const validateXML = async () => {
      if (!xml || xml.trim() === "") {
        setValidation(null);
        return;
      }

      setIsValidating(true);
      try {
        const validator = getDefaultValidator();
        const result = validator.validateXML(xml);
        const enhancedErrors = enhanceXSDErrors(result.errors);
        
        setValidation({
          valid: result.valid,
          errors: enhancedErrors
        });
      } catch (error) {
        console.error("Validation error:", error);
        setValidation({
          valid: false,
          errors: [{
            message: "Failed to validate XML",
            level: "error",
            userFriendlyMessage: "An error occurred while validating the XML",
            suggestion: "Please check the XML format"
          }]
        });
      } finally {
        setIsValidating(false);
      }
    };

    const debounceTimer = setTimeout(validateXML, 300);
    return () => clearTimeout(debounceTimer);
  }, [xml]);

  const renderValidationStatus = () => {
    if (isValidating) {
      return (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
          Validating...
        </div>
      );
    }

    if (!validation) return null;

    if (validation.valid) {
      return (
        <div className="flex items-center gap-2 text-sm text-green-600">
          <CheckCircle2 className="h-4 w-4" />
          Valid XML (SII compliant)
        </div>
      );
    }

    const errorCount = validation.errors.filter(e => getErrorSeverity(e) === "error").length;
    const warningCount = validation.errors.filter(e => getErrorSeverity(e) === "warning").length;

    return (
      <div className="flex items-center gap-4 text-sm">
        {errorCount > 0 && (
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-4 w-4" />
            {errorCount} error{errorCount !== 1 ? "s" : ""}
          </div>
        )}
        {warningCount > 0 && (
          <div className="flex items-center gap-2 text-yellow-600">
            <AlertTriangle className="h-4 w-4" />
            {warningCount} warning{warningCount !== 1 ? "s" : ""}
          </div>
        )}
      </div>
    );
  };

  const renderErrors = () => {
    if (!validation || validation.valid || validation.errors.length === 0) {
      return null;
    }

    return (
      <div className="mt-4 space-y-2">
        {validation.errors.map((error, index) => {
          const severity = getErrorSeverity(error);
          const Icon = severity === "error" ? AlertCircle : 
                       severity === "warning" ? AlertTriangle : Info;
          const colorClass = severity === "error" ? "text-red-600 bg-red-50 border-red-200" :
                            severity === "warning" ? "text-yellow-600 bg-yellow-50 border-yellow-200" :
                            "text-blue-600 bg-blue-50 border-blue-200";

          return (
            <div
              key={index}
              className={cn(
                "flex gap-3 rounded-md border p-3",
                colorClass
              )}
            >
              <Icon className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <div className="flex-1 text-sm">
                <div className="font-medium">
                  {error.userFriendlyMessage || error.message}
                </div>
                {error.suggestion && (
                  <div className="mt-1 text-xs opacity-80">
                    💡 {error.suggestion}
                  </div>
                )}
                {error.line && (
                  <div className="mt-1 text-xs opacity-60">
                    Line {error.line}{error.column ? `, Column ${error.column}` : ""}
                  </div>
                )}
                {error.formField && (
                  <div className="mt-1 text-xs opacity-60">
                    Related field: {error.formField}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderXMLWithLineNumbers = () => {
    const lines = xml.split("\n");
    const errorLines = new Set(
      validation?.errors
        .filter(e => e.line)
        .map(e => e.line!)
    );

    return (
      <div className="flex">
        {showLineNumbers && (
          <div className="select-none pr-4 text-right text-sm text-muted-foreground">
            {lines.map((_, index) => (
              <div
                key={index}
                className={cn(
                  "leading-6",
                  highlightErrors && errorLines.has(index + 1) && "text-red-600 font-medium"
                )}
              >
                {index + 1}
              </div>
            ))}
          </div>
        )}
        <pre className="flex-1 overflow-x-auto">
          <code className="text-sm">
            {lines.map((line, index) => (
              <div
                key={index}
                className={cn(
                  "leading-6",
                  highlightErrors && errorLines.has(index + 1) && "bg-red-50"
                )}
              >
                {line || " "}
              </div>
            ))}
          </code>
        </pre>
      </div>
    );
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">XML Preview</h3>
        {renderValidationStatus()}
      </div>
      
      <div className="rounded-md border bg-muted/50 p-4">
        {xml ? renderXMLWithLineNumbers() : (
          <div className="text-center text-sm text-muted-foreground py-8">
            No XML content to preview
          </div>
        )}
      </div>

      {renderErrors()}
    </div>
  );
} 