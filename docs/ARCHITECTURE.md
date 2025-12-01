# Architecture Document: Neko Maji

## 1. Executive Summary
**Neko Maji** will be a high-performance, accessible, and modular web-based puzzle game. The architecture prioritizes low latency, ease of configuration, and modern development standards using a robust 2D physics engine to handle complex object shapes.

## 2. Technology Stack

### 2.1 Core Framework & Build Tool
- **Build Tool**: **Vite**
    - *Rationale*: Extremely fast hot module replacement (HMR), optimized production builds (Rollup), and native ES module support.
- **UI Framework**: **Preact** (or React)
    - *Rationale*: "Modern web framework" requirement. Preact is chosen for its **tiny footprint (3kb)** compared to React, ensuring **low latency** and fast load times while providing the same component-based architecture for the UI (Menus, HUD, High Scores).

### 2.2 Game Engine & Physics
- **Game Engine**: **Phaser 3**
    - *Rationale*: The industry standard for HTML5 2D games. It provides a robust rendering pipeline (WebGL with Canvas fallback), scene management, and asset handling.
- **Physics Engine**: **Matter.js** (integrated via Phaser)
    - *Rationale*:
        - Supports **complex polygons** and concave shapes (required for "odd shapes that are not simple circles").
        - Stable and performant rigid body physics.
        - Configurable physical properties (friction, restitution/bounciness, density) which are crucial for the "feel" of the game.

### 2.3 Language
- **TypeScript**
    - *Rationale*: Type safety ensures better maintainability, easier refactoring, and fewer runtime errors, especially when dealing with complex game logic and configurations.

## 3. Architecture Design

### 3.1 Modular Game Logic
The game will be data-driven to satisfy the "Modular architecture" requirement.
- **Configuration Files**:
    - `pieces.json`: Defines the 11 levels of pieces.
        - Properties: `id`, `level`, `texture`, `physicsShape` (vertices path or primitive), `mass`, `bounce`.
    - `levels.json`: Defines game rules (gravity settings, spawn rates, win conditions).
- **Game Manager**: A central singleton or state machine that handles the high-level game flow (Menu -> Playing -> Paused -> GameOver).

### 3.2 Physics Implementation (Odd Shapes)
- **Physics Editor**: We will use a workflow (e.g., PhysicsEditor or similar tools) to generate JSON vertex data for the cat/toy shapes.
- **Body Creation**: The game will read `pieces.json` and the vertex data to create accurate Matter.js bodies that match the visual assets.

### 3.3 Game Speed & Debugging
- **Time Scale**: Matter.js and Phaser allow for time scaling.
- **Debug Panel**: A developer-only UI overlay (toggled via query param or hidden gesture) to:
    - Adjust `timeScale` (0.1x to 2.0x).
    - Toggle Physics Debug view (show wireframes, collision points).
    - Force spawn specific pieces.

## 4. Accessibility (A11y)

### 4.1 Visual Accessibility
- **Distinct Silhouettes**: Pieces will have distinct shapes, not just different colors, to aid color-blind players.
- **High Contrast Mode**: A toggleable shader or asset swap that renders pieces with high-contrast outlines and patterns.
- **Scalable UI**: UI elements will use relative units (rem/em) and vector graphics (SVG) to remain crisp at any zoom level.

### 4.2 Assistive Technology
- **Screen Reader Support**: The UI (Preact) will use semantic HTML and ARIA labels.
    - Menus and High Score tables will be fully navigable via keyboard and screen readers.
    - Game events (like "Merge Level 5") can trigger "Live Region" announcements if enabled.

## 5. Performance & Low Latency

### 5.1 Asset Optimization
- **Texture Atlases**: Combine all piece images into a single texture atlas to reduce HTTP requests (1 request vs 11+).
- **Audio Sprites**: Combine sound effects into a single audio file.
- **WebP Format**: Use WebP for all raster assets for superior compression.

### 5.2 Code Splitting
- The Game Engine (Phaser) will be loaded asynchronously. The initial page load will only contain the lightweight Preact UI (Loading Screen), ensuring an "instant" first paint.

## 6. Data Management (High Scores)
- **Local Storage**: Simple key-value storage for persistence.
- **Structure**:
    ```json
    {
      "highScores": [
        { "score": 1200, "date": "2023-10-27T10:00:00Z" },
        ...
      ],
      "settings": {
        "soundVolume": 0.8,
        "highContrast": false
      }
    }
    ```

## 7. Directory Structure
```
/
├── public/             # Static assets (images, sounds, json configs)
├── src/
│   ├── assets/         # Source assets
│   ├── components/     # Preact UI Components (HUD, Menu)
│   ├── game/           # Phaser Game Logic
│   │   ├── scenes/     # Boot, Preload, MainGame, GameOver
│   │   ├── objects/    # Piece, Wall, Container
│   │   └── config/     # Types and Loaders for JSON configs
│   ├── utils/          # Storage, Math helpers
│   ├── main.tsx        # Entry point
│   └── style.css       # Global styles
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```
