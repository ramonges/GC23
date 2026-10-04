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
| GLB (`robot.model`) | `model` is a path under `/public` | Microduck |
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

## Performance notes

- The canvas renders on demand (`frameloop="demand"`). Anything animating must call `state.invalidate()`.
- Pixel ratio is capped at 2, and shadows are reduced on mobile.
- Keep GLBs under about 1 MB after Draco. Microduck is about 465 KB.
