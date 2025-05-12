"use server";

import type { RegisteredAsset, AssetCategoryKey, FileVisibility } from '@/types';

interface RegisterAssetInput {
  userId: string;
  categoryKey: AssetCategoryKey;
  assetDescription: string;
  fileName?: string;
  fileType?: string;
  fileSize?: number;
  fileDataUri?: string; // Base64 data URI of the file content
  beneficiaryIds?: string[];
  visibility: FileVisibility;
  estimatedUSDValue?: number;
}

interface HandleRegisterAssetResult {
  success: boolean;
  asset?: RegisteredAsset;
  error?: string;
}

export async function handleRegisterAsset(
  input: RegisterAssetInput
): Promise<HandleRegisterAssetResult> {
  console.log("Server Action: handleRegisterAsset called with input:", {
    ...input,
    fileDataUri: input.fileDataUri ? input.fileDataUri.substring(0, 50) + "..." : "N/A", // Avoid logging full data URI
  });
  
  if (input.assetDescription.toLowerCase().includes("fail")) {
    return { success: false, error: "Simulated registration failure." };
  }

  const mockAsset: RegisteredAsset = {
    id: crypto.randomUUID(), 
    userId: input.userId,
    categoryKey: input.categoryKey,
    assetDescription: input.assetDescription,
    fileName: input.fileName,
    fileType: input.fileType,
    fileSize: input.fileSize,
    fileDataUri: input.fileDataUri, 
    beneficiaryIds: input.beneficiaryIds,
    visibility: input.visibility,
    registrationDate: new Date().toISOString(),
    estimatedUSDValue: input.estimatedUSDValue,
  };

  await new Promise(resolve => setTimeout(resolve, 1000));

  return { success: true, asset: mockAsset };
}

export async function updateRegisteredAsset(
  updatedAssetData: RegisteredAsset // Expecting the full asset object or specific update fields
): Promise<HandleRegisterAssetResult> {
  console.log("Server Action: updateRegisteredAsset called for asset ID:", updatedAssetData.id, "Data:", {
    ...updatedAssetData,
    fileDataUri: updatedAssetData.fileDataUri ? updatedAssetData.fileDataUri.substring(0, 50) + "..." : "N/A",
  });

  // Simulate update logic
  if (updatedAssetData.assetDescription.toLowerCase().includes("failupdate")) {
    return { success: false, error: "Simulated update failure." };
  }

  // In a real app, you would:
  // 1. Fetch the existing asset from Firestore.
  // 2. Merge updatedAssetData with the existing asset.
  // 3. Handle file update/replacement if new fileDataUri is present:
  //    - Delete old file from Storage if new one is uploaded.
  //    - Upload new file to Storage.
  //    - Update filePath in Firestore.
  // 4. Save the merged and updated asset metadata back to Firestore.

  // For mock, we just return the data passed in as if it was successfully updated.
  const mockUpdatedAsset: RegisteredAsset = {
    ...updatedAssetData, // Assume all fields are part of the update for mock simplicity
    registrationDate: updatedAssetData.registrationDate || new Date().toISOString(), // Keep original or set new if not present
  };
  
  await new Promise(resolve => setTimeout(resolve, 500));

  return { success: true, asset: mockUpdatedAsset };
}
