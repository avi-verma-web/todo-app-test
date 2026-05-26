let nextId = 3
let todos = [
  {
    id: '1',
    title: 'Learn React',
    completed: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Build Express API',
    completed: true,
    createdAt: new Date().toISOString(),
  },
]

export function getAllTodos() {
  return [...todos].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
  )
}

export function createTodo(title) {
  const trimmed = title?.trim()
  if (!trimmed) {
    return { error: 'Title is required' }
  }
  const todo = {
    id: String(nextId++),
    title: trimmed,
    completed: false,
    createdAt: new Date().toISOString(),
  }
  todos.push(todo)
  return { todo }
}

export function updateTodo(id, updates) {
  const todo = todos.find((t) => t.id === id)
  if (!todo) {
    return { error: 'Todo not found' }
  }
  if (updates.title !== undefined) {
    const trimmed = updates.title.trim()
    if (!trimmed) {
      return { error: 'Title cannot be empty' }
    }
    todo.title = trimmed
  }
  if (updates.completed !== undefined) {
    todo.completed = Boolean(updates.completed)
  }
  return { todo }
}

export function deleteTodo(id) {
  const index = todos.findIndex((t) => t.id === id)
  if (index === -1) {
    return { error: 'Todo not found' }
  }
  todos.splice(index, 1)
  return { ok: true }
}
