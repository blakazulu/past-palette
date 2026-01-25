# Gallery Lighting & Vines Enhancement Design

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace simple polygon lighting and vines with realistic textured elements - central chandelier, wall sconces, and ivy-wrapped columns.

**Architecture:** Load Poly Haven glTF chandelier model, create procedural torch sconces with bronze PBR textures, wrap all 6 columns with alpha-mapped ivy vine textures.

**Tech Stack:** React Three Fiber, @react-three/drei (useGLTF, useTexture), THREE.js materials with PBR textures

---

## 1. Lighting Architecture

### Central Chandelier
- Load Poly Haven Chandelier_01 glTF model (1K resolution)
- Position: (0, 7.5, 0) - hanging from 8m ceiling
- 6 point lights matching chandelier lamp positions
- Warm color: #FFE4B5, intensity ~1.2 each, distance 12m

### Wall Sconces (12 total)
- Placement: 4 per long wall (North at z=-14, South at z=14), 2 per short wall (East/West at x=±16)
- Height: 3m, evenly spaced between artwork frames
- Components per sconce:
  - Bronze bracket mesh with PBR texture
  - Decorative flame bulb (emissive material)
  - Point light: #FFE4B5, intensity 0.8, distance 8m

### Light Removal
- Remove existing 3x3 ceiling grid lights from GalleryRoom.tsx
- Reduce ambient light intensity (sconces + chandelier provide atmosphere)

---

## 2. Ivy Vines on Columns

### Texture Approach
- Ivy leaf texture with alpha transparency (PNG)
- Double-sided material with alphaTest for leaf cutouts
- Optional normal map for depth

### Vine Geometry
- Spiral path: 3-4 rotations from base to 2/3 column height (~4m)
- Main stem: textured cylinder following spiral
- Leaf clusters: alpha-mapped planes at intervals
- 2-3 intertwining vine strands per column

### Coverage
- All 6 columns (4 corners + 2 central)
- Base to ~4m height (capitals remain visible)
- Randomized starting angles per column
- Slight density variation for natural look

### Performance
- Instanced geometry for leaves
- Shared materials across all vines
- ~500 leaves per column, ~3000 total
- alphaTest (not alphaBlend) for performance

---

## 3. Assets Required

### Models
| File | Source | Size |
|------|--------|------|
| `public/models/chandelier_01_1k.gltf` | Poly Haven | ~1MB |

### Textures
| File | Source | Purpose |
|------|--------|---------|
| `public/textures/ivy_leaves_diff.png` | FreePBR/ambientCG | Ivy diffuse + alpha |
| `public/textures/ivy_leaves_norm.png` | FreePBR/ambientCG | Ivy normal (optional) |
| `public/textures/bronze_diff.jpg` | cgbookcase | Sconce bracket diffuse |
| `public/textures/bronze_rough.jpg` | cgbookcase | Sconce bracket roughness |
| `public/textures/bronze_metal.jpg` | cgbookcase | Sconce bracket metalness |

---

## 4. Component Structure

### New Components
- `Chandelier.tsx` - Loads glTF, positions lights
- `WallSconces.tsx` - 12 torch sconces with bronze texture
- `ColumnVines.tsx` - Textured ivy wrapping all columns

### Modified Components
- `GalleryRoom.tsx` - Remove 9-light ceiling grid
- `GalleryPlants.tsx` - Remove old ColumnVines, keep PalmUrns
- `elements/index.ts` - Export new components
- `GalleryTourPage.tsx` - Integrate new lighting/vine components

---

## 5. Loading Strategy

- `useGLTF` with Suspense for chandelier
- `useTexture` for all PBR textures
- Proper disposal on unmount (materials, geometries)
- Preload critical assets
