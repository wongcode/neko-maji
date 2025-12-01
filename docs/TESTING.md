# Neko Maji - Verification Suite

This document outlines the manual verification steps to ensure the game meets the requirements defined in the PRD. Run these checks after every significant change.

## 1. Core Gameplay Mechanics

- [ ] **Dropping Pieces**:
    - [ ] Click/Tap anywhere on the screen to drop the current piece.
    - [ ] Piece falls from the top (spawn height) at the horizontal position of the input.
    - [ ] Piece falls with gravity and realistic physics.
- [ ] **Merging**:
    - [ ] Two identical pieces merge upon contact.
    - [ ] Merged piece transforms into the next level toy (e.g., Dust Bunny -> Kibble).
    - [ ] Score increases by the value of the merged piece.
    - [ ] Sound effect plays on merge.
- [ ] **Game Over**:
    - [ ] Game ends if a piece stays above the danger line for too long (currently instant for prototype).
    - [ ] "Game Over" screen appears.
    - [ ] "Play Again" button restarts the game.

## 2. Controls & Input

- [ ] **Mouse**:
    - [ ] Moving mouse updates the "ghost" piece position.
    - [ ] Clicking drops the piece.
- [ ] **Touch**:
    - [ ] Tapping updates the "ghost" piece position and drops the piece.
    - [ ] Dragging updates the "ghost" piece position.
- [ ] **Constraints**:
    - [ ] Pieces cannot be dropped outside the left/right walls.
    - [ ] Ghost piece clamps to the board boundaries.

## 3. Visuals & Layout

- [ ] **Full Screen**:
    - [ ] Game canvas fills the entire window.
    - [ ] Game board is centered horizontally and vertically.
    - [ ] Resizing the window keeps the board centered.
- [ ] **Container**:
    - [ ] U-shaped container walls are visible.
    - [ ] Walls extend flush to the top of the screen.
    - [ ] Bottom corners are rounded.
    - [ ] Pieces rest on the bottom floor line (not floating, not sinking).
- [ ] **Danger Line**:
    - [ ] Dotted line is visible at the correct height.

## 4. UI Overlay

- [ ] **Score**:
    - [ ] Current score is displayed clearly.
    - [ ] Score updates immediately upon merging.
- [ ] **Next Item**:
    - [ ] "Next" preview shows the correct upcoming toy.
    - [ ] Updates after dropping the current piece.

## 5. Technical Checks

- [ ] **Console Errors**:
    - [ ] Open Developer Tools (F12).
    - [ ] Verify no red errors appear during gameplay.
- [ ] **Performance**:
    - [ ] Game runs smoothly (60fps) without stuttering.
