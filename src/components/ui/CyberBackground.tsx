'use client';

import { useEffect, useRef } from 'react';

type Node = { x: number; y: number; vx: number; vy: number };

const LINK_DISTANCE = 150;
const MOUSE_RADIUS = 180;
const NODE_SPEED = 0.15;
const DENSITY = 18000; // px² per node
const MIN_NODES = 20;
const MAX_NODES = 80;

/**
 * Fixed, site-wide ambient backdrop: a field of drifting nodes that link to
 * nearby neighbours and to the cursor, evoking a neural network / data-flow
 * motif for a Computer Science & AI theme.
 *
 * Canvas + rAF rather than CSS/SVG — nodes reacting to the mouse needs a
 * per-frame loop that CSS animations can't drive. The loop pauses outright
 * under `prefers-reduced-motion` (draws one static frame instead) and while
 * the tab is hidden, so it never spends a cycle nobody can see.
 */
export function CyberBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvasEl = canvasRef.current;
    const context = canvasEl?.getContext('2d');
    if (!canvasEl || !context) return;

    // Rebind to plain consts so nested closures below capture the
    // already-narrowed (non-null) types instead of the nullable refs.
    const canvas: HTMLCanvasElement = canvasEl;
    const ctx: CanvasRenderingContext2D = context;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let width = 0;
    let height = 0;
    let nodes: Node[] = [];
    let mouse: { x: number; y: number } | null = null;
    let raf = 0;

    let lineColor = 'rgba(167, 99, 133, 0.35)';
    let nodeColor = 'rgba(167, 99, 133, 0.6)';

    function readColors() {
      const styles = getComputedStyle(document.documentElement);
      lineColor = styles.getPropertyValue('--circuit').trim() || lineColor;
      nodeColor = styles.getPropertyValue('--circuit-strong').trim() || nodeColor;
    }

    function seedNodes() {
      const count = Math.max(MIN_NODES, Math.min(MAX_NODES, Math.round((width * height) / DENSITY)));
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * NODE_SPEED,
        vy: (Math.random() - 0.5) * NODE_SPEED,
      }));
    }

    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seedNodes();
    }

    function onPointerMove(e: PointerEvent) {
      mouse = { x: e.clientX, y: e.clientY };
    }
    function onPointerLeave() {
      mouse = null;
    }

    /** One frame: optionally advance positions, then paint. */
    function draw(advance: boolean) {
      if (advance) {
        for (const n of nodes) {
          n.x += n.vx;
          n.y += n.vy;
          if (n.x < 0 || n.x > width) n.vx *= -1;
          if (n.y < 0 || n.y > height) n.vy *= -1;
        }
      }

      ctx.clearRect(0, 0, width, height);
      ctx.lineWidth = 1;

      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        if (!a) continue;

        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          if (!b) continue;
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist >= LINK_DISTANCE) continue;

          ctx.globalAlpha = (1 - dist / LINK_DISTANCE) * 0.5;
          ctx.strokeStyle = lineColor;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }

        if (mouse) {
          const dx = a.x - mouse.x;
          const dy = a.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < MOUSE_RADIUS) {
            ctx.globalAlpha = (1 - dist / MOUSE_RADIUS) * 0.85;
            ctx.strokeStyle = nodeColor;
            ctx.lineWidth = 1.3;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.stroke();
            ctx.lineWidth = 1;
          }
        }
      }

      ctx.globalAlpha = 0.85;
      ctx.fillStyle = nodeColor;
      for (const n of nodes) {
        ctx.beginPath();
        ctx.arc(n.x, n.y, 1.6, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    function loop() {
      draw(true);
      raf = requestAnimationFrame(loop);
    }

    function stop() {
      cancelAnimationFrame(raf);
      raf = 0;
    }

    function onVisibilityChange() {
      if (document.hidden) {
        stop();
      } else if (!reduceMotion) {
        loop();
      }
    }

    readColors();
    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerleave', onPointerLeave);
    document.addEventListener('visibilitychange', onVisibilityChange);

    const themeObserver = new MutationObserver(readColors);
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    // Always paint one static frame up front — a tab can technically be
    // `document.hidden` for an instant during initial load (e.g. opened in
    // the background), and the canvas should never sit blank waiting for a
    // visibility event that might not come for a while.
    draw(false);
    if (!reduceMotion && !document.hidden) {
      loop();
    }

    return () => {
      stop();
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerleave', onPointerLeave);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      themeObserver.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10"
    />
  );
}
