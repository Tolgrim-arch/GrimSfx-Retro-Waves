# GrimSfx - Retro Waves

[![Live Demo](https://img.shields.io/badge/LIVE_DEMO-GrimSfx_Retro_Waves-00f0ff?style=for-the-badge&logo=githubpages&logoColor=090a0f)](https://tolgrim-arch.github.io/GrimSfx-Retro-Waves/)

> **Prueba la app en vivo:** [https://tolgrim-arch.github.io/GrimSfx-Retro-Waves/](https://tolgrim-arch.github.io/GrimSfx-Retro-Waves/)

8-bit Retro Sound Effect Synthesizer (Bfxr/Sfxr style) built with the Web Audio API, modular ES6 JavaScript, responsive mobile/desktop UI, and full English/Spanish (`EN`/`ES`) localization.

## Project Structure

```text
GrimSfx-Retro-Waves/
├── index.html                  # Semantic responsive HTML shell
├── css/
│   ├── variables.css           # Design tokens & theme colors
│   ├── components.css          # Arcade sliders, CRT screen, mobile touch targets
│   └── styles.css              # Main CSS entry point
└── js/
    ├── main.js                 # App bootstrap & event wiring
    ├── i18n/
    │   ├── en.js               # English dictionary
    │   ├── es.js               # Spanish dictionary
    │   └── i18n.js             # Localization engine
    ├── audio/
    │   ├── synth-engine.js     # Web Audio API synthesis engine
    │   ├── presets.js          # Preset generators, mutator & randomizer
    │   └── wav-exporter.js     # 16-bit PCM WAV encoder
    └── ui/
        ├── controls.js         # DRY slider group factory
        ├── visualizer.js       # CRT oscilloscope renderer
        └── history.js          # Recent sounds history
```
