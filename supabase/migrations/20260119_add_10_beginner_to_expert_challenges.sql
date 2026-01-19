-- Add 10 challenges spanning Beginner to Expert difficulty
-- Generated from NoCodeJam Challenge Generator skill

-- Challenge 1: Build a Responsive Card Component (Beginner)
INSERT INTO public.challenges (
  id,
  title,
  slug,
  description,
  requirements,
  difficulty,
  challenge_type,
  estimated_time,
  recommended_tools,
  status,
  ai_generated,
  category,
  created_at,
  updated_at
)
VALUES (
  'c3000001-0001-0001-0001-100000000001'::uuid,
  'Build a Responsive Card Component',
  'build-responsive-card-component',
  '# Build a Responsive Card Component

## Challenge Description

Create a reusable card component that automatically adapts its layout across mobile, tablet, and desktop screens using modern CSS techniques. This challenge will teach you responsive design fundamentals, CSS layout methods, and mobile-first development practices.

Cards are one of the most common UI patterns on the web - you''ll find them on e-commerce sites (product cards), social media (post cards), and dashboards (metric cards). Learning to build responsive cards gives you a foundation for almost any modern web interface.

## Learning Objectives

By completing this challenge, you will be able to:
- Apply mobile-first responsive design principles
- Use CSS media queries to adapt layouts across breakpoints
- Implement flexible layouts with Flexbox or CSS Grid
- Control image sizing and aspect ratios responsively
- Create reusable component styles that scale across projects
- Test responsive behavior across multiple screen sizes

## Instructions

### Part 1: Build the Card HTML Structure
1. Create an HTML file with a card container
2. Add these elements to your card: image, heading, paragraph, call-to-action button
3. Use semantic HTML elements (e.g., `<article>`, `<h2>`, `<p>`, `<button>`)

### Part 2: Style the Mobile Layout (Mobile-First)
4. Create a CSS file and link it to your HTML
5. Style the card for mobile screens (default, no media query)
6. Add a subtle border or shadow to define the card boundaries
7. Choose readable typography (font sizes, line heights)

### Part 3: Add Tablet Breakpoint
8. Create a media query for tablet screens (min-width: 768px)
9. Increase the card max-width
10. Adjust spacing and font sizes for larger screens

### Part 4: Add Desktop Layout
11. Create a media query for desktop screens (min-width: 1024px)
12. Switch to a horizontal layout (image on left, content on right)
13. Ensure the image maintains its aspect ratio without distortion

### Part 5: Test and Refine
14. Test your card at 320px, 768px, 1024px, and 1440px widths
15. Verify images don''t distort at any size
16. Check that text remains readable at all breakpoints

## Reflection Questions

1. Share a screenshot or code snippet showing your card at mobile and desktop sizes side-by-side. What specific CSS property did you use to switch from vertical to horizontal layout?

2. How did you prevent images from distorting when the card changes size? Show the CSS you used and explain why it works.

3. What breakpoint values did you choose and why? Did you test any edge cases between breakpoints?

4. If you had to add a third layout variation (e.g., grid of cards), what would you change about your component structure or styles?',
  ARRAY[
    'Card displays vertically on mobile (<768px) with full-width button',
    'Card adjusts spacing and sizing on tablet (768px-1023px)',
    'Card switches to horizontal layout on desktop (≥1024px)',
    'Images never distort or stretch unnaturally',
    'All text remains readable at every breakpoint',
    'Component works with different content lengths',
    'At least 3 breakpoints are implemented'
  ],
  'Beginner',
  'Build',
  150, -- 2.5 hours
  ARRAY['VS Code', 'CodePen', 'Chrome DevTools', 'Flexbox', 'CSS Grid'],
  'published',
  true,
  'Frontend',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  requirements = EXCLUDED.requirements,
  status = EXCLUDED.status,
  updated_at = NOW();

-- Challenge 2: Dark Mode Toggle with Persistence (Beginner)
INSERT INTO public.challenges (
  id,
  title,
  slug,
  description,
  requirements,
  difficulty,
  challenge_type,
  estimated_time,
  recommended_tools,
  status,
  ai_generated,
  category,
  created_at,
  updated_at
)
VALUES (
  'c3000002-0002-0002-0002-100000000002'::uuid,
  'Implement Dark Mode Toggle with Persistence',
  'dark-mode-toggle-persistence',
  '# Implement Dark Mode Toggle with Persistence

## Challenge Description

Add a dark/light mode toggle to a website and save the user''s preference so it persists across browser sessions. This challenge teaches you state management, CSS custom properties, browser storage APIs, and how to create user-friendly theme switching.

Dark mode has become an expected feature in modern applications. Users appreciate having control over their visual experience, and implementing theme persistence shows attention to user experience details that separate good apps from great ones.

## Learning Objectives

By completing this challenge, you will be able to:
- Implement CSS custom properties (CSS variables) for theming
- Use JavaScript to toggle CSS classes dynamically
- Store and retrieve data from localStorage
- Handle initial page load based on saved preferences
- Create accessible toggle buttons with proper labels
- Apply system preference detection (prefers-color-scheme)

## Instructions

### Part 1: Set Up Your HTML Structure
1. Create an HTML file with some content (header, paragraphs, sections)
2. Add a toggle button in the header or navigation
3. Use semantic HTML and include various elements

### Part 2: Define Light and Dark Themes with CSS Variables
4. Create CSS custom properties for your theme colors
5. Define a dark theme class that overrides these variables
6. Apply your CSS variables to all elements

### Part 3: Implement the Toggle with JavaScript
7. Create a JavaScript file and select your toggle button
8. Add a click event listener to toggle dark mode
9. Update the button text or icon to reflect the current state

### Part 4: Add localStorage Persistence
10. When theme changes, save the preference to localStorage
11. On page load, check localStorage for saved theme
12. Apply the saved theme before the page fully renders

### Part 5: Respect System Preferences
13. Use the prefers-color-scheme media query to detect system preference
14. If no localStorage value exists, use system preference as default

### Part 6: Test Edge Cases
15. Test that theme persists after page reload
16. Verify there''s no flash of unstyled content on load

## Reflection Questions

1. Share your CSS variables structure. How many theme variables did you create, and why?

2. Post a code snippet showing how you prevent the flash of unstyled content on page load.

3. How did you handle the initial state of the toggle button when the page loads? Show the JavaScript logic.

4. If a user has dark mode enabled and shares a link with a friend who prefers light mode, what happens? Is this the right behavior?',
  ARRAY[
    'Toggle button switches between light and dark themes',
    'Theme preference is saved to localStorage',
    'Saved preference persists across page reloads and new tabs',
    'All page elements properly adapt to both themes',
    'No flash of wrong theme on page load',
    'Toggle button shows current state',
    'Default theme is applied when no preference is saved',
    'System preference is respected when available'
  ],
  'Beginner',
  'Build',
  150, -- 2.5 hours
  ARRAY['CSS Variables', 'localStorage', 'JavaScript', 'prefers-color-scheme'],
  'published',
  true,
  'Frontend',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  requirements = EXCLUDED.requirements,
  status = EXCLUDED.status,
  updated_at = NOW();

-- Challenge 3: Health Check API Endpoint (Beginner)
INSERT INTO public.challenges (
  id,
  title,
  slug,
  description,
  requirements,
  difficulty,
  challenge_type,
  estimated_time,
  recommended_tools,
  status,
  ai_generated,
  category,
  created_at,
  updated_at
)
VALUES (
  'c3000003-0003-0003-0003-100000000003'::uuid,
  'Create a Health Check API Endpoint',
  'health-check-api-endpoint',
  '# Create a Health Check API Endpoint

## Challenge Description

Implement a `/health` endpoint that reports your service''s status, uptime, and timestamp. This challenge teaches you API endpoint creation, server monitoring basics, and how to provide diagnostic information for debugging and operations.

Health check endpoints are fundamental to production systems. They allow monitoring tools to verify your service is running, help with debugging issues, enable automated health checks in container orchestrators, and provide quick diagnostic information during incidents.

## Learning Objectives

By completing this challenge, you will be able to:
- Create a REST API endpoint with proper HTTP methods
- Calculate and report server uptime
- Return properly formatted JSON responses
- Use appropriate HTTP status codes
- Implement basic error handling for health checks
- Understand the difference between "healthy" and "degraded" states

## Instructions

### Part 1: Set Up Your Server
1. Create a basic Node.js server using Express (or your preferred framework)
2. Set up a basic route structure
3. Record the server start time when the application launches

### Part 2: Implement the Basic Health Endpoint
4. Create a GET endpoint at `/health`
5. Return a JSON response with status, timestamp, and uptime
6. Set the HTTP status code to 200 for healthy

### Part 3: Add Additional Diagnostic Information
7. Add a version field (e.g., from package.json)
8. Add a service field with your service name
9. Include environment (development, staging, production)
10. Add memory usage information (optional)

### Part 4: Add Database Connection Check
11. If your app uses a database, add a check to verify connectivity
12. If database is unreachable, return status "unhealthy" with HTTP 503
13. Implement a timeout for the database check

### Part 5: Test Different Scenarios
14. Test when service is running normally (should return 200)
15. Test uptime by checking endpoint at different intervals
16. Verify timestamp updates on each request

## Reflection Questions

1. Share your health check endpoint response JSON. What fields did you include beyond the basic requirements, and why?

2. How did you calculate uptime? Show the code you used to track server start time.

3. What HTTP status code do you return when the service is unhealthy, and why? What''s the difference between 503 and 500?

4. If you were monitoring this endpoint every 30 seconds, what would trigger an alert?',
  ARRAY[
    'GET request to /health returns 200 status code when healthy',
    'Response includes status, timestamp, and uptime fields',
    'Uptime accurately reflects seconds since server start',
    'Timestamp shows current time in ISO 8601 format',
    'Response is valid JSON',
    'Endpoint responds within 1 second under normal conditions',
    'If database check included, returns 503 when database is unreachable',
    'Endpoint works without authentication'
  ],
  'Beginner',
  'Build',
  105, -- 1.75 hours
  ARRAY['Node.js', 'Express', 'Postman', 'curl'],
  'published',
  true,
  'Backend',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  requirements = EXCLUDED.requirements,
  status = EXCLUDED.status,
  updated_at = NOW();

-- Challenge 4: Paginated List with Loading and Error States (Intermediate)
INSERT INTO public.challenges (
  id,
  title,
  slug,
  description,
  requirements,
  difficulty,
  challenge_type,
  estimated_time,
  recommended_tools,
  status,
  ai_generated,
  category,
  created_at,
  updated_at
)
VALUES (
  'c3000004-0004-0004-0004-100000000004'::uuid,
  'Paginated List with Loading and Error States',
  'paginated-list-loading-error-states',
  '# Paginated List with Loading and Error States

## Challenge Description

Build a paginated list that fetches data from an API and gracefully handles loading states, empty results, and error conditions. This challenge teaches you asynchronous state management, error handling, user feedback patterns, and how to create resilient UIs that work reliably in real-world conditions.

In production applications, network requests can fail, APIs can be slow, and data sets can be large. Users need clear feedback about what''s happening. This challenge mirrors real-world scenarios where you must handle multiple states and edge cases.

## Learning Objectives

By completing this challenge, you will be able to:
- Fetch paginated data from a REST API
- Manage multiple UI states (loading, success, error, empty)
- Implement pagination controls (next, previous, page numbers)
- Handle network errors gracefully with user-friendly messages
- Display loading indicators during asynchronous operations
- Update URL parameters to reflect current page state
- Prevent race conditions with concurrent requests

## Instructions

### Part 1: Set Up the Project and API
1. Choose an API to work with (JSONPlaceholder, GitHub API, or create your own)
2. Set up your project (vanilla JS, React, Vue, or preferred framework)
3. Identify the API endpoint that supports pagination

### Part 2: Implement Basic Data Fetching
4. Create state structure to hold data, loading, error, currentPage, totalPages
5. Create a function to fetch data for a specific page
6. Display the fetched data in a list

### Part 3: Add Loading State
7. Show a loading indicator when fetching data
8. Disable pagination controls during loading
9. Consider using skeleton screens or spinners

### Part 4: Implement Error Handling
10. Wrap API calls in try-catch blocks
11. Display user-friendly error messages
12. Add a "Retry" button when errors occur
13. Test error handling by using an invalid API endpoint

### Part 5: Handle Empty State
14. Detect when API returns zero results
15. Display a meaningful empty state message

### Part 6: Build Pagination Controls
16. Add Previous and Next buttons
17. Disable Previous on first page, Next on last page
18. Display current page number and total pages

### Part 7: Prevent Race Conditions
19. Track the current request and cancel outdated requests if needed
20. Ensure UI shows data from the most recent request only
21. Test by clicking pagination rapidly

### Part 8: Test All Scenarios
22. Test normal pagination flow
23. Simulate network failure
24. Test empty results
25. Test rapid pagination clicks

## Reflection Questions

1. Share a screenshot showing all four states: loading, success, error, and empty. How did you structure your state management?

2. How did you prevent race conditions when users click pagination rapidly? Show the code.

3. What makes an error message "user-friendly"? Show your error handling logic.

4. If the API takes 10 seconds to respond, how does your UI communicate that to users?',
  ARRAY[
    'Data loads from API and displays in a list',
    'Loading indicator appears during data fetch',
    'Error message displays when API call fails',
    'Retry button allows user to retry after error',
    'Empty state shows when no results are found',
    'Pagination controls work (next, previous)',
    'Current page and total pages are visible',
    'Controls are disabled appropriately',
    'Race conditions are handled',
    'User experience is smooth with clear feedback'
  ],
  'Intermediate',
  'Build',
  210, -- 3.5 hours
  ARRAY['React', 'fetch API', 'axios', 'JSONPlaceholder'],
  'published',
  true,
  'Frontend',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  requirements = EXCLUDED.requirements,
  status = EXCLUDED.status,
  updated_at = NOW();

-- Challenge 5: Role-Based Route Protection (Intermediate)
INSERT INTO public.challenges (
  id,
  title,
  slug,
  description,
  requirements,
  difficulty,
  challenge_type,
  estimated_time,
  recommended_tools,
  status,
  ai_generated,
  category,
  created_at,
  updated_at
)
VALUES (
  'c3000005-0005-0005-0005-100000000005'::uuid,
  'Role-Based Route Protection',
  'role-based-route-protection',
  '# Role-Based Route Protection

## Challenge Description

Implement role-based access control (RBAC) that restricts API routes based on user roles. This challenge teaches you the difference between authentication (who you are) and authorization (what you can do), how to implement middleware-based security, and how to protect resources using role hierarchies.

Authorization is critical for any multi-user system. Not all users should access all features - admins need admin panels, regular users shouldn''t delete other users'' data, and guests shouldn''t access protected content.

## Learning Objectives

By completing this challenge, you will be able to:
- Distinguish between authentication and authorization
- Implement middleware to check user roles
- Create a flexible role hierarchy system
- Return appropriate HTTP status codes for authorization failures
- Protect routes based on required roles
- Handle edge cases (missing roles, invalid tokens, multiple roles)
- Test authorization logic without a full auth system

## Instructions

### Part 1: Define Your Role System
1. Define at least 3 roles: guest, user, admin
2. Create a data structure to represent users with roles
3. Consider whether users can have multiple roles

### Part 2: Create Mock Authentication
4. Create middleware that simulates authentication (for testing)
5. Store mock user data (id, username, roles)
6. Attach user object to request

### Part 3: Build Authorization Middleware
7. Create a requireRole middleware factory that accepts required roles
8. Check if req.user exists (authenticated)
9. Check if user has one of the required roles
10. Return 401 if not authenticated, 403 if lacking permission

### Part 4: Protect Routes with Roles
11. Create at least 4 routes with different permission levels
12. Apply the appropriate middleware to each route

### Part 5: Implement Proper Error Responses
13. Return 401 Unauthorized when user is not authenticated
14. Return 403 Forbidden when authenticated but lacks role
15. Include helpful error messages in responses

### Part 6: Test All Scenarios
16. Test public route without auth
17. Test protected route without auth (should return 401)
18. Test user accessing user route (should succeed)
19. Test user accessing admin route (should return 403)

### Part 7: Add Role Hierarchy
20. Implement logic where admin role includes user permissions
21. Test that admins can access user-only routes

## Reflection Questions

1. Share your requireRole middleware code. How does it check if a user has the required role?

2. What''s the difference between returning 401 vs 403? Show examples from your code.

3. How would you extend this system to support permissions instead of just roles?

4. If an admin tries to access a route requiring "user" role, should they be allowed? Why?',
  ARRAY[
    'Public routes are accessible without authentication',
    'Protected routes require authentication (return 401 if missing)',
    'Role-protected routes check for required roles (return 403 if insufficient)',
    'Users with correct roles can access protected routes',
    'Users without correct roles are denied access',
    'Error responses include clear messages and correct status codes',
    'Middleware is reusable across multiple routes',
    'Multiple roles per user are supported',
    'Role hierarchy works correctly'
  ],
  'Intermediate',
  'Build',
  210, -- 3.5 hours
  ARRAY['Express.js', 'Middleware', 'Postman', 'RBAC'],
  'published',
  true,
  'Backend',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  requirements = EXCLUDED.requirements,
  status = EXCLUDED.status,
  updated_at = NOW();

-- Challenge 6: Soft Delete for a Resource (Intermediate)
INSERT INTO public.challenges (
  id,
  title,
  slug,
  description,
  requirements,
  difficulty,
  challenge_type,
  estimated_time,
  recommended_tools,
  status,
  ai_generated,
  category,
  created_at,
  updated_at
)
VALUES (
  'c3000006-0006-0006-0006-100000000006'::uuid,
  'Implement Soft Delete for a Resource',
  'soft-delete-resource',
  '# Implement Soft Delete for a Resource

## Challenge Description

Add soft-delete functionality to a database resource using a `deleted_at` timestamp field, and ensure deleted records are automatically excluded from all read queries. This challenge teaches you data preservation strategies, query filtering patterns, and how to implement recoverable deletions.

Soft deletes are essential when you need audit trails, undo functionality, or must comply with data retention policies. Instead of permanently removing records, you mark them as deleted. This prevents accidental data loss and maintains referential integrity.

## Learning Objectives

By completing this challenge, you will be able to:
- Implement soft delete using a deleted_at timestamp column
- Modify all read queries to exclude soft-deleted records
- Create endpoints to list deleted items and restore them
- Handle foreign key relationships with soft-deleted records
- Implement hard delete for permanent removal
- Test edge cases (deleting already-deleted items)
- Understand trade-offs between soft and hard deletes

## Instructions

### Part 1: Set Up Database Schema
1. Choose a resource to work with (e.g., posts, users, products)
2. Add a deleted_at column to your table (nullable timestamp)
3. Create sample data with some records

### Part 2: Implement Soft Delete Endpoint
4. Create a DELETE endpoint: DELETE /posts/:id
5. Instead of removing the record, set deleted_at to current timestamp
6. Return 204 No Content on success
7. Return 404 if record doesn''t exist or is already deleted

### Part 3: Exclude Deleted Records from Reads
8. Modify GET all endpoint to add WHERE deleted_at IS NULL
9. Verify deleted records don''t appear in list
10. Modify GET single endpoint to return 404 for soft-deleted records

### Part 4: Create Restore Functionality
11. Create a PATCH endpoint: PATCH /posts/:id/restore
12. Set deleted_at back to NULL
13. Return 200 with restored record

### Part 5: List Deleted Records
14. Create a GET endpoint: GET /posts/deleted
15. Query WHERE deleted_at IS NOT NULL
16. Include deleted_at timestamp in response

### Part 6: Implement Hard Delete
17. Create a DELETE endpoint: DELETE /posts/:id/permanent
18. Use this only for deleted records
19. Actually remove record from database

### Part 7: Handle Edge Cases
20. Test deleting an already-deleted record
21. Test restoring a non-deleted record
22. Test hard delete on active record
23. Add indexes on deleted_at for query performance

## Reflection Questions

1. Share your soft delete implementation. How did you modify your queries to exclude deleted records?

2. What happens if you have foreign key relationships? Show how your implementation handles deleting a post that has comments.

3. Compare your soft delete query performance to hard delete. Did you add any indexes?

4. When would you choose hard delete over soft delete? Give three specific scenarios.',
  ARRAY[
    'DELETE endpoint sets deleted_at instead of removing records',
    'All GET endpoints exclude records where deleted_at IS NOT NULL',
    'Deleted records are not accessible via normal queries',
    'Restore endpoint can recover soft-deleted records',
    'Dedicated endpoint lists only deleted records',
    'Hard delete permanently removes records',
    'Attempting to delete already-deleted record returns appropriate error',
    'Database queries are efficient',
    'All endpoints return correct HTTP status codes'
  ],
  'Intermediate',
  'Build',
  210, -- 3.5 hours
  ARRAY['PostgreSQL', 'SQL', 'Express.js', 'ORM'],
  'published',
  true,
  'Backend',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  requirements = EXCLUDED.requirements,
  status = EXCLUDED.status,
  updated_at = NOW();

-- Challenge 7: Add Audit Logging to a Critical Action (Advanced)
INSERT INTO public.challenges (
  id,
  title,
  slug,
  description,
  requirements,
  difficulty,
  challenge_type,
  estimated_time,
  recommended_tools,
  status,
  ai_generated,
  category,
  created_at,
  updated_at
)
VALUES (
  'c3000007-0007-0007-0007-100000000007'::uuid,
  'Add Audit Logging to a Critical Action',
  'audit-logging-critical-action',
  '# Add Audit Logging to a Critical Action

## Challenge Description

Implement a comprehensive audit logging system that records who performed an action, when it happened, and what changed - all determined server-side without trusting client input. This challenge teaches you security-first design, change tracking, immutable logging, and compliance-ready audit trails.

Audit logs are critical for security, debugging, compliance (GDPR, HIPAA, SOC2), and understanding system behavior. They must be tamper-proof, comprehensive, and generated server-side.

## Learning Objectives

By completing this challenge, you will be able to:
- Design an immutable audit log schema
- Capture before/after state of record changes
- Extract user identity from authentication context
- Record actions atomically with business logic
- Query audit logs efficiently with proper indexes
- Implement structured logging
- Prevent audit log tampering or deletion
- Handle sensitive data in audit logs

## Instructions

### Part 1: Design Audit Log Schema
1. Create an audit_logs table with columns for user_id, action, resource_type, resource_id, changes, ip_address, timestamp
2. Ensure audit_logs table has NO delete permissions
3. Add indexes for common queries

### Part 2: Implement Audit Middleware
4. Create middleware that runs after successful actions
5. Extract user identity from req.user (never trust request body)
6. Capture the action type
7. Record timestamp server-side

### Part 3: Capture Before/After State
8. Before UPDATE or DELETE, query and store current state
9. After operation, store new state
10. Store changes as JSON with before/after values

### Part 4: Log Critical Actions
11. Choose a critical resource to audit
12. Instrument CREATE, UPDATE, and DELETE actions
13. Run audit logging in the same database transaction

### Part 5: Query and Display Audit Logs
14. Create endpoint: GET /audit-logs with filters
15. Allow filtering by user, resource type, date range
16. Return logs in reverse chronological order

### Part 6: Handle Sensitive Data
17. Identify fields that shouldn''t be logged
18. Implement field redaction in audit logs
19. Log that a sensitive field changed, but not the value

### Part 7: Prevent Tampering
20. Ensure audit log table has no DELETE or UPDATE permissions
21. Only INSERT should be allowed
22. Consider signing logs with HMAC

### Part 8: Test Comprehensive Scenarios
23. Verify user_id comes from auth, not request body
24. Test that unauthenticated requests fail or log as anonymous
25. Verify before/after state is accurate
26. Test that failed operations are NOT logged

## Reflection Questions

1. Share your audit log schema. Why did you choose those specific columns?

2. How do you ensure the user_id in audit logs is trustworthy? Show the code.

3. What happens if the audit log write fails but the business operation succeeds?

4. Your audit logs will grow infinitely. Describe your strategy for archival and retention.',
  ARRAY[
    'All CREATE, UPDATE, DELETE actions are logged',
    'User identity comes from authentication context, never client input',
    'Timestamp is set server-side',
    'Before/after state is captured for UPDATE',
    'Logs are stored in database transactions',
    'Sensitive fields are redacted from logs',
    'Audit logs cannot be deleted or modified',
    'Logs can be queried by user, resource, date range',
    'Failed operations are not logged',
    'System can reconstruct resource history from audit trail'
  ],
  'Advanced',
  'Build',
  270, -- 4.5 hours
  ARRAY['PostgreSQL', 'Express.js', 'Transactions', 'Security'],
  'published',
  true,
  'Architecture',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  requirements = EXCLUDED.requirements,
  status = EXCLUDED.status,
  updated_at = NOW();

-- Challenge 8: Implement Optimistic UI Updates (Advanced)
INSERT INTO public.challenges (
  id,
  title,
  slug,
  description,
  requirements,
  difficulty,
  challenge_type,
  estimated_time,
  recommended_tools,
  status,
  ai_generated,
  category,
  created_at,
  updated_at
)
VALUES (
  'c3000008-0008-0008-0008-100000000008'::uuid,
  'Implement Optimistic UI Updates',
  'optimistic-ui-updates',
  '# Implement Optimistic UI Updates

## Challenge Description

Build a feature that updates the UI immediately when users take actions, then synchronizes with the server - rolling back gracefully if the server request fails. This challenge teaches you optimistic updates, conflict resolution, rollback strategies, and how to create responsive interfaces.

Optimistic UI makes applications feel fast by updating the interface before waiting for server confirmation. This is how Twitter instantly shows your like, how Slack immediately displays your message, and how modern apps provide native-like responsiveness.

## Learning Objectives

By completing this challenge, you will be able to:
- Implement optimistic updates that modify UI before server confirmation
- Store previous state for rollback on failure
- Handle race conditions with multiple concurrent optimistic updates
- Display error messages when optimistic updates fail
- Reconcile client state with authoritative server state
- Implement undo/redo patterns
- Balance perceived performance with data integrity

## Instructions

### Part 1: Set Up a Feature to Optimize
1. Choose a feature to make optimistic (like, vote, bookmark, todo toggle)
2. Set up initial UI that displays current state
3. Create a working non-optimistic version first
4. Add artificial network delay to simulate latency

### Part 2: Implement Optimistic Update
5. When user clicks, immediately update local state
6. Show new UI state instantly
7. Send request to server in background
8. Keep track of in-flight requests

### Part 3: Store Previous State for Rollback
9. Before optimistic update, save current state
10. Store it in a way you can access during error handling
11. Consider using a stack if multiple updates can be pending

### Part 4: Implement Rollback on Failure
12. Catch server errors in try-catch block
13. Restore previous state from saved snapshot
14. Display error message to user
15. Consider visual feedback (shake animation, red flash)

### Part 5: Handle Race Conditions
16. Test rapid clicking (multiple requests in flight)
17. Ensure rollback restores correct state
18. Consider using request IDs to match responses
19. Cancel outdated requests if possible

### Part 6: Add Visual Feedback
20. Show loading indicator for in-flight requests
21. Animate state changes for clarity
22. Make failed updates visually distinct
23. Consider showing toast/snackbar for errors

### Part 7: Test Edge Cases
24. Test successful optimistic update
25. Test network failure (should rollback)
26. Test rapid clicks
27. Test offline mode
28. Simulate slow server

### Part 8: Add Retry Logic
29. When request fails, offer "Retry" button
30. Store failed operation details
31. Replay optimistic update when retrying

## Reflection Questions

1. Share a video or GIF showing your optimistic update in action - both success and failure cases.

2. Show your rollback code. How do you store previous state?

3. What''s the user experience if network latency is 5 seconds? What would you improve?

4. When should you NOT use optimistic updates? Give three examples.',
  ARRAY[
    'UI updates immediately when user takes action',
    'Server request happens in background',
    'UI rolls back to previous state if server request fails',
    'Error message displays when rollback occurs',
    'Multiple rapid clicks are handled correctly',
    'Visual feedback shows in-flight state',
    'Rollback is smooth and doesn''t flicker',
    'User can retry failed operations',
    'State remains consistent even with network failures',
    'Works correctly with slow network'
  ],
  'Advanced',
  'Build',
  270, -- 4.5 hours
  ARRAY['React', 'State Management', 'Async', 'UX'],
  'published',
  true,
  'Frontend',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  requirements = EXCLUDED.requirements,
  status = EXCLUDED.status,
  updated_at = NOW();

-- Challenge 9: Design an Immutable XP System (Expert)
INSERT INTO public.challenges (
  id,
  title,
  slug,
  description,
  requirements,
  difficulty,
  challenge_type,
  estimated_time,
  recommended_tools,
  status,
  ai_generated,
  category,
  created_at,
  updated_at
)
VALUES (
  'c3000009-0009-0009-0009-100000000009'::uuid,
  'Design an Immutable XP System',
  'immutable-xp-system',
  '# Design an Immutable XP System

## Challenge Description

Build an experience points (XP) system where XP values are append-only, server-side calculated, and cryptographically tamper-evident. This challenge teaches you event sourcing, ledger patterns, data integrity verification, and how to design systems where trust and auditability are critical.

Gamification systems often have XP, points, or currency that users shouldn''t be able to manipulate. Traditional mutable counters are vulnerable to race conditions, double-spending, and tampering. An immutable event log provides absolute auditability.

## Learning Objectives

By completing this challenge, you will be able to:
- Design append-only event logs for financial-grade data integrity
- Implement server-side calculations that never trust client input
- Use database constraints to enforce immutability
- Calculate running totals from event streams
- Implement idempotency to prevent double-awarding
- Add cryptographic verification (checksums/hashes)
- Handle concurrent XP awards without race conditions
- Design APIs that prevent manipulation

## Instructions

### Part 1: Design Event-Based Schema
1. Create xp_events table (append-only ledger) with id, user_id, amount, reason, idempotency_key, created_at, checksum
2. Set database permissions: only INSERT allowed
3. Create indexes on user_id, idempotency_key
4. Add CHECK constraint: amount != 0

### Part 2: Implement Server-Side XP Awarding
5. Create function awardXP(userId, amount, reason, idempotencyKey)
6. Validate all parameters server-side
7. Check idempotency key to prevent duplicate awards
8. Calculate checksum for tamper detection
9. Insert into xp_events table

### Part 3: Calculate Total XP from Events
10. Create function to calculate user''s total XP: getUserXP(userId)
11. Sum all events for that user
12. Never store total in a mutable field
13. Consider caching with invalidation strategy

### Part 4: Implement Idempotency
14. Ensure each XP award uses unique idempotency_key
15. For challenge completion: "challenge_complete:{userId}:{challengeId}"
16. Attempting to award same key twice should succeed but not create duplicate
17. Return existing event if key already exists

### Part 5: Add Tamper Detection
18. Implement checksum verification function
19. Periodically verify all events have valid checksums
20. Create endpoint: POST /admin/verify-xp-integrity
21. Detect modified records by recomputing checksums

### Part 6: Create Read APIs
22. GET /users/:id/xp - Returns current total and recent events
23. GET /users/:id/xp/history - Returns paginated event log
24. GET /leaderboard - Top users by XP
25. Never allow client to specify XP amount

### Part 7: Prevent Common Exploits
26. Validate amount server-side (never from client)
27. Rate limit XP-awarding endpoints
28. Implement authorization checks
29. Test that client cannot manipulate XP values
30. Test that direct database UPDATE is prevented

### Part 8: Handle Edge Cases
31. Test concurrent XP awards
32. Test idempotency (duplicate requests don''t double-award)
33. Test negative XP (penalties)
34. Verify checksums remain valid
35. Test with millions of events

## Reflection Questions

1. Share your xp_events table schema. What constraints and indexes did you add?

2. Explain your idempotency key strategy. Show examples for 3 different scenarios.

3. How does your checksum calculation work? If an attacker modified an amount field, how would you detect it?

4. Compare performance: event-sourced XP calculation vs. mutable counter. How did you optimize for scale?',
  ARRAY[
    'XP events are stored in append-only ledger',
    'Total XP is calculated from event sum, never stored mutably',
    'All XP amounts are determined server-side',
    'Idempotency prevents duplicate awards',
    'Checksums enable tamper detection',
    'Database constraints prevent zero-amount events',
    'Concurrent awards don''t lose events',
    'Client cannot manipulate XP values through any API',
    'System can verify data integrity and detect tampering',
    'Audit trail shows complete history of all XP changes'
  ],
  'Expert',
  'Build',
  330, -- 5.5 hours
  ARRAY['PostgreSQL', 'Event Sourcing', 'Cryptography', 'CQRS'],
  'published',
  true,
  'Architecture',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  requirements = EXCLUDED.requirements,
  status = EXCLUDED.status,
  updated_at = NOW();

-- Challenge 10: AI-Generated Content with Human Approval Gate (Expert)
INSERT INTO public.challenges (
  id,
  title,
  slug,
  description,
  requirements,
  difficulty,
  challenge_type,
  estimated_time,
  recommended_tools,
  status,
  ai_generated,
  category,
  created_at,
  updated_at
)
VALUES (
  'c3000010-0010-0010-0010-100000000010'::uuid,
  'AI-Generated Content with Human Approval Gate',
  'ai-content-approval-gate',
  '# AI-Generated Content with Human Approval Gate

## Challenge Description

Build a system where AI generates content but requires explicit human review and approval before publication. This challenge teaches you AI governance, approval workflows, audit trails, and how to build AI-assisted systems with human oversight to ensure quality, safety, and accountability.

As AI generation becomes ubiquitous, the ability to review AI output before it goes live is critical. You need workflows where AI proposes, humans validate, and systems enforce that unapproved content never reaches production.

## Learning Objectives

By completing this challenge, you will be able to:
- Design multi-state content workflows (draft, pending, approved, rejected)
- Implement approval gates that prevent premature publication
- Build review interfaces with approve/reject actions
- Create audit trails showing who approved what and when
- Handle concurrent reviews and prevent race conditions
- Implement role-based approval authority
- Design APIs that enforce governance rules
- Add versioning to track changes between proposal and approval

## Instructions

### Part 1: Design Content Workflow Schema
1. Create generated_content table with id, content, status, ai_model, generated_at, reviewed_by, reviewed_at, rejection_reason, published
2. Add CHECK constraint: published = TRUE only if status = ''approved''
3. Create indexes on status, reviewed_by

### Part 2: Implement AI Generation Endpoint
4. Create endpoint: POST /generate that calls an AI API
5. Accept input parameters (prompt, context, etc.)
6. Call AI API (or mock AI for this challenge)
7. Store result with status = ''pending'', published = false
8. Never automatically publish

### Part 3: Build Review Interface API
9. Create endpoint: GET /review/pending - Lists all content awaiting review
10. Include AI-generated content, timestamp, and model info
11. Order by oldest first (FIFO queue)
12. Paginate results

### Part 4: Implement Approval Workflow
13. Create endpoint: POST /review/:id/approve
14. Verify user has approval authority
15. Update record: status = ''approved'', reviewed_by = userId, reviewed_at = NOW()
16. Set published = true
17. Create audit log entry
18. Return 403 if user lacks authority

### Part 5: Implement Rejection Workflow
19. Create endpoint: POST /review/:id/reject
20. Require rejection_reason in request body
21. Update record: status = ''rejected'', keep published = false
22. Store rejection reason

### Part 6: Enforce Approval Gates
23. Create endpoint: GET /content/published
24. Query WHERE status = ''approved'' AND published = TRUE
25. Ensure pending/rejected content is never returned
26. Test that unapproved content is inaccessible

### Part 7: Add Audit Trail
27. Log every state transition
28. Record who made the decision and when
29. Store original AI content and any edits
30. Create endpoint showing full history

### Part 8: Handle Edge Cases
31. Test concurrent reviews (two people reviewing same item)
32. Prevent double-approval
33. Test what happens if reviewer lacks permissions
34. Test rejection without reason (should fail)
35. Verify approved content immediately appears
36. Test that changing published directly fails

## Reflection Questions

1. Share your database schema showing the status enum and published constraint. How do these prevent unapproved content from going live?

2. What happens if two reviewers try to approve the same content simultaneously? Show your concurrency handling.

3. If you needed "edit before approval" functionality, how would your schema and workflow change?

4. Your system has 10,000 pending reviews. How do you prioritize which content gets reviewed first?',
  ARRAY[
    'AI-generated content is stored with status = ''pending''',
    'Pending content is never visible in public APIs',
    'Approval endpoint sets status = ''approved'' and published = true',
    'Only users with approval authority can approve/reject',
    'Rejected content includes reason and reviewer info',
    'Approved content immediately appears in published content API',
    'Database constraints prevent publishing without approval',
    'Complete audit trail tracks all state changes',
    'Concurrent reviews are handled gracefully',
    'System enforces that unapproved content never leaks'
  ],
  'Expert',
  'Build',
  420, -- 7 hours
  ARRAY['AI API', 'PostgreSQL', 'State Machine', 'Governance'],
  'published',
  true,
  'AI / Governance',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  requirements = EXCLUDED.requirements,
  status = EXCLUDED.status,
  updated_at = NOW();
