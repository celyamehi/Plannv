import { redirect } from 'next/navigation'

export default function ProfessionalLoginPage() {
  redirect('/login?type=professional')
}
