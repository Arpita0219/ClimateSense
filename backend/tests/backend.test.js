import test from 'node:test'
import assert from 'node:assert/strict'

const { app } = await import('../backend/server.js')

test('backend exposes health endpoint', async () => {
  const response = await fetch('http://localhost:5000/api/health')
  assert.equal(response.status, 200)

  const body = await response.json()
  assert.equal(body.status, 'ok')
  assert.equal(app.constructor.name, 'Express')
})
