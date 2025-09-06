import pygame
import random
import sys

# Initialize Pygame
pygame.init()
pygame.mixer.init()  # for sounds

# Screen dimensions
SCREEN_WIDTH = 500
SCREEN_HEIGHT = 700
SCREEN = pygame.display.set_mode((SCREEN_WIDTH, SCREEN_HEIGHT))
pygame.display.set_caption("Flappy Bird")

# Clock
clock = pygame.time.Clock()
FPS = 60

# Colors
WHITE = (255, 255, 255)
BUTTON_COLOR = (0, 150, 0)
BUTTON_TEXT_COLOR = WHITE

# Fonts
TITLE_FONT = pygame.font.SysFont("comicsansms", 60)
BUTTON_FONT = pygame.font.SysFont("comicsansms", 30)
SCORE_FONT = pygame.font.SysFont("comicsansms", 40)

# Game variables
GRAVITY = 0.5
FLAP_STRENGTH = -10
PIPE_SPEED = 3
PIPE_WIDTH = 120  # thicker pipes
PIPE_GAP = 200

# Load assets
BIRD_IMG = pygame.image.load("assets/bird.png").convert_alpha()
PIPE_IMG = pygame.image.load("assets/pipe.png").convert_alpha()
BACKGROUND_IMG = pygame.image.load("assets/background.png").convert_alpha()

# Scale images
BIRD_WIDTH, BIRD_HEIGHT = 40, 30
BIRD_IMG = pygame.transform.scale(BIRD_IMG, (BIRD_WIDTH, BIRD_HEIGHT))

# Sounds
WING_SOUND = pygame.mixer.Sound("assets/sounds/wing.wav")
HIT_SOUND = pygame.mixer.Sound("assets/sounds/hit.wav")
POINT_SOUND = pygame.mixer.Sound("assets/sounds/point.wav")

# Classes
class Bird:
    def __init__(self):
        self.x = SCREEN_WIDTH // 5
        self.y = SCREEN_HEIGHT // 2
        self.width = BIRD_WIDTH
        self.height = BIRD_HEIGHT
        self.velocity = 0
        self.rect = pygame.Rect(self.x, self.y, self.width, self.height)

    def flap(self):
        self.velocity = FLAP_STRENGTH
        WING_SOUND.play()

    def update(self):
        self.velocity += GRAVITY
        self.y += self.velocity
        self.rect.y = int(self.y)

    def draw(self, screen):
        screen.blit(BIRD_IMG, (self.x, self.y))


class Pipe:
    def __init__(self, x):
        self.x = x
        self.width = PIPE_WIDTH
        self.top_height = random.randint(50, SCREEN_HEIGHT - PIPE_GAP - 50)
        self.bottom_y = self.top_height + PIPE_GAP
        self.passed = False
        self.top_rect = pygame.Rect(self.x, 0, self.width, self.top_height)
        self.bottom_rect = pygame.Rect(self.x, self.bottom_y, self.width, SCREEN_HEIGHT - self.bottom_y)

    def update(self):
        self.x -= PIPE_SPEED
        self.top_rect.x = int(self.x)
        self.bottom_rect.x = int(self.x)

    def draw(self, screen):
        # Top pipe (flipped)
        top_pipe_img = pygame.transform.flip(PIPE_IMG, False, True)
        top_pipe_scaled = pygame.transform.scale(top_pipe_img, (self.width, self.top_height))
        screen.blit(top_pipe_scaled, (self.x, 0))
        # Bottom pipe
        bottom_pipe_scaled = pygame.transform.scale(PIPE_IMG, (self.width, SCREEN_HEIGHT - self.bottom_y))
        screen.blit(bottom_pipe_scaled, (self.x, self.bottom_y))


# Buttons
def draw_button(screen, x, y, width, height, text):
    pygame.draw.rect(screen, BUTTON_COLOR, (x, y, width, height), border_radius=10)
    text_surface = BUTTON_FONT.render(text, True, BUTTON_TEXT_COLOR)
    screen.blit(text_surface, (x + width // 2 - text_surface.get_width() // 2,
                               y + height // 2 - text_surface.get_height() // 2))


# Main game
def main():
    run = True
    game_state = "menu"
    bird = Bird()
    pipes = []
    spawn_timer = 0
    score = 0

    while run:
        SCREEN.fill((0,0,0))
        SCREEN.blit(pygame.transform.scale(BACKGROUND_IMG, (SCREEN_WIDTH, SCREEN_HEIGHT)), (0, 0))

        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                run = False
                pygame.quit()
                sys.exit()
            if event.type == pygame.KEYDOWN or event.type == pygame.MOUSEBUTTONDOWN:
                if game_state == "menu":
                    game_state = "playing"
                    bird = Bird()
                    pipes = []
                    spawn_timer = 0
                    score = 0
                elif game_state == "playing":
                    bird.flap()
                elif game_state == "gameover":
                    game_state = "menu"

        if game_state == "menu":
            title_text = TITLE_FONT.render("FLAPPY BIRD", True, WHITE)
            SCREEN.blit(title_text, (SCREEN_WIDTH//2 - title_text.get_width()//2, SCREEN_HEIGHT//4))
            draw_button(SCREEN, SCREEN_WIDTH//2 - 75, SCREEN_HEIGHT//2, 150, 60, "PLAY")

        elif game_state == "playing":
            # Bird
            bird.update()
            bird.draw(SCREEN)

            # Pipes
            spawn_timer += 1
            if spawn_timer > 90:
                pipes.append(Pipe(SCREEN_WIDTH))
                spawn_timer = 0

            for pipe in pipes:
                pipe.update()
                pipe.draw(SCREEN)

                # Collision
                if bird.rect.colliderect(pipe.top_rect) or bird.rect.colliderect(pipe.bottom_rect):
                    HIT_SOUND.play()
                    game_state = "gameover"

                # Score
                if not pipe.passed and pipe.x + pipe.width < bird.x:
                    pipe.passed = True
                    score += 1
                    POINT_SOUND.play()

            # Remove offscreen pipes
            pipes = [pipe for pipe in pipes if pipe.x + pipe.width > 0]

            # Boundaries
            if bird.y + bird.height >= SCREEN_HEIGHT or bird.y <= 0:
                HIT_SOUND.play()
                game_state = "gameover"

            # Score
            score_text = SCORE_FONT.render(str(score), True, WHITE)
            SCREEN.blit(score_text, (20, 20))

        elif game_state == "gameover":
            gameover_text = TITLE_FONT.render("GAME OVER", True, WHITE)
            SCREEN.blit(gameover_text, (SCREEN_WIDTH//2 - gameover_text.get_width()//2, SCREEN_HEIGHT//4))
            score_text = SCORE_FONT.render(f"Score: {score}", True, WHITE)
            SCREEN.blit(score_text, (SCREEN_WIDTH//2 - score_text.get_width()//2, SCREEN_HEIGHT//2))
            draw_button(SCREEN, SCREEN_WIDTH//2 - 75, SCREEN_HEIGHT//1.5, 150, 60, "RESTART")

        pygame.display.update()
        clock.tick(FPS)


if __name__ == "__main__":
    main()
