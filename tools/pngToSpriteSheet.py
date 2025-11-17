from PIL import Image
import os

def create_spritesheet(image_folder, output_filename, sprite_width, sprite_height, columns):
    image_files = sorted([f for f in os.listdir(image_folder) if f.endswith('.png')])
    
    if not image_files:
        print("No PNG images found in the specified folder.")
        return
    print(image_files)

    num_sprites = len(image_files)
    rows = (num_sprites + columns - 1) // columns 

    spritesheet_width = columns * sprite_width
    spritesheet_height = rows * sprite_height

    spritesheet = Image.new('RGBA', (spritesheet_width, spritesheet_height))

    for i, filename in enumerate(image_files):
        filepath = os.path.join(image_folder, filename)
        try:
            img = Image.open(filepath).convert('RGBA')
            img = img.resize((sprite_width, sprite_height), Image.Resampling.LANCZOS)
        except Exception as e:
            print(f"Error loading image {filename}: {e}")
            continue

        col = i % columns
        row = i // columns

        x_offset = col * sprite_width
        y_offset = row * sprite_height

        spritesheet.paste(img, (x_offset, y_offset))

    spritesheet.save(output_filename)
    print(f"Sprite sheet '{output_filename}' created successfully.")


if __name__ == "__main__":
    image_folder = "assets/effects/explosion/emission"
    output_file = "explosion_emission.png"
    individual_sprite_width = 480
    individual_sprite_height = 480
    num_columns = 5

    if not os.path.exists(image_folder):
        os.makedirs(image_folder)
        dummy_image = Image.new('RGBA', (individual_sprite_width, individual_sprite_height), (255, 0, 0, 255))
        for i in range(20):
            dummy_image.save(os.path.join(image_folder, f"{i:02d}.png"))

    create_spritesheet(image_folder, output_file, individual_sprite_width, individual_sprite_height, num_columns)
