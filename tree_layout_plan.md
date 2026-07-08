# Tree Layout Auto-Arrangement Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Integrate `@antv/layout` Dagre layout into the X6-based Org Chart Editor to allow users to automatically arrange graph nodes either vertically ('TB') or horizontally ('LR').

**Architecture:** Use the `DagreLayout` class from `@antv/layout` to calculate node coordinates based on the layout direction, and then update the X6 graph node positions.

**Tech Stack:** React, `@antv/x6`, `@antv/layout`

---

### Task 1: Integrate Auto-Arrangement in App.jsx

**Files:**
- Modify: [App.jsx](file:///D:/makeit/HR/%E6%9E%B6%E6%9E%84%E5%9B%BE%E8%AE%BE%E8%AE%A1/src/App.jsx)

- [ ] **Step 1: Import DagreLayout from `@antv/layout`**
  Add the import statement at the top of the file:
  ```javascript
  import { DagreLayout } from '@antv/layout';
  ```

- [ ] **Step 2: Implement the `handleAutoLayout` function**
  Define `handleAutoLayout(direction)` inside the `App` component after properties and state definitions:
  ```javascript
  const handleAutoLayout = (direction) => {
    if (!graph) return;

    const nodes = graph.getNodes();
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

    // Update X6 node positions, converting center coordinates to top-left
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
  };
  ```

- [ ] **Step 3: Pass `handleAutoLayout` as `onAutoLayout` to `<Toolbar />`**
  ```javascript
  <Toolbar
    onImportJSON={handleImportJSON}
    onExportJSON={handleExportJSON}
    onExportPNG={handleExportPNG}
    onExportSVG={handleExportSVG}
    onExportPDF={handleExportPDF}
    onClearCanvas={handleClearCanvas}
    onAutoLayout={handleAutoLayout}
  />
  ```

- [ ] **Step 4: Commit changes (mock commit/no-op due to git rule)**
  Print: "Skipping commit (auto_commit: false)."

---

### Task 2: Update Toolbar UI and Actions

**Files:**
- Modify: [Toolbar.jsx](file:///D:/makeit/HR/%E6%9E%B6%E6%9E%84%E5%9B%BE%E8%AE%BE%E8%AE%A1/src/components/Toolbar.jsx)

- [ ] **Step 1: Accept the `onAutoLayout` prop and import `RefreshCw`**
  Add `RefreshCw` to the lucide-react imports:
  ```javascript
  import { Download, Upload, Image, FileText, Printer, Trash2, RefreshCw } from 'lucide-react';
  ```
  Accept `onAutoLayout` in the component arguments:
  ```javascript
  export default function Toolbar({
    onImportJSON,
    onExportJSON,
    onExportPNG,
    onExportSVG,
    onExportPDF,
    onClearCanvas,
    onAutoLayout,
  }) {
  ```

- [ ] **Step 2: Add auto-arrangement buttons to the toolbar**
  Add a new toolbar group with the two buttons before the clear canvas group:
  ```javascript
  <div className="toolbar-divider" />

  <div className="toolbar-group">
    <button
      className="btn-action"
      onClick={() => onAutoLayout('TB')}
      title="整理 (垂直)"
    >
      <RefreshCw size={16} />
      <span>整理 (垂直)</span>
    </button>
    <button
      className="btn-action"
      onClick={() => onAutoLayout('LR')}
      title="整理 (横向)"
    >
      <RefreshCw size={16} />
      <span>整理 (横向)</span>
    </button>
  </div>
  ```

- [ ] **Step 3: Commit changes (mock commit/no-op due to git rule)**
  Print: "Skipping commit (auto_commit: false)."
