const settings = document.querySelector('#settings');
const player = document.querySelector('#player');
const videoUrl = document.querySelector('#video-url');
const alwaysOnTop = document.querySelector('#always-on-top');
const opacity = document.querySelector('#opacity');
const opacityValue = document.querySelector('#opacity-value');
const urlError = document.querySelector('#url-error');

const defaultVideo = 'https://www.youtube.com/embed/hJcv2nZ8x84?autoplay=1&mute=1&controls=0&disablekb=1&loop=1&playlist=hJcv2nZ8x84&rel=0&origin=http%3A%2F%2F127.0.0.1';

function youtubeEmbedUrl(value) {
  try {
    const url = new URL(value);
    if (!['www.youtube.com', 'youtube.com', 'youtu.be'].includes(url.hostname)) return null;
    let id = url.searchParams.get('v');
    if (url.hostname === 'youtu.be') id = url.pathname.slice(1);
    if (url.pathname.startsWith('/embed/')) id = url.pathname.split('/')[2];
    if (!id || !/^[\w-]{6,}$/.test(id)) return null;
    return `https://www.youtube.com/embed/${encodeURIComponent(id)}?autoplay=1&mute=1&controls=0&disablekb=1&loop=1&playlist=${encodeURIComponent(id)}&rel=0&origin=${encodeURIComponent(location.origin)}`;
  } catch {
    return null;
  }
}

function toggleSettings() {
  settings.hidden = !settings.hidden;
  if (!settings.hidden) videoUrl.focus();
}

document.querySelector('#close-settings').addEventListener('click', toggleSettings);
document.querySelector('#apply-video').addEventListener('click', () => {
  const embedUrl = youtubeEmbedUrl(videoUrl.value.trim());
  if (embedUrl) {
    player.src = embedUrl;
    localStorage.setItem('videoUrl', videoUrl.value.trim());
    urlError.hidden = true;
  } else {
    urlError.hidden = false;
  }
});
alwaysOnTop.addEventListener('change', () => window.overlay.setAlwaysOnTop(alwaysOnTop.checked));
opacity.addEventListener('input', async () => {
  const value = await window.overlay.setOpacity(Number(opacity.value) / 100);
  opacityValue.value = `${Math.round(value * 100)}%`;
});
window.overlay.onToggleSettings(toggleSettings);

const savedUrl = localStorage.getItem('videoUrl');
videoUrl.value = savedUrl || '';
if (savedUrl) {
  const embedUrl = youtubeEmbedUrl(savedUrl);
  if (embedUrl) player.src = embedUrl;
}
