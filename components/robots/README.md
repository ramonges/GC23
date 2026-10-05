# Robot Commodity Explorer

The page lives at `/robots` (`app/robots/page.tsx` → `components/robots/RobotExplorer.tsx`).

- `data/robots/robots.json`: robots, their parts, and each part's estimated materials.
- `data/robots/commodities.json`: commodity sourcing by country (mining and refining shares).
- `components/robots/scene/`: the 3D showroom (React Three Fiber).
- `components/robots/ui/`: panels, donut chart, sourcing drawer and methodology modal.

Every figure is an estimate. Keep the "Estimated, not manufacturer-disclosed" badge and the methodology modal accurate whenever data or models change.

## How a robot is drawn

Each robot is rendered from one of three sources. Every source produces meshes named after the `meshName` values in `robots.json`.

| Source | When it's used | Example |
| --- | --- | --- |
| GLB (`robot.model`) | `model` is a path under `/public` | Microduck, Reachy 2, Unitree G1, Spot |
| Procedural reconstruction | A builder exists for the robot id in `scene/placeholder.ts` | Tesla Optimus (`scene/optimus.ts`) |
| Placeholder | Fallback per `archetype` | Every other robot |

Hover, pin, explode and colour-by-commodity all work per **part name**. Several meshes can share a name; they then highlight, dim and explode as one part.

## Adding a GLB

1. **Model conventions**
   - Units are metres, with the feet resting on `y = 0`.
   - The robot faces **+z**, and its left side (`_L`) is **+x**.
   - Use rigid meshes only. Skins and animations are ignored, so pose the model before export.
2. **Name the parts.** Each part must be a node whose name matches a `meshName` in `robots.json`.
   - Child meshes and multi-material primitives under that node belong to the part. The loader climbs to the nearest named ancestor.
   - A node named something not in the data still renders but isn't interactive.
3. **Compress it with Draco.** The decoder is served from `/public/draco/`.

   ```bash
   npx @gltf-transform/cli draco in.glb public/models/robots/<id>.glb
   ```

4. **Point the data at it.** Set `"model": "/models/robots/<id>.glb"` on the robot in `robots.json`.
5. **Check the console in development.**
   - `PartsRenderer` warns `meshes without data` when the GLB has a named part that's missing from the data.
   - It warns `data without meshes` when the data has a part that's missing from the GLB.
   - Fix both until the console is silent.

Materials are cloned into `MeshStandardMaterial`, keeping the GLB's base colour, map, roughness, metalness and emissive. Emissive glow survives hover and dimming.

## Microduck

`public/models/robots/microduck.glb` is built from two inputs:

- the Microduck part meshes (one STL-derived mesh per CAD part, each in its own local frame);
- the official MJCF from [pollen-robotics/microduck_rl](https://github.com/pollen-robotics/microduck_rl), `src/mjlab_microduck/robot/microduck/robot_groundcontact.xml`.

`scripts/robots/assemble-microduck.mjs` does the assembly:

1. It walks the MJCF body tree in the official `STAND` keyframe and places every visual geom, including all 15 XL330 servos.
2. It converts MuJoCo's Z-up, +x-forward frame to the explorer's convention.
3. It groups geoms into the explorer's part names. For example, the three hip servos on one side become `actuator_hip_L`.
4. It applies the CAD colours and writes a Draco-compressed GLB.

The part masses in `robots.json` follow the MJCF link inertials (about 0.74 kg in total).

```bash
npm i --no-save @gltf-transform/core@4 @gltf-transform/extensions@4 @gltf-transform/functions@4 draco3dgltf fast-xml-parser
node scripts/robots/assemble-microduck.mjs microduck.glb path/to/robot_groundcontact.xml public/models/robots/microduck.glb
```

If you change how parts are grouped (`partFor` in the script), update the matching `parts` in `robots.json`.

## Reachy 2

`public/models/robots/reachy2.glb` comes from Pollen's official Blender file, [pollen-robotics/reachy2-blender](https://github.com/pollen-robotics/reachy2-blender) (`reachy2.blend`, about 12,000 CAD objects). That repository is Apache 2.0.

`scripts/robots/export-reachy2.py` runs inside Blender. It does the following:

1. It resets the armature to its rest pose, an arms-down stance.
2. It skips the `*_little_pieces` collections, which are excluded in the source file and sit at the origin. It also drops screws, nuts and other parts smaller than about 1 cm.
3. It merges the CAD objects under each named empty into one explorer part. `GROUPS` and `PREFIX` define the mapping; for example, `L.Hand.Orbita3D*` becomes `actuator_wrist_L`.
4. It maps the 40+ CAD materials onto a small palette and keeps the marinière shirt texture.
5. It decimates each part to a triangle budget (`BUDGET`), drops the model onto `y = 0` and writes a Draco GLB of about 1.8 MB.

```bash
git clone https://github.com/pollen-robotics/reachy2-blender && cd reachy2-blender
blender -b reachy2.blend --python /path/to/scripts/robots/export-reachy2.py -- assets/mariniere.jpg reachy2.glb rest --preview
```

Part masses follow Pollen's datasheet: 50 kg in total, including the 25 kg mobile base and its 6.5 kg LiFePO₄ battery. The split inside each part is estimated.

## Unitree G1

`public/models/robots/g1.glb` comes from Unitree's `g1_23dof.xml` and its STL meshes in [unitreerobotics/unitree_ros](https://github.com/unitreerobotics/unitree_ros/tree/master/robots/g1_description) (BSD-3-Clause).

`scripts/robots/assemble-g1.mjs` works like the Microduck script:

1. It walks the MJCF body tree and places every visual mesh. The MJCF has no keyframe, so the script relaxes the elbows and shoulders from the zero pose (`pose` in the script).
2. It maps each link mesh to an explorer part (`PART`). For example, `left_hip_yaw_link` becomes `thigh_L`.
3. It simplifies the densest meshes with meshoptimizer (`BUDGET`), from 401k to 185k triangles.
4. It computes crease-angle normals and gives the MJCF's two greys a satin silver and a graphite finish.
5. It writes a Draco GLB of about 700 KB, 1.32 m tall.

```bash
npm i --no-save @gltf-transform/core@4 @gltf-transform/extensions@4 @gltf-transform/functions@4 draco3dgltf fast-xml-parser meshoptimizer
# g1_23dof.xml next to a meshes/ folder holding the STLs it references
node scripts/robots/assemble-g1.mjs path/to/g1_description/g1_23dof.xml public/models/robots/g1.glb
```

Part masses follow the MJCF link inertials (34.1 kg in total). The `torso_link` body's 9.8 kg is split between the head, the waist actuator and the torso, which holds the battery and compute. Each link mesh holds its joint motor, so the split inside a part between motor and structure is estimated.

## Spot

`public/models/robots/spot.glb` comes from [“Spot (Boston Dynamic) High Poly”](https://sketchfab.com/3d-models/spotboston-dynamic-high-poly-058b16a8c88047e18b1f081e0d15f883) by Julliani on Sketchfab. It is licensed CC BY 4.0, so the robot's `model_credit` shows the attribution in the detail panel. Keep that credit whenever the model is used.

`scripts/robots/export-spot.py` runs inside Blender on Sketchfab's glTF download (`scene.gltf`, `scene.bin`, `textures/`). It does the following:

1. It maps the 24 source meshes to 17 parts by name and position. For example, `Cylinder.007` becomes `shin_FR`. Leg codes are F/R for front/rear, then L/R for left/right.
2. It turns the robot to face +z, levels the feet, scales it to Spot's published 500 mm width and grounds it.
3. It decimates each part to a budget (933k to 177k triangles), drops two duplicate UV sets, makes the material opaque, and gives the lower legs a matte black material.
4. It shrinks the 4096² textures to 2048/1024 JPEGs and writes a Draco GLB of about 1.9 MB.

```bash
# Download the glTF from the model page (logged in), or with a Sketchfab API token:
curl -H "Authorization: Token $SKETCHFAB_API_TOKEN" https://api.sketchfab.com/v3/models/058b16a8c88047e18b1f081e0d15f883/download
blender -b --python scripts/robots/export-spot.py -- path/to/scene.gltf public/models/robots/spot.glb --preview
```

Spot is a `quadruped`, which has no placeholder. Its `length_m` sizes the pedestal and camera framing. Part masses are budgeted to the published 33.8 kg, including the 5.2 kg battery.

## Performance notes

- The canvas renders on demand (`frameloop="demand"`). Anything animating must call `state.invalidate()`.
- Pixel ratio is capped at 2, and shadows are reduced on mobile.
- Keep GLBs under about 2 MB after Draco. Microduck is about 465 KB and Reachy 2 about 1.8 MB.
