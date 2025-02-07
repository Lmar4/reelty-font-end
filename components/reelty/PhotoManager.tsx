import { useState } from "react";
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
}

interface PhotoWithPreview {
  id: string;
  file: File;
  preview: string;
}

export default function PhotoManager({
  photos,
  onPhotosReorder,
}: PhotoManagerProps) {
  const [items, setItems] = useState<PhotoWithPreview[]>(() =>
    photos.map((file) => ({
      id: Math.random().toString(36).substring(7),
      file,
      preview: URL.createObjectURL(file),
    }))
  );

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        const newItems = arrayMove(items, oldIndex, newIndex);
        onPhotosReorder(newItems.map((item) => item.file));
        return newItems;
      });
    }
  };

  const movePhoto = (index: number, direction: "left" | "right") => {
    const newIndex = direction === "left" ? index - 1 : index + 1;
    if (newIndex >= 0 && newIndex < items.length) {
      setItems((items) => {
        const newItems = arrayMove(items, index, newIndex);
        onPhotosReorder(newItems.map((item) => item.file));
        return newItems;
      });
    }
  };

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
            </div>
          </SortableContext>
        </DndContext>
      </Card>
    </div>
  );
}
