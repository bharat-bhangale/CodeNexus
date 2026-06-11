---
name: create-api-route
description: Creates a complete Express.js API route for CodeNexus with route definition, controller, service, Joi validation, integration test, and frontend service method. Use this for any new backend endpoint.
user-invocable: true
---

# Create API Route

You are adding a new API endpoint to the **CodeNexus** Express.js backend.

## Input Required
The user will provide:
- **Route path** (e.g., `/api/v1/projects/:id/decisions`)
- **HTTP method** (GET, POST, PUT, DELETE)
- **Purpose** — what the endpoint does
- **Request body / query params** (if applicable)
- **Expected response shape**

## Steps

### Step 1 — Create or update the route file
**Path:** `server/src/routes/{resource}.routes.js`

```javascript
import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validation.middleware.js';
import { schema } from './schemas/{resource}.schema.js';
import * as controller from '../controllers/{resource}.controller.js';

const router = Router();

// GET /api/v1/{resource}
router.get('/', authenticate, controller.getAll);

// POST /api/v1/{resource}
router.post('/', authenticate, validate(schema.create), controller.create);

// GET /api/v1/{resource}/:id
router.get('/:id', authenticate, controller.getById);

// PUT /api/v1/{resource}/:id
router.put('/:id', authenticate, validate(schema.update), controller.update);

// DELETE /api/v1/{resource}/:id
router.delete('/:id', authenticate, controller.remove);

export default router;
```

### Step 2 — Create the controller
**Path:** `server/src/controllers/{resource}.controller.js`

Controllers are **thin** — they parse the request, call the service, and format the response:

```javascript
import * as service from '../services/{Resource}Service.js';

export const getAll = async (req, res, next) => {
  try {
    const data = await service.getAll(req.query, req.user.id);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const create = async (req, res, next) => {
  try {
    const data = await service.create(req.body, req.user.id);
    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};
```

### Step 3 — Create the service
**Path:** `server/src/services/{Resource}Service.js`

All **business logic** lives here. The service interacts with Mongoose models:

```javascript
import Model from '../models/{Model}.js';

export const getAll = async (query, userId) => {
  const { page = 1, limit = 20, sort = '-createdAt' } = query;
  const skip = (page - 1) * limit;

  const items = await Model.find({ userId })
    .sort(sort)
    .skip(skip)
    .limit(Number(limit));

  const total = await Model.countDocuments({ userId });

  return { items, total, page: Number(page), limit: Number(limit) };
};

export const create = async (data, userId) => {
  const item = new Model({ ...data, userId });
  await item.save();
  return item;
};
```

### Step 4 — Create the Joi validation schema
**Path:** `server/src/routes/schemas/{resource}.schema.js`

```javascript
import Joi from 'joi';

export const schema = {
  create: Joi.object({
    // define required and optional fields
  }),
  update: Joi.object({
    // define updatable fields
  }),
};
```

### Step 5 — Register the route
**Path:** `server/src/routes/index.js`

```javascript
import resourceRoutes from './{resource}.routes.js';
router.use('/{resource}', resourceRoutes);
```

### Step 6 — Create the integration test
**Path:** `server/tests/integration/{resource}.test.js`

```javascript
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../../src/app.js';

describe('{Resource} API', () => {
  it('GET /api/v1/{resource} — returns list (200)', async () => {
    const res = await request(app).get('/api/v1/{resource}');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('POST /api/v1/{resource} — creates item (201)', async () => { });
  it('POST /api/v1/{resource} — rejects invalid body (400)', async () => { });
  it('GET /api/v1/{resource}/:id — returns 404 for missing', async () => { });
  it('requires authentication (401)', async () => { });
});
```

### Step 7 — Create the frontend service method
**Path:** `client/src/services/{resource}Service.js`

```javascript
import api from './api.js';

export const getAll = async (params) => {
  const { data } = await api.get('/api/v1/{resource}', { params });
  return data.data;
};

export const create = async (body) => {
  const { data } = await api.post('/api/v1/{resource}', body);
  return data.data;
};
```

## Rules
- ✅ Auth middleware on ALL protected routes
- ✅ Joi/Zod validation on POST/PUT requests
- ✅ Controllers are thin — delegate business logic to services
- ✅ Consistent response: `{ success: true, data }` or `{ success: false, error }`
- ✅ Rate limiting on AI endpoints via `rateLimiter.middleware.js`
- ✅ Integration tests cover: 200, 201, 400, 401, 404
- ✅ ES Modules (`import`/`export`), NOT CommonJS
