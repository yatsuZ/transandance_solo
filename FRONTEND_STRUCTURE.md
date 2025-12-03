# Frontend Structure Documentation

## Overview

This document describes the architecture and organization of the frontend TypeScript codebase located in `/code/srcs/static/js/`.

The frontend follows a **Single Page Application (SPA)** architecture with a modular organization based on features and responsibilities.

---

## Directory Structure

```
static/js/
├── core/                        # Core infrastructure and DOM management
├── navigation/                  # SPA routing and page navigation
├── auth/                        # Authentication and user session management
├── profile/                     # User profile features
├── leaderboard/                 # Leaderboard and rankings
├── game-management/             # Match and tournament orchestration
├── pong/                        # Pong game engine
├── tournament/                  # Tournament-specific logic
├── ui/                          # UI utilities (music, descriptions)
├── utils/                       # Shared utilities and helpers
├── main_app.ts                  # Application entry point
└── SiteManagement.ts            # Main application orchestrator
```

---

## Module Descriptions

### 1. Core (`core/`)

**Purpose:** Central infrastructure for DOM management and application configuration.

**Files:**
- `dom-elements.d.ts` - TypeScript type definitions for all DOM elements used in the app
- `dom-manager.ts` - Centralized DOM element retrieval and initialization
- `ui-preferences.ts` - User interface preferences management

**Key Concept:**
All DOM element selectors must be defined in `dom-manager.ts` and typed in `dom-elements.d.ts`. This ensures type safety and prevents scattered `document.getElementById()` calls throughout the codebase.

**Example:**
```typescript
// dom-manager.ts
const ProfileUsername = get<HTMLElement>("profile-username", "Profile");

// Usage in other files
this._DO.profile.username.textContent = "John";
```

---

### 2. Navigation (`navigation/`)

**Purpose:** Handles SPA routing, page transitions, and navigation logic.

**Files:**
- `navigation-events.ts` - Main navigation class handling routes and events
- `helpers.ts` - Navigation helper functions and route configuration
- `page-manager.ts` - Page activation and visibility management

**Key Features:**
- Client-side routing with `window.history` API
- Context-restricted routes (match/tournament pages require active context)
- Authentication-protected routes
- Back/forward browser navigation support
- Route validation (404, 403, 401 errors)

**Route Types:**
1. **Public routes** - `/login`, `/signup` (unauthenticated access)
2. **Protected routes** - `/profile`, `/leaderboard` (require JWT)
3. **Context-restricted routes** - `/match`, `/tournament/*` (require active game/tournament)

---

### 3. Authentication (`auth/`)

**Purpose:** User authentication and session management.

**Files:**
- `auth-manager.ts` - Authentication operations (login, signup, logout)
- `user-session.ts` - Client-side session state management
- `auth-events.ts` - Authentication event handlers

**Key Features:**
- JWT-based authentication (HTTP-only cookies)
- Server-side auth verification
- User session persistence
- Logout and session cleanup

---

### 4. Profile (`profile/`)

**Purpose:** User profile display and management.

**Files:**
- `profile-page-manager.ts` - Profile page orchestration
- `profile-edit-manager.ts` - Profile editing (username, email, password, avatar)
- `profile-controls-manager.ts` - Game controls customization
- `profile-api.ts` - Profile API calls

**Key Features:**
- View own profile and friend profiles
- Update user information
- Customize game controls
- Friend management (add/remove friends from Top 3)
- Match history display

---

### 5. Leaderboard (`leaderboard/`)

**Purpose:** Display player rankings and statistics.

**Files:**
- `leaderboard-manager.ts` - Leaderboard display and friend management

**Key Features:**
- Top 3 podium display
- Full player rankings table
- Arcade score calculation
- Friend addition (Top 3 restriction)
- Empty state handling

---

### 6. Game Management (`game-management/`)

**Purpose:** Orchestrates matches and tournaments at a high level.

**Files:**
- `match-controller.ts` - Match lifecycle management
- `tournament-controller.ts` - Tournament lifecycle management
- `match-api.ts` - Match API calls
- `forms/game-config-form.ts` - Match configuration form
- `forms/tournament-form.ts` - Tournament configuration form

**Responsibilities:**
- Start/stop matches and tournaments
- Manage game state transitions
- Handle result submission
- Navigate between game phases

---

### 7. Pong Game Engine (`pong/`)

**Purpose:** Core Pong game rendering and physics.

**Files:**
- `pong-game.ts` - Main game loop and rendering
- `game-config.ts` - Game configuration (difficulty, controls)
- `components/player.ts` - Player (paddle) entity
- `components/field.ts` - Game field boundaries and rendering
- `components/geometry.ts` - Collision detection and physics
- `components/input.ts` - Keyboard input handling

**Architecture:**
- Component-based game entities
- Canvas rendering with requestAnimationFrame
- Physics calculations (ball movement, collision)
- AI opponent logic
- Score tracking

---

### 8. Tournament (`tournament/`)

**Purpose:** Tournament-specific features (bracket tree, API).

**Files:**
- `tournament.ts` - Tournament state management
- `tournament-tree.ts` - Tournament bracket visualization
- `tournament-api.ts` - Tournament API calls

**Key Features:**
- Tournament bracket tree rendering
- Match progression tracking
- Participant management
- Winner determination

---

### 9. UI Utilities (`ui/`)

**Purpose:** User interface enhancements and utilities.

**Files:**
- `description-manager.ts` - Page subtitle text management
- `music-manager.ts` - Background music controls

**Features:**
- Dynamic page description updates on hover
- Music playback control
- Friend profile description updates

---

### 10. Utils (`utils/`)

**Purpose:** Shared utility functions.

**Files:**
- `validators.ts` - Form validation functions
- `url-helpers.ts` - URL manipulation and error pages

**Functions:**
- Input validation (username, email, password)
- URL parameter extraction
- Error page redirection
- Page identification from URL

---

## Application Entry Point

### `main_app.ts`

The application entry point that initializes the entire frontend.

**Responsibilities:**
1. Initialize DOM elements via `dom-manager.ts`
2. Instantiate `SiteManagement` class
3. Set up global event listeners

### `SiteManagement.ts`

The main orchestrator class that coordinates all modules.

**Instantiates:**
- `NavigationEvents` - Routing and navigation
- `MatchController` - Match management
- `TournamentController` - Tournament management
- `AuthEvents` - Authentication handlers
- Music and description managers

---

## Architecture Patterns

### 1. Centralized DOM Management

**Why:** Prevents scattered DOM queries, ensures type safety, improves maintainability.

**How:**
- All DOM elements defined in `dom-manager.ts`
- Typed via `dom-elements.d.ts`
- Accessed through `DOMElements` object passed as constructor parameter

```typescript
class ProfilePageManager {
  constructor(private _DO: DOMElements) {}

  updateUsername(name: string) {
    this._DO.profile.username.textContent = name;
  }
}
```

### 2. Manager Classes

Most features are organized as manager classes with clear responsibilities:

- **PageManagers** - Handle specific page logic (ProfilePageManager, LeaderboardManager)
- **Controllers** - Orchestrate high-level flows (MatchController, TournamentController)
- **API Modules** - Encapsulate API calls (profile-api.ts, match-api.ts)

### 3. Single Page Application (SPA)

- No full page reloads
- Client-side routing with `window.history`
- Dynamic content loading via fetch API
- State management through controllers

### 4. Separation of Concerns

- **Navigation** - Page transitions and routing
- **Auth** - User authentication and sessions
- **Game Logic** - Pong game engine
- **UI** - Visual updates and descriptions
- **Utils** - Shared functionality

---

## Data Flow

### Authentication Flow
```
User Input → AuthEvents → AuthManager.login()
  → API Call → JWT Cookie Set
  → UserSession.setUser() → Navigation to /profile
```

### Match Flow
```
Match Config Form → MatchController.startMatch()
  → Navigation to /match → PongGame.start()
  → Game Completion → MatchController.handleMatchEnd()
  → API Call (save result) → Navigation to /match/result
```

### Profile Update Flow
```
Profile Edit Form → ProfileEditManager.handleSubmit()
  → Validation → API Call (multipart/form-data)
  → Update DOM → Refresh Page Description
```

---

## State Management

State is managed through several mechanisms:

1. **UserSession (Singleton)** - Current user data
2. **Controllers** - Match/Tournament active state
3. **URL State** - Current page and context
4. **LocalStorage** - UI preferences (music on/off)

---

## API Communication

All API calls use the Fetch API with consistent patterns:

```typescript
async function apiCall() {
  const response = await fetch('/api/endpoint', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include', // Include JWT cookie
    body: JSON.stringify(data)
  });

  const result = await response.json();
  if (result.success) {
    // Handle success
  } else {
    // Handle error
  }
}
```

---

## Error Handling

- **404 errors** - Invalid routes → Custom error page with original URL
- **403 errors** - Access forbidden (not authenticated or context missing)
- **401 errors** - Authentication required → Redirect to login
- **Network errors** - Caught and displayed to user

---

## Best Practices

1. **Always use DOMElements** - Never use `document.getElementById()` directly
2. **Type safety** - Leverage TypeScript for all modules
3. **Single Responsibility** - Each class/module has one clear purpose
4. **Avoid global state** - Pass dependencies via constructors
5. **Consistent naming** - `FeatureManager`, `feature-api.ts`, `FeatureController`
6. **Comments in English** - All code comments should be in English
7. **No emojis in production code** - Keep code professional

---

## Module Dependencies

```
SiteManagement
  ├── NavigationEvents
  │     ├── ProfilePageManager
  │     ├── LeaderboardManager
  │     └── NavigationHelpers
  ├── MatchController
  │     ├── PongGame
  │     └── MatchAPI
  ├── TournamentController
  │     ├── Tournament
  │     ├── TournamentTree
  │     └── TournamentAPI
  ├── AuthEvents
  │     ├── AuthManager
  │     └── UserSession
  ├── MusicManager
  └── DescriptionManager
```

---

## Future Improvements

Potential areas for enhancement:

1. **Notification System** - Replace `alert()` with toast notifications
2. **State Library** - Consider Redux or similar for complex state
3. **Optimistic Updates** - Remove `window.location.reload()` in favor of DOM updates
4. **Error Boundaries** - Better error recovery mechanisms
5. **Loading States** - Visual feedback during API calls
6. **Code Splitting** - Lazy load modules for better performance

---

## Debugging Tips

1. **Navigation issues** - Check `navigation-events.ts` console logs
2. **Auth problems** - Verify JWT cookie in DevTools → Application → Cookies
3. **DOM not updating** - Ensure element exists in `dom-manager.ts`
4. **API errors** - Check Network tab for request/response details
5. **Game not rendering** - Verify canvas element exists and context is valid

---

## Summary

The frontend is organized into feature-based modules with clear separation of concerns. The architecture prioritizes type safety, maintainability, and scalability through:

- Centralized DOM management
- SPA routing with context awareness
- Manager/Controller pattern
- Consistent API communication
- Modular game engine

This structure allows for easy feature addition, testing, and maintenance while keeping the codebase clean and professional.
