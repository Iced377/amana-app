"use client";

import type React from 'react';
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image'; // Ensure Image is imported from next/image
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import type { VaultFile, FileType } from '@/types';
import { UploadCloud, FileText, Image as ImageIcon, Video as VideoIcon, FileQuestion, Trash2, Edit3, Search, GripVertical, List } from 'lucide-react';
import { performAiTagging } from './actions';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

const getFileIcon = (type: FileType) => {
  switch (type) {
    case 'document': return FileText;
    case 'image': return ImageIcon;
    case 'video': return VideoIcon;
    default: return FileQuestion;
  }
};

export default function MyFilesPage() {
  const [files, setFiles] = useState<VaultFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewDataUrl, setPreviewDataUrl] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(isUploading);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingFile, setEditingFile] = useState<VaultFile | null>(null);
  const [beneficiaryName, setBeneficiaryName] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPreviewDataUrl(null);
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setSelectedFile(file);

      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewDataUrl(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    } else {
      setSelectedFile(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast({ title: "No file selected", description: "Please select a file to upload.", variant: "destructive" });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    let progressInterval: NodeJS.Timeout | null = null;
    try {
      // Simulate upload progress
      let progress = 0;
      progressInterval = setInterval(() => {
        progress += 10;
        if (progress <= 100) {
          setUploadProgress(progress);
        } else {
          if (progressInterval) clearInterval(progressInterval);
        }
      }, 100);
      
      const reader = new FileReader();
      reader.readAsDataURL(selectedFile);

      reader.onload = async (e) => {
        const fileDataUri = e.target?.result as string;
        if (!fileDataUri) {
            toast({ title: "File Read Error", description: "Could not read file data.", variant: "destructive" });
            if (progressInterval) clearInterval(progressInterval);
            setIsUploading(false);
            setUploadProgress(0);
            return;
        }

        const { name, type: mimeType, size } = selectedFile;
        const fileType: FileType = mimeType.startsWith('image/') ? 'image' :
                                  mimeType.startsWith('video/') ? 'video' :
                                  mimeType === 'application/pdf' || mimeType.startsWith('text/') || mimeType.includes('document') ? 'document' : 
                                  'other';

        const aiResult = await performAiTagging({ fileDataUri, filename: name, fileType });
        
        if (progressInterval) clearInterval(progressInterval);
        setUploadProgress(100);

        const newFile: VaultFile = {
          id: crypto.randomUUID(),
          name,
          type: fileType,
          size,
          uploadDate: new Date().toISOString(),
          aiTags: aiResult.tags || ['untagged'],
          icon: getFileIcon(fileType),
          // fileObject: selectedFile, // Avoid storing large File objects in state if not strictly needed long-term
        };
        setFiles(prevFiles => [newFile, ...prevFiles]);
        toast({ title: "File Uploaded", description: `${name} has been uploaded and tagged.` });
        setIsUploadDialogOpen(false); // This will trigger onOpenChange(false) and reset form
      };

      reader.onerror = () => {
        toast({ title: "File Read Error", description: "Error reading file.", variant: "destructive" });
        if (progressInterval) clearInterval(progressInterval);
        setIsUploading(false);
        setUploadProgress(0);
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast({ title: "Upload Failed", description: "An error occurred during upload.", variant: "destructive" });
      if (progressInterval) clearInterval(progressInterval);
    } finally {
      // Ensure uploading state is reset after a short delay to show 100%
       setTimeout(() => {
         setIsUploading(false);
         setUploadProgress(0);
       }, 500);
    }
  };

  const handleDeleteFile = (fileId: string) => {
    setFiles(files.filter(file => file.id !== fileId));
    toast({ title: "File Deleted", description: "The file has been removed." });
  };

  const handleEditFile = (file: VaultFile) => {
    setEditingFile(file);
    setBeneficiaryName(file.beneficiary || '');
  };

  const handleSaveBeneficiary = () => {
    if (editingFile) {
      setFiles(files.map(f => f.id === editingFile.id ? { ...f, beneficiary: beneficiaryName } : f));
      toast({ title: "Beneficiary Updated", description: `Beneficiary for ${editingFile.name} updated.` });
      setEditingFile(null);
    }
  };
  
  const filteredFiles = files.filter(file => 
    file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (file.aiTags && file.aiTags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold md:text-3xl">My Files</h1>
        <Dialog open={isUploadDialogOpen} onOpenChange={(isOpen) => {
          setIsUploadDialogOpen(isOpen);
          if (!isOpen) {
            setSelectedFile(null);
            setPreviewDataUrl(null);
            if (fileInputRef.current) {
              fileInputRef.current.value = '';
            }
            // Reset upload-specific states when dialog closes
            setIsUploading(false);
            setUploadProgress(0);
          }
        }}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsUploadDialogOpen(true)}>
              <UploadCloud className="mr-2 h-4 w-4" /> Upload File
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Upload a New File</DialogTitle>
              <DialogDescription>
                Choose a file from your device. It will be securely stored and automatically tagged.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="file-upload" className="text-right col-span-1">
                  File
                </Label>
                <Input ref={fileInputRef} id="file-upload" type="file" onChange={handleFileChange} className="col-span-3" />
              </div>
              {selectedFile && (
                <div className="col-span-4 text-center">
                  <p className="text-sm text-muted-foreground">Selected: {selectedFile.name}</p>
                  {previewDataUrl && selectedFile.type.startsWith('image/') && (
                    <div className="mt-2 flex justify-center">
                      <Image
                        src={previewDataUrl}
                        alt="Selected file preview"
                        width={200}
                        height={200}
                        className="rounded-md object-contain max-h-48"
                        data-ai-hint="file preview"
                      />
                    </div>
                  )}
                </div>
              )}
              {isUploading && (
                <div className="col-span-4">
                  <Progress value={uploadProgress} className="w-full" />
                  <p className="text-sm text-center mt-1">{uploadProgress > 0 ? `${uploadProgress}%` : "Initializing upload..."}</p>
                </div>
              )}
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleUpload} disabled={isUploading || !selectedFile}>
                {isUploading ? 'Uploading...' : 'Upload'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="shadow-md">
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-center gap-2">
            <div>
              <CardTitle>Your Vault</CardTitle>
              <CardDescription>Manage your uploaded documents, images, and videos.</CardDescription>
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="relative flex-grow md:flex-grow-0">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  type="search" 
                  placeholder="Search files or tags..." 
                  className="pl-8 w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant={viewMode === 'list' ? 'secondary' : 'ghost'} size="icon" onClick={() => setViewMode('list')} aria-label="List view">
                <List className="h-4 w-4" />
              </Button>
              <Button variant={viewMode === 'grid' ? 'secondary' : 'ghost'} size="icon" onClick={() => setViewMode('grid')} aria-label="Grid view">
                <GripVertical className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredFiles.length === 0 ? (
            <div className="text-center py-10">
              <FileQuestion className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-medium text-foreground">No files found</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {searchTerm ? "Try a different search term." : "Upload your first file to get started."}
              </p>
            </div>
          ) : viewMode === 'list' ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">Icon</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>AI Tags</TableHead>
                  <TableHead>Beneficiary</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFiles.map((file) => (
                  <TableRow key={file.id}>
                    <TableCell><file.icon className="h-5 w-5 text-muted-foreground" /></TableCell>
                    <TableCell className="font-medium">{file.name}</TableCell>
                    <TableCell>{(file.size / (1024 * 1024)).toFixed(2)} MB</TableCell>
                    <TableCell>{new Date(file.uploadDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {file.aiTags && file.aiTags.map(tag => <Badge key={tag} variant="secondary" className="mr-1 mb-1">{tag}</Badge>)}
                    </TableCell>
                    <TableCell>{file.beneficiary || 'N/A'}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon"><Edit3 className="h-4 w-4" /><span className="sr-only">Edit file options</span></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                           <DropdownMenuItem onClick={() => handleEditFile(file)}>
                            <Edit3 className="mr-2 h-4 w-4" /> Edit Beneficiary
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleDeleteFile(file.id)} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredFiles.map((file) => (
                  <Card key={file.id} className="flex flex-col">
                    <CardHeader className="flex flex-row items-center justify-between p-4">
                      <file.icon className="h-8 w-8 text-muted-foreground" />
                       <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon"><Edit3 className="h-4 w-4" /><span className="sr-only">Edit file options</span></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                           <DropdownMenuItem onClick={() => handleEditFile(file)}>
                            <Edit3 className="mr-2 h-4 w-4" /> Edit Beneficiary
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleDeleteFile(file.id)} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </CardHeader>
                    <CardContent className="p-4 flex-grow">
                      <h3 className="font-medium truncate" title={file.name}>{file.name}</h3>
                      <p className="text-xs text-muted-foreground">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                      <p className="text-xs text-muted-foreground">{new Date(file.uploadDate).toLocaleDateString()}</p>
                      <div className="mt-2">
                        {file.aiTags && file.aiTags.slice(0,2).map(tag => <Badge key={tag} variant="secondary" className="mr-1 mb-1 text-xs">{tag}</Badge>)}
                        {file.aiTags && file.aiTags.length > 2 && <Badge variant="secondary" className="text-xs">+{file.aiTags.length-2}</Badge>}
                      </div>
                       <p className="text-xs text-muted-foreground mt-1">Beneficiary: {file.beneficiary || 'N/A'}</p>
                    </CardContent>
                  </Card>
                ))}
            </div>
          )}
        </CardContent>
      </Card>

      {editingFile && (
        <Dialog open={!!editingFile} onOpenChange={(isOpen) => { if(!isOpen) setEditingFile(null)}}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Beneficiary for {editingFile.name}</DialogTitle>
              <DialogDescription>
                Assign or update the beneficiary for this file.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <Label htmlFor="beneficiaryName">Beneficiary Name</Label>
              <Input 
                id="beneficiaryName" 
                value={beneficiaryName}
                onChange={(e) => setBeneficiaryName(e.target.value)}
                placeholder="Enter beneficiary name"
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingFile(null)}>Cancel</Button>
              <Button onClick={handleSaveBeneficiary}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
