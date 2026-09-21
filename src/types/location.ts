export interface Region {
  id: number;
  name: string;
}

export interface Province {
  id: number;
  name: string;
  code: string;
  regionId: number;
}

export interface City {
  id: number;
  name: string;
  slug: string;
  provinceId: number;
  provinceName: string;
  regionName: string;
  latitude: number;
  longitude: number;
}
