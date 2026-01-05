"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { notFound } from "next/navigation";
import Image from "next/image";
import { format } from "date-fns";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  TrendingUp,
  Clock,
  Trash2,
  QrCode,
  Loader2,
  CheckCircle,
  Download,
  Search,
  Eye,
} from "lucide-react";
import { useConvexQuery, useConvexMutation } from "@/hooks/use-convex-query";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";




import EventCard from "@/components/event-card";




export default function MyEventsPage() {
  const router = useRouter();
  const { data: events, isLoading } = useConvexQuery(api.events.getMyEvents);

  const { mutate: deleteEvent, isLoading: isDeleting } = useConvexMutation(
    api.events.deleteEvent
  );

  const handleDelete = async (eventId) => {
    const confirmed = window.confirm(
      "Delete this event and all registrations? This action cannot be undone."
    );
    if (!confirmed) return;

    try {
      await deleteEvent({ eventId });
      toast.success("Event deleted");
      router.refresh();
    } catch (err) {
      toast.error(err.message || "Failed to delete event");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">My Events</h1>
          <Button onClick={() => router.push("/create-event")}>Create Event</Button>
        </div>

        {(!events || events.length === 0) && (
          <div className="text-center py-12 text-muted-foreground">
            You haven't created any events yet.
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {events && events.map((event) => (
            <EventCard
              key={event._id}
              event={event}
              action="event"
              onClick={() => router.push(`/my-events/${event._id}`)}
              onDelete={() => handleDelete(event._id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}