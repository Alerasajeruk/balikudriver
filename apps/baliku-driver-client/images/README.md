# Login Logo Image

## Instructions

1. **Place your logo image here** in this `images` folder
2. **Name it**: `logo.png` (or update the CSS path if using a different name)
3. **Recommended image specifications**:
   - **Format**: PNG (with transparency) or JPG
   - **Size**: 200-400px width (height will auto-adjust)
   - **Aspect Ratio**: Any (will be contained within the header)
   - **Background**: Transparent PNG recommended for best results

## Current CSS Path

The CSS is configured to load: `../images/logo.png`

If you want to use a different filename or path, update this line in `styles/main.css`:

```css
background-image:url('../images/logo.png');
```

## Alternative Paths

You can also use:
- `url('/images/logo.png')` - Absolute path from root
- `url('images/logo.png')` - Relative to CSS file location
- `url('https://yourdomain.com/logo.png')` - External URL

## Image Display Settings

Current settings in CSS:
- `background-size: contain` - Logo will fit within header without cropping
- `background-position: center` - Logo centered horizontally and vertically
- `background-repeat: no-repeat` - Logo appears once

To change logo size, modify `background-size` in CSS:
- `contain` - Fits entire logo (current)
- `cover` - Fills entire header (may crop)
- `200px auto` - Specific width (e.g., 200px wide)
- `80%` - Percentage of header width

