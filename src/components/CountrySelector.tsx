
"use client";

import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { countryCodes } from '@/lib/countryCodes'; // Assuming this path is correct

interface CountrySelectorProps {
  selectedCountryCode: string | undefined;
  onCountryCodeChange: (value: string) => void;
  id?: string;
  label?: string;
}

export const CountrySelector: React.FC<CountrySelectorProps> = ({
  selectedCountryCode,
  onCountryCodeChange,
  id = "countryCode",
  label = "Country"
}) => {
  return (
    <div className="space-y-1.5">
      {label && <Label htmlFor={id}>{label}</Label>}
      <Select value={selectedCountryCode} onValueChange={onCountryCodeChange}>
        <SelectTrigger id={id}>
          <SelectValue placeholder="Select country" />
        </SelectTrigger>
        <SelectContent>
          {countryCodes.map(country => (
            <SelectItem key={`${country.code}-${country.name}`} value={country.code}>
              <span className="mr-2 rtl:ml-2">{country.flag}</span> {country.name} ({country.code})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
