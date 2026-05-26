import { useCallback, useEffect, useState } from 'react'
import './App.css'

const API = '/api/todos'

export default function App() {
  const [todos, setTodos] = useState([])
  const [title, setTitle] = useState('')
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const loadTodos = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(API)
      if (!res.ok) throw new Error('Could not load todos')
      const data = await res.json()
      setTodos(data.todos)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadTodos()
  }, [loadTodos])

  async function handleAdd(e) {
    e.preventDefault()
    const text = title.trim()
    if (!text || submitting) return

    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: text }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Could not add todo')
      }
      const todo = await res.json()
      setTodos((prev) => [todo, ...prev])
      setTitle('')
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  async function toggleTodo(id, completed) {
    setError(null)
    try {
      const res = await fetch(`${API}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !completed }),
      })
      if (!res.ok) throw new Error('Could not update todo')
      const updated = await res.json()
      setTodos((prev) => prev.map((t) => (t.id === id ? updated : t)))
    } catch (err) {
      setError(err.message)
    }
  }

  async function removeTodo(id) {
    setError(null)
    try {
      const res = await fetch(`${API}/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Could not delete todo')
      setTodos((prev) => prev.filter((t) => t.id !== id))
    } catch (err) {
      setError(err.message)
    }
  }

  const visible = todos.filter((t) => {
    if (filter === 'active') return !t.completed
    if (filter === 'completed') return t.completed
    return true
  })

  const activeCount = todos.filter((t) => !t.completed).length

  return (
    <main className="app">
      <header className="header">
        <h1>Todo app version 2</h1>
        <p className="subtitle">React + Express — add, complete, and delete tasks</p>
      </header>

      {error && (
        <p className="banner error" role="alert">
          {error}
          <button type="button" onClick={loadTodos}>
            Retry
          </button>
        </p>
      )}

      <form className="add-form" onSubmit={handleAdd}>
        <input
          type="text"
          placeholder="What needs to be done?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={submitting}
          aria-label="New todo title"
        />
        <button type="submit" disabled={submitting || !title.trim()}>
          Add
        </button>
      </form>

      <div className="filters" role="tablist" aria-label="Filter todos">
        {['all', 'active', 'completed'].map((f) => (
          <button
            key={f}
            type="button"
            role="tab"
            aria-selected={filter === f}
            className={filter === f ? 'active' : ''}
            onClick={() => setFilter(f)}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="empty">Loading todos…</p>
      ) : visible.length === 0 ? (
        <p className="empty">
          {filter === 'all' ? 'No todos yet. Add one above.' : `No ${filter} todos.`}
        </p>
      ) : (
        <ul className="todo-list">
          {visible.map((todo) => (
            <li key={todo.id} className={todo.completed ? 'done' : ''}>
              <label>
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => toggleTodo(todo.id, todo.completed)}
                />
                <span>{todo.title}</span>
              </label>
              <button
                type="button"
                className="delete"
                aria-label={`Delete ${todo.title}`}
                onClick={() => removeTodo(todo.id)}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}

      <footer className="footer">
        {activeCount} item{activeCount === 1 ? '' : 's'} left
      </footer>
    </main>
  )
}
