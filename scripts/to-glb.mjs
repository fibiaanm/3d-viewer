/**
 * Converts a .gltf file (with external .bin and textures) to a self-contained .glb
 *
 * Usage:
 *   node scripts/to-glb.mjs <input.gltf> [output.glb]
 *
 * If output path is omitted, writes next to the input file with .glb extension.
 * Place the input file in temporal/ and the output will go to temporal/ as well.
 *
 * Example:
 *   node scripts/to-glb.mjs temporal/scene.gltf
 *   node scripts/to-glb.mjs temporal/scene.gltf public/products/my_product/model.glb
 */

import { NodeIO } from '@gltf-transform/core'
import { KHRONOS_EXTENSIONS } from '@gltf-transform/extensions'
import { resolve, dirname, basename, extname } from 'path'
import { existsSync } from 'fs'

const [,, inputArg, outputArg] = process.argv

if (!inputArg) {
  console.error('Usage: node scripts/to-glb.mjs <input.gltf> [output.glb]')
  process.exit(1)
}

const inputPath = resolve(inputArg)

if (!existsSync(inputPath)) {
  console.error(`File not found: ${inputPath}`)
  process.exit(1)
}

const outputPath = outputArg
  ? resolve(outputArg)
  : resolve(dirname(inputPath), basename(inputPath, extname(inputPath)) + '.glb')

const io = new NodeIO().registerExtensions(KHRONOS_EXTENSIONS)

console.log(`Reading  ${inputPath}`)
const document = await io.read(inputPath)

console.log(`Writing  ${outputPath}`)
await io.write(outputPath, document)

console.log('Done.')
