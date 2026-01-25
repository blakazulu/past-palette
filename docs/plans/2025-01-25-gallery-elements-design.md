# Gallery Elements Design

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add 6 toggleable decorative elements to fill the empty gallery space with an archaeological site aesthetic.

**Architecture:** Each element is a separate React component conditionally rendered based on persisted user settings. Users configure elements on the entrance modal before entering.

**Tech Stack:** React Three Fiber, Zustand (persisted), Three.js geometry primitives

---

## Element Specifications

### 1. Columns (GalleryColumns.tsx)
- **Style:** Weathered sandstone, simple Doric-style capitals
- **Dimensions:** 0.5m diameter, 6m height
- **Positions (6 total):**
  - Corner columns: (-12, 0, -10), (12, 0, -10), (-12, 0, 8), (12, 0, 8)
  - Central flanking: (-4, 0, -2), (4, 0, -2)
- **Material:** MeshStandardMaterial, sandstone color (#D4A574), roughness 0.9

### 2. Central Pedestal (CentralPedestal.tsx)
- **Position:** (0, 0, -2)
- **Base:** Stepped stone, 1.5m wide × 1m tall
- **Top artifact:** Decorative amphora/vase, slowly rotating (0.1 rad/s)
- **Material:** Weathered stone base, terracotta vase

### 3. Wall Alcoves (WallAlcoves.tsx)
- **Purpose:** Break up long side walls, create intimate viewing spaces
- **Positions:** 2 per side wall (4 total)
  - West wall: z = -6, z = 4
  - East wall: z = -6, z = 4
- **Dimensions:** 2m deep × 4m wide × 4m tall partial walls
- **Material:** Same as room walls (white plaster texture)

### 4. Floor Mosaic (FloorMosaic.tsx)
- **Position:** Centered at (0, 0.01, -2), slightly above floor
- **Dimensions:** 6m diameter circle
- **Pattern:** Greek key border with geometric rosette center
- **Material:** MeshBasicMaterial with procedural or texture pattern

### 5. Plants (GalleryPlants.tsx)
**Urns with Palms (6 total):**
- Positions: Alcove entrances (4) + flanking entrance door (2)
- Urn: Terracotta, 0.4m diameter × 0.6m tall
- Palm fronds: Simple planes, 2m height

**Column Vines (on 2 central columns):**
- Curved cylinder geometry wrapping column
- Green/brown material, 0-3m height range

### 6. Statues (GalleryStatues.tsx)
- **Sphinxes (2):** Flanking central pedestal at (-6, 0, -2), (6, 0, -2)
- **Anubis (1):** Back corner alcove
- **Lion (1):** Another alcove
- **Dimensions:** ~1.2m tall on 0.2m stone base
- **Material:** Sandstone (#C9B896), roughness 0.85

---

## State Management

Add to `useSettingsStore` in `src/stores/appStore.ts`:

```typescript
interface GalleryElements {
  columns: boolean;
  centralDisplay: boolean;
  alcoves: boolean;
  floorMosaic: boolean;
  plants: boolean;
  statues: boolean;
}

// In SettingsState:
galleryElements: GalleryElements;
setGalleryElement: (key: keyof GalleryElements, value: boolean) => void;

// Defaults (all enabled):
galleryElements: {
  columns: true,
  centralDisplay: true,
  alcoves: true,
  floorMosaic: true,
  plants: true,
  statues: true,
}
```

---

## UI: Entrance Modal Enhancement

Add collapsible "Customize Gallery" section to instructions overlay:

```tsx
const [showCustomize, setShowCustomize] = useState(false);
const { galleryElements, setGalleryElement } = useSettingsStore();

// In JSX, after instructions:
<button onClick={() => setShowCustomize(!showCustomize)}>
  {showCustomize ? '▲' : '▼'} Customize Gallery
</button>

{showCustomize && (
  <div className="grid grid-cols-2 gap-2">
    {Object.entries(galleryElements).map(([key, value]) => (
      <label key={key}>
        <input
          type="checkbox"
          checked={value}
          onChange={(e) => setGalleryElement(key, e.target.checked)}
        />
        {formatLabel(key)}
      </label>
    ))}
  </div>
)}
```

---

## Component Integration

In `GalleryTourPage.tsx`, inside Canvas/Suspense:

```tsx
const { galleryElements } = useSettingsStore();

// Inside Canvas:
{galleryElements.columns && <GalleryColumns />}
{galleryElements.centralDisplay && <CentralPedestal />}
{galleryElements.alcoves && <WallAlcoves />}
{galleryElements.floorMosaic && <FloorMosaic />}
{galleryElements.plants && <GalleryPlants />}
{galleryElements.statues && <GalleryStatues />}
```

---

## File Structure

```
src/components/gallery-tour/elements/
├── index.ts
├── GalleryColumns.tsx
├── CentralPedestal.tsx
├── WallAlcoves.tsx
├── FloorMosaic.tsx
├── GalleryPlants.tsx
└── GalleryStatues.tsx
```

---

## Performance Considerations

- All geometry is simple primitives (cylinders, boxes, planes)
- No external 3D models required
- Materials are reused where possible via useMemo
- Elements only render if enabled (no hidden overhead)
- Dispose materials/geometry on unmount

---

## Collision Boundaries

Update `GALLERY_BOUNDS` or add collision detection for:
- Columns (0.5m radius cylinders)
- Central pedestal (1.5m × 1.5m)
- Alcove walls (player can enter alcoves but not walk through walls)
