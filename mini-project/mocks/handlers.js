import { http, HttpResponse } from "msw";

export const SERVER_URL = 'http://localhost:5070';

let notesId = 0;
let notes = [];

export const handlers = [
    http.get(`${SERVER_URL}/notes`, ({ request, params, cookies }) => {
        return HttpResponse.json({ notes });
    }),
    http.post(`${SERVER_URL}/notes`, async ({ request, params, cookies }) => {
        const requestBody = await request.json();
        if (!requestBody.title && !requestBody.text) {
            return HttpResponse(null, { status: 400 });
        }
        notes.push({
            id: notesId++,
            title: requestBody.title,
            text: requestBody.text
        });
        return HttpResponse.json({ success: true,id:notesId-1 });
    }),
    http.patch(`${SERVER_URL}/notes/:id`, async ({ request, params, cookies }) => {
        const note = notes.find((n) => n.id === Number(params.id));
        if (!note) {
            return new HttpResponse(null, { status: 400 });
        }
        const requestBody = await request.json();
        if (requestBody.title) {
            note.title = requestBody.title;
        }

        if (requestBody.text) {
            note.text = requestBody.text;
        }
        console.log("Patching note:", note);
        return HttpResponse.json({ success: true });
    }),
    http.delete(`${SERVER_URL}/notes/:id`, async ({ request, params, cookies }) => {
        const noteIndex = notes.findIndex((n) => n.id === Number(params.id));
        if (noteIndex === -1) {
            return HttpResponse(null, { status: 400 });
        }
        notes.splice(noteIndex, 1);
        return HttpResponse.json({ success: true });
    }),
    //     http.post(`${SERVER_URL}/notes/sync`, async ({ request, params, cookies }) => {
    //         const responseBody = await request.json();
    //         if (!responseBody.notes || !responseBody.notes.length) {
    //             return HttpResponse(null, { status: 400 });
    //         }
    //         notes = responseBody.notes;
            
    //         return HttpResponse.json({ success: true });
    //     })
    // ];

    http.post(`${SERVER_URL}/notes/reorder`, async ({ request, params, cookies }) => {
        const responseBody = await request.json();
    
        if (!responseBody.notes || !Array.isArray(responseBody.notes)) {
            return new HttpResponse(null, { status: 400 });
        }
    
        const reorderedNotes = responseBody.notes;
    
        if (reorderedNotes.length !== notes.length) {
            return new HttpResponse(null, { status: 400 });
        }
    
        notes = reorderedNotes;
    
        notes.forEach((note, index) => {
            note.position = index;
        });
    
        return HttpResponse.json({ success: true, notes }); // Corrected line
    }),
    

    http.post(`${SERVER_URL}/notes/sync`, async ({ request, params, cookies }) => {
        const responseBody = await request.json();
        if (!responseBody.changes || !responseBody.changes.length) {
            return HttpResponse(null, { status: 400 });
        }

        const changes = responseBody.changes;

        for (const change of changes) {
            const { note, action } = change;
            const noteIndex = notes.findIndex(n => n.id === note.id);
            console.log("noteIndex:" + noteIndex + ",note:" + note + action )
            if (action === 'add') {
                    note.id = notesId++;
                    notes.push(note);
            } else if (action === 'update') {
                    notes[noteIndex] = { ...notes[noteIndex], ...note };
            } else if (action === 'delete') {
                    notes.splice(noteIndex, 1);
            }
        }

        return HttpResponse.json({ success: true, notes });
    })
];