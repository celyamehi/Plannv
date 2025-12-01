const { createClient } = require('@supabase/supabase-js')

// Remplace avec tes clés Supabase
const supabaseUrl = 'https://tnfnsgztpsuhymjxqifp.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRuZm5zZ3p0cHN1aHltanhxaWZwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMjkyMjY4MiwiZXhwIjoyMDQ4NDk4NjgyfQ.LqJvL2PK__vz1x9fX_8n4JjQ3m8b2n6JrJ6m7sJq5Y'

const supabase = createClient(supabaseUrl, supabaseKey)

async function fixProfessionalAccount() {
  try {
    console.log('🔧 Correction du compte professionnel yasmine@gmail.com...')
    
    // 1. Récupérer l'utilisateur par email
    const { data: authData, error: authError } = await supabase.auth.admin.listUsers()
    
    if (authError) {
      console.error('❌ Erreur récupération utilisateurs:', authError)
      return
    }
    
    const user = authData.users.find(u => u.email === 'yasmine@gmail.com')
    
    if (!user) {
      console.error('❌ Utilisateur yasmine@gmail.com non trouvé')
      return
    }
    
    console.log('✅ Utilisateur trouvé:', user.id)
    
    // 2. Créer l'entrée dans la table users
    const { error: userError } = await supabase
      .from('users')
      .upsert({
        id: user.id,
        role: 'professional',
        created_at: new Date().toISOString()
      })
    
    if (userError) {
      console.error('❌ Erreur création entrée users:', userError)
    } else {
      console.log('✅ Entrée users créée avec rôle professional')
    }
    
    // 3. Créer le profil professionnel s'il n'existe pas
    const { error: profError } = await supabase
      .from('professionals')
      .upsert({
        id: user.id,
        business_name: 'Yasmine Beauty',
        phone: '+33612345678',
        created_at: new Date().toISOString()
      })
    
    if (profError) {
      console.error('❌ Erreur création profil professionnel:', profError)
    } else {
      console.log('✅ Profil professionnel créé')
    }
    
    console.log('🎉 Compte professionnel configuré avec succès !')
    console.log('Tu peux maintenant te connecter via /professionals/login')
    
  } catch (error) {
    console.error('❌ Erreur générale:', error)
  }
}

fixProfessionalAccount()
