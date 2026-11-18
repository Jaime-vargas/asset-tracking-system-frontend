export interface ProjectRequestDto {
  name: string;
}

export interface ProjectDto extends ProjectRequestDto {
  id: number;
  createdDate: string;
}
