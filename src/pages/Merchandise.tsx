import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { useToast, toast } from "@/hooks/use-toast";

// Types
interface Product {
  id: string;
  name: string;
  description: string;
  priceLkr: number;
  inStock: boolean;
  categories: CategoryKey[];
  images: { src: string; alt: string }[];
  specs?: { size?: string; material?: string };
}

const CATEGORIES = [
  "Cricket",
  "Football",
  "Basketball",
  "Tennis",
  "Running",
  "Fitness",
  "Accessories",
] as const;

type CategoryKey = typeof CATEGORIES[number];

type SortKey = "newest" | "priceAsc" | "priceDesc" | "nameAsc";

// Simple localStorage hook
function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });
  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch { }
  }, [key, value]);
  return [value, setValue] as const;
}

// Mock dataset (~20 products)
const productsData: Product[] = [
  {
    id: "p1",
    name: "Sportify Pro Cricket Bat",
    description: "Premium English willow bat designed for power hitters. Balanced pickup and superior edge profile.",
    priceLkr: 45990,
    inStock: true,
    categories: ["Cricket"],
    images: [
      { src: "https://source.unsplash.com/featured/?cricket,bat", alt: "Premium cricket bat on turf" },
      { src: "https://source.unsplash.com/featured/?cricket,gear", alt: "Close-up of cricket gear" },
    ],
    specs: { size: "Short Handle", material: "English Willow" },
  },
  {
    id: "p2",
    name: "Sportify Match Football",
    description: "FIFA-quality football with textured PU surface for control in wet and dry conditions.",
    priceLkr: 12990,
    inStock: true,
    categories: ["Football"],
    images: [
      { src: "https://source.unsplash.com/featured/?football,ball", alt: "Professional match football on grass" },
      { src: "https://source.unsplash.com/featured/?football,training", alt: "Football training gear" },
    ],
    specs: { size: "Size 5", material: "PU" },
  },
  {
    id: "p3",
    name: "Sportify Performance Basketball",
    description: "Indoor/outdoor composite leather ball with deep channels for enhanced grip and control.",
    priceLkr: 10990,
    inStock: false,
    categories: ["Basketball"],
    images: [
      { src: "https://source.unsplash.com/featured/?basketball,ball", alt: "Composite leather basketball on court" },
      { src: "https://source.unsplash.com/featured/?basketball,court", alt: "Basketball court hoop" },
    ],
    specs: { size: "7", material: "Composite Leather" },
  },
  {
    id: "p4",
    name: "Sportify Aero Tennis Racket",
    description: "Aerodynamic frame with responsive string pattern for precision and power.",
    priceLkr: 36990,
    inStock: true,
    categories: ["Tennis"],
    images: [
      { src: "https://source.unsplash.com/featured/?tennis,racquet", alt: "Modern tennis racket on clay court" },
      { src: "https://source.unsplash.com/featured/?tennis,strings", alt: "Tennis racket strings close-up" },
    ],
    specs: { size: "Grip 3", material: "Graphite" },
  },
  {
    id: "p5",
    name: "Sportify Tempo Running Shoes",
    description: "Lightweight trainers with responsive foam midsole and breathable mesh upper.",
    priceLkr: 27990,
    inStock: true,
    categories: ["Running"],
    images: [
      { src: "https://source.unsplash.com/featured/?running,shoes", alt: "Lightweight running shoes on track" },
      { src: "https://source.unsplash.com/featured/?runner,shoe", alt: "Runner tying shoes" },
    ],
    specs: { size: "EU 40–46", material: "Mesh/Synthetic" },
  },
  {
    id: "p6",
    name: "Sportify Elite Gym Gloves",
    description: "Padded palm gloves with breathable back for superior grip during lifts and workouts.",
    priceLkr: 4990,
    inStock: true,
    categories: ["Fitness", "Accessories"],
    images: [
      { src: "https://source.unsplash.com/featured/?gym,gloves", alt: "Gym gloves on dumbbell rack" },
      { src: "https://source.unsplash.com/featured/?fitness,gear", alt: "Fitness accessories" },
    ],
    specs: { size: "S/M/L/XL", material: "Neoprene/Leather" },
  },
  {
    id: "p7",
    name: "Sportify Hydro Bottle 1L",
    description: "Insulated stainless-steel bottle keeps drinks cold for 24h; leak-proof sport cap.",
    priceLkr: 5990,
    inStock: true,
    categories: ["Accessories"],
    images: [
      { src: "https://source.unsplash.com/featured/?sports,water-bottle", alt: "Steel sports water bottle" },
      { src: "https://source.unsplash.com/featured/?bottle,stainless", alt: "Insulated bottle detail" },
    ],
    specs: { size: "1000 ml", material: "Stainless Steel" },
  },
  {
    id: "p8",
    name: "Sportify Club Football Boots",
    description: "Firm-ground boots with molded studs for traction and a snug, supportive fit.",
    priceLkr: 21990,
    inStock: false,
    categories: ["Football", "Running"],
    images: [
      { src: "https://source.unsplash.com/featured/?football,boots", alt: "Football boots on pitch" },
      { src: "https://source.unsplash.com/featured/?soccer,cleats", alt: "Soccer cleats detail" },
    ],
    specs: { size: "EU 39–45", material: "Synthetic" },
  },
  {
    id: "p9",
    name: "Sportify Slam Basketball Shoes",
    description: "High-top cushioning with lateral support for aggressive cuts and landings.",
    priceLkr: 31990,
    inStock: true,
    categories: ["Basketball"],
    images: [
      { src: "https://source.unsplash.com/featured/?basketball,shoes", alt: "Basketball shoes on hardwood floor" },
      { src: "https://source.unsplash.com/featured/?basketball,sneakers", alt: "Basketball sneakers detail" },
    ],
    specs: { size: "EU 41–47", material: "Knit/Synthetic" },
  },
  {
    id: "p10",
    name: "Sportify Spin Tennis Balls (4pk)",
    description: "Pressurized felt balls engineered for extended play and consistent bounce.",
    priceLkr: 2990,
    inStock: true,
    categories: ["Tennis"],
    images: [
      { src: "https://source.unsplash.com/featured/?tennis,balls", alt: "Can of tennis balls" },
      { src: "https://source.unsplash.com/featured/?tennis,practice", alt: "Tennis practice balls" },
    ],
    specs: { size: "Standard", material: "Felt/Rubber" },
  },
  {
    id: "p11",
    name: "Sportify Pro Cricket Pads",
    description: "Lightweight protective pads with high-density foam and ergonomic straps.",
    priceLkr: 14990,
    inStock: true,
    categories: ["Cricket"],
    images: [
      { src: "https://source.unsplash.com/featured/?cricket,pads", alt: "Cricket leg pads on field" },
      { src: "https://source.unsplash.com/featured/?cricket,protective", alt: "Cricket protective gear" },
    ],
    specs: { size: "Adult", material: "HD Foam" },
  },
  {
    id: "p12",
    name: "Sportify Matchday Jersey",
    description: "Breathable, sweat-wicking jersey available in team colors with slim athletic cut.",
    priceLkr: 9990,
    inStock: true,
    categories: ["Football", "Accessories"],
    images: [
      { src: "https://source.unsplash.com/featured/?football,jersey", alt: "Sport jersey on hanger" },
      { src: "https://source.unsplash.com/featured/?sports,jersey", alt: "Team jersey close-up" },
    ],
    specs: { size: "S–XXL", material: "Polyester" },
  },
  {
    id: "p13",
    name: "Sportify Yoga Mat Pro",
    description: "Grippy, cushioned mat for studio and home practice with closed-cell surface.",
    priceLkr: 8990,
    inStock: false,
    categories: ["Fitness"],
    images: [
      { src: "https://source.unsplash.com/featured/?yoga,mat", alt: "Premium yoga mat rolled" },
      { src: "https://source.unsplash.com/featured/?fitness,mat", alt: "Workout mat close-up" },
    ],
    specs: { size: "183x66 cm", material: "TPE" },
  },
  {
    id: "p14",
    name: "Sportify Speed Rope",
    description: "Adjustable steel cable rope with precision bearings for fast double-unders.",
    priceLkr: 3490,
    inStock: true,
    categories: ["Fitness", "Accessories"],
    images: [
      { src: "https://source.unsplash.com/featured/?jump,rope", alt: "Speed jump rope on gym floor" },
      { src: "https://source.unsplash.com/featured/?fitness,rope", alt: "Speed rope handles" },
    ],
    specs: { size: "Adjustable", material: "Steel/Aluminum" },
  },
  {
    id: "p15",
    name: "Sportify Compression Socks",
    description: "Graduated compression improves circulation and recovery during long runs.",
    priceLkr: 3490,
    inStock: true,
    categories: ["Running", "Accessories"],
    images: [
      { src: "https://source.unsplash.com/featured/?running,socks", alt: "Compression socks on runner" },
      { src: "https://source.unsplash.com/featured/?sports,socks", alt: "Black compression socks" },
    ],
    specs: { size: "S–XL", material: "Nylon/Spandex" },
  },
  {
    id: "p16",
    name: "Sportify Defender Shin Guards",
    description: "Impact-absorbing guards with secure straps and breathable padding.",
    priceLkr: 5990,
    inStock: true,
    categories: ["Football", "Accessories"],
    images: [
      { src: "https://source.unsplash.com/featured/?soccer,shin-guards", alt: "Football shin guards" },
      { src: "https://source.unsplash.com/featured/?football,protective", alt: "Protective shin gear" },
    ],
    specs: { size: "Adult", material: "Foam/Plastic" },
  },
  {
    id: "p17",
    name: "Sportify All-Court Tennis Bag",
    description: "6-racket bag with ventilated shoe pocket and accessory compartments.",
    priceLkr: 14990,
    inStock: false,
    categories: ["Tennis", "Accessories"],
    images: [
      { src: "https://source.unsplash.com/featured/?tennis,bag", alt: "Tennis racket bag courtside" },
      { src: "https://source.unsplash.com/featured/?sports,bag", alt: "Sports gear bag" },
    ],
    specs: { size: "30L", material: "Polyester" },
  },
  {
    id: "p18",
    name: "Sportify Court Basketball Jersey",
    description: "Lightweight mesh jersey with sweat-wicking fabric and classic court fit.",
    priceLkr: 11990,
    inStock: true,
    categories: ["Basketball", "Accessories"],
    images: [
      { src: "https://source.unsplash.com/featured/?basketball,jersey", alt: "Basketball jersey on court" },
      { src: "https://source.unsplash.com/featured/?sports,mesh", alt: "Mesh jersey texture" },
    ],
    specs: { size: "S–XXL", material: "Polyester" },
  },
  {
    id: "p19",
    name: "Sportify Pace Running Cap",
    description: "Featherlight cap with laser-cut ventilation and moisture-wicking band.",
    priceLkr: 4490,
    inStock: true,
    categories: ["Running", "Accessories"],
    images: [
      { src: "https://source.unsplash.com/featured/?running,cap", alt: "Breathable running cap" },
      { src: "https://source.unsplash.com/featured/?sports,cap", alt: "Sport cap side view" },
    ],
    specs: { size: "One Size", material: "Polyester" },
  },
  {
    id: "p20",
    name: "Sportify Pro Cricket Gloves",
    description: "Split-finger design with premium leather palm for grip and comfort at the crease.",
    priceLkr: 11990,
    inStock: true,
    categories: ["Cricket", "Accessories"],
    images: [
      { src: "https://source.unsplash.com/featured/?cricket,gloves", alt: "Cricket batting gloves" },
      { src: "https://source.unsplash.com/featured/?sports,gloves", alt: "Close-up of sports gloves" },
    ],
    specs: { size: "Adult", material: "Leather/Foam" },
  },
];

function formatLkr(amount: number) {
  return `Rs. ${amount.toLocaleString("en-LK")}`;
}

export default function Merchandise() {
  const [search, setSearch] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<CategoryKey[]>([]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sort, setSort] = useState<SortKey>("newest");
  const [wishlist, setWishlist] = useLocalStorage<string[]>("sportify-wishlist", []);

  const [openProduct, setOpenProduct] = useState<Product | null>(null);
  const { toast: show } = useToast();

  // SEO
  useEffect(() => {
    document.title = "Merchandise Marketplace | Sportify";
    const desc = "Official Sportify gear and curated sports products";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", `${desc}`);
    else {
      const m = document.createElement("meta");
      m.name = "description";
      m.content = desc;
      document.head.appendChild(m);
    }
    // canonical
    const canonicalHref = `${window.location.origin}/merchandise`;
    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement("link");
      link.rel = "canonical";
      document.head.appendChild(link);
    }
    link.href = canonicalHref;

    // Structured data (ItemList)
    const ld = document.createElement("script");
    ld.type = "application/ld+json";
    ld.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "ItemList",
      itemListElement: productsData.slice(0, 10).map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `${window.location.origin}/merchandise#${p.id}`,
        name: p.name,
      })),
    });
    document.head.appendChild(ld);
    return () => {
      document.head.removeChild(ld);
    };
  }, []);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    let list = productsData.filter((p) => {
      const matchesSearch = !term ||
        p.name.toLowerCase().includes(term) ||
        p.description.toLowerCase().includes(term);
      const matchesCats = selectedCategories.length === 0 ||
        selectedCategories.every((c) => p.categories.includes(c));
      const matchesStock = !inStockOnly || p.inStock;
      return matchesSearch && matchesCats && matchesStock;
    });

    switch (sort) {
      case "priceAsc":
        list = list.sort((a, b) => a.priceLkr - b.priceLkr);
        break;
      case "priceDesc":
        list = list.sort((a, b) => b.priceLkr - a.priceLkr);
        break;
      case "nameAsc":
        list = list.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "newest":
      default:
        // keep original order as newest
        break;
    }
    return list;
  }, [search, selectedCategories, inStockOnly, sort]);

  const toggleWishlist = (id: string) => {
    setWishlist((prev) => {
      const exists = prev.includes(id);
      const next = exists ? prev.filter((x) => x !== id) : [...prev, id];
      toast({ title: exists ? "Removed from wishlist" : "Added to wishlist" });
      return next;
    });
  };

  return (
    <div className="min-h-screen">
      <header className="border-b">
        <div className="container py-10">
          <nav className="mb-6 text-sm text-muted-foreground">
            <Link to="/">Home</Link>
            <span className="mx-2">/</span>
            <span>Merchandise</span>
          </nav>
          <h1 className="text-3xl md:text-4xl font-bold">Merchandise Marketplace</h1>
          <p className="mt-2 text-muted-foreground">Official Sportify gear and curated sports products</p>
        </div>
      </header>

      <main>
        <section aria-label="Product controls" className="border-b">
          <div className="container py-6 flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
              <div className="md:col-span-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 opacity-60" />
                  <Input
                    aria-label="Search products"
                    placeholder="Search products…"
                    className="pl-9"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>

              <div className="md:col-span-1 flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Switch id="stock" checked={inStockOnly} onCheckedChange={setInStockOnly} />
                  <label htmlFor="stock" className="text-sm">In Stock only</label>
                </div>
              </div>

              <div className="md:col-span-1">
                <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
                  <SelectTrigger aria-label="Sort products">
                    <SelectValue placeholder="Sort" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="priceAsc">Price (Low→High)</SelectItem>
                    <SelectItem value="priceDesc">Price (High→Low)</SelectItem>
                    <SelectItem value="nameAsc">Name A–Z</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex flex-wrap gap-2" aria-label="Category filter">
              <ToggleGroup type="multiple" value={selectedCategories as string[]} onValueChange={(vals) => setSelectedCategories(vals as CategoryKey[])}>
                {CATEGORIES.map((c) => (
                  <ToggleGroupItem key={c} value={c} aria-label={`Filter ${c}`} className="rounded-full px-4 py-2 text-sm">
                    {c}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>
          </div>
        </section>

        <section className="container py-8" aria-label="Products">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((p) => (
              <article id={p.id} key={p.id} className="group">
                <Card className="h-full flex flex-col">
                  <CardHeader className="p-0">
                    <div className="overflow-hidden rounded-t-lg">
                      <img
                        src={p.images[0].src}
                        alt={p.images[0].alt}
                        loading="lazy"
                        className="w-full h-52 object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 space-y-3">
                    <div className="flex items-start justify-between gap-2 pt-4">
                      <div>
                        <h3 className="font-semibold leading-tight">{p.name}</h3>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <p className="text-sm text-muted-foreground line-clamp-2 cursor-help" aria-label={`${p.description}`}>
                              {p.description}
                            </p>
                          </TooltipTrigger>
                          <TooltipContent>
                            {p.description}
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <div className="shrink-0">
                        {p.inStock ? (
                          <Badge variant="success">In Stock</Badge>
                        ) : (
                          <Badge variant="secondary">Out of Stock</Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {p.categories.map((c) => (
                        <Badge key={c} variant="outline">{c}</Badge>
                      ))}
                    </div>

                    <div className="pt-2 text-lg font-bold">{formatLkr(p.priceLkr)}</div>
                  </CardContent>
                  <CardFooter className="flex items-center justify-between gap-2">
                    <Button onClick={() => setOpenProduct(p)} aria-label={`View details of ${p.name}`}>
                      View Details
                    </Button>
                    <Button variant="ghost" onClick={() => toggleWishlist(p.id)} aria-label="Add to Wishlist">
                      <Heart className="opacity-80" /> Add to Wishlist
                    </Button>
                  </CardFooter>
                </Card>
              </article>
            ))}
          </div>

          <p className="mt-10 text-center text-sm text-muted-foreground">Prices are in LKR. Availability updated daily.</p>
        </section>

        <Sheet open={!!openProduct} onOpenChange={(v) => !v && setOpenProduct(null)}>
          <SheetContent side="right" className="sm:max-w-md md:max-w-xl lg:max-w-2xl overflow-y-auto">
            {openProduct && (
              <div className="space-y-6">
                <SheetHeader>
                  <SheetTitle>{openProduct.name}</SheetTitle>
                  <SheetDescription>{openProduct.description}</SheetDescription>
                </SheetHeader>

                <div>
                  <Carousel className="w-full">
                    <CarouselContent>
                      {openProduct.images.map((img, idx) => (
                        <CarouselItem key={idx}>
                          <img
                            src={img.src}
                            alt={img.alt}
                            loading="lazy"
                            className="w-full h-64 object-cover rounded-md"
                          />
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    <CarouselPrevious />
                    <CarouselNext />
                  </Carousel>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    {openProduct.inStock ? (
                      <Badge variant="success">In Stock</Badge>
                    ) : (
                      <Badge variant="secondary">Out of Stock</Badge>
                    )}
                    <div className="text-xl font-semibold">{formatLkr(openProduct.priceLkr)}</div>
                  </div>

                  {openProduct.specs && (
                    <div>
                      <h4 className="font-semibold mb-2">Specifications</h4>
                      <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                        {openProduct.specs.size && <li>Size: {openProduct.specs.size}</li>}
                        {openProduct.specs.material && <li>Material: {openProduct.specs.material}</li>}
                      </ul>
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <label htmlFor="qty" className="text-sm">Quantity</label>
                    <Input id="qty" type="number" min={1} defaultValue={1} disabled={!openProduct.inStock} className="w-24" />
                  </div>
                </div>

                <SheetFooter className="gap-2">
                  <Button
                    onClick={() => {
                      show({ title: "Added to cart" });
                    }}
                    disabled={!openProduct.inStock}
                  >
                    Add to Cart
                  </Button>
                  <Button variant="secondary" onClick={() => setOpenProduct(null)}>Close</Button>
                </SheetFooter>
              </div>
            )}
          </SheetContent>
        </Sheet>
      </main>
    </div>
  );
}
