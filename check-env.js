// Vérification des variables d'environnement
console.log('=== Vérification des variables Supabase ===');

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('URL:', url ? '✅ Définie' : '❌ Manquante');
console.log('ANON_KEY:', anonKey ? '✅ Définie' : '❌ Manquante');

if (url && anonKey) {
  console.log('✅ Les variables sont correctement configurées');
} else {
  console.log('❌ Variables manquantes - vérifiez votre fichier .env.local');
}
