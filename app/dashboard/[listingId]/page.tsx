import { ListingClient } from "./ListingClient";

interface PageProps {
  params: {
    listingId: string;
  };
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function ListingPage({ params, searchParams }: PageProps) {
  return <ListingClient params={params} searchParams={searchParams} />;
}
