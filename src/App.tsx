import React, { useState, useEffect } from 'react'
import './App.css'

const App = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [message, setMessage] = useState('');
  const [announcements, setAnnouncements] = useState<any[]>([]);

  const fetchAnnouncements = async () => {
    try {
      const res = await fetch('http://localhost:8000/announcement');
      if (res.ok) {
        const data = await res.json();
        setAnnouncements(data);
      }
    } catch {}
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    try {
      const res = await fetch('http://localhost:8000/announcement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description }),
      });
      if (res.ok) {
        setTitle('');
        setDescription('');
        setMessage('Announcement created!');
        fetchAnnouncements();
      } else {
        setMessage('Failed to create announcement');
      }
    } catch {
      setMessage('Error connecting to backend');
    }
  };

  const handleStatusChange = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'closed' : 'active';
    try {
      const res = await fetch(`http://localhost:8000/announcement/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        fetchAnnouncements();
      } else {
        setMessage('Failed to update status');
      }
    } catch {
      setMessage('Error connecting to backend');
    }
  };

  return (
    <div>
      <div className="headerAnnouncements">
        <h1>Annoucements</h1>
        <p>Welcome to the Announcements App!</p>
      </div>
      <div>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
          />
          <textarea
            placeholder="Description"
            value={description}
            onChange={e => setDescription(e.target.value)}
          ></textarea>
          <button type="submit">Create Announcement</button>
        </form>
        {message && <p style={{textAlign: 'center', color: 'green'}}>{message}</p>}
      </div>
      <div style={{maxWidth: 400, margin: '2rem auto'}}>
        <h2>All Announcements</h2>
        {announcements.length === 0 && <p>No announcements yet.</p>}
        <ul style={{listStyle: 'none', padding: 0}}>
          {announcements.map(a => (
            <li key={a.id} style={{border: '1px solid #ddd', borderRadius: 6, marginBottom: 12, padding: 12}}>
              <strong>{a.title}</strong>
              <div style={{fontSize: '0.95em', color: '#555'}}>{a.description}</div>
              <div style={{fontSize: '0.85em', color: '#888'}}>Status: {a.status} | {new Date(a.createdAt).toLocaleString()}</div>
              <button style={{marginTop: 8}} onClick={() => handleStatusChange(a.id, a.status)}>
                Set {a.status === 'active' ? 'Closed' : 'Active'}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default App