import { UTApi } from "uploadthing/server";

const utapi = new UTApi();

export async function deleteFile(fileKey: string) {
  try {
    await utapi.deleteFiles(fileKey);
  } catch (error) {
    console.error("Error deleting file:", error);
    throw new Error("Failed to delete file.");
  }
}
