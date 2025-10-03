import React from 'react';
import { Input } from './input';
import { cn } from '@/lib/utils';

interface PhoneInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value?: string;
  onChange?: (value: string) => void;
}

export function PhoneInput({ value, onChange, className, ...props }: PhoneInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let inputValue = e.target.value.replace(/\D/g, ''); // Remove non-digits
    
    // Ensure it starts with 233 (Ghana country code)
    if (!inputValue.startsWith('233')) {
      if (inputValue.startsWith('0')) {
        inputValue = '233' + inputValue.substring(1);
      } else if (inputValue.length > 0) {
        inputValue = '233' + inputValue;
      }
    }
    
    // Format as +233 XX XXX XXXX
    if (inputValue.length > 3) {
      const formatted = `+233 ${inputValue.substring(3, 5)} ${inputValue.substring(5, 8)} ${inputValue.substring(8, 12)}`;
      onChange?.(formatted.trim());
    } else {
      onChange?.(inputValue.length > 0 ? `+${inputValue}` : '');
    }
  };

  return (
    <div className="relative">
      <Input
        {...props}
        type="tel"
        value={value || ''}
        onChange={handleChange}
        placeholder="+233 XX XXX XXXX"
        className={cn("pl-4", className)}
      />
    </div>
  );
}