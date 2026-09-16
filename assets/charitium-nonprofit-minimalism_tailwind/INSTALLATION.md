# Tailwind Template Installation Guide

Pure HTML templates with Tailwind CSS. No build step required — just open and customize.

---

## Prerequisites

All you need is:

- A web browser (Chrome, Firefox, Safari, or Edge)
- A text editor (VS Code, Sublime Text, or even Notepad)

That's it! No Node.js, npm, or command line required.

---

## Installation Steps

### Step 1: Download Your Template

After downloading, extract the `.zip` file to any folder on your computer:

**Package Contents:**
- `index.html` — Homepage
- `about.html`, `contact.html`, etc. — Additional pages
- `tailwind.config.js` — Tailwind CSS configuration
- `style.css` — Custom styles (if any)
- `scripts.js` — Custom JavaScript (if any)

> **Note:** Tailwind CSS is loaded via CDN in each HTML file. No build step required.

### Step 2: Open in Browser

Simply double-click any `.html` file to open it in your browser. Or drag the file into your browser window.

The template loads Tailwind CSS from CDN, so you need an internet connection.

### Step 3: Edit and Customize

Open any HTML file in your text editor and start customizing:

**Edit `index.html`:**
```html
<!-- Example: Change the hero title -->
<h1 class="text-4xl font-bold text-white">
  Your Business Name Here
</h1>

<!-- Example: Change button color -->
<button class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3">
  Get Started
</button>
```

Save the file and refresh your browser to see changes instantly.

---

## Local Server (Optional)

For a better development experience with auto-refresh, use a local server.

### Option 1: VS Code Live Server

1. Install the [Live Server extension](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer)
2. Open your template folder in VS Code
3. Right-click `index.html` → "Open with Live Server"

Changes auto-refresh in the browser!

### Option 2: Python (if installed)

```bash
# Navigate to template folder
cd ~/Downloads/my-template

# Start server (Python 3)
python -m http.server 8000

# Or Python 2
python -m SimpleHTTPServer 8000
```

Then open [http://localhost:8000](http://localhost:8000/)

### Option 3: npx (if Node.js installed)

```bash
# No installation needed
npx serve

# Or with live-server for auto-refresh
npx live-server
```

---

## Customization Tips

### Changing Colors

Tailwind uses a color palette. Replace color classes throughout:

```html
<!-- Blue theme -->
<div class="bg-blue-600 text-blue-100">

<!-- Green theme -->
<div class="bg-green-600 text-green-100">

<!-- Custom colors via CDN config -->
<script>
  tailwind.config = {
    theme: {
      extend: {
        colors: {
          brand: '#ff6b35',
        }
      }
    }
  }
</script>
```

### Changing Fonts

Add Google Fonts and configure Tailwind:

```html
<!-- In <head> -->
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">

<script>
  tailwind.config = {
    theme: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    }
  }
</script>
```

### Replacing Images

Simply replace files in the `assets/` folder with your own images, keeping the same filenames. Or update the src attributes:

```html
<!-- Original -->
<img src="assets/hero-image.jpg" alt="Hero">

<!-- Your image -->
<img src="assets/your-photo.jpg" alt="Your Photo">
```

---

## Deployment Options

### Option 1: Netlify Drop (Easiest)

1. Go to [netlify.com/drop](https://app.netlify.com/drop)
2. Drag and drop your entire template folder
3. Done! Your site is live instantly

Free hosting with a .netlify.app domain!

### Option 2: GitHub Pages (Free)

1. Create a GitHub repository
2. Upload your template files
3. Go to Settings → Pages
4. Select "main" branch and click Save

Your site will be at `username.github.io/repo-name`

### Option 3: Traditional Web Hosting

Upload via FTP to any web host:

1. Connect to your host via FTP (FileZilla, Cyberduck)
2. Upload all files to `public_html` or `www` folder
3. Your site is live at your domain!

---

## Upgrading to Production Tailwind

For production sites with better performance, consider migrating from CDN to a build process:

- **Smaller file sizes** — Only includes CSS you actually use
- **Better caching** — CSS is bundled with your site
- **Works offline** — No CDN dependency

Check out our [React](https://freestacktemplates.io/docs/install/react), [Next.js](https://freestacktemplates.io/docs/install/nextjs), [Vue](https://freestacktemplates.io/docs/install/vue), or [SvelteKit](https://freestacktemplates.io/docs/install/svelte) guides for production-ready setups.

---

## Troubleshooting

### Styles not loading
Make sure you have an internet connection — the template loads Tailwind from CDN. Check that this line is in your HTML `<head>`:

```html
<script src="https://cdn.tailwindcss.com"></script>
```

### Images not showing
Check that the image paths are correct. If opening via `file://`, paths should be relative:

```html
<!-- Correct -->
<img src="assets/image.jpg">
<img src="./assets/image.jpg">

<!-- Won't work -->
<img src="/assets/image.jpg">
```

### Dark mode not working
Ensure the HTML element has the `dark` class and Tailwind is configured:

```html
<html class="dark">
<head>
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      darkMode: 'class'
    }
  </script>
</head>
```

### Custom classes not working
For custom utilities, add them to the Tailwind config:

```html
<script>
  tailwind.config = {
    theme: {
      extend: {
        spacing: {
          '128': '32rem',
        }
      }
    }
  }
</script>
```

---

## Next Steps

### Learn Tailwind CSS
- [Official Documentation](https://tailwindcss.com/docs)
- [Utility-First Fundamentals](https://tailwindcss.com/docs/utility-first)
- [Responsive Design](https://tailwindcss.com/docs/responsive-design)

### Useful Tools
- [Tailwind Play (Online Editor)](https://play.tailwindcss.com/)
- [Tailwind UI Components](https://tailwindui.com/components)
- [Heroicons (Free Icons)](https://heroicons.com/)

---
