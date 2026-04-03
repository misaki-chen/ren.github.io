/**
 * 通用图片上传组件
 * 支持：点击上传 / 拖拽上传 / Ctrl+V 粘贴截图
 *
 * 用法：
 *   const uploader = new ImageUploader({
 *     dropArea: document.getElementById('myDropArea'),   // 拖拽/点击区域
 *     fileInput: document.getElementById('myFileInput'), // hidden file input
 *     onAdd: (imageItem) => { ... },                     // 每添加一张图回调
 *     multiple: true,                                    // 是否支持多张 (默认 true)
 *     paste: true,                                       // 是否监听全局粘贴 (默认 true)
 *   });
 *
 * imageItem 结构: { file: File, dataUrl: string, name: string, size: number }
 *
 * v2026.04.03
 */
class ImageUploader {
  constructor(options = {}) {
    this.dropArea = options.dropArea;
    this.fileInput = options.fileInput;
    this.onAdd = options.onAdd || function() {};
    this.multiple = options.multiple !== false;
    this.paste = options.paste !== false;

    this._bindClick();
    this._bindFileInput();
    this._bindDragDrop();
    if (this.paste) this._bindPaste();
  }

  // 点击区域 → 触发 file input
  _bindClick() {
    if (!this.dropArea || !this.fileInput) return;
    this.dropArea.addEventListener('click', (e) => {
      // 避免点击内部按钮时重复触发
      if (e.target === this.fileInput) return;
      this.fileInput.click();
    });
  }

  // file input change
  _bindFileInput() {
    if (!this.fileInput) return;
    this.fileInput.addEventListener('change', (e) => {
      this._processFiles(Array.from(e.target.files));
      this.fileInput.value = '';
    });
  }

  // 拖拽
  _bindDragDrop() {
    if (!this.dropArea) return;
    this.dropArea.addEventListener('dragover', (e) => {
      e.preventDefault();
      this.dropArea.classList.add('image-uploader-dragover');
    });
    this.dropArea.addEventListener('dragleave', () => {
      this.dropArea.classList.remove('image-uploader-dragover');
    });
    this.dropArea.addEventListener('drop', (e) => {
      e.preventDefault();
      this.dropArea.classList.remove('image-uploader-dragover');
      const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
      this._processFiles(files);
    });
  }

  // Ctrl+V 粘贴
  _bindPaste() {
    document.addEventListener('paste', (e) => {
      const items = e.clipboardData && e.clipboardData.items;
      if (!items) return;
      const imageFiles = [];
      for (const item of items) {
        if (item.type.startsWith('image/')) {
          imageFiles.push(item.getAsFile());
        }
      }
      if (imageFiles.length > 0) {
        e.preventDefault();
        this._processFiles(imageFiles);
      }
    });
  }

  // 处理文件列表 → 转 dataUrl → 回调
  _processFiles(files) {
    if (!files.length) return;
    const list = this.multiple ? files : [files[0]];
    for (const file of list) {
      if (!file.type.startsWith('image/')) continue;
      const reader = new FileReader();
      reader.onload = (ev) => {
        this.onAdd({
          file: file,
          dataUrl: ev.target.result,
          name: file.name || 'paste-' + Date.now() + '.png',
          size: file.size,
        });
      };
      reader.readAsDataURL(file);
    }
  }
}
