import {HardwareDetailDto} from './hardware-dto/hardware-detail.dto';

export interface CameraDetailDto extends HardwareDetailDto {
  type: 'Camera';
  cameraId: string;
  macAddress: string;
  ipAddress: string;

}
