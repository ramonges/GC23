"""Reduce Julliani's "Spot (Boston Dynamics) High Poly" (Sketchfab, CC BY 4.0) to a web GLB with one node per explorer part.

blender -b --python export-spot.py -- <scene.gltf> <out.glb> [--preview]

Use the glTF download from Sketchfab (scene.gltf + scene.bin + textures/). Tested with Blender 4.3.
"""
import math
import sys

import bpy
from mathutils import Matrix, Vector

args = sys.argv[sys.argv.index('--') + 1:]
SRC, OUT = args[:2]

WIDTH_M = 0.5  # Boston Dynamics' published width; the scale is taken from it because it barely changes with pose.

KIND = {
    'Cube': 'body',
    'Cube.010': 'thigh', 'Cube.014': 'thigh', 'Cube.016': 'thigh', 'Cube.017': 'thigh',
    'Cylinder.002': 'hip', 'Cylinder.006': 'hip', 'Cylinder.009': 'hip', 'Cylinder.012': 'hip',
    'Cylinder.001': 'knee', 'Cylinder.003': 'knee', 'Cylinder.004': 'knee', 'Cylinder.008': 'knee',
    'Cylinder.005': 'shin', 'Cylinder.007': 'shin', 'Cylinder.010': 'shin', 'Cylinder.011': 'shin',
}
BUDGET = {'body': 60000, 'thigh': 12000, 'hip': 8000, 'shin': 7000, 'knee': 2200}
TEXTURE_SIZE = {'baseColor': 2048, 'metallicRoughness': 1024, 'normal': 1024}

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=SRC)
bpy.context.view_layer.update()


def centre(obj):
    ws = [obj.matrix_world @ Vector(c) for c in obj.bound_box]
    return sum(ws, Vector()) / 8


# In the source the robot faces +Y with its left on -X (Blender, Z-up).
groups = {}
for obj in [o for o in bpy.data.objects if o.type == 'MESH']:
    kind = KIND.get(obj.name.split('_Material')[0])
    if kind is None:
        bpy.data.objects.remove(obj)
        continue
    if kind == 'body':
        part = 'body'
    else:
        c = centre(obj)
        part = f"{kind}_{'F' if c.y > 0 else 'R'}{'L' if c.x < 0 else 'R'}"
    groups.setdefault(part, []).append(obj)

out_objs = []
for part, objs in groups.items():
    for obj in objs:
        mw = obj.matrix_world.copy()
        obj.parent = None
        if obj.data.users > 1:
            obj.data = obj.data.copy()
        obj.data.transform(mw)
        obj.matrix_world = Matrix.Identity(4)
    with bpy.context.temp_override(active_object=objs[0], selected_editable_objects=objs, selected_objects=objs):
        bpy.ops.object.join()
    ob = objs[0]
    ob.name = part
    ob.data.name = part
    out_objs.append(ob)
for o in [o for o in bpy.data.objects if o not in out_objs]:
    bpy.data.objects.remove(o)


def lowest(names):
    pts = [v.co for o in out_objs if o.name in names for v in o.data.vertices]
    return min(pts, key=lambda p: p.z)


# Level the stance (front and rear feet on the same plane), turn it to face -Y (the explorer's +Z), scale and ground it.
front, rear = lowest({'shin_FL', 'shin_FR'}), lowest({'shin_RL', 'shin_RR'})
pitch = math.atan2(-(front.z - rear.z), front.y - rear.y)
xs = [v.co.x for o in out_objs for v in o.data.vertices]
scale = WIDTH_M / (max(xs) - min(xs))
M = Matrix.Scale(scale, 4) @ Matrix.Rotation(math.pi, 4, 'Z') @ Matrix.Rotation(pitch, 4, 'X')
for o in out_objs:
    o.data.transform(M)
pts = [v.co for o in out_objs for v in o.data.vertices]
lo = Vector([min(p[i] for p in pts) for i in range(3)])
hi = Vector([max(p[i] for p in pts) for i in range(3)])
shift = Vector(((lo.x + hi.x) / -2, (lo.y + hi.y) / -2, -lo.z))
for o in out_objs:
    o.data.transform(Matrix.Translation(shift))
print('size m', [round(hi[i] - lo[i], 3) for i in range(3)], 'pitch deg', round(math.degrees(pitch), 2))

for o in out_objs:
    tris = sum(len(p.vertices) - 2 for p in o.data.polygons)
    budget = BUDGET[o.name.split('_')[0]]
    if tris > budget:
        mod = o.modifiers.new('dec', 'DECIMATE')
        mod.ratio = budget / tris
        with bpy.context.temp_override(object=o, active_object=o):
            bpy.ops.object.modifier_apply(modifier=mod.name)
    print(f'{o.name:10} {tris:7} -> {sum(len(p.vertices) - 2 for p in o.data.polygons)}')

# The source carries three identical UV sets; each extra one would split vertices in the GLB.
for o in out_objs:
    for uv in list(o.data.uv_layers)[1:]:
        o.data.uv_layers.remove(uv)
for mat in bpy.data.materials:
    mat.blend_method = 'OPAQUE'
    if mat.use_nodes:
        for n in mat.node_tree.nodes:
            if n.type in ('UVMAP', 'NORMAL_MAP'):
                n.uv_map = 'UVMap'
        for link in list(mat.node_tree.links):
            if link.to_socket.name == 'Alpha':
                mat.node_tree.links.remove(link)
# The source shades the lower legs as polished grey metal; on the robot they are matte black.
graphite = bpy.data.materials.new('graphite')
graphite.use_nodes = True
bsdf = next(n for n in graphite.node_tree.nodes if n.type == 'BSDF_PRINCIPLED')
bsdf.inputs['Base Color'].default_value = (0.022, 0.023, 0.025, 1)
bsdf.inputs['Metallic'].default_value = 0.25
bsdf.inputs['Roughness'].default_value = 0.5
for o in out_objs:
    if o.name.startswith(('shin_', 'knee_')):
        o.data.materials.clear()
        o.data.materials.append(graphite)
        for p in o.data.polygons:
            p.material_index = 0
for img in bpy.data.images:
    for key, size in TEXTURE_SIZE.items():
        if key in img.name and img.size[0] > size:
            img.scale(size, size)

for o in bpy.context.view_layer.objects:
    o.select_set(o in out_objs)
bpy.context.view_layer.objects.active = out_objs[0]

if '--preview' in args:
    sc = bpy.context.scene
    sc.render.engine = 'BLENDER_WORKBENCH'
    sc.display.shading.color_type = 'TEXTURE'
    sc.render.image_settings.file_format = 'PNG'
    sc.render.resolution_x, sc.render.resolution_y = 640, 420
    cam = bpy.data.objects.new('pcam', bpy.data.cameras.new('pcam'))
    sc.collection.objects.link(cam)
    sc.camera = cam
    for i, az in enumerate([0.0, 0.8, 1.571]):
        cam.location = (2.6 * math.sin(az), -2.6 * math.cos(az), 0.7)
        cam.rotation_euler = (Vector((0, 0, 0.32)) - cam.location).to_track_quat('-Z', 'Y').to_euler()
        sc.render.filepath = OUT.replace('.glb', f'_view{i}.png')
        bpy.ops.render.render(write_still=True)
    for o in bpy.context.view_layer.objects:
        o.select_set(o in out_objs)

bpy.ops.export_scene.gltf(
    filepath=OUT, export_format='GLB', use_selection=True, export_apply=True, export_yup=True,
    export_animations=False, export_skins=False, export_morph=False, export_cameras=False, export_lights=False,
    export_image_format='JPEG', export_jpeg_quality=82,
    export_draco_mesh_compression_enable=True, export_draco_mesh_compression_level=7,
    export_draco_position_quantization=14, export_draco_normal_quantization=10, export_draco_texcoord_quantization=12,
)
print('wrote', OUT)
