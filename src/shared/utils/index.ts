export const hexToRgb = (hex: string): [number, number, number] => {
  const hexColorRegex =
    /^#(?<R>[A-F0-9]{2})(?<G>[A-F0-9]{2})(?<B>[A-F0-9]{2})$/i;
  const { groups } = hex.match(hexColorRegex)! as unknown as {
    groups: Record<"R" | "G" | "B", string>;
  };

  console.log([
    parseInt(groups.R, 16),
    parseInt(groups.G, 16),
    parseInt(groups.B, 16),
  ]);

  return [
    parseInt(groups.R, 16) / 255,
    parseInt(groups.G, 16) / 255,
    parseInt(groups.B, 16) / 255,
  ];
};
