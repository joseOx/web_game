export class AssetLoader {
  constructor() {
    this._images  = new Map();
    this._audio   = new Map();
    this._json    = new Map();
    this._audioCtx = null;  // injected by AudioSystem when ready
  }

  setAudioContext(ctx) {
    this._audioCtx = ctx;
  }

  // --- Images ---

  async loadImage(key, url) {
    if (this._images.has(key)) return this._images.get(key);
    const img = await this._fetchImage(url);
    this._images.set(key, img);
    return img;
  }

  getImage(key) {
    return this._images.get(key) ?? null;
  }

  _fetchImage(url) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload  = () => resolve(img);
      img.onerror = () => reject(new Error(`AssetLoader: failed to load image "${url}"`));
      img.src = url;
    });
  }

  // --- Audio buffers (decoded via Web Audio API) ---

  async loadAudio(key, url) {
    if (this._audio.has(key)) return this._audio.get(key);
    if (!this._audioCtx) throw new Error('AssetLoader: AudioContext not set. Call setAudioContext() first.');
    const buffer = await this._fetchAudio(url);
    this._audio.set(key, buffer);
    return buffer;
  }

  getAudio(key) {
    return this._audio.get(key) ?? null;
  }

  async _fetchAudio(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`AssetLoader: failed to fetch audio "${url}" (${res.status})`);
    const raw = await res.arrayBuffer();
    return this._audioCtx.decodeAudioData(raw);
  }

  // --- JSON ---

  async loadJSON(key, url) {
    if (this._json.has(key)) return this._json.get(key);
    const res = await fetch(url);
    if (!res.ok) throw new Error(`AssetLoader: failed to fetch JSON "${url}" (${res.status})`);
    const data = await res.json();
    this._json.set(key, data);
    return data;
  }

  getJSON(key) {
    return this._json.get(key) ?? null;
  }

  // --- Batch loading ---

  // manifest: { images: [{key, url}], audio: [{key, url}], json: [{key, url}] }
  // Returns { loaded, total, errors[] }
  async loadManifest(manifest, onProgress = null) {
    const tasks = [];

    for (const { key, url } of (manifest.images ?? [])) {
      tasks.push({ type: 'image', key, url });
    }
    for (const { key, url } of (manifest.audio ?? [])) {
      tasks.push({ type: 'audio', key, url });
    }
    for (const { key, url } of (manifest.json ?? [])) {
      tasks.push({ type: 'json', key, url });
    }

    const total  = tasks.length;
    let   loaded = 0;
    const errors = [];

    await Promise.allSettled(
      tasks.map(async task => {
        try {
          if (task.type === 'image') await this.loadImage(task.key, task.url);
          if (task.type === 'audio') await this.loadAudio(task.key, task.url);
          if (task.type === 'json')  await this.loadJSON(task.key,  task.url);
        } catch (err) {
          errors.push({ key: task.key, url: task.url, error: err.message });
        }
        loaded++;
        onProgress?.({ loaded, total, percent: (loaded / total) * 100 });
      })
    );

    return { loaded, total, errors };
  }

  destroy() {
    this._images.clear();
    this._audio.clear();
    this._json.clear();
  }
}
