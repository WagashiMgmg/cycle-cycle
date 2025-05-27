import dayjs from 'dayjs';
import { FaBicycle } from 'react-icons/fa';
import { statuses } from '../types/BikeRepairTask';
import type { BikeRepairTask } from '../types/BikeRepairTask';
import { statusColor } from '../utils/ganttUtils';
import React from 'react';

interface GanttTableProps {
  taskList: BikeRepairTask[];
  editRow: string | null;
  setEditRow: (id: string | null) => void;
  handleEdit: (id: string, key: keyof BikeRepairTask, value: string) => void;
  dates: string[];
  sortKey: keyof BikeRepairTask | null;
  setSortKey: (key: keyof BikeRepairTask | null) => void;
  sortAsc: boolean;
  setSortAsc: (asc: boolean) => void;
}

export const GanttTable: React.FC<GanttTableProps> = ({ taskList, editRow, setEditRow, handleEdit, dates, sortKey, setSortKey, sortAsc, setSortAsc }) => (
  <table style={{ borderCollapse: 'collapse', width: 'max-content', background: '#fff', boxShadow: '0 2px 8px #0001', borderRadius: 8, margin: '0 2rem 0 0' }}>
    <colgroup>
      <col style={{ width: 60 }} />
      <col style={{ width: 80 }} />
      <col style={{ width: 120 }} />
      <col style={{ width: 100 }} />
      <col style={{ width: 120 }} />
      <col style={{ width: 60 }} />
      <col style={{ width: 90 }} />
      <col style={{ width: 80 }} />
      <col style={{ width: 80 }} />
      <col style={{ width: 120 }} />
    </colgroup>
    <thead>
      <tr style={{ background: '#f0f0f0' }}>
        <th></th>
        <th>バイク</th>
        <th>名前</th>
        <th>電話番号</th>
        <th>メール</th>
        <th style={{ cursor: 'pointer' }} onClick={() => { setSortKey('status'); setSortAsc(sortKey !== 'status' ? true : !sortAsc); }}>
          進捗{sortKey === 'status' ? (sortAsc ? '▲' : '▼') : ''}
        </th>
        <th style={{ cursor: 'pointer' }} onClick={() => { setSortKey('deadline'); setSortAsc(sortKey !== 'deadline' ? true : !sortAsc); }}>
          締切{sortKey === 'deadline' ? (sortAsc ? '▲' : '▼') : ''}
        </th>
        <th style={{ cursor: 'pointer' }} onClick={() => { setSortKey('start'); setSortAsc(sortKey !== 'start' ? true : !sortAsc); }}>
          着手日{sortKey === 'start' ? (sortAsc ? '▲' : '▼') : ''}
        </th>
        <th>作業メニュー</th>
        <th style={{ cursor: 'pointer' }} onClick={() => { setSortKey('estimatedHours'); setSortAsc(sortKey !== 'estimatedHours' ? true : !sortAsc); }}>
          想定時間{sortKey === 'estimatedHours' ? (sortAsc ? '▲' : '▼') : ''}
        </th>
        <th>メモ</th>
        {dates.map(date => (
          <th key={date} style={{ minWidth: 40, fontWeight: 400 }}>{dayjs(date).format('MM/DD')}</th>
        ))}
      </tr>
    </thead>
    <tbody>
      {taskList.map(task => {
        const startIdx = dates.indexOf(task.start);
        const endIdx = dates.indexOf(task.end);
        const deadlineIdx = task.deadline ? dates.indexOf(task.deadline) : -1;
        const isEdit = editRow === task.id;
        return (
          <tr key={task.id} style={{ borderBottom: '1px solid #eee', whiteSpace: 'nowrap' }}>
            <td>
              <button
                onClick={() => setEditRow(isEdit ? null : task.id)}
                style={{ marginRight: 4, fontSize: 18, padding: '2px 8px', borderRadius: 6, background: isEdit ? '#039be5' : '#aaa', color: '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                title={isEdit ? '編集モードON' : '編集モードOFF'}
              >
                {isEdit ? (
                  <span role="img" aria-label="unlock">🔓</span>
                ) : (
                  <span role="img" aria-label="lock">🔒</span>
                )}
              </button>
            </td>
            <td style={{whiteSpace: 'nowrap'}}>
              {/* バイク写真 */}
              {isEdit ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <label htmlFor={`photo-upload-${task.id}`} style={{ cursor: 'pointer' }}>
                    {task.photoUrl ? (
                      <img src={task.photoUrl} alt="photo" width={200} style={{ borderRadius: 8, border: '2px dashed #2563eb', background: '#f3f6fa', height: 'auto', maxHeight: 160, objectFit: 'contain', aspectRatio: 'auto 1/1' }} />
                    ) : (
                      <FaBicycle style={{ fontSize: 80, color: '#8dbbff', background: '#f3f6fa', borderRadius: 8, border: '2px dashed #2563eb', width: 80, height: 80, display: 'block', margin: '0 auto' }} />
                    )}
                  </label>
                  <input
                    id={`photo-upload-${task.id}`}
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = ev => {
                          handleEdit(task.id, 'photoUrl', ev.target?.result as string);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                  <div
                    onDragOver={e => e.preventDefault()}
                    onDrop={e => {
                      e.preventDefault();
                      const file = e.dataTransfer.files?.[0];
                      if (file && file.type.startsWith('image/')) {
                        const reader = new FileReader();
                        reader.onload = ev => {
                          handleEdit(task.id, 'photoUrl', ev.target?.result as string);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    style={{ fontSize: 12, color: '#2563eb', border: '1px dashed #2563eb', borderRadius: 6, padding: '2px 8px', marginTop: 2, background: '#f3f6fa', cursor: 'pointer' }}
                    title="画像をドラッグ＆ドロップで変更"
                  >
                    ドラッグ&ドロップ可
                  </div>
                </div>
              ) : (
                task.photoUrl ? (
                  <img src={task.photoUrl} alt="photo" width={200} style={{ borderRadius: 8, height: 'auto', maxHeight: 160, objectFit: 'contain', aspectRatio: 'auto 1/1' }} />
                ) : (
                  <FaBicycle style={{ fontSize: 80, color: '#8dbbff', background: '#f3f6fa', borderRadius: 8, border: '2px dashed #2563eb', width: 80, height: 80, display: 'block', margin: '0 auto' }} />
                )
              )}
            </td>
            <td style={{whiteSpace: 'nowrap'}}>
              {isEdit ? (
                <input value={task.name} style={{ width: 70 }} onChange={e => handleEdit(task.id, 'name', e.target.value)} />
              ) : (
                task.name
              )}
            </td>
            <td style={{whiteSpace: 'nowrap'}}>
              {isEdit ? (
                <input value={task.phone} style={{ width: 120 }} onChange={e => handleEdit(task.id, 'phone', e.target.value.replace(/[-ー−]/g, ''))} placeholder="09012345678" pattern="^[0-9]{10,11}$" maxLength={11} inputMode="numeric" />
              ) : (
                <span style={{ color: '#2563eb', fontWeight: 500 }}>{task.phone}</span>
              )}
            </td>
            <td style={{whiteSpace: 'nowrap'}}>
              {isEdit ? (
                <input value={task.email} style={{ width: 180 }} onChange={e => handleEdit(task.id, 'email', e.target.value)} placeholder="example@mail.com" type="email" />
              ) : (
                <span style={{ color: '#2563eb', fontWeight: 500 }}>{task.email}</span>
              )}
            </td>
            <td style={{whiteSpace: 'nowrap'}}>
              {isEdit ? (
                <select value={task.status} onChange={e => handleEdit(task.id, 'status', e.target.value)}>
                  {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              ) : (
                task.status
              )}
            </td>
            <td style={{whiteSpace: 'nowrap'}}>
              {isEdit ? (
                <input type="date" value={task.deadline ?? ''} onChange={e => handleEdit(task.id, 'deadline', e.target.value)} style={{ width: 120 }} />
              ) : (
                task.deadline ?? '未設定'
              )}
            </td>
            <td style={{whiteSpace: 'nowrap'}}>
              {isEdit ? (
                <input type="date" value={task.start} onChange={e => handleEdit(task.id, 'start', e.target.value)} style={{ width: 120 }} />
              ) : (
                task.start
              )}
            </td>
            <td style={{whiteSpace: 'nowrap'}}>
              {/* 作業メニュー欄 */}
              {isEdit ? (
                <input value={task.menu ?? ''} style={{ width: 120 }} onChange={e => handleEdit(task.id, 'menu', e.target.value)} placeholder="例: タイヤ交換" />
              ) : (
                <span style={{ color: '#039be5', fontWeight: 500 }}>{task.menu}</span>
              )}
            </td>
            <td style={{whiteSpace: 'nowrap'}}>
              {isEdit ? (
                <input type="number" value={task.estimatedHours} min={1} style={{ width: 50 }} onChange={e => handleEdit(task.id, 'estimatedHours', e.target.value)} />
              ) : (
                `${task.estimatedHours}h`
              )}
            </td>
            <td style={{whiteSpace: 'nowrap', minWidth: 120}}>
              {isEdit ? (
                <input value={task.memo ?? ''} style={{ width: 120 }} onChange={e => handleEdit(task.id, 'memo', e.target.value)} placeholder="例: 部品発注済" />
              ) : (
                <span style={{ color: '#f59e42', fontWeight: 500 }}>{task.memo}</span>
              )}
            </td>
            {dates.map((date, i) => {
              if (i === startIdx) {
                return (
                  <td key={date} colSpan={endIdx - startIdx + 1} style={{ padding: 0, background: '#e0f7fa', position: 'relative' }}>
                    <div style={{ height: 24, background: statusColor(task.status), borderRadius: 4, position: 'relative' }}>
                      {/* 納車日マーク */}
                      {deadlineIdx >= startIdx && deadlineIdx <= endIdx && (
                        <div style={{ position: 'absolute', left: ((deadlineIdx - startIdx) / (endIdx - startIdx + 1)) * 100 + '%', top: 0, width: 0, height: 0, borderLeft: '8px solid transparent', borderRight: '8px solid transparent', borderBottom: '12px solid #ff5252' }} title="納車日"></div>
                      )}
                    </div>
                  </td>
                );
              }
              if (i > startIdx && i <= endIdx) return null;
              if (i === deadlineIdx && (deadlineIdx < startIdx || deadlineIdx > endIdx)) {
                return <td key={date}><span style={{ color: '#ff5252', fontWeight: 'bold' }}>▼</span></td>;
              }
              return <td key={date}></td>;
            })}
          </tr>
        );
      })}
    </tbody>
  </table>
);
