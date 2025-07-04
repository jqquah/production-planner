# Changelog

### 2025-07-04 (Evening)

- **Feat**: Enhanced the "View Batches" modal to display a "Total Cost" for each batch and a summary row with totals for quantity and cost.
- **Feat**: Increased the size of the "View Batches" modal to improve usability and prevent horizontal scrolling.
- **Fix**: Resolved critical backend errors related to inventory stock adjustments and batch creation by correcting backend model functions and route handlers.
- **Fix**: Stabilized the server environment by ensuring correct Docker and Nginx configurations and forcing database re-initialization to apply schema changes.
- **Fix**: Ensured proper user authentication and foreign key integrity for inventory audit logging by using the authenticated user ID from the JWT token.
- **Fix**: Corrected the Inventory History display, which was previously showing no records, by debugging and fixing the backend query.
- **Feat**: Implemented search and filtering functionality in the Inventory History page, allowing users to filter by material name (via a dropdown) and batch number.
- **Feat**: Created a new "Current Stock Report" to provide a real-time overview of all material stock levels.
- **Feat**: Added a "Minimum Stock Level" field to raw materials, allowing for custom thresholds for low-stock alerts.
- **Feat**: Implemented an "Expiring Soon" report to track material batches nearing their expiration date.

### 2025-07-04

- **Fix**: Resolved a critical runtime error (`ing.percentage.toFixed is not a function`) by ensuring the backend API correctly parses and returns numeric data types for `percentage` and `cost_per_unit`.
- **Fix**: Addressed persistent TypeScript build errors by defining local type interfaces within components, effectively bypassing a stale Docker build cache.
- **Feat**: Implemented frontend validation to ensure the sum of ingredient percentages equals exactly 100% before a recipe can be saved.
- **Refactor**: Simplified the "View Recipe" modal by removing all cost-related calculations and display elements, streamlining the user interface.

### 2025-07-03

- **Refactor**: Modified recipe formulation from fixed quantity-based ingredients to a more flexible percentage-based system.
- **Feat**: Implemented full CRUD functionality for the Recipe Management module, including frontend modals for adding, editing, and deleting recipes, along with the supporting backend API.

- **Feat**: Implemented full CRUD functionality for the Raw Materials Management module, including the frontend UI and backend API.
- **Fix**: Resolved multiple application startup issues, including environment variable configuration, port conflicts, and Docker networking.
- **Fix**: Corrected a critical database schema mismatch by resetting the Docker volume, allowing materials to be added successfully.
- **Chore**: Established and updated this `CHANGELOG.md` to track project history.
- **Chore**: Organized project tasks and updated their status in Taskmaster.