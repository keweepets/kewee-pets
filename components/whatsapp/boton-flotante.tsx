import IconoWhatsApp from "@/components/icons/icono-whatsapp";
import { TIENDA } from "@/lib/config/tienda";

/**
 * Botón flotante de WhatsApp — SOLO el icono, según decisión definitiva:
 * sin texto, sin burbuja, sin tooltip permanente, sin mensaje emergente.
 */
export default function BotonFlotanteWhatsApp() {
  return (
    <a
      href={TIENDA.urlWhatsApp}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escríbenos por WhatsApp"
      className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-[#25D366] hover:bg-[#20BD5A] shadow-lg hover:shadow-xl flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95"
    >
      <IconoWhatsApp className="w-7 h-7 text-white" />
    </a>
  );
}
