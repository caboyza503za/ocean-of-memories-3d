import os
import shutil
from PIL import Image
from pillow_heif import register_heif_opener

register_heif_opener()

source_dir = r"C:\Users\caboy\Downloads\Photos"
target_dir = os.path.join(source_dir, "converted")

if not os.path.exists(target_dir):
    os.makedirs(target_dir)

files = os.listdir(source_dir)
for file in files:
    source_path = os.path.join(source_dir, file)
    
    # Skip directories
    if os.path.isdir(source_path):
        continue

    file_name, ext = os.path.splitext(file)
    ext = ext.lower()
    
    if ext == '.heic':
        print(f"Converting {file} to JPG...")
        try:
            image = Image.open(source_path)
            target_path = os.path.join(target_dir, f"{file_name}.jpg")
            # Convert to RGB if it has an alpha channel
            if image.mode in ("RGBA", "P"):
                image = image.convert("RGB")
            image.save(target_path, "JPEG", quality=85)
            print(f"Success: {file_name}.jpg")
        except Exception as e:
            print(f"Failed to convert {file}: {e}")
    else:
        print(f"Copying {file}...")
        try:
            target_path = os.path.join(target_dir, file)
            shutil.copy2(source_path, target_path)
            print(f"Copied: {file}")
        except Exception as e:
            print(f"Failed to copy {file}: {e}")

print("All done!")
