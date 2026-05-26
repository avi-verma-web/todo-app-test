import cors from 'cors'
import express from 'express'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  createTodo,
  deleteTodo,
  getAllTodos,
  updateTodo,
} from './todos.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PORT = Number(process.env.PORT) || 4001
const isProduction = process.env.NODE_ENV === 'production'

const app = express()

app.use(cors())
app.use(express.json())

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.get('/api/todos', (_req, res) => {
  res.json({ todos: getAllTodos() })
})

app.post('/api/todos', (req, res) => {
  const result = createTodo(req.body?.title)
  if (result.error) {
    return res.status(400).json({ error: result.error })
  }
  res.status(201).json(result.todo)
})

app.patch('/api/todos/:id', (req, res) => {
  const result = updateTodo(req.params.id, req.body ?? {})
  if (result.error) {
    return res.status(result.error === 'Todo not found' ? 404 : 400).json({
      error: result.error,
    })
  }
  res.json(result.todo)
})

app.delete('/api/todos/:id', (req, res) => {
  const result = deleteTodo(req.params.id)
  if (result.error) {
    return res.status(404).json({ error: result.error })
  }
  res.status(204).end()
})

if (isProduction) {
  const clientDist = path.join(__dirname, '../../client/dist')
  app.use(express.static(clientDist))
  app.get(/^(?!\/api).*/, (_req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'))
  })
}

app.listen(PORT, () => {
  console.log(`Express: http://localhost:${PORT}`)
  console.log(`Todos: http://localhost:${PORT}/api/todos`)
  if (!isProduction) {
    console.log(`React: http://localhost:5174`)
  }
})
