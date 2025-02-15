import React from "react";

export const Progress = ({ value }: { value: number }) => (
  <div
    role='progressbar'
    aria-label='Upload progress'
    aria-valuenow={value}
    aria-valuemin={0}
    aria-valuemax={100}
  >
    {value}%
  </div>
);
