// 

export default class NotesView {
    constructor() {
        this.inputFields = {
            titleInput: document.getElementById('note-title'),
            textInput: document.getElementById('note-text'),
        };
        this.addButton = document.getElementById('add-note');
        this.searchInput = document.querySelector('.search-input');
        this.pinnedContainer = document.getElementById('pinned-notes');
        this.unpinnedContainer = document.getElementById('notes-list');
        this.notesContainer = document.querySelector('.notes__container');
        this.placeholderBox = document.getElementById("placeholder-box");
        this.noteContainer = document.getElementById("note-container");

        this.notesContainer.addEventListener('dragover', (event) => event.preventDefault());
        this.notesContainer.addEventListener('drop', (e) => this.onDrop(e));
     
        this.placeholderBox.addEventListener("click", () => this.toggleNoteInput(true));
        this.noteContainer.addEventListener("focusout", (event) => {
            if (!this.noteContainer.contains(event.relatedTarget)) {
                this.toggleNoteInput(false);
            }
        });

    }

    toggleNoteInput(show) {
        if (show) {
            this.placeholderBox.classList.add("hidden");
            this.noteContainer.classList.add("visible");
            this.placeholderBox.classList.remove("visible");
            this.noteContainer.classList.remove("hidden");
        } else {
            this.placeholderBox.classList.remove("hidden");
            this.placeholderBox.classList.add("visible");
            this.noteContainer.classList.add("hidden");
            this.noteContainer.classList.remove("visible");
        }
    }

    setEventHandlers(onEdit, onTogglePin, onDragDrop, onMoveToTrash) {
        this.onEdit = onEdit;
        this.onTogglePin = onTogglePin;
        this.onDragDrop = onDragDrop;
        this.onMoveToTrash = onMoveToTrash;
    }

    getInputs() {
        return {
            title: this.inputFields.titleInput.value.trim(),
            text: this.inputFields.textInput.value.trim()
        };
    }

    clearInputs() {
        this.inputFields.titleInput.value = '';
        this.inputFields.textInput.value = '';  
    }

    updateNoteElement(note) {
        const noteEl = document.querySelector(`.note-item[data-id="${String(note.id)}"]`);

        // Update title and text content
        const titleEl = noteEl.querySelector('.note-title');
        const textEl = noteEl.querySelector('.note-text');
    
        if (titleEl) titleEl.textContent = note.title;
        if (textEl) textEl.innerHTML = note.text; // Ensure Quill content is properly updated
 
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
                    if (!event.target.classList.contains('fa-thumbtack') && 
                        !event.target.classList.contains('fa-trash')) {
                        this.onEdit(note.id);
                    }
                });

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
        <button data-id="${note.id}" class="pin-btn"><i class="fas fa-thumbtack"></i></button>
        <h3 class="note-title">${note.title}</h3>
        <p class="note-text">${note.text}</p>
        <div class="button-group">
            <button data-id="${note.id}" class="delete-btn" title="delete"><i class="fas fa-trash"></i></button>
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