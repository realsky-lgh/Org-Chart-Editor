import React from 'react';
import { Network, Briefcase, User } from 'lucide-react';

export default function Sidebar() {
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
    </div>
  );
}
