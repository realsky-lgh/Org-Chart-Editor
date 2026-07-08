import React from 'react';

const inputStyle = {
  width: '100%',
  boxSizing: 'border-box',
  padding: '4px 6px',
  fontSize: '11px',
  border: '1px solid #cbd5e1',
  borderRadius: '4px',
  outline: 'none',
  fontFamily: 'inherit',
  background: '#ffffff',
  color: '#0f172a'
};

// Common event blocker to allow default HTML input behaviors (focus, select, drag text) inside X6 React nodes
const inputEventBlockers = {
  onDoubleClick: (e) => e.stopPropagation(),
  onMouseDown: (e) => e.stopPropagation(),
  onMouseUp: (e) => e.stopPropagation(),
  onPointerDown: (e) => e.stopPropagation(),
  onPointerUp: (e) => e.stopPropagation(),
  onClick: (e) => e.stopPropagation()
};

export function DeptNode({ node }) {
  const data = node.getData() || {};
  const accent = data.color || '#2563eb';

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      node.setData({ ...data, isEditing: false });
    }
  };

  const handleInputChange = (field, value) => {
    node.setData({ ...data, [field]: value });
  };

  if (data.isEditing) {
    return (
      <div 
        {...inputEventBlockers}
        onKeyDown={handleKeyDown}
        style={{
          background: '#ffffff',
          border: `1px solid ${accent}`,
          borderRadius: '8px',
          padding: '8px',
          width: '100%',
          height: '100%',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          borderTop: `4px solid ${accent}`
        }}
      >
        <input
          type="text"
          value={data.name || ''}
          onChange={(e) => handleInputChange('name', e.target.value)}
          placeholder="部门名称"
          style={inputStyle}
          autoFocus
        />
        <input
          type="text"
          value={data.manager || ''}
          onChange={(e) => handleInputChange('manager', e.target.value)}
          placeholder="负责人"
          style={inputStyle}
        />
      </div>
    );
  }

  return (
    <div style={{
      background: 'var(--bg-panel, #ffffff)',
      border: `1px solid ${accent}`,
      borderRadius: '8px',
      padding: '12px',
      width: '100%',
      height: '100%',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
      borderTop: `4px solid ${accent}`,
      boxSizing: 'border-box'
    }}>
      <div style={{ fontSize: '10px', color: 'var(--text-secondary, #64748b)', fontWeight: 'bold' }}>部门 (DEPARTMENT)</div>
      <div style={{ fontWeight: 'bold', marginTop: '4px', fontSize: '13px', color: 'var(--text-primary, #0f172a)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {data.name || '未命名部门'}
      </div>
      <div style={{ fontSize: '11px', color: 'var(--text-secondary, #475569)', marginTop: '6px' }}>
        负责人: {data.manager || '无'}
      </div>
    </div>
  );
}

export function PosNode({ node }) {
  const data = node.getData() || {};
  const employees = data.employees || [];

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      node.setData({ ...data, isEditing: false });
    }
  };

  const handleInputChange = (field, value) => {
    if (field === 'employees') {
      const arr = value.split(',')
        .map(s => s.trim())
        .filter(Boolean);
      node.setData({ ...data, employees: arr });
    } else {
      node.setData({ ...data, [field]: value });
    }
  };

  if (data.isEditing) {
    return (
      <div 
        {...inputEventBlockers}
        onKeyDown={handleKeyDown}
        style={{
          background: '#ffffff',
          border: '1px solid var(--accent-blue, #2563eb)',
          borderRadius: '8px',
          padding: '6px',
          width: '100%',
          height: '100%',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}
      >
        <input
          type="text"
          value={data.title || ''}
          onChange={(e) => handleInputChange('title', e.target.value)}
          placeholder="岗位名称"
          style={inputStyle}
          autoFocus
        />
        <input
          type="text"
          value={data.level || ''}
          onChange={(e) => handleInputChange('level', e.target.value)}
          placeholder="职级 (P6/P7)"
          style={inputStyle}
        />
        <input
          type="text"
          value={employees.join(', ')}
          onChange={(e) => handleInputChange('employees', e.target.value)}
          placeholder="成员列表 (逗号分隔)"
          style={inputStyle}
        />
      </div>
    );
  }

  return (
    <div style={{
      background: 'var(--bg-panel, #ffffff)',
      border: '1px solid var(--border-color, #e2e8f0)',
      borderRadius: '8px',
      padding: '10px 12px',
      width: '100%',
      height: '100%',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between'
    }}>
      <div>
        <div style={{ fontSize: '9px', color: 'var(--text-secondary, #64748b)', fontWeight: 'bold' }}>岗位 (POSITION)</div>
        <div style={{ fontWeight: 'bold', marginTop: '2px', fontSize: '12px', color: 'var(--text-primary, #0f172a)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {data.title || '新岗位'}
        </div>
        <div style={{ fontSize: '10px', color: 'var(--text-muted, #94a3b8)', marginTop: '1px' }}>等级: {data.level || 'P-'}</div>
      </div>
      <div style={{ borderTop: '1px solid var(--border-color, #f1f5f9)', paddingTop: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        <div style={{ fontSize: '11px', color: 'var(--text-secondary, #475569)' }}>
          成员: {employees.length > 0 ? employees.join(', ') : '暂无'}
        </div>
      </div>
    </div>
  );
}

export function PersonNode({ node }) {
  const data = node.getData() || {};

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      node.setData({ ...data, isEditing: false });
    }
  };

  const handleInputChange = (value) => {
    node.setData({ ...data, name: value });
  };

  if (data.isEditing) {
    return (
      <div 
        {...inputEventBlockers}
        onKeyDown={handleKeyDown}
        style={{
          background: 'var(--accent-blue-light, #eff6ff)',
          border: '1px solid var(--accent-blue-border, #bfdbfe)',
          borderRadius: '20px',
          padding: '2px 8px',
          width: '100%',
          height: '100%',
          boxSizing: 'border-box',
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <input
          type="text"
          value={data.name || ''}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder="员工姓名"
          style={{
            ...inputStyle,
            padding: '2px 6px',
            fontSize: '11px',
            borderRadius: '12px',
            border: '1px solid #bfdbfe'
          }}
          autoFocus
        />
      </div>
    );
  }

  return (
    <div style={{
      background: 'var(--accent-blue-light, #eff6ff)',
      border: '1px solid var(--accent-blue-border, #bfdbfe)',
      borderRadius: '20px',
      padding: '6px 14px',
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
      boxSizing: 'border-box'
    }}>
      <div style={{
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        backgroundColor: 'var(--accent-blue, #2563eb)',
        marginRight: '8px',
        flexShrink: 0
      }} />
      <div style={{ fontSize: '12px', fontWeight: '500', color: 'var(--accent-blue-text, #1e3a8a)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {data.name || '匿名人员'}
      </div>
    </div>
  );
}

export function TextNode({ node }) {
  const data = node.getData() || {};
  const fontFamily = data.fontFamily || 'sans-serif';
  const fontSize = data.fontSize || 14;
  const fontWeight = data.fontWeight || 'normal';
  const color = data.color || '#0f172a';

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      node.setData({ ...data, isEditing: false });
    }
  };

  if (data.isEditing) {
    return (
      <div 
        {...inputEventBlockers}
        onKeyDown={handleKeyDown}
        style={{
          width: '100%',
          height: '100%',
          boxSizing: 'border-box',
          padding: '4px'
        }}
      >
        <input
          type="text"
          value={data.text || ''}
          onChange={(e) => node.setData({ ...data, text: e.target.value })}
          placeholder="输入文本"
          style={{
            ...inputStyle,
            height: '100%',
            fontFamily,
            fontSize: `${fontSize}px`,
            fontWeight,
            color
          }}
          autoFocus
        />
      </div>
    );
  }

  return (
    <div style={{
      width: '100%',
      height: '100%',
      boxSizing: 'border-box',
      padding: '4px 8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily,
      fontSize: `${fontSize}px`,
      fontWeight,
      color,
      wordBreak: 'break-all',
      overflow: 'hidden',
      textAlign: 'center',
      userSelect: 'none'
    }}>
      {data.text || '双击编辑文本'}
    </div>
  );
}
