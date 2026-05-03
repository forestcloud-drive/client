import React, { useEffect, useState, useRef } from 'react';
import { FileIcon } from '@/components/ui/icons/File';
import { FolderIcon } from '@/components/ui/icons/Folder';
import { TrashIconMenu } from '@/components/ui/icons/TrashMenu';
import clsx from 'clsx';

interface FileData {
  fileId: string;
  originalName: string;
  mimeType: string;
  size: number;
  createdAt: string;
}

interface TrashBrowserProps {
  onToast: (message: string, type: 'success' | 'error') => void;
}

export const TrashBrowser = ({ onToast }: TrashBrowserProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [items, setItems] = useState<FileData[]>([]);
  const [loading, setLoading] = useState(true);
  const [pathStack, setPathStack] = useState<{ id: string | null; name: string }[]>([
    { id: null, name: 'Trash' },
  ]);

  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    item: FileData;
    clickId: number;
  } | null>(null);

  const currentFolder = pathStack[pathStack.length - 1];

  const fetchTrash = async (id: string | null) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const url = id ? `/api/files/trash?parentId=${id}` : '/api/files/trash';
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setItems(data.files || []);
      } else {
        onToast('Failed to fetch trash', 'error');
      }
    } catch (error) {
      onToast('An error occurred', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrash(currentFolder.id);
  }, [currentFolder.id]);

  const handleItemClick = (item: FileData) => {
    if (item.mimeType === 'text/directory') {
      setPathStack((prev) => [...prev, { id: item.fileId, name: item.originalName }]);
    }
  };

  const navigateToStack = (index: number) => {
    setPathStack((prev) => prev.slice(0, index + 1));
  };

  const handleBack = () => {
    if (pathStack.length > 1) {
      setPathStack((prev) => prev.slice(0, -1));
    }
  };

  const handleContextMenu = (e: React.MouseEvent, item: FileData) => {
    e.preventDefault();
    // Only allow context menu for top-level trashed items
    if (!containerRef.current || pathStack.length > 1) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const itemRect = e.currentTarget.getBoundingClientRect();

    setContextMenu({
      x: itemRect.right - containerRect.left + 10,
      y: itemRect.top - containerRect.top + 10,
      item,
      clickId: Date.now(),
    });
  };

  const handleRestore = async () => {
    if (!contextMenu) return;
    const { item } = contextMenu;
    setContextMenu(null);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/directories/${item.fileId}/restore`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        onToast('Item restored successfully', 'success');
        fetchTrash(currentFolder.id);
      } else {
        const data = await res.json();
        onToast(data.message || 'Failed to restore', 'error');
      }
    } catch (error) {
      onToast('An error occurred during restoration', 'error');
    }
  };

  const handleDeletePermanent = async () => {
    if (!contextMenu) return;
    const { item } = contextMenu;
    setContextMenu(null);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/directories/${item.fileId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        onToast('Deleted permanently', 'success');
        fetchTrash(currentFolder.id);
      } else {
        onToast('Failed to delete', 'error');
      }
    } catch (error) {
      onToast('An error occurred', 'error');
    }
  };

  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  return (
    <div ref={containerRef} className="flex flex-col h-full relative">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-orange-800 flex items-center">
          <TrashIconMenu />
          <span className="ml-2">Trash</span>
        </h2>
      </div>

      <div className="flex items-center space-x-2 mb-6 text-sm h-10">
        <div className="flex items-center">
          {pathStack.length > 1 && (
            <button onClick={handleBack} className="p-2 rounded-full hover:bg-orange-100 text-orange-700 transition-all cursor-pointer mr-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            </button>
          )}
        </div>
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 flex-1">
          {pathStack.map((folder, index) => (
            <React.Fragment key={index}>
              {index > 0 && <span className="text-gray-400">/</span>}
              <button
                onClick={() => navigateToStack(index)}
                className={clsx(
                  'px-2 py-1 rounded-md transition-all cursor-pointer whitespace-nowrap',
                  index === pathStack.length - 1 ? 'bg-orange-100 text-orange-800 font-bold' : 'text-gray-500 hover:bg-gray-100'
                )}
              >
                {folder.name}
              </button>
            </React.Fragment>
          ))}
        </div>
      </div>

      {contextMenu && (
        <div
          key={contextMenu.clickId}
          className="absolute z-[100] bg-white/40 backdrop-blur-md border border-white/20 shadow-2xl rounded-2xl py-1 w-48 animate-context-menu origin-left"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onClick={(e) => e.stopPropagation()}
        >
          <button onClick={handleRestore} className="w-full flex items-center px-4 py-3 text-sm font-semibold text-green-700 hover:bg-green-50/50 transition-colors cursor-pointer rounded-t-xl">
             Restore
          </button>
          <button onClick={handleDeletePermanent} className="w-full flex items-center px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50/50 transition-colors cursor-pointer rounded-b-xl">
             Delete Permanently
          </button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto min-h-0 pr-2 custom-scrollbar">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
          </div>
        ) : items.length === 0 && pathStack.length <= 1 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <TrashIconMenu />
            <p className="mt-4 text-lg font-medium">Trash is empty</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 pb-10">
             {pathStack.length > 1 && (
              <div onClick={handleBack} className="group flex flex-col items-center p-4 rounded-2xl hover:bg-orange-50 transition-colors cursor-pointer active:scale-95">
                <div className="mb-3"><FolderIcon /></div>
                <span className="text-sm font-semibold text-gray-400 text-center">..</span>
              </div>
            )}
            {items.map((item) => (
              <div
                key={item.fileId}
                onClick={() => handleItemClick(item)}
                onContextMenu={(e) => handleContextMenu(e, item)}
                className="group flex flex-col items-center p-4 rounded-2xl border-0 hover:bg-orange-50 transition-all cursor-pointer animate-in fade-in zoom-in duration-300"
              >
                <div className="mb-3 transition-transform duration-300 group-hover:scale-110">
                  {item.mimeType === 'text/directory' ? <FolderIcon /> : <FileIcon />}
                </div>
                <span className="text-sm font-semibold text-gray-700 text-center truncate w-full px-2">{item.originalName}</span>
                <span className="text-[10px] text-gray-400 mt-1 uppercase font-bold tracking-wider">
                  {item.mimeType === 'text/directory' ? 'Directory' : item.mimeType?.split('/')[1] || 'File'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
