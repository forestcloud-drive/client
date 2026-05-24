import React, { useEffect, useState, useRef, useMemo } from 'react';
import { FileIcon } from '@/components/ui/icons/File';
import { FolderIcon } from '@/components/ui/icons/Folder';
import { DownloadIcon } from '@/components/ui/icons/Download';
import clsx from 'clsx';
import ReactDOM from 'react-dom';

interface FileData {
  fileId: string;
  originalName: string;
  mimeType: string;
  size: number;
  createdAt: string;
}

interface SharingData {
  id: string;
  fileId: string;
  userId: string;
  user: {
    fullname: string;
    email: string;
  };
  file: {
    fileId: string;
    originalName: string;
    mimeType: string;
    size: number;
    createdAt: string;
  };
}

interface GroupedSharing {
  fileId: string;
  file: SharingData['file'];
  sharings: SharingData[];
}

interface SharedBrowserProps {
  onToast: (message: string, type: 'success' | 'error') => void;
}

const AvatarWithTooltip = ({
  user,
  size = 'md',
}: {
  user: { fullname: string; email: string };
  size?: 'sm' | 'md';
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const avatarRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    if (avatarRef.current) {
      const rect = avatarRef.current.getBoundingClientRect();
      setCoords({
        top: rect.top + window.scrollY,
        left: rect.left + rect.width / 2 + window.scrollX,
      });
      setIsHovered(true);
    }
  };

  return (
    <>
      <div
        ref={avatarRef}
        className="relative flex items-center"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div
          className={clsx(
            'rounded-full ring-2 ring-white flex items-center justify-center font-bold text-white transition-all duration-300 bg-green-600',
            size === 'sm' ? 'h-8 w-8 text-[10px]' : 'h-10 w-10 text-sm',
            isHovered && 'scale-110 z-10 shadow-lg',
          )}
        >
          {user.fullname[0]?.toUpperCase()}
        </div>
      </div>

      {isHovered &&
        ReactDOM.createPortal(
          <div
            className="fixed px-4 py-3 bg-gray-900/95 backdrop-blur-md text-white rounded-2xl shadow-2xl z-[10000] animate-in fade-in zoom-in-95 duration-200 pointer-events-none min-w-[200px] border border-white/10"
            style={{
              top: coords.top - 12, // Offset above the avatar
              left: coords.left,
              transform: 'translate(-50%, -100%)',
            }}
          >
            <div className="font-bold text-sm text-white mb-0.5 truncate">
              {user.fullname}
            </div>
            <div className="text-xs text-green-400 font-semibold truncate">
              {user.email}
            </div>
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-[6px] border-transparent border-t-gray-900/95" />
          </div>,
          document.body,
        )}
    </>
  );
};

const UnshareModal = ({
  isOpen,
  onClose,
  onUnshare,
  isLoading,
  itemTitle,
  sharings,
}: {
  isOpen: boolean;
  onClose: () => void;
  onUnshare: (sharing: SharingData) => void;
  isLoading: boolean;
  itemTitle: string;
  sharings: SharingData[];
}) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  if (!isOpen || !mounted) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[80vh]">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-red-900 mb-1">Manage Access</h2>
          <p className="text-sm text-gray-500 font-medium">
            Item: <span className="text-green-600 font-bold">{itemTitle}</span>
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
          {sharings.map((s) => (
            <div
              key={s.id}
              className="flex items-center p-3 rounded-2xl bg-gray-50 border-2 border-transparent hover:border-gray-100 transition-all"
            >
              <AvatarWithTooltip user={s.user} size="sm" />
              <div className="flex-1 min-w-0 ml-3">
                <div className="font-bold text-green-900 truncate text-sm">
                  {s.user.fullname}
                </div>
                <div className="text-xs text-gray-500 truncate">
                  {s.user.email}
                </div>
              </div>
              <button
                onClick={() => onUnshare(s)}
                disabled={isLoading}
                className="ml-2 p-2 bg-red-100 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all active:scale-95 shadow-sm"
                title="Revoke Access"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          ))}
        </div>

        <div className="p-6 bg-gray-50 border-t border-gray-100">
          <button
            onClick={onClose}
            className="w-full py-3 bg-white text-gray-600 rounded-xl font-bold hover:bg-gray-100 transition-all active:scale-95 border border-gray-200"
          >
            Done
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export const SharedBrowser = ({ onToast }: SharedBrowserProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [view, setView] = useState<'with-me' | 'by-me'>('with-me');
  const [items, setItems] = useState<FileData[]>([]);
  const [sharings, setSharings] = useState<SharingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [pathStack, setPathStack] = useState<
    { id: string | null; name: string }[]
  >(() => {
    const saved = localStorage.getItem('sharedPathStack');
    return saved ? JSON.parse(saved) : [{ id: null, name: 'Shared' }];
  });

  const [isUnshareModalOpen, setIsUnshareModalOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<GroupedSharing | null>(
    null,
  );
  const [isUnsharing, setIsUnsharing] = useState(false);

  useEffect(() => {
    localStorage.setItem('sharedPathStack', JSON.stringify(pathStack));
  }, [pathStack]);

  const currentFolder = pathStack[pathStack.length - 1];

  const fetchSharedContent = async (id: string | null) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const url = id ? `/api/shared?parentId=${id}` : '/api/shared';
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setItems(data.files || []);
      } else {
        onToast('Failed to fetch shared content', 'error');
      }
    } catch (error) {
      onToast('An error occurred while fetching shared content', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchSharings = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/shared/sharings', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setSharings(data || []);
      } else {
        onToast('Failed to fetch sharings', 'error');
      }
    } catch (error) {
      onToast('An error occurred while fetching sharings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const groupedSharings = useMemo(() => {
    const groups: { [key: string]: GroupedSharing } = {};
    sharings.forEach((s) => {
      if (!groups[s.fileId]) {
        groups[s.fileId] = {
          fileId: s.fileId,
          file: s.file,
          sharings: [],
        };
      }
      groups[s.fileId].sharings.push(s);
    });
    return Object.values(groups);
  }, [sharings]);

  useEffect(() => {
    if (view === 'with-me') {
      fetchSharedContent(currentFolder.id);
    } else {
      fetchSharings();
    }
  }, [currentFolder.id, view]);

  const handleItemClick = (item: FileData) => {
    if (item.mimeType === 'text/directory') {
      setPathStack((prev) => [
        ...prev,
        { id: item.fileId, name: item.originalName },
      ]);
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

  const handleDownload = async (item: FileData) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/shared/download/${item.fileId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const fileName =
          item.mimeType === 'text/directory' &&
          !item.originalName.endsWith('.zip')
            ? `${item.originalName}.zip`
            : item.originalName;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        let errorMessage = 'Failed to download';
        try {
          const data = await res.json();
          errorMessage = data.message || errorMessage;
        } catch (e) {}
        onToast(errorMessage, 'error');
      }
    } catch (error) {
      onToast('An error occurred during download', 'error');
    }
  };

  const handleUnshare = async (sharing: SharingData) => {
    setIsUnsharing(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/shared', {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileId: sharing.fileId,
          userIds: [sharing.userId],
        }),
      });

      if (res.ok) {
        onToast('Access revoked successfully', 'success');
        setSharings((prev) => {
          const updated = prev.filter((s) => s.id !== sharing.id);
          if (selectedGroup) {
            const updatedGroupSharings = selectedGroup.sharings.filter(
              (s) => s.id !== sharing.id,
            );
            if (updatedGroupSharings.length === 0) {
              setIsUnshareModalOpen(false);
              setSelectedGroup(null);
            } else {
              setSelectedGroup({
                ...selectedGroup,
                sharings: updatedGroupSharings,
              });
            }
          }
          return updated;
        });
      } else {
        onToast('Failed to unshare', 'error');
      }
    } catch (error) {
      onToast('An error occurred while unsharing', 'error');
    } finally {
      setIsUnsharing(false);
    }
  };

  return (
    <div ref={containerRef} className="flex flex-col h-full relative">
      <div className="flex items-center justify-center mb-8">
        <div className="bg-gray-100/50 p-1 rounded-2xl flex border border-white/20">
          <button
            onClick={() => setView('with-me')}
            className={clsx(
              'px-6 py-2 rounded-xl text-sm font-bold transition-all',
              view === 'with-me'
                ? 'bg-green-600 text-white shadow-lg'
                : 'text-gray-500 hover:text-green-700 hover:bg-white/50',
            )}
          >
            Shared with me
          </button>
          <button
            onClick={() => setView('by-me')}
            className={clsx(
              'px-6 py-2 rounded-xl text-sm font-bold transition-all',
              view === 'by-me'
                ? 'bg-green-600 text-white shadow-lg'
                : 'text-gray-500 hover:text-green-700 hover:bg-white/50',
            )}
          >
            Shared by me
          </button>
        </div>
      </div>

      {view === 'with-me' && (
        <>
          <div className="flex items-center space-x-2 mb-6 text-sm h-10 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-center">
              {pathStack.length > 1 && (
                <button
                  onClick={handleBack}
                  className="p-2 rounded-full border-0 outline-none ring-0 hover:bg-green-100 text-green-700 transition-colors duration-200 cursor-pointer group mr-2"
                >
                  <svg
                    className="w-5 h-5 transition-transform group-hover:-translate-x-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 19l-7-7m0 0l7-7m-7 7h18"
                    />
                  </svg>
                </button>
              )}
            </div>
            <div className="flex items-center space-x-2 overflow-x-auto pb-1 custom-scrollbar flex-1">
              {pathStack.map((folder, index) => (
                <React.Fragment key={index}>
                  {index > 0 && <span className="text-gray-400">/</span>}
                  <button
                    onClick={() => navigateToStack(index)}
                    className={clsx(
                      'px-2 py-1 rounded-md transition-all cursor-pointer whitespace-nowrap',
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

          <div className="flex-1 overflow-y-auto min-h-0 pr-2 custom-scrollbar">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
              </div>
            ) : items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <FolderIcon />
                <p className="mt-4 text-lg font-medium">
                  No files have been shared with you yet
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 pb-10">
                {pathStack.length > 1 && (
                  <div
                    onClick={handleBack}
                    className="group flex flex-col items-center p-4 rounded-2xl border-0 hover:bg-gray-100 transition-colors cursor-pointer active:scale-95"
                  >
                    <div className="mb-3 transition-transform duration-300 group-hover:-translate-y-1">
                      <svg
                        className="w-10 h-10 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                        />
                      </svg>
                    </div>
                    <span className="text-sm font-semibold text-gray-400 text-center truncate w-full px-2">
                      ..
                    </span>
                  </div>
                )}
                {items.map((item) => (
                  <div
                    key={item.fileId}
                    onClick={() => handleItemClick(item)}
                    className="group flex flex-col items-center p-4 rounded-2xl border-0 hover:bg-green-50 transition-all cursor-pointer animate-in fade-in zoom-in duration-300 relative"
                  >
                    <div className="mb-3 transition-transform duration-300 group-hover:scale-110">
                      {item.mimeType === 'text/directory' ? (
                        <FolderIcon />
                      ) : (
                        <FileIcon />
                      )}
                    </div>
                    <span className="text-sm font-semibold text-gray-700 text-center truncate w-full px-2">
                      {item.originalName}
                    </span>
                    <span className="text-[10px] text-gray-400 mt-1 uppercase font-bold tracking-wider">
                      {item.mimeType === 'text/directory'
                        ? 'Directory'
                        : item.mimeType?.split('/')[1] || 'File'}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(item);
                      }}
                      className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-all hover:bg-green-50 text-green-600 active:scale-95"
                      title="Download"
                    >
                      <DownloadIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {view === 'by-me' && (
        <div className="flex-1 overflow-y-auto min-h-0 pr-2 custom-scrollbar">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
          ) : groupedSharings.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <svg
                className="w-16 h-16 text-gray-300 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
              <p className="mt-4 text-lg font-medium">
                You haven't shared any files yet
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-10">
              {groupedSharings.map((group) => (
                <div
                  key={group.fileId}
                  className="bg-white/40 backdrop-blur-md border border-white/20 p-6 rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="p-3 bg-green-100 rounded-2xl text-green-700">
                      {group.file.mimeType === 'text/directory' ? (
                        <FolderIcon />
                      ) : (
                        <FileIcon />
                      )}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-green-900 truncate">
                        {group.file.originalName}
                      </h4>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                        {group.file.mimeType === 'text/directory'
                          ? 'Directory'
                          : group.file.mimeType.split('/')[1]}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest flex items-center">
                      <svg
                        className="w-3 h-3 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                      </svg>
                      Shared With ({group.sharings.length})
                    </div>
                    <div className="flex -space-x-3 overflow-visible">
                      {group.sharings.map((s) => (
                        <AvatarWithTooltip key={s.id} user={s.user} size="sm" />
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedGroup(group);
                      setIsUnshareModalOpen(true);
                    }}
                    className="w-full py-2 bg-red-50 text-red-600 border border-red-100 rounded-xl text-xs font-bold hover:bg-red-600 hover:text-white transition-all active:scale-95 flex items-center justify-center shadow-sm"
                  >
                    <svg
                      className="w-3 h-3 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                    Manage Access
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {selectedGroup && (
        <UnshareModal
          isOpen={isUnshareModalOpen}
          onClose={() => {
            setIsUnshareModalOpen(false);
            setSelectedGroup(null);
          }}
          onUnshare={handleUnshare}
          isLoading={isUnsharing}
          itemTitle={selectedGroup.file.originalName}
          sharings={selectedGroup.sharings}
        />
      )}
    </div>
  );
};
