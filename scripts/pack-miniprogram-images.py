"""Pack reviewed artwork for native miniapp; requires Python 3 and Pillow."""
import json
import sys
from pathlib import Path
from PIL import Image

root = Path(sys.argv[1])
assets = {}
for folder in ('units', 'words'):
    (root / 'miniprogram/assets' / folder).mkdir(parents=True, exist_ok=True)
for unit in range(1, 7):
    source = root / f'english/illustrations/u{unit}.webp'
    destination = f'/assets/units/u{unit}.webp'
    with Image.open(source) as image:
        image.thumbnail((560, 400))
        image.save(root / ('miniprogram' + destination), 'WEBP', quality=75, method=4)
    assets[f'/english/illustrations/u{unit}.webp'] = destination
for source in sorted((root / 'english/miniprogram-art').glob('*.png')):
    destination = f'/assets/words/{source.stem}.webp'
    with Image.open(source) as image:
        image.thumbnail((192, 192))
        image.save(root / ('miniprogram' + destination), 'WEBP', quality=85, method=4)
    assets[f'/english/miniprogram-art/{source.name}'] = destination
print(json.dumps(assets))
