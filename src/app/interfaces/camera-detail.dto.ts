import {HardwareDetailDto} from './hardware/hardware-detail.dto';
import {PhotoDto} from './photo.dto';

export interface CameraDetailDto extends HardwareDetailDto {
  type: 'Camera';
  cameraId: string;
  macAddress: string;
  ipAddress: string;
  idf: string; // NEW
  username  : string; // NEW
  password: string; // NEW
  viewFromCameraPhoto: PhotoDto; // NEW
  viewToCameraPhoto: PhotoDto; // NEW

}
