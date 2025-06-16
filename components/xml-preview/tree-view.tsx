"use client";

import React, { useMemo, useCallback } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ChevronRight, AlertCircle, Maximize2, Minimize2 } from 'lucide-react';
import { XMLParser } from 'fast-xml-parser';
import type { ValidationResult, ValidationError } from '@/lib/xml-validation/simple-xsd-validator';
import { cn } from '@/lib/utils';

interface TreeViewProps {
  xml: string;
  expandedNodes: Set<string>;
  onToggleNode: (path: string) => void;
  searchTerm: string;
  validation?: ValidationResult;
  onExpandAll?: () => void;
  onCollapseAll?: () => void;
}

interface XMLNode {
  name: string;
  path: string;
  attributes?: Record<string, any>;
  text?: string;
  children?: XMLNode[];
  highlighted?: boolean;
}

export const TreeView: React.FC<TreeViewProps> = ({
  xml,
  expandedNodes,
  onToggleNode,
  searchTerm,
  validation,
  onExpandAll,
  onCollapseAll
}) => {
  const tree = useMemo(() => parseXMLToTree(xml), [xml]);
  const highlightedTree = useMemo(
    () => highlightSearchResults(tree, searchTerm),
    [tree, searchTerm]
  );

  const allNodePaths = useMemo(() => {
    const paths: string[] = [];
    const collectPaths = (node: XMLNode) => {
      if (node.children && node.children.length > 0) {
        paths.push(node.path);
        node.children.forEach(collectPaths);
      }
    };
    if (tree) collectPaths(tree);
    return paths;
  }, [tree]);

  const handleExpandAll = useCallback(() => {
    allNodePaths.forEach(path => {
      onToggleNode(path);
    });
  }, [allNodePaths, onToggleNode]);

  const handleCollapseAll = useCallback(() => {
    expandedNodes.forEach(path => {
      onToggleNode(path);
    });
  }, [expandedNodes, onToggleNode]);

  if (!highlightedTree) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <p>Unable to parse XML</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-end p-2 border-b">
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={onExpandAll || handleExpandAll}
            title="Expand all"
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCollapseAll || handleCollapseAll}
            title="Collapse all"
          >
            <Minimize2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-4 font-mono text-sm">
          <TooltipProvider>
            <XMLNodeComponent
              node={highlightedTree}
              depth={0}
              expanded={expandedNodes}
              onToggle={onToggleNode}
              validation={validation}
            />
          </TooltipProvider>
        </div>
      </ScrollArea>
    </div>
  );
};

const XMLNodeComponent: React.FC<{
  node: XMLNode;
  depth: number;
  expanded: Set<string>;
  onToggle: (path: string) => void;
  validation?: ValidationResult;
}> = ({ node, depth, expanded, onToggle, validation }) => {
  const isExpanded = expanded.has(node.path);
  const hasError = validation?.errors.some(e => e.path === node.path);
  const error = validation?.errors.find(e => e.path === node.path);
  const isHighlighted = node.highlighted;

  const renderAttributes = () => {
    if (!node.attributes || Object.keys(node.attributes).length === 0) return null;

    return (
      <span className="ml-2">
        {Object.entries(node.attributes).map(([key, value], index) => (
          <span key={key}>
            {index > 0 && ' '}
            <span className="text-green-600 dark:text-green-400">{key}</span>
            =
            <span className="text-orange-600 dark:text-orange-400">"{value}"</span>
          </span>
        ))}
      </span>
    );
  };

  return (
    <div>
      <div
        className={cn(
          "flex items-center py-1 hover:bg-muted/50 rounded cursor-pointer transition-colors",
          hasError && "bg-destructive/10 hover:bg-destructive/20",
          isHighlighted && "bg-yellow-100 dark:bg-yellow-900/20"
        )}
        style={{ paddingLeft: `${depth * 20}px` }}
        onClick={() => node.children && onToggle(node.path)}
      >
        {node.children && node.children.length > 0 && (
          <ChevronRight
            className={cn(
              "h-4 w-4 mr-1 transition-transform",
              isExpanded && "rotate-90"
            )}
          />
        )}

        <span className="text-blue-600 dark:text-blue-400">
          &lt;{node.name}
        </span>
        
        {renderAttributes()}

        {(!node.children || node.children.length === 0) && !node.text && (
          <span className="text-blue-600 dark:text-blue-400">/&gt;</span>
        )}

        {node.text && (
          <>
            <span className="text-blue-600 dark:text-blue-400">&gt;</span>
            <span className="ml-2 text-gray-700 dark:text-gray-300">
              {node.text}
            </span>
            <span className="text-blue-600 dark:text-blue-400">
              &lt;/{node.name}&gt;
            </span>
          </>
        )}

        {node.children && node.children.length > 0 && !isExpanded && (
          <span className="text-blue-600 dark:text-blue-400">&gt;...&lt;/{node.name}&gt;</span>
        )}

        {hasError && error && (
          <Tooltip>
            <TooltipTrigger asChild>
              <AlertCircle className="h-4 w-4 ml-2 text-destructive" />
            </TooltipTrigger>
            <TooltipContent>
              <p>{error.message}</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>

      {isExpanded && node.children && (
        <div>
          {node.children.map((child, index) => (
            <XMLNodeComponent
              key={`${child.path}-${index}`}
              node={child}
              depth={depth + 1}
              expanded={expanded}
              onToggle={onToggle}
              validation={validation}
            />
          ))}
          <div
            style={{ paddingLeft: `${depth * 20}px` }}
            className="py-1 text-blue-600 dark:text-blue-400"
          >
            &lt;/{node.name}&gt;
          </div>
        </div>
      )}
    </div>
  );
};

function parseXMLToTree(xml: string): XMLNode | null {
  try {
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
      textNodeName: '#text',
      preserveOrder: false,
      processEntities: true,
      trimValues: true,
      parseTrueNumberOnly: false,
      parseAttributeValue: false,
      parseTagValue: true,
      ignoreDeclaration: true
    });

    const result = parser.parse(xml);
    
    console.log('Parsed result:', result);
    
    if (!result || Object.keys(result).length === 0) return null;

    // Convert the parsed object to our tree structure
    const buildNode = (obj: any, name: string, path: string): XMLNode => {
      const node: XMLNode = { name, path };

      // Handle attributes
      const attributes: Record<string, any> = {};
      Object.keys(obj).forEach(key => {
        if (key.startsWith('@_')) {
          attributes[key.substring(2)] = obj[key];
        }
      });
      
      if (Object.keys(attributes).length > 0) {
        node.attributes = attributes;
      }

      // Check if this is a text node
      const hasOnlyTextAndAttributes = Object.keys(obj).every(
        key => key === '#text' || key.startsWith('@_')
      );

      if (hasOnlyTextAndAttributes && obj['#text'] !== undefined) {
        node.text = String(obj['#text']);
      }

      // Process children
      const children: XMLNode[] = [];
      Object.keys(obj).forEach(key => {
        if (key !== '#text' && !key.startsWith('@_')) {
          const childValue = obj[key];
          if (Array.isArray(childValue)) {
            childValue.forEach((item, index) => {
              children.push(buildNode(item, key, `${path}.${key}[${index}]`));
            });
          } else {
            children.push(buildNode(childValue, key, `${path}.${key}`));
          }
        }
      });

      if (children.length > 0) {
        node.children = children;
      }

      return node;
    };

    // Get the root element - it should be Offerta
    const rootName = Object.keys(result)[0];
    if (!rootName || !result[rootName]) return null;
    
    // Build from the root element's content
    return buildNode(result[rootName], rootName, rootName);
  } catch (error) {
    console.error('Failed to parse XML:', error);
    return null;
  }
}

function highlightSearchResults(node: XMLNode | null, searchTerm: string): XMLNode | null {
  if (!node || !searchTerm.trim()) return node;

  const regex = new RegExp(`(${escapeRegex(searchTerm)})`, 'gi');
  
  const highlightNode = (n: XMLNode): XMLNode => {
    const highlighted = { ...n };
    
    // Check node name
    if (regex.test(n.name)) {
      highlighted.highlighted = true;
    }
    
    // Check attributes
    if (n.attributes) {
      Object.entries(n.attributes).forEach(([key, value]) => {
        if (regex.test(key) || regex.test(String(value))) {
          highlighted.highlighted = true;
        }
      });
    }
    
    // Check text content
    if (n.text && regex.test(n.text)) {
      highlighted.highlighted = true;
    }
    
    // Recursively check children
    if (n.children) {
      highlighted.children = n.children.map(highlightNode);
      // If any child is highlighted, expand parent
      if (highlighted.children.some(child => child.highlighted)) {
        highlighted.highlighted = true;
      }
    }
    
    return highlighted;
  };

  return highlightNode(node);
}

function escapeRegex(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
} 