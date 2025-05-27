import { useMemo, useState, useRef, useLayoutEffect } from 'react';
import dayjs from 'dayjs';
import './App.css';
import { FaTools, FaPlus, FaMinus, FaTrashAlt, FaLock, FaLockOpen } from 'react-icons/fa';
import { statuses } from './types/BikeRepairTask';
import { GanttTable } from './components/GanttTable';
import { getDatesArray } from './utils/ganttUtils';
import type { BikeRepairTask, Status } from './types/BikeRepairTask';
import { v4 as uuidv4 } from 'uuid';

function App() {
  const [taskList, setTaskList] = useState<BikeRepairTask[]>([
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
  ]);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(window.innerWidth);
  const [editRow, setEditRow] = useState<string | null>(null);
  // ガントチャートの表示日数
  const [ganttDays, setGanttDays] = useState(30);
  const [deleteMode, setDeleteMode] = useState(false);

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
    const newId = uuidv4();
    setTaskList([
      ...taskList,
      {
        id: newId,
        name: `客`,
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

  const handleDelete = (id: string) => {
    setTaskList(list => list.filter(task => task.id !== id));
    if (editRow === id) setEditRow(null);
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
          <button onClick={handleAdd} 
            disabled={deleteMode}
            style={{ 
              fontSize: 20, 
              padding: '4px 16px', 
              borderRadius: 8, 
              background: deleteMode ? '#bfc9db' : 'linear-gradient(90deg, #2563eb 0%, #039be5 100%)', 
              color: '#fff', 
              border: 'none', 
              cursor: deleteMode ? 'not-allowed' : 'pointer', 
              boxShadow: '0 2px 8px #2563eb44', 
              fontWeight: 700, 
              letterSpacing: 1, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              opacity: deleteMode ? 0.5 : 1
            }}
          >
            <FaPlus style={{ fontSize: 20, marginRight: 2 }} />
          </button>
          <button
            onClick={() => setDeleteMode(d => !d)}
            style={{ fontSize: 20, padding: '4px 16px', borderRadius: 8, background: deleteMode ? '#ff5252' : '#fff', color: deleteMode ? '#fff' : '#ff5252', border: '2px solid #ff5252', cursor: 'pointer', fontWeight: 700, letterSpacing: 1, boxShadow: deleteMode ? '0 2px 8px #ff525288' : '0 2px 8px #ff525211', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            title={deleteMode ? '削除モード解除' : '削除モード'}
          >
            <FaMinus style={{ fontSize: 20, marginRight: 2 }} />
          </button>
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
          <GanttTable
            taskList={filteredList}
            editRow={editRow}
            setEditRow={setEditRow}
            handleEdit={handleEdit}
            dates={dates}
            sortKey={sortKey}
            setSortKey={setSortKey}
            sortAsc={sortAsc}
            setSortAsc={setSortAsc}
            handleDelete={handleDelete}
            deleteMode={deleteMode}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
