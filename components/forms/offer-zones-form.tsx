'use client';

import React from 'react';
import { useFormContext } from 'react-hook-form';
import { useState, useMemo, useCallback } from 'react';
import { Search, MapPin, Building2, Home, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';

// Italian geographic data types
interface GeographicItem {
  code: string;
  name: string;
  regionCode?: string;
  provinceCode?: string;
}

// Mock Italian geographic data - in a real implementation, this would come from an API or database
const italianRegions: GeographicItem[] = [
  { code: '01', name: 'Piemonte' },
  { code: '02', name: 'Valle d\'Aosta' },
  { code: '03', name: 'Lombardia' },
  { code: '04', name: 'Trentino-Alto Adige' },
  { code: '05', name: 'Veneto' },
  { code: '06', name: 'Friuli-Venezia Giulia' },
  { code: '07', name: 'Liguria' },
  { code: '08', name: 'Emilia-Romagna' },
  { code: '09', name: 'Toscana' },
  { code: '10', name: 'Umbria' },
  { code: '11', name: 'Marche' },
  { code: '12', name: 'Lazio' },
  { code: '13', name: 'Abruzzo' },
  { code: '14', name: 'Molise' },
  { code: '15', name: 'Campania' },
  { code: '16', name: 'Puglia' },
  { code: '17', name: 'Basilicata' },
  { code: '18', name: 'Calabria' },
  { code: '19', name: 'Sicilia' },
  { code: '20', name: 'Sardegna' }
];

// Mock provinces for demonstration - subset for major regions
const italianProvinces: GeographicItem[] = [
  { code: '001', name: 'Torino', regionCode: '01' },
  { code: '002', name: 'Vercelli', regionCode: '01' },
  { code: '003', name: 'Novara', regionCode: '01' },
  { code: '004', name: 'Cuneo', regionCode: '01' },
  { code: '007', name: 'Aosta', regionCode: '02' },
  { code: '015', name: 'Milano', regionCode: '03' },
  { code: '016', name: 'Bergamo', regionCode: '03' },
  { code: '017', name: 'Brescia', regionCode: '03' },
  { code: '018', name: 'Como', regionCode: '03' },
  { code: '019', name: 'Cremona', regionCode: '03' },
  { code: '037', name: 'Verona', regionCode: '05' },
  { code: '028', name: 'Venezia', regionCode: '05' },
  { code: '029', name: 'Belluno', regionCode: '05' },
  { code: '025', name: 'Treviso', regionCode: '05' },
  { code: '048', name: 'Roma', regionCode: '12' },
  { code: '049', name: 'Viterbo', regionCode: '12' },
  { code: '058', name: 'Napoli', regionCode: '15' },
  { code: '059', name: 'Salerno', regionCode: '15' },
  { code: '072', name: 'Bari', regionCode: '16' },
  { code: '080', name: 'Palermo', regionCode: '19' },
  { code: '087', name: 'Catania', regionCode: '19' }
];

// Mock municipalities - subset for demonstration
const italianMunicipalities: GeographicItem[] = [
  { code: '001001', name: 'Torino', provinceCode: '001', regionCode: '01' },
  { code: '001002', name: 'Moncalieri', provinceCode: '001', regionCode: '01' },
  { code: '015001', name: 'Milano', provinceCode: '015', regionCode: '03' },
  { code: '015002', name: 'Monza', provinceCode: '015', regionCode: '03' },
  { code: '037001', name: 'Verona', provinceCode: '037', regionCode: '05' },
  { code: '048001', name: 'Roma', provinceCode: '048', regionCode: '12' },
  { code: '058001', name: 'Napoli', provinceCode: '058', regionCode: '15' },
  { code: '072001', name: 'Bari', provinceCode: '072', regionCode: '16' },
  { code: '080001', name: 'Palermo', provinceCode: '080', regionCode: '19' }
];

interface GeographicSelectionPanelProps {
  type: 'regions' | 'provinces' | 'municipalities';
  selectedItems: string[];
  onSelectionChange: (items: string[]) => void;
  filterRegion?: string;
  filterProvince?: string;
}

function GeographicSelectionPanel({
  type,
  selectedItems,
  onSelectionChange,
  filterRegion,
  filterProvince
}: GeographicSelectionPanelProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const items = useMemo(() => {
    let data: GeographicItem[] = [];
    
    switch (type) {
      case 'regions':
        data = italianRegions;
        break;
      case 'provinces':
        data = italianProvinces.filter(p => !filterRegion || p.regionCode === filterRegion);
        break;
      case 'municipalities':
        data = italianMunicipalities.filter(m => 
          (!filterRegion || m.regionCode === filterRegion) &&
          (!filterProvince || m.provinceCode === filterProvince)
        );
        break;
    }

    if (searchTerm) {
      data = data.filter((item: GeographicItem) => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.code.includes(searchTerm)
      );
    }

    return data;
  }, [type, searchTerm, filterRegion, filterProvince]);

  const handleToggleItem = useCallback((code: string) => {
    const newSelection = selectedItems.includes(code)
      ? selectedItems.filter(item => item !== code)
      : [...selectedItems, code];
    onSelectionChange(newSelection);
  }, [selectedItems, onSelectionChange]);

  const handleSelectAll = useCallback(() => {
    if (selectedItems.length === items.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(items.map(item => item.code));
    }
  }, [items, selectedItems, onSelectionChange]);

  const getIcon = () => {
    switch (type) {
      case 'regions': return <MapPin className="h-4 w-4" />;
      case 'provinces': return <Building2 className="h-4 w-4" />;
      case 'municipalities': return <Home className="h-4 w-4" />;
    }
  };

  const getTitle = () => {
    switch (type) {
      case 'regions': return 'Regions';
      case 'provinces': return 'Provinces';
      case 'municipalities': return 'Municipalities';
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          {getIcon()}
          {getTitle()}
          {selectedItems.length > 0 && (
            <Badge variant="secondary">
              {selectedItems.length} selected
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={`Search ${type}...`}
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        
        <div className="flex items-center justify-between">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleSelectAll}
            disabled={items.length === 0}
          >
            {selectedItems.length === items.length ? 'Deselect All' : 'Select All'}
          </Button>
          
          {selectedItems.length > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onSelectionChange([])}
            >
              Clear Selection
            </Button>
          )}
        </div>

        <ScrollArea className="h-64">
          <div className="space-y-2">
            {items.map((item: GeographicItem) => (
              <div key={item.code} className="flex items-center space-x-2">
                <Checkbox
                  id={`${type}-${item.code}`}
                  checked={selectedItems.includes(item.code)}
                  onCheckedChange={() => handleToggleItem(item.code)}
                />
                <label
                  htmlFor={`${type}-${item.code}`}
                  className="flex-1 cursor-pointer text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {item.name}
                  <span className="ml-2 text-xs text-muted-foreground">
                    ({item.code})
                  </span>
                </label>
              </div>
            ))}
          </div>
        </ScrollArea>

        {items.length === 0 && (
          <div className="py-8 text-center text-sm text-muted-foreground">
            No {type} found matching your search.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface SelectedZonesSummaryProps {
  regions: string[];
  provinces: string[];
  municipalities: string[];
  onRemoveRegion: (code: string) => void;
  onRemoveProvince: (code: string) => void;
  onRemoveMunicipality: (code: string) => void;
}

function SelectedZonesSummary({
  regions,
  provinces,
  municipalities,
  onRemoveRegion,
  onRemoveProvince,
  onRemoveMunicipality
}: SelectedZonesSummaryProps) {
  const getRegionName = (code: string) => italianRegions.find(r => r.code === code)?.name || code;
  const getProvinceName = (code: string) => italianProvinces.find(p => p.code === code)?.name || code;
  const getMunicipalityName = (code: string) => italianMunicipalities.find(m => m.code === code)?.name || code;

  if (regions.length === 0 && provinces.length === 0 && municipalities.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            <MapPin className="mx-auto h-8 w-8 mb-2" />
            <p>No specific zones selected - offer available nationwide</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          Selected Zones Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {regions.length > 0 && (
          <div>
            <h4 className="font-medium text-sm mb-2">Regions ({regions.length})</h4>
            <div className="flex flex-wrap gap-2">
              {regions.map((code: string) => (
                <Badge key={code} variant="secondary" className="gap-1">
                  {getRegionName(code)}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => onRemoveRegion(code)}
                  />
                </Badge>
              ))}
            </div>
          </div>
        )}

        {provinces.length > 0 && (
          <div>
            <h4 className="font-medium text-sm mb-2">Provinces ({provinces.length})</h4>
            <div className="flex flex-wrap gap-2">
              {provinces.map((code: string) => (
                <Badge key={code} variant="secondary" className="gap-1">
                  {getProvinceName(code)}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => onRemoveProvince(code)}
                  />
                </Badge>
              ))}
            </div>
          </div>
        )}

        {municipalities.length > 0 && (
          <div>
            <h4 className="font-medium text-sm mb-2">Municipalities ({municipalities.length})</h4>
            <div className="flex flex-wrap gap-2">
              {municipalities.slice(0, 10).map((code: string) => (
                <Badge key={code} variant="secondary" className="gap-1">
                  {getMunicipalityName(code)}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => onRemoveMunicipality(code)}
                  />
                </Badge>
              ))}
              {municipalities.length > 10 && (
                <Badge variant="outline">
                  +{municipalities.length - 10} more
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function OfferZonesForm() {
  const form = useFormContext();
  const [activeTab, setActiveTab] = useState('summary');

  // Watch form values
  const regions = form.watch('offerZones.REGIONE') || [];
  const provinces = form.watch('offerZones.PROVINCIA') || [];
  const municipalities = form.watch('offerZones.COMUNE') || [];

  const handleRegionsChange = useCallback((selectedRegions: string[]) => {
    form.setValue('offerZones.REGIONE', selectedRegions, { shouldValidate: true });
  }, [form]);

  const handleProvincesChange = useCallback((selectedProvinces: string[]) => {
    form.setValue('offerZones.PROVINCIA', selectedProvinces, { shouldValidate: true });
  }, [form]);

  const handleMunicipalitiesChange = useCallback((selectedMunicipalities: string[]) => {
    form.setValue('offerZones.COMUNE', selectedMunicipalities, { shouldValidate: true });
  }, [form]);

  const removeRegion = useCallback((code: string) => {
    const newRegions = regions.filter((r: string) => r !== code);
    form.setValue('offerZones.REGIONE', newRegions, { shouldValidate: true });
  }, [form, regions]);

  const removeProvince = useCallback((code: string) => {
    const newProvinces = provinces.filter((p: string) => p !== code);
    form.setValue('offerZones.PROVINCIA', newProvinces, { shouldValidate: true });
  }, [form, provinces]);

  const removeMunicipality = useCallback((code: string) => {
    const newMunicipalities = municipalities.filter((m: string) => m !== code);
    form.setValue('offerZones.COMUNE', newMunicipalities, { shouldValidate: true });
  }, [form, municipalities]);

  return (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="offerZones"
        render={() => (
          <FormItem>
            <FormLabel>Geographical Availability Zones</FormLabel>
            <FormDescription>
              Specify the geographical areas where your offer is available. Leave empty for nationwide availability.
              You can select regions, provinces, or specific municipalities.
            </FormDescription>
            <FormControl>
              <div className="space-y-4">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="summary">Summary</TabsTrigger>
                    <TabsTrigger value="regions">Regions</TabsTrigger>
                    <TabsTrigger value="provinces">Provinces</TabsTrigger>
                    <TabsTrigger value="municipalities">Municipalities</TabsTrigger>
                  </TabsList>

                  <TabsContent value="summary" className="mt-4">
                    <SelectedZonesSummary
                      regions={regions}
                      provinces={provinces}
                      municipalities={municipalities}
                      onRemoveRegion={removeRegion}
                      onRemoveProvince={removeProvince}
                      onRemoveMunicipality={removeMunicipality}
                    />
                  </TabsContent>

                  <TabsContent value="regions" className="mt-4">
                    <GeographicSelectionPanel
                      type="regions"
                      selectedItems={regions}
                      onSelectionChange={handleRegionsChange}
                    />
                  </TabsContent>

                  <TabsContent value="provinces" className="mt-4">
                    <GeographicSelectionPanel
                      type="provinces"
                      selectedItems={provinces}
                      onSelectionChange={handleProvincesChange}
                    />
                  </TabsContent>

                  <TabsContent value="municipalities" className="mt-4">
                    <GeographicSelectionPanel
                      type="municipalities"
                      selectedItems={municipalities}
                      onSelectionChange={handleMunicipalitiesChange}
                    />
                  </TabsContent>
                </Tabs>
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="rounded-lg bg-muted/50 p-4">
        <h3 className="text-sm font-medium">Geographic Selection Guidelines</h3>
        <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
          <li>• This section is optional - leaving it empty means nationwide availability</li>
          <li>• You can select entire regions, specific provinces, or individual municipalities</li>
          <li>• Selections are hierarchical - selecting a region includes all its provinces and municipalities</li>
          <li>• Use search functionality to quickly find specific locations</li>
          <li>• Review your selections in the Summary tab before proceeding</li>
        </ul>
      </div>
    </div>
  );
}