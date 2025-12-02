# Product Requirements Document (PRD): Neko Maji

## 1. Introduction
**Neko Maji** is a casual physics-based puzzle game inspired by the "Suika Game" (Watermelon Game). Instead of fruits, the theme revolves around **cats and their toys**. Players drop pieces into a container, and when two identical pieces touch, they merge into a larger, higher-level piece.

## 2. Gameplay Mechanics

### 2.1 Core Loop
- **Dropping Pieces**: Players control the horizontal position of a piece at the top of the container and release it to let it fall.
- **Physics**: Pieces fall and interact with other pieces and the container walls using 2D physics (gravity, collision, rotation).
- **Merging**:
    - When two pieces of the **same level** touch, they merge into one piece of the **next level**.
    - The new piece is spawned at the collision point (or midpoint).
    - Score is awarded for each merge.
- **Game Over**: The game ends if the container overflows (pieces cross the top line and stay there for a set duration).

### 2.2 Progression & Levels
- There are **11 Levels** of pieces (from smallest to largest).
- **Theme**: Cats & Toys (e.g., Yarn Ball -> Mouse Toy -> ... -> Big Cat).
- **Ultimate Goal**: Merging two Level 11 pieces results in a **Screen Clear** (or a massive bonus/win state) effectively resetting the board or clearing those pieces to allow continued play. *Clarification: User specified "Upon merging the last level, the screen clears."*

### 2.3 Scoring
- Points are awarded for every merge.
- Higher-level merges award more points.
- **Objective**: Achieve the highest possible score.

### 2.4 Special Mechanics
- **Mood Bar ("Purr Meter")**:
    - A shared "mood meter" increases with each merge.
    - When full, the player can trigger a one-time ability.
- **Abilities**:
    1.  **Purr Burst (Laser)**: A hand with a laser pointer transitions down from the top. The player can aim the laser to burst (destroy) all balls in its path.
    2.  **Shake**: A small shake of the container to settle pieces for tighter packing.

## 3. Controls & Input
- **Platform**: Web (Desktop & Mobile).
- **Input Methods**:
    - **Mouse**: Move cursor to aim, Click to drop.
    - **Touch**: Drag to aim, Release (or tap) to drop.
- **Keyboard**:
    - `ESC`: Pause Game.

## 4. UI/UX Features

### 4.1 HUD (Heads-Up Display)
- Current Score.
- "Next Piece" preview (showing which piece will appear next in the hand).
- Pause/Menu Button.

### 4.2 Pause Menu
- **Trigger**: Click on the **Vanity Cat** at the top of the screen.
- **Behavior**:
    - Pauses game physics.
    - Hides all game pieces.
    - Displays a dark overlay.
- **UI Elements**:
    - **Resume Button**: Returns to the game. Styled with rounded corners, orange background, and shadow (matching "Try Again" button).
    - **Restart Button**: Resets the game. Styled similarly to Resume.
    - **Helper Infographic**: A visual row at the bottom showing the progression of pieces (Level 1 -> Level 11).

## 5. Technical Requirements
- **Responsive Design**: Must work seamlessly on both desktop browsers and mobile devices (phones/tablets).
- **Local Storage**: High scores should be saved locally on the user's device.
- **Physics Engine**: Use a 2D physics library (e.g., Matter.js, Planck.js, or built-in engine if using a framework like Phaser).

## 6. Assets & Theme
- **Visual Style**: Cute, "Neko" (Cat) themed.
- **Pieces**: 11 distinct assets representing cat toys and cats.

### 6.1 Tangram Rules
- **Connectivity**: Any object represented as a Tangram (e.g., Fish, Cat) must have all its individual geometric pieces touching each other. There should be no floating or disconnected parts.
- **Minimalism**: Tangram objects should **not** have eyes, faces, or shine effects. They should rely solely on the geometric shapes and gradients for their visual identity.
