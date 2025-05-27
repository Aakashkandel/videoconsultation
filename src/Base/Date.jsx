import * as React from 'react';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import TextField from '@mui/material/TextField';

export default function Date() {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DatePicker
        
        slotProps={{
          textField: {
          
            size: 'medium', 
            fullWidth: true,
          },
        }}
      />
    </LocalizationProvider>
  );
}
