export const statuses = [
  '未着手',
  '部品発注済み',
  '部品到着',
  '保留',
  '作業中',
  '完了',
] as const;
export type Status = typeof statuses[number];

export interface BikeRepairTask {
  id: string;
  name: string;
  phone: string;
  email: string;
  photoUrl: string;
  status: Status;
  deadline: string | null;
  estimatedHours: number;
  start: string;
  end: string;
  menu?: string;
  memo?: string;
  assignee?: string; // 担当者
  modelNumber?: string; // バイク型番
}
