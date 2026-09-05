import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import subsetFont from 'subset-font'

const project = path.resolve(fileURLToPath(new URL('..', import.meta.url)))
const corpusPaths = [
  'index.html',
  'README-中文.md',
  '操作表.txt',
  'src/App.tsx',
  'src/poster.ts',
  'src/data/shots.ts',
]

const documents = await Promise.all(corpusPaths.map((relative) => fs.readFile(path.join(project, relative), 'utf8')))
const utilityCharacters = [
  'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  'abcdefghijklmnopqrstuvwxyz',
  '0123456789',
  ' !"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~',
  '，。；：！？、“”‘’（）《》【】—…·×',
].join('')
const characters = [...new Set([...documents.join('\n'), ...utilityCharacters])].join('')

const fonts = [
  ['NotoSansSC-Regular.otf', 'NotoSansSC-Regular-subset.woff2'],
  ['NotoSansSC-Bold.otf', 'NotoSansSC-Bold-subset.woff2'],
]

for (const [sourceName, outputName] of fonts) {
  const sourcePath = path.join(project, 'assets', 'source-fonts', sourceName)
  const outputPath = path.join(project, 'public', 'assets', 'fonts', outputName)
  const source = await fs.readFile(sourcePath)
  const output = await subsetFont(source, characters, { targetFormat: 'woff2' })
  await fs.writeFile(outputPath, output)
  console.log(`${sourceName}: ${source.byteLength} -> ${output.byteLength} bytes (${characters.length} glyph requests)`)
}
