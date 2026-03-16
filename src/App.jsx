import React, { useState, useEffect, useCallback, useRef } from "react";

const ANTHROPIC_MODEL = "claude-sonnet-4-20250514";

// ── Rothko / Albers Design System ────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Unbounded:wght@400;600;700&family=Outfit:wght@300;400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    /* Albers / Rothko — bold saturated fields, no gradients */
    --ochre:        #C87941;
    --ochre-dark:   #7C4A1E;
    --cerulean:     #1A4B7C;
    --cerulean-mid: #2563AB;
    --vermillion:   #B83A2B;
    --crimson:      #7A1F1F;
    --forest:       #1B5C3A;
    --sage-mid:     #2E7D54;
    --plum:         #5C2D6E;
    --plum-mid:     #7B3F8C;
    --slate:        #1E3448;
    --slate-mid:    #2C4A63;
    --amber:        #A8780A;
    --amber-mid:    #C99B1A;
    --deep-violet:  #2D1B5E;
    --violet-mid:   #4A2F8A;
    --ink:          #0A0A0A;
    --paper:        #F4EFE6;
    --white:        #FAFAF7;
    --t: 0.22s cubic-bezier(0.4,0,0.2,1);
  }

  html, body {
    height: 100%;
    overflow: hidden;
    background: var(--ink);
  }
  body {
    font-family: 'Outfit', sans-serif;
    -webkit-font-smoothing: antialiased;
    color: var(--white);
  }

  /* ── Shell ── */
  .shell {
    display: flex;
    flex-direction: column;
    height: 100vh;
    max-width: 430px;
    margin: 0 auto;
    position: relative;
    overflow: hidden;
    background: var(--ink);
  }

  /* ── Header ── */
  .hdr {
    flex-shrink: 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px 12px;
    background: var(--ink);
    z-index: 20;
    position: relative;
  }
  .hdr-left { display: flex; align-items: baseline; gap: 10px; }
  .hdr-logo {
    font-family: 'Unbounded', sans-serif;
    font-size: 1.3rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    color: var(--white);
    line-height: 1;
    text-transform: uppercase;
  }
  .hdr-tab-name {
    font-size: 0.65rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.38);
    font-weight: 400;
    padding-bottom: 2px;
    transition: var(--t);
  }
  .hdr-right { text-align: right; }
  .hdr-time {
    font-family: 'Outfit', sans-serif;
    font-size: 1.1rem;
    font-weight: 500;
    color: rgba(255,255,255,0.75);
    line-height: 1;
  }
  .hdr-date {
    font-size: 0.6rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.3);
    margin-top: 1px;
    font-weight: 300;
  }

  /* ── Tab dot indicator ── */
  .dot-row {
    display: flex;
    justify-content: center;
    gap: 5px;
    padding: 0 0 8px;
    flex-shrink: 0;
  }
  .dot {
    width: 5px; height: 5px;
    border-radius: 50%;
    background: rgba(255,255,255,0.18);
    transition: all 0.3s ease;
    cursor: pointer;
  }
  .dot.active {
    width: 18px;
    border-radius: 3px;
    background: rgba(255,255,255,0.7);
  }

  /* ── Swipe viewport ── */
  .viewport {
    flex: 1;
    overflow: hidden;
    position: relative;
    min-height: 0;
  }
  .track {
    display: flex;
    height: 100%;
    will-change: transform;
    touch-action: pan-y;
  }
  .track.animated { transition: transform 0.36s cubic-bezier(0.4,0,0.2,1); }
  .page {
    flex-shrink: 0;
    width: 100%;
    height: 100%;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
  }
  .page::-webkit-scrollbar { display: none; }

  /* ── Colour zones ── */
  .z-brief    { background: var(--ochre-dark); }
  .z-weather  { background: var(--cerulean); }
  .z-calendar { background: var(--crimson); }
  .z-shopping { background: var(--forest); }
  .z-meals    { background: var(--plum); }
  .z-holidays { background: var(--amber); }
  .z-tasks    { background: var(--slate); }
  .z-memory   { background: var(--deep-violet); }

  /* ── Bottom nav ── */
  .nav {
    flex-shrink: 0;
    display: flex;
    background: var(--ink);
    padding: 6px 0 14px;
    border-top: 1px solid rgba(255,255,255,0.07);
    z-index: 20;
  }
  .nav-btn {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 3px;
    padding: 5px 2px;
    border: none;
    background: transparent;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
    transition: var(--t);
  }
  .nav-pip {
    width: 32px; height: 32px;
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    font-size: 1rem;
    transition: var(--t);
  }
  .nav-btn.active .nav-pip { background: rgba(255,255,255,0.14); }
  .nav-lbl {
    font-size: 0.5rem;
    font-weight: 500;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.28);
    transition: var(--t);
    font-family: 'Outfit', sans-serif;
  }
  .nav-btn.active .nav-lbl { color: rgba(255,255,255,0.8); }

  /* ── Inner page padding ── */
  .inner { padding: 18px 16px 40px; }

  /* ── Typography ── */
  .t-display {
    font-family: 'Unbounded', sans-serif;
    font-size: 1.9rem;
    font-weight: 700;
    color: var(--white);
    line-height: 1.05;
    letter-spacing: -0.01em;
  }
  .t-title {
    font-family: 'Unbounded', sans-serif;
    font-size: 1.05rem;
    font-weight: 600;
    color: var(--white);
    margin-bottom: 14px;
    letter-spacing: 0.01em;
  }
  .t-label {
    font-size: 0.6rem;
    font-weight: 500;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.45);
    margin-bottom: 6px;
  }
  .t-body { font-size: 0.85rem; line-height: 1.65; color: rgba(255,255,255,0.82); font-weight: 300; }
  .t-light { color: rgba(255,255,255,0.42); }

  /* ── Cards ── */
  .card {
    background: rgba(0,0,0,0.28);
    border-radius: 6px;
    padding: 16px;
    margin-bottom: 10px;
    border: 1px solid rgba(255,255,255,0.09);
  }
  .card-sm {
    background: rgba(0,0,0,0.22);
    border-radius: 6px;
    padding: 12px;
    border: 1px solid rgba(255,255,255,0.07);
  }

  /* ── Widget grid (legacy — kept for other tabs) ── */
  .w-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 10px; }
  .widget {
    background: rgba(0,0,0,0.3); border-radius: 6px;
    padding: 14px 12px; border: 1px solid rgba(255,255,255,0.08);
    position: relative; overflow: hidden;
  }
  .widget-tap { cursor: pointer; transition: var(--t); }
  .widget-tap:active { transform: scale(0.97); background: rgba(0,0,0,0.4); }
  .widget-val { font-family: 'Unbounded', sans-serif; font-size: 1.9rem; font-weight: 700; line-height: 1; color: var(--white); margin-bottom: 4px; }
  .widget-sub { font-size: 0.72rem; color: rgba(255,255,255,0.55); line-height: 1.4; }
  .widget-body { font-size: 0.78rem; color: rgba(255,255,255,0.72); line-height: 1.5; }

  /* ── Brief / Home screen ── */
  .brief-wrap { padding: 16px 16px 40px; display: flex; flex-direction: column; gap: 12px; }

  /* Greeting banner */
  .brief-banner {
    border-radius: 20px;
    background: rgba(0,0,0,0.38);
    border: 1px solid rgba(255,255,255,0.1);
    padding: 22px 20px 18px;
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
  }
  .brief-greeting-row { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 14px; }
  .brief-greet {
    font-family: 'Unbounded', sans-serif;
    font-size: 1.35rem;
    font-weight: 600;
    color: var(--white);
    line-height: 1.25;
    flex: 1;
  }
  .brief-refresh {
    width: 32px; height: 32px; border-radius: 50%;
    background: rgba(255,255,255,0.12);
    border: 1px solid rgba(255,255,255,0.18);
    color: rgba(255,255,255,0.7);
    font-size: 0.95rem;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; flex-shrink: 0; margin-left: 10px; margin-top: 4px;
    transition: var(--t);
  }
  .brief-refresh:active { background: rgba(255,255,255,0.22); transform: scale(0.92); }
  .brief-date {
    font-size: 0.62rem; letter-spacing: 0.1em; text-transform: uppercase;
    color: rgba(255,255,255,0.35); margin-bottom: 14px;
  }
  .brief-body {
    font-size: 0.88rem; line-height: 1.78;
    color: rgba(255,255,255,0.82);
    font-weight: 300; white-space: pre-wrap;
  }

  /* iOS-style widget row */
  .brief-widgets { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  .bw {
    border-radius: 18px;
    background: rgba(0,0,0,0.38);
    border: 1px solid rgba(255,255,255,0.09);
    padding: 14px 14px 12px;
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    min-height: 94px;
    display: flex; flex-direction: column; justify-content: space-between;
  }
  .bw-tap { cursor: pointer; transition: var(--t); }
  .bw-tap:active { transform: scale(0.96); opacity: 0.85; }
  .bw-label {
    font-size: 0.58rem; font-weight: 600; letter-spacing: 0.1em;
    text-transform: uppercase; color: rgba(255,255,255,0.4); margin-bottom: 6px;
  }
  .bw-val {
    font-family: 'Unbounded', sans-serif;
    font-size: 2rem; line-height: 1; color: var(--white); font-weight: 700;
  }
  .bw-sub { font-size: 0.72rem; color: rgba(255,255,255,0.5); line-height: 1.4; margin-top: 4px; }
  .bw-body { font-size: 0.78rem; color: rgba(255,255,255,0.75); line-height: 1.5; }
  .bw-arrow { font-size: 0.62rem; color: rgba(255,255,255,0.25); margin-top: 6px; }

  /* ── Inputs ── */
  .inp {
    width: 100%;
    border: 1px solid rgba(255,255,255,0.18);
    border-radius: 4px;
    padding: 10px 12px;
    font-family: 'Outfit', sans-serif;
    font-size: 0.85rem;
    background: rgba(0,0,0,0.25);
    color: var(--white);
    outline: none;
    transition: var(--t);
    margin-bottom: 8px;
  }
  .inp::placeholder { color: rgba(255,255,255,0.28); }
  .inp:focus { border-color: rgba(255,255,255,0.45); background: rgba(0,0,0,0.35); }
  select.inp { cursor: pointer; }

  /* ── Buttons ── */
  .btn {
    padding: 9px 16px;
    border-radius: 4px;
    border: none;
    font-family: 'Outfit', sans-serif;
    font-size: 0.82rem;
    font-weight: 500;
    cursor: pointer;
    transition: var(--t);
    letter-spacing: 0.02em;
    white-space: nowrap;
  }
  .btn-white { background: rgba(255,255,255,0.92); color: var(--ink); }
  .btn-white:active { opacity: 0.85; }
  .btn-ghost { background: rgba(255,255,255,0.1); color: rgba(255,255,255,0.8); border: 1px solid rgba(255,255,255,0.18); }
  .btn-ghost:active { background: rgba(255,255,255,0.18); }
  .btn-sm { padding: 6px 12px; font-size: 0.74rem; }
  .btn-row { display: flex; gap: 7px; justify-content: flex-end; margin-top: 8px; }
  .frm-row { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }

  /* ── List rows ── */
  .row {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 0;
    border-bottom: 1px solid rgba(255,255,255,0.08);
    font-size: 0.85rem; color: rgba(255,255,255,0.85);
  }
  .row:last-child { border-bottom: none; }
  .row-del {
    background: none; border: none; cursor: pointer;
    color: rgba(255,255,255,0.25); font-size: 1.1rem;
    padding: 0 2px; line-height: 1; flex-shrink: 0;
    transition: var(--t);
  }
  .row-del:active { color: rgba(255,255,255,0.6); }

  /* ── Pill filters ── */
  .pills { display: flex; gap: 5px; flex-wrap: wrap; margin-bottom: 12px; }
  .pill {
    padding: 5px 11px; border-radius: 20px;
    border: 1px solid rgba(255,255,255,0.18);
    background: transparent;
    font-family: 'Outfit', sans-serif; font-size: 0.7rem; font-weight: 500;
    color: rgba(255,255,255,0.45); cursor: pointer; transition: var(--t);
    letter-spacing: 0.03em;
  }
  .pill.on { background: rgba(255,255,255,0.88); color: var(--ink); border-color: transparent; }

  /* ── Dot priority ── */
  .pdot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
  .ph { background: #FF6B6B; }
  .pm { background: #FFD93D; }
  .pl { background: rgba(255,255,255,0.3); }

  /* ── Calendar ── */
  .cal-grid { display: grid; grid-template-columns: repeat(7,1fr); gap: 2px; margin-bottom: 12px; }
  .cal-dow {
    text-align: center; font-size: 0.58rem; font-weight: 500;
    color: rgba(255,255,255,0.35); text-transform: uppercase;
    letter-spacing: 0.06em; padding: 4px 0;
  }
  .cal-day {
    aspect-ratio: 1; display: flex; align-items: center; justify-content: center;
    border-radius: 4px; cursor: pointer; font-size: 0.78rem;
    color: rgba(255,255,255,0.75); transition: var(--t); position: relative;
  }
  .cal-day:active:not(.empty) { transform: scale(0.88); }
  .cal-day.today { background: rgba(255,255,255,0.92); color: var(--ink); font-weight: 700; }
  .cal-day.sel:not(.today) { background: rgba(255,255,255,0.18); }
  .cal-day.has-ev::after {
    content:''; width:4px; height:4px; border-radius:50%;
    background: rgba(255,255,255,0.8); position:absolute; bottom:3px;
  }
  .cal-day.today.has-ev::after { background: var(--vermillion); }
  .cal-day.other { color: rgba(255,255,255,0.18); }
  .cal-day.empty { cursor:default; }
  .ev-item {
    display:flex; align-items:center; gap:9px;
    padding: 9px 11px; border-radius:4px;
    background: rgba(0,0,0,0.2); margin-bottom:5px; font-size:0.82rem;
    color: rgba(255,255,255,0.85);
  }
  .ev-dot { width:6px; height:6px; border-radius:50%; flex-shrink:0; }
  .ev-dot.joe { background: rgba(255,255,255,0.85); }
  .ev-dot.alice { background: rgba(255,255,255,0.5); }
  .ev-dot.both { background: rgba(255,255,255,0.7); }
  .ev-name { flex:1; }
  .ev-time { font-size:0.7rem; color:rgba(255,255,255,0.4); }

  /* ── Shopping ── */
  .sh-row {
    display:flex; align-items:center; gap:9px;
    padding:9px 0; border-bottom:1px solid rgba(255,255,255,0.08);
    font-size:0.84rem; color:rgba(255,255,255,0.85);
  }
  .sh-row:last-child { border-bottom:none; }
  .sh-row input[type=checkbox] { width:16px; height:16px; accent-color:rgba(255,255,255,0.85); cursor:pointer; flex-shrink:0; }
  .sh-done { text-decoration:line-through; color:rgba(255,255,255,0.3); }
  .sh-qty { font-size:0.7rem; color:rgba(255,255,255,0.38); flex-shrink:0; }
  .sh-cat { font-size:0.58rem; text-transform:uppercase; letter-spacing:0.1em; color:rgba(255,255,255,0.35); font-weight:500; margin:10px 0 4px; }

  /* ── Meals ── */
  .meals-wrap { padding: 0 0 40px; }
  .meals-header {
    padding: 16px 16px 12px;
    display: flex; align-items: center; justify-content: space-between;
  }
  .meals-title {
    font-family: 'Unbounded', sans-serif;
    font-size: 1.2rem; font-weight: 700; color: var(--white);
    letter-spacing: -0.01em;
  }

  /* Search bar — iOS style */
  .meals-search-bar {
    margin: 0 16px 14px;
    background: rgba(0,0,0,0.35);
    border-radius: 12px;
    border: 1px solid rgba(255,255,255,0.1);
    padding: 10px 14px;
    display: flex; align-items: center; gap: 10px;
  }
  .meals-search-bar input {
    flex: 1; background: none; border: none; outline: none;
    font-family: 'Outfit', sans-serif; font-size: 0.9rem;
    color: var(--white); font-weight: 400;
  }
  .meals-search-bar input::placeholder { color: rgba(255,255,255,0.3); }
  .meals-search-icon { font-size: 0.9rem; color: rgba(255,255,255,0.35); flex-shrink: 0; }

  /* Find button — iOS blue pill */
  .meals-find-btn {
    display: block; width: calc(100% - 32px); margin: 0 16px 16px;
    background: rgba(96,165,250,0.22);
    border: 1px solid rgba(96,165,250,0.35);
    color: #93c5fd;
    border-radius: 12px; padding: 13px;
    font-family: 'Outfit', sans-serif; font-size: 0.9rem; font-weight: 600;
    cursor: pointer; letter-spacing: 0.01em; transition: var(--t);
    text-align: center;
  }
  .meals-find-btn:active { background: rgba(96,165,250,0.32); transform: scale(0.98); }
  .meals-find-btn:disabled { opacity: 0.45; cursor: default; }

  /* Sources strip */
  .meals-src-strip {
    display: flex; gap: 8px; overflow-x: auto;
    padding: 0 16px 12px; scrollbar-width: none;
  }
  .meals-src-strip::-webkit-scrollbar { display: none; }
  .src-chip {
    display: flex; align-items: center; gap: 5px;
    padding: 5px 11px; border-radius: 20px; flex-shrink: 0;
    font-size: 0.72rem; font-weight: 500;
    border: 1px solid rgba(255,255,255,0.14);
    background: rgba(0,0,0,0.28); color: rgba(255,255,255,0.55);
    cursor: pointer; transition: var(--t);
  }
  .src-chip.on { background: rgba(255,255,255,0.13); color: rgba(255,255,255,0.88); border-color: rgba(255,255,255,0.25); }
  .src-chip:active { transform: scale(0.95); }

  /* Recipe list — grouped iOS table style */
  .meals-section-label {
    font-size: 0.6rem; font-weight: 600; letter-spacing: 0.1em;
    text-transform: uppercase; color: rgba(255,255,255,0.35);
    padding: 0 16px 8px; margin-top: 4px;
  }
  .meals-list { margin: 0 16px; border-radius: 16px; overflow: hidden; }
  .meal-row {
    display: flex; align-items: center; gap: 13px;
    padding: 13px 14px;
    background: rgba(0,0,0,0.32);
    border-bottom: 1px solid rgba(255,255,255,0.07);
    cursor: pointer; transition: var(--t);
  }
  .meal-row:last-child { border-bottom: none; }
  .meal-row:active { background: rgba(255,255,255,0.06); }
  .meal-row-icon {
    width: 44px; height: 44px; border-radius: 10px;
    background: rgba(255,255,255,0.1);
    display: flex; align-items: center; justify-content: center;
    font-size: 1.3rem; flex-shrink: 0;
  }
  .meal-row-body { flex: 1; min-width: 0; }
  .meal-row-title {
    font-size: 0.9rem; font-weight: 500; color: var(--white);
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    margin-bottom: 2px;
  }
  .meal-row-sub { font-size: 0.72rem; color: rgba(255,255,255,0.45); }
  .meal-row-chevron { color: rgba(255,255,255,0.2); font-size: 0.8rem; flex-shrink: 0; }
  .meal-tag {
    font-size: 0.58rem; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase;
    padding: 2px 7px; border-radius: 6px;
    background: rgba(255,255,255,0.1); color: rgba(255,255,255,0.55);
  }

  /* Detail sheet (MealChat) */
  .meal-sheet-hdr {
    padding: 16px 16px 0;
    display: flex; align-items: flex-start; gap: 12px;
    flex-shrink: 0;
  }
  .meal-sheet-back {
    display: flex; align-items: center; gap: 4px;
    font-size: 0.85rem; font-weight: 500; color: rgba(150,200,255,0.85);
    background: none; border: none; cursor: pointer; padding: 0; flex-shrink: 0;
  }
  .meal-sheet-back:active { opacity: 0.6; }
  .meal-sheet-title {
    font-family: 'Unbounded', sans-serif;
    font-size: 1.1rem; font-weight: 700; color: var(--white);
    line-height: 1.3; flex: 1;
  }
  .meal-sheet-source {
    display: inline-flex; align-items: center; gap: 5px;
    font-size: 0.68rem; font-weight: 500;
    padding: 3px 9px; border-radius: 8px;
    background: rgba(255,255,255,0.1); color: rgba(255,255,255,0.6);
    margin: 8px 16px 0; flex-shrink: 0; align-self: flex-start;
  }
  .meal-sheet-desc {
    font-size: 0.84rem; line-height: 1.65;
    color: rgba(255,255,255,0.68); padding: 10px 16px 0;
    flex-shrink: 0;
  }
  .meal-sheet-ings {
    display: flex; flex-wrap: wrap; gap: 5px;
    padding: 10px 16px; flex-shrink: 0;
  }
  .meal-link {
    margin: 2px 16px 10px;
    display: flex; align-items: center; justify-content: center; gap: 8px;
    background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.14);
    color: rgba(255,255,255,0.7); border-radius: 12px;
    padding: 11px; font-size: 0.82rem; text-decoration: none;
    transition: var(--t); flex-shrink: 0;
  }
  .meal-link:active { background: rgba(255,255,255,0.14); }
  .ing-pill {
    font-size: 0.68rem; padding: 3px 10px;
    background: rgba(255,255,255,0.1); border-radius: 20px;
    color: rgba(255,255,255,0.65);
  }

  .meal-title { font-family:'Unbounded',sans-serif; font-size:1.1rem; color:var(--white); margin-bottom:5px; line-height:1.2; }
  .meal-source { display:inline-block; font-size:0.62rem; padding:2px 7px; background:rgba(255,255,255,0.12); color:rgba(255,255,255,0.75); border-radius:3px; font-weight:500; letter-spacing:0.03em; margin-bottom:6px; }
  .meal-desc { font-size:0.79rem; color:rgba(255,255,255,0.6); line-height:1.5; }
  .meal-why  { font-size:0.7rem; color:rgba(255,255,255,0.4); font-style:italic; margin-top:5px; }

  /* ── Chat ── */
  .chat-wrap {
    flex:1; overflow-y:auto; padding:12px 14px;
    display:flex; flex-direction:column; gap:9px;
    scrollbar-width:none; min-height:0;
  }
  .chat-wrap::-webkit-scrollbar { display:none; }
  .bubble { display:flex; flex-direction:column; gap:2px; max-width:86%; }
  .bubble.u { align-self:flex-end; align-items:flex-end; }
  .bubble.a { align-self:flex-start; }
  .blbl { font-size:0.58rem; font-weight:500; text-transform:uppercase; letter-spacing:0.07em; color:rgba(255,255,255,0.32); }
  .btxt { padding:9px 12px; border-radius:10px; font-size:0.82rem; line-height:1.55; white-space:pre-wrap; }
  .bubble.u .btxt { background:rgba(255,255,255,0.88); color:var(--ink); border-radius:10px 10px 2px 10px; }
  .bubble.a .btxt { background:rgba(0,0,0,0.3); color:rgba(255,255,255,0.85); border-radius:10px 10px 10px 2px; }
  .sugg { display:flex; flex-wrap:wrap; gap:6px; padding:4px 0 6px; }
  .sugg-btn {
    background:rgba(255,255,255,0.09); border:1px solid rgba(255,255,255,0.16);
    border-radius:20px; padding:5px 11px;
    font-family:'Outfit',sans-serif; font-size:0.73rem;
    color:rgba(255,255,255,0.72); cursor:pointer; transition:var(--t);
  }
  .sugg-btn:active { background:rgba(255,255,255,0.17); }
  .chat-inp-row { padding:10px 12px; border-top:1px solid rgba(255,255,255,0.09); display:flex; gap:7px; flex-shrink:0; }
  .chat-inp {
    flex:1; border:1px solid rgba(255,255,255,0.18); border-radius:4px;
    padding:9px 12px; font-family:'Outfit',sans-serif; font-size:0.83rem;
    background:rgba(0,0,0,0.25); color:var(--white); outline:none;
  }
  .chat-inp::placeholder { color:rgba(255,255,255,0.3); }

  /* ── Holiday ── */
  .hol-card {
    display:flex; align-items:center; gap:12px;
    padding:13px; border-radius:6px;
    background:rgba(0,0,0,0.25); margin-bottom:8px;
    border:1px solid rgba(255,255,255,0.09);
  }
  .hol-emoji { font-size:1.9rem; flex-shrink:0; }
  .hol-name { font-family:'Unbounded',sans-serif; font-size:0.85rem; font-weight:600; color:var(--white); margin-bottom:1px; }
  .hol-date { font-size:0.7rem; color:rgba(255,255,255,0.4); }
  .hol-notes { font-size:0.7rem; color:rgba(255,255,255,0.35); font-style:italic; margin-top:2px; }
  .hol-num { font-family:'Unbounded',sans-serif; font-size:1.8rem; font-weight:700; color:var(--white); line-height:1; text-align:center; }
  .hol-days { font-size:0.58rem; text-transform:uppercase; letter-spacing:0.08em; color:rgba(255,255,255,0.38); text-align:center; }

  /* ── Memory ── */
  .mem-item {
    padding:10px 12px; border-radius:4px;
    background:rgba(0,0,0,0.22); margin-bottom:6px;
    border:1px solid rgba(255,255,255,0.08);
    font-size:0.82rem; color:rgba(255,255,255,0.78); line-height:1.5;
  }
  .mem-cat {
    font-size:0.56rem; text-transform:uppercase; letter-spacing:0.1em;
    color:rgba(255,255,255,0.38); font-weight:500; margin-bottom:3px;
  }

  /* ── Task ── */
  .task {
    display:flex; align-items:flex-start; gap:9px;
    padding:11px; border-radius:5px;
    background:rgba(0,0,0,0.22); margin-bottom:7px;
    border:1px solid rgba(255,255,255,0.08);
  }
  .task-name { font-size:0.84rem; color:rgba(255,255,255,0.88); font-weight:500; margin-bottom:3px; }
  .task-done { text-decoration:line-through; color:rgba(255,255,255,0.3); }
  .task-meta { display:flex; flex-wrap:wrap; gap:5px; align-items:center; }
  .task-tag {
    font-size:0.6rem; padding:1px 6px; border-radius:3px; font-weight:500;
    letter-spacing:0.04em; text-transform:uppercase;
  }

  /* ── Weather ── */
  .wx-temp {
    font-family:'Unbounded',sans-serif;
    font-size:3.8rem; line-height:1; color:var(--white);
    font-weight:700; letter-spacing:-0.02em;
  }
  .wx-cond { font-size:0.85rem; color:rgba(255,255,255,0.6); margin-top:2px; font-weight:300; }
  .wx-meta { display:flex; gap:14px; font-size:0.75rem; color:rgba(255,255,255,0.45); margin:10px 0; }
  .fc-strip { display:flex; gap:6px; margin-bottom:14px; }
  .fc-day {
    flex:1; text-align:center; padding:9px 4px;
    background:rgba(0,0,0,0.22); border-radius:4px; font-size:0.72rem;
  }
  .fc-name { color:rgba(255,255,255,0.38); font-size:0.58rem; text-transform:uppercase; letter-spacing:0.06em; margin-bottom:3px; }
  .fc-ico { font-size:1.2rem; margin:3px 0; }
  .fc-hi { color:var(--white); font-weight:500; }
  .fc-lo { color:rgba(255,255,255,0.38); }

  /* ── AI loading ── */
  .ail { display:flex; align-items:center; gap:7px; font-size:0.8rem; color:rgba(255,255,255,0.45); padding:8px 0; }
  .dots span {
    display:inline-block; width:5px; height:5px; border-radius:50%;
    background:rgba(255,255,255,0.55); animation:pulse 1.2s ease-in-out infinite; margin:0 2px;
  }
  .dots span:nth-child(2) { animation-delay:0.2s; }
  .dots span:nth-child(3) { animation-delay:0.4s; }
  @keyframes pulse { 0%,80%,100%{opacity:0.2;transform:scale(0.8);}40%{opacity:1;transform:scale(1);} }

  .empty { font-size:0.8rem; color:rgba(255,255,255,0.3); text-align:center; padding:22px 0; }
  .fade { animation: fi 0.25s ease forwards; }
  @keyframes fi { from{opacity:0;transform:translateY(5px);}to{opacity:1;transform:translateY(0);} }
  /* ── Message Board ── */
  .msgboard {
    border-radius: 20px;
    background: rgba(0,0,0,0.32);
    border: 1px solid rgba(255,255,255,0.1);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    overflow: hidden;
  }
  .msgboard-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 14px 16px 10px;
    border-bottom: 1px solid rgba(255,255,255,0.07);
  }
  .msgboard-title {
    font-family: 'Unbounded', sans-serif;
    font-size: 0.65rem; font-weight: 600;
    letter-spacing: 0.1em; text-transform: uppercase;
    color: rgba(255,255,255,0.4);
  }
  .msgboard-status {
    font-size: 0.6rem; color: rgba(255,255,255,0.28);
    font-family: 'Outfit', sans-serif;
  }
  .msgboard-messages {
    min-height: 52px; max-height: 180px;
    overflow-y: auto; padding: 12px 16px 8px;
    display: flex; flex-direction: column; gap: 10px;
    scrollbar-width: none;
  }
  .msgboard-messages::-webkit-scrollbar { display: none; }
  .msg-item { display: flex; flex-direction: column; gap: 3px; }
  .msg-item.joe { align-items: flex-end; }
  .msg-item.alice { align-items: flex-start; }
  .msg-who {
    font-size: 0.58rem; font-weight: 600; letter-spacing: 0.07em;
    text-transform: uppercase; color: rgba(255,255,255,0.3);
    font-family: 'Outfit', sans-serif;
  }
  .msg-bubble {
    max-width: 85%; padding: 9px 13px;
    font-size: 0.84rem; line-height: 1.5;
    font-family: 'Outfit', sans-serif;
    color: rgba(255,255,255,0.88);
  }
  .msg-item.joe .msg-bubble {
    background: rgba(255,255,255,0.13);
    border-radius: 16px 16px 4px 16px;
  }
  .msg-item.alice .msg-bubble {
    background: rgba(255,255,255,0.08);
    border-radius: 16px 16px 16px 4px;
  }
  .msg-time {
    font-size: 0.58rem; color: rgba(255,255,255,0.22);
    font-family: 'Outfit', sans-serif;
  }
  .msgboard-compose {
    display: flex; align-items: center; gap: 8px;
    padding: 10px 12px 12px;
    border-top: 1px solid rgba(255,255,255,0.07);
  }
  .msgboard-who {
    display: flex; gap: 4px; flex-shrink: 0;
  }
  .who-btn {
    padding: 5px 10px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.15);
    background: transparent; color: rgba(255,255,255,0.4);
    font-family: 'Outfit', sans-serif; font-size: 0.7rem; font-weight: 500;
    cursor: pointer; transition: all 0.18s ease;
  }
  .who-btn.active { background: rgba(255,255,255,0.9); color: #0A0A0A; border-color: transparent; }
  .msgboard-input {
    flex: 1; background: rgba(255,255,255,0.07);
    border: 1px solid rgba(255,255,255,0.12); border-radius: 20px;
    padding: 8px 14px; font-family: 'Outfit', sans-serif;
    font-size: 0.84rem; color: var(--white); outline: none;
  }
  .msgboard-input::placeholder { color: rgba(255,255,255,0.25); }
  .msgboard-send {
    width: 32px; height: 32px; border-radius: 50%; border: none;
    background: rgba(255,255,255,0.88); color: #0A0A0A;
    font-size: 0.85rem; cursor: pointer; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    transition: all 0.18s ease;
  }
  .msgboard-send:disabled { opacity: 0.3; cursor: default; }
  .msgboard-send:not(:disabled):active { transform: scale(0.9); }

`;

// ── Helpers ──────────────────────────────────────────────────────────────────
function pad(n) { return String(n).padStart(2, "0"); }

function useTime() {
  const [t, setT] = useState(new Date());
  useEffect(() => { const id = setInterval(() => setT(new Date()), 1000); return () => clearInterval(id); }, []);
  return t;
}

const DOW        = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const MONTHS     = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const MONTH_S    = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

async function callClaude(prompt, sys = "") {
  const body = { model: ANTHROPIC_MODEL, max_tokens: 1000, messages: [{ role:"user", content: prompt }] };
  if (sys) body.system = sys;
  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method:"POST", headers:{"Content-Type":"application/json","x-api-key":API_KEY,"anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true"}, body: JSON.stringify(body)
  });
  const d = await r.json();
  return d.content?.[0]?.text || "";
}

// ── Static data ───────────────────────────────────────────────────────────────
const MOCK_WX = {
  temp:24, feels:23, humidity:65, wind:15, condition:"Partly Cloudy", icon:"⛅",
  forecast:[
    {day:"Mon",icon:"☀️",high:26,low:17},{day:"Tue",icon:"⛅",high:23,low:16},
    {day:"Wed",icon:"🌧️",high:19,low:14},{day:"Thu",icon:"⛅",high:22,low:15},
    {day:"Fri",icon:"☀️",high:27,low:18},
  ],
};

const TODAY     = new Date();
const todayStr  = `${TODAY.getFullYear()}-${pad(TODAY.getMonth()+1)}-${pad(TODAY.getDate())}`;
const tomStr    = (() => { const d = new Date(TODAY); d.setDate(d.getDate()+1); return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`; })();

const INIT_EVENTS = [
  {id:1,date:todayStr,name:"School pickup early",time:"2:30pm",who:"alice"},
  {id:2,date:todayStr,name:"Client dinner — CBD",time:"7:00pm",who:"joe"},
  {id:3,date:tomStr,name:"Dentist",time:"9:00am",who:"alice"},
  {id:4,date:tomStr,name:"Working late",time:"til 8pm",who:"joe"},
];

const SHOP_CATS = ["Produce","Meat","Dairy","Pantry","Bakery","Other"];
const INIT_SHOPPING = [
  {id:1,name:"Oats",qty:"1 bag",category:"Pantry",checked:false},
  {id:2,name:"Chicken thighs",qty:"500g",category:"Meat",checked:false},
  {id:3,name:"Broccoli",qty:"1 head",category:"Produce",checked:false},
  {id:4,name:"Cherry tomatoes",qty:"punnet",category:"Produce",checked:false},
  {id:5,name:"Greek yoghurt",qty:"500g",category:"Dairy",checked:false},
  {id:6,name:"Eggs",qty:"dozen",category:"Dairy",checked:true},
  {id:7,name:"Pasta",qty:"500g",category:"Pantry",checked:false},
];

const DEFAULT_SOURCES = [
  {id:1,name:"Yotam Ottolenghi",site:"ottolenghi.co.uk",emoji:"🫒",note:"Vegetable-forward, Middle Eastern"},
  {id:2,name:"Donna Hay",site:"donnahay.com",emoji:"🇦🇺",note:"Australian, clean & accessible"},
  {id:3,name:"Smitten Kitchen",site:"smittenkitchen.com",emoji:"🏙",note:"Home cooking, excellent results"},
  {id:4,name:"NYT Cooking",site:"cooking.nytimes.com",emoji:"📰",note:"Broad, thoroughly tested"},
  {id:5,name:"Hetty Lui McKinnon",site:"hettymckinnon.com",emoji:"🥬",note:"Vegetarian, Australian"},
  {id:6,name:"Jamie Oliver",site:"jamieoliver.com",emoji:"🍋",note:"Family-friendly, quick meals"},
  {id:7,name:"Nigella Lawson",site:"nigella.com",emoji:"🫖",note:"Comfort food, elegant simplicity"},
  {id:8,name:"Danielle Alvarez",site:"daniellealvarez.com.au",emoji:"🌿",note:"Australian, seasonal"},
  {id:9,name:"Elizabeth Hewson",site:"elizabethhewson.com",emoji:"🍊",note:"Simple, elegant everyday cooking"},
  {id:10,name:"RecipeTin Eats",site:"recipetineats.com",emoji:"🥘",note:"Reliable, practical"},
];

const INIT_HOLIDAYS = [
  {id:1,name:"Bali Trip",date:"2025-07-12",emoji:"🌴",notes:"Flights booked, staying in Seminyak"},
  {id:2,name:"Christmas at Mum's",date:"2025-12-25",emoji:"🎄",notes:"Drive up the night before"},
];

function daysUntil(ds) {
  const t = new Date(ds+"T00:00:00"); const n = new Date(); n.setHours(0,0,0,0);
  return Math.ceil((t-n)/(1000*60*60*24));
}

const INIT_TASKS = [
  {id:1,name:"Update car insurance",who:"joe",priority:"high",due:"",done:false,notes:"Renewal due end of month"},
  {id:2,name:"Book Bali flights",who:"both",priority:"high",due:"2025-04-01",done:false,notes:""},
  {id:3,name:"Organise Matilda's 18-month check",who:"alice",priority:"medium",due:"",done:false,notes:""},
  {id:4,name:"Renew passports",who:"both",priority:"medium",due:"",done:false,notes:"Need at least 6 months validity"},
  {id:5,name:"Call accountant re: tax return",who:"joe",priority:"low",due:"",done:false,notes:""},
];

const INIT_MEMORIES = [
  {id:1,category:"Family",text:"Family: Joe, Alice and their daughter Matilda (18 months old).",createdAt:todayStr},
  {id:2,category:"Health",text:"No known food allergies in the family. Matilda is 18 months old.",createdAt:todayStr},
  {id:3,category:"Preferences",text:"Joe doesn't eat seafood. Alice is pescatarian.",createdAt:todayStr},
  {id:4,category:"Home",text:"Live in Paddington, Sydney. Renters.",createdAt:todayStr},
];

const MEM_CATS = ["Family","Health","Preferences","Home","Finance","Work","Other"];

// ── Shared Components ─────────────────────────────────────────────────────────
function AILoad({ label="Thinking…" }) {
  return <div className="ail"><div className="dots"><span/><span/><span/></div><span>{label}</span></div>;
}

// ── TABS config ───────────────────────────────────────────────────────────────
const TABS = [
  {key:"brief",    label:"Brief",   icon:"🌿", zone:"z-brief"},
  {key:"weather",  label:"Weather", icon:"🌦", zone:"z-weather"},
  {key:"calendar", label:"Cal",     icon:"🌙", zone:"z-calendar"},
  {key:"shopping", label:"Shop",    icon:"🌾", zone:"z-shopping"},
  {key:"meals",    label:"Meals",   icon:"🫙", zone:"z-meals"},
  {key:"holidays", label:"Away",    icon:"🧭", zone:"z-holidays"},
  {key:"tasks",    label:"Tasks",   icon:"🪴", zone:"z-tasks"},
  {key:"memory",   label:"MAJI",    icon:"🔮", zone:"z-memory"},
];


// ── MESSAGE BOARD ─────────────────────────────────────────────────────────────
function MessageBoard() {
  const [messages, setMessages] = useState([]);
  const [input, setInput]       = useState("");
  const [sender, setSender]     = useState("joe");
  const [saving, setSaving]     = useState(false);
  const bottomRef = useRef(null);

  // Load shared messages on mount
  useEffect(() => {
    (async () => {
      try {
        const result = await window.storage.get("maji-messages", true);
        if (result?.value) setMessages(JSON.parse(result.value));
      } catch { /* no messages yet */ }
    })();
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    const text = input.trim();
    if (!text || saving) return;
    setSaving(true);
    const now = new Date();
    const timeStr = `${now.getHours()}:${String(now.getMinutes()).padStart(2,"0")}`;
    const newMsg = { id: Date.now(), who: sender, text, time: timeStr };
    const updated = [...messages, newMsg].slice(-30); // keep last 30
    try {
      await window.storage.set("maji-messages", JSON.stringify(updated), true);
      setMessages(updated);
      setInput("");
    } catch { /* storage error */ }
    setSaving(false);
  };

  const lastSaved = messages.length
    ? messages[messages.length - 1].time
    : null;

  return (
    <div className="msgboard">
      <div className="msgboard-header">
        <div className="msgboard-title">📋 Message Board</div>
        {lastSaved && <div className="msgboard-status">Last update {lastSaved}</div>}
      </div>

      <div className="msgboard-messages">
        {messages.length === 0 && (
          <div style={{fontSize:"0.78rem",color:"rgba(255,255,255,0.25)",textAlign:"center",padding:"8px 0"}}>
            Leave a note for each other ✉️
          </div>
        )}
        {messages.map(m => (
          <div key={m.id} className={`msg-item ${m.who}`}>
            <div className="msg-who">{m.who === "joe" ? "Joe" : "Alice"}</div>
            <div className="msg-bubble">{m.text}</div>
            <div className="msg-time">{m.time}</div>
          </div>
        ))}
        <div ref={bottomRef}/>
      </div>

      <div className="msgboard-compose">
        <div className="msgboard-who">
          <button className={`who-btn${sender==="joe"?" active":""}`} onClick={()=>setSender("joe")}>Joe</button>
          <button className={`who-btn${sender==="alice"?" active":""}`} onClick={()=>setSender("alice")}>Alice</button>
        </div>
        <input
          className="msgboard-input"
          placeholder="Write a note…"
          value={input}
          onChange={e=>setInput(e.target.value)}
          onKeyDown={e=>e.key==="Enter"&&send()}
        />
        <button className="msgboard-send" onClick={send} disabled={!input.trim()||saving}>↑</button>
      </div>
    </div>
  );
}

// ── BRIEF TAB ─────────────────────────────────────────────────────────────────
function BriefTab({ events, shopping, holidays, memories, goTo }) {
  const [brief, setBrief] = useState("");
  const [loading, setLoading] = useState(false);
  const now    = new Date();
  const hour   = now.getHours();
  const greet  = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const dLabel = `${DOW[now.getDay()]}, ${now.getDate()} ${MONTH_S[now.getMonth()]} ${now.getFullYear()}`;
  const todayEvs = events.filter(e => e.date === todayStr);
  const tomEvs   = events.filter(e => e.date === tomStr);
  const remain   = shopping.filter(i => !i.checked);
  const w        = MOCK_WX;
  const nextHol  = [...holidays].filter(h => daysUntil(h.date) >= 0).sort((a,b) => new Date(a.date)-new Date(b.date))[0];

  const gen = useCallback(async () => {
    setLoading(true); setBrief("");
    try {
      const holCtx = nextHol ? `Next holiday: ${nextHol.name} in ${daysUntil(nextHol.date)} days.` : "No upcoming holidays.";
      const memCtx = memories?.length ? memories.map(m=>`[${m.category}] ${m.text}`).join("\n") : "";
      const ctx = `Today: ${dLabel}. Paddington Sydney. Weather: ${w.temp}°C ${w.condition}, humidity ${w.humidity}%, wind ${w.wind}km/h.
Today's events: ${todayEvs.length ? todayEvs.map(e=>`${e.name} ${e.time} (${e.who})`).join(", ") : "none"}.
Tomorrow: ${tomEvs.length ? tomEvs.map(e=>`${e.name} ${e.time}`).join(", ") : "none"}.
Shopping remaining: ${remain.length ? remain.map(i=>i.name).join(", ") : "all stocked"}.
${holCtx}
${memCtx}`;
      const text = await callClaude(
        `Context:\n${ctx}\n\nWrite a warm, practical morning brief for Joe and Alice — parents of 18-month-old Matilda in Paddington, Sydney. Cover weather, what Matilda should wear, schedule highlights, shopping nudge if needed, holiday mention if upcoming. Under 180 words. Conversational, warm, no bullets or headers.`,
        "You are a warm, practical family assistant. Write naturally."
      );
      setBrief(text);
    } catch { setBrief("Couldn't generate your brief — check connection and try again."); }
    setLoading(false);
  }, [todayEvs, tomEvs, remain, nextHol, memories]);

  useEffect(() => { gen(); }, []);

  return (
    <div className="brief-wrap fade">
      {/* ── Banner ── */}
      <div className="brief-banner">
        <div className="brief-greeting-row">
          <div className="brief-greet">{greet},<br/>Joe & Alice ☀️</div>
          {!loading && <button className="brief-refresh" onClick={gen} title="Refresh">↻</button>}
        </div>
        <div className="brief-date">{dLabel}</div>
        {loading
          ? <AILoad label="Putting your brief together…"/>
          : <div className="brief-body">{brief}</div>
        }
      </div>

      {/* ── Widget row ── */}
      <div className="brief-widgets">
        {/* Weather */}
        <div className="bw">
          <div className="bw-label">🌤 Weather</div>
          <div>
            <div className="bw-val">{w.temp}°</div>
            <div className="bw-sub">{w.condition}</div>
          </div>
        </div>
        {/* Today */}
        <div className="bw">
          <div className="bw-label">📅 Today</div>
          <div>
            {todayEvs.length === 0
              ? <div className="bw-sub">Nothing on ✨</div>
              : todayEvs.slice(0,2).map((e,i)=>(
                  <div key={i} className="bw-body" style={{marginBottom:2}}>
                    <span style={{fontWeight:500}}>{e.time}</span> {e.name}
                  </div>
                ))
            }
          </div>
        </div>
        {/* Shopping */}
        <div className="bw">
          <div className="bw-label">🛒 Shopping</div>
          <div>
            {remain.length === 0
              ? <div className="bw-sub">All stocked ✓</div>
              : <><div className="bw-val" style={{fontSize:"2.1rem"}}>{remain.length}</div><div className="bw-sub">items needed</div></>
            }
          </div>
        </div>
        {/* Holiday */}
        <div className="bw bw-tap" onClick={() => goTo("holidays")}>
          <div className="bw-label">✈️ Next trip</div>
          <div>
            {nextHol
              ? <><div className="bw-val">{daysUntil(nextHol.date)}</div><div className="bw-sub">{nextHol.emoji} {nextHol.name}</div></>
              : <div className="bw-sub">Plan something</div>
            }
          </div>
          <div className="bw-arrow">Tap to view →</div>
        </div>
      </div>
      <MessageBoard />
    </div>
  );
}

// ── WEATHER TAB ───────────────────────────────────────────────────────────────
function WeatherTab() {
  const [advice, setAdvice] = useState("");
  const [loading, setLoading] = useState(false);
  const w = MOCK_WX;
  const get = useCallback(async () => {
    setLoading(true);
    try {
      const t = await callClaude(`${w.temp}°C, ${w.condition} in Paddington Sydney. Humidity ${w.humidity}%, wind ${w.wind}km/h. High ${w.temp}°, low 17°. What should Matilda (18-month-old) wear? 2-3 sentences, cover layers, footwear, sun protection.`, "Warm, practical family assistant.");
      setAdvice(t);
    } catch { setAdvice("Couldn't load — check your API connection."); }
    setLoading(false);
  }, []);
  useEffect(() => { get(); }, []);

  return (
    <div className="inner fade">
      <div className="card">
        <div style={{display:"flex",alignItems:"flex-start",gap:16,marginBottom:12}}>
          <div style={{fontSize:"3.5rem",lineHeight:1}}>{w.icon}</div>
          <div>
            <div className="wx-temp">{w.temp}°</div>
            <div className="wx-cond">{w.condition} · Feels {w.feels}°</div>
          </div>
        </div>
        <div className="wx-meta">
          <span>💧 {w.humidity}%</span>
          <span>💨 {w.wind} km/h</span>
          <span>📍 Paddington</span>
        </div>
        <div className="fc-strip">
          {w.forecast.map(f=>(
            <div className="fc-day" key={f.day}>
              <div className="fc-name">{f.day}</div>
              <div className="fc-ico">{f.icon}</div>
              <div><span className="fc-hi">{f.high}°</span> <span className="fc-lo">{f.low}°</span></div>
            </div>
          ))}
        </div>
      </div>
      <div className="card">
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <div className="t-title" style={{marginBottom:0}}>👶 What should Matilda wear?</div>
          <button className="btn btn-ghost btn-sm" onClick={get}>Refresh</button>
        </div>
        {loading ? <AILoad label="Checking weather for Matilda…"/> : (
          <div className="t-body fade">{advice}</div>
        )}
      </div>
    </div>
  );
}

// ── CALENDAR TAB ──────────────────────────────────────────────────────────────
function CalendarTab({ events, setEvents }) {
  const [yr, setYr] = useState(TODAY.getFullYear());
  const [mo, setMo] = useState(TODAY.getMonth());
  const [sel, setSel] = useState(todayStr);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({name:"",time:"",who:"joe"});
  const nextId = () => Math.max(0,...events.map(e=>e.id))+1;

  const first = new Date(yr,mo,1).getDay();
  const dim   = new Date(yr,mo+1,0).getDate();
  const dip   = new Date(yr,mo,0).getDate();
  const cells = [];
  for(let i=0;i<first;i++) cells.push({d:dip-first+1+i,t:"p"});
  for(let i=1;i<=dim;i++)  cells.push({d:i,t:"c"});
  for(let i=1;i<=42-cells.length;i++) cells.push({d:i,t:"n"});

  const ds=(d,t)=>{const m=t==="p"?mo-1:t==="n"?mo+1:mo;const y=m<0?yr-1:m>11?yr+1:yr;const mm=((m%12)+12)%12;return `${y}-${pad(mm+1)}-${pad(d)}`;};
  const selEvs = events.filter(e=>e.date===sel).sort((a,b)=>a.time.localeCompare(b.time));
  const selDate = new Date(sel+"T00:00:00");
  const selLbl = `${DOW[selDate.getDay()]}, ${selDate.getDate()} ${MONTH_S[selDate.getMonth()]}`;

  const addEvent = ()=>{
    if(!form.name.trim()) return;
    setEvents(p=>[...p,{id:nextId(),date:sel,name:form.name,time:form.time,who:form.who}]);
    setForm({name:"",time:"",who:"joe"}); setShowForm(false);
  };

  return (
    <div className="inner fade">
      <div className="card">
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <div className="t-title" style={{marginBottom:0}}>{selLbl}</div>
          <button className="btn btn-ghost btn-sm" onClick={()=>setShowForm(s=>!s)}>+ Add</button>
        </div>
        {showForm && (
          <div className="card-sm" style={{marginBottom:10}}>
            <input className="inp" placeholder="Event name" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} onKeyDown={e=>e.key==="Enter"&&addEvent()} />
            <div className="frm-row">
              <input className="inp" placeholder="Time (e.g. 7pm)" value={form.time} onChange={e=>setForm(f=>({...f,time:e.target.value}))} style={{marginBottom:0}}/>
              <select className="inp" value={form.who} onChange={e=>setForm(f=>({...f,who:e.target.value}))} style={{marginBottom:0}}>
                <option value="joe">Joe</option><option value="alice">Alice</option><option value="both">Both</option>
              </select>
            </div>
            <div className="btn-row" style={{marginTop:8}}>
              <button className="btn btn-ghost btn-sm" onClick={()=>setShowForm(false)}>Cancel</button>
              <button className="btn btn-white btn-sm" onClick={addEvent}>Save</button>
            </div>
          </div>
        )}
        {selEvs.length===0&&!showForm&&<div className="empty">Nothing on — enjoy the quiet ✨</div>}
        {selEvs.map(ev=>(
          <div className="ev-item" key={ev.id}>
            <div className={`ev-dot ${ev.who}`}/>
            <div className="ev-name">{ev.name}</div>
            {ev.time&&<div className="ev-time">{ev.time}</div>}
            <button className="row-del" onClick={()=>setEvents(p=>p.filter(e=>e.id!==ev.id))}>×</button>
          </div>
        ))}
      </div>

      <div className="card">
        {/* Month nav */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
          <button className="btn btn-ghost btn-sm" onClick={()=>{if(mo===0){setMo(11);setYr(y=>y-1);}else setMo(m=>m-1);}}>‹</button>
          <div className="t-title" style={{marginBottom:0}}>{MONTHS[mo]} {yr}</div>
          <button className="btn btn-ghost btn-sm" onClick={()=>{if(mo===11){setMo(0);setYr(y=>y+1);}else setMo(m=>m+1);}}>›</button>
        </div>
        <div className="cal-grid">
          {["S","M","T","W","T","F","S"].map((d,i)=><div className="cal-dow" key={i}>{d}</div>)}
          {cells.map((c,i)=>{
            const dstr=ds(c.d,c.t);
            const isT=dstr===todayStr, isSel=dstr===sel, hasEv=events.some(e=>e.date===dstr);
            const cls=["cal-day",c.t!=="c"?"other":"",isT?"today":"",isSel&&!isT?"sel":"",hasEv?"has-ev":"",c.t!=="c"?"empty":""].filter(Boolean).join(" ");
            return <div key={i} className={cls} onClick={()=>c.t==="c"&&setSel(dstr)}>{c.d}</div>;
          })}
        </div>
        <div style={{display:"flex",gap:12,fontSize:"0.7rem",color:"rgba(255,255,255,0.38)"}}>
          <span style={{display:"flex",alignItems:"center",gap:4}}><span className="ev-dot joe" style={{display:"inline-block"}}/> Joe</span>
          <span style={{display:"flex",alignItems:"center",gap:4}}><span className="ev-dot alice" style={{display:"inline-block"}}/> Alice</span>
          <span style={{display:"flex",alignItems:"center",gap:4}}><span className="ev-dot both" style={{display:"inline-block"}}/> Both</span>
        </div>
      </div>
    </div>
  );
}

// ── SHOPPING TAB ──────────────────────────────────────────────────────────────
function ShoppingTab({ items, setItems }) {
  const [input, setInput] = useState("");
  const [qty, setQty] = useState("");
  const [cat, setCat] = useState("Produce");
  const nextId=()=>Math.max(0,...items.map(i=>i.id))+1;
  const add=()=>{if(!input.trim())return;setItems(p=>[...p,{id:nextId(),name:input.trim(),qty:qty.trim()||"",category:cat,checked:false}]);setInput("");setQty("");};
  const toggle=(id)=>setItems(p=>p.map(i=>i.id===id?{...i,checked:!i.checked}:i));
  const remove=(id)=>setItems(p=>p.filter(i=>i.id!==id));
  const clearDone=()=>setItems(p=>p.filter(i=>!i.checked));
  const grouped=SHOP_CATS.reduce((a,c)=>{const its=items.filter(i=>i.category===c);if(its.length)a[c]=its;return a;},{});
  const unchecked=items.filter(i=>!i.checked).length;
  const done=items.filter(i=>i.checked).length;

  return (
    <div className="inner fade">
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:14}}>
        <div className="t-title" style={{marginBottom:0}}>Shopping List</div>
        <div style={{fontSize:"0.7rem",color:"rgba(255,255,255,0.38)"}}>{unchecked} left · {done} done</div>
      </div>
      {/* Add row */}
      <div style={{display:"flex",gap:6,marginBottom:14}}>
        <input className="inp" placeholder="Add item…" value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&add()} style={{flex:1,marginBottom:0}}/>
        <input className="inp" placeholder="Qty" value={qty} onChange={e=>setQty(e.target.value)} style={{width:64,marginBottom:0}} onKeyDown={e=>e.key==="Enter"&&add()}/>
        <select className="inp" value={cat} onChange={e=>setCat(e.target.value)} style={{width:90,marginBottom:0}}>
          {SHOP_CATS.map(c=><option key={c}>{c}</option>)}
        </select>
        <button className="btn btn-white btn-sm" onClick={add}>+</button>
      </div>
      {Object.entries(grouped).map(([c,its])=>(
        <div key={c} className="card">
          <div className="sh-cat">{c}</div>
          {its.map(item=>(
            <div className="sh-row" key={item.id}>
              <input type="checkbox" checked={item.checked} onChange={()=>toggle(item.id)}/>
              {item.qty&&<span className="sh-qty">{item.qty}</span>}
              <span className={item.checked?"sh-done":""} style={{flex:1}}>{item.name}</span>
              <button className="row-del" onClick={()=>remove(item.id)}>×</button>
            </div>
          ))}
        </div>
      ))}
      {items.length===0&&<div className="empty">List is empty — add something above</div>}
      {done>0&&<button className="btn btn-ghost btn-sm" style={{marginTop:8}} onClick={clearDone}>Clear {done} checked</button>}
    </div>
  );
}

// ── MEAL CHAT ─────────────────────────────────────────────────────────────────
function MealChat({ meal, onClose }) {
  const [msgs, setMsgs] = useState([]);
  const [inp, setInp] = useState("");
  const [loading, setLoading] = useState(false);
  const bot = useRef(null);
  useEffect(()=>{ bot.current?.scrollIntoView({behavior:"smooth"}); },[msgs,loading]);

  const sys=`You are a helpful cooking assistant. Recipe: "${meal.title}" from ${meal.source||""}. Description: ${meal.description}. Key ingredients: ${meal.keyIngredients||""}. Help adapt/adjust. Family has 18-month-old Matilda. If asked for full recipe, direct to ${meal.url||"the site"}.`;

  const send=async()=>{
    const t=inp.trim(); if(!t||loading) return;
    setInp(""); const um={role:"user",content:t}; const nh=[...msgs,um]; setMsgs(nh); setLoading(true);
    try {
      const r=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json","x-api-key":API_KEY,"anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true"},body:JSON.stringify({model:ANTHROPIC_MODEL,max_tokens:1000,system:sys,messages:nh})});
      const d=await r.json();
      setMsgs(p=>[...p,{role:"assistant",content:d.content?.[0]?.text||"Sorry, something went wrong."}]);
    } catch { setMsgs(p=>[...p,{role:"assistant",content:"Couldn't connect — check API key."}]); }
    setLoading(false);
  };

  const tagEmoji = {"Quick":"⚡","Family":"👨‍👩‍👧","Light":"🥗"};

  return (
    <div className="fade" style={{display:"flex",flexDirection:"column",height:"100%"}}>
      {/* ── Sheet header ── */}
      <div className="meal-sheet-hdr">
        <button className="meal-sheet-back" onClick={onClose}>‹ Recipes</button>
      </div>
      <div style={{padding:"10px 16px 0",flexShrink:0}}>
        <div className="meal-sheet-title">{meal.title}</div>
      </div>
      {meal.source&&<div style={{padding:"6px 16px 0",flexShrink:0}}><span className="meal-source">{meal.sourceEmoji} {meal.source}</span></div>}
      {meal.description&&<div className="meal-sheet-desc">{meal.description}</div>}
      {meal.keyIngredients&&(
        <div className="meal-sheet-ings">
          {meal.keyIngredients.split(",").map((x,i)=><span key={i} className="ing-pill">{x.trim()}</span>)}
        </div>
      )}
      {meal.url&&(
        <a href={meal.url} target="_blank" rel="noopener noreferrer" className="meal-link">
          🔗 View full recipe ↗
        </a>
      )}
      {/* ── Chat ── */}
      <div style={{flex:1,display:"flex",flexDirection:"column",margin:"0 16px 12px",background:"rgba(0,0,0,0.28)",borderRadius:16,border:"1px solid rgba(255,255,255,0.08)",minHeight:0,overflow:"hidden"}}>
        <div className="chat-wrap">
          {msgs.length===0&&<div className="sugg">{["Make it Matilda-friendly","Double the recipe","Substitutions?","Best sides?"].map(s=><button key={s} className="sugg-btn" onClick={()=>setInp(s)}>{s}</button>)}</div>}
          {msgs.map((m,i)=>(
            <div key={i} className={`bubble ${m.role==="user"?"u":"a"}`}>
              <div className="blbl">{m.role==="user"?"You":"MAJI"}</div>
              <div className="btxt">{m.content}</div>
            </div>
          ))}
          {loading&&<div className="bubble a"><div className="blbl">MAJI</div><div className="btxt"><AILoad label=""/></div></div>}
          <div ref={bot}/>
        </div>
        <div className="chat-inp-row" style={{borderRadius:"0 0 16px 16px"}}>
          <input className="chat-inp" style={{borderRadius:10}} placeholder="Ask anything about this recipe…" value={inp} onChange={e=>setInp(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()}/>
          <button className="btn btn-white btn-sm" style={{borderRadius:10}} onClick={send} disabled={loading||!inp.trim()}>Send</button>
        </div>
      </div>
    </div>
  );
}

// ── MEALS TAB ─────────────────────────────────────────────────────────────────
function MealsTab({ shopping, sources, setSources }) {
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sel, setSel] = useState(null);
  const [prefs, setPrefs] = useState("quick weeknight meals, no seafood, Matilda-friendly");
  const [showSrc, setShowSrc] = useState(false);
  const [newSrc, setNewSrc] = useState({name:"",site:"",note:""});
  const enabled = sources.filter(s=>s.enabled!==false);
  const ings = shopping.filter(i=>!i.checked).map(i=>i.name).join(", ");

  const search = useCallback(async()=>{
    setLoading(true); setMeals([]); setSel(null);
    try {
      const siteList=enabled.map(s=>s.site).join(", ");
      const nameList=enabled.map(s=>s.name).join(", ");
      const prompt=`Find 3 real recipes from: ${nameList} (sites: ${siteList}). Ingredients: ${ings||"pantry staples"}. Preferences: ${prefs}. Family: Joe, Alice, Matilda (18mo) Paddington Sydney. Return ONLY valid JSON array of 3 objects: title, source, sourceEmoji, url (real specific URL), description (2 sentences), keyIngredients (comma string), tag ("Quick"|"Family"|"Light"), whyMatch (1 sentence).`;
      const r=await fetch("/api/search-recipes",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:ANTHROPIC_MODEL,max_tokens:1500,tools:[{type:"web_search_20250305",name:"web_search"}],messages:[{role:"user",content:prompt}]})});
      const d=await r.json();
      const txt=d.content?.find(b=>b.type==="text")?.text||"";
      const m=txt.replace(/```json|```/g,"").trim().match(/\[[\s\S]*\]/);
      if(!m) throw new Error("no JSON");
      setMeals(JSON.parse(m[0]));
    } catch {
      try {
        const t=await callClaude(`Find 3 real recipes from: ${enabled.map(s=>`${s.name} (${s.site})`).join(", ")}. Ingredients: ${ings||"pantry staples"}. Prefs: ${prefs}. Return only JSON array: title,source,sourceEmoji,url,description,keyIngredients,tag,whyMatch.`,"Return only valid JSON array.");
        const m=t.replace(/```json|```/g,"").trim().match(/\[[\s\S]*\]/);
        if(m) setMeals(JSON.parse(m[0])); else throw new Error();
      } catch { setMeals([{title:"Search unavailable",source:"",url:"",description:"Web search couldn't load — check connection and try again.",keyIngredients:"",tag:"Quick",whyMatch:""}]); }
    }
    setLoading(false);
  },[ings,prefs,enabled]);

  const addSrc=()=>{if(!newSrc.name.trim()||!newSrc.site.trim())return;setSources(p=>[...p,{id:Date.now(),name:newSrc.name,site:newSrc.site,note:newSrc.note,emoji:"🍴",enabled:true}]);setNewSrc({name:"",site:"",note:""}); };
  const toggleSrc=(id)=>setSources(p=>p.map(s=>s.id===id?{...s,enabled:s.enabled===false}:s));
  const removeSrc=(id)=>setSources(p=>p.filter(s=>s.id!==id));

  if(sel!==null&&meals[sel]) return <MealChat meal={meals[sel]} onClose={()=>setSel(null)}/>;

  const tagEmoji = {"Quick":"⚡","Family":"👨‍👩‍👧","Light":"🥗"};
  const mealIcon = (m) => tagEmoji[m.tag] || "🍽";

  return (
    <div className="meals-wrap fade">
      {/* ── Header ── */}
      <div className="meals-header">
        <div className="meals-title">Recipes</div>
      </div>

      {/* ── Search bar ── */}
      <div className="meals-search-bar">
        <span className="meals-search-icon">🔍</span>
        <input
          value={prefs}
          onChange={e=>setPrefs(e.target.value)}
          onKeyDown={e=>e.key==="Enter"&&search()}
          placeholder="Quick, Matilda-friendly, no seafood…"
        />
      </div>

      {/* ── Find button ── */}
      <button className="meals-find-btn" onClick={search} disabled={loading}>
        {loading ? `Searching ${enabled.length} sources…` : "Find recipes"}
      </button>

      {/* ── Sources strip ── */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"4px 16px 4px"}}>
        <div className="meals-section-label" style={{padding:0,margin:0}}>Sources</div>
        <button className="btn btn-ghost btn-sm" onClick={()=>setShowSrc(s=>!s)} style={{borderRadius:10,fontSize:"0.65rem",padding:"4px 10px"}}>
          {showSrc ? "Done" : "+ Add"}
        </button>
      </div>
      <div className="meals-src-strip">
        {sources.map(s=>(
          <div key={s.id} className={`src-chip${s.enabled===false?"":" on"}`} onClick={()=>toggleSrc(s.id)}>
            <span>{s.emoji}</span>{s.name}
          </div>
        ))}
      </div>

      {/* ── Add source form (collapsible) ── */}
      {showSrc&&(
        <div style={{margin:"0 16px 12px",background:"rgba(0,0,0,0.28)",borderRadius:14,border:"1px solid rgba(255,255,255,0.09)",padding:"12px 14px"}}>
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
            <input className="inp" placeholder="Chef / site name" value={newSrc.name} onChange={e=>setNewSrc(n=>({...n,name:e.target.value}))} style={{flex:"1 1 120px",marginBottom:0,borderRadius:10}}/>
            <input className="inp" placeholder="domain.com" value={newSrc.site} onChange={e=>setNewSrc(n=>({...n,site:e.target.value}))} style={{flex:"1 1 120px",marginBottom:0,borderRadius:10}}/>
            <button className="btn btn-white btn-sm" onClick={addSrc} style={{borderRadius:10}}>+ Add</button>
          </div>
        </div>
      )}

      {/* ── States ── */}
      {loading&&<div style={{padding:"8px 16px"}}><AILoad label={`Checking ${enabled.map(s=>s.name).slice(0,3).join(", ")}…`}/></div>}
      {!loading&&meals.length===0&&(
        <div className="empty" style={{padding:"32px 16px"}}>
          Search your {enabled.length} curated sources above ✨
        </div>
      )}

      {/* ── Results list ── */}
      {meals.length>0&&(
        <>
          <div className="meals-section-label">Results</div>
          <div className="meals-list">
            {meals.map((m,i)=>(
              <div key={i} className="meal-row" onClick={()=>setSel(i)}>
                <div className="meal-row-icon">{mealIcon(m)}</div>
                <div className="meal-row-body">
                  <div className="meal-row-title">{m.title}</div>
                  <div className="meal-row-sub">
                    {m.source&&<>{m.sourceEmoji} {m.source}</>}
                    {m.tag&&<span className="meal-tag" style={{marginLeft:6}}>{m.tag}</span>}
                  </div>
                </div>
                <div className="meal-row-chevron">›</div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ── HOLIDAYS TAB ──────────────────────────────────────────────────────────────
function HolidaysTab({ holidays, setHolidays }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({name:"",date:"",emoji:"✈️",notes:""});
  const [editing, setEditing] = useState(null);
  const nextId=()=>Math.max(0,...holidays.map(h=>h.id))+1;
  const EMOJIS=["✈️","🌴","🏔","🏖","🗺","🎿","🚢","🏕","🌍","🎄","🎉","🏡"];
  const sorted=[...holidays].sort((a,b)=>new Date(a.date)-new Date(b.date));

  const save=()=>{
    if(!form.name.trim()||!form.date) return;
    if(editing!==null) { setHolidays(p=>p.map(h=>h.id===editing?{...h,...form}:h)); setEditing(null); }
    else setHolidays(p=>[...p,{id:nextId(),...form}]);
    setForm({name:"",date:"",emoji:"✈️",notes:""}); setShowForm(false);
  };
  const startEdit=(h)=>{ setForm({name:h.name,date:h.date,emoji:h.emoji,notes:h.notes||""}); setEditing(h.id); setShowForm(true); };
  const remove=(id)=>setHolidays(p=>p.filter(h=>h.id!==id));

  return (
    <div className="inner fade">
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <div className="t-title" style={{marginBottom:0}}>Holidays & Trips</div>
        <button className="btn btn-ghost btn-sm" onClick={()=>{setShowForm(s=>!s);setEditing(null);setForm({name:"",date:"",emoji:"✈️",notes:""});}}>
          {showForm&&editing===null?"Cancel":"+ Add"}
        </button>
      </div>

      {showForm&&(
        <div className="card" style={{marginBottom:12}}>
          <input className="inp" placeholder="Trip name" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))}/>
          <input className="inp" type="date" value={form.date} onChange={e=>setForm(f=>({...f,date:e.target.value}))}/>
          <div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:8}}>
            {EMOJIS.map(e=>(
              <button key={e} onClick={()=>setForm(f=>({...f,emoji:e}))}
                style={{fontSize:"1.1rem",padding:"4px 6px",border:`2px solid ${form.emoji===e?"rgba(255,255,255,0.6)":"transparent"}`,background:"rgba(0,0,0,0.2)",borderRadius:4,cursor:"pointer"}}>
                {e}
              </button>
            ))}
          </div>
          <input className="inp" placeholder="Notes…" value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))} onKeyDown={e=>e.key==="Enter"&&save()}/>
          <div className="btn-row">
            <button className="btn btn-ghost btn-sm" onClick={()=>{setShowForm(false);setEditing(null);}}>Cancel</button>
            <button className="btn btn-white btn-sm" onClick={save}>{editing!==null?"Save changes":"Add holiday"}</button>
          </div>
        </div>
      )}

      {sorted.length===0&&<div className="empty">No holidays added — something to look forward to! ✈️</div>}

      {sorted.map(h=>{
        const days=daysUntil(h.date);
        const isPast=days<0, isToday=days===0, isSoon=days<=30&&days>=0;
        return (
          <div key={h.id} className="hol-card" style={isToday?{background:"rgba(255,255,255,0.15)",borderColor:"rgba(255,255,255,0.3)"}:{}}>
            <div className="hol-emoji">{h.emoji}</div>
            <div style={{flex:1}}>
              <div className="hol-name">{h.name}</div>
              <div className="hol-date">{new Date(h.date+"T00:00:00").toLocaleDateString("en-AU",{weekday:"short",day:"numeric",month:"long",year:"numeric"})}</div>
              {h.notes&&<div className="hol-notes">{h.notes}</div>}
            </div>
            <div>
              {isPast ? <div style={{fontSize:"0.7rem",color:"rgba(255,255,255,0.3)"}}>Past</div>
              : isToday ? <div className="hol-num">Today!</div>
              : <><div className="hol-num">{days}</div><div className="hol-days">days</div></>}
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:4}}>
              <button className="btn btn-ghost btn-sm" onClick={()=>startEdit(h)} style={{fontSize:"0.65rem",padding:"3px 8px"}}>Edit</button>
              <button className="row-del" onClick={()=>remove(h.id)}>×</button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── TASKS TAB ─────────────────────────────────────────────────────────────────
function TasksTab({ tasks, setTasks }) {
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState("all");
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({name:"",who:"joe",priority:"medium",due:"",notes:""});
  const nextId=()=>Math.max(0,...tasks.map(t=>t.id))+1;

  const save=()=>{
    if(!form.name.trim()) return;
    if(editing!==null){setTasks(p=>p.map(t=>t.id===editing?{...t,...form}:t));setEditing(null);}
    else setTasks(p=>[...p,{id:nextId(),...form,done:false}]);
    setForm({name:"",who:"joe",priority:"medium",due:"",notes:""}); setShowForm(false);
  };
  const toggle=(id)=>setTasks(p=>p.map(t=>t.id===id?{...t,done:!t.done}:t));
  const remove=(id)=>setTasks(p=>p.filter(t=>t.id!==id));
  const startEdit=(t)=>{setForm({name:t.name,who:t.who,priority:t.priority,due:t.due||"",notes:t.notes||""});setEditing(t.id);setShowForm(true);};

  const filtered=tasks.filter(t=>{
    if(filter==="done") return t.done;
    if(filter==="joe")  return !t.done&&t.who==="joe";
    if(filter==="alice")return !t.done&&t.who==="alice";
    if(filter==="both") return !t.done&&t.who==="both";
    return !t.done;
  });
  const sorted=[...filtered].sort((a,b)=>{
    const o={high:0,medium:1,low:2};
    if(o[a.priority]!==o[b.priority]) return o[a.priority]-o[b.priority];
    if(a.due&&b.due) return new Date(a.due)-new Date(b.due);
    return a.due?-1:b.due?1:0;
  });

  const openCount=tasks.filter(t=>!t.done).length;
  const doneCount=tasks.filter(t=>t.done).length;

  const PDOT = {high:"ph",medium:"pm",low:"pl"};
  const PTAG = {
    high:  {bg:"rgba(255,107,107,0.18)",color:"#FF9999"},
    medium:{bg:"rgba(255,217,61,0.15)", color:"#FFD93D"},
    low:   {bg:"rgba(255,255,255,0.08)",color:"rgba(255,255,255,0.45)"},
  };
  const WHO_TAG={
    joe:   {bg:"rgba(255,255,255,0.15)",color:"rgba(255,255,255,0.8)"},
    alice: {bg:"rgba(255,255,255,0.08)",color:"rgba(255,255,255,0.6)"},
    both:  {bg:"rgba(255,255,255,0.12)",color:"rgba(255,255,255,0.7)"},
  };

  return (
    <div className="inner fade">
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:14}}>
        <div>
          <div className="t-title" style={{marginBottom:0}}>Tasks</div>
          <div style={{fontSize:"0.65rem",color:"rgba(255,255,255,0.35)"}}>{openCount} open · {doneCount} done</div>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={()=>{setShowForm(s=>!s);setEditing(null);setForm({name:"",who:"joe",priority:"medium",due:"",notes:""});}}>
          {showForm&&editing===null?"Cancel":"+ Add"}
        </button>
      </div>

      {showForm&&(
        <div className="card" style={{marginBottom:12}}>
          <input className="inp" placeholder="Task name…" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} onKeyDown={e=>e.key==="Enter"&&save()}/>
          <div className="frm-row">
            <select className="inp" value={form.who} onChange={e=>setForm(f=>({...f,who:e.target.value}))} style={{marginBottom:0}}>
              <option value="joe">Joe</option><option value="alice">Alice</option><option value="both">Both</option>
            </select>
            <select className="inp" value={form.priority} onChange={e=>setForm(f=>({...f,priority:e.target.value}))} style={{marginBottom:0}}>
              <option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option>
            </select>
          </div>
          <div className="frm-row" style={{marginTop:8}}>
            <input className="inp" type="date" value={form.due} onChange={e=>setForm(f=>({...f,due:e.target.value}))} style={{marginBottom:0}}/>
            <input className="inp" placeholder="Notes…" value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))} style={{marginBottom:0}}/>
          </div>
          <div className="btn-row" style={{marginTop:8}}>
            <button className="btn btn-ghost btn-sm" onClick={()=>{setShowForm(false);setEditing(null);}}>Cancel</button>
            <button className="btn btn-white btn-sm" onClick={save}>{editing!==null?"Save":"Add task"}</button>
          </div>
        </div>
      )}

      <div className="pills">
        {[{k:"all",l:"All open"},{k:"joe",l:"Joe"},{k:"alice",l:"Alice"},{k:"both",l:"Both"},{k:"done",l:"✓ Done"}].map(f=>(
          <button key={f.k} className={`pill${filter===f.k?" on":""}`} onClick={()=>setFilter(f.k)}>{f.l}</button>
        ))}
      </div>

      {sorted.length===0&&<div className="empty">{filter==="done"?"No completed tasks yet":"Nothing here — add a task ✓"}</div>}

      {sorted.map(task=>{
        const isOver=task.due&&daysUntil(task.due)<0&&!task.done;
        const isSoon=task.due&&daysUntil(task.due)>=0&&daysUntil(task.due)<=7&&!task.done;
        const pt=PTAG[task.priority];
        const wt=WHO_TAG[task.who]||WHO_TAG.both;
        return (
          <div key={task.id} className="task" style={{opacity:task.done?0.45:1}}>
            <div className={`pdot ${PDOT[task.priority]}`} style={{marginTop:4}}/>
            <input type="checkbox" checked={task.done} onChange={()=>toggle(task.id)} style={{width:15,height:15,accentColor:"rgba(255,255,255,0.8)",cursor:"pointer",flexShrink:0,marginTop:2}}/>
            <div style={{flex:1,minWidth:0}}>
              <div className={`task-name${task.done?" task-done":""}`}>{task.name}</div>
              <div className="task-meta">
                <span className="task-tag" style={{background:pt.bg,color:pt.color}}>{task.priority}</span>
                <span className="task-tag" style={{background:wt.bg,color:wt.color}}>{task.who==="both"?"Both":task.who==="joe"?"Joe":"Alice"}</span>
                {task.due&&<span style={{fontSize:"0.68rem",color:isOver?"#FF9999":isSoon?"#FFD93D":"rgba(255,255,255,0.35)"}}>
                  {isOver?"⚠ Overdue":isSoon?"⏰ Soon":""} {new Date(task.due+"T00:00:00").toLocaleDateString("en-AU",{day:"numeric",month:"short"})}
                </span>}
              </div>
              {task.notes&&<div style={{fontSize:"0.72rem",color:"rgba(255,255,255,0.35)",fontStyle:"italic",marginTop:2}}>{task.notes}</div>}
            </div>
            <div style={{display:"flex",gap:4,flexShrink:0}}>
              {!task.done&&<button className="btn btn-ghost btn-sm" onClick={()=>startEdit(task)} style={{fontSize:"0.65rem",padding:"3px 8px"}}>Edit</button>}
              <button className="row-del" onClick={()=>remove(task.id)}>×</button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── MEMORY TAB ────────────────────────────────────────────────────────────────
function MemoryTab({ memories, setMemories }) {
  const [msgs, setMsgs] = useState([{role:"assistant",content:"Hi! I'm MAJI — Matilda Alice Joe Intelligence. Tell me anything you want the app to remember about your family — routines, preferences, important info. I'll keep a structured memory bank that all other parts of MAJI can draw on.\n\nWhat would you like me to remember?"}]);
  const [inp, setInp] = useState("");
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState("chat");
  const [editId, setEditId] = useState(null);
  const [editTxt, setEditTxt] = useState("");
  const [newMem, setNewMem] = useState({text:"",category:"Family"});
  const [showAdd, setShowAdd] = useState(false);
  const bot = useRef(null);
  useEffect(()=>{ bot.current?.scrollIntoView({behavior:"smooth"}); },[msgs,loading]);

  const memCtx = memories.map(m=>`[${m.category}] ${m.text}`).join("\n");

  const send=async()=>{
    const t=inp.trim(); if(!t||loading) return;
    setInp(""); const um={role:"user",content:t}; const nh=[...msgs,um]; setMsgs(nh); setLoading(true);
    try {
      const sys=`You are MAJI's memory assistant — warm, smart helper for Joe and Alice, parents of Matilda (18 months), Paddington Sydney. MAJI = Matilda Alice Joe Intelligence.\n\nJob: Have natural conversation to help add/update/remove from memory bank. When user shares something to remember, extract it and return a JSON action.\n\nCurrent memory bank:\n${memCtx||"Empty"}\n\nWhen adding/removing, append at very end of response:\n<memory_action>\n{"action":"add"|"remove","category":"Family"|"Health"|"Preferences"|"Home"|"Finance"|"Work"|"Other","text":"memory text","removeId":null}\n</memory_action>\n\nOnly append when there's a clear action. Keep memories concise (1-2 sentences). Be warm and conversational.`;
      const r=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json","x-api-key":API_KEY,"anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true"},body:JSON.stringify({model:ANTHROPIC_MODEL,max_tokens:1000,system:sys,messages:nh})});
      const d=await r.json();
      const raw=d.content?.[0]?.text||"Sorry, something went wrong.";
      const match=raw.match(/<memory_action>([\s\S]*?)<\/memory_action>/);
      const clean=raw.replace(/<memory_action>[\s\S]*?<\/memory_action>/,"").trim();
      if(match){
        try {
          const a=JSON.parse(match[1].trim());
          if(a.action==="add"&&a.text){
            const nid=Math.max(0,...memories.map(m=>m.id))+1;
            setMemories(p=>[...p,{id:nid,category:a.category||"Other",text:a.text,createdAt:todayStr}]);
          } else if(a.action==="remove"&&a.removeId) {
            setMemories(p=>p.filter(m=>m.id!==a.removeId));
          }
        } catch {}
      }
      setMsgs(p=>[...p,{role:"assistant",content:clean}]);
    } catch { setMsgs(p=>[...p,{role:"assistant",content:"Couldn't connect — try again in a moment."}]); }
    setLoading(false);
  };

  const addManual=()=>{
    if(!newMem.text.trim()) return;
    const nid=Math.max(0,...memories.map(m=>m.id))+1;
    setMemories(p=>[...p,{id:nid,category:newMem.category,text:newMem.text.trim(),createdAt:todayStr}]);
    setNewMem({text:"",category:"Family"}); setShowAdd(false);
  };
  const removeM=(id)=>setMemories(p=>p.filter(m=>m.id!==id));
  const saveEdit=(id)=>{setMemories(p=>p.map(m=>m.id===id?{...m,text:editTxt}:m));setEditId(null);};

  const grouped=MEM_CATS.reduce((a,c)=>{const items=memories.filter(m=>m.category===c);if(items.length)a[c]=items;return a;},{});
  const SUGGS=["Matilda loves blueberries and avocado","We prefer meals under 30 mins on weeknights","Joe is allergic to nuts","We're saving for a house deposit","Alice works from home on Thursdays"];

  return (
    <div className="inner fade" style={{padding:0,height:"100%",display:"flex",flexDirection:"column"}}>
      {/* Sub-nav */}
      <div style={{display:"flex",gap:3,margin:"14px 14px 10px",background:"rgba(0,0,0,0.3)",padding:3,borderRadius:5,flexShrink:0}}>
        {[{k:"chat",l:"💬 Chat"},{k:"bank",l:`🗃 Bank (${memories.length})`}].map(t=>(
          <button key={t.k} onClick={()=>setView(t.k)} style={{flex:1,padding:"7px 10px",border:"none",borderRadius:4,cursor:"pointer",fontFamily:"Outfit,sans-serif",fontSize:"0.78rem",fontWeight:500,background:view===t.k?"rgba(255,255,255,0.12)":"transparent",color:view===t.k?"rgba(255,255,255,0.9)":"rgba(255,255,255,0.38)",transition:"var(--t)"}}>
            {t.l}
          </button>
        ))}
      </div>

      {view==="chat"&&(
        <div style={{flex:1,display:"flex",flexDirection:"column",margin:"0 14px 14px",background:"rgba(0,0,0,0.28)",borderRadius:6,border:"1px solid rgba(255,255,255,0.08)",minHeight:0}}>
          <div className="chat-wrap">
            {msgs.length===1&&<div className="sugg">{SUGGS.map(s=><button key={s} className="sugg-btn" onClick={()=>setInp(s)}>{s}</button>)}</div>}
            {msgs.map((m,i)=>(
              <div key={i} className={`bubble ${m.role==="user"?"u":"a"}`}>
                <div className="blbl">{m.role==="user"?"You":"MAJI"}</div>
                <div className="btxt" style={{whiteSpace:"pre-wrap"}}>{m.content}</div>
              </div>
            ))}
            {loading&&<div className="bubble a"><div className="blbl">MAJI</div><div className="btxt"><AILoad label=""/></div></div>}
            <div ref={bot}/>
          </div>
          <div className="chat-inp-row">
            <input className="chat-inp" placeholder="Tell me something to remember…" value={inp} onChange={e=>setInp(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()}/>
            <button className="btn btn-white btn-sm" onClick={send} disabled={loading||!inp.trim()}>Send</button>
          </div>
        </div>
      )}

      {view==="bank"&&(
        <div style={{flex:1,overflowY:"auto",padding:"0 14px 14px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <div style={{fontSize:"0.7rem",color:"rgba(255,255,255,0.38)"}}>{memories.length} things stored</div>
            <button className="btn btn-ghost btn-sm" onClick={()=>setShowAdd(s=>!s)}>{showAdd?"Cancel":"+ Add"}</button>
          </div>
          {showAdd&&(
            <div className="card" style={{marginBottom:10}}>
              <input className="inp" placeholder="What should MAJI remember?" value={newMem.text} onChange={e=>setNewMem(n=>({...n,text:e.target.value}))} onKeyDown={e=>e.key==="Enter"&&addManual()}/>
              <select className="inp" value={newMem.category} onChange={e=>setNewMem(n=>({...n,category:e.target.value}))} style={{marginBottom:0}}>
                {MEM_CATS.map(c=><option key={c}>{c}</option>)}
              </select>
              <div className="btn-row" style={{marginTop:8}}>
                <button className="btn btn-ghost btn-sm" onClick={()=>setShowAdd(false)}>Cancel</button>
                <button className="btn btn-white btn-sm" onClick={addManual}>Save</button>
              </div>
            </div>
          )}
          {memories.length===0&&<div className="empty">Nothing stored yet — use Chat to add memories naturally</div>}
          {Object.entries(grouped).map(([cat,items])=>(
            <div key={cat} style={{marginBottom:14}}>
              <div style={{fontSize:"0.58rem",textTransform:"uppercase",letterSpacing:"0.1em",color:"rgba(255,255,255,0.35)",fontWeight:500,marginBottom:6}}>{cat}</div>
              {items.map(m=>(
                <div key={m.id} className="mem-item" style={{display:"flex",alignItems:"flex-start",gap:8}}>
                  {editId===m.id ? (
                    <>
                      <input className="inp" value={editTxt} onChange={e=>setEditTxt(e.target.value)} onKeyDown={e=>e.key==="Enter"&&saveEdit(m.id)} style={{flex:1,marginBottom:0}} autoFocus/>
                      <button className="btn btn-white btn-sm" onClick={()=>saveEdit(m.id)}>Save</button>
                      <button className="btn btn-ghost btn-sm" onClick={()=>setEditId(null)}>×</button>
                    </>
                  ) : (
                    <>
                      <div style={{flex:1}}>{m.text}</div>
                      <button className="btn btn-ghost btn-sm" onClick={()=>{setEditId(m.id);setEditTxt(m.text);}} style={{fontSize:"0.62rem",padding:"2px 7px",flexShrink:0}}>Edit</button>
                      <button className="row-del" onClick={()=>removeM(m.id)}>×</button>
                    </>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── APP ───────────────────────────────────────────────────────────────────────
export default function App() {
  const [tabIdx, setTabIdx] = useState(0);
  const [shopping, setShopping] = useState(INIT_SHOPPING);
  const [events, setEvents] = useState(INIT_EVENTS);
  const [sources, setSources] = useState(DEFAULT_SOURCES);
  const [holidays, setHolidays] = useState(INIT_HOLIDAYS);
  const [tasks, setTasks]       = useState(INIT_TASKS);
  const [memories, setMemories] = useState(INIT_MEMORIES);
  const time = useTime();

  // Swipe state
  const trackRef  = useRef(null);
  const startX    = useRef(null);
  const startY    = useRef(null);
  const dragging  = useRef(false);
  const dragDelta = useRef(0);
  const [animated, setAnimated] = useState(true);
  const [visited, setVisited] = useState(new Set([0]));

  const goTo = (idx) => {
    const i = typeof idx === "number" ? idx : TABS.findIndex(t=>t.key===idx);
    setAnimated(true);
    setTabIdx(i);
    setVisited(v => new Set([...v, i]));
  };

  // Touch handlers for swipe
  const onTouchStart = (e) => {
    startX.current = e.touches[0].clientX;
    startY.current = e.touches[0].clientY;
    dragging.current = false;
    dragDelta.current = 0;
    setAnimated(false);
  };
  const onTouchMove = (e) => {
    if(!startX.current) return;
    const dx = e.touches[0].clientX - startX.current;
    const dy = e.touches[0].clientY - startY.current;
    if(!dragging.current && Math.abs(dy)>Math.abs(dx)) return; // vertical scroll wins
    if(!dragging.current && Math.abs(dx)>8) dragging.current=true;
    if(!dragging.current) return;
    dragDelta.current = dx;
    if(trackRef.current) {
      const base = -tabIdx * 100;
      trackRef.current.style.transform = `translateX(calc(${base}% + ${dx}px))`;
    }
  };
  const onTouchEnd = () => {
    if(!dragging.current) { setAnimated(true); return; }
    const dx = dragDelta.current;
    const threshold = 60;
    let next = tabIdx;
    if(dx < -threshold && tabIdx < TABS.length-1) next = tabIdx+1;
    if(dx > threshold  && tabIdx > 0)             next = tabIdx-1;
    setAnimated(true);
    if(trackRef.current) trackRef.current.style.transform="";
    setTabIdx(next);
    setVisited(v => new Set([...v, next]));
    dragging.current=false; startX.current=null;
  };

  const timeStr = `${pad(time.getHours())}:${pad(time.getMinutes())}`;
  const dateStr2 = `${DOW[time.getDay()]}, ${time.getDate()} ${MONTH_S[time.getMonth()]}`;

  const tabName = TABS[tabIdx].label;

  return (
    <>
      <style>{css}</style>
      <div className="shell">
        {/* Header */}
        <div className="hdr">
          <div className="hdr-left">
            <div className="hdr-logo">MAJI</div>
            <div className="hdr-tab-name">{tabName}</div>
          </div>
          <div className="hdr-right">
            <div className="hdr-time">{timeStr}</div>
            <div className="hdr-date">{dateStr2}</div>
          </div>
        </div>

        {/* Dot indicators */}
        <div className="dot-row">
          {TABS.map((t,i)=>(
            <div key={t.key} className={`dot${i===tabIdx?" active":""}`} onClick={()=>goTo(i)}/>
          ))}
        </div>

        {/* Swipe viewport */}
        <div
          className="viewport"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <div
            ref={trackRef}
            className="track"
            style={{
              transform: `translateX(-${tabIdx*100}%)`,
              transition: animated ? "transform 0.36s cubic-bezier(0.4,0,0.2,1)" : "none",
            }}
          >
            {TABS.map((t,i) => (
              <div key={t.key} className={`page ${t.zone}`}>
                {visited.has(i) && i===0 && <BriefTab events={events} shopping={shopping} holidays={holidays} memories={memories} goTo={goTo}/>}
                {visited.has(i) && i===1 && <WeatherTab/>}
                {visited.has(i) && i===2 && <CalendarTab events={events} setEvents={setEvents}/>}
                {visited.has(i) && i===3 && <ShoppingTab items={shopping} setItems={setShopping}/>}
                {visited.has(i) && i===4 && <MealsTab shopping={shopping} sources={sources} setSources={setSources}/>}
                {visited.has(i) && i===5 && <HolidaysTab holidays={holidays} setHolidays={setHolidays}/>}
                {visited.has(i) && i===6 && <TasksTab tasks={tasks} setTasks={setTasks}/>}
                {visited.has(i) && i===7 && <MemoryTab memories={memories} setMemories={setMemories}/>}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom nav */}
        <div className="nav">
          {TABS.map((t,i)=>(
            <button key={t.key} className={`nav-btn${i===tabIdx?" active":""}`} onClick={()=>goTo(i)}>
              <div className="nav-pip">{t.icon}</div>
              <div className="nav-lbl">{t.label}</div>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
