interface ListingData {
  photos: File[];
  address?: string;
  description?: string;
}

export const listingStorage = {
  store: (data: ListingData) => {
    try {
      localStorage.setItem("preAuthListingData", JSON.stringify({
        ...data,
        photos: [], // We can't store File objects in localStorage
        photoCount: data.photos.length,
        timestamp: Date.now(),
      }));
    } catch (error) {
      console.error("Error storing listing data:", error);
    }
  },

  retrieve: (): ListingData | null => {
    try {
      const data = localStorage.getItem("preAuthListingData");
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error("Error retrieving listing data:", error);
      return null;
    }
  },

  clear: () => {
    localStorage.removeItem("preAuthListingData");
  },
};
