import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import React from "react";
import type { Model } from "../../models/type";

interface ModelSelectorProps {
  label: string;
  value: string | null;
  onChange: (value: string | null) => void;
  models: Model[];
  loading?: boolean;
  required?: boolean;
  placeholder?: string;
  id?: string;
  allowNone?: boolean;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({
  label,
  value,
  onChange,
  models,
  loading = false,
  required = false,
  placeholder = "Select model",
  id,
  allowNone = false,
}) => {
  if (loading) {
    return (
      <div className="space-y-2">
        <Label>{label}</Label>
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Select
        value={value || (allowNone ? "__none__" : "")}
        onValueChange={(val) => onChange(val === "__none__" ? null : val)}
        required={required}
      >
        <SelectTrigger id={id}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {allowNone && <SelectItem value="__none__">None</SelectItem>}
          {models.map((model) => (
            <SelectItem key={model.id} value={model.id}>
              {model.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
