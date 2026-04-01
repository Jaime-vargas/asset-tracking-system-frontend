import {HardwareDetailDto} from './hardware-dto/hardware-detail.dto';

export interface CameraDetailDto extends HardwareDetailDto {
  cameraId: string;
  macAddress: string;
  ipAddress: string;
}
