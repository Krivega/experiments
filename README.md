# Experiments

[![Demo](https://img.shields.io/badge/demo-online-brightgreen?style=flat-square)](https://krivega.github.io/experiments/)

Monorepo of small web demos and shared libraries (Yarn workspaces, Lerna). Apps use Vite; shared code lives under `packages/`.

## Apps (`packages/apps/`)

| Package               | Description                                      |
| --------------------- | ------------------------------------------------ |
| **camera-test**       | React + MUI: `getUserMedia`, camera / user media |
| **noise-suppression** | Audio worklets: RNNoise / DTLN noise suppression |

Run locally (HTTPS may be required for camera/mic):

```bash
yarn install
yarn workspace camera-test start
# or
yarn workspace noise-suppression start
```

## Shared packages (`packages/`)

Libraries consumed by apps: `@experiments/components`, `mediastream-api`, `system-devices`, `video-processor`, `audio-utils`, `utils`, `timeout-requester`, and the `@experiments/noise-suppression` worklet bundle.

## Root scripts

| Command           | Purpose                                                                                                                           |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `yarn lint`       | Lint all workspaces                                                                                                               |
| `yarn test`       | Run module tests, then app tests                                                                                                  |
| `yarn build:demo` | Build both apps into `demoDist/` (camera-test, noise-suppression) and copy `scripts/gh-pages-index.html` as `demoDist/index.html` |

GitHub Actions (`.github/workflows/pages.yml`) deploys the demo build to GitHub Pages on pushes to `main` / `master`.

## Requirements

- Node.js (see CI: Node 24)
- Yarn
