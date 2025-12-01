/**
 * Fonctions utilitaires pour gérer les profils utilisateurs
 */

export const getFullName = (profile: any, role: string = 'client') => {
  try {
    if (!profile) return 'Utilisateur'
    
    if (role === 'client') {
      if (profile.first_name && profile.last_name) {
        return `${profile.first_name} ${profile.last_name}`
      }
      if (profile.first_name) {
        return profile.first_name
      }
      return 'Utilisateur'
    } else if (role === 'professional') {
      return profile.business_name || profile.contact_full_name || 'Professionnel'
    }
    
    return 'Utilisateur'
  } catch (error) {
    console.error('Erreur getFullName utilitaire:', error)
    return 'Utilisateur'
  }
}

export const getWelcomeMessage = (profile: any, role: string = 'client') => {
  const fullName = getFullName(profile, role)
  return `Bienvenue ${fullName} 👋`
}
