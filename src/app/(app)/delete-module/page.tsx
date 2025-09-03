import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DeleteBrands from '@/features/delete-module/DeleteBrands';
import DeleteApplianceTypes from '@/features/delete-module/DeleteApplianceTypes';
import DeleteCities from '@/features/delete-module/DeleteCities';
import DeleteZones from '@/features/delete-module/DeleteZones';
import { TrashIcon } from 'lucide-react';

export default function DeleteModulePage() {
  return (
    <div className="container mx-auto py-8 max-w-6xl">
      <div className="flex items-center gap-3 mb-6">
        <TrashIcon className="h-8 w-8 text-red-500" />
        <h1 className="text-3xl font-bold">Delete Module</h1>
      </div>
      
      <p className="text-gray-600 mb-8">
        Use this module to delete brands, appliance types, cities, and zones. 
        Please note that entities that are being used by other records cannot be deleted.
      </p>
      
      <Tabs defaultValue="brands" className="w-full">
        <TabsList className="grid grid-cols-4 mb-8">
          <TabsTrigger value="brands">Brands</TabsTrigger>
          <TabsTrigger value="types">Appliance Types</TabsTrigger>
          <TabsTrigger value="cities">Cities</TabsTrigger>
          <TabsTrigger value="zones">Zones</TabsTrigger>
        </TabsList>
        
        <TabsContent value="brands" className="mt-6">
          <DeleteBrands />
        </TabsContent>
        
        <TabsContent value="types" className="mt-6">
          <DeleteApplianceTypes />
        </TabsContent>
        
        <TabsContent value="cities" className="mt-6">
          <DeleteCities />
        </TabsContent>
        
        <TabsContent value="zones" className="mt-6">
          <DeleteZones />
        </TabsContent>
      </Tabs>
    </div>
  );
}