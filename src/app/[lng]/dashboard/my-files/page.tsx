
"use client";

import type React from 'react';
import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import type { VaultFile, FileType, FileVisibility, Beneficiary } from '@/types';
import { UploadCloud, FileText, Image as ImageIcon, Video as VideoIcon, FileQuestion, Trash2, Edit3, Search, GripVertical, List, LockKeyhole, Unlock, Eye, Download, X, Cloud, Info, Lock, Users, ArchiveRestore, Settings2 } from 'lucide-react';
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { useUserPreferences } from '@/context/UserPreferencesContext';
import { encryptDataUri, decryptDataUri } from '@/lib/encryption';
import { ScrollArea } from '@/components/ui/scroll-area';

// MOCK Beneficiaries - In a real app, this would come from context or be fetched
const MOCK_BENEFICIARIES: Beneficiary[] = [
  { id: 'ben1', name: 'Alice Wonderland', email: 'alice@example.com' },
  { id: 'ben2', name: 'Bob The Builder', email: 'bob@example.com' },
  { id: 'ben3', name: 'Charlie Brown', email: 'charlie@example.com' },
  { id: 'ben4', name: 'Diana Prince', email: 'diana@example.com' },
];


const getFileIcon = (type: FileType) => {
  switch (type) {
    case 'document': return FileText;
    case 'image': return ImageIcon;
    case 'video': return VideoIcon;
    default: return FileQuestion;
  }
};

const getVisibilityIconAndText = (file: VaultFile, beneficiaries?: Beneficiary[]) => {
  switch (file.visibility) {
    case 'private':
      return { icon: Lock, text: "Private", color: "text-red-500" };
    case 'releaseOnDeath':
      return { icon: ArchiveRestore, text: "On Death", color: "text-yellow-600" };
    case 'sharedImmediately':
      const count = file.specificSharedBeneficiaryIds?.length || 0;
      const names = beneficiaries && file.specificSharedBeneficiaryIds 
        ? file.specificSharedBeneficiaryIds.map(id => beneficiaries.find(b => b.id === id)?.name || id).join(', ')
        : `${count} beneficiaries`;
      return { icon: Users, text: `Shared (${names || 'None'})`, color: "text-green-500" };
    default:
      return { icon: FileQuestion, text: "Unknown", color: "text-gray-500" };
  }
};

export default function MyFilesPage() {
  const [files, setFiles] = useState<VaultFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewDataUrl, setPreviewDataUrl] = useState<string | null>(null); 
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [currentFileVisibility, setCurrentFileVisibility] = useState<FileVisibility>('private');
  const [currentSharedBeneficiaryIds, setCurrentSharedBeneficiaryIds] = useState<string[]>([]);

  const [isEditVisibilityDialogOpen, setIsEditVisibilityDialogOpen] = useState(false);
  const [editingVisibilityFile, setEditingVisibilityFile] = useState<VaultFile | null>(null);
  const [tempVisibility, setTempVisibility] = useState<FileVisibility>('private');
  const [tempSharedBeneficiaryIds, setTempSharedBeneficiaryIds] = useState<string[]>([]);
  const [availableBeneficiaries, setAvailableBeneficiaries] = useState<Beneficiary[]>(MOCK_BENEFICIARIES);


  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [fileToPreview, setFileToPreview] = useState<VaultFile | null>(null);
  const [previewContentUrl, setPreviewContentUrl] = useState<string | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);


  const { toast } = useToast();
  const { profile, mode: userMode, getEncryptionKey } = useUserPreferences();

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
      toast({ title: "No file selected", description: "Please select a file to upload.", variant: "destructive" });
      return;
    }

    const encryptionKey = getEncryptionKey();
    if (!encryptionKey) {
      toast({ title: "Encryption Key Missing", description: "Cannot upload file without an encryption key. Please check your profile or re-login.", variant: "destructive" });
      return;
    }
    
    if (currentFileVisibility === 'sharedImmediately' && currentSharedBeneficiaryIds.length === 0) {
      toast({ title: "No Beneficiaries Selected", description: "Please select at least one beneficiary to share with immediately, or choose a different visibility.", variant: "destructive" });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    let progressInterval: NodeJS.Timeout | null = null;

    try {
      progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90)); 
      }, 100);

      const encryptedFileContent = await encryptDataUri(previewDataUrl, encryptionKey);
      if (!encryptedFileContent) {
        throw new Error("File encryption failed.");
      }

      const { name, type: mimeType, size } = selectedFile;
      const fileType: FileType = mimeType.startsWith('image/') ? 'image' :
                                  mimeType.startsWith('video/') ? 'video' :
                                  mimeType === 'application/pdf' || mimeType.startsWith('text/') || mimeType.includes('document') ? 'document' : 
                                  'other';
      
      // AI processing should use unencrypted data
      const aiTaggingResult = await performAiTagging({ fileDataUri: previewDataUrl, filename: name, fileType });
      
      let shariahComplianceResult;
      if (userMode === 'islamic') {
        shariahComplianceResult = await performShariahComplianceCheck({ fileDataUri: previewDataUrl, filename: name, fileType });
      }
      
      if (progressInterval) clearInterval(progressInterval);
      setUploadProgress(100);

      const newFile: VaultFile = {
        id: crypto.randomUUID(),
        name,
        type: fileType,
        size, 
        uploadDate: new Date().toISOString(),
        encryptedDataUri: encryptedFileContent,
        aiTags: aiTaggingResult.tags || ['untagged'],
        shariahCompliance: shariahComplianceResult ? { ...shariahComplianceResult, checkedAt: new Date().toISOString() } : undefined,
        icon: getFileIcon(fileType),
        visibility: currentFileVisibility,
        specificSharedBeneficiaryIds: currentFileVisibility === 'sharedImmediately' ? [...currentSharedBeneficiaryIds] : undefined,
      };
      setFiles(prevFiles => [newFile, ...prevFiles]);
      toast({ title: "File Uploaded", description: `${name} has been securely uploaded.` }); 
      
      // Reset upload dialog state
      setIsUploadDialogOpen(false);
      setSelectedFile(null);
      setPreviewDataUrl(null);
      setCurrentFileVisibility('private');
      setCurrentSharedBeneficiaryIds([]);
      if (fileInputRef.current) fileInputRef.current.value = '';


    } catch (error) {
      console.error("Upload error:", error);
      toast({ title: "Upload Failed", description: `An error occurred: ${error instanceof Error ? error.message : "Unknown error"}`, variant: "destructive" });
      if (progressInterval) clearInterval(progressInterval);
    } finally {
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
  
  const handleOpenEditVisibilityDialog = (file: VaultFile) => {
    setEditingVisibilityFile(file);
    setTempVisibility(file.visibility);
    setTempSharedBeneficiaryIds(file.specificSharedBeneficiaryIds || []);
    setIsEditVisibilityDialogOpen(true);
  };

  const handleSaveVisibility = () => {
    if (!editingVisibilityFile) return;

    if (tempVisibility === 'sharedImmediately' && tempSharedBeneficiaryIds.length === 0) {
       toast({ title: "No Beneficiaries Selected", description: "Please select beneficiaries or change visibility.", variant: "destructive" });
      return;
    }

    setFiles(files.map(f => 
      f.id === editingVisibilityFile.id 
      ? { ...f, visibility: tempVisibility, specificSharedBeneficiaryIds: tempVisibility === 'sharedImmediately' ? [...tempSharedBeneficiaryIds] : undefined } 
      : f
    ));
    toast({ title: "Visibility Updated", description: `Visibility for ${editingVisibilityFile.name} updated.` });
    setIsEditVisibilityDialogOpen(false);
    setEditingVisibilityFile(null);
  };


  const handlePreviewFile = async (file: VaultFile) => {
    setIsPreviewLoading(true);
    setFileToPreview(file);
    setIsPreviewOpen(true);
    setPreviewContentUrl(null); // Clear previous preview

    const encryptionKey = getEncryptionKey();
    if (!encryptionKey) {
      toast({ title: "Decryption Key Missing", description: "Cannot preview file without an encryption key.", variant: "destructive" });
      setIsPreviewLoading(false);
      setIsPreviewOpen(false);
      return;
    }

    try {
      const decryptedDataUri = await decryptDataUri(file.encryptedDataUri, encryptionKey);
      if (decryptedDataUri) {
        setPreviewContentUrl(decryptedDataUri);
      } else {
        toast({ title: "Preview Error", description: "Could not decrypt file data for preview.", variant: "destructive" });
        setIsPreviewOpen(false);
      }
    } catch (error) {
      console.error("Preview decryption error:", error);
      toast({ title: "Preview Error", description: "An error occurred during decryption.", variant: "destructive" });
      setIsPreviewOpen(false);
    } finally {
      setIsPreviewLoading(false);
    }
  };

  const handleDownloadFile = async (file: VaultFile) => {
    const encryptionKey = getEncryptionKey();
    if (!encryptionKey) {
        toast({ title: "Download Error", description: "Encryption key missing.", variant: "destructive" });
        return;
    }
    try {
        const decryptedDataUri = await decryptDataUri(file.encryptedDataUri, encryptionKey);
        if (!decryptedDataUri) {
            toast({ title: "Download Error", description: "Failed to decrypt file data.", variant: "destructive" });
            return;
        }
        const link = document.createElement('a');
        link.href = decryptedDataUri;
        link.download = file.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast({ title: "Download Started", description: `${file.name} is downloading.` });
    } catch (error) {
        toast({ title: "Download Error", description: "Could not decrypt file for download.", variant: "destructive" });
        console.error("Download error:", error);
    }
  };

  const handleDownloadAllFiles = () => {
    if (filteredFiles.length === 0) {
      toast({ title: "No Files", description: "There are no files to download.", variant: "destructive" });
      return;
    }
    toast({ title: "Downloading All Files", description: `Preparing to download ${filteredFiles.length} files.`});
    filteredFiles.forEach((file, index) => {
      setTimeout(() => {
        handleDownloadFile(file);
      }, index * 1000); // Increased delay for multiple decryptions
    });
  };


  const handleConnectCloudService = (serviceName: string) => {
    toast({
      title: "Coming Soon!",
      description: `Integration with ${serviceName} is planned for a future update.`,
    });
  };
  
  const filteredFiles = files.filter(file => 
    file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (file.aiTags && file.aiTags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
  );

  const handleBeneficiarySelectionChange = (beneficiaryId: string, checked: boolean) => {
    setCurrentSharedBeneficiaryIds(prev => 
      checked ? [...prev, beneficiaryId] : prev.filter(id => id !== beneficiaryId)
    );
  };
  
  const handleTempBeneficiarySelectionChange = (beneficiaryId: string, checked: boolean) => {
    setTempSharedBeneficiaryIds(prev => 
      checked ? [...prev, beneficiaryId] : prev.filter(id => id !== beneficiaryId)
    );
  };


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
              setCurrentFileVisibility('private');
              setCurrentSharedBeneficiaryIds([]);
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
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Upload a New File</DialogTitle>
                <DialogDescription>
                  Choose a file. It will be encrypted, AI-tagged, and stored. Manage visibility below.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-6 py-4">
                <div className="space-y-1.5">
                  <Label htmlFor="file-upload">File</Label>
                  <Input ref={fileInputRef} id="file-upload" type="file" onChange={handleFileChange} />
                </div>
                {selectedFile && (
                  <div className="text-center">
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

                <div className="space-y-2">
                  <Label>Visibility</Label>
                  <RadioGroup value={currentFileVisibility} onValueChange={(val) => setCurrentFileVisibility(val as FileVisibility)}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="private" id="vis-private" />
                      <Label htmlFor="vis-private" className="font-normal">Keep Private (Only you can see)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="releaseOnDeath" id="vis-onDeath" />
                      <Label htmlFor="vis-onDeath" className="font-normal">Release Upon Death (To all beneficiaries)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="sharedImmediately" id="vis-specific" />
                      <Label htmlFor="vis-specific" className="font-normal">Share Immediately (With specific beneficiaries)</Label>
                    </div>
                  </RadioGroup>
                </div>

                {currentFileVisibility === 'sharedImmediately' && (
                  <div className="space-y-2 pl-2 border-l-2 ml-2">
                    <Label>Select Beneficiaries to Share With:</Label>
                    {availableBeneficiaries.length > 0 ? (
                      <ScrollArea className="h-32">
                        {availableBeneficiaries.map(ben => (
                          <div key={ben.id} className="flex items-center space-x-2 py-1">
                            <Checkbox 
                              id={`ben-upload-${ben.id}`} 
                              checked={currentSharedBeneficiaryIds.includes(ben.id)}
                              onCheckedChange={(checked) => handleBeneficiarySelectionChange(ben.id, !!checked)}
                            />
                            <Label htmlFor={`ben-upload-${ben.id}`} className="font-normal">{ben.name}</Label>
                          </div>
                        ))}
                      </ScrollArea>
                    ) : (
                      <p className="text-sm text-muted-foreground">No beneficiaries added yet. Please add them in the Beneficiaries section.</p>
                    )}
                  </div>
                )}

                {isUploading && (
                  <div>
                    <Progress value={uploadProgress} className="w-full" />
                    <p className="text-sm text-center mt-1">
                      {uploadProgress < 30 ? "Preparing..." : uploadProgress < 60 ? "Encrypting..." : uploadProgress < 90 ? "AI Tagging..." : "Finalizing..."} ({uploadProgress}%)
                    </p>
                  </div>
                )}
              </div>
              <DialogFooter>
                  <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleUpload} disabled={isUploading || !selectedFile || !previewDataUrl}>
                  {isUploading ? 'Processing...' : 'Upload & Encrypt File'}
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
              <CardTitle className="flex items-center gap-2"><LockKeyhole className="h-5 w-5 text-primary"/> Your Encrypted Vault</CardTitle> 
              <CardDescription>Manage your securely encrypted documents, images, and videos.</CardDescription>
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
                  <TableHead>Visibility</TableHead>
                  <TableHead>AI Tags</TableHead>
                  {userMode === 'islamic' && <TableHead>Shariah Compliance</TableHead>}
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFiles.map((file) => {
                  const visibilityInfo = getVisibilityIconAndText(file, availableBeneficiaries);
                  return (
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
                        <div className="flex items-center gap-1">
                           <visibilityInfo.icon className={`h-4 w-4 ${visibilityInfo.color}`} />
                           <span className="text-xs">{visibilityInfo.text}</span>
                        </div>
                      </TableCell>
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
                      <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => handlePreviewFile(file)} title="Preview file">
                              <Eye className="h-4 w-4" />
                              <span className="sr-only">Preview</span>
                          </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon"><Settings2 className="h-4 w-4" /><span className="sr-only">File options</span></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                             <DropdownMenuItem onClick={() => handlePreviewFile(file)}>
                              <Eye className="mr-2 h-4 w-4" /> Preview
                            </DropdownMenuItem>
                             <DropdownMenuItem onClick={() => handleDownloadFile(file)}>
                              <Download className="mr-2 h-4 w-4" /> Download
                            </DropdownMenuItem>
                             <DropdownMenuItem onClick={() => handleOpenEditVisibilityDialog(file)}>
                              <Edit3 className="mr-2 h-4 w-4" /> Manage Sharing
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleDeleteFile(file.id)} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                              <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : ( 
             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredFiles.map((file) => {
                  const visibilityInfo = getVisibilityIconAndText(file, availableBeneficiaries);
                  return (
                    <Card key={file.id} className="flex flex-col">
                      <CardHeader className="flex flex-row items-center justify-between p-4">
                        <file.icon className="h-8 w-8 text-muted-foreground cursor-pointer hover:text-primary" onClick={() => handlePreviewFile(file)} />
                         <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon"><Settings2 className="h-4 w-4" /><span className="sr-only">File options</span></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                             <DropdownMenuItem onClick={() => handlePreviewFile(file)}>
                              <Eye className="mr-2 h-4 w-4" /> Preview
                            </DropdownMenuItem>
                             <DropdownMenuItem onClick={() => handleDownloadFile(file)}>
                              <Download className="mr-2 h-4 w-4" /> Download
                            </DropdownMenuItem>
                             <DropdownMenuItem onClick={() => handleOpenEditVisibilityDialog(file)}>
                              <Edit3 className="mr-2 h-4 w-4" /> Manage Sharing
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
                        <div className="mt-2 flex items-center gap-1" title={visibilityInfo.text}>
                           <visibilityInfo.icon className={`h-3 w-3 ${visibilityInfo.color}`} />
                           <span className="text-xs">{visibilityInfo.text}</span>
                        </div>
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
                      </CardContent>
                    </Card>
                  );
                })}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Cloud className="h-5 w-5 text-primary"/> Cloud Storage Integrations</CardTitle>
          <CardDescription>Connect your existing cloud storage accounts to easily import files.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { name: "Dropbox", icon: Cloud },
              { name: "Google Drive", icon: Cloud },
              { name: "OneDrive", icon: Cloud },
              { name: "iCloud", icon: Cloud },
            ].map((service) => (
              <Card key={service.name} className="p-4 flex flex-col items-center justify-center">
                <service.icon className="h-10 w-10 text-muted-foreground mb-2" />
                <p className="font-medium mb-3">{service.name}</p>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => handleConnectCloudService(service.name)}
                >
                  Connect
                </Button>
              </Card>
            ))}
          </div>
          <div className="flex items-center p-3 bg-accent/50 rounded-lg mt-4">
              <Info className="h-5 w-5 text-accent-foreground mr-2 rtl:ml-2 shrink-0" />
              <p className="text-sm text-accent-foreground">
              Importing files from cloud services is a planned feature. Connecting will allow you to browse and select files to add to your Guardian Angel vault.
              </p>
          </div>
        </CardContent>
      </Card>


      {editingVisibilityFile && (
        <Dialog open={isEditVisibilityDialogOpen} onOpenChange={(isOpen) => { if(!isOpen) { setIsEditVisibilityDialogOpen(false); setEditingVisibilityFile(null);}}}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Manage Sharing for {editingVisibilityFile.name}</DialogTitle>
              <DialogDescription>
                Choose how this file should be shared or kept private.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-4">
               <div className="space-y-2">
                  <Label>Visibility</Label>
                  <RadioGroup value={tempVisibility} onValueChange={(val) => setTempVisibility(val as FileVisibility)}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="private" id="edit-vis-private" />
                      <Label htmlFor="edit-vis-private" className="font-normal">Keep Private</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="releaseOnDeath" id="edit-vis-onDeath" />
                      <Label htmlFor="edit-vis-onDeath" className="font-normal">Release Upon Death</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="sharedImmediately" id="edit-vis-specific" />
                      <Label htmlFor="edit-vis-specific" className="font-normal">Share Immediately</Label>
                    </div>
                  </RadioGroup>
                </div>

                {tempVisibility === 'sharedImmediately' && (
                  <div className="space-y-2 pl-2 border-l-2 ml-2">
                    <Label>Select Beneficiaries to Share With:</Label>
                     {availableBeneficiaries.length > 0 ? (
                        <ScrollArea className="h-32">
                          {availableBeneficiaries.map(ben => (
                            <div key={ben.id} className="flex items-center space-x-2 py-1">
                              <Checkbox 
                                id={`ben-edit-${ben.id}`} 
                                checked={tempSharedBeneficiaryIds.includes(ben.id)}
                                onCheckedChange={(checked) => handleTempBeneficiarySelectionChange(ben.id, !!checked)}
                              />
                              <Label htmlFor={`ben-edit-${ben.id}`} className="font-normal">{ben.name}</Label>
                            </div>
                          ))}
                        </ScrollArea>
                      ) : (
                        <p className="text-sm text-muted-foreground">No beneficiaries available to select.</p>
                      )}
                  </div>
                )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setIsEditVisibilityDialogOpen(false); setEditingVisibilityFile(null);}}>Cancel</Button>
              <Button onClick={handleSaveVisibility}>Save Changes</Button>
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
          <DialogHeader className="flex flex-row justify-between items-center">
            <DialogTitle>Preview: {fileToPreview?.name}</DialogTitle>
            <DialogClose asChild>
                <Button variant="ghost" size="icon" onClick={() => { setIsPreviewOpen(false); setFileToPreview(null); setPreviewContentUrl(null); }}>
                    <X className="h-4 w-4" />
                    <span className="sr-only">Close</span>
                </Button>
            </DialogClose>
          </DialogHeader>
          <div className="py-2 flex-grow overflow-auto flex items-center justify-center">
            {isPreviewLoading ? (
                <div className="flex flex-col items-center justify-center h-full">
                    <Unlock className="h-16 w-16 text-primary animate-pulse mb-4" />
                    <p className="text-muted-foreground">Decrypting and loading preview...</p>
                </div>
            ) : previewContentUrl && fileToPreview ? (
              <>
                {fileToPreview.type === 'image' && (
                  <div className="relative w-full h-full">
                    <Image 
                        src={previewContentUrl} 
                        alt={`Preview of ${fileToPreview.name}`} 
                        fill={true}
                        style={{objectFit: "contain"}}
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
                {(fileToPreview.type === 'document' && !fileToPreview.name.toLowerCase().endsWith('.pdf')) || fileToPreview.type === 'other' ? (
                  <div className="flex flex-col items-center justify-center h-full text-center p-4">
                    {fileToPreview.type === 'document' ? <FileText className="h-16 w-16 text-muted-foreground mb-4" /> : <FileQuestion className="h-16 w-16 text-muted-foreground mb-4" />}
                    <p className="text-muted-foreground mb-2">Preview not available for this file type.</p>
                    <Button onClick={() => fileToPreview && handleDownloadFile(fileToPreview)}>
                        <Download className="mr-2 h-4 w-4" /> Download File
                    </Button>
                  </div>
                ) : null}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-4">
                 <FileQuestion className="h-16 w-16 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Could not load preview.</p>
                {fileToPreview && 
                    <Button onClick={() => handleDownloadFile(fileToPreview)} className="mt-2">
                        <Download className="mr-2 h-4 w-4" /> Download File
                    </Button>
                }
              </div>
            )}
          </div>
           <DialogFooter className="mt-auto pt-2 border-t">
             {fileToPreview && !isPreviewLoading && (
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
