import { SERVER_URL } from '../../mocks/handlers.js';

export default class NotesModel {
    constructor() {
        this.LOCAL_STORAGE_KEY = 'offlineNotes';
    }

    async getNotes() {
        if (navigator.onLine) {
            const res = await fetch(`${SERVER_URL}/notes`);
            return res.json();
        } else {
            return { notes: this.getOfflineNotes().map(change => change.note) }; // Return only the notes from offline storage
        }
    }

    async addNote(id, title, text, pinned, position, trash) {
        if (navigator.onLine) {
            const response = await fetch(`${SERVER_URL}/notes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, text, pinned, position, trash })
            });
            return await response.json();
        } else {
            // const id = -1;
            const newNote = { id, title, text, pinned, position, trash };
            this.saveOfflineNote(newNote, 'add');
            return { success: true, id };
        }
    }

    async updateNote(id, title, text, pinned, position, trash) {
        if (navigator.onLine) {
            return (await fetch(`${SERVER_URL}/notes/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, text, pinned, position, trash })
            })).ok;
        } else {
            this.saveOfflineNote({ id, title, text, pinned, position, trash }, 'update');
            return true;
        }
    }

    async deleteNote(id) {
        if (navigator.onLine) {
            return (await fetch(`${SERVER_URL}/notes/${id}`, { method: 'DELETE' })).ok;
        } else {
            this.saveOfflineNote({ id }, 'delete');
            return true;
        }
    }

    async syncNotes(changes) {
        const response = await fetch(`${SERVER_URL}/notes/sync`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ changes })
        });
        if (response.ok) {
            this.clearOfflineNotes();
            const data = await response.json();
            return data.notes;
        }
        return null;
    }

    async saveReorderedNotes(reorderedNotes) {
        if (navigator.onLine) {
            try {
                const response = await fetch(`${SERVER_URL}/notes/reorder`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ notes: reorderedNotes })
                });

                if (!response.ok) throw new Error('Failed to save reordered notes');
                return true;
            } catch (error) {
                console.error('Error saving reordered notes:', error);
                return false;
            }
        } else {
            this.saveOfflineNote(reorderedNotes, 'reorder');
            return false;
        }
    }

    getOfflineNotes() {
        const offlineData = localStorage.getItem(this.LOCAL_STORAGE_KEY);
        return offlineData ? JSON.parse(offlineData) : [];
    }

    saveOfflineNote(note, action) {
        const offlineNotes = this.getOfflineNotes();
        offlineNotes.push({ note, action });
        localStorage.setItem(this.LOCAL_STORAGE_KEY, JSON.stringify(offlineNotes));
    }

    clearOfflineNotes() {
        localStorage.removeItem(this.LOCAL_STORAGE_KEY);
    }
}