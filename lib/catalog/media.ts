export function toPublicImageSrc(src: string): string {
  if (!src) {
    return src;
  }

  if (
    src.startsWith("blob:") ||
    src.startsWith("data:") ||
    src.startsWith("http://") ||
    src.startsWith("https://")
  ) {
    return src;
  }

  return encodeURI(src);
}

export function toCssImageUrl(src: string): string {
  if (!src) {
    return "none";
  }

  return `url("${toPublicImageSrc(src)}")`;
}
