import React, { useEffect, useState } from 'react';

export default function PropertiesPanel({ selectedCellId, selectedCellIds = [], graph, onUpdate }) {
  const [localData, setLocalData] = useState({});

  const cell = graph ? graph.getCellById(selectedCellId) : null;
  const isMultiple = selectedCellIds.length > 1;

  // For batch edit local state
  const [batchWidth, setBatchWidth] = useState(180);
  const [batchHeight, setBatchHeight] = useState(90);
  const [batchColor, setBatchColor] = useState('#2563eb');

  // Sync batch initial values from the first selected node
  useEffect(() => {
    if (isMultiple && graph) {
      const firstNode = selectedCellIds
        .map(id => graph.getCellById(id))
        .find(cell => cell && cell.isNode());
      if (firstNode) {
        const size = firstNode.getSize();
        setBatchWidth(size.width);
        setBatchHeight(size.height);
        const data = firstNode.getData() || {};
        if (data.color) {
          setBatchColor(data.color);
        }
      }
    }
  }, [isMultiple, selectedCellIds, graph]);

  useEffect(() => {
    if (!cell) return;

    const syncData = () => {
      if (cell.isNode()) {
        const data = cell.getData() || {};
        setLocalData({
          name: data.name || '',
          manager: data.manager || '',
          color: data.color || '#2563eb',
          title: data.title || '',
          level: data.level || '',
          employees: Array.isArray(data.employees) ? data.employees.join(', ') : '',
          text: data.text || '',
          fontFamily: data.fontFamily || 'sans-serif',
          fontSize: data.fontSize || 14,
          fontWeight: data.fontWeight || 'normal',
        });
      } else if (cell.isEdge()) {
        const strokeDash = cell.getAttrByPath('line/strokeDasharray');
        const targetMarker = cell.getAttrByPath('line/targetMarker');
        const labels = cell.getLabels() || [];
        const labelText = labels[0]?.attrs?.text?.text || '';

        setLocalData({
          lineType: strokeDash === '5,5' ? 'dashed' : 'solid',
          arrowhead: (targetMarker && targetMarker !== 'none' && targetMarker !== null) ? 'block' : 'none',
          label: labelText,
        });
      }
    };

    syncData();

    // Subscribe to external mutations (undo/redo, layouts, etc.)
    if (cell.isNode()) {
      cell.on('change:data', syncData);
      return () => cell.off('change:data', syncData);
    } else if (cell.isEdge()) {
      cell.on('change:attrs', syncData);
      cell.on('change:labels', syncData);
      return () => {
        cell.off('change:attrs', syncData);
        cell.off('change:labels', syncData);
      };
    }
  }, [selectedCellId, cell]);

  const handleApplyBatchSize = () => {
    if (!graph) return;
    const nodes = selectedCellIds
      .map(id => graph.getCellById(id))
      .filter(cell => cell && cell.isNode());
    
    if (nodes.length > 0) {
      graph.startBatch('batch-resize');
      nodes.forEach(n => {
        n.setSize(batchWidth, batchHeight);
      });
      graph.stopBatch('batch-resize');
      if (onUpdate) onUpdate();
    }
  };

  const handleApplyBatchColor = (newColor) => {
    if (!graph) return;
    setBatchColor(newColor);
    const nodes = selectedCellIds
      .map(id => graph.getCellById(id))
      .filter(cell => cell && cell.isNode());
    
    if (nodes.length > 0) {
      graph.startBatch('batch-color');
      nodes.forEach(n => {
        const data = n.getData() || {};
        n.setData({ ...data, color: newColor });
      });
      graph.stopBatch('batch-color');
      if (onUpdate) onUpdate();
    }
  };

  const handleBatchDelete = () => {
    if (!graph) return;
    if (window.confirm(`确定要删除选中的 ${selectedCellIds.length} 个元素吗？`)) {
      const cells = selectedCellIds
        .map(id => graph.getCellById(id))
        .filter(Boolean);
      if (cells.length > 0) {
        graph.removeCells(cells);
        if (onUpdate) onUpdate();
      }
    }
  };

  if (isMultiple) {
    const selectedNodesCount = selectedCellIds
      .map(id => graph.getCellById(id))
      .filter(cell => cell && cell.isNode()).length;
    const selectedEdgesCount = selectedCellIds.length - selectedNodesCount;

    return (
      <div className="properties-panel-container">
        <div className="properties-panel-header">
          <div className="properties-panel-title">
            <span>👥 批量编辑 (Batch Edit)</span>
          </div>
          <div className="properties-panel-subtitle">
            已选中 {selectedCellIds.length} 个元素 ({selectedNodesCount} 个节点, {selectedEdgesCount} 条连线)
          </div>
        </div>

        <div className="properties-form-group">
          {selectedNodesCount > 0 && (
            <>
              {/* Batch Size Controls */}
              <div className="properties-field">
                <label className="properties-label" style={{ color: 'var(--accent-blue, #2563eb)' }}>批量调整节点尺寸</label>
                <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '2px' }}>宽度 (W)</div>
                    <input
                      type="number"
                      className="properties-input"
                      value={batchWidth}
                      onChange={(e) => setBatchWidth(parseInt(e.target.value) || 0)}
                      placeholder="宽度"
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '2px' }}>高度 (H)</div>
                    <input
                      type="number"
                      className="properties-input"
                      value={batchHeight}
                      onChange={(e) => setBatchHeight(parseInt(e.target.value) || 0)}
                      placeholder="高度"
                    />
                  </div>
                </div>
                <button
                  className="btn-action"
                  onClick={handleApplyBatchSize}
                  style={{
                    marginTop: '8px',
                    width: '100%',
                    justifyContent: 'center',
                    background: 'var(--accent-blue-light, #eff6ff)',
                    borderColor: 'var(--accent-blue-border, #bfdbfe)',
                    color: 'var(--accent-blue, #2563eb)',
                    fontWeight: '600',
                    fontSize: '11px',
                    padding: '6px 0'
                  }}
                >
                  应用尺寸到选中节点
                </button>
              </div>

              {/* Batch Color Controls */}
              <div className="properties-field" style={{ marginTop: '12px' }}>
                <label className="properties-label" style={{ color: 'var(--accent-blue, #2563eb)' }}>批量更改主题颜色</label>
                <div className="properties-color-picker-wrapper" style={{ marginTop: '4px' }}>
                  <input
                    type="color"
                    className="properties-color-picker"
                    value={batchColor}
                    onChange={(e) => handleApplyBatchColor(e.target.value)}
                  />
                  <input
                    type="text"
                    className="properties-input"
                    style={{ fontFamily: 'monospace' }}
                    value={batchColor}
                    onChange={(e) => handleApplyBatchColor(e.target.value)}
                    placeholder="#2563eb"
                  />
                </div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  提示: 颜色修改将应用于所有选中部门卡片的主色调
                </div>
              </div>
            </>
          )}

          <div style={{ margin: '16px 0', borderTop: '1px solid var(--border-color, #e2e8f0)' }} />

          {/* Batch Actions */}
          <div className="properties-field">
            <label className="properties-label">批量操作</label>
            <button
              className="btn-action btn-danger"
              onClick={handleBatchDelete}
              style={{
                width: '100%',
                justifyContent: 'center',
                fontWeight: '600',
                fontSize: '12px',
                padding: '8px 0',
                marginTop: '6px'
              }}
            >
              🗑️ 删除所有选中元素
            </button>
          </div>
        </div>
      </div>
    );
  }



  if (!selectedCellId || !graph || !cell) {
    return (
      <div className="properties-empty">
        <svg className="properties-empty-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6V4m0 2a2 2 0 100 3m0-3a2 2 0 110 3m-3.793-1.793a3 3 0 011.002-1.002m3.793 3V12m0 0l-3 3m3-3l3 3M4 12a8 8 0 018-8V2" />
        </svg>
        <p className="properties-empty-text">选择画布中的节点或连线<br />进行属性编辑</p>
      </div>
    );
  }

  const isNode = cell.isNode();
  const isEdge = cell.isEdge();
  const shape = cell.shape || cell.getProp('shape');

  // Handle immediate local input keypress updates (fast, isolated to state)
  const handleLocalChange = (field, value) => {
    setLocalData(prev => ({ ...prev, [field]: value }));
  };

  // Commit local state changes to X6 cell on blur (prevents full app re-renders during typing)
  const handleCommitNodeField = (field) => {
    const value = localData[field] || '';
    const updatedData = { ...(cell.getData() || {}) };

    if (field === 'employees') {
      const arr = value.split(',')
        .map(s => s.trim())
        .filter(Boolean);
      updatedData.employees = arr;
    } else {
      updatedData[field] = value;
    }

    cell.setData(updatedData);
    if (onUpdate) onUpdate();
  };

  // Immediate update for dropdowns/pickers (since clicks are infrequent)
  const handleImmediateNodeChange = (field, value) => {
    setLocalData(prev => ({ ...prev, [field]: value }));
    const updatedData = { ...(cell.getData() || {}) };
    updatedData[field] = value;
    cell.setData(updatedData);
    if (onUpdate) onUpdate();
  };

  const handleEdgeFieldChange = (field, value) => {
    setLocalData(prev => ({ ...prev, [field]: value }));

    if (field === 'lineType') {
      cell.setAttrByPath('line/strokeDasharray', value === 'dashed' ? '5,5' : 'none');
    } else if (field === 'arrowhead') {
      cell.setAttrByPath('line/targetMarker', value === 'block' ? { name: 'block', width: 8, height: 6 } : null);
    } else if (field === 'label') {
      cell.setLabels([{ attrs: { text: { text: value } } }]);
    }
    if (onUpdate) onUpdate();
  };

  return (
    <div className="properties-panel-container">
      <div className="properties-panel-header">
        <div className="properties-panel-title">
          <span>⚙️ 属性设置</span>
        </div>
        <div className="properties-panel-subtitle">
          ID: {selectedCellId.substring(0, 8)}... ({isNode ? '节点' : '连线'})
        </div>
      </div>

      <div className="properties-form-group">
        {isNode && (
          <>
            {shape === 'dept-node-react' && (
              <>
                <div className="properties-field">
                  <label className="properties-label">部门名称</label>
                  <input
                    type="text"
                    className="properties-input"
                    value={localData.name || ''}
                    onChange={(e) => handleLocalChange('name', e.target.value)}
                    onBlur={() => handleCommitNodeField('name')}
                    placeholder="输入部门名称"
                  />
                </div>
                <div className="properties-field">
                  <label className="properties-label">负责人</label>
                  <input
                    type="text"
                    className="properties-input"
                    value={localData.manager || ''}
                    onChange={(e) => handleLocalChange('manager', e.target.value)}
                    onBlur={() => handleCommitNodeField('manager')}
                    placeholder="输入负责人姓名"
                  />
                </div>
                <div className="properties-field">
                  <label className="properties-label">主题颜色</label>
                  <div className="properties-color-picker-wrapper">
                    <input
                      type="color"
                      className="properties-color-picker"
                      value={localData.color || '#2563eb'}
                      onChange={(e) => handleImmediateNodeChange('color', e.target.value)}
                    />
                    <input
                      type="text"
                      className="properties-input"
                      style={{ fontFamily: 'monospace' }}
                      value={localData.color || '#2563eb'}
                      onChange={(e) => handleLocalChange('color', e.target.value)}
                      onBlur={() => handleCommitNodeField('color')}
                    />
                  </div>
                </div>
              </>
            )}

            {shape === 'pos-node-react' && (
              <>
                <div className="properties-field">
                  <label className="properties-label">岗位名称</label>
                  <input
                    type="text"
                    className="properties-input"
                    value={localData.title || ''}
                    onChange={(e) => handleLocalChange('title', e.target.value)}
                    onBlur={() => handleCommitNodeField('title')}
                    placeholder="输入岗位名称"
                  />
                </div>
                <div className="properties-field">
                  <label className="properties-label">职级</label>
                  <input
                    type="text"
                    className="properties-input"
                    value={localData.level || ''}
                    onChange={(e) => handleLocalChange('level', e.target.value)}
                    onBlur={() => handleCommitNodeField('level')}
                    placeholder="例如: P6, P7"
                  />
                </div>
                <div className="properties-field">
                  <label className="properties-label">成员列表 (逗号分隔)</label>
                  <input
                    type="text"
                    className="properties-input"
                    value={localData.employees || ''}
                    onChange={(e) => handleLocalChange('employees', e.target.value)}
                    onBlur={() => handleCommitNodeField('employees')}
                    placeholder="例如: 张三, 李四"
                  />
                </div>
              </>
            )}

            {shape === 'person-node-react' && (
              <>
                <div className="properties-field">
                  <label className="properties-label">员工姓名</label>
                  <input
                    type="text"
                    className="properties-input"
                    value={localData.name || ''}
                    onChange={(e) => handleLocalChange('name', e.target.value)}
                    onBlur={() => handleCommitNodeField('name')}
                    placeholder="输入员工姓名"
                  />
                </div>
              </>
            )}

            {shape === 'text-node-react' && (
              <>
                <div className="properties-field">
                  <label className="properties-label">文本内容</label>
                  <input
                    type="text"
                    className="properties-input"
                    value={localData.text || ''}
                    onChange={(e) => handleLocalChange('text', e.target.value)}
                    onBlur={() => handleCommitNodeField('text')}
                    placeholder="输入自定义文字"
                  />
                </div>
                <div className="properties-field">
                  <label className="properties-label">字体 (Font Family)</label>
                  <select
                    className="properties-select"
                    value={localData.fontFamily || 'sans-serif'}
                    onChange={(e) => handleImmediateNodeChange('fontFamily', e.target.value)}
                  >
                    <option value="sans-serif">无衬线 (Sans-Serif / 默认)</option>
                    <option value="serif">衬线 (Serif)</option>
                    <option value="monospace">等宽 (Monospace)</option>
                    <option value="Microsoft YaHei">微软雅黑</option>
                    <option value="SimSun">宋体</option>
                    <option value="KaiTi">楷体</option>
                  </select>
                </div>
                <div className="properties-field">
                  <label className="properties-label">字号 (Size in px)</label>
                  <input
                    type="number"
                    className="properties-input"
                    value={localData.fontSize || 14}
                    onChange={(e) => handleLocalChange('fontSize', parseInt(e.target.value) || 14)}
                    onBlur={() => handleCommitNodeField('fontSize')}
                    placeholder="例如: 12, 14, 16, 20"
                  />
                </div>
                <div className="properties-field">
                  <label className="properties-label">字形 (Weight / Style)</label>
                  <select
                    className="properties-select"
                    value={localData.fontWeight || 'normal'}
                    onChange={(e) => handleImmediateNodeChange('fontWeight', e.target.value)}
                  >
                    <option value="normal">常规 (Normal)</option>
                    <option value="bold">加粗 (Bold)</option>
                    <option value="italic">斜体 (Italic)</option>
                  </select>
                </div>
                <div className="properties-field">
                  <label className="properties-label">文本颜色</label>
                  <div className="properties-color-picker-wrapper">
                    <input
                      type="color"
                      className="properties-color-picker"
                      value={localData.color || '#0f172a'}
                      onChange={(e) => handleImmediateNodeChange('color', e.target.value)}
                    />
                    <input
                      type="text"
                      className="properties-input"
                      style={{ fontFamily: 'monospace' }}
                      value={localData.color || '#0f172a'}
                      onChange={(e) => handleLocalChange('color', e.target.value)}
                      onBlur={() => handleCommitNodeField('color')}
                    />
                  </div>
                </div>
              </>
            )}

            {shape !== 'dept-node-react' && shape !== 'pos-node-react' && shape !== 'person-node-react' && shape !== 'text-node-react' && (
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                未知节点类型: {shape}
              </div>
            )}
          </>
        )}

        {isEdge && (
          <>
            <div className="properties-field">
              <label className="properties-label">线条类型</label>
              <select
                className="properties-select"
                value={localData.lineType || 'solid'}
                onChange={(e) => handleEdgeFieldChange('lineType', e.target.value)}
              >
                <option value="solid">实线 (Solid)</option>
                <option value="dashed">虚线 (Dashed)</option>
              </select>
            </div>

            <div className="properties-field">
              <label className="properties-label">箭头设置</label>
              <select
                className="properties-select"
                value={localData.arrowhead || 'none'}
                onChange={(e) => handleEdgeFieldChange('arrowhead', e.target.value)}
              >
                <option value="none">无 (None)</option>
                <option value="block">带箭头 (Arrowhead)</option>
              </select>
            </div>

            <div className="properties-field">
              <label className="properties-label">关系标签</label>
              <input
                type="text"
                className="properties-input"
                value={localData.label || ''}
                onChange={(e) => handleLocalChange('label', e.target.value)}
                onBlur={() => handleEdgeFieldChange('label', localData.label)}
                placeholder="输入连线上的文字标签"
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
