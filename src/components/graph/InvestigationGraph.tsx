import React, { useState, useMemo, useRef, useCallback } from 'react';
import { 
  GitBranch, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Search, 
  X,
  ExternalLink,
  ShieldCheck,
  Phone,
  CreditCard,
  Globe,
  Mail,
  Server,
  DollarSign,
  Maximize2,
  SlidersHorizontal,
  Info,
  Sparkles
} from 'lucide-react';
import { useTrace } from '../../context/TraceContext';
import { Case, Connection, Entity, EntityType } from '../../types';

interface Props {
  focusedCaseId?: string; // If provided, limits to subgraph of this case
}

interface GraphNode {
  id: string;
  label: string;
  subLabel?: string;
  type: 'CASE' | 'ENTITY';
  entityType?: EntityType;
  x: number;
  y: number;
  data: any;
}

interface GraphEdge {
  id: string;
  source: string;
  target: string;
  isHighConfidence?: boolean;
  label?: string;
}

export const InvestigationGraph: React.FC<Props> = ({ focusedCaseId }) => {
  const { cases, entities, connections, setActiveView, setSelectedCaseId, setSelectedConnectionId } = useTrace();

  // Viewport transforms (in SVG coordinate space 1100x750)
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>('ALL');
  const [sharedOnly, setSharedOnly] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false);

  const svgRef = useRef<SVGSVGElement | null>(null);

  // Direct navigation to case inspection / provenance workspace
  const handleOpenCase = useCallback((caseNumber: string) => {
    setSelectedCaseId(caseNumber);
    setActiveView('case-detail', caseNumber);
  }, [setSelectedCaseId, setActiveView]);

  // Helper color map for entity types
  const getEntityColor = (type?: EntityType) => {
    switch (type) {
      case 'PHONE':
        return '#81A2A2'; // Teal / Cyan
      case 'UPI':
        return '#B7FF3C'; // Electric Lime
      case 'WEBSITE':
      case 'URL':
        return '#F5C451'; // Amber Yellow
      case 'EMAIL':
        return '#A78BFA'; // Purple
      case 'IP_ADDRESS':
        return '#60A5FA'; // Light Blue
      case 'TRANSACTION':
      case 'ACCOUNT':
        return '#F472B6'; // Pink
      default:
        return '#8A9399'; // Neutral Silver
    }
  };

  // Compute Nodes and Edges with high-clarity deterministic radial layout
  const { nodes, edges, connectedNodeMap } = useMemo(() => {
    const calculatedNodes: GraphNode[] = [];
    const calculatedEdges: GraphEdge[] = [];
    const nodeMap = new Set<string>();
    const connectionsMap = new Map<string, Set<string>>();

    const addConnection = (a: string, b: string) => {
      if (!connectionsMap.has(a)) connectionsMap.set(a, new Set());
      if (!connectionsMap.has(b)) connectionsMap.set(b, new Set());
      connectionsMap.get(a)!.add(b);
      connectionsMap.get(b)!.add(a);
    };

    // Determine relevant cases
    const relevantCases = focusedCaseId
      ? cases.filter(c => {
          if (c.case_number === focusedCaseId) return true;
          return connections.some(
            conn => (conn.case_a === focusedCaseId && conn.case_b === c.case_number) ||
                    (conn.case_b === focusedCaseId && conn.case_a === c.case_number)
          );
        })
      : cases.slice(0, 8); // Top 8 cases for clean global view

    const relevantCaseNumbers = new Set(relevantCases.map(c => c.case_number));

    // Layout center in 1100 x 750 SVG canvas space
    const centerX = 550;
    const centerY = 375;
    const caseRadius = focusedCaseId ? 260 : 230;

    // 1. Position Case Nodes
    relevantCases.forEach((c, idx) => {
      let x = centerX;
      let y = centerY;

      if (focusedCaseId) {
        if (c.case_number === focusedCaseId) {
          x = centerX;
          y = centerY;
        } else {
          const nonFocusedIdx = idx > relevantCases.findIndex(rc => rc.case_number === focusedCaseId) ? idx - 1 : idx;
          const totalOther = Math.max(1, relevantCases.length - 1);
          const angle = (nonFocusedIdx / totalOther) * 2 * Math.PI - Math.PI / 2;
          x = centerX + caseRadius * Math.cos(angle);
          y = centerY + caseRadius * Math.sin(angle);
        }
      } else {
        const total = Math.max(1, relevantCases.length);
        const angle = (idx / total) * 2 * Math.PI - Math.PI / 2;
        x = centerX + caseRadius * Math.cos(angle);
        y = centerY + caseRadius * Math.sin(angle);
      }

      const caseNodeId = `node-case-${c.case_number}`;
      const node: GraphNode = {
        id: caseNodeId,
        label: c.case_number,
        subLabel: c.crime_type,
        type: 'CASE',
        x,
        y,
        data: c,
      };
      calculatedNodes.push(node);
      nodeMap.add(caseNodeId);
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

    // Separate shared entities vs unique entities
    const sharedEntities: { key: string; list: Entity[]; sourceCases: string[] }[] = [];
    const uniqueEntitiesByCase = new Map<string, { key: string; list: Entity[] }[]>();

    entityGroups.forEach((list, key) => {
      const sourceCases = Array.from(new Set(list.map(e => e.source_case_id)));
      if (sourceCases.length > 1) {
        sharedEntities.push({ key, list, sourceCases });
      } else {
        if (sharedOnly) return; // Skip unique if shared-only filter is active
        const cNum = sourceCases[0];
        if (!uniqueEntitiesByCase.has(cNum)) uniqueEntitiesByCase.set(cNum, []);
        uniqueEntitiesByCase.get(cNum)!.push({ key, list });
      }
    });

    // 3. Position Shared Entities in the central ring or between connected cases
    const totalShared = sharedEntities.length;
    sharedEntities.forEach((item, sIdx) => {
      const repEntity = item.list[0];
      const entityNodeId = `node-ent-${repEntity.id}`;

      // Calculate centroid of connected cases
      let sumX = 0;
      let sumY = 0;
      let count = 0;

      item.sourceCases.forEach(cNum => {
        const cNode = calculatedNodes.find(n => n.id === `node-case-${cNum}`);
        if (cNode) {
          sumX += cNode.x;
          sumY += cNode.y;
          count++;
        }
      });

      let x = centerX;
      let y = centerY;

      if (count >= 2) {
        // Position at centroid with slight offset based on index to prevent stacking
        const rawCentroidX = sumX / count;
        const rawCentroidY = sumY / count;
        const angle = (sIdx / Math.max(1, totalShared)) * 2 * Math.PI;
        const radialPull = 0.55; // 55% between center and centroid
        x = centerX + (rawCentroidX - centerX) * radialPull + 24 * Math.cos(angle);
        y = centerY + (rawCentroidY - centerY) * radialPull + 24 * Math.sin(angle);
      } else {
        const angle = (sIdx / Math.max(1, totalShared)) * 2 * Math.PI;
        x = centerX + 110 * Math.cos(angle);
        y = centerY + 110 * Math.sin(angle);
      }

      const entNode: GraphNode = {
        id: entityNodeId,
        label: repEntity.normalized_value,
        subLabel: repEntity.type,
        type: 'ENTITY',
        entityType: repEntity.type,
        x,
        y,
        data: {
          entity: repEntity,
          allOccurrences: item.list,
          isShared: true,
          linkedCases: item.sourceCases,
        },
      };

      calculatedNodes.push(entNode);
      nodeMap.add(entityNodeId);

      // Connect to all source cases
      item.sourceCases.forEach(cNum => {
        const caseNodeId = `node-case-${cNum}`;
        if (nodeMap.has(caseNodeId)) {
          calculatedEdges.push({
            id: `edge-${cNum}-${entityNodeId}`,
            source: caseNodeId,
            target: entityNodeId,
            isHighConfidence: true,
          });
          addConnection(caseNodeId, entityNodeId);
        }
      });
    });

    // 4. Position Unique Entities fanned radially outward from each case
    uniqueEntitiesByCase.forEach((entItemList, cNum) => {
      const parentCaseNode = calculatedNodes.find(n => n.id === `node-case-${cNum}`);
      if (!parentCaseNode) return;

      // Direction angle from canvas center to this case
      const baseAngle = Math.atan2(parentCaseNode.y - centerY, parentCaseNode.x - centerX);
      const totalForThisCase = Math.min(entItemList.length, 6); // Max 6 unique per case for visual clarity
      const spreadArc = Math.PI * 0.7; // 126 degree fan outward
      const orbitDistance = 88;

      entItemList.slice(0, totalForThisCase).forEach((item, uIdx) => {
        const repEntity = item.list[0];
        const entityNodeId = `node-ent-${repEntity.id}`;

        const angleOffset = totalForThisCase === 1 
          ? 0 
          : -spreadArc / 2 + (uIdx / (totalForThisCase - 1)) * spreadArc;
        
        const finalAngle = baseAngle + angleOffset;
        const x = parentCaseNode.x + orbitDistance * Math.cos(finalAngle);
        const y = parentCaseNode.y + orbitDistance * Math.sin(finalAngle);

        const entNode: GraphNode = {
          id: entityNodeId,
          label: repEntity.normalized_value,
          subLabel: repEntity.type,
          type: 'ENTITY',
          entityType: repEntity.type,
          x,
          y,
          data: {
            entity: repEntity,
            allOccurrences: item.list,
            isShared: false,
            linkedCases: [cNum],
          },
        };

        calculatedNodes.push(entNode);
        nodeMap.add(entityNodeId);

        const caseNodeId = `node-case-${cNum}`;
        calculatedEdges.push({
          id: `edge-${cNum}-${entityNodeId}`,
          source: caseNodeId,
          target: entityNodeId,
          isHighConfidence: false,
        });
        addConnection(caseNodeId, entityNodeId);
      });
    });

    return { 
      nodes: calculatedNodes, 
      edges: calculatedEdges, 
      connectedNodeMap: connectionsMap 
    };
  }, [cases, entities, connections, focusedCaseId, filterType, sharedOnly]);

  // Determine active highlight state
  const activeFocusId = hoveredNodeId || selectedNode?.id;
  const connectedToActive = useMemo(() => {
    if (!activeFocusId) return null;
    const set = new Set<string>([activeFocusId]);
    const neighbors = connectedNodeMap.get(activeFocusId);
    if (neighbors) {
      neighbors.forEach(nId => set.add(nId));
    }
    return set;
  }, [activeFocusId, connectedNodeMap]);

  // Search matching node
  const searchedNodeIds = useMemo(() => {
    if (!searchTerm.trim()) return null;
    const term = searchTerm.toLowerCase();
    const set = new Set<string>();
    nodes.forEach(n => {
      if (
        n.label.toLowerCase().includes(term) ||
        (n.subLabel && n.subLabel.toLowerCase().includes(term))
      ) {
        set.add(n.id);
      }
    });
    return set;
  }, [searchTerm, nodes]);

  // Pan / Drag handlers with Mouse and Touch support
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    }
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({ x: e.touches[0].clientX - pan.x, y: e.touches[0].clientY - pan.y });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging && e.touches.length === 1) {
      setPan({ x: e.touches[0].clientX - dragStart.x, y: e.touches[0].clientY - dragStart.y });
    }
  };

  const handleTouchEnd = () => setIsDragging(false);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
    setZoom(z => Math.max(0.4, Math.min(2.5, z * zoomFactor)));
  };

  const resetView = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setSelectedNode(null);
    setHoveredNodeId(null);
  }, []);

  return (
    <div className="space-y-3">
      {/* Controls & Filter Bar */}
      <div className="p-3 bg-[#121619] rounded-lg border border-[#242B30] flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left: Title, Badges & Search */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center space-x-2">
            <GitBranch className="w-4 h-4 text-[#81A2A2]" />
            <span className="text-xs font-bold text-[#F2F2F2]">
              {focusedCaseId ? `Link Subgraph: ${focusedCaseId}` : 'Cross-Case Investigation Graph'}
            </span>
          </div>

          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#060606] text-[#81A2A2] border border-[#242B30]">
            {nodes.length} nodes • {edges.length} links
          </span>

          {/* Quick Search with Submit & Result Dropdown */}
          <div className="relative">
            <div className="flex items-center space-x-1">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-[#5F686E] absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  id="find-node-input"
                  data-testid="find-node-input"
                  type="text"
                  placeholder="Find case (e.g. CASE-001) / indicator..."
                  value={searchTerm}
                  onFocus={() => setIsSearchDropdownOpen(true)}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setIsSearchDropdownOpen(true);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const term = searchTerm.trim().toLowerCase();
                      if (!term) return;
                      // Find best case match
                      const matchedCase = cases.find(
                        c => c.case_number.toLowerCase() === term ||
                             c.case_number.toLowerCase().includes(term) ||
                             c.title.toLowerCase().includes(term)
                      );
                      if (matchedCase) {
                        handleOpenCase(matchedCase.case_number);
                        setIsSearchDropdownOpen(false);
                        return;
                      }
                      // Find entity or case node
                      const matchedNode = nodes.find(
                        n => n.label.toLowerCase().includes(term) ||
                             (n.subLabel && n.subLabel.toLowerCase().includes(term))
                      );
                      if (matchedNode) {
                        if (matchedNode.type === 'CASE') {
                          handleOpenCase((matchedNode.data as Case).case_number);
                        } else {
                          const linked = matchedNode.data?.linkedCases;
                          if (linked && linked.length > 0) {
                            handleOpenCase(linked[0]);
                          } else {
                            setSelectedNode(matchedNode);
                          }
                        }
                        setIsSearchDropdownOpen(false);
                      }
                    }
                  }}
                  className="bg-[#060606] border border-[#242B30] focus:border-[#81A2A2] rounded pl-8 pr-7 py-1 text-xs text-[#F2F2F2] outline-none font-mono w-48 sm:w-56"
                />
                {searchTerm && (
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setIsSearchDropdownOpen(false);
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-[#5F686E] hover:text-[#F2F2F2]"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              <button
                id="find-node-btn"
                data-testid="find-node-btn"
                onClick={() => {
                  const term = searchTerm.trim().toLowerCase();
                  if (!term) return;
                  const matchedCase = cases.find(
                    c => c.case_number.toLowerCase() === term ||
                         c.case_number.toLowerCase().includes(term) ||
                         c.title.toLowerCase().includes(term)
                  );
                  if (matchedCase) {
                    handleOpenCase(matchedCase.case_number);
                    setIsSearchDropdownOpen(false);
                  } else {
                    const matchedNode = nodes.find(
                      n => n.label.toLowerCase().includes(term) ||
                           (n.subLabel && n.subLabel.toLowerCase().includes(term))
                    );
                    if (matchedNode) {
                      if (matchedNode.type === 'CASE') {
                        handleOpenCase((matchedNode.data as Case).case_number);
                      } else {
                        const linked = matchedNode.data?.linkedCases;
                        if (linked && linked.length > 0) {
                          handleOpenCase(linked[0]);
                        } else {
                          setSelectedNode(matchedNode);
                        }
                      }
                      setIsSearchDropdownOpen(false);
                    }
                  }
                }}
                className="px-2.5 py-1 bg-[#81A2A2] hover:bg-[#81A2A2]/90 text-[#060606] font-bold text-xs rounded transition-colors"
              >
                Find
              </button>
            </div>

            {/* Live Search Results Dropdown */}
            {isSearchDropdownOpen && searchTerm.trim().length > 0 && (
              <div className="absolute left-0 top-full mt-1.5 w-72 sm:w-80 bg-[#121619] border border-[#454F56] rounded-lg shadow-2xl p-2 z-50 max-h-64 overflow-y-auto space-y-1">
                <div className="text-[10px] font-mono uppercase text-[#8A9399] px-2 py-1 flex items-center justify-between">
                  <span>Search Matches</span>
                  <button
                    onClick={() => setIsSearchDropdownOpen(false)}
                    className="text-[#5F686E] hover:text-[#F2F2F2]"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>

                {/* Matched Cases */}
                {cases
                  .filter(
                    c =>
                      c.case_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      c.title.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map(c => (
                    <button
                      key={c.id}
                      id={`search-result-${c.case_number}`}
                      data-testid={`search-result-${c.case_number}`}
                      onClick={() => {
                        handleOpenCase(c.case_number);
                        setIsSearchDropdownOpen(false);
                      }}
                      className="w-full text-left p-2 rounded bg-[#060606] hover:bg-[#242B30] border border-[#242B30] hover:border-[#81A2A2] transition-colors flex items-center justify-between group"
                    >
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <span className="font-mono text-xs font-bold text-[#81A2A2]">{c.case_number}</span>
                          <span className="text-[10px] font-mono text-[#5F686E]">• {c.crime_type}</span>
                        </div>
                        <div className="text-[11px] text-[#F2F2F2] truncate max-w-[200px] mt-0.5">{c.title}</div>
                      </div>
                      <span className="text-[10px] font-mono text-[#81A2A2] group-hover:underline shrink-0">Open Case →</span>
                    </button>
                  ))}

                {/* Matched Entities */}
                {entities
                  .filter(
                    e =>
                      e.value.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      e.normalized_value.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .slice(0, 4)
                  .map(e => (
                    <button
                      key={e.id}
                      id={`search-result-ent-${e.id}`}
                      onClick={() => {
                        handleOpenCase(e.source_case_id);
                        setIsSearchDropdownOpen(false);
                      }}
                      className="w-full text-left p-2 rounded bg-[#060606] hover:bg-[#242B30] border border-[#242B30] transition-colors flex items-center justify-between"
                    >
                      <div>
                        <span className="text-[10px] font-mono text-[#F5C451]">{e.type}: </span>
                        <span className="text-[11px] font-mono text-[#F2F2F2]">{e.value}</span>
                      </div>
                      <span className="text-[10px] font-mono text-[#81A2A2]">View in {e.source_case_id} →</span>
                    </button>
                  ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Filters & Zoom Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Shared Only Toggle */}
          <button
            onClick={() => setSharedOnly(prev => !prev)}
            className={`px-2.5 py-1 rounded text-xs font-mono transition-colors border ${
              sharedOnly
                ? 'bg-[#F5C451]/20 text-[#F5C451] border-[#F5C451]/40'
                : 'bg-[#060606] text-[#8A9399] border-[#242B30] hover:text-[#F2F2F2]'
            }`}
          >
            {sharedOnly ? '★ Shared Leads Only' : 'All Indicators'}
          </button>

          {/* Filter by Entity Type */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-[#060606] border border-[#242B30] focus:border-[#81A2A2] rounded px-2.5 py-1 text-xs text-[#F2F2F2] outline-none font-mono"
          >
            <option value="ALL">All Types</option>
            <option value="PHONE">Phone (PHONE)</option>
            <option value="UPI">UPI (UPI)</option>
            <option value="WEBSITE">Domain (WEBSITE)</option>
            <option value="EMAIL">Email (EMAIL)</option>
            <option value="IP_ADDRESS">IP (IP_ADDRESS)</option>
            <option value="TRANSACTION">Bank/Tx (TRANSACTION)</option>
          </select>

          {/* Zoom & Fit Actions */}
          <div className="flex items-center space-x-1 pl-1 border-l border-[#242B30]">
            <button
              onClick={() => setZoom(z => Math.min(2.5, z + 0.2))}
              className="p-1 rounded bg-[#060606] hover:bg-[#242B30] text-[#8A9399] hover:text-[#F2F2F2] border border-[#242B30] transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoom(z => Math.max(0.4, z - 0.2))}
              className="p-1 rounded bg-[#060606] hover:bg-[#242B30] text-[#8A9399] hover:text-[#F2F2F2] border border-[#242B30] transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={resetView}
              className="px-2 py-1 rounded bg-[#060606] hover:bg-[#242B30] text-[#8A9399] hover:text-[#F2F2F2] border border-[#242B30] text-[11px] font-mono flex items-center space-x-1 transition-colors"
              title="Reset Zoom & Pan"
            >
              <RotateCcw className="w-3 h-3" />
              <span className="hidden sm:inline">Fit</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Canvas & Inspection Drawer */}
      <div 
        className="relative h-[480px] sm:h-[620px] bg-[#060606] border border-[#242B30] rounded-lg overflow-hidden flex select-none"
        onWheel={handleWheel}
      >
        {/* SVG Network Graph with ViewBox and Auto-Centering */}
        <svg
          ref={svgRef}
          viewBox="0 0 1100 750"
          preserveAspectRatio="xMidYMid meet"
          className="w-full h-full cursor-grab active:cursor-grabbing"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* SVG Definitions & Gradients */}
          <defs>
            <pattern id="graph-grid" width="36" height="36" patternUnits="userSpaceOnUse">
              <path d="M 36 0 L 0 0 0 36" fill="none" stroke="#121619" strokeWidth="1" />
            </pattern>
            {/* Glow Filter for Verified / Shared Links */}
            <filter id="glow-verified" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="glow-highlight" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Grid Background */}
          <rect width="100%" height="100%" fill="url(#graph-grid)" />

          {/* Center Nexus Decorative Rings */}
          <circle cx="550" cy="375" r="110" fill="none" stroke="#242B30" strokeWidth="1" strokeDasharray="3 3" opacity="0.4" />
          <circle cx="550" cy="375" r="230" fill="none" stroke="#242B30" strokeWidth="1" strokeDasharray="4 4" opacity="0.3" />

          {/* Graph Content Group with Pan and Zoom */}
          <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`} style={{ transformOrigin: '550px 375px' }}>
            {/* Edges Rendering */}
            {edges.map((edge) => {
              const sourceNode = nodes.find(n => n.id === edge.source);
              const targetNode = nodes.find(n => n.id === edge.target);
              if (!sourceNode || !targetNode) return null;

              const isEdgeActive = connectedToActive 
                ? connectedToActive.has(edge.source) && connectedToActive.has(edge.target)
                : true;

              const isSearched = searchedNodeIds
                ? searchedNodeIds.has(edge.source) || searchedNodeIds.has(edge.target)
                : false;

              let strokeColor = '#242B30';
              let strokeWidth = 1.2;
              let strokeDasharray = '3 3';
              let opacity = 0.5;

              if (edge.isHighConfidence) {
                strokeColor = '#F5C451';
                strokeWidth = 1.8;
                strokeDasharray = 'none';
                opacity = 0.85;
              }

              if (isEdgeActive && activeFocusId) {
                strokeColor = '#81A2A2';
                strokeWidth = 2.5;
                strokeDasharray = 'none';
                opacity = 1;
              } else if (connectedToActive && !isEdgeActive) {
                opacity = 0.12;
              }

              if (isSearched) {
                strokeColor = '#B7FF3C';
                strokeWidth = 2.2;
                opacity = 1;
              }

              return (
                <line
                  key={edge.id}
                  x1={sourceNode.x}
                  y1={sourceNode.y}
                  x2={targetNode.x}
                  y2={targetNode.y}
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  strokeDasharray={strokeDasharray}
                  opacity={opacity}
                  filter={isEdgeActive && activeFocusId ? 'url(#glow-highlight)' : undefined}
                  className="transition-opacity duration-200"
                />
              );
            })}

            {/* Nodes Rendering */}
            {nodes.map((node) => {
              const isSelected = selectedNode?.id === node.id;
              const isHovered = hoveredNodeId === node.id;
              const isConnected = connectedToActive ? connectedToActive.has(node.id) : true;
              const isSearched = searchedNodeIds ? searchedNodeIds.has(node.id) : false;

              const opacity = connectedToActive && !isConnected ? 0.2 : 1;

              // CASE NODE
              if (node.type === 'CASE') {
                const c = node.data as Case;
                const isCurrent = c.case_number === focusedCaseId;

                return (
                  <g
                    key={node.id}
                    id={`node-case-${c.case_number}`}
                    data-testid={`case-node-${c.case_number}`}
                    data-case-id={c.case_number}
                    data-case-number={c.case_number}
                    role="button"
                    tabIndex={0}
                    aria-label={`Open case ${c.case_number}: ${c.title}`}
                    transform={`translate(${node.x}, ${node.y})`}
                    onMouseDown={(e) => {
                      e.stopPropagation();
                    }}
                    onTouchStart={(e) => {
                      e.stopPropagation();
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenCase(c.case_number);
                    }}
                    onDoubleClick={(e) => {
                      e.stopPropagation();
                      handleOpenCase(c.case_number);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleOpenCase(c.case_number);
                      }
                    }}
                    onMouseEnter={() => setHoveredNodeId(node.id)}
                    onMouseLeave={() => setHoveredNodeId(null)}
                    className="cursor-pointer group outline-none focus:ring-2 focus:ring-[#81A2A2]"
                    opacity={opacity}
                  >
                    {/* Case Node Card Rect */}
                    <rect
                      id={`rect-case-${c.case_number}`}
                      data-testid={`rect-case-${c.case_number}`}
                      x="-64"
                      y="-26"
                      width="128"
                      height="52"
                      rx="8"
                      fill="#121619"
                      stroke={
                        isSearched ? '#B7FF3C' :
                        isSelected ? '#81A2A2' : 
                        isHovered ? '#81A2A2' : 
                        isCurrent ? '#B7FF3C' : '#454F56'
                      }
                      strokeWidth={isSelected || isHovered || isCurrent || isSearched ? 2.5 : 1.2}
                      filter={isSelected || isHovered || isSearched ? 'url(#glow-highlight)' : undefined}
                      className="transition-all duration-150 cursor-pointer pointer-events-auto"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenCase(c.case_number);
                      }}
                    />

                    {/* Priority Accent Dot */}
                    <circle
                      cx="-48"
                      cy="-12"
                      r="4"
                      fill={
                        c.priority === 'CRITICAL' ? '#FF4D4D' :
                        c.priority === 'HIGH' ? '#F5C451' : '#81A2A2'
                      }
                      className="cursor-pointer pointer-events-auto"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenCase(c.case_number);
                      }}
                    />

                    {/* Case Number */}
                    <text
                      id={`text-case-num-${c.case_number}`}
                      data-testid={`text-case-${c.case_number}`}
                      x="0"
                      y="-7"
                      textAnchor="middle"
                      fill="#F2F2F2"
                      fontSize="12"
                      fontFamily="JetBrains Mono, monospace"
                      fontWeight="bold"
                      className="cursor-pointer pointer-events-auto select-none"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenCase(c.case_number);
                      }}
                    >
                      {c.case_number}
                    </text>

                    {/* Crime Type Subtitle */}
                    <text
                      x="0"
                      y="12"
                      textAnchor="middle"
                      fill="#8A9399"
                      fontSize="9.5"
                      fontFamily="sans-serif"
                      className="cursor-pointer pointer-events-auto select-none"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenCase(c.case_number);
                      }}
                    >
                      {c.crime_type.length > 15 ? c.crime_type.slice(0, 13) + '..' : c.crime_type}
                    </text>
                  </g>
                );
              }

              // ENTITY NODE
              const entData = node.data;
              const isShared = entData.isShared;
              const typeColor = getEntityColor(node.entityType);

              return (
                <g
                  key={node.id}
                  id={`node-ent-${node.id}`}
                  data-testid={`entity-node-${node.id}`}
                  role="button"
                  tabIndex={0}
                  aria-label={`Inspect entity ${node.label}`}
                  transform={`translate(${node.x}, ${node.y})`}
                  onMouseDown={(e) => e.stopPropagation()}
                  onTouchStart={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedNode(node);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelectedNode(node);
                    }
                  }}
                  onMouseEnter={() => setHoveredNodeId(node.id)}
                  onMouseLeave={() => setHoveredNodeId(null)}
                  className="cursor-pointer group outline-none"
                  opacity={opacity}
                >
                  {/* Entity Circle Icon Badge */}
                  <circle
                    r={isShared ? 15 : 10}
                    fill="#060606"
                    stroke={
                      isSearched ? '#B7FF3C' :
                      isSelected ? '#81A2A2' :
                      isHovered ? '#81A2A2' :
                      isShared ? '#F5C451' : typeColor
                    }
                    strokeWidth={isSelected || isHovered || isShared || isSearched ? 2.5 : 1.5}
                    filter={isShared || isSelected || isHovered ? 'url(#glow-highlight)' : undefined}
                    className="transition-all duration-150"
                  />

                  {/* Shared Indicator Link Count Badge */}
                  {isShared && (
                    <text
                      x="0"
                      y="4"
                      textAnchor="middle"
                      fill="#F5C451"
                      fontSize="10"
                      fontFamily="JetBrains Mono, monospace"
                      fontWeight="bold"
                    >
                      {entData.linkedCases.length}
                    </text>
                  )}

                  {!isShared && (
                    <circle
                      r="3.5"
                      fill={typeColor}
                    />
                  )}

                  {/* Entity Label with Dark Halo */}
                  <g transform={`translate(0, ${isShared ? 28 : 20})`}>
                    <text
                      x="0"
                      y="0"
                      textAnchor="middle"
                      fill={isShared ? '#F2F2F2' : '#8A9399'}
                      fontSize="9"
                      fontFamily="JetBrains Mono, monospace"
                      fontWeight={isShared ? 'bold' : 'normal'}
                      stroke="#060606"
                      strokeWidth="3"
                      paintOrder="stroke"
                    >
                      {node.label.length > 20 ? node.label.slice(0, 18) + '..' : node.label}
                    </text>
                  </g>
                </g>
              );
            })}
          </g>
        </svg>

        {/* Bottom Graph Legend Overlay */}
        <div className="absolute bottom-3 left-3 right-3 sm:right-auto bg-[#121619]/90 backdrop-blur-sm border border-[#242B30] rounded-lg p-2 px-3 text-[11px] font-mono flex flex-wrap items-center gap-3 text-[#8A9399] z-10">
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded bg-[#121619] border border-[#81A2A2]" />
            <span className="text-[#F2F2F2]">Case Node</span>
          </div>

          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded-full bg-[#060606] border-2 border-[#F5C451] flex items-center justify-center text-[8px] text-[#F5C451] font-bold">2</span>
            <span className="text-[#F5C451]">Shared Indicator</span>
          </div>

          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#81A2A2]" />
            <span>Phone</span>
          </div>

          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#B7FF3C]" />
            <span>UPI</span>
          </div>

          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F5C451]" />
            <span>Domain</span>
          </div>

          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#A78BFA]" />
            <span>Email</span>
          </div>

          <div className="hidden md:flex items-center space-x-1.5 text-[#5F686E] pl-2 border-l border-[#242B30]">
            <span>Click any node to inspect provenance</span>
          </div>
        </div>

        {/* Node Detail Side Panel */}
        {selectedNode && (
          <div className="absolute right-0 top-0 bottom-0 w-full sm:w-84 bg-[#121619]/98 sm:bg-[#121619]/95 backdrop-blur-md border-l border-[#454F56] p-4 shadow-2xl overflow-y-auto space-y-4 text-xs z-20 animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-[#242B30]">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#8A9399] flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#81A2A2]" />
                <span>{selectedNode.type} Node Details</span>
              </span>
              <button
                onClick={() => setSelectedNode(null)}
                className="text-[#8A9399] hover:text-[#F2F2F2] p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {selectedNode.type === 'CASE' && (
              <div className="space-y-3.5">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-[#81A2A2] font-bold bg-[#060606] px-2 py-0.5 rounded border border-[#242B30]">
                      {selectedNode.data.case_number}
                    </span>
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                      selectedNode.data.priority === 'CRITICAL' ? 'bg-[#FF4D4D]/10 text-[#FF4D4D] border border-[#FF4D4D]/30' :
                      selectedNode.data.priority === 'HIGH' ? 'bg-[#F5C451]/10 text-[#F5C451] border border-[#F5C451]/30' :
                      'bg-[#242B30] text-[#8A9399]'
                    }`}>
                      {selectedNode.data.priority}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-[#F2F2F2] mt-2">
                    {selectedNode.data.title}
                  </h4>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] bg-[#060606] p-2.5 rounded border border-[#242B30]">
                  <div>
                    <span className="text-[#5F686E] text-[10px] block">Crime Type:</span>
                    <span className="text-[#F2F2F2] font-medium">{selectedNode.data.crime_type}</span>
                  </div>
                  <div>
                    <span className="text-[#5F686E] text-[10px] block">Status:</span>
                    <span className="text-[#81A2A2] font-mono">{selectedNode.data.status}</span>
                  </div>
                  <div>
                    <span className="text-[#5F686E] text-[10px] block">Officer:</span>
                    <span className="text-[#F2F2F2]">{selectedNode.data.assigned_officer || 'Unassigned'}</span>
                  </div>
                  <div>
                    <span className="text-[#5F686E] text-[10px] block">Jurisdiction:</span>
                    <span className="text-[#F2F2F2]">{selectedNode.data.jurisdiction || 'Metro'}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-[#5F686E] uppercase">Synopsis:</span>
                  <p className="text-[11px] text-[#8A9399] leading-relaxed bg-[#060606] p-2.5 rounded border border-[#242B30]">
                    {selectedNode.data.description}
                  </p>
                </div>

                <button
                  id={`open-full-case-btn-${selectedNode.data.case_number}`}
                  data-testid={`open-full-case-btn-${selectedNode.data.case_number}`}
                  onClick={() => handleOpenCase(selectedNode.data.case_number)}
                  className="w-full py-2 bg-[#81A2A2] hover:bg-[#81A2A2]/90 text-[#060606] font-semibold rounded text-xs transition-colors flex items-center justify-center space-x-1.5 shadow-sm cursor-pointer"
                >
                  <span>Open Full Case Workspace</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {selectedNode.type === 'ENTITY' && (
              <div className="space-y-3.5">
                <div>
                  <span 
                    className="text-[10px] font-mono font-bold px-2 py-0.5 rounded border"
                    style={{
                      backgroundColor: `${getEntityColor(selectedNode.entityType)}15`,
                      color: getEntityColor(selectedNode.entityType),
                      borderColor: `${getEntityColor(selectedNode.entityType)}40`,
                    }}
                  >
                    {selectedNode.data.entity.type}
                  </span>

                  <div className="font-mono text-sm font-bold text-[#F2F2F2] mt-2 break-all">
                    {selectedNode.data.entity.value}
                  </div>
                  <div className="text-[11px] font-mono text-[#5F686E] mt-0.5">
                    Normalized: {selectedNode.data.entity.normalized_value}
                  </div>
                </div>

                {/* Linked Cases List */}
                <div className="p-3 bg-[#060606] rounded border border-[#242B30] space-y-2">
                  <div className="text-[10px] font-mono uppercase text-[#8A9399] flex items-center justify-between">
                    <span>Cross-Linked In {(selectedNode.data?.linkedCases || []).length} Investigation(s):</span>
                    {selectedNode.data?.isShared && (
                      <span className="px-1.5 py-0.2 bg-[#F5C451]/20 text-[#F5C451] text-[9px] rounded font-bold">
                        MATCH FOUND
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {(selectedNode.data?.linkedCases || []).map((cNum: string) => (
                      <button
                        key={cNum}
                        id={`open-linked-case-${cNum}`}
                        data-testid={`open-linked-case-${cNum}`}
                        onClick={() => handleOpenCase(cNum)}
                        className="px-2.5 py-1 rounded bg-[#121619] hover:bg-[#242B30] text-[#81A2A2] font-mono text-xs border border-[#454F56]/40 hover:border-[#81A2A2] transition-colors cursor-pointer"
                      >
                        {cNum} →
                      </button>
                    ))}
                  </div>
                </div>

                {/* Provenance Snippet */}
                {selectedNode.data.entity.source_context && (
                  <div className="space-y-1.5">
                    <div className="text-[10px] font-mono text-[#5F686E] uppercase">Source Provenance Extract:</div>
                    <div className="text-[11px] font-mono text-[#8A9399] leading-relaxed bg-[#060606] p-2.5 rounded border border-[#242B30]">
                      "{selectedNode.data.entity.source_context}"
                    </div>
                  </div>
                )}

                {/* Extracted Evidence Metadata */}
                <div className="text-[10px] font-mono text-[#5F686E] space-y-1 pt-1">
                  <div>Source Evidence: <span className="text-[#F2F2F2]">{selectedNode.data.entity.source_evidence_name || 'Direct Ingest'}</span></div>
                  <div>Extracted At: <span className="text-[#F2F2F2]">{selectedNode.data.entity.extracted_at?.substring(0, 19).replace('T', ' ') || 'Real-time'}</span></div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
