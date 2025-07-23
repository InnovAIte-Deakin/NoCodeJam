# Software Requirements Specification

# (SRS)

## NoCodeJam Hackathon Platform

**Version:** 1.
**Date:** July 2 0 , 2025

## Table of Contents

1. Introduction
2. Overall Description
3. System Features
4. External Interface Requirements
5. System Requirements
6. Database Design
7. Non-Functional Requirements
8. Assumptions and Dependencies

## 1. Introduction

### 1.1 Purpose

This document specifies the requirements for the NoCodeJam Hackathon Platform, a
web-based system that allows users to participate in no-code development challenges,
earn experience points (XP), collect badges, and compete on leaderboards.

### 1.2 Scope

The platform will provide:

- Challenge management system with three difficulty levels
- User submission and review workflow
- Gamification elements (XP, badges, leaderboards)
- Admin panel for content management
- Integration with popular no-code tools

### 1.3 Definitions and Acronyms


- **XP** : Experience Points
- **No-Code Tools** : Development platforms like Lovable, Bolt, Windsurf, Cursor
- **SRS** : Software Requirements Specification
- **Admin** : User with superuser privileges
- **Challenge** : A development task with specific requirements

## 2. Overall Description

### 2.1 Product Perspective

The NoCodeJam platform is a standalone web application that serves as a competitive
learning environment for no-code development skills.

### 2.2 Product Functions

- User registration and authentication
- Challenge browsing and participation
- Submission management and review
- Progress tracking and gamification
- Administrative content management

### 2.3 User Classes

1. **Regular Users** : Participants who complete challenges
2. **Admins** : Superusers who manage challenges and review submissions

### 2.4 Operating Environment

- **Frontend** : Node.js with Tailwind CSS and Shadcn UI
- **Backend** : Supabase
- **Deployment** : Web-based platform accessible via modern browsers

## 3. System Features

### 3.1 User Management

**3.1.1 User Registration**

**Priority** : High
**Description** : Users can create accounts to participate in challenges.

**Functional Requirements** :


- FR-1.1: System shall allow users to register with email and password
- FR-1.2: System shall verify email addresses before account activation
- FR-1.3: System shall enforce password strength requirements
- FR-1.4: System shall prevent duplicate email registrations

**3.1.2 User Authentication**

**Priority** : High
**Description** : Secure login system for all users.

**Functional Requirements** :

- FR-1.5: System shall authenticate users via email/password
- FR-1.6: System shall maintain user sessions securely
- FR-1.7: System shall provide password reset functionality
- FR-1.8: System shall support role-based access (User/Admin)

### 3.2 Challenge Management

**3.2.1 Challenge Display**

**Priority** : High
**Description** : Users can browse and view available challenges.

**Functional Requirements** :

- FR-2.1: System shall display challenges categorized by difficulty (Beginner,
    Intermediate, Expert)
- FR-2.2: System shall show challenge details including requirements, XP
    rewards, and submission guidelines
- FR-2.3: System shall display approved submissions for each challenge in a
    separate tab
- FR-2.4: System shall indicate user's completion status for each challenge

**3.2.2 Challenge Creation (Admin)**

**Priority** : High
**Description** : Admins can create new challenges.

**Functional Requirements** :

- FR-2.5: System shall allow admins to create challenges with title, description,
    requirements, and difficulty level
- FR-2.6: System shall allow admins to set XP rewards for each challenge
- FR-2.7: System shall allow admins to specify submission criteria
- FR-2.8: System shall validate challenge data before saving

### 3.3 Submission System


**3.3.1 Submission Creation**

**Priority** : High
**Description** : Users can submit their challenge solutions.

**Functional Requirements** :

- FR-3.1: System shall allow users to submit challenge solutions via URL links
- FR-3.2: System shall capture submission timestamp
- FR-3.3: System shall prevent multiple submissions per user per challenge
- FR-3.4: System shall validate URL format before accepting submissions

**3.3.2 Submission Review (Admin)**

**Priority** : High
**Description** : Admins can review and approve/deny submissions.

**Functional Requirements** :

- FR-3.5: System shall display pending submissions to admins
- FR-3.6: System shall allow admins to approve or deny submissions
- FR-3.7: System shall allow admins to provide feedback for denied submissions
- FR-3.8: System shall notify users of submission status changes
- FR-3.9: System shall award XP automatically upon approval

### 3.4 Gamification System

**3.4.1 Experience Points (XP)**

**Priority** : Medium
**Description** : Users earn XP for completed challenges.

**Functional Requirements** :

- FR-4.1: System shall award XP based on challenge difficulty and completion
- FR-4.2: System shall maintain cumulative XP scores for each user
- FR-4.3: System shall display user's current XP on their profile

**3.4.2 Badge System**

**Priority** : Medium
**Description** : Users earn badges based on achievements.

**Functional Requirements** :

- FR-4.4: System shall award badges based on predefined criteria:
    o **Novice** : Complete first challenge
    o **Pioneer** : Complete 5 challenges


```
o Master Builder : Complete 15 challenges
o AI Expert : Complete 10 expert-level challenges
o No Code Champion : Complete challenges in all difficulty levels
o Legend : Reach top 10 on leaderboard
```
- FR-4.5: System shall display earned badges on user profiles
- FR-4.6: System shall prevent duplicate badge awards

**3.4.3 Leaderboard**

**Priority** : Medium
**Description** : Ranking system based on user performance.

**Functional Requirements** :

- FR-4.7: System shall rank users by total XP earned
- FR-4.8: System shall display top users on public leaderboard
- FR-4.9: System shall update rankings in real-time
- FR-4.10: System shall show user's current ranking position

### 3.5 Admin Panel

**3.5.1 Dashboard**

**Priority** : High
**Description** : Central admin interface for platform management.

**Functional Requirements** :

- FR-5.1: System shall provide admin dashboard with key metrics
- FR-5.2: System shall display pending submissions count
- FR-5.3: System shall show platform statistics (users, challenges, submissions)

**3.5.2 User Management**

**Priority** : Medium
**Description** : Admin capabilities for user oversight.

**Functional Requirements** :

- FR-5.4: System shall allow admins to view user profiles and statistics
- FR-5.5: System shall allow admins to manage user roles
- FR-5.6: System shall provide user activity logs

## 4. External Interface Requirements


### 4.1 User Interfaces

- **Responsive Design** : Web-first approach using Tailwind CSS
- **Component Library** : Shadcn UI for consistent design system
- **Accessibility** : WCAG 2.1 AA compliance
- **Modern Browser Support** : Chrome, Firefox, Safari, Edge

### 4.2 Hardware Interfaces

- No specific hardware interfaces required
- Standard web server deployment environment

### 4.3 Software Interfaces

- **Supabase** : Database and authentication services
- **No-Code Tools Integration** : Support for links from Lovable, Bolt, Windsurf,
    Cursor

## 5. System Requirements

### 5.1 Functional Requirements Summary

- User registration and authentication system
- Challenge management with three difficulty levels
- Submission workflow with admin approval
- Gamification system (XP, badges, leaderboards)
- Admin panel for platform management

### 5.2 Business Rules

- BR-1: Users must be authenticated to submit challenges
- BR-2: Only approved submissions appear on challenge pages
- BR-3: XP is awarded only after admin approval
- BR-4: Badges are awarded automatically based on achievements
- BR-5: Leaderboard updates in real-time with XP changes

## 6. Database Design

### 6.1 Core Tables


**Users Table**

users (
id: uuid (primary key)
username: text (unique)
avatar: string, URL
email: text (unique)
password_hash: text
role: enum ('user', 'admin')
total_xp: integer (default 0)
github_username: String
bio: text
created_at: timestamp
updated_at: timestamp
)

**Challenges Table**

challenges (
id: uuid (primary key)
title: text
description: text
image: string, URL
requirements: text
difficulty: enum ('beginner', 'intermediate', 'expert')
estimated_time: string
xp_reward: integer
suggested_tools: text
created_by: uuid (foreign key -> users.id)
created_at: timestamp
updated_at: timestamp
)

**Submissions Table**

submissions (
id: uuid (primary key)
user_id: uuid (foreign key -> users.id)
challenge_id: uuid (foreign key -> challenges.id)
submission_url: text
status: enum ('pending', 'approved', 'denied')
admin_feedback: text
reviewed_by: uuid (foreign key -> users.id)
submitted_at: timestamp
reviewed_at: timestamp
)

**Badges Table**

badges (
id: uuid (primary key)
name: text
description: text
criteria: text
icon_url: text
created_at: timestamp
)

**User_Badges Table**

user_badges (
id: uuid (primary key)
user_id: uuid (foreign key -> users.id)
badge_id: uuid (foreign key -> badges.id)
earned_at: timestamp
)

### 6.2 Database Constraints

- Unique constraint on (user_id, challenge_id) in submissions table
- Unique constraint on (user_id, badge_id) in user_badges table
- Check constraints for valid enum values

## 7. Non-Functional Requirements

### 7.1 Performance Requirements

- Page load time: < 3 seconds
- Database query response: < 500ms
- Support for 1000+ concurrent users
- 99.5% uptime availability

### 7.2 Security Requirements

- HTTPS encryption for all communications
- JWT-based authentication
- SQL injection prevention
- Input validation and sanitization
- Role-based access control

### 7.3 Usability Requirements

- Intuitive user interface design
- Mobile-responsive layout
- Accessibility compliance (WCAG 2.1 AA)
- Clear error messages and feedback

### 7.4 Scalability Requirements

- Horizontal scaling capability
- Database optimization for growth


- CDN integration for static assets
- Caching strategy implementation

## 8. Assumptions and Dependencies

### 8.1 Assumptions

- Users have reliable internet connectivity
- No-code platforms maintain stable URL structures
- Users submit functional, accessible project links
- Admin review process maintains reasonable response times

### 8.2 Dependencies

- Supabase service availability and performance
- Third-party no-code platform uptime
- Email service provider reliability
- Domain and hosting service stability

### 8.3 Constraints

- Budget limitations for third-party services
- Development timeline requirements
- Compliance with platform terms of service
- Browser compatibility requirements

## Appendices

### A. Badge Criteria Details

```
Badge Criteria XP Requirement
Novice Complete first challenge Any
Pioneer Complete 5 challenges N/A
Master Builder Complete 15 challenges N/A
AI Expert Complete 10 expert challenges N/A
No Code Champion Complete challenges in all difficulty levels N/A
Legend Reach top 10 on leaderboard Varies
```

### B. XP Reward Structure

```
Difficulty Base XP Bonus Criteria
Beginner 100 XP First completion: +50 XP
Intermediate 250 XP Creative solution: +100 XP
Expert 500 XP Exceptional quality: +200 XP
```

