"use client";

import React, { useMemo } from 'react';
import { Highlight, themes } from 'prism-react-renderer';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { AlertCircle } from 'lucide-react';
import type { ValidationResult } from '@/lib/xml-validation/simple-xsd-validator';
import { cn } from '@/lib/utils';
import { useVirtualizer } from '@tanstack/react-virtual';

interface RawXMLViewProps {
  xml: string;
  searchTerm: string;
  validation?: ValidationResult;
}

export const RawXMLView: React.FC<RawXMLViewProps> = ({
  xml,
  searchTerm,
  validation
}) => {
  const lines = useMemo(() => xml.split('\n'), [xml]);

  const highlightedLines = useMemo(() => {
    if (!searchTerm.trim()) return null;

    const regex = new RegExp(`(${escapeRegex(searchTerm)})`, 'gi');
    return lines.map(line => {
      if (regex.test(line)) {
        return line.replace(regex, '<mark>$1</mark>');
      }
      return line;
    });
  }, [lines, searchTerm]);

  const errorsByLine = useMemo(() => {
    const map = new Map<number, string[]>();
    validation?.errors.forEach(error => {
      if (error.line) {
        const existing = map.get(error.line) || [];
        existing.push(error.message);
        map.set(error.line, existing);
      }
    });
    return map;
  }, [validation]);

  // For performance with large files
  if (lines.length > 1000) {
    return <VirtualizedXMLView xml={xml} searchTerm={searchTerm} validation={validation} />;
  }

  return (
    <TooltipProvider>
      <ScrollArea className="h-full">
        <div className="relative">
          <LineNumbers lines={lines.length} />

          <Highlight
            theme={themes.vsDark}
            code={xml}
            language="xml"
          >
            {({ className, style, tokens, getLineProps, getTokenProps }) => (
              <pre className={cn(className, "p-4 pl-16 m-0")} style={style}>
                {tokens.map((line, i) => {
                  const lineError = errorsByLine.get(i + 1);
                  const lineProps = getLineProps({ line, key: i });

                  return (
                    <div
                      key={i}
                      {...lineProps}
                      className={cn(
                        lineProps.className,
                        lineError && "bg-destructive/10 border-l-2 border-destructive pl-2"
                      )}
                    >
                      {lineError && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <AlertCircle className="inline h-4 w-4 mr-2 text-destructive" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <div className="max-w-xs">
                              {lineError.map((msg, idx) => (
                                <p key={idx}>{msg}</p>
                              ))}
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      )}

                      {line.map((token, key) => {
                        const tokenProps = getTokenProps({ token, key });
                        
                        // Handle search highlighting
                        if (highlightedLines && highlightedLines[i]?.includes('<mark>')) {
                          const content = token.content;
                          if (searchTerm && content.toLowerCase().includes(searchTerm.toLowerCase())) {
                            return (
                              <span
                                key={key}
                                {...tokenProps}
                                className={cn(tokenProps.className, "bg-yellow-500/30")}
                              />
                            );
                          }
                        }
                        
                        return <span key={key} {...tokenProps} />;
                      })}
                    </div>
                  );
                })}
              </pre>
            )}
          </Highlight>
        </div>
      </ScrollArea>
    </TooltipProvider>
  );
};

const LineNumbers: React.FC<{ lines: number }> = ({ lines }) => {
  return (
    <div className="absolute left-0 top-0 w-12 bg-muted/30 text-muted-foreground text-xs font-mono p-4 select-none">
      {Array.from({ length: lines }, (_, i) => (
        <div key={i} className="text-right pr-2">
          {i + 1}
        </div>
      ))}
    </div>
  );
};

// Virtualized view for large XML files
const VirtualizedXMLView: React.FC<RawXMLViewProps> = ({ xml, searchTerm, validation }) => {
  const parentRef = React.useRef<HTMLDivElement>(null);
  const lines = useMemo(() => xml.split('\n'), [xml]);

  const rowVirtualizer = useVirtualizer({
    count: lines.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 24,
    overscan: 10
  });

  const errorsByLine = useMemo(() => {
    const map = new Map<number, string[]>();
    validation?.errors.forEach(error => {
      if (error.line) {
        const existing = map.get(error.line) || [];
        existing.push(error.message);
        map.set(error.line, existing);
      }
    });
    return map;
  }, [validation]);

  return (
    <div ref={parentRef} className="h-full overflow-auto">
      <div style={{ height: rowVirtualizer.getTotalSize() }} className="relative">
        <LineNumbers lines={lines.length} />
        
        <div className="pl-16">
          {rowVirtualizer.getVirtualItems().map(virtualRow => (
            <div
              key={virtualRow.index}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: virtualRow.size,
                transform: `translateY(${virtualRow.start}px)`
              }}
            >
              <XMLLine
                line={lines[virtualRow.index]}
                lineNumber={virtualRow.index + 1}
                error={errorsByLine.get(virtualRow.index + 1)}
                searchTerm={searchTerm}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const XMLLine: React.FC<{
  line: string;
  lineNumber: number;
  error?: string[];
  searchTerm?: string;
}> = ({ line, lineNumber, error, searchTerm }) => {
  const highlighted = useMemo(() => {
    if (!searchTerm?.trim() || !line.toLowerCase().includes(searchTerm.toLowerCase())) {
      return line;
    }

    const regex = new RegExp(`(${escapeRegex(searchTerm)})`, 'gi');
    return line.replace(regex, '<mark class="bg-yellow-500/30">$1</mark>');
  }, [line, searchTerm]);

  return (
    <div
      className={cn(
        "px-4 font-mono text-sm whitespace-pre",
        error && "bg-destructive/10 border-l-2 border-destructive"
      )}
    >
      {error && (
        <Tooltip>
          <TooltipTrigger asChild>
            <AlertCircle className="inline h-4 w-4 mr-2 text-destructive" />
          </TooltipTrigger>
          <TooltipContent>
            <div className="max-w-xs">
              {error.map((msg, idx) => (
                <p key={idx}>{msg}</p>
              ))}
            </div>
          </TooltipContent>
        </Tooltip>
      )}
      
      {searchTerm ? (
        <span dangerouslySetInnerHTML={{ __html: highlighted }} />
      ) : (
        <span>{line}</span>
      )}
    </div>
  );
};

function escapeRegex(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
} 