export const HOME_DELIVERY_SHEKELS = 35;
export const FREE_SHIPPING_FROM_SHEKELS = 350;

export function getShippingShekels(subtotalShekels: number): number {
  if (subtotalShekels >= FREE_SHIPPING_FROM_SHEKELS) {
    return 0;
  }

  return HOME_DELIVERY_SHEKELS;
}
