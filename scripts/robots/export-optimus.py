"""Reduce Mechamaner.V's "Tesla optimus" (Sketchfab, CC BY 4.0) to a web GLB with one node per explorer part.

blender -b --python export-optimus.py -- <scene.gltf> <out.glb> [--preview]

Use the glTF download from Sketchfab (scene.gltf + scene.bin). The source is a single object split only by
material, so every connected piece is assigned to a part by where its centre sits. Tested with Blender 4.3.
"""
import math
import sys

import bpy
from mathutils import Matrix, Vector

args = sys.argv[sys.argv.index('--') + 1:]
SRC, OUT = args[:2]

HEIGHT_M = 1.73  # Tesla's stated height; the source is in arbitrary units.

# Cut heights in source units (the robot stands from z = 0.42 to 16.66), measured on the front view.
NECK, HEAD = 13.4, 14.0
WAIST, HIP_TOP = 9.25, 8.6
SHOULDER, ELBOW_TOP, ELBOW_BOTTOM, WRIST = 12.3, 11.0, 9.7, 8.15
HIP_BOTTOM, KNEE_TOP, KNEE_BOTTOM, ANKLE_TOP, ANKLE_BOTTOM = 7.0, 5.3, 4.4, 1.5, 1.0
ARM_X = 1.62  # the torso shell spans |x| < 1.6; the arms hang outside it
HIP_X = 0.4

BUDGET = 150000


def part_for(c, material):
    x, z = c.x, c.z
    # The robot faces -Y, so its left is +X.
    side = 'L' if x > 0 else 'R'
    if material in ('Face', 'Lights'):
        return 'head_sensors'
    # The head and neck are one shell, so its centre sits in the neck band.
    if z > HEAD or (material == 'Head' and z > NECK):
        return 'skull_shell'
    if abs(x) > ARM_X and z > HIP_BOTTOM:
        if z > SHOULDER:
            return f'actuator_shoulder_{side}'
        if z > ELBOW_TOP:
            return f'upper_arm_{side}'
        if z > ELBOW_BOTTOM:
            return f'actuator_elbow_{side}'
        if z > WRIST:
            return f'forearm_{side}'
        return f'hand_{side}'
    if z > NECK and abs(x) < 0.9:
        return 'actuator_neck'
    if z > WAIST:
        return 'torso_shell'
    if z > HIP_TOP or (z > HIP_BOTTOM and abs(x) < HIP_X):
        return 'pelvis_frame'
    if z > HIP_BOTTOM:
        return f'actuator_hip_{side}'
    if z > KNEE_TOP:
        return f'thigh_{side}'
    if z > KNEE_BOTTOM:
        return f'actuator_knee_{side}'
    if z > ANKLE_TOP:
        return f'shin_{side}'
    if z > ANKLE_BOTTOM:
        return f'actuator_ankle_{side}'
    return f'foot_{side}'


def islands(mesh):
    parent = list(range(len(mesh.vertices)))

    def find(i):
        while parent[i] != i:
            parent[i] = parent[parent[i]]
            i = parent[i]
        return i

    for p in mesh.polygons:
        r = find(p.vertices[0])
        for v in p.vertices[1:]:
            parent[find(v)] = r
    return [find(p.vertices[0]) for p in mesh.polygons]


bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=SRC)
bpy.context.view_layer.update()

sources = [o for o in bpy.data.objects if o.type == 'MESH']
for obj in sources:
    mw = obj.matrix_world.copy()
    obj.parent = None
    obj.data.transform(mw)
    obj.matrix_world = Matrix.Identity(4)
for o in [o for o in bpy.data.objects if o.type != 'MESH']:
    bpy.data.objects.remove(o)
bpy.context.view_layer.update()

# Tag each face with its part through placeholder material slots, split by slot, then restore the real material.
placeholders = {}
for obj in sources:
    real = obj.data.materials[0]
    island = islands(obj.data)
    acc = {}
    for p in obj.data.polygons:
        a = acc.setdefault(island[p.index], [Vector(), 0.0])
        a[0] += p.center * p.area
        a[1] += p.area
    part_of = {k: part_for(s / (w or 1), real.name) for k, (s, w) in acc.items()}
    names = sorted(set(part_of.values()))
    obj.data.materials.clear()
    for n in names:
        obj.data.materials.append(placeholders.setdefault(n, bpy.data.materials.new(f'part:{n}')))
    for p in obj.data.polygons:
        p.material_index = names.index(part_of[island[p.index]])
    obj['real'] = real.name
    for o in bpy.context.view_layer.objects:
        if o:
            o.select_set(o == obj)
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.mode_set(mode='EDIT')
    bpy.ops.mesh.select_all(action='SELECT')
    bpy.ops.mesh.separate(type='MATERIAL')
    bpy.ops.object.mode_set(mode='OBJECT')

groups = {}
for obj in [o for o in bpy.data.objects if o.type == 'MESH']:
    part = obj.data.materials[0].name.split(':', 1)[1]
    obj.data.materials[0] = bpy.data.materials[obj['real']]
    groups.setdefault(part, []).append(obj)
out_objs = []
for part, objs in sorted(groups.items()):
    with bpy.context.temp_override(active_object=objs[0], selected_editable_objects=objs, selected_objects=objs):
        bpy.ops.object.join()
    ob = objs[0]
    ob.name = ob.data.name = part
    out_objs.append(ob)
for m in placeholders.values():
    bpy.data.materials.remove(m)

pts = [v.co for o in out_objs for v in o.data.vertices]
lo = Vector([min(p[i] for p in pts) for i in range(3)])
hi = Vector([max(p[i] for p in pts) for i in range(3)])
scale = HEIGHT_M / (hi.z - lo.z)
M = Matrix.Scale(scale, 4) @ Matrix.Translation(Vector(((lo.x + hi.x) / -2, (lo.y + hi.y) / -2, -lo.z)))
for o in out_objs:
    o.data.transform(M)
print('size m', [round((hi[i] - lo[i]) * scale, 3) for i in range(3)])

total = sum(len(p.vertices) - 2 for o in out_objs for p in o.data.polygons)
for o in out_objs:
    tris = sum(len(p.vertices) - 2 for p in o.data.polygons)
    if total > BUDGET:
        mod = o.modifiers.new('dec', 'DECIMATE')
        mod.ratio = BUDGET / total
        with bpy.context.temp_override(object=o, active_object=o):
            bpy.ops.object.modifier_apply(modifier=mod.name)
    print(f'{o.name:22} {tris:7} -> {sum(len(p.vertices) - 2 for p in o.data.polygons)}')

# Body has no base colour (white) and Hands is a light grey; Tesla's shells are a warm off-white over satin black.
finish = {
    'Body': ((0.80, 0.79, 0.76), 0.15, 0.35),
    'Hands': ((0.62, 0.62, 0.62), 0.2, 0.4),
    'Secondary_Body': ((0.012, 0.013, 0.014), 0.1, 0.45),
    'Head': ((0.008, 0.008, 0.009), 0.6, 0.22),
    'Face': ((0.0, 0.0, 0.0), 0.0, 0.05),
    'Lights': ((0.0, 0.0, 0.0), 0.0, 0.3),
}
for mat in bpy.data.materials:
    if mat.name not in finish or not mat.use_nodes:
        continue
    bsdf = next(n for n in mat.node_tree.nodes if n.type == 'BSDF_PRINCIPLED')
    color, metallic, roughness = finish[mat.name]
    for link in list(mat.node_tree.links):
        if link.to_node == bsdf:
            mat.node_tree.links.remove(link)
    bsdf.inputs['Base Color'].default_value = (*color, 1)
    bsdf.inputs['Metallic'].default_value = metallic
    bsdf.inputs['Roughness'].default_value = roughness
    mat.blend_method = 'OPAQUE'

for o in bpy.context.view_layer.objects:
    o.select_set(o in out_objs)
bpy.context.view_layer.objects.active = out_objs[0]

if '--preview' in args:
    import random
    sc = bpy.context.scene
    sc.render.engine = 'BLENDER_WORKBENCH'
    sc.display.shading.color_type = 'OBJECT'
    sc.render.resolution_x, sc.render.resolution_y = 520, 900
    for o in out_objs:
        random.seed(o.name)
        o.color = (random.random(), random.random(), random.random(), 1)
    cam = bpy.data.objects.new('pcam', bpy.data.cameras.new('pcam'))
    sc.collection.objects.link(cam)
    sc.camera = cam
    cam.data.type = 'ORTHO'
    cam.data.ortho_scale = 1.9
    for i, az in enumerate([0.0, 1.571]):
        cam.location = (4 * math.sin(az), -4 * math.cos(az), 0.88)
        cam.rotation_euler = (Vector((0, 0, 0.88)) - cam.location).to_track_quat('-Z', 'Y').to_euler()
        sc.render.filepath = OUT.replace('.glb', f'_parts{i}.png')
        bpy.ops.render.render(write_still=True)
    for o in bpy.context.view_layer.objects:
        o.select_set(o in out_objs)

bpy.ops.export_scene.gltf(
    filepath=OUT, export_format='GLB', use_selection=True, export_apply=True, export_yup=True,
    export_animations=False, export_skins=False, export_morph=False, export_cameras=False, export_lights=False,
    export_texcoords=False,
    export_draco_mesh_compression_enable=True, export_draco_mesh_compression_level=7,
    export_draco_position_quantization=14, export_draco_normal_quantization=10,
)
print('wrote', OUT)
