import dayjs from 'dayjs';
import type { Status } from '../types/BikeRepairTask';

export function getDatesArray(start: dayjs.Dayjs, end: dayjs.Dayjs) {
  const arr = [];
  let d = start;
  while (d.isBefore(end) || d.isSame(end, 'day')) {
    arr.push(d.format('YYYY-MM-DD'));
    d = d.add(1, 'day');
  }
  return arr;
}

export const statusColor = (status: Status) => {
  switch (status) {
    case '未着手':
      return '#ff5252'; // 赤
    case '部品発注済み':
      return '#ffd600'; // オレンジ
    case '部品到着':
      return '#8dbbff'; // skyblue
    case '保留':
      return '#ff9800'; // 濃いオレンジ
    case '作業中':
      return '#039be5'; // 青
    case '完了':
      return '#4caf50'; // 緑
    default:
      return '#bdbdbd'; // その他はグレー
  }
};
