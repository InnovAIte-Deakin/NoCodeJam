# Comprehensive End-to-End Testing Checklist - NoCodeJam Platform

**Tester Name**: ___________________
**Test Date**: ___________________
**Browser**: ⬜ Chrome ⬜ Firefox ⬜ Safari ⬜ Edge
**Environment**: ⬜ Production ⬜ Staging ⬜ Local Dev
**Device**: ⬜ Desktop ⬜ Tablet ⬜ Mobile

---

## 🔧 Pre-Test Setup

### Test Data Preparation
- [ ] Create test credentials document with:
  - Regular user email/password
  - Admin user email/password
  - Test URLs for submissions
- [ ] Open browser DevTools (F12) and keep Console tab visible throughout testing
- [ ] Clear browser cache and cookies before starting
- [ ] Have Supabase dashboard open in separate tab for database verification

### Environment Check
- [ ] Application loads without 404 errors
- [ ] No console errors on initial page load
- [ ] Network tab shows successful API connections
- [ ] Verify correct environment URL (production vs staging)

---

## Part 1: Public Access & Authentication (Unauthenticated User)

### Test 1.1: Landing Page & Navigation

**Objective**: Verify public pages are accessible and functional

#### Home Page Load
- [ ] Navigate to homepage (e.g., `https://nocodejam.com`)
- [ ] Page loads within 3 seconds
- [ ] **Visual Check**:
  - [ ] Header/navbar displays correctly
  - [ ] Logo is visible
  - [ ] "Login" and "Sign Up" buttons are present
  - [ ] Footer displays with links
  - [ ] No broken images
  - [ ] No placeholder text (Lorem ipsum)
- [ ] **Console Check**: Zero errors in browser console
- [ ] **Network Check**: All API calls return 200 status

#### Navigation Menu
- [ ] Click each menu item in navbar:
  - [ ] Home - loads successfully
  - [ ] Challenges - shows challenges list (public view)
  - [ ] Pathways/Learn - shows pathways list (public view)
  - [ ] Leaderboard - displays (or prompts login)
  - [ ] About/How It Works - displays information page
- [ ] **Verify**: Clicking logo returns to homepage
- [ ] **Verify**: Active page is highlighted in navigation

#### Responsive Design Check
- [ ] Resize browser window to mobile width (375px)
- [ ] **Verify**: Hamburger menu appears
- [ ] **Verify**: Menu opens/closes correctly
- [ ] **Verify**: All text is readable (no overflow)
- [ ] Resize to tablet width (768px)
- [ ] **Verify**: Layout adjusts appropriately

---

### Test 1.2: User Registration

**Objective**: New users can successfully create accounts

#### Registration Form Access
- [ ] Click "Sign Up" or "Get Started" button
- [ ] Registration form/page loads
- [ ] **Form Elements Present**:
  - [ ] Email input field
  - [ ] Password input field
  - [ ] Confirm password field (if present)
  - [ ] Terms & Conditions checkbox (if required)
  - [ ] Submit button labeled "Sign Up" or "Create Account"

#### Form Validation (Pre-Submit)
- [ ] Leave all fields empty and click Submit
- [ ] **Verify**: Error messages appear for required fields
- [ ] Enter invalid email (e.g., "notanemail")
- [ ] **Verify**: Email validation error appears
- [ ] Enter short password (e.g., "123")
- [ ] **Verify**: Password strength error appears
- [ ] Enter mismatched passwords (if confirm field exists)
- [ ] **Verify**: Passwords don't match error appears

#### Successful Registration
- [ ] Fill form with valid test data:
  - Email: `testuser_[TIMESTAMP]@test.com` (e.g., `testuser_20250124@test.com`)
  - Password: `TestPass123!`
  - Confirm Password: `TestPass123!`
- [ ] Click Submit button
- [ ] **Button State**: Changes to "Creating Account..." or shows loading spinner
- [ ] **Wait for response** (max 10 seconds)
- [ ] **Expected Outcomes** (one of the following):
  - [ ] Redirected to email verification page
  - [ ] Redirected to onboarding flow
  - [ ] Redirected to dashboard
  - [ ] Success message appears
- [ ] **Console Check**: No errors during registration
- [ ] **Network Check**: POST request to `/auth/signup` returns 200/201

#### Email Verification (if enabled)
- [ ] Check test email inbox
- [ ] **Verify**: Verification email received within 2 minutes
- [ ] Click verification link in email
- [ ] **Verify**: Redirected to success page or login page
- [ ] **Verify**: "Email verified" message appears

#### Database Verification
- [ ] Open Supabase Dashboard → Authentication → Users
- [ ] **Verify**: New user appears in users list
- [ ] Note the user ID for later reference
- [ ] Open Table Editor → `public.users` table
- [ ] **Verify**: User record created with:
  - Correct email
  - `role = 'user'` (not admin)
  - `created_at` timestamp is recent
  - Default values populated

---

### Test 1.3: User Login

**Objective**: Users can authenticate with correct credentials

#### Login Form Access
- [ ] If not already logged out, click "Logout"
- [ ] Click "Login" button in navbar
- [ ] Login form/page loads
- [ ] **Form Elements Present**:
  - [ ] Email input field
  - [ ] Password input field
  - [ ] "Remember me" checkbox (optional)
  - [ ] "Forgot Password?" link
  - [ ] "Login" submit button
  - [ ] "Sign Up" link/button

#### Login Validation (Pre-Submit)
- [ ] Leave both fields empty and click Login
- [ ] **Verify**: Required field errors appear
- [ ] Enter email only (no password)
- [ ] **Verify**: Password required error appears
- [ ] Enter password only (no email)
- [ ] **Verify**: Email required error appears

#### Failed Login Attempts
- [ ] Enter correct email but wrong password
- [ ] Click Login
- [ ] **Verify**: "Invalid credentials" or similar error appears
- [ ] **Verify**: Form doesn't clear email field
- [ ] **Verify**: Not redirected anywhere
- [ ] Enter non-existent email
- [ ] Click Login
- [ ] **Verify**: Generic "Invalid credentials" error (not "user not found" - security)

#### Successful Login
- [ ] Enter credentials from Test 1.2:
  - Email: `testuser_[TIMESTAMP]@test.com`
  - Password: `TestPass123!`
- [ ] Click Login button
- [ ] **Button State**: Shows loading state
- [ ] **Expected Redirect** within 3 seconds to one of:
  - [ ] Dashboard
  - [ ] Onboarding flow
  - [ ] Challenges page
- [ ] **Verify**: User's name/email appears in header/navbar
- [ ] **Verify**: "Login" button replaced with user menu or "Logout"
- [ ] **Console Check**: No authentication errors
- [ ] **Network Check**: POST to `/auth/signin` returns 200
- [ ] **Session Check**: Open DevTools → Application → Cookies
  - [ ] Supabase auth cookies are present
  - [ ] Session token exists

#### Session Persistence
- [ ] Stay logged in and close browser tab
- [ ] Reopen application in new tab
- [ ] **Verify**: Still logged in (session persists)
- [ ] **Verify**: Can navigate to protected routes without re-login

---

### Test 1.4: Password Reset Flow

**Objective**: Users can reset forgotten passwords

#### Request Password Reset
- [ ] Log out if logged in
- [ ] Go to Login page
- [ ] Click "Forgot Password?" link
- [ ] **Verify**: Redirected to password reset page
- [ ] **Form Elements Present**:
  - [ ] Email input field
  - [ ] "Send Reset Link" button
  - [ ] "Back to Login" link

#### Reset Link Request Validation
- [ ] Leave email field empty and submit
- [ ] **Verify**: Required field error
- [ ] Enter invalid email format
- [ ] **Verify**: Email validation error
- [ ] Enter non-existent email
- [ ] **Verify**: Generic success message (not "email not found" - security)

#### Successful Reset Request
- [ ] Enter test user email
- [ ] Click "Send Reset Link"
- [ ] **Verify**: Success message: "Check your email for reset link"
- [ ] **Verify**: Not redirected (stays on page or shows confirmation)
- [ ] Check test email inbox
- [ ] **Verify**: Password reset email received within 2 minutes
- [ ] **Verify**: Email contains valid reset link

#### Reset Password
- [ ] Click reset link from email
- [ ] **Verify**: Redirected to password reset form
- [ ] **Form Elements Present**:
  - [ ] New password input
  - [ ] Confirm new password input
  - [ ] "Reset Password" button
- [ ] Enter weak password
- [ ] **Verify**: Password strength error
- [ ] Enter mismatched passwords
- [ ] **Verify**: Passwords don't match error
- [ ] Enter valid new password: `NewTestPass123!`
- [ ] Click "Reset Password"
- [ ] **Verify**: Success message appears
- [ ] **Verify**: Redirected to login page
- [ ] Log in with NEW password
- [ ] **Verify**: Login successful

---

## Part 2: Onboarding Flow (New User Experience)

### Test 2.1: Initial Onboarding

**Objective**: New users complete onboarding successfully

#### Onboarding Start
- [ ] After first login, verify onboarding starts automatically
- [ ] **Onboarding UI Elements**:
  - [ ] Welcome message displays
  - [ ] Progress indicator (steps 1/3, 2/3, etc.)
  - [ ] "Skip" or "Do Later" button (if allowed)
  - [ ] "Next" button

#### Step 1: Profile Setup
- [ ] **Fields Present**:
  - [ ] Username input
  - [ ] Display name input
  - [ ] Avatar upload (optional)
  - [ ] Bio/About textarea (optional)
- [ ] Leave username empty and click Next
- [ ] **Verify**: Validation error prevents progression
- [ ] Enter username with special characters (e.g., "user@#$")
- [ ] **Verify**: Validation error or auto-sanitize
- [ ] Enter valid username: "testuser123"
- [ ] Fill optional fields with test data
- [ ] Click Next
- [ ] **Verify**: Progresses to Step 2

#### Step 2: Interests/Preferences
- [ ] **UI Elements Present**:
  - [ ] Multiple interest checkboxes or tags
  - [ ] Difficulty preference selector
  - [ ] Learning goals textarea (optional)
- [ ] Select at least 2 interests (e.g., "Web Development", "AI")
- [ ] Choose difficulty preference: "Beginner"
- [ ] Click Next
- [ ] **Verify**: Progresses to Step 3

#### Step 3: Onboarding Challenge
- [ ] **Verify**: Challenge description displays
- [ ] **Verify**: "Complete Challenge" or "View Challenge" button present
- [ ] Click to view/start challenge
- [ ] **Verify**: Challenge details page loads
- [ ] **Note**: Challenge titled "Welcome" or "Onboarding Challenge"
- [ ] Click "Complete Later" or "Skip" (if allowed)
- [ ] **Verify**: Redirected to dashboard

#### Onboarding Completion
- [ ] **Verify**: Dashboard displays after onboarding
- [ ] **Verify**: Profile data persists (check Profile page)
- [ ] **Database Check**: Open Supabase → `public.users`
  - [ ] Username field populated
  - [ ] Interests/preferences saved
  - [ ] Onboarding completion timestamp set

#### Onboarding Skip Test (Optional)
- [ ] Create another test account
- [ ] When onboarding starts, click "Skip" or "Do Later"
- [ ] **Verify**: Can proceed to dashboard
- [ ] **Verify**: Can manually access onboarding later from settings

---

## Part 3: Dashboard & User Profile

### Test 3.1: Dashboard Overview

**Objective**: Dashboard displays user stats and activity correctly

#### Dashboard Load
- [ ] Navigate to Dashboard (usually at `/dashboard` or `/home`)
- [ ] Page loads within 2 seconds
- [ ] **Console Check**: No errors

#### Dashboard Components
- [ ] **Stats Cards** visible showing:
  - [ ] Total XP: Should be 0 for new user
  - [ ] Challenges Completed: Should be 0
  - [ ] Current Streak: Should be 0 or 1
  - [ ] Rank/Level: Should show beginner level
- [ ] **Current Activity** section:
  - [ ] "No challenges in progress" message (for new user)
  - [ ] OR "Start a Challenge" call-to-action button
- [ ] **Recommended Challenges** section:
  - [ ] At least 3 challenge cards display
  - [ ] Each card shows: Title, Difficulty badge, XP value
  - [ ] Cards are clickable
- [ ] **Recent Activity** feed:
  - [ ] Shows "No recent activity" or similar for new user
- [ ] **Profile Summary** widget:
  - [ ] User avatar displays (default if not uploaded)
  - [ ] Username displays correctly
  - [ ] "View Profile" button present

#### Dashboard Interactions
- [ ] Click on a recommended challenge card
- [ ] **Verify**: Navigates to challenge details page
- [ ] Return to dashboard (use back button or navbar)
- [ ] Click "View Profile" button
- [ ] **Verify**: Navigates to profile page
- [ ] Return to dashboard

#### Dashboard Refresh
- [ ] Refresh page (F5 or Ctrl+R)
- [ ] **Verify**: All data reloads correctly
- [ ] **Verify**: No console errors on refresh
- [ ] **Verify**: Loading states appear briefly then resolve

---

### Test 3.2: User Profile

**Objective**: Users can view and edit their profile

#### Profile Page Load
- [ ] Navigate to Profile page (click avatar or username)
- [ ] Page loads successfully
- [ ] **Profile Sections Visible**:
  - [ ] Profile header with avatar
  - [ ] Username and display name
  - [ ] Bio/about section
  - [ ] User stats (XP, challenges completed, badges)
  - [ ] "Edit Profile" button
  - [ ] Achievement badges section (may be empty for new user)

#### Profile Data Display
- [ ] **Verify**: Username from onboarding displays correctly
- [ ] **Verify**: Email displays (or is hidden for privacy)
- [ ] **Verify**: Join date displays (should be today for new user)
- [ ] **Verify**: Stats show correct values (all zeros for new user)

#### Edit Profile Mode
- [ ] Click "Edit Profile" button
- [ ] **Verify**: Form fields become editable OR modal opens
- [ ] **Editable Fields**:
  - [ ] Display name / Full name
  - [ ] Bio / About me (textarea)
  - [ ] Avatar upload button
  - [ ] Social links (optional)
  - [ ] Email preferences (optional)
- [ ] **Buttons Present**:
  - [ ] "Save Changes"
  - [ ] "Cancel"

#### Profile Update Validation
- [ ] Clear display name field
- [ ] Click Save
- [ ] **Verify**: Validation error prevents save
- [ ] Enter extremely long bio (5000+ characters)
- [ ] **Verify**: Character limit enforced or warning shown

#### Successful Profile Update
- [ ] Update display name: "Test User Updated"
- [ ] Update bio: "This is my test bio for QA testing"
- [ ] Click Save
- [ ] **Verify**: "Profile updated successfully" message appears
- [ ] **Verify**: Form exits edit mode OR modal closes
- [ ] **Verify**: New values display immediately (no refresh needed)
- [ ] Refresh page
- [ ] **Verify**: Changes persist after refresh

#### Avatar Upload Test
- [ ] Click "Edit Profile"
- [ ] Click avatar upload button
- [ ] **File Upload Validation**:
  - [ ] Try uploading .txt file
  - [ ] **Verify**: Error: "Invalid file type. Please upload an image."
  - [ ] Try uploading 10MB+ image
  - [ ] **Verify**: Error: "File too large. Max 5MB."
- [ ] Upload valid small image (< 2MB, .jpg or .png)
- [ ] **Verify**: Image preview appears
- [ ] Save changes
- [ ] **Verify**: Avatar updates across site (check navbar, dashboard)

#### Database Verification
- [ ] Open Supabase → `public.users` table
- [ ] Find your test user record
- [ ] **Verify**: Updated fields match:
  - Display name = "Test User Updated"
  - Bio contains test text
  - Avatar URL present (if uploaded)
- [ ] Check `updated_at` timestamp is recent

---

## Part 4: Learning Pathways

### Test 4.1: Browse Pathways

**Objective**: Users can discover and explore learning pathways

#### Pathways List Page
- [ ] Navigate to "Pathways" or "Learn" from nav menu
- [ ] Page loads within 2 seconds
- [ ] **Page Elements**:
  - [ ] Page title: "Learning Pathways" or similar
  - [ ] Search bar (optional)
  - [ ] Filter options (by difficulty, category, etc.)
  - [ ] At least 3 pathway cards display

#### Pathway Card Information
For each pathway card, verify it displays:
- [ ] Pathway title
- [ ] Brief description (1-2 sentences)
- [ ] Difficulty badge (Beginner/Intermediate/Advanced/Expert)
- [ ] Estimated time (e.g., "8 hours")
- [ ] Total XP value
- [ ] Number of challenges/modules
- [ ] Cover image or icon
- [ ] "View Pathway" or "Enroll" button
- [ ] Enrollment count (optional: "245 enrolled")

#### Pathway Filtering
- [ ] Click "Beginner" difficulty filter
- [ ] **Verify**: Only beginner pathways display
- [ ] **Verify**: URL updates (e.g., `?difficulty=beginner`)
- [ ] Click "All" or clear filter
- [ ] **Verify**: All pathways return
- [ ] If search exists, type keyword (e.g., "Web")
- [ ] **Verify**: Results filter in real-time
- [ ] **Verify**: Relevant pathways appear

#### No Results State
- [ ] Search for nonsense term (e.g., "xyzabc123")
- [ ] **Verify**: "No pathways found" message displays
- [ ] **Verify**: "Clear search" or "View all" button present
- [ ] Clear search
- [ ] **Verify**: Pathways reappear

---

### Test 4.2: Pathway Details & Enrollment

**Objective**: Users can view pathway details and enroll

#### Open Pathway Details
- [ ] Click on a pathway card (choose "Beginner" difficulty)
- [ ] Pathway detail page loads
- [ ] **Header Section**:
  - [ ] Pathway title displays
  - [ ] Difficulty badge
  - [ ] Total XP and estimated time
  - [ ] "Enroll" or "Start Learning" button (if not enrolled)
  - [ ] Enrollment count
  - [ ] "Share" button (optional)

#### Pathway Content Display
- [ ] **Description Section**:
  - [ ] Full pathway description (multiple paragraphs)
  - [ ] Learning objectives/outcomes list
  - [ ] Prerequisites (if any)
- [ ] **Curriculum/Modules Section**:
  - [ ] List of modules displays
  - [ ] Each module shows:
    - [ ] Module number and title
    - [ ] Challenges within module
    - [ ] XP per module
    - [ ] Locked/unlocked status
- [ ] **What You'll Learn** section (optional):
  - [ ] Skills list
  - [ ] Tools/technologies used

#### Enroll in Pathway
- [ ] Click "Enroll" or "Start Learning" button
- [ ] **Button State**: Changes to loading
- [ ] **Expected Outcomes**:
  - [ ] Button changes to "Continue Learning" or "View Progress"
  - [ ] Success message: "Successfully enrolled!"
  - [ ] First challenge/module becomes highlighted or unlocked
- [ ] **Console Check**: No errors during enrollment
- [ ] **Verify**: Can immediately click into first challenge

#### Enrollment Verification
- [ ] Return to Dashboard
- [ ] **Verify**: Enrolled pathway appears in "Current Learning" section
- [ ] **Verify**: Progress bar shows 0% complete
- [ ] Navigate back to Pathways list
- [ ] **Verify**: Enrolled pathway card shows "In Progress" badge
- [ ] **Database Check**: Supabase → `pathway_enrollments`
  - [ ] New record exists for user_id + pathway_id
  - [ ] Status = 'active'
  - [ ] Progress = 0
  - [ ] Started_at timestamp is recent

---

### Test 4.3: Pathway Progress Tracking

**Objective**: Progress updates correctly as challenges are completed

#### View Enrolled Pathway
- [ ] Open pathway details page for enrolled pathway
- [ ] **Verify**: Shows "Continue Learning" button (not "Enroll")
- [ ] **Verify**: First module/challenge is accessible
- [ ] Click first challenge in curriculum
- [ ] **Verify**: Opens challenge details page
- [ ] Note the challenge title for later verification

#### Complete First Challenge in Pathway
- [ ] From challenge details, click "Start Challenge" or "Submit Solution"
- [ ] Enter solution URL: `https://github.com/testuser/solution1`
- [ ] Enter reflection notes: "Completed first challenge of pathway"
- [ ] Submit solution
- [ ] **Verify**: Success message
- [ ] **Note**: Don't approve submission yet (do in admin section)

#### Check Pathway Progress (Before Approval)
- [ ] Return to pathway details page
- [ ] **Verify**: First challenge still shows as "submitted" or "in progress"
- [ ] **Verify**: Overall progress bar still shows 0% or low percentage
- [ ] **Verify**: Next challenge may still be locked (depends on design)

#### After Admin Approval (Complete Later in Admin Tests)
*This section verifies after Test 9.2 admin approval*
- [ ] After admin approves submission, return to pathway
- [ ] **Verify**: First challenge shows checkmark or "Completed" badge
- [ ] **Verify**: Progress bar increases (e.g., 1/8 = 12.5%)
- [ ] **Verify**: Next challenge unlocks (if sequential)
- [ ] **Verify**: XP from challenge is awarded to user

---

## Part 5: Challenges (Discovery & Submission)

### Test 5.1: Browse Challenges

**Objective**: Users can find and filter challenges

#### Challenges List Page
- [ ] Navigate to "Challenges" from nav menu
- [ ] Page loads within 2 seconds
- [ ] **Page Layout**:
  - [ ] Page title: "Challenges" or "Browse Challenges"
  - [ ] Filter panel (sidebar or top section)
  - [ ] Sort dropdown (e.g., "Most Recent", "Most Popular", "XP: High to Low")
  - [ ] Challenge cards grid/list (at least 6 challenges visible)

#### Challenge Card Details
Each challenge card should display:
- [ ] Challenge title
- [ ] Brief description (truncated)
- [ ] Difficulty badge with color (green=Beginner, yellow=Intermediate, red=Expert)
- [ ] XP value badge
- [ ] Challenge type badge (Build/Modify/Analyse/Deploy/Reflect)
- [ ] Estimated time (e.g., "60 mins")
- [ ] Status indicator if enrolled/completed:
  - [ ] "Not Started" (default)
  - [ ] "In Progress" (started but not submitted)
  - [ ] "Submitted" (awaiting review)
  - [ ] "Completed" (approved)

#### Filter Functionality
- [ ] **Filter by Difficulty**:
  - [ ] Click "Beginner" filter
  - [ ] **Verify**: Only beginner challenges display
  - [ ] **Verify**: Count updates (e.g., "Showing 12 of 45")
  - [ ] Click "Intermediate"
  - [ ] **Verify**: Results update
  - [ ] Select both "Beginner" AND "Intermediate"
  - [ ] **Verify**: Shows challenges from both levels
- [ ] **Filter by Type**:
  - [ ] Click "Build" type filter
  - [ ] **Verify**: Only "Build" challenges display
  - [ ] Clear filter
  - [ ] **Verify**: All challenges return
- [ ] **Filter by XP Range** (if available):
  - [ ] Adjust XP slider to 0-200
  - [ ] **Verify**: Only low-XP challenges display
- [ ] **Clear All Filters** button:
  - [ ] Apply multiple filters
  - [ ] Click "Clear All"
  - [ ] **Verify**: All filters reset

#### Search Functionality
- [ ] Enter search term: "API"
- [ ] **Verify**: Results update in real-time (debounced)
- [ ] **Verify**: Highlighted matches in titles/descriptions
- [ ] Search for exact challenge title (from earlier tests)
- [ ] **Verify**: That specific challenge appears
- [ ] Search for nonsense term: "zzznotexist"
- [ ] **Verify**: "No challenges found" message
- [ ] **Verify**: "Clear search" button available

#### Sort Functionality
- [ ] Click sort dropdown
- [ ] **Options Available**:
  - [ ] Newest First
  - [ ] Oldest First
  - [ ] XP: High to Low
  - [ ] XP: Low to High
  - [ ] Most Popular (if feature exists)
- [ ] Select "XP: High to Low"
- [ ] **Verify**: Challenges re-order with highest XP first
- [ ] **Verify**: First challenge shows >500 XP
- [ ] Select "XP: Low to High"
- [ ] **Verify**: Order reverses

#### Pagination or Infinite Scroll
- [ ] Scroll to bottom of page
- [ ] If pagination:
  - [ ] Click "Next Page" or page number
  - [ ] **Verify**: New challenges load
  - [ ] **Verify**: Can navigate back to page 1
- [ ] If infinite scroll:
  - [ ] **Verify**: More challenges load automatically
  - [ ] **Verify**: Loading spinner appears briefly

---

### Test 5.2: Challenge Details Page

**Objective**: Challenge details display correctly and completely

#### Navigate to Challenge Details
- [ ] From challenges list, click a "Beginner" challenge
- [ ] Details page loads within 2 seconds
- [ ] **Console Check**: No errors

#### Challenge Header Section
- [ ] **Header Elements**:
  - [ ] Challenge title (large, prominent)
  - [ ] Difficulty badge
  - [ ] XP value badge
  - [ ] Estimated time
  - [ ] Challenge type badge
  - [ ] "Start Challenge" or "Submit Solution" button
  - [ ] "Bookmark" or "Save" button (optional)
  - [ ] "Share" button (optional)

#### Challenge Description Section
- [ ] **Full Description**:
  - [ ] Multiple paragraphs of text
  - [ ] Formatting preserved (bold, lists, links)
  - [ ] Code snippets display with syntax highlighting (if any)
- [ ] **What You'll Build/Learn**:
  - [ ] Bulleted list of outcomes
  - [ ] Clear learning objectives

#### Requirements Section
- [ ] **Requirements List**:
  - [ ] At least 2-3 requirement items
  - [ ] Each item has checkbox or bullet point
  - [ ] Requirements are clear and specific
  - [ ] Examples: "Must be mobile responsive", "Include authentication"
- [ ] **Optional**: Acceptance Criteria subsection

#### Additional Information
- [ ] **Recommended Tools** (if applicable):
  - [ ] List of suggested technologies
  - [ ] Links to tool documentation (optional)
- [ ] **Prerequisites** (if applicable):
  - [ ] Skills or prior challenges required
- [ ] **Resources** section (if available):
  - [ ] Links to tutorials, docs, or references
  - [ ] Video embeds (optional)

#### Related Challenges
- [ ] Scroll to bottom of page
- [ ] **Verify**: "Related Challenges" or "You Might Also Like" section
- [ ] **Verify**: 3-6 similar challenges displayed
- [ ] Click one related challenge
- [ ] **Verify**: Navigates to that challenge's details

---

### Test 5.3: Challenge Submission (User Perspective)

**Objective**: Users can submit challenge solutions successfully

#### Start Challenge Flow
- [ ] From challenge details, click "Start Challenge" button
- [ ] **Expected Behavior** (one of):
  - [ ] Modal/form opens for submission
  - [ ] Redirects to dedicated submission page
  - [ ] Inline form appears on same page
- [ ] **Submission Form Fields**:
  - [ ] Solution URL input (required)
  - [ ] Reflection notes textarea (may be optional)
  - [ ] Screenshot upload (optional)
  - [ ] "Submit for Review" button
  - [ ] "Cancel" or "Save Draft" button (optional)

#### Submission Validation
- [ ] Leave URL field empty and click Submit
- [ ] **Verify**: "Solution URL is required" error
- [ ] Enter invalid URL format: "not a url"
- [ ] **Verify**: "Please enter a valid URL" error
- [ ] Enter valid but non-existent URL: `https://invalidsite123456.com`
- [ ] Click Submit
- [ ] **Verify**: Form accepts it (no connection checking) OR warning appears

#### Successful Challenge Submission
- [ ] Enter valid GitHub/deployment URL: `https://github.com/testuser/challenge-solution-1`
- [ ] Enter reflection notes:
  ```
  I completed this challenge in 2 hours.
  I learned about responsive design and CSS Grid.
  Challenges faced: Cross-browser compatibility.
  Next steps: Add accessibility features.
  ```
- [ ] Upload screenshot (optional, if field exists)
- [ ] Click "Submit for Review"
- [ ] **Button State**: Shows loading spinner
- [ ] **Expected Outcomes**:
  - [ ] Success message: "Solution submitted! Awaiting admin review."
  - [ ] Modal closes OR redirects to dashboard/challenges list
  - [ ] Challenge card status changes to "Submitted" or "Pending Review"
- [ ] **Console Check**: No errors during submission

#### Post-Submission Verification
- [ ] Return to challenge details page
- [ ] **Verify**: "Start Challenge" button changes to "Submitted" or "Pending Review"
- [ ] **Verify**: Can't re-submit (button disabled or hidden)
- [ ] **Verify**: Can view your submission (optional feature):
  - [ ] "View My Submission" button appears
  - [ ] Click to see your submitted URL and notes
- [ ] Return to Dashboard
- [ ] **Verify**: Challenge appears in "Pending Review" section
- [ ] Navigate to Challenges list
- [ ] **Verify**: Challenge card shows "Submitted" badge

#### Database Verification
- [ ] Open Supabase → `submissions` or `challenge_completions` table
- [ ] **Verify**: New record exists with:
  - [ ] user_id = your test user ID
  - [ ] challenge_id = the challenge ID
  - [ ] submission_url = your GitHub URL
  - [ ] reflection_notes = your notes text
  - [ ] status = 'pending' or 'submitted'
  - [ ] submitted_at timestamp is recent
- [ ] **Verify**: No XP awarded yet (xp_earned = null or 0)

#### Multiple Challenge Submissions
- [ ] Repeat submission process for 2 more different challenges:
  - Challenge 2 URL: `https://github.com/testuser/challenge-solution-2`
  - Challenge 3 URL: `https://codesandbox.io/s/test-solution-3`
- [ ] **Verify**: All 3 submissions appear in dashboard "Pending Review"
- [ ] **Verify**: All 3 challenges show "Submitted" status

---

### Test 5.4: Challenge Request Feature (User Creates Request)

**Objective**: Users can request new challenges

#### Access Challenge Request Form
- [ ] Click "Request Challenge" button (location: navbar, dashboard, or challenges page)
- [ ] Form opens in modal OR new page
- [ ] **Form Fields Present**:
  - [ ] Challenge Title (required)
  - [ ] Description (required)
  - [ ] Difficulty dropdown (required)
  - [ ] Category/Type dropdown (optional)
  - [ ] Estimated Time input (optional)
  - [ ] Requirements/Outcomes textarea (optional)
  - [ ] Recommended Tools input (optional)
  - [ ] Submit button

#### Request Form Validation
- [ ] Leave title empty and click Submit
- [ ] **Verify**: "Title is required" error
- [ ] Enter very short title: "a"
- [ ] **Verify**: "Title must be at least 5 characters" error (or similar)
- [ ] Leave description empty and submit
- [ ] **Verify**: "Description is required" error
- [ ] Select no difficulty and submit
- [ ] **Verify**: "Please select a difficulty" error

#### Successful Challenge Request Submission
- [ ] Fill form with test data:
  - Title: "Build a Weather Dashboard with Live API"
  - Description: "Create a weather dashboard that fetches data from OpenWeatherMap API. Display current conditions and 5-day forecast. Include search by city name."
  - Difficulty: "Intermediate"
  - Category: "Build"
  - Estimated Time: "120 minutes"
  - Requirements: "Use React, Fetch from API, Display forecast, Mobile responsive"
  - Recommended Tools: "React, OpenWeatherMap API, CSS Grid"
- [ ] Click Submit
- [ ] **Button State**: Shows loading
- [ ] **Expected Outcomes**:
  - [ ] Success message: "Challenge request submitted! Admins will review shortly."
  - [ ] Form closes or clears
  - [ ] Confirmation displayed
- [ ] **Console Check**: No errors

#### Verify Request Does NOT Appear Publicly
- [ ] Navigate to Challenges list
- [ ] Search for your challenge title: "Weather Dashboard"
- [ ] **CRITICAL**: Challenge should NOT appear (it's pending admin approval)
- [ ] **Expected**: "No challenges found" or challenge is not in public list

#### Database Verification
- [ ] Open Supabase → `challenge_requests` table
- [ ] **Verify**: New record exists with:
  - [ ] user_id = your test user ID
  - [ ] title = "Build a Weather Dashboard with Live API"
  - [ ] description = full description text
  - [ ] difficulty = "intermediate" (lowercase)
  - [ ] status = 'pending'
  - [ ] category = "Build"
  - [ ] requirements = your requirements text
  - [ ] additional_notes = recommended tools (if stored there)
  - [ ] created_at timestamp is recent
  - [ ] reviewed_at = null (not reviewed yet)
  - [ ] reviewed_by = null

#### Submit Second Challenge Request
- [ ] Open request form again
- [ ] Fill with different data:
  - Title: "API Security Best Practices Tutorial"
  - Description: "Learn about JWT, OAuth, and rate limiting"
  - Difficulty: "Advanced"
- [ ] Submit
- [ ] **Verify**: Second request also succeeds
- [ ] **Database**: Verify 2 pending requests exist for your user

---

## Part 6: Leaderboard & Community

### Test 6.1: Leaderboard Page

**Objective**: Leaderboard displays rankings correctly

#### Access Leaderboard
- [ ] Click "Leaderboard" in navigation menu
- [ ] Page loads within 2 seconds
- [ ] **Console Check**: No errors

#### Leaderboard Layout
- [ ] **Page Elements**:
  - [ ] Page title: "Leaderboard" or "Top Performers"
  - [ ] Filter tabs (optional): "All Time", "This Month", "This Week"
  - [ ] Podium/Top 3 section (visual emphasis)
  - [ ] Leaderboard table/list starting from rank 4
- [ ] **Top 3 Display**:
  - [ ] 1st place: Largest card, gold badge/color
  - [ ] 2nd place: Silver badge/color
  - [ ] 3rd place: Bronze badge/color
  - [ ] Each shows: Avatar, Username, XP total, Badge count

#### Leaderboard Table
- [ ] **Table Headers**:
  - [ ] Rank (#)
  - [ ] User (avatar + username)
  - [ ] XP / Total Points
  - [ ] Challenges Completed
  - [ ] Badges Earned (optional)
  - [ ] Level (optional)
- [ ] **Verify**: At least 10 users displayed
- [ ] **Verify**: Users sorted by XP (highest first)
- [ ] **Verify**: Ranks are sequential (1, 2, 3, 4...)

#### Current User Highlight
- [ ] Scroll through leaderboard
- [ ] **Find Your Test User** (likely near bottom if new user)
- [ ] **Verify**: Your row is highlighted (different background color)
- [ ] **Verify**: Your rank matches your XP (should be 0 XP = last place)
- [ ] **Verify**: "You" label or indicator appears

#### Filter by Time Period
- [ ] If time period filters exist:
  - [ ] Click "This Month" tab
  - [ ] **Verify**: Leaderboard updates
  - [ ] **Verify**: Different rankings may appear
  - [ ] Click "This Week"
  - [ ] **Verify**: Rankings update again
  - [ ] Click "All Time"
  - [ ] **Verify**: Returns to original view

#### Pagination
- [ ] Scroll to bottom of leaderboard
- [ ] If pagination exists:
  - [ ] Click "Next Page" or page 2
  - [ ] **Verify**: Shows ranks 11-20
  - [ ] **Verify**: Can navigate back to page 1
- [ ] If infinite scroll:
  - [ ] **Verify**: More users load automatically

#### User Profile from Leaderboard
- [ ] Click on a user's avatar or username in leaderboard
- [ ] **Verify**: Opens that user's public profile page
- [ ] **Verify**: Profile shows their stats, badges, completed challenges
- [ ] Return to leaderboard
- [ ] **Verify**: Leaderboard state preserved (same scroll position)

---

### Test 6.2: Badges & Achievements

**Objective**: Badge system functions correctly

#### View Available Badges
- [ ] Navigate to Badges page (if standalone) OR Profile → Badges tab
- [ ] **Page Layout**:
  - [ ] "Earned Badges" section
  - [ ] "Available Badges" section
  - [ ] Badge cards display

#### Badge Card Details
Each badge should show:
- [ ] Badge icon/image
- [ ] Badge name/title
- [ ] Description of how to earn it
- [ ] Progress indicator (if partially complete)
- [ ] "Locked" state for unearned badges

#### Earned Badges Display (Post-Admin Approval)
*This section tests after submissions are approved in Part 9*
- [ ] After admin approves your submissions, return to Badges page
- [ ] **Verify**: Newly earned badges appear
- [ ] **Possible Badges Earned**:
  - [ ] "First Challenge" badge
  - [ ] "Beginner's Journey" badge
  - [ ] "Pathway Pioneer" (if enrolled in pathway)
- [ ] **Verify**: Badge unlock animation plays (if exists)
- [ ] **Verify**: Badge shows "Earned on [date]"

#### Badge Detail View
- [ ] Click on a badge card
- [ ] **Verify**: Modal or detail view opens
- [ ] **Details Shown**:
  - [ ] Larger badge image
  - [ ] Full description
  - [ ] Criteria for earning
  - [ ] Rarity (common/rare/epic) if feature exists
  - [ ] Users who have earned this badge (optional)

---

## Part 7: Notifications & Activity Feed

### Test 7.1: Notifications System

**Objective**: Notifications alert users to important events

#### Notifications Icon
- [ ] Look for notifications bell icon in navbar/header
- [ ] **Verify**: Icon is visible when logged in
- [ ] **Verify**: Badge/counter shows "0" for new user

#### View Notifications Panel
- [ ] Click notifications icon
- [ ] **Verify**: Dropdown panel or sidebar opens
- [ ] **New User State**:
  - [ ] "No notifications yet" message
  - [ ] OR Welcome notification displays

#### Trigger Notifications (Post-Admin Actions)
*After admin approves submission in Part 9:*
- [ ] Return to notifications panel
- [ ] **Verify**: Notification appears:
  - "Your solution for [Challenge Name] has been approved! +200 XP"
- [ ] **Notification Elements**:
  - [ ] Icon (checkmark for approval)
  - [ ] Message text
  - [ ] Timestamp ("2 minutes ago")
  - [ ] Click to view (link to challenge or submission)

#### Mark as Read
- [ ] Click on notification
- [ ] **Verify**: Navigates to relevant page (challenge details)
- [ ] Return to notifications panel
- [ ] **Verify**: Notification marked as read (grayed out or removed from "unread")
- [ ] **Verify**: Unread counter decreases

#### Clear All Notifications
- [ ] If "Clear All" or "Mark All as Read" button exists:
  - [ ] Click it
  - [ ] **Verify**: All notifications cleared or marked read
  - [ ] **Verify**: Counter shows "0"

---

## Part 8: Settings & Account Management

### Test 8.1: Account Settings

**Objective**: Users can manage account settings

#### Access Settings Page
- [ ] Click user avatar/menu in navbar
- [ ] Click "Settings" option
- [ ] Settings page loads
- [ ] **Settings Categories** (tabs or sections):
  - [ ] Profile
  - [ ] Account
  - [ ] Notifications
  - [ ] Privacy
  - [ ] Preferences (optional)

#### Profile Settings Tab
- [ ] **Fields Editable**:
  - [ ] Display name
  - [ ] Username
  - [ ] Bio
  - [ ] Avatar
  - [ ] Social links (Twitter, GitHub, LinkedIn)
- [ ] Update any field (e.g., add Twitter handle)
- [ ] Click Save
- [ ] **Verify**: Success message
- [ ] **Verify**: Changes persist

#### Account Settings Tab
- [ ] **Options Available**:
  - [ ] Change email (with verification)
  - [ ] Change password
  - [ ] Two-factor authentication (if available)
  - [ ] Delete account (dangerous zone)
- [ ] **Change Email Test**:
  - [ ] Click "Change Email"
  - [ ] Enter new email: `testuser_updated@test.com`
  - [ ] **Verify**: "Verification email sent" message
  - [ ] Check inbox and verify (if testing full flow)

#### Change Password
- [ ] Click "Change Password" button
- [ ] **Form Fields**:
  - [ ] Current password
  - [ ] New password
  - [ ] Confirm new password
- [ ] Enter incorrect current password
- [ ] **Verify**: Error: "Current password is incorrect"
- [ ] Enter correct current password
- [ ] Enter new password: `NewPassword123!`
- [ ] Confirm new password
- [ ] Submit
- [ ] **Verify**: Success message
- [ ] Log out and log back in with NEW password
- [ ] **Verify**: Login succeeds

#### Notification Preferences
- [ ] Navigate to Notifications tab
- [ ] **Settings Available**:
  - [ ] Email notifications toggle
  - [ ] Submission approval notifications
  - [ ] Weekly digest toggle
  - [ ] Push notifications (if PWA)
- [ ] Toggle some settings off
- [ ] Click Save
- [ ] **Verify**: Preferences saved
- [ ] Refresh page
- [ ] **Verify**: Toggle states persist

#### Privacy Settings
- [ ] Navigate to Privacy tab
- [ ] **Options**:
  - [ ] Profile visibility (Public / Private)
  - [ ] Show email on profile
  - [ ] Show activity feed to others
  - [ ] Allow others to view completed challenges
- [ ] Change visibility to "Private"
- [ ] Save
- [ ] **Verify**: Settings saved
- [ ] **Test Impact**: Log in as different user, try to view your profile
  - [ ] **Verify**: Profile is hidden or limited info shown

---

### Test 8.2: Account Deletion

**Objective**: Users can delete their accounts safely

⚠️ **WARNING**: This test creates a throw-away account. Do NOT delete main test account.

#### Create Disposable Account
- [ ] Log out of main test account
- [ ] Register new account: `deletetest@test.com` / `DeleteMe123!`
- [ ] Complete minimal onboarding
- [ ] Navigate to Settings → Account

#### Delete Account Flow
- [ ] Scroll to "Danger Zone" section
- [ ] **Verify**: "Delete Account" button is styled as dangerous (red)
- [ ] Click "Delete Account"
- [ ] **Confirmation Modal Appears**:
  - [ ] Warning text: "This action cannot be undone"
  - [ ] "Type your email to confirm" input field
  - [ ] "Cancel" button
  - [ ] "Delete My Account" button (red)
- [ ] Type incorrect email
- [ ] **Verify**: Delete button remains disabled
- [ ] Type correct email: `deletetest@test.com`
- [ ] **Verify**: Delete button enables
- [ ] Click "Delete My Account"
- [ ] **Expected Outcomes**:
  - [ ] Account deleted successfully
  - [ ] Logged out immediately
  - [ ] Redirected to homepage or goodbye page
- [ ] Try to log back in with deleted account credentials
- [ ] **Verify**: Login fails with "User not found" or similar error

#### Database Verification
- [ ] Open Supabase → Authentication → Users
- [ ] **Verify**: `deletetest@test.com` user is gone OR marked as deleted
- [ ] Check `public.users` table
- [ ] **Verify**: User record deleted OR has `deleted_at` timestamp

---

## Part 9: Admin Dashboard & Management

**Actor**: Admin User (Log out of regular user, log in with admin credentials)

### Test 9.1: Admin Dashboard Access & Overview

**Objective**: Only admins can access admin features

#### Verify Admin Access
- [ ] Log out of regular test user account
- [ ] Log in with admin credentials
- [ ] **Verify**: "Admin Dashboard" link appears in navbar/user menu
- [ ] Click "Admin Dashboard"
- [ ] Dashboard page loads
- [ ] **Console Check**: No permission errors

#### Admin Dashboard Layout
- [ ] **Stats Cards Section**:
  - [ ] Total Users count (e.g., "248 Users")
  - [ ] Total Challenges (e.g., "45 Challenges")
  - [ ] Pending Submissions count (e.g., "12 Pending")
  - [ ] Pending Challenge Requests (e.g., "5 Pending")
- [ ] **Tabs or Navigation**:
  - [ ] Overview (current)
  - [ ] Pending Submissions
  - [ ] Challenge Requests
  - [ ] Manage Users
  - [ ] Manage Challenges (optional)
  - [ ] Manage Pathways (optional)
  - [ ] Reports/Analytics (optional)

#### Stats Verification
- [ ] **Verify**: Stat cards show non-zero numbers (unless brand new system)
- [ ] Note the "Pending Submissions" count (should include 3 from earlier tests)
- [ ] Note the "Pending Challenge Requests" count (should include 2 from earlier tests)

#### Recent Activity Feed
- [ ] **Verify**: Activity feed displays recent events:
  - [ ] "User X submitted challenge Y" (from your test submissions)
  - [ ] "User X enrolled in pathway Z"
  - [ ] Each item shows timestamp
- [ ] **Verify**: Activity items are clickable
- [ ] Click one activity item
- [ ] **Verify**: Navigates to relevant detail page

---

### Test 9.2: Review & Approve Submissions

**Objective**: Admins can review and approve user submissions

#### Navigate to Pending Submissions
- [ ] Click "Pending Submissions" tab
- [ ] **Verify**: List of submissions displays
- [ ] **Verify**: At least 3 submissions from your test user appear
- [ ] **Submission Table Columns**:
  - [ ] User (avatar + username)
  - [ ] Challenge title
  - [ ] Submitted date
  - [ ] Solution URL (link)
  - [ ] Actions (Approve / Reject buttons)

#### View Submission Details
- [ ] Click on first submission row OR "View Details" button
- [ ] **Submission Detail View Opens** (modal or new page):
  - [ ] User information (avatar, name, email)
  - [ ] Challenge title and details
  - [ ] Solution URL (clickable link)
  - [ ] Reflection notes (full text)
  - [ ] Screenshot (if submitted)
  - [ ] Submitted timestamp
  - [ ] XP that will be awarded
- [ ] Click solution URL
- [ ] **Verify**: Opens in new tab to GitHub/deployment URL
- [ ] Review the (fake) submission
- [ ] Return to admin dashboard

#### Approve Submission
- [ ] Back on submission detail view, click "Approve" button
- [ ] **Optional**: Add admin feedback comment
- [ ] Confirm approval
- [ ] **Expected Outcomes**:
  - [ ] Success message: "Submission approved! User awarded +200 XP"
  - [ ] Submission removes from pending list
  - [ ] User's XP increased (verify in user management)
- [ ] **Console Check**: No errors during approval

#### Verify Approval Effects
- [ ] Navigate to "Manage Users" tab
- [ ] Search for your test user
- [ ] **Verify**: XP total increased by 200 (or challenge XP amount)
- [ ] **Verify**: "Challenges Completed" count increased by 1
- [ ] Return to "Pending Submissions"
- [ ] **Verify**: Approved submission no longer in list
- [ ] **Verify**: Pending count decreased by 1

#### Reject Submission
- [ ] Find another pending submission (2nd test submission)
- [ ] Click "Reject" button
- [ ] **Rejection Modal**:
  - [ ] "Reason for rejection" textarea (required or optional)
  - [ ] "Cancel" button
  - [ ] "Reject Submission" button (styled as warning)
- [ ] Enter rejection reason:
  ```
  Solution does not meet requirements. Missing responsive design implementation.
  Please update and resubmit.
  ```
- [ ] Click "Reject Submission"
- [ ] **Expected Outcomes**:
  - [ ] Success message: "Submission rejected"
  - [ ] Submission removes from pending OR moves to "Rejected" tab
  - [ ] User NOT awarded XP
- [ ] **Verify**: Pending count decreased

#### Approve Third Submission
- [ ] Repeat approval process for 3rd test submission
- [ ] **Verify**: Total 2 submissions approved, 1 rejected
- [ ] **Verify**: Test user now has 400 XP (2 × 200 XP)

#### Database Verification
- [ ] Open Supabase → `submissions` table
- [ ] Filter by your test user ID
- [ ] **Verify**: 3 submission records exist:
  - [ ] 2 with status = 'approved', xp_earned populated
  - [ ] 1 with status = 'rejected', xp_earned = null
  - [ ] `reviewed_at` timestamps are recent
  - [ ] `reviewed_by` = admin user ID

#### User-Side Verification
- [ ] Log out of admin account
- [ ] Log in as test user
- [ ] Navigate to Dashboard
- [ ] **Verify**: XP total shows 400 (or sum of approved XP)
- [ ] **Verify**: "Challenges Completed" shows 2
- [ ] **Verify**: Approved challenges show "Completed" status
- [ ] **Verify**: Rejected challenge shows "Rejected" or "Needs Resubmission"
- [ ] Click on rejected challenge
- [ ] **Verify**: Can see rejection reason
- [ ] **Verify**: "Resubmit" button available

---

### Test 9.3: Manage Challenge Requests

**Objective**: Admins can review and approve challenge requests

#### Navigate to Challenge Requests Tab
- [ ] Return to admin dashboard (log in as admin)
- [ ] Click "Challenge Requests" tab
- [ ] **Verify**: List of pending requests displays
- [ ] **Verify**: 2 requests from test user appear
- [ ] **Table Columns**:
  - [ ] Requested by (user)
  - [ ] Challenge title
  - [ ] Difficulty
  - [ ] Category/Type
  - [ ] Submitted date
  - [ ] Status (Pending)
  - [ ] Actions (Approve / Reject)

#### View Challenge Request Details
- [ ] Click first request: "Build a Weather Dashboard with Live API"
- [ ] **Request Detail View**:
  - [ ] User who requested (avatar, name)
  - [ ] Challenge title
  - [ ] Full description
  - [ ] Difficulty
  - [ ] Category
  - [ ] Estimated time
  - [ ] Requirements list
  - [ ] Additional notes (recommended tools)
  - [ ] Requested date
- [ ] **Action Buttons**:
  - [ ] "Create Challenge" (approve and publish)
  - [ ] "Reject Request"
  - [ ] "Edit Before Publishing" (optional)

#### Approve Challenge Request (Create Challenge)
- [ ] Click "Create Challenge" button
- [ ] **Challenge Creation Form Opens** (modal or new page):
  - [ ] Pre-filled with request data:
    - [ ] Title: "Build a Weather Dashboard with Live API"
    - [ ] Description: (full description from request)
    - [ ] Difficulty: "Intermediate" (capitalized correctly)
    - [ ] Requirements: (parsed from request)
  - [ ] **Additional Fields to Fill**:
    - [ ] XP Reward (auto-calculated or editable)
    - [ ] Cover image URL (optional)
    - [ ] Tags (optional)
    - [ ] Status: Defaults to "published"
- [ ] **Verify**: All data correctly populated from request
- [ ] **Verify**: Difficulty is "Intermediate" (capitalized, not "intermediate")
- [ ] Adjust XP if needed (e.g., 500 XP)
- [ ] Add cover image URL (optional): `https://example.com/weather-dashboard.png`
- [ ] Click "Create Challenge"
- [ ] **Expected Outcomes**:
  - [ ] Success message: "Challenge created and published!"
  - [ ] Request status changes to "Approved"
  - [ ] Request removes from pending list OR moves to "Approved" section
- [ ] **Console Check**: No errors during challenge creation

#### Verify Challenge is Published
- [ ] Log out of admin account
- [ ] Log in as regular user (or view as public)
- [ ] Navigate to Challenges list
- [ ] **Search for**: "Weather Dashboard"
- [ ] **CRITICAL VERIFICATION**:
  - [ ] Challenge "Build a Weather Dashboard with Live API" NOW appears in public list
  - [ ] Shows correct difficulty: "Intermediate"
  - [ ] Shows correct XP: 500
  - [ ] Challenge is clickable and details page loads
- [ ] **Verify**: Original requester sees challenge (if logged in as test user)

#### Reject Challenge Request
- [ ] Log back in as admin
- [ ] Go to Challenge Requests tab
- [ ] Find second request: "API Security Best Practices Tutorial"
- [ ] Click "Reject" button
- [ ] **Rejection Modal**:
  - [ ] "Reason for rejection" textarea
  - [ ] "Reject Request" button
- [ ] Enter rejection reason:
  ```
  This topic overlaps with existing "API Authentication" pathway.
  Suggest merging into existing content.
  ```
- [ ] Click "Reject Request"
- [ ] **Verify**: Success message
- [ ] **Verify**: Request status changes to "Rejected"
- [ ] **Verify**: Request removes from pending list

#### Database Verification
- [ ] Open Supabase → `challenge_requests` table
- [ ] **Verify**: 2 request records exist:
  - [ ] 1st: status = 'approved', reviewed_at populated, reviewed_by = admin ID
  - [ ] 2nd: status = 'rejected', reviewed_at populated, reviewed_by = admin ID
- [ ] Open Supabase → `challenges` table
- [ ] **Verify**: New challenge record exists:
  - [ ] title = "Build a Weather Dashboard with Live API"
  - [ ] difficulty = "Intermediate" (capitalized)
  - [ ] status = "published"
  - [ ] created_by = admin user ID (NOT original requester)
  - [ ] xp_reward = 500

---

### Test 9.4: User Management

**Objective**: Admins can manage user accounts and roles

#### Navigate to User Management
- [ ] In admin dashboard, click "Manage Users" tab
- [ ] **Verify**: User table loads
- [ ] **Table Columns**:
  - [ ] Avatar
  - [ ] Username / Display Name
  - [ ] Email
  - [ ] Role (User / Admin)
  - [ ] XP Total
  - [ ] Challenges Completed
  - [ ] Join Date
  - [ ] Status (Active / Inactive)
  - [ ] Actions (Edit / View / Suspend)

#### Search & Filter Users
- [ ] **Search Bar**: Type test user email
- [ ] **Verify**: Results filter in real-time
- [ ] **Verify**: Your test user appears
- [ ] Clear search
- [ ] **Filter by Role**: Select "Admin"
- [ ] **Verify**: Only admin users display
- [ ] Select "All Roles"
- [ ] **Verify**: All users return

#### View User Details
- [ ] Click on test user row or "View Details" button
- [ ] **User Detail Page/Modal**:
  - [ ] Profile information (avatar, name, bio)
  - [ ] Contact info (email, join date)
  - [ ] Stats (XP, challenges, badges)
  - [ ] Recent activity
  - [ ] Submissions history
  - [ ] Enrolled pathways
  - [ ] Admin actions section

#### Edit User Information
- [ ] Click "Edit User" button
- [ ] **Editable Fields**:
  - [ ] Display name
  - [ ] Email
  - [ ] Role (User / Admin dropdown)
  - [ ] Status (Active / Suspended)
  - [ ] Manual XP adjustment (optional)
- [ ] Change role from "User" to "Admin"
- [ ] Click Save
- [ ] **Verify**: Success message
- [ ] **Verify**: User's role updates to "Admin"

#### Verify Role Change
- [ ] Log out of admin account
- [ ] Log in as test user
- [ ] **CRITICAL**: "Admin Dashboard" link should NOW appear
- [ ] Click "Admin Dashboard"
- [ ] **Verify**: Can access admin features (test user is now admin)
- [ ] Log back out

#### Reset User Role (Cleanup)
- [ ] Log back in as original admin
- [ ] Go to User Management
- [ ] Find test user
- [ ] Edit and change role back to "User"
- [ ] Save
- [ ] **Verify**: Test user role reset to "User"

#### Suspend User Account
- [ ] Create another throw-away account (or use deleted test account if not deleted)
- [ ] As admin, find this user in User Management
- [ ] Click "Suspend" or edit status to "Suspended"
- [ ] Confirm suspension
- [ ] **Verify**: User status changes to "Suspended"
- [ ] Log out
- [ ] Try to log in as suspended user
- [ ] **CRITICAL**: Login should fail with "Account suspended" message

#### Database Verification
- [ ] Open Supabase → `public.users` table
- [ ] Filter by test user ID
- [ ] **Verify**: role = 'user' (after reset)
- [ ] Check XP field matches dashboard display (400 XP)
- [ ] Check suspended user: status = 'suspended' or suspended_at timestamp set

---

### Test 9.5: Challenge Management (Admin)

**Objective**: Admins can create, edit, and manage challenges

#### Navigate to Challenge Management
- [ ] In admin dashboard, click "Manage Challenges" tab (if exists)
- [ ] OR navigate to Challenges list and look for "Add Challenge" admin button
- [ ] **Verify**: Challenge table displays
- [ ] **Verify**: All challenges visible (including unpublished drafts)

#### Create New Challenge (Admin-Initiated)
- [ ] Click "Create New Challenge" or "+ Add Challenge" button
- [ ] **Challenge Form Opens**:
  - [ ] Title input
  - [ ] Description textarea (rich text editor optional)
  - [ ] Difficulty dropdown
  - [ ] Challenge type dropdown
  - [ ] Estimated time input
  - [ ] XP reward (auto-calculated or manual)
  - [ ] Requirements (dynamic list, add/remove)
  - [ ] Recommended tools (tags or comma-separated)
  - [ ] Cover image upload/URL
  - [ ] Status dropdown (Draft / Published / Archived)
- [ ] Fill form with admin-created challenge:
  - Title: "Admin Test: Build a Task Tracker"
  - Description: "Create a simple task management app with add, edit, delete features"
  - Difficulty: "Beginner"
  - Type: "Build"
  - Estimated Time: 45 minutes
  - XP: 150
  - Requirements: "CRUD operations, Local storage, Responsive design"
  - Status: "Published"
- [ ] Click "Create Challenge"
- [ ] **Verify**: Success message
- [ ] **Verify**: Challenge appears in challenges list

#### Verify Admin-Created Challenge
- [ ] Go to public Challenges page
- [ ] **Verify**: "Admin Test: Build a Task Tracker" appears
- [ ] Click to view details
- [ ] **Verify**: All information displays correctly
- [ ] **Verify**: Challenge is accessible to regular users

#### Edit Existing Challenge
- [ ] As admin, go to Challenges list
- [ ] Find "Admin Test: Build a Task Tracker"
- [ ] Click "Edit" button (admin-only)
- [ ] **Edit Form Opens** pre-filled with challenge data
- [ ] Change difficulty from "Beginner" to "Intermediate"
- [ ] Increase XP to 300
- [ ] Click "Save Changes"
- [ ] **Verify**: Success message
- [ ] Reload challenge details page
- [ ] **Verify**: Difficulty shows "Intermediate"
- [ ] **Verify**: XP shows 300

#### Archive Challenge
- [ ] As admin, edit the same challenge
- [ ] Change status from "Published" to "Archived"
- [ ] Save
- [ ] **Verify**: Challenge removed from public challenges list
- [ ] **Verify**: Admin can still see it (filtered to show archived)
- [ ] **Verify**: Regular users cannot access it

#### Unarchive Challenge (Restore)
- [ ] As admin, filter to show "Archived" challenges
- [ ] Find "Admin Test: Build a Task Tracker"
- [ ] Change status back to "Published"
- [ ] Save
- [ ] **Verify**: Challenge reappears in public list

#### Database Verification
- [ ] Open Supabase → `challenges` table
- [ ] **Verify**: Admin-created challenge exists:
  - [ ] created_by = admin user ID
  - [ ] status = 'published'
  - [ ] difficulty = "Intermediate"
  - [ ] xp_reward = 300

---

## Part 10: Advanced Features & Edge Cases

### Test 10.1: XP & Leveling System

**Objective**: XP accumulation and level progression works correctly

#### Check Current XP & Level
- [ ] Log in as test user
- [ ] Navigate to Profile or Dashboard
- [ ] **Note Current Stats**:
  - [ ] Total XP: Should be 400 (from 2 approved challenges)
  - [ ] Current Level: (e.g., Level 2 or "Beginner Tier")
  - [ ] XP to Next Level: (e.g., "100 XP until Level 3")

#### Earn More XP
- [ ] Submit and get approval for 2 more challenges (coordinate with admin account):
  - Challenge 1: 300 XP
  - Challenge 2: 500 XP
- [ ] After approvals, total XP should be 1,200
- [ ] **Verify**: Level increases (e.g., to Level 4 or "Intermediate Tier")
- [ ] **Verify**: XP progress bar updates
- [ ] **Verify**: If level-up notification appears, it displays correctly

#### Level Benefits (if feature exists)
- [ ] **Check for level-based unlocks**:
  - [ ] New challenges accessible only at certain levels
  - [ ] Profile badges/flair for level achievement
  - [ ] Special features unlocked at milestones

---

### Test 10.2: Pathway Progress & Completion

**Objective**: Pathways track progress and mark completion correctly

#### Complete All Challenges in Pathway
- [ ] Navigate to enrolled pathway from earlier tests
- [ ] **Current Progress**: Should show 1/8 or similar (1 challenge completed)
- [ ] Complete remaining challenges in pathway (or have admin approve submissions)
- [ ] After all challenges approved, return to pathway details
- [ ] **Verify**: Progress bar shows 100%
- [ ] **Verify**: "Completed" badge appears
- [ ] **Verify**: Completion date displays

#### Pathway Completion Certificate (if feature exists)
- [ ] Look for "Download Certificate" button
- [ ] Click to download
- [ ] **Verify**: PDF or image certificate generated
- [ ] **Verify**: Certificate includes:
  - [ ] User name
  - [ ] Pathway title
  - [ ] Completion date
  - [ ] Total XP earned
  - [ ] Platform logo/branding

#### Database Verification
- [ ] Open Supabase → `pathway_enrollments` table
- [ ] Find your test user's enrollment
- [ ] **Verify**:
  - [ ] status = 'completed'
  - [ ] progress = 100
  - [ ] completed_at timestamp is recent

---

### Test 10.3: Mobile Responsiveness

**Objective**: App functions correctly on mobile devices

#### Resize to Mobile Width
- [ ] Open browser DevTools (F12)
- [ ] Toggle device toolbar (Ctrl+Shift+M)
- [ ] Select mobile device: iPhone 12 (390x844)
- [ ] OR manually resize to 375px width

#### Navigation Menu
- [ ] **Verify**: Hamburger menu icon appears
- [ ] Click hamburger icon
- [ ] **Verify**: Side menu slides out
- [ ] **Verify**: All nav items present
- [ ] Click a menu item
- [ ] **Verify**: Menu closes automatically

#### Dashboard on Mobile
- [ ] Navigate to Dashboard
- [ ] **Verify**: Stats cards stack vertically
- [ ] **Verify**: All content readable (no horizontal scroll)
- [ ] **Verify**: Touch targets are large enough (buttons not too small)
- [ ] Scroll down
- [ ] **Verify**: Smooth scrolling

#### Challenges List on Mobile
- [ ] Go to Challenges page
- [ ] **Verify**: Challenge cards stack vertically (not side-by-side)
- [ ] **Verify**: Filter panel collapses or moves to dropdown
- [ ] Tap on a challenge card
- [ ] **Verify**: Details page loads
- [ ] **Verify**: All content fits within viewport

#### Forms on Mobile
- [ ] Open Challenge Request modal
- [ ] **Verify**: Form fields are full width
- [ ] **Verify**: Keyboard doesn't obscure input fields
- [ ] **Verify**: Scroll works within modal
- [ ] Fill and submit form
- [ ] **Verify**: Works without issues

#### Leaderboard on Mobile
- [ ] Navigate to Leaderboard
- [ ] **Verify**: Table converts to cards or remains scrollable
- [ ] **Verify**: Horizontal scroll enabled for table (if wide)
- [ ] **Verify**: All user info visible

---

### Test 10.4: Accessibility (Basic WCAG Compliance)

**Objective**: App meets basic accessibility standards

#### Keyboard Navigation
- [ ] Close mouse or don't use it
- [ ] Navigate site using only Tab key
- [ ] **Verify**: Focus indicator visible on all interactive elements
- [ ] **Verify**: Tab order is logical (top to bottom, left to right)
- [ ] Press Enter on focused button
- [ ] **Verify**: Button activates
- [ ] Use Shift+Tab to navigate backwards
- [ ] **Verify**: Works correctly

#### Screen Reader Test (Optional - requires screen reader software)
- [ ] Enable screen reader (NVDA, JAWS, or VoiceOver)
- [ ] Navigate through homepage
- [ ] **Verify**: All text is read aloud
- [ ] **Verify**: Images have alt text
- [ ] **Verify**: Buttons have descriptive labels
- [ ] Navigate to form
- [ ] **Verify**: Form labels are announced

#### Color Contrast
- [ ] Use browser extension: "WAVE" or "axe DevTools"
- [ ] Run accessibility audit
- [ ] **Verify**: No color contrast errors (text readable against background)
- [ ] **Check**: Buttons have sufficient contrast
- [ ] **Check**: Disabled states are distinguishable

#### Form Labels
- [ ] Inspect any form (e.g., Login form)
- [ ] **Verify**: Every input has associated <label> element
- [ ] **Verify**: Labels are visible (not just placeholder text)
- [ ] **Verify**: Required fields marked with asterisk or "required" text

---

### Test 10.5: Error Handling & Edge Cases

**Objective**: App handles errors gracefully

#### Network Failure Simulation
- [ ] Open DevTools → Network tab
- [ ] Enable "Offline" mode
- [ ] Try to submit a form
- [ ] **Verify**: Error message appears: "Network error. Check connection."
- [ ] **Verify**: Form data not lost
- [ ] Disable offline mode
- [ ] Retry submission
- [ ] **Verify**: Works when connection restored

#### 404 Page (Not Found)
- [ ] Navigate to non-existent route: `/this-does-not-exist`
- [ ] **Verify**: Custom 404 page displays (not blank/browser default)
- [ ] **Verify**: 404 page includes:
  - [ ] "Page Not Found" message
  - [ ] Link to homepage
  - [ ] Link to Challenges page
- [ ] Click homepage link
- [ ] **Verify**: Navigates correctly

#### Unauthorized Access
- [ ] Log out
- [ ] Try to access `/admin` directly
- [ ] **Verify**: Redirected to login OR 403 Forbidden page
- [ ] **Verify**: Cannot access admin routes

#### Session Expiration
- [ ] Log in as test user
- [ ] Open DevTools → Application → Cookies
- [ ] Delete all Supabase auth cookies
- [ ] Try to navigate to protected page (e.g., Dashboard)
- [ ] **Verify**: Redirected to login page
- [ ] **Verify**: "Session expired. Please log in again." message (optional)

#### Very Long Text Input
- [ ] Open challenge request form
- [ ] Paste 10,000 characters into description field
- [ ] **Verify**: Character limit enforced OR graceful handling
- [ ] **Verify**: Doesn't break UI
- [ ] Submit (if allowed)
- [ ] **Verify**: Server handles large payload

#### Special Characters in Input
- [ ] Enter SQL injection attempt in search: `'; DROP TABLE users; --`
- [ ] **Verify**: App treats as literal string (not executed)
- [ ] Enter XSS attempt: `<script>alert('XSS')</script>`
- [ ] **Verify**: Sanitized (not executed)

---

## Part 11: Performance & Load Testing (Basic)

### Test 11.1: Page Load Performance

**Objective**: Pages load within acceptable time limits

#### Measure Load Times
- [ ] Open DevTools → Network tab
- [ ] Clear cache (Ctrl+Shift+Delete)
- [ ] Navigate to Homepage
- [ ] **Verify**: Page loads within 3 seconds
- [ ] **Note DOMContentLoaded time** (should be < 2s)
- [ ] Navigate to Challenges page
- [ ] **Verify**: Loads within 3 seconds
- [ ] Navigate to Dashboard
- [ ] **Verify**: Loads within 3 seconds

#### Lighthouse Audit
- [ ] Open DevTools → Lighthouse tab
- [ ] Select "Performance" and "Accessibility"
- [ ] Click "Generate report"
- [ ] **Target Scores**:
  - [ ] Performance: > 70
  - [ ] Accessibility: > 85
  - [ ] Best Practices: > 80
- [ ] Review recommendations for improvements

#### Large Data Sets
- [ ] If admin, create 50+ test challenges (or verify many exist)
- [ ] Navigate to Challenges page
- [ ] **Verify**: Page loads without freezing
- [ ] **Verify**: Pagination or infinite scroll handles large dataset
- [ ] Scroll through challenges
- [ ] **Verify**: Smooth scrolling (no jank)

---

## Part 12: Final Verification & Cleanup

### Test 12.1: Cross-Browser Testing

**Objective**: App works in all major browsers

#### Test in Chrome
- [ ] Run critical flows in Chrome
- [ ] **Verify**: No browser-specific issues

#### Test in Firefox
- [ ] Open app in Firefox
- [ ] Test login/logout
- [ ] Test challenge submission
- [ ] **Verify**: Works identically to Chrome

#### Test in Safari (if Mac available)
- [ ] Open app in Safari
- [ ] Test key workflows
- [ ] **Verify**: No Safari-specific bugs

#### Test in Edge
- [ ] Open app in Microsoft Edge
- [ ] Test authentication and navigation
- [ ] **Verify**: No Edge-specific issues

---

### Test 12.2: Database Consistency Check

**Objective**: Database maintains referential integrity

#### Orphaned Records Check
- [ ] Open Supabase → `submissions` table
- [ ] Run SQL query:
  ```sql
  SELECT * FROM submissions
  WHERE user_id NOT IN (SELECT id FROM auth.users);
  ```
- [ ] **Verify**: Returns 0 rows (no orphaned submissions)

#### XP Totals Match
- [ ] Query sum of XP from approved submissions:
  ```sql
  SELECT user_id, SUM(xp_earned) as total_xp
  FROM submissions
  WHERE status = 'approved'
  GROUP BY user_id;
  ```
- [ ] Compare with `users.total_xp` field
- [ ] **Verify**: Totals match

---

### Test 12.3: Cleanup Test Data

**Objective**: Remove test accounts and submissions

#### Delete Test Submissions
- [ ] As admin, navigate to submissions list
- [ ] Delete test user's submissions (if delete feature exists)
- [ ] OR manually delete from Supabase

#### Delete Test Challenge Requests
- [ ] Delete test challenge requests from admin panel or database

#### Delete Test Challenges
- [ ] Archive or delete admin-created test challenge

#### Delete Test User Account
- [ ] Keep main test account for future tests OR delete via account settings
- [ ] Delete throw-away test accounts (deletetest@test.com, suspended account)

#### Database Cleanup
- [ ] Open Supabase → Authentication → Users
- [ ] Delete test users (keep or document if needed for future tests)
- [ ] Open `public.users` table
- [ ] Verify test users removed or marked

---

## 📊 Test Results Summary

### Overall Statistics
- **Total Test Cases**: _____
- **Passed**: _____
- **Failed**: _____
- **Blocked**: _____
- **Skipped**: _____

### Critical Issues Found
1. _______________________________________
2. _______________________________________
3. _______________________________________

### Major Bugs Found
1. _______________________________________
2. _______________________________________
3. _______________________________________

### Minor Issues / Enhancements
1. _______________________________________
2. _______________________________________
3. _______________________________________

### Browser Compatibility
- Chrome: ✅ / ❌
- Firefox: ✅ / ❌
- Safari: ✅ / ❌
- Edge: ✅ / ❌

### Performance Notes
- Average page load time: _____ seconds
- Largest Contentful Paint (LCP): _____ seconds
- Lighthouse Performance Score: _____

---

## ✅ Sign-Off

**Tested By**: _______________________
**Date Completed**: _______________________
**Environment**: Production / Staging / Local
**Overall Result**: ⬜ PASS | ⬜ FAIL | ⬜ PASS WITH ISSUES

**Notes**:
___________________________________________________________________
___________________________________________________________________
___________________________________________________________________

**Next Steps**:
- [ ] File bug reports for failed tests
- [ ] Retest after fixes deployed
- [ ] Update test cases based on new features
- [ ] Schedule regression testing

---

**End of Comprehensive E2E Testing Checklist**
