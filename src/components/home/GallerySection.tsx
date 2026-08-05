import Image from "next/image";
import { Reveal } from "@/components/home/Reveal";

const images = [
  "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1559599746-8823b38544c6?auto=format&fit=crop&w=900&q=80",
];

export function GallerySection() {
  return (
    <section id="gallery" className="surface-dark py-8 sm:py-10">
      <div className="container-luxury">
        <Reveal>
          <div className="section-rule">Gallery</div>
          <h2 className="mt-2 font-display text-2xl sm:text-3xl text-ivory leading-tight">
            A glimpse of the escapes
          </h2>
        </Reveal>

        <div className="mt-5 grid grid-cols-3 gap-2 sm:grid-cols-6">
          {images.map((src, index) => (
            <div
              key={src}
              className="relative aspect-square overflow-hidden rounded-lg"
            >
              <Image
                src={src}
                alt={`Holiday gallery image ${index + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 33vw, 16vw"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
