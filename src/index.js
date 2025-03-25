import NotesModel from './models/notesModel.js';
import NotesView from './views/notesView.js';
import TrashView from './views/trashView.js';
import HandleView from './views/handleView.js';
import NotesController from './controllers/notesController.js';
import { worker } from '../mocks/server.js';

async function initApp() {
    await worker.start();
    const controller = new NotesController(new NotesModel(),new NotesView(),new TrashView(),new HandleView());

    document.getElementById("menu-toggle").addEventListener("click", function () {
        const sidebar = document.querySelector(".sidebar");
    
        if (sidebar.classList.contains("visible")) {
            sidebar.classList.remove("visible");
            sidebar.classList.add("hidden");
        } else {
            sidebar.classList.remove("hidden");
            sidebar.classList.add("visible");
        }
    });
    


    window.addEventListener('online', () => {
        console.log('Online');
        controller.syncOfflineChanges();
    });

    window.addEventListener('offline', () => {
        console.log('Offline');
    });
}
// document.addEventListener("DOMContentLoaded", () => new HandleView());
document.addEventListener('DOMContentLoaded', initApp);
