'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Settings, Lock, Mail, Trash2, LogOut, Shield, X } from 'lucide-react'

export default function ClientSettingsPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [profile, setProfile] = useState<any>(null)
    const [showPasswordModal, setShowPasswordModal] = useState(false)
    const [showEmailModal, setShowEmailModal] = useState(false)
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [newEmail, setNewEmail] = useState('')
    const [passwordError, setPasswordError] = useState('')
    const [emailError, setEmailError] = useState('')
    const [successMessage, setSuccessMessage] = useState('')

    useEffect(() => {
        checkAuth()
    }, [])

    const checkAuth = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) {
                router.push('/login')
                return
            }

            const { data: profileData } = await supabase
                .from('client_details')
                .select('*')
                .eq('id', session.user.id)
                .single()

            setProfile(profileData)
        } catch (error) {
            console.error('Erreur:', error)
        }
    }

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault()
        setPasswordError('')
        setSuccessMessage('')

        if (newPassword.length < 6) {
            setPasswordError('Le mot de passe doit contenir au moins 6 caractères')
            return
        }

        if (newPassword !== confirmPassword) {
            setPasswordError('Les mots de passe ne correspondent pas')
            return
        }

        setLoading(true)
        try {
            const { error } = await supabase.auth.updateUser({
                password: newPassword
            })

            if (error) throw error

            setSuccessMessage('Mot de passe modifié avec succès !')
            setShowPasswordModal(false)
            setNewPassword('')
            setConfirmPassword('')
        } catch (error: any) {
            setPasswordError(error.message || 'Erreur lors du changement de mot de passe')
        } finally {
            setLoading(false)
        }
    }

    const handleEmailChange = async (e: React.FormEvent) => {
        e.preventDefault()
        setEmailError('')
        setSuccessMessage('')

        if (!newEmail || !newEmail.includes('@')) {
            setEmailError('Veuillez entrer un email valide')
            return
        }

        setLoading(true)
        try {
            const { error } = await supabase.auth.updateUser({
                email: newEmail
            })

            if (error) throw error

            setSuccessMessage('Un email de confirmation a été envoyé à votre nouvelle adresse')
            setShowEmailModal(false)
            setNewEmail('')
        } catch (error: any) {
            setEmailError(error.message || 'Erreur lors du changement d\'email')
        } finally {
            setLoading(false)
        }
    }

    const handleDownloadData = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) return

            const { data: clientData } = await supabase
                .from('clients')
                .select('*')
                .eq('id', session.user.id)
                .single()

            const { data: appointments } = await supabase
                .from('appointments')
                .select('*')
                .eq('client_id', session.user.id)

            const { data: favorites } = await supabase
                .from('favorites')
                .select('*')
                .eq('client_id', session.user.id)

            const exportData = {
                profile: clientData,
                appointments: appointments || [],
                favorites: favorites || [],
                exportDate: new Date().toISOString()
            }

            const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `mes-donnees-kalendo-${new Date().toISOString().split('T')[0]}.json`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            URL.revokeObjectURL(url)

            setSuccessMessage('Vos données ont été téléchargées avec succès')
        } catch (error) {
            console.error('Erreur téléchargement données:', error)
            alert('Erreur lors du téléchargement des données')
        }
    }

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/')
    }

    const handleDeleteAccount = async () => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.')) {
            return
        }

        if (!confirm('Dernière confirmation : Toutes vos données seront définitivement supprimées.')) {
            return
        }

        setLoading(true)
        try {
            alert('La suppression de compte sera bientôt disponible.')
        } catch (error) {
            console.error('Erreur:', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Paramètres</h1>

            {successMessage && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
                    {successMessage}
                </div>
            )}

            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <Lock className="w-5 h-5 mr-2" />
                            Sécurité et confidentialité
                        </CardTitle>
                        <CardDescription>
                            Gérez la sécurité de votre compte
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <p className="font-medium mb-2">Mot de passe</p>
                            <p className="text-sm text-gray-600 mb-3">
                                Modifiez votre mot de passe pour sécuriser votre compte
                            </p>
                            <Button variant="outline" onClick={() => setShowPasswordModal(true)}>
                                <Shield className="w-4 h-4 mr-2" />
                                Changer le mot de passe
                            </Button>
                        </div>

                        <div className="pt-4 border-t">
                            <p className="font-medium mb-2">Email de connexion</p>
                            <p className="text-sm text-gray-600 mb-3">
                                {profile?.email}
                            </p>
                            <Button variant="outline" onClick={() => setShowEmailModal(true)}>
                                <Mail className="w-4 h-4 mr-2" />
                                Modifier l'email
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <Settings className="w-5 h-5 mr-2" />
                            Données et confidentialité
                        </CardTitle>
                        <CardDescription>
                            Gérez vos données personnelles
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <p className="font-medium mb-2">Télécharger mes données</p>
                            <p className="text-sm text-gray-600 mb-3">
                                Obtenez une copie de toutes vos données personnelles
                            </p>
                            <Button variant="outline" onClick={handleDownloadData}>
                                Télécharger mes données
                            </Button>
                        </div>

                        <div className="pt-4 border-t">
                            <p className="font-medium mb-2">Historique des activités</p>
                            <p className="text-sm text-gray-600 mb-3">
                                Consultez l'historique de vos réservations et activités
                            </p>
                            <Link href="/client/history">
                                <Button variant="outline">
                                    Voir l'historique
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-red-200">
                    <CardHeader>
                        <CardTitle className="flex items-center text-red-600">
                            <Trash2 className="w-5 h-5 mr-2" />
                            Zone dangereuse
                        </CardTitle>
                        <CardDescription>
                            Actions irréversibles sur votre compte
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <p className="font-medium mb-2">Déconnexion</p>
                            <p className="text-sm text-gray-600 mb-3">
                                Se déconnecter de votre compte sur cet appareil
                            </p>
                            <Button
                                variant="outline"
                                onClick={handleLogout}
                                className="text-orange-600 border-orange-600 hover:bg-orange-50"
                            >
                                <LogOut className="w-4 h-4 mr-2" />
                                Se déconnecter
                            </Button>
                        </div>

                        <div className="pt-4 border-t border-red-200">
                            <p className="font-medium mb-2 text-red-600">Supprimer mon compte</p>
                            <p className="text-sm text-gray-600 mb-3">
                                Supprimer définitivement votre compte et toutes vos données. Cette action est irréversible.
                            </p>
                            <Button
                                variant="outline"
                                onClick={handleDeleteAccount}
                                disabled={loading}
                                className="text-red-600 border-red-600 hover:bg-red-50"
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                {loading ? 'Suppression...' : 'Supprimer mon compte'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Modal changement de mot de passe */}
            {showPasswordModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">Changer le mot de passe</h2>
                            <button onClick={() => setShowPasswordModal(false)}>
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handlePasswordChange} className="space-y-4">
                            {passwordError && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded text-red-800 text-sm">
                                    {passwordError}
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium mb-2">Nouveau mot de passe</label>
                                <Input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Minimum 6 caractères"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Confirmer le mot de passe</label>
                                <Input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Retapez le mot de passe"
                                    required
                                />
                            </div>

                            <div className="flex space-x-2">
                                <Button type="submit" disabled={loading} className="flex-1 bg-nude-600">
                                    {loading ? 'Modification...' : 'Modifier'}
                                </Button>
                                <Button type="button" variant="outline" onClick={() => setShowPasswordModal(false)}>
                                    Annuler
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal changement d'email */}
            {showEmailModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">Modifier l'email</h2>
                            <button onClick={() => setShowEmailModal(false)}>
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleEmailChange} className="space-y-4">
                            {emailError && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded text-red-800 text-sm">
                                    {emailError}
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium mb-2">Email actuel</label>
                                <Input
                                    type="email"
                                    value={profile?.email || ''}
                                    disabled
                                    className="bg-gray-50"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Nouvel email</label>
                                <Input
                                    type="email"
                                    value={newEmail}
                                    onChange={(e) => setNewEmail(e.target.value)}
                                    placeholder="nouveau@email.com"
                                    required
                                />
                            </div>

                            <div className="flex space-x-2">
                                <Button type="submit" disabled={loading} className="flex-1 bg-nude-600">
                                    {loading ? 'Modification...' : 'Modifier'}
                                </Button>
                                <Button type="button" variant="outline" onClick={() => setShowEmailModal(false)}>
                                    Annuler
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
