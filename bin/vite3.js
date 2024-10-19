#!/usr/bin/env node
import inquirer from 'inquirer'
import { execSync } from 'child_process'
import path from 'path'
import fs from 'fs'
import cliProgress from 'cli-progress'
import colors from 'ansi-colors'

const templates = ['basic', 'shaders']

const questions = [
  {
    name: 'projectName',
    type: 'input',
    message: 'Project name:',
    default: 'vite-three-project'
  },
  {
    name: 'projectType',
    type: 'list',
    message: 'Select a Project type:',
    choices: templates
  },
  {
    name: 'variant',
    type: 'list',
    message: 'Select a variant:',
    choices: ['JavaScript', 'TypeScript']
  },
  {
    name: 'tailwind',
    type: 'confirm',
    message: 'Do you want to include Tailwind CSS?',
    default: false
  }
]

const indexHtmlTemplate = (projectName, variant) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${projectName}</title>
    <link rel="stylesheet" href="/styles.css">
</head>
<body>
    <script type="module" src="/src/main.${variant === 'TypeScript' ? 'ts' : 'js'}"></script>
</body>
</html>
`

const stylesCssTemplate = (tailwind) => `
${tailwind ? `
@tailwind base;
@tailwind components;
@tailwind utilities;
` : ''} 
body {
    margin: 0;
    padding: 0;
    background-color: #000;
}
`

const packageJson = (projectName, variant) => ({
  name: projectName,
  version: "1.0.0",
  description: "Vite Three.js Project",
  main: "src/main.js",
  type: "module",
  scripts: {
    dev: "vite",
    build: variant === 'TypeScript' ? "tsc && vite build" : "vite build"
  },
})

const tsConfig = {
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"]
}

const tailwindConfig = `
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx,vue}'],
  theme: {
    extend: {},
  },
  plugins: [],
}
`.trim()

const viteConfig = (tailwind) => `
import { defineConfig } from 'vite'
import glsl from 'vite-plugin-glsl'
${tailwind ? "import tailwindcss from 'tailwindcss'" : ''}

export default defineConfig({
  plugins: [glsl()],
  ${tailwind ? 'css : { postcss: { plugins: [tailwindcss()] } },' : ''}
})
`.trim()


const mainJsTemplate = (type) => `
import './styles.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
${type === 'shaders' ? `
import vertexShader from './shaders/vertex.glsl'
import fragmentShader from './shaders/fragment.glsl'` : ''}

const scene = new THREE.Scene()

const camera = new THREE.PerspectiveCamera(${type === 'basic' ? '45' : '25'}, window.innerWidth / window.innerHeight, 0.1, 1000)
camera.position.z = 5

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true

const geometry = new THREE.${type === 'basic' ? 'BoxGeometry(1, 1, 1)' : 'PlaneGeometry(1, 1, 32, 32)'}
const material = ${type === 'shaders' ? `new THREE.ShaderMaterial({
  vertexShader,
  fragmentShader,
  uniforms: {
    time: { value: 0 }
   },
   side: THREE.DoubleSide
  })` : `new THREE.MeshBasicMaterial({color: 0x00ff55})`}
const mesh = new THREE.Mesh(geometry, material)
scene.add(mesh)

const fit = () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
}

window.addEventListener('resize', fit)

const clock = new THREE.Clock()
const animate = () => {
  requestAnimationFrame(animate)
  ${type === 'basic' ? 'mesh.rotation.x += 0.01;\nmesh.rotation.y += 0.01;' : 'material.uniforms.time.value = clock.getElapsedTime();'}
  renderer.render(scene, camera)
}

fit()
animate()
  `.trim()


const vertexGlsl = `
varying vec2 vUv;
uniform float time;
void main() {
  vec3 pos = position;
  pos.y += sin(time);

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);

  vUv = uv;
}
`.trim()

const fragmentGlsl = `
varying vec2 vUv;
uniform float time;
void main() {
  gl_FragColor = vec4(vUv,sin(time), 1.0);

  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`.trim()

const glslDts = `
declare module '*.glsl' {
  const value: string
  export default value
}
`.trim()

process.on('SIGINT', () => {
  console.log('\n✖ Operation cancelled')
  process.exit()
})

const executeCommands = (projectPath, commands, progressBar) => {
  commands.forEach((command, index) => {
    execSync(`cd ${projectPath} && ${command}`, { stdio: 'ignore' })
    progressBar.increment()
  })
}

const startPrompt = async () => {
  try {
    const answers = await inquirer.prompt(questions)
    const { projectName, projectType, tailwind, variant } = answers

    const projectPath = path.join(process.cwd(), projectName)
    if (fs.existsSync(projectPath)) {
      const { overwrite } = await inquirer.prompt([
        {
          name: 'overwrite',
          type: 'confirm',
          message: `Directory ${projectName} already exists. Do you want to overwrite it?`,
          default: false
        }
      ])
      if (!overwrite) {
        console.log('Operation terminated.')
        return
      }
      fs.rmSync(projectPath, { recursive: true, force: true })
    }
    fs.mkdirSync(projectPath)

    const totalSteps = 5 + (projectType === 'shaders' ? 2 : 0) + (tailwind ? 2 : 0) + (variant === 'TypeScript' ? 3 : 0)
    const progressBar = new cliProgress.SingleBar({
      format: colors.blueBright('Installing dependencies ') + colors.whiteBright('[') + colors.greenBright('{bar}') + colors.whiteBright('] ') + colors.greenBright('{percentage}%'),
      hideCursor: true,
      clearOnComplete: true
    }, cliProgress.Presets.rect)

    console.log('\n')
    progressBar.start(totalSteps, 0)

    fs.writeFileSync(path.join(projectPath, 'index.html'), indexHtmlTemplate(projectName, variant))
    progressBar.increment()

    const srcPath = path.join(projectPath, 'src')
    fs.mkdirSync(srcPath)
    fs.writeFileSync(path.join(srcPath, `main.${variant === 'TypeScript' ? 'ts' : 'js'}`), mainJsTemplate(projectType, variant))
    progressBar.increment()
    fs.writeFileSync(path.join(projectPath, 'src/styles.css'), stylesCssTemplate(tailwind))
    progressBar.increment()

    if (projectType === 'shaders') {
      const shadersPath = path.join(srcPath, 'shaders')
      fs.mkdirSync(shadersPath)
      fs.writeFileSync(path.join(shadersPath, 'vertex.glsl'), vertexGlsl)
      fs.writeFileSync(path.join(shadersPath, 'fragment.glsl'), fragmentGlsl)
      progressBar.increment(2)
    }

    fs.writeFileSync(path.join(projectPath, 'package.json'), JSON.stringify(packageJson(projectName), null, 2))
    progressBar.increment()

    executeCommands(projectPath, [
      'npm install three@latest --save',
      'npm install vite@latest vite-plugin-glsl@latest --save-dev',
      ...(variant === 'TypeScript' ? ['npm install typescript @types/node --save-dev'] : [])
    ], progressBar)

    if (tailwind) {
      executeCommands(projectPath, [
        'npm install -D tailwindcss postcss autoprefixer',
        'npx tailwindcss init -p'
      ], progressBar)
      fs.writeFileSync(path.join(projectPath, 'tailwind.config.js'), tailwindConfig)
      progressBar.increment(2)
    }

    if (variant === 'TypeScript') {
      executeCommands(projectPath, [
        'npm install typescript @types/node --save-dev',
        'npm i --save-dev @types/three'
      ], progressBar)
      fs.writeFileSync(path.join(projectPath, 'tsconfig.json'), JSON.stringify(tsConfig, null, 2))
      fs.writeFileSync(path.join(projectPath, 'src/glsl.d.ts'), glslDts)
      progressBar.increment(3)
    }

    fs.writeFileSync(path.join(projectPath, 'vite.config.js'), viteConfig(tailwind))
    progressBar.increment()

    fs.mkdirSync(path.join(projectPath, 'public'))
    progressBar.increment()

    progressBar.stop()

    console.clear()
    console.log(`${colors.blueBright(`

    
  ██╗   ██╗  ██╗ ████████╗ ███████╗       ██████╗ 
  ██║   ██║  ██║ ╚══██╔══╝ ██╔════╝       ╚════██╗
  ██║   ██║  ██║    ██║    █████╗  █████╗  █████╔╝
  ╚██╗ ██╔╝  ██║    ██║    ██╔══╝  ╚════╝  ╚═══██╗
   ╚████╔╝   ██║    ██║    ███████╗       ██████╔╝
    ╚═══╝    ╚═╝    ╚═╝    ╚══════╝       ╚═════╝            
                                

  `)}
 Created "${colors.greenBright(projectName)}" a ${colors.blueBright('Vite')} + ${colors.blueBright('ThreeJS')} project.\n
${colors.blueBright(' To run the project:\n')}\n cd ${colors.cyan(projectName)} \n npm ${colors.magentaBright('run')} ${colors.blueBright('dev')}`)

  } catch (error) {
    if (error.name === 'ExitPromptError') {
      console.log('\n✖ Operation cancelled')
    } else {
      console.error('An error occurred:', error)
    }
  }
}

startPrompt()
