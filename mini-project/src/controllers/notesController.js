import { SERVER_URL } from '../../mocks/handlers.js';

export default class NotesController {
    constructor(model, view, trashview) {
        this.model = model;
        this.view = view;
        this.trashview = trashview;
        this.cacheNotes = { notes: [] };
        this.view.addButton.addEventListener('click', () => this.addNote());
        this.noteid = 0;
      
        this.view.setEventHandlers(
            this.editNote.bind(this),
            this.togglePin.bind(this),
            this.handleDragDrop.bind(this),
            this.moveToTrash.bind(this)
        );

        this.trashview.setEventHandlers(
            this.restoreNote.bind(this),
            this.deleteForever.bind(this)
        );
        

        this.view.searchInput.addEventListener('input', () => this.searchNotes());
        this.loadNotes();
    }

    async loadNotes() {
        const { notes } = await this.model.getNotes();
        this.cacheNotes.notes = notes;
        this.view.renderNotes(notes);
        this.trashview.renderTrashNotes(notes);
        if (navigator.onLine) {
            this.syncOfflineChanges();
        }
    }

    async syncOfflineChanges() {
        const offlineChanges = this.model.getOfflineNotes();
        if (offlineChanges.length > 0) {
            const updatedNotes = await this.model.syncNotes(offlineChanges);
            if (updatedNotes) {
                this.cacheNotes.notes = updatedNotes;
                console.log("Cache updated:", this.cacheNotes.notes);
                this.view.renderNotes(updatedNotes);
                this.trashview.renderTrashNotes(updatedNotes);
            }
        }
    }

    
    async addNote() {
        
        const { title, text } = this.view.getInputs();
        if (!title && !text) return alert('Fields cannot be empty!');

        const note = await this.model.addNote(this.noteid, title, text, false, this.cacheNotes.notes.length, false);
        if (note.success) {
            const newNote = { id: this.noteid, title, text, pinned: false, position: this.noteid, trash:false };
            this.view.clearInputs();
            this.cacheNotes.notes.push(newNote);
            this.view.renderNotes(this.cacheNotes.notes);
            this.noteid++;
        }
    }

    async moveToTrash(id) {
        const note = this.cacheNotes.notes.find(n => n.id == id);
        if (!note) return;
        
        await this.model.updateNote(note.id, note.title, note.text, note.pinned, note.position, true);
        
        // Update cache
        note.trash = true;
        console.log("Moving to trash:", note);
        this.view.renderNotes(this.cacheNotes.notes);
        this.trashview.renderTrashNotes(this.cacheNotes.notes);
    }

    async restoreNote(id) {
        const note = this.cacheNotes.notes.find(n => n.id == id);
        if (!note) return;
        
        await this.model.updateNote(note.id, note.title, note.text, note.pinned, note.position, false);
        
        // Update cache
        note.trash = false;
        console.log("restoring from trash:", note);
        this.trashview.renderTrashNotes(this.cacheNotes.notes);
        this.view.renderNotes(this.cacheNotes.notes);
    }
    

    async deleteForever(id) {
        await this.model.deleteNote(id);
        this.cacheNotes.notes = this.cacheNotes.notes.filter(n => n.id !== id); // Remove permanently in cashe
        this.trashview.renderTrashNotes(this.cacheNotes.notes);
        }

    
    async editNote(id) {
        const note = this.cacheNotes.notes.find(n => n.id == id);
        if (!note) return;
    
        const modal = document.createElement('div');
        modal.classList.add('modal');
    
        modal.innerHTML = `
            <div class="modal-content">
                <h2>Edit Note</h2>
                <input type="text" id="editTitle" value="${note.title}">
                <textarea id="editText">${note.text}</textarea>
                <button id="saveNote">Save</button>
                <button id="closeModal">Close</button>
            </div>
        `;
    
        document.body.appendChild(modal);
    
        // Add event listener to save changes
        document.getElementById('saveNote').addEventListener('click', async () => {
            const newTitle = document.getElementById('editTitle').value;
            const newText = document.getElementById('editText').value;
    
            await this.model.updateNote(id, newTitle, newText, note.pinned, note.position, false);
    
            note.title = newTitle;
            note.text = newText;
    
            this.view.renderNotes(this.cacheNotes.notes);
            document.body.removeChild(modal);
        });
    
        document.getElementById('closeModal').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
    }

    async togglePin(id) {
        const note = this.cacheNotes.notes.find(n => n.id == id);
        if (!note) return;

        note.pinned = !note.pinned;
        await this.model.updateNote(note.id, note.title, note.text, note.pinned, note.position, note.trash);
        this.view.renderNotes(this.cacheNotes.notes);
    }
    
    async handleDragDrop(draggedNoteId, droppedOnNoteId) {
        const notes = [...this.cacheNotes.notes];
        const draggedNote = notes.find(n => n.id == draggedNoteId);
        const targetNote = notes.find(n => n.id == droppedOnNoteId);

        if (!draggedNote || !targetNote) return;

        // dragged note from original position is removed
        const draggedIndex = notes.indexOf(draggedNote);
        notes.splice(draggedIndex, 1);

        //new index for dragged note
        const targetIndex = notes.indexOf(targetNote);

        // Insert dragged note at new index
        notes.splice(targetIndex, 0, draggedNote);

        // Update positions
        const reorderedNotes = notes.map((note, index) => ({ ...note, position: index }));

        this.cacheNotes.notes = reorderedNotes;
        this.view.renderNotes(reorderedNotes);

        await this.model.saveReorderedNotes(reorderedNotes);
    }

    searchNotes() {
        const query = this.view.searchInput.value.toLowerCase();
        const filteredNotes = this.cacheNotes.notes.filter(note =>
            note.title.toLowerCase().includes(query) || note.text.toLowerCase().includes(query)
        );
        this.view.renderNotes(filteredNotes);
    }
}