import { useMemo, useState, useRef, useLayoutEffect } from 'react';
import dayjs from 'dayjs';
import './App.css';
import { FaTools, FaBicycle } from 'react-icons/fa';

const statuses = [
  '未着手',
  '部品発注済み',
  '部品到着',
  '保留',
  '作業中',
  '完了',
] as const;
type Status = typeof statuses[number];

interface BikeRepairTask {
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
}

const tasks: BikeRepairTask[] = [
  {
    id: '1',
    name: '田中 太郎',
    phone: '09012345678',
    email: '',
    photoUrl: '', // デフォルトは空
    status: '未着手',
    deadline: dayjs().add(2, 'day').format('YYYY-MM-DD'),
    estimatedHours: 3,
    start: dayjs().format('YYYY-MM-DD'),
    end: dayjs().add(1, 'day').format('YYYY-MM-DD'),
    menu: '',
    memo: '',
  },
  {
    id: '2',
    name: '鈴木 次郎',
    phone: '08098765432',
    email: '',
    photoUrl: '', // デフォルトは空
    status: '作業中',
    deadline: dayjs().add(4, 'day').format('YYYY-MM-DD'),
    estimatedHours: 2,
    start: dayjs().add(1, 'day').format('YYYY-MM-DD'),
    end: dayjs().add(3, 'day').format('YYYY-MM-DD'),
    menu: '',
    memo: '',
  },
];

function getDatesArray(start: dayjs.Dayjs, end: dayjs.Dayjs) {
  const arr = [];
  let d = start;
  while (d.isBefore(end) || d.isSame(end, 'day')) {
    arr.push(d.format('YYYY-MM-DD'));
    d = d.add(1, 'day');
  }
  return arr;
}

// ガントチャートの色分け関数
const statusColor = (status: Status) => {
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

function App() {
  const [taskList, setTaskList] = useState(tasks);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(window.innerWidth);
  const [editRow, setEditRow] = useState<string | null>(null);
  // ガントチャートの表示日数
  const [ganttDays, setGanttDays] = useState(30);

  // ソート・検索用state
  const [sortKey, setSortKey] = useState<null | keyof BikeRepairTask>(null);
  const [sortAsc, setSortAsc] = useState(true);
  const [searchName, setSearchName] = useState('');

  // 表示領域の幅を取得
  useLayoutEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      } else {
        setContainerWidth(window.innerWidth);
      }
    };
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  // 日付範囲をganttDaysで可変に
  const { min, max } = useMemo(() => {
    const today = dayjs();
    return { min: today, max: today.add(ganttDays - 1, 'day') };
  }, [taskList, ganttDays]);
  const dates = useMemo(() => getDatesArray(min, max), [min, max]);

  // ソート・検索適用
  const filteredList = useMemo(() => {
    let list = [...taskList];
    if (searchName.trim()) {
      list = list.filter(t => t.name.includes(searchName.trim()));
    }
    if (sortKey) {
      list.sort((a, b) => {
        let va = a[sortKey], vb = b[sortKey];
        if (sortKey === 'estimatedHours') {
          va = Number(va); vb = Number(vb);
        }
        if (sortKey === 'deadline' || sortKey === 'start') {
          va = va || '';
          vb = vb || '';
        }
        if (sortKey === 'status') {
          va = statuses.indexOf(va as Status);
          vb = statuses.indexOf(vb as Status);
        }
        // null/undefined対応
        if (va == null && vb == null) return 0;
        if (va == null) return sortAsc ? 1 : -1;
        if (vb == null) return sortAsc ? -1 : 1;
        if (va < vb) return sortAsc ? -1 : 1;
        if (va > vb) return sortAsc ? 1 : -1;
        return 0;
      });
    }
    return list;
  }, [taskList, sortKey, sortAsc, searchName]);

  // アイテム追加ハンドラ
  const handleAdd = () => {
    const n = taskList.length + 1;
    setTaskList([
      ...taskList,
      {
        id: String(n),
        name: `新規顧客${n}`,
        phone: '',
        email: '',
        photoUrl: '', // デフォルトは空
        status: '未着手',
        deadline: null,
        estimatedHours: 1,
        start: min.format('YYYY-MM-DD'),
        end: min.add(1, 'day').format('YYYY-MM-DD'),
        menu: '',
        memo: '',
      },
    ]);
  };

  // 編集ハンドラ
  const handleEdit = (id: string, key: keyof BikeRepairTask, value: string) => {
    setTaskList(list =>
      list.map(task => {
        if (task.id !== id) return task;
        if (key === 'estimatedHours') {
          // 想定時間変更時はendも自動計算
          const hours = Number(value);
          const start = dayjs(task.start);
          const days = Math.ceil(hours / 8);
          return {
            ...task,
            estimatedHours: hours,
            end: start.add(days - 1, 'day').format('YYYY-MM-DD'),
          };
        }
        if (key === 'start') {
          // 着手日変更時はendも自動計算
          const start = dayjs(value);
          const days = Math.ceil(task.estimatedHours / 8);
          return {
            ...task,
            start: value,
            end: start.add(days - 1, 'day').format('YYYY-MM-DD'),
          };
        }
        if (key === 'phone') {
          // ハイフンを拒否
          if (/[-ー−]/.test(value)) return task;
        }
        return { ...task, [key]: value };
      })
    );
  };

  return (
    <div ref={containerRef} style={{
      width: '100vw',
      height: '100vh',
      minHeight: '100vh',
      minWidth: '100vw',
      background: '#f8f8f8',
      margin: 0,
      padding: '0 2rem 0 0', // 右だけ1remのpadding
      boxSizing: 'border-box',
      overflow: 'auto',
      position: 'relative',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', margin: '0 2rem 0 1rem', background: 'linear-gradient(90deg, #e0e7ff 0%, #f3f6fa 100%)', boxShadow: '0 4px 24px #0002', position: 'relative', borderBottom: '2px solid #2563eb', minHeight: 80
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, width: '100%', justifyContent: 'center' }}>
          <FaTools style={{ fontSize: 32, color: '#8dbbff', filter: 'drop-shadow(0 1px 4px #0001)' }} />
          <h1 style={{
            margin: 0,
            padding: '16px 2rem 16px 0',
            fontWeight: 700,
            fontSize: 30,
            letterSpacing: 1.5,
            color: '#8dbbff',
            textShadow: '0 1px 4px #0001',
            fontFamily: 'Inter, "Segoe UI", sans-serif',
            borderRadius: 8,
            boxShadow: 'none',
            display: 'inline-block',
            lineHeight: 1.1
          }}>
            Repair Dashboard
          </h1>
        </div>
        <div style={{ position: 'absolute', left: 180, top: 10, display: 'flex', gap: 12, alignItems: 'center', zIndex: 2 }}>
          <button onClick={handleAdd} style={{ fontSize: 20, padding: '4px 16px', borderRadius: 8, background: 'linear-gradient(90deg, #2563eb 0%, #039be5 100%)', color: '#fff', border: 'none', cursor: 'pointer', boxShadow: '0 2px 8px #2563eb44', fontWeight: 700, letterSpacing: 1 }}>＋</button>
        </div>
        <div style={{ position: 'absolute', right: Math.max((containerWidth - 1280) / 2, 32), top: 16, display: 'flex', gap: 12, alignItems: 'center' }}>
          <label style={{ fontWeight: 700, color: '#2563eb', fontSize: 16, textShadow: '0 1px 0 #fff' }}>
            表示日数
            <input type="number" min={7} max={365} value={ganttDays} onChange={e => setGanttDays(Number(e.target.value))} style={{ width: 60, marginLeft: 6, marginRight: 2, borderRadius: 6, border: '1px solid #2563eb', fontWeight: 600, color: '#2563eb', background: '#fff' }} />日
          </label>
        </div>
        <div style={{ position: 'absolute', left: 420, top: 10, display: 'flex', gap: 8, alignItems: 'center', zIndex: 2 }}>
          <input
            type="text"
            value={searchName}
            onChange={e => setSearchName(e.target.value)}
            placeholder="名前で検索"
            style={{ width: 120, fontSize: 15, border: '1.5px solid #2563eb', borderRadius: 8, padding: '4px 12px', background: '#f3f6fa', color: '#2563eb', fontWeight: 600, boxShadow: '0 1px 4px #2563eb22' }}
          />
        </div>
      </div>
      <div style={{
        margin: 0,
        marginTop: 0,
        padding: '24px 0 0 0',
        width: '100vw',
        minWidth: 0,
        overflowX: 'auto',
        background: 'none',
      }}>
        <div style={{ minWidth: 900, width: 'max-content', margin: '0 2rem 0 1rem', padding: 0 }}>
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
                <th style={{ cursor: 'pointer' }} onClick={() => { setSortKey('status'); setSortAsc(k => sortKey !== 'status' ? true : !k); }}>
                  進捗{sortKey === 'status' ? (sortAsc ? '▲' : '▼') : ''}
                </th>
                <th style={{ cursor: 'pointer' }} onClick={() => { setSortKey('deadline'); setSortAsc(k => sortKey !== 'deadline' ? true : !k); }}>
                  締切{sortKey === 'deadline' ? (sortAsc ? '▲' : '▼') : ''}
                </th>
                <th style={{ cursor: 'pointer' }} onClick={() => { setSortKey('start'); setSortAsc(k => sortKey !== 'start' ? true : !k); }}>
                  着手日{sortKey === 'start' ? (sortAsc ? '▲' : '▼') : ''}
                </th>
                <th>作業メニュー</th>
                <th style={{ cursor: 'pointer' }} onClick={() => { setSortKey('estimatedHours'); setSortAsc(k => sortKey !== 'estimatedHours' ? true : !k); }}>
                  想定時間{sortKey === 'estimatedHours' ? (sortAsc ? '▲' : '▼') : ''}
                </th>
                <th>メモ</th>
                {dates.map(date => (
                  <th key={date} style={{ minWidth: 40, fontWeight: 400 }}>{dayjs(date).format('MM/DD')}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredList.map(task => {
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
        </div>
      </div>
    </div>
  );
}

export default App;
