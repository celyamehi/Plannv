// Vérification des variables d'environnement avec dotenv
require('dotenv').config({ path: '.env.local' })

console.log('=== Vérification des variables Supabase ===');

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('URL:', url ? '✅ Définie' : '❌ Manquante');
if (url) console.log('  ->', url.substring(0, 30) + '...');

console.log('ANON_KEY:', anonKey ? '✅ Définie' : '❌ Manquante');
if (anonKey) console.log('  ->', anonKey.substring(0, 30) + '...');

if (url && anonKey) {
  console.log('\n✅ Les variables sont correctement configurées');
  console.log('\n📝 Vérifiez que ces valeurs correspondent à votre projet Supabase');
} else {
  console.log('\n❌ Variables manquantes - vérifiez votre fichier .env.local');
  console.log('\n📝 Le fichier .env.local doit contenir:');
  console.log('NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co');
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=votre-clé-anon');
}
