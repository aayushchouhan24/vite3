# Vite-3

<p align="center">
  <img src="https://ik.imagekit.io/technoaayush/vite-3/banner" alt="Vite-3 Banner" />
</p>

<p align="center">
  <strong>⚡ Scaffold Vite + Three.js projects in seconds</strong>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/vite-3"><img src="https://img.shields.io/npm/v/vite-3.svg?style=flat-square&color=blue" alt="npm version" /></a>
  <a href="https://www.npmjs.com/package/vite-3"><img src="https://img.shields.io/npm/dm/vite-3.svg?style=flat-square&color=green" alt="npm downloads" /></a>
  <a href="https://github.com/aayushchouhan24/vite-3/blob/main/LICENSE"><img src="https://img.shields.io/npm/l/vite-3.svg?style=flat-square" alt="license" /></a>
</p>

---

**Vite-3** is a CLI tool that scaffolds production-ready Vite + Three.js projects with zero configuration. Choose your language, pick a template, and start building 3D experiences instantly.

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🚀 **Lightning Fast** | Powered by Vite for instant HMR and blazing fast builds |
| 📦 **Zero Config** | Pre-configured project setup, just run and code |
| 🎨 **Multiple Templates** | Basic geometry or GLSL shader projects |
| 📘 **TypeScript Ready** | Full TypeScript support with proper types |
| 🎨 **Tailwind CSS v4** | Optional modern CSS framework integration |
| 🔮 **GLSL Support** | Built-in shader support via vite-plugin-glsl |

## 📦 Installation

```bash
# Install globally
npm install -g vite-3

# Or use directly with npx
npx vite-3
```

## 🚀 Quick Start

```bash
vite3
```

You'll be prompted to configure your project:

```
? Project name: my-3d-app
? Select a project type: basic / shaders
? Select a variant: JavaScript / TypeScript
? Do you want to include Tailwind CSS? Yes / No
```

Then start developing:

```bash
cd my-3d-app
npm run dev
```

## 📁 Project Structure

```
my-3d-app/
├── public/                 # Static assets
├── src/
│   ├── main.js|ts          # Three.js entry point
│   ├── styles.css          # Styles (with Tailwind if selected)
│   ├── shaders/            # GLSL files (shader template only)
│   │   ├── vertex.glsl
│   │   └── fragment.glsl
│   └── glsl.d.ts           # GLSL type definitions (TypeScript only)
├── index.html              # HTML entry point
├── package.json
├── vite.config.js
├── tsconfig.json           # TypeScript only
└── .gitignore
```

## 📜 Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |

## 🎯 Templates

### Basic
A simple Three.js scene with:
- Rotating cube with `MeshNormalMaterial`
- OrbitControls for camera interaction
- Responsive canvas with proper pixel ratio handling

### Shaders
A GLSL shader playground with:
- Custom vertex and fragment shaders
- Time-based uniforms for animations
- Wave displacement effect

## 🎨 Tailwind CSS v4

When enabled, Tailwind CSS v4 is configured with the new CSS-first approach:

```css
/* src/styles.css */
@import "tailwindcss";

/* Your custom styles */
```

No separate config file needed - Tailwind v4 uses CSS for configuration.

## 🌟 Author

<table>
  <tr>
    <td align="center">
      <a href="https://github.com/aayushchouhan24">
        <img src="https://gravatar.com/userimage/226260988/f5429ad9b09c533449dab984eb05cdbf.jpeg?size=256" width="100px;" alt="Aayush Chouhan" style="border-radius: 50%;" />
        <br />
        <sub><b>Aayush Chouhan</b></sub>
      </a>
      <br />
      <a href="https://www.instagram.com/aayushchouhan_24/" title="Instagram"><img src="https://img.shields.io/badge/-Instagram-E4405F?style=flat-square&logo=instagram&logoColor=white" /></a>
      <a href="https://www.linkedin.com/in/aayushchouhan24/" title="LinkedIn"><img src="https://img.shields.io/badge/-LinkedIn-0077B5?style=flat-square&logo=linkedin&logoColor=white" /></a>
      <a href="https://github.com/aayushchouhan24" title="GitHub"><img src="https://img.shields.io/badge/-GitHub-181717?style=flat-square&logo=github&logoColor=white" /></a>
    </td>
  </tr>
</table>

## 🤝 Contributing

Contributions are welcome! Feel free to:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT © [Aayush Chouhan](https://github.com/aayushchouhan24)

---

<p align="center">
  Built with ❤️ using
  <a href="https://vite.dev/">Vite</a> •
  <a href="https://threejs.org/">Three.js</a> •
  <a href="https://tailwindcss.com/">Tailwind CSS</a>
</p>
