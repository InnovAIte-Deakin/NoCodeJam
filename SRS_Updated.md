# Software Requirements Specification (SRS)

## NoCodeJam Hackathon Platform

**Version:** 2.0  
**Date:** December 2024  
**Status:** Updated based on current implementation

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Overall Description](#2-overall-description)
3. [System Features](#3-system-features)
4. [External Interface Requirements](#4-external-interface-requirements)
5. [System Requirements](#5-system-requirements)
6. [Database Design](#6-database-design)
7. [Non-Functional Requirements](#7-non-functional-requirements)
8. [Assumptions and Dependencies](#8-assumptions-and-dependencies)
9. [Implementation Status](#9-implementation-status)

---

## 1. Introduction

### 1.1 Purpose

This document specifies the requirements for the NoCodeJam Hackathon Platform, a comprehensive web-based system that enables users to participate in no-code development challenges, earn experience points (XP), collect badges, compete on leaderboards, and learn through structured onboarding processes.

### 1.2 Scope

The platform provides:

- **Comprehensive Onboarding System**: Multi-step guided tutorial with progress tracking and verification
- **Challenge Management System**: Three difficulty levels with submission and review workflows
- **Advanced Gamification**: XP rewards, badge system, and real-time leaderboards
- **Admin Panel**: Complete content management and user administration
- **Community Features**: Challenge requests, user profiles, and social interactions
- **Learning Resources**: Integration with popular no-code tools and platforms

### 1.3 Definitions and Acronyms

- **XP**: Experience Points - earned through challenge completion
- **No-Code Tools**: Development platforms like Lovable, Bolt, Windsurf, Cursor, Replit
- **SRS**: Software Requirements Specification
- **Admin**: User with superuser privileges for platform management
- **Challenge**: A development task with specific requirements and XP rewards
- **Onboarding**: Structured tutorial system for new users
- **Supabase**: Backend-as-a-Service platform providing database and authentication

---

## 2. Overall Description

### 2.1 Product Perspective

NoCodeJam is a standalone web application serving as a competitive learning environment for no-code development skills. The platform combines educational content with gamification elements to create an engaging experience for users of all skill levels.

### 2.2 Product Functions

- **User Management**: Registration, authentication, profile management, and role-based access
- **Onboarding System**: Multi-step tutorial with progress tracking and verification
- **Challenge System**: Creation, browsing, participation, and submission management
- **Gamification**: XP tracking, badge system, and leaderboard rankings
- **Admin Operations**: Content management, user administration, and submission review
- **Community Features**: Challenge requests, user interactions, and social elements

### 2.3 User Classes

1. **Regular Users**: Participants who complete challenges and engage with the platform
2. **Admins**: Superusers who manage challenges, review submissions, and administer the platform

### 2.4 Operating Environment

- **Frontend**: React 18.3.1 with TypeScript, Vite build system
- **UI Framework**: Radix UI components with Tailwind CSS styling
- **Backend**: Supabase (PostgreSQL database, Edge Functions, Authentication)
- **Deployment**: Vercel hosting platform
- **Browser Support**: Modern browsers (Chrome, Firefox, Safari, Edge)

---

## 3. System Features

### 3.1 User Management

#### 3.1.1 User Registration and Authentication

**Priority**: High  
**Description**: Secure user account creation and management system.

**Functional Requirements**:
- FR-1.1: System shall allow users to register with email, password, and username
- FR-1.2: System shall verify email addresses before account activation
- FR-1.3: System shall enforce password strength requirements
- FR-1.4: System shall prevent duplicate email and username registrations
- FR-1.5: System shall authenticate users via email/password combination
- FR-1.6: System shall maintain secure user sessions with JWT tokens
- FR-1.7: System shall provide password reset functionality via email
- FR-1.8: System shall support role-based access control (User/Admin)
- FR-1.9: System shall allow users to update profile information (bio, GitHub username, avatar)

#### 3.1.2 Profile Management

**Priority**: Medium  
**Description**: User profile customization and management.

**Functional Requirements**:
- FR-1.10: System shall display user profiles with XP, badges, and statistics
- FR-1.11: System shall allow users to edit their profile information
- FR-1.12: System shall track user join date and activity statistics
- FR-1.13: System shall display user's challenge completion history

### 3.2 Onboarding System

#### 3.2.1 Multi-Step Tutorial

**Priority**: High  
**Description**: Comprehensive onboarding system for new users.

**Functional Requirements**:
- FR-2.1: System shall provide a multi-step onboarding tutorial with progress tracking
- FR-2.2: System shall display onboarding steps with video content and instructions
- FR-2.3: System shall support different submission types (URL, text verification)
- FR-2.4: System shall automatically save and restore user progress
- FR-2.5: System shall redirect users to their current step when returning
- FR-2.6: System shall validate submissions before allowing progression
- FR-2.7: System shall provide verification codes for text-based submissions
- FR-2.8: System shall allow users to hide/show the onboarding card
- FR-2.9: System shall create master submissions for admin review upon completion

#### 3.2.2 Progress Tracking

**Priority**: High  
**Description**: Real-time progress monitoring and synchronization.

**Functional Requirements**:
- FR-2.10: System shall track user's latest completed step
- FR-2.11: System shall provide progress bars and visual indicators
- FR-2.12: System shall synchronize progress across sessions
- FR-2.13: System shall prevent skipping ahead without completing prerequisites

### 3.3 Challenge Management

#### 3.3.1 Challenge Display and Browsing

**Priority**: High  
**Description**: Users can browse and view available challenges.

**Functional Requirements**:
- FR-3.1: System shall display challenges categorized by difficulty (Beginner, Intermediate, Expert)
- FR-3.2: System shall show challenge details including requirements, XP rewards, and images
- FR-3.3: System shall display approved submissions for each challenge
- FR-3.4: System shall indicate user's completion status for each challenge
- FR-3.5: System shall provide search and filtering capabilities
- FR-3.6: System shall separate onboarding challenges from regular challenges
- FR-3.7: System shall display challenge creation dates and metadata

#### 3.3.2 Challenge Creation (Admin)

**Priority**: High  
**Description**: Admins can create and manage challenges.

**Functional Requirements**:
- FR-3.8: System shall allow admins to create challenges with title, description, and requirements
- FR-3.9: System shall allow admins to set difficulty levels and XP rewards
- FR-3.10: System shall allow admins to specify submission criteria and guidelines
- FR-3.11: System shall validate challenge data before saving
- FR-3.12: System shall allow admins to edit existing challenges
- FR-3.13: System shall allow admins to delete challenges (with submission warnings)
- FR-3.14: System shall support challenge images and visual content

#### 3.3.3 Challenge Requests

**Priority**: Medium  
**Description**: Users can request new challenges.

**Functional Requirements**:
- FR-3.15: System shall allow users to submit challenge requests
- FR-3.16: System shall provide forms for challenge request submission
- FR-3.17: System shall allow admins to review and approve/reject requests
- FR-3.18: System shall convert approved requests into challenges

### 3.4 Submission System

#### 3.4.1 Submission Creation

**Priority**: High  
**Description**: Users can submit their challenge solutions.

**Functional Requirements**:
- FR-4.1: System shall allow users to submit challenge solutions via URL links
- FR-4.2: System shall capture submission timestamps and metadata
- FR-4.3: System shall prevent multiple submissions per user per challenge
- FR-4.4: System shall validate URL format before accepting submissions
- FR-4.5: System shall support different submission types (URL, text, file uploads)
- FR-4.6: System shall provide submission status tracking (pending, approved, denied)

#### 3.4.2 Submission Review (Admin)

**Priority**: High  
**Description**: Admins can review and manage submissions.

**Functional Requirements**:
- FR-4.7: System shall display pending submissions to admins with user information
- FR-4.8: System shall allow admins to approve or deny submissions
- FR-4.9: System shall allow admins to provide feedback for denied submissions
- FR-4.10: System shall automatically award XP upon approval
- FR-4.11: System shall notify users of submission status changes
- FR-4.12: System shall track submission review history and timestamps

### 3.5 Gamification System

#### 3.5.1 Experience Points (XP)

**Priority**: High  
**Description**: Users earn XP for completed challenges.

**Functional Requirements**:
- FR-5.1: System shall award XP based on challenge difficulty and completion
- FR-5.2: System shall maintain cumulative XP scores for each user
- FR-5.3: System shall display user's current XP on their profile and dashboard
- FR-5.4: System shall provide XP progress indicators and milestones
- FR-5.5: System shall track XP earning history and statistics

#### 3.5.2 Badge System

**Priority**: Medium  
**Description**: Users earn badges based on achievements.

**Functional Requirements**:
- FR-5.6: System shall award badges based on predefined criteria:
  - **Novice**: Complete first challenge
  - **Pioneer**: Complete 5 challenges
  - **Master Builder**: Complete 15 challenges
  - **AI Expert**: Complete 10 expert-level challenges
  - **No Code Champion**: Complete challenges in all difficulty levels
  - **Legend**: Reach top 10 on leaderboard
- FR-5.7: System shall display earned badges on user profiles
- FR-5.8: System shall prevent duplicate badge awards
- FR-5.9: System shall provide badge descriptions and unlock criteria

#### 3.5.3 Leaderboard

**Priority**: Medium  
**Description**: Ranking system based on user performance.

**Functional Requirements**:
- FR-5.10: System shall rank users by total XP earned
- FR-5.11: System shall display top users on public leaderboard
- FR-5.12: System shall update rankings in real-time
- FR-5.13: System shall show user's current ranking position
- FR-5.14: System shall track rank changes and trends
- FR-5.15: System shall provide special styling for top 3 positions
- FR-5.16: System shall display user statistics (challenges completed, badges earned)

### 3.6 Admin Panel

#### 3.6.1 Dashboard Overview

**Priority**: High  
**Description**: Central admin interface for platform management.

**Functional Requirements**:
- FR-6.1: System shall provide admin dashboard with key metrics
- FR-6.2: System shall display pending submissions count and status
- FR-6.3: System shall show platform statistics (users, challenges, submissions)
- FR-6.4: System shall provide quick access to common admin tasks
- FR-6.5: System shall display recent activity and system health

#### 3.6.2 User Management

**Priority**: Medium  
**Description**: Admin capabilities for user oversight.

**Functional Requirements**:
- FR-6.6: System shall allow admins to view user profiles and statistics
- FR-6.7: System shall allow admins to manage user roles (User/Admin)
- FR-6.8: System shall provide user activity logs and history
- FR-6.9: System shall allow admins to delete user accounts
- FR-6.10: System shall display user XP and badge information

#### 3.6.3 Content Management

**Priority**: High  
**Description**: Admin tools for managing platform content.

**Functional Requirements**:
- FR-6.11: System shall allow admins to create, edit, and delete challenges
- FR-6.12: System shall allow admins to manage challenge requests
- FR-6.13: System shall provide bulk operations for content management
- FR-6.14: System shall allow admins to manage onboarding steps
- FR-6.15: System shall provide content approval workflows

### 3.7 Learning Resources

#### 3.7.1 Educational Content

**Priority**: Medium  
**Description**: Learning materials and resources for users.

**Functional Requirements**:
- FR-7.1: System shall provide learning resources and tutorials
- FR-7.2: System shall integrate with popular no-code platforms
- FR-7.3: System shall provide video content and documentation
- FR-7.4: System shall offer tool recommendations and guides
- FR-7.5: System shall provide community support and help resources

---

## 4. External Interface Requirements

### 4.1 User Interfaces

- **Responsive Design**: Mobile-first approach using Tailwind CSS
- **Component Library**: Radix UI for consistent design system
- **Accessibility**: WCAG 2.1 AA compliance
- **Modern Browser Support**: Chrome, Firefox, Safari, Edge (latest versions)
- **Dark Theme**: Consistent dark theme throughout the application
- **Interactive Elements**: Hover effects, animations, and visual feedback

### 4.2 Hardware Interfaces

- No specific hardware interfaces required
- Standard web server deployment environment
- Support for various screen sizes and resolutions

### 4.3 Software Interfaces

- **Supabase**: Database, authentication, and Edge Functions
- **Vercel**: Hosting and deployment platform
- **No-Code Tools Integration**: Support for links from Lovable, Bolt, Windsurf, Cursor, Replit
- **YouTube**: Video content integration for onboarding steps
- **Email Service**: Password reset and notification functionality

---

## 5. System Requirements

### 5.1 Functional Requirements Summary

- **User Management**: Complete registration, authentication, and profile system
- **Onboarding System**: Multi-step tutorial with progress tracking and verification
- **Challenge Management**: Three difficulty levels with comprehensive admin tools
- **Submission System**: URL-based submissions with admin review workflow
- **Gamification**: XP system, badge achievements, and real-time leaderboards
- **Admin Panel**: Complete platform administration and content management
- **Community Features**: Challenge requests and user interactions

### 5.2 Business Rules

- BR-1: Users must be authenticated to submit challenges
- BR-2: Only approved submissions appear on challenge pages
- BR-3: XP is awarded only after admin approval
- BR-4: Badges are awarded automatically based on achievements
- BR-5: Leaderboard updates in real-time with XP changes
- BR-6: Onboarding progress is saved automatically
- BR-7: Users cannot skip onboarding steps without completion
- BR-8: Admin actions require appropriate permissions
- BR-9: Challenge requests must be reviewed before implementation

---

## 6. Database Design

### 6.1 Core Tables

#### Users Table
```sql
users (
  id: uuid (primary key)
  email: text (unique)
  username: text (unique)
  role: enum ('user', 'admin')
  total_xp: integer (default 0)
  bio: text
  github_username: text
  avatar: text (URL)
  onboarding_hidden: boolean (default false)
  created_at: timestamp
  updated_at: timestamp
)
```

#### Challenges Table
```sql
challenges (
  id: uuid (primary key)
  title: text
  description: text
  image: text (URL)
  requirements: text
  difficulty: enum ('beginner', 'intermediate', 'expert')
  xp_reward: integer
  challenge_type: enum ('general', 'onboarding')
  created_by: uuid (foreign key -> users.id)
  created_at: timestamp
  updated_at: timestamp
)
```

#### Onboarding Steps Table
```sql
onboarding_steps (
  id: uuid (primary key)
  step_number: integer
  title: text
  description: text
  prompt_instructions: text
  video_url: text
  submission_type: enum ('url', 'text', null)
  submission_label: text
  download_url: text
  created_at: timestamp
  updated_at: timestamp
)
```

#### Submissions Table
```sql
submissions (
  id: uuid (primary key)
  user_id: uuid (foreign key -> users.id)
  challenge_id: uuid (foreign key -> challenges.id)
  onboarding_step_id: uuid (foreign key -> onboarding_steps.id)
  submission_url: text
  submission_data: jsonb
  status: enum ('pending', 'approved', 'denied', 'completed_step')
  submission_type: enum ('challenge', 'onboarding_step')
  admin_feedback: text
  reviewed_by: uuid (foreign key -> users.id)
  parent_submission_id: uuid (foreign key -> submissions.id)
  submitted_at: timestamp
  reviewed_at: timestamp
  created_at: timestamp
  updated_at: timestamp
)
```

#### Challenge Requests Table
```sql
challenge_requests (
  id: uuid (primary key)
  user_id: uuid (foreign key -> users.id)
  title: text
  description: text
  difficulty: enum ('beginner', 'intermediate', 'expert')
  category: text
  requirements: text
  status: enum ('pending', 'approved', 'rejected')
  reviewed_by: uuid (foreign key -> users.id)
  created_at: timestamp
  reviewed_at: timestamp
)
```

#### Badges Table
```sql
badges (
  id: uuid (primary key)
  name: text
  description: text
  criteria: text
  icon: text
  created_at: timestamp
)
```

#### User Badges Table
```sql
user_badges (
  id: uuid (primary key)
  user_id: uuid (foreign key -> users.id)
  badge_id: uuid (foreign key -> badges.id)
  earned_at: timestamp
)
```

### 6.2 Database Constraints

- Unique constraint on (user_id, challenge_id) in submissions table
- Unique constraint on (user_id, badge_id) in user_badges table
- Unique constraint on (user_id, onboarding_step_id) in submissions table
- Check constraints for valid enum values
- Foreign key constraints for referential integrity
- Automatic timestamp updates for created_at and updated_at fields

---

## 7. Non-Functional Requirements

### 7.1 Performance Requirements

- **Page Load Time**: < 3 seconds for initial load
- **Database Query Response**: < 500ms for standard queries
- **Concurrent Users**: Support for 1000+ concurrent users
- **Uptime Availability**: 99.5% uptime target
- **Real-time Updates**: Leaderboard updates within 1 second
- **File Upload**: Support for images up to 5MB

### 7.2 Security Requirements

- **HTTPS Encryption**: All communications encrypted
- **JWT Authentication**: Secure token-based authentication
- **SQL Injection Prevention**: Parameterized queries and input validation
- **Input Validation**: Client and server-side validation
- **Role-based Access Control**: Proper permission enforcement
- **Data Privacy**: User data protection and GDPR compliance
- **Session Management**: Secure session handling and timeout

### 7.3 Usability Requirements

- **Intuitive Interface**: User-friendly design with clear navigation
- **Mobile Responsive**: Optimized for all device sizes
- **Accessibility**: WCAG 2.1 AA compliance
- **Error Handling**: Clear error messages and recovery options
- **Loading States**: Visual feedback during operations
- **Progressive Enhancement**: Core functionality without JavaScript

### 7.4 Scalability Requirements

- **Horizontal Scaling**: Support for load balancing
- **Database Optimization**: Efficient queries and indexing
- **CDN Integration**: Static asset delivery optimization
- **Caching Strategy**: Redis or similar caching implementation
- **API Rate Limiting**: Protection against abuse
- **Microservices Ready**: Modular architecture for future expansion

---

## 8. Assumptions and Dependencies

### 8.1 Assumptions

- Users have reliable internet connectivity
- No-code platforms maintain stable URL structures
- Users submit functional, accessible project links
- Admin review process maintains reasonable response times
- Users are familiar with basic web navigation
- No-code tools remain accessible and functional

### 8.2 Dependencies

- **Supabase Service**: Availability and performance of Supabase platform
- **Vercel Hosting**: Reliable hosting and deployment services
- **Third-party Platforms**: Uptime of no-code development platforms
- **Email Service**: Reliable email delivery for notifications
- **Domain Services**: Stable domain and DNS management
- **Browser Compatibility**: Modern browser support and updates

### 8.3 Constraints

- **Budget Limitations**: Cost constraints for third-party services
- **Development Timeline**: Project delivery requirements
- **Platform Terms**: Compliance with service provider terms
- **Browser Support**: Limited to modern browsers
- **Data Storage**: Supabase storage limitations
- **API Limits**: Rate limiting and usage quotas

---

## 9. Implementation Status

### 9.1 Completed Features ✅

- **User Authentication**: Complete registration, login, and session management
- **Onboarding System**: Multi-step tutorial with progress tracking and verification
- **Challenge Management**: Full CRUD operations for challenges
- **Submission System**: URL-based submissions with admin review
- **Admin Panel**: Comprehensive administration interface
- **Gamification**: XP system, badge tracking, and leaderboard
- **User Profiles**: Profile management and statistics
- **Challenge Requests**: User-submitted challenge suggestions
- **Real-time Updates**: Live leaderboard and progress tracking
- **Responsive Design**: Mobile-optimized interface
- **Database Schema**: Complete data model implementation

### 9.2 Partially Implemented Features 🟡

- **Badge System**: Framework implemented, automatic awarding needs refinement
- **Email Notifications**: Basic structure, full notification system pending
- **Advanced Search**: Basic filtering implemented, advanced search features pending
- **Content Management**: Core features complete, advanced admin tools pending

### 9.3 Future Enhancements 🔮

- **Social Features**: User following, comments, and community interactions
- **Advanced Analytics**: Detailed user behavior and platform metrics
- **Mobile App**: Native mobile application development
- **API Integration**: Third-party tool integrations and webhooks
- **Advanced Gamification**: More badge types, achievements, and rewards
- **Content Moderation**: Automated content filtering and moderation
- **Multi-language Support**: Internationalization and localization
- **Advanced Reporting**: Comprehensive admin reporting and analytics

### 9.4 Technical Debt and Improvements

- **Code Optimization**: Performance improvements and code refactoring
- **Testing Coverage**: Comprehensive unit and integration testing
- **Documentation**: API documentation and developer guides
- **Error Handling**: Enhanced error handling and user feedback
- **Security Audit**: Comprehensive security review and improvements
- **Performance Monitoring**: Application performance monitoring and optimization

---

## Conclusion

The NoCodeJam platform represents a comprehensive solution for no-code development education and competition. The current implementation provides a solid foundation with core functionality fully operational. The system successfully combines educational content with gamification elements to create an engaging learning environment.

The platform's architecture supports future growth and enhancement, with a modular design that allows for easy addition of new features and capabilities. The use of modern technologies (React, TypeScript, Supabase) ensures maintainability and scalability.

This SRS document serves as a comprehensive guide for the current system state and provides a roadmap for future development and enhancement of the NoCodeJam platform.

---

**Document Information:**
- **Last Updated**: December 2024
- **Version**: 2.0
- **Status**: Current Implementation
- **Next Review**: Q1 2025
