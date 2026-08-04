export interface FileEntityDto {
  id: number;
  filename: string;
  contentType: string;
  size: number;
  filePath: string;
  uploadedAt: Date;
  category: string;
  user: string;
}
