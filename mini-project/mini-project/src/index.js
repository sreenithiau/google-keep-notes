import NotesModel from './models/notesModel.js';
import NotesView from './views/notesView.js';
import TrashView from './views/trashView.js';
import NotesController from './controllers/notesController.js';
import { worker } from '../mocks/server.js';

async function initApp() {
    await worker.start();
    const controller = new NotesController(new NotesModel(),new NotesView(),new TrashView());

    document.getElementById("notes-page").addEventListener("click", () => {
        document.querySelector(".container__notes").style.display = "block";
        document.querySelector(".container__trash").style.display = "none";
    });

    document.getElementById("trash-page").addEventListener("click", () => {
        document.querySelector(".container__notes").style.display = "none";
        document.querySelector(".container__trash").style.display = "block";
    });

    window.addEventListener('online', () => {
        console.log('Online');
        controller.syncOfflineChanges();
    });

    window.addEventListener('offline', () => {
        console.log('Offline');
    });
}

document.addEventListener('DOMContentLoaded', initApp);
