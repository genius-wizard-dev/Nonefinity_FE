"use client";

import {
  CodeBlock,
  CodeBlockCopyButton,
} from "@/components/ai-elements/code-block";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { X } from "lucide-react";
import React, { useCallback, useMemo } from "react";
import type { Edge, Node } from "reactflow";
import {
  Background,
  Controls,
  MiniMap,
  Panel,
  ReactFlow,
  useEdgesState,
  useNodesState,
} from "reactflow";
import "reactflow/dist/style.css";

export type VectorPoint = {
  id: string;
  vector: number[];
  payload: Record<string, any>;
  score?: number;
  timestamp: string;
};
type VectorFlowGraphProps = {
  vectors: VectorPoint[];
  selectedVector: VectorPoint | null;
  onSelectVector: (vector: VectorPoint | null) => void;
};

// Simple point node component
const VectorNode = ({ data }: { data: any }) => {
  const { isSelected, isHovered } = data;

  return (
    <div
      className={`relative w-8 h-8 rounded-full border-2 transition-all duration-200 flex items-center justify-center ${
        isSelected
          ? "border-blue-500 bg-blue-500 shadow-lg scale-110"
          : isHovered
          ? "border-blue-300 bg-blue-300 shadow-md scale-105"
          : "border-gray-400 bg-gray-200 hover:border-gray-500 hover:bg-gray-300"
      }`}
    >
      <div className="w-2 h-2 rounded-full bg-white"></div>
    </div>
  );
};

// Node types
const nodeTypes = {
  vectorNode: VectorNode,
};

export default function VectorFlowGraph({
  vectors,
  selectedVector,
  onSelectVector,
}: VectorFlowGraphProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Convert vectors to 2D positions using simple PCA
  const reduceTo2D = useCallback(
    (vector: number[]): { x: number; y: number } => {
      if (vector.length === 0) return { x: 0, y: 0 };
      if (vector.length === 1) return { x: vector[0], y: 0 };
      if (vector.length === 2) return { x: vector[0], y: vector[1] };

      // Use first two components and normalize
      const x = vector[0] || 0;
      const y = vector[1] || 0;

      // Normalize to 0-1 range
      const magnitude = Math.sqrt(x * x + y * y);
      if (magnitude === 0) return { x: 0.5, y: 0.5 };

      return {
        x: (x / magnitude + 1) / 2,
        y: (y / magnitude + 1) / 2,
      };
    },
    []
  );

  // Create nodes from vectors
  const vectorNodes = useMemo(() => {
    return vectors.map((vector) => {
      const position = reduceTo2D(vector.vector);
      const isSelected = selectedVector?.id === vector.id;

      return {
        id: vector.id,
        type: "vectorNode",
        position: {
          x: position.x * 800, // Scale to reasonable size
          y: position.y * 600,
        },
        data: {
          vector,
          isSelected,
          isHovered: false,
        },
        draggable: true,
      } as Node;
    });
  }, [vectors, selectedVector, reduceTo2D]);

  // Create edges between similar vectors
  const vectorEdges = useMemo(() => {
    const edges: Edge[] = [];

    vectors.forEach((v1, i) => {
      vectors.slice(i + 1).forEach((v2) => {
        // Calculate cosine similarity
        const dotProduct = v1.vector.reduce(
          (sum, val, idx) => sum + val * (v2.vector[idx] || 0),
          0
        );
        const magnitude1 = Math.sqrt(
          v1.vector.reduce((sum, val) => sum + val * val, 0)
        );
        const magnitude2 = Math.sqrt(
          v2.vector.reduce((sum, val) => sum + val * val, 0)
        );

        if (magnitude1 > 0 && magnitude2 > 0) {
          const similarity = dotProduct / (magnitude1 * magnitude2);

          if (similarity > 0.7) {
            // Only show high similarity connections
            edges.push({
              id: `${v1.id}-${v2.id}`,
              source: v1.id,
              target: v2.id,
              type: "smoothstep",
              animated: false,
              style: {
                stroke: "#3b82f6",
                strokeWidth: 2,
                opacity: similarity,
              },
            });
          }
        }
      });
    });

    return edges;
  }, [vectors]);

  // Update nodes when vectors change
  React.useEffect(() => {
    setNodes(vectorNodes);
  }, [vectorNodes, setNodes]);

  // Update edges when vectors change
  React.useEffect(() => {
    setEdges(vectorEdges);
  }, [vectorEdges, setEdges]);

  // Handle node click
  const onNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      const vector = vectors.find((v) => v.id === node.id);
      if (vector) {
        onSelectVector(selectedVector?.id === vector.id ? null : vector);
      }
    },
    [vectors, selectedVector, onSelectVector]
  );

  // Handle node mouse enter/leave for hover effects
  const onNodeMouseEnter = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      setNodes((nds) =>
        nds.map((n) =>
          n.id === node.id ? { ...n, data: { ...n.data, isHovered: true } } : n
        )
      );
    },
    [setNodes]
  );

  const onNodeMouseLeave = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      setNodes((nds) =>
        nds.map((n) =>
          n.id === node.id ? { ...n, data: { ...n.data, isHovered: false } } : n
        )
      );
    },
    [setNodes]
  );

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        onNodeMouseEnter={onNodeMouseEnter}
        onNodeMouseLeave={onNodeMouseLeave}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{
          padding: 0.1,
        }}
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        minZoom={0.1}
        maxZoom={4}
        attributionPosition="bottom-left"
      >
        <Background color="#f1f5f9" gap={20} />
        <Controls />
        <MiniMap
          nodeColor={(node) => {
            if (node.data?.isSelected) return "#3b82f6";
            if (node.data?.isHovered) return "#60a5fa";
            return "#94a3b8";
          }}
          nodeStrokeWidth={3}
          nodeBorderRadius={8}
          maskColor="rgba(0, 0, 0, 0.1)"
        />

        {/* Selected Vector Info Panel - Only show when vector is selected */}
        {selectedVector && (
          <Panel position="top-right">
            <Card className="w-96 p-6 bg-white/95 backdrop-blur border shadow-lg">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Vector Point Details
                    </h3>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 hover:bg-gray-100"
                    onClick={() => onSelectVector(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {/* Vector ID and Score */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      Vector ID
                    </p>
                    <code className="text-sm font-mono text-gray-900 bg-gray-100 px-2 py-1 rounded break-all">
                      {selectedVector.id}
                    </code>
                  </div>
                  {selectedVector.score !== undefined &&
                    selectedVector.score !== null && (
                      <div>
                        <p className="text-sm font-medium text-gray-700">
                          Score
                        </p>
                        <span className="text-lg font-mono text-blue-600 font-bold">
                          {selectedVector.score.toFixed(4)}
                        </span>
                      </div>
                    )}
                </div>

                {/* Tabs for View Options */}
                <Tabs defaultValue="payload" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="payload">View Payload</TabsTrigger>
                    <TabsTrigger value="vector">View Vector</TabsTrigger>
                  </TabsList>

                  <TabsContent value="payload" className="mt-4">
                    {Object.keys(selectedVector.payload).length > 0 ? (
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">
                          Payload Data
                        </p>
                        <div className="max-h-64 overflow-y-auto">
                          <CodeBlock
                            code={JSON.stringify(
                              selectedVector.payload,
                              null,
                              2
                            )}
                            language="json"
                            className="border-0 shadow-none whitespace-pre-wrap"
                          >
                            <CodeBlockCopyButton />
                          </CodeBlock>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-sm text-gray-500">
                          No payload data available
                        </p>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="vector" className="mt-4">
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        Vector Embedding
                      </p>
                      <div className="max-h-64 overflow-y-auto">
                        <CodeBlock
                          code={
                            selectedVector.vector.length <= 100
                              ? `[${selectedVector.vector
                                  .map((v) => v.toFixed(4))
                                  .join(", ")}]`
                              : `[${selectedVector.vector
                                  .slice(0, 100)
                                  .map((v) => v.toFixed(4))
                                  .join(", ")}, ... ]`
                          }
                          language="javascript"
                          className="border-0 shadow-none whitespace-pre-wrap"
                        >
                          <CodeBlockCopyButton
                            onCopy={() => {
                              // Copy full vector data
                              const fullVector = `[${selectedVector.vector
                                .map((v) => v.toFixed(4))
                                .join(", ")}]`;
                              navigator.clipboard.writeText(fullVector);
                            }}
                          />
                        </CodeBlock>
                        <div className="mt-2 text-xs text-gray-500">
                          Dimension: {selectedVector.vector.length}
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>

                {/* Timestamp */}
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">
                    Created
                  </p>
                  <p className="text-sm font-mono text-gray-600 break-words">
                    {new Date(selectedVector.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            </Card>
          </Panel>
        )}

        {/* Legend */}
        <Panel position="bottom-left">
          <Card className="p-4 bg-white/95 backdrop-blur border shadow-lg">
            <div className="space-y-3">
              <p className="text-sm font-semibold text-gray-900">
                Vector Space
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-gray-300 border-2 border-gray-400"></div>
                  <span className="text-sm text-gray-700">Vector Point</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-blue-500 border-2 border-blue-500"></div>
                  <span className="text-sm text-gray-700">Selected Point</span>
                </div>
              </div>
              <div className="pt-2 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  Click a point to view details
                </p>
              </div>
            </div>
          </Card>
        </Panel>
      </ReactFlow>
    </div>
  );
}
