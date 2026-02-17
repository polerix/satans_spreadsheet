# SATAN'S SPREADSHEETS V6.6.6

**Welcome to the abyss of data entry.**

Satan's Spreadsheets is a cursed, high-stakes spreadsheet application designed for the management of damned souls. It features a unique "handshake" mechanic, alchemical visual effects, and a demotivational interface.

## New Features (v6.6.6)

### 1. Secure (?) Login
You must authenticate to access the mainframe.
-   **SINNER**: Default user. Password: `666`.
-   **ADMIN**: Administrator privileges. Password: `777`.
-   **[U] USER**: Define a custom username (displayed in reverse). Password: `666`.

### 2. Data Persistence
-   **damned.csv**: The source of truth. The application loads initial soul data from this file on startup.
-   **CSV Export**: Press `[SHIFT] + [S]` to save your current work (download `damned.csv`).

### 3. Grid Navigation & Editing
-   **Arrow Keys**: Navigate the grid.
-   **[X] Edit Mode**: Toggle edit mode on the selected cell.
    -   **Punishments**: In Edit Mode, use `UP/DOWN` to cycle through available punishments.

### 4. Immersion
-   **Audio Engine**: Unsettling typing sounds, success chimes, and failure buzzers.
-   **Snick the Assistant**: A helpful paperclip-adjacent demon who offers "help" in exchange for solving riddles.
-   **Riddles.json**: All game text is loaded dynamically to allow for infinite torment expansion.

## Core Features

### The Handshake Protocol
**"Maintain the connection, or loose your soul...'s data."**
-   **The Mechanic**: The connection to the infernal mainframe is unstable. You must periodically press `[SPACE]` to maintain the "Handshake".
-   **Consequence**: Data entry pauses if the signal drops.

### Controls
-   **[SPACE]**: Maintain Handshake.
-   **[SHIFT] + [SPACE]**: Type a literal space.
-   **[ARROW KEYS]**: Navigate grid.
-   **[X]**: Toggle Edit Mode.
-   **[SHIFT] + [S]**: Save to CSV.
-   **[I]**: Index (Reset to initial CSV state).
-   **[H]**: Help (Summon Snick).
-   **[A]**: Add new soul.
-   **[B]**: Bribe (Trigger Snick).

## Technical Specifications
-   **Stack**: Vanilla HTML5, CSS3, JavaScript (ES6+).
-   **Data**: `damned.csv`, `secret.json`, `riddles.json`.
-   **No Dependencies**: Runs on pure malice.

## Installation & Running
Because this application uses external data files (JSON/CSV), modern browsers will block it from running directly from the file system due to CORS security policies.

**To Run:**
1.  Open your terminal/command prompt.
2.  Navigate to the project folder.
3.  Run the provided server script:
    ```bash
    python3 serve.py
    ```
    *Or if you don't have Python, use any local server (e.g., `npx http-server`, VS Code Live Server).*

4.  The application should open automatically in your browser at `http://localhost:6660`.

---
*Est. 2026 - The Underworld Corp.*
