import NextAuth from 'next-auth';

type NextAuthConfig = Parameters<typeof NextAuth>[0];

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }: { auth: any, request: { nextUrl: URL } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
      const isOnLogin = nextUrl.pathname.startsWith('/login');
      const isOnSignup = nextUrl.pathname.startsWith('/signup');
      const isOnPublicPage = [
        '/', 
        '/search', 
        '/establishments',
        '/booking',
        '/test-connection',
        '/debug-logs',
        '/test-auth',
        '/api/debug',
        '/_next',
        '/favicon.ico',
        '/assets'
      ].some(path => nextUrl.pathname === path || nextUrl.pathname.startsWith(`${path}/`));

      // Si l'utilisateur est sur le tableau de bord mais pas connecté, rediriger vers la page de connexion
      if (isOnDashboard && !isLoggedIn) {
        const redirectUrl = new URL('/login', nextUrl.origin);
        redirectUrl.searchParams.set('redirectedFrom', nextUrl.pathname);
        return Response.redirect(redirectUrl);
      }

      // Si l'utilisateur est sur la page de connexion et déjà connecté, le rediriger
      if (isOnLogin && isLoggedIn) {
        const redirectTo = nextUrl.searchParams.get('redirectedFrom') || '/dashboard';
        return Response.redirect(new URL(redirectTo, nextUrl.origin));
      }

      // Si l'utilisateur est sur une page publique ou connecté, autoriser l'accès
      if (isOnPublicPage || isLoggedIn) {
        return true;
      }

      // Rediriger vers la page de connexion par défaut
      return Response.redirect(new URL('/login', nextUrl.origin));
    },
  },
  providers: [], // Ajoutez vos fournisseurs d'authentification ici si nécessaire
} satisfies NextAuthConfig;
