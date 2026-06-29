import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Sparkles, Plus, CheckCircle, Circle, Folder, Trash2, FolderPlus, XCircle, Clock, Users, User } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis } from 'recharts';
import { useUser } from '../context/UserContext';
import './Tasks.css';

const Tasks = () => {
  const { user, groups } = useUser();
  const [isListening, setIsListening] = useState(false);
  const [note, setNote] = useState('');
  
  // Status can be: 'pending', 'completed', 'abandoned', 'extended'
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('omnitool_tasks');
    if (saved) {
      // Migrate old tasks (completed: boolean -> status)
      const parsed = JSON.parse(saved);
      return parsed.map(t => ({
        ...t,
        status: t.status || (t.completed ? 'completed' : 'pending'),
        assigneeId: t.assigneeId || null,
        completedById: t.completedById || null,
      }));
    }
    return [];
  });
  
  const [folders, setFolders] = useState(() => {
    const saved = localStorage.getItem('omnitool_folders');
    return saved ? JSON.parse(saved) : ['General', 'Work', 'Personal'];
  });
  
  const [currentFolder, setCurrentFolder] = useState('General');
  const [newFolderName, setNewFolderName] = useState('');
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [selectedAssignee, setSelectedAssignee] = useState('');
  const micRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('omnitool_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('omnitool_folders', JSON.stringify(folders));
  }, [folders]);

  // Determine if current folder is a group
  const activeGroup = groups.find(g => g.id === currentFolder);
  const isGroupView = !!activeGroup;

  const handleListen = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Voice input is not supported in your browser. Try Chrome.');
      return;
    }

    if (isListening && micRef.current) {
      micRef.current.stop();
      setIsListening(false);
      return;
    }

    const mic = new SpeechRecognition();
    mic.continuous = true;
    mic.interimResults = true;
    mic.lang = 'en-US';
    micRef.current = mic;

    mic.onresult = event => {
      const transcript = Array.from(event.results)
        .map(result => result[0])
        .map(result => result.transcript)
        .join('');
      setNote(transcript);
    };
    mic.onerror = () => {
      mic.stop();
      setIsListening(false);
    };
    mic.onend = () => {
      setIsListening(false);
    };

    mic.start();
    setIsListening(true);
  };

  const addTask = (e) => {
    if(e) e.preventDefault();
    if (!note.trim()) return;
    const newTask = {
      id: Date.now().toString(),
      text: note,
      status: 'pending',
      folder: currentFolder,
      assigneeId: isGroupView && selectedAssignee ? selectedAssignee : null,
      completedById: null
    };
    setTasks([...tasks, newTask]);
    setNote('');
    if (isListening && micRef.current) {
      micRef.current.stop();
      setIsListening(false);
    }
  };

  const setTaskStatus = (id, newStatus) => {
    setTasks(tasks.map(t => {
      if (t.id === id) {
        // If marking complete in a group, attribute to the assignee or the current user
        const completedById = newStatus === 'completed' 
          ? (t.assigneeId || user.id) 
          : null;
        return { ...t, status: newStatus, completedById };
      }
      return t;
    }));
  };

  const toggleTaskComplete = (task) => {
    if (task.status === 'completed') {
      setTaskStatus(task.id, 'pending');
    } else {
      setTaskStatus(task.id, 'completed');
    }
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const addFolder = () => {
    const trimmed = newFolderName.trim();
    if (!trimmed || folders.includes(trimmed) || groups.find(g => g.name === trimmed)) return;
    setFolders([...folders, trimmed]);
    setNewFolderName('');
    setShowNewFolder(false);
    setCurrentFolder(trimmed);
  };

  const arrangeWithAI = async () => {
    try {
      const folderTasks = tasks.filter(t => t.folder === currentFolder && t.status === 'pending');
      const response = await fetch('http://localhost:5000/api/arrange-tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tasks: folderTasks })
      });
      const data = await response.json();
      if(data.arranged) {
        const otherTasks = tasks.filter(t => t.folder !== currentFolder || t.status !== 'pending');
        setTasks([...otherTasks, ...data.arranged]);
      }
    } catch (err) {
      console.error("AI arrangement failed, check if backend is running", err);
      alert("AI Arrangement failed. Is the backend running on port 5000?");
    }
  };

  const currentTasks = tasks.filter(t => t.folder === currentFolder);
  const pendingTasks = currentTasks.filter(t => t.status === 'pending' || t.status === 'extended');
  const completedCount = currentTasks.filter(t => t.status === 'completed').length;
  const abandonedCount = currentTasks.filter(t => t.status === 'abandoned').length;
  const pendingCount = pendingTasks.length;

  const CHART_COLORS = ['#10b981', '#f59e0b', '#ef4444'];
  const chartData = [
    { name: 'Completed', value: completedCount },
    { name: 'Pending/Extended', value: pendingCount },
    { name: 'Abandoned', value: abandonedCount }
  ].filter(d => d.value > 0);

  // Group Contribution Data
  const getContributionData = () => {
    if (!activeGroup) return [];
    const stats = {};
    activeGroup.members.forEach(mId => {
      stats[mId] = 0;
    });
    currentTasks.forEach(t => {
      if (t.status === 'completed' && t.completedById) {
        if (stats[t.completedById] !== undefined) {
          stats[t.completedById] += 1;
        }
      }
    });
    return Object.keys(stats).map(mId => ({
      name: mId === user.id ? 'You' : `User ${mId.substring(0,4)}`,
      completed: stats[mId]
    })).sort((a,b) => b.completed - a.completed);
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'completed': return <CheckCircle size={20} color="#10b981" />;
      case 'abandoned': return <XCircle size={20} color="#ef4444" />;
      case 'extended': return <Clock size={20} color="#f59e0b" />;
      default: return <Circle size={20} />;
    }
  };

  return (
    <div className="tasks-page animate-fade-in">
      <div className="tasks-header">
        <div>
          <h1>Tasks & AI</h1>
          <p>Organize your day, visually.</p>
        </div>
        <button className="btn btn-primary" onClick={arrangeWithAI}>
          <Sparkles size={18} /> Arrange with AI
        </button>
      </div>

      <div className="grid-layout">
        <div className="glass-panel tasks-container">
          <div className="folder-tabs">
            {/* Personal Folders */}
            {folders.map(f => (
              <button 
                key={f} 
                className={`folder-tab ${currentFolder === f ? 'active' : ''}`}
                onClick={() => setCurrentFolder(f)}
              >
                <Folder size={14} /> {f}
              </button>
            ))}
            {/* Group Folders */}
            {groups.map(g => (
              <button 
                key={g.id} 
                className={`folder-tab group-tab ${currentFolder === g.id ? 'active' : ''}`}
                onClick={() => {
                  setCurrentFolder(g.id);
                  setSelectedAssignee('');
                }}
              >
                <Users size={14} /> {g.name}
              </button>
            ))}
            {showNewFolder ? (
              <div className="new-folder-input">
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="Folder name"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addFolder()}
                  autoFocus
                  style={{padding: '0.4rem 0.8rem', fontSize: '0.85rem', width: '120px'}}
                />
              </div>
            ) : (
              <button className="folder-tab" onClick={() => setShowNewFolder(true)}>
                <FolderPlus size={14} /> New
              </button>
            )}
          </div>

          <form onSubmit={addTask} className="task-input-form flex-col">
            <div className="task-input-row">
              <input 
                type="text" 
                className="input-field" 
                placeholder={isGroupView ? "Add a group task..." : "Add a new task..."}
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
              <button 
                type="button" 
                className={`btn-icon ${isListening ? 'listening' : ''}`}
                onClick={handleListen}
                title="Voice Input"
              >
                {isListening ? <MicOff size={20} /> : <Mic size={20} />}
              </button>
              <button type="submit" className="btn-icon add-btn">
                <Plus size={20} />
              </button>
            </div>
            {isGroupView && (
              <div className="assignee-select">
                <span className="text-sm text-muted">Assign to:</span>
                <select 
                  className="input-field select-sm" 
                  value={selectedAssignee}
                  onChange={(e) => setSelectedAssignee(e.target.value)}
                >
                  <option value="">Anyone</option>
                  {activeGroup.members.map(mId => (
                    <option key={mId} value={mId}>
                      {mId === user.id ? 'Me' : `User ${mId.substring(0,4)}`}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </form>

          <div className="task-list">
            {currentTasks.length === 0 && <p className="empty-state">No tasks here yet.</p>}
            {currentTasks.map(task => (
              <div key={task.id} className={`task-item status-${task.status}`}>
                <button className="check-btn" onClick={() => toggleTaskComplete(task)}>
                  {getStatusIcon(task.status)}
                </button>
                <div className="task-content">
                  <span className="task-text">{task.text}</span>
                  {task.assigneeId && (
                    <span className="task-assignee">
                      <User size={12} /> 
                      {task.assigneeId === user.id ? 'You' : `User ${task.assigneeId.substring(0,4)}`}
                    </span>
                  )}
                </div>
                
                <div className="task-actions">
                  {task.status !== 'completed' && task.status !== 'abandoned' && (
                    <>
                      <button className="action-btn text-warning" onClick={() => setTaskStatus(task.id, 'extended')} title="Extend Task">
                        <Clock size={16} />
                      </button>
                      <button className="action-btn text-danger" onClick={() => setTaskStatus(task.id, 'abandoned')} title="Abandon Task">
                        <XCircle size={16} />
                      </button>
                    </>
                  )}
                  <button className="action-btn text-muted hover-danger" onClick={() => deleteTask(task.id)} title="Delete permanently">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel stats-container flex-col-gap">
          <div className="stat-card">
            <h3>Progress Graph</h3>
            {chartData.length > 0 ? (
              <div style={{ height: '200px', width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={70}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#f8fafc' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="chart-legend">
                  {chartData.map((d, i) => (
                    <span key={d.name} style={{color: CHART_COLORS[i]}}>● {d.name}: {d.value}</span>
                  ))}
                </div>
              </div>
            ) : (
              <p className="empty-state text-sm">Add tasks to see progress.</p>
            )}
          </div>

          {isGroupView && currentTasks.length > 0 && (
            <div className="stat-card">
              <h3>Contribution Leaderboard</h3>
              <div style={{ height: '200px', width: '100%', marginTop: '1rem' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={getContributionData()} layout="vertical" margin={{ top: 0, right: 0, left: 10, bottom: 0 }}>
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} width={70} />
                    <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#f8fafc' }}/>
                    <Bar dataKey="completed" fill="#06b6d4" radius={[0, 4, 4, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Tasks;
