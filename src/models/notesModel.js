import { SERVER_URL } from '../../mocks/handlers.js';

const LOCAL_STORAGE_KEYS = {
    offlineNotes: 'OFFLINE_NOTES'
};

export default class NotesModel {
    constructor() {
        this.LOCAL_STORAGE_KEY = LOCAL_STORAGE_KEYS.offlineNotes;
    }

    async getNotes() {
        try {
            if (navigator.onLine) {
                const res = await fetch(`${SERVER_URL}/notes`);
                if (!res.ok) throw new Error('Failed to fetch notes');
                return await res.json();
            } else {
                return { notes: this.getOfflineNotes().map(change => change.note) };
            }
        } catch (error) {
            console.error('Error fetching notes:', error);
            return { notes: [] };
        }
    }

    async addNote(id, title, text, pinned, position, trash) {
        try {
            if (navigator.onLine) {
                const response = await fetch(`${SERVER_URL}/notes`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ title, text, pinned, position, trash })
                });
                if (!response.ok) throw new Error('Failed to add note');
                return await response.json();
            } else {
                const newNote = { id, title, text, pinned, position, trash };
                this.saveOfflineNote(newNote, 'add');
                return { success: true, id };
            }
        } catch (error) {
            console.error('Error adding note:', error);
            return { success: false };
        }
    }

    async updateNote(id, title, text, pinned, position, trash) {
        try {
            if (navigator.onLine) {
                const response = await fetch(`${SERVER_URL}/notes/${id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ title, text, pinned, position, trash })
                });
                if (!response.ok) throw new Error('Failed to update note');
                return true;
            } else {
                this.saveOfflineNote({ id, title, text, pinned, position, trash }, 'update');
                return true;
            }
        } catch (error) {
            console.error('Error updating note:', error);
            return false;
        }
    }

    async deleteNote(id) {
        try {
            if (navigator.onLine) {
                const response = await fetch(`${SERVER_URL}/notes/${id}`, { method: 'DELETE' });
                if (!response.ok) throw new Error('Failed to delete note');
                return true;
            } else {
                this.saveOfflineNote({ id }, 'delete');
                return true;
            }
        } catch (error) {
            console.error('Error deleting note:', error);
            return false;
        }
    }

    async syncNotes(changes) {
        try {
            const response = await fetch(`${SERVER_URL}/notes/sync`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ changes })
            });
            if (!response.ok) throw new Error('Failed to sync notes');
            this.clearOfflineNotes();
            const data = await response.json();
            return data.notes;
        } catch (error) {
            console.error('Error syncing notes:', error);
            return null;
        }
    }

    async saveReorderedNotes(reorderedNotes) {
        try {
            if (navigator.onLine) {
                const response = await fetch(`${SERVER_URL}/notes/reorder`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ notes: reorderedNotes })
                });
                if (!response.ok) throw new Error('Failed to save reordered notes');
                return true;
            } else {
                this.saveOfflineNote(reorderedNotes, 'reorder');
                return false;
            }
        } catch (error) {
            console.error('Error saving reordered notes:', error);
            return false;
        }
    }

    getOfflineNotes() {
        try {
            const offlineData = localStorage.getItem(this.LOCAL_STORAGE_KEY);
            return offlineData ? JSON.parse(offlineData) : [];
        } catch (error) {
            console.error('Error retrieving offline notes:', error);
            return [];
        }
    }

    saveOfflineNote(note, action) {
        try {
            const offlineNotes = this.getOfflineNotes();
            offlineNotes.push({ note, action });
            localStorage.setItem(this.LOCAL_STORAGE_KEY, JSON.stringify(offlineNotes));
        } catch (error) {
            console.error('Error saving offline note:', error);
        }
    }

    clearOfflineNotes() {
        try {
            localStorage.removeItem(this.LOCAL_STORAGE_KEY);
        } catch (error) {
            console.error('Error clearing offline notes:', error);
        }
    }
}