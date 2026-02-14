import { useState, useEffect } from 'react'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import './App.css'

function App() {
  const [notes, setNotes] = useState(() => {
    const saved = localStorage.getItem("my-pro-notes");
    return saved ? JSON.parse(saved) : [];
  });
  
  const [inputValue, setInputValue] = useState("");
  const [category, setCategory] = useState("General");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [editId, setEditId] = useState(null);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("dark-mode") === "true");

  useEffect(() => {
    localStorage.setItem("my-pro-notes", JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    localStorage.setItem("dark-mode", darkMode);
  }, [darkMode]);

  const addNote = () => {
    if (inputValue.trim()) {
      if (editId) {
        setNotes(notes.map(note => 
          note.id === editId ? { ...note, text: inputValue, category: category } : note
        ));
        setEditId(null);
      } else {
        const now = new Date();
        const dateString = `${now.toLocaleDateString()} ${now.toLocaleTimeString()}`;
        setNotes([{ id: Date.now(), text: inputValue, date: dateString, category: category }, ...notes]);
      }
      setInputValue("");
    }
  };

  const deleteNote = (id) => setNotes(notes.filter(note => note.id !== id));

  const startEdit = (note) => {
    setInputValue(note.text);
    setCategory(note.category);
    setEditId(note.id);
  };

  const downloadPDF = () => {
    try {
      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.text("My Personal Diary", 14, 20);
      
      if (notes.length === 0) {
        alert("ထုတ်စရာ မှတ်စု မရှိသေးပါ!");
        return;
      }

      const tableColumn = ["Date", "Category", "Content"];
      const tableRows = notes.map(note => [note.date, note.category, note.text]);

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 30,
        theme: 'grid',
        styles: { font: 'helvetica' }
      });

      doc.save("diary.pdf");
    } catch (err) {
      console.error("PDF Logic Error:", err);
      alert("PDF Error: " + err.message);
    }
  };

  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.text.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "All" || note.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className={`app-wrapper ${darkMode ? 'dark' : 'light'}`}>
      <div className="container">
        <header>
          <h1>My Pro Diary 📖</h1>
          <div className="header-btns">
            <button className="pdf-btn" onClick={downloadPDF}>📥 PDF ထုတ်မည်</button>
            <button className="theme-toggle" onClick={() => setDarkMode(!darkMode)}>
              {darkMode ? '☀️' : '🌙'}
            </button>
          </div>
        </header>

        {/* Search and Filter Section */}
        <div className="input-container">
          <input 
            type="text" 
            placeholder="ရှာဖွေရန်..." 
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select onChange={(e) => setFilterCategory(e.target.value)} className="category-select">
            <option value="All">အားလုံး</option>
            <option value="General">အထွေထွေ</option>
            <option value="Work">အလုပ်</option>
            <option value="Health">ကျန်းမာရေး</option>
            <option value="Love">အချစ်ရေး</option>
          </select>
        </div>

        {/* Note Input Section */}
        <div className="input-group">
          <textarea 
            className="main-input"
            value={inputValue} 
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={editId ? "ပြင်ဆင်ရန်..." : "မှတ်စုအသစ်..."}
          />
          <div className="input-actions">
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="category-tag-select">
              <option value="General">General</option>
              <option value="Work">Work</option>
              <option value="Health">Health</option>
              <option value="Love">Love</option>
            </select>
            <button className="add-btn" onClick={addNote}>{editId ? "Update" : "Add"}</button>
          </div>
        </div>

        {/* Note List Section */}
        <div className="note-list">
          {filteredNotes.length === 0 ? <p style={{textAlign: 'center', opacity: 0.5}}>မှတ်စု မတွေ့ပါ</p> : 
            filteredNotes.map((note) => (
              <div key={note.id} className={`note-item fade-in border-${note.category}`}>
                <div className="note-content">
                  <span className={`tag ${note.category}`}>{note.category}</span>
                  <span className="note-text">{note.text}</span>
                  <small className="note-date">{note.date}</small>
                </div>
                <div className="actions">
                  <button className="edit-btn" onClick={() => startEdit(note)}>✎</button>
                  <button className="del-btn" onClick={() => deleteNote(note.id)}>✖</button>
                </div>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  )
}

export default App