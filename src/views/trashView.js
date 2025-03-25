export default class TrashView {
    constructor() {
        this.trashContainer = document.getElementById('trash-list');
    }

    setEventHandlers(onRestore, onDeletePermanent) {
        this.onRestore = onRestore;
        this.onDeletePermanent = onDeletePermanent;
    }

    renderTrashNotes(trashNotes) {
        this.trashContainer.innerHTML = ''; 
    
        trashNotes.forEach(note => {
            if (note.trash) {
                const noteEl = this.createTrashNoteElement(note);
                this.trashContainer.appendChild(noteEl);
            }
        });
    }

    createTrashNoteElement(note) {
        const noteEl = document.createElement('div');
        noteEl.className = 'note-item';
        noteEl.dataset.id = note.id;
        noteEl.innerHTML = `
            <button data-id="${note.id}" class="restore-btn" title="restore"><i class="fas fa-undo"></i></button>
            <h3 class="note-title">${note.title}</h3>
            <p class="note-text">${note.text}</p>
            <div class="button-group">
                <button data-id="${note.id}" class="delete-forever-btn" title="delete permanently"><i class="fas fa-trash-alt"></i></button>
            </div>
    `;

        noteEl.querySelector('.restore-btn').addEventListener('click', () => this.onRestore(note.id));
        noteEl.querySelector('.delete-forever-btn').addEventListener('click', () => this.onDeletePermanent(note.id));

        return noteEl;
    }
}
