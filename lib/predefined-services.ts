// Services pré-définis par catégorie d'établissement

export interface PreDefinedService {
  name: string
  description: string
  duration: number
  suggestedPrice: number
  category: string
}

export const PREDEFINED_SERVICES: Record<string, PreDefinedService[]> = {
  coiffure: [
    // Coupes Femme
    { name: 'Coupe femme courte', description: 'Coupe + brushing cheveux courts', duration: 45, suggestedPrice: 40, category: 'Coupes Femme' },
    { name: 'Coupe femme mi-longs', description: 'Coupe + brushing cheveux mi-longs', duration: 60, suggestedPrice: 50, category: 'Coupes Femme' },
    { name: 'Coupe femme longs', description: 'Coupe + brushing cheveux longs', duration: 75, suggestedPrice: 60, category: 'Coupes Femme' },
    { name: 'Coupe + couleur femme', description: 'Coupe + coloration + brushing', duration: 150, suggestedPrice: 120, category: 'Coupes Femme' },
    { name: 'Coupe dégradée femme', description: 'Coupe en dégradé', duration: 60, suggestedPrice: 50, category: 'Coupes Femme' },
    
    // Coupes Homme
    { name: 'Coupe homme classique', description: 'Coupe aux ciseaux', duration: 30, suggestedPrice: 25, category: 'Coupes Homme' },
    { name: 'Coupe homme tondeuse', description: 'Coupe à la tondeuse', duration: 20, suggestedPrice: 20, category: 'Coupes Homme' },
    { name: 'Coupe homme + barbe', description: 'Coupe + taille de barbe', duration: 45, suggestedPrice: 35, category: 'Coupes Homme' },
    { name: 'Coupe dégradé homme', description: 'Dégradé américain', duration: 35, suggestedPrice: 30, category: 'Coupes Homme' },
    
    // Coupes Enfant
    { name: 'Coupe enfant -6 ans', description: 'Coupe pour tout-petits', duration: 15, suggestedPrice: 12, category: 'Coupes Enfant' },
    { name: 'Coupe enfant 6-12 ans', description: 'Coupe pour enfants', duration: 20, suggestedPrice: 15, category: 'Coupes Enfant' },
    { name: 'Coupe ado', description: 'Coupe pour adolescents', duration: 30, suggestedPrice: 22, category: 'Coupes Enfant' },
    
    // Brushing
    { name: 'Brushing simple', description: 'Brushing seul', duration: 30, suggestedPrice: 25, category: 'Brushing' },
    { name: 'Brushing + shampoing', description: 'Shampoing + brushing', duration: 45, suggestedPrice: 35, category: 'Brushing' },
    { name: 'Brushing + coupe', description: 'Coupe + brushing', duration: 75, suggestedPrice: 55, category: 'Brushing' },
    { name: 'Brushing lissant', description: 'Brushing effet lisse', duration: 45, suggestedPrice: 40, category: 'Brushing' },
    { name: 'Mise en plis', description: 'Mise en plis classique', duration: 40, suggestedPrice: 30, category: 'Brushing' },
    
    // Colorations
    { name: 'Coloration complète', description: 'Coloration racines + longueurs', duration: 120, suggestedPrice: 80, category: 'Colorations' },
    { name: 'Coloration racines', description: 'Retouche racines uniquement', duration: 60, suggestedPrice: 50, category: 'Colorations' },
    { name: 'Mèches', description: 'Mèches ou balayage', duration: 150, suggestedPrice: 90, category: 'Colorations' },
    { name: 'Ombré hair', description: 'Technique ombré', duration: 180, suggestedPrice: 120, category: 'Colorations' },
    { name: 'Balayage', description: 'Balayage naturel', duration: 150, suggestedPrice: 100, category: 'Colorations' },
    { name: 'Tie and dye', description: 'Coloration dégradée', duration: 180, suggestedPrice: 130, category: 'Colorations' },
    { name: 'Patine', description: 'Patine de couleur', duration: 45, suggestedPrice: 35, category: 'Colorations' },
    { name: 'Décoloration', description: 'Décoloration complète', duration: 150, suggestedPrice: 100, category: 'Colorations' },
    
    // Soins
    { name: 'Soin capillaire', description: 'Masque + soin profond', duration: 30, suggestedPrice: 20, category: 'Soins' },
    { name: 'Lissage brésilien', description: 'Lissage longue durée', duration: 240, suggestedPrice: 200, category: 'Soins' },
    { name: 'Botox capillaire', description: 'Soin restructurant', duration: 90, suggestedPrice: 80, category: 'Soins' },
    { name: 'Soin à la kératine', description: 'Traitement kératine', duration: 120, suggestedPrice: 100, category: 'Soins' },
    { name: 'Bain d\'huile', description: 'Soin nourrissant', duration: 45, suggestedPrice: 30, category: 'Soins' },
    
    // Coiffures
    { name: 'Chignon simple', description: 'Chignon classique', duration: 30, suggestedPrice: 35, category: 'Coiffures' },
    { name: 'Chignon de mariée', description: 'Coiffure mariage + essai', duration: 120, suggestedPrice: 150, category: 'Coiffures' },
    { name: 'Tresses', description: 'Tresses diverses', duration: 60, suggestedPrice: 40, category: 'Coiffures' },
    { name: 'Coiffure de soirée', description: 'Coiffure événement', duration: 60, suggestedPrice: 50, category: 'Coiffures' },
  ],
  
  esthetique: [
    // Épilation Visage
    { name: 'Épilation sourcils', description: 'Mise en forme des sourcils', duration: 15, suggestedPrice: 10, category: 'Épilation Visage' },
    { name: 'Épilation lèvre supérieure', description: 'Épilation cire', duration: 10, suggestedPrice: 8, category: 'Épilation Visage' },
    { name: 'Épilation menton', description: 'Épilation menton', duration: 10, suggestedPrice: 8, category: 'Épilation Visage' },
    { name: 'Épilation visage complet', description: 'Visage entier', duration: 30, suggestedPrice: 25, category: 'Épilation Visage' },
    { name: 'Teinture sourcils', description: 'Coloration sourcils', duration: 15, suggestedPrice: 12, category: 'Épilation Visage' },
    { name: 'Rehaussement cils', description: 'Permanente des cils', duration: 45, suggestedPrice: 50, category: 'Épilation Visage' },
    
    // Épilation Corps
    { name: 'Épilation aisselles', description: 'Épilation des aisselles', duration: 15, suggestedPrice: 12, category: 'Épilation Corps' },
    { name: 'Épilation bras', description: 'Bras complets', duration: 30, suggestedPrice: 25, category: 'Épilation Corps' },
    { name: 'Épilation demi-jambes', description: 'Jambes jusqu\'aux genoux', duration: 25, suggestedPrice: 20, category: 'Épilation Corps' },
    { name: 'Épilation jambes complètes', description: 'Jambes entières', duration: 40, suggestedPrice: 35, category: 'Épilation Corps' },
    { name: 'Épilation maillot simple', description: 'Maillot classique', duration: 20, suggestedPrice: 15, category: 'Épilation Corps' },
    { name: 'Épilation maillot échancré', description: 'Maillot brésilien', duration: 25, suggestedPrice: 22, category: 'Épilation Corps' },
    { name: 'Épilation maillot intégral', description: 'Maillot complet', duration: 30, suggestedPrice: 30, category: 'Épilation Corps' },
    { name: 'Épilation dos', description: 'Dos complet', duration: 30, suggestedPrice: 30, category: 'Épilation Corps' },
    { name: 'Épilation torse', description: 'Torse complet', duration: 30, suggestedPrice: 30, category: 'Épilation Corps' },
    
    // Soins Visage
    { name: 'Soin visage hydratant', description: 'Nettoyage + hydratation', duration: 60, suggestedPrice: 50, category: 'Soins Visage' },
    { name: 'Soin visage anti-âge', description: 'Soin complet anti-rides', duration: 75, suggestedPrice: 70, category: 'Soins Visage' },
    { name: 'Nettoyage de peau', description: 'Nettoyage profond + extraction', duration: 60, suggestedPrice: 55, category: 'Soins Visage' },
    { name: 'Soin visage purifiant', description: 'Soin peaux grasses', duration: 60, suggestedPrice: 50, category: 'Soins Visage' },
    { name: 'Soin visage éclat', description: 'Soin coup d\'éclat', duration: 45, suggestedPrice: 45, category: 'Soins Visage' },
    { name: 'Peeling visage', description: 'Peeling chimique doux', duration: 45, suggestedPrice: 60, category: 'Soins Visage' },
    { name: 'Microdermabrasion', description: 'Exfoliation mécanique', duration: 60, suggestedPrice: 70, category: 'Soins Visage' },
    
    // Maquillage
    { name: 'Maquillage jour', description: 'Maquillage naturel', duration: 45, suggestedPrice: 40, category: 'Maquillage' },
    { name: 'Maquillage soirée', description: 'Maquillage sophistiqué', duration: 60, suggestedPrice: 60, category: 'Maquillage' },
    { name: 'Maquillage mariée', description: 'Maquillage + essai', duration: 120, suggestedPrice: 150, category: 'Maquillage' },
    { name: 'Maquillage permanent sourcils', description: 'Microblading sourcils', duration: 120, suggestedPrice: 300, category: 'Maquillage' },
    { name: 'Extension de cils', description: 'Pose cils à cils', duration: 120, suggestedPrice: 100, category: 'Maquillage' },
    { name: 'Remplissage cils', description: 'Retouche extensions', duration: 60, suggestedPrice: 50, category: 'Maquillage' },
  ],
  
  onglerie: [
    // Manucure
    { name: 'Manucure simple', description: 'Soin + vernis classique', duration: 30, suggestedPrice: 20, category: 'Manucure' },
    { name: 'Manucure + vernis semi-permanent', description: 'Pose vernis semi-permanent', duration: 60, suggestedPrice: 35, category: 'Manucure' },
    { name: 'Dépose vernis semi-permanent', description: 'Retrait vernis semi-permanent', duration: 20, suggestedPrice: 10, category: 'Manucure' },
    { name: 'Capsules américaines', description: 'Pose capsules + gel', duration: 120, suggestedPrice: 60, category: 'Manucure' },
    { name: 'Remplissage capsules', description: 'Remplissage gel', duration: 90, suggestedPrice: 45, category: 'Manucure' },
    { name: 'Dépose capsules', description: 'Retrait capsules', duration: 30, suggestedPrice: 15, category: 'Manucure' },
    { name: 'Manucure russe', description: 'Manucure technique russe', duration: 90, suggestedPrice: 50, category: 'Manucure' },
    { name: 'Renforcement gel', description: 'Renforcement ongles naturels', duration: 60, suggestedPrice: 40, category: 'Manucure' },
    
    // Pédicure
    { name: 'Pédicure simple', description: 'Soin + vernis classique', duration: 45, suggestedPrice: 30, category: 'Pédicure' },
    { name: 'Pédicure + vernis semi-permanent', description: 'Soin + semi-permanent', duration: 75, suggestedPrice: 45, category: 'Pédicure' },
    { name: 'Beauté des pieds', description: 'Soin complet des pieds', duration: 60, suggestedPrice: 40, category: 'Pédicure' },
    { name: 'Pédicure médicale', description: 'Soin podologique', duration: 60, suggestedPrice: 50, category: 'Pédicure' },
    { name: 'Pose gel pieds', description: 'Gel sur ongles pieds', duration: 90, suggestedPrice: 50, category: 'Pédicure' },
    
    // Nail Art
    { name: 'Nail art simple (1-2 ongles)', description: 'Décoration simple', duration: 15, suggestedPrice: 5, category: 'Nail Art' },
    { name: 'Nail art moyen (5 ongles)', description: 'Décoration moyenne', duration: 20, suggestedPrice: 10, category: 'Nail Art' },
    { name: 'Nail art complet (10 ongles)', description: 'Tous les ongles décorés', duration: 30, suggestedPrice: 15, category: 'Nail Art' },
    { name: 'Nail art complexe', description: 'Décoration élaborée', duration: 45, suggestedPrice: 25, category: 'Nail Art' },
    { name: 'Strass et bijoux', description: 'Ajout de strass', duration: 10, suggestedPrice: 5, category: 'Nail Art' },
  ],
  
  massage: [
    { name: 'Massage relaxant 30min', description: 'Massage détente', duration: 30, suggestedPrice: 40, category: 'Massages Relaxants' },
    { name: 'Massage relaxant 60min', description: 'Massage complet du corps', duration: 60, suggestedPrice: 70, category: 'Massages Relaxants' },
    { name: 'Massage relaxant 90min', description: 'Massage prolongé', duration: 90, suggestedPrice: 100, category: 'Massages Relaxants' },
    { name: 'Massage dos et nuque 30min', description: 'Ciblé dos et épaules', duration: 30, suggestedPrice: 35, category: 'Massages Ciblés' },
    { name: 'Massage jambes lourdes', description: 'Drainage des jambes', duration: 45, suggestedPrice: 50, category: 'Massages Ciblés' },
    { name: 'Massage crânien', description: 'Massage du cuir chevelu', duration: 20, suggestedPrice: 25, category: 'Massages Ciblés' },
    { name: 'Massage aux pierres chaudes', description: 'Massage avec pierres', duration: 75, suggestedPrice: 85, category: 'Massages Spéciaux' },
    { name: 'Massage sportif', description: 'Massage décontractant', duration: 60, suggestedPrice: 75, category: 'Massages Spéciaux' },
    { name: 'Massage thaïlandais', description: 'Massage traditionnel thaï', duration: 90, suggestedPrice: 90, category: 'Massages Spéciaux' },
    { name: 'Massage ayurvédique', description: 'Massage indien aux huiles', duration: 75, suggestedPrice: 80, category: 'Massages Spéciaux' },
    { name: 'Réflexologie plantaire', description: 'Massage des pieds', duration: 45, suggestedPrice: 50, category: 'Massages Spéciaux' },
  ],
  
  spa: [
    { name: 'Gommage corps', description: 'Exfoliation complète', duration: 45, suggestedPrice: 50, category: 'Soins Corps' },
    { name: 'Enveloppement', description: 'Soin enveloppement', duration: 60, suggestedPrice: 65, category: 'Soins Corps' },
    { name: 'Hammam + gommage', description: 'Rituel oriental', duration: 90, suggestedPrice: 80, category: 'Rituels' },
    { name: 'Sauna + gommage', description: 'Rituel nordique', duration: 75, suggestedPrice: 70, category: 'Rituels' },
    { name: 'Forfait détente', description: 'Massage + soin visage', duration: 120, suggestedPrice: 120, category: 'Forfaits' },
    { name: 'Forfait bien-être', description: 'Massage + gommage + enveloppement', duration: 150, suggestedPrice: 150, category: 'Forfaits' },
    { name: 'Journée spa', description: 'Accès spa + 2 soins', duration: 240, suggestedPrice: 200, category: 'Forfaits' },
  ],
  
  barbier: [
    { name: 'Coupe homme classique', description: 'Coupe aux ciseaux', duration: 30, suggestedPrice: 25, category: 'Coupes' },
    { name: 'Coupe + barbe', description: 'Coupe cheveux + taille barbe', duration: 45, suggestedPrice: 35, category: 'Coupes' },
    { name: 'Coupe dégradé', description: 'Dégradé américain', duration: 35, suggestedPrice: 30, category: 'Coupes' },
    { name: 'Coupe enfant', description: 'Coupe pour enfants', duration: 20, suggestedPrice: 15, category: 'Coupes' },
    { name: 'Taille de barbe', description: 'Entretien barbe', duration: 20, suggestedPrice: 15, category: 'Barbe' },
    { name: 'Rasage traditionnel', description: 'Rasage au coupe-chou', duration: 30, suggestedPrice: 25, category: 'Barbe' },
    { name: 'Rasage + soin', description: 'Rasage + soin visage', duration: 45, suggestedPrice: 35, category: 'Barbe' },
    { name: 'Coupe + rasage', description: 'Coupe + rasage complet', duration: 60, suggestedPrice: 45, category: 'Forfaits' },
    { name: 'Coloration barbe', description: 'Coloration de la barbe', duration: 30, suggestedPrice: 25, category: 'Barbe' },
    { name: 'Soin barbe', description: 'Soin et hydratation', duration: 20, suggestedPrice: 20, category: 'Barbe' },
  ]
}

// Catégories disponibles par type d'établissement
export const CATEGORIES_BY_TYPE: Record<string, string[]> = {
  coiffure: ['Coupes Femme', 'Coupes Homme', 'Coupes Enfant', 'Brushing', 'Colorations', 'Soins', 'Coiffures', 'Autres'],
  esthetique: ['Épilation Visage', 'Épilation Corps', 'Soins Visage', 'Maquillage', 'Autres'],
  onglerie: ['Manucure', 'Pédicure', 'Nail Art', 'Autres'],
  massage: ['Massages Relaxants', 'Massages Ciblés', 'Massages Spéciaux', 'Autres'],
  spa: ['Soins Corps', 'Rituels', 'Forfaits', 'Autres'],
  barbier: ['Coupes', 'Barbe', 'Forfaits', 'Autres'],
}
