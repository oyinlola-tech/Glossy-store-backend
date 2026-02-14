# Admin Migrations

This folder contains admin-governance migrations for production deployments.

Current migration:
- `001-add-super-admin-fields.js`
  - Adds `is_super_admin` and `created_by_admin_id` columns to `users`.

Notes:
- Local startup uses `sequelize.sync()` to create missing tables/columns without destructive overrides.
- In production, run explicit migrations using your migration runner (for example, Sequelize CLI).
