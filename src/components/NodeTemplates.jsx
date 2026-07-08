import React, { useState, useEffect, useRef } from 'react';

// Reusable inline-editable text component
function EditableText({ value, onSave, placeholder, style }) {
  const [isEditing, setIsEditing] = useState(false);
  const [localValue, setLocalValue] = useState(value);
  const inputRef = useRef(null);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      setIsEditing(false);
      onSave(localValue);
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setLocalValue(value);
    }
  };

  const handleBlur = () => {
    setIsEditing(false);
    onSave(localValue);
  };

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        type="text"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        style={{
          width: '100%',
          boxSizing: 'border-box',
          padding: '2px 4px',
          fontSize: 'inherit',
          fontFamily: 'inherit',
          fontWeight: 'inherit',
          color: 'inherit',
          border: '1px solid var(--accent-blue, #2563eb)',
          borderRadius: '4px',
          outline: 'none',
          background: '#fff',
          ...style
        }}
      />
    );
  }

  return (
    <div
      onDoubleClick={(e) => {
        e.stopPropagation(); // Prevent canvas zoom/drag on dblclick
        setIsEditing(true);
      }}
      title="双击进行编辑"
      style={{
        cursor: 'text',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        minWidth: '20px',
        minHeight: '1.2em',
        ...style
      }}
    >
      {value || placeholder || ' '}
    </div>
  );
}

export function DeptNode({ node }) {
  const data = node.getData() || {};
  const accent = data.color || '#2563eb';

  const handleSave = (field, val) => {
    node.setData({ ...data, [field]: val });
  };

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
      <EditableText
        value={data.name || ''}
        placeholder="双击编辑部门"
        onSave={(val) => handleSave('name', val)}
        style={{ fontWeight: 'bold', marginTop: '4px', fontSize: '13px', color: 'var(--text-primary, #0f172a)' }}
      />
      <div style={{ fontSize: '11px', color: 'var(--text-secondary, #475569)', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
        <span>负责人:</span>
        <EditableText
          value={data.manager || ''}
          placeholder="无"
          onSave={(val) => handleSave('manager', val)}
          style={{ flex: 1, fontSize: '11px' }}
        />
      </div>
    </div>
  );
}

export function PosNode({ node }) {
  const data = node.getData() || {};
  const employees = data.employees || [];

  const handleSave = (field, val) => {
    if (field === 'employees') {
      const arr = val.split(',')
        .map(s => s.trim())
        .filter(Boolean);
      node.setData({ ...data, employees: arr });
    } else {
      node.setData({ ...data, [field]: val });
    }
  };

  return (
    <div style={{
      background: 'var(--bg-panel, #ffffff)',
      border: '1px solid var(--border-color, #e2e8f0)',
      borderRadius: '8px',
      padding: '12px',
      width: '100%',
      height: '100%',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
      boxSizing: 'border-box'
    }}>
      <div style={{ fontSize: '10px', color: 'var(--text-secondary, #64748b)', fontWeight: 'bold' }}>岗位 (POSITION)</div>
      <EditableText
        value={data.title || ''}
        placeholder="双击编辑岗位"
        onSave={(val) => handleSave('title', val)}
        style={{ fontWeight: 'bold', marginTop: '4px', fontSize: '12px', color: 'var(--text-primary, #0f172a)' }}
      />
      <div style={{ fontSize: '10px', color: 'var(--text-muted, #94a3b8)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
        <span>等级:</span>
        <EditableText
          value={data.level || ''}
          placeholder="P-"
          onSave={(val) => handleSave('level', val)}
          style={{ flex: 1, fontSize: '10px' }}
        />
      </div>
      <div style={{ borderTop: '1px solid var(--border-color, #f1f5f9)', marginTop: '8px', paddingTop: '6px' }}>
        <div style={{ fontSize: '11px', color: 'var(--text-secondary, #475569)', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span>成员:</span>
          <EditableText
            value={employees.join(', ')}
            placeholder="暂无"
            onSave={(val) => handleSave('employees', val)}
            style={{ flex: 1, fontSize: '11px' }}
          />
        </div>
      </div>
    </div>
  );
}

export function PersonNode({ node }) {
  const data = node.getData() || {};

  const handleSave = (val) => {
    node.setData({ ...data, name: val });
  };

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
      <EditableText
        value={data.name || ''}
        placeholder="双击编辑姓名"
        onSave={handleSave}
        style={{ fontSize: '12px', fontWeight: '500', color: 'var(--accent-blue-text, #1e3a8a)', flex: 1 }}
      />
    </div>
  );
}
