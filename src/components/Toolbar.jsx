import React, { useRef } from 'react';
import { Download, Upload, Image, FileText, Printer, Trash2, RefreshCw, ZoomIn, ZoomOut, Maximize } from 'lucide-react';

export default function Toolbar({
  onImportJSON,
  onExportJSON,
  onExportPNG,
  onExportSVG,
  onExportPDF,
  onClearCanvas,
  onAutoLayout,
  onZoomIn,
  onZoomOut,
  onZoomToFit,
}) {
  const fileInputRef = useRef(null);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target.result);
        // Basic schema validation
        if (!json || (!Array.isArray(json.cells) && !json.nodes)) {
          throw new Error('无效的架构图数据格式，未包含 cells 拓扑结构。');
        }
        onImportJSON(json);
      } catch (err) {
        alert('导入失败，无效的 JSON 文件：' + err.message);
      }
    };
    reader.readAsText(file);
    // Reset file input value to allow importing the same file again
    e.target.value = '';
  };

  return (
    <div className="toolbar-container">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".json"
        style={{ display: 'none' }}
      />
      
      <div className="toolbar-group">
        <button
          className="btn-action"
          onClick={handleImportClick}
          title="导入 JSON"
        >
          <Upload size={16} />
          <span>导入</span>
        </button>
        <button
          className="btn-action"
          onClick={onExportJSON}
          title="导出 JSON"
        >
          <Download size={16} />
          <span>导出 JSON</span>
        </button>
      </div>

      <div className="toolbar-divider" />

      <div className="toolbar-group">
        <button
          className="btn-action"
          onClick={onExportPNG}
          title="导出 PNG 图片"
        >
          <Image size={16} />
          <span>PNG</span>
        </button>
        <button
          className="btn-action"
          onClick={onExportSVG}
          title="导出 SVG 矢量图"
        >
          <FileText size={16} />
          <span>SVG</span>
        </button>
        <button
          className="btn-action"
          onClick={onExportPDF}
          title="导出 PDF / 打印"
        >
          <Printer size={16} />
          <span>PDF / 打印</span>
        </button>
      </div>

      <div className="toolbar-divider" />

      <div className="toolbar-group">
        <button
          className="btn-action"
          onClick={() => onAutoLayout?.('TB')}
          title="整理 (垂直)"
        >
          <RefreshCw size={16} />
          <span>整理 (垂直)</span>
        </button>
        <button
          className="btn-action"
          onClick={() => onAutoLayout?.('LR')}
          title="整理 (横向)"
        >
          <RefreshCw size={16} />
          <span>整理 (横向)</span>
        </button>
      </div>

      <div className="toolbar-divider" />

      <div className="toolbar-group">
        <button
          className="btn-action"
          onClick={onZoomIn}
          title="放大视野"
        >
          <ZoomIn size={16} />
          <span>放大</span>
        </button>
        <button
          className="btn-action"
          onClick={onZoomOut}
          title="缩小视野"
        >
          <ZoomOut size={16} />
          <span>缩小</span>
        </button>
        <button
          className="btn-action"
          onClick={onZoomToFit}
          title="自适应画布大小"
        >
          <Maximize size={16} />
          <span>自适应</span>
        </button>
      </div>

      <div className="toolbar-divider" />

      <div className="toolbar-group">
        <button
          className="btn-action btn-danger"
          onClick={onClearCanvas}
          title="清空画布"
        >
          <Trash2 size={16} />
          <span>清空</span>
        </button>
      </div>
    </div>
  );
}
