import {CameraDetailDto} from '../camera-detail.dto';
import {ServerDetailDto} from '../server-detail.dto';

export type HardwareUnion = CameraDetailDto | ServerDetailDto | undefined;
