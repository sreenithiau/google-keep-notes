export default class NotesView {
    constructor() {
        this.titleInput = document.getElementById('note-title');
        this.textInput = document.getElementById('note-text');
        this.addButton = document.getElementById('add-note');
        this.searchInput = document.querySelector('.search-input');
        this.pinnedContainer = document.getElementById('pinned-notes');
        this.unpinnedContainer = document.getElementById('notes-list');
        this.notesContainer = document.getElementById('notes-container');

        this.notesContainer.addEventListener('dragover', (e) => e.preventDefault());
        this.notesContainer.addEventListener('drop', (e) => this.onDrop(e));
    }

    setEventHandlers(onEdit, onTogglePin, onDragDrop, onMoveToTrash) {
        this.onEdit = onEdit;
        this.onTogglePin = onTogglePin;
        this.onDragDrop = onDragDrop;
        this.onMoveToTrash = onMoveToTrash;
    }

    getInputs() {
        return { title: this.titleInput.value.trim(), text: this.textInput.value.trim() };
    }

    clearInputs() {
        this.titleInput.value = '';
        this.textInput.value = '';  
    }

    renderNotes(notes) {
        console.log("Rendering notes:", notes); 
        this.pinnedContainer.innerHTML = '';
        this.unpinnedContainer.innerHTML = '';
    
        notes.sort((a, b) => a.position - b.position);
        notes.forEach(note => {
            if (!note.trash) {  
                const noteEl = this.createNoteElement(note);
                
                noteEl.addEventListener('click', (event) => {
                    if (!event.target.classList.contains('pin-btn') && 
                        !event.target.classList.contains('delete-btn')) {
                        this.onEdit(note.id);
                    }
                })
               
                noteEl.querySelector('.delete-btn').addEventListener('click', () => this.onMoveToTrash(note.id));
                noteEl.querySelector('.pin-btn').addEventListener('click', () => this.onTogglePin(note.id));
    
                if (note.pinned) {
                    this.pinnedContainer.appendChild(noteEl);
                } else {
                    this.unpinnedContainer.appendChild(noteEl);
                }
            }
        });
    }
    
    createNoteElement(note) {
        const noteEl = document.createElement('div');
        noteEl.className = 'note-item';
        noteEl.dataset.id = note.id;
        noteEl.draggable = true;
        noteEl.innerHTML = `
            <h3 class="note-title">${note.title}</h3>
            <p class="note-text">${note.text}</p>
            <div class="button-group">
                <button data-id="${note.id}" class="pin-btn">${note.pinned ? 'Unpin' : 'Pin'}</button>
                <button data-id="${note.id}" class="delete-btn">Delete</button>
            </div>
        `;
        noteEl.addEventListener('dragstart', (e) => this.onDragStart(e, note));
        return noteEl;
    }

    onDragStart(event, note) {
        event.dataTransfer.setData('text/plain', note.id);
        event.dataTransfer.setData('application/json', JSON.stringify({ id: note.id, position: note.position }));
    }


    onDrop(event) {
        event.preventDefault();
        
        const draggedNoteId = event.dataTransfer.getData('text/plain');
        const droppedOnNote = event.target.closest('.note-item'); 
    
        if (!droppedOnNote) return;
    
        const droppedOnNoteId = droppedOnNote.dataset.id;

        this.onDragDrop(draggedNoteId, droppedOnNoteId);
    }
    
    

}
