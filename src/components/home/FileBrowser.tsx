import React, { useEffect, useState, useRef } from 'react';
import { FileIcon } from '@/components/ui/icons/File';
import { FolderIcon } from '@/components/ui/icons/Folder';
import { UploadIcon } from '@/components/ui/icons/Upload';
import { PlusIcon } from '@/components/ui/icons/Plus';
import { TrashIconMenu } from '@/components/ui/icons/TrashMenu';
import { MoveIcon } from '@/components/ui/icons/Move';
import { DownloadIcon } from '@/components/ui/icons/Download';
import clsx from 'clsx';

interface FileData {
  fileId: string;
  originalName: string;
  mimeType: string;
  size: number;
  createdAt: string;
}

interface FileBrowserProps {
  onToast: (message: string, type: 'success' | 'error') => void;
}

export const FileBrowser = ({ onToast }: FileBrowserProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<FileData[]>([]);
  const [loading, setLoading] = useState(true);
  const [pathStack, setPathStack] = useState<{ id: string | null; name: string }[]>([
    { id: null, name: 'Root' },
  ]);
  
  // Creation state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newDirName, setNewDirName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  
  // Rename state
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [renameValue, setRenameValue] = useState('');
  const [isRenaming, setIsRenaming] = useState(false);
  const [renamingItem, setRenamingItem] = useState<FileData | null>(null);

  // Upload state
  const [isUploading, setIsUploading] = useState(false);

  // Move state
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
  const [isMoving, setIsMoving] = useState(false);
  const [movingItem, setMovingItem] = useState<FileData | null>(null);
  const [movePathStack, setMovePathStack] = useState<{ id: string | null; name: string }[]>([{ id: null, name: 'Root' }]);
  const [moveModalFolders, setMoveModalFolders] = useState<FileData[]>([]);
  const [isLoadingMoveFolders, setIsLoadingMoveFolders] = useState(false);

  // Context Menu state
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    item: FileData;
    clickId: number;
  } | null>(null);

  const currentFolder = pathStack[pathStack.length - 1];

  const fetchContent = async (id: string | null) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        onToast('Session expired, please login again', 'error');
        return;
      }

      const url = id ? `/api/directories/content?parentId=${id}` : '/api/directories/content';
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setItems(data.files || []);
      } else {
        onToast('Failed to fetch content', 'error');
      }
    } catch (error) {
      onToast('An error occurred while fetching content', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchMoveFolders = async (id: string | null) => {
    setIsLoadingMoveFolders(true);
    try {
      const token = localStorage.getItem('token');
      const url = id ? `/api/directories/content?parentId=${id}` : '/api/directories/content';
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setMoveModalFolders((data.files || []).filter((f: FileData) => f.mimeType === 'text/directory'));
      }
    } catch (error) {
      onToast('Error fetching folders', 'error');
    } finally {
      setIsLoadingMoveFolders(false);
    }
  };

  useEffect(() => {
    fetchContent(currentFolder.id);
  }, [currentFolder.id]);

  useEffect(() => {
    if (isMoveModalOpen) {
      const currentMoveFolder = movePathStack[movePathStack.length - 1];
      fetchMoveFolders(currentMoveFolder.id);
    }
  }, [isMoveModalOpen, movePathStack]);

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
    if (!containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const itemRect = e.currentTarget.getBoundingClientRect();

    setContextMenu({
      x: itemRect.right - containerRect.left + 10,
      y: itemRect.top - containerRect.top + 10,
      item,
      clickId: Date.now(),
    });
  };

  const handleRenameClick = () => {
    if (!contextMenu) return;
    setRenamingItem(contextMenu.item);
    setRenameValue(contextMenu.item.originalName);
    setIsRenameModalOpen(true);
    setContextMenu(null);
  };

  const handleRenameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!renamingItem || !renameValue.trim()) return;
    if (renamingItem.mimeType !== 'text/directory') return;

    setIsRenaming(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/directories/${renamingItem.fileId}/rename`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ dirname: renameValue }),
      });

      if (res.ok) {
        onToast('Renamed successfully', 'success');
        setIsRenameModalOpen(false);
        setRenamingItem(null);
        fetchContent(currentFolder.id);
      } else {
        const data = await res.json();
        onToast(data.message || 'Failed to rename', 'error');
      }
    } catch (error) {
      onToast('An error occurred during rename', 'error');
    } finally {
      setIsRenaming(false);
    }
  };

  const handleMoveClick = () => {
    if (!contextMenu) return;
    setMovingItem(contextMenu.item);
    setMovePathStack([...pathStack]);
    setIsMoveModalOpen(true);
    setContextMenu(null);
  };

  const handleMoveModalNavigate = (folder: FileData) => {
    setMovePathStack((prev) => [...prev, { id: folder.fileId, name: folder.originalName }]);
  };

  const handleMoveModalBack = () => {
    if (movePathStack.length > 1) {
      setMovePathStack((prev) => prev.slice(0, -1));
    }
  };

  const handleMoveSubmit = async () => {
    if (!movingItem || isMoving) return;
    const targetFolder = movePathStack[movePathStack.length - 1];

    if (movingItem.fileId === targetFolder.id) {
      onToast('Cannot move item into itself', 'error');
      return;
    }

    setIsMoving(true);
    try {
      const token = localStorage.getItem('token');
      const isDirectory = movingItem.mimeType === 'text/directory';
      const endpoint = isDirectory 
        ? `/api/directories/${movingItem.fileId}/move`
        : `/api/files/${movingItem.fileId}/move`;

      const res = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ targetDir: targetFolder.id ?? 'root' }),
      });

      if (res.ok) {
        onToast('Moved successfully', 'success');
        setIsMoveModalOpen(false);
        setMovingItem(null);
        fetchContent(currentFolder.id);
      } else {
        const data = await res.json();
        onToast(data.message || 'Failed to move', 'error');
      }
    } catch (error) {
      onToast('An error occurred during move', 'error');
    } finally {
      setIsMoving(false);
    }
  };

  const handleDownload = async () => {
    if (!contextMenu) return;
    const { item } = contextMenu;
    setContextMenu(null);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/files/download/${item.fileId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const fileName = item.mimeType === 'text/directory' && !item.originalName.endsWith('.zip')
          ? `${item.originalName}.zip`
          : item.originalName;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        const data = await res.json();
        onToast(data.message || 'Failed to download', 'error');
      }
    } catch (error) {
      onToast('An error occurred during download', 'error');
    }
  };

  const handleTrash = async () => {
    if (!contextMenu) return;
    const { item } = contextMenu;
    setContextMenu(null);

    try {
      const token = localStorage.getItem('token');
      const isDirectory = item.mimeType === 'text/directory';
      const endpoint = isDirectory
        ? `/api/directories/${item.fileId}/trash`
        : `/api/files/${item.fileId}/trash`;

      const res = await fetch(endpoint, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        onToast('Moved to trash', 'success');
        fetchContent(currentFolder.id);
      } else {
        const data = await res.json();
        onToast(data.message || 'Failed to move to trash', 'error');
      }
    } catch (error) {
      onToast('An error occurred', 'error');
    }
  };

  const handleDelete = async () => {
    if (!contextMenu) return;
    const { item } = contextMenu;
    setContextMenu(null);

    try {
      const token = localStorage.getItem('token');
      const isDirectory = item.mimeType === 'text/directory';
      const endpoint = isDirectory
        ? `/api/directories/${item.fileId}`
        : `/api/files/${item.fileId}`;

      const res = await fetch(endpoint, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        onToast('Deleted successfully', 'success');
        fetchContent(currentFolder.id);
      } else {
        const data = await res.json();
        onToast(data.message || 'Failed to delete', 'error');
      }
    } catch (error) {
      onToast('An error occurred during deletion', 'error');
    }
  };

  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  const handleCreateDir = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDirName.trim()) return;

    setIsCreating(true);
    try {
      const token = localStorage.getItem('token');
      const url = currentFolder.id ? `/api/directories?parentId=${currentFolder.id}` : '/api/directories';

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ dirname: newDirName }),
      });

      if (res.ok) {
        onToast('Directory created successfully', 'success');
        setNewDirName('');
        setIsModalOpen(false);
        fetchContent(currentFolder.id);
      } else {
        const data = await res.json();
        onToast(data.message || 'Failed to create directory', 'error');
      }
    } catch (error) {
      onToast('An error occurred while creating directory', 'error');
    } finally {
      setIsCreating(false);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i]);
    }

    try {
      const token = localStorage.getItem('token');
      const url = currentFolder.id 
        ? `/api/files/upload?parentId=${currentFolder.id}`
        : '/api/files/upload';

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (res.ok) {
        onToast(`Successfully uploaded ${files.length} file(s)`, 'success');
        fetchContent(currentFolder.id);
      } else {
        const data = await res.json();
        onToast(data.message || 'Failed to upload files', 'error');
      }
    } catch (error) {
      onToast('An error occurred during upload', 'error');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div ref={containerRef} className="flex flex-col h-full relative">
      {/* Hidden File Input */}
      <input
        type="file"
        multiple
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />
      
      {/* Action Bar */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleUploadClick}
            disabled={isUploading}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-all hover:scale-105 active:scale-95 shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <UploadIcon />
            )}
            {isUploading ? 'Uploading...' : 'Upload'}
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center px-4 py-2 bg-white border-2 border-green-600 text-green-700 rounded-xl font-semibold hover:bg-green-50 transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <PlusIcon />
            Create Dir
          </button>
        </div>
      </div>

      {/* Path Breadcrumbs and Back Button */}
      <div className="flex items-center space-x-2 mb-6 text-sm h-10">
        <div className="flex items-center">
          {pathStack.length > 1 && (
            <button
              onClick={handleBack}
              className="p-2 rounded-full border-0 outline-none ring-0 hover:bg-green-100 text-green-700 transition-colors duration-200 cursor-pointer group mr-2 animate-in fade-in duration-300"
              title="Go back"
            >
              <svg className="w-5 h-5 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            </button>
          )}
        </div>
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 custom-scrollbar flex-1">
          {pathStack.map((folder, index) => (
            <React.Fragment key={index}>
              {index > 0 && <span className="text-gray-400 animate-in fade-in duration-500">/</span>}
              <button
                onClick={() => navigateToStack(index)}
                className={clsx(
                  'px-2 py-1 rounded-md transition-all cursor-pointer whitespace-nowrap animate-in fade-in zoom-in duration-300',
                  index === pathStack.length - 1
                    ? 'bg-green-100 text-green-800 font-bold'
                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700',
                )}
              >
                {folder.name}
              </button>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Modal for creating directory */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-sm m-4 animate-in zoom-in duration-200">
            <h3 className="text-xl font-bold text-green-800 mb-4">Create New Directory</h3>
            <form onSubmit={handleCreateDir}>
              <input
                autoFocus
                type="text"
                placeholder="Directory name"
                value={newDirName}
                onChange={(e) => setNewDirName(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-600 outline-none transition-colors mb-6 text-black font-semibold"
              />
              <div className="flex space-x-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 font-semibold text-gray-500 hover:text-gray-700 transition-colors cursor-pointer">Cancel</button>
                <button type="submit" disabled={isCreating || !newDirName.trim()} className="flex-1 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-all disabled:opacity-50 cursor-pointer">
                  {isCreating ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Context Menu */}
      {contextMenu && (
        <div
          key={contextMenu.clickId}
          className="absolute z-[100] bg-white/40 backdrop-blur-md border border-white/20 shadow-2xl rounded-2xl py-1 w-48 animate-context-menu origin-left"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Rename Action (Directories only) */}
          {contextMenu.item.mimeType === 'text/directory' && (
            <button
              onClick={handleRenameClick}
              className="w-full flex items-center px-4 py-3 text-sm font-semibold text-green-700 hover:bg-green-50/50 transition-colors cursor-pointer rounded-t-xl"
            >
              <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
              Rename
            </button>
          )}

          {/* Move Action */}
          <button
            onClick={handleMoveClick}
            className={clsx(
              "w-full flex items-center px-4 py-3 text-sm font-semibold text-green-700 hover:bg-green-50/50 transition-colors cursor-pointer",
              contextMenu.item.mimeType !== 'text/directory' && "rounded-t-xl"
            )}
          >
            <MoveIcon />
            Move
          </button>

          {/* Download Action */}
          <button
            onClick={handleDownload}
            className="w-full flex items-center px-4 py-3 text-sm font-semibold text-green-700 hover:bg-green-50/50 transition-colors cursor-pointer"
          >
            <DownloadIcon />
            Download
          </button>

          {/* Trash Action */}
          <button
            onClick={handleTrash}
            className="w-full flex items-center px-4 py-3 text-sm font-semibold text-orange-600 hover:bg-orange-50/50 transition-colors cursor-pointer"
          >
            <TrashIconMenu />
            Move to Trash
          </button>

          {/* Delete Action (Permanent) */}
          <button
            onClick={handleDelete}
            className="w-full flex items-center px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50/50 transition-colors cursor-pointer rounded-b-xl"
          >
            <TrashIconMenu />
            Delete Permanently
          </button>

          <div className="h-[1px] bg-gray-200/50 mx-2" />

          {/* Close Action */}
          <button onClick={() => setContextMenu(null)} className="w-full flex items-center px-4 py-3 text-sm font-semibold text-gray-500 hover:bg-gray-100/50 transition-colors cursor-pointer rounded-b-xl">
            <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            Close
          </button>
        </div>
      )}

      {/* Modal for Renaming */}
      {isRenameModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-sm m-4 animate-in zoom-in duration-200">
            <h3 className="text-xl font-bold text-green-800 mb-4">Rename Item</h3>
            <form onSubmit={handleRenameSubmit}>
              <input
                autoFocus
                type="text"
                placeholder="New name"
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-600 outline-none transition-colors mb-6 text-black font-semibold"
              />
              <div className="flex space-x-3">
                <button type="button" onClick={() => setIsRenameModalOpen(false)} className="flex-1 py-3 font-semibold text-gray-500 hover:text-gray-700 transition-colors cursor-pointer">Cancel</button>
                <button type="submit" disabled={isRenaming || !renameValue.trim()} className="flex-1 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-all disabled:opacity-50 cursor-pointer">
                  {isRenaming ? 'Renaming...' : 'Rename'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal for Moving */}
      {isMoveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-md m-4 animate-in zoom-in duration-200 flex flex-col max-h-[80vh]">
            <h3 className="text-xl font-bold text-green-800 mb-2">Move to Folder</h3>
            <div className="text-xs text-gray-400 mb-4 bg-gray-50 p-2 rounded-lg border border-gray-100 truncate font-mono">
              Target: {movePathStack.map((p) => p.name).join(' / ')}
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar mb-6 space-y-1 pr-1 min-h-[250px]">
              {movePathStack.length > 1 && (
                <button onClick={handleMoveModalBack} className="w-full text-left px-4 py-3 rounded-xl font-bold text-green-700 bg-green-50 hover:bg-green-100 transition-all cursor-pointer flex items-center mb-2 border border-green-200 group">
                  <svg className="w-5 h-5 mr-3 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                  .. (Back)
                </button>
              )}

              {isLoadingMoveFolders ? (
                <div className="flex flex-col items-center justify-center py-10 space-y-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                  <p className="text-sm text-gray-400">Fetching folders...</p>
                </div>
              ) : (
                <>
                  {moveModalFolders.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-10 text-gray-400 space-y-2">
                      <FolderIcon />
                      <p className="text-sm font-medium">No subfolders here</p>
                    </div>
                  )}
                  {moveModalFolders
                    .filter((folder) => folder.fileId !== movingItem?.fileId)
                    .map((folder) => (
                      <button
                        key={folder.fileId}
                        onClick={() => handleMoveModalNavigate(folder)}
                        className="w-full text-left px-4 py-3 rounded-xl font-semibold bg-gray-50 text-gray-700 hover:bg-green-50 hover:text-green-800 transition-all cursor-pointer flex items-center group border border-transparent hover:border-green-200"
                      >
                        <FolderIcon />
                        <span className="ml-3 truncate">{folder.originalName}</span>
                        <svg className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                      </button>
                    ))}
                </>
              )}
            </div>

            <div className="flex space-x-3 pt-4 border-t border-gray-100">
              <button type="button" onClick={() => { setIsMoveModalOpen(false); setMovingItem(null); }} className="flex-1 py-3 font-semibold text-gray-500 hover:text-gray-700 transition-colors cursor-pointer">Cancel</button>
              <button onClick={handleMoveSubmit} disabled={isMoving || (movingItem && movingItem.fileId === movePathStack[movePathStack.length - 1].id)} className="flex-1 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-all disabled:opacity-50 cursor-pointer shadow-lg shadow-green-200 active:scale-95">
                {isMoving ? 'Moving...' : 'Move Here'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto min-h-0 pr-2 custom-scrollbar">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          </div>
        ) : items.length === 0 && pathStack.length <= 1 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <FolderIcon />
            <p className="mt-4 text-lg font-medium">This folder is empty</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 pb-10">
            {pathStack.length > 1 && (
              <div onClick={handleBack} className="group flex flex-col items-center p-4 rounded-2xl border-0 hover:bg-gray-100 transition-colors cursor-pointer active:scale-95">
                <div className="mb-3 transition-transform duration-300 group-hover:-translate-y-1">
                  <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>
                </div>
                <span className="text-sm font-semibold text-gray-400 text-center truncate w-full px-2">..</span>
              </div>
            )}
            {items.map((item) => (
              <div
                key={item.fileId}
                onClick={() => handleItemClick(item)}
                onContextMenu={(e) => handleContextMenu(e, item)}
                className="group flex flex-col items-center p-4 rounded-2xl border-0 hover:bg-green-50 transition-all cursor-pointer animate-in fade-in zoom-in duration-300"
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
