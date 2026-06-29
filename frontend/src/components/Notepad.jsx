import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Save, Trash2, Palette, PenTool, Type, Eraser, Download } from 'lucide-react';
import './Notepad.css';

const COLORS = ['#f8fafc', '#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899'];
const SIZES = [2, 4, 8, 12];

const Notepad = () => {
  const [mode, setMode] = useState('draw'); // 'draw' | 'text'
  const [notes, setNotes] = useState(() => {
    const saved = localStorage.getItem('omnitool_notes');
    return saved ? JSON.parse(saved) : [];
  });
  const [activeNote, setActiveNote] = useState(null);
  const [noteText, setNoteText] = useState('');
  const [noteTitle, setNoteTitle] = useState('');

  // Drawing state
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#f8fafc');
  const [brushSize, setBrushSize] = useState(4);
  const [isEraser, setIsEraser] = useState(false);

  useEffect(() => {
    localStorage.setItem('omnitool_notes', JSON.stringify(notes));
  }, [notes]);

  // Initialize canvas
  useEffect(() => {
    if (mode === 'draw' && canvasRef.current) {
      const canvas = canvasRef.current;
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      const ctx = canvas.getContext('2d');
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctxRef.current = ctx;

      // Restore saved drawing if editing
      if (activeNote && activeNote.type === 'drawing' && activeNote.data) {
        const img = new Image();
        img.onload = () => ctx.drawImage(img, 0, 0);
        img.src = activeNote.data;
      }
    }
  }, [mode, activeNote]);

  const getPos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    if (e.touches) {
      return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
    }
    return { x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY };
  };

  const startDrawing = (e) => {
    e.preventDefault();
    const { x, y } = getPos(e);
    ctxRef.current.beginPath();
    ctxRef.current.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = useCallback((e) => {
    e.preventDefault();
    if (!isDrawing) return;
    const { x, y } = getPos(e);
    const ctx = ctxRef.current;
    ctx.strokeStyle = isEraser ? '#0f172a' : color;
    ctx.lineWidth = isEraser ? brushSize * 3 : brushSize;
    ctx.lineTo(x, y);
    ctx.stroke();
  }, [isDrawing, color, brushSize, isEraser]);

  const stopDrawing = () => setIsDrawing(false);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const saveNote = () => {
    const title = noteTitle.trim() || `Note ${notes.length + 1}`;
    let noteData;

    if (mode === 'draw') {
      const dataUrl = canvasRef.current.toDataURL();
      noteData = { id: activeNote?.id || Date.now(), title, type: 'drawing', data: dataUrl, updatedAt: new Date().toISOString() };
    } else {
      noteData = { id: activeNote?.id || Date.now(), title, type: 'text', data: noteText, updatedAt: new Date().toISOString() };
    }

    if (activeNote) {
      setNotes(notes.map(n => n.id === activeNote.id ? noteData : n));
    } else {
      setNotes([noteData, ...notes]);
    }
    setActiveNote(null);
    setNoteText('');
    setNoteTitle('');
  };

  const openNote = (note) => {
    setActiveNote(note);
    setNoteTitle(note.title);
    if (note.type === 'text') {
      setMode('text');
      setNoteText(note.data);
    } else {
      setMode('draw');
    }
  };

  const deleteNote = (id) => {
    setNotes(notes.filter(n => n.id !== id));
    if (activeNote?.id === id) {
      setActiveNote(null);
      setNoteText('');
      setNoteTitle('');
    }
  };

  const downloadDrawing = () => {
    const link = document.createElement('a');
    link.download = `${noteTitle || 'drawing'}.png`;
    link.href = canvasRef.current.toDataURL();
    link.click();
  };

  const newNote = (type) => {
    setActiveNote(null);
    setNoteTitle('');
    setNoteText('');
    setMode(type);
  };

  return (
    <div className="notepad-page animate-fade-in">
      <div className="notepad-header">
        <div>
          <h1>Notepad</h1>
          <p>Type or draw your ideas.</p>
        </div>
        <div className="notepad-actions">
          <button className="btn btn-ghost" onClick={() => newNote('text')}>
            <Type size={18} /> New Text
          </button>
          <button className="btn btn-primary" onClick={() => newNote('draw')}>
            <PenTool size={18} /> New Drawing
          </button>
        </div>
      </div>

      <div className="grid-layout">
        {/* Editor */}
        <div className="glass-panel editor-panel">
          <div className="editor-toolbar">
            <input
              type="text"
              className="input-field title-input"
              placeholder="Note title..."
              value={noteTitle}
              onChange={(e) => setNoteTitle(e.target.value)}
            />
            <button className="btn btn-primary btn-sm" onClick={saveNote}>
              <Save size={16} /> Save
            </button>
          </div>

          {mode === 'text' ? (
            <textarea
              className="input-field text-editor"
              placeholder="Start typing your note..."
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
            />
          ) : (
            <>
              <div className="draw-toolbar">
                <div className="color-picker">
                  {COLORS.map(c => (
                    <button
                      key={c}
                      className={`color-dot ${color === c && !isEraser ? 'active' : ''}`}
                      style={{ backgroundColor: c }}
                      onClick={() => { setColor(c); setIsEraser(false); }}
                    />
                  ))}
                </div>
                <div className="size-picker">
                  {SIZES.map(s => (
                    <button
                      key={s}
                      className={`size-dot ${brushSize === s ? 'active' : ''}`}
                      onClick={() => setBrushSize(s)}
                    >
                      <span style={{ width: s + 4, height: s + 4 }}></span>
                    </button>
                  ))}
                </div>
                <button
                  className={`btn-icon tool-btn ${isEraser ? 'eraser-active' : ''}`}
                  onClick={() => setIsEraser(!isEraser)}
                  title="Eraser"
                >
                  <Eraser size={18} />
                </button>
                <button className="btn-icon tool-btn" onClick={clearCanvas} title="Clear">
                  <Trash2 size={18} />
                </button>
                <button className="btn-icon tool-btn" onClick={downloadDrawing} title="Download">
                  <Download size={18} />
                </button>
              </div>
              <canvas
                ref={canvasRef}
                className="draw-canvas"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
              />
            </>
          )}
        </div>

        {/* Saved Notes */}
        <div className="glass-panel notes-list-panel">
          <h3>Saved Notes</h3>
          <div className="notes-list">
            {notes.length === 0 && <p className="empty-state">No notes saved yet.</p>}
            {notes.map(note => (
              <div key={note.id} className="note-card" onClick={() => openNote(note)}>
                <div className="note-card-header">
                  <span className="note-type-badge">{note.type === 'drawing' ? '🎨' : '📝'}</span>
                  <span className="note-title">{note.title}</span>
                  <button className="delete-btn" onClick={(e) => { e.stopPropagation(); deleteNote(note.id); }}>
                    <Trash2 size={14} />
                  </button>
                </div>
                {note.type === 'drawing' ? (
                  <img src={note.data} alt={note.title} className="note-thumbnail" />
                ) : (
                  <p className="note-preview">{note.data.substring(0, 80)}...</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notepad;
