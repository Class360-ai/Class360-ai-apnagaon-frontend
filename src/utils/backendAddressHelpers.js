import { addressesAPI, getAuthToken, safeFetch } from "./api";
import { getSavedAddresses, normalizeAddress, saveSelectedAddress } from "./locationHelpers";

export const loadAddressesWithFallback = async () => {
  const localAddresses = getSavedAddresses();
  if (!getAuthToken()) return localAddresses;
  const addresses = await safeFetch(() => addressesAPI.getAll(), null);
  if (!Array.isArray(addresses) || addresses.length === 0) return localAddresses;
  const backendAddresses = addresses.map((address) => normalizeAddress({ ...address, id: address._id || address.id }));
  const seen = new Set();
  return [...backendAddresses, ...localAddresses].filter((address) => {
    const key = String(address.id || address._id || `${address.fullName || ""}:${address.phone || ""}:${address.pincode || ""}`);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

export const saveAddressWithFallback = async (address) => {
  const localAddress = saveSelectedAddress(address);
  if (!getAuthToken()) return localAddress;
  const saved = await safeFetch(() => addressesAPI.create(localAddress), null);
  return saved ? normalizeAddress({ ...saved, id: saved._id || saved.id }) : localAddress;
};
