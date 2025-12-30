
import React, { useState } from 'react';
import { SectionHeader, Card, Button, Input, Modal, Badge } from '../components/ui/Primitives';
import { HardDrive, Upload, Folder, FileText, Image as ImageIcon, Search, Star, Clock, MoreVertical, Trash2, Download, Share2, Sparkles, Loader2, FileSpreadsheet, ChevronRight, Home } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useNotifications } from '../components/ui/NotificationSystem';
import { FileItem } from '../types';
import { sendMessageToGemini } from '../services/gemini';

export const Storage: React.FC = () => {
    const { files, addFile, deleteFile, toggleStarFile } = useData();
    const { addNotification } = useNotifications();
    
    // UI State
    const [currentFolder, setCurrentFolder] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    
    // AI State
    const [aiSummary, setAiSummary] = useState('');
    const [isSummarizing, setIsSummarizing] = useState(false);

    // Derived State
    const currentFiles = files.filter(f => {
        if (searchQuery) return f.name.toLowerCase().includes(searchQuery.toLowerCase());
        return f.parentId === currentFolder;
    });

    const folderPath = () => {
        if (!currentFolder) return [{ id: null, name: 'My Drive' }];
        const folder = files.find(f => f.id === currentFolder);
        return [
            { id: null, name: 'My Drive' },
            { id: folder?.id, name: folder?.name }
        ];
    };

    const handleUpload = () => {
        const file: FileItem = {
            id: Date.now().toString(),
            name: `New_Upload_${Math.floor(Math.random() * 1000)}.pdf`,
            type: 'pdf',
            size: '1.5 MB',
            modified: 'Just now',
            parentId: currentFolder
        };
        addFile(file);
        setIsUploadModalOpen(false);
        addNotification({ title: 'File Uploaded', message: 'File successfully added to drive.', type: 'success' });
    };

    const handleCreateFolder = () => {
        const folder: FileItem = {
            id: Date.now().toString(),
            name: 'New Folder',
            type: 'folder',
            modified: 'Just now',
            parentId: currentFolder
        };
        addFile(folder);
        addNotification({ title: 'Folder Created', message: 'New folder added.', type: 'success' });
    };

    const handleAiAnalyze = async () => {
        if (!selectedFile) return;
        setIsSummarizing(true);
        // Simulate analyzing specific file content
        const prompt = `Analyze a hypothetical file named "${selectedFile.name}" of type ${selectedFile.type}. Provide a concise 3-bullet point summary of what this document likely contains based on its name and type.`;
        
        try {
            const summary = await sendMessageToGemini(prompt);
            setAiSummary(summary);
        } catch (e) {
            setAiSummary("Could not analyze file content.");
        } finally {
            setIsSummarizing(false);
        }
    };

    const FileIcon = ({ type }: { type: string }) => {
        switch (type) {
            case 'folder': return <Folder className="w-10 h-10 text-primary-400 fill-primary-50 dark:fill-primary-900/20" />;
            case 'image': return <ImageIcon className="w-10 h-10 text-purple-500" />;
            case 'pdf': return <FileText className="w-10 h-10 text-red-500" />;
            case 'spreadsheet': return <FileSpreadsheet className="w-10 h-10 text-green-500" />;
            default: return <FileText className="w-10 h-10 text-gray-400" />;
        }
    };

    return (
        <div className="h-full flex flex-col">
            <SectionHeader
                title="Echoes Drive"
                subtitle="Secure asset management and file storage."
                action={
                    <div className="flex gap-2">
                        <Button variant="secondary" icon={Folder} size="sm" onClick={handleCreateFolder}>New Folder</Button>
                        <Button icon={Upload} size="sm" onClick={() => setIsUploadModalOpen(true)}>Upload</Button>
                    </div>
                }
            />

            <div className="flex-1 flex gap-6 min-h-0 overflow-hidden">
                {/* Sidebar */}
                <div className="w-64 hidden lg:flex flex-col gap-1 pr-2">
                    <button 
                        onClick={() => { setCurrentFolder(null); setSearchQuery(''); }}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${!currentFolder ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400' : 'text-text-secondary hover:bg-surface-muted dark:hover:bg-surface-muted-dark'}`}
                    >
                        <HardDrive className="w-4 h-4" /> My Drive
                    </button>
                    <button className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-text-secondary hover:bg-surface-muted dark:hover:bg-surface-muted-dark transition-colors">
                        <Share2 className="w-4 h-4" /> Shared with me
                    </button>
                    <button className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-text-secondary hover:bg-surface-muted dark:hover:bg-surface-muted-dark transition-colors">
                        <Star className="w-4 h-4" /> Starred
                    </button>
                    <button className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-text-secondary hover:bg-surface-muted dark:hover:bg-surface-muted-dark transition-colors">
                        <Trash2 className="w-4 h-4" /> Trash
                    </button>

                    <div className="mt-auto p-4 bg-surface-subtle dark:bg-surface-subtle-dark rounded-xl border border-border dark:border-border-dark">
                        <div className="flex justify-between text-xs mb-2">
                            <span className="text-text-secondary">Storage</span>
                            <span className="font-medium text-primary-600">75%</span>
                        </div>
                        <div className="h-1.5 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div className="h-full bg-primary-500 w-3/4 rounded-full"></div>
                        </div>
                        <p className="text-[10px] text-text-tertiary mt-2">15GB of 20GB used</p>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 flex flex-col bg-surface border border-border dark:border-border-dark rounded-xl overflow-hidden shadow-sm">
                    {/* Toolbar */}
                    <div className="h-14 border-b border-border dark:border-border-dark flex items-center justify-between px-4 bg-surface-subtle/30">
                        <div className="flex items-center gap-2 text-sm text-text-secondary">
                            {folderPath().map((folder, index) => (
                                <React.Fragment key={index}>
                                    {index > 0 && <ChevronRight className="w-4 h-4 text-text-tertiary" />}
                                    <button 
                                        onClick={() => setCurrentFolder(folder.id as string)}
                                        className="hover:text-primary-600 hover:underline flex items-center gap-1"
                                    >
                                        {index === 0 && <Home className="w-3.5 h-3.5" />}
                                        {folder.name}
                                    </button>
                                </React.Fragment>
                            ))}
                        </div>
                        <div className="relative w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
                            <input 
                                type="text" 
                                placeholder="Search files..." 
                                className="w-full pl-9 pr-4 py-1.5 bg-surface border border-border dark:border-border-dark rounded-lg text-sm focus:outline-none focus:border-primary-500"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* File Grid */}
                    <div className="flex-1 overflow-y-auto p-6">
                        {currentFiles.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-text-tertiary">
                                <Folder className="w-16 h-16 mb-4 opacity-20" />
                                <p>This folder is empty</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                {currentFiles.map(file => (
                                    <div 
                                        key={file.id}
                                        onClick={() => file.type === 'folder' ? setCurrentFolder(file.id) : setSelectedFile(file)}
                                        className={`group relative p-4 rounded-xl border transition-all cursor-pointer flex flex-col items-center text-center gap-3 ${
                                            selectedFile?.id === file.id 
                                            ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-500 ring-1 ring-primary-500' 
                                            : 'bg-surface hover:bg-surface-subtle dark:bg-surface-dark dark:hover:bg-surface-subtle-dark border-border dark:border-border-dark hover:shadow-md'
                                        }`}
                                    >
                                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); toggleStarFile(file.id); }}
                                                className={`p-1 rounded-full hover:bg-surface dark:hover:bg-surface-dark ${file.starred ? 'text-yellow-400 opacity-100' : 'text-text-tertiary'}`}
                                            >
                                                <Star className="w-3.5 h-3.5 fill-current" />
                                            </button>
                                        </div>
                                        <FileIcon type={file.type} />
                                        <div className="w-full">
                                            <p className="text-sm font-medium text-text-primary dark:text-text-primary-dark truncate w-full">{file.name}</p>
                                            <p className="text-[10px] text-text-tertiary mt-1">{file.type === 'folder' ? 'Folder' : file.size}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Details Panel */}
                {selectedFile && (
                    <div className="w-72 bg-surface border border-border dark:border-border-dark rounded-xl overflow-hidden flex flex-col shadow-sm">
                        <div className="p-4 border-b border-border dark:border-border-dark flex justify-between items-start">
                            <h3 className="font-semibold text-text-primary dark:text-text-primary-dark">Details</h3>
                            <button onClick={() => setSelectedFile(null)} className="text-text-tertiary hover:text-text-primary"><MoreVertical className="w-4 h-4" /></button>
                        </div>
                        <div className="p-6 flex flex-col items-center border-b border-border dark:border-border-dark bg-surface-subtle/30">
                            <FileIcon type={selectedFile.type} />
                            <p className="mt-4 font-medium text-center text-text-primary dark:text-text-primary-dark break-all">{selectedFile.name}</p>
                            <div className="flex gap-2 mt-4">
                                <Button size="sm" variant="secondary" icon={Download}>Download</Button>
                                <Button size="sm" variant="secondary" icon={Share2}>Share</Button>
                            </div>
                        </div>
                        <div className="p-4 space-y-4 flex-1 overflow-y-auto">
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-text-secondary">Type</span>
                                    <span className="text-text-primary dark:text-text-primary-dark font-medium capitalize">{selectedFile.type}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-text-secondary">Size</span>
                                    <span className="text-text-primary dark:text-text-primary-dark font-medium">{selectedFile.size || '-'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-text-secondary">Modified</span>
                                    <span className="text-text-primary dark:text-text-primary-dark font-medium">{selectedFile.modified}</span>
                                </div>
                            </div>

                            {selectedFile.type !== 'folder' && (
                                <div className="mt-6 pt-4 border-t border-border dark:border-border-dark">
                                    <h4 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-3 flex items-center gap-2">
                                        <Sparkles className="w-3.5 h-3.5 text-primary-500" />
                                        Echoes AI
                                    </h4>
                                    {!aiSummary ? (
                                        <Button 
                                            variant="secondary" 
                                            size="sm" 
                                            className="w-full" 
                                            onClick={handleAiAnalyze}
                                            disabled={isSummarizing}
                                        >
                                            {isSummarizing ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-2" /> : 'Summarize Content'}
                                            {isSummarizing ? 'Thinking...' : ''}
                                        </Button>
                                    ) : (
                                        <div className="p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg text-xs text-text-secondary dark:text-text-secondary-dark leading-relaxed border border-primary-100 dark:border-primary-800">
                                            {aiSummary}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                        <div className="p-4 border-t border-border dark:border-border-dark">
                            <Button 
                                variant="danger" 
                                size="sm" 
                                className="w-full" 
                                icon={Trash2}
                                onClick={() => { deleteFile(selectedFile.id); setSelectedFile(null); addNotification({title:'Deleted', message:'File moved to trash', type:'info'}); }}
                            >
                                Delete File
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            <Modal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} title="Upload Files">
                <div className="border-2 border-dashed border-border dark:border-border-dark rounded-xl p-10 flex flex-col items-center justify-center text-center hover:bg-surface-subtle transition-colors cursor-pointer" onClick={handleUpload}>
                    <Upload className="w-10 h-10 text-text-tertiary mb-4" />
                    <h4 className="font-medium text-text-primary dark:text-text-primary-dark">Click to upload</h4>
                    <p className="text-sm text-text-secondary mt-1">or drag and drop files here</p>
                </div>
                <div className="mt-4 flex justify-end">
                    <Button variant="ghost" onClick={() => setIsUploadModalOpen(false)}>Cancel</Button>
                </div>
            </Modal>
        </div>
    );
};
