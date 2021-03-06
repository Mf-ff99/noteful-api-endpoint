const path = require('path')
const express = require('express')
const xss = require('xss')
const NoteService = require('../src/Notes/notes-service')

const noteRouter = express.Router()
const jsonParser = express.json()

const sanitizeNote = note => ({
    ...note,
    name: xss(note.name),
    content: xss(note.content)
})

noteRouter
    .route('/')
    .get((req, res, next) => {
        NoteService.getAllNotes(req.app.get('db'))
            .then(notes => {
                res.json(notes.map(sanitizeNote))
            })
            .catch(next)
    })
    .post(jsonParser, (req, res, next) => {
        const { name, content, folderId } = req.body
        const newNote = {
            name,
            content,
            folder_id: folderId,
        }
        console.log(newNote)

        // check for missing fields
        for (const [key, value] of Object.entries(newNote)) {
            if (value == null) {
                return res.status(400).json({
                    error: { message: `Missing '${key}' in request body` }
                })
            }
        }

        NoteService.insertNote(req.app.get('db'), newNote)
            .then(note => {
                res.status(201)
                    .location(path.posix.join(req.originalUrl, `${note.id}`))
                    .json(sanitizeNote(note))
            })
            .catch(next)
    })

noteRouter
    .route('/:note_id')
    .all((req, res, next) => {
        NoteService.getById(req.app.get('db'), req.params.note_id)
            .then(note => {
                if (!note) {
                    return res.status(404).json({
                        error: { message: `Note doesn't exist` }
                    })
                }
                res.note = note // save the Note for the next middleware
                next() // don't forget to call next so the next middleware happens!
            })
            .catch(next)
    })
    .get((req, res, next) => {
        res.json(sanitizeNote(res.note))
    })
    .patch(jsonParser, (req, res, next) => {
        const { name, content, folder_id } = req.body
        const noteToUpdate = { name, content, folder_id }

        if (!name && !content && !folder_id) {
            return res.status(400).json({
                error: {
                    message: `Request body must contain a 'name', 'content' or 'folder_id' field`
                }
            })
        }

        NoteService.updateNote(
            req.app.get('db'),
            req.params.note_id,
            noteToUpdate
        )
            .then(() => {
                res.status(204).end()
            })
            .catch(next)
    })
    .delete((req, res, next) => {
        NoteService.deleteNote(req.app.get('db'), req.params.note_id)
            .then(() => {
                res.status(204).end()
            })
            .catch(next)
    })

module.exports = noteRouter