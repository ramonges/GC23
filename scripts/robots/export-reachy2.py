"""Reduce reachy2.blend (pollen-robotics/reachy2-blender) to a web GLB with one node per explorer part.

blender -b reachy2.blend --python export-reachy2.py -- <assets/mariniere.jpg> <out.glb> [rest|<frame>] [--preview]

Tested with Blender 4.3. --preview also renders three Cycles PNGs next to the GLB.
"""
import re
import sys
import bmesh
import bpy
from mathutils import Matrix, Vector

TEX, OUT = sys.argv[sys.argv.index('--') + 1:][:2]

GROUPS = {
    'Base': 'mobile_base',
    'Body': 'torso_shell',
    'chest Pollen logo <1>.001': 'torso_shell',
    'Bedrock R8000 4x25 <1>.001': 'compute_torso',
    'Trepied Base.001': 'tripod',
    'L.Leg': 'tripod', 'M.Leg': 'tripod', 'R.Leg': 'tripod',
    'L.Leg.Bot': 'tripod', 'M.Leg.Bot': 'tripod', 'R.Leg.Bot': 'tripod',
    'Head': 'head_shell',
    'stereo_camera <1>.001': 'head_sensors',
    'M.Orbita_Neck': 'actuator_neck',
    'L.Antenna.Head': 'antenna_L', 'L.Antenna.Back': 'antenna_L',
    'R.Antenna.Head': 'antenna_R', 'R.Antenna.Back': 'antenna_R',
    'L.Orbita 2D D85 Visual': 'actuator_shoulder_L', 'L.Shoulder_Orbita_Head': 'actuator_shoulder_L',
    'R.Orbita 2D D85 Visual': 'actuator_shoulder_R', 'R.Shoulder_Orbita_Head': 'actuator_shoulder_R',
    'L.Upper_arm ': 'upper_arm_L', 'R.Upper_arm': 'upper_arm_R',
    'Orbita 2D D85 Visual <1>.006': 'actuator_elbow_L', 'L.UpperArm_Orbita_Head': 'actuator_elbow_L',
    'Orbita 2D D85 Visual <1>.009': 'actuator_elbow_R', 'R.UpperArm_Orbita_Head': 'actuator_elbow_R',
    'L.Forearm ': 'forearm_L', 'R.Forearm': 'forearm_R',
}
PREFIX = {
    'L.Hand.Orbita3D': 'actuator_wrist_L', 'R.Hand.Orbita3D': 'actuator_wrist_R',
    'L.Pincette Assembly': 'gripper_L', 'R.Pincette Assembly': 'gripper_R',
    'M.Orbita_Neck': 'actuator_neck',
}
BUDGET = {
    'mobile_base': 34000, 'tripod': 9000, 'torso_shell': 30000, 'compute_torso': 3000,
    'head_shell': 18000, 'head_sensors': 6000, 'actuator_neck': 10000, 'antenna_L': 3000, 'antenna_R': 3000,
}
for s in 'LR':
    BUDGET.update({f'actuator_shoulder_{s}': 10000, f'upper_arm_{s}': 8000, f'actuator_elbow_{s}': 10000,
                   f'forearm_{s}': 8000, f'actuator_wrist_{s}': 10000, f'gripper_{s}': 12000})

JUNK = re.compile(r'screw|nut\b|nut |pin |pin$|washer|insert|entretoise|spacer|\bvis\b|rondelle|pcb|bourns|cp_elec|connector|jst|molex|resist|capac|led', re.I)


def part_for(obj):
    o = obj.parent
    while o:
        if o.type == 'EMPTY':
            if o.name in GROUPS:
                return GROUPS[o.name]
            for p, part in PREFIX.items():
                if o.name.startswith(p):
                    return part
        o = o.parent
    return None


def principled(mat):
    if mat and mat.use_nodes:
        for n in mat.node_tree.nodes:
            if n.type == 'BSDF_PRINCIPLED':
                return n
    return None


palette = {}
SWATCHES = {
    'shell': ((0.9, 0.9, 0.9), False, 0.5),
    'light_grey': ((0.65, 0.65, 0.66), False, 0.5),
    'mid_grey': ((0.4, 0.4, 0.41), False, 0.5),
    'dark_grey': ((0.1, 0.1, 0.105), False, 0.5),
    'black': ((0.02, 0.02, 0.02), False, 0.45),
    'orange': ((1.0, 0.5, 0.1), False, 0.5),
    'yellow': ((1.0, 0.85, 0.15), False, 0.5),
    'red': ((0.85, 0.1, 0.1), False, 0.5),
    'blue': ((0.1, 0.3, 0.8), False, 0.5),
    'green': ((0.1, 0.45, 0.3), False, 0.5),
    'wood': ((0.75, 0.58, 0.38), False, 0.6),
    'metal': ((0.88, 0.88, 0.88), True, 0.38),
    'metal_dark': ((0.4, 0.4, 0.42), True, 0.42),
    'copper': ((0.9, 0.55, 0.35), True, 0.38),
    'metal_red': ((0.84, 0.1, 0.08), True, 0.38),
}


def stripe_scale(mat):
    """UV scale of the marinière texture's Mapping node, or None if mat isn't the striped shirt."""
    if not (mat and mat.use_nodes):
        return None
    nodes = mat.node_tree.nodes
    if not any(n.type == 'TEX_IMAGE' and n.image and 'mariniere' in n.image.name for n in nodes):
        return None
    m = next((n for n in nodes if n.type == 'MAPPING'), None)
    return tuple(m.inputs['Scale'].default_value[:2]) if m else (1.0, 1.0)


# The mobile base's covers are anthracite on the real robot; the CAD colours them light grey.
TINT = {'mobile_base': {'metal': 'metal_dark', 'shell': 'mid_grey', 'light_grey': 'mid_grey'}}


def palette_material(src, part=None):
    name = src.name if src else ''
    if stripe_scale(src):
        key = 'shirt'
    elif name.startswith('Glass_Eyes'):
        key = 'glass'
    else:
        n = principled(src)
        if n is None:
            c, m, r = (0.8, 0.8, 0.8), 0.0, 0.5
        else:
            c = tuple(n.inputs['Base Color'].default_value[:3])
            m = n.inputs['Metallic'].default_value
            r = n.inputs['Roughness'].default_value
        if name.startswith('Circuit'):
            return None
        metal = m > 0.5
        pool = [k for k, v in SWATCHES.items() if v[1] == metal]
        key = min(pool, key=lambda k: sum((x - y) ** 2 for x, y in zip(SWATCHES[k][0], c)))
        key = TINT.get(part, {}).get(key, key)
    if key in palette:
        return palette[key]
    mat = bpy.data.materials.new(f'pal_{len(palette)}')
    mat.use_nodes = True
    bsdf = principled(mat)
    if key == 'shirt':
        mat.name = 'shirt'
        img = bpy.data.images.load(TEX)
        tex = mat.node_tree.nodes.new('ShaderNodeTexImage')
        tex.image = img
        mat.node_tree.links.new(tex.outputs['Color'], bsdf.inputs['Base Color'])
        bsdf.inputs['Roughness'].default_value = 0.85
    elif key == 'glass':
        mat.name = 'glass'
        bsdf.inputs['Base Color'].default_value = (0.01, 0.01, 0.012, 1)
        bsdf.inputs['Roughness'].default_value = 0.05
        bsdf.inputs['Metallic'].default_value = 0.3
    else:
        c, metal, rough = SWATCHES[key]
        mat.name = key
        bsdf.inputs['Base Color'].default_value = (*c, 1)
        # Fully metallic surfaces read as black against the explorer's dark environment.
        bsdf.inputs['Metallic'].default_value = 0.55 if metal else 0.0
        bsdf.inputs['Roughness'].default_value = rough
    palette[key] = mat
    return mat


POSE = (sys.argv[sys.argv.index('--') + 1:] + ['rest'])[2]
arm = bpy.data.objects['Armature']
if POSE == 'rest':
    if arm.animation_data:
        arm.animation_data.action = None
    for pb in arm.pose.bones:
        pb.matrix_basis = Matrix.Identity(4)
    bpy.context.scene.frame_set(0)
else:
    bpy.context.scene.frame_set(int(POSE))
bpy.context.view_layer.update()
dg = bpy.context.evaluated_depsgraph_get()

def excluded_collections():
    out, stack = set(), [bpy.context.view_layer.layer_collection]
    while stack:
        lc = stack.pop()
        if lc.exclude:
            out.add(lc.collection.name)
        stack.extend(lc.children)
    return out


# The *_little_pieces collections are excluded in the source file and sit at the origin, not on the robot.
EXCLUDED = excluded_collections()
for obj in bpy.data.objects:
    if obj.type == 'MESH' and obj.name in {*GROUPS.values(), *PREFIX.values()}:
        obj.name = obj.name + '_cad'

parts = {}
kept = dropped = 0
for obj in bpy.data.objects:
    if obj.type != 'MESH' or obj.hide_render or obj.name.startswith(('wgt.', 'Background')):
        continue
    if all(c.name in EXCLUDED for c in obj.users_collection):
        continue
    part = part_for(obj)
    if not part:
        continue
    ws = [obj.matrix_world @ Vector(c) for c in obj.bound_box]
    size = max(max(p[i] for p in ws) - min(p[i] for p in ws) for i in range(3))
    if size < 0.012 or (JUNK.search(obj.name) and size < 0.06):
        dropped += 1
        continue
    parts.setdefault(part, []).append(obj)
    kept += 1
print('kept', kept, 'dropped', dropped)

out_objs = []
min_z = 1e9
for part, objs in parts.items():
    bm = bmesh.new()
    uv = bm.loops.layers.uv.new('UVMap')
    slots = []
    for obj in objs:
        ev = obj.evaluated_get(dg)
        me = ev.to_mesh()
        me.transform(obj.matrix_world)
        tmp = bmesh.new()
        tmp.from_mesh(me)
        src_uv = tmp.loops.layers.uv.active
        remap = {}
        uv_scale = {}
        src_mats = [slot.material for slot in obj.material_slots] or list(me.materials)
        for i, s in enumerate(src_mats):
            uv_scale[i] = stripe_scale(s) or (1.0, 1.0)
            pm = palette_material(s, part)
            if pm is None:
                remap[i] = None
                continue
            if pm not in slots:
                slots.append(pm)
            remap[i] = slots.index(pm)
        if not src_mats:
            pm = palette_material(None, part)
            if pm not in slots:
                slots.append(pm)
            remap[0] = slots.index(pm)
        vmap = {}
        for v in tmp.verts:
            vmap[v] = bm.verts.new(v.co)
        for f in tmp.faces:
            mi = remap.get(f.material_index, remap.get(0))
            if mi is None:
                continue
            try:
                nf = bm.faces.new([vmap[v] for v in f.verts])
            except ValueError:
                continue
            nf.material_index = mi
            nf.smooth = True
            if src_uv:
                sx, sy = uv_scale.get(f.material_index, (1.0, 1.0))
                for l_src, l_dst in zip(f.loops, nf.loops):
                    u, v = l_src[src_uv].uv
                    l_dst[uv].uv = (u * sx, v * sy)
        tmp.free()
        ev.to_mesh_clear()
    mesh = bpy.data.meshes.new(part)
    bm.to_mesh(mesh)
    bm.free()
    for m in slots:
        mesh.materials.append(m)
    ob = bpy.data.objects.new(part, mesh)
    bpy.context.scene.collection.objects.link(ob)
    tris = sum(len(p.vertices) - 2 for p in mesh.polygons)
    budget = BUDGET.get(part, 6000)
    if tris > budget:
        mod = ob.modifiers.new('dec', 'DECIMATE')
        mod.ratio = budget / tris
        mod.use_collapse_triangulate = True
    print(f'{part:22} objs={len(objs):5} tris={tris:8} -> {min(tris, budget)} mats={[m.name for m in slots]}')
    out_objs.append(ob)

dg = bpy.context.evaluated_depsgraph_get()
for ob in out_objs:
    ev = ob.evaluated_get(dg)
    me = bpy.data.meshes.new_from_object(ev)
    ob.modifiers.clear()
    ob.data = me
    me.set_sharp_from_angle(angle=0.6)
    min_z = min(min_z, min(v.co.z for v in me.vertices))
for ob in out_objs:
    ob.data.transform(Matrix.Translation((0, 0, -min_z)))
max_z = max(max(v.co.z for v in ob.data.vertices) for ob in out_objs)
print('height', round(max_z, 4), 'min_z_shift', round(min_z, 4))

for o in bpy.context.view_layer.objects:
    o.select_set(o in out_objs)
bpy.context.view_layer.objects.active = out_objs[0]

if '--preview' in sys.argv:
    import math
    sc = bpy.context.scene
    for o in bpy.data.objects:
        if o not in out_objs and o.type in ('MESH', 'EMPTY', 'ARMATURE'):
            o.hide_render = True
    cam = bpy.data.objects.new('pcam', bpy.data.cameras.new('pcam'))
    sc.collection.objects.link(cam)
    sc.camera = cam
    sun = bpy.data.objects.new('psun', bpy.data.lights.new('psun', 'SUN'))
    sun.data.energy = 3
    sun.rotation_euler = (0.8, 0.2, 0.6)
    sc.collection.objects.link(sun)
    sc.render.image_settings.file_format = 'PNG'
    sc.render.engine = 'CYCLES'
    sc.cycles.samples = 12
    sc.cycles.device = 'CPU'
    sc.render.resolution_x, sc.render.resolution_y = 420, 640
    sc.world.use_nodes = True
    sc.world.node_tree.nodes['Background'].inputs[0].default_value = (0.35, 0.35, 0.37, 1)
    for i, az in enumerate([0, 0.9, 2.6]):
        d = 3.4
        cam.location = (math.sin(az) * -d * 0 + d * math.sin(az), -d * math.cos(az), 0.95)
        cam.rotation_euler = (math.radians(86), 0, az)
        sc.render.filepath = OUT.replace('.glb', f'_view{i}.png')
        bpy.ops.render.render(write_still=True)
bpy.ops.export_scene.gltf(
    filepath=OUT, export_format='GLB', use_selection=True, export_apply=True, export_yup=True,
    export_animations=False, export_skins=False, export_morph=False, export_cameras=False, export_lights=False,
    export_image_format='JPEG', export_jpeg_quality=80,
    export_draco_mesh_compression_enable=True, export_draco_mesh_compression_level=7,
    export_draco_position_quantization=14, export_draco_normal_quantization=10, export_draco_texcoord_quantization=12,
)
print('wrote', OUT)
