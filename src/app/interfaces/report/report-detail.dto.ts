import {CommentDto} from '../comment.dto';
import {FileEntityDto} from '../fileEntityDto';

export interface ReportDetailDto {
  id: number;
  title: string;
  reportDetails: string;
  photos: FileEntityDto[];
  comments: CommentDto[];
  status: string;
  hardwareName: string;
  hardwareId: number;
  reportedBy: string;
  createdAt: string;
  updatedAt: string;
  closedAt: string;
  dueDate: string;
  priority: string;
}
