# App Icons

This directory should contain PWA icons in the following sizes:

- icon-72x72.png
- icon-96x96.png
- icon-128x128.png
- icon-144x144.png
- icon-152x152.png
- icon-192x192.png
- icon-384x384.png
- icon-512x512.png

## Generating Icons

You can generate these icons from a single high-resolution source image (at least 512x512px) using:

1. **Online Tools:**
   - https://www.pwabuilder.com/imageGenerator
   - https://realfavicongenerator.net/

2. **Command Line (ImageMagick):**
   ```bash
   convert source.png -resize 72x72 icon-72x72.png
   convert source.png -resize 96x96 icon-96x96.png
   convert source.png -resize 128x128 icon-128x128.png
   convert source.png -resize 144x144 icon-144x144.png
   convert source.png -resize 152x152 icon-152x152.png
   convert source.png -resize 192x192 icon-192x192.png
   convert source.png -resize 384x384 icon-384x384.png
   convert source.png -resize 512x512 icon-512x512.png
   ```

## Design Guidelines

- Use a simple, recognizable design
- Ensure good contrast for visibility
- Consider using your college/institution logo
- Icons should work well at small sizes
- Transparent or solid background based on your design needs

## Temporary Placeholder

For testing, you can use any square PNG image. The app will work without icons, but they enhance the PWA experience.

