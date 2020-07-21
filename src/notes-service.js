const NotesService = {
    getAllNotes(db) {
        return db('note')
            .select('*');
    },

    getNoteByID(db, id) {
        return db('note')
            .select('*')
            .where({id})
            .first();
    },

    insertNewNote(db, newNote) {
        return db('note')
            .insert(newNote, ['id']);
    },

    // updateNote(db, id, note_name) {
    //     return db('note')
    //         .where({id})
    //         .update({note_name});
    // },

    deleteNote(db, id) {
        return db('note')
            .where({id})
            .del();
    },
};

module.exports = NotesService;