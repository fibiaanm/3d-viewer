# 3D Viewer

Vue 3 + TypeScript product viewer with a Three.js canvas, contract-driven controls, and material swatches. No backend — all data is static JSON in `public/`.

## Views

| View | Route | Description |
|------|-------|-------------|
| CatalogView | `/` | Grid of products from `catalog.json` |
| PreviewerView | `/products/:id` | 3D canvas + info + dynamic controls |

## Data structure

```
public/
  catalog.json                  ← product index
  products/
    <id>/
      product.json              ← display info, modelUrl, contractPath
      contract.json             ← parts, capabilities, lighting
      materials.json            ← material options (color, roughness, texture)
      model.glb                 ← 3D model
      preview.png
      textures/
```

**Flow:** `catalog.json` → `product.json` → `contract.json` + `materials.json`

## Contract

The contract drives the UI dynamically. Each `part` maps to a GLB node by `nodeName`.

- `capabilities.rotate: true` + `transform.rotation` → slider appears
- `lighting.type: "custom"` → overrides ambient / key / fill lights
- All other parts are static (no controls rendered)

## Adding a new model

1. Drop `.gltf` + textures in `temporal/`
2. Convert to GLB: `node scripts/to-glb.mjs temporal/scene.gltf public/products/<id>/model.glb`
3. Create the four JSON files and `textures/` folder under `public/products/<id>/`
4. Add the product to `public/catalog.json`
5. Empty `temporal/`

> `nodeName` in the contract must match the exact node name inside the GLB (case-sensitive).

## Lighting config (contract)

```json
"lighting": {
  "type": "custom",
  "ambient": { "color": "#ffffff", "intensity": 0.5 },
  "key":     { "color": "#ffe4a0", "intensity": 2.0 },
  "fill":    { "color": "#ffaa00", "intensity": 0.7 }
}
```

Use `"type": "normal"` to keep the default neutral lighting.
