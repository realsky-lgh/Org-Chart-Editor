import React from 'react';
import { Network, Briefcase, User, Save, FolderOpen, Trash2 } from 'lucide-react';

export default function Sidebar({
  versions = [],
  onLoadVersion,
  onDeleteVersion,
  onSaveVersion,
}) {
  const handleDragStart = (e, type) => {
    e.dataTransfer.setData('node-type', type);
  };

  const stencilItems = [
    {
      type: 'dept',
      title: '部门卡片',
      description: '用于构建组织架构中的部门单元',
      icon: Network,
      preview: (
        <div className="mini-preview mini-dept">
          <div className="mini-dept-header"></div>
          <span className="mini-label">部门</span>
          <div className="mini-title-bar"></div>
          <div className="mini-sub-bar"></div>
        </div>
      )
    },
    {
      type: 'pos',
      title: '岗位卡片',
      description: '用于定义部门下的具体职务岗位',
      icon: Briefcase,
      preview: (
        <div className="mini-preview mini-pos">
          <span className="mini-label">岗位</span>
          <div className="mini-title-bar"></div>
          <div className="mini-sub-bar"></div>
        </div>
      )
    },
    {
      type: 'person',
      title: '人员标签',
      description: '表示具体的员工，可拖入岗位或独立存在',
      icon: User,
      preview: (
        <div className="mini-preview mini-person">
          <span className="mini-dot"></span>
          <span className="mini-text">人员</span>
        </div>
      )
    }
  ];

  return (
    <div className="sidebar-content">
      <div className="sidebar-title">组件库</div>
      <div className="sidebar-subtitle">拖拽组件到画布以添加元素</div>
      
      <div className="stencil-list">
        {stencilItems.map((item) => {
          const IconComponent = item.icon;
          return (
            <div
              key={item.type}
              className="stencil-item"
              draggable
              onDragStart={(e) => handleDragStart(e, item.type)}
            >
              <div className="stencil-item-header">
                <IconComponent className="stencil-item-icon" />
                <span className="stencil-item-title">{item.title}</span>
              </div>
              <p className="stencil-item-desc">{item.description}</p>
              <div className="mini-preview-container">
                {item.preview}
              </div>
            </div>
          );
        })}
      </div>

      <div className="sidebar-divider" style={{ margin: '24px 0 16px 0', borderTop: '1px solid var(--border-color, #e2e8f0)' }} />

      <div className="sidebar-title">版本管理</div>
      <div className="sidebar-subtitle">保存当前进度或载入历史版本</div>

      <button
        className="btn-action"
        onClick={() => onSaveVersion?.()}
        style={{
          width: '100%',
          justifyContent: 'center',
          marginBottom: '16px',
          background: 'var(--accent-blue-light, #eff6ff)',
          borderColor: 'var(--accent-blue-border, #bfdbfe)',
          color: 'var(--accent-blue, #2563eb)',
          fontWeight: '600'
        }}
      >
        <Save size={15} style={{ color: 'var(--accent-blue, #2563eb)' }} />
        <span>保存当前版本</span>
      </button>

      <div 
        className="version-list" 
        style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '10px', 
          maxHeight: 'calc(100vh - 520px)', 
          overflowY: 'auto',
          paddingRight: '4px'
        }}
      >
        {versions.length === 0 ? (
          <div style={{ fontSize: '12px', color: 'var(--text-muted, #94a3b8)', textAlign: 'center', padding: '20px 0' }}>
            暂无历史保存的版本
          </div>
        ) : (
          versions.map((v) => (
            <div 
              key={v.id} 
              style={{
                padding: '10px',
                border: '1px solid var(--border-color, #e2e8f0)',
                borderRadius: '6px',
                background: 'var(--bg-panel, #ffffff)',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
              }}
            >
              <div style={{ 
                fontWeight: '600', 
                fontSize: '12px', 
                color: 'var(--text-primary, #0f172a)',
                wordBreak: 'break-all',
                lineHeight: '1.4'
              }}>
                {v.name}
              </div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted, #94a3b8)' }}>
                {v.timestamp}
              </div>
              <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
                <button
                  onClick={() => onLoadVersion?.(v)}
                  style={{
                    flex: 1,
                    padding: '4px 6px',
                    fontSize: '11px',
                    fontWeight: '500',
                    background: '#f8fafc',
                    border: '1px solid var(--border-color, #e2e8f0)',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    color: 'var(--accent-blue, #2563eb)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px'
                  }}
                >
                  <FolderOpen size={11} />
                  <span>载入</span>
                </button>
                <button
                  onClick={() => onDeleteVersion?.(v.id)}
                  style={{
                    padding: '4px 6px',
                    fontSize: '11px',
                    fontWeight: '500',
                    background: '#fef2f2',
                    border: '1px solid #fca5a5',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    color: '#dc2626',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px'
                  }}
                >
                  <Trash2 size={11} />
                  <span>删除</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
