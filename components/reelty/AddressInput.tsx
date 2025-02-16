import usePlacesAutocomplete, {
  getGeocode,
  getLatLng,
} from "use-places-autocomplete";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useCallback, KeyboardEvent } from "react";

interface AddressInputProps {
  onAddressSelect: (
    address: string,
    coordinates: { lat: number; lng: number }
  ) => void;
}

export default function AddressInput({ onAddressSelect }: AddressInputProps) {
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);

  const {
    ready,
    value,
    suggestions: { status, data },
    setValue,
    clearSuggestions,
  } = usePlacesAutocomplete({
    debounce: 300,
    cache: 24 * 60 * 60,
  });

  const handleSelect = async (description: string) => {
    setValue(description, false);
    clearSuggestions();
    setSelectedIndex(-1);

    try {
      const results = await getGeocode({ address: description });
      const { lat, lng } = await getLatLng(results[0]);
      onAddressSelect(description, { lat, lng });
    } catch (error) {
      console.error("Error getting geocode:", error);
    }
  };

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (!data.length) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev < data.length - 1 ? prev + 1 : prev
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
          break;
        case "Enter":
          e.preventDefault();
          if (selectedIndex >= 0) {
            handleSelect(data[selectedIndex].description);
          }
          break;
        case "Escape":
          clearSuggestions();
          setSelectedIndex(-1);
          break;
      }
    },
    [data, selectedIndex, clearSuggestions]
  );

  return (
    <div className='space-y-2'>
      <Label htmlFor='address'>Property Address</Label>
      <div className='relative'>
        <Input
          id='address'
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setSelectedIndex(-1);
          }}
          onKeyDown={handleKeyDown}
          disabled={!ready}
          placeholder='Search for address...'
          className='w-full'
          data-testid='address-input'
          role='combobox'
          aria-expanded={status === "OK"}
          aria-controls='address-suggestions'
          aria-activedescendant={
            selectedIndex >= 0
              ? `address-suggestion-${data[selectedIndex]?.place_id}`
              : undefined
          }
        />
        {status === "OK" && (
          <ul
            id='address-suggestions'
            className='absolute z-10 w-full bg-white border rounded-md mt-1 shadow-lg max-h-60 overflow-auto'
            role='listbox'
          >
            {data.map(({ place_id, description }, index) => (
              <li
                key={place_id}
                id={`address-suggestion-${place_id}`}
                onClick={() => handleSelect(description)}
                className={`px-4 py-2 hover:bg-gray-100 cursor-pointer ${
                  index === selectedIndex ? "bg-gray-100" : ""
                }`}
                role='option'
                aria-selected={index === selectedIndex}
                tabIndex={-1}
                onMouseEnter={() => setSelectedIndex(index)}
                data-testid={`address-suggestion-${place_id}`}
              >
                {description}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
