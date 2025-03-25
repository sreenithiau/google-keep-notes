export default class HandleView {
    constructor() {
        this.notesPage = document.getElementById("notes-page");
        this.trashPage = document.getElementById("trash-page");
        this.notesContainer = document.querySelector(".container__notes");
        this.trashContainer = document.querySelector(".container__trash");
        this.notesPage.addEventListener("click", () => this.showNotes());
        this.trashPage.addEventListener("click", () => this.showTrash());
    } 

    showNotes() {
        this.notesContainer.classList.remove("hidden");
        this.trashContainer.classList.add("hidden");
        this.trashContainer.classList.remove("visible");
    }

    showTrash() {
        this.notesContainer.classList.add("hidden");
        this.trashContainer.classList.remove("hidden");
        this.trashContainer.classList.add("visible");
    }
}


