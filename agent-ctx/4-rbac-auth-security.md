# Task 4 - RBAC & Auth Security Agent

## Summary
Implemented proper role-based access control and fixed auth token verification across CampusOS AI.

## Changes Made

### 1. `/src/app/page.tsx` — Auth Check & Token Verification
- Updated token parsing to handle new 5-part HMAC format (`userId:email:role:timestamp:signature`)
- Added server-side token verification via `GET /api/auth/session-info` on initial load
- Replaced `router.push('/login')` with `window.location.href = '/login'` for reliable redirects
- Optimistic client-side auth for fast UI, followed by async server verification
- Removed `useRouter` import (no longer needed)
- Removed `faculty-portal` and `admin` from `studentSections` (was leaking admin/faculty sections to students)

### 2. `/src/components/campus/Sidebar.tsx` — Verified Correct
- Already has proper role-based nav groups (studentNavGroups, facultyNavGroups, adminNavGroups)
- No cross-role navigation leaks found

### 3. `/src/components/campus/Header.tsx` — Verified Correct
- RoleSwitcher already restricted to `currentUser?.role === 'admin'` (line 217)
- No changes needed

### 4. `/src/components/campus/FacultyPortal.tsx` — Added Role Guard
- Added Shield import from lucide-react
- Added role guard in render: only `faculty` or `admin` roles can access
- Non-authorized users see "Access Restricted" message with "Go to My Dashboard" button
- Guard placed after all hooks to avoid React hooks violations

### 5. `/src/components/campus/AdminPortal.tsx` — Added Role Guard
- Added `currentUser` and `setActiveRole` to destructured store
- Added role guard in render: only `admin` role can access
- Non-authorized users see "Access Denied" message with "Go to My Dashboard" button
- Guard placed after all hooks and tab sync logic

### 6. `/src/app/api/auth/users/route.ts` — DELETE Endpoint + Fixed GET
- **GET**: Fixed to use `verifyToken()` instead of manual `Buffer.from()` base64 decode (was vulnerable to HMAC bypass)
- **DELETE**: New endpoint with:
  - HMAC token verification via `verifyToken()`
  - Admin role check
  - Self-deletion prevention (`userId === decoded.userId`)
  - User existence check (404 if not found)
  - Cascading deletes for students: assignmentSubmissions, bookTransactions, internalMarks, subjectEnrollments, attendance, placements, complaints, leaveRequests, eventParticipants, fees, aiMemories, conversations, then student record
  - Cascading deletes for faculty: assignmentSubmissions, assignments, internalMarks, attendance, subjectEnrollments, subjects (by facultyId), then faculty record
  - Notification cleanup for all users
  - Final user record deletion

### 7. `/src/components/campus/AdminUserManager.tsx` — Delete User UI
- Added `deletingUserId` and `confirmDeleteId` state
- Added `handleDeleteUser` function with token auth and toast feedback
- Added delete button to each user row (hidden for current user — can't delete yourself)
- Two-step confirmation flow: click Trash2 icon → confirm/cancel buttons appear
- Loading spinner during deletion

## Lint Status
✅ All lint checks pass with zero errors
