import {HardwareDetailDto} from './hardware/hardware-detail.dto';

export interface ServerDetailDto extends HardwareDetailDto{
  type: 'Server';
  interfaces: number;
  operatingSystem: string;

}
