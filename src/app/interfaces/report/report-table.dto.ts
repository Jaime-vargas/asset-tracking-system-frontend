export interface ReportTableDto{
  id: number;
  title: string;
  clientId: number;
  clientName: string;
  branchId: number | null;
  branchName: string | null;
  hardwareId: number;
  hardwareName: string;
  priority: string;
  createdDate: string;
  dueDate: string;
  status: string;
}
