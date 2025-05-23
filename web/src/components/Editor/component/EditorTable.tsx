import { Icon } from '@cx/ui';
import MenuItem from '@mui/material/MenuItem';
import Popover from '@mui/material/Popover';
import { type Editor } from '@tiptap/core';
import { TextSelection } from 'prosemirror-state';
import { useEffect, useState } from 'react';
import EditorToolbarButton from './EditorToolbarButton';

const EditorTable = ({ editor }: { editor: Editor }) => {
  const [contextMenu, setContextMenu] = useState<{ mouseX: number; mouseY: number } | null>(null);
  const [selectedCell, setSelectedCell] = useState<HTMLElement | null>(null);

  // 插入3x3表格
  const insertTable = () => {
    editor
      .chain()
      .focus()
      .insertTable({ rows: 3, cols: 3, withHeaderRow: false })
      .run();
  };

  // 处理右键点击
  useEffect(() => {
    if (!editor) return;

    const handleContextMenu = (e: any) => {
      const cell = e.target.closest('td, th');
      if (!cell) return;

      e.preventDefault();

      // 设置选区
      const pos = editor.view.posAtDOM(cell, 0);
      const $pos = editor.state.doc.resolve(pos);
      const selection = TextSelection.create(editor.state.doc, $pos.pos);
      editor.view.dispatch(editor.state.tr.setSelection(selection));

      // 更新选中单元格样式
      setSelectedCell(prev => {
        prev?.style.removeProperty('background-color');
        cell.style.backgroundColor = 'rgba(0, 0, 0, 0.04)';
        return cell;
      });

      // 显示弹出菜单
      setContextMenu({
        mouseX: e.clientX,
        mouseY: e.clientY,
      });
    };

    // 添加CSS样式类来改变表格单元格的鼠标样式
    const addHoverClass = () => {
      const tables = editor.options.element.querySelectorAll('table');
      tables.forEach(table => {
        table.classList.add('editor-table');
      });
    };

    // 监听编辑器更新，确保新插入的表格也有正确的样式
    const updateListener = () => {
      addHoverClass();
    };

    const element = editor.options.element;
    element.addEventListener('contextmenu', handleContextMenu);
    editor.on('update', updateListener);
    editor.on('transaction', updateListener);

    // 监听编辑器就绪事件
    if (editor.isEditable) {
      addHoverClass();
    }
    editor.on('focus', addHoverClass);

    // 确保初始加载的表格有样式
    setTimeout(addHoverClass, 100);

    return () => {
      element.removeEventListener('contextmenu', handleContextMenu);
      editor.off('update', updateListener);
      editor.off('transaction', updateListener);
      editor.off('focus', addHoverClass);
      selectedCell?.style.removeProperty('background-color');
    };
  }, [editor]);

  // 关闭菜单并重置样式
  const closeMenu = () => {
    setContextMenu(null);
    selectedCell?.style.removeProperty('background-color');
    setSelectedCell(null);
  };

  // 表格操作命令
  const tableOperations = {
    insertColumnLeft: () => editor.chain().focus().addColumnBefore().run(),
    insertColumnRight: () => editor.chain().focus().addColumnAfter().run(),
    insertRowAbove: () => editor.chain().focus().addRowBefore().run(),
    insertRowBelow: () => editor.chain().focus().addRowAfter().run(),
  };

  return (
    <>
      <EditorToolbarButton
        tip='表格，单元格可右键操作'
        icon={<Icon type='icon-biaoge1' sx={{ fontSize: 18 }} />}
        onClick={insertTable}
      />
      <Popover
        open={!!contextMenu}
        onClose={closeMenu}
        anchorReference="anchorPosition"
        anchorPosition={
          contextMenu
            ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
            : undefined
        }
      >
        <MenuItem onClick={() => { tableOperations.insertColumnLeft(); closeMenu(); }}>
          左侧插入列
        </MenuItem>
        <MenuItem onClick={() => { tableOperations.insertColumnRight(); closeMenu(); }}>
          右侧插入列
        </MenuItem>
        <MenuItem onClick={() => { tableOperations.insertRowAbove(); closeMenu(); }}>
          上方插入行
        </MenuItem>
        <MenuItem onClick={() => { tableOperations.insertRowBelow(); closeMenu(); }}>
          下方插入行
        </MenuItem>
      </Popover>
    </>
  );
};

export default EditorTable;