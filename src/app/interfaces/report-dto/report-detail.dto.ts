import {CommentDto} from '../comment.dto';
import {PhotoDto} from '../photo.dto';

export interface ReportDetailDto {
  id: number;
  title: string;
  reportDetails: string;
  photos: PhotoDto[];
  comments: CommentDto[];
  status: string;
  hardwareName: string;
  reportedBy: string;
  createdAt: string;
  updatedAt: string;
  closedAt: string;
  dueDate: string;
  priority: string;
}
