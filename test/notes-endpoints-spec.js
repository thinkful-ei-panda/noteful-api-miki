const knex = require('knex');
const app = require('../src/app');
const { makeFoldersArray, makeNotesArray } = require('./noteful-fixtures');

describe.only(`Notes Endpoints`, () => {
    let db;

    before(`Make a connection`, () => {
        db = knex({
            client: "pg",
            connection: process.env.TEST_DB_URL
        });
        app.set('db', db);
    });

    before(`Clear table`, () => db.raw('TRUNCATE folder, note RESTART IDENTITY CASCADE'));
    afterEach(`Clear table`, () => db.raw('TRUNCATE folder, note RESTART IDENTITY CASCADE'));
    after(`Destroy the connection`, () => db.destroy());

    describe(`GET /api/notes`, () => {
        context(`Given there are no notes`, () => {
            it(`GET /api/notes responds with 200 and an empty array`, () => {
                return supertest(app)
                    .get('/api/notes')
                    .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                    .expect(200, []);
            });

            it(`GET /api/notes/:note_id responds with 404`, () => {
                const note_id = 1;
                return supertest(app)
                    .get(`/api/notes/${note_id}`)
                    .set('Authorization', `Bearer ${process.env.API_TOKEN}`)        
                    .expect(404, {error: {message: 'Note not found/does not exist'}});
            });
        });

        context(`Given there are folders`, () => {
            const testFoldersArray = makeFoldersArray();
            const testNotesArray = makeNotesArray();
            beforeEach(`Insert folders`, () => db('folder').insert(testFoldersArray));
            beforeEach(`Insert notes`, () => db('note').insert(testNotesArray));

            it(`GET /api/notes responds with 200 and an array of all notes`, () => {
                return supertest(app)
                    .get('/api/notes')
                    .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                    .expect(200, testNotesArray);
            });

            it(`GET /api/notes/:note_id responds with 200 and matched note object`, () => {
                const note_id = 1;
                return supertest(app)
                    .get(`/api/notes/${note_id}`)
                    .set('Authorization', `Bearer ${process.env.API_TOKEN}`)        
                    .expect(200, testNotesArray[0]);
            });

            //Test for no notes found?
        });
    });

    // describe(`POST /api/notes`, () => {
    //     context(`Given there are no notes`, () => {
    //         it(`POST /api/notes responds with 201 and new note location`, () => {
    //             const newNote = {
    //                 folder_name: 'Blimey'
    //             };

    //             return supertest(app)
    //                 .post(`/api/folders`)
    //                 .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
    //                 .send(newFolder)
    //                 .expect(201)
    //                 .expect(res => {
    //                     // Test location 2 ways
    //                     expect(res.headers.location).to.equal(`/api/1`)
    //                     expect('location', `/api/1`)
    //                 });
    //         });
    //     });
    // });

    // describe(`PATCH /api/folders/:folder_id`, () => {
    //     context(`Given there are folders`, () => {
    //         const testFoldersArray = makeFoldersArray();
    //         beforeEach(`Insert folders`, () => db('folder').insert(testFoldersArray));

    //         it(`PATCH /api/folders/:folder_id responds with 204`, () => {
    //             const folder_id = 1;
    //             const folderNameUpdate = {
    //                 folder_name: 'Pertinent'
    //             };
    
    //             return supertest(app)
    //                 .patch(`/api/folders/${folder_id}`)
    //                 .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
    //                 .send(folderNameUpdate)
    //                 .expect(204)
    //                 .then(res => {
    //                     supertest(app)
    //                         .get(`/api/folders/${folder_id}`)
    //                         .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
    //                         .expect(200)
    //                         .then(res => {
    //                             expect(folderNameUpdate.folder_name).to.eql(res.body.folder_name);
    //                         });
    //                 });
    //         });
    //     });
    // });

    describe(`DELETE /api/notes/:note_id`, () => {
        context(`Given there are notes`, () => {
            const testFoldersArray = makeFoldersArray();
            const testNotesArray = makeNotesArray();
            beforeEach(`Insert folders`, () => db('folder').insert(testFoldersArray));
            beforeEach(`Insert notes`, () => db('note').insert(testNotesArray));

            it(`DELETE /api/notes/:note_id responds with 200`, () => {
                const note_id = 1;
                const expectedNotesArray = testNotesArray.filter(note => note.id !== note_id);
    
                return supertest(app)
                    .delete(`/api/notes/${note_id}`)
                    .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                    .expect(200)
                    .then(res => {
                        return supertest(app)
                            .get('/api/notes')
                            .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                            .expect(200, expectedNotesArray)
                    });
            });
        });
    });
});