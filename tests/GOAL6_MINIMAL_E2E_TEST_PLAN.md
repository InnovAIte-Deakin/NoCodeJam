# Goal 6 Minimal E2E Test Plan

## Scope

This plan covers the Sprint 2 Goal 6 backend flow only:

- challenge submission
- admin review
- XP update

It intentionally excludes:

- recommendations
- dashboard UI changes unrelated to submission review
- challenge/pathway linking

## Preconditions

- A regular test user account exists
- An admin account exists
- At least one published challenge with a known `xp_reward` exists
- The application can connect to the target Supabase project

## Test Case 1: Approve awards XP

### Objective

Verify that approving a pending submission:

- updates submission status to `approved`
- stores `xp_earned`
- stores `reviewed_at` and `reviewed_by`
- increments `users.total_xp`

### Steps

1. Log in as a regular user
2. Submit a valid challenge solution URL
3. Confirm a submission record is created with status `pending`
4. Log in as an admin
5. Open the pending submissions list
6. Approve the submission
7. Re-open the submission record in Supabase
8. Re-open the user record in Supabase

### Expected Result

- submission status is `approved`
- `xp_earned` matches challenge XP
- `reviewed_at` is populated
- `reviewed_by` is populated with the admin user id
- `users.total_xp` increases by the same XP amount
- the submission is removed from the pending list

## Test Case 2: Reject does not award XP

### Objective

Verify that rejecting a pending submission:

- updates submission status to `rejected`
- does not award XP
- stores review metadata

### Steps

1. Log in as a regular user
2. Submit another valid challenge solution URL
3. Confirm a submission record is created with status `pending`
4. Log in as an admin
5. Open the pending submissions list
6. Reject the submission
7. Re-open the submission record in Supabase
8. Re-open the user record in Supabase

### Expected Result

- submission status is `rejected`
- `xp_earned` remains `null` or unchanged from a pre-existing value
- `reviewed_at` is populated
- `reviewed_by` is populated with the admin user id
- `users.total_xp` does not change
- the submission is removed from the pending list

## Test Case 3: Duplicate approval does not double-award XP

### Objective

Verify that the same submission cannot award XP twice.

### Steps

1. Create a fresh pending submission as a regular user
2. Approve it once as an admin
3. Capture the user `total_xp`
4. Attempt to approve the same submission again
5. Re-check the same submission and user record

### Expected Result

- the second approval is blocked or ignored
- submission remains `approved`
- `users.total_xp` does not increase a second time
- no duplicate XP is written

## Database Verification Queries

```sql
select id, user_id, challenge_id, status, xp_earned, reviewed_at, reviewed_by
from submissions
where user_id = '<test-user-id>'
order by submitted_at desc;
```

```sql
select id, total_xp
from users
where id = '<test-user-id>';
```

## Known Gaps Before Full E2E Automation

- `vitest` is not installed locally in this workspace
- `@testing-library/react` is not installed locally in this workspace
- There is no existing automated test coverage for `AdminDashboard` submission approval/rejection
- Full execution still depends on real Supabase data, test accounts, and admin access
