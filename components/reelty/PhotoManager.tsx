import { useState, useEffect, useRef } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { SortablePhoto } from "./SortablePhoto";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface PhotoManagerProps {
  photos: File[];
  onPhotosReorder: (newPhotos: File[]) => void;
  onAddPhotos?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  maxPhotos?: number;
}

interface PhotoWithPreview {
  id: string;
  file: File;
  preview: string;
}

export default function PhotoManager({
  photos,
  onPhotosReorder,
  onAddPhotos,
  maxPhotos = 60,
}: PhotoManagerProps) {
  const [items, setItems] = useState<PhotoWithPreview[]>([]);
  const previewUrlsRef = useRef<Map<string, string>>(new Map());

  // Initialize or update items when photos change, reusing existing previews
  useEffect(() => {
    const newItems = photos.map((file) => {
      const fileKey = `${file.name}-${file.size}-${file.lastModified}`;
      let preview = previewUrlsRef.current.get(fileKey);

      if (!preview) {
        preview = URL.createObjectURL(file);
        previewUrlsRef.current.set(fileKey, preview);
      }

      return {
        id: fileKey,
        file,
        preview,
      };
    });

    setItems(newItems);

    // Cleanup unused URLs
    const newFileKeys = new Set(
      photos.map((file) => `${file.name}-${file.size}-${file.lastModified}`)
    );

    previewUrlsRef.current.forEach((url, key) => {
      if (!newFileKeys.has(key)) {
        URL.revokeObjectURL(url);
        previewUrlsRef.current.delete(key);
      }
    });
  }, [photos]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setItems((prevItems) => {
        const oldIndex = prevItems.findIndex((item) => item.id === active.id);
        const newIndex = prevItems.findIndex((item) => item.id === over.id);
        const newItems = arrayMove(prevItems, oldIndex, newIndex);
        onPhotosReorder(newItems.map((item) => item.file));
        return newItems;
      });
    }
  };

  const movePhoto = (index: number, direction: "left" | "right") => {
    const newIndex = direction === "left" ? index - 1 : index + 1;
    if (newIndex >= 0 && newIndex < items.length) {
      setItems((prevItems) => {
        const newItems = arrayMove(prevItems, index, newIndex);
        onPhotosReorder(newItems.map((item) => item.file));
        return newItems;
      });
    }
  };

  // Cleanup all URLs on unmount
  useEffect(() => {
    const urls = previewUrlsRef.current;
    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
      urls.clear();
    };
  }, []);

  return (
    <div className='space-y-4'>
      <Card className='p-4'>
        <h3 className='text-sm font-medium mb-4'>
          Drag and drop photos to reorder them. The first photo will be your
          video's thumbnail.
        </h3>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={items} strategy={rectSortingStrategy}>
            <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
              {items.map((item, index) => (
                <div key={item.id} className='relative group'>
                  <SortablePhoto
                    id={item.id}
                    preview={item.preview}
                    index={index + 1}
                  />
                  <div className='absolute inset-x-0 bottom-0 p-2 flex justify-center gap-2 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity'>
                    <Button
                      variant='ghost'
                      size='icon'
                      className='h-8 w-8 text-white hover:text-white hover:bg-white/20'
                      onClick={() => movePhoto(index, "left")}
                      disabled={index === 0}
                    >
                      <ArrowLeft className='h-4 w-4' />
                    </Button>
                    <Button
                      variant='ghost'
                      size='icon'
                      className='h-8 w-8 text-white hover:text-white hover:bg-white/20'
                      onClick={() => movePhoto(index, "right")}
                      disabled={index === items.length - 1}
                    >
                      <ArrowRight className='h-4 w-4' />
                    </Button>
                  </div>
                </div>
              ))}
              {onAddPhotos && photos.length < maxPhotos && (
                <label className='relative aspect-square rounded-lg overflow-hidden cursor-pointer border-2 border-dashed border-gray-300 flex items-center justify-center hover:border-gray-400 transition-colors'>
                  <div className='flex flex-col items-center gap-2'>
                    <svg
                      width='20'
                      height='20'
                      viewBox='0 0 24 24'
                      fill='none'
                      stroke='#666'
                      strokeWidth='2'
                    >
                      <path d='M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4' />
                      <polyline points='17 8 12 3 7 8' />
                      <line x1='12' y1='3' x2='12' y2='15' />
                    </svg>
                    <span className='text-[13px] text-gray-600'>
                      Upload More
                    </span>
                  </div>
                  <input
                    type='file'
                    multiple
                    accept='image/*'
                    className='hidden'
                    onChange={onAddPhotos}
                    onClick={(e) => {
                      (e.target as HTMLInputElement).value = "";
                    }}
                  />
                </label>
              )}
            </div>
          </SortableContext>
        </DndContext>
      </Card>
    </div>
  );
}
