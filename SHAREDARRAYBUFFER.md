# SharedArrayBuffer Configuration for Zoom Video SDK

## What is SharedArrayBuffer?

SharedArrayBuffer is a JavaScript feature that allows multiple threads to share memory. For Zoom Video SDK, it enables:

✅ **720p WebAssembly video** (high quality)  
✅ **Background noise suppression** (WebAssembly audio)  
✅ **Virtual backgrounds** (Firefox/Safari - desktop only)  
✅ **Better performance** and advanced features  

## Required HTTP Headers

To enable SharedArrayBuffer, your server **MUST** set these two HTTP headers:

```
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
```

## Configuration Files Updated

### 1. **Vite Dev Server** (`vite.config.js`)
```javascript
server: {
  headers: {
    'Cross-Origin-Opener-Policy': 'same-origin',
    'Cross-Origin-Embedder-Policy': 'require-corp',
  },
}
```
This enables SharedArrayBuffer during development (`npm run dev`).

### 2. **Express Server** (`server/index.js`)
```javascript
app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
  next();
});
```
This enables SharedArrayBuffer in production.

## Testing SharedArrayBuffer

### Option 1: Visit Test Page
After starting your dev server:
```bash
cd client
npm run dev
```

Then visit: `http://localhost:5173/test-sharedarraybuffer.html`

This page will show you:
- ✅ Whether SharedArrayBuffer is enabled
- 💻 Your CPU core count
- 🌐 Browser information
- 📋 What features are available

### Option 2: Browser Console Test
Open your browser console (F12) and run:
```javascript
console.log('SharedArrayBuffer available:', typeof SharedArrayBuffer !== 'undefined');
```

If it shows `true`, you're good to go!

## Video Quality Levels

| Quality | Requirements | SharedArrayBuffer |
|---------|-------------|-------------------|
| **1080p** | 8+ CPU cores, GPU, WebAssembly | ✅ Required |
| **720p (WebAssembly)** | 4+ CPU cores, WebAssembly | ✅ Required |
| **720p (WebRTC)** | WebRTC support | ❌ Not required |
| **360p** | Basic browser support | ❌ Not required |

## Supported Browsers

✅ Chrome/Edge (Windows, macOS, Android, iOS, ChromeOS)  
✅ Safari (macOS)  
✅ Mobile Safari/WebKit (iOS)  
✅ Firefox (Desktop)  

## Troubleshooting

### SharedArrayBuffer not available?

1. **Check HTTP headers**: Visit the test page or check Network tab in DevTools
2. **Restart dev server**: After changing `vite.config.js`, restart with `npm run dev`
3. **Clear browser cache**: Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
4. **Check browser version**: Ensure you're using a modern browser

### Common Issues

**Issue**: SharedArrayBuffer shows as `undefined`  
**Solution**: The HTTP headers are not being set. Check server configuration.

**Issue**: Works in dev but not in production  
**Solution**: Ensure your production server (Express/Nginx/Apache) sets the headers.

**Issue**: CORS errors with external resources  
**Solution**: External resources (images, fonts, scripts) must also have appropriate CORS headers or be from same origin.

## Production Deployment

When deploying to production, ensure:

1. ✅ Your web server sets the required headers
2. ✅ All external resources have CORS headers
3. ✅ HTTPS is enabled (required by some browsers)

### Nginx Example
```nginx
add_header Cross-Origin-Opener-Policy "same-origin";
add_header Cross-Origin-Embedder-Policy "require-corp";
```

### Apache Example
```apache
Header set Cross-Origin-Opener-Policy "same-origin"
Header set Cross-Origin-Embedder-Policy "require-corp"
```

## Learn More

- [Zoom Video SDK Documentation](https://developers.zoom.us/docs/video-sdk/)
- [SharedArrayBuffer on MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/SharedArrayBuffer)
- [Cross-Origin Isolation Guide](https://web.dev/cross-origin-isolation-guide/)
