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
    default: 'vite-three-project',
    validate: (input) => {
      if (!input.trim()) return 'Project name cannot be empty'
      if (!/^[a-zA-Z0-9-_]+$/.test(input)) return 'Project name can only contain letters, numbers, hyphens, and underscores'
      return true
    }
  },
  {
    name: 'projectType',
    type: 'list',
    message: 'Select a project type:',
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

const getExtension = (variant) => variant === 'TypeScript' ? 'ts' : 'js'

const indexHtmlTemplate = (projectName, variant) => `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${projectName}</title>
    <link rel="stylesheet" href="/src/styles.css" />
  </head>
  <body>
    <script type="module" src="/src/main.${getExtension(variant)}"></script>
  </body>
</html>
`

// Tailwind CSS v4 uses the new @import syntax
const stylesCssTemplate = (tailwind) => `${tailwind ? `@import "tailwindcss";

` : ''}body {
  margin: 0;
  padding: 0;
  background-color: #000;
}
`

const packageJson = (projectName, variant) => ({
  name: projectName,
  version: '1.0.0',
  description: 'Vite Three.js Project',
  type: 'module',
  scripts: {
    dev: 'vite',
    build: variant === 'TypeScript' ? 'tsc && vite build' : 'vite build',
    preview: 'vite preview'
  }
})

const tsConfig = {
  compilerOptions: {
    target: 'ES2020',
    useDefineForClassFields: true,
    module: 'ESNext',
    lib: ['ES2020', 'DOM', 'DOM.Iterable'],
    skipLibCheck: true,
    moduleResolution: 'bundler',
    allowImportingTsExtensions: true,
    isolatedModules: true,
    moduleDetection: 'force',
    noEmit: true,
    strict: true,
    noUnusedLocals: true,
    noUnusedParameters: true,
    noFallthroughCasesInSwitch: true,
    esModuleInterop: true,
    resolveJsonModule: true
  },
  include: ['src', 'vite.config.ts']
}

// Tailwind CSS v4 - uses vite plugin, no separate config file needed
const viteConfig = (tailwind) => `import { defineConfig } from 'vite'
import glsl from 'vite-plugin-glsl'
${tailwind ? "import tailwindcss from '@tailwindcss/vite'" : ''}

export default defineConfig({
  plugins: [
    glsl()${tailwind ? ',\n    tailwindcss()' : ''}
  ]
})
`


const mainTemplate = (type, variant) => `import './styles.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
${type === 'shaders' ? `import vertexShader from './shaders/vertex.glsl'
import fragmentShader from './shaders/fragment.glsl'
` : ''}
// Scene setup
const scene = new THREE.Scene()

// Camera setup
const camera = new THREE.PerspectiveCamera(
  ${type === 'basic' ? '45' : '25'},
  window.innerWidth / window.innerHeight,
  0.1,
  1000
)
camera.position.z = 5

// Renderer setup
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
document.body.appendChild(renderer.domElement)

// Controls
const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true

// Geometry and Material
const geometry = new THREE.${type === 'basic' ? 'BoxGeometry(1, 1, 1)' : 'PlaneGeometry(1, 1, 32, 32)'}
const material = ${type === 'shaders' ? `new THREE.ShaderMaterial({
  vertexShader,
  fragmentShader,
  uniforms: {
    uTime: { value: 0 }
  },
  side: THREE.DoubleSide
})` : `new THREE.MeshNormalMaterial()`}
const mesh = new THREE.Mesh(geometry, material)
scene.add(mesh)

// Resize handler
const handleResize${variant === 'TypeScript' ? ': () => void' : ''} = () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
}
window.addEventListener('resize', handleResize)

// Animation loop
const clock = new THREE.Clock()
const animate${variant === 'TypeScript' ? ': () => void' : ''} = () => {
  requestAnimationFrame(animate)
  
  const elapsedTime = clock.getElapsedTime()
  ${type === 'basic' ? `
  mesh.rotation.x = elapsedTime * 0.5
  mesh.rotation.y = elapsedTime * 0.3` : `
  ;(material as THREE.ShaderMaterial).uniforms.uTime.value = elapsedTime`}
  
  controls.update()
  renderer.render(scene, camera)
}

animate()
`


const vertexGlsl = `varying vec2 vUv;
uniform float uTime;

void main() {
  vec3 pos = position;
  pos.z += sin(pos.x * 5.0 + uTime) * 0.1;
  pos.z += sin(pos.y * 5.0 + uTime) * 0.1;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  vUv = uv;
}
`

const fragmentGlsl = `varying vec2 vUv;
uniform float uTime;

void main() {
  vec3 color = vec3(vUv, sin(uTime) * 0.5 + 0.5);
  gl_FragColor = vec4(color, 1.0);

  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`

const glslDts = `declare module '*.glsl' {
  const value: string
  export default value
}
`

const gitignoreTemplate = `# Dependencies
node_modules/

# Build output
dist/

# Editor directories
.vscode/*
!.vscode/extensions.json
.idea/

# Local env files
.env
.env.local
.env.*.local

# Logs
*.log
npm-debug.log*

# OS files
.DS_Store
Thumbs.db
`

process.on('SIGINT', () => {
  console.log('\n✖ Operation cancelled')
  process.exit()
})

const runCommand = (projectPath, command) => {
  execSync(command, { cwd: projectPath, stdio: 'ignore', shell: true })
}

const executeCommands = (projectPath, commands, progressBar) => {
  commands.forEach((command) => {
    runCommand(projectPath, command)
    progressBar.increment()
  })
}

const startPrompt = async () => {
  try {
    const answers = await inquirer.prompt(questions)
    const { projectName, projectType, tailwind, variant } = answers

    const projectPath = path.join(process.cwd(), projectName)
    
    // Check if directory exists
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
        console.log('Operation cancelled.')
        return
      }
      fs.rmSync(projectPath, { recursive: true, force: true })
    }
    
    fs.mkdirSync(projectPath)

    // Calculate total steps
    const baseSteps = 6 // index.html, src folder, main file, styles, package.json, vite.config
    const shaderSteps = projectType === 'shaders' ? 2 : 0
    const tailwindSteps = tailwind ? 1 : 0 // Just one npm install command for Tailwind v4
    const tsSteps = variant === 'TypeScript' ? 3 : 0
    const npmSteps = 2 // base npm installs
    const totalSteps = baseSteps + shaderSteps + tailwindSteps + tsSteps + npmSteps

    const progressBar = new cliProgress.SingleBar({
      format: colors.blueBright('Setting up project ') + colors.whiteBright('[') + colors.greenBright('{bar}') + colors.whiteBright('] ') + colors.greenBright('{percentage}%'),
      hideCursor: true,
      clearOnComplete: true
    }, cliProgress.Presets.rect)

    console.log('\n')
    progressBar.start(totalSteps, 0)

    // Create index.html
    fs.writeFileSync(path.join(projectPath, 'index.html'), indexHtmlTemplate(projectName, variant))
    progressBar.increment()

    // Create src folder and main file
    const srcPath = path.join(projectPath, 'src')
    fs.mkdirSync(srcPath)
    progressBar.increment()
    
    fs.writeFileSync(path.join(srcPath, `main.${getExtension(variant)}`), mainTemplate(projectType, variant))
    progressBar.increment()
    
    fs.writeFileSync(path.join(srcPath, 'styles.css'), stylesCssTemplate(tailwind))
    progressBar.increment()

    // Create shader files if needed
    if (projectType === 'shaders') {
      const shadersPath = path.join(srcPath, 'shaders')
      fs.mkdirSync(shadersPath)
      fs.writeFileSync(path.join(shadersPath, 'vertex.glsl'), vertexGlsl)
      progressBar.increment()
      fs.writeFileSync(path.join(shadersPath, 'fragment.glsl'), fragmentGlsl)
      progressBar.increment()
    }

    // Create package.json
    fs.writeFileSync(path.join(projectPath, 'package.json'), JSON.stringify(packageJson(projectName, variant), null, 2))
    progressBar.increment()

    // Install base dependencies
    executeCommands(projectPath, [
      'npm install three@latest --save',
      'npm install vite@latest vite-plugin-glsl@latest --save-dev'
    ], progressBar)

    // Install Tailwind CSS v4 (new setup - just one package with vite plugin)
    if (tailwind) {
      executeCommands(projectPath, [
        'npm install @tailwindcss/vite tailwindcss@latest --save-dev'
      ], progressBar)
    }

    // Setup TypeScript if selected
    if (variant === 'TypeScript') {
      executeCommands(projectPath, [
        'npm install typescript @types/three --save-dev'
      ], progressBar)
      fs.writeFileSync(path.join(projectPath, 'tsconfig.json'), JSON.stringify(tsConfig, null, 2))
      progressBar.increment()
      fs.writeFileSync(path.join(srcPath, 'glsl.d.ts'), glslDts)
      progressBar.increment()
    }

    // Create vite.config.js or vite.config.ts
    const viteConfigExt = variant === 'TypeScript' ? 'ts' : 'js'
    fs.writeFileSync(path.join(projectPath, `vite.config.${viteConfigExt}`), viteConfig(tailwind))
    progressBar.increment()

    // Create public folder and .gitignore
    fs.mkdirSync(path.join(projectPath, 'public'))
    fs.writeFileSync(path.join(projectPath, '.gitignore'), gitignoreTemplate)

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
  Created ${colors.greenBright(`"${projectName}"`)} - a ${colors.blueBright('Vite')} + ${colors.magentaBright('Three.js')} project
  ${variant === 'TypeScript' ? colors.blueBright('TypeScript') + ' • ' : ''}${projectType === 'shaders' ? colors.cyan('GLSL Shaders') + ' • ' : ''}${tailwind ? colors.cyan('Tailwind CSS v4') : ''}

${colors.blueBright('  Next steps:')}

  ${colors.gray('$')} cd ${colors.cyan(projectName)}
  ${colors.gray('$')} npm run ${colors.magentaBright('dev')}

`)

  } catch (error) {
    if (error.name === 'ExitPromptError') {
      console.log('\n✖ Operation cancelled')
    } else {
      console.error(colors.red('An error occurred:'), error.message)
    }
  }
}

startPrompt()
