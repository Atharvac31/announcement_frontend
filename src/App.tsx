import React, { useState, useEffect, useCallback } from 'react';
import './App.css';

// --- SVG Icon Components (replaces react-icons to avoid TS errors) ---
const commonIconProps = {
  width: "1em", height: "1em", viewBox: "0 0 24 24", fill: "none",
  stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round" as "round",
  strokeLinejoin: "round" as "round",
};
const IconMessageSquare = (props: React.SVGProps<SVGSVGElement>) => <svg {...commonIconProps} {...props}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>;
const IconThumbsUp = (props: React.SVGProps<SVGSVGElement>) => <svg {...commonIconProps} {...props}><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>;
const IconThumbsDown = (props: React.SVGProps<SVGSVGElement>) => <svg {...commonIconProps} {...props}><path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-3"></path></svg>;
const IconHeart = (props: React.SVGProps<SVGSVGElement>) => <svg {...commonIconProps} {...props}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>;
const IconPlus = (props: React.SVGProps<SVGSVGElement>) => <svg {...commonIconProps} {...props}><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
const IconX = (props: React.SVGProps<SVGSVGElement>) => <svg {...commonIconProps} {...props}><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;
const IconLoader = (props: React.SVGProps<SVGSVGElement>) => <svg {...commonIconProps} {...props}><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg>;

// --- Type Definitions ---
interface Reaction { up: number; down: number; heart: number; }
interface Announcement { id: string; title: string; description?: string; createdAt: string; status: 'active' | 'closed'; commentCount: number; reactions: Reaction; lastActivityAt: string; }
interface Comment { id: string; authorName: string; text: string; createdAt: string; optimistic?: boolean; }

// --- Main App Component ---
const App = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);

  // State for forms
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [commentText, setCommentText] = useState('');

  // State for loading, errors, and UI feedback
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const userId = 'current-user-001'; // Hardcoded user ID

  // --- Utility for showing toast notifications ---
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // --- Data Fetching ---
  const fetchAnnouncements = useCallback(async () => {
    try {
      const res = await fetch('http://localhost:8000/announcement');
      if (!res.ok) throw new Error('Failed to fetch announcements.');
      const data = await res.json();
      setAnnouncements(data.announcements);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'An unknown error occurred.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  const fetchComments = async (id: string) => {
    setComments([]);
    try {
      const res = await fetch(`http://localhost:8000/announcement/${id}/comments`);
      if (!res.ok) throw new Error('Failed to fetch comments.');
      const data = await res.json();
      setComments(data);
    } catch (err) {
      console.error(err);
      showToast('Could not load comments.', 'error');
    }
  };

  // --- Event Handlers & API Calls ---
  const handleSelectAnnouncement = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement);
    fetchComments(announcement.id);
  };

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:8000/announcement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle, description: newDescription }),
      });
      if (!res.ok) throw new Error('Failed to create announcement');
      setNewTitle('');
      setNewDescription('');
      setIsModalOpen(false);
      await fetchAnnouncements();
      showToast('Announcement created successfully!');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'An unknown error occurred.', 'error');
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !selectedAnnouncement) return;

    const optimisticComment: Comment = { id: `optimistic-${Date.now()}`, text: commentText, authorName: 'You', createdAt: new Date().toISOString(), optimistic: true };
    setComments(prev => [optimisticComment, ...prev]);
    setCommentText('');

    try {
      const res = await fetch(`http://localhost:8000/announcement/${selectedAnnouncement.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ authorName: 'You', text: commentText }),
      });
      if (!res.ok) throw new Error('Failed to post comment');
      await fetchComments(selectedAnnouncement.id); // Refresh with real data
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'An unknown error occurred.', 'error');
      setComments(prev => prev.filter(c => c.id !== optimisticComment.id)); // Rollback
    }
  };
  
  const handleRemoveComment = async (commentId: string) => {
    if (!selectedAnnouncement) return;
    const originalComments = comments;
    setComments(prev => prev.filter(c => c.id !== commentId)); // Optimistic removal

    try {
        const res = await fetch(`http://localhost:8000/announcement/${selectedAnnouncement.id}/comments/${commentId}`, {
            method: 'DELETE',
        });
        if (!res.ok) throw new Error('Failed to delete comment');
        showToast('Comment removed.');
        await fetchAnnouncements(); // Refresh count on main list
    } catch (err) {
        showToast(err instanceof Error ? err.message : 'An unknown error occurred.', 'error');
        setComments(originalComments); // Rollback on error
    }
  };

  const handleReaction = async (id: string, type: keyof Reaction) => {
    // Optimistic UI update
    setAnnouncements(prev =>
      prev.map(a => {
        if (a.id === id) {
          const userReaction = a.reactions[type] || 0;
          const newReactions = { ...a.reactions };

          // Toggle logic: If the user already reacted, remove the reaction; otherwise, add it
          if (userReaction > 0) {
            newReactions[type] -= 1; // Remove reaction
          } else {
            newReactions[type] += 1; // Add reaction
          }

          return { ...a, reactions: newReactions };
        }
        return a;
      })
    );

    try {
      const res = await fetch(`http://localhost:8000/announcement/${id}/reactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': userId },
        body: JSON.stringify({ type }),
      });

      if (!res.ok) {
        throw new Error('Failed to update reaction');
      }

      // Refresh data from the server to ensure consistency
      await fetchAnnouncements();
    } catch (err) {
      console.error('Failed to update reaction', err);
      // Rollback on error
      fetchAnnouncements();
    }
  };
  
  // --- Render Functions ---
  const renderDetailView = () => {
    if (!selectedAnnouncement) {
      return (
        <div className="placeholder">
          <h3>Select an announcement</h3>
          <p>Click on an item from the list to view its details.</p>
        </div>
      );
    }
    return (
      <>
        <header className="detail-header">
          <h2>{selectedAnnouncement.title}</h2>
          <p>{selectedAnnouncement.description}</p>
        </header>
        <div className="reaction-bar">
          <button onClick={() => handleReaction(selectedAnnouncement.id, 'up')}><IconThumbsUp /> Like</button>
          <button onClick={() => handleReaction(selectedAnnouncement.id, 'down')}><IconThumbsDown /> Dislike</button>
          <button onClick={() => handleReaction(selectedAnnouncement.id, 'heart')}><IconHeart /> Heart</button>
        </div>
        <div className="comments-section">
          <h4>Comments ({comments.length})</h4>
          <form onSubmit={handleAddComment} className="comment-form">
            <textarea value={commentText} onChange={e => setCommentText(e.target.value)} placeholder="Add a public comment..." required />
            <button type="submit">Comment</button>
          </form>
          <div className="comment-list">
            {comments.map(c => (
              <div key={c.id} className={`comment-item ${c.optimistic ? 'optimistic' : ''}`}>
                <p className="comment-text">{c.text}</p>
                <div className="comment-footer">
                    <span>by {c.authorName} on {new Date(c.createdAt).toLocaleDateString()}</span>
                    <button className="remove-btn" onClick={() => handleRemoveComment(c.id)}>Remove</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </>
    );
  };
  
  return (
    <div className="app-container">
      {toast && <div className={`toast toast-${toast.type}`}>{toast.message}</div>}
      <aside className="sidebar">
        <header className="sidebar-header">
          <h1>Announcements</h1>
          <button className="new-btn" onClick={() => setIsModalOpen(true)}><IconPlus /> New</button>
        </header>
        <div className="announcement-list">
            {isLoading && <div className="spinner-container"><IconLoader className="spinner" /></div>}
            {announcements.map(a => (
                <div key={a.id} className={`announcement-card ${selectedAnnouncement?.id === a.id ? 'selected' : ''}`} onClick={() => handleSelectAnnouncement(a)}>
                    <h3 className="card-title">{a.title}</h3>
                    <p className="card-description">{a.description}</p>
                    <div className="card-meta">
                        <span><IconMessageSquare /> {a.commentCount || 0}</span>
                        <span><IconThumbsUp /> {a.reactions.up || 0}</span>
                        <span><IconThumbsDown /> {a.reactions.down || 0}</span>
                        <span><IconHeart /> {a.reactions.heart || 0}</span>
                    </div>
                    <div className="card-footer">
                        <span>Last activity: {new Date(a.lastActivityAt).toLocaleDateString()}</span>
                        <span className={`status-badge status-${a.status}`}>{a.status}</span>
                    </div>
                </div>
            ))}
        </div>
      </aside>
      <main className="main-content">
        {renderDetailView()}
      </main>
      
      {isModalOpen && (
         <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
           <div className="modal-content" onClick={(e) => e.stopPropagation()}>
             <button className="close-btn" onClick={() => setIsModalOpen(false)}><IconX /></button>
             <h2>Create Announcement</h2>
             <form onSubmit={handleCreateAnnouncement}>
                <div className="form-group">
                    <label htmlFor="title">Title</label>
                    <input id="title" type="text" value={newTitle} onChange={e => setNewTitle(e.target.value)} required />
                </div>
                <div className="form-group">
                    <label htmlFor="description">Description</label>
                    <textarea id="description" value={newDescription} onChange={e => setNewDescription(e.target.value)}></textarea>
                </div>
                <button type="submit" className="submit-btn">Create</button>
             </form>
           </div>
         </div>
       )}
    </div>
  );
};

export default App;

