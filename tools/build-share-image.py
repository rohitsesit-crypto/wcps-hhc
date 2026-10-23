"""Build a static social preview using the user's existing favicon."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path('/workspace')
canvas = Image.new('RGB', (1200, 630), '#173650')
draw = ImageDraw.Draw(canvas)
font_dir = Path('/usr/share/fonts/truetype/liberation')

def font(size, bold=False):
    return ImageFont.truetype(str(font_dir / ('LiberationSans-Bold.ttf' if bold else 'LiberationSans-Regular.ttf')), size)

icon = Image.open(ROOT / 'uploads/app/favicon.ico').convert('RGBA')
icon.thumbnail((144, 144), Image.Resampling.LANCZOS)
draw.rounded_rectangle((76, 68, 252, 244), radius=26, fill='#ffffff')
canvas.paste(icon, (76 + (176-icon.width)//2, 68 + (176-icon.height)//2), icon)
draw.text((292, 77), 'WCPS', font=font(72, True), fill='#ffffff')
draw.text((296, 170), 'WEALTH CREATION POTENTIAL SCORE', font=font(23, True), fill='#abdcca')
draw.text((80, 295), 'Discover your potential.', font=font(52, True), fill='#ffffff')
draw.text((80, 379), 'Explore your mindset, habits and life circumstances', font=font(29), fill='#d5e4ef')
draw.text((80, 424), 'with a 27-question assessment.', font=font(29), fill='#d5e4ef')
draw.rounded_rectangle((80, 512, 585, 570), radius=12, fill='#d5eee3')
draw.text((104, 523), 'Your personalised score and report', font=font(24, True), fill='#174f43')
canvas.save(ROOT / 'nextjs-updated/public/wcps-share.png', optimize=True)
print('Created favicon-based WCPS sharing image (1200 × 630).')
