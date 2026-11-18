import { HardwareDetailDto } from './hardware-detail.dto';

export interface ComputerStorageDto {
  storageType: 'SSD' | 'HDD' | 'NVME';
  diskCount: number | null;
  diskCapacityGb: number | null;
  raidLevel: 'RAID_0' | 'RAID_1' | 'RAID_5' | 'RAID_6' | 'RAID_10' | null;
}

export interface ComputerInterfaceDto {
  name: string | null;
  macAddress: string;
  ipAddress: string | null;
  subnetPrefix: number | null;
  gateway: string | null;
}

export interface ComputerCredentialDto {
  label: string;
  username: string | null;
  password: string | null;
}

export interface ComputerRequestDto {
  name: string;
  brand: string;
  model: string;
  serialNumber: string;
  location: string | null;
  tagId: number | null;
  computerType: 'DESKTOP' | 'SERVER';
  hostname: string | null;
  operatingSystem: string | null;
  processor: string | null;
  ramGb: number | null;
  ntpServer: string | null;
  storage: ComputerStorageDto[];
  networkInterfaces: ComputerInterfaceDto[];
  credentials: ComputerCredentialDto[];
}

export interface ComputerDetailDto extends HardwareDetailDto, Omit<ComputerRequestDto, 'location' | 'tagId'> {
  type: 'Computer';
}
