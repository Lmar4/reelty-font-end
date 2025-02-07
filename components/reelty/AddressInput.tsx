import { useLoadScript } from "@react-google-maps/api";
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
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries: ["places"],
  });

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
          disabled={!ready || !isLoaded}
          placeholder='Enter property address'
          className='w-full'
        />
        {status === "OK" && (
          <ul className='absolute z-10 w-full bg-white border rounded-md mt-1 shadow-lg max-h-60 overflow-auto'>
            {data.map(({ place_id, description }) => (
              <li
                key={place_id}
                onClick={() => handleSelect(description)}
                className='px-4 py-2 hover:bg-gray-100 cursor-pointer'
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
