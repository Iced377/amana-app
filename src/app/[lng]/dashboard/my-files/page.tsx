
"use client";

import type React from 'react';
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import type { VaultFile, FileType } from '@/types';
import { UploadCloud, FileText, Image as ImageIcon, Video as VideoIcon, FileQuestion, Trash2, Edit3, Search, GripVertical, List, LockKeyhole, Unlock, Eye, Download, X } from 'lucide-react';
import { performAiTagging, performShariahComplianceCheck } from './actions';
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
  DialogClose,
} from "@/components/ui/dialog"
import { useUserPreferences } from '@/context/UserPreferencesContext';

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
  const [isUploading, setIsUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingFile, setEditingFile] = useState<VaultFile | null>(null);
  const [beneficiaryName, setBeneficiaryName] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [fileToPreview, setFileToPreview] = useState<VaultFile | null>(null);
  const [previewContentUrl, setPreviewContentUrl] = useState<string | null>(null);


  const { toast } = useToast();
  const { profile, mode: userMode } = useUserPreferences();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPreviewDataUrl(null);
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setSelectedFile(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewDataUrl(reader.result as string);
      };
      reader.readAsDataURL(file); 
    } else {
      setSelectedFile(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !previewDataUrl) { 
      toast({ title: "No file selected or data missing", description: "Please select a file to upload.", variant: "destructive" });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    let progressInterval: NodeJS.Timeout | null = null;

    try {
      progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90)); 
      }, 100);

      const { name, type: mimeType, size } = selectedFile;
      const fileType: FileType = mimeType.startsWith('image/') ? 'image' :
                                  mimeType.startsWith('video/') ? 'video' :
                                  mimeType === 'application/pdf' || mimeType.startsWith('text/') || mimeType.includes('document') ? 'document' : 
                                  'other';
      
      const aiTaggingResult = await performAiTagging({ fileDataUri: previewDataUrl, filename: name, fileType });
      
      let shariahComplianceResult;
      if (userMode === 'islamic') {
        shariahComplianceResult = await performShariahComplianceCheck({ fileDataUri: previewDataUrl, filename: name, fileType });
      }
      
      const storedDataUri = previewDataUrl; 

      if (progressInterval) clearInterval(progressInterval);
      setUploadProgress(100);

      const newFile: VaultFile = {
        id: crypto.randomUUID(),
        name,
        type: fileType,
        size, 
        uploadDate: new Date().toISOString(),
        dataUri: storedDataUri, // Storing unencrypted data URI
        aiTags: aiTaggingResult.tags || ['untagged'],
        shariahCompliance: shariahComplianceResult ? { ...shariahComplianceResult, checkedAt: new Date().toISOString() } : undefined,
        icon: getFileIcon(fileType),
      };
      setFiles(prevFiles => [newFile, ...prevFiles]);
      toast({ title: "File Uploaded", description: `${name} has been uploaded without encryption.` }); 
      setIsUploadDialogOpen(false);

    } catch (error) {
      console.error("Upload error:", error);
      toast({ title: "Upload Failed", description: `An error occurred: ${error instanceof Error ? error.message : "Unknown error"}`, variant: "destructive" });
      if (progressInterval) clearInterval(progressInterval);
    } finally {
       setTimeout(() => {
         setIsUploading(false);
         setUploadProgress(0);
         setSelectedFile(null);
         setPreviewDataUrl(null);
         if (fileInputRef.current) fileInputRef.current.value = '';
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

  const handlePreviewFile = async (file: VaultFile) => {
    if (!file.dataUri) { 
      toast({ title: "Preview Error", description: "File data is missing.", variant: "destructive" });
      return;
    }
    
    setPreviewContentUrl(file.dataUri); 
    setFileToPreview(file);
    setIsPreviewOpen(true);
  };

  const handleDownloadFile = (file: VaultFile) => {
    if (!file.dataUri) {
      toast({ title: "Download Error", description: "File data is missing.", variant: "destructive" });
      return;
    }
    const link = document.createElement('a');
    link.href = file.dataUri;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({ title: "Download Started", description: `${file.name} is downloading.` });
  };

  const handleDownloadAllFiles = () => {
    if (filteredFiles.length === 0) {
      toast({ title: "No Files", description: "There are no files to download.", variant: "destructive" });
      return;
    }
    toast({ title: "Downloading All Files", description: `Preparing to download ${filteredFiles.length} files.`});
    filteredFiles.forEach((file, index) => {
      // Add a small delay between downloads to prevent browser blocking
      setTimeout(() => {
        handleDownloadFile(file);
      }, index * 500); 
    });
  };
  
  const filteredFiles = files.filter(file => 
    file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (file.aiTags && file.aiTags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold md:text-3xl">My Files</h1>
        <div className="flex gap-2">
          <Button onClick={handleDownloadAllFiles} variant="outline" disabled={filteredFiles.length === 0}>
            <Download className="mr-2 h-4 w-4" /> Download All
          </Button>
          <Dialog open={isUploadDialogOpen} onOpenChange={(isOpen) => {
            setIsUploadDialogOpen(isOpen);
            if (!isOpen) {
              setSelectedFile(null);
              setPreviewDataUrl(null);
              if (fileInputRef.current) fileInputRef.current.value = '';
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
                  Choose a file. It will be AI-tagged and stored (unencrypted).
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
                     {!selectedFile.type.startsWith('image/') && previewDataUrl && (
                       <p className="text-xs text-muted-foreground mt-1">Preview not available for this file type.</p>
                     )}
                  </div>
                )}
                {isUploading && (
                  <div className="col-span-4">
                    <Progress value={uploadProgress} className="w-full" />
                    <p className="text-sm text-center mt-1">
                      {uploadProgress < 45 ? "Preparing..." : uploadProgress < 90 ? "AI Tagging..." : "Finalizing..."} ({uploadProgress}%)
                    </p>
                  </div>
                )}
              </div>
              <DialogFooter>
                  <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleUpload} disabled={isUploading || !selectedFile || !previewDataUrl}>
                  {isUploading ? 'Processing...' : 'Upload File'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="shadow-md">
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-center gap-2">
            <div>
              <CardTitle className="flex items-center gap-2"><Unlock className="h-5 w-5 text-primary"/> Your Vault</CardTitle> 
              <CardDescription>Manage your documents, images, and videos. Files are stored unencrypted.</CardDescription>
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
                  {userMode === 'islamic' && <TableHead>Shariah Compliance</TableHead>}
                  <TableHead>Beneficiary</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFiles.map((file) => (
                  <TableRow key={file.id}>
                    <TableCell>
                        <file.icon 
                          className="h-5 w-5 text-muted-foreground cursor-pointer hover:text-primary" 
                          onClick={() => handlePreviewFile(file)}
                        />
                    </TableCell>
                    <TableCell 
                        className="font-medium cursor-pointer hover:text-primary hover:underline"
                        onClick={() => handlePreviewFile(file)}
                    >
                        {file.name}
                    </TableCell>
                    <TableCell>{(file.size / (1024 * 1024)).toFixed(2)} MB</TableCell>
                    <TableCell>{new Date(file.uploadDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {file.aiTags && file.aiTags.map(tag => <Badge key={tag} variant="secondary" className="mr-1 mb-1">{tag}</Badge>)}
                    </TableCell>
                     {userMode === 'islamic' && (
                        <TableCell>
                          {file.shariahCompliance ? (
                            <Badge variant={file.shariahCompliance.isCompliant ? "default" : "destructive"}>
                              {file.shariahCompliance.isCompliant ? "Compliant" : "Review Needed"}
                            </Badge>
                          ) : (
                            <Badge variant="outline">N/A</Badge>
                          )}
                        </TableCell>
                      )}
                    <TableCell>{file.beneficiary || 'N/A'}</TableCell>
                    <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handlePreviewFile(file)} title="Preview file">
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">Preview</span>
                        </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon"><Edit3 className="h-4 w-4" /><span className="sr-only">Edit file options</span></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                           <DropdownMenuItem onClick={() => handlePreviewFile(file)}>
                            <Eye className="mr-2 h-4 w-4" /> Preview
                          </DropdownMenuItem>
                           <DropdownMenuItem onClick={() => handleDownloadFile(file)}>
                            <Download className="mr-2 h-4 w-4" /> Download
                          </DropdownMenuItem>
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
                      <file.icon className="h-8 w-8 text-muted-foreground cursor-pointer hover:text-primary" onClick={() => handlePreviewFile(file)} />
                       <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon"><Edit3 className="h-4 w-4" /><span className="sr-only">Edit file options</span></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                           <DropdownMenuItem onClick={() => handlePreviewFile(file)}>
                            <Eye className="mr-2 h-4 w-4" /> Preview
                          </DropdownMenuItem>
                           <DropdownMenuItem onClick={() => handleDownloadFile(file)}>
                            <Download className="mr-2 h-4 w-4" /> Download
                          </DropdownMenuItem>
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
                    <CardContent 
                        className="p-4 flex-grow cursor-pointer"
                        onClick={() => handlePreviewFile(file)}
                    >
                      <h3 className="font-medium truncate" title={file.name}>{file.name}</h3>
                      <p className="text-xs text-muted-foreground">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                      <p className="text-xs text-muted-foreground">{new Date(file.uploadDate).toLocaleDateString()}</p>
                      <div className="mt-2">
                        {file.aiTags && file.aiTags.slice(0,2).map(tag => <Badge key={tag} variant="secondary" className="mr-1 mb-1 text-xs">{tag}</Badge>)}
                        {file.aiTags && file.aiTags.length > 2 && <Badge variant="secondary" className="text-xs">+{file.aiTags.length-2}</Badge>}
                      </div>
                      {userMode === 'islamic' && file.shariahCompliance && (
                        <div className="mt-1">
                           <Badge variant={file.shariahCompliance.isCompliant ? "default" : "destructive"} className="text-xs">
                              {file.shariahCompliance.isCompliant ? "Shariah Compliant" : "Shariah Review Needed"}
                           </Badge>
                        </div>
                      )}
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

      <Dialog open={isPreviewOpen} onOpenChange={(isOpen) => {
        setIsPreviewOpen(isOpen);
        if (!isOpen) {
          setFileToPreview(null);
          setPreviewContentUrl(null);
        }
      }}>
        <DialogContent className="sm:max-w-[90vw] md:max-w-[70vw] lg:max-w-[60vw] xl:max-w-[50vw] h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Preview: {fileToPreview?.name}</DialogTitle>
            <DialogClose asChild>
                <Button variant="ghost" size="icon" onClick={() => { setIsPreviewOpen(false); setFileToPreview(null); setPreviewContentUrl(null); }}>
                    <X className="h-4 w-4" />
                    <span className="sr-only">Close</span>
                </Button>
            </DialogClose>
          </DialogHeader>
          <div className="py-2 flex-grow overflow-auto">
            {previewContentUrl && fileToPreview ? (
              <>
                {fileToPreview.type === 'image' && (
                  <div className="relative w-full h-full">
                    <Image 
                        src={previewContentUrl} 
                        alt={`Preview of ${fileToPreview.name}`} 
                        layout="fill" 
                        objectFit="contain" 
                        data-ai-hint="file preview content"
                    />
                  </div>
                )}
                {fileToPreview.type === 'video' && (
                  <video src={previewContentUrl} controls className="w-full h-full max-h-[calc(85vh-100px)]">Your browser does not support the video tag.</video>
                )}
                {fileToPreview.type === 'document' && fileToPreview.name.toLowerCase().endsWith('.pdf') && (
                   <iframe src={previewContentUrl} title={`Preview of ${fileToPreview.name}`} className="w-full h-full border-0" />
                )}
                {fileToPreview.type === 'document' && !fileToPreview.name.toLowerCase().endsWith('.pdf') && (
                  <div className="flex flex-col items-center justify-center h-full text-center p-4">
                    <FileText className="h-16 w-16 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-2">Preview not available for this document type.</p>
                    <Button onClick={() => handleDownloadFile(fileToPreview)}>
                        <Download className="mr-2 h-4 w-4" /> Download Document
                    </Button>
                  </div>
                )}
                {fileToPreview.type === 'other' && (
                   <div className="flex flex-col items-center justify-center h-full text-center p-4">
                    <FileQuestion className="h-16 w-16 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-2">Preview not available for this file type.</p>
                     <Button onClick={() => handleDownloadFile(fileToPreview)}>
                        <Download className="mr-2 h-4 w-4" /> Download File
                    </Button>
                   </div>
                )}
              </>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">Loading preview...</p>
              </div>
            )}
          </div>
           <DialogFooter className="mt-auto pt-2 border-t">
             {fileToPreview && (
                <Button onClick={() => handleDownloadFile(fileToPreview)}>
                    <Download className="mr-2 h-4 w-4" /> Download
                </Button>
             )}
            <Button variant="outline" onClick={() => { setIsPreviewOpen(false); setFileToPreview(null); setPreviewContentUrl(null); }}>Close Preview</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}


    