/**
 * Module d'envoi d'e-mails de bienvenue Kalendo via Resend
 */

interface SendWelcomeEmailParams {
  to: string
  fullName?: string
  userType: 'client' | 'professional'
}

/**
 * Génère le template HTML pour un professionnel (inspiré du style moderne Zayna/Planity)
 */
function getProfessionalEmailHtml(fullName: string): string {
  const name = fullName ? fullName.split(' ')[0] : 'Cher partenaire'
  const appUrl = 'https://www.kalendo.space'

  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bienvenue sur Kalendo Pro</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f7f5f2; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #2d2a26; -webkit-font-smoothing: antialiased;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f7f5f2; padding: 40px 15px;">
    <tr>
      <td align="center">
        <!-- Conteneur principal -->
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.04); border: 1px solid #ebe5df;">
          
          <!-- En-tête avec Logo -->
          <tr>
            <td style="padding: 35px 40px 25px 40px; border-bottom: 1px solid #f0eae4;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="left">
                    <span style="font-size: 26px; font-weight: 800; letter-spacing: -0.5px; color: #1a1816;">
                      Kalendo <span style="display: inline-block; font-size: 11px; font-weight: 700; background: #9d7854; color: #ffffff; padding: 3px 8px; border-radius: 6px; vertical-align: middle; margin-left: 6px; letter-spacing: 0.5px;">PRO</span>
                    </span>
                  </td>
                  <td align="right">
                    <a href="${appUrl}" style="color: #9d7854; font-size: 13px; text-decoration: none; font-weight: 600;">kalendo.space</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Titre principal -->
          <tr>
            <td style="padding: 40px 40px 20px 40px;">
              <h1 style="margin: 0 0 16px 0; font-size: 32px; font-weight: 800; color: #1a1816; line-height: 1.2; letter-spacing: -0.8px;">
                Bienvenue sur Kalendo !
              </h1>
              <p style="margin: 0; font-size: 18px; line-height: 1.5; color: #9d7854; font-weight: 700;">
                Bonjour ${name},<br>
                Ajoutez votre établissement étape par étape
              </p>
            </td>
          </tr>

          <!-- Encadré d'information / Essai gratuit -->
          <tr>
            <td style="padding: 0 40px 30px 40px;">
              <div style="background-color: #fbf8f5; border-left: 4px solid #9d7854; border-radius: 0 12px 12px 0; padding: 18px 20px;">
                <p style="margin: 0 0 6px 0; font-size: 14px; font-weight: 700; color: #1a1816;">
                  🎉 Accès Kalendo Pro activé (30 jours d'essai gratuit offerts) :
                </p>
                <p style="margin: 0; font-size: 13px; line-height: 1.5; color: #5a544e;">
                  Votre compte professionnel est prêt. Pour commencer à recevoir des rendez-vous en ligne, finalisez l'ajout de votre salon en quelques minutes depuis notre plateforme.
                </p>
              </div>
            </td>
          </tr>

          <!-- Étapes à suivre -->
          <tr>
            <td style="padding: 0 40px 30px 40px;">
              <h3 style="margin: 0 0 18px 0; font-size: 15px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #8a8279;">
                Les 3 étapes pour lancer votre salon :
              </h3>

              <!-- Étape 1 -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 14px; background: #faf8f6; border-radius: 12px; padding: 14px 16px;">
                <tr>
                  <td width="36" valign="top">
                    <div style="width: 28px; height: 28px; border-radius: 50%; background: #9d7854; color: #fff; font-weight: 700; font-size: 13px; line-height: 28px; text-align: center;">1</div>
                  </td>
                  <td>
                    <p style="margin: 0 0 2px 0; font-size: 14px; font-weight: 700; color: #1a1816;">Informations & Localisation</p>
                    <p style="margin: 0; font-size: 12px; color: #6e6760; line-height: 1.4;">Renseignez le nom, l'adresse exacte et ajoutez les photos de votre établissement.</p>
                  </td>
                </tr>
              </table>

              <!-- Étape 2 -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 14px; background: #faf8f6; border-radius: 12px; padding: 14px 16px;">
                <tr>
                  <td width="36" valign="top">
                    <div style="width: 28px; height: 28px; border-radius: 50%; background: #9d7854; color: #fff; font-weight: 700; font-size: 13px; line-height: 28px; text-align: center;">2</div>
                  </td>
                  <td>
                    <p style="margin: 0 0 2px 0; font-size: 14px; font-weight: 700; color: #1a1816;">Services & Tarifs</p>
                    <p style="margin: 0; font-size: 12px; color: #6e6760; line-height: 1.4;">Ajoutez vos prestations (coupe, coiffure, soin, barbe...) avec leurs prix en DA et durée.</p>
                  </td>
                </tr>
              </table>

              <!-- Étape 3 -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background: #faf8f6; border-radius: 12px; padding: 14px 16px;">
                <tr>
                  <td width="36" valign="top">
                    <div style="width: 28px; height: 28px; border-radius: 50%; background: #9d7854; color: #fff; font-weight: 700; font-size: 13px; line-height: 28px; text-align: center;">3</div>
                  </td>
                  <td>
                    <p style="margin: 0 0 2px 0; font-size: 14px; font-weight: 700; color: #1a1816;">Horaires d'ouverture</p>
                    <p style="margin: 0; font-size: 12px; color: #6e6760; line-height: 1.4;">Définissez vos jours d'ouverture et heures de travail pour ouvrir votre planning.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Bouton CTA -->
          <tr>
            <td align="center" style="padding: 10px 40px 40px 40px;">
              <a href="${appUrl}/professionals/signup" style="display: inline-block; background: linear-gradient(135deg, #9d7854 0%, #b68d63 100%); color: #ffffff; text-decoration: none; padding: 16px 36px; border-radius: 12px; font-weight: 700; font-size: 15px; letter-spacing: 0.2px; box-shadow: 0 6px 18px rgba(157, 120, 84, 0.28);">
                Ajouter mon salon maintenant →
              </a>
            </td>
          </tr>

          <!-- Pied de page du mail -->
          <tr>
            <td style="background-color: #fcfbfa; padding: 25px 40px; border-top: 1px solid #f0eae4; text-align: center;">
              <p style="margin: 0 0 8px 0; font-size: 12px; color: #8a8279;">
                Besoin d'aide ? Notre équipe est disponible : <a href="mailto:kalendodz@gmail.com" style="color: #9d7854; text-decoration: none; font-weight: 600;">kalendodz@gmail.com</a>
              </p>
              <p style="margin: 0; font-size: 11px; color: #a9a29a;">
                © ${new Date().getFullYear()} Kalendo. La plateforme de réservation beauté & bien-être en Algérie 🇩🇿
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`
}

/**
 * Génère le template HTML pour un client
 */
function getClientEmailHtml(fullName: string): string {
  const name = fullName ? fullName.split(' ')[0] : 'Cher(e) client(e)'
  const appUrl = 'https://www.kalendo.space'

  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bienvenue sur Kalendo</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f7f5f2; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #2d2a26; -webkit-font-smoothing: antialiased;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f7f5f2; padding: 40px 15px;">
    <tr>
      <td align="center">
        <!-- Conteneur principal -->
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.04); border: 1px solid #ebe5df;">
          
          <!-- En-tête avec Logo -->
          <tr>
            <td style="padding: 35px 40px 25px 40px; border-bottom: 1px solid #f0eae4;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="left">
                    <span style="font-size: 26px; font-weight: 800; letter-spacing: -0.5px; color: #1a1816;">
                      Kalendo
                    </span>
                  </td>
                  <td align="right">
                    <a href="${appUrl}" style="color: #9d7854; font-size: 13px; text-decoration: none; font-weight: 600;">kalendo.space</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Titre principal -->
          <tr>
            <td style="padding: 40px 40px 20px 40px;">
              <h1 style="margin: 0 0 16px 0; font-size: 32px; font-weight: 800; color: #1a1816; line-height: 1.2; letter-spacing: -0.8px;">
                Bienvenue sur Kalendo !
              </h1>
              <p style="margin: 0; font-size: 18px; line-height: 1.5; color: #9d7854; font-weight: 700;">
                Bonjour ${name},<br>
                Vos rendez-vous beauté en quelques clics
              </p>
            </td>
          </tr>

          <!-- Message de bienvenue -->
          <tr>
            <td style="padding: 0 40px 30px 40px;">
              <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 1.6; color: #5a544e;">
                Nous sommes ravis de vous compter parmi nous ! Sur Kalendo, trouvez les meilleurs coiffeurs, instituts de beauté, barbiers et spas en Algérie, et réservez 24h/24 sans avoir besoin d'appeler.
              </p>

              <div style="background-color: #fbf8f5; border-radius: 14px; padding: 20px; border: 1px solid #efe8e1;">
                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 12px;">
                  <tr>
                    <td width="30" style="font-size: 18px;">✨</td>
                    <td style="font-size: 13px; color: #2d2a26; font-weight: 600;">Réservation 100% gratuite et instantanée</td>
                  </tr>
                </table>
                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 12px;">
                  <tr>
                    <td width="30" style="font-size: 18px;">⭐</td>
                    <td style="font-size: 13px; color: #2d2a26; font-weight: 600;">Salons recommandés et avis clients vérifiés</td>
                  </tr>
                </table>
                <table width="100%" border="0" cellspacing="0" cellpadding="0">
                  <tr>
                    <td width="30" style="font-size: 18px;">📱</td>
                    <td style="font-size: 13px; color: #2d2a26; font-weight: 600;">Gestion simple de vos rendez-vous et rappels</td>
                  </tr>
                </table>
              </div>
            </td>
          </tr>

          <!-- Bouton CTA -->
          <tr>
            <td align="center" style="padding: 10px 40px 40px 40px;">
              <a href="${appUrl}/search" style="display: inline-block; background: linear-gradient(135deg, #9d7854 0%, #b68d63 100%); color: #ffffff; text-decoration: none; padding: 16px 36px; border-radius: 12px; font-weight: 700; font-size: 15px; letter-spacing: 0.2px; box-shadow: 0 6px 18px rgba(157, 120, 84, 0.28);">
                Trouver un salon près de chez moi →
              </a>
            </td>
          </tr>

          <!-- Pied de page du mail -->
          <tr>
            <td style="background-color: #fcfbfa; padding: 25px 40px; border-top: 1px solid #f0eae4; text-align: center;">
              <p style="margin: 0 0 8px 0; font-size: 12px; color: #8a8279;">
                Une question ? Écrivez-nous à <a href="mailto:kalendodz@gmail.com" style="color: #9d7854; text-decoration: none; font-weight: 600;">kalendodz@gmail.com</a>
              </p>
              <p style="margin: 0; font-size: 11px; color: #a9a29a;">
                © ${new Date().getFullYear()} Kalendo. La plateforme de réservation beauté & bien-être en Algérie 🇩🇿
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`
}

/**
 * Envoie un email de bienvenue via Resend
 */
export async function sendWelcomeEmail({ to, fullName = '', userType }: SendWelcomeEmailParams): Promise<{ success: boolean; error?: string }> {
  try {
    const apiKey = process.env.RESEND_API_KEY

    if (!apiKey) {
      console.warn('⚠️ [RESEND] Aucune clé RESEND_API_KEY trouvée dans les variables d\'environnement. E-mail simulé.')
      return { success: false, error: 'RESEND_API_KEY non configurée' }
    }

    const isPro = userType === 'professional'
    const subject = isPro 
      ? 'Bienvenue sur Kalendo - Ajoutez votre salon !' 
      : 'Bienvenue sur Kalendo ! Vos rendez-vous beauté en quelques clics'

    const html = isPro 
      ? getProfessionalEmailHtml(fullName) 
      : getClientEmailHtml(fullName)

    // Expéditeur par défaut : onboarding@resend.dev (fourni par défaut par Resend avant validation de domaine)
    // ou "Kalendo <kalendodz@gmail.com>" si configuré
    const fromAddress = process.env.RESEND_FROM_EMAIL || 'Kalendo <onboarding@resend.dev>'

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: fromAddress,
        to: [to],
        subject: subject,
        html: html
      })
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('❌ [RESEND] Erreur lors de l\'envoi de l\'e-mail:', data)
      return { success: false, error: data.message || 'Erreur Resend' }
    }

    console.log(`✅ [RESEND] E-mail de bienvenue envoyé avec succès à ${to} (ID: ${data.id})`)
    return { success: true }
  } catch (err: any) {
    console.error('❌ [RESEND] Exception lors de l\'envoi:', err)
    return { success: false, error: err.message }
  }
}
