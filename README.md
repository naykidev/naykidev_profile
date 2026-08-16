# Aaron Nayki — Campus Portfolio

Interactive 3D portfolio set on a stylized University of Wisconsin–Madison campus.

## Stack

React, TypeScript, Vite, Tailwind CSS, Three.js, React Three Fiber, Drei.

## Develop

```bash
npm install
npm run dev
```

Live site: [https://naykidev.github.io/naykidev_profile/](https://naykidev.github.io/naykidev_profile/)

## Structure

Portfolio copy lives in `src/data`. Interactable locations are declared in `src/data/locations.ts` and wired through a generic panel system.

The first vertical slice is Bascom Hill / Bascom Hall. Additional districts are sketched so internships, research, and new projects can be added without rewriting the scene graph.
