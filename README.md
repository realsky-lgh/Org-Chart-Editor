# 组织结构图编辑器 (Org Chart Editor)

一个基于 React 和 AntV X6 构建的现代化、交互式企业组织架构图编辑工具。提供流畅的拖拽连线体验，支持高清矢量图导出，适用于 HR 管理、企业架构规划及团队可视化展示。

## ✨ 核心特性

- **现代化的 UI 交互**：支持无级缩放、画布拖拽、小地图导航以及智能对齐网格。
- **丰富的节点类型**：内置专属定制的“部门节点”、“岗位节点”以及“人员节点”，信息呈现层次分明。
- **智能连线与操作**：支持节点间快速连线、正交路由（自动避障拐弯）、连线长度与样式属性自定义。
- **强大的导出能力**：
  - 高清 **PDF** 导出（基于 Canvas 和 jsPDF 的超高分辨率输出，打印不失真）。
  - 支持导出为 **PNG** 图片和 **SVG** 矢量图。
  - 支持导出 / 导入工程 **JSON** 文件，方便数据的备份与分享。
- **本地持久化与版本控制**：修改实时自动保存至浏览器本地存储 (localStorage)，支持多版本历史快照管理。
- **自定义品牌 Logo**：支持点击左上角上传自定义企业 Logo，并自动同步为浏览器标签页的小图标 (Favicon)。

## 🛠️ 技术栈

- **核心框架**: [React 18](https://reactjs.org/) + [Vite](https://vitejs.dev/)
- **图形引擎**: [AntV X6 v2](https://x6.antv.antgroup.com/)
- **图标库**: [Lucide React](https://lucide.dev/)
- **PDF 渲染**: [jsPDF](https://github.com/parallax/jsPDF)

## 🚀 快速开始

### 1. 克隆代码

```bash
git clone https://github.com/realsky-lgh/Org-Chart-Editor.git
cd Org-Chart-Editor
```

### 2. 安装依赖

确保您的环境中已安装 Node.js (推荐 v18+)，然后运行：

```bash
npm install
```

### 3. 本地运行

```bash
npm run dev
```

启动后，在浏览器中访问 `http://localhost:5173` 即可预览项目。

## 📦 部署指南

本项目是一个纯前端静态单页应用（SPA），不依赖后台服务，部署非常简单。

### 方式一：编译并部署到传统服务器（Nginx/Apache）

1. 在本地或 CI/CD 环境中执行打包命令：
   ```bash
   npm run build
   ```
2. 打包成功后，项目根目录会生成一个 `dist` 文件夹。
3. 将 `dist` 文件夹内的所有文件上传到服务器的 Web 根目录，并配置 Web 服务器（如 Nginx）即可。

**Nginx 配置示例：**
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    
    root /path/to/your/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### 方式二：使用静态托管服务（推荐）

您可以将项目直接导入至 [Vercel](https://vercel.com/)、[Netlify](https://www.netlify.com/) 或 Cloudflare Pages，这些平台会自动识别 Vite 项目，零配置即可实现自动构建和全球 CDN 分发。

## 📝 交互操作提示

- **连线**：鼠标悬浮在节点边缘，拖拽触点即可连接到其他节点。
- **修改连线**：点击连线本身即可唤出操作句柄，支持调整连线的折点，也可在右侧属性面板修改线型或箭头。
- **框选元素**：在画布空白处按住鼠标左键拖拽可进行框选。注意：必须将整根连线（包含其无形的包围盒）完全包入选区才能选中连线。
- **人员详情**：点击部门/岗位节点上的“展开”按钮，会以置顶浮窗形式展示该节点下的人员列表。

## 📄 许可证

MIT License
