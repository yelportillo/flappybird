# Flappy Bird - Python Version

A classic **Flappy Bird clone** made in **Python** using **Pygame**, featuring custom assets, sounds, and responsive gameplay.

## Features

- Uses custom assets:
  - `bird.png` for the bird  
  - `pipe.png` for pipes  
  - `background.png` for background  
  - Sounds: `wing.wav`, `hit.wav`, `point.wav`  
- Thicker pipes for easier gameplay  
- Flap, collision, and scoring mechanics like the original game  
- Main menu and game over screen with rounded buttons  
- Desktop platforms supported: Windows, macOS, Linux

## Requirements

- Python 3.7+  
- [Pygame](https://www.pygame.org/news)  

### Setup with Virtual Environment

1. Create a virtual environment:

```bash
python3 -m venv venv
```

2. Activate the virtual environment:

- **Windows:**
```bash
venv\Scripts\activate
```
- **macOS/Linux:**
```bash
source venv/bin/activate
```

3. Install dependencies using pip3:

```bash
pip3 install -r requirements.txt
```

**requirements.txt**:
```
pygame>=2.1.0
```

## Folder Structure

```
flappy-bird-python/
├── assets/
│   ├── bird.png
│   ├── pipe.png
│   ├── background.png
│   └── sounds/
│       ├── wing.wav
│       ├── hit.wav
│       └── point.wav
├── main.py
└── requirements.txt
```

## How to Play

1. Run the game:

```bash
python3 main.py
```

2. On the **menu screen**, click **PLAY** or press any key to start.
3. **Flap the bird** by clicking or pressing any key.
4. Avoid hitting the **pipes** or the **top/bottom edges**.
5. Each pipe you pass increases your **score** (plays point sound).
6. If you collide or go out of bounds, the **game over screen** appears. Press **RESTART** or any key to play again.

## Controls

- **Mouse click / Touch / Any key**: Flap  
- **Menu buttons**: Click PLAY or RESTART

## Notes

- The game scales images to fit the screen height and pipe sizes, designed for a 500x700 window.
- Sounds are optional; removing `assets/sounds` won't break the game.
- Using a virtual environment is recommended to avoid conflicts with system packages.

## Credits

- Original Flappy Bird concept  
- Python & Pygame implementation  
- Custom assets provided in `assets/` folder
