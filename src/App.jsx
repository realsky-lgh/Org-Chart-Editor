import React, { useEffect, useRef, useState } from 'react';
import { Graph } from '@antv/x6';
import { register } from '@antv/x6-react-shape';
import { Export } from '@antv/x6-plugin-export';
import { Selection } from '@antv/x6-plugin-selection';
import { Transform } from '@antv/x6-plugin-transform';
import { History } from '@antv/x6-plugin-history';
import { DagreLayout } from '@antv/layout';
import { DeptNode, PosNode, PersonNode, TextNode } from './components/NodeTemplates';
import './index.css';
import Sidebar from './components/Sidebar';
import PropertiesPanel from './components/PropertiesPanel';
import Toolbar from './components/Toolbar';


// Register the custom shapes for Departments, Positions, and People
register({
  shape: 'dept-node-react',
  width: 180,
  height: 90,
  component: DeptNode,
});

register({
  shape: 'pos-node-react',
  width: 180,
  height: 100,
  component: PosNode,
});

register({
  shape: 'person-node-react',
  width: 130,
  height: 36,
  component: PersonNode,
});

register({
  shape: 'text-node-react',
  width: 140,
  height: 40,
  component: TextNode,
});

// Define shared ports configuration for all nodes (connectable top, bottom, left, right)
const nodePorts = {
  groups: {
    top: { position: 'top', attrs: { circle: { r: 4, magnet: true, stroke: '#31d0c6', fill: '#fff', strokeWidth: 1 } } },
    bottom: { position: 'bottom', attrs: { circle: { r: 4, magnet: true, stroke: '#31d0c6', fill: '#fff', strokeWidth: 1 } } },
    left: { position: 'left', attrs: { circle: { r: 4, magnet: true, stroke: '#31d0c6', fill: '#fff', strokeWidth: 1 } } },
    right: { position: 'right', attrs: { circle: { r: 4, magnet: true, stroke: '#31d0c6', fill: '#fff', strokeWidth: 1 } } }
  },
  items: [
    { id: 'top', group: 'top' },
    { id: 'bottom', group: 'bottom' },
    { id: 'left', group: 'left' },
    { id: 'right', group: 'right' }
  ]
};

export default function App() {
  const containerRef = useRef(null);
  const [graph, setGraph] = useState(null);
  const [selectedCellId, setSelectedCellId] = useState(null);
  const [selectedCellIds, setSelectedCellIds] = useState([]);
  const [tick, setTick] = useState(0);
  const triggerUpdate = () => setTick(t => t + 1);

  const triggerUpdateRef = useRef(triggerUpdate);
  triggerUpdateRef.current = triggerUpdate;

  const [versions, setVersions] = useState(() => {
    try {
      const saved = localStorage.getItem('org-chart-versions');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const handleSaveVersion = (name) => {
    if (!graph) return;
    const finalName = name || window.prompt('请输入本次保存的架构图名称:', '架构图_' + new Date().toLocaleString());
    if (!finalName) return;

    const newVersion = {
      id: Date.now().toString(),
      name: finalName,
      timestamp: new Date().toLocaleString(),
      data: graph.toJSON()
    };

    const updated = [newVersion, ...versions];
    setVersions(updated);
    localStorage.setItem('org-chart-versions', JSON.stringify(updated));
  };

  const handleLoadVersion = (version) => {
    if (!graph) return;
    if (window.confirm(`确定要载入版本「${version.name}」吗？当前画布中的修改将被覆盖。`)) {
      graph.fromJSON(version.data);
      // Sync to auto-save key so reload works
      localStorage.setItem('org-chart-progress', JSON.stringify(version.data));
      triggerUpdate();
    }
  };

  const handleDeleteVersion = (id) => {
    if (window.confirm('确定要删除该保存版本吗？此操作不可撤销。')) {
      const updated = versions.filter(v => v.id !== id);
      setVersions(updated);
      localStorage.setItem('org-chart-versions', JSON.stringify(updated));
    }
  };

  const handleZoomIn = () => {
    if (!graph) return;
    // Relative zoom in by 0.05 (5% increment)
    graph.zoom(0.05);
  };

  const handleZoomOut = () => {
    if (!graph) return;
    // Relative zoom out by -0.05 (5% decrement)
    // Prevent zooming out below 0.1
    if (graph.zoom() > 0.15) {
      graph.zoom(-0.05);
    }
  };

  const handleZoomToFit = () => {
    if (!graph) return;
    // Set generous right and left padding to prevent nodes from getting too close to side panels
    graph.zoomToFit({
      padding: { top: 40, right: 80, bottom: 40, left: 60 },
      maxZoom: 1
    });
  };

  const handleAutoLayout = (direction) => {
    if (!graph) return;

    const nodes = graph.getNodes();
    if (nodes.length === 0) return;

    const edges = graph.getEdges();

    const nodeIds = new Set(nodes.map(n => n.id));

    // Map X6 nodes to @antv/layout format
    const layoutNodes = nodes.map(node => {
      const size = node.getSize();
      return {
        id: node.id,
        size: [size.width, size.height],
      };
    });

    // Map and filter X6 edges to only include valid connections between existing nodes
    const layoutEdges = edges
      .map(edge => {
        const sourceId = edge.getSourceCellId ? edge.getSourceCellId() : edge.getSource().cell;
        const targetId = edge.getTargetCellId ? edge.getTargetCellId() : edge.getTarget().cell;
        return {
          source: sourceId,
          target: targetId,
        };
      })
      .filter(edge => edge.source && edge.target && nodeIds.has(edge.source) && nodeIds.has(edge.target));

    // Instantiate and execute DagreLayout
    const dagreLayout = new DagreLayout({
      type: 'dagre',
      rankdir: direction, // 'TB' or 'LR'
      nodesep: 40,
      ranksep: 60,
      controlPoints: false,
    });

    const result = dagreLayout.layout({
      nodes: layoutNodes,
      edges: layoutEdges,
    });

    // Update X6 node positions inside a batch transaction for better performance
    graph.startBatch('layout');
    result.nodes.forEach(node => {
      const graphNode = graph.getCellById(node.id);
      if (graphNode) {
        const width = node.size ? node.size[0] : 180;
        const height = node.size ? node.size[1] : 100;
        const x = node.x - width / 2;
        const y = node.y - height / 2;
        graphNode.position(x, y);
      }
    });
    graph.stopBatch('layout');

    // Auto-fit viewport to show the entire layout centered with generous margins
    graph.zoomToFit({
      padding: { top: 40, right: 80, bottom: 40, left: 60 },
      maxZoom: 1
    });
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (!graph) return;

    const type = e.dataTransfer.getData('node-type');
    if (!type) return;

    const { clientX, clientY } = e;
    const { x, y } = graph.clientToLocal(clientX, clientY);

    const ports = nodePorts;

    let nodeConfig = null;
    if (type === 'dept') {
      nodeConfig = {
        shape: 'dept-node-react',
        x: x - 90,
        y: y - 45,
        data: { name: '新部门', manager: '未匹配主管', color: '#2563eb' },
        ports
      };
    } else if (type === 'pos') {
      nodeConfig = {
        shape: 'pos-node-react',
        x: x - 90,
        y: y - 50,
        data: { title: '新设岗位', level: 'P6', employees: [] },
        ports
      };
    } else if (type === 'person') {
      nodeConfig = {
        shape: 'person-node-react',
        x: x - 65,
        y: y - 18,
        data: { name: '新入职员工' },
        ports
      };
    } else if (type === 'text') {
      nodeConfig = {
        shape: 'text-node-react',
        x: x - 70,
        y: y - 20,
        data: {
          text: '双击输入文本',
          fontFamily: 'sans-serif',
          fontSize: 14,
          fontWeight: 'normal',
          color: '#0f172a'
        },
        ports
      };
    }

    if (nodeConfig) {
      graph.addNode(nodeConfig);
    }
  };

  useEffect(() => {
    if (!containerRef.current) return;

    // Instantiate X6 Graph
    const instance = new Graph({
      container: containerRef.current,
      autoResize: true,
      panning: {
        enabled: true,
        eventTypes: ['rightMouseDown'],
      },
      grid: {
        size: 10,
        visible: true,
        type: 'doubleMesh',
        args: [
          {
            color: '#e2e8f0', // Primary grid color
            thickness: 1,
          },
          {
            color: '#cbd5e1', // Secondary grid color (mesh accent)
            thickness: 1,
            factor: 4,
          },
        ],
      },

      connecting: {
        snap: true,
        allowBlank: false,
        allowLoop: false,
        highlight: true,
        createEdge() {
          return this.createEdge({
            shape: 'edge',
            attrs: {
              line: {
                stroke: '#64748b',
                strokeWidth: 2,
                targetMarker: {
                  name: 'block',
                  width: 8,
                  height: 6,
                }
              }
            },
            router: { name: 'manhattan' },
            connector: { name: 'rounded' }
          });
        }
      }
    });

    // Enable export, selection, and transform (resizing) plugins
    instance.use(new Export());
    instance.use(
      new Selection({
        enabled: true,
        rubberband: true,
        showNodeSelectionBox: true,
        showEdgeSelectionBox: true,
      })
    );
    instance.use(
      new Transform({
        resizing: {
          enabled: true,
          minWidth: 50,
          minHeight: 30,
          orthogonal: true, // Display center handles
          preserveAspectRatio: false, // Let user adjust height and width freely
        }
      })
    );
    instance.use(
      new History({
        enabled: true,
        stackSize: 20
      })
    );

    const loadMockNodes = () => {
      instance.addNode({
        id: 'mock-dept',
        shape: 'dept-node-react',
        x: 40,
        y: 40,
        data: { name: '研发中心', manager: '张经理', color: '#2563eb' },
        ports: nodePorts
      });

      instance.addNode({
        id: 'mock-pos',
        shape: 'pos-node-react',
        x: 260,
        y: 40,
        data: { title: '前端架构师', level: 'P7', employees: ['阿强', '阿珍'] },
        ports: nodePorts
      });

      instance.addNode({
        id: 'mock-person',
        shape: 'person-node-react',
        x: 480,
        y: 40,
        data: { name: '王小明' },
        ports: nodePorts
      });
    };

    // Load initial data from localStorage or fallback to mock nodes
    const savedProgress = localStorage.getItem('org-chart-progress');
    if (savedProgress) {
      try {
        const json = JSON.parse(savedProgress);
        instance.fromJSON(json);
      } catch (e) {
        console.error('Failed to load saved progress from localStorage:', e);
        loadMockNodes();
      }
    } else {
      loadMockNodes();
    }

    setGraph(instance);

    // Event listener for selection change
    const updateSelection = () => {
      const selected = instance.getSelectedCells();
      const ids = selected.map(cell => cell.id);
      setSelectedCellIds(ids);
      if (selected.length > 0) {
        setSelectedCellId(selected[0].id);
      } else {
        setSelectedCellId(null);
      }
    };

    // Watch cell changes and serialize to localStorage with 500ms debounce
    let saveTimeout = null;
    const saveToLocalStorage = () => {
      if (saveTimeout) clearTimeout(saveTimeout);
      saveTimeout = setTimeout(() => {
        try {
          const json = instance.toJSON();
          localStorage.setItem('org-chart-progress', JSON.stringify(json));
        } catch (err) {
          console.error('Auto-save to localStorage failed:', err);
        }
      }, 500);
    };

    instance.on('cell:selected', updateSelection);
    instance.on('cell:unselected', updateSelection);

    // Batch resizing: sync size of all selected nodes when one is resized
    instance.on('node:resizing', ({ node }) => {
      const selected = instance.getSelectedCells().filter(cell => cell.isNode() && cell.id !== node.id);
      if (selected.length > 0) {
        const size = node.getSize();
        selected.forEach(n => {
          n.setSize(size.width, size.height);
        });
      }
    });

    // Double click to edit edge labels inline
    instance.on('edge:dblclick', ({ edge }) => {
      const labels = edge.getLabels() || [];
      const currentLabel = labels[0]?.attrs?.text?.text || '';
      const newLabel = window.prompt('编辑连线关系标签:', currentLabel);
      if (newLabel !== null) {
        edge.setLabels([{ attrs: { text: { text: newLabel } } }]);
      }
    });

    // Double click to enter node editing state (whole card edit mode)
    instance.on('node:dblclick', ({ node }) => {
      const data = node.getData() || {};
      node.setData({ ...data, isEditing: true });
    });

    // Click blank canvas to exit all editing states
    instance.on('blank:click', () => {
      instance.getNodes().forEach(n => {
        const d = n.getData() || {};
        if (d.isEditing) {
          n.setData({ ...d, isEditing: false });
        }
      });
    });

    // Click a node to exit editing state on all OTHER nodes
    instance.on('node:click', ({ node }) => {
      instance.getNodes().forEach(n => {
        if (n.id !== node.id) {
          const d = n.getData() || {};
          if (d.isEditing) {
            n.setData({ ...d, isEditing: false });
          }
        }
      });
    });
    instance.on('cell:added', saveToLocalStorage);
    instance.on('cell:removed', saveToLocalStorage);
    instance.on('cell:change:*', () => {
      triggerUpdateRef.current();
      saveToLocalStorage();
    });

    const duplicateSelectedCells = () => {
      if (!instance) return;
      const selected = instance.getSelectedCells().filter(cell => cell.isNode());
      if (selected.length === 0) return;

      const newNodes = [];
      selected.forEach(node => {
        const model = node.toJSON();
        const x = (model.position?.x || 0) + 40;
        const y = (model.position?.y || 0) + 40;
        
        const nodeConfig = {
          ...model,
          id: undefined,
          position: { x, y },
          data: {
            ...(model.data || {}),
            isEditing: false
          }
        };
        const newNode = instance.addNode(nodeConfig);
        newNodes.push(newNode);
      });

      if (newNodes.length > 0) {
        instance.cleanSelection();
        instance.select(newNodes);
        updateSelection();
      }
    };

    const handleKeyDown = (e) => {
      const activeEl = document.activeElement;
      const isInputActive = activeEl && (
        activeEl.tagName === 'INPUT' ||
        activeEl.tagName === 'TEXTAREA' ||
        activeEl.tagName === 'SELECT' ||
        activeEl.isContentEditable
      );

      if (isInputActive) {
        return;
      }

      // 1. Ctrl-Z for Undo
      if (e.ctrlKey && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (instance.canUndo && instance.canUndo()) {
          instance.undo();
          setSelectedCellId(null);
          setSelectedCellIds([]);
        }
      }

      // 2. Ctrl-D for Duplicate
      if (e.ctrlKey && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        duplicateSelectedCells();
      }

      // 3. Delete / Backspace for Delete
      if (e.key === 'Delete' || e.key === 'Backspace') {
        const selected = instance.getSelectedCells();
        if (selected.length > 0) {
          instance.removeCells(selected);
          setSelectedCellId(null);
          setSelectedCellIds([]);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    // Auto-fit graph to page before printing
    let prePrintTransform = null;
    const handleBeforePrint = () => {
      prePrintTransform = instance.transform.getTransform(); // Save viewport
      instance.zoomToFit({ padding: 10 });
    };
    const handleAfterPrint = () => {
      if (prePrintTransform) {
        instance.zoom(prePrintTransform.sx, { absolute: true });
        instance.translate(prePrintTransform.tx, prePrintTransform.ty);
      }
    };
    window.addEventListener('beforeprint', handleBeforePrint);
    window.addEventListener('afterprint', handleAfterPrint);

    const handleContextMenu = (e) => {
      e.preventDefault();
    };
    containerRef.current.addEventListener('contextmenu', handleContextMenu);

    // Clean up on unmount
    return () => {
      if (saveTimeout) clearTimeout(saveTimeout);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('beforeprint', handleBeforePrint);
      window.removeEventListener('afterprint', handleAfterPrint);
      if (containerRef.current) {
        containerRef.current.removeEventListener('contextmenu', handleContextMenu);
      }
      instance.dispose();
    };
  }, []);

  const handleExportJSON = () => {
    if (!graph) return;
    const json = graph.toJSON();
    const blob = new Blob([JSON.stringify(json, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'org-chart.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJSON = (json) => {
    if (!graph) return;
    try {
      graph.fromJSON(json);
      localStorage.setItem('org-chart-progress', JSON.stringify(json));
      triggerUpdate();
    } catch (err) {
      alert('导入 JSON 格式错误: ' + err.message);
    }
  };

  const handleExportPNG = () => {
    if (!graph) return;
    graph.exportPNG('org-chart.png', {
      backgroundColor: '#ffffff',
      padding: { top: 20, right: 20, bottom: 20, left: 20 },
      quality: 1,
    });
  };

  const handleExportSVG = () => {
    if (!graph) return;
    graph.exportSVG('org-chart.svg', {
      preserveDimensions: true,
      copyStyles: true,
    });
  };

  const handleExportPDF = () => {
    window.print();
  };

  const handleClearCanvas = () => {
    if (!graph) return;
    if (window.confirm('确定要清空画布吗？这将会删除所有节点和连线。')) {
      graph.clearCells();
      localStorage.setItem('org-chart-progress', JSON.stringify({ cells: [] }));
      triggerUpdate();
    }
  };

  return (
    <div className="app-container">
      <header className="header-bar">
        <div className="logo-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img src="/logo.png" alt="Logo" style={{ height: '30px', width: '30px', borderRadius: '4px', objectFit: 'contain' }} />
          <span>组织结构图编辑器 (Org Chart Editor)</span>
        </div>
        <Toolbar
          onImportJSON={handleImportJSON}
          onExportJSON={handleExportJSON}
          onExportPNG={handleExportPNG}
          onExportSVG={handleExportSVG}
          onExportPDF={handleExportPDF}
          onClearCanvas={handleClearCanvas}
          onAutoLayout={handleAutoLayout}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onZoomToFit={handleZoomToFit}
        />
      </header>
      <div className="main-content">
        <aside className="sidebar-left">
          <Sidebar
            versions={versions}
            onLoadVersion={handleLoadVersion}
            onDeleteVersion={handleDeleteVersion}
            onSaveVersion={handleSaveVersion}
          />
        </aside>
        <main
          className="canvas-container"
          id="canvas-mount-point"
          ref={containerRef}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          {/* AntV X6 Canvas container */}
        </main>
        <aside className="properties-panel">
          <PropertiesPanel
            selectedCellId={selectedCellId}
            selectedCellIds={selectedCellIds}
            graph={graph}
            onUpdate={triggerUpdate}
          />
        </aside>
      </div>
    </div>
  );
}

