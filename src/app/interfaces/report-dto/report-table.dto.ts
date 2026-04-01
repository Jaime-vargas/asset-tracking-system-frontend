export interface ReportTableDto{
  id: number;
  title: string;
  clientId: number;
  clientName: string;
  branchId: number;
  branchName: string;
  hardwareId: number;
  hardwareName: string;
  priority: string;
  createdDate: string;
  dueDate: string;
  status: boolean;
}
