import React, { useState, useMemo } from 'react';
import { 
  GitBranch, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Filter, 
  Layers, 
  FileText, 
  FolderArchive, 
  X,
  ExternalLink,
  ShieldCheck,
  Info
} from 'lucide-react';
import { useTrace } from '../../context/TraceContext';
import { Case, Connection, Entity, EntityType, Evidence } from '../../types';

interface Props {
  focusedCaseId?: string; // If provided, limits to subgraph of this case
}

interface GraphNode {
  id: string;
  label: string;
  type: 'CASE' | 'EVIDENCE' | 'ENTITY';
  entityType?: EntityType;
  x: number;
  y: number;
  data: any;
}

interface GraphEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  isHighConfidence?: boolean;
}

export const InvestigationGraph: React.FC<Props> = ({ focusedCaseId }) => {
  const { cases, evidence, entities, connections, setActiveView, setSelectedCaseId, setSelectedConnectionId } = useTrace();

  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [filterType, setFilterType] = useState<string>('ALL');

  // Compute Nodes and Edges deterministically
  const { nodes, edges } = useMemo(() => {
    const calculatedNodes: GraphNode[] = [];
    const calculatedEdges: GraphEdge[] = [];
    const nodeMap = new Set<string>();

    // Determine relevant cases
    const relevantCases = focusedCaseId
      ? cases.filter(c => {
          if (c.case_number === focusedCaseId) return true;
          // Include cases connected to this case
          return connections.some(
            conn => (conn.case_a === focusedCaseId && conn.case_b === c.case_number) ||
                    (conn.case_b === focusedCaseId && conn.case_a === c.case_number)
          );
        })
      : cases.slice(0, 8); // Top 8 cases for clean global view

    const relevantCaseNumbers = new Set(relevantCases.map(c => c.case_number));

    // Layout geometry
    const centerX = 500;
    const centerY = 350;
    const caseRadius = focusedCaseId ? 280 : 240;

    // 1. Position Case Nodes in circle
    relevantCases.forEach((c, idx) => {
      const angle = (idx / relevantCases.length) * 2 * Math.PI - Math.PI / 2;
      const x = focusedCaseId && c.case_number === focusedCaseId 
        ? centerX 
        : centerX + caseRadius * Math.cos(angle);
      const y = focusedCaseId && c.case_number === focusedCaseId 
        ? centerY 
        : centerY + caseRadius * Math.sin(angle);

      const node: GraphNode = {
        id: `node-case-${c.case_number}`,
        label: c.case_number,
        type: 'CASE',
        x,
        y,
        data: c,
      };
      calculatedNodes.push(node);
      nodeMap.add(node.id);
    });

    // 2. Position Entities and connect to cases
    const relevantEntities = entities.filter(e => relevantCaseNumbers.has(e.source_case_id));
    
    // Group entities by normalized value
    const entityGroups = new Map<string, Entity[]>();
    relevantEntities.forEach(ent => {
      if (filterType !== 'ALL' && ent.type !== filterType) return;
      const key = `${ent.type}:${ent.normalized_value}`;
      if (!entityGroups.has(key)) entityGroups.set(key, []);
      entityGroups.get(key)!.push(ent);
    });

    let entIdx = 0;
    const totalEnts = entityGroups.size;
    const entRadius = 140;

    entityGroups.forEach((entList, key) => {
      // If shared across cases or focused case
      const sourceCases = Array.from(new Set(entList.map(e => e.source_case_id)));
      const isShared = sourceCases.length > 1;

      // Position shared entities closer to center, unique entities around their case
      let x = centerX;
      let y = centerY;

      if (isShared) {
        const angle = (entIdx / Math.max(1, totalEnts)) * 2 * Math.PI;
        x = centerX + (entRadius * 0.7) * Math.cos(angle);
        y = centerY + (entRadius * 0.7) * Math.sin(angle);
      } else {
        const parentCaseNode = calculatedNodes.find(n => n.id === `node-case-${sourceCases[0]}`);
        if (parentCaseNode) {
          const offsetAngle = (entIdx * 1.5);
          x = parentCaseNode.x + 80 * Math.cos(offsetAngle);
          y = parentCaseNode.y + 80 * Math.sin(offsetAngle);
        }
      }

      const repEntity = entList[0];
      const entityNodeId = `node-ent-${repEntity.id}`;

      const entNode: GraphNode = {
        id: entityNodeId,
        label: `${repEntity.type}: ${repEntity.normalized_value}`,
        type: 'ENTITY',
        entityType: repEntity.type,
        x,
        y,
        data: {
          entity: repEntity,
          allOccurrences: entList,
          isShared,
          linkedCases: sourceCases,
        },
      };

      calculatedNodes.push(entNode);
      nodeMap.add(entityNodeId);

      // Add edges from this entity to all cases where it appears
      sourceCases.forEach(cNum => {
        const caseNodeId = `node-case-${cNum}`;
        if (nodeMap.has(caseNodeId)) {
          calculatedEdges.push({
            id: `edge-${cNum}-${entityNodeId}`,
            source: caseNodeId,
            target: entityNodeId,
            isHighConfidence: isShared,
          });
        }
      });

      entIdx++;
    });

    return { nodes: calculatedNodes, edges: calculatedEdges };
  }, [cases, entities, connections, focusedCaseId, filterType]);

  // Pan / Drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target instanceof SVGElement && e.target.tagName === 'svg') {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    }
  };

  const handleMouseUp = () => setIsDragging(false);

  return (
    <div className="space-y-4">
      {/* Controls & Filter Bar */}
      <div className="p-3 bg-[#121619] rounded-lg border border-[#242B30] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <GitBranch className="w-4 h-4 text-[#81A2A2]" />
          <span className="text-xs font-bold text-[#F2F2F2]">
            {focusedCaseId ? `Relationship Subgraph for ${focusedCaseId}` : 'Cross-Case Investigation Intelligence Graph'}
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#060606] text-[#8A9399] border border-[#242B30]">
            {nodes.length} nodes • {edges.length} connections
          </span>
        </div>

        {/* Filter by Entity Type */}
        <div className="flex items-center space-x-2">
          <span className="text-[11px] text-[#5F686E]">Filter Indicators:</span>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-[#060606] border border-[#242B30] focus:border-[#81A2A2] rounded px-2 py-1 text-xs text-[#F2F2F2] outline-none font-mono"
          >
            <option value="ALL">All Indicator Types</option>
            <option value="PHONE">PHONE</option>
            <option value="UPI">UPI</option>
            <option value="WEBSITE">WEBSITE / DOMAIN</option>
            <option value="EMAIL">EMAIL</option>
            <option value="IP_ADDRESS">IP ADDRESS</option>
            <option value="TRANSACTION">TRANSACTION</option>
          </select>

          {/* Zoom controls */}
          <div className="flex items-center space-x-1 pl-2 border-l border-[#242B30]">
            <button
              onClick={() => setZoom(z => Math.min(2.5, z + 0.2))}
              className="p-1 rounded bg-[#060606] hover:bg-[#242B30] text-[#8A9399] hover:text-[#F2F2F2] border border-[#242B30]"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoom(z => Math.max(0.4, z - 0.2))}
              className="p-1 rounded bg-[#060606] hover:bg-[#242B30] text-[#8A9399] hover:text-[#F2F2F2] border border-[#242B30]"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}
              className="p-1 rounded bg-[#060606] hover:bg-[#242B30] text-[#8A9399] hover:text-[#F2F2F2] border border-[#242B30]"
              title="Reset View"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Canvas & Inspection Drawer */}
      <div className="relative h-[600px] bg-[#060606] border border-[#242B30] rounded-lg overflow-hidden flex">
        {/* SVG Network Graph */}
        <svg
          className="w-full h-full cursor-grab active:cursor-grabbing select-none"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        >
          {/* Grid Background Pattern */}
          <defs>
            <pattern id="graph-grid" width="30" height="30" patternUnits="userSpaceOnUse">
              <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#121619" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#graph-grid)" />

          <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
            {/* Edges */}
            {edges.map((edge) => {
              const sourceNode = nodes.find(n => n.id === edge.source);
              const targetNode = nodes.find(n => n.id === edge.target);
              if (!sourceNode || !targetNode) return null;

              return (
                <line
                  key={edge.id}
                  x1={sourceNode.x}
                  y1={sourceNode.y}
                  x2={targetNode.x}
                  y2={targetNode.y}
                  stroke={edge.isHighConfidence ? '#81A2A2' : '#242B30'}
                  strokeWidth={edge.isHighConfidence ? 2 : 1}
                  strokeDasharray={edge.isHighConfidence ? 'none' : '4,4'}
                  opacity={0.7}
                />
              );
            })}

            {/* Nodes */}
            {nodes.map((node) => {
              const isSelected = selectedNode?.id === node.id;

              if (node.type === 'CASE') {
                const c = node.data as Case;
                const isCurrent = c.case_number === focusedCaseId;

                return (
                  <g
                    key={node.id}
                    transform={`translate(${node.x}, ${node.y})`}
                    onClick={() => setSelectedNode(node)}
                    className="cursor-pointer group"
                  >
                    <rect
                      x="-55"
                      y="-25"
                      width="110"
                      height="50"
                      rx="6"
                      fill="#121619"
                      stroke={isSelected ? '#81A2A2' : isCurrent ? '#B7FF3C' : '#454F56'}
                      strokeWidth={isSelected || isCurrent ? 2 : 1}
                      className="transition-colors"
                    />
                    <text
                      x="0"
                      y="-4"
                      textAnchor="middle"
                      fill="#F2F2F2"
                      fontSize="11"
                      fontFamily="JetBrains Mono"
                      fontWeight="bold"
                    >
                      {c.case_number}
                    </text>
                    <text
                      x="0"
                      y="12"
                      textAnchor="middle"
                      fill="#8A9399"
                      fontSize="9"
                    >
                      {c.crime_type.length > 14 ? c.crime_type.slice(0, 12) + '..' : c.crime_type}
                    </text>
                  </g>
                );
              }

              // ENTITY NODE
              const entData = node.data;
              const isShared = entData.isShared;

              return (
                <g
                  key={node.id}
                  transform={`translate(${node.x}, ${node.y})`}
                  onClick={() => setSelectedNode(node)}
                  className="cursor-pointer group"
                >
                  <circle
                    r={isShared ? 14 : 9}
                    fill={isShared ? '#121619' : '#060606'}
                    stroke={isSelected ? '#81A2A2' : isShared ? '#F5C451' : '#242B30'}
                    strokeWidth={isSelected || isShared ? 2 : 1}
                  />
                  {isShared && (
                    <text
                      x="0"
                      y="3.5"
                      textAnchor="middle"
                      fill="#F5C451"
                      fontSize="9"
                      fontFamily="JetBrains Mono"
                      fontWeight="bold"
                    >
                      {entData.linkedCases.length}
                    </text>
                  )}
                  <text
                    x="0"
                    y={isShared ? 26 : 20}
                    textAnchor="middle"
                    fill={isShared ? '#F2F2F2' : '#8A9399'}
                    fontSize="9"
                    fontFamily="JetBrains Mono"
                    className="bg-[#060606] px-1"
                  >
                    {node.label.length > 20 ? node.label.slice(0, 18) + '..' : node.label}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>

        {/* Node Detail Side Panel */}
        {selectedNode && (
          <div className="absolute right-0 top-0 bottom-0 w-80 bg-[#121619]/95 backdrop-blur-md border-l border-[#454F56] p-4 shadow-xl overflow-y-auto space-y-4 text-xs z-20">
            <div className="flex items-center justify-between pb-2 border-b border-[#242B30]">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#8A9399]">
                {selectedNode.type} Node Details
              </span>
              <button
                onClick={() => setSelectedNode(null)}
                className="text-[#8A9399] hover:text-[#F2F2F2]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {selectedNode.type === 'CASE' && (
              <div className="space-y-3">
                <div>
                  <div className="text-[10px] font-mono text-[#81A2A2] font-bold">
                    {selectedNode.data.case_number}
                  </div>
                  <h4 className="text-sm font-bold text-[#F2F2F2] mt-0.5">
                    {selectedNode.data.title}
                  </h4>
                </div>

                <div className="space-y-1.5 text-[11px] text-[#8A9399]">
                  <div><strong className="text-[#F2F2F2]">Crime Type:</strong> {selectedNode.data.crime_type}</div>
                  <div><strong className="text-[#F2F2F2]">Priority:</strong> {selectedNode.data.priority}</div>
                  <div><strong className="text-[#F2F2F2]">Status:</strong> {selectedNode.data.status}</div>
                  <div><strong className="text-[#F2F2F2]">Officer:</strong> {selectedNode.data.assigned_officer}</div>
                </div>

                <p className="text-[11px] text-[#8A9399] leading-relaxed bg-[#060606] p-2.5 rounded border border-[#242B30]">
                  {selectedNode.data.description}
                </p>

                <button
                  onClick={() => {
                    setSelectedCaseId(selectedNode.data.case_number);
                    setActiveView('case-detail', selectedNode.data.case_number);
                  }}
                  className="w-full py-2 bg-[#81A2A2] hover:bg-[#81A2A2]/90 text-[#060606] font-semibold rounded text-xs transition-colors flex items-center justify-center space-x-1.5"
                >
                  <span>Open Case Workspace</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {selectedNode.type === 'ENTITY' && (
              <div className="space-y-3">
                <div>
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#060606] text-[#81A2A2] border border-[#81A2A2]/40">
                    {selectedNode.data.entity.type}
                  </span>
                  <div className="font-mono text-xs font-bold text-[#F2F2F2] mt-1.5">
                    {selectedNode.data.entity.value}
                  </div>
                  <div className="text-[11px] font-mono text-[#5F686E]">
                    Normalized: {selectedNode.data.entity.normalized_value}
                  </div>
                </div>

                <div className="p-2.5 bg-[#060606] rounded border border-[#242B30] space-y-2">
                  <div className="text-[10px] font-mono uppercase text-[#8A9399]">
                    Linked Across {(selectedNode.data?.linkedCases || []).length} Investigation Case(s):
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {(selectedNode.data?.linkedCases || []).map((cNum: string) => (
                      <button
                        key={cNum}
                        onClick={() => {
                          setSelectedCaseId(cNum);
                          setActiveView('case-detail', cNum);
                        }}
                        className="px-2 py-0.5 rounded bg-[#121619] hover:bg-[#242B30] text-[#81A2A2] font-mono text-[11px] border border-[#454F56]/40"
                      >
                        {cNum}
                      </button>
                    ))}
                  </div>
                </div>

                {selectedNode.data.entity.source_context && (
                  <div className="space-y-1">
                    <div className="text-[10px] font-mono text-[#5F686E] uppercase">Provenance Snippet:</div>
                    <div className="text-[11px] font-mono text-[#8A9399] italic bg-[#060606] p-2 rounded border border-[#242B30]">
                      "{selectedNode.data.entity.source_context}"
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
