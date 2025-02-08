import usePlacesAutocomplete, {
  getGeocode,
  getLatLng,
} from "use-places-autocomplete";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AddressInputProps {
  onAddressSelect: (
    address: string,
    coordinates: { lat: number; lng: number }
  ) => void;
}

export default function AddressInput({ onAddressSelect }: AddressInputProps) {
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

    try {
      const results = await getGeocode({ address: description });
      const { lat, lng } = await getLatLng(results[0]);
      onAddressSelect(description, { lat, lng });
    } catch (error) {
      console.error("Error getting geocode:", error);
    }
  };

  return (
    <div className='space-y-2'>
      <Label htmlFor='address'>Property Address</Label>
      <div className='relative'>
        <Input
          id='address'
          value={value}
          onChange={(e) => setValue(e.target.value)}
          disabled={!ready}
          placeholder='Search for address...'
          className='w-full'
          data-testid='address-input'
        />
        {status === "OK" && (
          <ul className='absolute z-10 w-full bg-white border rounded-md mt-1 shadow-lg max-h-60 overflow-auto'>
            {data.map(({ place_id, description }) => (
              <li
                key={place_id}
                onClick={() => handleSelect(description)}
                className='px-4 py-2 hover:bg-gray-100 cursor-pointer'
                role='option'
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    handleSelect(description);
                  }
                }}
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
