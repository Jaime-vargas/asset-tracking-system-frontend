import {HardwareDetailDto} from './hardware-detail.dto';

export interface CameraDetailDto extends HardwareDetailDto {
  cameraId: string;
  macAddress: string;
  ipAddress: string;
}
