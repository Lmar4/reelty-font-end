import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Badge } from "@/components/ui/badge";

interface SortablePhotoProps {
  id: string;
  preview: string;
  index: number;
}

export function SortablePhoto({ id, preview, index }: SortablePhotoProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1 : 0,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className='relative aspect-square rounded-lg overflow-hidden cursor-move touch-none'
      {...attributes}
      {...listeners}
    >
      <img
        src={preview}
        alt={`Photo ${index}`}
        className='w-full h-full object-cover'
      />
      <Badge
        variant='secondary'
        className='absolute top-2 left-2 bg-black/50 text-white'
      >
        {index}
      </Badge>
    </div>
  );
}
