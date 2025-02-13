import { ListingBreadcrumb } from "./ListingBreadcrumb";

interface ListingHeaderProps {
  address: string;
  listingId: string;
  onSettingsClick: () => void;
}

export function ListingHeader({
  address,
  listingId,
  onSettingsClick,
}: ListingHeaderProps) {
  return (
    <ListingBreadcrumb address={address} onSettingsClick={onSettingsClick} />
  );
}
