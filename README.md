# SATAN'S SPREADSHEETS V6.6.6

**Welcome to the abyss of data entry.**

Satan's Spreadsheets is a cursed, high-stakes spreadsheet application designed for the management of damned souls. It features a unique "handshake" mechanic, alchemical visual effects, and a demotivational interface that actively tries to break your spirit.

## New Features (v6.6.6)

### 1. Infernal Authentication
You must authenticate to access the mainframe.
- **SINNER**: Default user. Password: `666`.
- **ADMIN**: Administrator privileges. Password: `777`.
- **[U] USER**: Define a custom username in the login screen (displayed in reverse). Password: `666`.

### 2. The Ledger of Shadows
- **LEDGER_VOID_FINAL.csv**: Initial soul data is now strictly loaded from the void ledger.
- **CSV Export**: Press `[SHIFT] + [S]` to save your current work to a new CSV file.

### 3. Grid Navigation & Pagination
- **View A / View B**: The grid now supports 12 columns across two views. Navigate to the edge of the grid to switch views.
- **Virtual Scrolling**: Smoothly navigate through thousands of damned records.

### 4. Interactive Torment
- **Snick the Assistant**: A helpful paperclip-adjacent demon who offers "help" in exchange for solving riddles or receiving bribes.
- **Curses**: Beware of Snick's power. Incorrect answers or "Index" attempts may trigger an **RGB Cycle** or **Cursed Font** effect.
- **The Lockout**: Three failed login attempts will lock your terminal for 5 minutes. This incident will be reported.

## Core Features

### The Handshake Protocol (Carrier Signal)
**"Maintain the connection, or lose your soul...'s data."**
- **The Mechanic**: The connection to the infernal mainframe is unstable. You must periodically press `[SPACE]` to maintain the "Handshake".
- **Consequence**: Data entry pauses if the signal drops (NO CARRIER). Visual artifacts will appear as the connection degrades.

### Controls
| Key | Action |
| :--- | :--- |
| **[SPACE]** | Maintain Handshake (Restore Signal) |
| **[ARROW KEYS]** | Navigate grid and switch View A/B |
| **[X]** | Toggle Edit Mode / Close Modals / Accept Fate |
| **[E]** | Open Edit Modal for selected cell |
| **[S]** | Search Database |
| **[SHIFT] + [S]** | Save to CSV |
| **[I]** | Index (Reset to initial state - **CAUTION: INVOLVES CURSES**) |
| **[B]** | Bribe Snick the Assistant |
| **[H]** | Summon Snick for "Help" |
| **[U]** | Focus Username field (Login screen) / Admin toggle |
| **[ESCAPE]** | Reload Terminal (Reset connection) |

## Technical Specifications
- **Stack**: Vanilla HTML5, CSS3, JavaScript (ES6+).
- **Data**: `LEDGER_VOID_FINAL.csv`, `secret.json`, `riddles.json`, `existentialquotes.json`.
- **No Dependencies**: Runs on pure malice.

## Installation & Running
Because this application uses external data files (JSON/CSV), modern browsers will block it from running directly from the file system due to CORS security policies.

**To Run:**
1. Open your terminal.
2. Navigate to the project folder.
3. Run the provided server script:
   ```bash
   python3 serve.py
   ```
4. Access the application at `http://localhost:6660`.

## Live Deployment
The latest version is deployed at: [https://polerix.github.io/satans_spreadsheet/](https://polerix.github.io/satans_spreadsheet/)

---
*Est. 2026 - The Underworld Corp.*
