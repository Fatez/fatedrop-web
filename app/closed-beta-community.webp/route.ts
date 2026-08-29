import chunk0 from "@/lib/closed-beta-art/chunk-0";
import chunk1 from "@/lib/closed-beta-art/chunk-1";
import chunk2 from "@/lib/closed-beta-art/chunk-2";
import chunk3 from "@/lib/closed-beta-art/chunk-3";
import chunk4 from "@/lib/closed-beta-art/chunk-4";

const imageBase64 = `${chunk0}${chunk1}${chunk2}${chunk3}${chunk4}`;

function decodeBase64(value: string) {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

export async function GET() {
  return new Response(decodeBase64(imageBase64), {
    headers: {
      "Content-Type": "image/webp",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
