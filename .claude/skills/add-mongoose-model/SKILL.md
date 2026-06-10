---
name: add-mongoose-model
description: Creates a new Mongoose model for CodeNexus with schema definition, indexes, virtual fields, toJSON transform, and seed data. Use for any new database entity.
user-invocable: true
---

# Add Mongoose Model

## Input Required
- **Model name** (e.g., `Decision`, `Project`, `ChatHistory`)
- **Fields** — name, type, required, default, validation
- **Relationships** — references to other models

## Steps

### Step 1 — Create the model
**Path:** `server/src/models/{ModelName}.js`

```javascript
import mongoose from 'mongoose';

const { Schema } = mongoose;

const {modelName}Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    // ... additional fields
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [200, 'Name cannot exceed 200 characters'],
    },
    status: {
      type: String,
      enum: ['active', 'archived', 'deleted'],
      default: 'active',
    },
  },
  {
    timestamps: true, // auto createdAt and updatedAt
  }
);

// ─── Indexes ───
{modelName}Schema.index({ userId: 1, createdAt: -1 });
// Add compound indexes for common query patterns
// Add text index for searchable fields:
// {modelName}Schema.index({ name: 'text', description: 'text' });

// ─── Virtual Fields ───
{modelName}Schema.virtual('isActive').get(function () {
  return this.status === 'active';
});

// ─── Pre-save Hooks ───
{modelName}Schema.pre('save', function (next) {
  // Custom logic before saving
  next();
});

// ─── toJSON Transform ───
{modelName}Schema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

// ─── Static Methods ───
{modelName}Schema.statics.findByUser = function (userId, options = {}) {
  const { page = 1, limit = 20, sort = '-createdAt' } = options;
  return this.find({ userId, status: { $ne: 'deleted' } })
    .sort(sort)
    .skip((page - 1) * limit)
    .limit(limit);
};

const {ModelName} = mongoose.model('{ModelName}', {modelName}Schema);

export default {ModelName};
```

### Step 2 — Reference the Backend Schema Document
Read `@docs/05_Backend_Schema.md` to ensure the model matches the defined schema.

### Step 3 — Add indexes for common queries
- Fields used in `find()` queries → single index
- Fields used together → compound index
- Text fields for search → text index
- Auto-expiring documents → TTL index (`expireAfterSeconds`)

### Step 4 — Create seed data function
**Path:** `scripts/seed-db.js` (add to existing or create)

```javascript
export const seed{ModelName}s = async (userId) => {
  const items = [
    { userId, name: 'Sample 1', /* ... */ },
    { userId, name: 'Sample 2', /* ... */ },
  ];
  await {ModelName}.insertMany(items);
  console.log(`✅ Seeded ${items.length} {modelName}s`);
};
```

### Step 5 — Verify
- Run `node -e "import('./{ModelName}.js')"` to check syntax
- Verify indexes with `{ModelName}.collection.getIndexes()`

## Rules
- ✅ Always include `{ timestamps: true }`
- ✅ Use `select: false` on sensitive fields (passwords, tokens)
- ✅ Always define `toJSON` transform to exclude `__v` and remap `_id` to `id`
- ✅ Use `Schema.Types.ObjectId` with `ref` for relationships
- ✅ Add validation messages: `required: [true, 'Field is required']`
- ✅ Trim string fields: `trim: true`
- ✅ Use `enum` for fields with limited valid values
- ✅ Export as default export
