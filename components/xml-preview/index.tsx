"use client";

import React, { useState, useMemo, useCallback } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Input } from '@/components/ui/input';
import { 
  FolderTree, 
  Code, 
  Copy, 
  Download, 
  Check, 
  Search,
  AlertCircle,
  ChevronDown,
  FileX2,
  FileJson,
  FileText
} from 'lucide-react';
import type { ValidationResult } from '@/lib/xml-validation/simple-xsd-validator';
import { TreeView } from './tree-view';
import { RawXMLView } from './raw-xml-view';
import { downloadFile, xmlToJson } from '@/lib/utils/file-utils';
import { cn } from '@/lib/utils';

interface XMLPreviewProps {
  xml: string;
  validation?: ValidationResult;
  fileName?: string;
  onDownload?: () => void;
}

export const XMLPreview: React.FC<XMLPreviewProps> = ({
  xml,
  validation,
  fileName = 'generated.xml',
  onDownload
}) => {
  const [view, setView] = useState<'formatted' | 'raw'>('formatted');
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);

  // Search functionality
  const searchResults = useMemo(() => {
    if (!searchTerm.trim()) return [];
    
    const regex = new RegExp(searchTerm, 'gi');
    const matches: Array<{ index: number; line: number; text: string }> = [];
    let match;

    while ((match = regex.exec(xml)) !== null) {
      const lines = xml.substring(0, match.index).split('\n');
      matches.push({
        index: match.index,
        line: lines.length,
        text: match[0]
      });
    }

    return matches;
  }, [xml, searchTerm]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(xml);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  }, [xml]);

  const handleDownload = useCallback(() => {
    if (onDownload) {
      onDownload();
    } else {
      downloadFile(xml, fileName, 'application/xml');
    }
  }, [xml, fileName, onDownload]);

  const handleExport = useCallback((format: 'xml' | 'json' | 'pdf') => {
    switch (format) {
      case 'xml':
        handleDownload();
        break;
      case 'json':
        try {
          const json = xmlToJson(xml);
          const jsonString = JSON.stringify(json, null, 2);
          downloadFile(jsonString, fileName.replace('.xml', '.json'), 'application/json');
        } catch (error) {
          console.error('Failed to convert to JSON:', error);
        }
        break;
      case 'pdf':
        // PDF export would require additional implementation
        console.log('PDF export not implemented yet');
        break;
    }
  }, [xml, fileName, handleDownload]);

  const toggleNode = useCallback((nodePath: string) => {
    setExpandedNodes(prev => {
      const next = new Set(prev);
      if (next.has(nodePath)) {
        next.delete(nodePath);
      } else {
        next.add(nodePath);
      }
      return next;
    });
  }, []);

  const expandAll = useCallback(() => {
    // This would need the parsed tree structure
    // For now, we'll implement it in the TreeView component
  }, []);

  const collapseAll = useCallback(() => {
    setExpandedNodes(new Set());
  }, []);

  return (
    <Card className="w-full h-full flex flex-col">
      <CardHeader className="flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <CardTitle>XML Preview</CardTitle>
            {fileName && (
              <Badge variant="outline">{fileName}</Badge>
            )}
            <ValidationBadge validation={validation} />
          </div>

          <div className="flex items-center gap-2">
            <ToggleGroup
              type="single"
              value={view}
              onValueChange={(value) => value && setView(value as 'formatted' | 'raw')}
            >
              <ToggleGroupItem value="formatted" aria-label="Tree View">
                <FolderTree className="h-4 w-4 mr-2" />
                Tree View
              </ToggleGroupItem>
              <ToggleGroupItem value="raw" aria-label="Raw XML">
                <Code className="h-4 w-4 mr-2" />
                Raw XML
              </ToggleGroupItem>
            </ToggleGroup>

            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
            >
              {copySuccess ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>

            <ExportMenu onExport={handleExport} />

            <Button
              size="sm"
              onClick={handleDownload}
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden p-0">
        {view === 'formatted' ? (
          <TreeView
            xml={xml}
            expandedNodes={expandedNodes}
            onToggleNode={toggleNode}
            searchTerm={searchTerm}
            validation={validation}
            onExpandAll={expandAll}
            onCollapseAll={collapseAll}
          />
        ) : (
          <RawXMLView
            xml={xml}
            searchTerm={searchTerm}
            validation={validation}
          />
        )}
      </CardContent>

      <CardFooter className="flex-shrink-0 border-t">
        <div className="flex items-center gap-2 w-full">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search in XML..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
          {searchTerm && (
            <Badge variant="secondary">
              {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
            </Badge>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

const ValidationBadge: React.FC<{ validation?: ValidationResult }> = ({ validation }) => {
  if (!validation) return null;

  return (
    <Badge 
      variant={validation.valid ? "default" : "destructive"}
      className="flex items-center gap-1"
    >
      {validation.valid ? (
        <>
          <Check className="h-3 w-3" />
          Valid
        </>
      ) : (
        <>
          <AlertCircle className="h-3 w-3" />
          {validation.errors.length} error{validation.errors.length !== 1 ? 's' : ''}
        </>
      )}
    </Badge>
  );
};

const ExportMenu: React.FC<{ onExport: (format: 'xml' | 'json' | 'pdf') => void }> = ({ onExport }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(!open)}
      >
        Export <ChevronDown className="ml-2 h-4 w-4" />
      </Button>
      
      {open && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-popover ring-1 ring-black ring-opacity-5 z-50">
            <div className="py-1" role="menu">
              <button
                className="flex items-center px-4 py-2 text-sm hover:bg-accent w-full text-left"
                onClick={() => {
                  onExport('xml');
                  setOpen(false);
                }}
              >
                <FileX2 className="mr-2 h-4 w-4" />
                Download XML
              </button>
              <button
                className="flex items-center px-4 py-2 text-sm hover:bg-accent w-full text-left"
                onClick={() => {
                  onExport('json');
                  setOpen(false);
                }}
              >
                <FileJson className="mr-2 h-4 w-4" />
                Export as JSON
              </button>
              <button
                className="flex items-center px-4 py-2 text-sm hover:bg-accent w-full text-left opacity-50 cursor-not-allowed"
                onClick={() => setOpen(false)}
                disabled
              >
                <FileText className="mr-2 h-4 w-4" />
                Generate PDF Report
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default XMLPreview; 