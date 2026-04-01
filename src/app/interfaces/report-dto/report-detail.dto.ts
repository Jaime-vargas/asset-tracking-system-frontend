import {CommentDto} from '../comment.dto';

export interface ReportDetailDto {
  id: number;
  title: string;
  reportDetails: string;
  photos: string[];
  comments: CommentDto[];
  status: boolean;
  hardwareName: string;
  reportedBy: string;
  createdAt: string;
  updatedAt: string;
  closedAt: string;
  dueDate: string;
  priority: string;
}
