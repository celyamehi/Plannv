# 🚀 GUIDE DES FONCTIONNALITÉS FUTURES

Ce document explique comment utiliser les 4 tables conservées pour ajouter des fonctionnalités avancées à ton application.

---

## 📅 **1. AVAILABILITY_SLOTS - Disponibilités Avancées**

### 🎯 **Objectif**
Gérer les créneaux de disponibilité personnalisés pour chaque employé (staff_member).

### 📊 **Structure de la table**
```sql
availability_slots (
    id UUID PRIMARY KEY,
    staff_member_id UUID REFERENCES staff_members(id),
    day_of_week INTEGER,  -- 0=Dimanche, 1=Lundi, ..., 6=Samedi
    start_time TIME,
    end_time TIME,
    is_available BOOLEAN,
    created_at TIMESTAMPTZ
)
```

### 💡 **Fonctionnalités à implémenter**

#### **A. Gestion des horaires personnalisés**
```typescript
// Page: /app/professional/pro-staff/availability/page.tsx
// Permet de définir les horaires de chaque employé

const setStaffAvailability = async (staffId: string, slots: AvailabilitySlot[]) => {
  // Supprimer les anciens créneaux
  await supabase
    .from('availability_slots')
    .delete()
    .eq('staff_member_id', staffId)
  
  // Insérer les nouveaux créneaux
  await supabase
    .from('availability_slots')
    .insert(slots.map(slot => ({
      staff_member_id: staffId,
      day_of_week: slot.day,
      start_time: slot.startTime,
      end_time: slot.endTime,
      is_available: true
    })))
}
```

#### **B. Vérification de disponibilité lors de la réservation**
```typescript
// Page: /app/booking/[slug]/page.tsx
// Afficher uniquement les créneaux disponibles

const getAvailableSlots = async (staffId: string, date: Date) => {
  const dayOfWeek = date.getDay()
  
  const { data: slots } = await supabase
    .from('availability_slots')
    .select('*')
    .eq('staff_member_id', staffId)
    .eq('day_of_week', dayOfWeek)
    .eq('is_available', true)
  
  return slots
}
```

#### **C. Gestion des congés/absences**
```typescript
// Marquer un employé comme indisponible pour une période
const markUnavailable = async (staffId: string, startDate: Date, endDate: Date) => {
  // Créer des slots d'indisponibilité
  await supabase
    .from('availability_slots')
    .insert({
      staff_member_id: staffId,
      day_of_week: startDate.getDay(),
      start_time: '00:00',
      end_time: '23:59',
      is_available: false
    })
}
```

### 🎨 **Interface UI suggérée**
- Calendrier hebdomadaire avec drag & drop
- Toggle pour activer/désactiver des créneaux
- Vue mensuelle pour les congés

---

## 🔔 **2. NOTIFICATIONS - Communication Client**

### 🎯 **Objectif**
Envoyer des notifications automatiques aux clients et professionnels.

### 📊 **Structure de la table**
```sql
notifications (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES profiles(id),
    type TEXT,  -- 'appointment_reminder', 'confirmation', 'cancellation'
    title TEXT,
    message TEXT,
    is_read BOOLEAN DEFAULT false,
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ
)
```

### 💡 **Fonctionnalités à implémenter**

#### **A. Rappels de rendez-vous automatiques**
```typescript
// Fonction serveur: /app/api/cron/send-reminders/route.ts
// Exécuter quotidiennement via Vercel Cron

export async function GET() {
  // Récupérer les RDV de demain
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  
  const { data: appointments } = await supabase
    .from('appointments')
    .select('*, client:profiles(*), service:services(*)')
    .eq('appointment_date', tomorrow.toISOString().split('T')[0])
    .eq('status', 'confirmed')
  
  // Créer une notification pour chaque client
  for (const apt of appointments) {
    await supabase
      .from('notifications')
      .insert({
        user_id: apt.client_id,
        type: 'appointment_reminder',
        title: 'Rappel de rendez-vous',
        message: `Votre rendez-vous ${apt.service.name} est demain à ${apt.start_time}`,
        sent_at: new Date()
      })
    
    // Envoyer email/SMS via service externe
    await sendEmail(apt.client.email, 'Rappel RDV', message)
  }
}
```

#### **B. Centre de notifications dans l'app**
```typescript
// Composant: /components/NotificationCenter.tsx
// Afficher les notifications non lues

const NotificationCenter = () => {
  const [notifications, setNotifications] = useState([])
  
  useEffect(() => {
    const fetchNotifications = async () => {
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .eq('is_read', false)
        .order('created_at', { ascending: false })
        .limit(10)
      
      setNotifications(data)
    }
    
    fetchNotifications()
  }, [])
  
  return (
    <div className="notification-dropdown">
      {notifications.map(notif => (
        <NotificationItem key={notif.id} notification={notif} />
      ))}
    </div>
  )
}
```

#### **C. Notifications en temps réel**
```typescript
// Utiliser Supabase Realtime
const subscribeToNotifications = () => {
  const channel = supabase
    .channel('notifications')
    .on('postgres_changes', 
      { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'notifications',
        filter: `user_id=eq.${userId}`
      }, 
      (payload) => {
        // Afficher toast notification
        toast.info(payload.new.message)
      }
    )
    .subscribe()
}
```

### 🎨 **Types de notifications**
- ✅ Confirmation de rendez-vous
- ⏰ Rappel 24h avant
- ❌ Annulation par le salon
- 💰 Promotion/offre spéciale
- ⭐ Demande d'avis après RDV

---

## 💳 **3. TRANSACTIONS - Paiements en Ligne**

### 🎯 **Objectif**
Gérer les paiements, acomptes et historique financier.

### 📊 **Structure de la table**
```sql
transactions (
    id UUID PRIMARY KEY,
    appointment_id UUID REFERENCES appointments(id),
    client_id UUID REFERENCES profiles(id),
    establishment_id UUID REFERENCES establishments(id),
    amount DECIMAL(10, 2),
    type TEXT,  -- 'payment', 'deposit', 'refund'
    status TEXT,  -- 'pending', 'completed', 'failed', 'refunded'
    payment_method TEXT,  -- 'card', 'cash', 'online'
    stripe_payment_id TEXT,
    created_at TIMESTAMPTZ
)
```

### 💡 **Fonctionnalités à implémenter**

#### **A. Paiement d'acompte à la réservation**
```typescript
// Page: /app/booking/[slug]/page.tsx
// Demander un acompte de 30% à la réservation

const createAppointmentWithDeposit = async (appointmentData) => {
  // 1. Créer le rendez-vous
  const { data: appointment } = await supabase
    .from('appointments')
    .insert(appointmentData)
    .select()
    .single()
  
  // 2. Créer la transaction d'acompte
  const depositAmount = appointmentData.total_price * 0.3
  
  const { data: transaction } = await supabase
    .from('transactions')
    .insert({
      appointment_id: appointment.id,
      client_id: appointmentData.client_id,
      establishment_id: appointmentData.establishment_id,
      amount: depositAmount,
      type: 'deposit',
      status: 'pending',
      payment_method: 'online'
    })
    .select()
    .single()
  
  // 3. Rediriger vers Stripe
  const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_KEY)
  const { error } = await stripe.redirectToCheckout({
    lineItems: [{
      price_data: {
        currency: 'eur',
        product_data: {
          name: `Acompte - ${appointmentData.service_name}`,
        },
        unit_amount: depositAmount * 100,
      },
      quantity: 1,
    }],
    mode: 'payment',
    successUrl: `${window.location.origin}/booking/confirmation/${appointment.id}`,
    cancelUrl: `${window.location.origin}/booking/${slug}`,
  })
}
```

#### **B. Webhook Stripe pour confirmer le paiement**
```typescript
// API: /app/api/webhooks/stripe/route.ts

export async function POST(req: Request) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')
  
  const event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object
    
    // Mettre à jour la transaction
    await supabase
      .from('transactions')
      .update({ 
        status: 'completed',
        stripe_payment_id: session.payment_intent
      })
      .eq('id', session.metadata.transaction_id)
    
    // Confirmer le rendez-vous
    await supabase
      .from('appointments')
      .update({ 
        status: 'confirmed',
        prepayment_status: 'paid'
      })
      .eq('id', session.metadata.appointment_id)
  }
  
  return new Response('OK', { status: 200 })
}
```

#### **C. Historique des transactions**
```typescript
// Page: /app/profile/transactions/page.tsx
// Afficher l'historique des paiements

const TransactionsHistory = () => {
  const [transactions, setTransactions] = useState([])
  
  useEffect(() => {
    const fetchTransactions = async () => {
      const { data } = await supabase
        .from('transactions')
        .select(`
          *,
          appointment:appointments(
            appointment_date,
            start_time,
            service:services(name)
          ),
          establishment:establishments(name)
        `)
        .eq('client_id', userId)
        .order('created_at', { ascending: false })
      
      setTransactions(data)
    }
    
    fetchTransactions()
  }, [])
  
  return (
    <div className="transactions-list">
      {transactions.map(tx => (
        <TransactionCard key={tx.id} transaction={tx} />
      ))}
    </div>
  )
}
```

### 💰 **Cas d'usage**
- Acompte 30% à la réservation
- Paiement du solde sur place
- Remboursement en cas d'annulation
- Historique des paiements
- Factures automatiques

---

## 🎫 **4. WAITING_LIST - Liste d'Attente**

### 🎯 **Objectif**
Gérer les demandes de clients quand un créneau est complet.

### 📊 **Structure de la table**
```sql
waiting_list (
    id UUID PRIMARY KEY,
    client_id UUID REFERENCES profiles(id),
    establishment_id UUID REFERENCES establishments(id),
    staff_member_id UUID REFERENCES staff_members(id),
    service_id UUID REFERENCES services(id),
    preferred_date DATE,
    preferred_time_start TIME,
    preferred_time_end TIME,
    status TEXT,  -- 'waiting', 'notified', 'booked', 'expired'
    created_at TIMESTAMPTZ
)
```

### 💡 **Fonctionnalités à implémenter**

#### **A. Ajouter à la liste d'attente**
```typescript
// Page: /app/booking/[slug]/page.tsx
// Bouton "Liste d'attente" si aucun créneau disponible

const addToWaitingList = async (bookingData) => {
  const { data } = await supabase
    .from('waiting_list')
    .insert({
      client_id: userId,
      establishment_id: bookingData.establishmentId,
      staff_member_id: bookingData.staffId,
      service_id: bookingData.serviceId,
      preferred_date: bookingData.date,
      preferred_time_start: bookingData.timeStart,
      preferred_time_end: bookingData.timeEnd,
      status: 'waiting'
    })
  
  toast.success('Vous êtes sur liste d\'attente ! Nous vous préviendrons si un créneau se libère.')
}
```

#### **B. Notification automatique lors d'annulation**
```typescript
// Fonction: Quand un RDV est annulé
// Notifier les personnes en liste d'attente

const notifyWaitingList = async (cancelledAppointment) => {
  // Trouver les personnes en attente pour ce créneau
  const { data: waitingClients } = await supabase
    .from('waiting_list')
    .select('*, client:profiles(*)')
    .eq('establishment_id', cancelledAppointment.establishment_id)
    .eq('staff_member_id', cancelledAppointment.staff_member_id)
    .eq('preferred_date', cancelledAppointment.appointment_date)
    .eq('status', 'waiting')
    .order('created_at', { ascending: true })
    .limit(3)  // Notifier les 3 premiers
  
  // Envoyer notification à chaque client
  for (const waiting of waitingClients) {
    await supabase
      .from('notifications')
      .insert({
        user_id: waiting.client_id,
        type: 'slot_available',
        title: 'Créneau disponible !',
        message: `Un créneau s'est libéré le ${cancelledAppointment.appointment_date}. Réservez vite !`
      })
    
    // Mettre à jour le statut
    await supabase
      .from('waiting_list')
      .update({ status: 'notified' })
      .eq('id', waiting.id)
    
    // Envoyer email/SMS
    await sendEmail(waiting.client.email, 'Créneau disponible', message)
  }
}
```

#### **C. Gestion de la liste d'attente (Pro)**
```typescript
// Page: /app/professional/waiting-list/page.tsx
// Dashboard pour voir et gérer la liste d'attente

const WaitingListDashboard = () => {
  const [waitingList, setWaitingList] = useState([])
  
  useEffect(() => {
    const fetchWaitingList = async () => {
      const { data } = await supabase
        .from('waiting_list')
        .select(`
          *,
          client:profiles(full_name, email, phone),
          service:services(name),
          staff_member:staff_members(first_name, last_name)
        `)
        .eq('establishment_id', establishmentId)
        .eq('status', 'waiting')
        .order('created_at', { ascending: true })
      
      setWaitingList(data)
    }
    
    fetchWaitingList()
  }, [])
  
  return (
    <div className="waiting-list-dashboard">
      <h2>Liste d'attente ({waitingList.length})</h2>
      {waitingList.map(item => (
        <WaitingListItem 
          key={item.id} 
          item={item}
          onContact={() => contactClient(item)}
        />
      ))}
    </div>
  )
}
```

### 🎯 **Avantages**
- Réduire les créneaux perdus
- Fidéliser les clients (service premium)
- Optimiser le taux de remplissage
- Notifications automatiques

---

## 📋 **Résumé des Priorités d'Implémentation**

### **Phase 1 - Essentiel (1-2 semaines)**
1. ✅ **Notifications** - Rappels de RDV
2. ✅ **Availability_slots** - Horaires personnalisés

### **Phase 2 - Monétisation (2-4 semaines)**
3. 💳 **Transactions** - Paiements Stripe
4. 🎫 **Waiting_list** - Liste d'attente

### **ROI Estimé**
- **Notifications**: +30% de taux de présentation
- **Availability_slots**: -50% de conflits d'horaires
- **Transactions**: +40% de réservations confirmées
- **Waiting_list**: +15% de taux de remplissage

---

**Prêt à implémenter ces fonctionnalités ! 🚀**
