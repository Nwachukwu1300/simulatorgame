# Free Assets Guide

This document explains where to download free 3D models and textures to achieve AAA-quality visuals in the Simulator Collection (Coconut, Jungle Idol, and Bench simulators).

## Required Folder Structure

```
public/
├── models/
│   ├── coconut/
│   │   └── coconut.glb
│   ├── environment/
│   │   ├── palm_tree.glb
│   │   ├── rock.glb
│   │   └── rock_large.glb
│   ├── jungle/
│   │   ├── stone_idol.glb
│   │   ├── jungle_tree.glb
│   │   ├── tropical_tree.glb
│   │   ├── fern.glb
│   │   ├── vine.glb
│   │   ├── temple_column.glb
│   │   ├── temple_block.glb
│   │   ├── temple_facade.glb
│   │   ├── ancient_torch.glb
│   │   └── mossy_boulder.glb
│   └── props/
│       ├── dock.glb
│       ├── beach_hut.glb
│       ├── umbrella.glb
│       └── seashell.glb
├── textures/
│   ├── sand/
│   │   ├── albedo.jpg
│   │   ├── normal.jpg
│   │   ├── roughness.jpg
│   │   └── ao.jpg
│   ├── rock/
│   │   ├── albedo.jpg
│   │   ├── normal.jpg
│   │   ├── roughness.jpg
│   │   └── ao.jpg
│   └── jungle/
│       ├── floor_albedo.jpg
│       ├── floor_roughness.jpg
│       ├── floor_normal.jpg
│       ├── floor_ao.jpg
│       ├── moss_albedo.jpg
│       ├── moss_roughness.jpg
│       ├── bark_albedo.jpg
│       ├── bark_roughness.jpg
│       ├── bark_normal.jpg
│       ├── stone_albedo.jpg
│       ├── stone_roughness.jpg
│       ├── stone_normal.jpg
│       └── stone_ao.jpg
└── hdri/
    ├── beach.hdr
    ├── jungle.hdr
    └── sunset.hdr
```

## Where to Download Free Assets

### 3D Models (GLB/GLTF format)

#### Sketchfab (Recommended)
https://sketchfab.com/features/free-3d-models

Search for and download (filter by "Downloadable" and CC license):

**Beach/Coconut Simulator:**

- "coconut" - Multiple options available
- "palm tree low poly" or "palm tree realistic"
- "beach rock" or "coastal rock"
- "wooden dock" or "pier"
- "beach hut" or "tiki hut"
- "beach umbrella"
- "seashell"

**Jungle Idol Simulator:**

- "stone idol" or "ancient statue" or "tribal idol"
- "jungle tree" or "rainforest tree"
- "tropical tree" or "banana tree"
- "fern" or "tropical fern"
- "vine" or "jungle vine"
- "temple column" or "ancient column" or "ruined pillar"
- "temple ruins" or "ancient temple"
- "torch" or "ancient torch"
- "mossy boulder" or "forest rock"

**Download in GLTF/GLB format** (best compatibility with Three.js)

#### Poly Haven
https://polyhaven.com/models

Free CC0 models including:
- Rocks and boulders
- Some vegetation

#### Quaternius
https://quaternius.com/

Free low-poly packs (good for stylized look):
- Nature pack (trees, rocks)

#### TurboSquid (Free section)
https://www.turbosquid.com/Search/3D-Models/free

Filter by "Free" - many beach/tropical assets available

### PBR Textures

#### Poly Haven Textures (Best Quality - CC0)
https://polyhaven.com/textures

Download these specific textures:

1. **Sand**: Search "sand" → "Sand 004" or "Beach Sand"
   - Download 2K resolution (good balance of quality/performance)
   - Get: Diffuse, Normal, Roughness, AO maps

2. **Rock**: Search "rock" → "Rock 023" or coastal rocks
   - Same maps as above

3. **Jungle Floor**: Search "forest floor" or "jungle ground"
   - "Forest Floor 006" or "Leafy Ground"
   - Get: Diffuse, Normal, Roughness, AO maps

4. **Moss**: Search "moss" → "Moss 003" or similar
   - Good for ground variation and rock coverage

5. **Bark**: Search "bark" → "Bark 004" or "Tree Bark"
   - For jungle tree trunks

6. **Weathered Stone**: Search "stone" → "Stone Wall" or "Ancient Stone"
   - For temple ruins and idol textures

#### ambientCG (CC0)
https://ambientcg.com/

Alternative source for:
- Sand textures
- Rock textures
- Wood textures (for dock/hut)

### HDRI Skies

#### Poly Haven HDRIs (CC0)
https://polyhaven.com/hdris

Recommended downloads:
- **Beach**: "kloofendal_48d_partly_cloudy" or search "beach"
- **Jungle**: "limpopo_golf_course" or "green_sanctuary" or search "forest"
- **Sunset**: "venice_sunset" or similar
- Download in 2K resolution (.hdr format)

## How to Set Up Assets

### 1. Download and Extract

Download each asset and extract to the correct folder in `public/`.

### 2. Rename Files

Rename downloaded files to match the expected names:
- `coconut.glb`
- `palm_tree.glb`
- `rock.glb`
- etc.

### 3. Convert Formats (if needed)

If you downloaded GLTF (folder with .gltf + .bin + textures):
- Use https://gltf.report/ to convert to single .glb file
- Or use Blender: Import GLTF → Export as GLB

### 4. Optimize Models (optional but recommended)

Use https://gltf.report/ or gltf-transform to:
- Compress textures (WebP/KTX2)
- Reduce polygon count if needed
- Draco compress geometry

### 5. Test

Run `npm run dev` and the models should load automatically.
If a model fails to load, the procedural fallback will be used.

## Recommended Specific Assets

Here are direct links to tested, compatible assets:

### Coconut
- Sketchfab: Search "coconut fruit" - many free options
- Look for models with PBR textures included

### Palm Trees
- Sketchfab: "Low Poly Palm Tree" by various artists
- Quaternius Nature Pack (stylized)

### Rocks
- Poly Haven: "Rock 023" or similar boulder models
- Sketchfab: "Beach rocks" or "Coastal rocks"

### Beach Props
- Sketchfab: "Wooden dock", "Beach umbrella", "Tiki hut"

---

## Jungle Idol Simulator Assets

### Stone Idol
- Sketchfab: Search "stone idol", "tiki statue", "ancient statue", "tribal idol"
- Look for weathered/mossy stone textures
- Mayan or Polynesian style statues work well

### Jungle Trees
- Sketchfab: "Jungle tree", "Rainforest tree", "Tropical tree"
- Quaternius: Nature pack includes suitable trees
- Look for trees with buttress roots

### Temple Ruins
- Sketchfab: "Temple ruins", "Ancient column", "Ruined pillar"
- Search "Mayan temple" or "Angkor" for inspiration
- Look for overgrown/mossy versions

### Ferns and Vegetation
- Sketchfab: "Fern", "Tropical fern", "Forest undergrowth"
- Poly Haven: Various plant models
- Look for low-poly options for performance

### Boulders and Rocks
- Poly Haven: "Rock 023" or mossy boulder models
- Sketchfab: "Forest rock", "Mossy boulder"
- Same rocks as beach but with moss textures

## Texture Setup Tips

1. **Resolution**: 2K (2048x2048) is usually sufficient
2. **Format**: JPG for albedo, PNG for normal maps (if transparency needed)
3. **Normal Maps**: Make sure they're in OpenGL format (not DirectX)
   - If colors look wrong, invert the green channel
4. **Tiling**: The code tiles textures 30-40x, so choose seamless/tileable textures

## License Notes

All recommended sources (Poly Haven, ambientCG, Quaternius) use CC0 license:
- Free for commercial use
- No attribution required
- Can be modified freely

Sketchfab has various licenses - always check before using:
- CC0: Free for any use
- CC-BY: Requires attribution
- CC-BY-NC: Non-commercial only

## Troubleshooting

### Model doesn't appear
- Check browser console for 404 errors
- Verify file path matches exactly (case-sensitive)
- Make sure file is in `public/` not `src/`

### Model appears but looks wrong
- Check scale in the component
- Model might need rotation adjustment
- Textures might not be embedded - re-export with textures packed

### Textures look flat/wrong
- Normal map might be DirectX format - invert green channel
- Check if colorSpace is set correctly in code

### Performance issues
- Use lower resolution textures (1K instead of 2K)
- Reduce polygon count with gltf-transform
- Enable Draco compression
