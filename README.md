# Fruit Basket Slot Game

A simple HTML5 slot machine game built with PixiJS and Tailwind CSS.

## Features

- 5-reel slot machine with fruit symbols
- Multiple paylines
- Wild and Scatter symbols
- Free spins feature
- Responsive design
- Smooth animations

## Getting Started

### Prerequisites

- Node.js (for development server)

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The game will be available at the Vite dev server URL (typically `http://localhost:5173`).

### Code Formatting

```bash
npm run format
```

This uses Prettier to format all JavaScript, HTML, and CSS files.

## Project Structure

```
├── css/
│   └── styles.css              # Custom styles
├── js/
│   ├── config/                 # Game configuration
│   │   ├── counts.js
│   │   ├── game-config.js
│   │   ├── paylines.js
│   │   ├── paytable.js
│   │   └── symbols.js
│   ├── core/                   # Core game logic
│   │   ├── game-state.js
│   │   └── random.js
│   ├── game/                   # Game mechanics
│   │   ├── bet-controls.js
│   │   ├── event-handlers.js
│   │   ├── paytable-modal.js
│   │   └── spin.js
│   ├── graphics/               # PIXI graphics setup
│   │   ├── background.js
│   │   ├── pixi-setup.js
│   │   └── responsive.js
│   ├── reels/                  # Reel logic
│   │   ├── reel.js
│   │   ├── reel-animation.js
│   │   └── reel-manager.js
│   ├── ui/                     # UI components
│   │   ├── dom.js
│   │   ├── modal-loader.js
│   │   └── ui-updater.js
│   ├── utils/                  # Utility functions
│   │   └── helpers.js
│   ├── visuals/                # Visual effects
│   │   ├── payline-drawing.js
│   │   ├── symbol-visuals.js
│   │   └── win-presentation.js
│   └── win-evaluation/         # Win calculation
│       ├── payline-evaluator.js
│       ├── scatter-handler.js
│       └── win-calculator.js
├── templates/
│   └── paytable-modal.html     # Modal template
├── index.html                  # Main HTML file
├── game.js                     # Game entry point
└── package.json
```

## How to Play

1. **Set your bet** using the + and - buttons, or click MAX for maximum bet
2. **Click SPIN** (or press Space) to spin the reels
3. **Match symbols** across paylines to win
4. **Land 3+ Pineapples** to trigger free spins
5. **Click PAY** to view the paytable

## Symbols

- 🍎 Apple
- 🍑 Peach
- 🍋 Lemon
- 🍒 Cherry
- 🍍 Pineapple (Scatter - triggers free spins)
- ⭐ Wild (substitutes for all symbols except Scatter)

## Technologies

- **PixiJS v8** - Graphics rendering
- **Tailwind CSS** - Styling
- **Vite** - Development server
- **Prettier** - Code formatting

## License

ISC
