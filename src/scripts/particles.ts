// Soft drifting flour dust on a canvas. Pauses when off-screen or the tab is hidden.
interface Mote {
  x: number;
  y: number;
  r: number;
  vx: number;
  vy: number;
  a: number;
  phase: number;
}

export function initDust(canvas: HTMLCanvasElement): () => void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return () => {};

  const small = matchMedia('(max-width: 700px)').matches;
  const dpr = Math.min(window.devicePixelRatio || 1, small ? 1.5 : 2);
  let width = 0;
  let height = 0;
  let motes: Mote[] = [];
  let color = '255, 255, 255';
  let frame = 0;
  let running = false;
  let visible = true;

  const readColor = () => {
    color = getComputedStyle(document.documentElement).getPropertyValue('--dust').trim() || color;
  };

  const spawn = (anywhere: boolean): Mote => ({
    x: Math.random() * width,
    y: anywhere ? Math.random() * height : height + 10,
    r: 0.6 + Math.random() * (small ? 1.8 : 2.4),
    vx: (Math.random() - 0.5) * 0.25,
    vy: -(0.08 + Math.random() * 0.32),
    a: 0.25 + Math.random() * 0.55,
    phase: Math.random() * Math.PI * 2,
  });

  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.max(14, Math.min(40, Math.round((width * height) / 16000)));
    motes = Array.from({ length: count }, () => spawn(true));
  };

  const draw = (t: number) => {
    ctx.clearRect(0, 0, width, height);
    for (const m of motes) {
      m.x += m.vx + Math.sin(t / 1800 + m.phase) * 0.18;
      m.y += m.vy;
      if (m.y < -10 || m.x < -10 || m.x > width + 10) Object.assign(m, spawn(false));
      ctx.beginPath();
      ctx.fillStyle = `rgba(${color}, ${m.a})`;
      ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
      ctx.fill();
    }
    frame = requestAnimationFrame(draw);
  };

  const start = () => {
    if (running || !visible || document.hidden) return;
    running = true;
    frame = requestAnimationFrame(draw);
  };
  const stop = () => {
    running = false;
    cancelAnimationFrame(frame);
  };

  const io = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    visible ? start() : stop();
  });
  io.observe(canvas);

  const onVisibility = () => (document.hidden ? stop() : start());
  document.addEventListener('visibilitychange', onVisibility);
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  const onTheme = () => requestAnimationFrame(readColor);
  window.addEventListener('pp:theme', onTheme);

  readColor();
  resize();
  start();

  return () => {
    stop();
    io.disconnect();
    ro.disconnect();
    document.removeEventListener('visibilitychange', onVisibility);
    window.removeEventListener('pp:theme', onTheme);
    ctx.clearRect(0, 0, width, height);
  };
}
