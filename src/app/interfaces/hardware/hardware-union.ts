import {CameraDetailDto} from '../camera-detail.dto';
import {ServerDetailDto} from '../server-detail.dto';

import { ComputerDetailDto } from './computer.dto';

export type HardwareUnion = CameraDetailDto | ServerDetailDto | ComputerDetailDto;
