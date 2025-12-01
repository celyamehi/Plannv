import NextAuth from 'next-auth'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

const handler = NextAuth({
  providers: [], // Ajoutez vos fournisseurs ici si nécessaire
  callbacks: {
    async session({ session }) {
      const supabase = createRouteHandlerClient({ cookies })
      const { data: { user } } = await supabase.auth.getUser()
      session.user = user
      return session
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
})

export { handler as GET, handler as POST }
