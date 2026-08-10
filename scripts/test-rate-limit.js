// Script pour tester le rate limiting
// Exécutez avec: node scripts/test-rate-limit.js

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
const API_URL = `${BASE_URL}/api/search`;

async function testRateLimit() {
  console.log('🧪 Test de rate limiting sur /api/search');
  console.log(`📍 URL: ${API_URL}`);
  console.log('⏱️  Envoi de 70 requêtes rapides (limite: 60/minute)\n');

  let successCount = 0;
  let rateLimitCount = 0;
  let errorCount = 0;

  const startTime = Date.now();

  for (let i = 1; i <= 70; i++) {
    try {
      const response = await fetch(`${API_URL}?q=test&limit=5`);
      
      if (response.status === 429) {
        rateLimitCount++;
        console.log(`❌ Requête ${i}: Rate limit atteint (429)`);
      } else if (response.ok) {
        successCount++;
        console.log(`✅ Requête ${i}: Succès (${response.status})`);
      } else {
        errorCount++;
        console.log(`⚠️  Requête ${i}: Erreur (${response.status})`);
      }
    } catch (error) {
      errorCount++;
      console.log(`❌ Requête ${i}: Erreur réseau`);
    }

    // Petit délai entre les requêtes
    await new Promise(resolve => setTimeout(resolve, 50));
  }

  const duration = (Date.now() - startTime) / 1000;

  console.log('\n📊 Résultats:');
  console.log(`⏱️  Durée totale: ${duration.toFixed(2)}s`);
  console.log(`✅ Succès: ${successCount}`);
  console.log(`❌ Rate limit: ${rateLimitCount}`);
  console.log(`⚠️  Erreurs: ${errorCount}`);
  
  if (rateLimitCount > 0) {
    console.log('\n✅ Rate limiting fonctionne correctement !');
  } else {
    console.log('\n⚠️  Rate limiting ne semble pas fonctionner');
  }
}

testRateLimit();
