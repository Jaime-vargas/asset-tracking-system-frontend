export interface PhotoDto{
  id: number;
  filename: string;
  contentType: string;
  publicPath: string;
  uploadedAt: Date;
  reportId: number;
}
