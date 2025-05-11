
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
import { UploadCloud, FileText, Image as ImageIcon, Video as VideoIcon, FileQuestion, Trash2, Edit3, Search, GripVertical, List, LockKeyhole, Unlock } from 'lucide-react';
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
} from "@/components/ui/dialog"
import { useUserPreferences } from '@/context/UserPreferencesContext';
// Encryption related imports are no longer needed for upload
// import { encryptDataUri, decryptDataUri } from '@/lib/encryption'; 

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

    // Encryption key is no longer checked or used for upload
    // const encryptionKey = profile?.encryptionKey;
    // console.log("Current profile in MyFilesPage for upload:", JSON.stringify(profile, null, 2));
    // console.log("Retrieved encryption key for upload directly from profile:", encryptionKey);

    // if (!encryptionKey) {
    //   toast({ title: "Encryption Key Missing", description: "Cannot upload file without an encryption key. Please check your profile.", variant: "destructive" });
    //   setIsUploading(false); // Reset uploading state
    //   return;
    // }

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

      // Encryption is removed. Store the previewDataUrl directly.
      // const encryptedDataUri = await encryptDataUri(previewDataUrl, encryptionKey);
      // if (!encryptedDataUri) {
      //   throw new Error("File encryption failed.");
      // }
      const storedDataUri = previewDataUrl; // Storing the unencrypted data URI

      if (progressInterval) clearInterval(progressInterval);
      setUploadProgress(100);

      const newFile: VaultFile = {
        id: crypto.randomUUID(),
        name,
        type: fileType,
        size, 
        uploadDate: new Date().toISOString(),
        encryptedDataUri: storedDataUri, // Store the unencrypted Data URI
        aiTags: aiTaggingResult.tags || ['untagged'],
        shariahCompliance: shariahComplianceResult ? { ...shariahComplianceResult, checkedAt: new Date().toISOString() } : undefined,
        icon: getFileIcon(fileType),
      };
      setFiles(prevFiles => [newFile, ...prevFiles]);
      toast({ title: "File Uploaded", description: `${name} has been uploaded.` }); // Updated message
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
                Choose a file. It will be AI-tagged and stored.
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

      <Card className="shadow-md">
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-center gap-2">
            <div>
              <CardTitle className="flex items-center gap-2"><Unlock className="h-5 w-5 text-primary"/> Your Vault</CardTitle> 
              <CardDescription>Manage your documents, images, and videos.</CardDescription>
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
                    <TableCell><file.icon className="h-5 w-5 text-muted-foreground" /></TableCell>
                    <TableCell className="font-medium">{file.name}</TableCell>
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
    </div>
  );
}

