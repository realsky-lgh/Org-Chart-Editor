import React from 'react';

export function DeptNode({ node }) {
  const data = node.getData() || {};
  const accent = data.color || '#2563eb';
  return (
    <div style={{
      background: 'var(--bg-panel, #ffffff)',
      border: `1px solid ${accent}`,
      borderRadius: '8px',
      padding: '12px',
      width: '180px',
      height: '90px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
      borderTop: `4px solid ${accent}`,
      boxSizing: 'border-box'
    }}>
      <div style={{ fontSize: '10px', color: 'var(--text-secondary, #64748b)', fontWeight: 'bold' }}>部门 (DEPARTMENT)</div>
      <div style={{ fontWeight: 'bold', marginTop: '4px', fontSize: '13px', color: 'var(--text-primary, #0f172a)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{data.name || '未命名部门'}</div>
      <div style={{ fontSize: '11px', color: 'var(--text-secondary, #475569)', marginTop: '6px' }}>负责人: {data.manager || '无'}</div>
    </div>
  );
}

export function PosNode({ node }) {
  const data = node.getData() || {};
  const employees = data.employees || [];
  return (
    <div style={{
      background: 'var(--bg-panel, #ffffff)',
      border: '1px solid var(--border-color, #e2e8f0)',
      borderRadius: '8px',
      padding: '12px',
      width: '180px',
      height: '100px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
      boxSizing: 'border-box'
    }}>
      <div style={{ fontSize: '10px', color: 'var(--text-secondary, #64748b)', fontWeight: 'bold' }}>岗位 (POSITION)</div>
      <div style={{ fontWeight: 'bold', marginTop: '4px', fontSize: '12px', color: 'var(--text-primary, #0f172a)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{data.title || '新岗位'}</div>
      <div style={{ fontSize: '10px', color: 'var(--text-muted, #94a3b8)' }}>等级: {data.level || 'P-'}</div>
      <div style={{ borderTop: '1px solid var(--border-color, #f1f5f9)', marginTop: '8px', paddingTop: '6px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        <div style={{ fontSize: '11px', color: 'var(--text-secondary, #475569)' }}>成员: {employees.length > 0 ? employees.join(', ') : '暂无'}</div>
      </div>
    </div>
  );
}

export function PersonNode({ node }) {
  const data = node.getData() || {};
  return (
    <div style={{
      background: 'var(--accent-blue-light, #eff6ff)',
      border: '1px solid var(--accent-blue-border, #bfdbfe)',
      borderRadius: '20px',
      padding: '6px 14px',
      width: '130px',
      height: '36px',
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
      <div style={{ fontSize: '12px', fontWeight: '500', color: 'var(--accent-blue-text, #1e3a8a)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{data.name || '匿名人员'}</div>
    </div>
  );
}
