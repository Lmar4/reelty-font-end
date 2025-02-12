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

const MapCaptureSection: React.FC<{
  mapCapture: boolean;
  onChange: (checked: boolean) => void;
}> = ({ mapCapture, onChange }) => (
  <Card className='p-4 space-y-4'>
    <div className='flex items-center gap-2'>
      <Map className='w-5 h-5 text-purple-500' />
      <h3 className='font-medium'>Map Capture</h3>
    </div>
    <div className='flex items-center justify-between'>
      <Label htmlFor='map-capture'>Include animated map</Label>
      <Switch
        id='map-capture'
        checked={mapCapture}
        onCheckedChange={onChange}
      />
    </div>
  </Card>
);

const WatermarkSection: React.FC<{
  watermark: VideoConfig["watermark"];
  assets: Asset[];
  onChange: (watermark: VideoConfig["watermark"]) => void;
}> = ({ watermark, assets, onChange }) => (
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
          checked={watermark.enabled}
          onCheckedChange={(checked) =>
            onChange({ ...watermark, enabled: checked })
          }
        />
      </div>
      {watermark.enabled && (
        <Select
          value={watermark.assetId}
          onValueChange={(value) => onChange({ ...watermark, assetId: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder='Select watermark' />
          </SelectTrigger>
          <SelectContent>
            {assets.map((asset) => (
              <SelectItem key={asset.id} value={asset.id}>
                {asset.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  </Card>
);

const MusicSection: React.FC<{
  musicSettings: VideoConfig["musicSettings"];
  assets: Asset[];
  onChange: (musicSettings: VideoConfig["musicSettings"]) => void;
}> = ({ musicSettings, assets, onChange }) => (
  <Card className='p-4 space-y-4'>
    <div className='flex items-center gap-2'>
      <Music className='w-5 h-5 text-purple-500' />
      <h3 className='font-medium'>Background Music</h3>
    </div>
    <div className='space-y-4'>
      <Select
        value={musicSettings.assetId}
        onValueChange={(value) =>
          onChange({ ...musicSettings, assetId: value })
        }
      >
        <SelectTrigger>
          <SelectValue placeholder='Select music' />
        </SelectTrigger>
        <SelectContent>
          {assets.map((asset) => (
            <SelectItem key={asset.id} value={asset.id}>
              {asset.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className='space-y-2'>
        <Label>Music Volume</Label>
        <Slider
          value={[musicSettings.volume]}
          min={0}
          max={1}
          step={0.1}
          onValueChange={([value]) =>
            onChange({ ...musicSettings, volume: value })
          }
        />
      </div>
    </div>
  </Card>
);

const useAssets = (type: "MUSIC" | "WATERMARK", userTier: string) => {
  return useQuery({
    queryKey: ["assets", type, userTier],
    queryFn: async () => {
      const response = await fetch(`/api/assets?type=${type}&tier=${userTier}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch ${type.toLowerCase()} assets`);
      }
      return response.json();
    },
    enabled: userTier !== "free",
  });
};

const useVideoConfig = (
  defaultConfig: Partial<VideoConfig> | undefined,
  onChange: (config: VideoConfig) => void
) => {
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

  return { config, handleConfigChange };
};

const checkFeatureAvailability = (
  userTier: string,
  assets: Asset[]
): { showMusicOptions: boolean; showWatermarkOptions: boolean } => {
  const isNotFreeTier = userTier !== "free";
  return {
    showMusicOptions: isNotFreeTier && assets.length > 0,
    showWatermarkOptions: isNotFreeTier && assets.length > 0,
  };
};

export default function VideoConfiguration({
  userTier,
  onChange,
  defaultConfig,
}: VideoConfigurationProps) {
  const { config, handleConfigChange } = useVideoConfig(
    defaultConfig,
    onChange
  );

  const { data: musicAssets = [], isLoading: isLoadingMusic } = useAssets(
    "MUSIC",
    userTier
  );

  const { data: watermarkAssets = [], isLoading: isLoadingWatermark } =
    useAssets("WATERMARK", userTier);

  if (isLoadingMusic || isLoadingWatermark) {
    return <LoadingState text='Loading configuration options...' />;
  }

  const { showMusicOptions, showWatermarkOptions } = checkFeatureAvailability(
    userTier,
    musicAssets
  );

  return (
    <div className='space-y-6'>
      <MapCaptureSection
        mapCapture={config.mapCapture}
        onChange={(checked) => handleConfigChange({ mapCapture: checked })}
      />

      {showWatermarkOptions && (
        <WatermarkSection
          watermark={config.watermark}
          assets={watermarkAssets}
          onChange={(watermark) => handleConfigChange({ watermark })}
        />
      )}

      {showMusicOptions && (
        <MusicSection
          musicSettings={config.musicSettings}
          assets={musicAssets}
          onChange={(musicSettings) => handleConfigChange({ musicSettings })}
        />
      )}
    </div>
  );
}
