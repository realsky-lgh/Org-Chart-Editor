# Org Chart Editor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a minimalist, light-themed online organizational chart editor with draggable nodes, custom connectors, name-matching attributes, JSON save/load, image/PDF exports, and tree auto-layout.

**Architecture:** A standalone React single-page application using AntV X6 for the canvas rendering and drag-and-drop stencil operations. Canvas nodes are custom React components (using `@antv/x6-react-shape`) styled with Vanilla CSS to achieve a clean, modern, minimalist light theme. Data and connections are managed directly on the canvas graph, and serialized to JSON.

**Tech Stack:** React 18, Vite, `@antv/x6`, `@antv/x6-react-shape`, `@antv/layout` (dagre tree layout), `lucide-react`.

---

## Workspace Layout & File Mapping
- New Project Directory: `D:\makeit\HR\架构图设计`
- `package.json`: Main project configuration, dependencies, and build scripts.
- `src/index.css`: Global styles, layout parameters, and color design system tokens.
- `src/main.jsx`: Application bootstrap.
- `src/App.jsx`: Primary interface combining Header/Toolbar, Left Sidebar, central Canvas, and Right Properties Panel.
- `src/components/NodeTemplates.jsx`: React templates for Department, Position, and Person nodes.
- `src/components/Toolbar.jsx`: Controls for file imports, exports, auto-layout, and canvas clears.
- `src/components/Sidebar.jsx`: Draggable Stencil list of node categories.
- `src/components/PropertiesPanel.jsx`: Forms to modify selected graph element values.

---

## Tasks

### Task 1: Project Initialization & Scaffold
Initialize the Vite project, configure packages, and verify a clean build environment.

**Files:**
- Create: `D:\makeit\HR\架构图设计\package.json`
- Create: `D:\makeit\HR\架构图设计\src\main.jsx`
- Create: `D:\makeit\HR\架构图设计\index.html`

- [ ] **Step 1: Scaffold Vite project with React**
  Run: `npx -y create-vite@latest D:\makeit\HR\架构图设计 --template react` in terminal.
  Expected: Successful folder generation.

- [ ] **Step 2: Add project dependencies**
  Run: `npm install @antv/x6 @antv/x6-react-shape @antv/layout lucide-react` in `D:\makeit\HR\架构图设计`.
  Expected: Node modules installed.

- [ ] **Step 3: Replace package.json scripts with standard configurations**
  Write minimal project config.
  Verify file content in `D:\makeit\HR\架构图设计\package.json`.

- [ ] **Step 4: Verify initial build**
  Run: `npm run build` in `D:\makeit\HR\架构图设计`.
  Expected: Build finishes with exit code 0.

- [ ] **Step 5: Commit changes**
  Check `.agent/config.yml` for `auto_commit` setting.
  If `auto_commit: false`: Skip commit. Print: "Skipping commit (auto_commit: false)."

---

### Task 2: UI Design System & Base Layout Setup
Establish CSS design tokens for the minimalist light theme and design the main panel grid structure.

**Files:**
- Create: `D:\makeit\HR\架构图设计\src\index.css`
- Create: `D:\makeit\HR\架构图设计\src\App.jsx`

- [ ] **Step 1: Write minimalist styling variables & layout in index.css**
  Write code in `D:\makeit\HR\架构图设计\src\index.css`:
  ```css
  :root {
    --bg-main: #f8fafc;
    --bg-panel: #ffffff;
    --border-color: #e2e8f0;
    --text-primary: #0f172a;
    --text-secondary: #475569;
    --accent-blue: #2563eb;
    --accent-green: #10b981;
    --accent-purple: #8b5cf6;
    --accent-amber: #f59e0b;
  }
  body {
    margin: 0;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    background-color: var(--bg-main);
    color: var(--text-primary);
  }
  .app-container {
    display: grid;
    grid-template-rows: 56px 1fr;
    height: 100vh;
  }
  .header-bar {
    grid-row: 1;
    background: var(--bg-panel);
    border-bottom: 1px solid var(--border-color);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 20px;
  }
  .main-content {
    grid-row: 2;
    display: grid;
    grid-template-columns: 240px 1fr 280px;
    height: calc(100vh - 56px);
  }
  .sidebar-left {
    background: var(--bg-panel);
    border-right: 1px solid var(--border-color);
    padding: 16px;
  }
  .canvas-container {
    background: var(--bg-main);
    position: relative;
  }
  .properties-panel {
    background: var(--bg-panel);
    border-left: 1px solid var(--border-color);
    padding: 16px;
  }
  ```

- [ ] **Step 2: Initialize App.jsx base shell**
  Write code in `D:\makeit\HR\架构图设计\src\App.jsx`:
  ```jsx
  import React from 'react';
  import './index.css';

  export default function App() {
    return (
      <div className="app-container">
        <header className="header-bar">
          <div style={{ fontWeight: '600' }}>缁勭粐缁撴瀯鍥剧紪杈戝櫒 (Org Chart Editor)</div>
          <div>Toolbar Placeholder</div>
        </header>
        <div className="main-content">
          <aside className="sidebar-left">Sidebar Placeholder</aside>
          <main className="canvas-container" id="canvas-mount-point"></main>
          <aside className="properties-panel">Properties Panel Placeholder</aside>
        </div>
      </div>
    );
  }
  ```

- [ ] **Step 3: Run dev server & check layout**
  Run dev server and verify visually (if possible or verify code correctness).

- [ ] **Step 4: Commit changes**
  Check `.agent/config.yml` for `auto_commit` setting.
  If `auto_commit: false`: Skip commit. Print: "Skipping commit (auto_commit: false)."

---

### Task 3: Canvas Setup & React Custom Nodes
Initialize the AntV X6 canvas instance, configure the grid, and map Custom React components for Departments, Positions, and People.

**Files:**
- Create: `D:\makeit\HR\架构图设计\src\components\NodeTemplates.jsx`
- Modify: `D:\makeit\HR\架构图设计\src\App.jsx`

- [ ] **Step 1: Write Custom React Nodes in NodeTemplates.jsx**
  Write code in `D:\makeit\HR\架构图设计\src\components\NodeTemplates.jsx`:
  ```jsx
  import React from 'react';

  export function DeptNode({ node }) {
    const data = node.getData() || {};
    const accent = data.color || '#2563eb';
    return (
      <div style={{
        background: '#fff',
        border: `1px solid ${accent}`,
        borderRadius: '8px',
        padding: '12px',
        width: '180px',
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)',
        borderTop: `4px solid ${accent}`
      }}>
        <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 'bold' }}>閮ㄩ棬 (DEPARTMENT)</div>
        <div style={{ fontWeight: 'bold', marginTop: '4px', fontSize: '14px' }}>{data.name || '鏈懡鍚嶉儴闂?}</div>
        <div style={{ fontSize: '12px', color: '#475569', marginTop: '6px' }}>璐熻矗浜? {data.manager || '鏃?}</div>
      </div>
    );
  }

  export function PosNode({ node }) {
    const data = node.getData() || {};
    const employees = data.employees || [];
    return (
      <div style={{
        background: '#fff',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        padding: '12px',
        width: '180px',
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)'
      }}>
        <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 'bold' }}>宀椾綅 (POSITION)</div>
        <div style={{ fontWeight: 'bold', marginTop: '4px', fontSize: '13px' }}>{data.title || '鏂板矖浣?}</div>
        <div style={{ fontSize: '11px', color: '#94a3b8' }}>绛夌骇: {data.level || 'P-'}</div>
        <div style={{ borderTop: '1px solid #f1f5f9', marginTop: '8px', paddingTop: '6px' }}>
          <div style={{ fontSize: '11px', color: '#475569' }}>鎴愬憳: {employees.length > 0 ? employees.join(', ') : '鏆傛棤'}</div>
        </div>
      </div>
    );
  }

  export function PersonNode({ node }) {
    const data = node.getData() || {};
    return (
      <div style={{
        background: '#eff6ff',
        border: '1px solid #bfdbfe',
        borderRadius: '20px',
        padding: '6px 14px',
        display: 'flex',
        alignItems: 'center',
        boxShadow: '0 2px 4px rgb(0 0 0 / 0.05)'
      }}>
        <div style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          backgroundColor: '#3b82f6',
          marginRight: '8px'
        }} />
        <div style={{ fontSize: '13px', fontWeight: '500', color: '#1e3a8a' }}>{data.name || '鍖垮悕浜哄憳'}</div>
      </div>
    );
  }
  ```

- [ ] **Step 2: Bind Custom Nodes to X6 Canvas in App.jsx**
  Write React bindings in `D:\makeit\HR\架构图设计\src\App.jsx`:
  ```jsx
  import React, { useEffect, useRef, useState } from 'react';
  import { Graph } from '@antv/x6';
  import { register } from '@antv/x6-react-shape';
  import { DeptNode, PosNode, PersonNode } from './components/NodeTemplates';
  import './index.css';

  // Register X6 custom react components
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
  ```

- [ ] **Step 3: Setup Canvas container mounting lifecycle**
  Add X6 instantiation logic in `App.jsx`:
  ```jsx
  export default function App() {
    const graphRef = useRef(null);
    const containerRef = useRef(null);
    const [selectedCell, setSelectedCell] = useState(null);

    useEffect(() => {
      const graph = new Graph({
        container: document.getElementById('canvas-mount-point'),
        grid: {
          size: 10,
          visible: true,
          type: 'doubleMesh',
          args: [
            { color: '#e2e8f0', thickness: 1 },
            { color: '#cbd5e1', thickness: 1, factor: 4 }
          ]
        },
        panning: {
          enabled: true,
          modifiers: 'shift'
        },
        mousewheel: {
          enabled: true,
          modifiers: 'ctrl'
        },
        connecting: {
          snap: true,
          allowBlank: false,
          allowLoop: false,
          highlight: true
        }
      });
      graphRef.current = graph;

      graph.on('cell:selected', ({ cell }) => {
        setSelectedCell(cell);
      });
      graph.on('cell:unselected', () => {
        setSelectedCell(null);
      });

      return () => {
        graph.dispose();
      };
    }, []);

    return (
      <div className="app-container">
        <header className="header-bar">
          <div style={{ fontWeight: '600' }}>缁勭粐缁撴瀯鍥剧紪杈戝櫒 (Org Chart Editor)</div>
        </header>
        <div className="main-content">
          <aside className="sidebar-left">Sidebar</aside>
          <main className="canvas-container" id="canvas-mount-point"></main>
          <aside className="properties-panel">Properties Panel</aside>
        </div>
      </div>
    );
  }
  ```

- [ ] **Step 4: Verify canvas loads**
  Compile the code and verify that a grid canvas displays correctly.

- [ ] **Step 5: Commit changes**
  Check `.agent/config.yml` for `auto_commit` setting.
  If `auto_commit: false`: Skip commit. Print: "Skipping commit (auto_commit: false)."

---

### Task 4: Sidebar Drag-and-Drop Implementation
Implement Left Sidebar Stencil so shapes can be dragged onto the canvas.

**Files:**
- Create: `D:\makeit\HR\架构图设计\src\components\Sidebar.jsx`
- Modify: `D:\makeit\HR\架构图设计\src\App.jsx`

- [ ] **Step 1: Write Sidebar drag start logic**
  Write code in `D:\makeit\HR\架构图设计\src\components\Sidebar.jsx`:
  ```jsx
  import React from 'react';

  export default function Sidebar({ graph }) {
    const handleDragStart = (e, type) => {
      e.dataTransfer.setData('node-type', type);
    };

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#475569' }}>鎷栨嫿鍗＄墖鑷崇敾甯?/h4>
        
        <div
          draggable
          onDragStart={(e) => handleDragStart(e, 'dept')}
          style={{
            padding: '12px',
            border: '2px dashed #3b82f6',
            borderRadius: '8px',
            background: '#eff6ff',
            cursor: 'grab',
            fontSize: '13px',
            fontWeight: 'bold',
            textAlign: 'center'
          }}
        >
          閮ㄩ棬鍗＄墖
        </div>

        <div
          draggable
          onDragStart={(e) => handleDragStart(e, 'pos')}
          style={{
            padding: '12px',
            border: '2px dashed #64748b',
            borderRadius: '8px',
            background: '#f8fafc',
            cursor: 'grab',
            fontSize: '13px',
            fontWeight: 'bold',
            textAlign: 'center'
          }}
        >
          宀椾綅鍗＄墖
        </div>

        <div
          draggable
          onDragStart={(e) => handleDragStart(e, 'person')}
          style={{
            padding: '10px',
            border: '2px dashed #10b981',
            borderRadius: '20px',
            background: '#ecfdf5',
            cursor: 'grab',
            fontSize: '12px',
            fontWeight: 'bold',
            textAlign: 'center'
          }}
        >
          浜哄憳鏍囩
        </div>
      </div>
    );
  }
  ```

- [ ] **Step 2: Add drop target handler inside App.jsx**
  Modify canvas drop events inside `D:\makeit\HR\架构图设计\src\App.jsx`:
  ```jsx
  // Add drag/drop event listener logic in useEffect of App.jsx:
  const handleDrop = (e) => {
    e.preventDefault();
    const type = e.dataTransfer.getData('node-type');
    const graph = graphRef.current;
    if (!graph) return;

    const rect = document.getElementById('canvas-mount-point').getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const point = graph.clientToLocal(x, y);

    let nodeConfig = {};
    if (type === 'dept') {
      nodeConfig = {
        shape: 'dept-node-react',
        x: point.x,
        y: point.y,
        data: { name: '鏂伴儴闂?, manager: '鏈尮閰嶄富绠?, color: '#2563eb' }
      };
    } else if (type === 'pos') {
      nodeConfig = {
        shape: 'pos-node-react',
        x: point.x,
        y: point.y,
        data: { title: '鏂拌宀椾綅', level: 'P6', employees: [] }
      };
    } else if (type === 'person') {
      nodeConfig = {
        shape: 'person-node-react',
        x: point.x,
        y: point.y,
        data: { name: '鏂板叆鑱屽憳宸? }
      };
    }

    if (nodeConfig.shape) {
      graph.addNode(nodeConfig);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };
  ```

- [ ] **Step 3: Update App.jsx JSX mapping**
  Render `<Sidebar graph={graphRef.current} />` in the sidebar panel.
  Bind `onDragOver={handleDragOver}` and `onDrop={handleDrop}` to the `canvas-mount-point` container.

- [ ] **Step 4: Commit changes**
  Check `.agent/config.yml` for `auto_commit` setting.
  If `auto_commit: false`: Skip commit. Print: "Skipping commit (auto_commit: false)."

---

### Task 5: Ports Setup & Connection Styles
Add connectable anchor points (Ports) to each card, and style direct solid arrows and dashed affiliations.

**Files:**
- Modify: `D:\makeit\HR\架构图设计\src\App.jsx`

- [ ] **Step 1: Define Port layout configurations**
  Add Port settings to nodes inside X6 initialization in `App.jsx`:
  ```jsx
  const ports = {
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
  ```
  Ensure when node is added (either via Stencil or drag/drop), it gets ports defined.

- [ ] **Step 2: Add ports configuration automatically in App.jsx drop handler**
  Add ports property to the node instances:
  ```jsx
  nodeConfig.ports = ports;
  ```

- [ ] **Step 3: Configure connecting properties on Graph initialization**
  Customize how lines look when drawn:
  ```jsx
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
            strokeDasharray: 0, // Solid default
            targetMarker: {
              name: 'block',
              width: 8,
              height: 6,
            }
          }
        },
        router: { name: 'orth' },
        connector: { name: 'rounded' }
      });
    }
  }
  ```

- [ ] **Step 4: Verify port and connection functionality**
  Verify that dragging from node ports draws orthogonal lines with markers.

- [ ] **Step 5: Commit changes**
  Check `.agent/config.yml` for `auto_commit` setting.
  If `auto_commit: false`: Skip commit. Print: "Skipping commit (auto_commit: false)."

---

### Task 6: Right Properties Panel Implementation
Create properties panel that updates selected Node metadata (like Names, Managers, Color accent) and Edge style (Solid, Dashed, Arrows, Label).

**Files:**
- Create: `D:\makeit\HR\架构图设计\src\components\PropertiesPanel.jsx`
- Modify: `D:\makeit\HR\架构图设计\src\App.jsx`

- [ ] **Step 1: Write PropertiesPanel component**
  Write code in `D:\makeit\HR\架构图设计\src\components\PropertiesPanel.jsx`:
  ```jsx
  import React from 'react';

  export default function PropertiesPanel({ cell, onUpdate }) {
    if (!cell) {
      return (
        <div>
          <h4 style={{ margin: '0 0 12px 0' }}>灞炴�ч厤缃?/h4>
          <p style={{ color: '#64748b', fontSize: '13px' }}>璇峰湪鐢诲竷涓�変腑鑺傜偣鎴栬繛绾夸互缂栬緫灞炴�с�?/p>
        </div>
      );
    }

    const isNode = cell.isNode();
    const isEdge = cell.isEdge();
    const data = cell.getData() || {};

    const handleNodeChange = (key, value) => {
      const updatedData = { ...data, [key]: value };
      cell.setData(updatedData);
      onUpdate();
    };

    const handleEdgeChange = (key, value) => {
      if (key === 'lineType') {
        const dash = value === 'dashed' ? '5,5' : '0';
        cell.setAttrByPath('line/strokeDasharray', dash);
      } else if (key === 'arrow') {
        if (value === 'none') {
          cell.removeAttrByPath('line/targetMarker');
        } else if (value === 'target') {
          cell.setAttrByPath('line/targetMarker', { name: 'block', width: 8, height: 6 });
        }
      } else if (key === 'label') {
        cell.setLabels([{ attrs: { text: { text: value } } }]);
      }
      onUpdate();
    };

    if (isNode) {
      const shape = cell.shape;
      return (
        <div>
          <h4 style={{ margin: '0 0 12px 0', fontSize: '14px' }}>鑺傜偣灞炴�?/h4>
          {shape === 'dept-node-react' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <label style={{ fontSize: '12px', color: '#475569' }}>閮ㄩ棬鍚嶇О</label>
              <input
                type="text"
                value={data.name || ''}
                onChange={(e) => handleNodeChange('name', e.target.value)}
                style={{ padding: '6px', border: '1px solid #e2e8f0', borderRadius: '4px' }}
              />
              <label style={{ fontSize: '12px', color: '#475569' }}>璐熻矗浜?/label>
              <input
                type="text"
                value={data.manager || ''}
                onChange={(e) => handleNodeChange('manager', e.target.value)}
                style={{ padding: '6px', border: '1px solid #e2e8f0', borderRadius: '4px' }}
              />
              <label style={{ fontSize: '12px', color: '#475569' }}>閮ㄩ棬涓婚鑹?/label>
              <input
                type="color"
                value={data.color || '#2563eb'}
                onChange={(e) => handleNodeChange('color', e.target.value)}
                style={{ padding: '2px', border: '1px solid #e2e8f0', borderRadius: '4px', width: '50px' }}
              />
            </div>
          )}

          {shape === 'pos-node-react' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <label style={{ fontSize: '12px', color: '#475569' }}>宀椾綅鍚嶇О</label>
              <input
                type="text"
                value={data.title || ''}
                onChange={(e) => handleNodeChange('title', e.target.value)}
                style={{ padding: '6px', border: '1px solid #e2e8f0', borderRadius: '4px' }}
              />
              <label style={{ fontSize: '12px', color: '#475569' }}>绾у埆绛夌骇</label>
              <input
                type="text"
                value={data.level || ''}
                onChange={(e) => handleNodeChange('level', e.target.value)}
                style={{ padding: '6px', border: '1px solid #e2e8f0', borderRadius: '4px' }}
              />
              <label style={{ fontSize: '12px', color: '#475569' }}>鍖归厤鍛樺伐濮撳悕 (浠ラ�楀彿鍒嗛殧)</label>
              <input
                type="text"
                value={data.employees ? data.employees.join(', ') : ''}
                onChange={(e) => handleNodeChange('employees', e.target.value.split(',').map(s => s.trim()))}
                style={{ padding: '6px', border: '1px solid #e2e8f0', borderRadius: '4px' }}
              />
            </div>
          )}

          {shape === 'person-node-react' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <label style={{ fontSize: '12px', color: '#475569' }}>鍛樺伐濮撳悕</label>
              <input
                type="text"
                value={data.name || ''}
                onChange={(e) => handleNodeChange('name', e.target.value)}
                style={{ padding: '6px', border: '1px solid #e2e8f0', borderRadius: '4px' }}
              />
            </div>
          )}
        </div>
      );
    }

    if (isEdge) {
      const labels = cell.getLabels() || [];
      const edgeLabel = labels[0]?.attrs?.text?.text || '';
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h4 style={{ margin: '0 0 4px 0', fontSize: '14px' }}>杩炵嚎灞炴�?/h4>
          <label style={{ fontSize: '12px', color: '#475569' }}>鍏崇郴绫诲瀷</label>
          <select
            onChange={(e) => handleEdgeChange('lineType', e.target.value)}
            style={{ padding: '6px', border: '1px solid #e2e8f0', borderRadius: '4px' }}
          >
            <option value="solid">瀹炵嚎 (鐩存帴涓嬪睘)</option>
            <option value="dashed">铏氱嚎 (闅跺睘鐭╅樀)</option>
          </select>

          <label style={{ fontSize: '12px', color: '#475569' }}>绠ご绫诲瀷</label>
          <select
            onChange={(e) => handleEdgeChange('arrow', e.target.value)}
            style={{ padding: '6px', border: '1px solid #e2e8f0', borderRadius: '4px' }}
          >
            <option value="target">鍗曞悜绠ご</option>
            <option value="none">鏃犵澶?/option>
          </select>

          <label style={{ fontSize: '12px', color: '#475569' }}>杩炵嚎鏂囧瓧璇存槑</label>
          <input
            type="text"
            value={edgeLabel}
            onChange={(e) => handleEdgeChange('label', e.target.value)}
            style={{ padding: '6px', border: '1px solid #e2e8f0', borderRadius: '4px' }}
          />
        </div>
      );
    }
  }
  ```

- [ ] **Step 2: Bind selection updates in App.jsx**
  Pass current `selectedCell` to `PropertiesPanel` and define `forceUpdate` trigger:
  ```jsx
  const [, setTick] = useState(0);
  const triggerUpdate = () => setTick(t => t + 1);
  ```
  Render `<PropertiesPanel cell={selectedCell} onUpdate={triggerUpdate} />` inside properties sidebar.

- [ ] **Step 3: Add Delete Key node cleanup**
  Add keydown handler inside useEffect of `App.jsx` to allow deleting nodes and lines:
  ```jsx
  const handleKeyDown = (e) => {
    if (e.key === 'Delete' || e.key === 'Backspace') {
      const selected = graph.getSelectedCells();
      if (selected.length > 0) {
        graph.removeCells(selected);
      }
    }
  };
  window.addEventListener('keydown', handleKeyDown);
  return () => {
    window.removeEventListener('keydown', handleKeyDown);
    graph.dispose();
  };
  ```

- [ ] **Step 4: Commit changes**
  Check `.agent/config.yml` for `auto_commit` setting.
  If `auto_commit: false`: Skip commit. Print: "Skipping commit (auto_commit: false)."

---

### Task 7: Toolbar Features (JSON Save/Load, Auto-Save, High-res Image/PDF Exports)
Add toolbar functionality to import/export JSON, clear canvas, autosave to local storage, and export to PNG, SVG, and PDF.

**Files:**
- Create: `D:\makeit\HR\架构图设计\src\components\Toolbar.jsx`
- Modify: `D:\makeit\HR\架构图设计\src\App.jsx`

- [ ] **Step 1: Write Toolbar component**
  Write code in `D:\makeit\HR\架构图设计\src\components\Toolbar.jsx`:
  ```jsx
  import React from 'react';
  import { Download, Upload, Image, FileText, RefreshCw, Trash2 } from 'lucide-react';

  export default function Toolbar({ onExportJSON, onImportJSON, onExportPNG, onExportSVG, onExportPDF, onClearCanvas }) {
    const handleFileChange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          onImportJSON(event.target.result);
        };
        reader.readAsText(file);
      }
    };

    return (
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <button onClick={onExportJSON} className="btn-action" title="瀵煎嚭 JSON 杩涘害">
          <Download size={16} /> 瀵煎嚭 JSON
        </button>
        
        <label className="btn-action" style={{ cursor: 'pointer' }} title="瀵煎叆 JSON 杩涘害">
          <Upload size={16} /> 瀵煎叆 JSON
          <input type="file" accept=".json" onChange={handleFileChange} style={{ display: 'none' }} />
        </label>

        <span style={{ borderLeft: '1px solid #e2e8f0', height: '24px', margin: '0 4px' }} />

        <button onClick={onExportPNG} className="btn-action" title="瀵煎嚭楂樻竻 PNG">
          <Image size={16} /> PNG 鍥剧墖
        </button>

        <button onClick={onExportSVG} className="btn-action" title="瀵煎嚭鐭㈤噺 SVG (Visio鍙鍙?">
          <Image size={16} /> SVG 鐭㈤噺
        </button>

        <button onClick={onExportPDF} className="btn-action" title="鎵撳嵃 / 瀵煎嚭 PDF">
          <FileText size={16} /> 瀵煎嚭 PDF
        </button>

        <span style={{ borderLeft: '1px solid #e2e8f0', height: '24px', margin: '0 4px' }} />

        <button onClick={onClearCanvas} className="btn-action" style={{ color: '#ef4444' }} title="娓呯┖鐢诲竷">
          <Trash2 size={16} /> 娓呯┖
        </button>
      </div>
    );
  }
  ```

- [ ] **Step 2: Add action triggers inside App.jsx**
  Implement export, import, auto-save, and canvas clearing functions inside `D:\makeit\HR\架构图设计\src\App.jsx`:
  ```jsx
  // JSON Export
  const handleExportJSON = () => {
    const data = graphRef.current.toJSON();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'org-chart.json';
    a.click();
  };

  // JSON Import
  const handleImportJSON = (jsonString) => {
    try {
      const data = JSON.parse(jsonString);
      graphRef.current.fromJSON(data);
    } catch (err) {
      alert('JSON 鏂囦欢鏍煎紡閿欒锛屽鍏ュけ璐ワ紒');
    }
  };

  // LocalStorage Auto-save
  useEffect(() => {
    const graph = graphRef.current;
    if (!graph) return;

    // Load initial from localStorage
    const saved = localStorage.getItem('org-chart-progress');
    if (saved) {
      try {
        graph.fromJSON(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load saved state:', e);
      }
    }

    const saveProgress = () => {
      localStorage.setItem('org-chart-progress', JSON.stringify(graph.toJSON()));
    };

    graph.on('cell:change:*', saveProgress);
    graph.on('cell:added', saveProgress);
    graph.on('cell:removed', saveProgress);

    return () => {
      graph.off('cell:change:*', saveProgress);
      graph.off('cell:added', saveProgress);
      graph.off('cell:removed', saveProgress);
    };
  }, [tick]);

  // Image and PDF exports
  const handleExportPNG = () => {
    graphRef.current.toPNG((dataUri) => {
      const a = document.createElement('a');
      a.download = 'org-chart.png';
      a.href = dataUri;
      a.click();
    });
  };

  const handleExportSVG = () => {
    graphRef.current.toSVG((svgString) => {
      const blob = new Blob([svgString], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.download = 'org-chart.svg';
      a.href = url;
      a.click();
    });
  };

  const handleExportPDF = () => {
    window.print(); // Minimal print layout that hides toolbar/sidebars using CSS media print
  };

  const handleClearCanvas = () => {
    if (window.confirm('鎮ㄧ‘瀹氳娓呯┖鏁村紶鐢诲竷鍚楋紵')) {
      graphRef.current.clearCells();
      localStorage.removeItem('org-chart-progress');
    }
  };
  ```

- [ ] **Step 3: Add @media print style to index.css**
  Write rules in `D:\makeit\HR\架构图设计\src\index.css`:
  ```css
  @media print {
    .header-bar, .sidebar-left, .properties-panel {
      display: none !important;
    }
    .main-content {
      grid-template-columns: 1fr !important;
      height: 100vh !important;
    }
    .canvas-container {
      background: white !important;
    }
  }
  .btn-action {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    font-size: 13px;
    color: var(--text-secondary);
    transition: all 0.2s;
  }
  .btn-action:hover {
    background: #f8fafc;
    color: var(--text-primary);
  }
  ```

- [ ] **Step 4: Bind Toolbar component inside App.jsx**
  Pass functions to `<Toolbar />` in Header.

- [ ] **Step 5: Commit changes**
  Check `.agent/config.yml` for `auto_commit` setting.
  If `auto_commit: false`: Skip commit. Print: "Skipping commit (auto_commit: false)."

---

### Task 8: Tree Layout Auto-Arrangement Integration
Integrate Dagre layout from `@antv/layout` to auto-arrange all nodes hierarchically.

**Files:**
- Modify: `D:\makeit\HR\架构图设计\src\App.jsx`
- Modify: `D:\makeit\HR\架构图设计\src\components\Toolbar.jsx`

- [ ] **Step 1: Write Auto-Layout logic in App.jsx**
  Import `@antv/layout` and implement layout algorithm inside `D:\makeit\HR\架构图设计\src\App.jsx`:
  ```jsx
  import { DagreLayout } from '@antv/layout';

  const handleAutoLayout = (direction = 'TB') => {
    const graph = graphRef.current;
    if (!graph) return;

    const cells = graph.getCells();
    const nodes = cells.filter(cell => cell.isNode()).map(node => ({
      id: node.id,
      size: [node.size().width, node.size().height],
    }));
    const edges = cells.filter(cell => cell.isEdge()).map(edge => ({
      source: edge.getSourceCellId(),
      target: edge.getTargetCellId(),
    }));

    const dagreLayout = new DagreLayout({
      type: 'dagre',
      rankdir: direction, // 'TB' or 'LR'
      nodesep: 40,
      ranksep: 60,
    });

    const model = dagreLayout.layout({ nodes, edges });

    model.nodes.forEach(node => {
      const graphNode = graph.getCellById(node.id);
      if (graphNode) {
        graphNode.position(node.x, node.y);
      }
    });
  };
  ```

- [ ] **Step 2: Add vertical and horizontal buttons in Toolbar**
  Modify `D:\makeit\HR\架构图设计\src\components\Toolbar.jsx` to render layout buttons:
  ```jsx
  <button onClick={() => onAutoLayout('TB')} className="btn-action" title="涓�閿暣鐞?- 鍨傜洿鏍戝舰">
    <RefreshCw size={16} /> 鍨傜洿鏍戝舰
  </button>
  <button onClick={() => onAutoLayout('LR')} className="btn-action" title="涓�閿暣鐞?- 妯悜鏍戝舰">
    <RefreshCw size={16} /> 妯悜鏍戝舰
  </button>
  ```
  Pass `onAutoLayout` prop from `App.jsx` to `Toolbar.jsx`.

- [ ] **Step 3: Verify Auto-Layout behavior**
  Add some nodes, connect them, click Auto Layout, and verify they position themselves into a clean tree structure.

- [ ] **Step 4: Commit changes**
  Check `.agent/config.yml` for `auto_commit` setting.
  If `auto_commit: false`: Skip commit. Print: "Skipping commit (auto_commit: false)."

---

### Task 9: Aesthetic Polish & Verification
Check styles, test edge cases, and run build script to produce a production-ready application.

**Files:**
- Modify: `D:\makeit\HR\架构图设计\src\index.css`

- [ ] **Step 1: Polish CSS styles**
  Review design tokens in `index.css`, add hover styling to cards, shadows, and smooth transition animations.
  Make sure nodes look extremely elegant, modern, and minimalist (pure black/gray labels, thin border highlights when active).

- [ ] **Step 2: Add clear sample data for first-time use**
  Modify `App.jsx` to pre-load a small org chart (e.g. CEO -> VP -> Engineering Manager) if no data exists in localStorage:
  ```jsx
  const saved = localStorage.getItem('org-chart-progress');
  if (!saved) {
    const parent = graph.addNode({
      shape: 'dept-node-react',
      x: 300,
      y: 50,
      data: { name: '鎬荤粡鍔?, manager: '寮犳�荤粡鐞?, color: '#2563eb' },
      ports
    });
    const child = graph.addNode({
      shape: 'pos-node-react',
      x: 300,
      y: 200,
      data: { title: '鐮斿彂鍓�?, level: 'VP', employees: ['鏉庡洓'] },
      ports
    });
    graph.addEdge({
      source: { cell: parent.id, port: 'bottom' },
      target: { cell: child.id, port: 'top' },
      attrs: {
        line: {
          stroke: '#64748b',
          strokeWidth: 2,
          targetMarker: { name: 'block', width: 8, height: 6 }
        }
      },
      router: { name: 'orth' },
      connector: { name: 'rounded' }
    });
  }
  ```

- [ ] **Step 3: Build the application for production**
  Run: `npm run build` in `D:\makeit\HR\架构图设计`.
  Expected: Successful compilation without warnings or errors.

- [ ] **Step 4: Final verification**
  Run verification to check all functionalities.

- [ ] **Step 5: Commit changes**
  Check `.agent/config.yml` for `auto_commit` setting.
  If `auto_commit: false`: Skip commit. Print: "Skipping commit (auto_commit: false)."
