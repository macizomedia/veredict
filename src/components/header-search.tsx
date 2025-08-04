"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Search, Filter, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

interface HeaderSearchProps {
  className?: string
}

export function HeaderSearch({ className }: HeaderSearchProps) {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [isFiltersOpen, setIsFiltersOpen] = React.useState(false)
  const [filters, setFilters] = React.useState<string[]>([])
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      const params = new URLSearchParams()
      params.set("q", searchQuery.trim())
      if (filters.length > 0) {
        params.set("filters", filters.join(","))
      }
      router.push(`/search?${params.toString()}`)
    }
  }

  const toggleFilter = (filter: string) => {
    setFilters(prev => 
      prev.includes(filter) 
        ? prev.filter(f => f !== filter)
        : [...prev, filter]
    )
  }

  const clearFilters = () => {
    setFilters([])
  }

  const availableFilters = [
    { id: "politics", label: "Politics" },
    { id: "economics", label: "Economics" },
    { id: "security", label: "Security" },
    { id: "migration", label: "Migration" },
    { id: "trade", label: "Trade" },
    { id: "analysis", label: "Analysis" },
    { id: "breaking", label: "Breaking News" },
    { id: "opinion", label: "Opinion" },
  ]

  return (
    <div className={className}>
      <form onSubmit={handleSearch} className="flex items-center gap-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search posts, topics, authors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4"
          />
        </div>
        
        <Popover open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
          <PopoverTrigger asChild>
            <Button 
              variant="outline" 
              size="sm"
              className="relative"
            >
              <Filter className="h-4 w-4" />
              {filters.length > 0 && (
                <Badge 
                  variant="secondary" 
                  className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs"
                >
                  {filters.length}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64" align="end">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Filters</h4>
                {filters.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="h-auto p-1"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                {availableFilters.map((filter) => (
                  <div key={filter.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={filter.id}
                      checked={filters.includes(filter.id)}
                      onCheckedChange={() => toggleFilter(filter.id)}
                    />
                    <Label 
                      htmlFor={filter.id}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {filter.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <Button type="submit" size="sm">
          Search
        </Button>
      </form>

      {/* Active Filters */}
      {filters.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {filters.map((filter) => {
            const filterLabel = availableFilters.find(f => f.id === filter)?.label || filter
            return (
              <Badge
                key={filter}
                variant="secondary"
                className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                onClick={() => toggleFilter(filter)}
              >
                {filterLabel}
                <X className="ml-1 h-3 w-3" />
              </Badge>
            )
          })}
        </div>
      )}
    </div>
  )
}
