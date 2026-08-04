import {HardwareDetailDto} from './hardware/hardware-detail.dto';
import {FileEntityDto} from './fileEntityDto';

export interface CameraDetailDto extends HardwareDetailDto {
  type: 'Camera';
  cameraId: string;
  macAddress: string;
  ipAddress: string;
  idf: string; // NEW
  username  : string; // NEW
  password: string; // NEW
  viewFromCameraPhoto: FileEntityDto; // NEW
  viewToCameraPhoto: FileEntityDto; // NEW
}
