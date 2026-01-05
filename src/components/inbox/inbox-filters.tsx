"use client";

import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search } from "lucide-react";
import type { InboxStatusFilter } from "@/types/inbox";

interface InboxFiltersProps {
  statusFilter: InboxStatusFilter;
  onStatusChange: (status: InboxStatusFilter) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

/**
 * InboxFilters Component
 *
 * Provides:
 * - Status tabs (New, Processed, Ignored, All)
 * - Search input (subject + from)
 */
export function InboxFilters({
  statusFilter,
  onStatusChange,
  searchQuery,
  onSearchChange,
}: InboxFiltersProps) {
  return (
    <div className="space-y-4 p-4">
      {/* Status Tabs */}
      <Tabs
        value={statusFilter}
        onValueChange={(value) => onStatusChange(value as InboxStatusFilter)}
      >
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="new">New</TabsTrigger>
          <TabsTrigger value="processed">Processed</TabsTrigger>
          <TabsTrigger value="ignored">Ignored</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search subject, from..."
          className="pl-8"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
    </div>
  );
}
