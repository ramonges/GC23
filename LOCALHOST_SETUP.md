# Configuration Localhost pour Synchroniser avec Vercel

## Problème
Localhost n'affiche pas les mêmes données/mises à jour que Vercel car les variables d'environnement Supabase ne sont pas configurées localement.

## Solution

### 1. Créer le fichier `.env.local`

Créez un fichier `.env.local` à la racine du projet avec vos identifiants Supabase :

```bash
# Copier le fichier d'exemple
cp .env.local.example .env.local
```

Puis éditez `.env.local` avec vos vraies valeurs :

```env
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anon
```

### 2. Où trouver ces valeurs ?

1. Allez sur [Supabase Dashboard](https://app.supabase.com)
2. Sélectionnez votre projet
3. Allez dans **Settings** > **API**
4. Copiez :
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 3. Redémarrer le serveur

Après avoir créé `.env.local` :

```bash
# Arrêter le serveur (Ctrl+C)
# Vider le cache
rm -rf .next

# Redémarrer
npm run dev
```

### 4. Vérifier la synchronisation

Une fois configuré, localhost utilisera **exactement la même base de données Supabase** que Vercel, donc :
- ✅ Les mêmes données de commodities
- ✅ Les mêmes raffineries
- ✅ Les mêmes routes maritimes
- ✅ Toutes les mises à jour récentes

### 5. Accéder à la plateforme

- **Avec authentification** : `http://localhost:3000/platform`
- **Sans authentification (dev)** : `http://localhost:3000/platform-dev`

## Note importante

Le fichier `.env.local` est dans `.gitignore` et ne sera **jamais** commité sur GitHub pour des raisons de sécurité. Chaque développeur doit créer son propre `.env.local` avec ses propres identifiants.

## Vérification

Pour vérifier que tout fonctionne :

1. Ouvrez `http://localhost:3000/platform-dev`
2. Cliquez sur "Earth Map"
3. Vous devriez voir les mêmes données que sur Vercel

Si vous voyez toujours des différences :
- Vérifiez que vous utilisez les mêmes identifiants Supabase que Vercel
- Videz le cache du navigateur (Ctrl+Shift+R ou Cmd+Shift+R)
- Vérifiez la console du navigateur pour les erreurs
