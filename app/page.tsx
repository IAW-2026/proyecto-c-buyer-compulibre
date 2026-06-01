import { redirect } from "next/navigation";

/**
 * Homepage: redirige al catálogo de productos.
 * En Etapa 3 se puede reemplazar por una landing page de marketing.
 */
export default function Home() {
  redirect("/products");
}
