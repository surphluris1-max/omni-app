import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Sparkles, Plus, CheckCircle, Circle, Folder, Trash2, FolderPlus } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import './Tasks.css';

const Tasks = () => {
  const [isListening, setIsListening] = useState(false);
  const [note, setNote] = useState('');
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('omnitool_tasks');
    return saved ? JSON.parse(saved) : [];
  });
  const [folders, setFolders] = useState(() => {
    const saved = localStorage.getItem('omnitool_folders');
    return saved ? JSON.parse(saved) : ['General', 'Work', 'Personal'];
  });
  const [currentFolder, setCurrentFolder] = useState('General');
  const [newFolderName, setNewFolderName] = useState('');
  const [showNewFolder, setShowNewFolder] = useState(false);
  const micRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('omnitool_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('omnitool_folders', JSON.stringify(folders));
  }, [folders]);

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
      completed: false,
      folder: currentFolder,
    };
    setTasks([...tasks, newTask]);
    setNote('');
    // Stop mic if running
    if (isListening && micRef.current) {
      micRef.current.stop();
      setIsListening(false);
    }
  };

  const toggleTask = (id) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const addFolder = () => {
    const trimmed = newFolderName.trim();
    if (!trimmed || folders.includes(trimmed)) return;
    setFolders([...folders, trimmed]);
    setNewFolderName('');
    setShowNewFolder(false);
    setCurrentFolder(trimmed);
  };

  const arrangeWithAI = async () => {
    try {
      const folderTasks = tasks.filter(t => t.folder === currentFolder);
      const response = await fetch('http://localhost:5000/api/arrange-tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tasks: folderTasks })
      });
      const data = await response.json();
      if(data.arranged) {
        const otherTasks = tasks.filter(t => t.folder !== currentFolder);
        setTasks([...otherTasks, ...data.arranged]);
      }
    } catch (err) {
      console.error("AI arrangement failed, check if backend is running", err);
      alert("AI Arrangement failed. Is the backend running on port 5000?");
    }
  };

  const currentTasks = tasks.filter(t => t.folder === currentFolder);
  const completedCount = currentTasks.filter(t => t.completed).length;
  const pendingCount = currentTasks.length - completedCount;

  // Recharts SVG needs raw hex colors, not CSS var()
  const CHART_COLORS = ['#10b981', '#ef4444'];
  const chartData = [
    { name: 'Completed', value: completedCount },
    { name: 'Pending', value: pendingCount },
  ];

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
            {folders.map(f => (
              <button 
                key={f} 
                className={`folder-tab ${currentFolder === f ? 'active' : ''}`}
                onClick={() => setCurrentFolder(f)}
              >
                <Folder size={14} /> {f}
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

          <form onSubmit={addTask} className="task-input-form">
            <input 
              type="text" 
              className="input-field" 
              placeholder="Add a new task..."
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
          </form>

          <div className="task-list">
            {currentTasks.length === 0 && <p className="empty-state">No tasks in this folder.</p>}
            {currentTasks.map(task => (
              <div key={task.id} className={`task-item ${task.completed ? 'completed' : ''}`}>
                <button className="check-btn" onClick={() => toggleTask(task.id)}>
                  {task.completed ? <CheckCircle size={20} color="#10b981" /> : <Circle size={20} />}
                </button>
                <span className="task-text">{task.text}</span>
                <button className="delete-btn" onClick={() => deleteTask(task.id)} title="Delete task">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel stats-container">
          <h3>Progress Graph</h3>
          {currentTasks.length > 0 ? (
            <div style={{ height: '300px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#f8fafc' }}
                    itemStyle={{ color: '#f8fafc' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="chart-legend flex-center" style={{gap: '1rem'}}>
                <span style={{color: '#10b981'}}>● Completed: {completedCount}</span>
                <span style={{color: '#ef4444'}}>● Pending: {pendingCount}</span>
              </div>
            </div>
          ) : (
            <p className="empty-state">Add tasks to see progress.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Tasks;
