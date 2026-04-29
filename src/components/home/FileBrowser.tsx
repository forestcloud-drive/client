import React, { useEffect, useState } from 'react';
import { FileIcon } from '@/components/ui/icons/File';
import { FolderIcon } from '@/components/ui/icons/Folder';
import { UploadIcon } from '@/components/ui/icons/Upload';
import { PlusIcon } from '@/components/ui/icons/Plus';
import { DefaultButton } from '@/components/buttons/DefaultButton';

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
  const [items, setItems] = useState<FileData[]>([]);
  const [loading, setLoading] = useState(true);
  const [parentId, setParentId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newDirName, setNewDirName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

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
        headers: {
          'Authorization': `Bearer ${token}`
        }
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

  useEffect(() => {
    fetchContent(parentId);
  }, [parentId]);

  const handleItemClick = (item: FileData) => {
    if (item.mimeType === 'text/directory') {
      setParentId(item.fileId);
    }
  };

  const handleCreateDir = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDirName.trim()) return;

    setIsCreating(true);
    try {
      const token = localStorage.getItem('token');
      const url = parentId ? `/api/directories?parentId=${parentId}` : '/api/directories';
      
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ dirname: newDirName })
      });

      if (res.ok) {
        onToast('Directory created successfully', 'success');
        setNewDirName('');
        setIsModalOpen(false);
        fetchContent(parentId);
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

  const handleBack = () => {
    //TODO This is a simplification. Real navigation would need a stack of parentIds
    setParentId(null);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Action Bar */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => onToast('Upload coming soon!', 'success')}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-all hover:scale-105 active:scale-95 shadow-md"
          >
            <UploadIcon />
            Upload
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center px-4 py-2 bg-white border-2 border-green-600 text-green-700 rounded-xl font-semibold hover:bg-green-50 transition-all hover:scale-105 active:scale-95"
          >
            <PlusIcon />
            Create Dir
          </button>
        </div>

        {parentId && (
          <button
            onClick={handleBack}
            className="text-green-700 font-semibold hover:underline cursor-pointer"
          >
            &larr; Back to Root
          </button>
        )}
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
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 font-semibold text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating || !newDirName.trim()}
                  className="flex-1 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isCreating ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <FolderIcon />
            <p className="mt-4 text-lg font-medium">This folder is empty</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {items.map((item) => (
              <div
                key={item.fileId}
                onClick={() => handleItemClick(item)}
                className="group flex flex-col items-center p-4 rounded-2xl hover:bg-green-50 transition-all cursor-pointer border border-transparent hover:border-green-100"
              >
                <div className="mb-3 transition-transform duration-300 group-hover:scale-110">
                  {item.mimeType === 'text/directory' ? <FolderIcon /> : <FileIcon />}
                </div>
                <span className="text-sm font-semibold text-gray-700 text-center truncate w-full px-2">
                  {item.originalName}
                </span>
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
