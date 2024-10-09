# Vite3 - Vite + ThreeJs App Generator

![Vite3-Logo](https://ik.imagekit.io/technoaayush/Vite3/banner)

**Vite3** is a project generator for creating Vite-based Three.js applications. It provides boilerplate code for both JavaScript and TypeScript projects, with options for Basic or Shader-based templates. Additionally, Tailwind CSS can be integrated for styling.

## ✨ Features

- Supports **JavaScript** and **TypeScript** variants.
- Provides two project types:
  - **Basic**: Simple Three.js project with basic geometry and materials.
  - **Shaders**: Three.js project using custom GLSL shaders.
- Optional integration with **Tailwind CSS**.
- Automatically sets up **Vite** for development and bundling.
- Pre-configured with **Vite GLSL plugin** for shader support.

## 📦 Installation

To install Vite3 globally:

```bash
npm install -g vite3
```

## 🛠️ Usage

Run the following command to scaffold a new Vite Three.js project:

```bash
vite3
```

You will be prompted to provide the following details:

1. **Project Name**: The name of your project.
2. **Project Type**: Choose between `basic` or `shaders`.
3. **Variant**: Choose between `JavaScript` or `TypeScript`.
4. **Tailwind CSS**: Option to include Tailwind CSS for styling.

After answering the prompts, the project structure will be created, and all dependencies will be installed.

## 📑 Project Structure

The generated project will have the following structure:

```
project-name/
│
├── index.html              # Main HTML file
├── package.json            # Project metadata and scripts
├── vite.config.js          # Vite configuration file
├── src/
│   ├── main.js|ts          # Entry point of the Three.js project
│   ├── styles.css          # Main styles (includes Tailwind if selected)
│   └── shaders/            # (For shader projects) GLSL files
├── tsconfig.json           # (For TypeScript projects) TypeScript configuration
└── node_modules/           # Project dependencies
```

## 📜 Available Scripts

Inside the project directory, you can run:

- `npm run dev`: Starts the development server with Vite.
- `npm run build`: Builds the project for production.

For TypeScript projects, the build command will first compile the TypeScript files.

## 🌟 Meet the Visionary Behind Shader3

In the heart of the dynamic world of web development, the creator of Shader is making waves with their unique visions and unwavering determination.

### 🎮 Aayush Chouhan - [@aayushchouhan24](https://github.com/aayushchouhan24)

![Aayush Chouhan](https://gravatar.com/userimage/226260988/f5429ad9b09c533449dab984eb05cdbf.jpeg?size=1024)

Aayush Chouhan, a tech lover and gaming enthusiast, embarked on a journey through cyberspace. From freelancing to diving into web and Android development, he honed his skills in programming languages. Joining Sheryians, he embraced Three.js, immersing himself in the captivating realm of 3D graphics, marking an exciting milestone in his career.

[![Instagram](https://img.shields.io/badge/Instagram-%23E4405F.svg?style=for-the-badge&logo=Instagram&logoColor=white)](https://www.instagram.com/aayushchouhan_24/) [![LinkedIn](https://img.shields.io/badge/linkedin-%230077B5.svg?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/aayushchouhan24/) [![GitHub](https://img.shields.io/badge/github-%23121011.svg?style=for-the-badge&logo=github&logoColor=white)](https://github.com/aayushchouhan24)

## 🤝 Contributing

We welcome contributions! If you have ideas for new features, bug fixes, or improvements, feel free to open an issue or submit a pull request on our [GitHub repository](https://github.com/aayushchouhan24/shader3).

## 📄 License

`Vite3` is licensed under the MIT License. For more information, refer to the [LICENSE](LICENSE) file.

## 🙌 Acknowledgements

- **[Vite](https://vite.dev/):** The Build Tool for the Web.

- **[Three.js](https://threejs.org/):** The core library for 3D rendering.
