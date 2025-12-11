"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase/client"
import ProSidebar from "@/components/layout/ProSidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Calendar, Clock, Shield, Trash2 } from "lucide-react"

interface StaffMember {
  id: string
  first_name: string
  last_name: string
  is_active: boolean
}

interface TimeOff {
  id: string
  start_date: string
  end_date: string
  reason: string | null
}

interface DaySchedule {
  enabled: boolean
  start: string
  end: string
}

const DAYS = [
  { label: "Lundi", value: 1 },
  { label: "Mardi", value: 2 },
  { label: "Mercredi", value: 3 },
  { label: "Jeudi", value: 4 },
  { label: "Vendredi", value: 5 },
  { label: "Samedi", value: 6 },
  { label: "Dimanche", value: 0 }
]

const defaultSchedule = DAYS.reduce<Record<number, DaySchedule>>((acc, day) => {
  acc[day.value] = {
    enabled: day.value >= 1 && day.value <= 6,
    start: "09:00",
    end: "18:00"
  }
  return acc
}, {} as Record<number, DaySchedule>)

export default function AvailabilityPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [savingSchedule, setSavingSchedule] = useState(false)
  const [addingTimeOff, setAddingTimeOff] = useState(false)
  const [staff, setStaff] = useState<StaffMember[]>([])
  const [selectedStaffId, setSelectedStaffId] = useState<string>("")
  const [schedule, setSchedule] = useState<Record<number, DaySchedule>>(defaultSchedule)
  const [timeOffList, setTimeOffList] = useState<TimeOff[]>([])
  const [newTimeOff, setNewTimeOff] = useState({ start_date: "", end_date: "", reason: "" })

  const selectedStaff = useMemo(() => staff.find((member) => member.id === selectedStaffId) || null, [staff, selectedStaffId])

  useEffect(() => {
    loadInitialData()
  }, [])

  useEffect(() => {
    if (selectedStaffId) {
      loadSchedule()
      loadTimeOff()
    }
  }, [selectedStaffId])

  const loadInitialData = async () => {
    try {
      const {
        data: { session }
      } = await supabase.auth.getSession()
      if (!session) return

      const { data: establishment } = await supabase
        .from("establishments")
        .select("id")
        .eq("owner_id", session.user.id)
        .single()

      if (!establishment) return

      const { data: staffData, error } = await supabase
        .from("staff_members")
        .select("id, first_name, last_name, is_active")
        .eq("establishment_id", establishment.id)
        .eq("is_active", true)
        .order("first_name")

      if (error) throw error

      setStaff(staffData || [])
      if (staffData && staffData.length > 0) {
        setSelectedStaffId(staffData[0].id)
      }
    } catch (error) {
      console.error("Erreur chargement collaborateurs:", error)
      toast.error("Impossible de charger vos collaborateurs")
    } finally {
      setLoading(false)
    }
  }

  const loadSchedule = async () => {
    if (!selectedStaffId) return
    try {
      const { data, error } = await supabase
        .from("availability_slots")
        .select("day_of_week, start_time, end_time, is_active")
        .eq("staff_member_id", selectedStaffId)

      if (error) throw error

      const updatedSchedule: Record<number, DaySchedule> = JSON.parse(JSON.stringify(defaultSchedule))

      data?.forEach((slot) => {
        const day = slot.day_of_week
        if (day in updatedSchedule) {
          updatedSchedule[day] = {
            enabled: slot.is_active,
            start: slot.start_time?.substring(0, 5) || "09:00",
            end: slot.end_time?.substring(0, 5) || "18:00"
          }
        }
      })

      setSchedule(updatedSchedule)
    } catch (error) {
      console.error("Erreur chargement disponibilités:", error)
      toast.error("Impossible de charger les disponibilités")
    }
  }

  const loadTimeOff = async () => {
    if (!selectedStaffId) return
    try {
      const { data, error } = await supabase
        .from("time_off")
        .select("id, start_date, end_date, reason")
        .eq("staff_member_id", selectedStaffId)
        .order("start_date", { ascending: false })

      if (error) throw error
      setTimeOffList(data || [])
    } catch (error) {
      console.error("Erreur chargement absences:", error)
      toast.error("Impossible de charger les absences")
    }
  }

  const handleScheduleChange = (day: number, field: keyof DaySchedule, value: boolean | string) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value
      }
    }))
  }

  const handleSaveSchedule = async () => {
    if (!selectedStaffId) return
    setSavingSchedule(true)
    try {
      const rows = DAYS.map((day) => ({
        staff_member_id: selectedStaffId,
        day_of_week: day.value,
        start_time: `${schedule[day.value].start}:00`,
        end_time: `${schedule[day.value].end}:00`,
        is_active: Boolean(schedule[day.value]?.enabled)
      }))

      await supabase.from("availability_slots").delete().eq("staff_member_id", selectedStaffId)

      const { error: insertError } = await supabase.from("availability_slots").insert(rows)
      if (insertError) throw insertError

      toast.success("Disponibilités mises à jour")
      loadSchedule()
    } catch (error) {
      console.error("Erreur sauvegarde disponibilités:", error)
      toast.error("Impossible d'enregistrer les disponibilités")
    } finally {
      setSavingSchedule(false)
    }
  }

  const handleAddTimeOff = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedStaffId || !newTimeOff.start_date || !newTimeOff.end_date) return
    setAddingTimeOff(true)
    try {
      const { error } = await supabase.from("time_off").insert({
        staff_member_id: selectedStaffId,
        start_date: newTimeOff.start_date,
        end_date: newTimeOff.end_date,
        reason: newTimeOff.reason || null
      })

      if (error) throw error

      toast.success("Journée bloquée ajoutée")
      setNewTimeOff({ start_date: "", end_date: "", reason: "" })
      loadTimeOff()
    } catch (error) {
      console.error("Erreur ajout absence:", error)
      toast.error("Impossible d'ajouter la journée bloquée")
    } finally {
      setAddingTimeOff(false)
    }
  }

  const handleDeleteTimeOff = async (id: string) => {
    if (!confirm("Supprimer cette indisponibilité ?")) return
    try {
      const { error } = await supabase.from("time_off").delete().eq("id", id)
      if (error) throw error
      toast.success("Journée bloquée supprimée")
      loadTimeOff()
    } catch (error) {
      console.error("Erreur suppression absence:", error)
      toast.error("Impossible de supprimer cette journée")
    }
  }

  if (loading) {
    return (
      <ProSidebar>
        <div className="p-10 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-nude-600" />
            Chargement des disponibilités...
          </div>
        </div>
      </ProSidebar>
    )
  }

  if (staff.length === 0) {
    return (
      <ProSidebar>
        <div className="p-10">
          <Card>
            <CardContent className="p-8 text-center space-y-4">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto" />
              <h2 className="text-xl font-semibold">Ajoutez d'abord vos collaborateurs</h2>
              <p className="text-gray-600">
                Vous devez créer au moins un collaborateur avant de configurer ses disponibilités.
              </p>
              <Button onClick={() => router.push("/professional/pro-staff")}>Gérer mon équipe</Button>
            </CardContent>
          </Card>
        </div>
      </ProSidebar>
    )
  }

  return (
    <ProSidebar>
      <div className="p-8 space-y-8">
        <div className="flex flex-col gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-1">Disponibilités de l'équipe</h1>
            <p className="text-gray-600">Définissez les horaires de réservation pour chaque collaborateur.</p>
          </div>

          <div>
            <Label htmlFor="staffSelect" className="text-sm font-medium text-gray-700">
              Collaborateur
            </Label>
            <select
              id="staffSelect"
              value={selectedStaffId}
              onChange={(e) => setSelectedStaffId(e.target.value)}
              className="mt-2 w-full border rounded-lg px-3 py-2"
            >
              {staff.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.first_name} {member.last_name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Horaires hebdomadaires
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {DAYS.map((day) => (
                <div
                  key={day.value}
                  className="flex flex-col md:flex-row md:items-center justify-between gap-4 border rounded-lg p-4"
                >
                  <div className="flex items-center gap-3">
                    <label className="inline-flex items-center gap-2 text-sm font-medium">
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-nude-600"
                        checked={schedule[day.value]?.enabled}
                        onChange={(e) => handleScheduleChange(day.value, "enabled", e.target.checked)}
                      />
                      {day.label}
                    </label>
                    {!schedule[day.value]?.enabled && (
                      <span className="text-xs text-gray-500">Jour désactivé</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Input
                      type="time"
                      value={schedule[day.value]?.start}
                      disabled={!schedule[day.value]?.enabled}
                      onChange={(e) => handleScheduleChange(day.value, "start", e.target.value)}
                    />
                    <span className="text-sm text-gray-500">à</span>
                    <Input
                      type="time"
                      value={schedule[day.value]?.end}
                      disabled={!schedule[day.value]?.enabled}
                      onChange={(e) => handleScheduleChange(day.value, "end", e.target.value)}
                    />
                  </div>
                </div>
              ))}

              <div className="flex justify-end">
                <Button
                  onClick={handleSaveSchedule}
                  disabled={savingSchedule}
                  className="bg-gradient-to-r from-nude-600 to-warm-600"
                >
                  {savingSchedule ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Enregistrement...
                    </>
                  ) : (
                    "Sauvegarder les horaires"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Journées bloquées
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleAddTimeOff} className="space-y-3">
                <div>
                  <Label className="text-sm">Du</Label>
                  <Input
                    type="date"
                    value={newTimeOff.start_date}
                    onChange={(e) => setNewTimeOff((prev) => ({ ...prev, start_date: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label className="text-sm">Au</Label>
                  <Input
                    type="date"
                    value={newTimeOff.end_date}
                    onChange={(e) => setNewTimeOff((prev) => ({ ...prev, end_date: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label className="text-sm">Raison (facultatif)</Label>
                  <Textarea
                    value={newTimeOff.reason}
                    onChange={(e) => setNewTimeOff((prev) => ({ ...prev, reason: e.target.value }))}
                    placeholder="Vacances, absence, formation..."
                    rows={2}
                  />
                </div>
                <Button type="submit" disabled={addingTimeOff} className="w-full">
                  {addingTimeOff ? "Ajout..." : "Bloquer ces dates"}
                </Button>
              </form>

              <div className="space-y-3">
                {timeOffList.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center">Aucune journée bloquée</p>
                ) : (
                  timeOffList.map((timeOff) => (
                    <div key={timeOff.id} className="p-3 border rounded-lg text-sm flex justify-between items-start">
                      <div>
                        <p className="font-medium">
                          {new Date(timeOff.start_date).toLocaleDateString("fr-FR")} → {" "}
                          {new Date(timeOff.end_date).toLocaleDateString("fr-FR")}
                        </p>
                        {timeOff.reason && <p className="text-gray-600 mt-1">{timeOff.reason}</p>}
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteTimeOff(timeOff.id)}>
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProSidebar>
  )
}
