import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Search } from "lucide-react";
import type { ModelFilters as Filters } from "../type";

interface ModelFiltersProps {
  filters: Filters;
  credentials: any[];
  onFilterChange: (field: string, value: any) => void;
}

export function ModelFilters({
  filters,
  credentials,
  onFilterChange,
}: ModelFiltersProps) {
  const filteredCredentialsForFilter = credentials.filter((c) => {
    if (!filters.type || filters.type === "all") return true;

    if (filters.type === "chat") {
      return ["openai", "anthropic", "google", "azure_openai"].includes(
        c.provider_name.toLowerCase()
      );
    } else if (filters.type === "embedding") {
      return ["openai", "azure_openai", "cohere"].includes(
        c.provider_name.toLowerCase()
      );
    }
    return true;
  });

  return (
    <div className="bg-card shadow-sm rounded-lg border p-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="space-y-2">
          <Label htmlFor="search">Search</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              placeholder="Search models..."
              value={filters.search || ""}
              onChange={(e) => onFilterChange("search", e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="type-filter">Type</Label>
          <Select
            value={filters.type || "all"}
            onValueChange={(value) => {
              onFilterChange("type", value);
              if (value !== filters.type) {
                onFilterChange("credential_id", "");
              }
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="chat">Chat</SelectItem>
              <SelectItem value="embedding">Embedding</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="credential-filter">Credential</Label>
          <Select
            value={filters.credential_id || "all"}
            onValueChange={(value) =>
              onFilterChange("credential_id", value === "all" ? "" : value)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="All Credentials" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Credentials</SelectItem>
              {filteredCredentialsForFilter.map((credential) => (
                <SelectItem key={credential.id} value={credential.id}>
                  <div className="flex items-center gap-2">
                    <span>{credential.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {credential.provider_name}
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-end">
          <div className="flex items-center space-x-2">
            <Switch
              id="active-only"
              checked={filters.active_only || false}
              onCheckedChange={(checked) =>
                onFilterChange("active_only", checked)
              }
            />
            <Label htmlFor="active-only">Active only</Label>
          </div>
        </div>
      </div>
    </div>
  );
}
