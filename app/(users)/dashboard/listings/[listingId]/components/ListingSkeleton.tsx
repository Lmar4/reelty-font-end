const ListingSkeleton = () => (
  <div className='animate-pulse space-y-8'>
    <div className='space-y-4'>
      <div className='h-4 w-24 bg-gray-200 rounded'></div>
      <div className='h-8 w-3/4 bg-gray-200 rounded'></div>
      <div className='h-4 w-1/2 bg-gray-200 rounded'></div>
    </div>
    <div className='grid grid-cols-2 md:grid-cols-3 gap-6'>
      {[...Array(6)].map((_, i) => (
        <div key={i} className='aspect-video bg-gray-200 rounded-lg'></div>
      ))}
    </div>
  </div>
);

export default ListingSkeleton;
