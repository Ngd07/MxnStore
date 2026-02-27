export interface ShopEntry {
  regularPrice: number;
  finalPrice: number;
  devName: string;
  offerId: string;
  inDate: string;
  outDate: string;
  banner: {
    value: string;
    intensity: string;
    backendValue: string;
  } | null;
  giftable: boolean;
  bundle: {
    name: string;
    info: string;
    image: string;
  } | null;
  tileSize: string;
  layout: {
    id: string;
    name: string;
    index: number;
    rank: number;
    showIneligibleOffers: string;
    useWidePreview: boolean;
    displayType: string;
  } | null;
  colors: {
    color1: string;
    color2: string;
    color3: string;
    textBackgroundColor: string;
  } | null;
  newDisplayAsset: {
    id: string;
    cosmeticId: string;
    materialInstances: Array<{
      id: string;
      images: Record<string, string>;
      colors: Record<string, string>;
      scalings: Record<string, number>;
      flags: Record<string, boolean>;
    }>;
    renderImages: Array<{
      productTag: string;
      fileName: string;
      image: string;
    }>;
  } | null;
  brItems: Array<{
    id: string;
    name: string;
    description: string;
    type: {
      value: string;
      displayValue: string;
      backendValue: string;
    };
    rarity: {
      value: string;
      displayValue: string;
      backendValue: string;
    };
    series: {
      value: string;
      colors: string[];
      backendValue: string;
    } | null;
    set: {
      value: string;
      text: string;
      backendValue: string;
    } | null;
    images: {
      smallIcon: string;
      icon: string;
      featured: string | null;
      lego: {
        small: string;
        large: string;
        wide: string | null;
      } | null;
    };
  }> | null;
}

export interface ShopData {
  status: number;
  data: {
    hash: string;
    date: string;
    vbuckIcon: string;
    entries: ShopEntry[];
  };
}
