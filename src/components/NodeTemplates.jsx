import React, { useState, useEffect } from 'react';

const inputStyle = {
  width: '100%',
  boxSizing: 'border-box',
  padding: '4px 6px',
  fontSize: '16px',
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
  const [data, setData] = useState(() => node.getData() || {});

  useEffect(() => {
    const handleDataChange = () => {
      setData({ ...(node.getData() || {}) });
    };
    node.on('change:data', handleDataChange);
    return () => {
      node.off('change:data', handleDataChange);
    };
  }, [node]);

  const accent = data.color || '#3b3e45';
  const members = data.members || [];
  const isExpanded = data.isExpanded || false;

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      node.setData({ ...data, isEditing: false });
    }
  };

  const handleInputChange = (field, value) => {
    node.setData({ ...data, [field]: value });
  };

  const COLLAPSED_HEIGHT = 120;

  const handleToggleExpand = (e) => {
    e.stopPropagation();
    const nextExpanded = !isExpanded;
    if (nextExpanded) {
      node.toFront();
    }
    node.setData({ ...data, isExpanded: nextExpanded }, { overwrite: true });
  };

  const handleRemoveMember = (idx, e) => {
    e.stopPropagation();
    // Read name for confirm dialog from current closure (safe to read before confirm)
    const memberName = members[idx]?.name || '该成员';
    if (!window.confirm(`确定要从部门中移除「${memberName}」吗？`)) return;
    // Re-fetch fresh data AFTER confirm returns, to avoid stale-closure overwriting
    const freshData = node.getData() || {};
    const freshMembers = freshData.members || [];
    const updatedMembers = freshMembers.filter((_, i) => i !== idx);
    const nextData = { ...freshData, members: updatedMembers };
    if (updatedMembers.length === 0) {
      nextData.isExpanded = false;
    }
    node.setData(nextData, { overwrite: true });
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
    <div 
      title={data.name || '未命名部门'}
      style={{
      background: 'var(--bg-panel, #ffffff)',
      border: `1px solid ${accent}`,
      borderRadius: '8px',
      padding: '12px',
      width: '100%',
      height: '100%',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
      borderTop: `4px solid ${accent}`,
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative'
    }}>
      {/* Dept Name — full width, uncompressed */}
      <div style={{ fontWeight: 'bold', fontSize: '23px', color: 'var(--text-primary, #0f172a)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {data.name || '未命名部门'}
      </div>

      {/* Manager + member badge on same row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
        <div style={{ fontSize: '18px', color: 'var(--text-secondary, #475569)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
          负责人: {data.manager || '无'}
        </div>
        {members.length > 0 && (
          <div style={{ 
            fontSize: '16px', 
            background: members.length >= 30 ? '#fecaca' : '#f1f5f9', 
            color: members.length >= 30 ? '#991b1b' : 'var(--text-muted, #94a3b8)',
            padding: '1px 5px',
            borderRadius: '10px',
            fontWeight: '500',
            marginLeft: '4px',
            flexShrink: 0
          }}>
            {members.length}/30
          </div>
        )}
      </div>

      {/* Expanded Member List Section - Floating Window */}
      {isExpanded && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: '0',
          width: '100%',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(4px)',
          border: `1px solid ${accent}`,
          borderRadius: '8px',
          padding: '12px',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
          zIndex: 1000,
          marginTop: '8px',
          boxSizing: 'border-box'
        }}>
          <div style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-secondary, #475569)', marginBottom: '8px' }}>
            部门人员列表：
          </div>

          <div style={{
            overflowY: 'auto',
            maxHeight: '200px',
            paddingRight: '4px',
            fontSize: '18px',
            color: 'var(--text-primary, #0f172a)'
          }}
          className="scrollbar-minimal"
          {...inputEventBlockers}
          >
            {members.length === 0 ? (
              <div style={{ color: 'var(--text-muted, #94a3b8)', fontStyle: 'italic', padding: '4px 0' }}>暂无人员</div>
            ) : (
              members.map((m, idx) => (
                <div key={idx} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '6px 0',
                  borderBottom: '1px dashed #e2e8f0'
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', minWidth: 0, flex: 1 }}>
                    <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: accent, flexShrink: 0, marginTop: '8px' }} />
                    <span style={{ fontWeight: '500', wordBreak: 'break-word' }}>{m.name}</span>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted, #94a3b8)', wordBreak: 'break-word', marginTop: '3px' }}>({m.level || '未设'})</span>
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleRemoveMember(idx, e); }}
                    onPointerDown={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                    style={{
                      border: 'none',
                      background: 'none',
                      color: '#94a3b8',
                      cursor: 'pointer',
                      fontSize: '18px',
                      lineHeight: '1',
                      padding: '0 4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'color 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}
                    title="移除人员"
                  >
                    ×
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Expand/Collapse Toggle Button — only shown when there are members */}
      {members.length > 0 && (
        <div 
          {...inputEventBlockers}
          style={{
            position: 'absolute',
            bottom: '4px',
            left: '0',
            right: '0',
            display: 'flex',
            justifyContent: 'center'
          }}
        >
          <button
            onClick={handleToggleExpand}
            style={{
              border: '1px solid var(--border-color, #e2e8f0)',
              background: 'var(--bg-panel, #ffffff)',
              color: 'var(--text-secondary, #475569)',
              borderRadius: '10px',
              fontSize: '9px',
              padding: '2px 8px',
              cursor: 'pointer',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '2px',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
              outline: 'none',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = accent;
              e.currentTarget.style.color = accent;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-color, #e2e8f0)';
              e.currentTarget.style.color = 'var(--text-secondary, #475569)';
            }}
          >
            {isExpanded ? '▲ 收起人员' : '▼ 展开人员'}
          </button>
        </div>
      )}
    </div>
  );
}

export function PosNode({ node }) {
  const [data, setData] = useState(() => node.getData() || {});

  useEffect(() => {
    const handleDataChange = () => {
      setData({ ...(node.getData() || {}) });
    };
    node.on('change:data', handleDataChange);
    return () => {
      node.off('change:data', handleDataChange);
    };
  }, [node]);

  const accent = data.color || '#3b3e45';
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
          border: `1px solid ${accent}`,
          borderRadius: '8px',
          padding: '6px',
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
          value={data.title || ''}
          onChange={(e) => handleInputChange('title', e.target.value)}
          placeholder="岗位名称"
          style={inputStyle}
          autoFocus
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
    <div 
      title={data.title || '新岗位'}
      style={{
      background: 'var(--bg-panel, #ffffff)',
      border: `1px solid ${accent}`,
      borderRadius: '8px',
      padding: '10px 12px',
      width: '100%',
      height: '100%',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      borderTop: `4px solid ${accent}`
    }}>
      <div>

        <div style={{ fontWeight: 'bold', marginTop: '2px', fontSize: '22px', color: 'var(--text-primary, #0f172a)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {data.title || '新岗位'}
        </div>

      </div>
      <div style={{ borderTop: '1px solid var(--border-color, #f1f5f9)', paddingTop: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        <div style={{ fontSize: '18px', color: 'var(--text-secondary, #475569)' }}>
          成员: {employees.length > 0 ? employees.join(', ') : '暂无'}
        </div>
      </div>
    </div>
  );
}

export function PersonNode({ node }) {
  const [data, setData] = useState(() => node.getData() || {});

  useEffect(() => {
    const handleDataChange = () => {
      setData({ ...(node.getData() || {}) });
    };
    node.on('change:data', handleDataChange);
    return () => {
      node.off('change:data', handleDataChange);
    };
  }, [node]);

  const accent = data.color || '#3b3e45';

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
          background: accent + '12',
          border: `1px solid ${accent}40`,
          borderRadius: '20px',
          padding: '2px 8px',
          width: '100%',
          height: '100%',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: '2px'
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
        <div style={{ display: 'flex', gap: '4px' }}>
          <input
            type="text"
            value={data.rank || ''}
            onChange={(e) => node.setData({ ...data, rank: e.target.value })}
            placeholder="职级"
            style={{
              ...inputStyle,
              padding: '2px 4px',
              fontSize: '10px',
              borderRadius: '8px',
              border: '1px solid #bfdbfe',
              width: '50%'
            }}
          />
          <input
            type="text"
            value={data.level || ''}
            onChange={(e) => node.setData({ ...data, level: e.target.value })}
            placeholder="等级"
            style={{
              ...inputStyle,
              padding: '2px 4px',
              fontSize: '10px',
              borderRadius: '8px',
              border: '1px solid #bfdbfe',
              width: '50%'
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div 
      title={data.name || '员工'}
      style={{
      background: accent + '12',
      border: `1px solid ${accent}40`,
      borderRadius: '20px',
      padding: '6px 14px',
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
      boxSizing: 'border-box'
    }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <div style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          backgroundColor: accent,
          marginRight: '8px',
          flexShrink: 0
        }} />
        <div style={{ fontSize: '12px', fontWeight: 'bold', color: accent, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {data.name || '匿名人员'}
        </div>
      </div>
      <div style={{ fontSize: '10px', color: 'var(--text-secondary, #475569)', marginTop: '4px', paddingLeft: '16px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        职级: {data.rank || '-'} | 等级: {data.level || '-'}
      </div>
    </div>
  );
}

export function TextNode({ node }) {
  const [data, setData] = useState(() => node.getData() || {});

  useEffect(() => {
    const handleDataChange = () => {
      setData({ ...(node.getData() || {}) });
    };
    node.on('change:data', handleDataChange);
    return () => {
      node.off('change:data', handleDataChange);
    };
  }, [node]);

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
