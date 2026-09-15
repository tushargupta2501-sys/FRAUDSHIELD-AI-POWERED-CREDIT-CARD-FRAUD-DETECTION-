import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Html } from '@react-three/drei';
import * as THREE from 'three';
import { Shield, AlertTriangle, CheckCircle, User, CreditCard, ShoppingBag, Eye, RefreshCw } from 'lucide-react';

// Check WebGL availability
function isWebGLAvailable() {
  try {
    const canvas = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
  } catch (e) {
    return false;
  }
}

// Node Mesh Component
function NetworkNode({ node, onSelect, isHovered, onHover }) {
  const meshRef = useRef();

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.5;
    }
  });

  const getColor = () => {
    if (node.type === 'customer') return '#3B82F6'; // Blue
    if (node.type === 'merchant') return '#A855F7'; // Purple
    if (node.decision === 'BLOCK') return '#EF4444'; // Red
    if (node.decision === 'CHALLENGE') return '#F59E0B'; // Amber
    return '#10B981'; // Green
  };

  const getGeometry = () => {
    if (node.type === 'customer') return <sphereGeometry args={[node.size, 16, 16]} />;
    if (node.type === 'merchant') return <boxGeometry args={[node.size * 1.5, node.size * 1.5, node.size * 1.5]} />;
    return <octahedronGeometry args={[node.size]} />;
  };

  return (
    <group position={node.position}>
      <mesh
        ref={meshRef}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(node);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          onHover(node);
        }}
        onPointerOut={() => onHover(null)}
      >
        {getGeometry()}
        <meshStandardMaterial
          color={getColor()}
          emissive={getColor()}
          emissiveIntensity={isHovered ? 0.8 : 0.3}
          roughness={0.2}
          metalness={0.8}
          wireframe={node.type === 'merchant'}
        />
      </mesh>

      {/* Node Label */}
      <Text
        position={[0, node.size + 0.3, 0]}
        fontSize={0.25}
        color="#F1F5F9"
        anchorX="center"
        anchorY="middle"
      >
        {node.label}
      </Text>

      {/* HTML Hover Tooltip */}
      {isHovered && (
        <Html distanceFactor={12} position={[0, node.size + 0.8, 0]}>
          <div className="glass-panel p-3 rounded-lg border border-indigo-500/40 text-xs shadow-2xl min-w-[180px] pointer-events-none z-50">
            <div className="font-semibold text-slate-100 flex items-center justify-between mb-1">
              <span>{node.label}</span>
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                node.decision === 'BLOCK' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                node.decision === 'CHALLENGE' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              }`}>
                {node.decision || node.type.toUpperCase()}
              </span>
            </div>
            {node.amount && (
              <div className="text-slate-300">Amount: <span className="font-mono text-white">${node.amount}</span></div>
            )}
            {node.risk_score !== undefined && (
              <div className="text-slate-300">Risk Score: <span className="font-mono font-bold text-amber-400">{node.risk_score}</span></div>
            )}
            {node.merchant && (
              <div className="text-slate-400 truncate">Merchant: {node.merchant}</div>
            )}
          </div>
        </Html>
      )}
    </group>
  );
}

// Connecting Lines Component
function Connections({ links, nodes }) {
  const lineGeometry = useMemo(() => {
    const points = [];
    links.forEach((link) => {
      const sourceNode = nodes.find((n) => n.id === link.source);
      const targetNode = nodes.find((n) => n.id === link.target);
      if (sourceNode && targetNode) {
        points.push(new THREE.Vector3(...sourceNode.position));
        points.push(new THREE.Vector3(...targetNode.position));
      }
    });
    return new THREE.BufferGeometry().setFromPoints(points);
  }, [links, nodes]);

  return (
    <lineSegments geometry={lineGeometry}>
      <lineBasicMaterial color="#334155" opacity={0.4} transparent linewidth={1} />
    </lineSegments>
  );
}

// Main 3D Canvas Scene
function ThreeDScene({ nodes, links, onSelectNode }) {
  const [hoveredNode, setHoveredNode] = useState(null);

  return (
    <Canvas camera={{ position: [0, 0, 10], fov: 50 }}>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1.2} color="#6366f1" />
      <pointLight position={[-10, -10, -10]} intensity={0.6} color="#06b6d4" />
      <OrbitControls enableZoom={true} autoRotate={true} autoRotateSpeed={0.5} />

      <Connections links={links} nodes={nodes} />

      {nodes.map((node) => (
        <NetworkNode
          key={node.id}
          node={node}
          onSelect={onSelectNode}
          isHovered={hoveredNode?.id === node.id}
          onHover={setHoveredNode}
        />
      ))}
    </Canvas>
  );
}

// 2D SVG/Canvas Fallback View
function TwoDFallbackNetwork({ nodes, links, onSelectNode }) {
  const [hoveredNode, setHoveredNode] = useState(null);

  return (
    <div className="relative w-full h-full bg-[#080C15] flex flex-col items-center justify-center p-4">
      <svg className="w-full h-full max-h-[380px]" viewBox="-6 -6 12 12">
        {/* Draw Links */}
        {links.map((link, i) => {
          const s = nodes.find((n) => n.id === link.source);
          const t = nodes.find((n) => n.id === link.target);
          if (!s || !t) return null;
          return (
            <line
              key={i}
              x1={s.position[0]}
              y1={s.position[1]}
              x2={t.position[0]}
              y2={t.position[1]}
              stroke="#334155"
              strokeWidth="0.05"
              strokeOpacity="0.6"
            />
          );
        })}

        {/* Draw Nodes */}
        {nodes.map((node) => {
          const isSelected = hoveredNode?.id === node.id;
          const color = node.type === 'customer' ? '#3B82F6' :
                        node.type === 'merchant' ? '#A855F7' :
                        node.decision === 'BLOCK' ? '#EF4444' :
                        node.decision === 'CHALLENGE' ? '#F59E0B' : '#10B981';

          return (
            <g
              key={node.id}
              transform={`translate(${node.position[0]}, ${node.position[1]})`}
              className="cursor-pointer transition-transform duration-200"
              onClick={() => onSelectNode(node)}
              onMouseEnter={() => setHoveredNode(node)}
              onMouseLeave={() => setHoveredNode(null)}
            >
              <circle
                r={node.size * 0.8}
                fill={color}
                fillOpacity="0.85"
                stroke={isSelected ? '#F1F5F9' : color}
                strokeWidth={isSelected ? '0.1' : '0.04'}
              />
              <text
                y={node.size + 0.3}
                fontSize="0.3"
                fill="#94A3B8"
                textAnchor="middle"
                className="font-mono text-[8px]"
              >
                {node.label}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Selected/Hovered Card Detail */}
      {hoveredNode && (
        <div className="absolute bottom-4 right-4 glass-panel p-3 rounded-lg border border-indigo-500/40 text-xs max-w-xs shadow-xl z-20">
          <div className="font-semibold text-white mb-1 flex items-center justify-between">
            <span>{hoveredNode.label}</span>
            <span className="font-mono text-[10px] text-cyan-400">{hoveredNode.type.toUpperCase()}</span>
          </div>
          {hoveredNode.amount && <div className="text-slate-300">Amount: <span className="font-mono text-white">${hoveredNode.amount}</span></div>}
          {hoveredNode.risk_score && <div className="text-slate-300">Risk Score: <span className="font-mono text-amber-400 font-bold">{hoveredNode.risk_score}</span></div>}
        </div>
      )}
    </div>
  );
}

// Master Container Export
export function ThreeDNetwork({ transactions = [], onSelectTransaction }) {
  const webglSupported = useMemo(() => isWebGLAvailable(), []);
  const [selectedNode, setSelectedNode] = useState(null);

  // Build synthetic graph nodes & links from transaction data
  const { nodes, links } = useMemo(() => {
    const rawList = transactions.slice(0, 8);
    const nodeList = [
      { id: 'cust_main', label: 'Customer: cust_12345', type: 'customer', position: [0, 0, 0], size: 0.6 },
      { id: 'mch_01', label: 'MCC 5311: Retail', type: 'merchant', position: [-3, 2, -1], size: 0.5 },
      { id: 'mch_02', label: 'MCC 6051: Crypto', type: 'merchant', position: [3, -2, 1], size: 0.5 },
    ];

    const linkList = [
      { source: 'cust_main', target: 'mch_01' },
      { source: 'cust_main', target: 'mch_02' },
    ];

    rawList.forEach((tx, idx) => {
      const angle = (idx / rawList.length) * Math.PI * 2;
      const radius = 3.5;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      const z = (idx % 2 === 0 ? 1 : -1) * 1.5;

      const nodeId = tx.transaction_id || `tx_${idx}`;
      nodeList.push({
        id: nodeId,
        label: `Tx: $${tx.amount}`,
        type: 'transaction',
        decision: tx.decision || (tx.risk_score > 70 ? 'BLOCK' : tx.risk_score > 30 ? 'CHALLENGE' : 'ALLOW'),
        amount: tx.amount,
        risk_score: tx.risk_score,
        merchant: tx.merchant_name,
        position: [x, y, z],
        size: 0.4,
        rawTx: tx
      });

      linkList.push({
        source: 'cust_main',
        target: nodeId
      });
    });

    return { nodes: nodeList, links: linkList };
  }, [transactions]);

  const handleSelect = (node) => {
    setSelectedNode(node);
    if (node.rawTx && onSelectTransaction) {
      onSelectTransaction(node.rawTx);
    }
  };

  return (
    <div className="glass-panel rounded-xl p-4 border border-slate-800 relative overflow-hidden flex flex-col h-[440px] w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-2 z-10">
        <div className="flex items-center space-x-2">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
          <h3 className="font-bold text-slate-100 text-sm tracking-wide flex items-center gap-2">
            3D Fraud Intelligence Network Graph
          </h3>
        </div>
        <div className="flex items-center space-x-3 text-xs">
          <span className="flex items-center space-x-1 text-emerald-400 font-mono"><span className="w-2 h-2 rounded-full bg-emerald-500" /><span>Safe</span></span>
          <span className="flex items-center space-x-1 text-amber-400 font-mono"><span className="w-2 h-2 rounded-full bg-amber-500" /><span>Review</span></span>
          <span className="flex items-center space-x-1 text-rose-400 font-mono"><span className="w-2 h-2 rounded-full bg-rose-500" /><span>Block</span></span>
        </div>
      </div>

      {/* Render 3D Scene or 2D Fallback */}
      <div className="flex-1 w-full relative rounded-lg overflow-hidden border border-slate-800/80 bg-[#060911]">
        {webglSupported ? (
          <ThreeDScene nodes={nodes} links={links} onSelectNode={handleSelect} />
        ) : (
          <TwoDFallbackNetwork nodes={nodes} links={links} onSelectNode={handleSelect} />
        )}
      </div>

      {/* Footer Instructions */}
      <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between z-10 font-mono">
        <span>* Interactive: Drag to rotate | Scroll to zoom | Click node to inspect details</span>
        <span className="text-cyan-400/80">WebGL Status: {webglSupported ? 'Hardware Accelerated 3D' : '2D Canvas Fallback'}</span>
      </div>
    </div>
  );
}

export default ThreeDNetwork;
