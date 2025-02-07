import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { LoadingState } from "@/components/ui/loading-state";
import { Music, Map, ImageIcon } from "lucide-react";

interface Asset {
  id: string;
  name: string;
  type: "MUSIC" | "WATERMARK";
  filePath: string;
}

interface VideoConfigurationProps {
  userTier: string;
  onChange: (config: VideoConfig) => void;
  defaultConfig?: Partial<VideoConfig>;
}

interface VideoConfig {
  mapCapture: boolean;
  watermark: {
    enabled: boolean;
    assetId?: string;
  };
  musicSettings: {
    assetId?: string;
    volume: number;
  };
}

async function fetchAssets(
  type: "MUSIC" | "WATERMARK",
  tier: string
): Promise<Asset[]> {
  const response = await fetch(`/api/assets?type=${type}&tier=${tier}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${type.toLowerCase()} assets`);
  }
  return response.json();
}

export default function VideoConfiguration({
  userTier,
  onChange,
  defaultConfig,
}: VideoConfigurationProps) {
  const [config, setConfig] = useState<VideoConfig>({
    mapCapture: defaultConfig?.mapCapture ?? false,
    watermark: {
      enabled: defaultConfig?.watermark?.enabled ?? false,
      assetId: defaultConfig?.watermark?.assetId,
    },
    musicSettings: {
      assetId: defaultConfig?.musicSettings?.assetId,
      volume: defaultConfig?.musicSettings?.volume ?? 1,
    },
  });

  const { data: musicAssets = [], isLoading: isLoadingMusic } = useQuery({
    queryKey: ["assets", "MUSIC", userTier],
    queryFn: () => fetchAssets("MUSIC", userTier),
    enabled: userTier !== "free",
  });

  const { data: watermarkAssets = [], isLoading: isLoadingWatermark } =
    useQuery({
      queryKey: ["assets", "WATERMARK", userTier],
      queryFn: () => fetchAssets("WATERMARK", userTier),
      enabled: userTier !== "free",
    });

  const handleConfigChange = (newConfig: Partial<VideoConfig>) => {
    const updatedConfig = {
      ...config,
      ...newConfig,
      watermark: {
        ...config.watermark,
        ...(newConfig.watermark || {}),
      },
      musicSettings: {
        ...config.musicSettings,
        ...(newConfig.musicSettings || {}),
      },
    };
    setConfig(updatedConfig);
    onChange(updatedConfig);
  };

  if (isLoadingMusic || isLoadingWatermark) {
    return <LoadingState text='Loading configuration options...' />;
  }

  const showMusicOptions = userTier !== "free" && musicAssets.length > 0;
  const showWatermarkOptions =
    userTier !== "free" && watermarkAssets.length > 0;

  return (
    <div className='space-y-6'>
      <Card className='p-4 space-y-4'>
        <div className='flex items-center gap-2'>
          <Map className='w-5 h-5 text-purple-500' />
          <h3 className='font-medium'>Map Capture</h3>
        </div>
        <div className='flex items-center justify-between'>
          <Label htmlFor='map-capture'>Include animated map</Label>
          <Switch
            id='map-capture'
            checked={config.mapCapture}
            onCheckedChange={(checked) =>
              handleConfigChange({ mapCapture: checked })
            }
          />
        </div>
      </Card>

      {showWatermarkOptions && (
        <Card className='p-4 space-y-4'>
          <div className='flex items-center gap-2'>
            <ImageIcon className='w-5 h-5 text-purple-500' />
            <h3 className='font-medium'>Watermark</h3>
          </div>
          <div className='space-y-4'>
            <div className='flex items-center justify-between'>
              <Label htmlFor='watermark-enabled'>Enable watermark</Label>
              <Switch
                id='watermark-enabled'
                checked={config.watermark.enabled}
                onCheckedChange={(checked) =>
                  handleConfigChange({
                    watermark: { ...config.watermark, enabled: checked },
                  })
                }
              />
            </div>
            {config.watermark.enabled && (
              <Select
                value={config.watermark.assetId}
                onValueChange={(value) =>
                  handleConfigChange({
                    watermark: { ...config.watermark, assetId: value },
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder='Select watermark' />
                </SelectTrigger>
                <SelectContent>
                  {watermarkAssets.map((asset) => (
                    <SelectItem key={asset.id} value={asset.id}>
                      {asset.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </Card>
      )}

      {showMusicOptions && (
        <Card className='p-4 space-y-4'>
          <div className='flex items-center gap-2'>
            <Music className='w-5 h-5 text-purple-500' />
            <h3 className='font-medium'>Background Music</h3>
          </div>
          <div className='space-y-4'>
            <Select
              value={config.musicSettings.assetId}
              onValueChange={(value) =>
                handleConfigChange({
                  musicSettings: { ...config.musicSettings, assetId: value },
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder='Select music' />
              </SelectTrigger>
              <SelectContent>
                {musicAssets.map((asset) => (
                  <SelectItem key={asset.id} value={asset.id}>
                    {asset.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className='space-y-2'>
              <Label>Music Volume</Label>
              <Slider
                value={[config.musicSettings.volume]}
                min={0}
                max={1}
                step={0.1}
                onValueChange={([value]) =>
                  handleConfigChange({
                    musicSettings: { ...config.musicSettings, volume: value },
                  })
                }
              />
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
